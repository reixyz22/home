import { createAI, getMutableAIState, getAIState } from 'ai/rsc';  // Import AI state management functions
import { nanoid } from '@/lib/utils';  // Import utility for generating unique IDs
import { saveChat } from '@/app/actions';  // Import function to save chat sessions
import { UserMessage, BotMessage, BotCard } from '@/components/stocks/message';  // Import UI components for messages
import { Chat, Message } from '@/lib/types';  // Import types for chat and messages
import { createAssistant, createThread, addUserMessage, runAssistant } from '@/lib/chat/model';  // Import chatbot functionalities
import { auth } from "@/auth";  // Import authentication module.
import React from "react";

// Function to handle user message submission
async function submitUserMessage(content: string) {
  'use server';  // Direct this block to run on the server

  const aiState = getMutableAIState<typeof AI>();  // Get a mutable state for the AI

  // Update AI state with the new user message
  aiState.update({
    ...aiState.get(),
    messages: [
      ...aiState.get().messages,
      {
        id: nanoid(),  // Generate a unique ID for the message
        role: 'user',
        content,
      },
    ],
  });

  const assistant = await createAssistant();  // Create an assistant instance
  const thread = await createThread();  // Create a conversation thread

  await addUserMessage(thread.id, content);  // Add the user message to the thread

  // Handler for assistant's responses
  const handleResponse = (assistantContent: string) => {
    const assistantMessage: Message = {
      id: nanoid(),  // Generate a unique ID for the message
      role: 'assistant',
      content: assistantContent,
    };
    aiState.update({
      ...aiState.get(),
      messages: [
        ...aiState.get().messages,
        assistantMessage,
      ],
    });
  };

  // Run the assistant on the thread and handle responses
  await runAssistant(thread.id, assistant.id, handleResponse);

  // Fetch the latest AI state to obtain the assistant's response
  const updatedState = aiState.get();
  const assistantMessageContent = updatedState.messages.find(msg => msg.role === 'assistant')?.content ?? '';
  return {
    id: nanoid(),
    display: assistantMessageContent,
  };
}

// Type definitions for AI state and UI state
export type AIState = {
  chatId: string;
  messages: Message[];
};

export type UIState = {
  id: string;
  display: React.ReactNode;
}[];

// Configuration for the AI model
export const AI = createAI<AIState, UIState>({
  actions: {
    submitUserMessage,
  },
  initialUIState: [],
  initialAIState: { chatId: nanoid(), messages: [] },
  onGetUIState: async () => {
    'use server';  // Direct this block to run on the server

    const session = await auth();  // Authenticate the session

    if (session && session.user) {
      const aiState = getAIState();  // Get the current AI state

      if (aiState) {
        const uiState = getUIStateFromAIState(aiState);  // Convert AI state to UI state
        return uiState;
      }
    } else {
      return;
    }
  },
  onSetAIState: async ({ state }) => {
    'use server';  // Direct this block to run on the server

    const session = await auth();  // Authenticate the session

    if (session && session.user) {
      const { chatId, messages } = state;
      const createdAt = new Date();  // Get current date and time
      const userId = session.user.id as string;  // Get user ID from the session
      const path = `/chat/${chatId}`;  // Define path for the chat

      const firstMessageContent = messages[0].content as string;
      const title = firstMessageContent.substring(0, 100);  // Extract title from the first message

      const chat: Chat = {  // Construct chat object to save
        id: chatId,
        title,
        userId,
        createdAt,
        messages,
        path,
      };

      await saveChat(chat);  // Save the chat to a persistent storage
    } else {
      return;
    }
  },
});

// Function to convert AI state to UI state
export const getUIStateFromAIState = (aiState: Chat) => {
  return aiState.messages
    .filter((message) => message.role !== 'system')  // Filter out system messages
    .map((message, index) => ({  // Map messages to UI components
      id: `${aiState.chatId}-${index}`,
      display:
        message.role === 'tool' ? (
          message.content.map((tool) => {
            return tool.toolName === 'listStocks' ? (
              <BotCard key={nanoid()}>
                {/* @ts-expect-error */}
                <Events props={tool.result} />
              </BotCard>
            ) : null;
          })
        ) : message.role === 'user' ? (
          <UserMessage key={nanoid()}>{message.content as React.ReactNode}</UserMessage>
        ) : message.role === 'assistant' && typeof message.content === 'string' ? (
          <BotMessage key={nanoid()} content={message.content} />
        ) : null,
    }));
};

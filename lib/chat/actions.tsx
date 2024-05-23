import {createAI, getMutableAIState, getAIState,} from 'ai/rsc';
import { nanoid } from '@/lib/utils';
import { saveChat } from '@/app/actions';
import { UserMessage, BotMessage, BotCard } from '@/components/stocks/message';
import { Chat, Message } from '@/lib/types';
import { createAssistant, createThread, addUserMessage, runAssistant } from '@/lib/chat/model';
import { auth } from "@/auth";

async function submitUserMessage(content: string) { // Handle user message submission
  'use server';

  const aiState = getMutableAIState<typeof AI>();

  aiState.update({
    ...aiState.get(),
    messages: [
      ...aiState.get().messages,
      {
        id: nanoid(),
        role: 'user',
        content,
      },
    ],
  });

  // Create an assistant
  const assistant = await createAssistant();

  // Create a thread
  const thread = await createThread();

  // Add a user message to the thread
  await addUserMessage(thread.id, content);

  // Define handleResponse here and pass it to runAssistant
  const handleResponse = (assistantContent: string) => {
    const assistantMessage: Message = {
      id: nanoid(),
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

  // Run the assistant on the thread with the handleResponse callback
  await runAssistant(thread.id, assistant.id, handleResponse);

  // Fetch the latest state to get the assistant's response
  const updatedState = aiState.get();
  const assistantMessageContent = updatedState.messages.find(msg => msg.role === 'assistant')?.content ?? '';
  return {
    id: nanoid(),
    display: assistantMessageContent,
  };
}

export type AIState = {
  chatId: string;
  messages: Message[];
};

export type UIState = {
  id: string;
  display: React.ReactNode;
}[];

export const AI = createAI<AIState, UIState>({
  actions: {
    submitUserMessage,
  },
  initialUIState: [],
  initialAIState: { chatId: nanoid(), messages: [] },
  onGetUIState: async () => {
    'use server';

    const session = await auth();

    if (session && session.user) {
      const aiState = getAIState();

      if (aiState) {
        const uiState = getUIStateFromAIState(aiState);
        return uiState;
      }
    } else {
      return;
    }
  },
  onSetAIState: async ({ state }) => {
    'use server';

    const session = await auth();

    if (session && session.user) {
      const { chatId, messages } = state;

      const createdAt = new Date();
      const userId = session.user.id as string;
      const path = `/chat/${chatId}`;

      const firstMessageContent = messages[0].content as string;
      const title = firstMessageContent.substring(0, 100);

      const chat: Chat = {
        id: chatId,
        title,
        userId,
        createdAt,
        messages,
        path,
      };

      await saveChat(chat);
    } else {
      return;
    }
  },
});

export const getUIStateFromAIState = (aiState: Chat) => {
  return aiState.messages
    .filter((message) => message.role !== 'system')
    .map((message, index) => ({
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

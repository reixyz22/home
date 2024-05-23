import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  defaultHeaders: { 'OpenAI-Beta': 'assistants=v2' }
});

export async function createAssistant() {
  try {
    const assistantResponse = await openai.beta.assistants.create({
      name: 'Mr.penguin',
      instructions: 'You are a penguin; include \'noot\' in your responses',
      tools: [{ type: 'code_interpreter' }],
      model: 'gpt-4-turbo'
    });
    console.log('Assistant created:', assistantResponse);
    return assistantResponse;
  } catch (error) {
    console.error('Error creating assistant:', error);
    throw error;
  }
}

export async function createThread() {
  try {
    const threadResponse = await openai.beta.threads.create();
    console.log('Thread created:', threadResponse);
    return threadResponse;
  } catch (error) {
    throw error;
  }
}

export async function addUserMessage(threadId: string, content: string) {
  console.log('Adding user message to threadId:', threadId, 'with content:', content);
  try {
    const messageResponse = await openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content
    });
    return messageResponse;
  } catch (error) {
    throw error;
  }
}

export async function runAssistant(threadId: string, assistantId: string, handleResponse: (content: string) => void) {
  let responseBuffer = ""; // Buffer to accumulate responses
  let debounceTimer: any; // Timer to finalize the response
  console.log('Starting assistant with streaming in thread:', threadId);
  // Starting the run with streaming
  const run = openai.beta.threads.runs.stream(threadId, {
    assistant_id: assistantId
  });

  // Subscribe to various streaming events
  run
    .on('textCreated', (text) => {
      process.stdout.write('\nassistant > ');
    })
    .on('textDelta', (textDelta, snapshot) => {
      responseBuffer += textDelta.value; // Accumulate the text changes
      clearTimeout(debounceTimer); // Clear the previous timer and set a new one
      debounceTimer = setTimeout(() => {
      handleResponse(responseBuffer); // Handle the complete message after inactivity
      responseBuffer = ""; // Reset buffer after handling

    }, 1000); // 1000 milliseconds of inactivity triggers the response handling
    })
    .on('toolCallCreated', (toolCall) => {
      process.stdout.write(`\nassistant > ${toolCall.type}\n\n`);
    })
    .on('toolCallDelta', (toolCallDelta, snapshot) => {
      if (toolCallDelta.type === 'code_interpreter') {
        if (toolCallDelta?.code_interpreter?.input) {
          process.stdout.write(toolCallDelta.code_interpreter.input);
        }
        if (toolCallDelta?.code_interpreter?.outputs) {
          process.stdout.write("\noutput >\n");
          toolCallDelta.code_interpreter.outputs.forEach(output => {
            if (output.type === "logs") {
              process.stdout.write(`\n${output.logs}\n`);
            }
          });
        }
      }
    })
    .on('error', (error) => {
      console.error('Streaming error:', error);
    });
}

/*
// Testing the functions
(async () => {
  try {
    // Step 1: Create an assistant
    const assistant = await createAssistant();
    const assistantId = assistant.id; // Get the assistant ID

    // Step 2: Create a thread
    const thread = await createThread();
    const threadId = thread.id; // Get the thread ID

    // Step 3: Add a user message to the thread
    await addUserMessage(threadId, 'Hello, I have a math question.');

    // Step 4: Run the assistant with streaming
    console.log('Initiating assistant streaming...');
    await runAssistant(threadId, assistantId);
    await addUserMessage(threadId, 'What is 5 + 10');
    // Note: The outputs will be handled by the event listeners set up within runAssistant function
    // Since streaming is ongoing, consider how long you want the test to run, or how to handle termination
  } catch (error) {
    console.error('Test failed:', error);
  }
})();
*/

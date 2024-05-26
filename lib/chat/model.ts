import OpenAI from 'openai';
import * as FS from 'fs';

//this imports the latest version; I believe the Vercel SDK used in actions.tsx is outdated.

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  defaultHeaders: { 'OpenAI-Beta': 'assistants=v2' } //this HTML header specifically allows us to use V2 beta features!
});//assistants is a beta feature!

//here the assistants model is defined :)
export async function createAssistant() {
  try {
    const assistantResponse = await openai.beta.assistants.create({
      name: 'Mr.penguin',
      instructions: 'You are a penguin; include \'noot\' in your responses', //we know an output is from our assistant when we see 'noot'
      tools: [{ type: 'code_interpreter' },{ type: "file_search" }], //give it file search, as a tool.
      model: 'gpt-4-turbo'
    });
    console.log('Assistant created:', assistantResponse);
    return assistantResponse;
  } catch (error) {
    console.error('Error creating assistant:', error);
    throw error;
  }
}

//threads are where the human and Assistant share their messages to one another; we log upon creation
export async function createThread() {
  try {
    const threadResponse = await openai.beta.threads.create();
    console.log('Thread created:', threadResponse);
    return threadResponse;
  } catch (error) {
      console.error('Error creating thread:', error);
      throw error;
  }
}

export async function addFile(assistantId: string,) { //files function
  try{
    let fileData = await openai.files.create({
      file: FS.createReadStream("secret.txt"),
      purpose: "assistants",
    });
    console.log("fileData.id", fileData.id)
    const vectorStore = await openai.beta.vectorStores.create({
      name: "Test",
    });
    console.log("vectorStore.id",vectorStore.id)
    await openai.beta.vectorStores.files.createAndPoll(
        vectorStore.id, {
          file_id: fileData.id,
        });
    await openai.beta.assistants.update(assistantId, {
            tool_resources: { file_search: { vector_store_ids: [vectorStore.id] } },
    });
    return fileData;
  }
  catch (error) {
    console.error('Error in attaching file to new vectorStores:', error);
    throw error;
  }
}


//this function takes a message from actions.tsc and adds it to the thread we just created
export async function addUserMessage(fileDataId: any, threadId: string, content: string) {
  console.log('Adding user message to threadId:', threadId, 'with content:', content);
  try {
    const messageResponse = await openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content,
      attachments: [{ file_id: fileDataId, tools: [{ type: "file_search" }] }],
    });
    return messageResponse;
  } catch (error) {
    throw error;
  }
}

//this is a complex function that uses event listeners to update the ui with the contents of our thread
export async function runAssistant(threadId: string, assistantId: string, handleResponse: (content: string) => void) {
  let responseBuffer = ""; // Buffer to accumulate responses; otherwise they spit out one token at a time
  let debounceTimer: any; // Timer to finalize the response
  console.log('Starting assistant with streaming in thread:', threadId);
  const run = openai.beta.threads.runs.stream(threadId, {
    assistant_id: assistantId
  });

  // various streaming events
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

/* //use these tests to calibrate model.ts!
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

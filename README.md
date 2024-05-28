## Introduction

This is an AI chatbot app template built with
[Next.js](https://nextjs.org), the [Vercel AI SDK](https://sdk.vercel.ai), and [Vercel KV](https://vercel.com/storage/kv).
Forked from [vercel ai-chatbot](https://github.com/vercel/ai-chatbot)
Updated to use [OpenAI Assistants API](https://platform.openai.com/docs/assistants/overview) to talk like a penguin 🐧.

[Use the app here](https://home-liart-chi.vercel.app/) **Primary changes are in /lib/chat/actions.tsx, model.ts***

### Project Report 

Note:
Unfortunately, there is a bug that requires a page refresh to see the assistant's response. Please wait roughly 5 seconds and then refresh the page after chatting.
Also, make sure you log in; this will give you full conversational history with each thread utilizing a nanoId url. 

I believe this is due to React's server vs. client logic, which I’ve started to learn more about while working on this project, but not completely. 

Decisions:

I had the decision of either manually defining an assistant or using an assistant ID through https://platform.openai.com/assistants/. 

I chose to manually define Mr. Penguin, an assistant that talks with 'noot noot', so the user can be certain that they are interacting with an assistant at a glance, rather than the ordinary non-custom/Assistant based GPT. 

This has the impact of making the code more open-sourced and modular, with the downside of losing the in-browser UI for assistants.

I split the main driving file, 'lib/chat/actions.tsx', originally 589 lines, into two more streamlined files; 'actions.tsx', now 145 lines, and 'model.ts', now 94 lines. This allowed for more readable code and the reduction of unneeded stock-related features. 

Impact: Enhances code readability.

Changes:
I added inline comments to actions.tsx and model.ts; these improve readability of actions.tsx, model.ts considerably.

‘lib/chat/model.ts’ is the new file responsible for implementing the OpenAI Assistants API. This also allows model.ts to use its own set of imports and thus the beta version of OpenAI, which requires the HTTP header: 'OpenAI-Beta: assistants=v2'; but this is not included in the namespace of the starter repo's SDK.

Impact: Enables the use of the latest AI features.

I started, but have not yet fully gotten file uploads to work. I started on this task by carefully following the [File Search Quick Start guide](https://platform.openai.com/docs/assistants/tools/file-search/quickstart).
I seem to have gotten blocked by this function openai.beta.vectorStores.fileBatches.uploadAndPoll(), as there is an error in documentation; despite this, I pushed through and got the feature to work, locally; unfortunately, due to its use of FS, a local-only Node.js library, these changes don't work in production; to test this functionality, import the current Repo locally. Replace, secret.txt with your preferred attachment.

Impact: Enables the use of file/attachment reading, in the local host version of the application. 
![image](https://github.com/reixyz22/home/assets/66898056/7af9e165-e850-4921-b343-a852a28663a7)

I decided to stick with this local version of the functionality, as of right now. With the downside of not being able to use this feature in production. I would like to note that this feature is a Beta feature in OpenAI and that there might be more extensions available in the future, additional documentation which could enable this to work in production.

## Future features and considerations:

I started on the function calling assignment, however; this requires a complicated event listener system in the assistant’s run and I wasn’t able to configure this correctly, due to unfamiliarity and time constraints.

I wanted to add tests with Jest but was not able to implement this service; ‘model.ts’ does, however, contain some helpful tests which are commented out.

Regarding the file attachments feature making it to production, there is some hope; there is the [Vercel Blob's system](https://vercel.com/docs/storage/vercel-blob/client-upload); which in one prototype testing, I did get to work.
![image](https://github.com/reixyz22/home/assets/66898056/45e03007-27bf-49e8-8b67-9a506991ce71)
Unfortunately, at this time there are some issues getting OpenAI to read this Blob data.

## Login and add your API keys to KV Database to use the app!

Follow the documentation outlined in the [quick start guide](https://vercel.com/docs/storage/vercel-kv/)

quickstart#create-a-kv-database) provided by Vercel. This guide will assist you in creating and configuring your KV database instance on Vercel, enabling you to interact with it.

## Running Locally

You will need to use the environment variables [defined in `.env.example`](.env.example) to run Next.js AI Chatbot. It's recommended you use [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables) for this, but a `.env` file is all that is necessary. Make sure to include your KV Database!

> Note: You should not commit your `.env` file or it will expose secrets that will allow others to control access to your various OpenAI and authentication provider accounts. To avoid this, use gitignore.

1. Install Vercel CLI: `npm i -g vercel`
2. Link local instance with Vercel and GitHub accounts (creates `.vercel` directory): `vercel link`
3. Download your environment variables: `vercel env pull`

```bash
pnpm install
pnpm dev
```

Your app template should now be running on [localhost:3000](http://localhost:3000/).

## Current Author
William Pitts, Senior Computer Science Student

## Past Authors
Leaving this as it was in the original readme
This library is created by [Vercel](https://vercel.com) and [Next.js](https://nextjs.org) team members, with contributions from:

- Jared Palmer ([@jaredpalmer](https://twitter.com/jaredpalmer)) - [Vercel](https://vercel.com)
- Shu Ding ([@shuding\_](https://twitter.com/shuding_)) - [Vercel](https://vercel.com)
- shadcn ([@shadcn](https://twitter.com/shadcn)) - [Vercel](https://vercel.com)

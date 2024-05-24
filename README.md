## introduction

This is an AI chatbot app template built with 
[Next.js](https://nextjs.org), the [Vercel AI SDK](https://sdk.vercel.ai), and [Vercel KV](https://vercel.com/storage/kv). Updated to use [OpenAI Assistants API](https://platform.openai.com/docs/assistants/overview) to talk like a penguin 🐧 .

[use the app here](https://home-liart-chi.vercel.app/)


## Project Report Primary changes are in /lib/chat/actions.tsx

Note:
Unfortunately there is a bug, which requires a page refresh; to see the assistants response. Please wait roughly 5 seconds and then refresh the page after chatting.

I believe this is due to React's server vs client logic; which I’ve started to learn more about while working on this project, but not completely. 

Decisions:

I had the decision of either manually defining an assistant or using an assistant ID through https://platform.openai.com/assistants/. 

I chose to manually define Mr. Penguin, an assistant that talks with 'noot noot', so the user can be certain that they are interacting with an assistant at a glance, rather than the ordinary non-custom/Assistant based GPT. 

This has the impact of making the code more open-sourced and modular, with the downside of losing the in-browser UI for assistants.

I split the main driving file, 'lib/chat/actions.tsx', originally 589 lines, into two more streamlined files; 'actions.tsx', now 145 lines, and 'model.ts', now 94 lines. This allowed for more readable code and the reduction of unneeded stock-related features. 

Impact: Enhances code readability.

Changes:
I added inline comments to actions.tsx and model, these improve readability of actions.tsx considerably. I encourage the reader to compare with the original actions.tsx.

‘lib/chat/model.ts’ is the new file responsible for implementing the OpenAI Assistants API. This also allows model.ts to use its own set of imports and thus the beta version of OpenAi, which requires the HTTP header: 'OpenAI-Beta: assistants=v2'; but is not included in the namespace of the starter repo's SDK.

Impact: Enables the use of the latest AI features.

**Future features and considerations:

I started on the function calling assignment, however; this requires a complicated event listener system in the assistant’s run and I wasn’t able to configure this correctly, due to unfamiliarity and time constraints. 

I also started, but have not yet gotten file uploads to work, I started on this task by carefully following the File Search Quick Start guide
But I seem to have gotten blocked by this function openai.beta.vectorStores.fileBatches.uploadAndPoll()

I wanted to add tests with Jest but was not able to get to this stage; ‘model.ts’ does, however, contain some helpful tests which are commented out.

## Login and add your API keys to KV Database Instance to use the app!

Follow the documentation outlined in the [quick start guide](https://vercel.com/docs/storage/vercel-kv/quickstart#create-a-kv-database) provided by Vercel. This guide will assist you in creating and configuring your KV database instance on Vercel, enabling you to interact with it.


## Running locally

You will need to use the environment variables [defined in `.env.example`](.env.example) to run Next.js AI Chatbot. It's recommended you use [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables) for this, but a `.env` file is all that is necessary.

> Note: You should not commit your `.env` file or it will expose secrets that will allow others to control access to your various OpenAI and authentication provider accounts.

1. Install Vercel CLI: `npm i -g vercel`
2. Link local instance with Vercel and GitHub accounts (creates `.vercel` directory): `vercel link`
3. Download your environment variables: `vercel env pull`

```bash
pnpm install
pnpm dev
```

Your app template should now be running on [localhost:3000](http://localhost:3000/).

## Curent Author
William Pitts, Senior Computer Science Student

## Past Authors
Leaving this as it was in the original readme
This library is created by [Vercel](https://vercel.com) and [Next.js](https://nextjs.org) team members, with contributions from:

- Jared Palmer ([@jaredpalmer](https://twitter.com/jaredpalmer)) - [Vercel](https://vercel.com)
- Shu Ding ([@shuding\_](https://twitter.com/shuding_)) - [Vercel](https://vercel.com)
- shadcn ([@shadcn](https://twitter.com/shadcn)) - [Vercel](https://vercel.com)

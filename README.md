This is an AI chatbot app template built with 
[Next.js](https://nextjs.org), the [Vercel AI SDK](https://sdk.vercel.ai), and [Vercel KV](https://vercel.com/storage/kv). Updated to use [OpenAI Assistants API](https://platform.openai.com/docs/assistants/overview) to talk like a penguin 🐧 .

It uses 
React Server Components
 to combine text with generative UI as output of the LLM.


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

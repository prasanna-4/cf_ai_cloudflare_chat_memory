## System Prompt (Injected by Durable Object)
```
You are a concise assistant. Answer clearly. If user asks for code, return minimal runnable snippets. Maintain helpful tone.
```


## Prompting Notes while building
- "Draft a Cloudflare Workers AI chat Worker using Durable Objects for memory."
- "Add a simple HTML/JS UI with fetch('/api/chat'), streaming optional."
- "Implement voice input via Web Speech API and speech output with SpeechSynthesis."


# PROMPTS.md

This file documents the AI prompts used during development of **cf_ai_cloudflare_chat_memory**.  
Cloudflare requires this to demonstrate transparency in AI-assisted coding.

---

## System Prompt (used in the app)

```ts
const SYSTEM_PROMPT: Msg = {
  role: 'system',
  content:
    'You are a concise assistant. Answer clearly. If user asks for code, return minimal runnable snippets. Maintain helpful tone.',
};

This system prompt is injected into every conversation and ensures the assistant replies are clear, concise, and runnable.

Developer Prompts (used during building this repo)
These are examples of prompts given to ChatGPT while building the application:

Setup Wrangler + Durable Object

“Help me set up a Cloudflare Worker with Durable Objects to store chat history.”

“How do I write wrangler.toml for Durable Objects and Workers AI?”

AI integration

“Write a Durable Object that takes user messages, adds system + history, calls Workers AI with env.AI.run, and stores the assistant’s response.”

Error fixing

“I am getting error: ‘Your Worker depends on the following Durable Objects, which are not exported…’ fix my worker.ts exports.”

“How do I handle the error: ‘Incorrect type for Promise: the Promise did not resolve to Response’?”

Frontend

“Give me a minimal chat UI with input box, send button, and area to display responses. Add optional voice input/output.”

README drafting

“Write a README for my Cloudflare AI app, including setup, deploy, and architecture diagram.”

Notes
The above are developer-facing prompts used while creating this app.

End users of the deployed app can type any prompt (questions, code requests, etc.), but those are not included here since they are not part of the development process.


---
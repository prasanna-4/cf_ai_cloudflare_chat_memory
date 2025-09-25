**Live demo:** https://cf_ai_cloudflare_chat_memory.ravikantilaxmiprasanna.workers.dev

# cf_ai_cloudflare_chat_memory


A minimal AI-powered chat app on **Cloudflare Workers AI** with **Durable Objects memory** and an optional **voice input/output UI**. Built to satisfy Cloudflare's optional assignment requirements.


## ✅ Requirements Coverage
- **LLM:** Uses Workers AI (default: `@cf/meta/llama-3.3-8b-instruct`).
- **Workflow / coordination:** Durable Object manages per-user conversation state + rate limiting.
- **User input:** Web chat UI with optional voice input (Web Speech API) and speech output (SpeechSynthesis).
- **Memory / state:** Conversation history stored in Durable Object `storage` (persisted per `sessionId`).


## Quick Start


### 1) Prereqs
- Node 18+
- `npm i -g wrangler` (Cloudflare CLI)
- A Cloudflare account & a Workers AI-enabled account/zone.


### 2) Install
```bash
npm install
```


### 3) Configure
Set your account details in `wrangler.toml`:
```toml
# Replace with your real account_id
account_id = "YOUR_ACCOUNT_ID"
```


Optional: pick an AI model in `wrangler.toml` or via env var `AI_MODEL`.


### 4) Dev
```bash
npm run dev
# open http://localhost:8787
```


### 5) Deploy
```bash
npm run deploy
```
The command prints a production URL. Use that link in your submission.


## Repo Checklist (for Cloudflare assignment)
- Repository **name prefix**: `cf_ai_` ✅ (rename on GitHub if needed)
- Contains **README.md** with run/deploy steps ✅
- Contains **PROMPTS.md** with AI prompts used ✅
- Clear way to try locally **and** a deployed link (post-deploy) ✅


## Architecture
- **Worker** (`src/worker.ts`): `/api/*` endpoints for chat/history/reset.
- **Durable Object** (`src/memory.ts`): stores conversation turns, trims context, simple token budget.
- **Frontend** (`public/`): lightweight chat UI with voice input/output (served automatically via Wrangler assets).


```
Browser ⇄ Worker (only /api/*)
│ │
│ /api/chat └──► Durable Object (per sessionId) ──► Workers AI (LLM)
└─────────────◄─── stores + returns assistant reply
```


## Environment & Bindings
`wrangler.toml` wires:
- `AI` – Workers AI binding
- `CHAT_SESSIONS` – Durable Object namespace
- Static assets served from `public/` via `[assets]` (no manual code needed).


## Notes
- If `@cf/meta/llama-3.3-8b-instruct` is unavailable on your account, set `AI_MODEL` to a supported model (e.g., `@cf/meta/llama-3-8b-instruct` or any Workers AI instruct model).
- Voice input uses **Web Speech API** (Chrome recommended). No server cost.


---
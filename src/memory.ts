import type { DurableObjectState } from '@cloudflare/workers-types';

type Role = 'system' | 'user' | 'assistant';
type Msg = { role: Role; content: string };

export interface Env {
  AI: any;
  AI_MODEL: string;
  MAX_TURNS: string;
  MAX_CHARS: string;
}

const SYSTEM_PROMPT: Msg = {
  role: 'system',
  content:
    'You are a concise assistant. Answer clearly. If user asks for code, return minimal runnable snippets. Maintain helpful tone.',
};

export class ChatSession {
  state: DurableObjectState;
  env: Env;

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
  }

  async fetch(req: Request) {
    const url = new URL(req.url);

    if (req.method === 'POST' && url.pathname.endsWith('/chat')) {
      const body = (await req.json()) as { message: string };
      const userMsg = (body?.message || '').slice(0, Number(this.env.MAX_CHARS) || 12000);
      if (!userMsg) {
        return new Response(JSON.stringify({ error: 'empty' }), { status: 400, headers: { 'content-type': 'application/json' } });
      }

      const prev: Msg[] = (await this.state.storage.get<Msg[]>('history')) || [];
      const maxTurns = Number(this.env.MAX_TURNS) || 16;
      const trimmed = prev.slice(-maxTurns * 2);

      const messages: Msg[] = [SYSTEM_PROMPT, ...trimmed, { role: 'user', content: userMsg }];

      // Use the model from wrangler.toml [vars]; default to llama-3-8b-instruct (widely available)
      const model = this.env.AI_MODEL || '@cf/meta/llama-3-8b-instruct';

      let reply = '';
      try {
        // Prefer chat-style first (works for Llama 3)
        const result = await (this.env as any).AI.run(model, { messages });
        reply =
          (result as any)?.response ??
          (result as any)?.output_text ??
          JSON.stringify(result);
      } catch (e) {
        // Fallback to simple prompt-style for models that don't accept `messages`
        try {
          const fallback = await (this.env as any).AI.run(model, {
            prompt: `System: ${SYSTEM_PROMPT.content}\nUser: ${userMsg}\nAssistant:`,
          });
          reply =
            (fallback as any)?.response ??
            (fallback as any)?.output_text ??
            JSON.stringify(fallback);
        } catch (e2) {
          // Final guard: return a readable error to the UI
          return new Response(
            JSON.stringify({
              error: 'ai_failed',
              message: e2 instanceof Error ? e2.message : String(e2),
            }),
            { status: 500, headers: { 'content-type': 'application/json' } }
          );
        }
      }

      const nextHistory = [
        ...trimmed,
        { role: 'user', content: userMsg },
        { role: 'assistant', content: reply },
      ];
      await this.state.storage.put('history', nextHistory);

      return new Response(JSON.stringify({ reply }), {
        headers: { 'content-type': 'application/json' },
      });
    }

    if (req.method === 'GET' && url.pathname.endsWith('/history')) {
      const prev: Msg[] = (await this.state.storage.get<Msg[]>('history')) || [];
      return new Response(JSON.stringify(prev), { headers: { 'content-type': 'application/json' } });
    }

    if (req.method === 'POST' && url.pathname.endsWith('/reset')) {
      await this.state.storage.delete('history');
      return new Response('ok');
    }

    return new Response('Not found', { status: 404 });
  }
}

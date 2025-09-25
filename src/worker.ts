import { Router } from "itty-router";
export { ChatSession } from "./memory"; // <-- REQUIRED

type Env = {
  CHAT_SESSIONS: DurableObjectNamespace;
  ASSETS: Fetcher; // provided by [assets] in wrangler.toml
};

const router = Router();

// Serve static assets
router.get("/", (_req, env: Env) => env.ASSETS.fetch(new Request("http://assets/")));
router.get("/:file(js|css|png|jpg|svg|ico)", (req, env: Env) =>
  env.ASSETS.fetch(new Request(`http://assets/${req.params!.file}`))
);

// session id via cookie
function getSessionId(req: Request) {
  const key = "cfai_sid";
  const m = (req.headers.get("cookie") || "").match(new RegExp(`${key}=([^;]+)`));
  return m ? m[1] : crypto.randomUUID();
}

// proxy to Durable Object
async function callDO(path: "/chat" | "/history" | "/reset", req: Request, env: Env) {
  const sid = getSessionId(req);
  const id = env.CHAT_SESSIONS.idFromName(sid);
  const stub = env.CHAT_SESSIONS.get(id);

  const url = new URL(req.url);
  url.pathname = path;

  const init: RequestInit = {
    method: req.method,
    headers: new Headers({
      "content-type": req.headers.get("content-type") || "application/json",
      "x-sid": sid,
    }),
  };
  if (req.method !== "GET" && req.method !== "HEAD") init.body = await req.text();

  try {
    const resp = await stub.fetch(url.toString(), init);
    const headers = new Headers(resp.headers);
    headers.append("set-cookie", `cfai_sid=${sid}; Path=/; HttpOnly; SameSite=Lax`);
    return new Response(resp.body, { status: resp.status, headers });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: "do_failed", message: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}

router.post("/api/chat", (req, env: Env) => callDO("/chat", req, env));
router.get("/api/history", (req, env: Env) => callDO("/history", req, env));
router.post("/api/reset", (req, env: Env) => callDO("/reset", req, env));
router.all("*", () => new Response("Not found", { status: 404 }));

export default {
  fetch: (req: Request, env: Env, ctx: ExecutionContext) => router.handle(req, env, ctx),
};

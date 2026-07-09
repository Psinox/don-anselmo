// =============================================
// DON ANSELMO — BACKEND (Cloudflare Worker)
// Clave escrita directo en el código (simple, sin Secrets).
// =============================================

const API_SECRET = "dna-7f3a9c2e-Xk92-mQ2v"; // clave fija, cambiala si querés

const ALLOWED_ORIGINS = [
  "https://psinox.github.io",
  "https://don-anselmo.pages.dev",
  "http://localhost:5500",
  "http://127.0.0.1:5500",
];

function withCors(resp, origin) {
  resp.headers.set("Access-Control-Allow-Origin", ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]);
  resp.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  resp.headers.set("Access-Control-Allow-Headers", "Content-Type, X-Api-Key");
  return resp;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";

    if (request.method === "OPTIONS") {
      return withCors(new Response(null, { status: 204 }), origin);
    }

    const KV = env.DON_ANSELMO_KV;

    try {
      if (url.pathname === "/data" && request.method === "GET") {
        const dataRaw = await KV.get("dona_data");
        const versionRaw = await KV.get("dona_v");
        return withCors(Response.json({
          ok: true,
          data: dataRaw ? JSON.parse(dataRaw) : null,
          version: versionRaw ? parseInt(versionRaw, 10) : 0,
        }), origin);
      }

      if (url.pathname === "/seed" && request.method === "POST") {
        const apiKey = request.headers.get("X-Api-Key");
        if (apiKey !== API_SECRET) {
          return withCors(Response.json({ ok: false, error: "Unauthorized" }, { status: 401 }), origin);
        }
        const existing = await KV.get("dona_data");
        if (existing) {
          return withCors(Response.json({ ok: false, error: "Already seeded" }, { status: 400 }), origin);
        }
        const body = await request.json();
        await KV.put("dona_data", JSON.stringify(body.data));
        await KV.put("dona_v", "1");
        return withCors(Response.json({ ok: true, version: 1 }), origin);
      }

      if (url.pathname === "/data" && request.method === "POST") {
        const apiKey = request.headers.get("X-Api-Key");
        if (apiKey !== API_SECRET) {
          return withCors(Response.json({ ok: false, error: "Unauthorized" }, { status: 401 }), origin);
        }
        const body = await request.json();
        const { data, version } = body;
        const currentVersion = parseInt(await KV.get("dona_v") || "0", 10);
        if (version !== currentVersion) {
          return withCors(Response.json({ ok: false, error: "conflict", currentVersion }, { status: 409 }), origin);
        }
        const newVersion = currentVersion + 1;
        await KV.put("dona_data", JSON.stringify(data));
        await KV.put("dona_v", String(newVersion));
        return withCors(Response.json({ ok: true, version: newVersion }), origin);
      }

      return withCors(new Response("Not found", { status: 404 }), origin);
    } catch (e) {
      return withCors(Response.json({ ok: false, error: e.message }, { status: 500 }), origin);
    }
  },
};
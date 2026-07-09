// =============================================
// DON ANSELMO — BACKEND (Cloudflare Worker)
// Basado en el modelo que ya funciona en Dubenji.
// Guarda TODO el negocio en una sola key del KV.
// =============================================

const API_SECRET = "dna-2026-K7xP9mQ2vL45zRw8-anselmo"; // debe ser IGUAL en cloud-db.js

const KV_KEY = "main";

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
      // Leer todo (lectura publica, sin clave)
      if (url.pathname === "/data" && request.method === "GET") {
        const raw = await KV.get(KV_KEY);
        if (!raw) return withCors(Response.json({ exists: false }), origin);
        return withCors(Response.json({ exists: true, data: JSON.parse(raw) }), origin);
      }

      // Sembrar datos por primera vez (solo si no existe nada todavia)
      if (url.pathname === "/seed" && request.method === "POST") {
        const existing = await KV.get(KV_KEY);
        if (existing) {
          return withCors(Response.json({ ok: false, reason: "ya existe", data: JSON.parse(existing) }, { status: 409 }), origin);
        }
        const body = await request.json();
        const data = body.data || {};
        data._v = 1;
        await KV.put(KV_KEY, JSON.stringify(data));
        return withCors(Response.json({ ok: true, data }), origin);
      }

      // Guardar cambios (requiere clave)
      if (url.pathname === "/data" && request.method === "POST") {
        const apiKey = request.headers.get("X-Api-Key");
        if (apiKey !== API_SECRET) {
          return withCors(Response.json({ ok: false, reason: "no autorizado" }, { status: 401 }), origin);
        }
        const body = await request.json(); // { data, expectedVersion }
        const raw = await KV.get(KV_KEY);
        const current = raw ? JSON.parse(raw) : {};
        const currentVersion = current._v || 0;

        if (typeof body.expectedVersion === "number" && body.expectedVersion !== currentVersion) {
          return withCors(Response.json({ ok: false, reason: "conflicto", data: current }, { status: 409 }), origin);
        }

        const nuevo = body.data;
        nuevo._v = currentVersion + 1;
        await KV.put(KV_KEY, JSON.stringify(nuevo));
        return withCors(Response.json({ ok: true, version: nuevo._v }), origin);
      }

      return withCors(new Response("Not found", { status: 404 }), origin);
    } catch (e) {
      return withCors(Response.json({ ok: false, error: e.message }, { status: 500 }), origin);
    }
  }
};

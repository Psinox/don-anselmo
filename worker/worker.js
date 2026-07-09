/* =========================================================================
   Don Anselmo — Cloudflare Worker
   -------------------------------------------------------------------------
   Endpoints:
     GET  /data   → { ok, data, version }
     POST /seed   → recibe { data }, inicia KV, devuelve { ok, version }
     POST /data   → recibe { data, version }, guarda si version coincide
   -------------------------------------------------------------------------
   Autenticacion: header X-Api-Key (se compara con secret del Worker)
   CORS: solo origenes explicitos
   ========================================================================= */

const ALLOWED_ORIGINS = [
  "https://psinox.github.io",
  "https://don-anselmo.pages.dev",
  "http://localhost:5500",
  "http://127.0.0.1:5500",
];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";
    const cors = {
      "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-Api-Key",
      "Access-Control-Max-Age": "86400",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    if (request.headers.get("X-Api-Key") !== env.API_KEY) {
      return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), {
        status: 401, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const KV = env.DON_ANSELMO_KV;

    try {
      switch (url.pathname) {
        case "/data":
          if (request.method === "GET") return handleGet(KV, cors);
          if (request.method === "POST") return handlePost(request, KV, cors);
          break;
        case "/seed":
          if (request.method === "POST") return handleSeed(request, KV, cors);
          break;
      }
      return new Response(JSON.stringify({ ok: false, error: "Not found" }), {
        status: 404, headers: { ...cors, "Content-Type": "application/json" },
      });
    } catch (e) {
      return new Response(JSON.stringify({ ok: false, error: e.message }), {
        status: 500, headers: { ...cors, "Content-Type": "application/json" },
      });
    }
  },
};

async function handleGet(KV, cors) {
  const [dataRaw, versionRaw] = await Promise.all([
    KV.get("dona_data"),
    KV.get("dona_v"),
  ]);
  return new Response(JSON.stringify({
    ok: true,
    data: dataRaw ? JSON.parse(dataRaw) : null,
    version: versionRaw ? parseInt(versionRaw, 10) : 0,
  }), { headers: { ...cors, "Content-Type": "application/json" } });
}

async function handlePost(request, KV, cors) {
  const body = await request.json();
  const { data, version } = body;

  if (data === undefined || version === undefined) {
    return new Response(JSON.stringify({ ok: false, error: "Missing data or version" }), {
      status: 400, headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const currentVersion = parseInt(await KV.get("dona_v") || "0", 10);
  if (version !== currentVersion) {
    return new Response(JSON.stringify({ ok: false, error: "conflict", currentVersion }), {
      status: 409, headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const newVersion = currentVersion + 1;
  await Promise.all([
    KV.put("dona_data", JSON.stringify(data)),
    KV.put("dona_v", String(newVersion)),
  ]);

  return new Response(JSON.stringify({ ok: true, version: newVersion }), {
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

async function handleSeed(request, KV, cors) {
  const existing = await KV.get("dona_data");
  if (existing) {
    return new Response(JSON.stringify({ ok: false, error: "Already seeded" }), {
      status: 400, headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const body = await request.json();
  const { data } = body;
  if (!data) {
    return new Response(JSON.stringify({ ok: false, error: "Missing data" }), {
      status: 400, headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  await Promise.all([
    KV.put("dona_data", JSON.stringify(data)),
    KV.put("dona_v", "1"),
  ]);

  return new Response(JSON.stringify({ ok: true, version: 1 }), {
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

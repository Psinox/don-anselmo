/* =========================================================================
   Don Anselmo — cloud-db.js
   -------------------------------------------------------------------------
   Capa de datos que habla con el Worker de Cloudflare.
   Tiene la MISMA API que store.js (getProductos, updateProductos, etc.)
   para que el resto del codigo no cambie.
   -------------------------------------------------------------------------
   Si no hay conexion con el Worker, usa localStorage como cache local.
   Si hay conflicto de version, relee y reintenta automaticamente.
   Timeout de 5s para no dejar la pantalla colgada.
   ========================================================================= */

/* ⚠️ IMPORTANTE — completar antes de subir a GitHub Pages:
   1. CLOUD_URL: la URL real de tu Worker (Cloudflare > Workers & Pages > tu worker > Overview,
      es el link "Visit" o el que aparece arriba, tipo https://NOMBRE.SUBDOMINIO.workers.dev)
   2. CLOUD_API_KEY: el MISMO valor exacto que pusiste como Secret "API_KEY" en el Worker
      (Settings > Variables and Secrets). Si no coinciden letra por letra, el Worker
      va a responder 401 Unauthorized y el sitio va a funcionar solo con localStorage local. */
const CLOUD_URL = "https://don-anselmo-api.kivaro-dev.workers.dev";
const CLOUD_API_KEY = "7f3a9c2e8b1d4f6a0c5e9b2d7a4f1c8e3b6d9a2f5c8e1b4d7a0c3e6b9f2d5a8c";

const CACHE_KEY = "donanselmo_cloud_cache";
const VERSION_KEY = "donanselmo_cloud_v";

let _cache = null;
let _version = 0;
let _ready = false;

/* ---------- interno ---------- */

function _readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function _writeCache(data) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch {}
}

function _readVersion() {
  return parseInt(localStorage.getItem(VERSION_KEY) || "0", 10);
}

function _writeVersion(v) {
  try { localStorage.setItem(VERSION_KEY, String(v)); } catch {}
}

async function _fetch(method, path, body) {
  const opts = {
    method,
    headers: { "X-Api-Key": CLOUD_API_KEY },
    signal: AbortSignal.timeout(5000),
  };
  if (body) {
    opts.headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(CLOUD_URL + path, opts);
  if (!res.ok) throw new Error("HTTP " + res.status);
  return res.json();
}

/* ---------- inicializacion ---------- */

async function cloudInit(seedData) {
  /* 1. intentar traer datos del Worker */
  try {
    const json = await _fetch("GET", "/data");
    if (json.ok && json.data) {
      _cache = json.data;
      _version = json.version;
      _writeCache(_cache);
      _writeVersion(_version);
      _ready = true;
      return true; /* datos nuevos del servidor */
    }
  } catch {}

  /* 2. si no hay datos en el cloud, seed */
  if (!_cache) _cache = _readCache() || seedData || {};
  if (!_cache.productos) _cache = seedData || _cache;
  try {
    const json = await _fetch("POST", "/seed", { data: _cache });
    if (json.ok) _version = json.version;
  } catch {}
  _writeCache(_cache);
  _writeVersion(_version);
  _ready = true;
  return false; /* datos locales */
}

function isCloudReady() { return _ready; }

/* ---------- sync: empuja el cache completo al Worker ---------- */

async function _sync() {
  if (!_ready) return;
  try {
    const json = await _fetch("POST", "/data", { data: _cache, version: _version });
    if (json.ok) {
      _version = json.version;
      _writeCache(_cache);
      _writeVersion(_version);
    } else if (json.error === "conflict") {
      /* conflicto: releer del servidor y reintentar */
      const fresh = await _fetch("GET", "/data");
      if (fresh.ok && fresh.data) {
        _cache = fresh.data;
        _version = fresh.version;
        _writeCache(_cache);
        _writeVersion(_version);
      }
    }
  } catch {
    /* sin conexion: queda en cache local */
    _writeCache(_cache);
  }
}

/* ---------- API publica (igual que store.js) ---------- */

function getProductos() {
  if (!_cache) _cache = _readCache() || {};
  return (_cache.productos || []).slice();
}

function saveProductos(list) {
  if (!_cache) _cache = _readCache() || {};
  _cache.productos = list.slice();
  _sync();
}

function updateProductos(mutatorFn) {
  const actuales = getProductos();
  const nuevos = mutatorFn(actuales.slice());
  saveProductos(nuevos);
  return nuevos;
}

function getBanners() {
  if (!_cache) _cache = _readCache() || {};
  return (_cache.banners || []).slice();
}

function saveBanners(list) {
  if (!_cache) _cache = _readCache() || {};
  _cache.banners = list.slice();
  _sync();
}

function updateBanners(mutatorFn) {
  const actuales = getBanners();
  const nuevos = mutatorFn(actuales.slice());
  saveBanners(nuevos);
  return nuevos;
}

function getSettings() {
  if (!_cache) _cache = _readCache() || {};
  return { ...(_cache.settings || {}) };
}

function saveSettings(s) {
  if (!_cache) _cache = _readCache() || {};
  _cache.settings = { ...s };
  _sync();
}

function getPresupuestos() {
  if (!_cache) _cache = _readCache() || {};
  return (_cache.presupuestos || []).slice();
}

function savePresupuestos(list) {
  if (!_cache) _cache = _readCache() || {};
  _cache.presupuestos = list.slice();
  _sync();
}

function getSolicitudesMayoristas() {
  if (!_cache) _cache = _readCache() || {};
  return (_cache.solicitudesMayoristas || []).slice();
}

function saveSolicitudesMayoristas(list) {
  if (!_cache) _cache = _readCache() || {};
  _cache.solicitudesMayoristas = list.slice();
  _sync();
}

function agregarSolicitudMayorista(datos) {
  const list = getSolicitudesMayoristas();
  if (list.find(s => s.whatsapp === datos.whatsapp)) return false;
  list.push({
    id: "m" + Date.now().toString().slice(-8),
    nombre: datos.nombre,
    negocio: datos.negocio || "",
    whatsapp: datos.whatsapp,
    fecha: new Date().toISOString(),
  });
  saveSolicitudesMayoristas(list);
  return true;
}

function getMayoristasAprobados() {
  if (!_cache) _cache = _readCache() || {};
  return (_cache.mayoristasAprobados || []).slice();
}

function saveMayoristasAprobados(list) {
  if (!_cache) _cache = _readCache() || {};
  _cache.mayoristasAprobados = list.slice();
  _sync();
}

function aprobarMayorista(id) {
  const pendientes = getSolicitudesMayoristas();
  const idx = pendientes.findIndex(s => s.id === id);
  if (idx === -1) return false;
  const [solicitud] = pendientes.splice(idx, 1);
  saveSolicitudesMayoristas(pendientes);
  const aprobados = getMayoristasAprobados();
  aprobados.push({ ...solicitud, compras: [] });
  saveMayoristasAprobados(aprobados);
  return true;
}

function rechazarMayorista(id) {
  const list = getSolicitudesMayoristas().filter(s => s.id !== id);
  saveSolicitudesMayoristas(list);
}

function agregarCompraMayorista(mayoristaId, compra) {
  const list = getMayoristasAprobados();
  const m = list.find(x => x.id === mayoristaId);
  if (!m) return false;
  m.compras = m.compras || [];
  m.compras.push({
    fecha: new Date().toLocaleDateString("es-AR"),
    total: compra.total,
    items: compra.items,
  });
  saveMayoristasAprobados(list);
  return true;
}

/* ---------- Sesion mayorista (solo localStorage, no va al cloud) ---------- */

function getMayorista() {
  try { const r = localStorage.getItem("donanselmo_mayorista_sesion"); return r ? JSON.parse(r) : null; } catch { return null; }
}
function setMayorista(d) { try { localStorage.setItem("donanselmo_mayorista_sesion", JSON.stringify(d)); } catch {} }
function clearMayorista() { try { localStorage.removeItem("donanselmo_mayorista_sesion"); } catch {} }

/* ---------- Carrito (solo localStorage) ---------- */

function getCarrito() {
  try { const r = localStorage.getItem("donanselmo_carrito"); return r ? JSON.parse(r) : []; } catch { return []; }
}
function saveCarrito(c) { try { localStorage.setItem("donanselmo_carrito", JSON.stringify(c)); } catch {} }

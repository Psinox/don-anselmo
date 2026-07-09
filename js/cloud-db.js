/* =========================================================================
   Don Anselmo — cloud-db.js
   Basado en el modelo simple que funciona en Dubenji.
   Misma API publica de siempre (getProductos, updateProductos, etc.)
   para que el resto del sitio no necesite cambios.
   ========================================================================= */

const CLOUD_URL = "https://don-anselmo-api.kivaro-dev.workers.dev";
const CLOUD_API_KEY = "dna-2026-K7xP9mQ2vL45zRw8-anselmo"; // debe ser IGUAL en worker.js

const CACHE_KEY = "donanselmo_cloud_cache";

let _cache = null;
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
  if (!res.ok && res.status !== 409) throw new Error("HTTP " + res.status);
  return res.json();
}

/* ---------- inicializacion ---------- */

async function cloudInit(seedData) {
  try {
    const json = await _fetch("GET", "/data");
    if (json.exists && json.data) {
      _cache = json.data;
      _writeCache(_cache);
      _ready = true;
      return true;
    }
    const base = seedData || _readCache() || {};
    const seedRes = await _fetch("POST", "/seed", { data: base });
    _cache = seedRes.data || base;
    _writeCache(_cache);
    _ready = true;
    return false;
  } catch (e) {
    console.warn('⚠️ Sin conexion al servidor, modo local:', e);
    _cache = _readCache() || seedData || {};
    _ready = true;
    return false;
  }
}

function isCloudReady() { return _ready; }

/* ---------- sync: empuja el cache completo al Worker ---------- */

async function _sync() {
  if (!_ready) return;
  try {
    const json = await _fetch("POST", "/data", { data: _cache, expectedVersion: _cache._v || 0 });
    if (json.ok) {
      _cache._v = json.version;
      _writeCache(_cache);
    } else if (json.reason === "conflicto") {
      _cache = json.data;
      _writeCache(_cache);
    }
  } catch {
    _writeCache(_cache);
  }
}

/* ---------- API publica (igual que siempre) ---------- */

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

/* ---------- Sesion mayorista (solo localStorage) ---------- */
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

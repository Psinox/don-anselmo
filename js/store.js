/* =========================================================================
   DON ANSELMO — Capa de datos (store.js)
   -------------------------------------------------------------------------
   Si cloud-db.js esta cargado, las funciones que define tienen prioridad.
   Si no, usa localStorage directamente (comportamiento original).
   ========================================================================= */

/* ---------- interno: solo para fallback localStorage ---------- */

const DB_KEYS = {
  productos: "donanselmo_productos",
  banners: "donanselmo_banners",
  settings: "donanselmo_settings",
};

function _read(key, fallback) {
  try { const r = localStorage.getItem(key); return r !== null ? JSON.parse(r) : fallback; }
  catch { return fallback; }
}
function _write(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; }
  catch { return false; }
}

/* ---------- Productos ---------- */

if (typeof getProductos === "undefined") {
  function getProductos() { return _read(DB_KEYS.productos, SEED_PRODUCTS); }
  function saveProductos(p) { return _write(DB_KEYS.productos, p); }
  function updateProductos(mutatorFn) {
    const a = getProductos(); const n = mutatorFn(a.slice()); saveProductos(n); return n;
  }
}

/* ---------- Banners ---------- */

if (typeof getBanners === "undefined") {
  function getBanners() { return _read(DB_KEYS.banners, SEED_BANNERS); }
  function saveBanners(b) { return _write(DB_KEYS.banners, b); }
  function updateBanners(mutatorFn) {
    const a = getBanners(); const n = mutatorFn(a.slice()); saveBanners(n); return n;
  }
}

/* ---------- Ajustes ---------- */

if (typeof getSettings === "undefined") {
  function getSettings() { return _read(DB_KEYS.settings, SEED_SETTINGS); }
  function saveSettings(s) { return _write(DB_KEYS.settings, s); }
}

/* ---------- Inicialización ---------- */

if (typeof initStoreIfEmpty === "undefined") {
  function initStoreIfEmpty() {
    // Si cloud-db.js esta activo, el se encarga de sembrar datos (POST /seed)
    // la primera vez. Hacer esto tambien aca pisaria el cache con SEED_* en
    // cada carga de pagina, antes de que llegue la respuesta real del Worker.
    if (typeof cloudInit === "function") return;
    if (localStorage.getItem(DB_KEYS.productos) === null) saveProductos(SEED_PRODUCTS);
    if (localStorage.getItem(DB_KEYS.banners) === null) saveBanners(SEED_BANNERS);
    if (localStorage.getItem(DB_KEYS.settings) === null) saveSettings(SEED_SETTINGS);
  }
}

/* ---------- Mayorista ---------- */

if (typeof getMayorista === "undefined") {
  const _M_SESSION = "donanselmo_mayorista_sesion";
  function getMayorista() { return _read(_M_SESSION, null); }
  function setMayorista(d) { return _write(_M_SESSION, { ...d, fecha: new Date().toISOString() }); }
  function clearMayorista() { localStorage.removeItem(_M_SESSION); }
}

if (typeof getSolicitudesMayoristas === "undefined") {
  const _M_PEND = "donanselmo_mayoristas_pendientes";
  function getSolicitudesMayoristas() { return _read(_M_PEND, []); }
  function saveSolicitudesMayoristas(l) { return _write(_M_PEND, l); }
}

if (typeof getMayoristasAprobados === "undefined") {
  const _M_APR = "donanselmo_mayoristas_aprobados";
  function getMayoristasAprobados() { return _read(_M_APR, []); }
  function saveMayoristasAprobados(l) { return _write(_M_APR, l); }
}

if (typeof agregarSolicitudMayorista === "undefined") {
  function agregarSolicitudMayorista(datos) {
    const list = getSolicitudesMayoristas();
    if (list.find(s => s.whatsapp === datos.whatsapp)) return false;
    list.push({ id: "m" + Date.now().toString().slice(-8), nombre: datos.nombre, negocio: datos.negocio || "", whatsapp: datos.whatsapp, fecha: new Date().toISOString() });
    saveSolicitudesMayoristas(list);
    return true;
  }
  function aprobarMayorista(id) {
    const p = getSolicitudesMayoristas(); const i = p.findIndex(s => s.id === id);
    if (i === -1) return false;
    const [s] = p.splice(i, 1); saveSolicitudesMayoristas(p);
    const a = getMayoristasAprobados(); a.push({ ...s, compras: [] }); saveMayoristasAprobados(a);
    return true;
  }
  function rechazarMayorista(id) { saveSolicitudesMayoristas(getSolicitudesMayoristas().filter(s => s.id !== id)); }
  function agregarCompraMayorista(mid, compra) {
    const list = getMayoristasAprobados(); const m = list.find(x => x.id === mid);
    if (!m) return false;
    m.compras = m.compras || []; m.compras.push({ fecha: new Date().toLocaleDateString("es-AR"), total: compra.total, items: compra.items });
    saveMayoristasAprobados(list); return true;
  }
}

/* ---------- Presupuestos ---------- */

if (typeof getPresupuestos === "undefined") {
  const _PRESUP_KEY = "donanselmo_presupuestos";
  function getPresupuestos() { return _read(_PRESUP_KEY, []); }
  function savePresupuestos(list) { return _write(_PRESUP_KEY, list); }
}

/* ---------- Carrito (siempre localStorage) ---------- */

if (typeof getCarrito === "undefined") {
  function getCarrito() { return _read("donanselmo_carrito", []); }
  function saveCarrito(c) { return _write("donanselmo_carrito", c); }
}

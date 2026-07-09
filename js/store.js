/* =========================================================================
   DON ANSELMO — Capa de datos (store.js)
   -------------------------------------------------------------------------
   Misma idea que "cloud-db.js" en otros proyectos: expone funciones con
   nombre estable (getProductos, saveProductos, etc.) para que el resto del
   código nunca sepa CÓMO se guardan los datos. Hoy el interior usa
   localStorage. El día de mañana, cuando el cliente apruebe el demo y
   conectemos Cloudflare Worker + KV, cambiamos solo lo de adentro de estas
   funciones (fetch a /data en vez de localStorage) y todo lo demás sigue
   funcionando igual.

   Patrón de escritura atómica: updateProductos(mutatorFn) relee el estado
   actual, aplica el cambio, y guarda — para cuando haya multi-tab o,
   más adelante, multi-dispositivo con el Worker.
   ========================================================================= */

const DB_KEYS = {
  productos: "donanselmo_productos",
  banners: "donanselmo_banners",
  settings: "donanselmo_settings",
  version: "donanselmo_v",
};

function _read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.error("store: error leyendo", key, e);
    return fallback;
  }
}

function _write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error("store: error guardando", key, e);
    return false;
  }
}

/* ---------- Productos ---------- */

function getProductos() {
  return _read(DB_KEYS.productos, SEED_PRODUCTS);
}

function saveProductos(productos) {
  return _write(DB_KEYS.productos, productos);
}

// Escritura atómica: evita que dos ediciones se pisen (ej. dos pestañas
// del admin abiertas al mismo tiempo).
function updateProductos(mutatorFn) {
  const actuales = getProductos();
  const nuevos = mutatorFn(actuales.slice());
  saveProductos(nuevos);
  return nuevos;
}

/* ---------- Banners ---------- */

function getBanners() {
  return _read(DB_KEYS.banners, SEED_BANNERS);
}

function saveBanners(banners) {
  return _write(DB_KEYS.banners, banners);
}

function updateBanners(mutatorFn) {
  const actuales = getBanners();
  const nuevos = mutatorFn(actuales.slice());
  saveBanners(nuevos);
  return nuevos;
}

/* ---------- Ajustes del negocio ---------- */

function getSettings() {
  return _read(DB_KEYS.settings, SEED_SETTINGS);
}

function saveSettings(settings) {
  return _write(DB_KEYS.settings, settings);
}

/* ---------- Inicialización (equivalente al POST /seed) ---------- */

function initStoreIfEmpty() {
  if (localStorage.getItem(DB_KEYS.productos) === null) {
    saveProductos(SEED_PRODUCTS);
  }
  if (localStorage.getItem(DB_KEYS.banners) === null) {
    saveBanners(SEED_BANNERS);
  }
  if (localStorage.getItem(DB_KEYS.settings) === null) {
    saveSettings(SEED_SETTINGS);
  }
}

/* ---------- Modo mayorista (registro simple, sin aprobación) ---------- */

const MAYORISTA_KEY = "donanselmo_mayorista";

function getMayorista() {
  return _read(MAYORISTA_KEY, null); // null | {nombre, negocio, whatsapp, fecha}
}

function setMayorista(datos) {
  return _write(MAYORISTA_KEY, { ...datos, fecha: new Date().toISOString() });
}

function clearMayorista() {
  localStorage.removeItem(MAYORISTA_KEY);
}

/* ---------- Carrito ---------- */

const CART_KEY = "donanselmo_carrito";

function getCarrito() {
  return _read(CART_KEY, []); // [{productoId, cantidad}]
}

function saveCarrito(carrito) {
  return _write(CART_KEY, carrito);
}

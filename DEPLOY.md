# Don Anselmo — Qué arreglé y cómo seguir

## 1. Bugs que corregí en tu código

1. **`CLOUD_URL` apuntaba a un Worker que no existe** (`don-anselmo.psinox.workers.dev`).
   Lo cambié a tu Worker real: `https://don-anselmo-api.kivaro-dev.workers.dev`.
   👉 **Revisá que sea exactamente esa URL** (Cloudflare > tu Worker > Overview, el link "Visit").

2. **`CLOUD_API_KEY` estaba vacío** (`""`). Sin esto, el Worker rechaza todo con 401 y el sitio
   queda funcionando solo con localStorage local (nunca sincroniza).
   👉 Lo dejé como `"dona2026"` de ejemplo — **reemplazalo por el valor real** que pusiste como
   Secret `API_KEY` en el dashboard de Cloudflare. Tiene que ser **idéntico, letra por letra**.
   Está en `js/cloud-db.js`, líneas 13-14.

3. **El logo quedaba a la izquierda**, pediste isotipo + logotipo en la esquina derecha.
   Reordené el header: menú/nav a la izquierda, carrito + mayorista + logo a la derecha.

4. **Bug al sacar una imagen de un producto ya guardado**: si abrías "Editar", sacabas una foto
   con "Quitar" pero no subías una nueva, al guardar la foto vieja volvía a aparecer. Ahora
   `admin.js` distingue entre "no toqué esta imagen" y "la saqué a propósito".

5. **Los presupuestos no viajaban al Worker**: `admin.js` tenía su propia versión de
   `getPresupuestos()/savePresupuestos()` que pisaba (sobrescribía) la de `cloud-db.js`, así que
   quedaban solo en el localStorage de ese navegador, nunca en el KV. Saqué esa duplicación.

6. Un par de `color:var(--verde)` que no existía como variable CSS (era `--exito`) — cosmético,
   pero ya está.

7. Quedaban 2 emojis de lápiz (✏️) sueltos en los botones de editar — reemplazados por un ícono
   SVG, para que sea consistente con el resto (que ya no tiene ningún emoji).

## 2. Lo que ya tenías bien armado (y vale la pena que sepas por qué funciona)

- **Patrón de "misma API, distinto motor" (`store.js` vs `cloud-db.js`)**: ambos archivos
  definen las mismas funciones (`getProductos`, `saveProductos`, etc.). `cloud-db.js` se carga
  primero, así que sus versiones (las que hablan con el Worker) ganan. `store.js` tiene guardas
  `if (typeof X === "undefined")` — solo se activan si `cloud-db.js` no está. Es un patrón muy
  prolijo para poder "apagar" el backend real sin tocar el resto del sitio.
- **Cloudinary para imágenes** (no base64): subís el archivo, Cloudinary te devuelve una URL, esa
  URL es lo que se guarda en el producto. Mucho más liviano que meter la imagen entera en el KV.
- **Control de versión (`_v`) al guardar**: si dos pestañas guardan al mismo tiempo, la segunda
  se da cuenta del conflicto (409) y relee antes de reintentar. Evita que se pisen cambios.
- **Presupuesto en PDF sin librerías**: usa un `<iframe>` oculto + `window.print()` — el navegador
  ofrece "Guardar como PDF" en el diálogo de impresión. Cero dependencias externas.

## 3. Lo que quedó pendiente (no lo inventé, así que te aviso en vez de simular que está)

- **Link público de presupuesto** (`presupuesto.html?id=...` para mandarle un link al cliente sin
  que tenga que entrar al panel): todavía no existe esa página. Hoy "Ver" y "PDF" solo funcionan
  *dentro* del panel admin. Si lo querés, es la próxima tarea lógica — avisame.
- Los inputs de imagen para el hero y los logos (Ajustes) no muestran la vista previa la primera
  vez que subís un archivo nuevo (sí se guarda bien, solo que no lo ves hasta reabrir el form).
  Cosmético, no urgente.
- Hay ~140 líneas de un sistema viejo de "Banners" en `admin.js` (de una versión anterior, antes
  de que lo reemplazaras por "Productos destacados") que no se usan para nada — no rompen nada,
  pero si en algún momento querés que el archivo sea más corto, se pueden borrar.

## 4. Checklist para subir la demo a GitHub Pages HOY

1. En `js/cloud-db.js`, confirmá `CLOUD_URL` y `CLOUD_API_KEY` (punto 1 y 2 arriba).
2. En Cloudflare, confirmá que el Worker esté deployado con el último código (`worker/worker.js`)
   y que el Secret `API_KEY` tenga el mismo valor.
3. En `worker/worker.js`, revisá `ALLOWED_ORIGINS` — tiene que incluir el dominio exacto donde vas
   a servir la demo. Si el repo se llama `Don-Anselmo` y tu usuario es `psinox`, el sitio queda en
   `https://psinox.github.io/Don-Anselmo/` — el *origin* que manda el navegador es solo
   `https://psinox.github.io` (sin la ruta), y eso ya está en la lista. No hace falta tocar nada
   ahí salvo que cambies de usuario/organización.
4. Subí esta carpeta a un repo de GitHub, activá GitHub Pages (Settings > Pages > branch `main`,
   carpeta `/root`).
5. Abrí el sitio, fijate en la consola del navegador (F12 > Console) que no haya errores rojos.
6. Entrá a `/admin.html`, iniciá sesión (contraseña por defecto `donanselmo2026`, cambiala desde
   Ajustes apenas entres) y cargá un producto de prueba con imagen. Si aparece en la tienda,
   el Worker + KV están funcionando de punta a punta.
7. Para confirmar que de verdad está sincronizando (y no solo local): abrí el sitio en otro
   navegador o en modo incógnito — si ves el mismo producto de prueba, el KV está funcionando.

## 5. Cuando factures y pases a Netlify

No hay paso de build, así que es arrastrar y soltar la carpeta en Netlify. Solo acordate de:
- Agregar el dominio final de Netlify a `ALLOWED_ORIGINS` en `worker.js` y volver a hacer Deploy
  del Worker (si no, CORS bloquea las requests y parece que "no anda" aunque el resto esté bien).

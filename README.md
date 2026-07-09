# Don Anselmo — Sitio de ventas (demo)

Sitio de charcutería artesanal con carrito y cierre de venta por WhatsApp, más un panel de administración para el dueño.

## Cómo verlo

Abrí `index.html` en el navegador (doble click alcanza), o subí toda la carpeta a GitHub Pages / Netlify.

**Panel de administración:** `admin.html`
Contraseña de prueba: `donanselmo2026` (⚠️ cambiarla en `js/admin.js`, línea `ADMIN_PASSWORD`, antes de entregarle el link al cliente).

## Qué es esto y qué no es

Este es un **demo 100% visual y funcional en el navegador**. No hay backend todavía:
- Los productos, banners y ajustes se guardan en `localStorage` (o sea: cada navegador/celular tiene su propia copia — si el dueño carga un producto desde la compu, no lo va a ver desde el celu, y viceversa).
- Es la misma estrategia que usamos en Arca Studio: primero cerramos el 100% de la experiencia visual y funcional con datos de prueba, y recién después conectamos backend real (Cloudflare Worker + KV), una vez que el cliente lo apruebe.

Todo el código de datos está aislado en `js/store.js`. El día que haya que conectar el Worker, se reescribe SOLO el contenido de las funciones de ese archivo (`getProductos`, `saveProductos`, etc.) — nada más en el sitio tiene que cambiar, porque todo el resto llama a esas funciones sin saber cómo guardan los datos.

## Estructura de archivos

```
don-anselmo/
├── index.html          → sitio público
├── admin.html          → panel de administración
├── css/
│   ├── styles.css       → estilos del sitio público (y variables de marca)
│   └── admin.css        → estilos propios del panel (importa las variables de styles.css)
├── js/
│   ├── data.js          → datos de ejemplo (productos, banners, ajustes) — el "seed"
│   ├── store.js         → capa de datos (hoy: localStorage / mañana: Worker+KV)
│   ├── cart.js           → lógica del carrito y armado del mensaje de WhatsApp
│   ├── main.js           → lógica del sitio público
│   └── admin.js          → lógica del panel de administración
└── assets/
    └── logo.svg
```

## Pendientes / a confirmar con el cliente

- [ ] **Número de WhatsApp real** — hoy hay un número de ejemplo en Ajustes del panel (`5493794000000`). Se cambia desde el panel, tab "Ajustes".
- [ ] **Fotos reales de los productos** — hoy cada producto muestra un emoji como placeholder. Cuando el cliente mande fotos, lo ideal es subirlas a Cloudinary (igual que en Dubenji) y guardar la URL en vez del emoji — falta agregar el campo de URL de imagen en el form de producto (es un cambio chico en `admin.js` + `main.js`).
- [ ] **Nombres a confirmar**: "Sal Aromatizada del Iberá" y "Pickles de Pepino" están adivinados a partir de la lista que pasaste (los nombres originales tenían errores de tipeo). "Escabeche de Jabalí" lo agregué como producto de ejemplo en la línea Sabores de Caza porque el logo tiene jabalí + ciervo, pero solo vi la etiqueta del ciervo — confirmar si existe.
- [ ] **Precios** — todos son de ejemplo, se editan fácil desde el panel (tab Productos).
- [ ] **Mayoristas**: quedó como registro simple e inmediato (sin aprobación), tal cual pediste. Si el día de mañana quieren pasar a aprobación manual (como en Arca Studio), es un cambio de lógica en `store.js` + `main.js`, no hay que tocar el diseño.
- [ ] **Contraseña del panel admin** — cambiarla antes de la entrega (ver arriba).

## Hosting

- **Ahora (demo para vos y el cliente):** GitHub Pages, tal cual venís laburando.
- **Entrega final:** Netlify, una vez que factures — la carpeta ya está lista para arrastrar y soltar en Netlify sin cambios (no tiene build step, es HTML/CSS/JS plano).

## Diseño

- Colores: negro (#100E0C) + dorado (#C89B3C) tomados del logo real; crema (#F1E9DA) + marrón (#6B4423) tomados de las etiquetas "Regionales Don Anselmo"; verde monte para la línea Sabores de Caza.
- Tipografías: Fraunces (títulos), Pinyon Script (firma cursiva, como el logo), Jost (texto).
- El "sello" circular (venado + textura de etiqueta grabada) se repite como firma visual en toda la página.
- Mobile-first en las dos puntas: el sitio público (90% de los clientes) y el panel admin (el dueño carga todo desde el celu) — chips deslizables, inputs grandes, una sola columna en los formularios.
- `overflow-x: hidden` en `html` Y `body`, transiciones del carrito con `transform: translateX()` — mismos aprendizajes de Dubenji aplicados desde el arranque.

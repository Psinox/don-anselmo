const ADMIN_PASSWORD = "donanselmo2026";
const SESSION_KEY = "donanselmo_admin_sesion";

let tabActiva = "productos";
let editandoProductoId = null;
let editandoBannerId = null;

document.addEventListener("DOMContentLoaded", () => {
  initStoreIfEmpty();
  if (sessionStorage.getItem(SESSION_KEY) === "ok"){
    mostrarPanel();
  } else {
    mostrarLogin();
  }
  bindLogin();
});

function mostrarLogin(){
  document.getElementById("login-screen").classList.remove("oculto");
  document.getElementById("panel-screen").classList.add("oculto");
}

function mostrarPanel(){
  document.getElementById("login-screen").classList.add("oculto");
  document.getElementById("panel-screen").classList.remove("oculto");
  renderProductosAdmin();
  renderPresupuestosAdmin();
  renderMayoristasAdmin();
  renderAjustesForm();
  bindTabs();
  bindLogout();
}

function bindLogin(){
  const form = document.getElementById("form-login");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const val = document.getElementById("login-pass").value;
    if (val === ADMIN_PASSWORD){
      sessionStorage.setItem(SESSION_KEY, "ok");
      mostrarPanel();
    } else {
      document.getElementById("login-error").textContent = "Contrasena incorrecta.";
    }
  });
}

function bindLogout(){
  document.getElementById("btn-logout")?.addEventListener("click", () => {
    sessionStorage.removeItem(SESSION_KEY);
    mostrarLogin();
  });
}

function bindTabs(){
  document.querySelectorAll(".admin-tab").forEach(btn => {
    btn.addEventListener("click", () => {
      tabActiva = btn.getAttribute("data-tab");
      document.querySelectorAll(".admin-tab").forEach(b => b.classList.toggle("activo", b === btn));
      document.querySelectorAll(".admin-panel").forEach(p => p.classList.toggle("activo", p.id === "panel-" + tabActiva));
    });
  });
}

function mostrarToast(msg){
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("visible");
  setTimeout(() => t.classList.remove("visible"), 2200);
}

function escapeHtml(str){
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

function leerImgBase64(file, callback){
  const reader = new FileReader();
  reader.onload = (e) => callback(e.target.result);
  reader.readAsDataURL(file);
}

/* =========================================================================
   PRODUCTOS
   ========================================================================= */

function renderProductosAdmin(){
  const cont = document.getElementById("lista-productos");
  const productos = getProductos();

  if (productos.length === 0){
    cont.innerHTML = '<div class="vacio-admin">Todavia no hay productos cargados.</div>';
    return;
  }

  let html = "";
  CATEGORIAS.forEach(cat => {
    const items = productos.filter(p => p.categoria === cat.id);
    if (items.length === 0) return;
    html += `<div class="cat-group"><h4 class="cat-group-title">${cat.nombre}</h4>`;
    items.forEach(p => {
      const medida = p.unidad === "unidad" ? "1 unidad" : `${p.cantidad}${p.unidad === "kilogramos" ? "kg" : "g"}`;
      const preview = p.imagenes && p.imagenes[0] ? `<img src="${p.imagenes[0]}" class="admin-thumb">` : "";
      html += `
        <div class="fila-admin ${p.activo ? '' : 'inactivo'}">
          <div class="admin-thumb-wrap">${preview}</div>
          <div class="datos">
            <h4>${escapeHtml(p.nombre)}</h4>
            <span>${medida} · ${formatearMoneda(p.precioMinorista)} (min) / ${formatearMoneda(p.precioMayorista)} (may)
              <span class="chip-estado ${p.activo ? 'on' : 'off'}">${p.activo ? 'Activo' : 'Oculto'}</span>
              ${p.sinStock ? '<span class="chip-estado off" style="background:rgba(180,67,46,0.15);color:var(--alerta);">Sin stock</span>' : ""}
            </span>
          </div>
          <div class="acciones">
            <button type="button" data-editar-prod="${p.id}" aria-label="Editar" class="btn-icono">✏️</button>
            <button type="button" class="eliminar" data-eliminar-prod="${p.id}" aria-label="Eliminar" class="btn-icono">X</button>
          </div>
        </div>`;
    });
    html += `</div>`;
  });

  cont.innerHTML = html;

  cont.querySelectorAll("[data-editar-prod]").forEach(btn => {
    btn.addEventListener("click", () => abrirFormProducto(btn.getAttribute("data-editar-prod")));
  });
  cont.querySelectorAll("[data-eliminar-prod]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-eliminar-prod");
      if (confirm("Eliminar este producto?")){
        updateProductos(list => list.filter(p => p.id !== id));
        renderProductosAdmin();
        mostrarToast("Producto eliminado");
      }
    });
  });

  document.getElementById("btn-nuevo-producto").onclick = () => abrirFormProducto(null);
}

function abrirFormProducto(id){
  editandoProductoId = id;
  const productos = getProductos();
  const p = id ? productos.find(x => x.id === id) : null;

  const cont = document.getElementById("form-producto-cont");
  cont.classList.remove("oculto");
  cont.innerHTML = `
    <div class="form-panel">
      <h3>${p ? "Editar producto" : "Nuevo producto"}</h3>
      <form id="form-producto">
        <div class="form-field">
          <label for="pf-nombre">Nombre</label>
          <input type="text" id="pf-nombre" required value="${p ? escapeHtml(p.nombre) : ''}">
        </div>
        <div class="form-field">
          <label for="pf-categoria">Categoria</label>
          <select id="pf-categoria">
            ${CATEGORIAS.map(c => `<option value="${c.id}" ${p && p.categoria === c.id ? 'selected' : ''}>${c.nombre}</option>`).join("")}
          </select>
        </div>
        <div class="form-field">
          <label for="pf-desc">Descripcion corta</label>
          <textarea id="pf-desc">${p ? escapeHtml(p.descripcion) : ''}</textarea>
        </div>
        <div class="form-grid dos-col">
          <div class="form-field">
            <label for="pf-unidad">Se vende por</label>
            <select id="pf-unidad">
              <option value="unidad" ${p && p.unidad === 'unidad' ? 'selected' : ''}>Unidad</option>
              <option value="gramos" ${p && p.unidad === 'gramos' ? 'selected' : ''}>Gramos</option>
              <option value="kilogramos" ${p && p.unidad === 'kilogramos' ? 'selected' : ''}>Kilogramos</option>
            </select>
          </div>
          <div class="form-field">
            <label for="pf-cantidad">Cantidad (peso/medida)</label>
            <input type="number" id="pf-cantidad" step="0.01" min="0" value="${p ? p.cantidad : 1}">
          </div>
        </div>
        <div class="form-grid dos-col">
          <div class="form-field">
            <label for="pf-precio-min">Precio minorista</label>
            <input type="number" id="pf-precio-min" min="0" required value="${p ? p.precioMinorista : ''}">
          </div>
          <div class="form-field">
            <label for="pf-precio-may">Precio mayorista</label>
            <input type="number" id="pf-precio-may" min="0" required value="${p ? p.precioMayorista : ''}">
          </div>
        </div>
        <div class="form-field">
          <label>Imagenes del producto (2 a 3 recomendadas, se suben como base64)</label>
          <div id="pf-imagenes-cont" class="img-upload-grid">
            ${[0,1,2].map(i => `
              <div class="img-upload-item">
                ${p && p.imagenes && p.imagenes[i] ? `<img src="${p.imagenes[i]}" class="img-upload-preview" data-idx="${i}">` : `<div class="img-upload-placeholder" data-idx="${i}">Imagen ${i+1}</div>`}
                <input type="file" accept="image/*" data-idx="${i}" class="img-upload-input">
                ${p && p.imagenes && p.imagenes[i] ? `<button type="button" class="btn-img-remove" data-idx="${i}">Quitar</button>` : ""}
              </div>
            `).join("")}
          </div>
        </div>
        <div class="checkbox-field">
          <input type="checkbox" id="pf-activo" ${!p || p.activo ? 'checked' : ''}>
          <label for="pf-activo">Producto visible en la tienda</label>
        </div>
        <div class="checkbox-field">
          <input type="checkbox" id="pf-sin-stock" ${p && p.sinStock ? 'checked' : ''}>
          <label for="pf-sin-stock">Sin stock (se muestra en gris con etiqueta)</label>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-dorado">Guardar</button>
          <button type="button" class="btn btn-outline" id="btn-cancelar-producto">Cancelar</button>
        </div>
      </form>
    </div>
  `;
  cont.scrollIntoView({ behavior: "smooth", block: "center" });

  cont.querySelectorAll(".img-upload-input").forEach(input => {
    input.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      leerImgBase64(file, (b64) => {
        const idx = input.getAttribute("data-idx");
        const placeholder = cont.querySelector(`.img-upload-placeholder[data-idx="${idx}"]`);
        const existing = cont.querySelector(`.img-upload-preview[data-idx="${idx}"]`);
        const parent = input.closest(".img-upload-item");
        if (existing) existing.src = b64;
        else if (placeholder) {
          placeholder.outerHTML = `<img src="${b64}" class="img-upload-preview" data-idx="${idx}">`;
          const removeBtn = document.createElement("button");
          removeBtn.type = "button";
          removeBtn.className = "btn-img-remove";
          removeBtn.textContent = "Quitar";
          removeBtn.dataset.idx = idx;
          parent.appendChild(removeBtn);
          removeBtn.addEventListener("click", () => quitarImgPreview(idx));
        }
        guardarImagenProducto(idx, b64);
      });
    });
  });

  cont.querySelectorAll(".btn-img-remove").forEach(btn => {
    btn.addEventListener("click", () => quitarImgPreview(btn.getAttribute("data-idx")));
  });

  document.getElementById("btn-cancelar-producto").addEventListener("click", cerrarFormProducto);
  document.getElementById("form-producto").addEventListener("submit", (e) => {
    e.preventDefault();
    guardarProducto();
  });
}

const _imgCache = {};

function guardarImagenProducto(idx, b64){
  _imgCache[idx] = b64;
}

function quitarImgPreview(idx){
  delete _imgCache[idx];
  const item = document.querySelector(`.img-upload-item [data-idx="${idx}"]`)?.closest(".img-upload-item");
  if (item) {
    item.querySelector(".img-upload-preview")?.remove();
    item.querySelector(".btn-img-remove")?.remove();
    const placeholder = document.createElement("div");
    placeholder.className = "img-upload-placeholder";
    placeholder.dataset.idx = idx;
    placeholder.textContent = `Imagen ${parseInt(idx)+1}`;
    item.insertBefore(placeholder, item.querySelector(".img-upload-input"));
  }
}

function cerrarFormProducto(){
  editandoProductoId = null;
  const cont = document.getElementById("form-producto-cont");
  cont.classList.add("oculto");
  cont.innerHTML = "";
}

function guardarProducto(){
  const imagenes = [_imgCache[0], _imgCache[1], _imgCache[2]].filter(Boolean);

  const datos = {
    nombre: document.getElementById("pf-nombre").value.trim(),
    categoria: document.getElementById("pf-categoria").value,
    descripcion: document.getElementById("pf-desc").value.trim(),
    unidad: document.getElementById("pf-unidad").value,
    cantidad: parseFloat(document.getElementById("pf-cantidad").value) || 1,
    precioMinorista: parseInt(document.getElementById("pf-precio-min").value) || 0,
    precioMayorista: parseInt(document.getElementById("pf-precio-may").value) || 0,
    imagenes: imagenes,
    activo: document.getElementById("pf-activo").checked,
    sinStock: document.getElementById("pf-sin-stock").checked,
  };

  updateProductos(list => {
    if (editandoProductoId){
      const existing = list.find(p => p.id === editandoProductoId);
      if (existing) {
        const imgs = imagenes.length > 0 ? imagenes : existing.imagenes || [];
        return list.map(p => p.id === editandoProductoId ? { ...p, ...datos, imagenes: imgs } : p);
      }
    }
    const nuevoId = "p" + Date.now().toString().slice(-8);
    return [...list, { id: nuevoId, ...datos }];
  });

  Object.keys(_imgCache).forEach(k => delete _imgCache[k]);
  cerrarFormProducto();
  renderProductosAdmin();
  mostrarToast("Producto guardado");
}

/* =========================================================================
   BANNERS
   ========================================================================= */

function renderBannersAdmin(){
  const cont = document.getElementById("lista-banners");
  const banners = getBanners().sort((a,b) => a.orden - b.orden);

  if (banners.length === 0){
    cont.innerHTML = '<div class="vacio-admin">Todavia no hay banners cargados.</div>';
    return;
  }

  cont.innerHTML = banners.map(b => {
    const tipo = b.tipo || "texto";
    return `
      <div class="fila-admin ${b.activo ? '' : 'inactivo'}">
        <div class="admin-thumb-wrap">${tipo === "imagen" && b.imagen ? `<img src="${b.imagen}" class="admin-thumb">` : tipo === "video" && b.video ? '<span class="admin-thumb video-icon">V</span>' : '<span class="admin-thumb text-icon">T</span>'}</div>
        <div class="datos">
          <h4>${escapeHtml(b.titulo)}</h4>
          <span>Orden ${b.orden} · tipo: ${tipo}
            <span class="chip-estado ${b.activo ? 'on' : 'off'}">${b.activo ? 'Activo' : 'Oculto'}</span>
          </span>
        </div>
        <div class="acciones">
          <button type="button" data-editar-banner="${b.id}" aria-label="Editar" class="btn-icono">✏️</button>
          <button type="button" class="eliminar" data-eliminar-banner="${b.id}" aria-label="Eliminar" class="btn-icono">X</button>
        </div>
      </div>`;
  }).join("");

  cont.querySelectorAll("[data-editar-banner]").forEach(btn => {
    btn.addEventListener("click", () => abrirFormBanner(btn.getAttribute("data-editar-banner")));
  });
  cont.querySelectorAll("[data-eliminar-banner]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-eliminar-banner");
      if (confirm("Eliminar este banner?")){
        updateBanners(list => list.filter(b => b.id !== id));
        renderBannersAdmin();
        mostrarToast("Banner eliminado");
      }
    });
  });

  document.getElementById("btn-nuevo-banner").onclick = () => abrirFormBanner(null);
}

function abrirFormBanner(id){
  editandoBannerId = id;
  const banners = getBanners();
  const b = id ? banners.find(x => x.id === id) : null;

  const cont = document.getElementById("form-banner-cont");
  cont.classList.remove("oculto");
  cont.innerHTML = `
    <div class="form-panel">
      <h3>${b ? "Editar banner" : "Nuevo banner"}</h3>
      <form id="form-banner">
        <div class="form-field">
          <label for="bf-titulo">Titulo</label>
          <input type="text" id="bf-titulo" required value="${b ? escapeHtml(b.titulo) : ''}">
        </div>
        <div class="form-field">
          <label for="bf-subtitulo">Subtitulo</label>
          <input type="text" id="bf-subtitulo" value="${b ? escapeHtml(b.subtitulo) : ''}">
        </div>
        <div class="form-field">
          <label for="bf-tipo">Tipo de banner</label>
          <select id="bf-tipo">
            <option value="texto" ${(!b || b.tipo === "texto") ? 'selected' : ''}>Texto (color solido)</option>
            <option value="imagen" ${b && b.tipo === "imagen" ? 'selected' : ''}>Imagen</option>
            <option value="video" ${b && b.tipo === "video" ? 'selected' : ''}>Video</option>
          </select>
        </div>
        <div class="form-field" id="bf-color-field">
          <label for="bf-color">Color de fondo (modo texto)</label>
          <select id="bf-color">
            <option value="cuero" ${b && b.color === "cuero" ? 'selected' : ''}>Cuero (marron)</option>
            <option value="noche" ${b && b.color === "noche" ? 'selected' : ''}>Noche (verde/negro)</option>
            <option value="dorado" ${b && b.color === "dorado" ? 'selected' : ''}>Dorado</option>
          </select>
        </div>
        <div class="form-field" id="bf-imagen-field">
          <label>Imagen del banner</label>
          ${b && b.imagen ? `<div class="img-upload-item"><img src="${b.imagen}" class="img-upload-preview"><button type="button" class="btn-img-remove" id="btn-remove-banner-img">Quitar imagen</button></div>` : ""}
          <input type="file" accept="image/*" id="bf-imagen-input">
        </div>
        <div class="form-field" id="bf-video-field">
          <label for="bf-video-url">URL del video (MP4, WebM)</label>
          <input type="url" id="bf-video-url" value="${b && b.video ? escapeHtml(b.video) : ''}" placeholder="https://ejemplo.com/video.mp4">
        </div>
        <div class="form-grid dos-col">
          <div class="form-field">
            <label for="bf-categoria">Destino al hacer click</label>
            <select id="bf-categoria">
              ${CATEGORIAS.map(c => `<option value="${c.id}" ${b && b.categoria === c.id ? 'selected' : ''}>${c.nombre}</option>`).join("")}
              <option value="mayorista" ${b && b.categoria === 'mayorista' ? 'selected' : ''}>Registro mayorista</option>
            </select>
          </div>
          <div class="form-field">
            <label for="bf-orden">Orden</label>
            <input type="number" id="bf-orden" min="1" value="${b ? b.orden : (getBanners().length + 1)}">
          </div>
        </div>
        <div class="checkbox-field">
          <input type="checkbox" id="bf-activo" ${!b || b.activo ? 'checked' : ''}>
          <label for="bf-activo">Banner visible</label>
        </div>
        <div class="form-actions" style="margin-top:16px;">
          <button type="submit" class="btn btn-dorado">Guardar</button>
          <button type="button" class="btn btn-outline" id="btn-cancelar-banner">Cancelar</button>
        </div>
      </form>
    </div>
  `;
  cont.scrollIntoView({ behavior: "smooth", block: "center" });

  const tipoSelect = document.getElementById("bf-tipo");
  const colorField = document.getElementById("bf-color-field");
  const imagenField = document.getElementById("bf-imagen-field");
  const videoField = document.getElementById("bf-video-field");

  function toggleTipoCampos(){
    const tipo = tipoSelect.value;
    colorField.style.display = tipo === "texto" ? "block" : "none";
    imagenField.style.display = tipo === "imagen" ? "block" : "none";
    videoField.style.display = tipo === "video" ? "block" : "none";
  }
  tipoSelect.addEventListener("change", toggleTipoCampos);
  toggleTipoCampos();

  let bannerImgB64 = b && b.imagen ? b.imagen : "";
  document.getElementById("bf-imagen-input")?.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    leerImgBase64(file, (b64) => { bannerImgB64 = b64; });
  });
  document.getElementById("btn-remove-banner-img")?.addEventListener("click", () => {
    bannerImgB64 = "";
    const parent = document.querySelector("#bf-imagen-field .img-upload-item");
    if (parent) parent.remove();
  });

  document.getElementById("btn-cancelar-banner").addEventListener("click", cerrarFormBanner);
  document.getElementById("form-banner").addEventListener("submit", (e) => {
    e.preventDefault();
    guardarBanner(bannerImgB64);
  });
}

function cerrarFormBanner(){
  editandoBannerId = null;
  const cont = document.getElementById("form-banner-cont");
  cont.classList.add("oculto");
  cont.innerHTML = "";
}

function guardarBanner(bannerImgB64){
  const datos = {
    titulo: document.getElementById("bf-titulo").value.trim(),
    subtitulo: document.getElementById("bf-subtitulo").value.trim(),
    tipo: document.getElementById("bf-tipo").value,
    color: document.getElementById("bf-color").value,
    imagen: document.getElementById("bf-tipo").value === "imagen" ? bannerImgB64 : "",
    video: document.getElementById("bf-tipo").value === "video" ? document.getElementById("bf-video-url").value.trim() : "",
    categoria: document.getElementById("bf-categoria").value,
    orden: parseInt(document.getElementById("bf-orden").value) || 1,
    activo: document.getElementById("bf-activo").checked,
  };

  updateBanners(list => {
    if (editandoBannerId){
      return list.map(b => b.id === editandoBannerId ? { ...b, ...datos } : b);
    }
    const nuevoId = "b" + Date.now().toString().slice(-8);
    return [...list, { id: nuevoId, ...datos }];
  });

  cerrarFormBanner();
  renderBannersAdmin();
  mostrarToast("Banner guardado");
}

/* =========================================================================
   AJUSTES
   ========================================================================= */

function renderAjustesForm(){
  const s = getSettings();
  const cont = document.getElementById("panel-ajustes");
  cont.innerHTML = `
    <div class="form-panel">
      <h3>Datos del negocio</h3>
      <form id="form-ajustes">
        <div class="form-field">
          <label for="aj-nombre">Nombre del negocio</label>
          <input type="text" id="aj-nombre" value="${escapeHtml(s.nombreNegocio)}">
        </div>
        <div class="form-field">
          <label for="aj-eslogan">Eslogan</label>
          <input type="text" id="aj-eslogan" value="${escapeHtml(s.eslogan)}">
        </div>
        <div class="form-field">
          <label for="aj-whatsapp">Numero de WhatsApp (con codigo de pais, sin + ni espacios)</label>
          <input type="text" id="aj-whatsapp" placeholder="Ej: 5493794123456" value="${escapeHtml(s.whatsappNumero)}">
        </div>
        <div class="form-field">
          <label for="aj-instagram">Link de Instagram</label>
          <input type="url" id="aj-instagram" value="${escapeHtml(s.instagram)}">
        </div>
        <div class="form-field">
          <label for="aj-email">Email de contacto</label>
          <input type="email" id="aj-email" value="${escapeHtml(s.email)}">
        </div>
        <div class="form-field">
          <label for="aj-ubicacion">Ubicacion</label>
          <input type="text" id="aj-ubicacion" value="${escapeHtml(s.ubicacion)}">
        </div>
        <div class="form-field">
          <label for="aj-habilitacion">Habilitacion municipal (texto legal en el pie)</label>
          <input type="text" id="aj-habilitacion" value="${escapeHtml(s.habilitacion)}">
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-dorado">Guardar ajustes</button>
        </div>
      </form>
    </div>
    <div class="form-panel" style="margin-top:20px;">
      <h3>Portada</h3>
      <p style="font-size:0.8rem;color:#8a7a63;margin-bottom:14px;">Configura el encabezado principal del sitio. Puede mostrar el contenido actual o un banner con imagen/video.</p>
      <form id="form-hero">
        <div class="form-field">
          <label for="aj-hero-tipo">Tipo de hero</label>
          <select id="aj-hero-tipo">
            <option value="texto" ${s.heroTipo === "texto" ? "selected" : ""}>Texto + logo (como esta actualmente)</option>
            <option value="imagen" ${s.heroTipo === "imagen" ? "selected" : ""}>Imagen de fondo</option>
            <option value="video" ${s.heroTipo === "video" ? "selected" : ""}>Video de fondo</option>
          </select>
        </div>
        <div class="form-field" id="aj-hero-imagen-field" style="display:${s.heroTipo === "imagen" ? "block" : "none"};">
          <label>Imagen de fondo del hero</label>
          ${s.heroImagen ? `<div class="img-upload-item"><img src="${s.heroImagen}" class="img-upload-preview" style="max-height:150px;"><button type="button" class="btn-img-remove" id="btn-remove-hero-img">Quitar</button></div>` : ""}
          <input type="file" accept="image/*" id="aj-hero-imagen-input">
        </div>
        <div class="form-field" id="aj-hero-video-field" style="display:${s.heroTipo === "video" ? "block" : "none"};">
          <label for="aj-hero-video-url">URL del video (MP4, WebM)</label>
          <input type="url" id="aj-hero-video-url" value="${escapeHtml(s.heroVideo || "")}" placeholder="https://ejemplo.com/video.mp4">
        </div>
        <div class="form-field">
          <label for="aj-hero-subtitulo">Subtitulo</label>
          <input type="text" id="aj-hero-subtitulo" value="${escapeHtml(s.heroSubtitulo || "Esteros del Ibera · Corrientes")}">
        </div>
        <div class="checkbox-field">
          <input type="checkbox" id="aj-hero-overlay" ${s.heroOverlay !== false ? "checked" : ""}>
          <label for="aj-hero-overlay">Mostrar logo + textos sobre la imagen/video</label>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-dorado">Guardar portada</button>
        </div>
      </form>
    </div>
    <div class="form-panel" style="margin-top:20px;">
      <h3>Productos destacados (galeria principal)</h3>
      <p style="font-size:0.8rem;color:#8a7a63;margin-bottom:14px;">Selecciona los 3 productos que apareceran en la galeria de la portada.</p>
      <form id="form-destacados">
        ${[0,1,2].map(i => {
          const currentId = (s.productosDestacados || [])[i] || "";
          return '<div class="form-field"><label for="aj-dest-' + i + '">Producto destacado ' + (i+1) + '</label>' +
            '<select id="aj-dest-' + i + '">' +
            '<option value="">Seleccionar...</option>' +
            getProductos().filter(p => p.activo).map(p =>
              '<option value="' + p.id + '" ' + (p.id === currentId ? "selected" : "") + '>' + escapeHtml(p.nombre) + '</option>'
            ).join("") +
            '</select></div>';
        }).join("")}
        <div class="form-actions">
          <button type="submit" class="btn btn-dorado">Guardar destacados</button>
        </div>
      </form>
    </div>
    <div class="form-panel" style="margin-top:20px;">
      <h3>Logos de la marca</h3>
      <p style="font-size:0.8rem;color:#8a7a63;margin-bottom:14px;">Subi aca los archivos SVG o PNG para cada variante del logo. Se almacenan en el navegador.</p>
      <form id="form-logos">
        <div class="form-field">
          <label>Isotipo (icono cuadrado, ej: 100x100px)</label>
          ${s.isotipo ? `<div class="img-upload-item"><img src="${s.isotipo}" class="img-upload-preview" style="max-width:80px;"><button type="button" class="btn-img-remove" id="btn-remove-isotipo">Quitar</button></div>` : ""}
          <input type="file" accept="image/*" id="aj-isotipo-input">
        </div>
        <div class="form-field">
          <label>Logotipo (texto de la marca, ej: 320x80px)</label>
          ${s.logotipo ? `<div class="img-upload-item"><img src="${s.logotipo}" class="img-upload-preview" style="max-width:160px;"><button type="button" class="btn-img-remove" id="btn-remove-logotipo">Quitar</button></div>` : ""}
          <input type="file" accept="image/*" id="aj-logotipo-input">
        </div>
        <div class="form-field">
          <label>Isologo (isotipo + logotipo juntos, ej: 400x100px)</label>
          ${s.isologo ? `<div class="img-upload-item"><img src="${s.isologo}" class="img-upload-preview" style="max-width:200px;"><button type="button" class="btn-img-remove" id="btn-remove-isologo">Quitar</button></div>` : ""}
          <input type="file" accept="image/*" id="aj-isologo-input">
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-dorado">Guardar logos</button>
        </div>
      </form>
    </div>
  `;

  document.getElementById("form-ajustes").addEventListener("submit", (e) => {
    e.preventDefault();
    const nuevo = {
      ...getSettings(),
      nombreNegocio: document.getElementById("aj-nombre").value.trim(),
      eslogan: document.getElementById("aj-eslogan").value.trim(),
      whatsappNumero: document.getElementById("aj-whatsapp").value.trim(),
      instagram: document.getElementById("aj-instagram").value.trim(),
      email: document.getElementById("aj-email").value.trim(),
      ubicacion: document.getElementById("aj-ubicacion").value.trim(),
      habilitacion: document.getElementById("aj-habilitacion").value.trim(),
    };
    saveSettings(nuevo);
    mostrarToast("Ajustes guardados");
  });

  let isotipoB64 = s.isotipo || "";
  let logotipoB64 = s.logotipo || "";
  let isologoB64 = s.isologo || "";

  document.getElementById("aj-isotipo-input")?.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    leerImgBase64(file, (b64) => { isotipoB64 = b64; });
  });
  document.getElementById("aj-logotipo-input")?.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    leerImgBase64(file, (b64) => { logotipoB64 = b64; });
  });
  document.getElementById("aj-isologo-input")?.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    leerImgBase64(file, (b64) => { isologoB64 = b64; });
  });

  document.getElementById("btn-remove-isotipo")?.addEventListener("click", () => {
    isotipoB64 = "";
    const parent = document.querySelector("#aj-isotipo-input")?.closest(".form-field")?.querySelector(".img-upload-item");
    if (parent) parent.remove();
  });
  document.getElementById("btn-remove-logotipo")?.addEventListener("click", () => {
    logotipoB64 = "";
    const parent = document.querySelector("#aj-logotipo-input")?.closest(".form-field")?.querySelector(".img-upload-item");
    if (parent) parent.remove();
  });
  document.getElementById("btn-remove-isologo")?.addEventListener("click", () => {
    isologoB64 = "";
    const parent = document.querySelector("#aj-isologo-input")?.closest(".form-field")?.querySelector(".img-upload-item");
    if (parent) parent.remove();
  });

  document.getElementById("form-logos")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const current = getSettings();
    current.isotipo = isotipoB64 || current.isotipo;
    current.logotipo = logotipoB64 || current.logotipo;
    current.isologo = isologoB64 || current.isologo;
    saveSettings(current);
    mostrarToast("Logos guardados");
  });

  /* ---------- Hero form ---------- */
  const heroTipoSelect = document.getElementById("aj-hero-tipo");
  const heroImagenField = document.getElementById("aj-hero-imagen-field");
  const heroVideoField = document.getElementById("aj-hero-video-field");

  if (heroTipoSelect) {
    heroTipoSelect.addEventListener("change", () => {
      const val = heroTipoSelect.value;
      heroImagenField.style.display = val === "imagen" ? "block" : "none";
      heroVideoField.style.display = val === "video" ? "block" : "none";
    });
  }

  let heroImgB64 = s.heroImagen || "";
  document.getElementById("aj-hero-imagen-input")?.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    leerImgBase64(file, (b64) => { heroImgB64 = b64; });
  });
  document.getElementById("btn-remove-hero-img")?.addEventListener("click", () => {
    heroImgB64 = "";
    const parent = document.querySelector("#aj-hero-imagen-field .img-upload-item");
    if (parent) parent.remove();
  });

  document.getElementById("form-destacados")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const ids = [0,1,2].map(i => document.getElementById("aj-dest-" + i)?.value).filter(Boolean);
    const current = getSettings();
    current.productosDestacados = ids;
    saveSettings(current);
    mostrarToast("Destacados guardados");
  });

  document.getElementById("form-hero")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const current = getSettings();
    current.heroTipo = document.getElementById("aj-hero-tipo").value;
    current.heroImagen = heroImgB64 || current.heroImagen;
    current.heroVideo = document.getElementById("aj-hero-video-url").value.trim();
    current.heroOverlay = document.getElementById("aj-hero-overlay").checked;
    current.heroSubtitulo = document.getElementById("aj-hero-subtitulo").value.trim();
    saveSettings(current);
    mostrarToast("Portada guardada");
  });
}

/* =========================================================================
   PRESUPUESTOS / PDF
   ========================================================================= */

const PRESUP_KEY = "donanselmo_presupuestos";

function getPresupuestos(){
  try {
    const raw = localStorage.getItem(PRESUP_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch(e){ return []; }
}

function savePresupuestos(list){
  localStorage.setItem(PRESUP_KEY, JSON.stringify(list));
}

function renderPresupuestosAdmin(){
  const cont = document.getElementById("lista-presupuestos");
  const list = getPresupuestos();
  if (list.length === 0){
    cont.innerHTML = '<div class="vacio-admin">No hay presupuestos todavia. Crea uno nuevo.</div>';
  } else {
    cont.innerHTML = list.map((pr, i) => `
      <div class="presupuesto-item">
        <div class="pres-header">
          <div>
            <h4>Presupuesto #${i+1}</h4>
            <span>${pr.fecha} · ${pr.cliente}</span>
          </div>
          <div class="pres-acciones">
            <button type="button" data-ver-pres="${i}">Ver</button>
            <button type="button" data-pdf-pres="${i}">PDF</button>
            <button type="button" class="eliminar" data-eliminar-pres="${i}" style="background:rgba(180,67,46,0.12);color:var(--alerta);">X</button>
          </div>
        </div>
      </div>
    `).join("");

    cont.querySelectorAll("[data-ver-pres]").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.getAttribute("data-ver-pres"));
        mostrarPresupuesto(idx);
      });
    });
    cont.querySelectorAll("[data-pdf-pres]").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.getAttribute("data-pdf-pres"));
        generarPDFPresupuesto(idx);
      });
    });
    cont.querySelectorAll("[data-eliminar-pres]").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.getAttribute("data-eliminar-pres"));
        if (confirm("Eliminar este presupuesto?")){
          const list = getPresupuestos();
          list.splice(idx, 1);
          savePresupuestos(list);
          renderPresupuestosAdmin();
          mostrarToast("Presupuesto eliminado");
        }
      });
    });
  }
  document.getElementById("btn-nuevo-presupuesto").onclick = abrirFormPresupuesto;
}

function abrirFormPresupuesto(){
  const productos = getProductos().filter(p => p.activo);
  const cont = document.getElementById("form-presupuesto-cont");
  cont.classList.remove("oculto");
  cont.innerHTML = `
    <div class="form-panel">
      <h3>Nuevo presupuesto</h3>
      <form id="form-presupuesto">
        <div class="form-field">
          <label for="pres-cliente">Cliente / Empresa</label>
          <input type="text" id="pres-cliente" required placeholder="Nombre del cliente">
        </div>
        <div class="form-field">
          <label for="pres-validez">Validez del presupuesto</label>
          <input type="text" id="pres-validez" value="7 dias">
        </div>
        <div class="form-field">
          <label for="pres-notas">Notas / observaciones</label>
          <textarea id="pres-notas" placeholder="Condiciones de pago, observaciones, etc."></textarea>
        </div>
        <div class="form-field">
          <label>Productos</label>
          <div id="pres-productos-list">
            <div class="pres-producto-row">
              <select class="pres-prod-select" style="flex:1;">
                <option value="">Seleccionar producto...</option>
                ${productos.map(p => `<option value="${p.id}" data-precio="${p.precioMinorista}">${escapeHtml(p.nombre)} - ${formatearMoneda(p.precioMinorista)}</option>`).join("")}
              </select>
              <input type="number" class="pres-prod-cant" value="1" min="1" style="width:50px;">
              <button type="button" class="btn-icono pres-remove-row" style="background:rgba(180,67,46,0.12);color:var(--alerta);">-</button>
            </div>
          </div>
          <button type="button" class="btn btn-outline" id="btn-add-producto-row" style="margin-top:6px;font-size:0.75rem;">+ Agregar producto</button>
        </div>
        <div class="form-actions" style="margin-top:16px;">
          <button type="submit" class="btn btn-dorado">Generar presupuesto</button>
          <button type="button" class="btn btn-outline" id="btn-cancelar-presupuesto">Cancelar</button>
        </div>
      </form>
    </div>
  `;
  cont.scrollIntoView({ behavior: "smooth", block: "center" });

  document.getElementById("btn-add-producto-row").addEventListener("click", () => {
    const list = document.getElementById("pres-productos-list");
    const row = document.createElement("div");
    row.className = "pres-producto-row";
    row.innerHTML = `
      <select class="pres-prod-select" style="flex:1;">
        <option value="">Seleccionar producto...</option>
        ${productos.map(p => `<option value="${p.id}" data-precio="${p.precioMinorista}">${escapeHtml(p.nombre)} - ${formatearMoneda(p.precioMinorista)}</option>`).join("")}
      </select>
      <input type="number" class="pres-prod-cant" value="1" min="1" style="width:50px;">
      <button type="button" class="btn-icono pres-remove-row" style="background:rgba(180,67,46,0.12);color:var(--alerta);">-</button>
    `;
    list.appendChild(row);
    row.querySelector(".pres-remove-row").addEventListener("click", () => row.remove());
  });

  document.querySelectorAll(".pres-remove-row").forEach(btn => {
    btn.addEventListener("click", () => btn.closest(".pres-producto-row").remove());
  });

  document.getElementById("btn-cancelar-presupuesto").addEventListener("click", () => {
    cont.classList.add("oculto");
  });

  document.getElementById("form-presupuesto").addEventListener("submit", (e) => {
    e.preventDefault();
    const cliente = document.getElementById("pres-cliente").value.trim();
    const validez = document.getElementById("pres-validez").value.trim();
    const notas = document.getElementById("pres-notas").value.trim();
    const rows = document.querySelectorAll("#pres-productos-list .pres-producto-row");
    const items = [];
    rows.forEach(row => {
      const sel = row.querySelector(".pres-prod-select");
      const cant = parseInt(row.querySelector(".pres-prod-cant").value) || 1;
      if (sel.value) {
        const prod = productos.find(p => p.id === sel.value);
        if (prod) items.push({ id: prod.id, nombre: prod.nombre, precio: prod.precioMinorista, cantidad: cant, subtotal: prod.precioMinorista * cant });
      }
    });
    if (items.length === 0) { mostrarToast("Agrega al menos un producto"); return; }
    const total = items.reduce((s, i) => s + i.subtotal, 0);
    const presupuesto = {
      id: "pres_" + Date.now(),
      fecha: new Date().toLocaleDateString("es-AR"),
      cliente, validez, notas, items, total,
    };
    const list = getPresupuestos();
    list.push(presupuesto);
    savePresupuestos(list);
    cont.classList.add("oculto");
    renderPresupuestosAdmin();
    mostrarToast("Presupuesto creado");
    generarPDFPresupuesto(list.length - 1);
  });
}

function mostrarPresupuesto(idx){
  const list = getPresupuestos();
  const pr = list[idx];
  if (!pr) return;
  const prodHtml = pr.items.map(i => `<tr><td style="padding:4px 8px;border-bottom:1px solid #ddd;">${escapeHtml(i.nombre)}</td><td style="padding:4px 8px;border-bottom:1px solid #ddd;text-align:center;">x${i.cantidad}</td><td style="padding:4px 8px;border-bottom:1px solid #ddd;text-align:right;">${formatearMoneda(i.precio)}</td><td style="padding:4px 8px;border-bottom:1px solid #ddd;text-align:right;">${formatearMoneda(i.subtotal)}</td></tr>`).join("");
  const html = `
    <div style="background:#fff;border-radius:var(--radius-lg);padding:24px;max-width:600px;margin:20px auto;">
      <div style="text-align:center;margin-bottom:20px;">
        <img src="assets/isologo.svg" style="height:50px;">
        <h2 style="font-family:var(--f-script);color:var(--dorado-claro);font-size:2rem;margin:8px 0;">Don Anselmo</h2>
        <p style="color:#8a7a63;font-size:0.85rem;">Presupuesto #${idx+1} · ${pr.fecha}</p>
      </div>
      <p><strong>Cliente:</strong> ${escapeHtml(pr.cliente)}</p>
      <p><strong>Validez:</strong> ${escapeHtml(pr.validez)}</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <thead><tr style="background:var(--crema-2);"><th style="padding:6px 8px;text-align:left;">Producto</th><th style="padding:6px 8px;">Cant</th><th style="padding:6px 8px;text-align:right;">Precio</th><th style="padding:6px 8px;text-align:right;">Subtotal</th></tr></thead>
        <tbody>${prodHtml}</tbody>
        <tfoot><tr><td colspan="3" style="padding:8px;text-align:right;font-weight:700;">Total</td><td style="padding:8px;text-align:right;font-weight:700;color:var(--marron);">${formatearMoneda(pr.total)}</td></tr></tfoot>
      </table>
      ${pr.notas ? `<p style="font-size:0.82rem;color:#6b5c48;"><strong>Notas:</strong> ${escapeHtml(pr.notas)}</p>` : ""}
      <div style="text-align:center;margin-top:20px;">
        <button class="btn btn-dorado" onclick="generarPDFPresupuesto(${idx})">Descargar PDF</button>
      </div>
    </div>
  `;
  const overlay = document.createElement("div");
  overlay.style.cssText = "position:fixed;inset:0;z-index:800;background:rgba(16,14,12,0.55);display:flex;align-items:center;justify-content:center;overflow-y:auto;padding:20px;";
  overlay.innerHTML = html;
  overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.remove(); });
  document.body.appendChild(overlay);
}

function generarPDFPresupuesto(idx){
  const list = getPresupuestos();
  const pr = list[idx];
  if (!pr) return;

  const iframe = document.createElement("iframe");
  iframe.style.display = "none";
  document.body.appendChild(iframe);

  const prodRows = pr.items.map(i => `
    <tr>
      <td style="padding:6px 10px;border-bottom:1px solid #ccc;">${escapeHtml(i.nombre)}</td>
      <td style="padding:6px 10px;border-bottom:1px solid #ccc;text-align:center;">${i.cantidad}</td>
      <td style="padding:6px 10px;border-bottom:1px solid #ccc;text-align:right;">${formatearMoneda(i.precio)}</td>
      <td style="padding:6px 10px;border-bottom:1px solid #ccc;text-align:right;">${formatearMoneda(i.subtotal)}</td>
    </tr>
  `).join("");

  const htmlContent = `
<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Presupuesto Don Anselmo</title>
<style>
  body{font-family:Arial,sans-serif;color:#211A12;margin:30px;font-size:13px;}
  h1{font-family:Georgia,serif;color:#C89B3C;font-size:22px;margin:0;text-align:center;}
  .header{text-align:center;margin-bottom:20px;border-bottom:2px solid #C89B3C;padding-bottom:14px;}
  .header p{color:#8a7a63;font-size:12px;margin:4px 0;}
  table{width:100%;border-collapse:collapse;margin:16px 0;}
  th{background:#F1E9DA;padding:8px 10px;text-align:left;font-size:12px;text-transform:uppercase;}
  td{padding:6px 10px;border-bottom:1px solid #e0d8c6;}
  .total-row td{font-weight:700;font-size:15px;color:#6B4423;border-top:2px solid #6B4423;}
  .footer{margin-top:24px;font-size:11px;color:#8a7a63;text-align:center;border-top:1px solid #e0d8c6;padding-top:14px;}
  .notas{margin-top:16px;padding:10px;background:#f9f6f0;border-radius:4px;}
</style>
</head>
<body>
  <div class="header">
    <h1>Don Anselmo</h1>
    <p>Charcuteria y conservas artesanales de los Esteros del Ibera</p>
    <p><strong>Presupuesto #${idx+1}</strong> · ${pr.fecha}</p>
  </div>
  <p><strong>Cliente:</strong> ${escapeHtml(pr.cliente)}</p>
  <p><strong>Validez:</strong> ${escapeHtml(pr.validez)}</p>
  <table>
    <thead><tr><th>Producto</th><th style="text-align:center;">Cant</th><th style="text-align:right;">Precio</th><th style="text-align:right;">Subtotal</th></tr></thead>
    <tbody>${prodRows}</tbody>
    <tr class="total-row"><td colspan="3" style="text-align:right;">TOTAL</td><td style="text-align:right;">${formatearMoneda(pr.total)}</td></tr>
  </table>
  ${pr.notas ? `<div class="notas"><strong>Notas:</strong><br>${escapeHtml(pr.notas)}</div>` : ""}
  <div class="footer">
    <p>${pr.cliente} · ${pr.fecha}</p>
  </div>
</body></html>`;

  iframe.srcdoc = htmlContent;
  iframe.onload = () => {
    setTimeout(() => {
      iframe.contentWindow.print();
      setTimeout(() => document.body.removeChild(iframe), 1000);
    }, 300);
  };
}

/* =========================================================================
   MAYORISTAS (aprobacion + historial de compras)
   ========================================================================= */

function renderMayoristasAdmin(){
  const cont = document.getElementById("contenido-mayoristas");
  if (!cont) return;

  const pendientes = getSolicitudesMayoristas();
  const aprobados = getMayoristasAprobados();

  let html = "";

  /* -- Pendientes -- */
  html += '<div class="form-panel"><h3>Solicitudes pendientes</h3>';
  if (pendientes.length === 0){
    html += '<p style="color:#8a7a63;font-size:0.85rem;">No hay solicitudes pendientes.</p>';
  } else {
    html += '<div style="margin-top:10px;">';
    pendientes.forEach(s => {
      html += `
        <div class="fila-admin" style="margin-bottom:8px;">
          <div class="datos">
            <h4>${escapeHtml(s.nombre)}</h4>
            <span>${escapeHtml(s.negocio) || "-"} · ${escapeHtml(s.whatsapp)} · ${new Date(s.fecha).toLocaleDateString("es-AR")}</span>
          </div>
          <div class="acciones" style="gap:4px;">
            <button type="button" class="btn btn-dorado" style="font-size:0.75rem;padding:4px 12px;" data-aprobar-m="${s.id}">Aprobar</button>
            <button type="button" class="btn btn-outline" style="font-size:0.75rem;padding:4px 12px;color:var(--alerta);border-color:var(--alerta);" data-rechazar-m="${s.id}">Rechazar</button>
          </div>
        </div>`;
    });
    html += '</div>';
  }
  html += '</div>';

  /* -- Aprobados -- */
  html += '<div class="form-panel" style="margin-top:20px;"><h3>Mayoristas aprobados</h3>';
  if (aprobados.length === 0){
    html += '<p style="color:#8a7a63;font-size:0.85rem;">Todavia no hay mayoristas aprobados.</p>';
  } else {
    aprobados.forEach((m, i) => {
      const compras = m.compras || [];
      const totalGastado = compras.reduce((s, c) => s + c.total, 0);
      html += `
        <div class="fila-admin" style="margin-bottom:6px;">
          <div class="datos">
            <h4>${escapeHtml(m.nombre)}</h4>
            <span>${escapeHtml(m.negocio) || "-"} · ${escapeHtml(m.whatsapp)} · ${new Date(m.fecha).toLocaleDateString("es-AR")}</span>
            <span style="display:block;font-size:0.8rem;color:var(--marron);">${compras.length} compra(s) · Total: ${formatearMoneda(totalGastado)}</span>
          </div>
          <div class="acciones" style="gap:4px;">
            <button type="button" class="btn btn-outline" style="font-size:0.75rem;padding:4px 10px;" data-ver-compras="${i}">Compras</button>
          </div>
        </div>`;
    });
  }
  html += '</div>';

  cont.innerHTML = html;

  cont.querySelectorAll("[data-aprobar-m]").forEach(btn => {
    btn.addEventListener("click", () => {
      aprobarMayorista(btn.getAttribute("data-aprobar-m"));
      renderMayoristasAdmin();
      mostrarToast("Mayorista aprobado");
    });
  });
  cont.querySelectorAll("[data-rechazar-m]").forEach(btn => {
    btn.addEventListener("click", () => {
      if (confirm("Rechazar esta solicitud?")){
        rechazarMayorista(btn.getAttribute("data-rechazar-m"));
        renderMayoristasAdmin();
        mostrarToast("Solicitud rechazada");
      }
    });
  });
  cont.querySelectorAll("[data-ver-compras]").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.getAttribute("data-ver-compras"));
      mostrarComprasMayorista(idx);
    });
  });
}

function mostrarComprasMayorista(idx){
  const aprobados = getMayoristasAprobados();
  const m = aprobados[idx];
  if (!m) return;
  const compras = m.compras || [];
  let html = `
    <div style="background:#fff;border-radius:var(--radius-lg);padding:24px;max-width:600px;margin:20px auto;">
      <h3 style="margin-bottom:4px;">${escapeHtml(m.nombre)}</h3>
      <p style="color:#8a7a63;font-size:0.85rem;margin-bottom:14px;">${escapeHtml(m.negocio) || "-"} · ${escapeHtml(m.whatsapp)}</p>`;
  if (compras.length === 0){
    html += '<p style="color:#8a7a63;">No realizo compras todavia.</p>';
  } else {
    compras.forEach((c, ci) => {
      const itemsHtml = c.items.map(it => `
        <tr>
          <td style="padding:3px 6px;border-bottom:1px solid #eee;font-size:0.8rem;">${escapeHtml(it.producto?.nombre || it.nombre || "-")}</td>
          <td style="padding:3px 6px;border-bottom:1px solid #eee;text-align:center;font-size:0.8rem;">x${it.cantidad || 1}</td>
          <td style="padding:3px 6px;border-bottom:1px solid #eee;text-align:right;font-size:0.8rem;">${formatearMoneda(it.subtotal || it.precio || 0)}</td>
        </tr>`).join("");
      html += `
        <div style="margin-bottom:12px;padding:10px;background:#f9f6f0;border-radius:6px;">
          <strong style="font-size:0.85rem;">Compra #${ci+1}</strong> <span style="font-size:0.8rem;color:#8a7a63;">· ${c.fecha} · Total: ${formatearMoneda(c.total)}</span>
          <table style="width:100%;border-collapse:collapse;margin-top:6px;">
            <thead><tr><th style="padding:3px 6px;text-align:left;font-size:0.75rem;">Producto</th><th style="padding:3px 6px;font-size:0.75rem;">Cant</th><th style="padding:3px 6px;text-align:right;font-size:0.75rem;">Subtotal</th></tr></thead>
            <tbody>${itemsHtml}</tbody>
          </table>
        </div>`;
    });
  }
  html += `
    <div style="text-align:center;margin-top:10px;">
      <button class="btn btn-outline" id="btn-cerrar-compras">Cerrar</button>
    </div>
    </div>`;
  const overlay = document.createElement("div");
  overlay.style.cssText = "position:fixed;inset:0;z-index:800;background:rgba(16,14,12,0.55);display:flex;align-items:center;justify-content:center;overflow-y:auto;padding:20px;";
  overlay.innerHTML = html;
  overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.remove(); });
  overlay.querySelector("#btn-cerrar-compras")?.addEventListener("click", () => overlay.remove());
  document.body.appendChild(overlay);
}
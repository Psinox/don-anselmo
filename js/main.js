document.addEventListener("DOMContentLoaded", () => {
  initStoreIfEmpty();
  Carrito.init();
  renderTextosNegocio();
  renderLogos();
  renderHero();
  renderPromos();
  renderCategoriasChips();
  renderProductos();
  renderCarrito();
  actualizarEstadoMayorista();
  bindUI();
});

function renderLogos(){
  const s = getSettings();
  if (s.isotipo) document.querySelectorAll(".brand .isotipo").forEach(el => el.src = s.isotipo);
  if (s.logotipo) document.querySelectorAll(".brand .logotipo").forEach(el => el.src = s.logotipo);
  if (s.isologo) document.querySelectorAll("img[src='assets/isologo.svg']").forEach(el => el.src = s.isologo);
}

function renderHero(){
  const s = getSettings();
  const hero = document.getElementById("hero");
  const media = document.getElementById("hero-media");
  const content = document.getElementById("hero-content");
  if (!hero) return;

  hero.className = "hero";
  media.innerHTML = "";
  content.style.display = "";
  content.style.position = "";
  content.style.zIndex = "";

  content.innerHTML = `
    <img class="hero-logo" src="assets/isotipo.svg" alt="">
    <img class="hero-logotipo" src="assets/logotipo.svg" alt="Don Anselmo">
    <p class="subt">${escapeHtml(s.heroSubtitulo || "Esteros del Ibera · Corrientes")}</p>
    <p class="desc">${escapeHtml(s.eslogan)}</p>
    <div class="hero-ctas">
      <a href="#seccion-productos" class="btn btn-dorado">Ver productos</a>
      <a href="#" id="wa-flotante-hero" class="btn btn-outline" onclick="document.getElementById('wa-flotante').click(); return false;">Consultar por WhatsApp</a>
    </div>
  `;

  if (s.heroTipo === "imagen" && s.heroImagen) {
    hero.classList.add("hero-con-media");
    media.innerHTML = '<img src="' + s.heroImagen + '" alt="" class="hero-bg-img">';
    if (!s.heroOverlay) {
      content.style.display = "none";
    } else {
      hero.classList.add("hero-con-overlay");
    }
  } else if (s.heroTipo === "video" && s.heroVideo) {
    hero.classList.add("hero-con-media");
    media.innerHTML = '<video src="' + s.heroVideo + '" autoplay muted loop playsinline class="hero-bg-video"></video>';
    if (!s.heroOverlay) {
      content.style.display = "none";
    } else {
      hero.classList.add("hero-con-overlay");
    }
  }

  if (s.isotipo) content.querySelector(".hero-logo").src = s.isotipo;
  if (s.logotipo) content.querySelector(".hero-logotipo").src = s.logotipo;
}

function renderTextosNegocio(){
  const s = getSettings();
  document.querySelectorAll("[data-nombre-negocio]").forEach(el => el.textContent = s.nombreNegocio);
  document.querySelectorAll("[data-eslogan]").forEach(el => el.textContent = s.eslogan);
  document.querySelectorAll("[data-instagram]").forEach(el => el.href = s.instagram);
  document.querySelectorAll("[data-email]").forEach(el => { el.href = "mailto:" + s.email; el.textContent = s.email; });
  document.querySelectorAll("[data-ubicacion]").forEach(el => el.textContent = s.ubicacion);
  document.querySelectorAll("[data-habilitacion]").forEach(el => el.textContent = s.habilitacion);
  const waFloat = document.getElementById("wa-flotante");
  if (waFloat) waFloat.href = `https://wa.me/${s.whatsappNumero}`;
}

function renderPromos(){
  const cont = document.getElementById("promos-track");
  if (!cont) return;
  const s = getSettings();
  const productos = getProductos().filter(p => p.activo);
  const destacados = (s.productosDestacados || []).map(id => productos.find(p => p.id === id)).filter(Boolean);

  if (destacados.length === 0) { cont.innerHTML = ""; return; }

  cont.innerHTML = destacados.map(p => {
    const img = p.imagenes && p.imagenes[0] ? p.imagenes[0] : "";
    return '<article class="dest-card" data-id="' + p.id + '">' +
      '<div class="dest-img-wrap">' +
      (img ? '<img src="' + img + '" alt="' + escapeHtml(p.nombre) + '" loading="lazy">' : '<span class="dest-placeholder">' + escapeHtml(p.nombre.charAt(0)) + '</span>') +
      '</div>' +
      '<div class="dest-overlay">' +
      '<h3>' + escapeHtml(p.nombre) + '</h3>' +
      '<p>' + escapeHtml(p.descripcion) + '</p>' +
      '<span class="dest-precio">' + formatearMoneda(p.precioMinorista) + '</span>' +
      '</div>' +
      '</article>';
  }).join("");

  cont.querySelectorAll(".dest-card").forEach(card => {
    card.addEventListener("click", function(){
      const id = this.getAttribute("data-id");
      if (!id) return;
      const productos = getProductos();
      const p = productos.find(x => x.id === id);
      if (p) {
        irACategoria(p.categoria);
        setTimeout(() => {
          const target = document.querySelector('.card-prod[data-id="' + id + '"]');
          if (target) {
            target.scrollIntoView({ behavior: "smooth", block: "center" });
            target.style.transition = "box-shadow 0.3s";
            target.style.boxShadow = "0 0 0 3px var(--dorado)";
            setTimeout(() => { target.style.boxShadow = ""; }, 2000);
          }
        }, 350);
      }
    });
  });
}

let categoriaActiva = "todas";

function renderCategoriasChips(){
  const cont = document.getElementById("cat-track");
  if (!cont) return;
  const chips = [{ id: "todas", nombre: "Todas" }, ...CATEGORIAS];
  cont.innerHTML = chips.map(c => `
    <button class="chip ${c.id === categoriaActiva ? 'activo' : ''}" data-cat="${c.id}">${c.nombre}</button>
  `).join("");
  cont.querySelectorAll(".chip").forEach(btn => {
    btn.addEventListener("click", () => {
      categoriaActiva = btn.getAttribute("data-cat");
      renderCategoriasChips();
      renderProductos();
    });
  });
}

function irACategoria(catId){
  categoriaActiva = catId;
  renderCategoriasChips();
  renderProductos();
  const el = document.getElementById("seccion-productos");
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderProductos(){
  const cont = document.getElementById("productos-cont");
  if (!cont) return;
  const productos = getProductos().filter(p => p.activo);
  const esMayorista = !!getMayorista();

  const categoriasAMostrar = categoriaActiva === "todas"
    ? CATEGORIAS
    : CATEGORIAS.filter(c => c.id === categoriaActiva);

  cont.innerHTML = categoriasAMostrar.map(cat => {
    const items = productos.filter(p => p.categoria === cat.id);
    if (items.length === 0) return "";
    return `
      <section class="seccion-cat" id="cat-${cat.id}">
        <div class="titulo-cat">
          <h2>${cat.nombre}</h2>
          <div class="linea"></div>
        </div>
        <p class="bajada">${bajadaCategoria(cat.id)}</p>
        <div class="grid-productos">
          ${items.map(p => tarjetaProducto(p, esMayorista)).join("")}
        </div>
      </section>
    `;
  }).join("") || '<p style="text-align:center;padding:40px 0;color:#8a7a63;">No hay productos en esta categoria todavia.</p>';

  bindTarjetas();
}

function bajadaCategoria(catId){
  const textos = {
    charcuteria: "Escabeches, mermeladas y encurtidos de elaboracion artesanal.",
    caza: "Nuestra linea premium de escabeches de caza mayor de los Esteros.",
    recuerdos: "Artesanias y objetos para llevarte un pedazo del Ibera.",
    grabados: "Piezas de madera y acero grabadas a pedido.",
  };
  return textos[catId] || "";
}

function tarjetaProducto(p, esMayorista){
  const sinStock = p.sinStock;
  const precio = esMayorista ? p.precioMayorista : p.precioMinorista;
  const medida = p.unidad === "unidad" ? "1 unidad" : `${p.cantidad}${p.unidad === "kilogramos" ? "kg" : "g"}`;
  const img1 = p.imagenes && p.imagenes[0] ? p.imagenes[0] : "";
  const img2 = p.imagenes && p.imagenes[1] ? p.imagenes[1] : "";
  const tieneMulti = img1 && img2;
  return `
    <article class="card-prod cat-${p.categoria}${sinStock ? " sin-stock" : ""}" data-id="${p.id}">
      <div class="foto ${tieneMulti ? 'multi-img' : ''}" data-img1="${img1}" data-img2="${img2}">
        ${p.categoria === "caza" ? '<span class="badge-caza">Sabores de Caza</span>' : ""}
        ${sinStock ? '<span class="badge-sin-stock">Sin stock</span>' : ""}
        ${img1 ? `<img src="${img1}" alt="${escapeHtml(p.nombre)}" class="img-principal" loading="lazy">` : `<span class="img-placeholder">${p.nombre.charAt(0)}</span>`}
        ${img2 ? `<img src="${img2}" alt="${escapeHtml(p.nombre)}" class="img-secundaria" loading="lazy">` : ""}
      </div>
      <div class="info">
        <h3>${escapeHtml(p.nombre)}</h3>
        <p class="desc-corta">${escapeHtml(p.descripcion)}</p>
        <span class="medida">${medida}</span>
        <div class="precio-row">
          <span class="precio">${formatearMoneda(precio)}</span>
          ${esMayorista ? '<span class="tag-mayorista">Mayorista</span>' : ""}
        </div>
        ${sinStock ? '<p class="sin-stock-msg">Producto sin stock</p>' : `
        <div class="stepper">
          <button type="button" data-accion="restar">&minus;</button>
          <input type="number" min="1" value="1" data-cant readonly>
          <button type="button" data-accion="sumar">+</button>
        </div>
        <button type="button" class="btn-agregar" data-agregar>Agregar</button>`}
      </div>
    </article>
  `;
}

function bindTarjetas(){
  document.querySelectorAll(".card-prod").forEach(card => {
    const id = card.getAttribute("data-id");
    const input = card.querySelector("[data-cant]");
    card.querySelector('[data-accion="sumar"]').addEventListener("click", () => {
      input.value = parseInt(input.value || "1") + 1;
    });
    card.querySelector('[data-accion="restar"]').addEventListener("click", () => {
      input.value = Math.max(1, parseInt(input.value || "1") - 1);
    });
    const btnAgregar = card.querySelector("[data-agregar]");
    btnAgregar.addEventListener("click", () => {
      const cant = Math.max(1, parseInt(input.value || "1"));
      Carrito.agregar(id, cant);
      input.value = 1;
      btnAgregar.textContent = "Agregado!";
      btnAgregar.classList.add("agregado");
      setTimeout(() => {
        btnAgregar.textContent = "Agregar";
        btnAgregar.classList.remove("agregado");
      }, 1100);
    });

    const foto = card.querySelector(".foto.multi-img");
    if (foto) {
      card.addEventListener("mouseenter", () => {
        foto.querySelector(".img-principal")?.classList.add("oculto-img");
        foto.querySelector(".img-secundaria")?.classList.add("visible-img");
      });
      card.addEventListener("mouseleave", () => {
        foto.querySelector(".img-principal")?.classList.remove("oculto-img");
        foto.querySelector(".img-secundaria")?.classList.remove("visible-img");
      });
      card.addEventListener("touchstart", function(e){
        if (this._toggled) {
          foto.querySelector(".img-principal")?.classList.remove("oculto-img");
          foto.querySelector(".img-secundaria")?.classList.remove("visible-img");
          this._toggled = false;
        } else {
          foto.querySelector(".img-principal")?.classList.add("oculto-img");
          foto.querySelector(".img-secundaria")?.classList.add("visible-img");
          this._toggled = true;
        }
      });
    }
  });
}

function renderCarrito(){
  const cont = document.getElementById("carrito-body");
  if (!cont) return;
  const detalle = Carrito.detalle();

  if (detalle.length === 0){
    cont.innerHTML = '<div class="carrito-vacio"><p>Todavia no agregaste productos.</p></div>';
  } else {
    cont.innerHTML = detalle.map(l => `
      <div class="item-carrito" data-id="${l.producto.id}">
        <div class="foto-mini">${l.producto.imagenes && l.producto.imagenes[0] ? `<img src="${l.producto.imagenes[0]}" alt="">` : l.producto.nombre.charAt(0)}</div>
        <div class="datos">
          <h4>${escapeHtml(l.producto.nombre)}</h4>
          <span class="medida">${l.producto.unidad === "unidad" ? "1 unidad" : (l.producto.cantidad + (l.producto.unidad === "kilogramos" ? "kg" : "g"))} x${l.cantidad}</span>
          <div class="fila-precio">
            <strong>${formatearMoneda(l.subtotal)}</strong>
            <button type="button" class="quitar" data-quitar>Quitar</button>
          </div>
        </div>
      </div>
    `).join("");

    cont.querySelectorAll("[data-quitar]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = e.target.closest(".item-carrito").getAttribute("data-id");
        Carrito.quitar(id);
      });
    });
  }

  const totalEl = document.getElementById("carrito-total");
  if (totalEl) totalEl.textContent = formatearMoneda(Carrito.total());
  const btnCheckout = document.getElementById("btn-checkout-wa");
  if (btnCheckout) btnCheckout.disabled = detalle.length === 0;
}

function toggleDrawer(abrir){
  const drawer = document.getElementById("carrito-drawer");
  const overlay = document.getElementById("overlay");
  if (!drawer) return;
  drawer.classList.toggle("abierto", abrir);
  overlay.classList.toggle("visible", abrir);
}

function abrirModalMayorista(){
  document.getElementById("modal-mayorista").classList.add("visible");
}
function cerrarModalMayorista(){
  document.getElementById("modal-mayorista").classList.remove("visible");
}

function actualizarEstadoMayorista(){
  const datos = getMayorista();
  const badge = document.getElementById("badge-mayorista");
  const linkActivar = document.querySelectorAll("[data-abrir-mayorista]");
  if (datos){
    if (badge){
      badge.classList.remove("oculto");
      badge.querySelector("[data-nombre-mayorista]").textContent = datos.negocio || datos.nombre;
    }
    linkActivar.forEach(el => el.classList.add("oculto"));
  } else {
    if (badge) badge.classList.add("oculto");
    linkActivar.forEach(el => el.classList.remove("oculto"));
  }
  renderProductos();
  renderCarrito();
}

function bindUI(){
  const hamburger = document.getElementById("btn-hamburger");
  const navMobile = document.getElementById("nav-mobile");
  if (hamburger){
    hamburger.addEventListener("click", () => navMobile.classList.toggle("abierto"));
  }
  document.querySelectorAll("#nav-mobile a, .nav-desktop a").forEach(a => {
    a.addEventListener("click", () => navMobile && navMobile.classList.remove("abierto"));
  });

  document.getElementById("btn-carrito")?.addEventListener("click", () => toggleDrawer(true));
  document.getElementById("btn-cerrar-carrito")?.addEventListener("click", () => toggleDrawer(false));
  document.getElementById("overlay")?.addEventListener("click", () => {
    toggleDrawer(false);
    cerrarModalMayorista();
  });
  document.getElementById("btn-checkout-wa")?.addEventListener("click", irAWhatsapp);
  document.getElementById("btn-vaciar-carrito")?.addEventListener("click", () => {
    if (confirm("Vaciar el carrito?")) Carrito.vaciar();
  });

  document.querySelectorAll("[data-abrir-mayorista]").forEach(el => {
    el.addEventListener("click", (e) => { e.preventDefault(); abrirModalMayorista(); });
  });
  document.getElementById("btn-cerrar-mayorista")?.addEventListener("click", cerrarModalMayorista);
  document.getElementById("btn-salir-mayorista")?.addEventListener("click", () => {
    if (confirm("Salir del modo mayorista?")){
      clearMayorista();
      actualizarEstadoMayorista();
    }
  });

  const formMayorista = document.getElementById("form-mayorista");
  if (formMayorista){
    formMayorista.addEventListener("submit", (e) => {
      e.preventDefault();
      const datos = {
        nombre: document.getElementById("my-nombre").value.trim(),
        negocio: document.getElementById("my-negocio").value.trim(),
        whatsapp: document.getElementById("my-whatsapp").value.trim(),
      };
      if (!datos.nombre || !datos.whatsapp) return;
      setMayorista(datos);
      cerrarModalMayorista();
      actualizarEstadoMayorista();
      formMayorista.reset();
    });
  }
}

function escapeHtml(str){
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

const Carrito = {
  items: [],

  init(){
    this.items = getCarrito();
    this.renderBadge();
  },

  _buscarLinea(productoId){
    return this.items.find(i => i.productoId === productoId);
  },

  agregar(productoId, cantidad = 1){
    const linea = this._buscarLinea(productoId);
    if (linea) {
      linea.cantidad += cantidad;
    } else {
      this.items.push({ productoId, cantidad });
    }
    this._persistir();
  },

  actualizarCantidad(productoId, cantidad){
    const linea = this._buscarLinea(productoId);
    if (!linea) return;
    if (cantidad <= 0){
      this.quitar(productoId);
      return;
    }
    linea.cantidad = cantidad;
    this._persistir();
  },

  quitar(productoId){
    this.items = this.items.filter(i => i.productoId !== productoId);
    this._persistir();
  },

  vaciar(){
    this.items = [];
    this._persistir();
  },

  cantidadTotal(){
    return this.items.reduce((acc, i) => acc + i.cantidad, 0);
  },

  detalle(){
    const productos = getProductos();
    const esMayorista = !!getMayorista();
    return this.items.map(i => {
      const prod = productos.find(p => p.id === i.productoId);
      if (!prod) return null;
      const precioUnit = esMayorista ? prod.precioMayorista : prod.precioMinorista;
      return {
        producto: prod,
        cantidad: i.cantidad,
        precioUnit,
        subtotal: precioUnit * i.cantidad,
      };
    }).filter(Boolean);
  },

  total(){
    return this.detalle().reduce((acc, l) => acc + l.subtotal, 0);
  },

  _persistir(){
    saveCarrito(this.items);
    this.renderBadge();
    if (typeof renderCarrito === "function") renderCarrito();
  },

  renderBadge(){
    const total = this.cantidadTotal();
    const badge = document.getElementById("cart-badge");
    if (badge) { badge.textContent = total; badge.classList.toggle("oculto", total === 0); }
    const flotante = document.getElementById("carrito-flotante");
    const fbadge = document.getElementById("flotante-badge");
    if (flotante) flotante.classList.toggle("oculto", total === 0);
    if (fbadge) { fbadge.textContent = total; fbadge.classList.toggle("oculto", total === 0); }
  },
};

function formatearMoneda(valor){
  const settings = getSettings();
  return settings.moneda + " " + Number(valor).toLocaleString("es-AR");
}

function construirMensajeWhatsapp(){
  const settings = getSettings();
  const mayorista = getMayorista();
  const detalle = Carrito.detalle();
  const direccion = document.getElementById("envio-direccion")?.value?.trim();

  if (detalle.length === 0) return null;

  let msg = `Hola ${settings.nombreNegocio}! Quiero hacer un pedido:\n\n`;
  detalle.forEach(l => {
    const medida = l.producto.unidad === "unidad"
      ? `x${l.cantidad}`
      : `x${l.cantidad} (${l.producto.cantidad}${l.producto.unidad === "kilogramos" ? "kg" : "g"} c/u)`;
    msg += `- ${l.producto.nombre} ${medida} -- ${formatearMoneda(l.subtotal)}\n`;
  });
  msg += `\nTOTAL: ${formatearMoneda(Carrito.total())}`;
  if (mayorista){
    msg += `\n\n(Precio mayorista -- ${mayorista.negocio || mayorista.nombre})`;
  }
  if (direccion) {
    msg += `\n\nDireccion de envio: ${direccion}`;
  }
  msg += `\n\nQuedo atento, gracias!`;
  return msg;
}

function irAWhatsapp(){
  const mensaje = construirMensajeWhatsapp();
  if (!mensaje) return;
  const settings = getSettings();
  const url = `https://wa.me/${settings.whatsappNumero}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, "_blank");
}
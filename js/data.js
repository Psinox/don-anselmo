const SEED_SETTINGS = {
  nombreNegocio: "Don Anselmo",
  eslogan: "Charcuteria y conservas artesanales de los Esteros del Ibera",
  whatsappNumero: "5493794000000",
  instagram: "https://www.instagram.com/don_anselmo_esteros_del_ibera/?hl=es-la",
  email: "donanselmo.ibera@gmail.com",
  ubicacion: "Esteros del Ibera, Corrientes",
  habilitacion: "Habilitacion Municipal N°195",
  moneda: "$",
  heroTipo: "texto",
  heroImagen: "",
  heroVideo: "",
  heroOverlay: true,
  heroSubtitulo: "Esteros del Ibera · Corrientes",
  productosDestacados: ["p01", "p04", "p11"],
};

const SEED_BANNERS = [
  {
    id: "b1", activo: true, orden: 1,
    titulo: "Elaboracion artesanal, de nuestro monte a tu mesa",
    subtitulo: "Conservas, escabeches y mermeladas hechas en los Esteros del Ibera",
    categoria: "conservas",
    tipo: "texto", color: "cuero",
    imagen: "", video: "",
  },
  {
    id: "b2", activo: true, orden: 2,
    titulo: "Sabores de Caza",
    subtitulo: "La linea de escabeches de caza mayor de Don Anselmo",
    categoria: "caza",
    tipo: "texto", color: "noche",
    imagen: "", video: "",
  },
  {
    id: "b3", activo: true, orden: 3,
    titulo: "¿Revendes nuestros productos?",
    subtitulo: "Sumate como mayorista y accede a precios especiales",
    categoria: "mayorista",
    tipo: "texto", color: "dorado",
    imagen: "", video: "",
  },
];

const SEED_PRODUCTS = [
  /* ---- Sabores de Caza ---- */
  { id: "p11", categoria: "caza", nombre: "Escabeche de Ciervo Axis", descripcion: "Receta tradicional de caza seleccionada. Carne, vinagre, aceite, cebolla, morron, zanahoria, ajo, laurel y pimienta.", activo: true, imagenes: [], variantes: [{ id: "v1", unidad: "gramos", cantidad: 500, precioMinorista: 7900, precioMayorista: 6200 }] },
  { id: "p12", categoria: "caza", nombre: "Escabeche de Jabali", descripcion: "Escabeche tradicional de jabali de monte.", activo: true, imagenes: [], variantes: [{ id: "v1", unidad: "gramos", cantidad: 500, precioMinorista: 7900, precioMayorista: 6200 }] },

  /* ---- Conservas (vegetales cosechados) ---- */
  { id: "p01", categoria: "conservas", nombre: "Berenjena al Escabeche", descripcion: "Berenjenas en escabeche casero, maceradas con especias del monte.", activo: true, imagenes: [], variantes: [{ id: "v1", unidad: "gramos", cantidad: 300, precioMinorista: 3800, precioMayorista: 2900 }] },
  { id: "p02", categoria: "conservas", nombre: "Morron Asado en Vinagre", descripcion: "Morrones asados a las brasas y encurtidos en vinagre de vino.", activo: true, imagenes: [], variantes: [{ id: "v1", unidad: "gramos", cantidad: 300, precioMinorista: 3900, precioMayorista: 3000 }] },
  { id: "p03", categoria: "conservas", nombre: "Sal Aromatizada del Ibera", descripcion: "Sal de mesa aromatizada con hierbas y especias de la region.", activo: true, imagenes: [], variantes: [{ id: "v1", unidad: "gramos", cantidad: 150, precioMinorista: 2600, precioMayorista: 1900 }] },
  { id: "p07", categoria: "conservas", nombre: "Ajos Confitados", descripcion: "Dientes de ajo confitados en aceite de oliva con hierbas.", activo: true, imagenes: [], variantes: [{ id: "v1", unidad: "gramos", cantidad: 250, precioMinorista: 4200, precioMayorista: 3300 }] },
  { id: "p08", categoria: "conservas", nombre: "Pickles de Pepino", descripcion: "Pepinos encurtidos estilo pickle, receta tradicional Don Anselmo.", activo: true, imagenes: [], variantes: [{ id: "v1", unidad: "gramos", cantidad: 300, precioMinorista: 3200, precioMayorista: 2400 }] },

  /* ---- Mermeladas ---- */
  { id: "p04", categoria: "mermeladas", nombre: "Mermelada de Naranja", descripcion: "Mermelada artesanal de naranja, coccion lenta a fuego de lena.", activo: true, imagenes: [], variantes: [{ id: "v1", unidad: "gramos", cantidad: 350, precioMinorista: 3400, precioMayorista: 2600 }] },
  { id: "p05", categoria: "mermeladas", nombre: "Mermelada de Zapallo", descripcion: "Mermelada casera de zapallo con un toque de especias dulces.", activo: true, imagenes: [], variantes: [{ id: "v1", unidad: "gramos", cantidad: 350, precioMinorista: 3400, precioMayorista: 2600 }] },
  { id: "p06", categoria: "mermeladas", nombre: "Mermelada de Frutilla", descripcion: "Mermelada artesanal de frutilla, elaborada en pequenos lotes.", activo: true, imagenes: [], variantes: [{ id: "v1", unidad: "gramos", cantidad: 350, precioMinorista: 3400, precioMayorista: 2600 }] },
  { id: "p09", categoria: "mermeladas", nombre: "Mermelada de Cebolla", descripcion: "Mermelada agridulce de cebolla, ideal para carnes y quesos.", activo: true, imagenes: [], variantes: [{ id: "v1", unidad: "gramos", cantidad: 350, precioMinorista: 3600, precioMayorista: 2800 }] },

  /* ---- Charcuteria curada ---- */
  { id: "p10", categoria: "charcuteria", nombre: "Salame Artesanal", descripcion: "Salame de elaboracion artesanal, estacionado en secadero propio.", activo: true, imagenes: [], variantes: [{ id: "v1", unidad: "kilogramos", cantidad: 0.5, precioMinorista: 9800, precioMayorista: 7900 }] },

  /* ---- Recuerdos del Ibera ---- */
  { id: "p13", categoria: "recuerdos", nombre: "Cuadro Pintado a Mano - Fauna del Ibera", descripcion: "Cuadro artesanal pintado a mano, motivos de la fauna autoctona.", activo: true, imagenes: [], variantes: [{ id: "v1", unidad: "unidad", cantidad: 1, precioMinorista: 18500, precioMayorista: 14500 }] },
  { id: "p14", categoria: "recuerdos", nombre: "Taza Esteros del Ibera", descripcion: "Taza de ceramica con diseno exclusivo de los Esteros del Ibera.", activo: true, imagenes: [], variantes: [{ id: "v1", unidad: "unidad", cantidad: 1, precioMinorista: 6500, precioMayorista: 4900 }] },
  { id: "p15", categoria: "recuerdos", nombre: "Mate Ibera Premium", descripcion: "Mate de calabaza forrado en cuero, terminacion premium.", activo: true, imagenes: [], variantes: [{ id: "v1", unidad: "unidad", cantidad: 1, precioMinorista: 11500, precioMayorista: 8900 }] },
  { id: "p16", categoria: "recuerdos", nombre: "Remera Don Anselmo", descripcion: "Remera de algodon con logo Don Anselmo. Talles S a XL.", activo: true, imagenes: [], variantes: [{ id: "v1", unidad: "unidad", cantidad: 1, precioMinorista: 9800, precioMayorista: 7500 }] },
  { id: "p17", categoria: "recuerdos", nombre: "Gorra Bordada Ibera", descripcion: "Gorra bordada con el emblema de los Esteros del Ibera.", activo: true, imagenes: [], variantes: [{ id: "v1", unidad: "unidad", cantidad: 1, precioMinorista: 8200, precioMayorista: 6300 }] },

  /* ---- Grabados / Personalizados ---- */
  { id: "p18", categoria: "grabados", nombre: "Tabla para Picar Grabada", descripcion: "Tabla de madera nativa con grabado personalizado a pedido.", activo: true, imagenes: [], variantes: [{ id: "v1", unidad: "unidad", cantidad: 1, precioMinorista: 14500, precioMayorista: 11200 }] },
  { id: "p19", categoria: "grabados", nombre: "Cuchillo Grabado Artesanal", descripcion: "Cuchillo criollo con mango de asta y grabado artesanal.", activo: true, imagenes: [], variantes: [{ id: "v1", unidad: "unidad", cantidad: 1, precioMinorista: 21500, precioMayorista: 16900 }] },
];

const CATEGORIAS = [
  { id: "conservas", nombre: "Conservas", icono: "" },
  { id: "mermeladas", nombre: "Mermeladas", icono: "" },
  { id: "caza", nombre: "Sabores de Caza", icono: "" },
  { id: "charcuteria", nombre: "Charcuteria Curada", icono: "" },
  { id: "panificados", nombre: "Panificados y Snacks", icono: "" },
  { id: "recuerdos", nombre: "Recuerdos del Ibera", icono: "" },
  { id: "grabados", nombre: "Grabados / Personalizados", icono: "" },
];

/* Normaliza productos viejos (sin variantes) al nuevo formato */
function normalizarVariantes(p) {
  if (!p) return p;
  if (p.variantes && p.variantes.length > 0) return p;
  return {
    ...p,
    variantes: [{
      id: "v_default",
      unidad: p.unidad || "unidad",
      cantidad: p.cantidad !== undefined ? p.cantidad : 1,
      precioMinorista: p.precioMinorista || 0,
      precioMayorista: p.precioMayorista || 0,
    }]
  };
}

function getVarianteDefault(p) { return normalizarVariantes(p).variantes[0]; }

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
    categoria: "charcuteria",
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
  { id: "p01", categoria: "charcuteria", nombre: "Berenjena al Escabeche", descripcion: "Berenjenas en escabeche casero, maceradas con especias del monte.", unidad: "gramos", cantidad: 300, precioMinorista: 3800, precioMayorista: 2900, activo: true, imagenes: [] },
  { id: "p02", categoria: "charcuteria", nombre: "Morron Asado en Vinagre", descripcion: "Morrones asados a las brasas y encurtidos en vinagre de vino.", unidad: "gramos", cantidad: 300, precioMinorista: 3900, precioMayorista: 3000, activo: true, imagenes: [] },
  { id: "p03", categoria: "charcuteria", nombre: "Sal Aromatizada del Ibera", descripcion: "Sal de mesa aromatizada con hierbas y especias de la region.", unidad: "gramos", cantidad: 150, precioMinorista: 2600, precioMayorista: 1900, activo: true, imagenes: [] },
  { id: "p04", categoria: "charcuteria", nombre: "Mermelada de Naranja", descripcion: "Mermelada artesanal de naranja, coccion lenta a fuego de lena.", unidad: "gramos", cantidad: 350, precioMinorista: 3400, precioMayorista: 2600, activo: true, imagenes: [] },
  { id: "p05", categoria: "charcuteria", nombre: "Mermelada de Zapallo", descripcion: "Mermelada casera de zapallo con un toque de especias dulces.", unidad: "gramos", cantidad: 350, precioMinorista: 3400, precioMayorista: 2600, activo: true, imagenes: [] },
  { id: "p06", categoria: "charcuteria", nombre: "Mermelada de Frutilla", descripcion: "Mermelada artesanal de frutilla, elaborada en pequenos lotes.", unidad: "gramos", cantidad: 350, precioMinorista: 3400, precioMayorista: 2600, activo: true, imagenes: [] },
  { id: "p07", categoria: "charcuteria", nombre: "Ajos Confitados", descripcion: "Dientes de ajo confitados en aceite de oliva con hierbas.", unidad: "gramos", cantidad: 250, precioMinorista: 4200, precioMayorista: 3300, activo: true, imagenes: [] },
  { id: "p08", categoria: "charcuteria", nombre: "Pickles de Pepino", descripcion: "Pepinos encurtidos estilo pickle, receta tradicional Don Anselmo.", unidad: "gramos", cantidad: 300, precioMinorista: 3200, precioMayorista: 2400, activo: true, imagenes: [] },
  { id: "p09", categoria: "charcuteria", nombre: "Mermelada de Cebolla", descripcion: "Mermelada agridulce de cebolla, ideal para carnes y quesos.", unidad: "gramos", cantidad: 350, precioMinorista: 3600, precioMayorista: 2800, activo: true, imagenes: [] },
  { id: "p10", categoria: "charcuteria", nombre: "Salame Artesanal", descripcion: "Salame de elaboracion artesanal, estacionado en secadero propio.", unidad: "kilogramos", cantidad: 0.5, precioMinorista: 9800, precioMayorista: 7900, activo: true, imagenes: [] },
  { id: "p11", categoria: "caza", nombre: "Escabeche de Ciervo Axis", descripcion: "Receta tradicional de caza seleccionada. Carne, vinagre, aceite, cebolla, morron, zanahoria, ajo, laurel y pimienta.", unidad: "gramos", cantidad: 500, precioMinorista: 7900, precioMayorista: 6200, activo: true, imagenes: [] },
  { id: "p12", categoria: "caza", nombre: "Escabeche de Jabali", descripcion: "Escabeche tradicional de jabali de monte.", unidad: "gramos", cantidad: 500, precioMinorista: 7900, precioMayorista: 6200, activo: true, imagenes: [] },
  { id: "p13", categoria: "recuerdos", nombre: "Cuadro Pintado a Mano - Fauna del Ibera", descripcion: "Cuadro artesanal pintado a mano, motivos de la fauna autoctona.", unidad: "unidad", cantidad: 1, precioMinorista: 18500, precioMayorista: 14500, activo: true, imagenes: [] },
  { id: "p14", categoria: "recuerdos", nombre: "Taza Esteros del Ibera", descripcion: "Taza de ceramica con diseno exclusivo de los Esteros del Ibera.", unidad: "unidad", cantidad: 1, precioMinorista: 6500, precioMayorista: 4900, activo: true, imagenes: [] },
  { id: "p15", categoria: "recuerdos", nombre: "Mate Ibera Premium", descripcion: "Mate de calabaza forrado en cuero, terminacion premium.", unidad: "unidad", cantidad: 1, precioMinorista: 11500, precioMayorista: 8900, activo: true, imagenes: [] },
  { id: "p16", categoria: "recuerdos", nombre: "Remera Don Anselmo", descripcion: "Remera de algodon con logo Don Anselmo. Talles S a XL.", unidad: "unidad", cantidad: 1, precioMinorista: 9800, precioMayorista: 7500, activo: true, imagenes: [] },
  { id: "p17", categoria: "recuerdos", nombre: "Gorra Bordada Ibera", descripcion: "Gorra bordada con el emblema de los Esteros del Ibera.", unidad: "unidad", cantidad: 1, precioMinorista: 8200, precioMayorista: 6300, activo: true, imagenes: [] },
  { id: "p18", categoria: "grabados", nombre: "Tabla para Picar Grabada", descripcion: "Tabla de madera nativa con grabado personalizado a pedido.", unidad: "unidad", cantidad: 1, precioMinorista: 14500, precioMayorista: 11200, activo: true, imagenes: [] },
  { id: "p19", categoria: "grabados", nombre: "Cuchillo Grabado Artesanal", descripcion: "Cuchillo criollo con mango de asta y grabado artesanal.", unidad: "unidad", cantidad: 1, precioMinorista: 21500, precioMayorista: 16900, activo: true, imagenes: [] },
];

const CATEGORIAS = [
  { id: "charcuteria", nombre: "Charcuteria", icono: "" },
  { id: "caza", nombre: "Sabores de Caza", icono: "" },
  { id: "recuerdos", nombre: "Recuerdos del Ibera", icono: "" },
  { id: "grabados", nombre: "Productos Grabados", icono: "" },
];
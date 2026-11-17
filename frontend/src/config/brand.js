export const ZOETI_BRAND = {
  name: 'ZoeTi',
  tagline: 'personal shopper',
  whatsappNumber: '50663811395', // Número oficial de WhatsApp Costa Rica (+506 6381-1395)
  whatsappDisplay: '+506 6381-1395',
  email: 'administracionzoeTi@gmail.com',
  instagram: '@zoeti.cr',
  location: 'San José, Costa Rica (Envíos a todo el país)',
};

/**
 * Genera el enlace directo a WhatsApp con un mensaje pre-cargado.
 * @param {string} customMessage Mensaje personalizado
 */
export const getWhatsAppUrl = (
  customMessage = '¡Hola ZoeTi! Me gustaría cotizar un producto para importar a Costa Rica. Aquí te comparto el link:'
) => {
  const encoded = encodeURIComponent(customMessage);
  return `https://wa.me/${ZOETI_BRAND.whatsappNumber}?text=${encoded}`;
};

export const IMPORT_ROUTES = [
  {
    id: 'mexico',
    country: 'México',
    destination: 'Costa Rica',
    transitTime: '5 a 8 días hábiles',
    frequency: 'Salidas semanales desde Ciudad de México',
    highlight: 'Moda, cosmética dermatológica, calzado y tiendas departamentales exclusivas.',
    popularStores: ['El Palacio de Hierro', 'Liverpool', 'Zara México', 'Sephora', 'Mercado Libre'],
    badge: 'Ruta Más Solicitada',
  },
  {
    id: 'colombia',
    country: 'Colombia',
    destination: 'Costa Rica',
    transitTime: '4 a 7 días hábiles',
    frequency: 'Vuelos consolidados desde Bogotá y Medellín',
    highlight: 'Diseño de autor colombiano, swimwear, lino, fajas, marroquinería y moda.',
    popularStores: ['Agua Bendita', 'Studio F', 'Vélez', 'Gef / Punto Blanco', 'Bosi'],
    badge: 'Moda & Diseño',
  },
  {
    id: 'peru',
    country: 'Perú',
    destination: 'Costa Rica',
    transitTime: '6 a 9 días hábiles',
    frequency: 'Consolidación quincenal y semanal desde Lima',
    highlight: 'Prendas en algodón Pima, tejidos en Baby Alpaca, joyería artesanal y gastronomía selecta.',
    popularStores: ['Kuna', 'Sol Alpaca', 'Batan', 'Falabella', 'Marcas de Algodón Pima'],
    badge: 'Textiles Premium',
  },
  {
    id: 'panama',
    country: 'Panamá',
    destination: 'Costa Rica',
    transitTime: '3 a 5 días hábiles',
    frequency: 'Salidas express dos veces por semana',
    highlight: 'Tecnología, perfumería de lujo, relojería y compras en Multiplaza / Albrook.',
    popularStores: ['Félix B. Maduro', 'Multiplaza Luxury', 'Panafoto', 'MacStore', 'Zara Panamá'],
    badge: 'Entrega Express',
  },
];

export const ORDER_STATUSES = [
  'Recibido',
  'Comprado',
  'En tránsito',
  'Listo para entrega',
  'Entregado',
  'Cancelado',
];


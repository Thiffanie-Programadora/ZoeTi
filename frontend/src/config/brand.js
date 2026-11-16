export const ZOETI_BRAND = {
  name: 'ZoeTi',
  tagline: 'personal shopper',
  whatsappNumber: '50688888888', // Número configurable de WhatsApp Costa Rica (+506)
  whatsappDisplay: '+506 8888-8888',
  email: 'hola@zoeti.cr',
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
    flag: '🇲🇽',
    destination: 'Costa Rica 🇨🇷',
    transitTime: '5 a 8 días hábiles',
    frequency: 'Salidas semanales desde CDMX',
    highlight: 'Moda, cosmética dermatológica, calzado y tiendas departamentales exclusivas.',
    popularStores: ['El Palacio de Hierro', 'Liverpool', 'Zara MX', 'Sephora MX', 'Mercado Libre MX'],
    badge: 'Ruta Más Solicitada',
  },
  {
    id: 'colombia',
    country: 'Colombia',
    flag: '🇨🇴',
    destination: 'Costa Rica 🇨🇷',
    transitTime: '4 a 7 días hábiles',
    frequency: 'Vuelos consolidados desde Bogotá y Medellín',
    highlight: 'Diseño de autor colombiano, swimwear, lino, fajas, marroquinería y moda.',
    popularStores: ['Agua Bendita', 'Studio F', 'Vélez', 'Gef / Punto Blanco', 'Bosi'],
    badge: 'Moda & Diseño',
  },
  {
    id: 'peru',
    country: 'Perú',
    flag: '🇵🇪',
    destination: 'Costa Rica 🇨🇷',
    transitTime: '6 a 9 días hábiles',
    frequency: 'Consolidación quincenal y semanal desde Lima',
    highlight: 'Prendas en algodón Pima, tejidos en Baby Alpaca, joyería artesanal y gastronomía selecta.',
    popularStores: ['Kuna', 'Sol Alpaca', 'Batan', 'Falabella PE', 'Marcas de Algodón Pima'],
    badge: 'Textiles Premium',
  },
  {
    id: 'panama',
    country: 'Panamá',
    flag: '🇵🇦',
    destination: 'Costa Rica 🇨🇷',
    transitTime: '3 a 5 días hábiles',
    frequency: 'Salidas express dos veces por semana',
    highlight: 'Tecnología, perfumería de lujo, relojería y compras en Multiplaza / Albrook.',
    popularStores: ['Félix B. Maduro', 'Multiplaza Luxury', 'Panafoto', 'MacStore PA', 'Zara PA'],
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


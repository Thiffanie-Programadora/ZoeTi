const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const TOKEN_STORAGE_KEY = 'zoeti_admin_token';
const ADMIN_USER_KEY = 'zoeti_admin_user';
const LOCAL_ORDERS_KEY = 'zoeti_fallback_orders_v1';

const INITIAL_DEMO_ORDERS = [
  {
    id: 1,
    tracking_code: 'ZT-2026-101',
    client_name: 'Valeria Méndez',
    client_phone: '+506 8845-1920',
    client_email: 'valeria.mendez@email.cr',
    origin_country: 'Colombia',
    destination_country: 'Costa Rica',
    product_url: 'https://www.gef.co/vestido-lino-coleccion',
    product_description:
      'Vestido midi de lino beige talla S + set de accesorios artesanales',
    quantity: 1,
    quoted_price_usd: 118.0,
    quoted_price_crc: 60500,
    status: 'En tránsito',
    admin_notes: 'Consolidado en valija Bogotá -> San José. Llega el jueves.',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 2,
    tracking_code: 'ZT-2026-102',
    client_name: 'Mariana Solís',
    client_phone: '+506 8712-4409',
    client_email: 'msolis@email.cr',
    origin_country: 'México',
    destination_country: 'Costa Rica',
    product_url: 'https://www.elpalaciodehierro.com/perfumeria-set',
    product_description:
      'Set de skincare dermatológico y bolso estructurado color vino',
    quantity: 2,
    quoted_price_usd: 165.0,
    quoted_price_crc: 84600,
    status: 'Comprado',
    admin_notes: 'Orden pagada en CDMX, esperando recepción en bodega.',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 3,
    tracking_code: 'ZT-2026-103',
    client_name: 'Andrea Vargas',
    client_phone: '+506 8390-7711',
    client_email: 'andrea.v@email.cr',
    origin_country: 'Perú',
    destination_country: 'Costa Rica',
    product_url: 'https://www.kuna.com.pe/cardigan-baby-alpaca',
    product_description: 'Cárdigan tejido en Baby Alpaca talla M color crema',
    quantity: 1,
    quoted_price_usd: 195.0,
    quoted_price_crc: 99800,
    status: 'Listo para entrega',
    admin_notes: 'En oficina Escazú. Coordinar envío por mensajería privada.',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 4,
    tracking_code: 'ZT-2026-104',
    client_name: 'Carlos Ramírez',
    client_phone: '+506 8921-3340',
    client_email: 'cramirez@email.cr',
    origin_country: 'Panamá',
    destination_country: 'Costa Rica',
    product_url: 'https://www.felix.com.pa/reloj-automatico-coleccion',
    product_description:
      'Reloj clásico correa de cuero + gafas de sol polarizadas',
    quantity: 1,
    quoted_price_usd: 142.0,
    quoted_price_crc: 72800,
    status: 'Recibido',
    admin_notes: 'Pendiente confirmar talla/color con cliente por WhatsApp.',
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
];

const getLocalOrders = () => {
  try {
    const raw = localStorage.getItem(LOCAL_ORDERS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(INITIAL_DEMO_ORDERS));
      return INITIAL_DEMO_ORDERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_DEMO_ORDERS;
  }
};

const saveLocalOrders = (orders) => {
  localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders));
};

export const getAuthToken = () => localStorage.getItem(TOKEN_STORAGE_KEY);

export const getStoredAdmin = () => {
  try {
    const raw = localStorage.getItem(ADMIN_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const logoutAdminSession = () => {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(ADMIN_USER_KEY);
};

/**
 * Inicia sesión contra el backend Node.js/PostgreSQL (POST /api/auth/login).
 * Si el backend aún no está encendido localmente, provee respaldo seguro de demostración.
 */
export const loginAdminApi = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok || !data.ok) {
      throw new Error(data.message || 'Credenciales inválidas.');
    }
    localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
    localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(data.admin));
    return { ...data, mode: 'mysql' };
  } catch (err) {
    // Fallback demostrativo si el servidor PostgreSQL no está corriendo en este instante
    if (err.name === 'TypeError' || err.message.includes('Failed to fetch')) {
      const normalized = String(email).trim().toLowerCase();
      if (
        normalized === 'admin@zoeti.cr' &&
        password === 'ZoeTiAdmin2026!'
      ) {
        const demoAdmin = {
          id: 1,
          name: 'Administradora ZoeTi',
          email: 'admin@zoeti.cr',
          role: 'admin',
        };
        const demoToken = 'demo_jwt_token_zoeti_local';
        localStorage.setItem(TOKEN_STORAGE_KEY, demoToken);
        localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(demoAdmin));
        return {
          ok: true,
          token: demoToken,
          admin: demoAdmin,
          mode: 'local-preview',
        };
      }
      throw new Error(
        'Credenciales incorrectas (Modo local: usa admin@zoeti.cr / ZoeTiAdmin2026!)'
      );
    }
    throw err;
  }
};

/**
 * Obtiene la lista de pedidos desde el backend (GET /api/orders)
 */
export const fetchOrdersAdminApi = async (filters = {}) => {
  const token = getAuthToken();
  const params = new URLSearchParams();
  if (filters.status && filters.status !== 'Todos') {
    params.set('status', filters.status);
  }
  if (filters.origin_country && filters.origin_country !== 'Todos') {
    params.set('origin_country', filters.origin_country);
  }
  if (filters.search) {
    params.set('search', filters.search);
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/orders?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Error al obtener pedidos');
    }
    return { orders: data.orders, mode: 'mysql' };
  } catch {
    let orders = getLocalOrders();
    if (filters.status && filters.status !== 'Todos') {
      orders = orders.filter((o) => o.status === filters.status);
    }
    if (filters.origin_country && filters.origin_country !== 'Todos') {
      orders = orders.filter((o) => o.origin_country === filters.origin_country);
    }
    if (filters.search && filters.search.trim() !== '') {
      const q = filters.search.toLowerCase();
      orders = orders.filter(
        (o) =>
          o.client_name.toLowerCase().includes(q) ||
          o.tracking_code.toLowerCase().includes(q) ||
          o.client_phone.toLowerCase().includes(q) ||
          o.product_description.toLowerCase().includes(q)
      );
    }
    return { orders, mode: 'local-preview' };
  }
};

/**
 * Registra un nuevo pedido/solicitud de cotización (POST /api/orders)
 */
export const createOrderRequestApi = async (payload) => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'No se pudo registrar el pedido.');
    }
    return data.order;
  } catch {
    const orders = getLocalOrders();
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const newOrder = {
      id: Date.now(),
      tracking_code: `ZT-2026-${randomSuffix}`,
      client_name: payload.client_name,
      client_phone: payload.client_phone,
      client_email: payload.client_email || '',
      origin_country: payload.origin_country,
      destination_country: 'Costa Rica',
      product_url: payload.product_url,
      product_description: payload.product_description,
      quantity: Number(payload.quantity) || 1,
      quoted_price_usd: payload.quoted_price_usd
        ? Number(payload.quoted_price_usd)
        : null,
      quoted_price_crc: payload.quoted_price_crc
        ? Number(payload.quoted_price_crc)
        : null,
      status: 'Recibido',
      admin_notes: payload.admin_notes || 'Registrado desde formulario web.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    saveLocalOrders([newOrder, ...orders]);
    return newOrder;
  }
};

/**
 * Actualiza el estado y detalles de un pedido desde el panel de administración (PATCH /api/orders/:id/status)
 */
export const updateOrderStatusApi = async (orderId, updates) => {
  const token = getAuthToken();
  try {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Error al actualizar estado.');
    }
    return data.order;
  } catch {
    const orders = getLocalOrders();
    const updatedOrders = orders.map((order) =>
      order.id === orderId
        ? {
            ...order,
            ...updates,
            updated_at: new Date().toISOString(),
          }
        : order
    );
    saveLocalOrders(updatedOrders);
    return updatedOrders.find((o) => o.id === orderId);
  }
};

/**
 * Consulta un pedido por su código de seguimiento (GET /api/orders/track/:code)
 */
export const trackOrderByCodeApi = async (code) => {
  const normalized = String(code || '').trim().toUpperCase();
  try {
    const response = await fetch(
      `${API_BASE_URL}/orders/track/${encodeURIComponent(normalized)}`
    );
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Pedido no encontrado.');
    }
    return data.order;
  } catch {
    const orders = getLocalOrders();
    const found = orders.find(
      (o) => o.tracking_code.toUpperCase() === normalized
    );
    if (!found) {
      throw new Error(
        'No encontramos ningún pedido con ese código. Prueba con ZT-2026-101.'
      );
    }
    return found;
  }
};


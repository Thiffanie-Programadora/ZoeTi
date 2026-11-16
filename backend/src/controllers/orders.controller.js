import { query } from '../config/db.js';

const VALID_ORIGINS = ['México', 'Colombia', 'Perú', 'Panamá'];
const VALID_STATUSES = [
  'Recibido',
  'Comprado',
  'En tránsito',
  'Listo para entrega',
  'Entregado',
  'Cancelado',
];

/**
 * Genera un código único legible para cada pedido (ej. ZT-2026-482)
 */
const generateTrackingCode = () => {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `ZT-${year}-${randomSuffix}`;
};

/**
 * POST /api/orders (Público)
 * Permite a un cliente registrar una solicitud de cotización/pedido desde la web.
 */
export const createPublicOrderRequest = async (req, res) => {
  try {
    const {
      client_name,
      client_phone,
      client_email,
      origin_country,
      product_url,
      product_description,
      quantity = 1,
    } = req.body;

    if (
      !client_name ||
      !client_phone ||
      !origin_country ||
      !product_url ||
      !product_description
    ) {
      return res.status(400).json({
        ok: false,
        message:
          'Por favor completa nombre, WhatsApp, país de origen, enlace del producto y detalles.',
      });
    }

    if (!VALID_ORIGINS.includes(origin_country)) {
      return res.status(400).json({
        ok: false,
        message: `El país de origen debe ser uno de: ${VALID_ORIGINS.join(', ')}.`,
      });
    }

    const tracking_code = generateTrackingCode();

    const insertResult = await query(
      `INSERT INTO orders (
        tracking_code,
        client_name,
        client_phone,
        client_email,
        origin_country,
        destination_country,
        product_url,
        product_description,
        quantity,
        status
      ) VALUES ($1, $2, $3, $4, $5, 'Costa Rica', $6, $7, $8, 'Recibido')
      RETURNING *`,
      [
        tracking_code,
        String(client_name).trim(),
        String(client_phone).trim(),
        client_email ? String(client_email).trim() : null,
        origin_country,
        String(product_url).trim(),
        String(product_description).trim(),
        Number(quantity) || 1,
      ]
    );

    return res.status(201).json({
      ok: true,
      message: 'Solicitud de importación registrada exitosamente.',
      order: insertResult.rows[0],
    });
  } catch (error) {
    console.error('[OrdersController.createPublicOrderRequest] Error:', error.message);
    return res.status(500).json({
      ok: false,
      message: 'Error al registrar la solicitud de pedido.',
    });
  }
};

/**
 * GET /api/orders/track/:code (Público)
 * Permite consultar el estado de un pedido mediante su código de seguimiento.
 */
export const trackOrderByCode = async (req, res) => {
  try {
    const code = String(req.params.code || '').trim().toUpperCase();

    const result = await query(
      `SELECT tracking_code, client_name, origin_country, destination_country,
              product_description, quantity, quoted_price_usd, quoted_price_crc,
              status, created_at, updated_at
       FROM orders
       WHERE UPPER(tracking_code) = $1
       LIMIT 1`,
      [code]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        ok: false,
        message: 'No encontramos ningún pedido con ese código de seguimiento.',
      });
    }

    return res.status(200).json({
      ok: true,
      order: result.rows[0],
    });
  } catch (error) {
    console.error('[OrdersController.trackOrderByCode] Error:', error.message);
    return res.status(500).json({
      ok: false,
      message: 'Error al consultar el estado del pedido.',
    });
  }
};

/**
 * GET /api/orders (Protegido - Admin)
 * Lista todos los pedidos con filtros opcionales por estado, país y búsqueda.
 */
export const getAllOrdersAdmin = async (req, res) => {
  try {
    const { status, origin_country, search } = req.query;
    const conditions = [];
    const values = [];

    if (status && status !== 'Todos') {
      values.push(status);
      conditions.push(`status = $${values.length}`);
    }

    if (origin_country && origin_country !== 'Todos') {
      values.push(origin_country);
      conditions.push(`origin_country = $${values.length}`);
    }

    if (search && String(search).trim() !== '') {
      values.push(`%${String(search).trim()}%`);
      conditions.push(
        `(client_name ILIKE $${values.length} OR tracking_code ILIKE $${values.length} OR client_phone ILIKE $${values.length} OR product_description ILIKE $${values.length})`
      );
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await query(
      `SELECT *
       FROM orders
       ${whereClause}
       ORDER BY created_at DESC`,
      values
    );

    return res.status(200).json({
      ok: true,
      count: result.rowCount,
      orders: result.rows,
    });
  } catch (error) {
    console.error('[OrdersController.getAllOrdersAdmin] Error:', error.message);
    return res.status(500).json({
      ok: false,
      message: 'Error al obtener la lista de pedidos.',
    });
  }
};

/**
 * PATCH /api/orders/:id/status (Protegido - Admin)
 * Actualiza el estado del pedido, precio cotizado y notas internas.
 */
export const updateOrderStatusAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, quoted_price_usd, quoted_price_crc, admin_notes } = req.body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        ok: false,
        message: `Estado inválido. Valores permitidos: ${VALID_STATUSES.join(', ')}.`,
      });
    }

    const result = await query(
      `UPDATE orders
       SET status = $1,
           quoted_price_usd = COALESCE($2, quoted_price_usd),
           quoted_price_crc = COALESCE($3, quoted_price_crc),
           admin_notes = COALESCE($4, admin_notes),
           updated_by_admin_id = $5
       WHERE id = $6
       RETURNING *`,
      [
        status,
        quoted_price_usd !== undefined && quoted_price_usd !== ''
          ? Number(quoted_price_usd)
          : null,
        quoted_price_crc !== undefined && quoted_price_crc !== ''
          ? Number(quoted_price_crc)
          : null,
        admin_notes !== undefined ? String(admin_notes) : null,
        req.admin?.id || null,
        Number(id),
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        ok: false,
        message: 'Pedido no encontrado.',
      });
    }

    return res.status(200).json({
      ok: true,
      message: `Pedido actualizado al estado "${status}".`,
      order: result.rows[0],
    });
  } catch (error) {
    console.error('[OrdersController.updateOrderStatusAdmin] Error:', error.message);
    return res.status(500).json({
      ok: false,
      message: 'Error al actualizar el pedido.',
    });
  }
};

/**
 * DELETE /api/orders/:id (Protegido - Admin)
 * Elimina un pedido del registro administrativo.
 */
export const deleteOrderAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      `DELETE FROM orders WHERE id = $1 RETURNING id, tracking_code`,
      [Number(id)]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        ok: false,
        message: 'Pedido no encontrado.',
      });
    }

    return res.status(200).json({
      ok: true,
      message: `Pedido ${result.rows[0].tracking_code} eliminado correctamente.`,
    });
  } catch (error) {
    console.error('[OrdersController.deleteOrderAdmin] Error:', error.message);
    return res.status(500).json({
      ok: false,
      message: 'Error al eliminar el pedido.',
    });
  }
};


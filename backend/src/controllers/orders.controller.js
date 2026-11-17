import {
  isMySQLConnected,
  pool,
  query,
  readLocalDb,
  writeLocalDb,
} from '../config/db.js';

const VALID_ORIGINS = ['México', 'Colombia', 'Perú', 'Panamá'];
const VALID_STATUSES = [
  'Recibido',
  'Comprado',
  'En tránsito',
  'Listo para entrega',
  'Entregado',
  'Cancelado',
];

const generateTrackingCode = () => {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `ZT-${year}-${randomSuffix}`;
};

/**
 * POST /api/orders (Público)
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
      quoted_price_usd = null,
      quoted_price_crc = null,
      admin_notes = null,
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

    if (isMySQLConnected) {
      const [insertResult] = await pool.execute(
        `INSERT INTO orders (
          tracking_code, client_name, client_phone, client_email,
          origin_country, destination_country, product_url,
          product_description, quantity, quoted_price_usd,
          quoted_price_crc, status, admin_notes
        ) VALUES (?, ?, ?, ?, ?, 'Costa Rica', ?, ?, ?, ?, ?, 'Recibido', ?)`,
        [
          tracking_code,
          String(client_name).trim(),
          String(client_phone).trim(),
          client_email ? String(client_email).trim() : null,
          origin_country,
          String(product_url).trim(),
          String(product_description).trim(),
          Number(quantity) || 1,
          quoted_price_usd !== null && quoted_price_usd !== ''
            ? Number(quoted_price_usd)
            : null,
          quoted_price_crc !== null && quoted_price_crc !== ''
            ? Number(quoted_price_crc)
            : null,
          admin_notes ? String(admin_notes) : null,
        ]
      );
      const rows = await query(`SELECT * FROM orders WHERE id = ?`, [
        insertResult.insertId,
      ]);
      return res.status(201).json({
        ok: true,
        message: 'Solicitud de importación registrada exitosamente.',
        order: rows[0],
      });
    }

    const dbData = await readLocalDb();
    const newOrder = {
      id: Date.now(),
      tracking_code,
      client_name: String(client_name).trim(),
      client_phone: String(client_phone).trim(),
      client_email: client_email ? String(client_email).trim() : null,
      origin_country,
      destination_country: 'Costa Rica',
      product_url: String(product_url).trim(),
      product_description: String(product_description).trim(),
      quantity: Number(quantity) || 1,
      quoted_price_usd:
        quoted_price_usd !== null && quoted_price_usd !== ''
          ? Number(quoted_price_usd)
          : null,
      quoted_price_crc:
        quoted_price_crc !== null && quoted_price_crc !== ''
          ? Number(quoted_price_crc)
          : null,
      status: 'Recibido',
      admin_notes: admin_notes ? String(admin_notes) : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    dbData.orders.unshift(newOrder);
    writeLocalDb(dbData);

    return res.status(201).json({
      ok: true,
      message: 'Solicitud de importación registrada exitosamente.',
      order: newOrder,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: 'Error al registrar la solicitud de pedido.',
    });
  }
};

/**
 * GET /api/orders/track/:code (Público)
 */
export const trackOrderByCode = async (req, res) => {
  try {
    const code = String(req.params.code || '').trim().toUpperCase();

    if (isMySQLConnected) {
      const rows = await query(
        `SELECT tracking_code, client_name, origin_country, destination_country,
                product_description, quantity, quoted_price_usd, quoted_price_crc,
                status, created_at, updated_at
         FROM orders
         WHERE UPPER(tracking_code) = ?
         LIMIT 1`,
        [code]
      );
      if (rows.length === 0) {
        return res.status(404).json({
          ok: false,
          message:
            'No encontramos ningún pedido con ese código de seguimiento.',
        });
      }
      return res.status(200).json({ ok: true, order: rows[0] });
    }

    const dbData = await readLocalDb();
    const found = dbData.orders.find(
      (o) => String(o.tracking_code).toUpperCase() === code
    );
    if (!found) {
      return res.status(404).json({
        ok: false,
        message: 'No encontramos ningún pedido con ese código de seguimiento.',
      });
    }
    return res.status(200).json({ ok: true, order: found });
  } catch {
    return res.status(500).json({
      ok: false,
      message: 'Error al consultar el estado del pedido.',
    });
  }
};

/**
 * GET /api/orders (Protegido - Admin)
 */
export const getAllOrdersAdmin = async (req, res) => {
  try {
    const { status, origin_country, search } = req.query;

    if (isMySQLConnected) {
      const conditions = [];
      const values = [];
      if (status && status !== 'Todos') {
        conditions.push(`status = ?`);
        values.push(status);
      }
      if (origin_country && origin_country !== 'Todos') {
        conditions.push(`origin_country = ?`);
        values.push(origin_country);
      }
      if (search && String(search).trim() !== '') {
        const pattern = `%${String(search).trim()}%`;
        conditions.push(
          `(client_name LIKE ? OR tracking_code LIKE ? OR client_phone LIKE ? OR product_description LIKE ?)`
        );
        values.push(pattern, pattern, pattern, pattern);
      }
      const whereClause =
        conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      const rows = await query(
        `SELECT * FROM orders ${whereClause} ORDER BY created_at DESC`,
        values
      );
      return res
        .status(200)
        .json({ ok: true, count: rows.length, orders: rows });
    }

    const dbData = await readLocalDb();
    let list = [...dbData.orders];
    if (status && status !== 'Todos') {
      list = list.filter((o) => o.status === status);
    }
    if (origin_country && origin_country !== 'Todos') {
      list = list.filter((o) => o.origin_country === origin_country);
    }
    if (search && String(search).trim() !== '') {
      const q = String(search).trim().toLowerCase();
      list = list.filter(
        (o) =>
          o.client_name.toLowerCase().includes(q) ||
          o.tracking_code.toLowerCase().includes(q) ||
          o.client_phone.toLowerCase().includes(q) ||
          o.product_description.toLowerCase().includes(q)
      );
    }

    return res.status(200).json({ ok: true, count: list.length, orders: list });
  } catch {
    return res.status(500).json({
      ok: false,
      message: 'Error al obtener la lista de pedidos.',
    });
  }
};

/**
 * PATCH /api/orders/:id/status (Protegido - Admin)
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

    if (isMySQLConnected) {
      const [updateResult] = await pool.execute(
        `UPDATE orders
         SET status = ?,
             quoted_price_usd = COALESCE(?, quoted_price_usd),
             quoted_price_crc = COALESCE(?, quoted_price_crc),
             admin_notes = COALESCE(?, admin_notes),
             updated_by_admin_id = ?
         WHERE id = ?`,
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
      if (updateResult.affectedRows === 0) {
        return res
          .status(404)
          .json({ ok: false, message: 'Pedido no encontrado.' });
      }
      const rows = await query(`SELECT * FROM orders WHERE id = ?`, [
        Number(id),
      ]);
      return res.status(200).json({
        ok: true,
        message: `Pedido actualizado al estado "${status}".`,
        order: rows[0],
      });
    }

    const dbData = await readLocalDb();
    const idx = dbData.orders.findIndex((o) => Number(o.id) === Number(id));
    if (idx === -1) {
      return res
        .status(404)
        .json({ ok: false, message: 'Pedido no encontrado.' });
    }

    dbData.orders[idx] = {
      ...dbData.orders[idx],
      status,
      quoted_price_usd:
        quoted_price_usd !== undefined && quoted_price_usd !== ''
          ? Number(quoted_price_usd)
          : dbData.orders[idx].quoted_price_usd,
      quoted_price_crc:
        quoted_price_crc !== undefined && quoted_price_crc !== ''
          ? Number(quoted_price_crc)
          : dbData.orders[idx].quoted_price_crc,
      admin_notes:
        admin_notes !== undefined
          ? String(admin_notes)
          : dbData.orders[idx].admin_notes,
      updated_at: new Date().toISOString(),
    };
    writeLocalDb(dbData);

    return res.status(200).json({
      ok: true,
      message: `Pedido actualizado al estado "${status}".`,
      order: dbData.orders[idx],
    });
  } catch {
    return res.status(500).json({
      ok: false,
      message: 'Error al actualizar el pedido.',
    });
  }
};

/**
 * DELETE /api/orders/:id (Protegido - Admin)
 */
export const deleteOrderAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    if (isMySQLConnected) {
      const [deleteResult] = await pool.execute(
        `DELETE FROM orders WHERE id = ?`,
        [Number(id)]
      );
      if (deleteResult.affectedRows === 0) {
        return res
          .status(404)
          .json({ ok: false, message: 'Pedido no encontrado.' });
      }
      return res.status(200).json({
        ok: true,
        message: `Pedido #${id} eliminado correctamente.`,
      });
    }

    const dbData = await readLocalDb();
    dbData.orders = dbData.orders.filter((o) => Number(o.id) !== Number(id));
    writeLocalDb(dbData);
    return res.status(200).json({
      ok: true,
      message: `Pedido #${id} eliminado correctamente.`,
    });
  } catch {
    return res.status(500).json({
      ok: false,
      message: 'Error al eliminar el pedido.',
    });
  }
};

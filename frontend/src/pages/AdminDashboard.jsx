import React, { useState, useEffect, useCallback } from 'react';
import Boton from '../components/boton.jsx';
import RagAssistantSection from '../components/RagAssistantSection.jsx';
import { ORDER_STATUSES } from '../config/brand.js';
import {
  fetchOrdersAdminApi,
  updateOrderStatusApi,
  createOrderRequestApi,
  logoutAdminSession,
} from '../services/api.js';

const STATUS_BADGE_STYLES = {
  Recibido: 'bg-[#E5F3EF] text-[#4A2040] border-[#4A2040]/30',
  Comprado: 'bg-amber-100 text-amber-900 border-amber-300',
  'En tránsito': 'bg-sky-100 text-sky-900 border-sky-300',
  'Listo para entrega': 'bg-emerald-100 text-emerald-900 border-emerald-400',
  Entregado: 'bg-[#4A2040] text-[#F7FCFA] border-[#4A2040]',
  Cancelado: 'bg-rose-100 text-rose-900 border-rose-300',
};

/**
 * Panel de Control Privado para Administradora de ZoeTi Personal Shopper.
 * Permite visualizar solicitudes, filtrar por ruta/estado, actualizar estados y cotizaciones.
 */
export default function AdminDashboard({ admin, onLogout }) {
  const [orders, setOrders] = useState([]);
  const [connectionMode, setConnectionMode] = useState('postgresql');
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [countryFilter, setCountryFilter] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingOrder, setEditingOrder] = useState(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [feedbackBanner, setFeedbackBanner] = useState('');

  const [newOrderForm, setNewOrderForm] = useState({
    client_name: '',
    client_phone: '',
    origin_country: 'Colombia',
    product_url: '',
    product_description: '',
    quoted_price_usd: '',
    quoted_price_crc: '',
    admin_notes: '',
  });

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchOrdersAdminApi({
        status: statusFilter,
        origin_country: countryFilter,
        search: searchQuery,
      });
      setOrders(result.orders || []);
      setConnectionMode(result.mode);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, countryFilter, searchQuery]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const showNotice = (msg) => {
    setFeedbackBanner(msg);
    setTimeout(() => setFeedbackBanner(''), 4000);
  };

  const handleQuickStatusChange = async (orderId, newStatus) => {
    await updateOrderStatusApi(orderId, { status: newStatus });
    showNotice(`Estado actualizado a "${newStatus}" correctamente.`);
    loadOrders();
  };

  const handleSaveEditModal = async (e) => {
    e.preventDefault();
    if (!editingOrder) return;
    await updateOrderStatusApi(editingOrder.id, {
      status: editingOrder.status,
      quoted_price_usd: editingOrder.quoted_price_usd,
      quoted_price_crc: editingOrder.quoted_price_crc,
      admin_notes: editingOrder.admin_notes,
    });
    setEditingOrder(null);
    showNotice('Pedido actualizado exitosamente.');
    loadOrders();
  };

  const handleCreateOrderAdmin = async (e) => {
    e.preventDefault();
    const created = await createOrderRequestApi(newOrderForm);
    setShowNewModal(false);
    setNewOrderForm({
      client_name: '',
      client_phone: '',
      origin_country: 'Colombia',
      product_url: '',
      product_description: '',
      quoted_price_usd: '',
      quoted_price_crc: '',
      admin_notes: '',
    });
    showNotice(`Nuevo pedido ${created.tracking_code} registrado.`);
    loadOrders();
  };

  // Métricas resumen
  const countByStatus = (st) => orders.filter((o) => o.status === st).length;

  const buildCustomerWhatsAppLink = (order) => {
    const cleanPhone = String(order.client_phone || '').replace(/[^\d]/g, '');
    const phoneWithPrefix = cleanPhone.startsWith('506')
      ? cleanPhone
      : `506${cleanPhone}`;
    const msg = `¡Hola ${order.client_name}! Te escribimos de ZoeTi Personal Shopper ✨. Tu pedido ${order.tracking_code} (${order.origin_country} -> Costa Rica) ahora se encuentra en estado: *${order.status}*.`;
    return `https://wa.me/${phoneWithPrefix}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <section className="min-h-screen bg-[#F7FCFA] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Encabezado del Panel */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#D1E8E2] shadow-zoeti flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-[#D1E8E2] text-xs font-semibold text-[#4A2040]">
                Panel de Control ZoeTi
              </span>
              <span className="px-3 py-1 rounded-full bg-[#E5F3EF] text-xs font-mono text-[#68325B]">
                {connectionMode === 'mysql'
                  ? '🟢 Conectado a MySQL (zoeti)'
                  : '🟢 Modo Persistente Local Activo'}
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#4A2040] mt-2">
              Gestión de Pedidos de Importación
            </h1>
            <p className="text-xs sm:text-sm text-[#4A2040]/75">
              Sesión activa: <strong>{admin?.name || 'Administradora'}</strong> (
              {admin?.email || 'admin@zoeti.cr'})
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Boton
              onClick={() => setShowNewModal(true)}
              variant="primary"
              size="sm"
            >
              + Nuevo Pedido Manual
            </Boton>
            <Boton
              onClick={() => {
                logoutAdminSession();
                onLogout();
              }}
              variant="outline"
              size="sm"
            >
              Cerrar Sesión
            </Boton>
          </div>
        </div>

        {feedbackBanner && (
          <div className="p-4 rounded-2xl bg-[#D1E8E2] border border-[#4A2040]/30 text-sm font-semibold text-[#4A2040] flex items-center justify-between">
            <span>✅ {feedbackBanner}</span>
          </div>
        )}

        {/* Tarjetas KPI de Estados */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-white p-5 rounded-2xl border-2 border-[#D1E8E2]">
            <span className="text-xs font-semibold uppercase text-[#68325B]">
              Total Mostrados
            </span>
            <p className="font-serif text-3xl font-bold text-[#4A2040] mt-1">
              {orders.length}
            </p>
          </div>
          <div className="bg-white p-5 rounded-2xl border-2 border-[#D1E8E2]">
            <span className="text-xs font-semibold uppercase text-[#68325B]">
              Recibidos
            </span>
            <p className="font-serif text-3xl font-bold text-[#4A2040] mt-1">
              {countByStatus('Recibido')}
            </p>
          </div>
          <div className="bg-white p-5 rounded-2xl border-2 border-[#D1E8E2]">
            <span className="text-xs font-semibold uppercase text-[#68325B]">
              Comprados
            </span>
            <p className="font-serif text-3xl font-bold text-[#4A2040] mt-1">
              {countByStatus('Comprado')}
            </p>
          </div>
          <div className="bg-white p-5 rounded-2xl border-2 border-[#D1E8E2]">
            <span className="text-xs font-semibold uppercase text-[#68325B]">
              En tránsito
            </span>
            <p className="font-serif text-3xl font-bold text-[#4A2040] mt-1">
              {countByStatus('En tránsito')}
            </p>
          </div>
          <div className="bg-white p-5 rounded-2xl border-2 border-[#D1E8E2]">
            <span className="text-xs font-semibold uppercase text-[#68325B]">
              Listos para entrega
            </span>
            <p className="font-serif text-3xl font-bold text-[#4A2040] mt-1">
              {countByStatus('Listo para entrega')}
            </p>
          </div>
        </div>

        {/* Barra de Filtros y Búsqueda */}
        <div className="bg-white rounded-3xl p-6 border-2 border-[#D1E8E2] grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#4A2040] mb-1">
              Buscar por cliente, código o producto
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ej. ZT-2026-101, Valeria, vestido..."
              className="w-full px-4 py-2.5 rounded-xl bg-[#F7FCFA] border border-[#D1E8E2] text-sm text-[#4A2040] focus:outline-none focus:border-[#4A2040]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4A2040] mb-1">
              Filtrar por Estado del Pedido
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#F7FCFA] border border-[#D1E8E2] text-sm text-[#4A2040] focus:outline-none focus:border-[#4A2040]"
            >
              <option value="Todos">Todos los estados</option>
              {ORDER_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4A2040] mb-1">
              Filtrar por País de Origen
            </label>
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#F7FCFA] border border-[#D1E8E2] text-sm text-[#4A2040] focus:outline-none focus:border-[#4A2040]"
            >
              <option value="Todos">Todos los países</option>
              <option value="México">México → Costa Rica</option>
              <option value="Colombia">Colombia → Costa Rica</option>
              <option value="Perú">Perú → Costa Rica</option>
              <option value="Panamá">Panamá → Costa Rica</option>
            </select>
          </div>
        </div>

        {/* Tabla / Lista de Pedidos */}
        <div className="bg-white rounded-3xl border-2 border-[#D1E8E2] shadow-zoeti overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-sm text-[#4A2040]/70">
              Cargando solicitudes de importación...
            </div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center text-sm text-[#4A2040]/70">
              No se encontraron pedidos con los filtros seleccionados.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#D1E8E2]/60 text-[#4A2040] text-xs uppercase tracking-wider border-b border-[#D1E8E2]">
                    <th className="py-4 px-5 font-bold">Código & Fecha</th>
                    <th className="py-4 px-5 font-bold">Cliente</th>
                    <th className="py-4 px-5 font-bold">Ruta</th>
                    <th className="py-4 px-5 font-bold">Producto & Link</th>
                    <th className="py-4 px-5 font-bold">Cotización Final</th>
                    <th className="py-4 px-5 font-bold">Estado del Pedido</th>
                    <th className="py-4 px-5 font-bold text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D1E8E2] text-sm">
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-[#F7FCFA] transition-colors align-top"
                    >
                      <td className="py-4 px-5 whitespace-nowrap">
                        <span className="font-mono font-bold text-[#4A2040] block">
                          {order.tracking_code}
                        </span>
                        <span className="text-xs text-[#4A2040]/65">
                          {new Date(order.created_at).toLocaleDateString(
                            'es-CR'
                          )}
                        </span>
                      </td>

                      <td className="py-4 px-5">
                        <p className="font-semibold text-[#4A2040]">
                          {order.client_name}
                        </p>
                        <p className="text-xs text-[#4A2040]/75">
                          {order.client_phone}
                        </p>
                      </td>

                      <td className="py-4 px-5 whitespace-nowrap">
                        <span className="px-3 py-1 rounded-full bg-[#E5F3EF] text-xs font-semibold text-[#4A2040]">
                          {order.origin_country} → Costa Rica
                        </span>
                      </td>

                      <td className="py-4 px-5 max-w-xs">
                        <p className="text-xs sm:text-sm text-[#4A2040] line-clamp-2">
                          {order.product_description}
                        </p>
                        <a
                          href={order.product_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold text-[#68325B] underline mt-1 inline-block"
                        >
                          Abrir link de tienda ↗
                        </a>
                        {order.admin_notes && (
                          <p className="mt-1 text-[11px] italic text-[#4A2040]/70 bg-[#D1E8E2]/35 px-2.5 py-1 rounded-lg">
                            Nota: {order.admin_notes}
                          </p>
                        )}
                      </td>

                      <td className="py-4 px-5 whitespace-nowrap">
                        {order.quoted_price_crc || order.quoted_price_usd ? (
                          <div>
                            {order.quoted_price_crc && (
                              <span className="block font-bold text-[#4A2040]">
                                ₡
                                {Number(
                                  order.quoted_price_crc
                                ).toLocaleString('es-CR')}
                              </span>
                            )}
                            {order.quoted_price_usd && (
                              <span className="block text-xs text-[#4A2040]/70">
                                ${Number(order.quoted_price_usd).toFixed(2)} USD
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs italic text-[#4A2040]/50">
                            Por cotizar
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-5">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            handleQuickStatusChange(order.id, e.target.value)
                          }
                          aria-label={`Cambiar estado de ${order.tracking_code}`}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border cursor-pointer focus:outline-none ${
                            STATUS_BADGE_STYLES[order.status] ||
                            STATUS_BADGE_STYLES.Recibido
                          }`}
                        >
                          {ORDER_STATUSES.map((st) => (
                            <option
                              key={st}
                              value={st}
                              className="bg-white text-[#4A2040]"
                            >
                              {st}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="py-4 px-5 text-right whitespace-nowrap space-x-2">
                        <button
                          type="button"
                          onClick={() => setEditingOrder({ ...order })}
                          className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#D1E8E2] text-[#4A2040] hover:bg-[#B7DAD1]"
                        >
                          Cotizar / Notas
                        </button>
                        <a
                          href={buildCustomerWhatsAppLink(order)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block px-3 py-1.5 rounded-full text-xs font-semibold bg-[#4A2040] text-[#F7FCFA] hover:bg-[#32132B]"
                        >
                          Notificar WA
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Módulo SaaS Multiempresa con RAG, Google Drive, Roles y Planes */}
      <div className="mt-12">
        <RagAssistantSection />
      </div>

      {/* Modal para Editar Cotización, Estado y Notas */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 bg-[#4A2040]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#F7FCFA] rounded-3xl max-w-lg w-full p-6 sm:p-8 border-2 border-[#D1E8E2] shadow-zoeti-lg">
            <h2 className="font-serif text-2xl font-bold text-[#4A2040]">
              Actualizar Pedido {editingOrder.tracking_code}
            </h2>
            <p className="text-xs text-[#4A2040]/75 mb-4">
              Cliente: {editingOrder.client_name} ({editingOrder.origin_country}{' '}
              → Costa Rica)
            </p>

            <form onSubmit={handleSaveEditModal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#4A2040] mb-1">
                  Estado del Pedido
                </label>
                <select
                  value={editingOrder.status}
                  onChange={(e) =>
                    setEditingOrder({ ...editingOrder, status: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D1E8E2] text-sm text-[#4A2040]"
                >
                  {ORDER_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#4A2040] mb-1">
                    Precio Final (CRC ₡)
                  </label>
                  <input
                    type="number"
                    step="100"
                    value={editingOrder.quoted_price_crc || ''}
                    onChange={(e) =>
                      setEditingOrder({
                        ...editingOrder,
                        quoted_price_crc: e.target.value,
                      })
                    }
                    placeholder="Ej. 65000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D1E8E2] text-sm text-[#4A2040]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#4A2040] mb-1">
                    Precio Final (USD $)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingOrder.quoted_price_usd || ''}
                    onChange={(e) =>
                      setEditingOrder({
                        ...editingOrder,
                        quoted_price_usd: e.target.value,
                      })
                    }
                    placeholder="Ej. 125.00"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D1E8E2] text-sm text-[#4A2040]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4A2040] mb-1">
                  Notas de Seguimiento Interno
                </label>
                <textarea
                  rows={3}
                  value={editingOrder.admin_notes || ''}
                  onChange={(e) =>
                    setEditingOrder({
                      ...editingOrder,
                      admin_notes: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#D1E8E2] text-sm text-[#4A2040]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Boton
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingOrder(null)}
                >
                  Cancelar
                </Boton>
                <Boton type="submit" variant="primary" size="sm">
                  Guardar Cambios
                </Boton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para Registrar Nuevo Pedido Manual */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-[#4A2040]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#F7FCFA] rounded-3xl max-w-lg w-full p-6 sm:p-8 border-2 border-[#D1E8E2] shadow-zoeti-lg">
            <h2 className="font-serif text-2xl font-bold text-[#4A2040] mb-4">
              Registrar Nuevo Pedido de Importación
            </h2>

            <form onSubmit={handleCreateOrderAdmin} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Nombre del cliente *"
                  value={newOrderForm.client_name}
                  onChange={(e) =>
                    setNewOrderForm({
                      ...newOrderForm,
                      client_name: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D1E8E2] text-sm"
                />
                <input
                  type="text"
                  required
                  placeholder="WhatsApp (+506...) *"
                  value={newOrderForm.client_phone}
                  onChange={(e) =>
                    setNewOrderForm({
                      ...newOrderForm,
                      client_phone: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D1E8E2] text-sm"
                />
              </div>

              <select
                value={newOrderForm.origin_country}
                onChange={(e) =>
                  setNewOrderForm({
                    ...newOrderForm,
                    origin_country: e.target.value,
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D1E8E2] text-sm"
              >
                <option value="Colombia">Colombia → Costa Rica</option>
                <option value="México">México → Costa Rica</option>
                <option value="Perú">Perú → Costa Rica</option>
                <option value="Panamá">Panamá → Costa Rica</option>
              </select>

              <input
                type="url"
                required
                placeholder="Link del producto (https://...) *"
                value={newOrderForm.product_url}
                onChange={(e) =>
                  setNewOrderForm({
                    ...newOrderForm,
                    product_url: e.target.value,
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D1E8E2] text-sm"
              />

              <textarea
                rows={2}
                required
                placeholder="Descripción, talla y color *"
                value={newOrderForm.product_description}
                onChange={(e) =>
                  setNewOrderForm({
                    ...newOrderForm,
                    product_description: e.target.value,
                  })
                }
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#D1E8E2] text-sm"
              />

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Precio CRC ₡ (opcional)"
                  value={newOrderForm.quoted_price_crc}
                  onChange={(e) =>
                    setNewOrderForm({
                      ...newOrderForm,
                      quoted_price_crc: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D1E8E2] text-sm"
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Precio USD $ (opcional)"
                  value={newOrderForm.quoted_price_usd}
                  onChange={(e) =>
                    setNewOrderForm({
                      ...newOrderForm,
                      quoted_price_usd: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D1E8E2] text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Boton
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNewModal(false)}
                >
                  Cancelar
                </Boton>
                <Boton type="submit" variant="primary" size="sm">
                  Crear Pedido
                </Boton>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}


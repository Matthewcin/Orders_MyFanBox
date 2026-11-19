import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Download,
  Fingerprint,
  FileText,
  MessageCircle,
  Edit3,
  Trash2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { Order } from '../../types';
import { PAYMENT_STATUSES, SHIPPING_STATUSES, GARMENT_GENDERS } from '../../utils/constants';
import {
  formatCOP,
  isOrderActive,
  getPaidAmount,
  getPendingAmount,
  isValidUUID,
  generateUUIDv4
} from '../../utils/helpers';

interface OrdersViewProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onEditOrder: (order: Order) => void;
}

export default function OrdersView({ searchQuery, setSearchQuery, onEditOrder }: OrdersViewProps) {
  const navigate = useNavigate();
  const {
    orders,
    setOrders,
    catalog,
    metrics,
    productionMatrix,
    handleUpdateOrderPayment,
    handleUpdateOrderShipping,
    deleteOrder,
    notify
  } = useAdmin();

  const [quickStatusFilter, setQuickStatusFilter] = useState('ALL');
  const [payFilter, setPayFilter] = useState('ALL');
  const [shipFilter, setShipFilter] = useState('ALL');
  const [productFilter, setProductFilter] = useState('ALL');
  const [sizeFilter, setSizeFilter] = useState('ALL');
  const [genderFilter, setGenderFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);

  const filteredOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return orders.filter(o => {
      if (q) {
        const hay = `${o.id} ${o.uuid} ${o.customerName} ${o.cedula || ''} ${o.instagram} ${o.phone} ${o.city} ${o.address} ${o.trackingNumber} ${o.notes}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }

      if (quickStatusFilter !== 'ALL') {
        if (PAYMENT_STATUSES.includes(quickStatusFilter)) {
          if (o.paymentStatus !== quickStatusFilter) return false;
        } else if (SHIPPING_STATUSES.includes(quickStatusFilter)) {
          if (!isOrderActive(o) || o.shippingStatus !== quickStatusFilter) return false;
        } else if (quickStatusFilter === 'ALERT_COBROS') {
          if (!isOrderActive(o) || (o.shippingStatus !== 'Por enviar' && o.shippingStatus !== 'Enviado') || getPendingAmount(o) <= 0) {
            return false;
          }
        }
      }

      if (payFilter !== 'ALL' && o.paymentStatus !== payFilter) return false;
      if (shipFilter !== 'ALL' && o.shippingStatus !== shipFilter) return false;
      if (productFilter !== 'ALL' && !o.items.some(it => it.productId === productFilter)) return false;
      if (sizeFilter !== 'ALL' && !o.items.some(it => it.size === sizeFilter)) return false;
      if (genderFilter !== 'ALL' && !o.items.some(it => (it.gender || 'Sin especificar') === genderFilter)) return false;

      return true;
    });
  }, [orders, searchQuery, quickStatusFilter, payFilter, shipFilter, productFilter, sizeFilter, genderFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, quickStatusFilter, payFilter, shipFilter, productFilter, sizeFilter, genderFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, currentPage, pageSize]);

  const getPayStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Pagado': return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Semi-pagado (50%)': return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Pendiente': return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'Reembolsado': return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'Cancelado': return 'bg-zinc-100 text-zinc-400 border-zinc-200 line-through';
      default: return 'bg-zinc-100 text-zinc-700 border-zinc-200';
    }
  };

  const getShipStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Enviado': return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Por enviar': return 'bg-sky-50 text-sky-800 border-sky-200 font-semibold';
      case 'Por preparar': return 'bg-zinc-100 text-zinc-800 border-zinc-300';
      default: return 'bg-zinc-100 text-zinc-700 border-zinc-200';
    }
  };

  const getCustomerTrackingUrl = (order: Order) => {
    const orderUuid = isValidUUID(order.uuid) ? order.uuid : generateUUIDv4();
    return `${window.location.origin}/details/${orderUuid}`;
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    notify(label);
  };

  const handleOpenWhatsApp = (order: Order) => {
    const rawPhone = String(order.phone || '').trim();
    let fullPhone = rawPhone.replace(/\D/g, '');
    if (fullPhone.startsWith('00')) fullPhone = fullPhone.slice(2);
    else if (!rawPhone.startsWith('+') && fullPhone.length === 10) fullPhone = `57${fullPhone}`;
    if (!fullPhone) {
      notify('Este pedido no tiene un teléfono válido.', 'warning');
      return;
    }

    const firstName = order.customerName.split(' ')[0];
    const itemsList = order.items
      .map(i => `• ${i.qty}x ${i.productName} (${i.variantName} - Talla ${i.size}${i.gender && i.gender !== 'Sin especificar' ? ` · ${i.gender}` : ''})`)
      .join('\n');
    const paid = getPaidAmount(order);
    const pending = getPendingAmount(order);
    const trackingUrl = getCustomerTrackingUrl(order);

    let statusMessage = '';
    if (order.shippingStatus === 'Enviado') {
      statusMessage = `¡Tu pedido de *MyFanBox* ya fue *ENVIADO*! 📦\n🚚 Envío GRATIS.\nTransportadora: *${order.carrier}*\nNúmero de guía: *${order.trackingNumber || 'Asignada'}*`;
    } else if (order.shippingStatus === 'Por enviar' && pending > 0) {
      statusMessage = `¡Tu pedido de *MyFanBox* ya está listo y empacado *POR ENVIAR*! ✨\n🚚 Recuerda: el envío es GRATIS.\nPara despacharlo hoy mismo con *${order.carrier}*, queda pendiente el saldo restante del 50% por valor de *${formatCOP(pending)}*.`;
    } else if (order.paymentStatus === 'Pendiente') {
      statusMessage = `Recibimos tu pedido en *MyFanBox*. Para agendar tus prendas en producción puedes abonar el 50% (*${formatCOP(Math.round(order.total * 0.5))}*) o el pago total (*${formatCOP(order.total)}*).`;
    } else if (order.paymentStatus === 'Semi-pagado (50%)') {
      statusMessage = `Confirmamos tu abono del 50% (*${formatCOP(paid)}*). Tus prendas están en preparación (${order.shippingStatus}). Saldo restante para completar el pago: *${formatCOP(pending)}*.`;
    } else {
      statusMessage = `Tu pedido está 100% pagado (*${formatCOP(order.total)}*) y en estado: *${order.shippingStatus}*.`;
    }

    const fullText = `¡Hola ${firstName}! Te escribimos de *MyFanBox* sobre tu pedido *${order.id}*:\n\n${statusMessage}\n\n🚚 *Todos nuestros envíos son GRATIS.*\n\n*Detalle de tu orden:*\n${itemsList}\n📍 Destino: ${order.city} (${order.address || 'Confirmar dirección'})\n\n🔒 *Enlace privado de tu factura y seguimiento en vivo:*\n${trackingUrl}`;
    window.open(`https://wa.me/${fullPhone}?text=${encodeURIComponent(fullText)}`, '_blank', 'noopener,noreferrer');
  };

  const handleBulkStatusUpdate = (type: 'payment' | 'shipping', newValue: string) => {
    if (selectedOrderIds.length === 0) return;
    setOrders(prev =>
      prev.map(o => {
        if (!selectedOrderIds.includes(o.id)) return o;
        if (type === 'payment') return { ...o, paymentStatus: newValue };
        const updatedItems =
          newValue === 'Por enviar' || newValue === 'Enviado'
            ? o.items.map(it => ({ ...it, packed: true }))
            : o.items;
        return { ...o, shippingStatus: newValue, items: updatedItems };
      })
    );
    notify(`${selectedOrderIds.length} pedidos actualizados a "${newValue}"`);
    setSelectedOrderIds([]);
  };

  const handleExportCSV = () => {
    const headers = [
      'ID', 'Fecha', 'Cliente', 'Cedula', 'Instagram', 'WhatsApp', 'Ciudad', 'Direccion', 'Latitud', 'Longitud',
      'Prendas', 'Total_COP', 'Pagado_COP', 'Saldo_Pendiente_COP',
      'Estado_Pago', 'Estado_Envio', 'Transportadora', 'Guia', 'Notas'
    ];
    const rows = filteredOrders.map(o => [
      o.id, o.createdAt, o.customerName, o.cedula || '', o.instagram, o.phone, o.city, o.address, o.lat ?? '', o.lng ?? '',
      o.items.map(i => `${i.qty}x ${i.productName} [${i.variantName} - Talla ${i.size} - ${i.gender || 'Sin especificar'}]`).join(' | '),
      o.total, getPaidAmount(o), getPendingAmount(o), o.paymentStatus, o.shippingStatus, o.carrier, o.trackingNumber, o.notes || ''
    ].map(val => `"${String(val ?? '').replace(/"/g, '""')}"`).join(','));

    const csv = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MyFanBox_Pedidos_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    notify(`${filteredOrders.length} pedidos exportados a Excel/CSV`);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <div className="bg-white border border-zinc-200 rounded-xl p-3">
          <div className="text-[11px] text-zinc-500 font-medium">Pedidos Activos</div>
          <div className="text-lg font-semibold text-zinc-900 tabular-nums mt-0.5">{metrics.activeOrdersCount}</div>
          <div className="text-[10px] text-zinc-400 mt-0.5">{metrics.cancelledOrders} canc · {metrics.refundedOrders} reemb</div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-3">
          <div className="text-[11px] text-zinc-500 font-medium">Recaudado (En Caja)</div>
          <div className="text-lg font-semibold text-emerald-700 tabular-nums mt-0.5">{formatCOP(metrics.collectedCash)}</div>
          <div className="text-[10px] text-zinc-400 mt-0.5">{metrics.countPagado} pagados + {metrics.countSemi} al 50%</div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-3">
          <div className="text-[11px] text-zinc-500 font-medium">Saldo por Cobrar</div>
          <div className="text-lg font-semibold text-amber-700 tabular-nums mt-0.5">{formatCOP(metrics.pendingToCollect)}</div>
          <div className="text-[10px] text-zinc-400 mt-0.5">{metrics.countPendiente} sin abono · {metrics.countSemi} deben 50%</div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-3">
          <div className="text-[11px] text-zinc-500 font-medium">Por Preparar / Hacer</div>
          <div className="text-lg font-semibold text-zinc-900 tabular-nums mt-0.5">{metrics.countPorPreparar}</div>
          <div className="text-[10px] text-zinc-400 mt-0.5">{productionMatrix.totalMissingToMake} prendas por estampar</div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-3">
          <div className="text-[11px] text-zinc-500 font-medium">Por Enviar / Enviados</div>
          <div className="text-lg font-semibold text-sky-700 tabular-nums mt-0.5">
            {metrics.countPorEnviar} <span className="text-zinc-300 font-normal">/</span> <span className="text-emerald-700">{metrics.countEnviado}</span>
          </div>
          <div className="text-[10px] text-zinc-400 mt-0.5">Paquetes listos vs despachados</div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-3">
          <div className="text-[11px] text-zinc-500 font-medium">Alerta Cobro Pre-Envío</div>
          <div className="text-lg font-semibold text-rose-700 tabular-nums mt-0.5">{metrics.shipWithDebtCount}</div>
          <div className="text-[10px] text-zinc-400 mt-0.5">Listos pero deben 50% o 100%</div>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl p-3.5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {[
              { id: 'ALL', label: 'Todos', count: orders.length, dot: 'bg-zinc-900' },
              { id: 'Pendiente', label: 'Pendiente', count: metrics.countPendiente, dot: 'bg-rose-500' },
              { id: 'Semi-pagado (50%)', label: 'Semi-pagado (50%)', count: metrics.countSemi, dot: 'bg-amber-500' },
              { id: 'Pagado', label: 'Pagado', count: metrics.countPagado, dot: 'bg-emerald-500' },
              { id: 'Por preparar', label: 'Por preparar', count: metrics.countPorPreparar, dot: 'bg-zinc-500' },
              { id: 'Por enviar', label: 'Por enviar', count: metrics.countPorEnviar, dot: 'bg-sky-500' },
              { id: 'Enviado', label: 'Enviado', count: metrics.countEnviado, dot: 'bg-emerald-600' },
              { id: 'Cancelado', label: 'Cancelado', count: metrics.cancelledOrders, dot: 'bg-zinc-400' },
              { id: 'Reembolsado', label: 'Reembolsado', count: metrics.refundedOrders, dot: 'bg-purple-500' },
              ...(metrics.shipWithDebtCount > 0
                ? [{ id: 'ALERT_COBROS', label: '⚠️ Cobrar antes de enviar', count: metrics.shipWithDebtCount, dot: 'bg-amber-600' }]
                : [])
            ].map(pill => {
              const active = quickStatusFilter === pill.id;
              return (
                <button
                  key={pill.id}
                  onClick={() => {
                    setQuickStatusFilter(pill.id);
                    setPayFilter('ALL');
                    setShipFilter('ALL');
                  }}
                  className={`h-7 px-2.5 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1.5 border transition-all cursor-pointer ${
                    active
                      ? 'bg-zinc-900 text-white border-zinc-900'
                      : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:text-zinc-900 hover:bg-zinc-100'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-white' : pill.dot}`} />
                  <span>{pill.label}</span>
                  <span className={`text-[10px] font-mono px-1 rounded ${active ? 'bg-zinc-700 text-zinc-100' : 'bg-white text-zinc-500'}`}>
                    {pill.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleExportCSV}
              className="h-7 px-2.5 rounded-lg border border-zinc-200 bg-white text-xs font-medium text-zinc-700 hover:bg-zinc-50 flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar CSV</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 pt-2 border-t border-zinc-100">
          <select
            value={payFilter}
            onChange={(e) => { setPayFilter(e.target.value); setQuickStatusFilter('ALL'); }}
            className="h-8 px-2.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-800 focus:outline-none focus:bg-white focus:border-zinc-900"
          >
            <option value="ALL">Estado de Pago: Todos</option>
            {PAYMENT_STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
          </select>

          <select
            value={shipFilter}
            onChange={(e) => { setShipFilter(e.target.value); setQuickStatusFilter('ALL'); }}
            className="h-8 px-2.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-800 focus:outline-none focus:bg-white focus:border-zinc-900"
          >
            <option value="ALL">Estado de Envío: Todos</option>
            {SHIPPING_STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
          </select>

          <select
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
            className="h-8 px-2.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-800 focus:outline-none focus:bg-white focus:border-zinc-900"
          >
            <option value="ALL">Prenda del Catálogo: Todas</option>
            {catalog.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>

          <div className="grid grid-cols-2 gap-1.5">
            <select
              value={sizeFilter}
              onChange={(e) => setSizeFilter(e.target.value)}
              className="h-8 px-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-800 focus:outline-none focus:bg-white focus:border-zinc-900"
            >
              <option value="ALL">Talla: Todas</option>
              {['XS', 'S', 'M', 'L', 'XL', '2XL', 'Única'].map(sz => <option key={sz} value={sz}>Talla {sz}</option>)}
            </select>

            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="h-8 px-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-800 focus:outline-none focus:bg-white focus:border-zinc-900"
            >
              <option value="ALL">Corte: Todos</option>
              {GARMENT_GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2">
            {(searchQuery || quickStatusFilter !== 'ALL' || payFilter !== 'ALL' || shipFilter !== 'ALL' || productFilter !== 'ALL' || sizeFilter !== 'ALL' || genderFilter !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setQuickStatusFilter('ALL');
                  setPayFilter('ALL');
                  setShipFilter('ALL');
                  setProductFilter('ALL');
                  setSizeFilter('ALL');
                  setGenderFilter('ALL');
                }}
                className="h-8 px-2.5 rounded-lg border border-zinc-200 bg-white text-xs text-zinc-700 hover:bg-zinc-50 cursor-pointer"
              >
                Limpiar filtros
              </button>
            )}
            <span className="text-xs font-mono text-zinc-500">
              {filteredOrders.length} resultado{filteredOrders.length === 1 ? '' : 's'}
            </span>
          </div>
        </div>

        {selectedOrderIds.length > 0 && (
          <div className="pt-2 border-t border-zinc-200 flex flex-wrap items-center justify-between gap-2 bg-zinc-900 text-white px-3 py-2 rounded-lg text-xs">
            <span className="font-medium">{selectedOrderIds.length} pedidos seleccionados</span>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-zinc-400 mr-1">Cambiar pago a:</span>
              {['Pagado', 'Semi-pagado (50%)', 'Pendiente', 'Cancelado'].map(st => (
                <button
                  key={st}
                  onClick={() => handleBulkStatusUpdate('payment', st)}
                  className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-100 cursor-pointer"
                >
                  {st}
                </button>
              ))}
              <span className="text-zinc-400 mx-1">| Envío a:</span>
              {SHIPPING_STATUSES.map(st => (
                <button
                  key={st}
                  onClick={() => handleBulkStatusUpdate('shipping', st)}
                  className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-100 cursor-pointer"
                >
                  {st}
                </button>
              ))}
              <button onClick={() => setSelectedOrderIds([])} className="ml-2 text-zinc-400 hover:text-white cursor-pointer">
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/80 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                <th className="py-2.5 px-3 w-9 text-center">
                  <input
                    type="checkbox"
                    checked={paginatedOrders.length > 0 && paginatedOrders.every(o => selectedOrderIds.includes(o.id))}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedOrderIds(paginatedOrders.map(o => o.id));
                      else setSelectedOrderIds([]);
                    }}
                    className="rounded border-zinc-300"
                  />
                </th>
                <th className="py-2.5 px-3 w-24">Orden</th>
                <th className="py-2.5 px-3 min-w-[180px]">Cliente & Ciudad</th>
                <th className="py-2.5 px-3 min-w-[260px]">Prendas Pedidas</th>
                <th className="py-2.5 px-3 min-w-[140px]">Total / Saldo</th>
                <th className="py-2.5 px-3 min-w-[165px]">Estado de Pago</th>
                <th className="py-2.5 px-3 min-w-[165px]">Estado de Envío</th>
                <th className="py-2.5 px-3 text-right min-w-[115px]">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 text-xs">
              {paginatedOrders.map(order => {
                const active = isOrderActive(order);
                const paid = getPaidAmount(order);
                const pending = getPendingAmount(order);
                const showDebtWarning =
                  active &&
                  (order.shippingStatus === 'Por enviar' || order.shippingStatus === 'Enviado') &&
                  pending > 0;

                return (
                  <tr
                    key={order.id}
                    className={`hover:bg-zinc-50/90 transition-colors ${!active ? 'bg-zinc-50/50 opacity-70' : ''}`}
                  >
                    <td className="py-3 px-3 align-top text-center">
                      <input
                        type="checkbox"
                        checked={selectedOrderIds.includes(order.id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedOrderIds(prev => [...prev, order.id]);
                          else setSelectedOrderIds(prev => prev.filter(id => id !== order.id));
                        }}
                        className="rounded border-zinc-300"
                      />
                    </td>

                    <td className="py-3 px-3 align-top">
                      <div className="font-mono font-semibold text-zinc-900">{order.id}</div>
                      <div className="text-[11px] text-zinc-400 tabular-nums mt-0.5">{order.createdAt}</div>
                      <div
                        onClick={() => copyToClipboard(getCustomerTrackingUrl(order), `Enlace privado UUID de ${order.id} copiado`)}
                        title={`UUID secreto: ${order.uuid}`}
                        className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-[9px] font-mono text-zinc-500 hover:text-zinc-900 cursor-pointer"
                      >
                        <Fingerprint className="w-2.5 h-2.5 text-sky-600" />
                        <span>{order.uuid.slice(0, 8)}…</span>
                      </div>
                    </td>

                    <td className="py-3 px-3 align-top">
                      <div className="font-medium text-zinc-900 flex items-center gap-1.5 flex-wrap">
                        <span>{order.customerName}</span>
                        {order.cedula && (
                          <span className="px-1.5 py-0.2 rounded bg-zinc-100 border border-zinc-200 text-[10px] font-mono text-zinc-700">
                            C.C. {order.cedula}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-zinc-500 flex flex-wrap items-center gap-1.5 mt-0.5">
                        <span>{order.instagram}</span>
                        <span>·</span>
                        <span className="font-mono">{order.phone}</span>
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5 truncate max-w-[210px]">
                        {order.city} {order.neighborhood ? `(${order.neighborhood})` : ''} — {order.address}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        {order.postalCode && (
                          <span className="px-1.5 py-0.2 rounded bg-zinc-100 border border-zinc-200 text-[10px] font-mono text-zinc-700">
                            CP {order.postalCode}
                          </span>
                        )}
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-medium border ${
                            order.addressVerified
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          {order.addressVerified ? '✓ Mapa OK' : 'Por corroborar'}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3 align-top space-y-1">
                      {order.items.map((it, idx) => (
                        <div key={idx} className={`flex items-center gap-1.5 leading-snug ${!active ? 'line-through text-zinc-400' : ''}`}>
                          <span className="font-mono font-semibold text-zinc-900">{it.qty}×</span>
                          <span className="font-medium text-zinc-900">{it.productName}</span>
                          <span className="text-zinc-500 truncate max-w-[130px]">· {it.variantName}</span>
                          <span className="px-1.5 py-0.2 bg-zinc-100 border border-zinc-200 rounded text-[10px] font-semibold text-zinc-800">
                            {it.size}
                          </span>
                          <span className="px-1.5 py-0.2 bg-zinc-50 border border-zinc-200 rounded text-[10px] text-zinc-600">
                            {it.gender || 'Sin especificar'}
                          </span>
                        </div>
                      ))}
                      {order.notes && <div className="text-[11px] text-zinc-500 italic">Nota: {order.notes}</div>}
                    </td>

                    <td className="py-3 px-3 align-top tabular-nums">
                      <div className="font-semibold text-zinc-900">{formatCOP(order.total)}</div>
                      {!active ? (
                        <div className="text-[11px] text-zinc-400">{order.paymentStatus}</div>
                      ) : pending > 0 ? (
                        <>
                          <div className="text-[11px] font-medium text-amber-700 mt-0.5">Debe: {formatCOP(pending)}</div>
                          <div className="text-[10px] text-zinc-400">Abonó: {formatCOP(paid)}</div>
                        </>
                      ) : (
                        <div className="text-[11px] font-medium text-emerald-700 mt-0.5">Pagado 100%</div>
                      )}
                    </td>

                    <td className="py-3 px-3 align-top">
                      <select
                        value={order.paymentStatus}
                        onChange={(e) => handleUpdateOrderPayment(order.id, e.target.value)}
                        className={`h-7 px-2 rounded-lg border text-xs font-medium cursor-pointer focus:outline-none ${getPayStatusBadgeClass(order.paymentStatus)}`}
                      >
                        {PAYMENT_STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
                      </select>
                    </td>

                    <td className="py-3 px-3 align-top">
                      <select
                        value={order.shippingStatus}
                        onChange={(e) => handleUpdateOrderShipping(order.id, e.target.value)}
                        className={`h-7 px-2 rounded-lg border text-xs font-medium cursor-pointer focus:outline-none ${getShipStatusBadgeClass(order.shippingStatus)}`}
                      >
                        {SHIPPING_STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
                      </select>

                      {showDebtWarning && (
                        <div className="mt-1.5 px-2 py-1 rounded-md bg-amber-100 border border-amber-300 text-[10px] font-semibold text-amber-900 leading-tight">
                          ⚠️ Cobrar saldo de {formatCOP(pending)} antes de enviar
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3 align-top text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => navigate(`/details/${order.uuid}`)}
                          className="h-7 px-2 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 font-medium inline-flex items-center gap-1 cursor-pointer"
                          title={`Abrir página privada /details/${order.uuid}`}
                        >
                          <FileText className="w-3.5 h-3.5 text-sky-600" />
                          <span>/details/</span>
                        </button>
                        <button
                          onClick={() => handleOpenWhatsApp(order)}
                          className="h-7 px-2 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 font-medium inline-flex items-center gap-1 cursor-pointer"
                          title="Enviar resumen y link UUID privado por WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>WA</span>
                        </button>
                        <button
                          onClick={() => onEditOrder(order)}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 cursor-pointer"
                          title="Editar pedido"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteOrder(order.id)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                          title="Eliminar pedido"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {paginatedOrders.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-zinc-500">
                    No se encontraron pedidos con los filtros actuales.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-2.5 border-t border-zinc-200 bg-zinc-50/60 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <span className="tabular-nums">
              Página {currentPage} de {totalPages} ({filteredOrders.length} pedidos)
            </span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="h-7 px-2 rounded border border-zinc-200 bg-white text-xs text-zinc-700"
            >
              <option value={25}>25 por página</option>
              <option value={50}>50 por página</option>
              <option value={150}>Ver todos (150)</option>
            </select>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="h-7 px-2.5 rounded border border-zinc-200 bg-white text-zinc-700 disabled:opacity-40 flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Anterior
            </button>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="h-7 px-2.5 rounded border border-zinc-200 bg-white text-zinc-700 disabled:opacity-40 flex items-center gap-1 cursor-pointer"
            >
              Siguiente <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
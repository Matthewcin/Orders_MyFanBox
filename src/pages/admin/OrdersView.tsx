import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardCheck,
  Copy,
  Download,
  Edit3,
  ExternalLink,
  MessageCircle,
  Trash2
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { Order } from '../../types';
import {
  PAYMENT_STATUSES,
  SHIPPING_STATUSES,
  ALL_GARMENT_SIZES,
  GARMENT_GENDERS
} from '../../utils/constants';
import {
  formatCOP,
  getPaidAmount,
  getPendingAmount,
  isOrderActive,
  isValidUUID,
  generateUUIDv4
} from '../../utils/helpers';

interface OrdersViewProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onEditOrder: (order: Order) => void;
  onOpenQuickCheck: () => void;
}

export default function OrdersView({
  searchQuery,
  setSearchQuery,
  onEditOrder,
  onOpenQuickCheck
}: OrdersViewProps) {
  const navigate = useNavigate();
  const {
    orders,
    catalog,
    metrics,
    productionMatrix,
    handleUpdateOrderPayment,
    handleUpdateOrderShipping,
    deleteOrder,
    notify
  } = useAdmin();

  const [quickFilter, setQuickFilter] = useState('ALL');
  const [payFilter, setPayFilter] = useState('ALL');
  const [shipFilter, setShipFilter] = useState('ALL');
  const [productFilter, setProductFilter] = useState('ALL');
  const [sizeFilter, setSizeFilter] = useState('ALL');
  const [genderFilter, setGenderFilter] = useState('ALL');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const missingInventoryMap = useMemo(() => {
    const map: Record<string, number> = {};
    (productionMatrix.rows || []).forEach((r: any) => {
      map[r.key] = Number(r.missing) || 0;
    });
    return map;
  }, [productionMatrix]);

  const getOrderVisualState = (order: Order) => {
    if (!isOrderActive(order)) {
      return {
        kind: 'inactive' as const,
        label: order.paymentStatus,
        rowStyle: {
          backgroundColor: 'rgba(113, 113, 122, 0.05)',
          boxShadow: 'inset 3px 0 0 rgba(113, 113, 122, 0.5)',
          opacity: 0.62
        },
        dotColor: '#71717a'
      };
    }

    if (order.shippingStatus === 'Enviado') {
      return {
        kind: 'shipped' as const,
        label: 'Enviado',
        rowStyle: {
          backgroundColor: 'rgba(16, 185, 129, 0.075)',
          boxShadow: 'inset 3px 0 0 rgba(16, 185, 129, 0.78)'
        },
        dotColor: '#10b981'
      };
    }

    if (order.shippingStatus === 'Por enviar') {
      return {
        kind: 'ready' as const,
        label: 'Listo · Por enviar',
        rowStyle: {
          backgroundColor: 'rgba(14, 165, 233, 0.085)',
          boxShadow: 'inset 3px 0 0 rgba(14, 165, 233, 0.8)'
        },
        dotColor: '#0ea5e9'
      };
    }

    const needsInventory = (order.items || []).some(it => {
      if (it.packed) return false;
      const p = catalog.find(c => c.id === it.productId);
      const v =
        p?.variants.find(vx => vx.id === it.variantId || vx.name === it.variantName) ||
        p?.variants[0];
      const key = `${p?.id || it.productId}|||${v?.id || it.variantId || it.variantName}|||${it.size || 'M'}`;
      return (missingInventoryMap[key] || 0) > 0;
    });

    if (needsInventory) {
      return {
        kind: 'needs-inventory' as const,
        label: 'Falta en inventario',
        rowStyle: {
          backgroundColor: 'rgba(245, 158, 11, 0.065)',
          boxShadow: 'inset 3px 0 0 rgba(245, 158, 11, 0.72)'
        },
        dotColor: '#f59e0b'
      };
    }

    return {
      kind: 'in-stock' as const,
      label: 'En inventario · Empacar',
      rowStyle: {
        backgroundColor: 'rgba(139, 92, 246, 0.07)',
        boxShadow: 'inset 3px 0 0 rgba(139, 92, 246, 0.75)'
      },
      dotColor: '#8b5cf6'
    };
  };

  const filteredOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return orders.filter(order => {
      if (quickFilter === 'Pendiente' && order.paymentStatus !== 'Pendiente') return false;
      if (quickFilter === 'Semi-pagado (50%)' && order.paymentStatus !== 'Semi-pagado (50%)') return false;
      if (quickFilter === 'Pagado' && order.paymentStatus !== 'Pagado') return false;
      if (quickFilter === 'Por preparar' && (!isOrderActive(order) || order.shippingStatus !== 'Por preparar')) return false;
      if (quickFilter === 'Por enviar' && (!isOrderActive(order) || order.shippingStatus !== 'Por enviar')) return false;
      if (quickFilter === 'Enviado' && (!isOrderActive(order) || order.shippingStatus !== 'Enviado')) return false;
      if (quickFilter === 'Cancelado' && order.paymentStatus !== 'Cancelado') return false;
      if (quickFilter === 'Reembolsado' && order.paymentStatus !== 'Reembolsado') return false;

      if (payFilter !== 'ALL' && order.paymentStatus !== payFilter) return false;
      if (shipFilter !== 'ALL' && order.shippingStatus !== shipFilter) return false;
      if (productFilter !== 'ALL' && !order.items.some(i => i.productId === productFilter || i.productName === productFilter)) return false;
      if (sizeFilter !== 'ALL' && !order.items.some(i => i.size === sizeFilter)) return false;
      if (genderFilter !== 'ALL' && !order.items.some(i => (i.gender || 'Sin especificar') === genderFilter)) return false;

      if (q) {
        const haystack = [
          order.id,
          order.uuid,
          order.customerName,
          order.cedula,
          order.instagram,
          order.phone,
          order.city,
          order.neighborhood,
          order.address,
          order.trackingNumber,
          order.carrier,
          order.notes,
          ...order.items.map(i => `${i.productName} ${i.variantName} ${i.size} ${i.gender}`)
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }, [orders, searchQuery, quickFilter, payFilter, shipFilter, productFilter, sizeFilter, genderFilter]);

  const allVisibleSelected =
    filteredOrders.length > 0 && filteredOrders.every(o => selectedIds.includes(o.id));

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredOrders.map(o => o.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  const handleBulkShipping = (newStatus: string) => {
    selectedIds.forEach(id => handleUpdateOrderShipping(id, newStatus));
    setSelectedIds([]);
  };

  const handleBulkPayment = (newStatus: string) => {
    selectedIds.forEach(id => handleUpdateOrderPayment(id, newStatus));
    setSelectedIds([]);
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
      .map(i => {
        const genderPart = i.gender && i.gender !== 'Sin especificar' ? ` · ${i.gender}` : '';
        return `• ${i.qty}x ${i.productName} (${i.variantName} - Talla ${i.size}${genderPart})`;
      })
      .join('\n');
    const paid = getPaidAmount(order);
    const pending = getPendingAmount(order);
    const orderUuid = isValidUUID(order.uuid) ? order.uuid : generateUUIDv4();
    const trackingUrl = `${window.location.origin}/details/${orderUuid}`;
    const trackingText = order.trackingNumber ? order.trackingNumber : 'Asignada';
    const addressText = order.address ? order.address : 'Confirmar dirección';

    let statusMessage = '';
    if (order.shippingStatus === 'Enviado') {
      statusMessage = `¡Tu pedido de *MyFanBox* ya fue *ENVIADO*! 📦\n🚚 Envío GRATIS.\nTransportadora: *${order.carrier}*\nNúmero de guía: *${trackingText}*`;
    } else if (order.shippingStatus === 'Por enviar' && pending > 0) {
      statusMessage = `¡Tu pedido de *MyFanBox* ya está listo y empacado *POR ENVIAR*! ✨\n🚚 Recuerda: el envío es GRATIS.\nPara despacharlo hoy mismo con *${order.carrier}*, queda pendiente el saldo restante del 50% por valor de *${formatCOP(pending)}*.`;
    } else if (order.paymentStatus === 'Pendiente') {
      statusMessage = `Recibimos tu pedido en *MyFanBox*. Para agendar tus prendas en producción puedes abonar el 50% (*${formatCOP(Math.round(order.total * 0.5))}*) o el pago total (*${formatCOP(order.total)}*).`;
    } else if (order.paymentStatus === 'Semi-pagado (50%)') {
      statusMessage = `Confirmamos tu abono del 50% (*${formatCOP(paid)}*). Tus prendas están en preparación (${order.shippingStatus}). Saldo restante para completar el pago: *${formatCOP(pending)}*.`;
    } else {
      statusMessage = `Tu pedido está 100% pagado (*${formatCOP(order.total)}*) y en estado: *${order.shippingStatus}*.`;
    }

    const fullText = `¡Hola ${firstName}! Te escribimos de *MyFanBox* sobre tu pedido *${order.id}*:\n\n${statusMessage}\n\n🚚 *Todos nuestros envíos son GRATIS.*\n\n*Detalle de tu orden:*\n${itemsList}\n📍 Destino: ${order.city} (${addressText})\n\n🔒 *Enlace privado de tu factura y seguimiento en vivo:*\n${trackingUrl}`;
    window.open(`https://wa.me/${fullPhone}?text=${encodeURIComponent(fullText)}`, '_blank', 'noopener,noreferrer');
  };

  const handleExportCsv = () => {
    const headers = [
      'Orden',
      'Fecha',
      'Cliente',
      'Cedula',
      'Telefono',
      'Instagram',
      'Ciudad',
      'Barrio',
      'Direccion',
      'Prendas',
      'Total',
      'EstadoPago',
      'EstadoEnvio',
      'Transportadora',
      'Guia',
      'UUID'
    ];
    const rows = filteredOrders.map(o => [
      o.id,
      o.createdAt,
      o.customerName,
      o.cedula || '',
      o.phone || '',
      o.instagram || '',
      o.city || '',
      o.neighborhood || '',
      o.address || '',
      o.items.map(i => `${i.qty}x ${i.productName} (${i.variantName} ${i.size} ${i.gender})`).join(' | '),
      o.total,
      o.paymentStatus,
      o.shippingStatus,
      o.carrier,
      o.trackingNumber || '',
      o.uuid
    ]);
    const csvContent = [headers, ...rows]
      .map(cols => cols.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `myfanbox_pedidos_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    notify('CSV exportado');
  };

  const quickTabs = [
    { id: 'ALL', label: 'Todos', count: orders.length, dot: '' },
    { id: 'Pendiente', label: 'Pendiente', count: metrics.countPendiente, dot: '#f43f5e' },
    { id: 'Semi-pagado (50%)', label: 'Semi-pagado (50%)', count: metrics.countSemi, dot: '#f59e0b' },
    { id: 'Pagado', label: 'Pagado', count: metrics.countPagado, dot: '#10b981' },
    { id: 'Por preparar', label: 'Por preparar', count: metrics.countPorPreparar, dot: '#a1a1aa' },
    { id: 'Por enviar', label: 'Por enviar', count: metrics.countPorEnviar, dot: '#0ea5e9' },
    { id: 'Enviado', label: 'Enviado', count: metrics.countEnviado, dot: '#10b981' },
    { id: 'Cancelado', label: 'Cancelado', count: metrics.cancelledOrders, dot: '#71717a' },
    { id: 'Reembolsado', label: 'Reembolsado', count: metrics.refundedOrders, dot: '#a855f7' }
  ];

  return (
    <div className="space-y-3">
      <section className="bg-white border border-zinc-200 rounded-2xl p-3.5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {quickTabs.map(tab => {
              const active = quickFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setQuickFilter(tab.id)}
                  className={`h-8 px-2.5 rounded-lg border text-xs font-medium inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                    active
                      ? 'bg-zinc-900 text-white border-zinc-900'
                      : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                  }`}
                >
                  {tab.dot && (
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: tab.dot }}
                    />
                  )}
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                      active ? 'bg-zinc-800 text-zinc-200' : 'bg-white border border-zinc-200 text-zinc-500'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenQuickCheck}
              className="h-8 px-3 rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <ClipboardCheck className="w-3.5 h-3.5" />
              <span>¿Está hecho?</span>
            </button>
            <button
              type="button"
              onClick={handleExportCsv}
              className="h-8 px-3 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-medium text-zinc-700 inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar CSV</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-100">
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={payFilter}
              onChange={e => setPayFilter(e.target.value)}
              className="h-8 px-2.5 rounded-lg border border-zinc-200 bg-zinc-50 text-xs text-zinc-900"
            >
              <option value="ALL">Estado de Pago: Todos</option>
              {PAYMENT_STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
            </select>

            <select
              value={shipFilter}
              onChange={e => setShipFilter(e.target.value)}
              className="h-8 px-2.5 rounded-lg border border-zinc-200 bg-zinc-50 text-xs text-zinc-900"
            >
              <option value="ALL">Estado de Envío: Todos</option>
              {SHIPPING_STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
            </select>

            <select
              value={productFilter}
              onChange={e => setProductFilter(e.target.value)}
              className="h-8 px-2.5 rounded-lg border border-zinc-200 bg-zinc-50 text-xs text-zinc-900 max-w-[200px]"
            >
              <option value="ALL">Prenda del Catálogo: Todas</option>
              {catalog.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>

            <select
              value={sizeFilter}
              onChange={e => setSizeFilter(e.target.value)}
              className="h-8 px-2.5 rounded-lg border border-zinc-200 bg-zinc-50 text-xs text-zinc-900"
            >
              <option value="ALL">Talla: Todas</option>
              {[...ALL_GARMENT_SIZES, 'Única'].map(sz => <option key={sz} value={sz}>{sz}</option>)}
            </select>

            <select
              value={genderFilter}
              onChange={e => setGenderFilter(e.target.value)}
              className="h-8 px-2.5 rounded-lg border border-zinc-200 bg-zinc-50 text-xs text-zinc-900"
            >
              <option value="ALL">Corte: Todos</option>
              {GARMENT_GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>

            {(quickFilter !== 'ALL' || payFilter !== 'ALL' || shipFilter !== 'ALL' || productFilter !== 'ALL' || sizeFilter !== 'ALL' || genderFilter !== 'ALL' || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setQuickFilter('ALL');
                  setPayFilter('ALL');
                  setShipFilter('ALL');
                  setProductFilter('ALL');
                  setSizeFilter('ALL');
                  setGenderFilter('ALL');
                  setSearchQuery('');
                }}
                className="h-8 px-2.5 rounded-lg text-xs text-zinc-500 hover:text-zinc-900 underline cursor-pointer"
              >
                Limpiar filtros
              </button>
            )}
          </div>

          <span className="text-xs font-mono text-zinc-500">
            {filteredOrders.length} resultados
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-100 text-[11px] text-zinc-500">
          <div className="flex flex-wrap items-center gap-3.5">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: '#f59e0b' }} />
              <span>Falta en inventario</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: '#8b5cf6' }} />
              <span>En inventario (falta empacar)</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: '#0ea5e9' }} />
              <span>Hecho · Por enviar</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: '#10b981' }} />
              <span>Enviado</span>
            </span>
          </div>

          {selectedIds.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-semibold text-zinc-900">{selectedIds.length} seleccionados:</span>
              <button
                type="button"
                onClick={() => handleBulkShipping('Por enviar')}
                className="px-2 py-1 rounded-md border border-zinc-200 bg-zinc-50 text-zinc-800 hover:bg-zinc-100 cursor-pointer"
              >
                Por enviar
              </button>
              <button
                type="button"
                onClick={() => handleBulkShipping('Enviado')}
                className="px-2 py-1 rounded-md border border-zinc-200 bg-zinc-50 text-zinc-800 hover:bg-zinc-100 cursor-pointer"
              >
                Enviado
              </button>
              <button
                type="button"
                onClick={() => handleBulkPayment('Pagado')}
                className="px-2 py-1 rounded-md border border-zinc-200 bg-zinc-50 text-zinc-800 hover:bg-zinc-100 cursor-pointer"
              >
                Pagado
              </button>
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="px-2 py-1 text-zinc-400 hover:text-zinc-900 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-[10px] uppercase tracking-wider text-zinc-500">
              <tr>
                <th className="p-3 w-8">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={toggleSelectAll}
                    className="rounded border-zinc-300 cursor-pointer"
                  />
                </th>
                <th className="p-3">Orden</th>
                <th className="p-3">Cliente & Ciudad</th>
                <th className="p-3">Prendas Pedidas</th>
                <th className="p-3">Total / Saldo</th>
                <th className="p-3">Estado de Pago</th>
                <th className="p-3">Estado de Envío</th>
                <th className="p-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {filteredOrders.map(order => {
                const paid = getPaidAmount(order);
                const pending = getPendingAmount(order);
                const visual = getOrderVisualState(order);

                return (
                  <tr
                    key={order.id}
                    style={visual.rowStyle}
                    className="transition-colors hover:brightness-105"
                  >
                    <td className="p-3 align-top">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(order.id)}
                        onChange={() => toggleSelectOne(order.id)}
                        className="rounded border-zinc-300 cursor-pointer mt-1"
                      />
                    </td>

                    <td className="p-3 align-top whitespace-nowrap">
                      <div className="font-mono font-bold text-zinc-900">{order.id}</div>
                      <div className="text-[11px] text-zinc-500 mt-0.5">{order.createdAt || '—'}</div>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(`${window.location.origin}/details/${order.uuid}`);
                          notify(`Link privado de ${order.id} copiado`);
                        }}
                        title="Copiar enlace de seguimiento"
                        className="mt-1 inline-flex items-center gap-1 font-mono text-[10px] text-zinc-400 hover:text-zinc-900 cursor-pointer"
                      >
                        <Copy className="w-2.5 h-2.5" />
                        <span>{String(order.uuid || '').slice(0, 8)}</span>
                      </button>
                      <div className="mt-1.5 inline-flex items-center gap-1.5 text-[10px] font-medium text-zinc-500">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: visual.dotColor }}
                        />
                        <span>{visual.label}</span>
                      </div>
                    </td>

                    <td className="p-3 align-top min-w-[200px]">
                      <div className="font-semibold text-zinc-900">
                        {order.customerName}{' '}
                        {order.cedula && (
                          <span className="font-mono text-[10px] text-zinc-500 font-normal">
                            C.C. {order.cedula}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-zinc-500 mt-0.5">
                        {order.instagram ? `${order.instagram} · ` : ''}
                        {order.phone || 'Sin teléfono'}
                      </div>
                      <div className="text-[11px] text-zinc-600 mt-0.5">
                        {order.city}
                        {order.neighborhood ? ` (${order.neighborhood})` : ''}
                        {order.address ? ` — ${order.address}` : ''}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        {order.postalCode && (
                          <span className="text-[10px] font-mono text-zinc-400">
                            CP {order.postalCode}
                          </span>
                        )}
                        {order.addressVerified && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-semibold">
                            ✓ Mapa OK
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-3 align-top min-w-[240px]">
                      <div className="space-y-1">
                        {order.items.map((it, idx) => (
                          <div key={it.id || idx} className="text-[11px] leading-snug">
                            <span className="font-semibold text-zinc-900">
                              {it.qty}× {it.productName}
                            </span>
                            <span className="text-zinc-500">
                              {' '}· {it.variantName} · <strong className="text-zinc-800">{it.size}</strong> · {it.gender || 'Sin especificar'}
                            </span>
                          </div>
                        ))}
                      </div>
                      {order.notes && (
                        <div className="mt-1.5 text-[10px] text-amber-700 font-medium">
                          Nota: {order.notes}
                        </div>
                      )}
                    </td>

                    <td className="p-3 align-top whitespace-nowrap tabular-nums">
                      <div className="font-bold text-zinc-900">{formatCOP(order.total)}</div>
                      {!isOrderActive(order) ? (
                        <div className="text-[11px] text-zinc-400 mt-0.5">{order.paymentStatus}</div>
                      ) : pending === 0 ? (
                        <div className="text-[11px] text-emerald-700 font-medium mt-0.5">
                          Pagado 100%
                        </div>
                      ) : (
                        <div className="text-[11px] mt-0.5 space-y-0.5">
                          <div className="text-amber-700 font-semibold">
                            Debe: {formatCOP(pending)}
                          </div>
                          <div className="text-zinc-500">
                            Abonó: {formatCOP(paid)}
                          </div>
                        </div>
                      )}
                    </td>

                    <td className="p-3 align-top">
                      <select
                        value={order.paymentStatus}
                        onChange={e => handleUpdateOrderPayment(order.id, e.target.value)}
                        className="h-8 px-2 rounded-lg border border-zinc-200 bg-zinc-50 text-xs font-medium text-zinc-900 cursor-pointer"
                      >
                        {PAYMENT_STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
                      </select>
                    </td>

                    <td className="p-3 align-top">
                      <select
                        value={order.shippingStatus}
                        onChange={e => handleUpdateOrderShipping(order.id, e.target.value)}
                        className="h-8 px-2 rounded-lg border border-zinc-200 bg-zinc-50 text-xs font-medium text-zinc-900 cursor-pointer"
                      >
                        {SHIPPING_STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
                      </select>
                    </td>

                    <td className="p-3 align-top text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => navigate(`/details/${order.uuid}`)}
                          className="h-7 px-2 rounded-lg border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-[11px] font-mono text-zinc-700 inline-flex items-center gap-1 cursor-pointer"
                          title="Abrir seguimiento / factura"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>/details/</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenWhatsApp(order)}
                          className="h-7 px-2 rounded-lg border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-[11px] font-semibold text-emerald-700 inline-flex items-center gap-1 cursor-pointer"
                          title="Escribir por WhatsApp"
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span>WA</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onEditOrder(order)}
                          className="h-7 w-7 rounded-lg border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-600 inline-flex items-center justify-center cursor-pointer"
                          title="Editar pedido"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`¿Eliminar el pedido ${order.id} de ${order.customerName}?`)) {
                              deleteOrder(order.id);
                            }
                          }}
                          className="h-7 w-7 rounded-lg border border-zinc-200 bg-zinc-50 hover:bg-rose-50 text-zinc-500 hover:text-rose-600 inline-flex items-center justify-center cursor-pointer"
                          title="Eliminar pedido"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-xs text-zinc-500">
                    No hay pedidos que coincidan con los filtros actuales.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
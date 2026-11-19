import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, Clock, Package, Truck } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { Order } from '../../types';
import { CARRIERS, SHIPPING_STATUSES } from '../../utils/constants';
import {
  formatCOP,
  isOrderActive,
  getPaidAmount,
  getPendingAmount,
  isValidUUID,
  generateUUIDv4
} from '../../utils/helpers';

export default function ShippingView() {
  const navigate = useNavigate();
  const {
    orders,
    metrics,
    handleUpdateOrderField,
    handleUpdateOrderShipping,
    notify
  } = useAdmin();

  const [shippingBoardFilter, setShippingBoardFilter] = useState('ALL');

  const getShipStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Enviado': return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Por enviar': return 'bg-sky-50 text-sky-800 border-sky-200 font-semibold';
      case 'Por preparar': return 'bg-zinc-100 text-zinc-800 border-zinc-300';
      default: return 'bg-zinc-100 text-zinc-700 border-zinc-200';
    }
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
    const orderUuid = isValidUUID(order.uuid) ? order.uuid : generateUUIDv4();
    const trackingUrl = `${window.location.origin}/details/${orderUuid}`;

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

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-base sm:text-lg font-semibold text-zinc-900">
            Tablero de Envíos, Transportadoras y Guías
          </h1>
          <p className="text-xs text-zinc-500">
            Verifica que ningún paquete en <strong>"Por enviar"</strong> salga sin haber cobrado el 50% restante.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={shippingBoardFilter}
            onChange={(e) => setShippingBoardFilter(e.target.value)}
            className="h-8 px-3 text-xs bg-white border border-zinc-200 rounded-lg text-zinc-800"
          >
            <option value="ALL">Ver: Todos los activos ({metrics.activeOrdersCount})</option>
            <option value="Por enviar">Solo: Por enviar ({metrics.countPorEnviar})</option>
            <option value="Por preparar">Solo: Por preparar ({metrics.countPorPreparar})</option>
            <option value="Enviado">Solo: Enviados ({metrics.countEnviado})</option>
            <option value="DEBT_ALERT">⚠️ Solo: Listos con saldo pendiente ({metrics.shipWithDebtCount})</option>
          </select>

          <button
            onClick={() => {
              const ready = orders.filter(o => isOrderActive(o) && o.shippingStatus === 'Por enviar');
              if (!ready.length) {
                notify('No hay paquetes en estado "Por enviar"');
                return;
              }
              const txt =
                `*PLANILLA DE DESPACHO — MYFANBOX (${ready.length} paquetes)*\n` +
                ready
                  .map(
                    o =>
                      `• ${o.id} | ${o.customerName} | Tel: ${o.phone} | ${o.city} (${o.address}) | ${o.carrier} ${
                        getPendingAmount(o) > 0 ? `[⚠️ COBRAR ANTES: ${formatCOP(getPendingAmount(o))}]` : '[100% PAGADO]'
                      }`
                  )
                  .join('\n');
              copyToClipboard(txt, 'Planilla de envíos copiada');
            }}
            className="h-8 px-3 rounded-lg bg-zinc-900 text-white text-xs font-medium hover:bg-zinc-800 inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copiar planilla de despacho</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div
          onClick={() => setShippingBoardFilter('Por preparar')}
          className="bg-white border border-zinc-200 rounded-xl p-3.5 cursor-pointer hover:border-zinc-400 transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>1. Por preparar (En taller/empaque)</span>
            <Clock className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-xl font-semibold text-zinc-900 tabular-nums mt-1">
            {metrics.countPorPreparar} paquetes
          </div>
        </div>

        <div
          onClick={() => setShippingBoardFilter('Por enviar')}
          className="bg-white border border-sky-200 rounded-xl p-3.5 cursor-pointer hover:border-sky-400 transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-sky-800 font-medium">
            <span>2. Por enviar (Empacados listos)</span>
            <Package className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-xl font-semibold text-sky-900 tabular-nums mt-1">
            {metrics.countPorEnviar} paquetes
          </div>
          {metrics.shipWithDebtCount > 0 && (
            <div className="text-[11px] font-semibold text-amber-800 mt-1">
              ⚠️ {metrics.shipWithDebtCount} tienen saldo pendiente por cobrar
            </div>
          )}
        </div>

        <div
          onClick={() => setShippingBoardFilter('Enviado')}
          className="bg-white border border-emerald-200 rounded-xl p-3.5 cursor-pointer hover:border-emerald-400 transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-emerald-800 font-medium">
            <span>3. Enviados (Con guía asignada)</span>
            <Truck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-semibold text-emerald-900 tabular-nums mt-1">
            {metrics.countEnviado} paquetes
          </div>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/80 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                <th className="py-2.5 px-4 w-24">Orden</th>
                <th className="py-2.5 px-4 min-w-[180px]">Destinatario & Teléfono</th>
                <th className="py-2.5 px-4 min-w-[200px]">Ciudad & Dirección</th>
                <th className="py-2.5 px-4 min-w-[185px]">Verificación de Pago</th>
                <th className="py-2.5 px-4 min-w-[155px]">Transportadora</th>
                <th className="py-2.5 px-4 min-w-[160px]">Número de Guía</th>
                <th className="py-2.5 px-4 min-w-[140px]">Estado Envío</th>
                <th className="py-2.5 px-4 text-right">Aviso WA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 text-xs">
              {orders
                .filter(o => {
                  if (!isOrderActive(o)) return false;
                  if (shippingBoardFilter === 'ALL') return true;
                  if (shippingBoardFilter === 'DEBT_ALERT') {
                    return (
                      (o.shippingStatus === 'Por enviar' || o.shippingStatus === 'Enviado') &&
                      getPendingAmount(o) > 0
                    );
                  }
                  return o.shippingStatus === shippingBoardFilter;
                })
                .slice(0, 60)
                .map(order => {
                  const pending = getPendingAmount(order);
                  return (
                    <tr key={order.id} className="hover:bg-zinc-50/80">
                      <td className="py-3 px-4 font-mono font-semibold text-zinc-900">{order.id}</td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-zinc-900">{order.customerName}</div>
                        {order.cedula && <div className="text-[11px] font-mono text-zinc-600">C.C. {order.cedula}</div>}
                        <div className="text-[11px] text-zinc-500 font-mono">{order.phone}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-zinc-800">{order.city}</div>
                        <input
                          type="text"
                          value={order.address || ''}
                          onChange={(e) => handleUpdateOrderField(order.id, 'address', e.target.value)}
                          placeholder="Dirección..."
                          className="mt-0.5 w-full h-7 px-2 text-xs bg-zinc-50 border border-zinc-200 rounded text-zinc-800 focus:bg-white focus:border-zinc-900 focus:outline-none"
                        />
                      </td>
                      <td className="py-3 px-4 tabular-nums">
                        {pending > 0 ? (
                          <div className="inline-flex flex-col px-2.5 py-1 rounded-lg bg-amber-100/80 border border-amber-300 text-amber-950">
                            <span className="font-semibold text-[11px]">⚠️ Cobrar saldo de {formatCOP(pending)}</span>
                            <span className="text-[10px] text-amber-800">Estado actual: {order.paymentStatus}</span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium">
                            ✓ Pagado 100% ({formatCOP(order.total)})
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={order.carrier || 'Interrapidísimo'}
                          onChange={(e) => handleUpdateOrderField(order.id, 'carrier', e.target.value)}
                          className="w-full h-7 px-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-800"
                        >
                          {CARRIERS.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={order.trackingNumber || ''}
                          onChange={(e) => handleUpdateOrderField(order.id, 'trackingNumber', e.target.value)}
                          placeholder="Pegar # guía..."
                          className="w-full h-7 px-2.5 font-mono text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 focus:bg-white focus:border-zinc-900 focus:outline-none"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={order.shippingStatus}
                          onChange={(e) => handleUpdateOrderShipping(order.id, e.target.value)}
                          className={`h-7 px-2 rounded-lg border text-xs font-medium cursor-pointer ${getShipStatusBadgeClass(order.shippingStatus)}`}
                        >
                          {SHIPPING_STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
                        </select>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => navigate(`/details/${order.uuid}`)}
                            className="h-7 px-2 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-medium text-zinc-800 cursor-pointer"
                            title={`Abrir factura privada /details/${order.uuid}`}
                          >
                            /details/
                          </button>
                          <button
                            onClick={() => handleOpenWhatsApp(order)}
                            className="h-7 px-2.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-medium text-zinc-800 cursor-pointer"
                          >
                            Enviar WA
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
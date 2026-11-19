import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import InteractiveManualPinMap from '../../components/InteractiveManualPinMap';
import { COLOMBIA_CITIES_GEO, CARRIERS, SHIPPING_STATUSES } from '../../utils/constants';
import {
  isOrderActive,
  calculateOrderETA,
  inferMetadataFromCoordinates,
  reverseGeocodeFromCoordinates,
  parseCoordsFromInput,
  formatCOP,
  getPaidAmount,
  getPendingAmount,
  isValidUUID,
  generateUUIDv4
} from '../../utils/helpers';
import { Order } from '../../types';

export default function MapView() {
  const navigate = useNavigate();
  const {
    orders,
    setOrders,
    originHub,
    setOriginHub,
    googleMapsApiKey,
    handleUpdateOrderField,
    notify
  } = useAdmin();

  const [mapCarrierFilter, setMapCarrierFilter] = useState('ALL');
  const [mapStatusFilter, setMapStatusFilter] = useState('ALL');
  const [selectedMapOrderId, setSelectedMapOrderId] = useState('');
  const [mapEngine, setMapEngine] = useState<'manual-pin' | 'gmaps'>('manual-pin');
  const [mapCoordPaste, setMapCoordPaste] = useState('');

  const mapOrdersWithGeo = useMemo(() => {
    return orders
      .filter(isOrderActive)
      .filter(o => {
        if (mapCarrierFilter !== 'ALL' && o.carrier !== mapCarrierFilter) return false;
        if (mapStatusFilter !== 'ALL' && o.shippingStatus !== mapStatusFilter) return false;
        return true;
      })
      .map(order => ({
        order,
        eta: calculateOrderETA(order, originHub)
      }));
  }, [orders, originHub, mapCarrierFilter, mapStatusFilter]);

  const selectedMapEntry = useMemo(() => {
    if (!mapOrdersWithGeo.length) return null;
    return mapOrdersWithGeo.find(item => item.order.id === selectedMapOrderId) || mapOrdersWithGeo[0];
  }, [mapOrdersWithGeo, selectedMapOrderId]);

  const getShipStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Enviado': return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Por enviar': return 'bg-sky-50 text-sky-800 border-sky-200 font-semibold';
      case 'Por preparar': return 'bg-zinc-100 text-zinc-800 border-zinc-300';
      default: return 'bg-zinc-100 text-zinc-700 border-zinc-200';
    }
  };

  const getGoogleMapsEmbedUrl = (order: Order) => {
    const useCoords = order.manualPin && typeof order.lat === 'number' && typeof order.lng === 'number';
    const addressText = order.address ? order.address : '';
    const neighborhoodText = order.neighborhood ? order.neighborhood : '';
    const cityText = order.city ? order.city : 'Medellín';
    const query = useCoords
      ? [order.lat, order.lng].join(',')
      : [addressText, neighborhoodText, cityText, 'Colombia'].join(', ');
    return 'https://maps.google.com/maps?q=' + encodeURIComponent(query) + '&z=16&output=embed';
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

  return (
    <div className="space-y-4">
      <section className="bg-white border border-zinc-200 rounded-xl p-4 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-sky-600" /> Mapa de envíos y ETA
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              Direcciones de pedidos activos guardados en NeonDB.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <label className="text-xs text-zinc-500">Despacho desde</label>
            <select
              value={originHub}
              onChange={e => setOriginHub(e.target.value)}
              className="h-8 px-2 rounded-lg border border-zinc-200 bg-zinc-50 text-xs text-zinc-900"
            >
              {Object.keys(COLOMBIA_CITIES_GEO).map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            <select
              value={mapCarrierFilter}
              onChange={e => setMapCarrierFilter(e.target.value)}
              className="h-8 px-2 rounded-lg border border-zinc-200 bg-zinc-50 text-xs text-zinc-900"
            >
              <option value="ALL">Todas las transportadoras</option>
              {CARRIERS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              value={mapStatusFilter}
              onChange={e => setMapStatusFilter(e.target.value)}
              className="h-8 px-2 rounded-lg border border-zinc-200 bg-zinc-50 text-xs text-zinc-900"
            >
              <option value="ALL">Todos los estados</option>
              {SHIPPING_STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
            </select>
          </div>
        </div>

        {selectedMapEntry ? (
          <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_1fr] gap-3">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="inline-flex p-0.5 rounded-lg bg-zinc-100 border border-zinc-200 text-xs">
                  <button
                    type="button"
                    onClick={() => setMapEngine('manual-pin')}
                    className={`px-2.5 py-1 rounded-md font-medium cursor-pointer ${
                      mapEngine === 'manual-pin' ? 'bg-white text-zinc-900 shadow-2xs' : 'text-zinc-600'
                    }`}
                  >
                    📍 Mover Pin Manualmente
                  </button>
                  <button
                    type="button"
                    onClick={() => setMapEngine('gmaps')}
                    className={`px-2.5 py-1 rounded-md font-medium cursor-pointer ${
                      mapEngine === 'gmaps' ? 'bg-white text-zinc-900 shadow-2xs' : 'text-zinc-600'
                    }`}
                  >
                    Google Maps Vista Calle
                  </button>
                </div>
                <span className="text-[11px] font-mono text-zinc-500">
                  Coordenadas: {selectedMapEntry.eta.coords.lat}, {selectedMapEntry.eta.coords.lng}
                </span>
              </div>

              {mapEngine === 'manual-pin' ? (
                <InteractiveManualPinMap
                  lat={selectedMapEntry.eta.coords.lat}
                  lng={selectedMapEntry.eta.coords.lng}
                  title={`${selectedMapEntry.order.id} · ${selectedMapEntry.order.customerName}`}
                  subtitle={`${selectedMapEntry.order.address || ''}, ${selectedMapEntry.order.city}`}
                  heightClass="h-[360px]"
                  onPinChange={async (newLat, newLng) => {
                    const targetId = selectedMapEntry.order.id;
                    const quick = inferMetadataFromCoordinates(newLat, newLng);
                    setOrders(prev =>
                      prev.map(o =>
                        o.id === targetId
                          ? {
                              ...o,
                              lat: newLat,
                              lng: newLng,
                              city: quick.city,
                              neighborhood: quick.neighborhood,
                              postalCode: quick.postalCode,
                              manualPin: true,
                              addressVerified: true
                            }
                          : o
                      )
                    );
                    notify(`Pin manual fijado en ${newLat}, ${newLng} (${quick.neighborhood}, CP ${quick.postalCode})`);
                    const rev = await reverseGeocodeFromCoordinates(newLat, newLng, googleMapsApiKey);
                    setOrders(prev =>
                      prev.map(o =>
                        o.id === targetId
                          ? {
                              ...o,
                              lat: rev.lat,
                              lng: rev.lng,
                              city: rev.city,
                              neighborhood: rev.neighborhood,
                              postalCode: rev.postalCode,
                              address: rev.streetAddress || o.address,
                              formattedAddress: rev.formattedAddress,
                              manualPin: true,
                              addressVerified: true
                            }
                          : o
                      )
                    );
                  }}
                />
              ) : (
                <div className="rounded-xl overflow-hidden border border-zinc-200 bg-zinc-100 min-h-[360px]">
                  <iframe
                    title={`Mapa de ${selectedMapEntry.order.id}`}
                    className="w-full h-[360px] border-0"
                    loading="lazy"
                    src={getGoogleMapsEmbedUrl(selectedMapEntry.order)}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs">
                <div>
                  <label className="block text-[10px] text-zinc-500 mb-0.5">Latitud Manual</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={selectedMapEntry.eta.coords.lat}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val)) {
                        setOrders(prev =>
                          prev.map(o =>
                            o.id === selectedMapEntry.order.id
                              ? { ...o, lat: val, manualPin: true, addressVerified: true }
                              : o
                          )
                        );
                      }
                    }}
                    className="w-full h-7 px-2 rounded border border-zinc-200 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-500 mb-0.5">Longitud Manual</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={selectedMapEntry.eta.coords.lng}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val)) {
                        setOrders(prev =>
                          prev.map(o =>
                            o.id === selectedMapEntry.order.id
                              ? { ...o, lng: val, manualPin: true, addressVerified: true }
                              : o
                          )
                        );
                      }
                    }}
                    className="w-full h-7 px-2 rounded border border-zinc-200 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-500 mb-0.5">Pegar Coordenadas / Link Maps</label>
                  <input
                    type="text"
                    value={mapCoordPaste}
                    onChange={(e) => {
                      const txt = e.target.value;
                      setMapCoordPaste(txt);
                      const parsed = parseCoordsFromInput(txt);
                      if (parsed) {
                        setOrders(prev =>
                          prev.map(o =>
                            o.id === selectedMapEntry.order.id
                              ? { ...o, lat: parsed.lat, lng: parsed.lng, manualPin: true, addressVerified: true }
                              : o
                          )
                        );
                        notify(`Coordenadas aplicadas: ${parsed.lat}, ${parsed.lng}`);
                      }
                    }}
                    placeholder="Ej: 6.2089, -75.5678"
                    className="w-full h-7 px-2 rounded border border-zinc-200 bg-white font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-xl border border-zinc-200 p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-zinc-900">
                    {selectedMapEntry.order.id} · {selectedMapEntry.order.customerName}
                  </span>
                  <span className={`text-[10px] px-2 py-1 rounded border ${getShipStatusBadgeClass(selectedMapEntry.order.shippingStatus)}`}>
                    {selectedMapEntry.order.shippingStatus}
                  </span>
                </div>
                <p className="text-xs text-zinc-600">
                  {selectedMapEntry.order.address || 'Sin dirección'}, {selectedMapEntry.order.neighborhood || 'Zona urbana'}, {selectedMapEntry.order.city}
                </p>
                <p className="text-[11px] text-zinc-500">
                  CP {selectedMapEntry.order.postalCode || '—'} · {selectedMapEntry.order.carrier}
                </p>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-100">
                  <div>
                    <div className="text-[10px] text-zinc-500">Tiempo estimado</div>
                    <div className="font-semibold text-sm text-zinc-900">{selectedMapEntry.eta.etaLabel}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-500">Fecha estimada</div>
                    <div className="font-semibold text-sm text-emerald-700">{selectedMapEntry.eta.windowDates}</div>
                  </div>
                </div>
                <div className="text-[11px] text-zinc-500">
                  Distancia aprox.: {selectedMapEntry.eta.distanceKm} km · Envío GRATIS
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => navigate(`/details/${selectedMapEntry.order.uuid}`)}
                    className="flex-1 h-8 rounded-lg bg-zinc-900 text-white text-xs font-semibold cursor-pointer"
                  >
                    Ver factura
                  </button>
                  <button
                    onClick={() => handleOpenWhatsApp(selectedMapEntry.order)}
                    className="flex-1 h-8 rounded-lg border border-zinc-200 text-xs font-semibold text-emerald-700 cursor-pointer"
                  >
                    WhatsApp
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-zinc-200 p-3 space-y-2">
                <label className="block text-[11px] text-zinc-500">Cambiar transportadora</label>
                <select
                  value={selectedMapEntry.order.carrier}
                  onChange={e => handleUpdateOrderField(selectedMapEntry.order.id, 'carrier', e.target.value)}
                  className="w-full h-8 px-2 rounded-lg border border-zinc-200 bg-zinc-50 text-xs text-zinc-900"
                >
                  {CARRIERS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <label className="block text-[11px] text-zinc-500">Número de guía</label>
                <input
                  value={selectedMapEntry.order.trackingNumber || ''}
                  onChange={e => handleUpdateOrderField(selectedMapEntry.order.id, 'trackingNumber', e.target.value)}
                  placeholder="Ingresar guía"
                  className="w-full h-8 px-2 rounded-lg border border-zinc-200 bg-zinc-50 text-xs text-zinc-900"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-zinc-300 p-10 text-center text-xs text-zinc-500">
            Todavía no hay pedidos activos con direcciones para mostrar en el mapa.
          </div>
        )}
      </section>

      <section className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-200 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-900">Pedidos con ubicación ({mapOrdersWithGeo.length})</h2>
          <span className="text-[11px] text-zinc-500">Selecciona uno para centrar el mapa</span>
        </div>
        <div className="divide-y divide-zinc-200 max-h-[420px] overflow-auto">
          {mapOrdersWithGeo.map(({ order, eta }) => (
            <button
              key={order.id}
              onClick={() => setSelectedMapOrderId(order.id)}
              className={`w-full p-3 flex flex-wrap items-center justify-between gap-2 text-left hover:bg-zinc-50 cursor-pointer ${
                selectedMapEntry?.order.id === order.id ? 'bg-sky-50' : ''
              }`}
            >
              <span className="min-w-0">
                <span className="block text-xs font-semibold text-zinc-900">{order.id} · {order.customerName}</span>
                <span className="block text-[11px] text-zinc-500 truncate">{order.city} · {order.address || 'Sin dirección'}</span>
              </span>
              <span className="text-right">
                <span className="block text-[11px] font-medium text-zinc-700">{order.carrier}</span>
                <span className="block text-[10px] text-zinc-500">{eta.etaLabel}</span>
              </span>
            </button>
          ))}
          {!mapOrdersWithGeo.length && (
            <div className="p-6 text-center text-xs text-zinc-500">Sin pedidos que coincidan con los filtros.</div>
          )}
        </div>
      </section>
    </div>
  );
}
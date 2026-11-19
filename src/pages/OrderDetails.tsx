import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Package,
  FileText,
  Truck,
  Copy,
  Check,
  ExternalLink,
  MessageCircle,
  MapPin,
  CreditCard,
  Sparkles,
  CheckCircle2,
  Clock,
  Printer,
  ArrowRight,
  Shirt
} from 'lucide-react';
import MyFanBoxBrandLogo from '../components/MyFanBoxBrandLogo';
import ThemeStyle from '../components/ThemeStyle';
import ShippingStatusAnimation from '../components/ShippingStatusAnimation';
import { apiRequest } from '../api';
import {
  sanitizeOrderRecord,
  calculateOrderETA,
  getPaidAmount,
  getPendingAmount,
  isOrderActive,
  formatCOP,
  isValidUUID
} from '../utils/helpers';
import {
  APP_THEMES,
  APP_THEME_PALETTES,
  AppTheme,
  readStoredAppTheme,
  saveStoredAppTheme
} from '../utils/themes';
import { getPcCachedGuide, savePcCachedGuide } from '../utils/pcTrackingGuides';
import { Order } from '../types';

interface PublicStoreConfig {
  brandName: string;
  brandLogoUrl: string;
  collectionName: string;
  originHub: string;
  supportWhatsapp: string;
  paymentNequi: string;
  paymentBancolombia: string;
  instagramHandle: string;
}

function getCarrierTrackingUrl(carrier: string, trackingNumber?: string): string {
  const lower = String(carrier || '').toLowerCase();
  if (lower.includes('inter')) return 'https://www.interrapidisimo.com/sigue-tu-envio/';
  if (lower.includes('servi')) return 'https://www.servientrega.com/wps/portal/rastreo-envio';
  if (lower.includes('coord')) return 'https://www.coordinadora.com/portafolio-de-servicios/servicios-en-linea/rastrear-guias/';
  if (lower.includes('env')) return 'https://envia.co/';
  if (lower.includes('tcc')) return 'https://tcc.com.co/logistica/servicios-on-line/rastrear-envios/';
  if (lower.includes('deprisa')) return 'https://www.deprisa.com/Tracking/';
  const query = [carrier || 'rastreo paquete', trackingNumber || ''].join(' ').trim();
  return 'https://www.google.com/search?q=' + encodeURIComponent(query);
}

function buildStoreWhatsAppUrl(storePhone: string, message: string): string {
  const raw = String(storePhone || '').trim();
  let digits = raw.replace(/\D/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2);
  else if (!raw.startsWith('+') && digits.length === 10) digits = `57${digits}`;
  const base = digits ? `https://wa.me/${digits}` : 'https://wa.me/';
  return `${base}?text=${encodeURIComponent(message)}`;
}

function loadLocalStoreConfig(): PublicStoreConfig {
  try {
    const saved = localStorage.getItem('mfb_public_store_config');
    const parsed = saved ? JSON.parse(saved) : {};
    const fallbackLogo = localStorage.getItem('mfb_brand_logo') || '';
    return {
      brandName: parsed.brandName || 'MyFanBox',
      brandLogoUrl: parsed.brandLogoUrl || fallbackLogo,
      collectionName: parsed.collectionName || 'Viajando por el Mundo — Karol G',
      originHub: parsed.originHub || 'Medellín',
      supportWhatsapp: parsed.supportWhatsapp || '',
      paymentNequi: parsed.paymentNequi || '',
      paymentBancolombia: parsed.paymentBancolombia || '',
      instagramHandle: parsed.instagramHandle || '@myfanbox'
    };
  } catch {
    return {
      brandName: 'MyFanBox',
      brandLogoUrl: '',
      collectionName: 'Viajando por el Mundo — Karol G',
      originHub: 'Medellín',
      supportWhatsapp: '',
      paymentNequi: '',
      paymentBancolombia: '',
      instagramHandle: '@myfanbox'
    };
  }
}

export default function OrderDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [remoteDetailOrder, setRemoteDetailOrder] = useState<Order | null>(null);
  const [detailSecurityError, setDetailSecurityError] = useState('');
  const [activeView, setActiveView] = useState<'tracking' | 'invoice'>('tracking');
  const [copiedKey, setCopiedKey] = useState('');
  const [dataConfirmedByClient, setDataConfirmedByClient] = useState(false);
  const [storeConfig, setStoreConfig] = useState<PublicStoreConfig>(() => loadLocalStoreConfig());
  const [clientTheme, setClientTheme] = useState<AppTheme>(() => readStoredAppTheme());
  const [liveTrackingEvent, setLiveTrackingEvent] = useState('');

  const activeThemePalette = useMemo(() => {
    return APP_THEME_PALETTES[clientTheme] || APP_THEME_PALETTES.myfanbox;
  }, [clientTheme]);

  useEffect(() => {
    saveStoredAppTheme(clientTheme);
  }, [clientTheme]);

  useEffect(() => {
    if (!id) return;
    try {
      setDataConfirmedByClient(localStorage.getItem(`mfb_client_verified_${id}`) === '1');
    } catch {}
  }, [id]);

  useEffect(() => {
    if (!id || !isValidUUID(id)) {
      setDetailSecurityError('El identificador no es un código UUID válido.');
      return;
    }

    let cancelled = false;
    setDetailSecurityError('');
    setLiveTrackingEvent('');
    apiRequest(`/api/orders/${encodeURIComponent(id)}`, null)
      .then(payload => {
        if (cancelled) return;
        const orderObj = sanitizeOrderRecord(payload.order || payload);
        setRemoteDetailOrder(orderObj);
        const s = payload.settings || payload.publicSettings;
        if (s && typeof s === 'object') {
          setStoreConfig(prev => ({
            brandName: s.brandName || prev.brandName,
            brandLogoUrl: s.brandLogoUrl || prev.brandLogoUrl,
            collectionName: s.collectionName || prev.collectionName,
            originHub: s.originHub || prev.originHub,
            supportWhatsapp: s.supportWhatsapp || prev.supportWhatsapp,
            paymentNequi: s.paymentNequi || prev.paymentNequi,
            paymentBancolombia: s.paymentBancolombia || prev.paymentBancolombia,
            instagramHandle: s.instagramHandle || prev.instagramHandle
          }));
        }
      })
      .catch(error => {
        if (!cancelled) {
          setRemoteDetailOrder(null);
          setDetailSecurityError(
            error.status === 404
              ? 'No encontramos un pedido asociado a este enlace privado.'
              : `No se pudo consultar el pedido: ${error.message}`
          );
        }
      });
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    if (!remoteDetailOrder) return;

    const guia = String(remoteDetailOrder.trackingNumber || '').trim();
    const isInter = String(remoteDetailOrder.carrier || '')
      .toLowerCase()
      .includes('inter');

    if (!isInter || !guia) return;

    const cached = getPcCachedGuide(guia);
    if (cached) {
      if (cached.lastEvent) setLiveTrackingEvent(cached.lastEvent);
      if (cached.shippingStatus && cached.shippingStatus !== remoteDetailOrder.shippingStatus) {
        setRemoteDetailOrder(prev =>
          prev ? { ...prev, shippingStatus: cached.shippingStatus! } : prev
        );
      }
      return;
    }

    if (String(remoteDetailOrder.shippingStatus || '').toLowerCase().includes('entregado')) {
      return;
    }

    let cancelled = false;
    apiRequest(`/api/tracking/interrapidisimo?guia=${encodeURIComponent(guia)}`, null)
      .then(res => {
        if (cancelled || !res?.ok) return;

        const eventText = [res.lastEvent, res.lastLocation].filter(Boolean).join(' · ');
        const nextStatus = res.shippingStatus || remoteDetailOrder.shippingStatus;

        if (eventText) setLiveTrackingEvent(eventText);

        if (res.shippingStatus && res.shippingStatus !== remoteDetailOrder.shippingStatus) {
          setRemoteDetailOrder(prev =>
            prev ? { ...prev, shippingStatus: res.shippingStatus } : prev
          );
        }

        savePcCachedGuide(guia, {
          shippingStatus: nextStatus,
          lastEvent: eventText
        });
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [remoteDetailOrder?.id, remoteDetailOrder?.trackingNumber, remoteDetailOrder?.carrier]);

  const handleCopy = (value: string, key: string) => {
    if (!value) return;
    navigator.clipboard?.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(prev => (prev === key ? '' : prev)), 2200);
  };

  const handleConfirmClientData = () => {
    setDataConfirmedByClient(true);
    if (id) {
      try { localStorage.setItem(`mfb_client_verified_${id}`, '1'); } catch {}
    }
  };

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
      case 'Entregado': return 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold';
      case 'Enviado': return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Por enviar': return 'bg-sky-50 text-sky-800 border-sky-200 font-semibold';
      case 'Por preparar': return 'bg-zinc-100 text-zinc-800 border-zinc-300';
      default: return 'bg-zinc-100 text-zinc-700 border-zinc-200';
    }
  };

  return (
    <div
      data-theme={clientTheme}
      className="mfb-theme-root min-h-screen bg-[#FAFAFA] text-zinc-900 flex flex-col font-sans antialiased transition-colors duration-300 p-3 sm:p-6"
    >
      <ThemeStyle theme={clientTheme} activeThemePalette={activeThemePalette} />

      <div className="max-w-3xl mx-auto w-full space-y-4">
        <div className="no-print bg-white border border-zinc-200 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs shadow-2xs">
          <div className="flex items-center gap-2.5">
            <MyFanBoxBrandLogo
              logoUrl={storeConfig.brandLogoUrl}
              brandName={storeConfig.brandName}
              size="sm"
            />
            <div className="leading-tight">
              <div className="font-bold text-zinc-900">{storeConfig.brandName}</div>
              <div className="text-[11px] text-zinc-500">Seguimiento en vivo</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1 p-1 rounded-full bg-zinc-50 border border-zinc-200">
              {APP_THEMES.map(t => {
                const selected = clientTheme === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setClientTheme(t.id)}
                    className={`h-7 px-2.5 rounded-full text-[11px] font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                      selected
                        ? 'bg-zinc-900 text-white shadow-2xs'
                        : 'text-zinc-600 hover:text-zinc-900'
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ background: t.dot, border: `1.5px solid ${t.border}` }}
                    />
                    <span>{t.short}</span>
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => navigate('/')}
              className="h-8 px-3 rounded-xl border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 font-medium cursor-pointer"
            >
              Inicio
            </button>
          </div>
        </div>

        {(detailSecurityError || !remoteDetailOrder) ? (
          <div className="bg-white border border-zinc-200 rounded-2xl p-8 text-center space-y-3 shadow-xs mt-8">
            <ShieldAlert className="w-9 h-9 text-rose-500 mx-auto" />
            <h2 className="text-lg font-semibold text-zinc-900">
              {detailSecurityError ? 'No se pudo abrir este pedido' : 'Buscando tu pedido…'}
            </h2>
            <p className="text-xs text-zinc-600 max-w-md mx-auto">
              {detailSecurityError || 'Estamos consultando el estado actualizado de tu orden.'}
            </p>
            <button
              onClick={() => navigate('/')}
              className="h-9 px-4 rounded-xl bg-zinc-900 text-white text-xs font-semibold cursor-pointer"
            >
              Regresar al buscador
            </button>
          </div>
        ) : (() => {
          const o = remoteDetailOrder;
          const active = isOrderActive(o);
          const eta = calculateOrderETA(o, storeConfig.originHub);
          const paid = getPaidAmount(o);
          const pending = getPendingAmount(o);
          const subtotal = (o.items || []).reduce(
            (sum, item) => sum + (Number(item.unitPrice) || 0) * (Number(item.qty) || 0),
            0
          );
          const firstName = (o.customerName || 'Fan').trim().split(' ')[0];
          const isDelivered = String(o.shippingStatus || '').toLowerCase().includes('entregado');

          const currentStep = !active
            ? 0
            : isDelivered
            ? 5
            : o.shippingStatus === 'Enviado'
            ? 4
            : o.shippingStatus === 'Por enviar'
            ? 3
            : o.paymentStatus === 'Pagado' || o.paymentStatus === 'Semi-pagado (50%)'
            ? 2
            : 1;

          const progressPct = !active ? 0 : Math.min(100, currentStep >= 5 ? 100 : currentStep * 25);

          const heroCopy = !active
            ? {
                title: `Pedido ${o.paymentStatus.toLowerCase()}`,
                subtitle: 'Este pedido no se encuentra activo para despacho. Si tienes dudas, escríbenos por WhatsApp.'
              }
            : isDelivered
            ? {
                title: `¡Tu pedido ya fue entregado, ${firstName}!`,
                subtitle: `Esperamos que ames tus prendas de ${storeConfig.brandName}. ¡Etiquétanos en ${storeConfig.instagramHandle || '@myfanbox'}!`
              }
            : currentStep === 4
            ? {
                title: `¡Tu pedido ya va en camino, ${firstName}!`,
                subtitle: `Fue entregado a ${o.carrier} con envío GRATIS. Puedes rastrearlo directamente con tu guía.`
              }
            : currentStep === 3
            ? {
                title: `¡Empacado y listo para salir, ${firstName}!`,
                subtitle:
                  pending > 0
                    ? `Tus prendas ya están revisadas. Solo falta completar el saldo restante de ${formatCOP(pending)} para despachar.`
                    : `Tu paquete ya está empacado y en fila para entregarse a ${o.carrier}.`
              }
            : currentStep === 2
            ? {
                title: `Estamos preparando tu pedido, ${firstName}`,
                subtitle: 'Tus prendas están pasando por taller, estampado y control de calidad antes de empacar.'
              }
            : {
                title: `¡Recibimos tu pedido, ${firstName}!`,
                subtitle: 'Confirmamos tu orden en MyFanBox. Apenas registremos tu abono pasa directo a taller.'
              };

          const timelineSteps = [
            {
              step: 1,
              title: 'Pedido confirmado',
              desc: `Orden #${o.id} registrada el ${o.createdAt || 'hoy'}.`
            },
            {
              step: 2,
              title: 'En preparación',
              desc: 'Verificamos talles, productos y cada detalle para que todo llegue perfecto.'
            },
            {
              step: 3,
              title: 'Empacado y revisado',
              desc: 'Control final de calidad realizado. Tu paquete está listo para salir.'
            },
            {
              step: 4,
              title: isDelivered ? 'Entregado en destino' : 'En camino hacia ti',
              desc: isDelivered
                ? `Paquete entregado en ${o.city} a través de ${o.carrier}.`
                : `Envío sin cargo con ${o.carrier} con destino a ${o.city}.`
            }
          ];

          const receiptMessage = `¡Hola ${storeConfig.brandName}! Soy ${o.customerName}, envío el comprobante del saldo pendiente de mi pedido ${o.id} por valor de ${formatCOP(pending)}.`;
          const correctionMessage = `¡Hola ${storeConfig.brandName}! Soy ${o.customerName} (pedido ${o.id}). Quiero corregir un dato de mi dirección o talla antes de que salga a envío: `;

          const showTrackingCard = active && (o.shippingStatus === 'Enviado' || isDelivered || Boolean(o.trackingNumber));
          const showPreShipVerify = active && o.shippingStatus === 'Por preparar';

          return (
            <div className="space-y-4">
              <div className="no-print grid grid-cols-2 gap-2 p-1 rounded-2xl bg-white border border-zinc-200">
                <button
                  type="button"
                  onClick={() => setActiveView('tracking')}
                  className={`h-10 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    activeView === 'tracking'
                      ? 'bg-zinc-900 text-white shadow-2xs'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                  }`}
                >
                  <Truck className="w-4 h-4" />
                  <span>Seguimiento</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveView('invoice')}
                  className={`h-10 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    activeView === 'invoice'
                      ? 'bg-zinc-900 text-white shadow-2xs'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Ver Factura</span>
                </button>
              </div>

              {activeView === 'tracking' && (
                <div className="space-y-4">
                  <ShippingStatusAnimation
                    shippingStatus={o.shippingStatus}
                    paymentStatus={o.paymentStatus}
                    active={active}
                    clientTheme={clientTheme}
                    carrier={o.carrier}
                  />

                  <section className="bg-white border border-zinc-200 rounded-2xl p-5 sm:p-6 space-y-5 shadow-2xs">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-[11px] font-semibold text-zinc-700">
                          <Sparkles className="w-3 h-3" />
                          <span>{storeConfig.collectionName}</span>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 pt-1">
                          {heroCopy.title}
                        </h1>
                        <p className="text-xs sm:text-sm text-zinc-500 max-w-xl leading-relaxed">
                          {heroCopy.subtitle}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span className="font-mono text-xs font-bold text-zinc-900 px-2.5 py-1 rounded-lg bg-zinc-50 border border-zinc-200">
                          {o.id}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-lg border text-[11px] font-semibold ${getShipStatusBadgeClass(o.shippingStatus)}`}>
                          {o.shippingStatus}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-zinc-700">Progreso de tu pedido</span>
                        <span className="font-mono font-bold text-zinc-900">{progressPct}%</span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-zinc-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            currentStep >= 4 ? 'bg-emerald-600' : 'bg-zinc-900'
                          }`}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                      <div className="rounded-xl bg-zinc-50 border border-zinc-200 p-3">
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                          Recorrido
                        </div>
                        <div className="mt-1 text-xs sm:text-sm font-bold text-zinc-900 flex items-center gap-1.5">
                          <span>{storeConfig.originHub}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span className="truncate">{o.city}</span>
                        </div>
                        <div className="text-[11px] text-zinc-500 mt-0.5">
                          {eta.distanceKm} km · Envío GRATIS
                        </div>
                      </div>

                      <div className="rounded-xl bg-zinc-50 border border-zinc-200 p-3">
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                          Entrega Estimada
                        </div>
                        <div className="mt-1 text-xs sm:text-sm font-bold text-emerald-700">
                          {isDelivered ? 'Entregado' : eta.windowDates}
                        </div>
                        <div className="text-[11px] text-zinc-500 mt-0.5 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{isDelivered ? 'Completado' : eta.etaLabel}</span>
                        </div>
                      </div>

                      <div className="rounded-xl bg-zinc-50 border border-zinc-200 p-3">
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                          Estado de Pago
                        </div>
                        <div className="mt-1">
                          <span className={`inline-block px-2 py-0.5 rounded-md border text-xs font-semibold ${getPayStatusBadgeClass(o.paymentStatus)}`}>
                            {o.paymentStatus}
                          </span>
                        </div>
                        <div className="text-[11px] text-zinc-500 mt-1 tabular-nums">
                          Total: {formatCOP(o.total)}
                        </div>
                      </div>
                    </div>
                  </section>

                  {showTrackingCard && (
                    <section className="bg-white border-2 border-emerald-300 rounded-2xl p-5 space-y-3 shadow-2xs">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                            <Truck className="w-4 h-4 text-emerald-700" />
                          </span>
                          <div>
                            <div className="text-sm font-bold text-zinc-900">
                              Tu envío con {o.carrier}
                            </div>
                            <div className="text-[11px] text-zinc-500">
                              Copia el número de guía y ábrelo directo en la transportadora
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3.5 rounded-xl bg-zinc-50 border border-zinc-200">
                        <div>
                          <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                            Número de Guía
                          </div>
                          <div className="text-base sm:text-lg font-mono font-bold text-zinc-900 mt-0.5 break-all">
                            {o.trackingNumber || 'Guía en proceso de asignación'}
                          </div>
                          {liveTrackingEvent && (
                            <div className="text-[11px] text-zinc-500 mt-1">
                              Último movimiento: <strong className="text-zinc-700">{liveTrackingEvent}</strong>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {o.trackingNumber && (
                            <button
                              type="button"
                              onClick={() => handleCopy(o.trackingNumber, 'tracking')}
                              className="h-9 px-3.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-100 text-xs font-semibold text-zinc-800 inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              {copiedKey === 'tracking' ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>¡Copiada!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Copiar guía</span>
                                </>
                              )}
                            </button>
                          )}

                          <a
                            href={getCarrierTrackingUrl(o.carrier, o.trackingNumber)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="h-9 px-4 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 text-xs font-semibold inline-flex items-center gap-1.5"
                          >
                            <span>Rastrear en {o.carrier}</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    </section>
                  )}

                  {pending > 0 && active && (
                    <section className="bg-white border-2 border-amber-300 rounded-2xl p-5 space-y-4 shadow-2xs">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <span className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0 mt-0.5">
                            <CreditCard className="w-4 h-4 text-amber-800" />
                          </span>
                          <div>
                            <h2 className="text-sm sm:text-base font-bold text-zinc-900">
                              Saldo pendiente para despacho: {formatCOP(pending)}
                            </h2>
                            <p className="text-xs text-zinc-600 mt-0.5">
                              Ya abonaste <strong>{formatCOP(paid)}</strong>. Para enviar tu paquete debe estar cancelado el 100%.
                            </p>
                          </div>
                        </div>
                      </div>

                      {(storeConfig.paymentNequi || storeConfig.paymentBancolombia) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {storeConfig.paymentNequi && (
                            <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-between gap-2">
                              <div>
                                <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                                  Nequi
                                </div>
                                <div className="text-sm font-mono font-bold text-zinc-900">
                                  {storeConfig.paymentNequi}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleCopy(storeConfig.paymentNequi, 'nequi')}
                                className="h-8 px-2.5 rounded-lg border border-zinc-200 bg-white text-xs font-semibold text-zinc-800 inline-flex items-center gap-1 cursor-pointer"
                              >
                                {copiedKey === 'nequi' ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Copiado</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>Copiar</span>
                                  </>
                                )}
                              </button>
                            </div>
                          )}

                          {storeConfig.paymentBancolombia && (
                            <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-between gap-2">
                              <div>
                                <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                                  Bancolombia Ahorros
                                </div>
                                <div className="text-sm font-mono font-bold text-zinc-900">
                                  {storeConfig.paymentBancolombia}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleCopy(storeConfig.paymentBancolombia, 'bancolombia')}
                                className="h-8 px-2.5 rounded-lg border border-zinc-200 bg-white text-xs font-semibold text-zinc-800 inline-flex items-center gap-1 cursor-pointer"
                              >
                                {copiedKey === 'bancolombia' ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Copiado</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>Copiar</span>
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      <a
                        href={buildStoreWhatsAppUrl(storeConfig.supportWhatsapp, receiptMessage)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full h-11 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2"
                      >
                        <MessageCircle className="w-4 h-4 text-emerald-400" />
                        <span>Enviar comprobante por WhatsApp</span>
                      </a>
                    </section>
                  )}

                  {showPreShipVerify && (
                    <section className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-3.5 shadow-2xs">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h2 className="text-sm font-bold text-zinc-900 flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-sky-600" />
                            <span>Confirma tus datos antes de despachar</span>
                          </h2>
                          <p className="text-xs text-zinc-500 mt-0.5">
                            Revisa que tu dirección y tallas estén exactas mientras preparamos tus prendas.
                          </p>
                        </div>
                        {dataConfirmedByClient && (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold inline-flex items-center gap-1 shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Confirmado
                          </span>
                        )}
                      </div>

                      <div className="rounded-xl bg-zinc-50 border border-zinc-200 p-3.5 text-xs space-y-1">
                        <div className="font-semibold text-zinc-900">
                          {o.customerName} {o.cedula ? `· C.C. ${o.cedula}` : ''}
                        </div>
                        <div className="text-zinc-600">
                          {o.address || 'Dirección pendiente por confirmar'} · {o.neighborhood || 'Zona urbana'} · {o.city}
                        </div>
                        <div className="text-zinc-500">
                          Código postal: {o.postalCode || '—'} · Transportadora: {o.carrier}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          type="button"
                          onClick={handleConfirmClientData}
                          disabled={dataConfirmedByClient}
                          className={`flex-1 h-10 px-4 rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer ${
                            dataConfirmedByClient
                              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800 cursor-default'
                              : 'bg-zinc-900 text-white hover:bg-zinc-800'
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{dataConfirmedByClient ? 'Datos confirmados como correctos' : 'Todo correcto'}</span>
                        </button>

                        <a
                          href={buildStoreWhatsAppUrl(storeConfig.supportWhatsapp, correctionMessage)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 h-10 px-4 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-semibold text-zinc-800 inline-flex items-center justify-center gap-1.5"
                        >
                          <MessageCircle className="w-4 h-4 text-emerald-600" />
                          <span>Corregir un dato por WhatsApp</span>
                        </a>
                      </div>
                    </section>
                  )}

                  <section className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-4 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-bold text-zinc-900">Etapas de tu pedido</h2>
                      <span className="text-[11px] text-zinc-500">Actualizado en vivo</span>
                    </div>

                    <div className="space-y-3">
                      {timelineSteps.map((st) => {
                        const completed = currentStep >= st.step;
                        const isCurrent = currentStep === st.step || (isDelivered && st.step === 4);
                        return (
                          <div
                            key={st.step}
                            className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all ${
                              isCurrent
                                ? 'bg-sky-50 border-sky-200'
                                : completed
                                ? 'bg-emerald-50/50 border-emerald-200'
                                : 'bg-zinc-50 border-zinc-200 opacity-75'
                            }`}
                          >
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                                completed
                                  ? 'bg-zinc-900 text-white'
                                  : 'bg-white border border-zinc-300 text-zinc-500'
                              }`}
                            >
                              {completed ? <Check className="w-3.5 h-3.5" /> : st.step}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="text-xs sm:text-sm font-bold text-zinc-900">
                                  {st.title}
                                </span>
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                                  {isDelivered && st.step === 4
                                    ? 'Completado'
                                    : isCurrent
                                    ? 'Etapa actual'
                                    : completed
                                    ? 'Completado'
                                    : 'Próximo'}
                                </span>
                              </div>
                              <p className="text-xs text-zinc-600 mt-0.5">{st.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  <section className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-3.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-bold text-zinc-900 flex items-center gap-1.5">
                        <Shirt className="w-4 h-4 text-zinc-700" />
                        <span>Tus productos ({(o.items || []).reduce((s, it) => s + (Number(it.qty) || 1), 0)} uds)</span>
                      </h2>
                      <span className="font-mono text-xs font-bold text-zinc-900">
                        {formatCOP(o.total)}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {(o.items || []).map((item, idx) => (
                        <div
                          key={item.id || idx}
                          className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <div className="text-xs sm:text-sm font-bold text-zinc-900">
                              {item.qty}× {item.productName}
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px] text-zinc-600">
                              <span>{item.variantName}</span>
                              <span className="px-2 py-0.2 rounded bg-white border border-zinc-200 font-semibold text-zinc-800">
                                Talla {item.size}
                              </span>
                              <span className="px-2 py-0.2 rounded bg-white border border-zinc-200 text-zinc-600">
                                {item.gender || 'Sin especificar'}
                              </span>
                            </div>
                          </div>
                          <div className="font-mono text-xs sm:text-sm font-bold text-zinc-900 shrink-0">
                            {formatCOP((Number(item.unitPrice) || 0) * (Number(item.qty) || 0))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 text-zinc-600">
                        <Package className="w-4 h-4 text-zinc-500 shrink-0" />
                        <span>
                          Cuando te llegue tu pedido, ¡etiquétanos en{' '}
                          <strong>{storeConfig.instagramHandle || '@myfanbox'}</strong>!
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveView('invoice')}
                        className="text-xs font-semibold text-zinc-900 cursor-pointer"
                      >
                        Abrir factura completa :D
                      </button>
                    </div>
                  </section>
                </div>
              )}

              {activeView === 'invoice' && (
                <div className="bg-white border border-zinc-200 rounded-2xl p-5 sm:p-8 shadow-2xs space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 border-b border-zinc-200 pb-4">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <MyFanBoxBrandLogo
                          logoUrl={storeConfig.brandLogoUrl}
                          brandName={storeConfig.brandName}
                          size="lg"
                        />
                        <div>
                          <h1 className="text-lg font-bold text-zinc-900">
                            {storeConfig.brandName} · FACTURA DIGITAL
                          </h1>
                          <p className="text-[11px] text-zinc-500">{storeConfig.collectionName}</p>
                        </div>
                      </div>
                      <p className="text-[11px] text-zinc-400 font-mono mt-2">
                        Pedido {o.id} · Fecha {o.createdAt || '—'}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className={`px-2.5 py-1 rounded-lg border text-xs font-semibold ${getPayStatusBadgeClass(o.paymentStatus)}`}>
                        Estado: {o.paymentStatus}
                      </span>
                      <span className={`px-2.5 py-1 rounded-lg border text-xs font-semibold ${getShipStatusBadgeClass(o.shippingStatus)}`}>
                        Envío: {o.shippingStatus}
                      </span>
                    </div>
                  </div>

                  <section className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 space-y-1 text-xs">
                    <h2 className="font-semibold text-zinc-900">Datos del cliente y entrega</h2>
                    <div className="text-zinc-800 font-medium">
                      {o.customerName} {o.cedula ? `· C.C. ${o.cedula}` : ''}
                    </div>
                    <div className="text-zinc-600">
                      {o.address || 'Dirección pendiente'} · {o.neighborhood || 'Zona urbana'} · {o.city}
                    </div>
                    <div className="text-zinc-500">
                      Código postal: {o.postalCode || '—'} · {o.carrier}
                      {o.trackingNumber ? ` · Guía ${o.trackingNumber}` : ''} · Envío GRATIS
                    </div>
                    <div className="pt-2 text-[11px] text-zinc-500">
                      Origen: {storeConfig.originHub} · Distancia aprox.: {eta.distanceKm} km · Entrega estimada: {eta.windowDates}
                    </div>
                  </section>

                  <section className="border border-zinc-200 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-zinc-50 text-zinc-500">
                          <tr>
                            <th className="p-3">Producto</th>
                            <th className="p-3">Variante</th>
                            <th className="p-3">Talla / Corte</th>
                            <th className="p-3 text-center">Cant.</th>
                            <th className="p-3 text-right">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200">
                          {(o.items || []).map((item, idx) => (
                            <tr key={item.id || idx}>
                              <td className="p-3 font-semibold text-zinc-900">{item.productName}</td>
                              <td className="p-3 text-zinc-600">{item.variantName}</td>
                              <td className="p-3">
                                {item.size} · <span className="text-zinc-500">{item.gender || 'Sin especificar'}</span>
                              </td>
                              <td className="p-3 text-center">{item.qty}</td>
                              <td className="p-3 text-right font-mono font-medium">
                                {formatCOP((Number(item.unitPrice) || 0) * (Number(item.qty) || 0))}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>

                  <div className="flex flex-col sm:flex-row gap-3 justify-between">
                    <div className="flex-1 space-y-2.5">
                      {pending > 0 && active ? (
                        <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900">
                          <strong>Saldo pendiente: {formatCOP(pending)}</strong>
                          <p className="mt-1 text-[11px]">
                            Para despachar el pedido debe estar cancelado el 100%.
                          </p>
                        </div>
                      ) : (
                        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-900">
                          <strong>¡Gracias por tu compra!</strong> Tu pedido está al día.
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="no-print h-9 px-4 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Descargar / Imprimir PDF</span>
                      </button>
                    </div>

                    <div className="w-full sm:w-72 rounded-xl bg-zinc-50 border border-zinc-200 p-4 space-y-2 text-xs tabular-nums">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <strong>{formatCOP(subtotal)}</strong>
                      </div>
                      {(o.discount || 0) > 0 && (
                        <div className="flex justify-between text-emerald-700">
                          <span>Descuento</span>
                          <strong>-{formatCOP(o.discount)}</strong>
                        </div>
                      )}
                      <div className="flex justify-between text-emerald-700">
                        <span>Envío</span>
                        <strong>GRATIS</strong>
                      </div>
                      <div className="border-t border-zinc-200 pt-2 flex justify-between text-sm font-bold">
                        <span>Total</span>
                        <span>{formatCOP(o.total)}</span>
                      </div>
                      <div className="flex justify-between text-emerald-700">
                        <span>Pagado</span>
                        <strong>{formatCOP(paid)}</strong>
                      </div>
                      <div className="flex justify-between text-amber-700">
                        <span>Pendiente</span>
                        <strong>{formatCOP(pending)}</strong>
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] text-zinc-400 font-mono break-all">
                    Código privado: {o.uuid}
                  </p>
                </div>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
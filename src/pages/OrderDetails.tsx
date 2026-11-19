import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import MyFanBoxBrandLogo from '../components/MyFanBoxBrandLogo';
import ThemeStyle from '../components/ThemeStyle';
import { apiRequest } from '../api';
import {
  sanitizeOrderRecord,
  calculateOrderETA,
  getPaidAmount,
  getPendingAmount,
  isOrderActive,
  formatCOP,
  isValidUUID,
  getContrastRatio
} from '../utils/helpers';
import { EYE_CARE_THEMES, THEME_STORAGE_KEY, THEME_PALETTES } from '../utils/constants';
import { Order } from '../types';

export default function OrderDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [remoteDetailOrder, setRemoteDetailOrder] = useState<Order | null>(null);
  const [detailSecurityError, setDetailSecurityError] = useState('');
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem(THEME_STORAGE_KEY) || 'medium-dark'; } catch { return 'medium-dark'; }
  });
  const [brandName] = useState('MyFanBox');
  const [collectionName] = useState('Viajando por el Mundo — Karol G');
  const [originHub] = useState('Medellín');
  const [brandLogoUrl] = useState(() => {
    try { return localStorage.getItem('mfb_brand_logo') || ''; } catch { return ''; }
  });

  const baseThemeRef = THEME_PALETTES[theme] || THEME_PALETTES['medium-dark'];
  const activeThemePalette = useMemo(() => {
    const src = baseThemeRef;
    const isDark = getContrastRatio(src.surface || '#1C232D', '#FFFFFF') > 4.2;
    return {
      background: src.background || '#141920',
      surface: src.surface || '#1C232D',
      surfaceAlt: src.surfaceAlt || '#242D3A',
      hover: (src as any).hover || (isDark ? '#2E3A4B' : '#E2E8F0'),
      hoverText: (src as any).hoverText || (isDark ? '#F8FAFC' : '#0F172A'),
      selectedBg: (src as any).selectedBg || (isDark ? '#243B4A' : '#D8ECE8'),
      selectedText: (src as any).selectedText || (isDark ? '#F8FAFC' : '#133A32'),
      text: src.text || (isDark ? '#F1F5F9' : '#182230'),
      muted: src.muted || (isDark ? '#94A3B8' : '#536273'),
      primary: src.primary || '#2A7B6F',
      primaryText: src.primaryText || '#FFFFFF',
      border: src.border || (isDark ? '#323E4F' : '#D5DDE5'),
      isDark
    };
  }, [theme, baseThemeRef]);

  useEffect(() => {
    try { localStorage.setItem(THEME_STORAGE_KEY, theme); } catch (e) {}
  }, [theme]);

  useEffect(() => {
    if (!id || !isValidUUID(id)) {
      setDetailSecurityError('El identificador no es un código UUID válido.');
      return;
    }

    let cancelled = false;
    apiRequest(`/api/orders/${encodeURIComponent(id)}`, null)
      .then(payload => {
        if (!cancelled) setRemoteDetailOrder(sanitizeOrderRecord(payload.order || payload));
      })
      .catch(error => {
        if (!cancelled) {
          setRemoteDetailOrder(null);
          setDetailSecurityError(error.status === 404 ? 'No encontramos un pedido asociado a este enlace privado.' : `No se pudo consultar el pedido: ${error.message}`);
        }
      });
    return () => { cancelled = true; };
  }, [id]);

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

  return (
    <div data-theme={theme} className="mfb-theme-root min-h-screen bg-[#FAFAFA] text-zinc-900 flex flex-col font-sans antialiased transition-colors duration-200 p-4 sm:p-8">
      <ThemeStyle theme={theme} activeThemePalette={activeThemePalette} />
      <div className="max-w-4xl mx-auto w-full space-y-4">
        <div className="bg-white border border-zinc-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs shadow-sm">
          <span className="font-semibold text-zinc-900">{brandName} · Seguimiento privado</span>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/')} className="h-8 px-3 rounded-lg border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50">Volver al inicio</button>
            <select value={theme} onChange={e => setTheme(e.target.value)} className="h-8 px-2 rounded-lg border border-zinc-200 bg-zinc-50">
              {EYE_CARE_THEMES.map(t => <option key={t.id} value={t.id}>{t.short}</option>)}
            </select>
          </div>
        </div>

        {(detailSecurityError || !remoteDetailOrder) ? (
          <div className="bg-white border border-zinc-200 rounded-2xl p-8 text-center space-y-3 shadow-sm mt-8">
            <ShieldAlert className="w-8 h-8 text-rose-500 mx-auto" />
            <h2 className="text-lg font-semibold text-zinc-900">No se pudo abrir este pedido</h2>
            <p className="text-xs text-zinc-600">{detailSecurityError || 'Buscando el pedido en NeonDB…'}</p>
            <button onClick={() => navigate('/')} className="h-9 px-4 rounded-lg bg-zinc-900 text-white text-xs font-semibold">Regresar al buscador</button>
          </div>
        ) : (() => {
          const o = remoteDetailOrder;
          const eta = calculateOrderETA(o, originHub);
          const paid = getPaidAmount(o);
          const pending = getPendingAmount(o);
          const subtotal = (o.items || []).reduce((sum, item) => sum + (Number(item.unitPrice) || 0) * (Number(item.qty) || 0), 0);
          const currentStep = !isOrderActive(o) ? 0 : o.shippingStatus === 'Enviado' ? 4 : o.shippingStatus === 'Por enviar' ? 3 : (o.paymentStatus === 'Pagado' || o.paymentStatus === 'Semi-pagado (50%)') ? 2 : 1;
          const steps = ['Pedido registrado', 'En preparación', 'Empacado', 'Enviado'];
          
          return (
            <div className="bg-white border border-zinc-200 rounded-2xl p-5 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 border-b border-zinc-200 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <MyFanBoxBrandLogo logoUrl={brandLogoUrl} brandName={brandName} size="lg" />
                    <div>
                      <h1 className="text-lg font-bold text-zinc-900">{brandName} · FACTURA</h1>
                      <p className="text-[11px] text-zinc-500">{collectionName}</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-mono mt-2">Pedido {o.id} · Fecha {o.createdAt || '—'}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className={`px-2.5 py-1 rounded-lg border text-xs font-semibold ${getPayStatusBadgeClass(o.paymentStatus)}`}>Pago: {o.paymentStatus}</span>
                  <span className={`px-2.5 py-1 rounded-lg border text-xs font-semibold ${getShipStatusBadgeClass(o.shippingStatus)}`}>Envío: {o.shippingStatus}</span>
                </div>
              </div>

              <section className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-sm font-semibold text-zinc-900">Seguimiento del pedido</h2>
                  <span className="text-xs text-sky-700">{eta.etaLabel} · {eta.windowDates}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {steps.map((step, idx) => (
                    <div key={step} className={`rounded-xl border p-3 text-xs ${currentStep >= idx + 1 ? 'border-emerald-200 bg-emerald-50/50' : 'border-zinc-200 bg-zinc-50'}`}>
                      <div className="font-semibold text-zinc-900">{idx + 1}. {step}</div>
                      <div className="text-[10px] text-zinc-500 mt-1">{currentStep >= idx + 1 ? 'Completado' : 'Pendiente'}</div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 space-y-1 text-xs">
                <h2 className="font-semibold text-zinc-900">Datos del cliente y entrega</h2>
                <div className="text-zinc-700 font-medium">{o.customerName} {o.cedula ? `· C.C. ${o.cedula}` : ''}</div>
                <div className="text-zinc-600">{o.address || 'Dirección pendiente'} · {o.neighborhood || 'Zona urbana'} · {o.city}</div>
                <div className="text-zinc-500">Código postal: {o.postalCode || '—'} · {o.carrier}{o.trackingNumber ? ` · Guía ${o.trackingNumber}` : ''} · Envío GRATIS</div>
                <div className="pt-2 text-[11px] text-zinc-500">Origen: {originHub} · Distancia aproximada: {eta.distanceKm} km · Coordenadas: {eta.coords.lat}, {eta.coords.lng}</div>
              </section>

              <section className="border border-zinc-200 rounded-xl overflow-hidden">
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
                        <td className="p-3">{item.size} · <span className="text-zinc-500">{item.gender || 'Sin especificar'}</span></td>
                        <td className="p-3 text-center">{item.qty}</td>
                        <td className="p-3 text-right font-medium">{formatCOP((Number(item.unitPrice) || 0) * (Number(item.qty) || 0))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>

              <div className="flex flex-col sm:flex-row gap-3 justify-between">
                <div className="flex-1">
                  {pending > 0 && isOrderActive(o) ? (
                    <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900">
                      <strong>Saldo pendiente: {formatCOP(pending)}</strong>
                      <p className="mt-1 text-[11px]">Para despachar el pedido debe estar cancelado el 100%.</p>
                    </div>
                  ) : (
                    <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-900">
                      <strong>¡Gracias por tu compra!</strong> Tu pedido está al día.
                    </div>
                  )}
                  <button onClick={() => window.print()} className="no-print mt-2 h-8 px-3 rounded-lg border border-zinc-200 text-xs font-semibold">
                    Descargar / Imprimir PDF
                  </button>
                </div>
                <div className="w-full sm:w-72 rounded-xl bg-zinc-50 border border-zinc-200 p-4 space-y-2 text-xs">
                  <div className="flex justify-between"><span>Subtotal</span><strong>{formatCOP(subtotal)}</strong></div>
                  {(o.discount || 0) > 0 && <div className="flex justify-between text-emerald-700"><span>Descuento</span><strong>-{formatCOP(o.discount)}</strong></div>}
                  <div className="border-t border-zinc-200 pt-2 flex justify-between text-sm font-bold"><span>Total</span><span>{formatCOP(o.total)}</span></div>
                  <div className="flex justify-between text-emerald-700"><span>Pagado</span><strong>{formatCOP(paid)}</strong></div>
                  <div className="flex justify-between text-amber-700"><span>Pendiente</span><strong>{formatCOP(pending)}</strong></div>
                </div>
              </div>
              <p className="text-[10px] text-zinc-400 font-mono break-all">Código privado: {o.uuid}</p>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
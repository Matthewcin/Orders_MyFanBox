import React from 'react';
import { SlidersHorizontal, Truck } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import MyFanBoxBrandLogo from '../../components/MyFanBoxBrandLogo';
import { COLOMBIA_CITIES_GEO, CARRIERS } from '../../utils/constants';
import { APP_THEMES } from '../../utils/themes';

export default function ConfigView() {
  const {
    brandName,
    setBrandName,
    collectionName,
    setCollectionName,
    brandLogoUrl,
    setBrandLogoUrl,
    originHub,
    setOriginHub,
    defaultCarrier,
    setDefaultCarrier,
    comboDiscountValue,
    setComboDiscountValue,
    googleMapsApiKey,
    setGoogleMapsApiKey,
    supportWhatsapp,
    setSupportWhatsapp,
    paymentNequi,
    setPaymentNequi,
    paymentBancolombia,
    setPaymentBancolombia,
    instagramHandle,
    setInstagramHandle,
    theme,
    setTheme,
    isSavingData,
    handlePushAllToNeon,
    notify
  } = useAdmin();

  return (
    <div className="space-y-4 max-w-5xl">
      <div>
        <h1 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5" /> Set Config
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Parámetros operativos y visuales editables sin tocar el código. Los cambios se guardan en NeonDB y se comparten entre dispositivos.
        </p>
      </div>

      <section className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-zinc-900">Identidad y Logo de MyFanBox</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="text-xs text-zinc-600 space-y-1">
            <span>Nombre de marca</span>
            <input
              value={brandName}
              onChange={e => setBrandName(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-900"
            />
          </label>
          <label className="text-xs text-zinc-600 space-y-1">
            <span>Nombre de colección</span>
            <input
              value={collectionName}
              onChange={e => setCollectionName(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-900"
            />
          </label>
        </div>

        <div className="pt-2 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <MyFanBoxBrandLogo
              logoUrl={brandLogoUrl}
              brandName={brandName}
              size="lg"
              onUploadLogo={(dataUrl) => {
                setBrandLogoUrl(dataUrl);
                notify('Logo de MyFanBox cargado');
              }}
            />
            <div className="text-xs">
              <div className="font-semibold text-zinc-900">Logo Oficial de MyFanBox</div>
              <p className="text-[11px] text-zinc-500">
                Haz clic sobre el logo para subir una imagen (.png / .jpg / .svg) o pega una URL de imagen.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <input
              type="text"
              value={brandLogoUrl}
              onChange={(e) => setBrandLogoUrl(e.target.value)}
              placeholder="Pegar URL del logo o subir haciendo clic en el emblema..."
              className="flex-1 h-8 px-2.5 text-xs rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-900"
            />
            {brandLogoUrl && (
              <button
                type="button"
                onClick={() => setBrandLogoUrl('')}
                className="h-8 px-2.5 rounded-lg border border-zinc-200 text-xs text-rose-600 hover:bg-rose-50 cursor-pointer"
              >
                Restaurar emblema
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900">
            Seguimiento y Pagos del Cliente (/details/)
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Datos visibles en la vista de seguimiento del cliente para enviar comprobantes del 50%, corregir direcciones o etiquetar la marca.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="text-xs text-zinc-600 space-y-1">
            <span>WhatsApp oficial de atención (con indicativo)</span>
            <input
              value={supportWhatsapp}
              onChange={e => setSupportWhatsapp(e.target.value)}
              placeholder="Ej: +57 300 123 4567"
              className="w-full h-9 px-3 rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-900 font-mono"
            />
          </label>
          <label className="text-xs text-zinc-600 space-y-1">
            <span>Instagram oficial de la marca</span>
            <input
              value={instagramHandle}
              onChange={e => setInstagramHandle(e.target.value)}
              placeholder="Ej: @myfanbox"
              className="w-full h-9 px-3 rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-900"
            />
          </label>
          <label className="text-xs text-zinc-600 space-y-1">
            <span>Cuenta Nequi (para copiar rápido el 50%)</span>
            <input
              value={paymentNequi}
              onChange={e => setPaymentNequi(e.target.value)}
              placeholder="Ej: 300 123 4567"
              className="w-full h-9 px-3 rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-900 font-mono"
            />
          </label>
          <label className="text-xs text-zinc-600 space-y-1">
            <span>Cuenta Bancolombia (Ahorros)</span>
            <input
              value={paymentBancolombia}
              onChange={e => setPaymentBancolombia(e.target.value)}
              placeholder="Ej: 123-456789-00"
              className="w-full h-9 px-3 rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-900 font-mono"
            />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-950 space-y-1">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Truck className="w-4 h-4" /> Política de envíos: GRATIS
        </div>
        <p className="text-xs">
          Todos los envíos son gratuitos para el cliente, sin importar la transportadora o ciudad. El sistema no suma ningún cargo de envío al total del pedido.
        </p>
      </section>

      <section className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-zinc-900">Operación y logística</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="text-xs text-zinc-600 space-y-1">
            <span>Centro de despacho predeterminado</span>
            <select
              value={originHub}
              onChange={e => setOriginHub(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-900"
            >
              {Object.keys(COLOMBIA_CITIES_GEO).map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </label>
          <label className="text-xs text-zinc-600 space-y-1">
            <span>Transportadora predeterminada</span>
            <select
              value={defaultCarrier}
              onChange={e => setDefaultCarrier(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-900"
            >
              {CARRIERS.map(carrier => (
                <option key={carrier} value={carrier}>{carrier}</option>
              ))}
            </select>
          </label>
          <label className="text-xs text-zinc-600 space-y-1">
            <span>Descuento por combo con llavero (COP)</span>
            <input
              type="number"
              min="0"
              step="500"
              value={comboDiscountValue}
              onChange={e => setComboDiscountValue(Math.max(0, Number(e.target.value) || 0))}
              className="w-full h-9 px-3 rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-900"
            />
          </label>
          <label className="text-xs text-zinc-600 space-y-1">
            <span>Google Maps Geocoding API Key (opcional)</span>
            <input
              type="password"
              value={googleMapsApiKey}
              onChange={e => setGoogleMapsApiKey(e.target.value)}
              placeholder="AIza..."
              className="w-full h-9 px-3 rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-900 font-mono"
            />
          </label>
        </div>
      </section>

      <section className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-zinc-900">Apariencia</h2>
          <span className="text-[11px] text-zinc-500">3 temas oficiales</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {APP_THEMES.map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTheme(t.id)}
              className={`flex items-center gap-3 rounded-xl border p-3.5 text-left text-xs transition-all cursor-pointer ${
                theme === t.id ? 'border-zinc-900 ring-1 ring-zinc-900 bg-zinc-50' : 'border-zinc-200 hover:border-zinc-400'
              }`}
            >
              <span
                className="w-6 h-6 rounded-full shrink-0"
                style={{ background: t.dot, border: `1.5px solid ${t.border}` }}
              />
              <span className="min-w-0">
                <span className="block font-semibold text-zinc-900 truncate">{t.name}</span>
                <span className="block text-[11px] text-zinc-500 truncate">{t.desc}</span>
              </span>
            </button>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900">
        <span>{isSavingData ? 'Guardando configuración…' : 'La configuración se sincroniza automáticamente con NeonDB.'}</span>
        <button
          onClick={handlePushAllToNeon}
          disabled={isSavingData}
          className="h-8 px-3 rounded-lg bg-zinc-900 text-white font-semibold disabled:opacity-50 cursor-pointer"
        >
          Guardar ahora
        </button>
      </div>
    </div>
  );
}
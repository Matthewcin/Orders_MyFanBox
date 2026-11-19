import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Fingerprint, FileText, ShieldCheck, AlertCircle } from 'lucide-react';
import MyFanBoxBrandLogo from '../components/MyFanBoxBrandLogo';
import ThemeStyle from '../components/ThemeStyle';
import { isValidUUID } from '../utils/helpers';
import {
  APP_THEMES,
  APP_THEME_PALETTES,
  AppTheme,
  readStoredAppTheme,
  saveStoredAppTheme
} from '../utils/themes';

interface PublicStoreInfo {
  brandName: string;
  brandLogoUrl: string;
  collectionName: string;
}

function loadStoreInfo(): PublicStoreInfo {
  try {
    const saved = localStorage.getItem('mfb_public_store_config');
    const parsed = saved ? JSON.parse(saved) : {};
    const fallbackLogo = localStorage.getItem('mfb_brand_logo') || '';
    return {
      brandName: parsed.brandName || 'MyFanBox',
      brandLogoUrl: parsed.brandLogoUrl || fallbackLogo,
      collectionName: parsed.collectionName || 'Viajando por el Mundo — Karol G'
    };
  } catch {
    return {
      brandName: 'MyFanBox',
      brandLogoUrl: '',
      collectionName: 'Viajando por el Mundo — Karol G'
    };
  }
}

export default function Catalogo() {
  const navigate = useNavigate();
  const [storeInfo] = useState<PublicStoreInfo>(() => loadStoreInfo());
  const [theme, setTheme] = useState<AppTheme>(() => readStoredAppTheme());
  const [trackingInput, setTrackingInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const activeThemePalette = useMemo(() => {
    return APP_THEME_PALETTES[theme] || APP_THEME_PALETTES.myfanbox;
  }, [theme]);

  useEffect(() => {
    saveStoredAppTheme(theme);
  }, [theme]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const raw = trackingInput.trim();
    if (!raw) {
      setErrorMsg('Pega tu código único (UUID) o el enlace recibido por WhatsApp.');
      return;
    }

    if (raw === '1620' || raw === '/1620' || raw.endsWith('/1620')) {
      navigate('/1620');
      return;
    }

    const uuidMatch = raw.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
    const candidate = uuidMatch ? uuidMatch[0].toLowerCase() : raw.toLowerCase();

    if (!isValidUUID(candidate)) {
      setErrorMsg('El código ingresado no es un UUID válido. Verifica el enlace enviado por WhatsApp.');
      return;
    }

    navigate(`/details/${candidate}`);
  };

  return (
    <div
      data-theme={theme}
      className="mfb-theme-root min-h-screen bg-[#FAFAFA] text-zinc-900 flex flex-col font-sans antialiased transition-colors duration-300"
    >
      <ThemeStyle theme={theme} activeThemePalette={activeThemePalette} />

      <header className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-5 pb-4 border-b border-zinc-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <MyFanBoxBrandLogo
            logoUrl={storeInfo.brandLogoUrl}
            brandName={storeInfo.brandName}
            size="md"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-bold text-zinc-900 leading-none">
                {storeInfo.brandName}
              </span>
              <span className="px-2 py-0.5 rounded-md border border-zinc-200 bg-zinc-50 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                DETALLES DE LA ORDEN
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Colección: {storeInfo.collectionName}
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1 p-1 rounded-full bg-white border border-zinc-200">
          {APP_THEMES.map(t => {
            const selected = theme === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTheme(t.id)}
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
      </header>

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-10">
        <div className="w-full max-w-2xl bg-white border border-zinc-200 rounded-2xl p-6 sm:p-10 shadow-2xs space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100 border border-zinc-200 text-xs font-semibold text-zinc-800">
              <Fingerprint className="w-3.5 h-3.5" />
              <span>Seguimiento y Facturación</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 leading-tight">
              Consulta el estado de tu pedido y tu Factura Digital
            </h1>

            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
              Para proteger tus datos personales y dirección de entrega, cada pedido de{' '}
              <strong className="text-zinc-900">{storeInfo.brandName}</strong> cuenta con un{' '}
              <strong className="text-zinc-900">código único privado (UUID)</strong>. Pega a continuación el código o el enlace que recibiste por WhatsApp:
            </p>
          </div>

          <form onSubmit={handleSearchSubmit} className="space-y-3.5">
            <div className="space-y-1.5">
              <label
                htmlFor="mfb-uuid-input"
                className="block text-xs font-semibold text-zinc-800"
              >
                Código de Seguimiento
              </label>
              <input
                id="mfb-uuid-input"
                type="text"
                value={trackingInput}
                onChange={e => {
                  setTrackingInput(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="Ej: 4f8a2b1c-9d3e-4a1b-8c2d-7e6f5a4b3c2d"
                className="w-full h-11 px-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs sm:text-sm font-mono text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:border-zinc-900 focus:outline-none transition-colors"
              />
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              className="h-11 px-5 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Consultar Estado y Facturación</span>
            </button>
          </form>

          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1 text-xs">
            <div className="font-semibold text-zinc-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Privacidad Garantizada</span>
            </div>
            <p className="text-zinc-600 leading-relaxed">
              Los pedidos no pueden ser buscados por número consecutivo, nombre ni teléfono. Solo quien posea el enlace privado enviado por WhatsApp tiene acceso a los detalles del envío.
            </p>
          </div>
        </div>
      </main>

      <footer className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-4 border-t border-zinc-200 flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-500">
        <span>
          {storeInfo.brandName} · {storeInfo.collectionName}
        </span>
        <span className="font-mono">Seguimiento Encriptado con UUID v4</span>
      </footer>
    </div>
  );
}
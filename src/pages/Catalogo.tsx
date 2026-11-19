import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Fingerprint, ShieldAlert, FileText, ShieldCheck, Palette } from 'lucide-react';
import MyFanBoxBrandLogo from '../components/MyFanBoxBrandLogo';
import ThemeStyle from '../components/ThemeStyle';
import { EYE_CARE_THEMES, THEME_STORAGE_KEY, THEME_PALETTES } from '../utils/constants';
import { isValidUUID, getContrastRatio } from '../utils/helpers';

export default function Catalogo() {
  const navigate = useNavigate();
  const [guestUuidInput, setGuestUuidInput] = useState('');
  const [guestLookupError, setGuestLookupError] = useState('');
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem(THEME_STORAGE_KEY) || 'medium-dark'; } catch { return 'medium-dark'; }
  });
  const [brandName] = useState('MyFanBox');
  const [collectionName] = useState('Viajando por el Mundo — Karol G');
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

  const handleGuestOpenUuidTracking = (e: React.FormEvent) => {
    e.preventDefault();
    setGuestLookupError('');
    const raw = guestUuidInput.trim();
    if (!raw) {
      setGuestLookupError('Pega tu código UUID o el enlace completo que recibiste por WhatsApp.');
      return;
    }

    if (raw === '/1620' || raw === '1620' || raw === '#/1620') {
      navigate('/1620');
      return;
    }

    let extractedUuid = raw;
    if (raw.includes('/details/')) {
      const afterDetails = raw.split('/details/')[1] || '';
      const [idPart] = afterDetails.split('?');
      extractedUuid = decodeURIComponent(idPart || '').trim();
    }

    if (!isValidUUID(extractedUuid)) {
      setGuestLookupError(
        'Por seguridad, no se permite buscar por número de orden. Debes ingresar el código único UUID de 36 caracteres.'
      );
      return;
    }

    navigate(`/details/${extractedUuid}`);
  };

  return (
    <div data-theme={theme} className="mfb-theme-root min-h-screen bg-[#FAFAFA] text-zinc-900 flex flex-col lg:flex-row font-sans antialiased transition-colors duration-200">
      <ThemeStyle theme={theme} activeThemePalette={activeThemePalette} />
      
      <div className="flex-1 min-h-screen flex flex-col justify-between p-4 sm:p-8 max-w-4xl mx-auto w-full">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-zinc-200">
          <div className="flex items-center gap-3">
            <MyFanBoxBrandLogo logoUrl={brandLogoUrl} brandName={brandName} size="lg" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-zinc-900">{brandName}</span>
                <span className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-zinc-100 border border-zinc-200 rounded text-zinc-700">
                  TRACKING & INVOICE
                </span>
              </div>
              <p className="text-xs text-zinc-500">Colección Oficial: {collectionName}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-zinc-200 text-xs">
            <Palette className="w-3.5 h-3.5 text-zinc-500" />
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="bg-transparent font-medium text-zinc-800 focus:outline-none cursor-pointer"
            >
              {EYE_CARE_THEMES.map(t => (
                <option key={t.id} value={t.id}>Tema: {t.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="my-auto py-8 max-w-2xl mx-auto w-full">
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-9 space-y-6 shadow-xs">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-800 text-xs font-semibold">
                <Fingerprint className="w-3.5 h-3.5" />
                <span>Portal Oficial de Seguimiento y Facturación</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
                Consulta el estado de tu pedido y tu Factura Digital
              </h1>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                Para proteger tus datos personales y dirección de entrega, cada pedido de <strong>{brandName}</strong> cuenta con un <strong>código único privado (UUID)</strong>. Pega a continuación el código o el enlace que recibiste por WhatsApp:
              </p>
            </div>

            <form onSubmit={handleGuestOpenUuidTracking} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                  Código Único de Seguimiento (UUID)
                </label>
                <input
                  type="text"
                  value={guestUuidInput}
                  onChange={(e) => {
                    setGuestUuidInput(e.target.value);
                    setGuestLookupError('');
                  }}
                  placeholder="Ej: 4f8a2b1c-9d3e-4a1b-8c2d-7e6f5a4b3c2d"
                  className="w-full h-11 px-3.5 font-mono text-xs bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 focus:bg-white focus:border-zinc-900 focus:outline-none"
                />
              </div>

              {guestLookupError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{guestLookupError}</span>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="submit"
                  className="h-10 px-5 rounded-xl bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 inline-flex items-center gap-2 cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>Consultar Estado e Invoice</span>
                </button>
              </div>
            </form>

            <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-[11px] text-zinc-500 space-y-1">
              <div className="font-semibold text-zinc-800 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Privacidad Garantizada</span>
              </div>
              <p>
                Los pedidos no pueden ser buscados por número consecutivo, nombre ni teléfono. Solo quien posea el enlace privado enviado por WhatsApp tiene acceso a los detalles del envío.
              </p>
            </div>
          </div>
        </div>

        <footer className="pt-4 border-t border-zinc-200 flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-400">
          <span>{brandName} · {collectionName}</span>
          <span>Seguimiento Encriptado con UUID v4</span>
        </footer>
      </div>
    </div>
  );
}
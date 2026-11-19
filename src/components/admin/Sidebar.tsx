import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Layers,
  LayoutGrid,
  ClipboardCheck,
  Truck,
  MapPin,
  Calculator,
  FileText,
  Database,
  SlidersHorizontal,
  Palette,
  Copy,
  KeyRound,
  LogOut,
  X
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import MyFanBoxBrandLogo from '../MyFanBoxBrandLogo';
import { APP_THEMES } from '../../utils/themes';
import { formatCOP } from '../../utils/helpers';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  onOpenSecurity: () => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  mobileMenuOpen,
  setMobileMenuOpen,
  onOpenSecurity
}: SidebarProps) {
  const navigate = useNavigate();
  const {
    brandName,
    brandLogoUrl,
    setBrandLogoUrl,
    collectionName,
    orders,
    catalog,
    metrics,
    productionMatrix,
    neonStatus,
    theme,
    setTheme,
    handleAdminLogout,
    notify
  } = useAdmin();

  const netProfitProjected = metrics.grossRevenue - metrics.totalProductionCost;
  const pendingCheckCount = metrics.countPorPreparar + metrics.countPorEnviar;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    notify(label);
  };

  const handleLogout = () => {
    handleAdminLogout();
    navigate('/');
  };

  return (
    <>
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-zinc-950/30 backdrop-blur-[1px] z-30 lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-white border-r border-zinc-200 flex flex-col justify-between transition-transform duration-200 ease-out shrink-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="overflow-y-auto">
          <div className="h-14 px-4 flex items-center justify-between border-b border-zinc-200">
            <div className="flex items-center gap-2.5">
              <MyFanBoxBrandLogo
                logoUrl={brandLogoUrl}
                brandName={brandName}
                size="sm"
                onUploadLogo={(dataUrl) => {
                  setBrandLogoUrl(dataUrl);
                  notify('Logo de MyFanBox actualizado');
                }}
              />
              <div>
                <div className="text-xs font-semibold tracking-tight text-zinc-900 leading-none flex items-center gap-1.5">
                  <span>{brandName} Ops</span>
                  <span className="px-1.5 py-0.5 text-[9px] font-mono bg-emerald-50 text-emerald-800 rounded border border-emerald-200">
                    ADMIN
                  </span>
                </div>
                <div className="text-[11px] text-zinc-500 mt-0.5 truncate max-w-[145px]">
                  {collectionName}
                </div>
              </div>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1 rounded-md text-zinc-400 hover:text-zinc-900 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <nav className="p-2.5 space-y-0.5">
            <div className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              Operación Diaria
            </div>

            <button
              onClick={() => { setActiveTab('orders'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'orders' ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <span className="flex items-center gap-2">
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>1. Ventas y Pedidos</span>
              </span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${activeTab === 'orders' ? 'bg-zinc-800 text-zinc-200' : 'bg-zinc-100 text-zinc-600'}`}>
                {metrics.activeOrdersCount}
              </span>
            </button>

            <button
              onClick={() => { setActiveTab('quickcheck'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'quickcheck' ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <span className="flex items-center gap-2">
                <ClipboardCheck className="w-3.5 h-3.5" />
                <span>¿Está hecho?</span>
              </span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${activeTab === 'quickcheck' ? 'bg-zinc-800 text-sky-300' : 'bg-sky-50 text-sky-800 border border-sky-200'}`}>
                {pendingCheckCount}
              </span>
            </button>

            <button
              onClick={() => { setActiveTab('inventory'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'inventory' ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <span className="flex items-center gap-2">
                <Layers className="w-3.5 h-3.5" />
                <span>2. Inventario por Hacer</span>
              </span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${activeTab === 'inventory' ? 'bg-zinc-800 text-amber-300' : 'bg-amber-50 text-amber-800 border border-amber-200'}`}>
                {productionMatrix.totalMissingToMake} pend
              </span>
            </button>

            <button
              onClick={() => { setActiveTab('bento'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'bento' ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <span className="flex items-center gap-2">
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Inventario Bento</span>
              </span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${activeTab === 'bento' ? 'bg-zinc-800 text-emerald-300' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'}`}>
                Visual
              </span>
            </button>

            <button
              onClick={() => { setActiveTab('shipping'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'shipping' ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <span className="flex items-center gap-2">
                <Truck className="w-3.5 h-3.5" />
                <span>3. Envíos y Guías</span>
              </span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${activeTab === 'shipping' ? 'bg-zinc-800 text-sky-300' : 'bg-sky-50 text-sky-800 border border-sky-200'}`}>
                {metrics.countPorEnviar} listos
              </span>
            </button>

            <button
              onClick={() => { setActiveTab('map'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'map' ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <span className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" />
                <span>4. Mapa de Envíos y ETA</span>
              </span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${activeTab === 'map' ? 'bg-zinc-800 text-emerald-300' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'}`}>
                Rutas
              </span>
            </button>

            <button
              onClick={() => { setActiveTab('costs'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'costs' ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <span className="flex items-center gap-2">
                <Calculator className="w-3.5 h-3.5" />
                <span>5. Catálogo y Costos</span>
              </span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${activeTab === 'costs' ? 'bg-zinc-800 text-zinc-200' : 'bg-zinc-100 text-zinc-600'}`}>
                {catalog.length} refs
              </span>
            </button>

            <div className="pt-2 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              Cliente & Cloud
            </div>

            <button
              onClick={() => {
                if (orders[0]?.uuid) navigate(`/details/${orders[0].uuid}`);
                else notify('No hay pedidos cargados aún', 'warning');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" />
                <span>Portal /details/ (UUID)</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600">
                UUID
              </span>
            </button>

            <button
              onClick={() => { setActiveTab('neondb'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'neondb' ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <span className="flex items-center gap-2">
                <Database className="w-3.5 h-3.5" />
                <span>6. Base de Datos NeonDB</span>
              </span>
              <span className="flex items-center gap-1 text-[10px]">
                <span
                  className={`w-2 h-2 rounded-full ${
                    neonStatus === 'connected'
                      ? 'bg-emerald-500'
                      : neonStatus === 'error'
                      ? 'bg-rose-500'
                      : 'bg-zinc-300'
                  }`}
                />
              </span>
            </button>

            <button
              onClick={() => { setActiveTab('config'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'config' ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <span className="flex items-center gap-2">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>7. Set Config</span>
              </span>
              <span className="text-[10px] text-zinc-400">Ajustes</span>
            </button>

            <div className="pt-3 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Palette className="w-3 h-3" />
              <span>Tema Visual</span>
            </div>
            <div className="grid grid-cols-1 gap-1 px-2">
              {APP_THEMES.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  title={t.desc}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-all cursor-pointer ${
                    theme === t.id
                      ? 'bg-zinc-900 text-white border-zinc-900'
                      : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:text-zinc-900'
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ background: t.dot, border: `1.5px solid ${t.border}` }}
                  />
                  <span className="truncate">{t.name}</span>
                </button>
              ))}
            </div>
          </nav>
        </div>

        <div className="p-3 border-t border-zinc-200 bg-zinc-50/70 space-y-2">
          <div className="bg-white p-2.5 rounded-xl border border-zinc-200 space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-zinc-500">Recaudado real</span>
              <span className="font-semibold text-emerald-700 tabular-nums">{formatCOP(metrics.collectedCash)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-500">Falta por cobrar</span>
              <span className="font-semibold text-amber-700 tabular-nums">{formatCOP(metrics.pendingToCollect)}</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-zinc-100">
              <span className="text-zinc-500">Ganancia Neta Est.</span>
              <span className="font-semibold text-zinc-900 tabular-nums">{formatCOP(netProfitProjected)}</span>
            </div>
          </div>

          <div
            onClick={() => copyToClipboard(`${window.location.origin}/1620`, 'Enlace secreto de Login Admin (/1620) copiado')}
            title="Haz clic para copiar tu link secreto de administrador"
            className="px-2.5 py-1.5 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-between text-[10px] font-mono text-zinc-600 hover:text-zinc-900 cursor-pointer"
          >
            <span>🔒 Login oculto: /1620</span>
            <Copy className="w-3 h-3" />
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={onOpenSecurity}
              className="h-8 px-2 rounded-lg border border-zinc-200 bg-white text-[11px] font-medium text-zinc-700 hover:bg-zinc-100 flex items-center justify-center gap-1 cursor-pointer"
              title="Cambiar contraseña de Admin"
            >
              <KeyRound className="w-3 h-3" />
              <span>Clave Admin</span>
            </button>
            <button
              onClick={handleLogout}
              className="h-8 px-2 rounded-lg border border-zinc-200 bg-white text-[11px] font-medium text-rose-700 hover:bg-rose-50 flex items-center justify-center gap-1 cursor-pointer"
              title="Cerrar sesión y ver como Guest"
            >
              <LogOut className="w-3 h-3" />
              <span>Salir (Guest)</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
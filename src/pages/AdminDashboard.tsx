import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Unlock } from 'lucide-react';
import { AdminProvider, useAdmin } from '../context/AdminContext';
import ThemeStyle from '../components/ThemeStyle';
import Sidebar from '../components/admin/Sidebar';
import Header from '../components/admin/Header';
import OrderModal from '../components/admin/OrderModal';
import OrderModeModal from '../components/admin/OrderModeModal';
import SimpleOrderWizard from '../components/admin/SimpleOrderWizard';
import SecurityModal from '../components/admin/SecurityModal';
import OrdersView from './admin/OrdersView';
import InventoryView from './admin/InventoryView';
import BentoInventoryView from './admin/BentoInventoryView';
import ShippingView from './admin/ShippingView';
import MapView from './admin/MapView';
import CostsView from './admin/CostsView';
import NeonDBView from './admin/NeonDBView';
import ConfigView from './admin/ConfigView';
import { THEME_PALETTES, THEME_STORAGE_KEY } from '../utils/constants';
import { getContrastRatio } from '../utils/helpers';
import { Order } from '../types';

function AdminDashboardContent() {
  const navigate = useNavigate();
  const {
    isAdmin,
    adminConfig,
    loginError,
    handleAdminLoginSubmit,
    theme,
    customTheme,
    toast
  } = useAdmin();

  const [activeTab, setActiveTab] = useState('orders');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [modeSelectorOpen, setModeSelectorOpen] = useState(false);
  const [simpleWizardOpen, setSimpleWizardOpen] = useState(false);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [securityModalOpen, setSecurityModalOpen] = useState(false);

  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberSession, setRememberSession] = useState(true);

  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const baseThemeRef = THEME_PALETTES[theme] || THEME_PALETTES['medium-dark'];
  const activeThemePalette = useMemo(() => {
    const src = theme === 'custom' ? customTheme : baseThemeRef;
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
  }, [theme, customTheme, baseThemeRef]);

  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {}
  }, [theme]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isAdmin) return;
      if (modeSelectorOpen || simpleWizardOpen || orderModalOpen || securityModalOpen) return;
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
        if (e.key === 'Escape') {
          (document.activeElement as HTMLElement | null)?.blur();
        }
        return;
      }
      if (e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === '1') setActiveTab('orders');
      else if (e.key === '2') setActiveTab('inventory');
      else if (e.key === '3') setActiveTab('shipping');
      else if (e.key === '4') setActiveTab('map');
      else if (e.key === '5') setActiveTab('costs');
      else if (e.key === '6') setActiveTab('neondb');
      else if (e.key === '7') setActiveTab('config');
      else if (e.key === '8' || e.key.toLowerCase() === 'b') setActiveTab('bento');
      else if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setModeSelectorOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAdmin, modeSelectorOpen, simpleWizardOpen, orderModalOpen, securityModalOpen]);

  const onLoginFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleAdminLoginSubmit(loginUsername.trim(), loginPassword, rememberSession);
    setLoginPassword('');
  };

  if (!isAdmin) {
    return (
      <div
        data-theme={theme}
        className="mfb-theme-root min-h-screen bg-[#FAFAFA] text-zinc-900 flex flex-col font-sans antialiased transition-colors duration-200"
      >
        <ThemeStyle theme={theme} activeThemePalette={activeThemePalette} />
        <div className="my-auto py-8 max-w-md mx-auto w-full p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 space-y-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-800 text-xs font-semibold">
                <Lock className="w-3.5 h-3.5" />
                <span>Acceso Secreto · Ruta /1620</span>
              </div>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="text-xs text-zinc-400 hover:text-zinc-800 cursor-pointer"
              >
                ✕ Salir
              </button>
            </div>

            <div>
              <h2 className="text-lg font-bold text-zinc-900">Iniciar Sesión (Admin MyFanBox)</h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Portal oculto exclusivo para gestionar ventas, inventario por hacer, mapa de envíos y NeonDB.
              </p>
            </div>

            <form onSubmit={onLoginFormSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">Usuario Administrador</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full h-9 px-3 text-xs bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 focus:bg-white focus:border-zinc-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">Contraseña Maestra</label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-9 px-3 text-xs bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 focus:bg-white focus:border-zinc-900 focus:outline-none"
                />
              </div>

              <label className="flex items-center gap-2 text-xs text-zinc-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberSession}
                  onChange={(e) => setRememberSession(e.target.checked)}
                  className="rounded border-zinc-300"
                />
                <span>Mantener sesión iniciada en este dispositivo</span>
              </label>

              {loginError && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                className="w-full h-10 rounded-xl bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>Desbloquear Panel Admin</span>
              </button>
            </form>

            {!adminConfig.hideDefaultHint && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 space-y-1">
                <div className="font-semibold">Acceso administrativo protegido</div>
                <div>Las credenciales iniciales se definen en las variables privadas del servidor.</div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      data-theme={theme}
      className="mfb-theme-root min-h-screen bg-[#FAFAFA] text-zinc-900 flex flex-col lg:flex-row font-sans antialiased selection:bg-zinc-900 selection:text-white transition-colors duration-200"
    >
      <ThemeStyle theme={theme} activeThemePalette={activeThemePalette} />

      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        onOpenSecurity={() => setSecurityModalOpen(true)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchInputRef={searchInputRef}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onNewOrder={() => setModeSelectorOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 max-w-[1440px] w-full mx-auto space-y-5">
          {activeTab === 'orders' && (
            <OrdersView
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onEditOrder={(order) => {
                setEditingOrder(order);
                setOrderModalOpen(true);
              }}
            />
          )}
          {activeTab === 'inventory' && <InventoryView />}
          {activeTab === 'bento' && <BentoInventoryView />}
          {activeTab === 'shipping' && <ShippingView />}
          {activeTab === 'map' && <MapView />}
          {activeTab === 'costs' && <CostsView />}
          {activeTab === 'neondb' && <NeonDBView />}
          {activeTab === 'config' && <ConfigView />}
        </main>
      </div>

      <OrderModeModal
        open={modeSelectorOpen}
        onClose={() => setModeSelectorOpen(false)}
        onSelectSimple={() => {
          setModeSelectorOpen(false);
          setSimpleWizardOpen(true);
        }}
        onSelectAdvanced={() => {
          setModeSelectorOpen(false);
          setEditingOrder(null);
          setOrderModalOpen(true);
        }}
      />

      <SimpleOrderWizard
        open={simpleWizardOpen}
        onClose={() => setSimpleWizardOpen(false)}
      />

      <OrderModal
        open={orderModalOpen}
        editingOrder={editingOrder}
        onClose={() => setOrderModalOpen(false)}
      />

      <SecurityModal
        open={securityModalOpen}
        onClose={() => setSecurityModalOpen(false)}
      />

      {toast && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-zinc-900 text-white text-xs font-medium shadow-lg">
          <span
            className={`w-2 h-2 rounded-full ${
              toast.type === 'error'
                ? 'bg-rose-400'
                : toast.type === 'warning'
                ? 'bg-amber-400'
                : 'bg-emerald-400'
            }`}
          />
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <AdminProvider>
      <AdminDashboardContent />
    </AdminProvider>
  );
}
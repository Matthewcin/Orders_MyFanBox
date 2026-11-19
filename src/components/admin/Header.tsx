import React from 'react';
import { Menu, Search, Database, Plus } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { APP_THEMES } from '../../utils/themes';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  onOpenMobileMenu: () => void;
  onNewOrder: () => void;
}

export default function Header({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  searchInputRef,
  onOpenMobileMenu,
  onNewOrder
}: HeaderProps) {
  const { theme, setTheme, neonStatus } = useAdmin();

  return (
    <header className="sticky top-0 z-20 h-14 bg-white/90 backdrop-blur-md border-b border-zinc-200 px-4 sm:px-6 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-lg border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 cursor-pointer"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (activeTab !== 'orders') setActiveTab('orders');
            }}
            placeholder="Buscar clienta, @instagram, ciudad, guía, UUID o #MFB..."
            className="w-full h-8 pl-8 pr-12 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:bg-white focus:border-zinc-900 transition-colors"
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400 hover:text-zinc-700 px-1 cursor-pointer"
            >
              ✕
            </button>
          ) : (
            <kbd className="hidden sm:inline-block absolute right-2 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 bg-white border border-zinc-200 rounded">
              /
            </kbd>
          )}
        </div>

        <div className="hidden xl:flex items-center bg-zinc-100 p-0.5 rounded-lg border border-zinc-200">
          {[
            { id: 'orders', label: 'Ventas' },
            { id: 'quickcheck', label: '¿Hecho?' },
            { id: 'inventory', label: 'Inventario' },
            { id: 'bento', label: 'Inventario Simple' },
            { id: 'shipping', label: 'Envíos' },
            { id: 'map', label: 'Mapa & ETA' },
            { id: 'costs', label: 'Costos' },
            { id: 'neondb', label: 'NeonDB' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                activeTab === tab.id ? 'bg-white text-zinc-900 shadow-2xs' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <div className="hidden sm:inline-flex items-center gap-1 p-0.5 rounded-full bg-zinc-100 border border-zinc-200">
          {APP_THEMES.map(t => {
            const selected = theme === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTheme(t.id)}
                title={t.desc}
                className={`h-7 px-2.5 rounded-full text-[11px] font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                  selected
                    ? 'bg-zinc-900 text-white shadow-2xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: t.dot, border: `1.5px solid ${t.border}` }}
                />
                <span>{t.short}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setActiveTab('neondb')}
          className={`hidden md:inline-flex h-8 px-2.5 rounded-lg border text-xs font-medium items-center gap-1.5 transition-colors cursor-pointer ${
            neonStatus === 'connected'
              ? 'border-emerald-200 bg-emerald-50/60 text-emerald-800'
              : 'border-zinc-200 bg-white text-zinc-600 hover:text-zinc-900'
          }`}
          title="Estado de Base de Datos NeonDB"
        >
          <Database className="w-3.5 h-3.5" />
          <span>{neonStatus === 'connected' ? 'NeonDB Conectado' : 'NeonDB'}</span>
        </button>

        <button
          onClick={onNewOrder}
          className="h-8 px-3 rounded-lg bg-zinc-900 text-white text-xs font-medium hover:bg-zinc-800 active:scale-[0.99] transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Nuevo Pedido</span>
        </button>
      </div>
    </header>
  );
}
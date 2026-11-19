import React, { useEffect } from 'react';
import { Sparkles, SlidersHorizontal, X } from 'lucide-react';

interface OrderModeModalProps {
  open: boolean;
  onClose: () => void;
  onSelectSimple: () => void;
  onSelectAdvanced: () => void;
}

export default function OrderModeModal({
  open,
  onClose,
  onSelectSimple,
  onSelectAdvanced
}: OrderModeModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === '1' || e.key.toLowerCase() === 's') {
        e.preventDefault();
        onSelectSimple();
      } else if (e.key === '2' || e.key.toLowerCase() === 'a') {
        e.preventDefault();
        onSelectAdvanced();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose, onSelectSimple, onSelectAdvanced]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-zinc-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-zinc-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">Nuevo Pedido</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Elige cómo prefieres cargar los datos del pedido
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onSelectSimple}
            className="group text-left p-4 rounded-xl border-2 border-zinc-900 bg-zinc-50 hover:bg-zinc-100 transition-all flex flex-col justify-between gap-3 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="w-9 h-9 rounded-xl bg-zinc-900 text-white flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-semibold">
                Tecla 1
              </span>
            </div>
            <div>
              <div className="text-sm font-bold text-zinc-900">Modo Simple</div>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                Un campo a la vez, en pantalla limpia, presionando Enter hasta verificar y guardar.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={onSelectAdvanced}
            className="group text-left p-4 rounded-xl border border-zinc-200 bg-white hover:border-zinc-400 hover:bg-zinc-50 transition-all flex flex-col justify-between gap-3 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="w-9 h-9 rounded-xl bg-zinc-100 border border-zinc-200 text-zinc-800 flex items-center justify-center">
                <SlidersHorizontal className="w-4 h-4" />
              </span>
              <span className="px-2 py-0.5 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-600 text-[10px] font-semibold">
                Tecla 2
              </span>
            </div>
            <div>
              <div className="text-sm font-bold text-zinc-900">Modo Avanzado</div>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                Formulario tradicional completo con mapa, coordenadas y todos los campos juntos.
              </p>
            </div>
          </button>
        </div>

        <div className="px-5 py-3 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between text-[11px] text-zinc-500">
          <span>Presiona 1 para Simple, 2 para Avanzado o Esc para cerrar</span>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ClipboardCheck,
  CornerDownLeft,
  Layers,
  Package,
  RotateCcw,
  Shirt,
  Truck
} from 'lucide-react';
import {
  useAdmin,
  buildMadeKey,
  isProductAccessory
} from '../../context/AdminContext';
import { Order } from '../../types';
import {
  formatCOP,
  getPaidAmount,
  getPendingAmount,
  isOrderActive
} from '../../utils/helpers';

interface QuickCheckViewProps {
  onGoToOrders: () => void;
  onGoToBento: () => void;
}

interface SessionDecision {
  orderId: string;
  customerName: string;
  action: 'done' | 'shipped' | 'inventory';
  trackingNumber?: string;
}

function TypewriterHeading({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    setDisplayed('');
    let index = 0;
    const interval = setInterval(() => {
      index += 1;
      setDisplayed(text.slice(0, index));
      if (index >= text.length) {
        clearInterval(interval);
      }
    }, 18);
    return () => clearInterval(interval);
  }, [text]);

  return (
    <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold tracking-tight text-zinc-900 leading-tight whitespace-nowrap overflow-hidden">
      <span>{displayed}</span>
      <span
        aria-hidden="true"
        className="inline-block w-[3px] h-[0.8em] bg-zinc-900 ml-1.5 align-[-0.06em] animate-pulse"
      />
    </h1>
  );
}

function getOrderNumber(id: string): number {
  const num = parseInt(String(id || '').replace(/\D/g, ''), 10);
  return isNaN(num) ? 0 : num;
}

function sortOldestToNewest(list: Order[]): Order[] {
  return [...list].sort((a, b) => {
    const dateCmp = String(a.createdAt || '').localeCompare(String(b.createdAt || ''));
    if (dateCmp !== 0) return dateCmp;
    return getOrderNumber(a.id) - getOrderNumber(b.id);
  });
}

export default function QuickCheckView({
  onGoToOrders,
  onGoToBento
}: QuickCheckViewProps) {
  const {
    orders,
    setOrders,
    catalog,
    setMadeItems,
    productionMatrix,
    handleToggleItemPacked,
    notify
  } = useAdmin();

  const [scope, setScope] = useState<'pending' | 'all'>('pending');
  const [queueIds, setQueueIds] = useState<string[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [askTracking, setAskTracking] = useState(false);
  const [trackingDraft, setTrackingDraft] = useState('');
  const [syncInventoryOnDone, setSyncInventoryOnDone] = useState(true);
  const [decisions, setDecisions] = useState<Record<string, SessionDecision>>({});
  const [inventorySyncedIds, setInventorySyncedIds] = useState<Record<string, boolean>>({});

  const buildQueue = (targetScope: 'pending' | 'all') => {
    const active = orders.filter(isOrderActive);
    const filtered =
      targetScope === 'pending'
        ? active.filter(o => o.shippingStatus !== 'Enviado' && o.shippingStatus !== 'Entregado')
        : active;
    return sortOldestToNewest(filtered).map(o => o.id);
  };

  useEffect(() => {
    const ids = buildQueue(scope);
    setQueueIds(ids);
    setCurrentIdx(0);
    setShowSummary(false);
    setAskTracking(false);
    setTrackingDraft('');
  }, [scope]);

  const productionRowMap = useMemo(() => {
    const map: Record<string, { missing: number; made: number }> = {};
    (productionMatrix.rows || []).forEach((r: any) => {
      map[r.key] = {
        missing: Number(r.missing) || 0,
        made: Number(r.made) || 0
      };
    });
    return map;
  }, [productionMatrix]);

  const getItemProductionKey = (item: any) => {
    const p = catalog.find(c => c.id === item.productId);
    const v =
      p?.variants.find(vx => vx.id === item.variantId || vx.name === item.variantName) ||
      p?.variants[0];
    const isAcc = isProductAccessory(p);
    return buildMadeKey(
      p?.id || item.productId,
      v?.id || item.variantId || item.variantName || 'v-std',
      isAcc ? 'Única' : (item.size || 'M'),
      item.gender || 'Sin especificar',
      isAcc
    );
  };

  const validQueueOrders = useMemo(() => {
    return queueIds
      .map(id => orders.find(o => o.id === id))
      .filter((o): o is Order => Boolean(o));
  }, [queueIds, orders]);

  const currentOrder = !showSummary ? validQueueOrders[currentIdx] || null : null;
  const totalInQueue = validQueueOrders.length;
  const progressPct =
    totalInQueue === 0
      ? 100
      : showSummary
      ? 100
      : Math.round(((currentIdx + 1) / totalInQueue) * 100);

  const syncOrderToInventoryIfNeeded = (order: Order) => {
    if (!syncInventoryOnDone) return;
    if (inventorySyncedIds[order.id]) return;
    if (order.shippingStatus !== 'Por preparar') return;

    setMadeItems(prev => {
      const next = { ...prev };
      const remainingMissingByKey: Record<string, number> = {};

      order.items.forEach(it => {
        const key = getItemProductionKey(it);
        if (remainingMissingByKey[key] === undefined) {
          remainingMissingByKey[key] = productionRowMap[key]?.missing || 0;
        }
        const currentMissing = remainingMissingByKey[key];
        if (currentMissing > 0) {
          const addQty = Math.min(Math.max(1, Number(it.qty) || 1), currentMissing);
          const baseMade =
            next[key] !== undefined
              ? Number(next[key]) || 0
              : productionRowMap[key]?.made || 0;
          next[key] = baseMade + addQty;
          remainingMissingByKey[key] = Math.max(0, currentMissing - addQty);
        }
      });

      return next;
    });
    setInventorySyncedIds(prev => ({ ...prev, [order.id]: true }));
  };

  const advanceQueue = () => {
    setAskTracking(false);
    setTrackingDraft('');
    if (currentIdx + 1 < totalInQueue) {
      setCurrentIdx(prev => prev + 1);
    } else {
      setShowSummary(true);
    }
  };

  const handleMarkDone = () => {
    if (!currentOrder) return;
    syncOrderToInventoryIfNeeded(currentOrder);
    setOrders(prev =>
      prev.map(o =>
        o.id === currentOrder.id
          ? {
              ...o,
              shippingStatus: 'Por enviar',
              items: o.items.map(it => ({ ...it, packed: true }))
            }
          : o
      )
    );
    setDecisions(prev => ({
      ...prev,
      [currentOrder.id]: {
        orderId: currentOrder.id,
        customerName: currentOrder.customerName,
        action: 'done'
      }
    }));
    notify(`${currentOrder.id} marcado como hecho (Por enviar)`);
    advanceQueue();
  };

  const handleConfirmShipped = () => {
    if (!currentOrder) return;
    syncOrderToInventoryIfNeeded(currentOrder);
    const cleanGuide = trackingDraft.trim() || currentOrder.trackingNumber || '';
    setOrders(prev =>
      prev.map(o =>
        o.id === currentOrder.id
          ? {
              ...o,
              shippingStatus: 'Enviado',
              trackingNumber: cleanGuide,
              items: o.items.map(it => ({ ...it, packed: true }))
            }
          : o
      )
    );
    setDecisions(prev => ({
      ...prev,
      [currentOrder.id]: {
        orderId: currentOrder.id,
        customerName: currentOrder.customerName,
        action: 'shipped',
        trackingNumber: cleanGuide
      }
    }));
    notify(`${currentOrder.id} marcado como Enviado`);
    advanceQueue();
  };

  const handleSendToInventory = () => {
    if (!currentOrder) return;
    setOrders(prev =>
      prev.map(o =>
        o.id === currentOrder.id
          ? {
              ...o,
              shippingStatus: 'Por preparar',
              items: o.items.map(it => ({ ...it, packed: false }))
            }
          : o
      )
    );
    setDecisions(prev => ({
      ...prev,
      [currentOrder.id]: {
        orderId: currentOrder.id,
        customerName: currentOrder.customerName,
        action: 'inventory'
      }
    }));
    notify(`${currentOrder.id} dejado en Por preparar (falta taller)`);
    advanceQueue();
  };

  const handleGoBack = () => {
    if (askTracking) {
      setAskTracking(false);
      return;
    }
    if (showSummary) {
      setShowSummary(false);
      setCurrentIdx(Math.max(0, totalInQueue - 1));
      return;
    }
    if (currentIdx > 0) {
      setCurrentIdx(prev => prev - 1);
    }
  };

  const handleRestart = () => {
    const ids = buildQueue(scope);
    setQueueIds(ids);
    setCurrentIdx(0);
    setShowSummary(false);
    setAskTracking(false);
    setTrackingDraft('');
    setDecisions({});
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
        if (e.key === 'Enter' && askTracking) {
          e.preventDefault();
          handleConfirmShipped();
        } else if (e.key === 'Escape' && askTracking) {
          e.preventDefault();
          setAskTracking(false);
        }
        return;
      }

      if (showSummary || !currentOrder) return;

      if (askTracking) {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleConfirmShipped();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          setAskTracking(false);
        }
        return;
      }

      if (e.key === 'Enter' || e.key === '1') {
        e.preventDefault();
        handleMarkDone();
      } else if (e.key === '2') {
        e.preventDefault();
        setTrackingDraft(currentOrder.trackingNumber || '');
        setAskTracking(true);
      } else if (e.key === '3') {
        e.preventDefault();
        handleSendToInventory();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        advanceQueue();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleGoBack();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  const decisionList = Object.values(decisions);
  const doneCount = decisionList.filter(d => d.action === 'done').length;
  const shippedCount = decisionList.filter(d => d.action === 'shipped').length;
  const inventoryCount = decisionList.filter(d => d.action === 'inventory').length;

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden flex flex-col min-h-[76vh] shadow-2xs">
      <style>{`
        @keyframes mfbCheckReveal {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .mfb-check-reveal {
          animation: mfbCheckReveal 0.22s ease-out;
        }
      `}</style>

      <div className="w-full h-1.5 bg-zinc-100 shrink-0">
        <div
          className="h-full bg-zinc-900 transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <header className="px-4 sm:px-6 h-16 flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleGoBack}
            disabled={!showSummary && !askTracking && currentIdx === 0}
            className="h-9 px-3 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 disabled:opacity-40 text-xs font-medium text-zinc-700 inline-flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Atrás</span>
          </button>

          <div className="inline-flex p-0.5 rounded-xl bg-zinc-100 border border-zinc-200 text-xs">
            <button
              type="button"
              onClick={() => setScope('pending')}
              className={`px-2.5 py-1 rounded-lg font-medium cursor-pointer ${
                scope === 'pending' ? 'bg-white text-zinc-900 shadow-2xs' : 'text-zinc-500'
              }`}
            >
              Sin enviar
            </button>
            <button
              type="button"
              onClick={() => setScope('all')}
              className={`px-2.5 py-1 rounded-lg font-medium cursor-pointer ${
                scope === 'all' ? 'bg-white text-zinc-900 shadow-2xs' : 'text-zinc-500'
              }`}
            >
              Todos activos
            </button>
          </div>

          <button
            type="button"
            onClick={handleRestart}
            className="h-9 px-2.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-xs text-zinc-600 inline-flex items-center gap-1 cursor-pointer"
            title="Recargar cola del más viejo al más nuevo"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reiniciar</span>
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          {!showSummary && currentOrder ? (
            <>
              <span className="text-xs font-mono text-zinc-400">
                {currentIdx + 1} de {totalInQueue}
              </span>
              <div className="px-3.5 py-1.5 rounded-full bg-zinc-100 border border-zinc-200 text-xs font-semibold text-zinc-900 font-mono">
                {currentOrder.id} · {currentOrder.createdAt || '—'}
              </div>
            </>
          ) : (
            <div className="px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
              Resumen de Revisión
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-5 sm:px-10 py-8">
        {totalInQueue === 0 ? (
          <div className="mfb-check-reveal w-full max-w-xl text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900">
              No hay pedidos pendientes por revisar
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500">
              Todos tus pedidos activos ya fueron enviados o no hay órdenes cargadas todavía.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setScope('all')}
                className="h-10 px-4 rounded-xl border border-zinc-200 bg-white text-xs font-semibold text-zinc-800 cursor-pointer"
              >
                Ver todos los pedidos activos
              </button>
              <button
                type="button"
                onClick={onGoToOrders}
                className="h-10 px-4 rounded-xl bg-zinc-900 text-white text-xs font-semibold cursor-pointer"
              >
                Ir a Ventas y Pedidos
              </button>
            </div>
          </div>
        ) : showSummary ? (
          <div className="mfb-check-reveal w-full max-w-2xl space-y-6">
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
                Verificación Final
              </div>
              <TypewriterHeading text="¡Revisión completada!" />
              <p className="text-sm text-zinc-500">
                Aquí tienes el resumen de los cambios guardados automáticamente en NeonDB.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div
                className="p-4 rounded-2xl border border-zinc-200"
                style={{ backgroundColor: 'rgba(14, 165, 233, 0.08)', boxShadow: 'inset 3px 0 0 #0ea5e9' }}
              >
                <div className="text-xs text-zinc-500">Listos / Por enviar</div>
                <div className="text-2xl font-bold text-zinc-900 mt-1 tabular-nums">{doneCount}</div>
              </div>
              <div
                className="p-4 rounded-2xl border border-zinc-200"
                style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', boxShadow: 'inset 3px 0 0 #10b981' }}
              >
                <div className="text-xs text-zinc-500">Marcados Enviado</div>
                <div className="text-2xl font-bold text-zinc-900 mt-1 tabular-nums">{shippedCount}</div>
              </div>
              <div
                className="p-4 rounded-2xl border border-zinc-200"
                style={{ backgroundColor: 'rgba(245, 158, 11, 0.08)', boxShadow: 'inset 3px 0 0 #f59e0b' }}
              >
                <div className="text-xs text-zinc-500">Quedan en inventario</div>
                <div className="text-2xl font-bold text-zinc-900 mt-1 tabular-nums">{inventoryCount}</div>
              </div>
            </div>

            {decisionList.length > 0 && (
              <div className="rounded-2xl border border-zinc-200 overflow-hidden divide-y divide-zinc-200">
                {decisionList.map(dec => (
                  <div key={dec.orderId} className="px-4 py-3 flex items-center justify-between gap-2 text-xs">
                    <div>
                      <span className="font-mono font-bold text-zinc-900">{dec.orderId}</span>
                      <span className="text-zinc-600"> · {dec.customerName}</span>
                      {dec.trackingNumber && (
                        <span className="text-zinc-400 font-mono"> · Guía {dec.trackingNumber}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full border border-zinc-200 bg-zinc-50 font-semibold text-zinc-800">
                        {dec.action === 'shipped'
                          ? 'Enviado'
                          : dec.action === 'done'
                          ? 'Hecho · Por enviar'
                          : 'Falta en taller'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const targetIdx = validQueueOrders.findIndex(o => o.id === dec.orderId);
                          if (targetIdx >= 0) {
                            setCurrentIdx(targetIdx);
                            setShowSummary(false);
                          }
                        }}
                        className="text-zinc-500 hover:text-zinc-900 underline cursor-pointer"
                      >
                        Editar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handleRestart}
                className="h-11 px-4 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-semibold text-zinc-700 inline-flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Volver a empezar</span>
              </button>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={onGoToBento}
                  className="h-11 px-4 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-semibold text-zinc-800 inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Layers className="w-4 h-4" />
                  <span>Ir a Inventario Bento</span>
                </button>
                <button
                  type="button"
                  onClick={onGoToOrders}
                  className="h-11 px-5 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <ClipboardCheck className="w-4 h-4" />
                  <span>Volver a Ventas</span>
                </button>
              </div>
            </div>
          </div>
        ) : currentOrder ? (
          <div key={currentOrder.id} className="mfb-check-reveal w-full max-w-2xl space-y-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-semibold uppercase tracking-widest text-zinc-400">
                  Más viejo a más nuevo · {currentOrder.shippingStatus}
                </span>
                {getPendingAmount(currentOrder) > 0 ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 font-semibold">
                    Debe {formatCOP(getPendingAmount(currentOrder))}
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold">
                    Pagado 100% ({formatCOP(getPaidAmount(currentOrder))})
                  </span>
                )}
              </div>

              <TypewriterHeading
                text={
                  askTracking
                    ? '¿Tienes el número de guía de envío?'
                    : currentOrder.shippingStatus === 'Por enviar'
                    ? `¿Ya se envió el pedido de ${currentOrder.customerName}?`
                    : `¿Está hecho el pedido de ${currentOrder.customerName}?`
                }
              />

              <p className="text-xs sm:text-sm text-zinc-500">
                {currentOrder.city}
                {currentOrder.neighborhood ? ` (${currentOrder.neighborhood})` : ''}
                {currentOrder.address ? ` · ${currentOrder.address}` : ''} · {currentOrder.carrier}
              </p>
            </div>

            {!askTracking ? (
              <>
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-700 inline-flex items-center gap-1.5">
                      <Shirt className="w-4 h-4" />
                      Prendas en este pedido ({currentOrder.items.reduce((s, it) => s + (Number(it.qty) || 1), 0)} uds)
                    </span>
                    <span className="font-mono text-zinc-500">{formatCOP(currentOrder.total)}</span>
                  </div>

                  <div className="space-y-2">
                    {currentOrder.items.map((item, idx) => {
                      const prodKey = getItemProductionKey(item);
                      const isMissingInInv = (productionRowMap[prodKey]?.missing || 0) > 0;
                      return (
                        <button
                          key={item.id || idx}
                          type="button"
                          onClick={() => handleToggleItemPacked(currentOrder.id, idx)}
                          className="w-full text-left px-3.5 py-3 rounded-xl bg-white border border-zinc-200 hover:border-zinc-400 transition-all flex items-center justify-between gap-3 cursor-pointer"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span
                              className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 ${
                                item.packed
                                  ? 'bg-zinc-900 border-zinc-900 text-white'
                                  : 'bg-zinc-50 border-zinc-300 text-transparent'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5" />
                            </span>
                            <div className="min-w-0">
                              <div className={`text-sm font-semibold text-zinc-900 ${item.packed ? 'line-through opacity-70' : ''}`}>
                                {item.qty}× {item.productName}
                              </div>
                              <div className="text-xs text-zinc-500">
                                {item.variantName} · Talla <strong>{item.size}</strong> · {item.gender || 'Sin especificar'}
                              </div>
                            </div>
                          </div>

                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border shrink-0 ${
                              item.packed
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                : isMissingInInv
                                ? 'bg-amber-50 border-amber-200 text-amber-900'
                                : 'bg-sky-50 border-sky-200 text-sky-800'
                            }`}
                          >
                            {item.packed
                              ? 'Empacada'
                              : isMissingInInv
                              ? 'Falta en taller'
                              : 'Ya en inventario'}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {currentOrder.notes && (
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950">
                      <strong>Nota:</strong> {currentOrder.notes}
                    </div>
                  )}
                </div>

                {currentOrder.shippingStatus === 'Por preparar' && (
                  <label className="inline-flex items-center gap-2 text-xs text-zinc-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={syncInventoryOnDone}
                      onChange={e => setSyncInventoryOnDone(e.target.checked)}
                      className="rounded border-zinc-300"
                    />
                    <span>Al marcar como hecho, descontar automáticamente del pendiente de inventario</span>
                  </label>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={handleMarkDone}
                    className="p-4 rounded-2xl bg-zinc-900 text-white hover:bg-zinc-800 text-left transition-all flex flex-col justify-between gap-2 cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <Package className="w-5 h-5" />
                      <kbd className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] font-mono inline-flex items-center gap-1">
                        Enter <CornerDownLeft className="w-3 h-3" />
                      </kbd>
                    </div>
                    <div>
                      <div className="text-sm font-bold">Sí, está hecho</div>
                      <div className="text-[11px] opacity-75">Pasa a Por enviar</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTrackingDraft(currentOrder.trackingNumber || '');
                      setAskTracking(true);
                    }}
                    className="p-4 rounded-2xl border border-zinc-200 bg-white hover:bg-zinc-50 text-left transition-all flex flex-col justify-between gap-2 cursor-pointer"
                    style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)' }}
                  >
                    <div className="flex items-center justify-between">
                      <Truck className="w-5 h-5 text-emerald-600" />
                      <kbd className="px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-[10px] font-mono text-zinc-600">
                        2
                      </kbd>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-zinc-900">Ya se envió</div>
                      <div className="text-[11px] text-zinc-500">Marca Enviado + guía</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={handleSendToInventory}
                    className="p-4 rounded-2xl border border-zinc-200 bg-white hover:bg-zinc-50 text-left transition-all flex flex-col justify-between gap-2 cursor-pointer"
                    style={{ backgroundColor: 'rgba(245, 158, 11, 0.08)' }}
                  >
                    <div className="flex items-center justify-between">
                      <Layers className="w-5 h-5 text-amber-600" />
                      <kbd className="px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-[10px] font-mono text-zinc-600">
                        3
                      </kbd>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-zinc-900">No, falta hacer</div>
                      <div className="text-[11px] text-zinc-500">Dejar en inventario</div>
                    </div>
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 text-xs text-zinc-500">
                  <button
                    type="button"
                    onClick={() => setShowSummary(true)}
                    className="hover:text-zinc-900 underline cursor-pointer"
                  >
                    Terminar y ver resumen ({decisionList.length})
                  </button>
                  <button
                    type="button"
                    onClick={advanceQueue}
                    className="inline-flex items-center gap-1 font-medium hover:text-zinc-900 cursor-pointer"
                  >
                    <span>Saltar sin cambiar</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-5">
                <input
                  type="text"
                  autoFocus
                  value={trackingDraft}
                  onChange={e => setTrackingDraft(e.target.value)}
                  placeholder="Ej: 700123456789 (o deja vacío y presiona Enter)"
                  className="w-full py-3 text-2xl font-mono font-medium bg-transparent border-b-2 border-zinc-300 focus:border-zinc-900 focus:outline-none text-zinc-900 placeholder:text-zinc-400"
                />

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setAskTracking(false)}
                    className="h-11 px-4 rounded-xl border border-zinc-200 bg-white text-xs font-semibold text-zinc-700 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmShipped}
                    className="h-11 px-6 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirmar Enviado</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </main>
    </div>
  );
}
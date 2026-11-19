import React, { useState, useMemo } from 'react';
import {
  LayoutGrid,
  Shirt,
  Sparkles,
  Plus,
  Minus,
  CheckCircle2,
  Users,
  ShoppingBag,
  Layers
} from 'lucide-react';
import {
  useAdmin,
  buildMadeKey,
  buildSupplyKey,
  normalizeInventoryGender,
  isProductAccessory
} from '../../context/AdminContext';
import { Product, ProductVariant, Order } from '../../types';
import { ALL_GARMENT_SIZES, GARMENT_GENDERS, OFFICIAL_CATALOG_FALLBACK } from '../../utils/constants';
import { isOrderActive } from '../../utils/helpers';

function inferSwatchColor(variant?: Partial<ProductVariant> | null): string {
  const txt = `${variant?.vinylColor || ''} ${variant?.name || ''}`.toLowerCase();
  if (txt.includes('negro') || txt.includes('black')) return '#1f1f24';
  if (txt.includes('blanco') || txt.includes('crema') || txt.includes('beige')) return '#f3efe6';
  if (txt.includes('celeste')) return '#7dd3fc';
  if (txt.includes('azul') || txt.includes('ocean')) return '#3b82f6';
  if (txt.includes('rosa') || txt.includes('pink') || txt.includes('tropi') || txt.includes('bonito')) return '#f472b6';
  if (txt.includes('platead') || txt.includes('brillo') || txt.includes('estrella')) return '#cbd5e1';
  if (txt.includes('morad') || txt.includes('lila') || txt.includes('bichota')) return '#c084fc';
  if (txt.includes('verde')) return '#34d399';
  return '#a1a1aa';
}

function classifyBentoGroup(product: Product): { id: string; title: string; subtitle: string; isAccessory: boolean } {
  const isAcc = isProductAccessory(product);
  if (isAcc) {
    return {
      id: 'accessories',
      title: 'Accesorios y Llaveros',
      subtitle: 'Mini CDs (NFC / QR) y kits · Talla Única',
      isAccessory: true
    };
  }
  const n = `${product.name} ${product.code || ''}`.toLowerCase();
  if (n.includes('hoodie') || n.includes('buzo')) {
    return {
      id: 'hoodies',
      title: 'Hoodies y Buzos',
      subtitle: 'Control separado por corte Femenino / Masculino',
      isAccessory: false
    };
  }
  if (n.includes('crop')) {
    return {
      id: 'croptops',
      title: 'Croptops',
      subtitle: 'Control separado por talla y corte',
      isAccessory: false
    };
  }
  if (n.includes('raglan') || n.includes('nmadst') || n.includes('camiseta') || n.includes('oversized') || n.includes('sparkly')) {
    return {
      id: 'tees',
      title: 'Camisetas y Raglans',
      subtitle: 'Control separado por corte Femenino / Masculino',
      isAccessory: false
    };
  }
  return {
    id: 'other-garments',
    title: 'Otras Prendas y Personalizadas',
    subtitle: 'Control separado por talla y corte',
    isAccessory: false
  };
}

interface BentoCardProps {
  groupTitle: string;
  groupSubtitle: string;
  products: Product[];
  orders: Order[];
  madeItems: Record<string, number>;
  setMadeItems: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  boughtSupplies: Record<string, number>;
  setBoughtSupplies: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  notify: (msg: string, type?: string) => void;
}

function BentoCategoryCard({
  groupTitle,
  groupSubtitle,
  products,
  orders,
  madeItems,
  setMadeItems,
  boughtSupplies,
  setBoughtSupplies,
  notify
}: BentoCardProps) {
  const [selectedProdId, setSelectedProdId] = useState<string>(products[0]?.id || '');
  const activeProduct = products.find(p => p.id === selectedProdId) || products[0];
  const isAcc = isProductAccessory(activeProduct);

  const variants = useMemo<ProductVariant[]>(() => {
    if (!activeProduct) return [];
    return activeProduct.variants?.length
      ? activeProduct.variants
      : [{ id: 'v-std', name: 'Estándar', extraPrice: 0, extraCost: 0 }];
  }, [activeProduct]);

  const [selectedVariantId, setSelectedVariantId] = useState<string>(variants[0]?.id || 'v-std');
  const activeVariant = variants.find(v => v.id === selectedVariantId) || variants[0];

  const availableSizes = useMemo(() => {
    if (!activeProduct) return ['M'];
    return isAcc ? (activeProduct.sizes?.length ? activeProduct.sizes : ['Única']) : ALL_GARMENT_SIZES;
  }, [activeProduct, isAcc]);

  const [selectedSize, setSelectedSize] = useState<string>(isAcc ? 'Única' : 'M');
  const activeSize = availableSizes.includes(selectedSize) ? selectedSize : availableSizes[0];

  const [selectedGender, setSelectedGender] = useState<string>('Femenino');
  const activeGender = isAcc ? 'Única' : normalizeInventoryGender(selectedGender);

  const activeOrders = useMemo(() => orders.filter(isOrderActive), [orders]);

  const getMadeCount = (prod: Product, variant: ProductVariant, size: string, gender: string) => {
    const acc = isProductAccessory(prod);
    const normGender = acc ? 'Única' : normalizeInventoryGender(gender);
    const vId = variant.id || variant.name || 'v-std';
    const key = buildMadeKey(prod.id, vId, size, normGender, acc);
    if (madeItems[key] !== undefined) return Number(madeItems[key]) || 0;
    if (!acc && normGender === 'Sin especificar') {
      const legacyKey = `${prod.id}|||${vId}|||${size}`;
      if (madeItems[legacyKey] !== undefined) return Number(madeItems[legacyKey]) || 0;
    }
    return 0;
  };

  const getBoughtCount = (blankName: string, size: string, gender: string, acc: boolean) => {
    const normGender = acc ? 'Única' : normalizeInventoryGender(gender);
    const key = buildSupplyKey(blankName, size, normGender, acc);
    if (boughtSupplies[key] !== undefined) return Number(boughtSupplies[key]) || 0;
    if (!acc && normGender === 'Sin especificar') {
      const legacyKey = `${blankName}___${size}`;
      if (boughtSupplies[legacyKey] !== undefined) return Number(boughtSupplies[legacyKey]) || 0;
    }
    return 0;
  };

  const getOrderedQtyForCombo = (prod: Product, variant: ProductVariant, size: string, gender: string) => {
    const acc = isProductAccessory(prod);
    const normGender = acc ? 'Única' : normalizeInventoryGender(gender);
    let total = 0;
    activeOrders.forEach(o => {
      o.items.forEach(it => {
        if (it.productId !== prod.id) return;
        const variantMatch = it.variantId === variant.id || it.variantName === variant.name;
        if (!variantMatch) return;
        const itemSize = acc ? 'Única' : (it.size || 'M');
        if (itemSize !== size) return;
        if (!acc && normalizeInventoryGender(it.gender) !== normGender) return;
        total += Number(it.qty) || 0;
      });
    });
    return total;
  };

  if (!activeProduct || !activeVariant) return null;

  const blankName = activeVariant.blankOverride || activeProduct.blankName || 'Prenda Base';
  const madeKey = buildMadeKey(activeProduct.id, activeVariant.id || activeVariant.name, activeSize, activeGender, isAcc);
  const supplyKey = buildSupplyKey(blankName, activeSize, activeGender, isAcc);

  const orderedQty = getOrderedQtyForCombo(activeProduct, activeVariant, activeSize, activeGender);
  const madeQty = getMadeCount(activeProduct, activeVariant, activeSize, activeGender);
  const missingToMake = Math.max(0, orderedQty - madeQty);

  const requiredBlankQty = useMemo(() => {
    let sum = 0;
    activeOrders.forEach(o => {
      o.items.forEach(it => {
        const p = products.find(pr => pr.id === it.productId);
        if (!p) return;
        const v = p.variants?.find(vx => vx.id === it.variantId || vx.name === it.variantName) || p.variants?.[0];
        const bName = v?.blankOverride || p.blankName || 'Prenda Base';
        if (bName !== blankName) return;
        const acc = isProductAccessory(p);
        const sz = acc ? 'Única' : (it.size || 'M');
        if (sz !== activeSize) return;
        if (!acc && normalizeInventoryGender(it.gender) !== activeGender) return;
        sum += Number(it.qty) || 0;
      });
    });
    return sum;
  }, [activeOrders, products, blankName, activeSize, activeGender]);

  const boughtQty = getBoughtCount(blankName, activeSize, activeGender, isAcc);
  const missingToBuy = Math.max(0, requiredBlankQty - boughtQty);

  const matchingCustomers = useMemo(() => {
    const matches: { orderId: string; customerName: string; qty: number; shippingStatus: string }[] = [];
    activeOrders.forEach(o => {
      o.items.forEach(it => {
        if (it.productId !== activeProduct.id) return;
        const variantMatch = it.variantId === activeVariant.id || it.variantName === activeVariant.name;
        if (!variantMatch) return;
        const sz = isAcc ? 'Única' : (it.size || 'M');
        if (sz !== activeSize) return;
        if (!isAcc && normalizeInventoryGender(it.gender) !== activeGender) return;
        matches.push({
          orderId: o.id,
          customerName: o.customerName,
          qty: Number(it.qty) || 1,
          shippingStatus: o.shippingStatus
        });
      });
    });
    return matches;
  }, [activeOrders, activeProduct, activeVariant, activeSize, activeGender, isAcc]);

  const updateMade = (nextVal: number) => {
    const safe = Math.max(0, Math.round(nextVal));
    setMadeItems(prev => ({
      ...prev,
      [madeKey]: safe
    }));
  };

  const updateBought = (nextVal: number) => {
    const safe = Math.max(0, Math.round(nextVal));
    setBoughtSupplies(prev => ({
      ...prev,
      [supplyKey]: safe
    }));
  };

  return (
    <section className="bg-white border border-zinc-200 rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-4 shadow-2xs">
      <div className="space-y-4">
        {/* Cabecera de categoría */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-zinc-900 flex items-center gap-2">
              {isAcc ? <Sparkles className="w-4 h-4 shrink-0" /> : <Shirt className="w-4 h-4 shrink-0" />}
              <span>{groupTitle}</span>
            </h2>
            <p className="text-[11px] text-zinc-500 mt-0.5">{groupSubtitle}</p>
          </div>
          <span className="px-2 py-0.5 rounded-lg bg-zinc-50 border border-zinc-200 text-[10px] font-mono text-zinc-500 shrink-0">
            {products.length} {products.length === 1 ? 'ref' : 'refs'}
          </span>
        </div>

        {/* 1. Selector de Modelo */}
        <div className="space-y-1.5">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            1. Modelo
          </div>
          <div className="flex flex-wrap gap-1.5">
            {products.map(p => {
              const selected = p.id === activeProduct.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setSelectedProdId(p.id);
                    const nextVars = p.variants?.length ? p.variants : [{ id: 'v-std', name: 'Estándar' }];
                    setSelectedVariantId(nextVars[0].id);
                  }}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    selected
                      ? 'bg-zinc-900 text-white border-zinc-900'
                      : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                  }`}
                >
                  {p.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Selector de Variante / Color */}
        <div className="space-y-1.5">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            2. Color / Variante
          </div>
          <div className="flex flex-wrap gap-1.5">
            {variants.map(v => {
              const selected = v.id === activeVariant.id;
              const swatch = inferSwatchColor(v);
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedVariantId(v.id)}
                  className={`px-2.5 py-1.5 rounded-xl border text-xs font-medium inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                    selected
                      ? 'bg-zinc-900 text-white border-zinc-900'
                      : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 border border-zinc-400/50"
                    style={{ backgroundColor: swatch }}
                  />
                  <span>{v.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Selector de Corte (Femenino / Masculino / Sin especificar) — Independiente */}
        {!isAcc && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                3. Corte / Género (Stock independiente)
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">
                Activo: {activeGender}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {GARMENT_GENDERS.map(g => {
                const selected = activeGender === g;
                const gOrdered = availableSizes.reduce(
                  (acc, sz) => acc + getOrderedQtyForCombo(activeProduct, activeVariant, sz, g),
                  0
                );
                const gMade = availableSizes.reduce(
                  (acc, sz) => acc + getMadeCount(activeProduct, activeVariant, sz, g),
                  0
                );
                const gMissing = availableSizes.reduce((acc, sz) => {
                  const ord = getOrderedQtyForCombo(activeProduct, activeVariant, sz, g);
                  const md = getMadeCount(activeProduct, activeVariant, sz, g);
                  return acc + Math.max(0, ord - md);
                }, 0);

                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setSelectedGender(g)}
                    className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                      selected
                        ? 'bg-zinc-900 text-white border-zinc-900'
                        : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                    }`}
                  >
                    <div className="text-xs font-bold truncate">{g}</div>
                    <div className="text-[10px] opacity-80 font-mono mt-0.5 flex items-center justify-between gap-1">
                      <span>Stock: {gMade}</span>
                      {gMissing > 0 ? (
                        <span className={selected ? 'underline font-bold' : 'text-amber-700 font-bold'}>
                          -{gMissing}
                        </span>
                      ) : gOrdered > 0 ? (
                        <span className={selected ? 'opacity-90' : 'text-emerald-700 font-semibold'}>✓</span>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. Selector de Talla (refleja el corte seleccionado) */}
        <div className="space-y-1.5">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            {isAcc ? '3. Talla' : `4. Talla (${activeGender})`}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {availableSizes.map(sz => {
              const selected = sz === activeSize;
              const szOrd = getOrderedQtyForCombo(activeProduct, activeVariant, sz, activeGender);
              const szMade = getMadeCount(activeProduct, activeVariant, sz, activeGender);
              const szMiss = Math.max(0, szOrd - szMade);
              return (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setSelectedSize(sz)}
                  className={`min-w-[54px] px-2.5 py-1.5 rounded-xl border text-center transition-all cursor-pointer ${
                    selected
                      ? 'bg-zinc-900 text-white border-zinc-900'
                      : szMiss > 0
                      ? 'bg-amber-50 border-amber-200 text-amber-900'
                      : szMade > 0
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                  }`}
                >
                  <div className="text-xs font-bold leading-none">{sz}</div>
                  <div className="text-[9px] font-mono mt-1 opacity-85 leading-none">
                    {szMade}/{szOrd}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Panel de contadores exactos para esta combinación */}
        <div className="rounded-xl bg-zinc-50 border border-zinc-200 p-3.5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="font-bold text-zinc-900">
              {activeProduct.name} · {activeVariant.name} ·{' '}
              <span className="underline">
                Talla {activeSize}{!isAcc ? ` (${activeGender})` : ''}
              </span>
            </div>
            {missingToMake > 0 ? (
              <span className="px-2 py-0.5 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-semibold">
                Faltan {missingToMake} por hacer
              </span>
            ) : orderedQty > 0 ? (
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold inline-flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Pedidos cubiertos
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-md bg-white border border-zinc-200 text-zinc-500 text-[11px]">
                Stock libre: {madeQty}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Ya Hechas / Estampadas */}
            <div className="p-3 rounded-xl bg-white border border-zinc-200 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-zinc-700 inline-flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" /> Ya Hechas
                </span>
                <span className="font-mono text-zinc-500">Pedidas: {orderedQty}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => updateMade(madeQty - 1)}
                  className="h-9 w-9 rounded-lg border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 flex items-center justify-center cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <input
                  type="number"
                  min="0"
                  value={madeQty}
                  onChange={e => updateMade(Number(e.target.value) || 0)}
                  className="flex-1 h-9 text-center rounded-lg border border-zinc-200 bg-zinc-50 font-mono text-sm font-bold text-zinc-900"
                />
                <button
                  type="button"
                  onClick={() => updateMade(madeQty + 1)}
                  className="h-9 w-9 rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 flex items-center justify-center cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              {missingToMake > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    updateMade(orderedQty);
                    notify(`Completadas ${orderedQty} uds de ${activeProduct.name} (${activeSize} · ${activeGender})`);
                  }}
                  className="w-full h-7 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold hover:bg-emerald-100 cursor-pointer"
                >
                  Marcar todas hechas ({orderedQty})
                </button>
              )}
            </div>

            {/* Prenda en Blanco / Compradas */}
            <div className="p-3 rounded-xl bg-white border border-zinc-200 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-zinc-700 inline-flex items-center gap-1">
                  <ShoppingBag className="w-3.5 h-3.5" /> En Blanco
                </span>
                <span className="font-mono text-zinc-500">Req: {requiredBlankQty}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => updateBought(boughtQty - 1)}
                  className="h-9 w-9 rounded-lg border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 flex items-center justify-center cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <input
                  type="number"
                  min="0"
                  value={boughtQty}
                  onChange={e => updateBought(Number(e.target.value) || 0)}
                  className="flex-1 h-9 text-center rounded-lg border border-zinc-200 bg-zinc-50 font-mono text-sm font-bold text-zinc-900"
                />
                <button
                  type="button"
                  onClick={() => updateBought(boughtQty + 1)}
                  className="h-9 w-9 rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 flex items-center justify-center cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="text-[10px] text-zinc-500 truncate" title={blankName}>
                Base: {blankName} {missingToBuy > 0 ? `· Faltan ${missingToBuy}` : ''}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Clientes que pidieron esta combinación exacta */}
      <div className="pt-2 border-t border-zinc-100">
        <div className="text-[11px] font-semibold text-zinc-600 flex items-center gap-1.5 mb-1.5">
          <Users className="w-3.5 h-3.5" />
          <span>
            Pedidos con esta combinación exacta ({matchingCustomers.length})
          </span>
        </div>
        {matchingCustomers.length === 0 ? (
          <p className="text-[11px] text-zinc-400">
            Sin pedidos activos para Talla {activeSize}{!isAcc ? ` · ${activeGender}` : ''}.
          </p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {matchingCustomers.map((m, idx) => (
              <span
                key={`${m.orderId}-${idx}`}
                className="px-2 py-1 rounded-lg bg-zinc-50 border border-zinc-200 text-[11px] text-zinc-700"
              >
                <strong className="font-mono text-zinc-900">{m.orderId}</strong> · {m.customerName} ({m.qty}×)
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default function BentoInventoryView() {
  const {
    catalog,
    orders,
    madeItems,
    setMadeItems,
    boughtSupplies,
    setBoughtSupplies,
    productionMatrix,
    shoppingNeeds,
    notify
  } = useAdmin();

  const effectiveCatalog = catalog.length ? catalog : OFFICIAL_CATALOG_FALLBACK;

  const groupedBento = useMemo(() => {
    const groups: Record<string, { id: string; title: string; subtitle: string; products: Product[] }> = {};
    effectiveCatalog.forEach(p => {
      const info = classifyBentoGroup(p);
      if (!groups[info.id]) {
        groups[info.id] = { id: info.id, title: info.title, subtitle: info.subtitle, products: [] };
      }
      groups[info.id].products.push(p);
    });
    const order = ['hoodies', 'tees', 'croptops', 'accessories', 'other-garments'];
    return order.map(id => groups[id]).filter(Boolean);
  }, [effectiveCatalog]);

  return (
    <div className="space-y-4">
      <section className="bg-white border border-zinc-200 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-zinc-900 flex items-center gap-2">
            <LayoutGrid className="w-5 h-5" />
            <span>Inventario Bento por Categoría, Talla y Corte</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            El stock de <strong>Femenino</strong>, <strong>Masculino</strong> y <strong>Sin especificar</strong> se guarda completamente por separado y se sincroniza en vivo con NeonDB.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-semibold">
            Por comprar: {shoppingNeeds.totalMissingToBuy}
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-semibold">
            Por estampar: {productionMatrix.totalMissingToMake}
          </span>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {groupedBento.map(group => (
          <BentoCategoryCard
            key={group.id}
            groupTitle={group.title}
            groupSubtitle={group.subtitle}
            products={group.products}
            orders={orders}
            madeItems={madeItems}
            setMadeItems={setMadeItems}
            boughtSupplies={boughtSupplies}
            setBoughtSupplies={setBoughtSupplies}
            notify={notify}
          />
        ))}
      </div>
    </div>
  );
}
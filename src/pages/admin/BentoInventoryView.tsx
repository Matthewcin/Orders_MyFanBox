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

const ORANGE_BADGE_STYLE: React.CSSProperties = {
  backgroundColor: '#ea580c',
  color: '#ffffff'
};

const ORANGE_SOFT_BOX_STYLE: React.CSSProperties = {
  backgroundColor: 'rgba(249, 115, 22, 0.12)',
  borderColor: 'rgba(249, 115, 22, 0.48)'
};

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
  allCatalog: Product[];
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
  allCatalog,
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

  const getProductSizes = (prod: Product) => {
    const acc = isProductAccessory(prod);
    return acc ? (prod.sizes?.length ? prod.sizes : ['Única']) : ALL_GARMENT_SIZES;
  };

  const getProductVariants = (prod: Product): ProductVariant[] => {
    return prod.variants?.length
      ? prod.variants
      : [{ id: 'v-std', name: 'Estándar', extraPrice: 0, extraCost: 0 }];
  };

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

  const getMissingForCombo = (prod: Product, variant: ProductVariant, size: string, gender: string) => {
    const ord = getOrderedQtyForCombo(prod, variant, size, gender);
    const md = getMadeCount(prod, variant, size, gender);
    return Math.max(0, ord - md);
  };

  const getMissingForVariant = (prod: Product, variant: ProductVariant) => {
    const acc = isProductAccessory(prod);
    const szs = getProductSizes(prod);
    const genders = acc ? ['Única'] : GARMENT_GENDERS;
    let total = 0;
    szs.forEach(sz => {
      genders.forEach(g => {
        total += getMissingForCombo(prod, variant, sz, g);
      });
    });
    return total;
  };

  const getMissingForProduct = (prod: Product) => {
    return getProductVariants(prod).reduce((sum, v) => sum + getMissingForVariant(prod, v), 0);
  };

  const groupTotalMissing = products.reduce((sum, p) => sum + getMissingForProduct(p), 0);

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
        const p = allCatalog.find(pr => pr.id === it.productId);
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
  }, [activeOrders, allCatalog, blankName, activeSize, activeGender]);

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
    <section
      className="bg-white border border-zinc-200 rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-4 shadow-2xs"
      style={
        groupTotalMissing > 0
          ? { boxShadow: 'inset 0 3px 0 #f97316' }
          : undefined
      }
    >
      <div className="space-y-4">
        {/* Cabecera de categoría con contador naranja */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-zinc-900 flex items-center gap-2">
              {isAcc ? <Sparkles className="w-4 h-4 shrink-0" /> : <Shirt className="w-4 h-4 shrink-0" />}
              <span>{groupTitle}</span>
            </h2>
            <p className="text-[11px] text-zinc-500 mt-0.5">{groupSubtitle}</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {groupTotalMissing > 0 ? (
              <span
                style={ORANGE_BADGE_STYLE}
                className="px-2.5 py-1 rounded-full text-[11px] font-bold font-mono shadow-2xs"
              >
                Faltan {groupTotalMissing}
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold">
                ✓ Al día
              </span>
            )}
          </div>
        </div>

        {/* 1. Selector de Modelo */}
        <div className="space-y-1.5">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            1. Modelo
          </div>
          <div className="flex flex-wrap gap-1.5">
            {products.map(p => {
              const selected = p.id === activeProduct.id;
              const pMissing = getMissingForProduct(p);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setSelectedProdId(p.id);
                    const nextVars = getProductVariants(p);
                    setSelectedVariantId(nextVars[0].id);
                  }}
                  style={!selected && pMissing > 0 ? ORANGE_SOFT_BOX_STYLE : undefined}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold inline-flex items-center gap-2 transition-all cursor-pointer ${
                    selected
                      ? 'bg-zinc-900 text-white border-zinc-900'
                      : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                  }`}
                >
                  <span>{p.name}</span>
                  {pMissing > 0 && (
                    <span
                      style={ORANGE_BADGE_STYLE}
                      className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold leading-none"
                    >
                      {pMissing}
                    </span>
                  )}
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
              const vMissing = getMissingForVariant(activeProduct, v);
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedVariantId(v.id)}
                  style={!selected && vMissing > 0 ? ORANGE_SOFT_BOX_STYLE : undefined}
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
                  {vMissing > 0 && (
                    <span
                      style={ORANGE_BADGE_STYLE}
                      className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold leading-none"
                    >
                      {vMissing}
                    </span>
                  )}
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
                const gMissing = availableSizes.reduce(
                  (acc, sz) => acc + getMissingForCombo(activeProduct, activeVariant, sz, g),
                  0
                );

                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setSelectedGender(g)}
                    style={!selected && gMissing > 0 ? ORANGE_SOFT_BOX_STYLE : undefined}
                    className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                      selected
                        ? 'bg-zinc-900 text-white border-zinc-900'
                        : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold truncate">{g}</span>
                      {gMissing > 0 && (
                        <span
                          style={ORANGE_BADGE_STYLE}
                          className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold leading-none shrink-0"
                        >
                          {gMissing}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] opacity-80 font-mono mt-1 flex items-center justify-between gap-1">
                      <span>Hechas: {gMade}</span>
                      {gMissing > 0 ? (
                        <span style={{ color: selected ? '#fed7aa' : '#ea580c' }} className="font-bold">
                          Faltan {gMissing}
                        </span>
                      ) : gOrdered > 0 ? (
                        <span className={selected ? 'opacity-90' : 'text-emerald-700 font-semibold'}>✓ OK</span>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. Selector de Talla (resaltado en naranja si falta hacer) */}
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
                  style={!selected && szMiss > 0 ? ORANGE_SOFT_BOX_STYLE : undefined}
                  className={`relative min-w-[64px] px-2.5 py-2 rounded-xl border text-center transition-all cursor-pointer ${
                    selected
                      ? 'bg-zinc-900 text-white border-zinc-900'
                      : szMade > 0 && szMiss === 0
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                  }`}
                >
                  {szMiss > 0 && (
                    <span
                      style={ORANGE_BADGE_STYLE}
                      className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-mono font-bold inline-flex items-center justify-center shadow-2xs"
                    >
                      {szMiss}
                    </span>
                  )}
                  <div className="text-xs font-bold leading-none">{sz}</div>
                  <div className="text-[10px] font-mono mt-1 leading-none">
                    {szMiss > 0 ? (
                      <span style={{ color: selected ? '#fed7aa' : '#ea580c' }} className="font-bold">
                        -{szMiss}
                      </span>
                    ) : (
                      <span className="opacity-75">
                        {szMade}/{szOrd}
                      </span>
                    )}
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
              <span
                style={ORANGE_BADGE_STYLE}
                className="px-2.5 py-0.5 rounded-full text-[11px] font-bold"
              >
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
                Base: {blankName}{' '}
                {missingToBuy > 0 && (
                  <strong style={{ color: '#ea580c' }}>· Faltan {missingToBuy}</strong>
                )}
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
            Cada categoría, modelo, color, corte y talla marca en <strong>naranja</strong> exactamente cuántas unidades faltan por hacer.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span
            style={shoppingNeeds.totalMissingToBuy > 0 ? ORANGE_SOFT_BOX_STYLE : undefined}
            className="px-3 py-1.5 rounded-xl border border-zinc-200 font-semibold text-zinc-900 inline-flex items-center gap-1.5"
          >
            <span>Por comprar:</span>
            <span
              style={shoppingNeeds.totalMissingToBuy > 0 ? ORANGE_BADGE_STYLE : undefined}
              className={`px-1.5 py-0.5 rounded-full text-[11px] font-mono font-bold ${
                shoppingNeeds.totalMissingToBuy === 0 ? 'bg-emerald-50 text-emerald-800' : ''
              }`}
            >
              {shoppingNeeds.totalMissingToBuy}
            </span>
          </span>
          <span
            style={productionMatrix.totalMissingToMake > 0 ? ORANGE_SOFT_BOX_STYLE : undefined}
            className="px-3 py-1.5 rounded-xl border border-zinc-200 font-semibold text-zinc-900 inline-flex items-center gap-1.5"
          >
            <span>Por estampar:</span>
            <span
              style={productionMatrix.totalMissingToMake > 0 ? ORANGE_BADGE_STYLE : undefined}
              className={`px-1.5 py-0.5 rounded-full text-[11px] font-mono font-bold ${
                productionMatrix.totalMissingToMake === 0 ? 'bg-emerald-50 text-emerald-800' : ''
              }`}
            >
              {productionMatrix.totalMissingToMake}
            </span>
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
            allCatalog={effectiveCatalog}
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
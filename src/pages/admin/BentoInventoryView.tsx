import React, { useState, useMemo, useEffect } from 'react';
import {
  LayoutGrid,
  Shirt,
  Sparkles,
  Tag,
  Plus,
  Minus,
  Check,
  Copy,
  Layers,
  ShoppingBag,
  CheckCircle2
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { Product, ProductVariant, Order } from '../../types';
import {
  ALL_GARMENT_SIZES,
  GARMENT_GENDERS,
  OFFICIAL_CATALOG_FALLBACK
} from '../../utils/constants';
import { isOrderActive } from '../../utils/helpers';

function resolveBentoCategory(prod: Product): string {
  const rawCat = String(prod.category || '').trim();
  const catLower = rawCat.toLowerCase();
  if (rawCat && catLower !== 'prenda' && catLower !== 'accesorio') {
    return rawCat;
  }
  const nameLower = String(prod.name || '').toLowerCase();
  if (nameLower.includes('hoodie') || nameLower.includes('buzo') || nameLower.includes('sudadera')) {
    return 'Hoodies y Buzos';
  }
  if (nameLower.includes('crop') || nameLower.includes('crot') || nameLower.includes('top')) {
    return 'Crop Tops';
  }
  if (
    nameLower.includes('llavero') ||
    nameLower.includes('fanbox') ||
    nameLower.includes('parche') ||
    nameLower.includes('cd') ||
    catLower.includes('accesorio')
  ) {
    return 'Accesorios y Llaveros';
  }
  if (
    nameLower.includes('raglan') ||
    nameLower.includes('camiseta') ||
    nameLower.includes('remera') ||
    nameLower.includes('shirt') ||
    nameLower.includes('oversize')
  ) {
    return 'Camisetas y Raglans';
  }
  return rawCat || 'Otras Prendas';
}

function inferSwatchHex(text: string): string {
  const lower = String(text || '').toLowerCase();
  if (lower.includes('negro') || lower.includes('black')) return '#18181b';
  if (lower.includes('blanco') || lower.includes('white')) return '#f8fafc';
  if (lower.includes('azul') || lower.includes('blue') || lower.includes('celeste')) return '#2563eb';
  if (lower.includes('rosa') || lower.includes('pink') || lower.includes('fucsia')) return '#ec4899';
  if (lower.includes('rojo') || lower.includes('red') || lower.includes('vino')) return '#dc2626';
  if (lower.includes('verde') || lower.includes('green')) return '#16a34a';
  if (lower.includes('amarillo') || lower.includes('yellow') || lower.includes('dorado')) return '#eab308';
  if (lower.includes('morado') || lower.includes('lila') || lower.includes('purple')) return '#9333ea';
  if (lower.includes('naranja') || lower.includes('orange')) return '#f97316';
  if (lower.includes('beige') || lower.includes('crema') || lower.includes('arena')) return '#d6c7b2';
  if (lower.includes('gris') || lower.includes('gray')) return '#71717a';
  if (lower.includes('brillo') || lower.includes('pedrer') || lower.includes('escarch')) return '#38bdf8';
  if (lower.includes('nfc') || lower.includes('qr')) return '#10b981';
  return '#52525b';
}

function isAccessoryProduct(prod: Product): boolean {
  const cat = String(prod.category || '').toLowerCase();
  const name = String(prod.name || '').toLowerCase();
  return (
    cat.includes('accesorio') ||
    name.includes('llavero') ||
    name.includes('fanbox') ||
    name.includes('parche')
  );
}

function getProductSizes(prod: Product): string[] {
  if (isAccessoryProduct(prod)) {
    return Array.isArray(prod.sizes) && prod.sizes.length > 0 ? prod.sizes : ['Única'];
  }
  const base = Array.isArray(prod.sizes) && prod.sizes.length > 0 ? prod.sizes : ALL_GARMENT_SIZES;
  return Array.from(new Set([...ALL_GARMENT_SIZES, ...base]));
}

interface BentoCategoryCardProps {
  categoryName: string;
  products: Product[];
  activeOrders: Order[];
  mode: 'make' | 'buy';
  madeItems: Record<string, number>;
  setMadeItems: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  boughtSupplies: Record<string, number>;
  setBoughtSupplies: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  spanClass: string;
  notify: (message: string, type?: string) => void;
}

function BentoCategoryCard({
  categoryName,
  products,
  activeOrders,
  mode,
  madeItems,
  setMadeItems,
  boughtSupplies,
  setBoughtSupplies,
  spanClass,
  notify
}: BentoCategoryCardProps) {
  const [selectedProdId, setSelectedProdId] = useState<string>(products[0]?.id || '');
  const [selectedVarId, setSelectedVarId] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [selectedGender, setSelectedGender] = useState<string>('ALL');

  const selectedProduct = useMemo(() => {
    return products.find(p => p.id === selectedProdId) || products[0];
  }, [products, selectedProdId]);

  const variants: Partial<ProductVariant>[] = useMemo(() => {
    if (!selectedProduct) return [];
    return selectedProduct.variants && selectedProduct.variants.length > 0
      ? selectedProduct.variants
      : [{ id: 'v-std', name: 'Estándar' }];
  }, [selectedProduct]);

  const sizes = useMemo(() => {
    if (!selectedProduct) return ['M'];
    return getProductSizes(selectedProduct);
  }, [selectedProduct]);

  useEffect(() => {
    if (!selectedProduct) return;
    if (!products.some(p => p.id === selectedProdId)) {
      setSelectedProdId(selectedProduct.id);
    }
  }, [products, selectedProdId, selectedProduct]);

  useEffect(() => {
    if (!selectedProduct) return;
    const validVar = variants.find(v => (v.id || v.name) === selectedVarId);
    if (!validVar) {
      const varWithDemand = variants.find(v => {
        const vid = v.id || v.name || 'v-std';
        return activeOrders.some(o =>
          o.items.some(
            it =>
              (it.productId === selectedProduct.id || it.productName === selectedProduct.name) &&
              (it.variantId === vid || it.variantName === v.name)
          )
        );
      });
      const chosen = varWithDemand || variants[0];
      setSelectedVarId(chosen?.id || chosen?.name || 'v-std');
    }

    if (!sizes.includes(selectedSize)) {
      const sizeWithDemand = sizes.find(sz =>
        activeOrders.some(o =>
          o.items.some(
            it =>
              (it.productId === selectedProduct.id || it.productName === selectedProduct.name) &&
              (isAccessoryProduct(selectedProduct) ? 'Única' : it.size || 'M') === sz
          )
        )
      );
      setSelectedSize(sizeWithDemand || sizes[0] || 'M');
    }
  }, [selectedProduct, variants, sizes, selectedVarId, selectedSize, activeOrders]);

  const selectedVariant: Partial<ProductVariant> = useMemo(() => {
    return (
      variants.find(v => (v.id || v.name) === selectedVarId) ||
      variants[0] || { id: 'v-std', name: 'Estándar' }
    );
  }, [variants, selectedVarId]);

  const getProductDemand = (prod: Product) => {
    let ordered = 0;
    let missing = 0;
    const prodVars: Partial<ProductVariant>[] =
      prod.variants && prod.variants.length > 0 ? prod.variants : [{ id: 'v-std', name: 'Estándar' }];
    const prodSizes = getProductSizes(prod);

    prodVars.forEach(v => {
      const vKey = v.id || v.name || 'v-std';
      prodSizes.forEach(sz => {
        let cellOrdered = 0;
        activeOrders.forEach(o => {
          o.items.forEach(it => {
            const matchProd = it.productId === prod.id || it.productName === prod.name;
            const matchVar = it.variantId === vKey || it.variantName === v.name;
            const itemSz = isAccessoryProduct(prod) ? 'Única' : it.size || 'M';
            if (matchProd && matchVar && itemSz === sz) {
              cellOrdered += Math.max(1, Number(it.qty) || 1);
            }
          });
        });
        ordered += cellOrdered;
        if (mode === 'make') {
          const mk = `${prod.id}|||${vKey}|||${sz}`;
          const done = Number(madeItems[mk]) || 0;
          missing += Math.max(0, cellOrdered - done);
        } else {
          const blankTitle = v.blankOverride || prod.blankName || `${prod.name} (En blanco)`;
          const bk = `${blankTitle}___${sz}`;
          const bought = Number(boughtSupplies[bk]) || 0;
          missing += Math.max(0, cellOrdered - bought);
        }
      });
    });

    return { ordered, missing };
  };

  const categoryTotals = useMemo(() => {
    return products.reduce(
      (acc, p) => {
        const d = getProductDemand(p);
        acc.ordered += d.ordered;
        acc.missing += d.missing;
        return acc;
      },
      { ordered: 0, missing: 0 }
    );
  }, [products, activeOrders, madeItems, boughtSupplies, mode]);

  const variantCounts = useMemo(() => {
    const map: Record<string, { ordered: number; missing: number }> = {};
    if (!selectedProduct) return map;
    const prodSizes = getProductSizes(selectedProduct);
    variants.forEach(v => {
      const vKey = v.id || v.name || 'v-std';
      let ordered = 0;
      let missing = 0;
      prodSizes.forEach(sz => {
        let cellOrdered = 0;
        activeOrders.forEach(o => {
          o.items.forEach(it => {
            const matchProd = it.productId === selectedProduct.id || it.productName === selectedProduct.name;
            const matchVar = it.variantId === vKey || it.variantName === v.name;
            const itemSz = isAccessoryProduct(selectedProduct) ? 'Única' : it.size || 'M';
            if (matchProd && matchVar && itemSz === sz) {
              cellOrdered += Math.max(1, Number(it.qty) || 1);
            }
          });
        });
        ordered += cellOrdered;
        if (mode === 'make') {
          const done = Number(madeItems[`${selectedProduct.id}|||${vKey}|||${sz}`]) || 0;
          missing += Math.max(0, cellOrdered - done);
        } else {
          const blankTitle = v.blankOverride || selectedProduct.blankName || `${selectedProduct.name} (En blanco)`;
          const bought = Number(boughtSupplies[`${blankTitle}___${sz}`]) || 0;
          missing += Math.max(0, cellOrdered - bought);
        }
      });
      map[vKey] = { ordered, missing };
    });
    return map;
  }, [selectedProduct, variants, activeOrders, madeItems, boughtSupplies, mode]);

  const sizeCounts = useMemo(() => {
    const map: Record<string, { ordered: number; missing: number }> = {};
    if (!selectedProduct) return map;
    const vKey = selectedVariant.id || selectedVariant.name || 'v-std';
    sizes.forEach(sz => {
      let cellOrdered = 0;
      activeOrders.forEach(o => {
        o.items.forEach(it => {
          const matchProd = it.productId === selectedProduct.id || it.productName === selectedProduct.name;
          const matchVar = it.variantId === vKey || it.variantName === selectedVariant.name;
          const itemSz = isAccessoryProduct(selectedProduct) ? 'Única' : it.size || 'M';
          if (matchProd && matchVar && itemSz === sz) {
            cellOrdered += Math.max(1, Number(it.qty) || 1);
          }
        });
      });
      let missing = 0;
      if (mode === 'make') {
        const done = Number(madeItems[`${selectedProduct.id}|||${vKey}|||${sz}`]) || 0;
        missing = Math.max(0, cellOrdered - done);
      } else {
        const blankTitle =
          selectedVariant.blankOverride || selectedProduct.blankName || `${selectedProduct.name} (En blanco)`;
        const bought = Number(boughtSupplies[`${blankTitle}___${sz}`]) || 0;
        missing = Math.max(0, cellOrdered - bought);
      }
      map[sz] = { ordered: cellOrdered, missing };
    });
    return map;
  }, [selectedProduct, selectedVariant, sizes, activeOrders, madeItems, boughtSupplies, mode]);

  const currentSelectionStats = useMemo(() => {
    if (!selectedProduct) {
      return {
        totalOrderedAllGenders: 0,
        genderFilteredOrdered: 0,
        genderBreakdown: { Femenino: 0, Masculino: 0, 'Sin especificar': 0 } as Record<string, number>,
        matchingOrders: [] as { orderId: string; customerName: string; qty: number; gender: string }[],
        madeKey: '',
        supplyKey: '',
        blankTitle: '',
        doneQty: 0,
        boughtQty: 0,
        missingQty: 0
      };
    }

    const vKey = selectedVariant.id || selectedVariant.name || 'v-std';
    const genderBreakdown: Record<string, number> = {
      Femenino: 0,
      Masculino: 0,
      'Sin especificar': 0
    };
    const matchingOrders: { orderId: string; customerName: string; qty: number; gender: string }[] = [];
    let totalOrderedAllGenders = 0;

    activeOrders.forEach(o => {
      o.items.forEach(it => {
        const matchProd = it.productId === selectedProduct.id || it.productName === selectedProduct.name;
        const matchVar = it.variantId === vKey || it.variantName === selectedVariant.name;
        const itemSz = isAccessoryProduct(selectedProduct) ? 'Única' : it.size || 'M';
        if (matchProd && matchVar && itemSz === selectedSize) {
          const q = Math.max(1, Number(it.qty) || 1);
          const g = GARMENT_GENDERS.includes(it.gender) ? it.gender : 'Sin especificar';
          totalOrderedAllGenders += q;
          genderBreakdown[g] = (genderBreakdown[g] || 0) + q;
          if (selectedGender === 'ALL' || g === selectedGender) {
            matchingOrders.push({
              orderId: o.id,
              customerName: o.customerName,
              qty: q,
              gender: g
            });
          }
        }
      });
    });

    const genderFilteredOrdered =
      selectedGender === 'ALL' ? totalOrderedAllGenders : genderBreakdown[selectedGender] || 0;

    const madeKey = `${selectedProduct.id}|||${vKey}|||${selectedSize}`;
    const blankTitle =
      selectedVariant.blankOverride || selectedProduct.blankName || `${selectedProduct.name} (En blanco)`;
    const supplyKey = `${blankTitle}___${selectedSize}`;

    const doneQty = Number(madeItems[madeKey]) || 0;
    const boughtQty = Number(boughtSupplies[supplyKey]) || 0;

    const missingQty =
      mode === 'make'
        ? Math.max(0, totalOrderedAllGenders - doneQty)
        : Math.max(0, totalOrderedAllGenders - boughtQty);

    return {
      totalOrderedAllGenders,
      genderFilteredOrdered,
      genderBreakdown,
      matchingOrders,
      madeKey,
      supplyKey,
      blankTitle,
      doneQty,
      boughtQty,
      missingQty
    };
  }, [
    selectedProduct,
    selectedVariant,
    selectedSize,
    selectedGender,
    activeOrders,
    madeItems,
    boughtSupplies,
    mode
  ]);

  if (!selectedProduct) return null;

  const activeCountValue = mode === 'make' ? currentSelectionStats.doneQty : currentSelectionStats.boughtQty;

  const handleAdjustValue = (delta: number) => {
    if (mode === 'make') {
      setMadeItems(prev => ({
        ...prev,
        [currentSelectionStats.madeKey]: Math.max(0, (Number(prev[currentSelectionStats.madeKey]) || 0) + delta)
      }));
    } else {
      setBoughtSupplies(prev => ({
        ...prev,
        [currentSelectionStats.supplyKey]: Math.max(0, (Number(prev[currentSelectionStats.supplyKey]) || 0) + delta)
      }));
    }
  };

  const handleCompleteCurrent = () => {
    const target = currentSelectionStats.totalOrderedAllGenders;
    if (target <= 0) return;
    if (mode === 'make') {
      setMadeItems(prev => ({ ...prev, [currentSelectionStats.madeKey]: target }));
      notify(`${selectedProduct.name} (${selectedSize}) marcada como lista`);
    } else {
      setBoughtSupplies(prev => ({ ...prev, [currentSelectionStats.supplyKey]: target }));
      notify(`${currentSelectionStats.blankTitle} (${selectedSize}) marcada como comprada`);
    }
  };

  const isAcc = isAccessoryProduct(selectedProduct);

  return (
    <div
      className={`${spanClass} bg-white border border-zinc-200 rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-4 shadow-2xs`}
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-2 pb-3 border-b border-zinc-100">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-9 h-9 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0">
              {isAcc ? <Sparkles className="w-4 h-4 text-zinc-700" /> : <Shirt className="w-4 h-4 text-zinc-700" />}
            </span>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-zinc-900 truncate">{categoryName}</h2>
              <p className="text-[11px] text-zinc-500">
                {products.length} {products.length === 1 ? 'referencia' : 'referencias'} · {categoryTotals.ordered} pedidas
              </p>
            </div>
          </div>

          {categoryTotals.missing > 0 ? (
            <span className="px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-semibold shrink-0 tabular-nums">
              {mode === 'make' ? `Faltan ${categoryTotals.missing}` : `Comprar ${categoryTotals.missing}`}
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold shrink-0 inline-flex items-center gap-1">
              <Check className="w-3 h-3" /> Al día
            </span>
          )}
        </div>

        {products.length > 1 && (
          <div className="space-y-1.5">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              Referencia / Modelo
            </div>
            <div className="flex flex-wrap gap-1.5">
              {products.map(prod => {
                const active = prod.id === selectedProduct.id;
                const d = getProductDemand(prod);
                return (
                  <button
                    key={prod.id}
                    type="button"
                    onClick={() => setSelectedProdId(prod.id)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all inline-flex items-center gap-1.5 cursor-pointer ${
                      active
                        ? 'bg-zinc-900 text-white border-zinc-900'
                        : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                    }`}
                  >
                    <span>{prod.name}</span>
                    {d.missing > 0 && (
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                          active ? 'bg-amber-400 text-zinc-950' : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {d.missing}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            Color / Variante en DB
          </div>
          <div className="flex flex-wrap gap-1.5">
            {variants.map(v => {
              const vKey = v.id || v.name || 'v-std';
              const active = (selectedVariant.id || selectedVariant.name) === vKey;
              const stats = variantCounts[vKey] || { ordered: 0, missing: 0 };
              const swatch = inferSwatchHex(
                `${v.name || ''} ${v.vinylColor || ''} ${v.blankOverride || ''} ${selectedProduct.blankName || ''}`
              );

              return (
                <button
                  key={vKey}
                  type="button"
                  onClick={() => setSelectedVarId(vKey)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all inline-flex items-center gap-2 cursor-pointer ${
                    active
                      ? 'bg-zinc-900 text-white border-zinc-900'
                      : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full border border-zinc-400 shrink-0"
                    style={{ backgroundColor: swatch }}
                  />
                  <span>{v.name || 'Estándar'}</span>
                  {v.vinylColor && (
                    <span className={`text-[10px] ${active ? 'text-zinc-300' : 'text-zinc-400'}`}>
                      · {v.vinylColor}
                    </span>
                  )}
                  {stats.missing > 0 && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                        active ? 'bg-amber-400 text-zinc-950' : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {stats.missing}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              Talla
            </div>
            <div className="flex flex-wrap gap-1.5">
              {sizes.map(sz => {
                const active = selectedSize === sz;
                const sc = sizeCounts[sz] || { ordered: 0, missing: 0 };
                return (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setSelectedSize(sz)}
                    className={`min-w-[44px] h-9 px-2.5 rounded-xl border text-xs font-bold transition-all inline-flex items-center justify-center gap-1 cursor-pointer ${
                      active
                        ? 'bg-zinc-900 text-white border-zinc-900'
                        : sc.missing > 0
                        ? 'bg-amber-50 text-amber-950 border-amber-300 hover:bg-amber-100'
                        : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                    }`}
                  >
                    <span>{sz}</span>
                    {sc.missing > 0 && (
                      <span
                        className={`text-[10px] font-mono px-1 rounded ${
                          active ? 'bg-amber-400 text-zinc-950' : 'bg-amber-200/80 text-zinc-950'
                        }`}
                      >
                        {sc.missing}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              Corte / Género
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'ALL', label: 'Todos', count: currentSelectionStats.totalOrderedAllGenders },
                { id: 'Femenino', label: 'Femenino', count: currentSelectionStats.genderBreakdown.Femenino || 0 },
                { id: 'Masculino', label: 'Masculino', count: currentSelectionStats.genderBreakdown.Masculino || 0 },
                {
                  id: 'Sin especificar',
                  label: 'Sin esp.',
                  count: currentSelectionStats.genderBreakdown['Sin especificar'] || 0
                }
              ].map(g => {
                const active = selectedGender === g.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setSelectedGender(g.id)}
                    className={`h-9 px-2.5 rounded-xl border text-xs font-medium transition-all inline-flex items-center gap-1.5 cursor-pointer ${
                      active
                        ? 'bg-zinc-900 text-white border-zinc-900'
                        : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                    }`}
                  >
                    <span>{g.label}</span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                        active ? 'bg-zinc-700 text-zinc-100' : 'bg-white border border-zinc-200 text-zinc-600'
                      }`}
                    >
                      {g.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-zinc-50 border border-zinc-200 p-3.5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="text-xs font-bold text-zinc-900 truncate">
              {mode === 'make' ? selectedProduct.name : currentSelectionStats.blankTitle}
            </div>
            <div className="text-[11px] text-zinc-500">
              {selectedVariant.name || 'Estándar'} · Talla <strong>{selectedSize}</strong>
              {selectedGender !== 'ALL' ? ` · Solo ${selectedGender}` : ''}
            </div>
          </div>

          <div className="flex items-center gap-2 tabular-nums">
            <div className="px-2.5 py-1 rounded-lg bg-white border border-zinc-200 text-center">
              <div className="text-[10px] text-zinc-400 leading-none">Pedidas</div>
              <div className="text-sm font-bold text-zinc-900 mt-0.5">
                {currentSelectionStats.genderFilteredOrdered}
              </div>
            </div>
            <div
              className={`px-2.5 py-1 rounded-lg border text-center ${
                currentSelectionStats.missingQty > 0
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}
            >
              <div className="text-[10px] leading-none">
                {mode === 'make' ? 'Faltan' : 'Comprar'}
              </div>
              <div className="text-sm font-bold mt-0.5">{currentSelectionStats.missingQty}</div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-200">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleAdjustValue(-1)}
              className="w-10 h-10 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-100 flex items-center justify-center text-zinc-800 cursor-pointer"
              title="Restar 1"
            >
              <Minus className="w-4 h-4" />
            </button>
            <div className="min-w-[82px] text-center">
              <div className="text-[10px] text-zinc-500 uppercase font-semibold">
                {mode === 'make' ? 'Ya hechas' : 'En stock'}
              </div>
              <div className="text-lg font-bold text-zinc-900 tabular-nums leading-tight">
                {activeCountValue}
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleAdjustValue(1)}
              className="h-10 px-3.5 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{mode === 'make' ? '1 Hecha' : '1 Comprada'}</span>
            </button>
          </div>

          {currentSelectionStats.missingQty > 0 && (
            <button
              type="button"
              onClick={handleCompleteCurrent}
              className="h-10 px-3 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Marcar todo listo</span>
            </button>
          )}
        </div>

        {currentSelectionStats.matchingOrders.length > 0 && (
          <div className="pt-2 border-t border-zinc-200 space-y-1.5">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              Pedidos con esta selección ({currentSelectionStats.matchingOrders.length})
            </div>
            <div className="flex flex-wrap gap-1.5">
              {currentSelectionStats.matchingOrders.slice(0, 6).map((m, idx) => (
                <span
                  key={`${m.orderId}-${idx}`}
                  className="px-2 py-1 rounded-lg bg-white border border-zinc-200 text-[11px] text-zinc-700"
                >
                  <strong className="font-mono text-zinc-900">{m.qty}×</strong> {m.customerName}{' '}
                  <span className="text-zinc-400">({m.gender})</span>
                </span>
              ))}
              {currentSelectionStats.matchingOrders.length > 6 && (
                <span className="px-2 py-1 rounded-lg bg-zinc-100 text-[11px] text-zinc-500">
                  +{currentSelectionStats.matchingOrders.length - 6} más
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
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
    shoppingNeeds,
    productionMatrix,
    notify
  } = useAdmin();

  const [mode, setMode] = useState<'make' | 'buy'>('make');
  const [onlyPendingCategories, setOnlyPendingCategories] = useState(false);

  const effectiveCatalog = catalog.length > 0 ? catalog : OFFICIAL_CATALOG_FALLBACK;
  const activeOrders = useMemo(() => orders.filter(isOrderActive), [orders]);

  const categories = useMemo(() => {
    const groups: Record<string, Product[]> = {};
    effectiveCatalog.forEach(prod => {
      const catName = resolveBentoCategory(prod);
      if (!groups[catName]) groups[catName] = [];
      groups[catName].push(prod);
    });
    return Object.entries(groups).map(([name, products]) => ({ name, products }));
  }, [effectiveCatalog]);

  const visibleCategories = useMemo(() => {
    if (!onlyPendingCategories) return categories;
    return categories.filter(cat =>
      cat.products.some(prod =>
        activeOrders.some(o =>
          o.items.some(it => it.productId === prod.id || it.productName === prod.name)
        )
      )
    );
  }, [categories, onlyPendingCategories, activeOrders]);

  const totalOrderedUnits = useMemo(() => {
    return activeOrders.reduce(
      (sum, o) => sum + o.items.reduce((iSum, it) => iSum + (Number(it.qty) || 1), 0),
      0
    );
  }, [activeOrders]);

  const pendingNow =
    mode === 'make' ? productionMatrix.totalMissingToMake : shoppingNeeds.totalMissingToBuy;
  const completedNow = Math.max(0, totalOrderedUnits - pendingNow);
  const progressPct =
    totalOrderedUnits > 0 ? Math.min(100, Math.round((completedNow / totalOrderedUnits) * 100)) : 100;

  const handleCopyQuickSummary = () => {
    if (mode === 'make') {
      const rows = productionMatrix.rows.filter((r: any) => r.missing > 0);
      if (!rows.length) {
        notify('¡No hay prendas pendientes por hacer!');
        return;
      }
      const txt =
        `*PENDIENTES DE TALLER — MYFANBOX*\n` +
        rows
          .map((r: any) => `• ${r.productName} (${r.variantName}) · Talla ${r.size} -> Hacer ${r.missing}`)
          .join('\n');
      navigator.clipboard?.writeText(txt);
      notify('Lista de pendientes de taller copiada');
    } else {
      const rows = shoppingNeeds.rows.filter((r: any) => r.missing > 0);
      if (!rows.length) {
        notify('¡No falta nada por comprar!');
        return;
      }
      const txt =
        `*PENDIENTES DE COMPRA — MYFANBOX*\n` +
        rows
          .map((r: any) => `• ${r.blankName} · Talla ${r.sizeOrSpec} -> Comprar ${r.missing}`)
          .join('\n');
      navigator.clipboard?.writeText(txt);
      notify('Lista de compras copiada');
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-5 bg-white border border-zinc-200 rounded-2xl p-5 flex flex-col justify-between gap-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Taller Visual · BentoBox</span>
              </div>
              <h1 className="text-lg font-bold text-zinc-900 mt-0.5">
                {mode === 'make' ? '¿Qué falta por hacer?' : '¿Qué falta por comprar?'}
              </h1>
            </div>
            <span className="px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-xs font-bold text-zinc-900 tabular-nums">
              {progressPct}%
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="w-full h-2.5 rounded-full bg-zinc-100 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  pendingNow === 0 ? 'bg-emerald-600' : 'bg-zinc-900'
                }`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-zinc-500 tabular-nums">
              <span>
                {pendingNow === 0
                  ? '¡Todo al día!'
                  : mode === 'make'
                  ? `Te faltan ${pendingNow} unidades por estampar/armar`
                  : `Te faltan ${pendingNow} bases/insumos por comprar`}
              </span>
              <span className="font-mono">{totalOrderedUnits} pedidas</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white border border-zinc-200 rounded-2xl p-5 flex flex-col justify-between gap-3">
          <div className="text-xs font-semibold text-zinc-500">¿Qué estás gestionando ahora?</div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setMode('make')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                mode === 'make'
                  ? 'bg-zinc-900 text-white border-zinc-900'
                  : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
              }`}
            >
              <Layers className="w-4 h-4 mb-1.5" />
              <div className="text-xs font-bold">Estampar / Hacer</div>
              <div className={`text-[11px] mt-0.5 ${mode === 'make' ? 'text-zinc-950' : 'text-zinc-500'}`}>
                {productionMatrix.totalMissingToMake} pendientes
              </div>
            </button>

            <button
              type="button"
              onClick={() => setMode('buy')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                mode === 'buy'
                  ? 'bg-zinc-900 text-white border-zinc-900'
                  : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
              }`}
            >
              <ShoppingBag className="w-4 h-4 mb-1.5" />
              <div className="text-xs font-bold">Comprar Stock</div>
              <div className={`text-[11px] mt-0.5 ${mode === 'buy' ? 'text-zinc-950' : 'text-zinc-500'}`}>
                {shoppingNeeds.totalMissingToBuy} por comprar
              </div>
            </button>
          </div>
        </div>

        <div className="lg:col-span-3 bg-white border border-zinc-200 rounded-2xl p-5 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500">Acciones rápidas</span>
            <Tag className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setOnlyPendingCategories(prev => !prev)}
              className={`w-full h-9 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                onlyPendingCategories
                  ? 'bg-zinc-900 text-white border-zinc-900'
                  : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
              }`}
            >
              {onlyPendingCategories ? 'Mostrando solo con pedidos' : 'Filtrar solo con pedidos'}
            </button>
            <button
              type="button"
              onClick={handleCopyQuickSummary}
              className="w-full h-9 px-3 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 text-xs font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copiar lista pendiente</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {visibleCategories.map((cat, idx) => {
          const isWide = visibleCategories.length % 2 === 1 && idx === visibleCategories.length - 1;
          const spanClass = isWide ? 'xl:col-span-12' : 'xl:col-span-6';
          return (
            <BentoCategoryCard
              key={cat.name}
              categoryName={cat.name}
              products={cat.products}
              activeOrders={activeOrders}
              mode={mode}
              madeItems={madeItems}
              setMadeItems={setMadeItems}
              boughtSupplies={boughtSupplies}
              setBoughtSupplies={setBoughtSupplies}
              spanClass={spanClass}
              notify={notify}
            />
          );
        })}

        {visibleCategories.length === 0 && (
          <div className="xl:col-span-12 bg-white border border-dashed border-zinc-300 rounded-2xl p-10 text-center text-xs text-zinc-500">
            No hay categorías con pedidos activos en este momento.
          </div>
        )}
      </div>
    </div>
  );
}
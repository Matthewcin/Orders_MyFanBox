import React, { useState, useMemo } from 'react';
import {
  PackagePlus,
  Layers,
  ShieldCheck,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Shirt,
  RefreshCw,
  Tag
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { Product, ProductVariant } from '../../types';
import { ALL_GARMENT_SIZES } from '../../utils/constants';
import { formatCOP } from '../../utils/helpers';

type AdderMode = 'variant' | 'product';

interface DraftVariant {
  id: string;
  name: string;
  extraPrice: number;
  extraCost: number;
  vinylColor: string;
  blankOverride: string;
  needsNFC: boolean;
}

function slugifyId(text: string): string {
  return String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 24);
}

export default function ProductAdderView() {
  const {
    catalog,
    setCatalog,
    handlePushAllToNeon,
    handlePullFromNeon,
    isSavingData,
    notify
  } = useAdmin();

  const [mode, setMode] = useState<AdderMode>('variant');
  const [confirmReady, setConfirmReady] = useState(false);

  // Estado Modo 1: Agregar variante a uno o varios productos existentes
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [varName, setVarName] = useState('');
  const [varExtraPrice, setVarExtraPrice] = useState(0);
  const [varExtraCost, setVarExtraCost] = useState(0);
  const [varVinylColor, setVarVinylColor] = useState('');
  const [varBlankOverride, setVarBlankOverride] = useState('');
  const [varAutoNfcSuffix, setVarAutoNfcSuffix] = useState(true);

  // Estado Modo 2: Crear producto nuevo
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState('Prenda');
  const [prodIsAccessory, setProdIsAccessory] = useState(false);
  const [prodPrice, setProdPrice] = useState(90000);
  const [prodUnitCost, setProdUnitCost] = useState(35000);
  const [prodBlankName, setProdBlankName] = useState('');
  const [prodSizes, setProdSizes] = useState<string[]>([...ALL_GARMENT_SIZES]);
  const [prodVariants, setProdVariants] = useState<DraftVariant[]>([
    {
      id: 'v-std',
      name: 'Estándar',
      extraPrice: 0,
      extraCost: 0,
      vinylColor: '',
      blankOverride: '',
      needsNFC: false
    }
  ]);

  const existingCategories = useMemo(() => {
    const base = ['Prenda', 'Accesorio', 'Hoodies y Buzos', 'Camisetas y Raglans', 'Crop Tops', 'Accesorios y Llaveros'];
    const fromCatalog = catalog.map(p => p.category).filter(Boolean);
    return Array.from(new Set([...base, ...fromCatalog]));
  }, [catalog]);

  const toggleProductTarget = (id: string) => {
    setConfirmReady(false);
    setSelectedProductIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const selectedProducts = useMemo(() => {
    return catalog.filter(p => selectedProductIds.includes(p.id));
  }, [catalog, selectedProductIds]);

  const variantValidation = useMemo(() => {
    const cleanName = varName.trim();
    if (!cleanName) return { ok: false, reason: 'Escribe el nombre de la nueva variante (ej: NMADST).' };
    if (selectedProducts.length === 0) {
      return { ok: false, reason: 'Selecciona al menos un producto destino del catálogo.' };
    }

    const duplicates: string[] = [];
    selectedProducts.forEach(prod => {
      const hasNfcInName = prod.name.toLowerCase().includes('con nfc');
      const hasNoNfcInName = prod.name.toLowerCase().includes('sin nfc');
      const finalName =
        varAutoNfcSuffix && hasNfcInName && !cleanName.toLowerCase().includes('nfc')
          ? `${cleanName} (Con NFC)`
          : varAutoNfcSuffix && hasNoNfcInName && !cleanName.toLowerCase().includes('nfc')
          ? `${cleanName} (Sin NFC / QR)`
          : cleanName;

      const exists = (prod.variants || []).some(
        v => String(v.name || '').trim().toLowerCase() === finalName.toLowerCase()
      );
      if (exists) duplicates.push(`${prod.name} → "${finalName}"`);
    });

    if (duplicates.length > 0) {
      return {
        ok: false,
        reason: `Ya existe una variante igual en: ${duplicates.join(', ')}.`
      };
    }

    return { ok: true, reason: '' };
  }, [varName, selectedProducts, varAutoNfcSuffix]);

  const productValidation = useMemo(() => {
    const cleanName = prodName.trim();
    if (!cleanName) return { ok: false, reason: 'Escribe el nombre del producto nuevo.' };
    const dupProd = catalog.some(
      p => String(p.name || '').trim().toLowerCase() === cleanName.toLowerCase()
    );
    if (dupProd) return { ok: false, reason: `Ya existe un producto llamado "${cleanName}".` };
    if (prodPrice < 0 || prodUnitCost < 0) {
      return { ok: false, reason: 'El precio y el costo no pueden ser negativos.' };
    }
    if (prodVariants.length === 0 || prodVariants.some(v => !v.name.trim())) {
      return { ok: false, reason: 'Todas las variantes deben tener nombre.' };
    }
    if (!prodIsAccessory && prodSizes.length === 0) {
      return { ok: false, reason: 'Selecciona al menos una talla.' };
    }
    return { ok: true, reason: '' };
  }, [prodName, catalog, prodPrice, prodUnitCost, prodVariants, prodIsAccessory, prodSizes]);

  const handleAddVariantSafe = () => {
    if (!variantValidation.ok) {
      notify(variantValidation.reason, 'warning');
      return;
    }

    const cleanName = varName.trim();
    const slug = slugifyId(cleanName) || String(Date.now());

    setCatalog(prev =>
      prev.map(prod => {
        if (!selectedProductIds.includes(prod.id)) return prod;

        const lowerProd = prod.name.toLowerCase();
        const isConNfc = lowerProd.includes('con nfc');
        const isSinNfc = lowerProd.includes('sin nfc');

        const finalName =
          varAutoNfcSuffix && isConNfc && !cleanName.toLowerCase().includes('nfc')
            ? `${cleanName} (Con NFC)`
            : varAutoNfcSuffix && isSinNfc && !cleanName.toLowerCase().includes('nfc')
            ? `${cleanName} (Sin NFC / QR)`
            : cleanName;

        const prefixMatch = prod.id.match(/\d+/);
        const idPrefix = prefixMatch ? `v${prefixMatch[0]}` : `v-${slugifyId(prod.id)}`;
        let candidateId = `${idPrefix}-${slug}`;
        const existingIds = new Set((prod.variants || []).map(v => v.id));
        if (existingIds.has(candidateId)) {
          candidateId = `${candidateId}-${Date.now().toString().slice(-4)}`;
        }

        const newVariant: ProductVariant = {
          id: candidateId,
          name: finalName,
          extraPrice: Math.max(0, Number(varExtraPrice) || 0),
          extraCost: Math.max(0, Number(varExtraCost) || 0),
          ...(varVinylColor.trim() ? { vinylColor: varVinylColor.trim() } : {}),
          ...(varBlankOverride.trim() ? { blankOverride: varBlankOverride.trim() } : {}),
          ...(isConNfc || isSinNfc ? { needsNFC: isConNfc } : {})
        } as ProductVariant;

        return {
          ...prod,
          variants: [...(prod.variants || []), newVariant]
        };
      })
    );

    notify(
      `Variante "${cleanName}" agregada a ${selectedProducts.length} ${
        selectedProducts.length === 1 ? 'producto' : 'productos'
      }. Guardando en NeonDB…`
    );
    setVarName('');
    setVarExtraPrice(0);
    setVarExtraCost(0);
    setVarVinylColor('');
    setVarBlankOverride('');
    setSelectedProductIds([]);
    setConfirmReady(false);
  };

  const handleAddProductSafe = () => {
    if (!productValidation.ok) {
      notify(productValidation.reason, 'warning');
      return;
    }

    const maxCatNum = catalog.reduce((max, p) => {
      const m = String(p.id || '').match(/^cat-(\d+)$/i);
      const n = m ? parseInt(m[1], 10) : 0;
      return n > max ? n : max;
    }, 0);

    const newCatId = `cat-${maxCatNum + 1}`;
    const sample = (catalog[0] || {}) as Record<string, any>;
    const cleanName = prodName.trim();
    const resolvedCategory = prodIsAccessory ? 'Accesorio' : prodCategory;
    const resolvedSizes = prodIsAccessory ? ['Única'] : prodSizes;

    const formattedVariants = prodVariants.map((v, idx) => {
      const slug = slugifyId(v.name) || `opt-${idx + 1}`;
      return {
        id: `v${maxCatNum + 1}-${slug}`,
        name: v.name.trim(),
        extraPrice: Math.max(0, Number(v.extraPrice) || 0),
        extraCost: Math.max(0, Number(v.extraCost) || 0),
        ...(v.vinylColor.trim() ? { vinylColor: v.vinylColor.trim() } : {}),
        ...(v.blankOverride.trim() ? { blankOverride: v.blankOverride.trim() } : {}),
        ...(prodIsAccessory ? { needsNFC: Boolean(v.needsNFC) } : {})
      } as ProductVariant;
    });

    const newProductObj: Record<string, any> = {
      id: newCatId,
      name: cleanName,
      category: resolvedCategory,
      price: Math.max(0, Number(prodPrice) || 0),
      basePrice: Math.max(0, Number(prodPrice) || 0),
      unitCost: Math.max(0, Number(prodUnitCost) || 0),
      blankName: prodBlankName.trim() || `${cleanName} (Base)`,
      sizes: resolvedSizes,
      variants: formattedVariants
    };

    // Conserva consistencia con el esquema del catálogo actual
    if (!('basePrice' in sample) && 'price' in sample) {
      delete newProductObj.basePrice;
    }

    setCatalog(prev => [...prev, newProductObj as Product]);

    notify(`Producto "${cleanName}" (${newCatId}) creado y sincronizando con NeonDB…`);
    setProdName('');
    setProdBlankName('');
    setProdVariants([
      {
        id: 'v-std',
        name: 'Estándar',
        extraPrice: 0,
        extraCost: 0,
        vinylColor: '',
        blankOverride: '',
        needsNFC: false
      }
    ]);
    setConfirmReady(false);
  };

  const toggleSize = (sz: string) => {
    setProdSizes(prev =>
      prev.includes(sz) ? prev.filter(s => s !== sz) : [...prev, sz]
    );
  };

  return (
    <div className="space-y-4 max-w-5xl">
      <section className="bg-white border border-zinc-200 rounded-2xl p-5 flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Zona Segura · Solo Adición (No borra ni pisa registros)</span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-zinc-900 flex items-center gap-2 pt-1">
            <PackagePlus className="w-5 h-5" />
            <span>Agregador de Productos y Variantes</span>
          </h1>
          <p className="text-xs text-zinc-500 max-w-2xl">
            Usa esta pantalla separada para sumar nuevas variantes (como Mini CDs o colores) o crear productos nuevos sin tocar SQL ni arriesgar el catálogo actual. Los cambios se sincronizan directo con NeonDB y aparecen de inmediato en Pedidos y Bento.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handlePullFromNeon}
            className="h-9 px-3 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-xs font-medium text-zinc-700 inline-flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Traer de NeonDB</span>
          </button>
          <button
            type="button"
            onClick={handlePushAllToNeon}
            disabled={isSavingData}
            className="h-9 px-3.5 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-50 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{isSavingData ? 'Guardando…' : 'Forzar guardado'}</span>
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => {
            setMode('variant');
            setConfirmReady(false);
          }}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            mode === 'variant'
              ? 'bg-zinc-900 text-white border-zinc-900'
              : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <Layers className="w-5 h-5" />
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-800/20">
              Más usado
            </span>
          </div>
          <div className="text-sm font-bold mt-2">Agregar Variante a Producto Existente</div>
          <div className="text-xs opacity-80 mt-0.5">
            Ideal para sumar un nuevo Mini CD (ej: NMADST) a Con NFC y Sin NFC al mismo tiempo.
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setMode('product');
            setConfirmReady(false);
          }}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            mode === 'product'
              ? 'bg-zinc-900 text-white border-zinc-900'
              : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <PackagePlus className="w-5 h-5" />
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-800/20">
              {catalog.length} actuales
            </span>
          </div>
          <div className="text-sm font-bold mt-2">Crear Producto Nuevo en Catálogo</div>
          <div className="text-xs opacity-80 mt-0.5">
            Agrega una prenda o accesorio completo con su precio, costo, tallas y variantes.
          </div>
        </button>
      </div>

      {mode === 'variant' && (
        <section className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-bold text-zinc-900">
                1. ¿A qué producto(s) quieres agregar la variante?
              </h2>
              <span className="text-[11px] font-mono text-zinc-500">
                {selectedProductIds.length} seleccionados
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {catalog.map(prod => {
                const selected = selectedProductIds.includes(prod.id);
                const isAcc = String(prod.category || '').toLowerCase().includes('accesorio');
                return (
                  <button
                    key={prod.id}
                    type="button"
                    onClick={() => toggleProductTarget(prod.id)}
                    className={`p-3 rounded-xl border text-left transition-all flex items-start justify-between gap-2 cursor-pointer ${
                      selected
                        ? 'bg-sky-50 border-sky-200 ring-1 ring-zinc-900'
                        : 'bg-zinc-50 border-zinc-200 hover:bg-zinc-100'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                        {isAcc ? <Sparkles className="w-3.5 h-3.5 shrink-0" /> : <Shirt className="w-3.5 h-3.5 shrink-0" />}
                        <span className="truncate">{prod.name}</span>
                      </div>
                      <div className="text-[11px] text-zinc-500 mt-0.5 truncate">
                        {prod.id} · {(prod.variants || []).length} variantes actuales
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${
                        selected ? 'bg-zinc-900 text-white' : 'bg-white border border-zinc-200 text-zinc-500'
                      }`}
                    >
                      {selected ? 'Elegido' : 'Elegir'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-zinc-200">
            <h2 className="text-sm font-bold text-zinc-900">2. Datos de la nueva variante</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="text-xs text-zinc-600 space-y-1 sm:col-span-2">
                <span className="font-semibold text-zinc-800">Nombre de la variante *</span>
                <input
                  type="text"
                  value={varName}
                  onChange={e => {
                    setVarName(e.target.value);
                    setConfirmReady(false);
                  }}
                  placeholder="Ej: NMADST, Azul Rey, Pedrería Plateada..."
                  className="w-full h-10 px-3 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 focus:bg-white focus:border-zinc-900 focus:outline-none"
                />
              </label>

              <label className="text-xs text-zinc-600 space-y-1">
                <span>Precio extra al cliente (COP)</span>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={varExtraPrice}
                  onChange={e => setVarExtraPrice(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full h-9 px-3 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 font-mono"
                />
              </label>

              <label className="text-xs text-zinc-600 space-y-1">
                <span>Costo extra de taller (COP)</span>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={varExtraCost}
                  onChange={e => setVarExtraCost(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full h-9 px-3 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 font-mono"
                />
              </label>

              <label className="text-xs text-zinc-600 space-y-1">
                <span>Color / Vinilo (opcional, ayuda en Bento)</span>
                <input
                  type="text"
                  value={varVinylColor}
                  onChange={e => setVarVinylColor(e.target.value)}
                  placeholder="Ej: Negro, Rosa, Blanco, Escarchado..."
                  className="w-full h-9 px-3 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900"
                />
              </label>

              <label className="text-xs text-zinc-600 space-y-1">
                <span>Prenda/base específica (opcional)</span>
                <input
                  type="text"
                  value={varBlankOverride}
                  onChange={e => setVarBlankOverride(e.target.value)}
                  placeholder="Dejar vacío para usar la base del producto"
                  className="w-full h-9 px-3 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900"
                />
              </label>
            </div>

            <label className="inline-flex items-center gap-2 text-xs text-zinc-600 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={varAutoNfcSuffix}
                onChange={e => setVarAutoNfcSuffix(e.target.checked)}
                className="rounded border-zinc-300"
              />
              <span>
                Agregar automáticamente <strong>(Con NFC)</strong> o <strong>(Sin NFC / QR)</strong> al nombre si el producto es un Mini CD
              </span>
            </label>
          </div>

          <div className="rounded-xl bg-zinc-50 border border-zinc-200 p-4 space-y-3">
            {!variantValidation.ok ? (
              <div className="flex items-center gap-2 text-xs text-amber-800">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{variantValidation.reason}</span>
              </div>
            ) : (
              <div className="space-y-2 text-xs">
                <div className="font-semibold text-zinc-900 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  <span>Vista previa de lo que se agregará:</span>
                </div>
                <div className="space-y-1">
                  {selectedProducts.map(prod => {
                    const clean = varName.trim();
                    const lower = prod.name.toLowerCase();
                    const previewName =
                      varAutoNfcSuffix && lower.includes('con nfc') && !clean.toLowerCase().includes('nfc')
                        ? `${clean} (Con NFC)`
                        : varAutoNfcSuffix && lower.includes('sin nfc') && !clean.toLowerCase().includes('nfc')
                        ? `${clean} (Sin NFC / QR)`
                        : clean;
                    return (
                      <div key={prod.id} className="text-zinc-600">
                        • <strong>{prod.name}</strong> → nueva variante:{' '}
                        <span className="font-semibold text-emerald-700">{previewName}</span>
                        {varExtraPrice > 0 ? ` (+${formatCOP(varExtraPrice)})` : ''}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
              {!confirmReady ? (
                <button
                  type="button"
                  disabled={!variantValidation.ok}
                  onClick={() => setConfirmReady(true)}
                  className="h-10 px-5 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-40 text-xs font-semibold cursor-pointer"
                >
                  Revisar y Confirmar
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setConfirmReady(false)}
                    className="h-10 px-4 rounded-xl border border-zinc-200 bg-white text-xs font-semibold text-zinc-700 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleAddVariantSafe}
                    className="h-10 px-5 rounded-xl bg-emerald-600 text-white hover:opacity-95 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Sí, agregar variante y guardar en NeonDB</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {mode === 'product' && (
        <section className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="text-xs text-zinc-600 space-y-1 sm:col-span-2">
              <span className="font-semibold text-zinc-800">Nombre del producto *</span>
              <input
                type="text"
                value={prodName}
                onChange={e => {
                  setProdName(e.target.value);
                  setConfirmReady(false);
                }}
                placeholder="Ej: Camiseta Oversize Tropicoqueta, Llavero Mini CD Edición Especial..."
                className="w-full h-10 px-3 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 focus:bg-white focus:border-zinc-900 focus:outline-none"
              />
            </label>

            <label className="text-xs text-zinc-600 space-y-1">
              <span>Categoría</span>
              <select
                value={prodCategory}
                disabled={prodIsAccessory}
                onChange={e => setProdCategory(e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 disabled:opacity-50"
              >
                {existingCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </label>

            <div className="flex items-end pb-1">
              <label className="inline-flex items-center gap-2 text-xs font-medium text-zinc-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={prodIsAccessory}
                  onChange={e => setProdIsAccessory(e.target.checked)}
                  className="rounded border-zinc-300"
                />
                <span>Es un accesorio / talla única (llavero, CD, parche)</span>
              </label>
            </div>

            <label className="text-xs text-zinc-600 space-y-1">
              <span>Precio de venta (COP)</span>
              <input
                type="number"
                min="0"
                step="1000"
                value={prodPrice}
                onChange={e => setProdPrice(Math.max(0, Number(e.target.value) || 0))}
                className="w-full h-9 px-3 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 font-mono"
              />
            </label>

            <label className="text-xs text-zinc-600 space-y-1">
              <span>Costo unitario de taller (COP)</span>
              <input
                type="number"
                min="0"
                step="1000"
                value={prodUnitCost}
                onChange={e => setProdUnitCost(Math.max(0, Number(e.target.value) || 0))}
                className="w-full h-9 px-3 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 font-mono"
              />
            </label>

            <label className="text-xs text-zinc-600 space-y-1 sm:col-span-2">
              <span>Nombre de la prenda/insumo base (para lista de compras)</span>
              <input
                type="text"
                value={prodBlankName}
                onChange={e => setProdBlankName(e.target.value)}
                placeholder="Ej: Camiseta Oversize Negra 240g / Caja acrílica Mini CD"
                className="w-full h-9 px-3 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900"
              />
            </label>
          </div>

          {!prodIsAccessory && (
            <div className="space-y-1.5 pt-2 border-t border-zinc-200">
              <div className="text-xs font-semibold text-zinc-800">Tallas habilitadas</div>
              <div className="flex flex-wrap gap-1.5">
                {ALL_GARMENT_SIZES.map(sz => {
                  const active = prodSizes.includes(sz);
                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => toggleSize(sz)}
                      className={`min-w-[44px] h-9 px-2.5 rounded-xl border text-xs font-bold cursor-pointer ${
                        active
                          ? 'bg-zinc-900 text-white border-zinc-900'
                          : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="space-y-2.5 pt-2 border-t border-zinc-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-800">
                Variantes / Colores iniciales ({prodVariants.length})
              </span>
              <button
                type="button"
                onClick={() =>
                  setProdVariants(prev => [
                    ...prev,
                    {
                      id: `v-${Date.now()}`,
                      name: '',
                      extraPrice: 0,
                      extraCost: 0,
                      vinylColor: '',
                      blankOverride: '',
                      needsNFC: false
                    }
                  ])
                }
                className="h-8 px-3 rounded-lg border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-xs font-semibold text-zinc-800 inline-flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Añadir otra variante</span>
              </button>
            </div>

            <div className="space-y-2">
              {prodVariants.map((v, idx) => (
                <div
                  key={v.id}
                  className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center"
                >
                  <input
                    type="text"
                    value={v.name}
                    onChange={e =>
                      setProdVariants(prev =>
                        prev.map((item, i) => (i === idx ? { ...item, name: e.target.value } : item))
                      )
                    }
                    placeholder="Nombre de variante (ej: Estándar, Negro)"
                    className="sm:col-span-5 h-8 px-2.5 rounded-lg border border-zinc-200 bg-white text-xs text-zinc-900"
                  />
                  <input
                    type="text"
                    value={v.vinylColor}
                    onChange={e =>
                      setProdVariants(prev =>
                        prev.map((item, i) => (i === idx ? { ...item, vinylColor: e.target.value } : item))
                      )
                    }
                    placeholder="Color/Vinilo"
                    className="sm:col-span-3 h-8 px-2.5 rounded-lg border border-zinc-200 bg-white text-xs text-zinc-900"
                  />
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={v.extraPrice}
                    onChange={e =>
                      setProdVariants(prev =>
                        prev.map((item, i) =>
                          i === idx ? { ...item, extraPrice: Math.max(0, Number(e.target.value) || 0) } : item
                        )
                      )
                    }
                    placeholder="+Precio"
                    title="Precio extra"
                    className="sm:col-span-3 h-8 px-2.5 rounded-lg border border-zinc-200 bg-white text-xs font-mono text-zinc-900"
                  />
                  <div className="sm:col-span-1 flex justify-end">
                    <button
                      type="button"
                      disabled={prodVariants.length <= 1}
                      onClick={() => setProdVariants(prev => prev.filter((_, i) => i !== idx))}
                      className="h-8 w-8 rounded-lg border border-zinc-200 bg-white hover:bg-rose-50 text-zinc-500 hover:text-rose-600 disabled:opacity-30 inline-flex items-center justify-center cursor-pointer"
                      title="Quitar variante"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-zinc-50 border border-zinc-200 p-4 flex flex-wrap items-center justify-between gap-3">
            {!productValidation.ok ? (
              <div className="flex items-center gap-2 text-xs text-amber-800">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{productValidation.reason}</span>
              </div>
            ) : (
              <div className="text-xs text-zinc-600">
                Se creará <strong>{prodName.trim()}</strong> ({formatCOP(prodPrice)}) con{' '}
                <strong>{prodVariants.length}</strong>{' '}
                {prodVariants.length === 1 ? 'variante' : 'variantes'}.
              </div>
            )}

            <div className="flex items-center gap-2 ml-auto">
              {!confirmReady ? (
                <button
                  type="button"
                  disabled={!productValidation.ok}
                  onClick={() => setConfirmReady(true)}
                  className="h-10 px-5 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-40 text-xs font-semibold cursor-pointer"
                >
                  Revisar y Crear
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setConfirmReady(false)}
                    className="h-10 px-4 rounded-xl border border-zinc-200 bg-white text-xs font-semibold text-zinc-700 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleAddProductSafe}
                    className="h-10 px-5 rounded-xl bg-emerald-600 text-white hover:opacity-95 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirmar y guardar en NeonDB</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
import React, { useState } from 'react';
import { Copy } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { formatCOP, isOrderActive, getPendingAmount } from '../../utils/helpers';

export default function InventoryView() {
  const {
    orders,
    metrics,
    shoppingNeeds,
    productionMatrix,
    setBoughtSupplies,
    setMadeItems,
    handleToggleItemPacked,
    handleUpdateOrderShipping,
    notify
  } = useAdmin();

  const [invSubtab, setInvSubtab] = useState<'buy' | 'make' | 'pack'>('buy');
  const [invShowOnlyOrdered, setInvShowOnlyOrdered] = useState(false);
  const [invSizeFilter, setInvSizeFilter] = useState('ALL');
  const [invCategoryFilter, setInvCategoryFilter] = useState('ALL');

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    notify(label);
  };

  const getPayStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Pagado': return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Semi-pagado (50%)': return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Pendiente': return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'Reembolsado': return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'Cancelado': return 'bg-zinc-100 text-zinc-400 border-zinc-200 line-through';
      default: return 'bg-zinc-100 text-zinc-700 border-zinc-200';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-base sm:text-lg font-semibold text-zinc-900">
            Inventario bajo Pedido: ¿Qué Comprar, Estampar y Empacar?
          </h1>
          <p className="text-xs text-zinc-500">
            Calculado en vivo sobre los {metrics.activeOrdersCount} pedidos activos (excluye automáticamente Cancelados y Reembolsados).
          </p>
        </div>

        <div className="inline-flex p-1 rounded-xl bg-white border border-zinc-200 self-start">
          <button
            onClick={() => setInvSubtab('buy')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              invSubtab === 'buy' ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            A. ¿Qué toca comprar? ({shoppingNeeds.totalMissingToBuy})
          </button>
          <button
            onClick={() => setInvSubtab('make')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              invSubtab === 'make' ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            B. ¿Qué toca estampar? ({productionMatrix.totalMissingToMake})
          </button>
          <button
            onClick={() => setInvSubtab('pack')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              invSubtab === 'pack' ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            C. ¿Qué toca empacar? ({metrics.countPorPreparar})
          </button>
        </div>
      </div>

      {invSubtab === 'buy' && (
        <div className="space-y-3">
          <div className="bg-white border border-zinc-200 rounded-xl p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-zinc-900">
                  A. Prendas en Blanco e Insumos para Comprar al Proveedor (Todas las Tallas XS–2XL)
                </h2>
                <p className="text-xs text-zinc-500">
                  Incluye todas las remeras, hoodies, croptops, raglans y accesorios con todas las tallas posibles para controlar stock y compras.
                </p>
              </div>
              <button
                onClick={() => {
                  const missing = shoppingNeeds.rows.filter((r: any) => r.missing > 0);
                  if (!missing.length) {
                    notify('¡Ya tienes todos los insumos comprados!');
                    return;
                  }
                  const txt =
                    `*LISTA DE COMPRAS A PROVEEDOR — MYFANBOX*\n` +
                    missing
                      .map((r: any) => `• ${r.blankName} [Talla ${r.sizeOrSpec}] -> COMPRAR: ${r.missing} uds (Pedidos: ${r.required}, En stock: ${r.bought})`)
                      .join('\n');
                  copyToClipboard(txt, 'Lista de compras para proveedor copiada');
                }}
                className="h-8 px-3 rounded-lg bg-zinc-900 text-white text-xs font-medium hover:bg-zinc-800 inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar lista para proveedor</span>
              </button>
            </div>

            <div className="pt-2 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={invCategoryFilter}
                  onChange={(e) => setInvCategoryFilter(e.target.value)}
                  className="h-8 px-2.5 rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-800"
                >
                  <option value="ALL">Categoría: Todas (Ropa, Accesorios e Insumos)</option>
                  <option value="Prenda en Blanco">Solo Ropa (Remeras, Hoodies, Croptops, Raglans)</option>
                  <option value="Base Accesorio">Solo Base Accesorios (Mini CD / Fanbox)</option>
                  <option value="Insumos">Solo Insumos Taller / NFC</option>
                </select>

                <select
                  value={invSizeFilter}
                  onChange={(e) => setInvSizeFilter(e.target.value)}
                  className="h-8 px-2.5 rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-800"
                >
                  <option value="ALL">Talla: Todas (XS a 2XL + Única)</option>
                  {['XS', 'S', 'M', 'L', 'XL', '2XL', 'Única'].map(sz => (
                    <option key={sz} value={sz}>Talla {sz}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setInvShowOnlyOrdered(false)}
                  className={`h-8 px-3 rounded-lg border text-xs font-medium cursor-pointer ${
                    !invShowOnlyOrdered ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-zinc-50 text-zinc-600 border-zinc-200'
                  }`}
                >
                  Ver todas las tallas ({shoppingNeeds.rows.length})
                </button>
                <button
                  type="button"
                  onClick={() => setInvShowOnlyOrdered(true)}
                  className={`h-8 px-3 rounded-lg border text-xs font-medium cursor-pointer ${
                    invShowOnlyOrdered ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-zinc-50 text-zinc-600 border-zinc-200'
                  }`}
                >
                  Solo con pedidos / stock
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50/80 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                    <th className="py-2.5 px-4">Categoría</th>
                    <th className="py-2.5 px-4">Prenda Base / Insumo</th>
                    <th className="py-2.5 px-4 text-center">Talla</th>
                    <th className="py-2.5 px-4 text-center">Total Pedido</th>
                    <th className="py-2.5 px-4 text-center">Ya Comprado / En Stock</th>
                    <th className="py-2.5 px-4 text-right">Falta Comprar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 text-xs tabular-nums">
                  {shoppingNeeds.rows
                    .filter((row: any) => {
                      if (invShowOnlyOrdered && row.required === 0 && row.bought === 0) return false;
                      if (invCategoryFilter === 'Prenda en Blanco' && row.categoryLabel !== 'Prenda en Blanco') return false;
                      if (invCategoryFilter === 'Base Accesorio' && row.categoryLabel !== 'Base Accesorio') return false;
                      if (invCategoryFilter === 'Insumos' && !row.categoryLabel.includes('Insumo')) return false;
                      if (invSizeFilter !== 'ALL' && row.sizeOrSpec !== invSizeFilter) return false;
                      return true;
                    })
                    .map((row: any) => (
                      <tr key={row.key} className="hover:bg-zinc-50/80">
                        <td className="py-2.5 px-4 text-zinc-500">{row.categoryLabel}</td>
                        <td className="py-2.5 px-4 font-medium text-zinc-900">{row.blankName}</td>
                        <td className="py-2.5 px-4 text-center">
                          <span className="px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200 font-semibold text-zinc-800">
                            {row.sizeOrSpec}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-center font-semibold text-zinc-900">{row.required}</td>
                        <td className="py-2.5 px-4 text-center">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() =>
                                setBoughtSupplies(prev => ({
                                  ...prev,
                                  [row.key]: Math.max(0, row.bought - 1)
                                }))
                              }
                              className="w-6 h-6 rounded border border-zinc-200 bg-white hover:bg-zinc-100 font-bold cursor-pointer"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="0"
                              value={row.bought}
                              onChange={(e) =>
                                setBoughtSupplies(prev => ({
                                  ...prev,
                                  [row.key]: Math.max(0, Number(e.target.value) || 0)
                                }))
                              }
                              className="w-14 h-6 text-center bg-zinc-50 border border-zinc-200 rounded font-semibold"
                            />
                            <button
                              onClick={() =>
                                setBoughtSupplies(prev => ({
                                  ...prev,
                                  [row.key]: row.bought + 1
                                }))
                              }
                              className="w-6 h-6 rounded border border-zinc-200 bg-white hover:bg-zinc-100 font-bold cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          {row.missing > 0 ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-900 font-semibold">
                              Comprar {row.missing} uds
                            </span>
                          ) : row.required > 0 ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium">
                              ✓ Completo
                            </span>
                          ) : row.bought > 0 ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-sky-50 border border-sky-200 text-sky-800 font-medium">
                              En stock ({row.bought} uds)
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-zinc-50 border border-zinc-200 text-zinc-400">
                              0 pedidos
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {invSubtab === 'make' && (
        <div className="space-y-3">
          <div className="bg-white border border-zinc-200 rounded-xl p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-zinc-900">
                  B. Matriz de Producción y Estampado (Todas las Referencias, Variantes y Tallas XS–2XL)
                </h2>
                <p className="text-xs text-zinc-500">
                  Marca con <strong className="text-zinc-900">[-]</strong> y <strong className="text-zinc-900">[+]</strong> las prendas que ya salieron de estampado y pedrería.
                </p>
              </div>
              <button
                onClick={() => {
                  const pending = productionMatrix.rows.filter((r: any) => r.missing > 0);
                  if (!pending.length) {
                    notify('¡Todas las prendas ya están estampadas!');
                    return;
                  }
                  const txt =
                    `*ORDEN DE TALLER / ESTAMPADO — MYFANBOX*\n` +
                    pending
                      .map((r: any) => `• ${r.productName} (${r.variantName}) — Talla ${r.size} -> HACER: ${r.missing} uds`)
                      .join('\n');
                  copyToClipboard(txt, 'Orden de taller copiada al portapapeles');
                }}
                className="h-8 px-3 rounded-lg bg-zinc-900 text-white text-xs font-medium hover:bg-zinc-800 inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar orden para estampador</span>
              </button>
            </div>

            <div className="pt-2 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={invSizeFilter}
                  onChange={(e) => setInvSizeFilter(e.target.value)}
                  className="h-8 px-2.5 rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-800"
                >
                  <option value="ALL">Talla: Todas (XS a 2XL + Única)</option>
                  {['XS', 'S', 'M', 'L', 'XL', '2XL', 'Única'].map(sz => (
                    <option key={sz} value={sz}>Talla {sz}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setInvShowOnlyOrdered(false)}
                  className={`h-8 px-3 rounded-lg border text-xs font-medium cursor-pointer ${
                    !invShowOnlyOrdered ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-zinc-50 text-zinc-600 border-zinc-200'
                  }`}
                >
                  Ver todas las tallas ({productionMatrix.rows.length})
                </button>
                <button
                  type="button"
                  onClick={() => setInvShowOnlyOrdered(true)}
                  className={`h-8 px-3 rounded-lg border text-xs font-medium cursor-pointer ${
                    invShowOnlyOrdered ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-zinc-50 text-zinc-600 border-zinc-200'
                  }`}
                >
                  Solo con pedidos / hechas
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50/80 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                    <th className="py-2.5 px-4">Referencia Oficial</th>
                    <th className="py-2.5 px-4">Variante / Detalle</th>
                    <th className="py-2.5 px-4 text-center">Talla</th>
                    <th className="py-2.5 px-4 text-center">Pedidas</th>
                    <th className="py-2.5 px-4 text-center">Ya Hechas</th>
                    <th className="py-2.5 px-4 min-w-[130px]">Avance</th>
                    <th className="py-2.5 px-4 text-right">Faltan por Hacer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 text-xs tabular-nums">
                  {productionMatrix.rows
                    .filter((row: any) => {
                      if (invShowOnlyOrdered && row.orderedQty === 0 && row.made === 0) return false;
                      if (invSizeFilter !== 'ALL' && row.size !== invSizeFilter) return false;
                      return true;
                    })
                    .map((row: any) => {
                      const progress =
                        row.orderedQty > 0
                          ? Math.min(100, Math.round((row.made / row.orderedQty) * 100))
                          : row.made > 0
                          ? 100
                          : 0;
                      return (
                        <tr key={row.key} className="hover:bg-zinc-50/80">
                          <td className="py-2.5 px-4 font-medium text-zinc-900">{row.productName}</td>
                          <td className="py-2.5 px-4 text-zinc-600">{row.variantName}</td>
                          <td className="py-2.5 px-4 text-center">
                            <span className="px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200 font-semibold text-zinc-800">
                              {row.size}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-center font-semibold text-zinc-900">{row.orderedQty}</td>
                          <td className="py-2.5 px-4 text-center">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                onClick={() =>
                                  setMadeItems(prev => ({
                                    ...prev,
                                    [row.key]: Math.max(0, row.made - 1)
                                  }))
                                }
                                className="w-6 h-6 rounded border border-zinc-200 bg-white hover:bg-zinc-100 font-bold cursor-pointer"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min="0"
                                value={row.made}
                                onChange={(e) =>
                                  setMadeItems(prev => ({
                                    ...prev,
                                    [row.key]: Math.max(0, Number(e.target.value) || 0)
                                  }))
                                }
                                className="w-14 h-6 text-center bg-zinc-50 border border-zinc-200 rounded font-semibold"
                              />
                              <button
                                onClick={() =>
                                  setMadeItems(prev => ({
                                    ...prev,
                                    [row.key]: row.made + 1
                                  }))
                                }
                                className="w-6 h-6 rounded border border-zinc-200 bg-white hover:bg-zinc-100 font-bold cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="py-2.5 px-4">
                            <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all ${progress >= 100 ? 'bg-emerald-600' : 'bg-zinc-900'}`}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </td>
                          <td className="py-2.5 px-4 text-right">
                            {row.missing > 0 ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-rose-50 border border-rose-200 text-rose-800 font-semibold">
                                Hacer {row.missing}
                              </span>
                            ) : row.orderedQty > 0 ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium">
                                ✓ Listas
                              </span>
                            ) : row.made > 0 ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-sky-50 border border-sky-200 text-sky-800 font-medium">
                                En stock ({row.made} uds)
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-zinc-50 border border-zinc-200 text-zinc-400">
                                0 pedidos
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {invSubtab === 'pack' && (
        <div className="space-y-3">
          <div className="bg-white border border-zinc-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-zinc-900">
                C. Mesa de Empaque: Pedidos en estado "Por preparar"
              </h2>
              <p className="text-xs text-zinc-500">
                Chulea cada prenda al meterla en la bolsa/caja de la clienta y pásala con 1 clic a <strong>"Por enviar"</strong>.
              </p>
            </div>
            <span className="text-xs font-mono text-zinc-500">
              {metrics.countPorPreparar} pedidos por empacar
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {orders
              .filter(o => isOrderActive(o) && o.shippingStatus === 'Por preparar')
              .slice(0, 36)
              .map(order => {
                const allPacked = order.items.every(it => it.packed);
                const pending = getPendingAmount(order);
                return (
                  <div
                    key={order.id}
                    className={`bg-white border rounded-xl p-4 flex flex-col justify-between space-y-3 ${
                      allPacked ? 'border-sky-400 ring-1 ring-sky-100' : 'border-zinc-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-mono text-xs font-semibold text-zinc-900">{order.id}</span>
                          <h3 className="text-sm font-semibold text-zinc-900">{order.customerName}</h3>
                          <p className="text-[11px] text-zinc-500">
                            {order.city} · {order.carrier}
                          </p>
                        </div>
                        <span className={`px-2 py-0.5 rounded border text-[10px] font-medium ${getPayStatusBadgeClass(order.paymentStatus)}`}>
                          {order.paymentStatus}
                        </span>
                      </div>

                      {pending > 0 && (
                        <div className="mt-2 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-[11px] text-amber-800">
                          ⚠️ Debe saldo de <strong>{formatCOP(pending)}</strong>
                        </div>
                      )}

                      <div className="mt-3 pt-2.5 border-t border-zinc-100 space-y-1.5">
                        {order.items.map((it, idx) => (
                          <label
                            key={idx}
                            className="flex items-start gap-2 p-2 rounded-lg bg-zinc-50 border border-zinc-200 cursor-pointer hover:bg-zinc-100/70"
                          >
                            <input
                              type="checkbox"
                              checked={Boolean(it.packed)}
                              onChange={() => handleToggleItemPacked(order.id, idx)}
                              className="mt-0.5 rounded border-zinc-300"
                            />
                            <div className={`text-xs ${it.packed ? 'line-through text-zinc-400' : 'text-zinc-900'}`}>
                              <span className="font-semibold">
                                {it.qty}× {it.productName}
                              </span>
                              <div className="text-[11px] text-zinc-500">
                                {it.variantName} · Talla <strong>{it.size}</strong> · <span>{it.gender || 'Sin especificar'}</span>
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => handleUpdateOrderShipping(order.id, 'Por enviar')}
                      className={`w-full h-8 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        allPacked ? 'bg-zinc-900 text-white hover:bg-zinc-800' : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                      }`}
                    >
                      ✓ Marcar paquete "Por enviar"
                    </button>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
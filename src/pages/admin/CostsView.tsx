import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import { formatCOP, isOrderActive } from '../../utils/helpers';

export default function CostsView() {
  const {
    catalog,
    setCatalog,
    orders,
    metrics,
    comboDiscountValue,
    setComboDiscountValue
  } = useAdmin();

  const netProfitProjected = metrics.grossRevenue - metrics.totalProductionCost;
  const marginPct =
    metrics.grossRevenue > 0
      ? ((netProfitProjected / metrics.grossRevenue) * 100).toFixed(1)
      : '0.0';

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-base sm:text-lg font-semibold text-zinc-900">
            Catálogo Oficial & Ganancia Neta
          </h1>
          <p className="text-xs text-zinc-500">
            Edita el <strong>Costo Unitario de Producción</strong> o el precio base para recalcular la ganancia real al instante.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white border border-zinc-200 rounded-xl px-3 py-1.5 text-xs">
          <span className="text-zinc-500">Descuento Combo Llavero:</span>
          <input
            type="number"
            step="1000"
            value={comboDiscountValue}
            onChange={(e) => setComboDiscountValue(Math.max(0, Number(e.target.value) || 0))}
            className="w-20 h-6 px-2 text-right font-mono font-semibold bg-zinc-50 border border-zinc-200 rounded"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-zinc-200 rounded-xl p-4">
          <div className="text-xs text-zinc-500">Ventas Brutas Activas</div>
          <div className="text-xl font-semibold text-zinc-900 tabular-nums mt-1">
            {formatCOP(metrics.grossRevenue)}
          </div>
        </div>
        <div className="bg-white border border-zinc-200 rounded-xl p-4">
          <div className="text-xs text-zinc-500">Costo Total Producción</div>
          <div className="text-xl font-semibold text-zinc-900 tabular-nums mt-1">
            {formatCOP(metrics.totalProductionCost)}
          </div>
        </div>
        <div className="bg-white border border-zinc-900 rounded-xl p-4">
          <div className="text-xs font-semibold text-zinc-900">GANANCIA NETA LIBRE</div>
          <div className="text-xl font-semibold text-emerald-700 tabular-nums mt-1">
            {formatCOP(netProfitProjected)}
          </div>
        </div>
        <div className="bg-white border border-zinc-200 rounded-xl p-4">
          <div className="text-xs text-zinc-500">Margen Promedio</div>
          <div className="text-xl font-semibold text-zinc-900 tabular-nums mt-1">
            {marginPct}%
          </div>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/80 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                <th className="py-3 px-4">Referencia Oficial</th>
                <th className="py-3 px-4">Tallas & Variantes</th>
                <th className="py-3 px-4 text-center">Unidades Vendidas</th>
                <th className="py-3 px-4">Precio Venta Base</th>
                <th className="py-3 px-4">Costo Producción Unit.</th>
                <th className="py-3 px-4 text-right">Ganancia x Unidad</th>
                <th className="py-3 px-4 text-right">Ganancia Total Ref.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 text-xs tabular-nums">
              {catalog.map((prod, idx) => {
                const activeOrders = orders.filter(isOrderActive);
                let unitsSold = 0;
                let totalRefRevenue = 0;
                let totalRefCost = 0;

                activeOrders.forEach(o => {
                  o.items.forEach(it => {
                    if (it.productId === prod.id) {
                      unitsSold += it.qty;
                      totalRefRevenue += it.unitPrice * it.qty;
                      const matchedVar = prod.variants.find(
                        v => v.id === it.variantId || v.name === it.variantName
                      );
                      totalRefCost += ((Number(prod.unitCost) || 0) + (Number(matchedVar?.extraCost) || 0)) * it.qty;
                    }
                  });
                });

                const unitProfit = (Number(prod.basePrice) || 0) - (Number(prod.unitCost) || 0);
                const totalProfit = totalRefRevenue - totalRefCost;

                return (
                  <tr key={prod.id} className="hover:bg-zinc-50/80">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-zinc-900">
                        {idx + 1}. {prod.name}
                      </div>
                      <div className="text-[11px] text-zinc-400 font-mono">{prod.code}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-zinc-700">
                        {prod.variants.map(v => v.name).join(' · ')}
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">
                        Tallas: {prod.sizes.join(', ')}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center font-semibold text-zinc-900">
                      {unitsSold} uds
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        step="1000"
                        value={prod.basePrice}
                        onChange={(e) => {
                          const val = Math.max(0, Number(e.target.value) || 0);
                          setCatalog(prev =>
                            prev.map(p => (p.id === prod.id ? { ...p, basePrice: val } : p))
                          );
                        }}
                        className="w-28 h-8 px-2.5 rounded-lg bg-zinc-50 border border-zinc-200 font-semibold text-zinc-900"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        step="1000"
                        value={prod.unitCost}
                        onChange={(e) => {
                          const val = Math.max(0, Number(e.target.value) || 0);
                          setCatalog(prev =>
                            prev.map(p => (p.id === prod.id ? { ...p, unitCost: val } : p))
                          );
                        }}
                        className="w-28 h-8 px-2.5 rounded-lg bg-white border border-zinc-400 font-semibold text-zinc-900 focus:border-zinc-900 focus:outline-none"
                      />
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-zinc-900">
                      {formatCOP(unitProfit)}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-emerald-700">
                      {formatCOP(totalProfit)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
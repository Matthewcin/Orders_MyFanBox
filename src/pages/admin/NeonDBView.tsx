import React, { useState } from 'react';
import { ShieldCheck, Upload, Download, Play } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

export default function NeonDBView() {
  const {
    neonStatus,
    neonLastSync,
    isDataReady,
    isSavingData,
    dataError,
    orders,
    catalog,
    boughtSupplies,
    madeItems,
    handleInitNeonTables,
    handlePushAllToNeon,
    handlePullFromNeon,
    executeNeonQuery,
    notify
  } = useAdmin();

  const [customSqlQuery, setCustomSqlQuery] = useState(
    'SELECT payment_status, COUNT(*) AS total_pedidos, SUM(total) AS monto_cop FROM mfb_orders GROUP BY payment_status;'
  );
  const [customSqlResult, setCustomSqlResult] = useState<any>(null);
  const [sqlLogs, setSqlLogs] = useState<any[]>([
    {
      id: 'log-init',
      timestamp: new Date().toLocaleTimeString(),
      sql: '-- MyFanBox usa /api/*; la conexión PostgreSQL vive en el servidor.',
      durationMs: 0,
      status: 'INFO',
      detail: 'Conexión verificada vía backend.'
    }
  ]);

  const handleRunQuery = async () => {
    const start = performance.now();
    const result = await executeNeonQuery(customSqlQuery);
    const elapsed = Math.round(performance.now() - start);
    if (result.ok) {
      setCustomSqlResult(result.data?.rows || []);
      setSqlLogs(prev => [
        {
          id: `sql-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          sql: customSqlQuery,
          status: 'OK',
          durationMs: elapsed,
          detail: `Filas devueltas: ${result.data?.rows?.length ?? 0}`
        },
        ...prev.slice(0, 49)
      ]);
      notify('Consulta ejecutada en NeonDB.');
    } else {
      setSqlLogs(prev => [
        {
          id: `sql-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          sql: customSqlQuery,
          status: 'ERROR',
          durationMs: elapsed,
          detail: result.error
        },
        ...prev.slice(0, 49)
      ]);
      notify(`La consulta falló: ${result.error}`, 'error');
    }
  };

  return (
    <div className="space-y-4">
      <section className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg font-semibold text-zinc-900">NeonDB · PostgreSQL compartido</h1>
              <span
                className={`px-2.5 py-1 rounded-full border text-[11px] font-semibold ${
                  neonStatus === 'connected'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : neonStatus === 'error'
                    ? 'bg-rose-50 text-rose-800 border-rose-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}
              >
                {neonStatus === 'connected' ? 'Conectado' : neonStatus === 'error' ? 'Sin conexión' : 'Comprobando…'}
              </span>
              {isSavingData && <span className="text-[11px] text-sky-700">Guardando cambios…</span>}
            </div>
            <p className="text-xs text-zinc-500 mt-1 max-w-2xl">
              Los pedidos, el catálogo y el inventario se leen y escriben en NeonDB a través del backend.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleInitNeonTables}
              className="h-9 px-3 rounded-lg bg-zinc-900 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Verificar tablas
            </button>
            <button
              onClick={handlePushAllToNeon}
              disabled={!isDataReady || isSavingData}
              className="h-9 px-3 rounded-lg border border-zinc-200 bg-white text-zinc-800 text-xs font-semibold disabled:opacity-50 inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" /> Guardar ahora
            </button>
            <button
              onClick={handlePullFromNeon}
              className="h-9 px-3 rounded-lg border border-zinc-200 bg-white text-zinc-800 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Recargar desde Neon
            </button>
          </div>
        </div>

        {dataError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
            {dataError}
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Pedidos en DB', value: orders.length },
            { label: 'Referencias', value: catalog.length },
            { label: 'Insumos comprados', value: Object.keys(boughtSupplies).length },
            { label: 'Productos fabricados', value: Object.keys(madeItems).length }
          ].map(card => (
            <div key={card.label} className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
              <div className="text-[11px] text-zinc-500">{card.label}</div>
              <div className="text-xl font-semibold text-zinc-900 mt-1 tabular-nums">{card.value}</div>
            </div>
          ))}
        </div>

        <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-900 space-y-1">
          <div className="font-semibold">Importante: conexión segura</div>
          <p>
            Configura <code>DATABASE_URL</code> en el servidor (Render). La clave queda privada en el backend y la web usa únicamente <code>/api</code>.
          </p>
        </div>

        <div className="flex items-center justify-between text-[11px] text-zinc-500">
          <span>Última sincronización: {neonLastSync || '—'}</span>
          <span>Guardado automático habilitado</span>
        </div>
      </section>

      <section className="bg-white border border-zinc-200 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-zinc-900">Consola SQL de solo lectura</h2>
          <button
            onClick={handleRunQuery}
            className="h-8 px-3 rounded-lg bg-zinc-900 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5" /> Ejecutar SELECT
          </button>
        </div>
        <textarea
          rows={3}
          value={customSqlQuery}
          onChange={e => setCustomSqlQuery(e.target.value)}
          className="w-full p-3 font-mono text-xs bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900"
        />
        <p className="text-[11px] text-zinc-500">
          Por seguridad, esta consola solo acepta consultas de lectura (SELECT, WITH, EXPLAIN o SHOW).
        </p>
        {customSqlResult && (
          <pre className="p-3 rounded-xl bg-zinc-950 text-zinc-100 font-mono text-[11px] max-h-56 overflow-auto">
            {JSON.stringify(customSqlResult, null, 2)}
          </pre>
        )}
      </section>

      <section className="bg-white border border-zinc-200 rounded-2xl p-4 space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-900">Registro de actividad</h2>
          <button
            onClick={() => setSqlLogs([])}
            className="text-[11px] text-zinc-500 hover:text-zinc-900 cursor-pointer"
          >
            Limpiar
          </button>
        </div>
        <div className="space-y-2 max-h-60 overflow-auto">
          {sqlLogs.map(log => (
            <div key={log.id} className="rounded-lg bg-zinc-50 border border-zinc-200 p-2.5 font-mono text-[11px]">
              <div className="flex justify-between gap-2 text-zinc-400">
                <span>{log.timestamp}</span>
                <span>{log.status} · {log.durationMs}ms</span>
              </div>
              <div className="text-zinc-800 break-all mt-1">{log.sql}</div>
              {log.detail && <div className="text-zinc-500 mt-1">{log.detail}</div>}
            </div>
          ))}
          {sqlLogs.length === 0 && <p className="text-xs text-zinc-500">Sin actividad registrada.</p>}
        </div>
      </section>
    </div>
  );
}
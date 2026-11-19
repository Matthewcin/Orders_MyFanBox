import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Shield,
  ShoppingBag,
  Package,
  Layers,
  Plus,
  Trash2,
  Edit3,
  X,
  MessageCircle,
  Search,
  RefreshCw,
  CheckCircle2,
  Database,
  Check
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import {
  PAYMENT_STATUSES,
  SHIPPING_STATUSES,
  CARRIERS,
  ALL_GARMENT_SIZES,
  GARMENT_GENDERS
} from '../../utils/constants';
import { formatCOP } from '../../utils/helpers';

const LOCAL_BACKUP_KEY = 'mfb_isolated_other_workspace_v1';

interface OtherProduct {
  id: string;
  name: string;
  artistOrLine: string;
  category: string;
  price: number;
  unitCost: number;
  variants: string[];
  isAccessory: boolean;
}

interface OtherOrderItem {
  id: string;
  productId?: string;
  productName: string;
  artistOrLine: string;
  variantName: string;
  size: string;
  gender: string;
  qty: number;
  unitPrice: number;
  done: boolean;
}

interface OtherOrder {
  id: string;
  createdAt: string;
  customerName: string;
  phone: string;
  instagram: string;
  city: string;
  address: string;
  carrier: string;
  trackingNumber: string;
  paymentStatus: string;
  shippingStatus: string;
  notes: string;
  discount: number;
  total: number;
  items: OtherOrderItem[];
}

interface OtherWorkspacePayload {
  products: OtherProduct[];
  orders: OtherOrder[];
}

function escapeSqlLiteral(value: string): string {
  return value.replace(/'/g, "''");
}

function isOtherOrderActive(order: OtherOrder): boolean {
  return order.paymentStatus !== 'Cancelado' && order.paymentStatus !== 'Reembolsado';
}

function getOtherPaidAmount(order: OtherOrder): number {
  if (!isOtherOrderActive(order)) return 0;
  if (order.paymentStatus === 'Pagado') return order.total;
  if (order.paymentStatus === 'Semi-pagado (50%)') return Math.round(order.total * 0.5);
  return 0;
}

function getOtherPendingAmount(order: OtherOrder): number {
  if (!isOtherOrderActive(order)) return 0;
  return Math.max(0, order.total - getOtherPaidAmount(order));
}

function getRowVisualStyle(order: OtherOrder) {
  if (!isOtherOrderActive(order)) {
    return {
      style: {
        backgroundColor: 'rgba(113, 113, 122, 0.05)',
        boxShadow: 'inset 3px 0 0 rgba(113, 113, 122, 0.5)',
        opacity: 0.65
      },
      dot: '#71717a'
    };
  }
  if (order.shippingStatus === 'Enviado' || order.shippingStatus === 'Entregado') {
    return {
      style: {
        backgroundColor: 'rgba(16, 185, 129, 0.075)',
        boxShadow: 'inset 3px 0 0 rgba(16, 185, 129, 0.78)'
      },
      dot: '#10b981'
    };
  }
  if (order.shippingStatus === 'Por enviar') {
    return {
      style: {
        backgroundColor: 'rgba(14, 165, 233, 0.085)',
        boxShadow: 'inset 3px 0 0 rgba(14, 165, 233, 0.8)'
      },
      dot: '#0ea5e9'
    };
  }
  return {
    style: {
      backgroundColor: 'rgba(245, 158, 11, 0.065)',
      boxShadow: 'inset 3px 0 0 rgba(245, 158, 11, 0.72)'
    },
    dot: '#f59e0b'
  };
}

export default function OtherProductsView() {
  const { executeNeonQuery, defaultCarrier, brandName, notify } = useAdmin();

  const [subTab, setSubTab] = useState<'orders' | 'catalog' | 'tasks'>('orders');
  const [products, setProducts] = useState<OtherProduct[]>([]);
  const [orders, setOrders] = useState<OtherOrder[]>([]);
  const [search, setSearch] = useState('');
  const [shipFilter, setShipFilter] = useState('ALL');
  const [syncState, setSyncState] = useState<'loading' | 'synced' | 'saving' | 'local-only'>('loading');

  const isHydratedRef = useRef(false);

  // Modal de Pedido Aislado
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [customerForm, setCustomerForm] = useState({
    customerName: '',
    phone: '',
    instagram: '',
    city: '',
    address: '',
    carrier: defaultCarrier || 'Interrapidísimo',
    trackingNumber: '',
    paymentStatus: 'Pendiente',
    shippingStatus: 'Por preparar',
    notes: '',
    discount: 0
  });
  const [draftItems, setDraftItems] = useState<OtherOrderItem[]>([]);

  // Formulario rápido de Producto Aislado
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [prodForm, setProdForm] = useState({
    name: '',
    artistOrLine: '',
    category: 'Prenda',
    price: 90000,
    unitCost: 35000,
    variantsText: 'Estándar',
    isAccessory: false
  });

  const persistLocalBackup = (data: OtherWorkspacePayload) => {
    try {
      localStorage.setItem(LOCAL_BACKUP_KEY, JSON.stringify(data));
    } catch {}
  };

  const loadLocalBackup = (): OtherWorkspacePayload => {
    try {
      const raw = localStorage.getItem(LOCAL_BACKUP_KEY);
      if (!raw) return { products: [], orders: [] };
      const parsed = JSON.parse(raw);
      return {
        products: Array.isArray(parsed.products) ? parsed.products : [],
        orders: Array.isArray(parsed.orders) ? parsed.orders : []
      };
    } catch {
      return { products: [], orders: [] };
    }
  };

  const ensureTableAndLoad = useCallback(async (showToast = false) => {
    setSyncState('loading');
    try {
      const initRes = await executeNeonQuery(`
        CREATE TABLE IF NOT EXISTS mfb_other_workspace (
          workspace_key TEXT PRIMARY KEY,
          payload JSONB NOT NULL DEFAULT '{"products":[],"orders":[]}'::jsonb,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);

      if (!initRes.ok) {
        const local = loadLocalBackup();
        setProducts(local.products);
        setOrders(local.orders);
        setSyncState('local-only');
        isHydratedRef.current = true;
        if (showToast) notify('Modo respaldo local (revisa conexión NeonDB)', 'warning');
        return;
      }

      const selectRes = await executeNeonQuery(`
        SELECT payload FROM mfb_other_workspace WHERE workspace_key = 'default' LIMIT 1;
      `);

      if (selectRes.ok && selectRes.data?.rows?.length > 0) {
        const raw = selectRes.data.rows[0].payload;
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw || {};
        const nextProducts = Array.isArray(parsed.products) ? parsed.products : [];
        const nextOrders = Array.isArray(parsed.orders) ? parsed.orders : [];
        setProducts(nextProducts);
        setOrders(nextOrders);
        persistLocalBackup({ products: nextProducts, orders: nextOrders });
      } else {
        const local = loadLocalBackup();
        setProducts(local.products);
        setOrders(local.orders);
      }

      setSyncState('synced');
      isHydratedRef.current = true;
      if (showToast) notify('Espacio aislado sincronizado con NeonDB');
    } catch {
      const local = loadLocalBackup();
      setProducts(local.products);
      setOrders(local.orders);
      setSyncState('local-only');
      isHydratedRef.current = true;
    }
  }, [executeNeonQuery, notify]);

  useEffect(() => {
    ensureTableAndLoad(false);
  }, [ensureTableAndLoad]);

  const saveWorkspaceToNeon = useCallback(async (data: OtherWorkspacePayload, manual = false) => {
    persistLocalBackup(data);
    setSyncState('saving');
    try {
      const jsonStr = escapeSqlLiteral(JSON.stringify(data));
      const res = await executeNeonQuery(`
        INSERT INTO mfb_other_workspace (workspace_key, payload, updated_at)
        VALUES ('default', '${jsonStr}'::jsonb, NOW())
        ON CONFLICT (workspace_key)
        DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW();
      `);
      if (res.ok) {
        setSyncState('synced');
        if (manual) notify('Espacio aislado guardado en NeonDB');
      } else {
        setSyncState('local-only');
        if (manual) notify(res.error || 'No se pudo guardar en NeonDB', 'error');
      }
    } catch {
      setSyncState('local-only');
    }
  }, [executeNeonQuery, notify]);

  useEffect(() => {
    if (!isHydratedRef.current) return;
    const timer = setTimeout(() => {
      saveWorkspaceToNeon({ products, orders }, false);
    }, 650);
    return () => clearTimeout(timer);
  }, [products, orders, saveWorkspaceToNeon]);

  const metrics = useMemo(() => {
    const active = orders.filter(isOtherOrderActive);
    return {
      activeCount: active.length,
      toPrepareCount: active.filter(o => o.shippingStatus === 'Por preparar').length,
      readyCount: active.filter(o => o.shippingStatus === 'Por enviar').length,
      collected: active.reduce((s, o) => s + getOtherPaidAmount(o), 0),
      pending: active.reduce((s, o) => s + getOtherPendingAmount(o), 0),
      gross: active.reduce((s, o) => s + o.total, 0)
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter(o => {
      if (shipFilter !== 'ALL' && o.shippingStatus !== shipFilter) return false;
      if (!q) return true;
      const hay = [
        o.id,
        o.customerName,
        o.phone,
        o.instagram,
        o.city,
        o.notes,
        ...o.items.map(i => `${i.productName} ${i.artistOrLine} ${i.variantName} ${i.size}`)
      ]
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [orders, search, shipFilter]);

  const pendingTaskRows = useMemo(() => {
    const list: { orderId: string; customerName: string; item: OtherOrderItem }[] = [];
    orders.filter(isOtherOrderActive).forEach(o => {
      if (o.shippingStatus === 'Enviado' || o.shippingStatus === 'Entregado') return;
      o.items.forEach(item => {
        list.push({ orderId: o.id, customerName: o.customerName, item });
      });
    });
    return list;
  }, [orders]);

  const openNewOrderModal = () => {
    setEditingOrderId(null);
    setCustomerForm({
      customerName: '',
      phone: '',
      instagram: '',
      city: '',
      address: '',
      carrier: defaultCarrier || 'Interrapidísimo',
      trackingNumber: '',
      paymentStatus: 'Pendiente',
      shippingStatus: 'Por preparar',
      notes: '',
      discount: 0
    });
    const firstProd = products[0];
    setDraftItems([
      {
        id: `oi-${Date.now()}`,
        productId: firstProd?.id || '',
        productName: firstProd?.name || '',
        artistOrLine: firstProd?.artistOrLine || '',
        variantName: firstProd?.variants?.[0] || 'Estándar',
        size: firstProd?.isAccessory ? 'Única' : 'M',
        gender: firstProd?.isAccessory ? 'Sin especificar' : 'Femenino',
        qty: 1,
        unitPrice: firstProd?.price ?? 90000,
        done: false
      }
    ]);
    setOrderModalOpen(true);
  };

  const openEditOrderModal = (order: OtherOrder) => {
    setEditingOrderId(order.id);
    setCustomerForm({
      customerName: order.customerName,
      phone: order.phone,
      instagram: order.instagram,
      city: order.city,
      address: order.address,
      carrier: order.carrier || defaultCarrier || 'Interrapidísimo',
      trackingNumber: order.trackingNumber || '',
      paymentStatus: order.paymentStatus,
      shippingStatus: order.shippingStatus,
      notes: order.notes || '',
      discount: order.discount || 0
    });
    setDraftItems(order.items.map(it => ({ ...it })));
    setOrderModalOpen(true);
  };

  const handleSelectCatalogProductInDraft = (idx: number, prodId: string) => {
    const found = products.find(p => p.id === prodId);
    setDraftItems(prev =>
      prev.map((it, i) => {
        if (i !== idx) return it;
        if (!found) {
          return { ...it, productId: '' };
        }
        return {
          ...it,
          productId: found.id,
          productName: found.name,
          artistOrLine: found.artistOrLine,
          variantName: found.variants[0] || 'Estándar',
          size: found.isAccessory ? 'Única' : it.size === 'Única' ? 'M' : it.size,
          unitPrice: found.price
        };
      })
    );
  };

  const draftSubtotal = useMemo(() => {
    return draftItems.reduce((s, it) => s + (Number(it.unitPrice) || 0) * Math.max(1, Number(it.qty) || 1), 0);
  }, [draftItems]);

  const draftTotal = Math.max(0, draftSubtotal - (Number(customerForm.discount) || 0));

  const handleSaveOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerForm.customerName.trim()) {
      notify('Escribe el nombre del cliente', 'warning');
      return;
    }
    const cleanItems = draftItems.filter(it => it.productName.trim());
    if (cleanItems.length === 0) {
      notify('Agrega al menos un producto con nombre', 'warning');
      return;
    }

    if (editingOrderId) {
      setOrders(prev =>
        prev.map(o =>
          o.id === editingOrderId
            ? {
                ...o,
                ...customerForm,
                items: cleanItems,
                total: draftTotal
              }
            : o
        )
      );
      notify(`Pedido aislado ${editingOrderId} actualizado`);
    } else {
      const maxNum = orders.reduce((m, o) => {
        const n = parseInt(String(o.id || '').replace(/\D/g, ''), 10);
        return !isNaN(n) && n > m ? n : m;
      }, 1000);
      const newOrder: OtherOrder = {
        id: `OTR-${maxNum + 1}`,
        createdAt: new Date().toISOString().split('T')[0],
        ...customerForm,
        items: cleanItems,
        total: draftTotal
      };
      setOrders(prev => [newOrder, ...prev]);
      notify(`Pedido aislado ${newOrder.id} creado`);
    }
    setOrderModalOpen(false);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodForm.name.trim()) {
      notify('Escribe el nombre del producto', 'warning');
      return;
    }
    const variants = prodForm.variantsText
      .split(',')
      .map(v => v.trim())
      .filter(Boolean);

    if (editingProductId) {
      setProducts(prev =>
        prev.map(p =>
          p.id === editingProductId
            ? {
                ...p,
                name: prodForm.name.trim(),
                artistOrLine: prodForm.artistOrLine.trim() || 'General',
                category: prodForm.isAccessory ? 'Accesorio' : prodForm.category,
                price: Math.max(0, Number(prodForm.price) || 0),
                unitCost: Math.max(0, Number(prodForm.unitCost) || 0),
                variants: variants.length > 0 ? variants : ['Estándar'],
                isAccessory: prodForm.isAccessory
              }
            : p
        )
      );
      notify('Producto actualizado en catálogo aislado');
    } else {
      const nextProd: OtherProduct = {
        id: `otr-cat-${Date.now().toString().slice(-6)}`,
        name: prodForm.name.trim(),
        artistOrLine: prodForm.artistOrLine.trim() || 'General',
        category: prodForm.isAccessory ? 'Accesorio' : prodForm.category,
        price: Math.max(0, Number(prodForm.price) || 0),
        unitCost: Math.max(0, Number(prodForm.unitCost) || 0),
        variants: variants.length > 0 ? variants : ['Estándar'],
        isAccessory: prodForm.isAccessory
      };
      setProducts(prev => [nextProd, ...prev]);
      notify(`"${nextProd.name}" agregado a Otros Productos`);
    }

    setEditingProductId(null);
    setProdForm({
      name: '',
      artistOrLine: '',
      category: 'Prenda',
      price: 90000,
      unitCost: 35000,
      variantsText: 'Estándar',
      isAccessory: false
    });
  };

  const handleToggleItemDone = (orderId: string, itemId: string) => {
    setOrders(prev =>
      prev.map(o =>
        o.id === orderId
          ? {
              ...o,
              items: o.items.map(it => (it.id === itemId ? { ...it, done: !it.done } : it))
            }
          : o
      )
    );
  };

  const handleWhatsApp = (order: OtherOrder) => {
    const raw = String(order.phone || '').trim();
    let digits = raw.replace(/\D/g, '');
    if (digits.startsWith('00')) digits = digits.slice(2);
    else if (!raw.startsWith('+') && digits.length === 10) digits = `57${digits}`;
    if (!digits) {
      notify('Este pedido no tiene teléfono registrado', 'warning');
      return;
    }
    const itemsList = order.items
      .map(i => `• ${i.qty}x ${i.productName}${i.artistOrLine ? ` (${i.artistOrLine})` : ''} · ${i.variantName} · Talla ${i.size}`)
      .join('\n');
    const pending = getOtherPendingAmount(order);
    const msg = `¡Hola ${order.customerName.split(' ')[0]}! Te escribimos de *${brandName}* sobre tu pedido *${order.id}*:\n\nEstado: *${order.shippingStatus}* · Pago: *${order.paymentStatus}*${pending > 0 ? `\nSaldo pendiente: *${formatCOP(pending)}*` : ''}${order.trackingNumber ? `\nTransportadora: *${order.carrier}* · Guía: *${order.trackingNumber}*` : ''}\n\n*Detalle:*\n${itemsList}`;
    window.open(`https://wa.me/${digits}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-4">
      {/* Encabezado de espacio aislado */}
      <section className="bg-white border border-zinc-200 rounded-2xl p-5 flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-purple-800 text-[11px] font-semibold">
            <Shield className="w-3.5 h-3.5" />
            <span>Espacio 100% Aislado · Fuera de la colección Karol G</span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-zinc-900 pt-1">
            Otros Productos y Pedidos Especiales
          </h1>
          <p className="text-xs text-zinc-500 max-w-2xl">
            Todo lo que registres aquí (otros artistas, encargos personalizados o productos fuera de campaña) vive en su propia tabla <span className="font-mono">mfb_other_workspace</span> y no afecta tus ventas, inventario ni reportes de Karol G.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`h-9 px-3 rounded-xl border text-xs font-medium inline-flex items-center gap-1.5 ${
              syncState === 'synced'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : syncState === 'local-only'
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-zinc-50 border-zinc-200 text-zinc-600'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>
              {syncState === 'synced'
                ? 'Tabla aislada sincronizada'
                : syncState === 'saving'
                ? 'Guardando…'
                : syncState === 'loading'
                ? 'Cargando…'
                : 'Solo respaldo local'}
            </span>
          </span>

          <button
            type="button"
            onClick={() => ensureTableAndLoad(true)}
            className="h-9 px-3 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-xs font-medium text-zinc-700 inline-flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Actualizar</span>
          </button>

          <button
            type="button"
            onClick={openNewOrderModal}
            className="h-9 px-3.5 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nuevo Pedido (Otros)</span>
          </button>
        </div>
      </section>

      {/* Métricas aisladas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white border border-zinc-200 rounded-2xl p-4">
          <div className="text-[11px] text-zinc-500">Pedidos Activos (Otros)</div>
          <div className="text-xl font-bold text-zinc-900 mt-1 tabular-nums">{metrics.activeCount}</div>
          <div className="text-[11px] text-zinc-400 mt-0.5">
            {metrics.toPrepareCount} por preparar · {metrics.readyCount} por enviar
          </div>
        </div>
        <div className="bg-white border border-zinc-200 rounded-2xl p-4">
          <div className="text-[11px] text-zinc-500">Recaudado (Otros)</div>
          <div className="text-xl font-bold text-emerald-700 mt-1 tabular-nums">{formatCOP(metrics.collected)}</div>
          <div className="text-[11px] text-zinc-400 mt-0.5">No suma a Karol G</div>
        </div>
        <div className="bg-white border border-zinc-200 rounded-2xl p-4">
          <div className="text-[11px] text-zinc-500">Por Cobrar (Otros)</div>
          <div className="text-xl font-bold text-amber-700 mt-1 tabular-nums">{formatCOP(metrics.pending)}</div>
          <div className="text-[11px] text-zinc-400 mt-0.5">Total bruto: {formatCOP(metrics.gross)}</div>
        </div>
        <div className="bg-white border border-zinc-200 rounded-2xl p-4">
          <div className="text-[11px] text-zinc-500">Catálogo Aislado</div>
          <div className="text-xl font-bold text-zinc-900 mt-1 tabular-nums">{products.length} refs</div>
          <div className="text-[11px] text-zinc-400 mt-0.5">Productos fuera de colección</div>
        </div>
      </div>

      {/* Sub-pestañas internas */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white border border-zinc-200 rounded-2xl p-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSubTab('orders')}
            className={`h-9 px-3.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer ${
              subTab === 'orders' ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-100'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Pedidos Otros ({orders.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('catalog')}
            className={`h-9 px-3.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer ${
              subTab === 'catalog' ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-100'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Catálogo Otros ({products.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('tasks')}
            className={`h-9 px-3.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer ${
              subTab === 'tasks' ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Por Hacer ({pendingTaskRows.filter(r => !r.item.done).length})</span>
          </button>
        </div>

        {subTab === 'orders' && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar cliente, artista, producto..."
                className="h-8 pl-8 pr-3 rounded-lg border border-zinc-200 bg-zinc-50 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900"
              />
            </div>
            <select
              value={shipFilter}
              onChange={e => setShipFilter(e.target.value)}
              className="h-8 px-2.5 rounded-lg border border-zinc-200 bg-zinc-50 text-xs text-zinc-900"
            >
              <option value="ALL">Envío: Todos</option>
              {SHIPPING_STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* VISTA 1: PEDIDOS AISLADOS */}
      {subTab === 'orders' && (
        <section className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-[10px] uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="p-3">Orden</th>
                  <th className="p-3">Cliente & Destino</th>
                  <th className="p-3">Productos / Artista</th>
                  <th className="p-3">Total / Saldo</th>
                  <th className="p-3">Pago</th>
                  <th className="p-3">Envío</th>
                  <th className="p-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {filteredOrders.map(order => {
                  const visual = getRowVisualStyle(order);
                  const pending = getOtherPendingAmount(order);
                  return (
                    <tr key={order.id} style={visual.style} className="transition-colors">
                      <td className="p-3 align-top">
                        <div className="flex flex-col items-start gap-1">
                          <span className="font-mono font-bold text-zinc-900">{order.id}</span>
                          <span className="text-[11px] text-zinc-500">{order.createdAt}</span>
                          <span className="inline-flex items-center gap-1.5 text-[10px] text-zinc-500">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: visual.dot }} />
                            <span>{order.shippingStatus}</span>
                          </span>
                        </div>
                      </td>

                      <td className="p-3 align-top min-w-[175px]">
                        <div className="font-semibold text-zinc-900">{order.customerName}</div>
                        <div className="text-[11px] text-zinc-500">
                          {order.instagram ? `${order.instagram} · ` : ''}{order.phone || 'Sin teléfono'}
                        </div>
                        <div className="text-[11px] text-zinc-600 mt-0.5">
                          {order.city || 'Ciudad sin definir'}{order.address ? ` — ${order.address}` : ''}
                        </div>
                      </td>

                      <td className="p-3 align-top min-w-[220px]">
                        <div className="space-y-1">
                          {order.items.map(it => (
                            <div key={it.id} className="text-[11px]">
                              <span className="font-semibold text-zinc-900">
                                {it.qty}× {it.productName}
                              </span>
                              {it.artistOrLine && (
                                <span className="ml-1.5 px-1.5 py-0.2 rounded bg-purple-50 border border-purple-200 text-purple-800 text-[10px] font-semibold">
                                  {it.artistOrLine}
                                </span>
                              )}
                              <span className="text-zinc-500">
                                {' '}· {it.variantName} · <strong>{it.size}</strong>
                              </span>
                            </div>
                          ))}
                        </div>
                        {order.notes && (
                          <div className="mt-1 text-[10px] text-amber-700 font-medium">Nota: {order.notes}</div>
                        )}
                      </td>

                      <td className="p-3 align-top whitespace-nowrap tabular-nums">
                        <div className="font-bold text-zinc-900">{formatCOP(order.total)}</div>
                        {pending === 0 && isOtherOrderActive(order) ? (
                          <div className="text-[11px] text-emerald-700 font-medium">Pagado 100%</div>
                        ) : isOtherOrderActive(order) ? (
                          <div className="text-[11px] text-amber-700 font-semibold">Debe: {formatCOP(pending)}</div>
                        ) : (
                          <div className="text-[11px] text-zinc-400">{order.paymentStatus}</div>
                        )}
                      </td>

                      <td className="p-3 align-top">
                        <select
                          value={order.paymentStatus}
                          onChange={e =>
                            setOrders(prev =>
                              prev.map(o => (o.id === order.id ? { ...o, paymentStatus: e.target.value } : o))
                            )
                          }
                          className="h-8 px-2 rounded-lg border border-zinc-200 bg-zinc-50 text-xs text-zinc-900 cursor-pointer"
                        >
                          {PAYMENT_STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
                        </select>
                      </td>

                      <td className="p-3 align-top">
                        <select
                          value={order.shippingStatus}
                          onChange={e =>
                            setOrders(prev =>
                              prev.map(o => (o.id === order.id ? { ...o, shippingStatus: e.target.value } : o))
                            )
                          }
                          className="h-8 px-2 rounded-lg border border-zinc-200 bg-zinc-50 text-xs text-zinc-900 cursor-pointer"
                        >
                          {SHIPPING_STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
                        </select>
                      </td>

                      <td className="p-3 align-top text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleWhatsApp(order)}
                            className="h-7 px-2 rounded-lg border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-[11px] font-semibold text-emerald-700 inline-flex items-center gap-1 cursor-pointer"
                          >
                            <MessageCircle className="w-3 h-3" />
                            <span>WA</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditOrderModal(order)}
                            className="h-7 w-7 rounded-lg border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-600 inline-flex items-center justify-center cursor-pointer"
                            title="Editar pedido"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`¿Eliminar el pedido aislado ${order.id}?`)) {
                                setOrders(prev => prev.filter(o => o.id !== order.id));
                                notify(`Pedido ${order.id} eliminado`);
                              }
                            }}
                            className="h-7 w-7 rounded-lg border border-zinc-200 bg-zinc-50 hover:bg-rose-50 text-zinc-500 hover:text-rose-600 inline-flex items-center justify-center cursor-pointer"
                            title="Eliminar pedido"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-10 text-center text-xs text-zinc-500">
                      Aún no hay pedidos fuera de colección registrados. Haz clic en <strong>Nuevo Pedido (Otros)</strong> para agregar el primero.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* VISTA 2: CATÁLOGO AISLADO */}
      {subTab === 'catalog' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <form
            onSubmit={handleSaveProduct}
            className="lg:col-span-5 bg-white border border-zinc-200 rounded-2xl p-5 space-y-3 h-fit"
          >
            <h2 className="text-sm font-bold text-zinc-900">
              {editingProductId ? 'Editar Producto Aislado' : 'Agregar Producto (No Karol G)'}
            </h2>

            <label className="block text-xs text-zinc-600 space-y-1">
              <span>Nombre del producto *</span>
              <input
                type="text"
                required
                value={prodForm.name}
                onChange={e => setProdForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Ej: Hoodie Eras Tour, Llavero Mini CD Feid..."
                className="w-full h-9 px-3 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900"
              />
            </label>

            <div className="grid grid-cols-2 gap-2.5">
              <label className="block text-xs text-zinc-600 space-y-1">
                <span>Artista / Línea</span>
                <input
                  type="text"
                  value={prodForm.artistOrLine}
                  onChange={e => setProdForm(p => ({ ...p, artistOrLine: e.target.value }))}
                  placeholder="Ej: Feid, Bad Bunny, Custom"
                  className="w-full h-9 px-3 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900"
                />
              </label>

              <label className="block text-xs text-zinc-600 space-y-1">
                <span>Categoría</span>
                <input
                  type="text"
                  value={prodForm.category}
                  disabled={prodForm.isAccessory}
                  onChange={e => setProdForm(p => ({ ...p, category: e.target.value }))}
                  placeholder="Prenda / Hoodie / Camiseta"
                  className="w-full h-9 px-3 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 disabled:opacity-50"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <label className="block text-xs text-zinc-600 space-y-1">
                <span>Precio venta (COP)</span>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={prodForm.price}
                  onChange={e => setProdForm(p => ({ ...p, price: Number(e.target.value) || 0 }))}
                  className="w-full h-9 px-3 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 font-mono"
                />
              </label>

              <label className="block text-xs text-zinc-600 space-y-1">
                <span>Costo taller (COP)</span>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={prodForm.unitCost}
                  onChange={e => setProdForm(p => ({ ...p, unitCost: Number(e.target.value) || 0 }))}
                  className="w-full h-9 px-3 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 font-mono"
                />
              </label>
            </div>

            <label className="block text-xs text-zinc-600 space-y-1">
              <span>Variantes / Colores (separadas por coma)</span>
              <input
                type="text"
                value={prodForm.variantsText}
                onChange={e => setProdForm(p => ({ ...p, variantsText: e.target.value }))}
                placeholder="Ej: Negro, Blanco, Con NFC, Sin NFC"
                className="w-full h-9 px-3 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900"
              />
            </label>

            <label className="inline-flex items-center gap-2 text-xs text-zinc-600 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={prodForm.isAccessory}
                onChange={e => setProdForm(p => ({ ...p, isAccessory: e.target.checked }))}
                className="rounded border-zinc-300"
              />
              <span>Es accesorio / talla única</span>
            </label>

            <div className="flex items-center gap-2 pt-2">
              {editingProductId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingProductId(null);
                    setProdForm({
                      name: '',
                      artistOrLine: '',
                      category: 'Prenda',
                      price: 90000,
                      unitCost: 35000,
                      variantsText: 'Estándar',
                      isAccessory: false
                    });
                  }}
                  className="h-9 px-3 rounded-xl border border-zinc-200 bg-white text-xs font-semibold text-zinc-700 cursor-pointer"
                >
                  Cancelar
                </button>
              )}
              <button
                type="submit"
                className="flex-1 h-9 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 text-xs font-semibold cursor-pointer"
              >
                {editingProductId ? 'Guardar cambios' : 'Agregar a Catálogo Otros'}
              </button>
            </div>
          </form>

          <div className="lg:col-span-7 bg-white border border-zinc-200 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-zinc-900">
                Referencias guardadas ({products.length})
              </h2>
            </div>

            {products.length === 0 ? (
              <div className="p-8 rounded-xl border border-dashed border-zinc-300 text-center text-xs text-zinc-500">
                Todavía no hay productos en este catálogo aislado. Agrega uno a la izquierda o crea un pedido escribiendo el producto directamente.
              </div>
            ) : (
              <div className="space-y-2">
                {products.map(prod => (
                  <div
                    key={prod.id}
                    className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-xs font-bold text-zinc-900">{prod.name}</span>
                        <span className="px-2 py-0.2 rounded-full bg-purple-50 border border-purple-200 text-purple-800 text-[10px] font-semibold">
                          {prod.artistOrLine}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-500 mt-1">
                        Venta: <strong className="text-zinc-900">{formatCOP(prod.price)}</strong> · Costo: {formatCOP(prod.unitCost)} · Variantes: {prod.variants.join(', ')}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingProductId(prod.id);
                          setProdForm({
                            name: prod.name,
                            artistOrLine: prod.artistOrLine,
                            category: prod.category,
                            price: prod.price,
                            unitCost: prod.unitCost,
                            variantsText: prod.variants.join(', '),
                            isAccessory: prod.isAccessory
                          });
                        }}
                        className="h-7 w-7 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-600 inline-flex items-center justify-center cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`¿Eliminar "${prod.name}" del catálogo aislado?`)) {
                            setProducts(prev => prev.filter(p => p.id !== prod.id));
                            notify('Producto eliminado del catálogo aislado');
                          }
                        }}
                        className="h-7 w-7 rounded-lg border border-zinc-200 bg-white hover:bg-rose-50 text-zinc-500 hover:text-rose-600 inline-flex items-center justify-center cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VISTA 3: POR HACER (AISLADO) */}
      {subTab === 'tasks' && (
        <section className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-zinc-900">
              Lista de taller fuera de colección ({pendingTaskRows.filter(r => !r.item.done).length} pendientes)
            </h2>
          </div>

          {pendingTaskRows.length === 0 ? (
            <div className="p-8 rounded-xl border border-dashed border-zinc-300 text-center text-xs text-zinc-500 flex flex-col items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              <span>¡Todo al día! No hay prendas pendientes fuera de colección.</span>
            </div>
          ) : (
            <div className="space-y-2">
              {pendingTaskRows.map(({ orderId, customerName, item }) => (
                <button
                  key={`${orderId}-${item.id}`}
                  type="button"
                  onClick={() => handleToggleItemDone(orderId, item.id)}
                  className="w-full text-left p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 hover:border-zinc-400 flex items-center justify-between gap-3 cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 ${
                        item.done
                          ? 'bg-zinc-900 border-zinc-900 text-white'
                          : 'bg-white border-zinc-300 text-transparent'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </span>
                    <div className="min-w-0">
                      <div className={`text-xs sm:text-sm font-bold text-zinc-900 ${item.done ? 'line-through opacity-60' : ''}`}>
                        {item.qty}× {item.productName}{' '}
                        {item.artistOrLine && (
                          <span className="text-[11px] font-semibold text-purple-800">({item.artistOrLine})</span>
                        )}
                      </div>
                      <div className="text-[11px] text-zinc-500">
                        {item.variantName} · Talla <strong>{item.size}</strong> · {item.gender} · Pedido {orderId} ({customerName})
                      </div>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border shrink-0 ${
                      item.done
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-amber-50 border-amber-200 text-amber-900'
                    }`}
                  >
                    {item.done ? 'Hecho' : 'Pendiente'}
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {/* MODAL CREAR / EDITAR PEDIDO AISLADO */}
      {orderModalOpen && (
        <div className="fixed inset-0 z-50 bg-zinc-950/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleSaveOrder}
            className="w-full max-w-2xl bg-white border border-zinc-200 rounded-2xl p-5 sm:p-6 space-y-4 my-auto shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <div>
                <h2 className="text-base font-bold text-zinc-900">
                  {editingOrderId ? `Editar Pedido ${editingOrderId}` : 'Nuevo Pedido (Fuera de Karol G)'}
                </h2>
                <p className="text-[11px] text-zinc-500">
                  Guardado únicamente en el espacio aislado.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOrderModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label className="space-y-1">
                <span className="text-zinc-600">Cliente *</span>
                <input
                  required
                  value={customerForm.customerName}
                  onChange={e => setCustomerForm(c => ({ ...c, customerName: e.target.value }))}
                  placeholder="Nombre completo"
                  className="w-full h-9 px-3 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900"
                />
              </label>
              <label className="space-y-1">
                <span className="text-zinc-600">WhatsApp / Teléfono</span>
                <input
                  value={customerForm.phone}
                  onChange={e => setCustomerForm(c => ({ ...c, phone: e.target.value }))}
                  placeholder="+57 300 000 0000"
                  className="w-full h-9 px-3 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 font-mono"
                />
              </label>
              <label className="space-y-1">
                <span className="text-zinc-600">Instagram</span>
                <input
                  value={customerForm.instagram}
                  onChange={e => setCustomerForm(c => ({ ...c, instagram: e.target.value }))}
                  placeholder="@usuario"
                  className="w-full h-9 px-3 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900"
                />
              </label>
              <label className="space-y-1">
                <span className="text-zinc-600">Ciudad</span>
                <input
                  value={customerForm.city}
                  onChange={e => setCustomerForm(c => ({ ...c, city: e.target.value }))}
                  placeholder="Ej: Medellín, Bogotá..."
                  className="w-full h-9 px-3 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900"
                />
              </label>
              <label className="space-y-1 sm:col-span-2">
                <span className="text-zinc-600">Dirección de entrega</span>
                <input
                  value={customerForm.address}
                  onChange={e => setCustomerForm(c => ({ ...c, address: e.target.value }))}
                  placeholder="Calle, barrio, indicaciones"
                  className="w-full h-9 px-3 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900"
                />
              </label>
            </div>

            <div className="space-y-2 pt-2 border-t border-zinc-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-900">Productos del pedido</span>
                <button
                  type="button"
                  onClick={() =>
                    setDraftItems(prev => [
                      ...prev,
                      {
                        id: `oi-${Date.now()}-${prev.length}`,
                        productId: '',
                        productName: '',
                        artistOrLine: '',
                        variantName: 'Estándar',
                        size: 'M',
                        gender: 'Sin especificar',
                        qty: 1,
                        unitPrice: 0,
                        done: false
                      }
                    ])
                  }
                  className="h-7 px-2.5 rounded-lg border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-[11px] font-semibold text-zinc-800 inline-flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Añadir ítem
                </button>
              </div>

              <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
                {draftItems.map((it, idx) => (
                  <div key={it.id} className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2 text-xs">
                    {products.length > 0 && (
                      <select
                        value={it.productId || ''}
                        onChange={e => handleSelectCatalogProductInDraft(idx, e.target.value)}
                        className="w-full h-8 px-2.5 rounded-lg border border-zinc-200 bg-white text-xs text-zinc-900"
                      >
                        <option value="">— Escribir producto personalizado —</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.artistOrLine}) · {formatCOP(p.price)}
                          </option>
                        ))}
                      </select>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-12 gap-2">
                      <input
                        type="text"
                        required
                        value={it.productName}
                        onChange={e =>
                          setDraftItems(prev =>
                            prev.map((x, i) => (i === idx ? { ...x, productName: e.target.value } : x))
                          )
                        }
                        placeholder="Producto *"
                        className="col-span-2 sm:col-span-5 h-8 px-2.5 rounded-lg border border-zinc-200 bg-white text-zinc-900"
                      />
                      <input
                        type="text"
                        value={it.artistOrLine}
                        onChange={e =>
                          setDraftItems(prev =>
                            prev.map((x, i) => (i === idx ? { ...x, artistOrLine: e.target.value } : x))
                          )
                        }
                        placeholder="Artista / Tema"
                        className="sm:col-span-4 h-8 px-2.5 rounded-lg border border-zinc-200 bg-white text-zinc-900"
                      />
                      <input
                        type="text"
                        value={it.variantName}
                        onChange={e =>
                          setDraftItems(prev =>
                            prev.map((x, i) => (i === idx ? { ...x, variantName: e.target.value } : x))
                          )
                        }
                        placeholder="Color / Variante"
                        className="sm:col-span-3 h-8 px-2.5 rounded-lg border border-zinc-200 bg-white text-zinc-900"
                      />
                      <select
                        value={it.size}
                        onChange={e =>
                          setDraftItems(prev =>
                            prev.map((x, i) => (i === idx ? { ...x, size: e.target.value } : x))
                          )
                        }
                        className="sm:col-span-3 h-8 px-2 rounded-lg border border-zinc-200 bg-white text-zinc-900"
                      >
                        {[...ALL_GARMENT_SIZES, 'Única'].map(sz => (
                          <option key={sz} value={sz}>Talla {sz}</option>
                        ))}
                      </select>
                      <select
                        value={it.gender}
                        onChange={e =>
                          setDraftItems(prev =>
                            prev.map((x, i) => (i === idx ? { ...x, gender: e.target.value } : x))
                          )
                        }
                        className="sm:col-span-3 h-8 px-2 rounded-lg border border-zinc-200 bg-white text-zinc-900"
                      >
                        {GARMENT_GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                      <input
                        type="number"
                        min="1"
                        value={it.qty}
                        onChange={e =>
                          setDraftItems(prev =>
                            prev.map((x, i) => (i === idx ? { ...x, qty: Math.max(1, Number(e.target.value) || 1) } : x))
                          )
                        }
                        title="Cantidad"
                        className="sm:col-span-2 h-8 px-2 rounded-lg border border-zinc-200 bg-white font-mono text-zinc-900"
                      />
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={it.unitPrice}
                        onChange={e =>
                          setDraftItems(prev =>
                            prev.map((x, i) => (i === idx ? { ...x, unitPrice: Math.max(0, Number(e.target.value) || 0) } : x))
                          )
                        }
                        placeholder="Precio"
                        className="sm:col-span-3 h-8 px-2 rounded-lg border border-zinc-200 bg-white font-mono text-zinc-900"
                      />
                      <div className="sm:col-span-1 flex justify-end">
                        <button
                          type="button"
                          disabled={draftItems.length <= 1}
                          onClick={() => setDraftItems(prev => prev.filter((_, i) => i !== idx))}
                          className="h-8 w-8 rounded-lg border border-zinc-200 bg-white hover:bg-rose-50 text-zinc-500 hover:text-rose-600 disabled:opacity-30 inline-flex items-center justify-center cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs pt-2 border-t border-zinc-200">
              <label className="space-y-1">
                <span className="text-zinc-600">Estado Pago</span>
                <select
                  value={customerForm.paymentStatus}
                  onChange={e => setCustomerForm(c => ({ ...c, paymentStatus: e.target.value }))}
                  className="w-full h-9 px-2 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900"
                >
                  {PAYMENT_STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
                </select>
              </label>

              <label className="space-y-1">
                <span className="text-zinc-600">Estado Envío</span>
                <select
                  value={customerForm.shippingStatus}
                  onChange={e => setCustomerForm(c => ({ ...c, shippingStatus: e.target.value }))}
                  className="w-full h-9 px-2 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900"
                >
                  {SHIPPING_STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
                </select>
              </label>

              <label className="space-y-1">
                <span className="text-zinc-600">Transportadora</span>
                <select
                  value={customerForm.carrier}
                  onChange={e => setCustomerForm(c => ({ ...c, carrier: e.target.value }))}
                  className="w-full h-9 px-2 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900"
                >
                  {CARRIERS.map(cr => <option key={cr} value={cr}>{cr}</option>)}
                </select>
              </label>

              <label className="space-y-1">
                <span className="text-zinc-600">Descuento (COP)</span>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={customerForm.discount}
                  onChange={e => setCustomerForm(c => ({ ...c, discount: Math.max(0, Number(e.target.value) || 0) }))}
                  className="w-full h-9 px-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 font-mono"
                />
              </label>

              <label className="space-y-1 col-span-2">
                <span className="text-zinc-600">Número de guía (opcional)</span>
                <input
                  value={customerForm.trackingNumber}
                  onChange={e => setCustomerForm(c => ({ ...c, trackingNumber: e.target.value }))}
                  placeholder="Ej: 700123456789"
                  className="w-full h-9 px-3 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 font-mono"
                />
              </label>

              <label className="space-y-1 col-span-2">
                <span className="text-zinc-600">Notas / Personalización</span>
                <input
                  value={customerForm.notes}
                  onChange={e => setCustomerForm(c => ({ ...c, notes: e.target.value }))}
                  placeholder="Detalles especiales del pedido..."
                  className="w-full h-9 px-3 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900"
                />
              </label>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-200">
              <div className="text-xs">
                <span className="text-zinc-500">Total del pedido: </span>
                <strong className="text-base font-mono text-zinc-900">{formatCOP(draftTotal)}</strong>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setOrderModalOpen(false)}
                  className="h-9 px-4 rounded-xl border border-zinc-200 bg-white text-xs font-semibold text-zinc-700 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-9 px-5 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 text-xs font-semibold cursor-pointer"
                >
                  {editingOrderId ? 'Guardar cambios' : 'Crear pedido aislado'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
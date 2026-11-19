import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { Product, ProductVariant, Order, OrderItem } from '../types';
import { apiRequest } from '../api';
import { sanitizeCatalogRecord, sanitizeOrderRecord, isOrderActive, getPaidAmount, getPendingAmount, generateUUIDv4, saveStoredCedula } from '../utils/helpers';
import { DEFAULT_ADMIN_USER, ADMIN_SESSION_KEY, OFFICIAL_CATALOG_FALLBACK, ALL_GARMENT_SIZES } from '../utils/constants';

interface AdminContextProps {
  isAdmin: boolean;
  isDataReady: boolean;
  isSavingData: boolean;
  dataError: string;
  neonStatus: string;
  neonLastSync: string | null;
  adminToken: string;
  loginError: string;

  catalog: Product[];
  setCatalog: React.Dispatch<React.SetStateAction<Product[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  boughtSupplies: Record<string, number>;
  setBoughtSupplies: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  madeItems: Record<string, number>;
  setMadeItems: React.Dispatch<React.SetStateAction<Record<string, number>>>;

  originHub: string;
  setOriginHub: React.Dispatch<React.SetStateAction<string>>;
  defaultCarrier: string;
  setDefaultCarrier: React.Dispatch<React.SetStateAction<string>>;
  comboDiscountValue: number;
  setComboDiscountValue: React.Dispatch<React.SetStateAction<number>>;
  brandName: string;
  setBrandName: React.Dispatch<React.SetStateAction<string>>;
  brandLogoUrl: string;
  setBrandLogoUrl: React.Dispatch<React.SetStateAction<string>>;
  collectionName: string;
  setCollectionName: React.Dispatch<React.SetStateAction<string>>;
  googleMapsApiKey: string;
  setGoogleMapsApiKey: React.Dispatch<React.SetStateAction<string>>;
  theme: string;
  setTheme: React.Dispatch<React.SetStateAction<string>>;
  customTheme: any;
  setCustomTheme: React.Dispatch<React.SetStateAction<any>>;
  adminConfig: any;
  setAdminConfig: React.Dispatch<React.SetStateAction<any>>;

  metrics: any;
  shoppingNeeds: any;
  productionMatrix: any;

  handleAdminLoginSubmit: (username: string, pass: string, remember: boolean) => Promise<void>;
  handleAdminLogout: () => void;
  handleInitNeonTables: () => Promise<void>;
  handlePushAllToNeon: () => Promise<void>;
  handlePullFromNeon: () => Promise<void>;
  executeNeonQuery: (query: string) => Promise<any>;

  handleUpdateOrderPayment: (orderId: string, newPayStatus: string) => void;
  handleUpdateOrderShipping: (orderId: string, newShipStatus: string) => void;
  handleUpdateOrderField: (orderId: string, field: string, value: any) => void;
  handleRegenerateOrderUUID: (orderId: string) => void;
  handleToggleItemPacked: (orderId: string, itemIdx: number) => void;
  saveNewOrder: (customer: any, items: OrderItem[], discount: number, total: number) => void;
  updateExistingOrder: (orderId: string, customer: any, items: OrderItem[], discount: number, total: number) => void;
  deleteOrder: (orderId: string) => void;

  toast: { message: string; type: string; id: number } | null;
  notify: (message: string, type?: string) => void;
}

const AdminContext = createContext<AdminContextProps | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDataReady, setIsDataReady] = useState(false);
  const [isSavingData, setIsSavingData] = useState(false);
  const [dataError, setDataError] = useState('');
  const [neonStatus, setNeonStatus] = useState('connecting');
  const [neonLastSync, setNeonLastSync] = useState<string | null>(null);
  const [adminToken, setAdminToken] = useState(() => {
    try { return localStorage.getItem(ADMIN_SESSION_KEY) || sessionStorage.getItem(ADMIN_SESSION_KEY) || ''; } catch { return ''; }
  });
  const [loginError, setLoginError] = useState('');

  const [catalog, setCatalog] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [boughtSupplies, setBoughtSupplies] = useState<Record<string, number>>({});
  const [madeItems, setMadeItems] = useState<Record<string, number>>({});

  const [originHub, setOriginHub] = useState('Medellín');
  const [defaultCarrier, setDefaultCarrier] = useState('Interrapidísimo');
  const [comboDiscountValue, setComboDiscountValue] = useState(5000);
  const [brandName, setBrandName] = useState('MyFanBox');
  const [brandLogoUrl, setBrandLogoUrl] = useState('');
  const [collectionName, setCollectionName] = useState('Viajando por el Mundo — Karol G');
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState('');
  const [theme, setTheme] = useState('medium-dark');
  const [customTheme, setCustomTheme] = useState({ background: '#141920', surface: '#1C232D', surfaceAlt: '#242D3A', hover: '#2E3A4B', hoverText: '#F8FAFC', selectedBg: '#1F3A3D', selectedText: '#E6FFFA', text: '#F1F5F9', muted: '#94A3B8', primary: '#2A7B6F', primaryText: '#FFFFFF', border: '#323E4F' });
  const [adminConfig, setAdminConfig] = useState({ username: DEFAULT_ADMIN_USER, hideDefaultHint: true });

  const [toast, setToast] = useState<{ message: string; type: string; id: number } | null>(null);
  const notify = useCallback((message: string, type = 'default') => { setToast({ message, type, id: Date.now() }); }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const applyDatabaseSnapshot = useCallback((payload: any) => {
    setCatalog(Array.isArray(payload.catalog) ? payload.catalog.map((c: any, idx: number) => sanitizeCatalogRecord(c, idx)) : []);
    const settingsCedulas = payload.settings?.orderCedulas || {};
    setOrders(Array.isArray(payload.orders) ? payload.orders.map((o: any, idx: number) => sanitizeOrderRecord(o, idx, settingsCedulas)) : []);
    setBoughtSupplies(payload.boughtSupplies || {});
    setMadeItems(payload.madeItems || {});
    setComboDiscountValue(Math.max(0, Number(payload.settings?.comboDiscountValue ?? 5000) || 0));
    setOriginHub(payload.settings?.originHub || 'Medellín');
    setDefaultCarrier(payload.settings?.defaultCarrier || 'Interrapidísimo');
    setBrandName(payload.settings?.brandName || 'MyFanBox');
    if (payload.settings?.brandLogoUrl) setBrandLogoUrl(payload.settings.brandLogoUrl);
    setCollectionName(payload.settings?.collectionName || 'Viajando por el Mundo — Karol G');
    setGoogleMapsApiKey(payload.settings?.googleMapsApiKey || '');
    if (payload.settings?.theme) setTheme(payload.settings.theme);
    if (payload.settings?.customTheme) setCustomTheme(prev => ({ ...prev, ...payload.settings.customTheme }));
    if (payload.adminConfig) setAdminConfig(payload.adminConfig);
    setIsDataReady(true);
    setDataError('');
  }, []);

  const loadDatabaseSnapshot = useCallback(async (token = adminToken) => {
    const payload = await apiRequest('/api/admin/bootstrap', token);
    applyDatabaseSnapshot(payload);
    setNeonStatus('connected');
    setNeonLastSync(new Date().toLocaleTimeString());
    return payload;
  }, [adminToken, applyDatabaseSnapshot]);

  useEffect(() => {
    let cancelled = false;
    const bootstrap = async () => {
      try {
        await apiRequest('/api/health');
        if (cancelled) return;
        setNeonStatus('connected');
      } catch (err: any) {
        if (cancelled) return;
        setNeonStatus('error');
        setDataError(err.message);
        return;
      }
      if (!adminToken) return;
      try {
        await loadDatabaseSnapshot(adminToken);
        if (cancelled) return;
        setIsAdmin(true);
      } catch (err: any) {
        if (cancelled) return;
        setAdminToken('');
        setIsAdmin(false);
        if (err.status !== 401) { setDataError(err.message); setNeonStatus('error'); }
      }
    };
    bootstrap();
    return () => { cancelled = true; };
  }, [adminToken, loadDatabaseSnapshot]);

  useEffect(() => {
    if (!isAdmin || !isDataReady || !adminToken) return undefined;
    const timer = setTimeout(async () => {
      setIsSavingData(true);
      try {
        await apiRequest('/api/admin/data', adminToken, {
          method: 'PUT',
          body: JSON.stringify({
            catalog, orders, boughtSupplies, madeItems,
            settings: { comboDiscountValue, originHub, defaultCarrier, brandName, brandLogoUrl, collectionName, googleMapsApiKey, theme, customTheme, orderCedulas: orders.reduce((acc: any, o: any) => { if (o?.cedula) { if (o.id) acc[o.id] = String(o.cedula); if (o.uuid) acc[String(o.uuid).toLowerCase()] = String(o.cedula); } return acc; }, {}) }
          })
        });
        setNeonStatus('connected');
        setNeonLastSync(new Date().toLocaleTimeString());
        setDataError('');
      } catch (err: any) {
        setNeonStatus('error');
        setDataError(err.message);
        notify(err.message, 'error');
      } finally {
        setIsSavingData(false);
      }
    }, 650);
    return () => clearTimeout(timer);
  }, [isAdmin, isDataReady, adminToken, catalog, orders, boughtSupplies, madeItems, comboDiscountValue, originHub, defaultCarrier, brandName, brandLogoUrl, collectionName, googleMapsApiKey, theme, customTheme, notify]);

  const handleAdminLoginSubmit = async (username: string, pass: string, remember: boolean) => {
    setLoginError('');
    try {
      const result = await apiRequest('/api/admin/login', null, { method: 'POST', body: JSON.stringify({ username, password: pass, remember }) });
      if (!result.token) throw new Error('Error de sesión');
      setAdminToken(result.token);
      try { sessionStorage.setItem(ADMIN_SESSION_KEY, result.token); if (remember) localStorage.setItem(ADMIN_SESSION_KEY, result.token); else localStorage.removeItem(ADMIN_SESSION_KEY); } catch {}
      await loadDatabaseSnapshot(result.token);
      setIsAdmin(true);
      notify('Sesión iniciada.');
    } catch (err: any) {
      setLoginError(err.message);
      setIsAdmin(false);
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    setIsDataReady(false);
    setAdminToken('');
    try { sessionStorage.removeItem(ADMIN_SESSION_KEY); localStorage.removeItem(ADMIN_SESSION_KEY); } catch {}
  };

  const handleInitNeonTables = async () => {
    try {
      setNeonStatus('connecting');
      await apiRequest('/api/admin/init', adminToken, { method: 'POST', body: JSON.stringify({}) });
      await loadDatabaseSnapshot(adminToken);
      notify('Esquema verificado. NeonDB está conectado.');
    } catch (err: any) {
      setNeonStatus('error');
      notify(err.message, 'error');
    }
  };

  const handlePushAllToNeon = async () => {
    if (!isAdmin || !isDataReady) return;
    setIsSavingData(true);
    try {
      await apiRequest('/api/admin/data', adminToken, {
        method: 'PUT',
        body: JSON.stringify({ catalog, orders, boughtSupplies, madeItems, settings: { comboDiscountValue, originHub, defaultCarrier, brandName, brandLogoUrl, collectionName, googleMapsApiKey, theme, customTheme, orderCedulas: orders.reduce((acc: any, o: any) => { if (o?.cedula) { if (o.id) acc[o.id] = String(o.cedula); if (o.uuid) acc[String(o.uuid).toLowerCase()] = String(o.cedula); } return acc; }, {}) } })
      });
      setNeonStatus('connected');
      setNeonLastSync(new Date().toLocaleTimeString());
      notify('Datos guardados en NeonDB.');
    } catch (err: any) {
      setNeonStatus('error');
      notify(err.message, 'error');
    } finally {
      setIsSavingData(false);
    }
  };

  const handlePullFromNeon = async () => {
    try {
      setNeonStatus('connecting');
      await loadDatabaseSnapshot(adminToken);
      notify('Datos actualizados desde NeonDB.');
    } catch (err: any) {
      setNeonStatus('error');
      notify(err.message, 'error');
    }
  };

  const executeNeonQuery = async (query: string) => {
    try {
      const result = await apiRequest('/api/admin/sql', adminToken, { method: 'POST', body: JSON.stringify({ query }) });
      setNeonStatus('connected');
      setNeonLastSync(new Date().toLocaleTimeString());
      return { ok: true, data: { rows: result.rows || [] } };
    } catch (err: any) {
      setNeonStatus('error');
      return { ok: false, error: err.message };
    }
  };

  const metrics = useMemo(() => {
    const activeOrders = orders.filter(isOrderActive);
    return {
      activeOrdersCount: activeOrders.length,
      cancelledOrders: orders.filter(o => o.paymentStatus === 'Cancelado').length,
      refundedOrders: orders.filter(o => o.paymentStatus === 'Reembolsado').length,
      grossRevenue: activeOrders.reduce((acc, o) => acc + o.total, 0),
      collectedCash: activeOrders.reduce((acc, o) => acc + getPaidAmount(o), 0),
      pendingToCollect: activeOrders.reduce((acc, o) => acc + getPendingAmount(o), 0),
      countPendiente: orders.filter(o => o.paymentStatus === 'Pendiente').length,
      countSemi: orders.filter(o => o.paymentStatus === 'Semi-pagado (50%)').length,
      countPagado: orders.filter(o => o.paymentStatus === 'Pagado').length,
      countPorPreparar: activeOrders.filter(o => o.shippingStatus === 'Por preparar').length,
      countPorEnviar: activeOrders.filter(o => o.shippingStatus === 'Por enviar').length,
      countEnviado: activeOrders.filter(o => o.shippingStatus === 'Enviado').length,
      shipWithDebtCount: activeOrders.filter(o => (o.shippingStatus === 'Por enviar' || o.shippingStatus === 'Enviado') && getPendingAmount(o) > 0).length,
      totalProductionCost: activeOrders.reduce((sum, o) => sum + o.items.reduce((iSum, it) => { const prod = catalog.find(c => c.id === it.productId); const v = prod?.variants.find(vx => vx.id === it.variantId || vx.name === it.variantName); return iSum + ((Number(prod?.unitCost) || 0) + (Number(v?.extraCost) || 0)) * it.qty; }, 0), 0),
    };
  }, [orders, catalog]);

  const shoppingNeeds = useMemo(() => {
    const map: Record<string, any> = {};
    const ensureRow = (blankName: string, sizeOrSpec: string, categoryLabel: string) => {
      const key = `${blankName}___${sizeOrSpec}`;
      if (!map[key]) map[key] = { key, blankName, sizeOrSpec, categoryLabel, required: 0, bought: Number(boughtSupplies[key]) || 0 };
      return map[key];
    };
    (catalog.length ? catalog : OFFICIAL_CATALOG_FALLBACK).forEach(p => {
      const isAcc = p.category.toLowerCase().includes('accesorio');
      const szs = isAcc ? (p.sizes.length ? p.sizes : ['Única']) : ALL_GARMENT_SIZES;
      const variants: Partial<ProductVariant>[] = p.variants.length ? p.variants : [{}];
      variants.forEach(v => szs.forEach(sz => ensureRow(v.blankOverride || p.blankName, sz, isAcc ? 'Base Accesorio' : 'Prenda en Blanco')));
    });
    orders.filter(isOrderActive).forEach(o => o.items.forEach(it => {
      const p = catalog.find(c => c.id === it.productId);
      const v: Partial<ProductVariant> = p?.variants.find(vx => vx.id === it.variantId || vx.name === it.variantName) || p?.variants[0] || {};
      const isAcc = p?.category.toLowerCase().includes('accesorio');
      const r = ensureRow(v.blankOverride || p?.blankName || 'Prenda Base', isAcc ? 'Única' : (it.size || 'M'), isAcc ? 'Base Accesorio' : 'Prenda en Blanco');
      r.required += it.qty;
    }));
    const rows = Object.values(map).map(r => ({ ...r, missing: Math.max(0, r.required - r.bought) }));
    return { rows, totalMissingToBuy: rows.reduce((acc, r) => acc + r.missing, 0) };
  }, [orders, catalog, boughtSupplies]);

  const productionMatrix = useMemo(() => {
    const map: Record<string, any> = {};
    (catalog.length ? catalog : OFFICIAL_CATALOG_FALLBACK).forEach(p => {
      const isAcc = p.category.toLowerCase().includes('accesorio');
      const szs = isAcc ? (p.sizes.length ? p.sizes : ['Única']) : ALL_GARMENT_SIZES;
      (p.variants.length ? p.variants : [{ id: 'v-std', name: 'Estándar' }]).forEach(v => szs.forEach(sz => {
        const key = `${p.id}|||${v.id || v.name}|||${sz}`;
        map[key] = { key, productName: p.name, variantName: v.name || 'Estándar', size: sz, orderedQty: 0, made: Number(madeItems[key]) || 0 };
      }));
    });
    orders.filter(isOrderActive).forEach(o => o.items.forEach(it => {
      const p = catalog.find(c => c.id === it.productId);
      const v = p?.variants.find(vx => vx.id === it.variantId || vx.name === it.variantName) || p?.variants[0];
      const key = `${p?.id || it.productId}|||${v?.id || it.variantId || it.variantName}|||${it.size || 'M'}`;
      if (!map[key]) map[key] = { key, productName: it.productName, variantName: it.variantName, size: it.size, orderedQty: 0, made: Number(madeItems[key]) || 0 };
      map[key].orderedQty += it.qty;
    }));
    const rows = Object.values(map).map(r => ({ ...r, missing: Math.max(0, r.orderedQty - r.made) }));
    return { rows, totalMissingToMake: rows.reduce((acc, r) => acc + r.missing, 0) };
  }, [orders, catalog, madeItems]);

  const handleUpdateOrderPayment = (id: string, st: string) => { setOrders(prev => prev.map(o => o.id === id ? { ...o, paymentStatus: st } : o)); notify(`Pago: ${st}`); };
  const handleUpdateOrderShipping = (id: string, st: string) => { setOrders(prev => prev.map(o => o.id === id ? { ...o, shippingStatus: st, items: (st === 'Por enviar' || st === 'Enviado') ? o.items.map(it => ({ ...it, packed: true })) : o.items } : o)); notify(`Envío: ${st}`); };
  const handleUpdateOrderField = (id: string, f: string, val: any) => { setOrders(prev => prev.map(o => o.id === id ? { ...o, [f]: val, shippingStatus: (f === 'trackingNumber' && val.trim() !== '' && o.shippingStatus !== 'Enviado') ? 'Enviado' : o.shippingStatus } : o)); };
  const handleRegenerateOrderUUID = (id: string) => { setOrders(prev => prev.map(o => o.id === id ? { ...o, uuid: generateUUIDv4() } : o)); notify('UUID regenerado'); };
  const handleToggleItemPacked = (id: string, idx: number) => { setOrders(prev => prev.map(o => o.id === id ? { ...o, items: o.items.map((it, i) => i === idx ? { ...it, packed: !it.packed } : it) } : o)); };
  const deleteOrder = (id: string) => { setOrders(prev => prev.filter(o => o.id !== id)); notify('Pedido eliminado'); };
  const saveNewOrder = (cust: any, items: OrderItem[], discount: number, total: number) => {
    const n = orders.reduce((m, o) => { const num = parseInt((o.id || '').replace(/\D/g, ''), 10); return !isNaN(num) && num > m ? num : m; }, 1000);
    const order = { id: `MFB-${n + 1}`, uuid: generateUUIDv4(), ...cust, items, discount, total, createdAt: new Date().toISOString().split('T')[0] };
    saveStoredCedula(order.id, order.uuid, cust.cedula);
    setOrders(prev => [order as Order, ...prev]);
    notify(`Pedido ${order.id} creado`);
  };
  const updateExistingOrder = (id: string, cust: any, items: OrderItem[], discount: number, total: number) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== id) return o;
      saveStoredCedula(o.id, o.uuid, cust.cedula);
      return { ...o, ...cust, items, discount, total };
    }));
    notify(`Pedido ${id} actualizado`);
  };

  return (
    <AdminContext.Provider value={{
      isAdmin, isDataReady, isSavingData, dataError, neonStatus, neonLastSync, adminToken, loginError,
      catalog, setCatalog, orders, setOrders, boughtSupplies, setBoughtSupplies, madeItems, setMadeItems,
      originHub, setOriginHub, defaultCarrier, setDefaultCarrier, comboDiscountValue, setComboDiscountValue, brandName, setBrandName, brandLogoUrl, setBrandLogoUrl, collectionName, setCollectionName, googleMapsApiKey, setGoogleMapsApiKey, theme, setTheme, customTheme, setCustomTheme, adminConfig, setAdminConfig,
      metrics, shoppingNeeds, productionMatrix,
      handleAdminLoginSubmit, handleAdminLogout, handleInitNeonTables, handlePushAllToNeon, handlePullFromNeon, executeNeonQuery,
      handleUpdateOrderPayment, handleUpdateOrderShipping, handleUpdateOrderField, handleRegenerateOrderUUID, handleToggleItemPacked, saveNewOrder, updateExistingOrder, deleteOrder,
      toast, notify
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) throw new Error('useAdmin must be used within an AdminProvider');
  return context;
};
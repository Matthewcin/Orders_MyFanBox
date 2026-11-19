import React, { useState, useEffect } from 'react';
import { X, MapPin } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import InteractiveManualPinMap from '../InteractiveManualPinMap';
import { Order, OrderItem } from '../../types';
import {
  PAYMENT_STATUSES,
  SHIPPING_STATUSES,
  CARRIERS,
  GARMENT_GENDERS,
  ALL_GARMENT_SIZES
} from '../../utils/constants';
import {
  formatCOP,
  inferColombianAddressMetadata,
  inferMetadataFromCoordinates,
  reverseGeocodeFromCoordinates,
  parseCoordsFromInput
} from '../../utils/helpers';

interface OrderModalProps {
  open: boolean;
  editingOrder: Order | null;
  onClose: () => void;
}

export default function OrderModal({ open, editingOrder, onClose }: OrderModalProps) {
  const {
    catalog,
    defaultCarrier,
    comboDiscountValue,
    googleMapsApiKey,
    saveNewOrder,
    updateExistingOrder,
    notify
  } = useAdmin();

  const [draftCustomer, setDraftCustomer] = useState<any>({
    customerName: '',
    cedula: '',
    instagram: '',
    phone: '',
    city: 'Medellín',
    neighborhood: 'El Poblado',
    address: '',
    postalCode: '050021',
    formattedAddress: '',
    lat: 6.20892,
    lng: -75.56781,
    manualPin: false,
    addressVerified: false,
    carrier: 'Interrapidísimo',
    trackingNumber: '',
    paymentStatus: 'Semi-pagado (50%)',
    shippingStatus: 'Por preparar',
    notes: ''
  });

  const [modalCoordPaste, setModalCoordPaste] = useState('');
  const [draftItems, setDraftItems] = useState<OrderItem[]>([]);
  const [selProdId, setSelProdId] = useState('');
  const [selVarId, setSelVarId] = useState('');
  const [selSize, setSelSize] = useState('M');
  const [selGender, setSelGender] = useState('Femenino');
  const [selQty, setSelQty] = useState<number | string>(1);
  const [applyComboDiscount, setApplyComboDiscount] = useState(true);

  useEffect(() => {
    if (!open) return;
    setModalCoordPaste('');
    if (editingOrder) {
      const fallback = inferColombianAddressMetadata(editingOrder.city, editingOrder.address);
      setDraftCustomer({
        customerName: editingOrder.customerName,
        cedula: editingOrder.cedula || '',
        instagram: editingOrder.instagram || '',
        phone: editingOrder.phone || '',
        city: editingOrder.city || 'Medellín',
        neighborhood: editingOrder.neighborhood || fallback.neighborhood,
        address: editingOrder.address || '',
        postalCode: editingOrder.postalCode || fallback.postalCode,
        formattedAddress: editingOrder.formattedAddress || '',
        lat: typeof editingOrder.lat === 'number' ? editingOrder.lat : fallback.lat,
        lng: typeof editingOrder.lng === 'number' ? editingOrder.lng : fallback.lng,
        manualPin: Boolean(editingOrder.manualPin),
        addressVerified: Boolean(editingOrder.addressVerified || editingOrder.manualPin),
        carrier: editingOrder.carrier || defaultCarrier,
        trackingNumber: editingOrder.trackingNumber || '',
        paymentStatus: editingOrder.paymentStatus,
        shippingStatus: editingOrder.shippingStatus,
        notes: editingOrder.notes || ''
      });
      setDraftItems(editingOrder.items.map(i => ({ ...i, gender: i.gender || 'Sin especificar' })));
      setApplyComboDiscount((editingOrder.discount || 0) > 0);
    } else {
      setDraftCustomer({
        customerName: '',
        cedula: '',
        instagram: '',
        phone: '',
        city: 'Medellín',
        neighborhood: 'El Poblado',
        address: '',
        postalCode: '050021',
        formattedAddress: '',
        lat: 6.20892,
        lng: -75.56781,
        manualPin: false,
        addressVerified: false,
        carrier: defaultCarrier,
        trackingNumber: '',
        paymentStatus: 'Semi-pagado (50%)',
        shippingStatus: 'Por preparar',
        notes: ''
      });
      setDraftItems([]);
      setApplyComboDiscount(true);
    }

    const defaultProd = catalog[0];
    if (defaultProd) {
      setSelProdId(defaultProd.id);
      setSelVarId(defaultProd.variants[0]?.id || '');
      setSelSize(defaultProd.sizes[0] || 'M');
    } else {
      setSelProdId('');
      setSelVarId('');
      setSelSize('M');
    }
    setSelGender('Femenino');
    setSelQty(1);
  }, [open, editingOrder, catalog, defaultCarrier]);

  if (!open) return null;

  const handleAddDraftItem = () => {
    const prod = catalog.find(c => c.id === selProdId);
    if (!prod) return;
    const variant = prod.variants.find(v => v.id === selVarId) || prod.variants[0];
    const unitPrice = prod.basePrice + (variant.extraPrice || 0);
    setDraftItems(prev => [
      ...prev,
      {
        id: `dit-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        productId: prod.id,
        productName: prod.name,
        variantId: variant.id,
        variantName: variant.name,
        size: selSize,
        gender: selGender || 'Sin especificar',
        qty: Math.max(1, Number(selQty) || 1),
        unitPrice,
        packed: false
      }
    ]);
    setSelQty(1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftCustomer.customerName.trim()) {
      notify('Escribe el nombre de la clienta o cliente', 'warning');
      return;
    }

    const cleanCedula = (draftCustomer.cedula || '').trim();
    let finalItems = [...draftItems];
    if (finalItems.length === 0) {
      const prod = catalog.find(c => c.id === selProdId) || catalog[0];
      if (!prod || !Array.isArray(prod.variants) || prod.variants.length === 0) {
        notify('Primero agrega al menos un producto al catálogo o selecciona un producto válido.', 'warning');
        return;
      }
      const variant = prod.variants.find(v => v.id === selVarId) || prod.variants[0];
      finalItems.push({
        id: `dit-${Date.now()}`,
        productId: prod.id,
        productName: prod.name,
        variantId: variant.id,
        variantName: variant.name,
        size: selSize,
        gender: selGender || 'Sin especificar',
        qty: Math.max(1, Number(selQty) || 1),
        unitPrice: prod.basePrice + (variant.extraPrice || 0),
        packed: false
      });
    }

    finalItems = finalItems.map(it => ({
      ...it,
      customerCedula: cleanCedula,
      manualPin: Boolean(draftCustomer.manualPin)
    }));

    const subtotal = finalItems.reduce((acc, it) => acc + it.unitPrice * it.qty, 0);
    const hasGarment = finalItems.some(it => catalog.find(c => c.id === it.productId)?.category === 'Prenda');
    const hasKeychain = finalItems.some(it => it.productName.toLowerCase().includes('llavero'));
    const discount = hasGarment && hasKeychain && applyComboDiscount ? comboDiscountValue : 0;
    const total = Math.max(0, subtotal - discount);

    const payloadCustomer = { ...draftCustomer, cedula: cleanCedula };
    if (editingOrder) {
      updateExistingOrder(editingOrder.id, payloadCustomer, finalItems, discount, total);
    } else {
      saveNewOrder(payloadCustomer, finalItems, discount, total);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/50 backdrop-blur-[2px]">
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-zinc-200 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-xl overflow-hidden"
      >
        <div className="px-5 py-3.5 border-b border-zinc-200 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">
              {editingOrder ? `Editar Pedido ${editingOrder.id}` : 'Nuevo Pedido MyFanBox'}
            </h2>
            <p className="text-xs text-zinc-500">
              Corrobora la dirección en el mapa para autocompletar barrio, código postal y coordenadas exactas.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-5 text-xs">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                1. Datos del Cliente y Ubicación en Mapa
              </h3>
              <span
                className={`px-2 py-0.5 rounded border text-[10px] font-semibold ${
                  draftCustomer.addressVerified
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}
              >
                {draftCustomer.addressVerified ? '✓ Dirección Corroborada en Mapa' : '⚠️ Pendiente corroborar dirección'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block font-medium text-zinc-700 mb-1">Nombre Cliente *</label>
                <input
                  type="text"
                  required
                  value={draftCustomer.customerName}
                  onChange={(e) => setDraftCustomer({ ...draftCustomer, customerName: e.target.value })}
                  placeholder="Ej: Valentina Gómez"
                  className="w-full h-9 px-3 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900"
                />
              </div>
              <div>
                <label className="block font-medium text-zinc-700 mb-1">Cédula / Documento</label>
                <input
                  type="text"
                  value={draftCustomer.cedula || ''}
                  onChange={(e) => setDraftCustomer({ ...draftCustomer, cedula: e.target.value })}
                  placeholder="Ej: 1037645890"
                  className="w-full h-9 px-3 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 font-mono"
                />
              </div>
              <div>
                <label className="block font-medium text-zinc-700 mb-1">Instagram (@)</label>
                <input
                  type="text"
                  value={draftCustomer.instagram}
                  onChange={(e) => setDraftCustomer({ ...draftCustomer, instagram: e.target.value })}
                  placeholder="@valengomez"
                  className="w-full h-9 px-3 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900"
                />
              </div>
              <div>
                <label className="block font-medium text-zinc-700 mb-1">WhatsApp *</label>
                <input
                  type="text"
                  value={draftCustomer.phone}
                  onChange={(e) => setDraftCustomer({ ...draftCustomer, phone: e.target.value })}
                  placeholder="+57 300 123 4567"
                  autoComplete="tel"
                  className="w-full h-9 px-3 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 font-mono"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] font-semibold text-zinc-800 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Pin Manual o Coordenadas (Autocompleta Ciudad, Barrio y Código Postal)</span>
                </span>
                <span className="font-mono text-[11px] text-zinc-500">
                  📍 {draftCustomer.lat}, {draftCustomer.lng}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  value={modalCoordPaste}
                  onChange={async (e) => {
                    const val = e.target.value;
                    setModalCoordPaste(val);
                    const parsed = parseCoordsFromInput(val);
                    if (parsed) {
                      const quick = inferMetadataFromCoordinates(parsed.lat, parsed.lng);
                      setDraftCustomer((prev: any) => ({
                        ...prev,
                        lat: parsed.lat,
                        lng: parsed.lng,
                        city: quick.city,
                        neighborhood: quick.neighborhood,
                        postalCode: quick.postalCode,
                        address: prev.address || quick.streetAddress,
                        manualPin: true,
                        addressVerified: true
                      }));
                      const rev = await reverseGeocodeFromCoordinates(parsed.lat, parsed.lng, googleMapsApiKey);
                      setDraftCustomer((prev: any) => ({
                        ...prev,
                        lat: rev.lat,
                        lng: rev.lng,
                        city: rev.city,
                        neighborhood: rev.neighborhood,
                        postalCode: rev.postalCode,
                        address: rev.streetAddress || prev.address,
                        formattedAddress: rev.formattedAddress,
                        manualPin: true,
                        addressVerified: true
                      }));
                    }
                  }}
                  placeholder="Pegar link Google Maps o lat, lng..."
                  className="h-8 px-2.5 bg-white border border-zinc-200 rounded-lg font-mono text-[11px]"
                />
                <input
                  type="number"
                  step="0.0001"
                  value={draftCustomer.lat}
                  onChange={async (e) => {
                    const newLat = parseFloat(e.target.value) || 0;
                    const quick = inferMetadataFromCoordinates(newLat, draftCustomer.lng);
                    setDraftCustomer((prev: any) => ({
                      ...prev,
                      lat: newLat,
                      city: quick.city,
                      neighborhood: quick.neighborhood,
                      postalCode: quick.postalCode,
                      manualPin: true,
                      addressVerified: true
                    }));
                    const rev = await reverseGeocodeFromCoordinates(newLat, draftCustomer.lng, googleMapsApiKey);
                    setDraftCustomer((prev: any) => ({
                      ...prev,
                      city: rev.city,
                      neighborhood: rev.neighborhood,
                      postalCode: rev.postalCode,
                      address: rev.streetAddress || prev.address,
                      formattedAddress: rev.formattedAddress
                    }));
                  }}
                  placeholder="Latitud"
                  className="h-8 px-2.5 bg-white border border-zinc-200 rounded-lg font-mono text-[11px]"
                />
                <input
                  type="number"
                  step="0.0001"
                  value={draftCustomer.lng}
                  onChange={async (e) => {
                    const newLng = parseFloat(e.target.value) || 0;
                    const quick = inferMetadataFromCoordinates(draftCustomer.lat, newLng);
                    setDraftCustomer((prev: any) => ({
                      ...prev,
                      lng: newLng,
                      city: quick.city,
                      neighborhood: quick.neighborhood,
                      postalCode: quick.postalCode,
                      manualPin: true,
                      addressVerified: true
                    }));
                    const rev = await reverseGeocodeFromCoordinates(draftCustomer.lat, newLng, googleMapsApiKey);
                    setDraftCustomer((prev: any) => ({
                      ...prev,
                      city: rev.city,
                      neighborhood: rev.neighborhood,
                      postalCode: rev.postalCode,
                      address: rev.streetAddress || prev.address,
                      formattedAddress: rev.formattedAddress
                    }));
                  }}
                  placeholder="Longitud"
                  className="h-8 px-2.5 bg-white border border-zinc-200 rounded-lg font-mono text-[11px]"
                />
              </div>

              <InteractiveManualPinMap
                lat={draftCustomer.lat}
                lng={draftCustomer.lng}
                title={draftCustomer.customerName || 'Cliente MyFanBox'}
                subtitle={`${draftCustomer.address || ''}, ${draftCustomer.city}`}
                heightClass="h-52"
                onPinChange={async (newLat, newLng) => {
                  setModalCoordPaste(`${newLat}, ${newLng}`);
                  const quick = inferMetadataFromCoordinates(newLat, newLng);
                  setDraftCustomer((prev: any) => ({
                    ...prev,
                    lat: newLat,
                    lng: newLng,
                    city: quick.city,
                    neighborhood: quick.neighborhood,
                    postalCode: quick.postalCode,
                    address: prev.address || quick.streetAddress,
                    manualPin: true,
                    addressVerified: true
                  }));
                  const rev = await reverseGeocodeFromCoordinates(newLat, newLng, googleMapsApiKey);
                  setDraftCustomer((prev: any) => ({
                    ...prev,
                    lat: rev.lat,
                    lng: rev.lng,
                    city: rev.city,
                    neighborhood: rev.neighborhood,
                    postalCode: rev.postalCode,
                    address: rev.streetAddress,
                    formattedAddress: rev.formattedAddress,
                    manualPin: true,
                    addressVerified: true
                  }));
                }}
              />

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-1">
                <div className="sm:col-span-3 px-2.5 py-1.5 rounded-lg bg-white border border-zinc-200">
                  <span className="block text-[10px] text-zinc-400">Ciudad (Auto por Pin)</span>
                  <span className="font-semibold text-zinc-900">{draftCustomer.city || '—'}</span>
                </div>
                <div className="sm:col-span-3 px-2.5 py-1.5 rounded-lg bg-white border border-zinc-200">
                  <span className="block text-[10px] text-zinc-400">Barrio / Zona</span>
                  <span className="font-semibold text-zinc-900 truncate block">{draftCustomer.neighborhood || '—'}</span>
                </div>
                <div className="sm:col-span-2 px-2.5 py-1.5 rounded-lg bg-white border border-zinc-200">
                  <span className="block text-[10px] text-zinc-400">Código Postal</span>
                  <span className="font-mono font-bold text-sky-700">{draftCustomer.postalCode || '—'}</span>
                </div>
                <div className="sm:col-span-4">
                  <input
                    type="text"
                    value={draftCustomer.address}
                    onChange={(e) => setDraftCustomer({ ...draftCustomer, address: e.target.value })}
                    placeholder="Dirección / Apto / Casa"
                    className="w-full h-full min-h-[38px] px-2.5 bg-white border border-zinc-200 rounded-lg text-zinc-900 text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-200 space-y-3">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              2. Prendas del Catálogo Oficial
            </h3>
            <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
              <div className="sm:col-span-3">
                <label className="block text-[11px] text-zinc-500 mb-1">Referencia</label>
                <select
                  value={selProdId}
                  onChange={(e) => {
                    const pid = e.target.value;
                    const prod = catalog.find(c => c.id === pid) || catalog[0];
                    setSelProdId(pid);
                    setSelVarId(prod?.variants[0]?.id || '');
                    setSelSize(prod?.sizes[0] || 'M');
                  }}
                  className="w-full h-8 px-2 bg-white border border-zinc-200 rounded-lg"
                >
                  {catalog.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({formatCOP(p.basePrice)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-[11px] text-zinc-500 mb-1">Variante</label>
                <select
                  value={selVarId}
                  onChange={(e) => setSelVarId(e.target.value)}
                  className="w-full h-8 px-2 bg-white border border-zinc-200 rounded-lg"
                >
                  {(catalog.find(c => c.id === selProdId)?.variants || []).map(v => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] text-zinc-500 mb-1">Talla</label>
                <select
                  value={selSize}
                  onChange={(e) => setSelSize(e.target.value)}
                  className="w-full h-8 px-2 bg-white border border-zinc-200 rounded-lg font-semibold"
                >
                  {(() => {
                    const selProd = catalog.find(c => c.id === selProdId);
                    const isAcc =
                      selProd?.category?.toLowerCase().includes('accesorio') ||
                      selProd?.name?.toLowerCase().includes('llavero') ||
                      selProd?.name?.toLowerCase().includes('fanbox');
                    const sizeList = isAcc
                      ? (selProd?.sizes?.length ? selProd.sizes : ['Única'])
                      : Array.from(new Set([...ALL_GARMENT_SIZES, ...(selProd?.sizes || [])]));
                    return sizeList.map(sz => <option key={sz} value={sz}>{sz}</option>);
                  })()}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] text-zinc-500 mb-1">Corte / Género</label>
                <select
                  value={selGender}
                  onChange={(e) => setSelGender(e.target.value)}
                  className="w-full h-8 px-2 bg-white border border-zinc-200 rounded-lg font-medium"
                >
                  {GARMENT_GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              <div className="sm:col-span-2 flex items-center gap-1.5">
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={selQty}
                  onChange={(e) => setSelQty(e.target.value)}
                  className="w-14 h-8 px-2 text-center bg-white border border-zinc-200 rounded-lg font-semibold"
                />
                <button
                  type="button"
                  onClick={handleAddDraftItem}
                  className="h-8 px-3 rounded-lg bg-zinc-900 text-white font-medium hover:bg-zinc-800 shrink-0 cursor-pointer"
                >
                  + Añadir
                </button>
              </div>
            </div>

            {draftItems.length > 0 && (
              <div className="space-y-1.5">
                {draftItems.map((it, idx) => (
                  <div
                    key={it.id || idx}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-white border border-zinc-200"
                  >
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-semibold text-zinc-900">
                        {it.qty}× {it.productName}
                      </span>
                      <span className="text-zinc-500">· {it.variantName}</span>
                      <select
                        value={it.size || 'M'}
                        onChange={(e) => {
                          const newSize = e.target.value;
                          setDraftItems(prev => prev.map((row, rIdx) => (rIdx === idx ? { ...row, size: newSize } : row)));
                        }}
                        className="h-6 px-1.5 rounded bg-zinc-100 border border-zinc-200 text-[10px] font-semibold"
                      >
                        {[...ALL_GARMENT_SIZES, 'Única'].map(sz => (
                          <option key={sz} value={sz}>Talla {sz}</option>
                        ))}
                      </select>
                      <select
                        value={it.gender || 'Sin especificar'}
                        onChange={(e) => {
                          const newGender = e.target.value;
                          setDraftItems(prev => prev.map((row, rIdx) => (rIdx === idx ? { ...row, gender: newGender } : row)));
                        }}
                        className="h-6 px-1.5 rounded bg-zinc-50 border border-zinc-200 text-[10px] font-medium"
                      >
                        {GARMENT_GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold">{formatCOP(it.unitPrice * it.qty)}</span>
                      <button
                        type="button"
                        onClick={() => setDraftItems(prev => prev.filter((_, i) => i !== idx))}
                        className="text-zinc-400 hover:text-rose-600 cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-zinc-200 grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block font-medium text-zinc-700 mb-1">Estado de Pago</label>
              <select
                value={draftCustomer.paymentStatus}
                onChange={(e) => setDraftCustomer({ ...draftCustomer, paymentStatus: e.target.value })}
                className="w-full h-9 px-2.5 bg-zinc-50 border border-zinc-200 rounded-lg font-semibold"
              >
                {PAYMENT_STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
              </select>
            </div>

            <div>
              <label className="block font-medium text-zinc-700 mb-1">Estado de Envío</label>
              <select
                value={draftCustomer.shippingStatus}
                onChange={(e) => setDraftCustomer({ ...draftCustomer, shippingStatus: e.target.value })}
                className="w-full h-9 px-2.5 bg-zinc-50 border border-zinc-200 rounded-lg font-semibold"
              >
                {SHIPPING_STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
              </select>
            </div>

            <div>
              <label className="block font-medium text-zinc-700 mb-1">Transportadora</label>
              <select
                value={draftCustomer.carrier}
                onChange={(e) => setDraftCustomer({ ...draftCustomer, carrier: e.target.value })}
                className="w-full h-9 px-2.5 bg-zinc-50 border border-zinc-200 rounded-lg"
              >
                {CARRIERS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block font-medium text-zinc-700 mb-1">Número de Guía</label>
              <input
                type="text"
                value={draftCustomer.trackingNumber}
                onChange={(e) => setDraftCustomer({ ...draftCustomer, trackingNumber: e.target.value })}
                placeholder="Opcional"
                className="w-full h-9 px-3 bg-zinc-50 border border-zinc-200 rounded-lg font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-zinc-700 mb-1">Notas del Pedido</label>
            <input
              type="text"
              value={draftCustomer.notes || ''}
              onChange={(e) => setDraftCustomer({ ...draftCustomer, notes: e.target.value })}
              placeholder="Ej: Empaque regalo, entregar en portería..."
              className="w-full h-9 px-3 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900"
            />
          </div>
        </div>

        <div className="px-5 py-3.5 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between gap-2 shrink-0">
          <label className="flex items-center gap-2 text-xs text-zinc-600 cursor-pointer">
            <input
              type="checkbox"
              checked={applyComboDiscount}
              onChange={(e) => setApplyComboDiscount(e.target.checked)}
              className="rounded border-zinc-300"
            />
            <span>Aplicar descuento combo llavero ({formatCOP(comboDiscountValue)})</span>
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 rounded-lg border border-zinc-200 bg-white text-xs font-medium text-zinc-700 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="h-9 px-5 rounded-lg bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 cursor-pointer"
            >
              Guardar Pedido y Coordenadas
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
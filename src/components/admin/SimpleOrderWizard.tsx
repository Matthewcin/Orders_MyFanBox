import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  CornerDownLeft,
  Edit3,
  MapPin,
  Plus,
  Trash2,
  X
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import InteractiveManualPinMap from '../InteractiveManualPinMap';
import { OrderItem } from '../../types';
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
  reverseGeocodeFromCoordinates
} from '../../utils/helpers';

interface SimpleOrderWizardProps {
  open: boolean;
  onClose: () => void;
}

interface WizardStep {
  id: string;
  fieldLabel: string;
  prompt: string;
  helper: string;
  optional?: boolean;
}

const STEPS: WizardStep[] = [
  {
    id: 'customerName',
    fieldLabel: 'Nombre del Cliente',
    prompt: '¿Cuál es el nombre del cliente?',
    helper: 'Campo obligatorio. Escribe el nombre completo y presiona Enter.'
  },
  {
    id: 'phone',
    fieldLabel: 'WhatsApp',
    prompt: '¿Cuál es su número de WhatsApp?',
    helper: 'Ejemplo: +57 300 123 4567. Presiona Enter para seguir.',
    optional: true
  },
  {
    id: 'instagram',
    fieldLabel: 'Instagram',
    prompt: '¿Cuál es su usuario de Instagram?',
    helper: 'Opcional. Ejemplo: @usuario. Presiona Enter para continuar o saltar.',
    optional: true
  },
  {
    id: 'cedula',
    fieldLabel: 'Cédula / Documento',
    prompt: '¿Número de cédula o documento?',
    helper: 'Opcional. Puedes dejarlo vacío y presionar Enter.',
    optional: true
  },
  {
    id: 'city',
    fieldLabel: 'Ciudad de Envío',
    prompt: '¿A qué ciudad se envía el pedido?',
    helper: 'Escribe la ciudad o elige una de las opciones rápidas.'
  },
  {
    id: 'address',
    fieldLabel: 'Dirección Exacta',
    prompt: '¿Cuál es la dirección de entrega?',
    helper: 'Calle, número, barrio, apartamento o referencias.',
    optional: true
  },
  {
    id: 'items',
    fieldLabel: 'Prendas del Pedido',
    prompt: '¿Qué prendas lleva este pedido?',
    helper: 'Selecciona cada producto y añádelo a la lista antes de continuar.'
  },
  {
    id: 'paymentStatus',
    fieldLabel: 'Estado de Pago',
    prompt: '¿Cuál es el estado del pago?',
    helper: 'Elige una opción y presiona Aceptar o Enter.'
  },
  {
    id: 'shipping',
    fieldLabel: 'Envío y Transportadora',
    prompt: '¿Estado de envío y transportadora?',
    helper: 'Selecciona cómo se despachará este pedido.'
  },
  {
    id: 'notes',
    fieldLabel: 'Notas del Pedido',
    prompt: '¿Quieres agregar alguna nota extra?',
    helper: 'Opcional. Ej: empaque regalo, dejar en portería.',
    optional: true
  },
  {
    id: 'review',
    fieldLabel: 'Verificación Final',
    prompt: 'Revisa que todo esté bien antes de guardar',
    helper: 'Puedes tocar Editar en cualquier bloque si necesitas corregir algo.'
  }
];

const QUICK_CITIES = ['Medellín', 'Bogotá', 'Cali', 'Barranquilla', 'Cartagena', 'Bucaramanga', 'Pereira'];

function TypewriterHeading({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    setDisplayed('');
    let index = 0;
    const interval = setInterval(() => {
      index += 1;
      setDisplayed(text.slice(0, index));
      if (index >= text.length) {
        clearInterval(interval);
      }
    }, 22);
    return () => clearInterval(interval);
  }, [text]);

  return (
    <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-zinc-900 leading-tight min-h-[1.25em]">
      <span>{displayed}</span>
      <span className="inline-block w-[3px] h-[0.9em] bg-zinc-900 ml-1 align-middle animate-pulse" />
    </h1>
  );
}

export default function SimpleOrderWizard({ open, onClose }: SimpleOrderWizardProps) {
  const {
    catalog,
    defaultCarrier,
    comboDiscountValue,
    googleMapsApiKey,
    saveNewOrder,
    notify
  } = useAdmin();

  const [stepIndex, setStepIndex] = useState(0);
  const [returnToReview, setReturnToReview] = useState(false);
  const [stepError, setStepError] = useState('');
  const [showMapAdjust, setShowMapAdjust] = useState(false);

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [instagram, setInstagram] = useState('');
  const [cedula, setCedula] = useState('');
  const [city, setCity] = useState('Medellín');
  const [neighborhood, setNeighborhood] = useState('El Poblado');
  const [postalCode, setPostalCode] = useState('050021');
  const [address, setAddress] = useState('');
  const [formattedAddress, setFormattedAddress] = useState('');
  const [lat, setLat] = useState(6.20892);
  const [lng, setLng] = useState(-75.56781);
  const [manualPin, setManualPin] = useState(false);
  const [addressVerified, setAddressVerified] = useState(false);

  const [items, setItems] = useState<OrderItem[]>([]);
  const [selProdId, setSelProdId] = useState('');
  const [selVarId, setSelVarId] = useState('');
  const [selSize, setSelSize] = useState('M');
  const [selGender, setSelGender] = useState('Femenino');
  const [selQty, setSelQty] = useState<number | string>(1);
  const [applyComboDiscount, setApplyComboDiscount] = useState(true);

  const [paymentStatus, setPaymentStatus] = useState('Semi-pagado (50%)');
  const [shippingStatus, setShippingStatus] = useState('Por preparar');
  const [carrier, setCarrier] = useState(defaultCarrier || 'Interrapidísimo');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [notes, setNotes] = useState('');

  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) return;
    setStepIndex(0);
    setReturnToReview(false);
    setStepError('');
    setShowMapAdjust(false);
    setCustomerName('');
    setPhone('');
    setInstagram('');
    setCedula('');
    setCity('Medellín');
    setNeighborhood('El Poblado');
    setPostalCode('050021');
    setAddress('');
    setFormattedAddress('');
    setLat(6.20892);
    setLng(-75.56781);
    setManualPin(false);
    setAddressVerified(false);
    setItems([]);
    setApplyComboDiscount(true);
    setPaymentStatus('Semi-pagado (50%)');
    setShippingStatus('Por preparar');
    setCarrier(defaultCarrier || 'Interrapidísimo');
    setTrackingNumber('');
    setNotes('');

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
  }, [open, catalog, defaultCarrier]);

  useEffect(() => {
    if (!open) return;
    setStepError('');
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 80);
    return () => clearTimeout(timer);
  }, [open, stepIndex]);

  const currentStep = STEPS[stepIndex];
  const isReviewStep = currentStep?.id === 'review';
  const progressPct = Math.round(((stepIndex + 1) / STEPS.length) * 100);

  const handleAddItem = () => {
    const prod = catalog.find(c => c.id === selProdId) || catalog[0];
    if (!prod || !Array.isArray(prod.variants) || prod.variants.length === 0) {
      setStepError('No hay productos disponibles en el catálogo.');
      return;
    }
    const variant = prod.variants.find(v => v.id === selVarId) || prod.variants[0];
    const unitPrice = prod.basePrice + (variant.extraPrice || 0);
    setItems(prev => [
      ...prev,
      {
        id: `sit-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
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
    setStepError('');
  };

  const syncGeoFromCityAddress = (nextCity: string, nextAddress: string) => {
    if (manualPin) return;
    const meta = inferColombianAddressMetadata(nextCity || 'Medellín', nextAddress || '');
    setNeighborhood(meta.neighborhood);
    setPostalCode(meta.postalCode);
    setLat(meta.lat);
    setLng(meta.lng);
  };

  const handleNext = () => {
    setStepError('');

    if (currentStep.id === 'customerName' && !customerName.trim()) {
      setStepError('Por favor escribe el nombre del cliente para continuar.');
      inputRef.current?.focus();
      return;
    }

    if (currentStep.id === 'city') {
      const cleanCity = city.trim() || 'Medellín';
      setCity(cleanCity);
      syncGeoFromCityAddress(cleanCity, address);
    }

    if (currentStep.id === 'address') {
      syncGeoFromCityAddress(city.trim() || 'Medellín', address);
    }

    if (currentStep.id === 'items') {
      if (items.length === 0) {
        const prod = catalog.find(c => c.id === selProdId) || catalog[0];
        if (!prod || !Array.isArray(prod.variants) || prod.variants.length === 0) {
          setStepError('Agrega al menos una prenda para continuar.');
          return;
        }
        const variant = prod.variants.find(v => v.id === selVarId) || prod.variants[0];
        setItems([
          {
            id: `sit-${Date.now()}`,
            productId: prod.id,
            productName: prod.name,
            variantId: variant.id,
            variantName: variant.name,
            size: selSize,
            gender: selGender || 'Sin especificar',
            qty: Math.max(1, Number(selQty) || 1),
            unitPrice: prod.basePrice + (variant.extraPrice || 0),
            packed: false
          }
        ]);
      }
    }

    if (returnToReview) {
      setReturnToReview(false);
      setStepIndex(STEPS.length - 1);
      return;
    }

    if (stepIndex < STEPS.length - 1) {
      setStepIndex(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setStepError('');
    if (returnToReview) {
      setReturnToReview(false);
      setStepIndex(STEPS.length - 1);
      return;
    }
    if (stepIndex > 0) {
      setStepIndex(prev => prev - 1);
    } else {
      onClose();
    }
  };

  const jumpToStepForEdit = (stepId: string) => {
    const idx = STEPS.findIndex(s => s.id === stepId);
    if (idx >= 0) {
      setReturnToReview(true);
      setStepIndex(idx);
    }
  };

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === 'Enter' && !isReviewStep) {
        const activeTag = document.activeElement?.tagName;
        if (activeTag === 'BUTTON') return;
        e.preventDefault();
        handleNext();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  if (!open) return null;

  const subtotal = items.reduce((acc, it) => acc + it.unitPrice * it.qty, 0);
  const hasGarment = items.some(it => catalog.find(c => c.id === it.productId)?.category === 'Prenda');
  const hasKeychain = items.some(it => it.productName.toLowerCase().includes('llavero'));
  const eligibleForCombo = hasGarment && hasKeychain;
  const discount = eligibleForCombo && applyComboDiscount ? comboDiscountValue : 0;
  const total = Math.max(0, subtotal - discount);

  const handleFinalConfirm = () => {
    if (!customerName.trim()) {
      notify('Falta el nombre del cliente', 'warning');
      jumpToStepForEdit('customerName');
      return;
    }
    if (items.length === 0) {
      notify('Debes agregar al menos una prenda', 'warning');
      jumpToStepForEdit('items');
      return;
    }

    const cleanCedula = cedula.trim();
    const finalItems = items.map(it => ({
      ...it,
      customerCedula: cleanCedula,
      manualPin: Boolean(manualPin)
    }));

    const customerData = {
      customerName: customerName.trim(),
      cedula: cleanCedula,
      instagram: instagram.trim(),
      phone: phone.trim(),
      city: city.trim() || 'Medellín',
      neighborhood,
      address: address.trim(),
      postalCode,
      formattedAddress,
      lat,
      lng,
      manualPin,
      addressVerified,
      carrier,
      trackingNumber: trackingNumber.trim(),
      paymentStatus,
      shippingStatus,
      notes: notes.trim()
    };

    saveNewOrder(customerData, finalItems, discount, total);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-white text-zinc-900 flex flex-col overflow-hidden">
      <style>{`
        @keyframes mfbStepReveal {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .mfb-step-reveal {
          animation: mfbStepReveal 0.24s ease-out;
        }
      `}</style>

      <div className="w-full h-1 bg-zinc-100 shrink-0">
        <div
          className="h-full bg-zinc-900 transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <header className="px-5 sm:px-8 h-16 flex items-center justify-between border-b border-zinc-100 shrink-0">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleBack}
            className="h-9 px-3 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-medium text-zinc-700 inline-flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{stepIndex === 0 ? 'Salir' : returnToReview ? 'Volver al resumen' : 'Atrás'}</span>
          </button>

          {stepIndex > 0 && (
            <button
              type="button"
              onClick={onClose}
              className="h-9 w-9 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-500 hover:text-zinc-900 inline-flex items-center justify-center cursor-pointer"
              title="Cerrar Modo Simple"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <span className="hidden sm:inline text-xs font-mono text-zinc-400">
            Paso {stepIndex + 1} de {STEPS.length}
          </span>
          <div className="px-3.5 py-1.5 rounded-full bg-zinc-100 border border-zinc-200 text-xs font-semibold text-zinc-900">
            {currentStep.fieldLabel}
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto flex items-center justify-center px-5 sm:px-10 py-8">
        <div key={currentStep.id} className="mfb-step-reveal w-full max-w-2xl space-y-7 my-auto">
          <div className="space-y-2.5">
            <div className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
              {currentStep.fieldLabel}
            </div>
            <TypewriterHeading text={currentStep.prompt} />
            <p className="text-sm text-zinc-500">{currentStep.helper}</p>
          </div>

          {currentStep.id === 'customerName' && (
            <div>
              <input
                ref={inputRef}
                type="text"
                value={customerName}
                onChange={(e) => {
                  setCustomerName(e.target.value);
                  setStepError('');
                }}
                placeholder="Ej: Valentina Gómez"
                className="w-full py-3 text-2xl sm:text-3xl font-medium bg-transparent border-b-2 border-zinc-300 focus:border-zinc-900 focus:outline-none text-zinc-900 placeholder:text-zinc-300 transition-colors"
              />
            </div>
          )}

          {currentStep.id === 'phone' && (
            <div>
              <input
                ref={inputRef}
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+57 300 123 4567"
                className="w-full py-3 text-2xl sm:text-3xl font-mono font-medium bg-transparent border-b-2 border-zinc-300 focus:border-zinc-900 focus:outline-none text-zinc-900 placeholder:text-zinc-300 transition-colors"
              />
            </div>
          )}

          {currentStep.id === 'instagram' && (
            <div>
              <input
                ref={inputRef}
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="@valengomez"
                className="w-full py-3 text-2xl sm:text-3xl font-medium bg-transparent border-b-2 border-zinc-300 focus:border-zinc-900 focus:outline-none text-zinc-900 placeholder:text-zinc-300 transition-colors"
              />
            </div>
          )}

          {currentStep.id === 'cedula' && (
            <div>
              <input
                ref={inputRef}
                type="text"
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
                placeholder="Ej: 1037645890"
                className="w-full py-3 text-2xl sm:text-3xl font-mono font-medium bg-transparent border-b-2 border-zinc-300 focus:border-zinc-900 focus:outline-none text-zinc-900 placeholder:text-zinc-300 transition-colors"
              />
            </div>
          )}

          {currentStep.id === 'city' && (
            <div className="space-y-4">
              <input
                ref={inputRef}
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Ej: Medellín"
                className="w-full py-3 text-2xl sm:text-3xl font-medium bg-transparent border-b-2 border-zinc-300 focus:border-zinc-900 focus:outline-none text-zinc-900 placeholder:text-zinc-300 transition-colors"
              />
              <div className="flex flex-wrap gap-2">
                {QUICK_CITIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setCity(c);
                      syncGeoFromCityAddress(c, address);
                    }}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                      city.toLowerCase() === c.toLowerCase()
                        ? 'bg-zinc-900 text-white border-zinc-900'
                        : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:border-zinc-400'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStep.id === 'address' && (
            <div className="space-y-4">
              <input
                ref={inputRef}
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Ej: Cra 43A # 1-50, Apto 402"
                className="w-full py-3 text-2xl sm:text-3xl font-medium bg-transparent border-b-2 border-zinc-300 focus:border-zinc-900 focus:outline-none text-zinc-900 placeholder:text-zinc-300 transition-colors"
              />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setShowMapAdjust(prev => !prev)}
                  className="h-9 px-3.5 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-xs font-medium text-zinc-800 inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{showMapAdjust ? 'Ocultar mapa' : 'Ubicar en el mapa (opcional)'}</span>
                </button>
                {addressVerified && (
                  <span className="text-xs font-semibold text-emerald-700">
                    ✓ Ubicación ajustada ({neighborhood} · CP {postalCode})
                  </span>
                )}
              </div>

              {showMapAdjust && (
                <div className="pt-1">
                  <InteractiveManualPinMap
                    lat={lat}
                    lng={lng}
                    title={customerName || 'Cliente MyFanBox'}
                    subtitle={`${address}, ${city}`}
                    heightClass="h-56"
                    onPinChange={async (newLat, newLng) => {
                      const quick = inferMetadataFromCoordinates(newLat, newLng);
                      setLat(newLat);
                      setLng(newLng);
                      setCity(quick.city);
                      setNeighborhood(quick.neighborhood);
                      setPostalCode(quick.postalCode);
                      setManualPin(true);
                      setAddressVerified(true);
                      const rev = await reverseGeocodeFromCoordinates(newLat, newLng, googleMapsApiKey);
                      setLat(rev.lat);
                      setLng(rev.lng);
                      setCity(rev.city);
                      setNeighborhood(rev.neighborhood);
                      setPostalCode(rev.postalCode);
                      if (rev.streetAddress) setAddress(rev.streetAddress);
                      setFormattedAddress(rev.formattedAddress);
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {currentStep.id === 'items' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-zinc-600 mb-1">Producto</label>
                    <select
                      value={selProdId}
                      onChange={(e) => {
                        const pid = e.target.value;
                        const prod = catalog.find(c => c.id === pid) || catalog[0];
                        setSelProdId(pid);
                        setSelVarId(prod?.variants[0]?.id || '');
                        setSelSize(prod?.sizes[0] || 'M');
                      }}
                      className="w-full h-10 px-3 rounded-xl bg-white border border-zinc-200 text-sm text-zinc-900"
                    >
                      {catalog.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({formatCOP(p.basePrice)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-zinc-600 mb-1">Variante</label>
                    <select
                      value={selVarId}
                      onChange={(e) => setSelVarId(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-white border border-zinc-200 text-sm text-zinc-900"
                    >
                      {(catalog.find(c => c.id === selProdId)?.variants || []).map(v => (
                        <option key={v.id} value={v.id}>{v.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-medium text-zinc-600 mb-1">Talla</label>
                    <select
                      value={selSize}
                      onChange={(e) => setSelSize(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-white border border-zinc-200 text-sm font-semibold text-zinc-900"
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

                  <div>
                    <label className="block font-medium text-zinc-600 mb-1">Corte</label>
                    <select
                      value={selGender}
                      onChange={(e) => setSelGender(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-white border border-zinc-200 text-sm text-zinc-900"
                    >
                      {GARMENT_GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-zinc-600 mb-1">Cantidad</label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={selQty}
                      onChange={(e) => setSelQty(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-white border border-zinc-200 text-sm font-semibold text-center text-zinc-900"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddItem}
                  className="w-full h-10 rounded-xl bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 inline-flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Agregar esta prenda al pedido</span>
                </button>
              </div>

              {items.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span>Prendas agregadas ({items.length})</span>
                    <span className="font-mono font-semibold text-zinc-900">
                      Subtotal: {formatCOP(subtotal)}
                    </span>
                  </div>
                  {items.map((it, idx) => (
                    <div
                      key={it.id || idx}
                      className="flex items-center justify-between px-4 py-3 rounded-xl bg-white border border-zinc-200 text-xs"
                    >
                      <div>
                        <span className="font-semibold text-zinc-900">
                          {it.qty}× {it.productName}
                        </span>
                        <div className="text-zinc-500 mt-0.5">
                          {it.variantName} · Talla {it.size} · {it.gender}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-semibold text-zinc-900">
                          {formatCOP(it.unitPrice * it.qty)}
                        </span>
                        <button
                          type="button"
                          onClick={() => setItems(prev => prev.filter((_, i) => i !== idx))}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {currentStep.id === 'paymentStatus' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PAYMENT_STATUSES.map((st) => {
                const selected = paymentStatus === st;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setPaymentStatus(st)}
                    className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                      selected
                        ? 'bg-zinc-900 text-white border-zinc-900'
                        : 'bg-zinc-50 text-zinc-800 border-zinc-200 hover:border-zinc-400'
                    }`}
                  >
                    <span className="text-sm font-semibold">{st}</span>
                    {selected && <Check className="w-4 h-4" />}
                  </button>
                );
              })}
            </div>
          )}

          {currentStep.id === 'shipping' && (
            <div className="space-y-5">
              <div className="space-y-2">
                <div className="text-xs font-semibold text-zinc-500">Estado del Envío</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {SHIPPING_STATUSES.map((st) => {
                    const selected = shippingStatus === st;
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setShippingStatus(st)}
                        className={`p-3.5 rounded-xl border text-center text-sm font-semibold transition-all cursor-pointer ${
                          selected
                            ? 'bg-zinc-900 text-white border-zinc-900'
                            : 'bg-zinc-50 text-zinc-800 border-zinc-200 hover:border-zinc-400'
                        }`}
                      >
                        {st}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-semibold text-zinc-500">Transportadora</div>
                <div className="flex flex-wrap gap-2">
                  {CARRIERS.map((c) => {
                    const selected = carrier === c;
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCarrier(c)}
                        className={`px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                          selected
                            ? 'bg-zinc-900 text-white border-zinc-900'
                            : 'bg-zinc-50 text-zinc-800 border-zinc-200 hover:border-zinc-400'
                        }`}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1">
                  Número de guía (opcional)
                </label>
                <input
                  ref={inputRef}
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Dejar vacío si todavía no tiene guía"
                  className="w-full py-2.5 text-lg font-mono bg-transparent border-b-2 border-zinc-300 focus:border-zinc-900 focus:outline-none text-zinc-900 placeholder:text-zinc-300"
                />
              </div>
            </div>
          )}

          {currentStep.id === 'notes' && (
            <div>
              <input
                ref={inputRef}
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej: Empaque regalo, entregar en portería..."
                className="w-full py-3 text-2xl sm:text-3xl font-medium bg-transparent border-b-2 border-zinc-300 focus:border-zinc-900 focus:outline-none text-zinc-900 placeholder:text-zinc-300 transition-colors"
              />
            </div>
          )}

          {isReviewStep && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-zinc-900">Cliente</span>
                    <button
                      type="button"
                      onClick={() => jumpToStepForEdit('customerName')}
                      className="text-zinc-500 hover:text-zinc-900 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" /> Editar
                    </button>
                  </div>
                  <div className="text-sm font-bold text-zinc-900">{customerName || '—'}</div>
                  <div className="text-zinc-600">WhatsApp: {phone || 'Sin registrar'}</div>
                  <div className="text-zinc-600">Instagram: {instagram || 'Sin registrar'}</div>
                  <div className="text-zinc-600 font-mono">Cédula: {cedula || 'Sin registrar'}</div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-zinc-900">Envío y Entrega</span>
                    <button
                      type="button"
                      onClick={() => jumpToStepForEdit('city')}
                      className="text-zinc-500 hover:text-zinc-900 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" /> Editar
                    </button>
                  </div>
                  <div className="text-sm font-bold text-zinc-900">{city}</div>
                  <div className="text-zinc-600">{address || 'Dirección pendiente'}</div>
                  <div className="text-zinc-500">
                    {neighborhood} · CP {postalCode}
                  </div>
                  <div className="text-zinc-700 font-medium pt-1">
                    {carrier} · {shippingStatus}
                    {trackingNumber ? ` · Guía ${trackingNumber}` : ''}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-zinc-900">
                    Prendas del Pedido ({items.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => jumpToStepForEdit('items')}
                    className="text-zinc-500 hover:text-zinc-900 inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" /> Editar prendas
                  </button>
                </div>

                <div className="divide-y divide-zinc-200 bg-white rounded-xl border border-zinc-200">
                  {items.map((it, idx) => (
                    <div key={it.id || idx} className="px-3.5 py-2.5 flex items-center justify-between gap-2">
                      <div>
                        <span className="font-semibold text-zinc-900">
                          {it.qty}× {it.productName}
                        </span>
                        <span className="text-zinc-500">
                          {' '}· {it.variantName} · Talla {it.size} · {it.gender}
                        </span>
                      </div>
                      <span className="font-mono font-semibold text-zinc-900">
                        {formatCOP(it.unitPrice * it.qty)}
                      </span>
                    </div>
                  ))}
                </div>

                {eligibleForCombo && (
                  <label className="flex items-center gap-2 text-xs text-zinc-700 pt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={applyComboDiscount}
                      onChange={(e) => setApplyComboDiscount(e.target.checked)}
                      className="rounded border-zinc-300"
                    />
                    <span>Aplicar descuento combo llavero ({formatCOP(comboDiscountValue)})</span>
                  </label>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-zinc-900">Pago: {paymentStatus}</span>
                    <button
                      type="button"
                      onClick={() => jumpToStepForEdit('paymentStatus')}
                      className="text-zinc-500 hover:text-zinc-900 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" /> Editar
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-600">
                    <span>Notas: {notes || 'Sin notas'}</span>
                    <button
                      type="button"
                      onClick={() => jumpToStepForEdit('notes')}
                      className="text-zinc-400 hover:text-zinc-900 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="text-right tabular-nums">
                  {discount > 0 && (
                    <div className="text-emerald-700 font-medium">
                      Descuento: -{formatCOP(discount)}
                    </div>
                  )}
                  <div className="text-xs text-zinc-500">Total a registrar</div>
                  <div className="text-2xl font-bold text-zinc-900">{formatCOP(total)}</div>
                </div>
              </div>
            </div>
          )}

          {stepError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-800">
              {stepError}
            </div>
          )}

          <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
            {!isReviewStep ? (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleNext}
                  className="h-12 px-6 rounded-xl bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-800 inline-flex items-center gap-2 cursor-pointer"
                >
                  <span>{returnToReview ? 'Guardar cambio' : 'Aceptar'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-zinc-400">
                  <span>o presiona</span>
                  <kbd className="px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200 font-mono text-zinc-600 inline-flex items-center gap-1">
                    Enter <CornerDownLeft className="w-3 h-3" />
                  </kbd>
                </span>
              </div>
            ) : (
              <div className="w-full flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleBack}
                  className="h-12 px-5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-sm font-semibold text-zinc-700 inline-flex items-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Volver atrás</span>
                </button>

                <button
                  type="button"
                  onClick={handleFinalConfirm}
                  className="h-12 px-7 rounded-xl bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-800 inline-flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirmar y Guardar Pedido</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
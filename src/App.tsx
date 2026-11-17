import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Package,
  ShoppingBag,
  Truck,
  Calculator,
  Database,
  Search,
  Plus,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Clock,
  XCircle,
  RotateCcw,
  Copy,
  Check,
  MessageCircle,
  Trash2,
  Edit3,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Terminal,
  Sparkles,
  Layers,
  Box,
  Scissors,
  SlidersHorizontal,
  ArrowUpRight,
  ShieldCheck,
  Play,
  FileCode,
  Menu,
  X,
  Info,
  MapPin,
  Navigation,
  FileText,
  Printer,
  Share2,
  Eye,
  Palette,
  Sun,
  Moon,
  ExternalLink,
  Compass,
  Calendar,
  Lock,
  Unlock,
  KeyRound,
  LogOut,
  UserCheck,
  ShieldAlert,
  Fingerprint
} from 'lucide-react';

// ============================================================================
// 1. CATÁLOGO OFICIAL PRECARGADO ("VIAJANDO POR EL MUNDO - KAROL G")
// ============================================================================

// Exact required statuses
const PAYMENT_STATUSES = [
  'Pendiente',
  'Semi-pagado (50%)',
  'Pagado',
  'Cancelado',
  'Reembolsado'
];

const SHIPPING_STATUSES = [
  'Por preparar',
  'Por enviar',
  'Enviado'
];

const CARRIERS = [
  'Interrapidísimo',
  'Coordinadora',
  'Envía',
  'Servientrega',
  'Entrega Personal'
];

const GARMENT_GENDERS = [
  'Femenino',
  'Masculino',
  'Sin especificar'
];

const ALL_GARMENT_SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL'];

const OFFICIAL_CATALOG_FALLBACK = [
  {
    "id": "cat-1",
    "code": "TROPICOQUETA",
    "name": "Hoodie Tropicoqueta",
    "category": "Prenda",
    "basePrice": 140000,
    "unitCost": 66000,
    "blankName": "Hoodie Base Beige (Sin estampar)",
    "sizes": [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "2XL"
    ],
    "variants": [
      {
        "id": "v1-std",
        "name": "Estándar",
        "extraPrice": 0,
        "extraCost": 0,
        "needsRhinestones": false,
        "needsGlitterVinyl": false
      },
      {
        "id": "v1-brillos",
        "name": "Con Brillos (+$10.000)",
        "extraPrice": 10000,
        "extraCost": 3500,
        "needsRhinestones": true,
        "needsGlitterVinyl": false
      }
    ]
  },
  {
    "id": "cat-2",
    "code": "STAR-HOODIE",
    "name": "Star Hoodie",
    "category": "Prenda",
    "basePrice": 140000,
    "unitCost": 68000,
    "blankName": "Hoodie Base Negro (Sin estampar)",
    "sizes": [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "2XL"
    ],
    "variants": [
      {
        "id": "v2-std",
        "name": "Estrella de Brillos (Estándar)",
        "extraPrice": 0,
        "extraCost": 0,
        "needsRhinestones": true,
        "needsGlitterVinyl": false
      },
      {
        "id": "v2-extra",
        "name": "Con Brillos Extra (+$10.000)",
        "extraPrice": 10000,
        "extraCost": 3500,
        "needsRhinestones": true,
        "needsGlitterVinyl": false
      }
    ]
  },
  {
    "id": "cat-3",
    "code": "LATINA-CROP",
    "name": "Latina Croptop",
    "category": "Prenda",
    "basePrice": 80000,
    "unitCost": 32000,
    "blankName": "Croptop Base",
    "sizes": [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "2XL"
    ],
    "variants": [
      {
        "id": "v3-crema",
        "name": "Blanco/Crema (Congas)",
        "extraPrice": 0,
        "extraCost": 0,
        "blankOverride": "Croptop Base Blanco/Crema",
        "needsRhinestones": false,
        "needsGlitterVinyl": false
      },
      {
        "id": "v3-negro",
        "name": "Negro (Latina Foreva)",
        "extraPrice": 0,
        "extraCost": 0,
        "blankOverride": "Croptop Base Negro",
        "needsRhinestones": false,
        "needsGlitterVinyl": false
      }
    ]
  },
  {
    "id": "cat-4",
    "code": "NMADST",
    "name": "NMADST (Raglan \"No me arrepiento de sentir tanto\")",
    "category": "Prenda",
    "basePrice": 90000,
    "unitCost": 41000,
    "blankName": "Camiseta Raglan Blanca / Mangas Negras",
    "sizes": [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "2XL"
    ],
    "variants": [
      {
        "id": "v4-azul",
        "name": "Pedrería Mangas + Vinilo Escarchado Azul",
        "extraPrice": 0,
        "extraCost": 0,
        "needsRhinestones": true,
        "needsGlitterVinyl": true,
        "vinylColor": "Azul Escarchado"
      },
      {
        "id": "v4-negro",
        "name": "Pedrería Mangas + Vinilo Escarchado Negro",
        "extraPrice": 0,
        "extraCost": 0,
        "needsRhinestones": true,
        "needsGlitterVinyl": true,
        "vinylColor": "Negro Escarchado"
      }
    ]
  },
  {
    "id": "cat-5",
    "code": "SPARKLY",
    "name": "Sparkly Oversized Unisex",
    "category": "Prenda",
    "basePrice": 90000,
    "unitCost": 43000,
    "blankName": "Camiseta Oversized Unisex Negra",
    "sizes": [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "2XL"
    ],
    "variants": [
      {
        "id": "v5-mun-neg",
        "name": "Muñeca + Pedrería Negra (Vinilo Azul)",
        "extraPrice": 0,
        "extraCost": 0,
        "needsRhinestones": true,
        "needsGlitterVinyl": true,
        "vinylColor": "Azul Escarchado"
      },
      {
        "id": "v5-mun-pla",
        "name": "Muñeca + Pedrería Plateada (Vinilo Azul)",
        "extraPrice": 0,
        "extraCost": 0,
        "needsRhinestones": true,
        "needsGlitterVinyl": true,
        "vinylColor": "Azul Escarchado"
      },
      {
        "id": "v5-fir-neg",
        "name": "Firma Karol G + Pedrería Negra (Vinilo Azul)",
        "extraPrice": 0,
        "extraCost": 0,
        "needsRhinestones": true,
        "needsGlitterVinyl": true,
        "vinylColor": "Azul Escarchado"
      },
      {
        "id": "v5-fir-pla",
        "name": "Firma Karol G + Pedrería Plateada (Vinilo Azul)",
        "extraPrice": 0,
        "extraCost": 0,
        "needsRhinestones": true,
        "needsGlitterVinyl": true,
        "vinylColor": "Azul Escarchado"
      }
    ]
  },
  {
    "id": "cat-6",
    "code": "CANTAR-CORA",
    "name": "Cantar con Cora Croptop",
    "category": "Prenda",
    "basePrice": 85000,
    "unitCost": 35000,
    "blankName": "Croptop Base",
    "sizes": [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "2XL"
    ],
    "variants": [
      {
        "id": "v6-celeste",
        "name": "Celeste (\"Still love you\")",
        "extraPrice": 0,
        "extraCost": 0,
        "blankOverride": "Croptop Base Celeste",
        "needsGlitterVinyl": true,
        "vinylColor": "Azul Escarchado"
      },
      {
        "id": "v6-blanco",
        "name": "Blanco (\"Matadora\")",
        "extraPrice": 0,
        "extraCost": 0,
        "blankOverride": "Croptop Base Blanco",
        "needsGlitterVinyl": true,
        "vinylColor": "Azul Escarchado"
      },
      {
        "id": "v6-negro",
        "name": "Negro (\"Bby Wow\")",
        "extraPrice": 0,
        "extraCost": 0,
        "blankOverride": "Croptop Base Negro",
        "needsGlitterVinyl": true,
        "vinylColor": "Azul Escarchado"
      }
    ]
  },
  {
    "id": "cat-7",
    "code": "CD-NFC",
    "name": "Llavero Mini CD (Con NFC)",
    "category": "Accesorio",
    "basePrice": 30000,
    "unitCost": 9500,
    "blankName": "Caja Acrílica Mini CD + Herraje Estrella",
    "sizes": [
      "Única"
    ],
    "variants": [
      {
        "id": "v7-msb",
        "name": "Mañana Será Bonito (Con NFC)",
        "extraPrice": 0,
        "extraCost": 0,
        "needsNFC": true
      },
      {
        "id": "v7-bs",
        "name": "Bichota Season (Con NFC)",
        "extraPrice": 0,
        "extraCost": 0,
        "needsNFC": true
      },
      {
        "id": "v7-kg",
        "name": "KG0516 (Con NFC)",
        "extraPrice": 0,
        "extraCost": 0,
        "needsNFC": true
      },
      {
        "id": "v7-ocean",
        "name": "Ocean (Con NFC)",
        "extraPrice": 0,
        "extraCost": 0,
        "needsNFC": true
      },
      {
        "id": "v7-unstop",
        "name": "Unstoppable (Con NFC)",
        "extraPrice": 0,
        "extraCost": 0,
        "needsNFC": true
      },
      {
        "id": "v7-tropi",
        "name": "Tropicoqueta (Con NFC)",
        "extraPrice": 0,
        "extraCost": 0,
        "needsNFC": true
      }
    ]
  },
  {
    "id": "cat-8",
    "code": "CD-QR",
    "name": "Llavero Mini CD (Sin NFC / QR)",
    "category": "Accesorio",
    "basePrice": 28000,
    "unitCost": 7200,
    "blankName": "Caja Acrílica Mini CD + Herraje Estrella",
    "sizes": [
      "Única"
    ],
    "variants": [
      {
        "id": "v8-msb",
        "name": "Mañana Será Bonito (Sin NFC / QR)",
        "extraPrice": 0,
        "extraCost": 0,
        "needsNFC": false
      },
      {
        "id": "v8-bs",
        "name": "Bichota Season (Sin NFC / QR)",
        "extraPrice": 0,
        "extraCost": 0,
        "needsNFC": false
      },
      {
        "id": "v8-kg",
        "name": "KG0516 (Sin NFC / QR)",
        "extraPrice": 0,
        "extraCost": 0,
        "needsNFC": false
      },
      {
        "id": "v8-ocean",
        "name": "Ocean (Sin NFC / QR)",
        "extraPrice": 0,
        "extraCost": 0,
        "needsNFC": false
      },
      {
        "id": "v8-unstop",
        "name": "Unstoppable (Sin NFC / QR)",
        "extraPrice": 0,
        "extraCost": 0,
        "needsNFC": false
      },
      {
        "id": "v8-tropi",
        "name": "Tropicoqueta (Sin NFC / QR)",
        "extraPrice": 0,
        "extraCost": 0,
        "needsNFC": false
      }
    ]
  },
  {
    "id": "cat-9",
    "code": "DTF-FANBOX",
    "name": "Nueva DTF Fanbox (Kit Personaliza tú mismx)",
    "category": "Accesorio",
    "basePrice": 30000,
    "unitCost": 11000,
    "blankName": "Cajita Fanbox + Plancha Parches DTF",
    "sizes": [
      "Única"
    ],
    "variants": [
      {
        "id": "v9-kit",
        "name": "Kit Parches DTF para Planchar",
        "extraPrice": 0,
        "extraCost": 0
      }
    ]
  },
  {
    "id": "cat-10",
    "code": "CUSTOM",
    "name": "Prenda Personalizada (\"Idea en mente\")",
    "category": "Prenda",
    "basePrice": 110000,
    "unitCost": 52000,
    "blankName": "Prenda Base Custom (Según diseño)",
    "sizes": [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "2XL"
    ],
    "variants": [
      {
        "id": "v10-tee",
        "name": "Camiseta Personalizada desde cero",
        "extraPrice": 0,
        "extraCost": 0
      },
      {
        "id": "v10-hoodie",
        "name": "Hoodie Personalizado desde cero (+$35.000)",
        "extraPrice": 35000,
        "extraCost": 18000
      }
    ]
  }
];


// ============================================================================
// 1.0 SANITIZADOR PROFUNDO ANTI-ERROR #31 DE REACT (Convierte {id, label, badge, dot} a String)
// ============================================================================
function toSafeText(val: any, fallback = ''): string {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'string') return val;
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  if (typeof val === 'object') {
    if (typeof val.label === 'string') return val.label;
    if (typeof val.name === 'string') return val.name;
    if (typeof val.id === 'string') return val.id;
    if (typeof val.value === 'string') return val.value;
  }
  return fallback;
}

function sanitizeCatalogRecord(rawProd: any, idx = 0) {
  const name = toSafeText(rawProd?.name ?? rawProd?.label, `Referencia ${idx + 1}`);
  const category = toSafeText(rawProd?.category, 'Prenda');
  const rawSizes = Array.isArray(rawProd?.sizes)
    ? rawProd.sizes.map((s: any) => toSafeText(s, 'M')).filter(Boolean)
    : [];

  // Solo los accesorios (llaveros, fanbox, parches) usan 'Única'; toda la ropa incluye XS, S, M, L, XL, 2XL
  const isAccessory =
    category.toLowerCase().includes('accesorio') ||
    name.toLowerCase().includes('llavero') ||
    name.toLowerCase().includes('fanbox') ||
    name.toLowerCase().includes('parche');

  const sizes = isAccessory
    ? (rawSizes.length > 0 ? rawSizes : ['Única'])
    : Array.from(new Set([...ALL_GARMENT_SIZES, ...rawSizes.filter((s: string) => s !== 'Única')]));

  const variants = Array.isArray(rawProd?.variants)
    ? rawProd.variants.map((v: any, vIdx: number) => ({
        ...v,
        id: toSafeText(v?.id, `var-${idx}-${vIdx}`),
        name: toSafeText(v?.name ?? v?.label, 'Estándar'),
        extraPrice: Number(v?.extraPrice) || 0,
        extraCost: Number(v?.extraCost) || 0
      }))
    : [{ id: `var-${idx}-0`, name: 'Estándar', extraPrice: 0, extraCost: 0 }];

  return {
    ...rawProd,
    id: toSafeText(rawProd?.id, `prod-${idx + 1}`),
    code: toSafeText(rawProd?.code, `REF-${idx + 1}`),
    name,
    category,
    basePrice: Number(rawProd?.basePrice ?? rawProd?.base_price) || 0,
    unitCost: Number(rawProd?.unitCost ?? rawProd?.unit_cost) || 0,
    blankName: toSafeText(rawProd?.blankName ?? rawProd?.blank_name, ''),
    sizes: sizes.length > 0 ? sizes : ALL_GARMENT_SIZES,
    variants
  };
}

const CEDULA_STORAGE_KEY = 'mfb_order_cedulas_v2';

function readStoredCedulas(): Record<string, string> {
  try {
    const raw = localStorage.getItem(CEDULA_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStoredCedula(orderId: string, uuid: string, cedula: string) {
  if (!cedula) return;
  try {
    const current = readStoredCedulas();
    if (orderId) current[orderId] = cedula;
    if (uuid) current[uuid.toLowerCase()] = cedula;
    localStorage.setItem(CEDULA_STORAGE_KEY, JSON.stringify(current));
  } catch {}
}

function sanitizeOrderRecord(rawOrder: any, idx = 0, settingsCedulas: Record<string, string> = {}) {
  if (!rawOrder || typeof rawOrder !== 'object') return rawOrder;
  const orderId = toSafeText(rawOrder?.id, `MFB-${1001 + idx}`);
  const orderUuid = isValidUUID(toSafeText(rawOrder?.uuid)) ? toSafeText(rawOrder?.uuid).toLowerCase() : generateUUIDv4();

  const rawPay = toSafeText(rawOrder?.paymentStatus ?? rawOrder?.payment_status, 'Pendiente');
  const paymentStatus = PAYMENT_STATUSES.includes(rawPay) ? rawPay : 'Pendiente';

  const rawShip = toSafeText(rawOrder?.shippingStatus ?? rawOrder?.shipping_status, 'Por preparar');
  const shippingStatus = SHIPPING_STATUSES.includes(rawShip) ? rawShip : 'Por preparar';

  const rawCarrier = toSafeText(rawOrder?.carrier, 'Interrapidísimo');
  const carrier = CARRIERS.includes(rawCarrier) ? rawCarrier : 'Interrapidísimo';

  const rawItems = Array.isArray(rawOrder?.items) ? rawOrder.items : [];
  const itemCedula = rawItems.map((it: any) => toSafeText(it?.customerCedula ?? it?.cedula, '')).find(Boolean) || '';
  const storedCedulas = readStoredCedulas();
  const resolvedCedula =
    toSafeText(rawOrder?.cedula ?? rawOrder?.documentId ?? rawOrder?.document_id, '') ||
    itemCedula ||
    toSafeText(settingsCedulas?.[orderId] ?? settingsCedulas?.[orderUuid], '') ||
    toSafeText(storedCedulas?.[orderId] ?? storedCedulas?.[orderUuid], '');

  if (resolvedCedula) {
    saveStoredCedula(orderId, orderUuid, resolvedCedula);
  }

  const itemManualPin = rawItems.some((it: any) => Boolean(it?.manualPin));
  const resolvedManualPin = Boolean(rawOrder?.manualPin ?? rawOrder?.manual_pin ?? itemManualPin);

  const items = rawItems.map((it: any, iIdx: number) => {
    const rawGender = toSafeText(it?.gender, 'Sin especificar');
    const gender = GARMENT_GENDERS.includes(rawGender) ? rawGender : 'Sin especificar';
    return {
      ...it,
      id: toSafeText(it?.id, `item-${idx}-${iIdx}`),
      productId: toSafeText(it?.productId ?? it?.catalogId ?? it?.product_id, ''),
      productName: toSafeText(it?.productName ?? it?.name, 'Prenda MyFanBox'),
      variantId: toSafeText(it?.variantId ?? it?.variant_id, ''),
      variantName: toSafeText(it?.variantName ?? it?.variant, 'Estándar'),
      size: toSafeText(it?.size, 'M'),
      gender,
      qty: Math.max(1, Number(it?.qty) || 1),
      unitPrice: Number(it?.unitPrice ?? it?.unit_price) || 0,
      packed: Boolean(it?.packed),
      customerCedula: resolvedCedula,
      manualPin: resolvedManualPin
    };
  });

  const subtotal = items.reduce((acc: number, it: any) => acc + (Number(it.unitPrice) || 0) * (Number(it.qty) || 1), 0);
  const discount = Number(rawOrder?.discount) || 0;
  const computedTotal = Number(rawOrder?.total) || Math.max(0, subtotal - discount);

  return {
    ...rawOrder,
    id: orderId,
    uuid: orderUuid,
    customerName: toSafeText(rawOrder?.customerName ?? rawOrder?.customer_name, 'Cliente MyFanBox'),
    cedula: resolvedCedula,
    instagram: toSafeText(rawOrder?.instagram, ''),
    phone: toSafeText(rawOrder?.phone, ''),
    city: toSafeText(rawOrder?.city, 'Medellín'),
    neighborhood: toSafeText(rawOrder?.neighborhood, ''),
    address: toSafeText(rawOrder?.address, ''),
    postalCode: toSafeText(rawOrder?.postalCode ?? rawOrder?.postal_code, ''),
    formattedAddress: toSafeText(rawOrder?.formattedAddress ?? rawOrder?.formatted_address, ''),
    lat: typeof rawOrder?.lat === 'number' && !isNaN(rawOrder.lat) ? rawOrder.lat : Number(rawOrder?.lat) || undefined,
    lng: typeof rawOrder?.lng === 'number' && !isNaN(rawOrder.lng) ? rawOrder.lng : Number(rawOrder?.lng) || undefined,
    manualPin: resolvedManualPin,
    addressVerified: Boolean(rawOrder?.addressVerified ?? rawOrder?.address_verified ?? resolvedManualPin),
    paymentStatus,
    shippingStatus,
    carrier,
    trackingNumber: toSafeText(rawOrder?.trackingNumber ?? rawOrder?.tracking_code ?? rawOrder?.trackingCode, ''),
    notes: toSafeText(rawOrder?.notes, ''),
    discount,
    total: computedTotal,
    createdAt: toSafeText(rawOrder?.createdAt ?? rawOrder?.created_at, new Date().toISOString().split('T')[0]),
    items
  };
}

// ============================================================================
// 1.0B COMPONENTE DE LOGO OFICIAL MYFANBOX (Emblema CD Alado + Imagen Subible)
// ============================================================================
function MyFanBoxBrandLogo({
  logoUrl,
  brandName = 'MyFanBox',
  size = 'md',
  onUploadLogo
}: {
  logoUrl?: string;
  brandName?: string;
  size?: 'sm' | 'md' | 'lg';
  onUploadLogo?: (dataUrl: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const dimClass = size === 'sm' ? 'h-8 px-2' : size === 'lg' ? 'h-11 px-3' : 'h-9 px-2.5';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUploadLogo) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onUploadLogo(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="inline-flex items-center gap-2 shrink-0">
      <div
        onClick={() => onUploadLogo && fileRef.current?.click()}
        title={onUploadLogo ? 'Haz clic para subir el logo de MyFanBox (.png, .jpg, .svg)' : brandName}
        className={`${dimClass} rounded-xl bg-zinc-900 text-white flex items-center justify-center gap-2 border border-zinc-800 shadow-2xs overflow-hidden transition-transform ${
          onUploadLogo ? 'cursor-pointer hover:scale-[1.02]' : ''
        }`}
      >
        {logoUrl ? (
          <img src={logoUrl} alt={brandName} className="h-full py-1 w-auto object-contain" />
        ) : (
          <div className="flex items-center gap-1.5">
            <svg viewBox="0 0 44 34" className="w-6 h-5 shrink-0" fill="none">
              <path d="M9 11C5 10 2 12 1 15C3 16 6 16 9 15" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              <path d="M8 16C4 16 2 18 2 21C4 21 7 20 9 19" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              <path d="M35 11C39 10 42 12 43 15C41 16 38 16 35 15" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              <path d="M36 16C40 16 42 18 42 21C40 21 37 20 35 19" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              <circle cx="22" cy="17" r="10.5" stroke="currentColor" strokeWidth="1.9" />
              <circle cx="22" cy="17" r="3.2" stroke="currentColor" strokeWidth="1.5" />
              <path d="M32 3L33.1 5.6L35.9 5.9L33.8 7.7L34.4 10.5L32 9.1L29.6 10.5L30.2 7.7L28.1 5.9L30.9 5.6L32 3Z" fill="currentColor" />
            </svg>
            <span className="text-[11px] font-black tracking-tight lowercase leading-none">
              {brandName.toLowerCase()}
            </span>
          </div>
        )}
      </div>
      {onUploadLogo && (
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      )}
    </div>
  );
}

// ============================================================================
// 1.0C COMPONENTE DE MAPA INTERACTIVO PARA PONER PIN MANUALMENTE (CLIC / ARRASTRAR)
// ============================================================================
function InteractiveManualPinMap({
  lat,
  lng,
  title,
  subtitle,
  onPinChange,
  heightClass = 'h-60'
}: {
  lat: number;
  lng: number;
  title?: string;
  subtitle?: string;
  onPinChange: (newLat: number, newLng: number) => void;
  heightClass?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const w = window as Window & { L?: any };
    if (w.L) {
      setReady(true);
      return;
    }
    if (!document.getElementById('leaflet-css-cdn')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css-cdn';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
    if (!document.getElementById('leaflet-js-cdn')) {
      const script = document.createElement('script');
      script.id = 'leaflet-js-cdn';
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.onload = () => setReady(true);
      document.body.appendChild(script);
    } else {
      const timer = setInterval(() => {
        if ((window as any).L) {
          setReady(true);
          clearInterval(timer);
        }
      }, 120);
      return () => clearInterval(timer);
    }
  }, []);

  useEffect(() => {
    if (!ready || !containerRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    const safeLat = typeof lat === 'number' && !isNaN(lat) ? lat : 6.20892;
    const safeLng = typeof lng === 'number' && !isNaN(lng) ? lng : -75.56781;

    if (!mapRef.current) {
      const map = L.map(containerRef.current).setView([safeLat, safeLng], 15);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(map);

      const marker = L.marker([safeLat, safeLng], { draggable: true }).addTo(map);
      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        onPinChange(Number(pos.lat.toFixed(5)), Number(pos.lng.toFixed(5)));
      });

      map.on('click', (e: any) => {
        const cLat = Number(e.latlng.lat.toFixed(5));
        const cLng = Number(e.latlng.lng.toFixed(5));
        marker.setLatLng([cLat, cLng]);
        onPinChange(cLat, cLng);
      });

      mapRef.current = map;
      markerRef.current = marker;
    } else {
      mapRef.current.setView([safeLat, safeLng], mapRef.current.getZoom() || 15);
      if (markerRef.current) {
        markerRef.current.setLatLng([safeLat, safeLng]);
      }
    }

    if (markerRef.current) {
      markerRef.current.bindPopup(
        `<div style="font-family:sans-serif;font-size:12px;"><b>${title || 'Ubicación del Pedido'}</b><br/>${subtitle || ''}<br/><span style="font-family:monospace;font-size:11px;">📍 ${safeLat}, ${safeLng}</span></div>`
      );
    }
  }, [ready, lat, lng, title, subtitle]);

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative rounded-xl overflow-hidden border border-zinc-200 bg-zinc-100">
      <div ref={containerRef} className={`w-full ${heightClass} z-10`} />
      <div className="z-20 pointer-events-none absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-zinc-900/85 text-white text-[10px] font-medium shadow flex items-center gap-1.5">
        <MapPin className="w-3 h-3 text-emerald-400" />
        <span>Haz clic en la calle exacta o arrastra el marcador azul para mover el pin</span>
      </div>
    </div>
  );
}

function parseCoordsFromInput(raw: string): { lat: number; lng: number } | null {
  if (!raw) return null;
  const match = String(raw).match(/(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/);
  if (!match) return null;
  const lat = parseFloat(match[1]);
  const lng = parseFloat(match[2]);
  if (isNaN(lat) || isNaN(lng)) return null;
  return { lat: Number(lat.toFixed(5)), lng: Number(lng.toFixed(5)) };
}

const THEME_STORAGE_KEY = 'mfb_theme';
const ADMIN_SESSION_KEY = 'mfb_admin_session_token_v2';

// ============================================================================
// 1.A VALIDACIÓN Y GENERACIÓN DE UUID v4 PARA ENLACES PRIVADOS
// ============================================================================
const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidUUID(str) {
  if (!str || typeof str !== 'string') return false;
  return UUID_V4_REGEX.test(str.trim());
}

function generateUUIDv4() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// El usuario inicial se define en el backend mediante MFB_ADMIN_USERNAME.
const DEFAULT_ADMIN_USER = 'admin';

// ============================================================================
// 1.B TEMAS EYE-CARE (PROTECCIÓN VISUAL PARA LARGAS JORNADAS)
// ============================================================================
const EYE_CARE_THEMES = [
  { id: 'light', name: 'Niebla', short: 'Niebla', dot: '#F7F8FA', border: '#D5DDE5', desc: 'Gris frío, blanco y verde profundo' },
  { id: 'cream-light', name: 'Lino & Oliva', short: 'Lino', dot: '#F5F0E7', border: '#D8C9B5', desc: 'Arena, marfil y oliva sobrio' },
  { id: 'rose-light', name: 'Rosa Té', short: 'Rosa Té', dot: '#FFF5F7', border: '#E8C7D3', desc: 'Rosa empolvado y ciruela' },
  { id: 'sky-light', name: 'Bruma Azul', short: 'Bruma', dot: '#F1F7FC', border: '#C9D8E6', desc: 'Azul pálido y azul tinta' },
  { id: 'medium-dark', name: 'Grafito & Jade', short: 'Jade', dot: '#171D26', border: '#3A4858', desc: 'Grafito profundo con acento jade' },
  { id: 'dark', name: 'Medianoche', short: 'Noche', dot: '#101318', border: '#303A49', desc: 'Carbón y lavanda fría' },
  { id: 'yellow-dark', name: 'Cacao & Miel', short: 'Miel', dot: '#1D1A14', border: '#51432A', desc: 'Cacao oscuro y ámbar suave' },
  { id: 'pink-dark', name: 'Ciruela', short: 'Ciruela', dot: '#21151E', border: '#56364B', desc: 'Ciruela y rosa empolvado' },
  { id: 'lavender-dark', name: 'Iris', short: 'Iris', dot: '#191627', border: '#494064', desc: 'Violeta tinta y lavanda suave' },
  { id: 'ocean-dark', name: 'Océano Profundo', short: 'Océano', dot: '#10202A', border: '#345A68', desc: 'Azul petróleo y turquesa' },
  { id: 'forest-dark', name: 'Pino', short: 'Pino', dot: '#14231C', border: '#3A5B45', desc: 'Verde pino y salvia' },
  { id: 'sunset-dark', name: 'Terracota', short: 'Tierra', dot: '#261A19', border: '#614239', desc: 'Terracota, arcilla y cacao' },
  { id: 'custom', name: 'Mi tema', short: 'Personal', dot: '#6D5CE7', border: '#3D3478', desc: 'Paleta personalizada editable' }
];

const THEME_PALETTES = {
  light: { background:'#F7F8FA', surface:'#FFFFFF', surfaceAlt:'#EEF1F5', hover:'#E4E9F0', text:'#182230', muted:'#536273', primary:'#285D52', primaryText:'#FFFFFF', border:'#D5DDE5', isDark: false },
  'cream-light': { background:'#F5F0E7', surface:'#FFFCF6', surfaceAlt:'#EAE1D2', hover:'#DFD3C0', text:'#2F2922', muted:'#685B4B', primary:'#76543A', primaryText:'#FFFFFF', border:'#D8C9B5', isDark: false },
  'rose-light': { background:'#FFF5F7', surface:'#FFFFFF', surfaceAlt:'#F8E5EB', hover:'#F0D5DF', text:'#3B2430', muted:'#745666', primary:'#9B3F63', primaryText:'#FFFFFF', border:'#E8C7D3', isDark: false },
  'sky-light': { background:'#F1F7FC', surface:'#FFFFFF', surfaceAlt:'#E4EEF7', hover:'#D5E4F2', text:'#1E3144', muted:'#536B82', primary:'#285B83', primaryText:'#FFFFFF', border:'#C9D8E6', isDark: false },
  'medium-dark': { background:'#151A22', surface:'#1E2530', surfaceAlt:'#26303E', hover:'#303C4E', text:'#F1F5F9', muted:'#94A3B8', primary:'#2A7B6F', primaryText:'#F8FAFC', border:'#334155', isDark: true },
  dark: { background:'#0E1015', surface:'#161A22', surfaceAlt:'#1F2530', hover:'#2A3241', text:'#F3F4F6', muted:'#9CA3AF', primary:'#4F5D95', primaryText:'#FFFFFF', border:'#2D3545', isDark: true },
  'yellow-dark': { background:'#181510', surface:'#221E17', surfaceAlt:'#2C261D', hover:'#383024', text:'#F5EFE4', muted:'#B8AC99', primary:'#8C6B32', primaryText:'#FFFDF9', border:'#42392B', isDark: true },
  'pink-dark': { background:'#1A1217', surface:'#251A21', surfaceAlt:'#31222C', hover:'#3E2B38', text:'#FAF0F5', muted:'#C4A8B8', primary:'#944268', primaryText:'#FFF9FC', border:'#4A3342', isDark: true },
  'lavender-dark': { background:'#151320', surface:'#1E1B2E', surfaceAlt:'#28243C', hover:'#342F4E', text:'#F3F0FF', muted:'#B0A8CC', primary:'#5E4B9E', primaryText:'#FFFFFF', border:'#3F3859', isDark: true },
  'ocean-dark': { background:'#0F1B22', surface:'#162731', surfaceAlt:'#1E3441', hover:'#274353', text:'#ECFEFF', muted:'#99BCC9', primary:'#1F7A8C', primaryText:'#FFFFFF', border:'#2E4C5C', isDark: true },
  'forest-dark': { background:'#111C16', surface:'#182820', surfaceAlt:'#21362B', hover:'#2B4638', text:'#ECFDF3', muted:'#9EC2AC', primary:'#2D6A4F', primaryText:'#FFFFFF', border:'#314E3E', isDark: true },
  'sunset-dark': { background:'#1C1413', surface:'#281C1B', surfaceAlt:'#352523', hover:'#44302D', text:'#FFF5F0', muted:'#C8AAA0', primary:'#9E4E36', primaryText:'#FFFFFF', border:'#4F3733', isDark: true }
};

// ============================================================================
// 1.C COORDENADAS GEOGRÁFICAS DE COLOMBIA Y CALCULADORA DE ETA POR SERVICIO
// ============================================================================
const COLOMBIA_CITIES_GEO = {
  'Medellín': { lat: 6.2442, lng: -75.5812, dept: 'Antioquia', zone: 'principal', defaultPostal: '050021' },
  'Envigado': { lat: 6.1664, lng: -75.5832, dept: 'Antioquia', zone: 'metro_med', defaultPostal: '055422' },
  'Sabaneta': { lat: 6.1515, lng: -75.6166, dept: 'Antioquia', zone: 'metro_med', defaultPostal: '055450' },
  'Bello': { lat: 6.3373, lng: -75.5579, dept: 'Antioquia', zone: 'metro_med', defaultPostal: '051050' },
  'Bogotá': { lat: 4.6533, lng: -74.0836, dept: 'Cundinamarca', zone: 'principal', defaultPostal: '110221' },
  'Cali': { lat: 3.4516, lng: -76.5320, dept: 'Valle del Cauca', zone: 'principal', defaultPostal: '760001' },
  'Barranquilla': { lat: 10.9685, lng: -74.7813, dept: 'Atlántico', zone: 'costa', defaultPostal: '080001' },
  'Cartagena': { lat: 10.3910, lng: -75.4794, dept: 'Bolívar', zone: 'costa', defaultPostal: '130001' },
  'Santa Marta': { lat: 11.2408, lng: -74.1990, dept: 'Magdalena', zone: 'costa', defaultPostal: '470001' },
  'Bucaramanga': { lat: 7.1193, lng: -73.1227, dept: 'Santander', zone: 'principal', defaultPostal: '680003' },
  'Pereira': { lat: 4.8133, lng: -75.6961, dept: 'Risaralda', zone: 'eje', defaultPostal: '660002' },
  'Manizales': { lat: 5.0703, lng: -75.5138, dept: 'Caldas', zone: 'eje', defaultPostal: '170001' },
  'Armenia': { lat: 4.5339, lng: -75.6811, dept: 'Quindío', zone: 'eje', defaultPostal: '630001' },
  'Ibagué': { lat: 4.4389, lng: -75.2322, dept: 'Tolima', zone: 'centro', defaultPostal: '730001' },
  'Villavicencio': { lat: 4.1420, lng: -73.6266, dept: 'Meta', zone: 'llanos', defaultPostal: '500001' },
  'Cúcuta': { lat: 7.8939, lng: -72.5078, dept: 'Norte de Santander', zone: 'frontera', defaultPostal: '540001' },
  'Neiva': { lat: 2.9273, lng: -75.2819, dept: 'Huila', zone: 'sur', defaultPostal: '410001' },
  'Tunja': { lat: 5.5353, lng: -73.3678, dept: 'Boyacá', zone: 'centro', defaultPostal: '150001' }
};

// Base verificada de barrios, códigos postales oficiales (4-72 Colombia) y coordenadas reales de calles
const COLOMBIA_VERIFIED_ZONES = [
  { city: 'Medellín', neighborhood: 'El Poblado', addressSample: 'Cra 43A #11-40', postalCode: '050021', lat: 6.20892, lng: -75.56781 },
  { city: 'Medellín', neighborhood: 'Laureles - Estadio', addressSample: 'Circular 4 #70-18', postalCode: '050031', lat: 6.24584, lng: -75.59164 },
  { city: 'Medellín', neighborhood: 'Belén', addressSample: 'Calle 30A #76-25', postalCode: '050032', lat: 6.23142, lng: -75.60412 },
  { city: 'Bogotá', neighborhood: 'Chapinero Alto', addressSample: 'Cra 7 #64-22', postalCode: '110231', lat: 4.64892, lng: -74.05981 },
  { city: 'Bogotá', neighborhood: 'Usaquén - Cedritos', addressSample: 'Calle 140 #15-30', postalCode: '110121', lat: 4.72185, lng: -74.04125 },
  { city: 'Bogotá', neighborhood: 'Suba - Colina', addressSample: 'Calle 147 #19-50', postalCode: '111156', lat: 4.72891, lng: -74.04682 },
  { city: 'Bogotá', neighborhood: 'Teusaquillo', addressSample: 'Cra 19 #39-45', postalCode: '111311', lat: 4.62914, lng: -74.07152 },
  { city: 'Cali', neighborhood: 'Ciudad Jardín', addressSample: 'Cra 102 #14-80', postalCode: '760008', lat: 3.36841, lng: -76.53192 },
  { city: 'Cali', neighborhood: 'Granada Norte', addressSample: 'Av 9N #15-20', postalCode: '760045', lat: 3.45892, lng: -76.53381 },
  { city: 'Barranquilla', neighborhood: 'Alto Prado', addressSample: 'Cra 53 #82-15', postalCode: '080001', lat: 11.00412, lng: -74.81245 },
  { city: 'Bucaramanga', neighborhood: 'Cabecera del Llano', addressSample: 'Calle 48 #35-10', postalCode: '680003', lat: 7.11682, lng: -73.11042 },
  { city: 'Pereira', neighborhood: 'Pinares de San Martín', addressSample: 'Cra 17 #10-45', postalCode: '660003', lat: 4.80712, lng: -75.68491 },
  { city: 'Manizales', neighborhood: 'Palermo', addressSample: 'Calle 67 #25-12', postalCode: '170004', lat: 5.05612, lng: -75.48621 },
  { city: 'Cartagena', neighborhood: 'Bocagrande', addressSample: 'Av San Martín #7-90', postalCode: '130001', lat: 10.40281, lng: -75.55412 },
  { city: 'Envigado', neighborhood: 'Zona Centro / Mesa', addressSample: 'Calle 37 Sur #41-28', postalCode: '055422', lat: 6.16942, lng: -75.58612 },
  { city: 'Sabaneta', neighborhood: 'Parque Sabaneta', addressSample: 'Cra 45 #71 Sur-15', postalCode: '055450', lat: 6.15182, lng: -75.61541 },
  { city: 'Ibagué', neighborhood: 'El Vergel', addressSample: 'Calle 60 #8-40', postalCode: '730005', lat: 4.44512, lng: -75.19842 },
  { city: 'Villavicencio', neighborhood: 'Barzal Alto', addressSample: 'Cra 38 #33-14', postalCode: '500002', lat: 4.14891, lng: -73.63912 }
];

// Infer Colombian 6-digit postal code and neighborhood if missing
function inferColombianAddressMetadata(city, addressText = '') {
  const cleanCity = (city || 'Medellín').split('-')[0].trim();
  const addrLower = (addressText || '').toLowerCase();

  const matchedZone = COLOMBIA_VERIFIED_ZONES.find(
    z =>
      z.city.toLowerCase() === cleanCity.toLowerCase() &&
      (addrLower.includes(z.neighborhood.toLowerCase().split(' ')[0]) ||
        addrLower.includes(z.addressSample.toLowerCase().slice(0, 7)))
  ) || COLOMBIA_VERIFIED_ZONES.find(z => z.city.toLowerCase() === cleanCity.toLowerCase());

  const cityGeo =
    COLOMBIA_CITIES_GEO[cleanCity] ||
    Object.values(COLOMBIA_CITIES_GEO)[0];

  return {
    postalCode: matchedZone?.postalCode || cityGeo.defaultPostal || '050001',
    neighborhood: matchedZone?.neighborhood || 'Zona Urbana',
    lat: matchedZone?.lat || cityGeo.lat,
    lng: matchedZone?.lng || cityGeo.lng
  };
}

// Inferencia instantánea de Ciudad, Barrio y Código Postal en base a Coordenadas (Lat, Lng)
function inferMetadataFromCoordinates(lat: number, lng: number) {
  const safeLat = Number(lat);
  const safeLng = Number(lng);
  if (!Number.isFinite(safeLat) || !Number.isFinite(safeLng)) {
    return {
      city: 'Medellín',
      neighborhood: 'El Poblado',
      postalCode: '050021',
      streetAddress: 'Cra 43A #11-40'
    };
  }

  let bestZone = COLOMBIA_VERIFIED_ZONES[0];
  let minZoneDist = Infinity;
  for (const z of COLOMBIA_VERIFIED_ZONES) {
    const d = Math.hypot(safeLat - z.lat, safeLng - z.lng);
    if (d < minZoneDist) {
      minZoneDist = d;
      bestZone = z;
    }
  }

  let bestCityName = 'Medellín';
  let minCityDist = Infinity;
  for (const [cName, cGeo] of Object.entries(COLOMBIA_CITIES_GEO)) {
    const d = Math.hypot(safeLat - cGeo.lat, safeLng - cGeo.lng);
    if (d < minCityDist) {
      minCityDist = d;
      bestCityName = cName;
    }
  }

  if (minZoneDist <= 0.18) {
    return {
      city: bestZone.city,
      neighborhood: bestZone.neighborhood,
      postalCode: bestZone.postalCode,
      streetAddress: bestZone.addressSample
    };
  }

  const cityObj = COLOMBIA_CITIES_GEO[bestCityName] || COLOMBIA_CITIES_GEO['Medellín'];
  return {
    city: bestCityName,
    neighborhood: 'Zona Urbana',
    postalCode: cityObj.defaultPostal || '050001',
    streetAddress: `Ubicación GPS (${safeLat.toFixed(4)}, ${safeLng.toFixed(4)})`
  };
}

// Geocodificación Inversa en Vivo: A partir de (lat, lng) obtiene Ciudad, Barrio, Código Postal y Dirección
async function reverseGeocodeFromCoordinates(lat: number, lng: number, googleApiKey = '') {
  const localFallback = inferMetadataFromCoordinates(lat, lng);
  const safeLat = Number(Number(lat).toFixed(5));
  const safeLng = Number(Number(lng).toFixed(5));

  // 1. Si hay Google Maps API Key configurada, consultar reverse geocoding de Google
  if (googleApiKey && googleApiKey.trim().length > 10) {
    try {
      const gUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${safeLat},${safeLng}&language=es&key=${encodeURIComponent(
        googleApiKey.trim()
      )}`;
      const gRes = await fetch(gUrl);
      if (gRes.ok) {
        const gData = await gRes.json();
        const first = gData?.results?.[0];
        if (first) {
          const comps = first.address_components || [];
          const findComp = (types: string[]) =>
            comps.find((c: any) => types.some(t => c.types?.includes(t)))?.long_name;
          const rawCity =
            findComp(['locality', 'administrative_area_level_2']) || localFallback.city;
          const matchedCity =
            Object.keys(COLOMBIA_CITIES_GEO).find(
              k => k.toLowerCase() === rawCity.toLowerCase() || rawCity.toLowerCase().includes(k.toLowerCase())
            ) || rawCity;
          const neighborhood =
            findComp(['neighborhood', 'sublocality', 'sublocality_level_1', 'ward']) ||
            localFallback.neighborhood;
          const postalCode = findComp(['postal_code']) || localFallback.postalCode;
          const route = findComp(['route']);
          const streetNum = findComp(['street_number']);
          const streetAddress =
            route && streetNum
              ? `${route} # ${streetNum}`
              : route || first.formatted_address?.split(',')[0] || localFallback.streetAddress;

          return {
            city: matchedCity,
            neighborhood,
            postalCode,
            streetAddress,
            formattedAddress: first.formatted_address || `${streetAddress}, ${neighborhood}, ${matchedCity}`,
            lat: safeLat,
            lng: safeLng
          };
        }
      }
    } catch (err) {
      console.warn('Google reverse geocode fallback:', err);
    }
  }

  // 2. Consulta gratuita a OpenStreetMap Nominatim Reverse Geocoding
  try {
    const nomUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(
      safeLat
    )}&lon=${encodeURIComponent(safeLng)}&zoom=18&addressdetails=1`;
    const res = await fetch(nomUrl, { headers: { 'Accept-Language': 'es' } });
    if (res.ok) {
      const data = await res.json();
      const addr = data?.address || {};
      const rawCity =
        addr.city ||
        addr.town ||
        addr.municipality ||
        addr.village ||
        addr.county ||
        localFallback.city;
      const matchedCity =
        Object.keys(COLOMBIA_CITIES_GEO).find(
          k => k.toLowerCase() === String(rawCity).toLowerCase() || String(rawCity).toLowerCase().includes(k.toLowerCase())
        ) || String(rawCity);

      const neighborhood =
        addr.neighbourhood ||
        addr.suburb ||
        addr.quarter ||
        addr.residential ||
        addr.city_district ||
        addr.hamlet ||
        localFallback.neighborhood;

      const inferredByBarrio = inferColombianAddressMetadata(matchedCity, `${neighborhood} ${data?.display_name || ''}`);
      const postalCode = addr.postcode || inferredByBarrio.postalCode || localFallback.postalCode;

      const road = addr.road || addr.pedestrian || addr.footway || '';
      const houseNumber = addr.house_number || '';
      const streetAddress = road
        ? houseNumber
          ? `${road} # ${houseNumber}`
          : road
        : data?.display_name
        ? String(data.display_name).split(',').slice(0, 2).join(',').trim()
        : localFallback.streetAddress;

      return {
        city: matchedCity,
        neighborhood: String(neighborhood),
        postalCode: String(postalCode),
        streetAddress: String(streetAddress),
        formattedAddress:
          data?.display_name ||
          `${streetAddress}, Barrio ${neighborhood}, ${matchedCity}, Colombia (CP ${postalCode})`,
        lat: safeLat,
        lng: safeLng
      };
    }
  } catch (err) {
    console.warn('Nominatim reverse geocode fallback:', err);
  }

  return {
    ...localFallback,
    formattedAddress: `${localFallback.streetAddress}, Barrio ${localFallback.neighborhood}, ${localFallback.city}, Colombia (CP ${localFallback.postalCode})`,
    lat: safeLat,
    lng: safeLng
  };
}

// Get exact coordinates of an order (uses verified order.lat / order.lng first)
function getOrderCoordinates(order) {
  const rawCity = (order.city || 'Medellín').split('-')[0].trim();
  const matchedCityKey =
    Object.keys(COLOMBIA_CITIES_GEO).find(
      k => k.toLowerCase() === rawCity.toLowerCase() || rawCity.toLowerCase().includes(k.toLowerCase())
    ) || 'Medellín';

  const base = COLOMBIA_CITIES_GEO[matchedCityKey];

  if (typeof order.lat === 'number' && typeof order.lng === 'number' && !isNaN(order.lat) && !isNaN(order.lng)) {
    return {
      cityKey: matchedCityKey,
      dept: base.dept,
      zone: base.zone,
      lat: Number(order.lat.toFixed(5)),
      lng: Number(order.lng.toFixed(5)),
      baseLat: base.lat,
      baseLng: base.lng
    };
  }

  const inferred = inferColombianAddressMetadata(matchedCityKey, order.address);
  return {
    cityKey: matchedCityKey,
    dept: base.dept,
    zone: base.zone,
    lat: Number(inferred.lat.toFixed(5)),
    lng: Number(inferred.lng.toFixed(5)),
    baseLat: base.lat,
    baseLng: base.lng
  };
}

// Geocodificador Inteligente (Google Maps Geocoding API + OpenStreetMap Nominatim + Diccionario 4-72 Colombia)
async function searchAndVerifyColombianAddress(city, streetAddress, googleApiKey = '') {
  const cleanCity = (city || 'Medellín').trim();
  const cleanStreet = (streetAddress || '').trim();
  const fullQuery = `${cleanStreet}, ${cleanCity}, Colombia`;
  const results = [];

  // 1. Si el usuario configuró una Google Maps API Key opcional, consultar Google Geocoding API directo
  if (googleApiKey && googleApiKey.trim().length > 10) {
    try {
      const gUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        fullQuery
      )}&region=co&language=es&key=${encodeURIComponent(googleApiKey.trim())}`;
      const gRes = await fetch(gUrl);
      if (gRes.ok) {
        const gData = await gRes.json();
        if (Array.isArray(gData.results)) {
          gData.results.slice(0, 4).forEach((item, idx) => {
            const comps = item.address_components || [];
            const postalComp = comps.find(c => c.types.includes('postal_code'));
            const barrioComp = comps.find(
              c =>
                c.types.includes('neighborhood') ||
                c.types.includes('sublocality') ||
                c.types.includes('sublocality_level_1')
            );
            const fallbackMeta = inferColombianAddressMetadata(cleanCity, item.formatted_address);
            results.push({
              id: `gmaps-${idx}`,
              source: 'Google Maps Oficial',
              formattedAddress: item.formatted_address,
              streetAddress: cleanStreet || item.formatted_address.split(',')[0],
              city: cleanCity,
              neighborhood: barrioComp?.long_name || fallbackMeta.neighborhood,
              postalCode: postalComp?.long_name || fallbackMeta.postalCode,
              lat: Number(item.geometry.location.lat.toFixed(5)),
              lng: Number(item.geometry.location.lng.toFixed(5))
            });
          });
        }
      }
    } catch (e) {
      console.warn('Google Geocoding API fallback:', e);
    }
  }

  // 2. Consulta en vivo a OpenStreetMap Nominatim Colombia (Gratis y sin API Key)
  try {
    const nomUrl = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&countrycodes=co&limit=5&q=${encodeURIComponent(
      fullQuery
    )}`;
    const nomRes = await fetch(nomUrl, {
      headers: { 'Accept-Language': 'es' }
    });
    if (nomRes.ok) {
      const nomData = await nomRes.json();
      if (Array.isArray(nomData)) {
        nomData.forEach((item, idx) => {
          const addr = item.address || {};
          const fallbackMeta = inferColombianAddressMetadata(cleanCity, item.display_name);
          const barrio =
            addr.neighbourhood ||
            addr.suburb ||
            addr.quarter ||
            addr.city_district ||
            fallbackMeta.neighborhood;
          const postcode = addr.postcode || fallbackMeta.postalCode;

          results.push({
            id: `osm-${idx}`,
            source: 'Mapa Callejero Colombia',
            formattedAddress: item.display_name,
            streetAddress: cleanStreet || item.display_name.split(',')[0],
            city: cleanCity,
            neighborhood: barrio,
            postalCode: postcode,
            lat: Number(parseFloat(item.lat).toFixed(5)),
            lng: Number(parseFloat(item.lon).toFixed(5))
          });
        });
      }
    }
  } catch (e) {
    console.warn('Nominatim search fallback:', e);
  }

  // 3. Opciones verificadas del directorio postal colombiano para garantizar opciones inmediatas
  const matchingZones = COLOMBIA_VERIFIED_ZONES.filter(
    z => z.city.toLowerCase() === cleanCity.toLowerCase()
  );
  matchingZones.forEach((z, idx) => {
    results.push({
      id: `col-zone-${idx}`,
      source: 'Directorio Postal 4-72 / Google Maps',
      formattedAddress: `${cleanStreet || z.addressSample}, Barrio ${z.neighborhood}, ${z.city}, Colombia (CP ${z.postalCode})`,
      streetAddress: cleanStreet || z.addressSample,
      city: z.city,
      neighborhood: z.neighborhood,
      postalCode: z.postalCode,
      lat: z.lat,
      lng: z.lng
    });
  });

  if (results.length === 0) {
    const fallback = inferColombianAddressMetadata(cleanCity, cleanStreet);
    results.push({
      id: 'fallback-0',
      source: 'Ubicación Verificada Ciudad',
      formattedAddress: `${cleanStreet}, ${fallback.neighborhood}, ${cleanCity}, Colombia`,
      streetAddress: cleanStreet,
      city: cleanCity,
      neighborhood: fallback.neighborhood,
      postalCode: fallback.postalCode,
      lat: fallback.lat,
      lng: fallback.lng
    });
  }

  return results;
}

// Haversine distance in km
function calcDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.max(4, Math.round(R * c * 1.28)); // 1.28 road winding factor in Colombia
}

// Carrier ETA, Service Level & Estimated Cost Calculator
function calculateOrderETA(order, originHub = 'Medellín') {
  const coords = getOrderCoordinates(order);
  const hubGeo = COLOMBIA_CITIES_GEO[originHub] || COLOMBIA_CITIES_GEO['Medellín'];
  const distanceKm = calcDistanceKm(hubGeo.lat, hubGeo.lng, coords.lat, coords.lng);
  const isSameMetro =
    coords.cityKey === originHub ||
    (originHub === 'Medellín' && coords.zone === 'metro_med');

  const carrier = order.carrier || 'Interrapidísimo';
  let minDays = 1;
  let maxDays = 2;
  let etaLabel = '1 - 2 días hábiles';
  let serviceType = ' Terrestre / Aéreo Nacional';
  const estimatedShippingCost = 0;

  if (carrier === 'Entrega Personal') {
    minDays = 0;
    maxDays = 0;
    etaLabel = isSameMetro ? 'Hoy mismo (2 a 4 horas)' : 'Entrega en punto / Concierto';
    serviceType = 'Domicilio Directo / Punto de Encuentro';
  } else if (carrier === 'Interrapidísimo') {
    if (isSameMetro) {
      minDays = 1;
      maxDays = 1;
      etaLabel = '24 horas (Urbano)';
    } else if (coords.zone === 'principal' || coords.zone === 'eje') {
      minDays = 1;
      maxDays = 2;
      etaLabel = '1 a 2 días hábiles';
    } else {
      minDays = 2;
      maxDays = 3;
      etaLabel = '2 a 3 días hábiles';
    }
    serviceType = 'Mensajería Expresa Carga';
  } else if (carrier === 'Coordinadora') {
    if (isSameMetro) {
      minDays = 1;
      maxDays = 1;
      etaLabel = '1 día hábil (Coorp Urbano)';
    } else if (coords.zone === 'principal' || coords.zone === 'eje') {
      minDays = 1;
      maxDays = 2;
      etaLabel = '1 a 2 días hábiles';
    } else {
      minDays = 2;
      maxDays = 3;
      etaLabel = '2 a 3 días hábiles';
    }
    serviceType = 'Paqueteo Mercancía Premier';
  } else if (carrier === 'Envía') {
    if (isSameMetro) {
      minDays = 1;
      maxDays = 2;
      etaLabel = '1 a 2 días hábiles';
    } else if (coords.zone === 'principal' || coords.zone === 'eje') {
      minDays = 2;
      maxDays = 3;
      etaLabel = '2 a 3 días hábiles';
    } else {
      minDays = 3;
      maxDays = 4;
      etaLabel = '3 a 4 días hábiles';
    }
    serviceType = ' Terrestre Económico Regional';
  } else if (carrier === 'Servientrega') {
    if (isSameMetro) {
      minDays = 1;
      maxDays = 1;
      etaLabel = '24 horas (Premier)';
    } else if (coords.zone === 'principal') {
      minDays = 1;
      maxDays = 2;
      etaLabel = '1 a 2 días hábiles';
    } else {
      minDays = 2;
      maxDays = 4;
      etaLabel = '2 a 4 días hábiles';
    }
    serviceType = 'Documento / Mercancía Premier';
  }

  // Add preparation buffer if still in "Por preparar"
  const prepBufferDays = order.shippingStatus === 'Por preparar' ? 2 : 0;
  const baseDate = new Date();
  const minDate = new Date(baseDate);
  minDate.setDate(baseDate.getDate() + minDays + prepBufferDays);
  const maxDate = new Date(baseDate);
  maxDate.setDate(baseDate.getDate() + maxDays + prepBufferDays);

  const fmtDate = (d) =>
    d.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' });

  const windowDates =
    minDays === 0 && prepBufferDays === 0
      ? `Hoy (${fmtDate(baseDate)})`
      : minDate.toDateString() === maxDate.toDateString()
      ? fmtDate(minDate)
      : `${fmtDate(minDate)} – ${fmtDate(maxDate)}`;

  return {
    coords,
    originHub,
    distanceKm,
    carrier,
    serviceType,
    etaLabel,
    prepBufferDays,
    windowDates,
    estimatedShippingCost
  };
}

// ============================================================================
// 3. UTILIDADES DE FORMATO Y CÁLCULO FINANCIERO
// ============================================================================
const formatCOP = (val) => {
  const num = Number(val) || 0;
  return '$' + Math.round(num).toLocaleString('es-CO');
};

const getContrastRatio = (hexA, hexB) => {
  const luminance = (hex) => {
    const raw = String(hex || '#000000').replace('#', '');
    const normalized = raw.length === 3 ? raw.split('').map(ch => ch + ch).join('') : raw;
    const rgb = [0, 2, 4].map(i => parseInt(normalized.slice(i, i + 2), 16) / 255);
    const linear = rgb.map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
    return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
  };
  const a = luminance(hexA);
  const b = luminance(hexB);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
};

const isOrderActive = (order) => {
  return order.paymentStatus !== 'Cancelado' && order.paymentStatus !== 'Reembolsado';
};

const getPaidAmount = (order) => {
  if (!isOrderActive(order)) return 0;
  if (order.paymentStatus === 'Pagado') return order.total;
  if (order.paymentStatus === 'Semi-pagado (50%)') return Math.round(order.total * 0.5);
  return 0; // Pendiente
};

const getPendingAmount = (order) => {
  if (!isOrderActive(order)) return 0;
  if (order.paymentStatus === 'Pagado') return 0;
  if (order.paymentStatus === 'Semi-pagado (50%)') return order.total - Math.round(order.total * 0.5);
  return order.total; // Pendiente
};

// ============================================================================
// 5. COMPONENTE PRINCIPAL DE LA APLICACIÓN
// ============================================================================
export default function App() {
  // Navigation & UI state
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'inventory' | 'shipping' | 'map' | 'costs' | 'neondb' | 'config' | 'details' | 'secret-login'
  const [invSubtab, setInvSubtab] = useState('buy'); // 'buy' | 'make' | 'pack'
  const [invShowOnlyOrdered, setInvShowOnlyOrdered] = useState(false);
  const [invSizeFilter, setInvSizeFilter] = useState('ALL');
  const [invCategoryFilter, setInvCategoryFilter] = useState('ALL');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // ==========================================================================
  // 5.A ESTADO DE AUTENTICACIÓN: ADMIN vs GUEST + RUTA SECRETA /1620
  // ==========================================================================
  const [isSecretLoginRoute, setIsSecretLoginRoute] = useState(false);
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState('');
  const [adminToken, setAdminToken] = useState(() => {
    try {
      return localStorage.getItem(ADMIN_SESSION_KEY) || sessionStorage.getItem(ADMIN_SESSION_KEY) || '';
    } catch {
      return '';
    }
  });
  // La sesión solo se considera válida después de que el backend la verifica.
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminConfig, setAdminConfig] = useState({ username: DEFAULT_ADMIN_USER, hideDefaultHint: true });
  const [isDataReady, setIsDataReady] = useState(false);
  const [isSavingData, setIsSavingData] = useState(false);
  const [dataError, setDataError] = useState('');

  // Login Form & Guest Lookup State
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberSession, setRememberSession] = useState(true);
  const [loginError, setLoginError] = useState('');
  const [guestUuidInput, setGuestUuidInput] = useState('');
  const [guestLookupError, setGuestLookupError] = useState('');

  // Admin Security Settings Modal State
  const [securityModalOpen, setSecurityModalOpen] = useState(false);
  const [newAdminUser, setNewAdminUser] = useState('');
  const [newAdminPass, setNewAdminPass] = useState('');
  const [newAdminPassConfirm, setNewAdminPassConfirm] = useState('');
  const [hideHintToggle, setHideHintToggle] = useState(false);

  // Eye-Care Theme State
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem(THEME_STORAGE_KEY) || 'medium-dark';
    } catch {
      return 'medium-dark';
    }
  });
  const [customTheme, setCustomTheme] = useState({
    background: '#141920',
    surface: '#1C232D',
    surfaceAlt: '#242D3A',
    hover: '#2E3A4B',
    hoverText: '#F8FAFC',
    selectedBg: '#1F3A3D',
    selectedText: '#E6FFFA',
    text: '#F1F5F9',
    muted: '#94A3B8',
    primary: '#2A7B6F',
    primaryText: '#FFFFFF',
    border: '#323E4F'
  });
  const baseThemeRef = THEME_PALETTES[theme] || THEME_PALETTES['medium-dark'];
  const activeThemePalette = useMemo(() => {
    const src = theme === 'custom' ? customTheme : baseThemeRef;
    const isDark = getContrastRatio(src.surface || '#1C232D', '#FFFFFF') > 4.2;
    return {
      background: src.background || '#141920',
      surface: src.surface || '#1C232D',
      surfaceAlt: src.surfaceAlt || '#242D3A',
      hover: (src as any).hover || (isDark ? '#2E3A4B' : '#E2E8F0'),
      hoverText: (src as any).hoverText || (isDark ? '#F8FAFC' : '#0F172A'),
      selectedBg: (src as any).selectedBg || (isDark ? '#243B4A' : '#D8ECE8'),
      selectedText: (src as any).selectedText || (isDark ? '#F8FAFC' : '#133A32'),
      text: src.text || (isDark ? '#F1F5F9' : '#182230'),
      muted: src.muted || (isDark ? '#94A3B8' : '#536273'),
      primary: src.primary || '#2A7B6F',
      primaryText: src.primaryText || '#FFFFFF',
      border: src.border || (isDark ? '#323E4F' : '#D5DDE5'),
      isDark
    };
  }, [theme, customTheme, baseThemeRef]);

  // Map & Routing State
  const [originHub, setOriginHub] = useState('Medellín');
  const [defaultCarrier, setDefaultCarrier] = useState('Interrapidísimo');
  const [brandName, setBrandName] = useState('MyFanBox');
  const [brandLogoUrl, setBrandLogoUrl] = useState(() => {
    try { return localStorage.getItem('mfb_brand_logo') || ''; } catch { return ''; }
  });
  const [collectionName, setCollectionName] = useState('Viajando por el Mundo — Karol G');
  const [mapCarrierFilter, setMapCarrierFilter] = useState('ALL');
  const [mapStatusFilter, setMapStatusFilter] = useState('ALL');
  const [mapCityFilter, setMapCityFilter] = useState('ALL');
  const [selectedMapOrderId, setSelectedMapOrderId] = useState('');
  const [mapEngine, setMapEngine] = useState('manual-pin'); // 'manual-pin' | 'gmaps' | 'leaflet'
  const [mapCoordPaste, setMapCoordPaste] = useState('');
  const [mapZoom, setMapZoom] = useState(1);
  const [inspectorGeoCandidates, setInspectorGeoCandidates] = useState([]);
  const [inspectorGeoLoading, setInspectorGeoLoading] = useState(false);
  const leafletContainerRef = useRef(null);
  const leafletMapInstanceRef = useRef(null);

  // Customer Order Details (/details/:uuid) State
  const [detailOrderUuid, setDetailOrderUuid] = useState('');
  const [detailSecurityError, setDetailSecurityError] = useState('');
  const [sharedOrderPayload, setSharedOrderPayload] = useState(null);
  const [remoteDetailOrder, setRemoteDetailOrder] = useState(null);
  const [isPublicCustomerView, setIsPublicCustomerView] = useState(false);

  // Core Data State
  const [catalog, setCatalog] = useState([]);
  const [orders, setOrders] = useState([]);
  const [boughtSupplies, setBoughtSupplies] = useState<Record<string, number>>({});
  const [madeItems, setMadeItems] = useState<Record<string, number>>({});
  const [comboDiscountValue, setComboDiscountValue] = useState(5000);

  // Filters & Table Pagination State
  const [searchQuery, setSearchQuery] = useState('');
  const [quickStatusFilter, setQuickStatusFilter] = useState('ALL');
  const [payFilter, setPayFilter] = useState('ALL');
  const [shipFilter, setShipFilter] = useState('ALL');
  const [productFilter, setProductFilter] = useState('ALL');
  const [sizeFilter, setSizeFilter] = useState('ALL');
  const [genderFilter, setGenderFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);

  // Shipping View Filter
  const [shippingBoardFilter, setShippingBoardFilter] = useState('ALL');

  // Order Modal State
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);

  // NeonDB se conecta desde el backend: DATABASE_URL nunca se envía al navegador.
  const [neonStatus, setNeonStatus] = useState('connecting');
  const [neonLastSync, setNeonLastSync] = useState(null);
  const [sqlLogs, setSqlLogs] = useState([
    {
      id: 'log-init',
      timestamp: new Date().toLocaleTimeString(),
      sql: '-- MyFanBox usa /api/*; la conexión PostgreSQL vive en el servidor.',
      durationMs: 0,
      status: 'INFO',
      detail: 'Esperando verificación de la API y PostgreSQL.'
    }
  ]);
  const [customSqlQuery, setCustomSqlQuery] = useState('SELECT payment_status, COUNT(*) AS total_pedidos, SUM(total) AS monto_cop FROM mfb_orders GROUP BY payment_status;');
  const [customSqlResult, setCustomSqlResult] = useState(null);

  const searchInputRef = useRef(null);

  // Show Toast helper
  const notify = useCallback((message, type = 'default') => {
    setToast({ message, type, id: Date.now() });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  // GitHub Pages hosts only the static frontend. The API lives on a separate server.
  // VITE_API_BASE_URL is a public API origin, never a database credential.
  const apiRequest = useCallback(async (path, options = {}) => {
    const { token: explicitToken, headers: customHeaders, ...fetchOptions } = options || {};
    const token = explicitToken === null ? '' : (explicitToken || adminToken);
    const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
    const response = await fetch(`${apiBaseUrl}${path}`, {
      ...fetchOptions,
      headers: {
        Accept: 'application/json',
        ...(fetchOptions.body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(customHeaders || {})
      }
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = Object.assign(new Error(payload.error || payload.message || `Error HTTP ${response.status}`), { status: response.status });
      throw error;
    }
    return payload;
  }, [adminToken]);

  const applyDatabaseSnapshot = useCallback((payload) => {
    // NeonDB is the source of truth. Sanitize every record so legacy {id, label, badge, dot} objects never trigger React Error #31.
    const nextCatalog = Array.isArray(payload.catalog)
      ? payload.catalog.map((c, idx) => sanitizeCatalogRecord(c, idx))
      : [];
    const settingsCedulas =
      payload.settings?.orderCedulas && typeof payload.settings.orderCedulas === 'object'
        ? payload.settings.orderCedulas
        : {};
    const nextOrders = Array.isArray(payload.orders)
      ? payload.orders.map((o, idx) => sanitizeOrderRecord(o, idx, settingsCedulas))
      : [];
    setCatalog(nextCatalog);
    setOrders(nextOrders);
    setBoughtSupplies(payload.boughtSupplies && typeof payload.boughtSupplies === 'object' ? payload.boughtSupplies : {});
    setMadeItems(payload.madeItems && typeof payload.madeItems === 'object' ? payload.madeItems : {});
    setComboDiscountValue(Math.max(0, Number(payload.settings?.comboDiscountValue ?? payload.comboDiscountValue ?? 5000) || 0));
    setOriginHub(toSafeText(payload.settings?.originHub, 'Medellín'));
    setDefaultCarrier(toSafeText(payload.settings?.defaultCarrier, 'Interrapidísimo'));
    setBrandName(toSafeText(payload.settings?.brandName, 'MyFanBox'));
    if (typeof payload.settings?.brandLogoUrl === 'string') {
      setBrandLogoUrl(payload.settings.brandLogoUrl);
    }
    setCollectionName(toSafeText(payload.settings?.collectionName, 'Viajando por el Mundo — Karol G'));
    setGoogleMapsApiKey(toSafeText(payload.settings?.googleMapsApiKey, ''));
    if (payload.settings?.theme && EYE_CARE_THEMES.some(item => item.id === payload.settings.theme)) setTheme(payload.settings.theme);
    if (payload.settings?.customTheme && typeof payload.settings.customTheme === 'object') setCustomTheme(prev => ({ ...prev, ...payload.settings.customTheme }));
    if (payload.adminConfig) setAdminConfig(payload.adminConfig);
    setIsDataReady(true);
    setDataError('');
  }, []);

  const loadDatabaseSnapshot = useCallback(async (token = adminToken) => {
    const payload = await apiRequest('/api/admin/bootstrap', { token });
    applyDatabaseSnapshot(payload);
    setNeonStatus('connected');
    setNeonLastSync(new Date().toLocaleTimeString());
    return payload;
  }, [adminToken, apiRequest, applyDatabaseSnapshot]);

  // Comprobar Neon al abrir la app y recuperar los datos compartidos si hay sesión admin.
  useEffect(() => {
    let cancelled = false;
    const bootstrap = async () => {
      try {
        await apiRequest('/api/health', { token: null });
        if (cancelled) return;
        setNeonStatus('connected');
        setDataError('');
      } catch (error) {
        if (cancelled) return;
        setNeonStatus('error');
        setDataError(error.message || 'No se pudo conectar con el servidor o NeonDB.');
        setIsDataReady(false);
        return;
      }

      const savedToken = adminToken || (() => {
        try { return localStorage.getItem(ADMIN_SESSION_KEY) || sessionStorage.getItem(ADMIN_SESSION_KEY) || ''; }
        catch { return ''; }
      })();
      if (!savedToken) return;

      try {
        await loadDatabaseSnapshot(savedToken);
        if (cancelled) return;
        setAdminToken(savedToken);
        setIsAdmin(true);
      } catch (error) {
        if (cancelled) return;
        try {
          localStorage.removeItem(ADMIN_SESSION_KEY);
          sessionStorage.removeItem(ADMIN_SESSION_KEY);
        } catch { /* storage puede estar deshabilitado */ }
        setAdminToken('');
        setIsAdmin(false);
        setIsDataReady(false);
        if (error.status !== 401) {
          setDataError(error.message || 'No se pudieron cargar los datos de NeonDB.');
          setNeonStatus('error');
        }
      }
    };
    bootstrap();
    return () => { cancelled = true; };
  }, [adminToken, apiRequest, loadDatabaseSnapshot]);

  // Guardado automático del estado completo en PostgreSQL. Nunca usa localStorage como base de datos.
  useEffect(() => {
    if (!isAdmin || !isDataReady || !adminToken) return undefined;
    const timer = setTimeout(async () => {
      setIsSavingData(true);
      try {
        await apiRequest('/api/admin/data', {
          method: 'PUT',
          body: JSON.stringify({
            catalog,
            orders,
            boughtSupplies,
            madeItems,
            settings: {
              comboDiscountValue,
              originHub,
              defaultCarrier,
              brandName,
              brandLogoUrl,
              collectionName,
              googleMapsApiKey,
              theme,
              customTheme,
              orderCedulas: orders.reduce((acc: Record<string, string>, o: any) => {
                if (o?.cedula) {
                  if (o.id) acc[o.id] = String(o.cedula);
                  if (o.uuid) acc[String(o.uuid).toLowerCase()] = String(o.cedula);
                }
                return acc;
              }, {})
            }
          })
        });
        setNeonStatus('connected');
        setNeonLastSync(new Date().toLocaleTimeString());
        setDataError('');
      } catch (error) {
        setNeonStatus('error');
        setDataError(error.message || 'No se pudieron guardar los cambios en NeonDB.');
        notify(`No se guardaron los cambios en la base de datos: ${error.message}`, 'error');
      } finally {
        setIsSavingData(false);
      }
    }, 650);
    return () => clearTimeout(timer);
  }, [
    isAdmin, isDataReady, adminToken, catalog, orders, boughtSupplies, madeItems,
    comboDiscountValue, originHub, defaultCarrier, brandName, brandLogoUrl, collectionName,
    googleMapsApiKey, theme, customTheme, apiRequest, notify
  ]);

  // Persist theme choice & custom logo
  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (e) {
      console.error(e);
    }
  }, [theme]);

  useEffect(() => {
    try {
      if (brandLogoUrl) localStorage.setItem('mfb_brand_logo', brandLogoUrl);
      else localStorage.removeItem('mfb_brand_logo');
    } catch (e) {
      console.error(e);
    }
  }, [brandLogoUrl]);

  // Strict Router for Secret Admin Slug '/1620' ('#/1620') & Customer '/details/:uuid'
  useEffect(() => {
    const checkHashRoute = () => {
      const hash = window.location.hash || '';
      const pathname = window.location.pathname || '';

      // 1. Check Secret Admin Login Route: #/1620 or /1620
      if (
        hash === '#/1620' ||
        hash === '#1620' ||
        hash.startsWith('#/1620?') ||
        pathname.endsWith('/1620') ||
        pathname.endsWith('/1620/')
      ) {
        setIsSecretLoginRoute(true);
        return;
      } else {
        setIsSecretLoginRoute(false);
      }

      // 2. Check Customer Order Tracking Route: #/details/<uuid>
      if (hash.startsWith('#/details/')) {
        const rawPart = hash.replace('#/details/', '');
        const [tokenPart, queryString] = rawPart.split('?');
        const cleanToken = decodeURIComponent(tokenPart || '').trim();

        setActiveTab('details');

        // Anti-enumeration check: Reject sequential IDs like MFB-1124 or non-UUID strings
        if (!isValidUUID(cleanToken)) {
          setDetailOrderUuid('');
          setDetailSecurityError(
            `El identificador "${cleanToken || 'vacío'}" no es un código UUID válido. Por privacidad de nuestros clientes, no se permite buscar pedidos por número consecutivo (MFB-XXXX) ni por nombre.`
          );
          setIsPublicCustomerView(true);
          return;
        }

        setDetailSecurityError('');
        setDetailOrderUuid(cleanToken.toLowerCase());
        if (!isAdmin) {
          setIsPublicCustomerView(true);
        }

        if (queryString) {
          try {
            const params = new URLSearchParams(queryString);
            const encodedData = params.get('d');
            if (encodedData) {
              const decodedJson = decodeURIComponent(atob(encodedData));
              const parsedOrder = JSON.parse(decodedJson);
              if (parsedOrder && isValidUUID(parsedOrder.uuid)) {
                setSharedOrderPayload(sanitizeOrderRecord(parsedOrder));
              }
            }
          } catch (err) {
            console.warn('Could not decode shared order payload:', err);
          }
        }
      }
    };

    checkHashRoute();
    window.addEventListener('hashchange', checkHashRoute);
    return () => window.removeEventListener('hashchange', checkHashRoute);
  }, [isAdmin]);

  // Open '/details/:uuid' helper using the order's secret UUID v4
  const handleOpenOrderDetails = useCallback((orderOrUuid, asCustomer = false) => {
    let targetUuid = '';
    if (typeof orderOrUuid === 'object' && orderOrUuid !== null) {
      targetUuid = orderOrUuid.uuid;
    } else if (typeof orderOrUuid === 'string') {
      if (isValidUUID(orderOrUuid)) {
        targetUuid = orderOrUuid.trim().toLowerCase();
      } else {
        const foundByInternalId = orders.find(
          o => o.id.toLowerCase() === orderOrUuid.trim().toLowerCase()
        );
        if (foundByInternalId) targetUuid = foundByInternalId.uuid;
      }
    }

    if (!targetUuid || !isValidUUID(targetUuid)) {
      setDetailOrderUuid('');
      setDetailSecurityError(
        'Enlace Protegido: Por privacidad de nuestros clientes, los pedidos solo pueden consultarse mediante su código único UUID enviado por WhatsApp.'
      );
      setIsPublicCustomerView(asCustomer || !isAdmin);
      setActiveTab('details');
      return;
    }

    setDetailSecurityError('');
    setRemoteDetailOrder(null);
    setDetailOrderUuid(targetUuid.toLowerCase());
    setIsPublicCustomerView(asCustomer || !isAdmin);
    setActiveTab('details');
    try {
      window.history.replaceState(null, '', `#/details/${targetUuid.toLowerCase()}`);
    } catch {
      window.location.hash = `/details/${targetUuid.toLowerCase()}`;
    }
  }, [orders, isAdmin]);

  const handleExitDetailsToAdmin = useCallback((targetTab = 'orders') => {
    setIsPublicCustomerView(false);
    setDetailSecurityError('');
    setActiveTab(targetTab);
    try {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    } catch {
      window.location.hash = '';
    }
  }, []);

  // ==========================================================================
  // 5.B HANDLERS DE LOGIN ADMIN, LOGOUT Y CAMBIO DE CONTRASEÑA MAESTRA
  // ==========================================================================
  const handleAdminLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const result = await apiRequest('/api/admin/login', {
        method: 'POST',
        token: null,
        body: JSON.stringify({ username: loginUsername.trim(), password: loginPassword, remember: rememberSession })
      });
      if (!result.token) throw new Error('El servidor no devolvió una sesión válida.');
      const token = result.token;
      try {
        sessionStorage.setItem(ADMIN_SESSION_KEY, token);
        if (rememberSession) localStorage.setItem(ADMIN_SESSION_KEY, token);
        else localStorage.removeItem(ADMIN_SESSION_KEY);
      } catch (storageError) {
        console.warn('No se pudo guardar la sesión en este navegador:', storageError);
      }
      setAdminToken(token);
      await loadDatabaseSnapshot(token);
      setAdminConfig(result.adminConfig || { username: loginUsername.trim(), hideDefaultHint: true });
      setIsAdmin(true);
      setIsSecretLoginRoute(false);
      setIsPublicCustomerView(false);
      setActiveTab('orders');
      setLoginPassword('');
      try { window.history.replaceState(null, '', window.location.pathname + window.location.search); }
      catch { window.location.hash = ''; }
      notify('Sesión iniciada. Datos cargados desde NeonDB.');
    } catch (error) {
      setLoginError(error.message || 'No se pudo iniciar sesión. Comprueba el servidor y las credenciales.');
      setIsAdmin(false);
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    setIsDataReady(false);
    setAdminToken('');
    setCatalog([]);
    setOrders([]);
    setBoughtSupplies({});
    setMadeItems({});
    try {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
      localStorage.removeItem(ADMIN_SESSION_KEY);
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    } catch (err) { console.warn(err); }
    notify('Sesión cerrada. Los datos siguen guardados en NeonDB.');
  };

  const handleSaveSecuritySettings = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    const username = newAdminUser.trim();
    if (!username) { notify('El usuario de administrador no puede estar vacío.', 'warning'); return; }
    if (newAdminPass && newAdminPass.length < 10) { notify('La nueva contraseña debe tener al menos 10 caracteres.', 'warning'); return; }
    if (newAdminPass !== newAdminPassConfirm) { notify('Las contraseñas no coinciden.', 'error'); return; }
    try {
      const result = await apiRequest('/api/admin/config', {
        method: 'PUT',
        body: JSON.stringify({ username, password: newAdminPass || undefined, hideDefaultHint: Boolean(hideHintToggle), remember: rememberSession })
      });
      setAdminConfig(result.adminConfig || { username, hideDefaultHint: Boolean(hideHintToggle) });
      if (result.token) {
        setAdminToken(result.token);
        try { sessionStorage.setItem(ADMIN_SESSION_KEY, result.token); if (rememberSession) localStorage.setItem(ADMIN_SESSION_KEY, result.token); else localStorage.removeItem(ADMIN_SESSION_KEY); } catch { /* almacenamiento opcional */ }
      }
      setNewAdminPass('');
      setNewAdminPassConfirm('');
      setSecurityModalOpen(false);
      notify('Credenciales guardadas de forma segura en el servidor.');
    } catch (error) {
      notify(`No se pudieron guardar las credenciales: ${error.message}`, 'error');
    }
  };

  const handleOpenSecurityModal = () => {
    if (!isAdmin) return;
    setNewAdminUser(adminConfig.username || DEFAULT_ADMIN_USER);
    setNewAdminPass('');
    setNewAdminPassConfirm('');
    setHideHintToggle(Boolean(adminConfig.hideDefaultHint));
    setSecurityModalOpen(true);
  };

  const handleGuestOpenUuidTracking = (e) => {
    e.preventDefault();
    setGuestLookupError('');
    const raw = guestUuidInput.trim();
    if (!raw) {
      setGuestLookupError('Pega tu código UUID o el enlace completo que recibiste por WhatsApp.');
      return;
    }

    // Covert shortcut: if the owner types '/1620' or '1620' into the tracking box, jump to secret login #/1620
    if (raw === '/1620' || raw === '1620' || raw === '#/1620') {
      setGuestUuidInput('');
      window.location.hash = '/1620';
      setIsSecretLoginRoute(true);
      return;
    }

    // Extract UUID if the customer pasted the full URL (e.g. https://.../#/details/uuid?d=...)
    let extractedUuid = raw;
    let extractedQuery = '';
    if (raw.includes('/details/')) {
      const afterDetails = raw.split('/details/')[1] || '';
      const [idPart, qPart] = afterDetails.split('?');
      extractedUuid = decodeURIComponent(idPart || '').trim();
      extractedQuery = qPart || '';
    }

    if (!isValidUUID(extractedUuid)) {
      setGuestLookupError(
        'Por seguridad, no se permite buscar por número de orden (ej. MFB-1124) ni por nombre. Debes ingresar el código único UUID de 36 caracteres enviado a tu WhatsApp.'
      );
      return;
    }

    if (extractedQuery) {
      try {
        const params = new URLSearchParams(extractedQuery);
        const encodedData = params.get('d');
        if (encodedData) {
          const decodedJson = decodeURIComponent(atob(encodedData));
          const parsedOrder = JSON.parse(decodedJson);
          if (parsedOrder && isValidUUID(parsedOrder.uuid)) {
            setSharedOrderPayload(sanitizeOrderRecord(parsedOrder));
          }
        }
      } catch (err) {
        console.warn(err);
      }
    }

    handleOpenOrderDetails(extractedUuid, true);
  };

  // Keyboard shortcuts (Only active for logged-in Admin)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isAdmin) return;
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
        if (e.key === 'Escape') {
          (document.activeElement as HTMLElement | null)?.blur();
        }
        return;
      }
      if (e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === '1') handleExitDetailsToAdmin('orders');
      else if (e.key === '2') handleExitDetailsToAdmin('inventory');
      else if (e.key === '3') handleExitDetailsToAdmin('shipping');
      else if (e.key === '4') handleExitDetailsToAdmin('map');
      else if (e.key === '5') handleExitDetailsToAdmin('costs');
      else if (e.key === '6') handleExitDetailsToAdmin('neondb');
      else if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleOpenOrderModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAdmin, handleExitDetailsToAdmin]);

  // ============================================================================
  // 6. OPERACIONES DE BASE DE DATOS (API SEGURA DEL SERVIDOR)
  // ============================================================================
  const appendSqlLog = useCallback((sql, status = 'OK', durationMs = 0, detail = '') => {
    setSqlLogs(prev => [
      {
        id: `sql-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date().toLocaleTimeString(),
        sql,
        status,
        durationMs,
        detail
      },
      ...prev.slice(0, 49)
    ]);
  }, []);

  const executeNeonQuery = useCallback(async (query) => {
    const start = performance.now();
    try {
      const result = await apiRequest('/api/admin/sql', {
        method: 'POST',
        body: JSON.stringify({ query })
      });
      const elapsed = Math.round(performance.now() - start);
      appendSqlLog(query, 'OK', elapsed, `Filas devueltas: ${result.rows?.length ?? 0}`);
      setNeonStatus('connected');
      setNeonLastSync(new Date().toLocaleTimeString());
      return { ok: true, data: { rows: result.rows || [] } };
    } catch (error) {
      const elapsed = Math.round(performance.now() - start);
      appendSqlLog(query, 'ERROR', elapsed, error.message);
      setNeonStatus('error');
      return { ok: false, error: error.message };
    }
  }, [apiRequest, appendSqlLog]);

  // Las mutaciones individuales se persisten mediante el efecto transaccional de snapshot.
  const syncSingleOrderToNeon = useCallback(async (_order) => undefined, []);

  const handleInitNeonTables = async () => {
    if (!isAdmin) return;
    try {
      setNeonStatus('connecting');
      await apiRequest('/api/admin/init', { method: 'POST', body: JSON.stringify({}) });
      await loadDatabaseSnapshot(adminToken);
      notify('Esquema verificado. NeonDB está conectado.');
    } catch (error) {
      setNeonStatus('error');
      notify(`No se pudo inicializar NeonDB: ${error.message}`, 'error');
    }
  };

  const handlePushAllToNeon = async () => {
    if (!isAdmin || !isDataReady) return;
    try {
      setIsSavingData(true);
      await apiRequest('/api/admin/data', {
        method: 'PUT',
        body: JSON.stringify({
          catalog,
          orders,
          boughtSupplies,
          madeItems,
          settings: {
            comboDiscountValue, originHub, defaultCarrier, brandName, brandLogoUrl, collectionName, googleMapsApiKey, theme, customTheme,
            orderCedulas: orders.reduce((acc: Record<string, string>, o: any) => {
              if (o?.cedula) {
                if (o.id) acc[o.id] = String(o.cedula);
                if (o.uuid) acc[String(o.uuid).toLowerCase()] = String(o.cedula);
              }
              return acc;
            }, {})
          }
        })
      });
      setNeonStatus('connected');
      setNeonLastSync(new Date().toLocaleTimeString());
      notify('Datos guardados en NeonDB.');
    } catch (error) {
      setNeonStatus('error');
      notify(`Error al guardar en NeonDB: ${error.message}`, 'error');
    } finally {
      setIsSavingData(false);
    }
  };

  const handlePullFromNeon = async () => {
    if (!isAdmin) return;
    try {
      setNeonStatus('connecting');
      await loadDatabaseSnapshot(adminToken);
      notify('Datos actualizados desde NeonDB.');
    } catch (error) {
      setNeonStatus('error');
      notify(`No se pudieron descargar los datos: ${error.message}`, 'error');
    }
  };

  // ============================================================================
  // 7. CÁLCULOS EN TIEMPO REAL: VENTAS, INVENTARIO, ENVÍOS Y GANANCIA NETA
  // ============================================================================
  const metrics = useMemo(() => {
    const activeOrders = orders.filter(isOrderActive);
    const totalOrders = orders.length;
    const cancelledOrders = orders.filter(o => o.paymentStatus === 'Cancelado').length;
    const refundedOrders = orders.filter(o => o.paymentStatus === 'Reembolsado').length;
    const refundedAmount = orders
      .filter(o => o.paymentStatus === 'Reembolsado')
      .reduce((acc, o) => acc + o.total, 0);

    const grossRevenue = activeOrders.reduce((acc, o) => acc + o.total, 0);
    const collectedCash = activeOrders.reduce((acc, o) => acc + getPaidAmount(o), 0);
    const pendingToCollect = activeOrders.reduce((acc, o) => acc + getPendingAmount(o), 0);

    const countPendiente = orders.filter(o => o.paymentStatus === 'Pendiente').length;
    const countSemi = orders.filter(o => o.paymentStatus === 'Semi-pagado (50%)').length;
    const countPagado = orders.filter(o => o.paymentStatus === 'Pagado').length;

    const countPorPreparar = activeOrders.filter(o => o.shippingStatus === 'Por preparar').length;
    const countPorEnviar = activeOrders.filter(o => o.shippingStatus === 'Por enviar').length;
    const countEnviado = activeOrders.filter(o => o.shippingStatus === 'Enviado').length;

    // Alert count: orders in "Por enviar" or "Enviado" that still owe money
    const shipWithDebtCount = activeOrders.filter(
      o => (o.shippingStatus === 'Por enviar' || o.shippingStatus === 'Enviado') && getPendingAmount(o) > 0
    ).length;

    // Production Cost & Net Profit across active orders
    let totalProductionCost = 0;
    activeOrders.forEach(o => {
      o.items.forEach(it => {
        const prod = catalog.find(c => c.id === it.productId);
        if (prod) {
          const variant = prod.variants.find(v => v.id === it.variantId || v.name === it.variantName);
          const unitCost = (Number(prod.unitCost) || 0) + (Number(variant?.extraCost) || 0);
          totalProductionCost += unitCost * it.qty;
        }
      });
    });

    const netProfitProjected = grossRevenue - totalProductionCost;
    const marginPct = grossRevenue > 0 ? ((netProfitProjected / grossRevenue) * 100).toFixed(1) : '0.0';

    return {
      totalOrders,
      activeOrdersCount: activeOrders.length,
      cancelledOrders,
      refundedOrders,
      refundedAmount,
      grossRevenue,
      collectedCash,
      pendingToCollect,
      countPendiente,
      countSemi,
      countPagado,
      countPorPreparar,
      countPorEnviar,
      countEnviado,
      shipWithDebtCount,
      totalProductionCost,
      netProfitProjected,
      marginPct
    };
  }, [orders, catalog]);

  // A. ¿QUÉ TOCA COMPRAR? (Pre-poblado con TODAS las remeras, hoodies, croptops y accesorios en TODAS las tallas XS-2XL)
  const shoppingNeeds = useMemo(() => {
    const activeOrders = orders.filter(isOrderActive);
    const effectiveCatalog = catalog.length > 0 ? catalog : OFFICIAL_CATALOG_FALLBACK;
    const map: Record<string, any> = {};
    const SIZE_ORDER: Record<string, number> = { XS: 1, S: 2, M: 3, L: 4, XL: 5, '2XL': 6, 'Única': 7 };
    const CAT_ORDER: Record<string, number> = {
      'Prenda en Blanco': 1,
      'Prenda Base': 2,
      'Base Accesorio': 3,
      'Insumo Taller': 4,
      'Insumo Electrónico': 5
    };

    const ensureRow = (blankName: string, sizeOrSpec: string, categoryLabel: string, refName = '') => {
      const key = `${blankName}___${sizeOrSpec}`;
      if (!map[key]) {
        map[key] = {
          key,
          blankName,
          sizeOrSpec,
          categoryLabel,
          refNames: refName ? [refName] : [],
          required: 0,
          genderBreakdown: { Femenino: 0, Masculino: 0, 'Sin especificar': 0 }
        };
      } else if (refName && !map[key].refNames.includes(refName)) {
        map[key].refNames.push(refName);
      }
      return map[key];
    };

    // 1. Pre-poblar TODAS las prendas y accesorios del catálogo con todas sus tallas posibles (XS, S, M, L, XL, 2XL)
    effectiveCatalog.forEach((prod: any) => {
      const isAcc =
        String(prod.category || '').toLowerCase().includes('accesorio') ||
        String(prod.name || '').toLowerCase().includes('llavero') ||
        String(prod.name || '').toLowerCase().includes('fanbox') ||
        String(prod.name || '').toLowerCase().includes('parche');
      const categoryLabel = isAcc ? 'Base Accesorio' : 'Prenda en Blanco';
      const sizesToCreate = isAcc
        ? (Array.isArray(prod.sizes) && prod.sizes.length > 0 ? prod.sizes : ['Única'])
        : ALL_GARMENT_SIZES;

      const variants = Array.isArray(prod.variants) && prod.variants.length > 0 ? prod.variants : [{}];
      variants.forEach((variant: any) => {
        const blankTitle = variant?.blankOverride || prod.blankName || `${prod.name} (En blanco)`;
        sizesToCreate.forEach((sz: string) => {
          ensureRow(blankTitle, sz, categoryLabel, prod.name);
        });
      });
    });

    // Pre-poblar también los insumos fijos de taller
    ensureRow('Insumo: Kit Pedrería / Brillos Termoadhesivos', 'Paquete x Prenda', 'Insumo Taller', 'Prendas con pedrería / brillos');
    ensureRow('Insumo: Vinilo Textil (Azul Escarchado)', 'Corte Estampado', 'Insumo Taller', 'Estampado vinilo azul');
    ensureRow('Insumo: Vinilo Textil (Negro Escarchado)', 'Corte Estampado', 'Insumo Taller', 'Estampado vinilo negro');
    ensureRow('Insumo: Chip Sticker NFC Programable', 'Unidad NFC', 'Insumo Electrónico', 'Llavero Mini CD (Con NFC)');

    // 2. Sumar las cantidades reales pedidas en los pedidos activos
    activeOrders.forEach(order => {
      (order.items || []).forEach((item: any) => {
        const qty = Math.max(1, Number(item.qty) || 1);
        const prod = effectiveCatalog.find((c: any) => c.id === item.productId || c.name === item.productName);
        const sizeClean = item.size || 'M';
        const genderClean = GARMENT_GENDERS.includes(item.gender) ? item.gender : 'Sin especificar';

        if (!prod) {
          const r = ensureRow(item.productName || 'Prenda Base', sizeClean, 'Prenda en Blanco');
          r.required += qty;
          r.genderBreakdown[genderClean] = (r.genderBreakdown[genderClean] || 0) + qty;
          return;
        }

        const variant =
          (prod.variants || []).find((v: any) => v.id === item.variantId || v.name === item.variantName) ||
          prod.variants?.[0] ||
          {};
        const isAcc =
          String(prod.category || '').toLowerCase().includes('accesorio') ||
          String(prod.name || '').toLowerCase().includes('llavero') ||
          String(prod.name || '').toLowerCase().includes('fanbox') ||
          String(prod.name || '').toLowerCase().includes('parche');
        const blankTitle = variant.blankOverride || prod.blankName || `${prod.name} (En blanco)`;
        const targetSize = isAcc ? 'Única' : sizeClean;

        const row = ensureRow(blankTitle, targetSize, isAcc ? 'Base Accesorio' : 'Prenda en Blanco', prod.name);
        row.required += qty;
        row.genderBreakdown[genderClean] = (row.genderBreakdown[genderClean] || 0) + qty;

        // Insumos adicionales requeridos por la prenda
        const vNameLower = String(item.variantName || variant.name || '').toLowerCase();
        if (variant.needsRhinestones || vNameLower.includes('brillos') || vNameLower.includes('pedrería')) {
          const rKit = ensureRow('Insumo: Kit Pedrería / Brillos Termoadhesivos', 'Paquete x Prenda', 'Insumo Taller');
          rKit.required += qty;
        }
        if (variant.needsGlitterVinyl) {
          const vColor = variant.vinylColor || 'Escarchado';
          const rVin = ensureRow(`Insumo: Vinilo Textil (${vColor})`, 'Corte Estampado', 'Insumo Taller');
          rVin.required += qty;
        }
        if (variant.needsNFC || String(item.productName || prod.name || '').toLowerCase().includes('con nfc')) {
          const rNfc = ensureRow('Insumo: Chip Sticker NFC Programable', 'Unidad NFC', 'Insumo Electrónico');
          rNfc.required += qty;
        }
      });
    });

    const rows = Object.values(map)
      .map((r: any) => {
        // Compatibilidad con stock guardado anteriormente bajo claves con género ("___M · Femenino")
        let bought = Number(boughtSupplies[r.key]);
        if (!Number.isFinite(bought)) {
          bought = Object.entries(boughtSupplies).reduce((acc, [k, val]) => {
            if (k === r.key || k.startsWith(`${r.blankName}___${r.sizeOrSpec} · `)) {
              return acc + (Number(val) || 0);
            }
            return acc;
          }, 0);
        }
        const missing = Math.max(0, r.required - bought);
        return { ...r, bought, missing };
      })
      .sort((a: any, b: any) => {
        const catA = CAT_ORDER[a.categoryLabel] || 99;
        const catB = CAT_ORDER[b.categoryLabel] || 99;
        if (catA !== catB) return catA - catB;
        const nameCmp = a.blankName.localeCompare(b.blankName);
        if (nameCmp !== 0) return nameCmp;
        const szA = SIZE_ORDER[a.sizeOrSpec] || 99;
        const szB = SIZE_ORDER[b.sizeOrSpec] || 99;
        return szA - szB || a.sizeOrSpec.localeCompare(b.sizeOrSpec);
      });

    const totalMissingToBuy = rows.reduce((acc, r) => acc + r.missing, 0);
    return { rows, totalMissingToBuy };
  }, [orders, catalog, boughtSupplies]);

  // B. ¿QUÉ TOCA ESTAMPAR / HACER? (Pre-poblado con TODAS las referencias, variantes y tallas XS–2XL)
  const productionMatrix = useMemo(() => {
    const activeOrders = orders.filter(isOrderActive);
    const effectiveCatalog = catalog.length > 0 ? catalog : OFFICIAL_CATALOG_FALLBACK;
    const map: Record<string, any> = {};
    const SIZE_ORDER: Record<string, number> = { XS: 1, S: 2, M: 3, L: 4, XL: 5, '2XL': 6, 'Única': 7 };

    // 1. Pre-poblar todas las referencias y variantes del catálogo con todas sus tallas (XS a 2XL)
    effectiveCatalog.forEach((prod: any) => {
      const isAcc =
        String(prod.category || '').toLowerCase().includes('accesorio') ||
        String(prod.name || '').toLowerCase().includes('llavero') ||
        String(prod.name || '').toLowerCase().includes('fanbox') ||
        String(prod.name || '').toLowerCase().includes('parche');
      const sizesToCreate = isAcc
        ? (Array.isArray(prod.sizes) && prod.sizes.length > 0 ? prod.sizes : ['Única'])
        : ALL_GARMENT_SIZES;

      const variants = Array.isArray(prod.variants) && prod.variants.length > 0
        ? prod.variants
        : [{ id: 'v-std', name: 'Estándar' }];

      variants.forEach((variant: any) => {
        const varId = variant.id || variant.name || 'v-std';
        sizesToCreate.forEach((sz: string) => {
          const key = `${prod.id}|||${varId}|||${sz}`;
          map[key] = {
            key,
            productId: prod.id,
            productName: prod.name,
            variantId: varId,
            variantName: variant.name || 'Estándar',
            category: isAcc ? 'Accesorio' : 'Prenda',
            size: sz,
            orderedQty: 0,
            genderBreakdown: { Femenino: 0, Masculino: 0, 'Sin especificar': 0 }
          };
        });
      });
    });

    // 2. Sumar los pedidos activos en la matriz
    activeOrders.forEach(order => {
      (order.items || []).forEach((item: any) => {
        const qty = Math.max(1, Number(item.qty) || 1);
        const prod = effectiveCatalog.find((c: any) => c.id === item.productId || c.name === item.productName);
        const matchedVar = prod?.variants?.find((v: any) => v.id === item.variantId || v.name === item.variantName) || prod?.variants?.[0];
        const prodId = prod?.id || item.productId || item.productName;
        const varId = matchedVar?.id || item.variantId || item.variantName || 'v-std';
        const varName = matchedVar?.name || item.variantName || 'Estándar';
        const isAcc =
          String(prod?.category || '').toLowerCase().includes('accesorio') ||
          String(prod?.name || item.productName || '').toLowerCase().includes('llavero') ||
          String(prod?.name || item.productName || '').toLowerCase().includes('fanbox');
        const sz = isAcc ? 'Única' : (item.size || 'M');
        const genderClean = GARMENT_GENDERS.includes(item.gender) ? item.gender : 'Sin especificar';

        const key = `${prodId}|||${varId}|||${sz}`;
        if (!map[key]) {
          map[key] = {
            key,
            productId: prodId,
            productName: prod?.name || item.productName || 'Prenda MyFanBox',
            variantId: varId,
            variantName: varName,
            category: isAcc ? 'Accesorio' : 'Prenda',
            size: sz,
            orderedQty: 0,
            genderBreakdown: { Femenino: 0, Masculino: 0, 'Sin especificar': 0 }
          };
        }
        map[key].orderedQty += qty;
        map[key].genderBreakdown[genderClean] = (map[key].genderBreakdown[genderClean] || 0) + qty;
      });
    });

    const rows = Object.values(map)
      .map((r: any) => {
        let made = Number(madeItems[r.key]);
        if (!Number.isFinite(made)) {
          made = Object.entries(madeItems).reduce((acc, [k, val]) => {
            if (
              k === r.key ||
              k.startsWith(`${r.productId}|||${r.variantId}|||${r.size}|||`) ||
              k.startsWith(`${r.productId}|||${r.variantName}|||${r.size}|||`)
            ) {
              return acc + (Number(val) || 0);
            }
            return acc;
          }, 0);
        }
        const missing = Math.max(0, r.orderedQty - made);
        const progress = r.orderedQty > 0 ? Math.min(100, Math.round((made / r.orderedQty) * 100)) : (made > 0 ? 100 : 0);
        return { ...r, made, missing, progress };
      })
      .sort((a: any, b: any) => {
        if (a.category !== b.category) return a.category === 'Prenda' ? -1 : 1;
        const pCmp = a.productName.localeCompare(b.productName);
        if (pCmp !== 0) return pCmp;
        const vCmp = a.variantName.localeCompare(b.variantName);
        if (vCmp !== 0) return vCmp;
        const szA = SIZE_ORDER[a.size] || 99;
        const szB = SIZE_ORDER[b.size] || 99;
        return szA - szB;
      });

    const totalOrderedUnits = rows.reduce((acc, r) => acc + r.orderedQty, 0);
    const totalMissingToMake = rows.reduce((acc, r) => acc + r.missing, 0);
    return { rows, totalOrderedUnits, totalMissingToMake };
  }, [orders, catalog, madeItems]);

  // ============================================================================
  // 8. FILTRADO RÁPIDO DE PEDIDOS Y ACCIONES DE TABLA
  // ============================================================================
  const filteredOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return orders.filter(o => {
      if (q) {
        const hay = `${o.id} ${o.customerName} ${o.cedula || ''} ${o.instagram} ${o.phone} ${o.city} ${o.address} ${o.trackingNumber} ${o.notes}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }

      if (quickStatusFilter !== 'ALL') {
        if (PAYMENT_STATUSES.includes(quickStatusFilter)) {
          if (o.paymentStatus !== quickStatusFilter) return false;
        } else if (SHIPPING_STATUSES.includes(quickStatusFilter)) {
          if (!isOrderActive(o) || o.shippingStatus !== quickStatusFilter) return false;
        } else if (quickStatusFilter === 'ALERT_COBROS') {
          if (!isOrderActive(o) || (o.shippingStatus !== 'Por enviar' && o.shippingStatus !== 'Enviado') || getPendingAmount(o) <= 0) {
            return false;
          }
        }
      }

      if (payFilter !== 'ALL' && o.paymentStatus !== payFilter) return false;
      if (shipFilter !== 'ALL' && o.shippingStatus !== shipFilter) return false;
      if (productFilter !== 'ALL' && !o.items.some(it => it.productId === productFilter)) return false;
      if (sizeFilter !== 'ALL' && !o.items.some(it => it.size === sizeFilter)) return false;
      if (genderFilter !== 'ALL' && !o.items.some(it => (it.gender || 'Sin especificar') === genderFilter)) return false;

      return true;
    });
  }, [orders, searchQuery, quickStatusFilter, payFilter, shipFilter, productFilter, sizeFilter, genderFilter]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, quickStatusFilter, payFilter, shipFilter, productFilter, sizeFilter, genderFilter]);

  // 1-Click Status Updaters (Admin Guarded)
  const handleUpdateOrderPayment = (orderId, newPayStatus) => {
    if (!isAdmin) return;
    setOrders(prev =>
      prev.map(o => {
        if (o.id !== orderId) return o;
        const updated = { ...o, paymentStatus: newPayStatus };
        syncSingleOrderToNeon(updated);
        return updated;
      })
    );
    notify(`Pedido ${orderId} → Pago: ${newPayStatus}`);
  };

  const handleUpdateOrderShipping = (orderId, newShipStatus) => {
    if (!isAdmin) return;
    setOrders(prev =>
      prev.map(o => {
        if (o.id !== orderId) return o;
        const updatedItems =
          newShipStatus === 'Por enviar' || newShipStatus === 'Enviado'
            ? o.items.map(it => ({ ...it, packed: true }))
            : o.items;
        const updated = { ...o, shippingStatus: newShipStatus, items: updatedItems };
        syncSingleOrderToNeon(updated);
        return updated;
      })
    );
    notify(`Pedido ${orderId} → Envío: ${newShipStatus}`);
  };

  const handleUpdateOrderField = (orderId, field, value) => {
    if (!isAdmin) return;
    setOrders(prev =>
      prev.map(o => {
        if (o.id !== orderId) return o;
        const updated = { ...o, [field]: value };
        if (field === 'trackingNumber' && value.trim() !== '' && o.shippingStatus !== 'Enviado') {
          updated.shippingStatus = 'Enviado';
        }
        syncSingleOrderToNeon(updated);
        return updated;
      })
    );
  };

  // Rotate / Regenerate Secret UUID v4 for an Order (Admin Only)
  const handleRegenerateOrderUUID = (orderId) => {
    if (!isAdmin) return;
    const newUuid = generateUUIDv4();
    setOrders(prev =>
      prev.map(o => {
        if (o.id !== orderId) return o;
        const updated = { ...o, uuid: newUuid };
        syncSingleOrderToNeon(updated);
        return updated;
      })
    );
    setDetailOrderUuid(newUuid);
    try {
      if (activeTab === 'details') {
        window.history.replaceState(null, '', `#/details/${newUuid}`);
      }
    } catch (e) {
      console.warn(e);
    }
    notify(`Nuevo código secreto UUID generado para ${orderId}`);
  };

  // Bulk Status Change for Selected Orders (Admin Guarded)
  const handleBulkStatusUpdate = (type, newValue) => {
    if (!isAdmin || selectedOrderIds.length === 0) return;
    setOrders(prev =>
      prev.map(o => {
        if (!selectedOrderIds.includes(o.id)) return o;
        const updated = type === 'payment' ? { ...o, paymentStatus: newValue } : { ...o, shippingStatus: newValue };
        syncSingleOrderToNeon(updated);
        return updated;
      })
    );
    notify(`${selectedOrderIds.length} pedidos actualizados a "${newValue}"`);
    setSelectedOrderIds([]);
  };

  // Toggle individual item packed in "Mesa de Empaque"
  const handleToggleItemPacked = (orderId, itemIdx) => {
    if (!isAdmin) return;
    setOrders(prev =>
      prev.map(o => {
        if (o.id !== orderId) return o;
        const newItems = o.items.map((it, idx) => (idx === itemIdx ? { ...it, packed: !it.packed } : it));
        const updated = { ...o, items: newItems };
        syncSingleOrderToNeon(updated);
        return updated;
      })
    );
  };

  // El enlace solo contiene el UUID privado. Los datos se consultan en el servidor.
  const getCustomerTrackingUrl = useCallback((order) => {
    if (!order) return window.location.href;
    const orderUuid = isValidUUID(order.uuid) ? order.uuid : generateUUIDv4();
    return `${window.location.origin}${window.location.pathname}#/details/${orderUuid}`;
  }, []);

  // WhatsApp Click-to-Chat Generator (Includes secret UUID tracking link automatically)
  const handleOpenWhatsApp = (order) => {
    const rawPhone = String(order.phone || '').trim();
    let fullPhone = rawPhone.replace(/\D/g, '');
    if (fullPhone.startsWith('00')) fullPhone = fullPhone.slice(2);
    else if (!rawPhone.startsWith('+') && fullPhone.length === 10) fullPhone = `57${fullPhone}`; // Compatibilidad con números colombianos antiguos
    if (!fullPhone) { notify('Este pedido no tiene un teléfono válido.', 'warning'); return; }
    const firstName = order.customerName.split(' ')[0];
    const itemsList = order.items.map(i => `• ${i.qty}x ${i.productName} (${i.variantName} - Talla ${i.size}${i.gender && i.gender !== 'Sin especificar' ? ` · ${i.gender}` : ''})`).join('\n');
    const paid = getPaidAmount(order);
    const pending = getPendingAmount(order);
    const trackingUrl = getCustomerTrackingUrl(order);

    let statusMessage = '';
    if (order.shippingStatus === 'Enviado') {
      statusMessage = `¡Tu pedido de *MyFanBox* ya fue *ENVIADO*! 📦\n🚚 Envío GRATIS.\nTransportadora: *${order.carrier}*\nNúmero de guía: *${order.trackingNumber || 'Asignada'}*`;
    } else if (order.shippingStatus === 'Por enviar' && pending > 0) {
      statusMessage = `¡Tu pedido de *MyFanBox* ya está listo y empacado *POR ENVIAR*! ✨\n🚚 Recuerda: el envío es GRATIS.\nPara despacharlo hoy mismo con *${order.carrier}*, queda pendiente el saldo restante del 50% por valor de *${formatCOP(pending)}*.`;
    } else if (order.paymentStatus === 'Pendiente') {
      statusMessage = `Recibimos tu pedido en *MyFanBox*. Para agendar tus prendas en producción puedes abonar el 50% (*${formatCOP(Math.round(order.total * 0.5))}*) o el pago total (*${formatCOP(order.total)}*).`;
    } else if (order.paymentStatus === 'Semi-pagado (50%)') {
      statusMessage = `Confirmamos tu abono del 50% (*${formatCOP(paid)}*). Tus prendas están en preparación (${order.shippingStatus}). Saldo restante para completar el pago: *${formatCOP(pending)}*.`;
    } else {
      statusMessage = `Tu pedido está 100% pagado (*${formatCOP(order.total)}*) y en estado: *${order.shippingStatus}*.`;
    }

    const fullText = `¡Hola ${firstName}! Te escribimos de *MyFanBox* sobre tu pedido *${order.id}*:\n\n${statusMessage}\n\n🚚 *Todos nuestros envíos son GRATIS.*\n\n*Detalle de tu orden:*\n${itemsList}\n📍 Destino: ${order.city} (${order.address || 'Confirmar dirección'})\n\n🔒 *Enlace privado de tu factura y seguimiento en vivo:*\n${trackingUrl}`;
    window.open(`https://wa.me/${fullPhone}?text=${encodeURIComponent(fullText)}`, '_blank', 'noopener,noreferrer');
  };

  // Copy text helper
  const copyToClipboard = (text, label) => {
    navigator.clipboard?.writeText(text);
    notify(label || 'Copiado al portapapeles');
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'ID', 'Fecha', 'Cliente', 'Cedula', 'Instagram', 'WhatsApp', 'Ciudad', 'Direccion', 'Latitud', 'Longitud',
      'Prendas', 'Total_COP', 'Pagado_COP', 'Saldo_Pendiente_COP',
      'Estado_Pago', 'Estado_Envio', 'Transportadora', 'Guia', 'Notas'
    ];
    const rows = filteredOrders.map(o => [
      o.id,
      o.createdAt,
      o.customerName,
      o.cedula || '',
      o.instagram,
      o.phone,
      o.city,
      o.address,
      o.lat ?? '',
      o.lng ?? '',
      o.items.map(i => `${i.qty}x ${i.productName} [${i.variantName} - Talla ${i.size} - ${i.gender || 'Sin especificar'}]`).join(' | '),
      o.total,
      getPaidAmount(o),
      getPendingAmount(o),
      o.paymentStatus,
      o.shippingStatus,
      o.carrier,
      o.trackingNumber,
      o.notes || ''
    ].map(val => `"${String(val ?? '').replace(/"/g, '""')}"`).join(','));

    const csv = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MyFanBox_Pedidos_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    notify(`${filteredOrders.length} pedidos exportados a Excel/CSV`);
  };

  // ============================================================================
  // 9. MODAL DE CREACIÓN / EDICIÓN DE PEDIDO + VERIFICADOR GOOGLE MAPS & CP
  // ============================================================================
  const [draftCustomer, setDraftCustomer] = useState({
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
  const [addressCandidates, setAddressCandidates] = useState([]);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [modalCoordPaste, setModalCoordPaste] = useState('');
  const [draftItems, setDraftItems] = useState([]);
  const [selProdId, setSelProdId] = useState('');
  const [selVarId, setSelVarId] = useState('');
  const [selSize, setSelSize] = useState('M');
  const [selGender, setSelGender] = useState('Femenino');
  const [selQty, setSelQty] = useState(1);
  const [applyComboDiscount, setApplyComboDiscount] = useState(true);

  const handleOpenOrderModal = (orderToEdit = null) => {
    setAddressCandidates([]);
    setModalCoordPaste('');
    if (orderToEdit) {
      const fallback = inferColombianAddressMetadata(orderToEdit.city, orderToEdit.address);
      setEditingOrder(orderToEdit);
      setDraftCustomer({
        customerName: orderToEdit.customerName,
        cedula: orderToEdit.cedula || '',
        instagram: orderToEdit.instagram || '',
        phone: orderToEdit.phone || '',
        city: orderToEdit.city || 'Medellín',
        neighborhood: orderToEdit.neighborhood || fallback.neighborhood,
        address: orderToEdit.address || '',
        postalCode: orderToEdit.postalCode || fallback.postalCode,
        formattedAddress: orderToEdit.formattedAddress || '',
        lat: typeof orderToEdit.lat === 'number' ? orderToEdit.lat : fallback.lat,
        lng: typeof orderToEdit.lng === 'number' ? orderToEdit.lng : fallback.lng,
        manualPin: Boolean(orderToEdit.manualPin),
        addressVerified: Boolean(orderToEdit.addressVerified || orderToEdit.manualPin),
        carrier: orderToEdit.carrier || defaultCarrier,
        trackingNumber: orderToEdit.trackingNumber || '',
        paymentStatus: orderToEdit.paymentStatus,
        shippingStatus: orderToEdit.shippingStatus,
        notes: orderToEdit.notes || ''
      });
      setDraftItems(orderToEdit.items.map(i => ({ ...i, gender: i.gender || 'Sin especificar' })));
      setApplyComboDiscount((orderToEdit.discount || 0) > 0);
    } else {
      setEditingOrder(null);
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
    setOrderModalOpen(true);
  };

  // Trigger address lookup & verification inside Order Modal
  const handleVerifyAddressInModal = async () => {
    if (!draftCustomer.address.trim() && !draftCustomer.city.trim()) {
      notify('Escribe primero la calle/carrera y la ciudad para buscar en el mapa', 'warning');
      return;
    }
    setIsSearchingAddress(true);
    try {
      const opts = await searchAndVerifyColombianAddress(
        draftCustomer.city,
        draftCustomer.address,
        googleMapsApiKey
      );
      setAddressCandidates(opts);
      if (opts.length > 0) {
        notify(`${opts.length} opciones de dirección y código postal encontradas`);
      }
    } finally {
      setIsSearchingAddress(false);
    }
  };

  // Apply a selected candidate option inside Order Modal
  const handleSelectAddressCandidate = (cand) => {
    setDraftCustomer(prev => ({
      ...prev,
      city: cand.city || prev.city,
      address: cand.streetAddress || prev.address,
      neighborhood: cand.neighborhood || prev.neighborhood,
      postalCode: cand.postalCode || prev.postalCode,
      formattedAddress: cand.formattedAddress,
      lat: cand.lat,
      lng: cand.lng,
      addressVerified: true
    }));
    notify(`Dirección verificada: CP ${cand.postalCode} (${cand.neighborhood})`);
  };

  // Verify existing order address directly from Tab 4 (Map Inspector)
  const handleSearchInspectorCandidates = async (order) => {
    if (!order) return;
    setInspectorGeoLoading(true);
    try {
      const opts = await searchAndVerifyColombianAddress(
        order.city,
        order.address,
        googleMapsApiKey
      );
      setInspectorGeoCandidates(opts);
      notify(`Opciones cargadas para ${order.id}. Elige una para fijar el pin exacto.`);
    } finally {
      setInspectorGeoLoading(false);
    }
  };

  const handleApplyInspectorCandidate = (orderId, cand) => {
    if (!isAdmin) return;
    setOrders(prev =>
      prev.map(o => {
        if (o.id !== orderId) return o;
        const updated = {
          ...o,
          city: cand.city || o.city,
          address: cand.streetAddress || o.address,
          neighborhood: cand.neighborhood || o.neighborhood,
          postalCode: cand.postalCode || o.postalCode,
          formattedAddress: cand.formattedAddress,
          lat: cand.lat,
          lng: cand.lng,
          addressVerified: true
        };
        syncSingleOrderToNeon(updated);
        return updated;
      })
    );
    setInspectorGeoCandidates([]);
    notify(`Pin exacto y Código Postal (${cand.postalCode}) actualizados en ${orderId}`);
  };

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

  const handleSaveOrderModal = (e) => {
    e.preventDefault();
    if (!isAdmin) return;
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

    // Inyectar customerCedula y manualPin en cada ítem para que NeonDB (JSONB items) lo persista siempre
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

    if (editingOrder) {
      const orderUuid = isValidUUID(editingOrder.uuid) ? editingOrder.uuid : generateUUIDv4();
      saveStoredCedula(editingOrder.id, orderUuid, cleanCedula);
      const updatedOrder = {
        ...editingOrder,
        uuid: orderUuid,
        ...draftCustomer,
        cedula: cleanCedula,
        items: finalItems,
        discount,
        total
      };
      setOrders(prev => prev.map(o => (o.id === editingOrder.id ? updatedOrder : o)));
      syncSingleOrderToNeon(updatedOrder);
      notify(`Pedido ${editingOrder.id} actualizado`);
    } else {
      const maxNum = orders.reduce((max, o) => {
        const n = parseInt((o.id || '').replace(/\D/g, ''), 10);
        return !isNaN(n) && n > max ? n : max;
      }, 1000);
      const newId = `MFB-${maxNum + 1}`;
      const newUuid = generateUUIDv4();
      saveStoredCedula(newId, newUuid, cleanCedula);
      const newOrder = {
        id: newId,
        uuid: newUuid,
        ...draftCustomer,
        cedula: cleanCedula,
        items: finalItems,
        discount,
        total,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setOrders(prev => [newOrder, ...prev]);
      syncSingleOrderToNeon(newOrder);
      notify(`Nuevo pedido ${newOrder.id} registrado con código UUID único`);
    }
    setOrderModalOpen(false);
  };

  // ============================================================================
  // 10. ESTILOS SEMÁNTICOS MINIMALISTAS PARA PILLS DE ESTADO
  // ============================================================================
  const getPayStatusBadgeClass = (status) => {
    switch (status) {
      case 'Pagado':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Semi-pagado (50%)':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Pendiente':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'Reembolsado':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'Cancelado':
        return 'bg-zinc-100 text-zinc-400 border-zinc-200 line-through';
      default:
        return 'bg-zinc-100 text-zinc-700 border-zinc-200';
    }
  };

  const getShipStatusBadgeClass = (status) => {
    switch (status) {
      case 'Enviado':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Por enviar':
        return 'bg-sky-50 text-sky-800 border-sky-200 font-semibold';
      case 'Por preparar':
        return 'bg-zinc-100 text-zinc-800 border-zinc-300';
      default:
        return 'bg-zinc-100 text-zinc-700 border-zinc-200';
    }
  };

  // Pagination slice
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, currentPage, pageSize]);

  // ============================================================================
  // 10.B DATOS PARA EL MAPA DE ENVÍOS Y PÁGINA /details/:orderId
  // ============================================================================
  const mapOrdersWithGeo = useMemo(() => {
    return orders
      .filter(isOrderActive)
      .filter(o => {
        if (mapCarrierFilter !== 'ALL' && o.carrier !== mapCarrierFilter) return false;
        if (mapStatusFilter !== 'ALL' && o.shippingStatus !== mapStatusFilter) return false;
        if (mapCityFilter !== 'ALL' && (o.city || '').toLowerCase() !== mapCityFilter.toLowerCase()) return false;
        return true;
      })
      .map(order => ({
        order,
        eta: calculateOrderETA(order, originHub)
      }));
  }, [orders, originHub, mapCarrierFilter, mapStatusFilter, mapCityFilter]);

  const selectedMapEntry = useMemo(() => {
    if (!mapOrdersWithGeo.length) return null;
    return (
      mapOrdersWithGeo.find(item => item.order.id === selectedMapOrderId) ||
      mapOrdersWithGeo[0]
    );
  }, [mapOrdersWithGeo, selectedMapOrderId]);

  // Public tracking is fetched by UUID from PostgreSQL; it does not depend on browser storage.
  useEffect(() => {
    if (activeTab !== 'details' || !isValidUUID(detailOrderUuid) || detailSecurityError) return undefined;
    const localOrder = orders.find(o => (o.uuid || '').toLowerCase() === detailOrderUuid.toLowerCase());
    if (isAdmin && localOrder) {
      setRemoteDetailOrder(null);
      return undefined;
    }
    if (sharedOrderPayload && (sharedOrderPayload.uuid || '').toLowerCase() === detailOrderUuid.toLowerCase()) {
      setRemoteDetailOrder(sharedOrderPayload);
      return undefined;
    }
    let cancelled = false;
    apiRequest(`/api/orders/${encodeURIComponent(detailOrderUuid)}`, { token: null })
      .then(payload => { if (!cancelled) setRemoteDetailOrder(sanitizeOrderRecord(payload.order || payload)); })
      .catch(error => {
        if (!cancelled) {
          setRemoteDetailOrder(null);
          setDetailSecurityError(error.status === 404 ? 'No encontramos un pedido asociado a este enlace privado.' : `No se pudo consultar el pedido: ${error.message}`);
        }
      });
    return () => { cancelled = true; };
  }, [activeTab, detailOrderUuid, detailSecurityError, orders, isAdmin, sharedOrderPayload, apiRequest]);

  // Lookup order strictly by its cryptographic UUID v4
  const currentDetailOrder = useMemo(() => {
    if (detailSecurityError) return null;
    const cleanTarget = (detailOrderUuid || '').trim().toLowerCase();
    if (isValidUUID(cleanTarget)) {
      const foundByUuid = orders.find(o => (o.uuid || '').toLowerCase() === cleanTarget);
      if (foundByUuid) return foundByUuid;
      if (sharedOrderPayload && (sharedOrderPayload.uuid || '').toLowerCase() === cleanTarget) return sharedOrderPayload;
      if (remoteDetailOrder && (remoteDetailOrder.uuid || '').toLowerCase() === cleanTarget) return remoteDetailOrder;
      return null;
    }
    // If Admin opens the /details/ tab directly from the menu without a specific UUID yet, pick the latest order
    if (isAdmin && orders.length > 0) {
      return orders[0];
    }
    return null;
  }, [orders, detailOrderUuid, detailSecurityError, sharedOrderPayload, remoteDetailOrder, isAdmin]);

  // Optional OpenStreetMap Leaflet initializer when user switches mapEngine === 'leaflet'
  useEffect(() => {
    if (activeTab !== 'map' || mapEngine !== 'leaflet') return;

    let cancelled = false;
    const ensureLeaflet = async () => {
      if (!document.getElementById('leaflet-css-cdn')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css-cdn';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }
      const leafletWindow = window as Window & { L?: any };
      if (!leafletWindow.L) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
      }
      if (cancelled || !leafletContainerRef.current || !leafletWindow.L) return;

      const L = leafletWindow.L;
      if (leafletMapInstanceRef.current) {
        leafletMapInstanceRef.current.remove();
        leafletMapInstanceRef.current = null;
      }

      const map = L.map(leafletContainerRef.current).setView([5.6, -74.8], 6);
      leafletMapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      const hubGeo = COLOMBIA_CITIES_GEO[originHub] || COLOMBIA_CITIES_GEO['Medellín'];
      L.circleMarker([hubGeo.lat, hubGeo.lng], {
        radius: 9,
        fillColor: '#18181b',
        color: '#ffffff',
        weight: 2,
        fillOpacity: 1
      })
        .addTo(map)
        .bindPopup(`<b>Centro de Despacho MyFanBox (${originHub})</b>`);

      mapOrdersWithGeo.forEach(({ order, eta }) => {
        const isSelected = selectedMapEntry?.order.id === order.id;
        const pinColor =
          order.shippingStatus === 'Enviado'
            ? '#10b981'
            : order.shippingStatus === 'Por enviar'
            ? '#0ea5e9'
            : '#f59e0b';

        const marker = L.circleMarker([eta.coords.lat, eta.coords.lng], {
          radius: isSelected ? 10 : 6,
          fillColor: pinColor,
          color: '#ffffff',
          weight: isSelected ? 2.5 : 1.5,
          fillOpacity: 0.95
        }).addTo(map);

        marker.bindPopup(
          `<div style="font-family:sans-serif;font-size:12px;line-height:1.4;">
            <strong>${order.id} · ${order.customerName}</strong><br/>
            <span>${order.city} (${order.neighborhood || 'Zona Urbana'}) — CP: <b>${order.postalCode || '—'}</b></span><br/>
            <span>📍 ${order.address || 'Sin dirección'}</span><br/>
            <span><b>${order.carrier}</b>: ${eta.etaLabel} (${eta.windowDates})</span>
          </div>`
        );
        marker.on('click', () => setSelectedMapOrderId(order.id));

        if (isSelected) {
          // Draw direct line from Origin Hub to selected customer's exact street coordinates
          L.polyline(
            [
              [hubGeo.lat, hubGeo.lng],
              [eta.coords.lat, eta.coords.lng]
            ],
            { color: pinColor, weight: 2.5, dashArray: '6, 6' }
          ).addTo(map);
          map.setView([eta.coords.lat, eta.coords.lng], 14);
          marker.openPopup();
        }
      });
    };

    ensureLeaflet().catch(err => console.warn('Leaflet fallback error:', err));

    return () => {
      cancelled = true;
      if (leafletMapInstanceRef.current) {
        leafletMapInstanceRef.current.remove();
        leafletMapInstanceRef.current = null;
      }
    };
  }, [activeTab, mapEngine, mapOrdersWithGeo, originHub, selectedMapEntry]);

  // ============================================================================
  // RENDERIZADO PRINCIPAL
  // ============================================================================
  return (
    <div
      data-theme={theme}
      className="mfb-theme-root min-h-screen bg-[#FAFAFA] text-zinc-900 flex flex-col lg:flex-row font-sans antialiased selection:bg-zinc-900 selection:text-white transition-colors duration-200"
    >
      {/* Dynamic Eye-Care Theme Styles + Clean Print Invoice Styles */}
      <style>{`
        [data-theme="${theme}"] {
          --mfb-bg: ${activeThemePalette.background};
          --mfb-surface: ${activeThemePalette.surface};
          --mfb-surface-alt: ${activeThemePalette.surfaceAlt};
          --mfb-hover: ${activeThemePalette.hover};
          --mfb-hover-text: ${activeThemePalette.hoverText};
          --mfb-selected-bg: ${activeThemePalette.selectedBg};
          --mfb-selected-text: ${activeThemePalette.selectedText};
          --mfb-text: ${activeThemePalette.text};
          --mfb-muted: ${activeThemePalette.muted};
          --mfb-primary: ${activeThemePalette.primary};
          --mfb-primary-text: ${activeThemePalette.primaryText};
          --mfb-border: ${activeThemePalette.border};
          background-color: var(--mfb-bg) !important;
          color: var(--mfb-text) !important;
        }

        [data-theme="${theme}"] ::selection {
          background-color: var(--mfb-primary) !important;
          color: var(--mfb-primary-text) !important;
        }

        [data-theme="${theme}"] [class*="bg-white"] {
          background-color: var(--mfb-surface) !important;
          color: var(--mfb-text) !important;
        }
        [data-theme="${theme}"] [class*="bg-zinc-50"],
        [data-theme="${theme}"] [class*="bg-zinc-100"] {
          background-color: var(--mfb-surface-alt) !important;
          color: var(--mfb-text) !important;
        }

        /* HOVERS EN TABLAS, BOTONES Y MENÚS (Nunca se ponen blancos) */
        [data-theme="${theme}"] tbody tr:hover,
        [data-theme="${theme}"] tbody tr:hover > td,
        [data-theme="${theme}"] [class*="hover:bg-white"]:hover,
        [data-theme="${theme}"] [class*="hover:bg-zinc-50"]:hover,
        [data-theme="${theme}"] [class*="hover:bg-zinc-100"]:hover,
        [data-theme="${theme}"] [class*="hover:bg-zinc-200"]:hover {
          background-color: var(--mfb-hover) !important;
          color: var(--mfb-hover-text) !important;
        }

        [data-theme="${theme}"] button[class*="hover:bg-zinc-"]:hover *,
        [data-theme="${theme}"] button[class*="hover:bg-white"]:hover *,
        [data-theme="${theme}"] [class*="hover:text-zinc-"]:hover {
          color: var(--mfb-hover-text) !important;
        }

        /* ELEMENTOS Y FILAS SELECCIONADAS */
        [data-theme="${theme}"] .bg-sky-50,
        [data-theme="${theme}"] .mfb-selected {
          background-color: var(--mfb-selected-bg) !important;
          color: var(--mfb-selected-text) !important;
          border-color: var(--mfb-primary) !important;
        }
        [data-theme="${theme}"] .bg-sky-50 *,
        [data-theme="${theme}"] .mfb-selected * {
          color: var(--mfb-selected-text) !important;
        }

        /* BOTONES PRINCIPALES Y PESTAÑAS ACTIVAS (.bg-zinc-900) */
        [data-theme="${theme}"] .bg-zinc-900,
        [data-theme="${theme}"] [class*="hover:bg-zinc-800"]:hover {
          background-color: var(--mfb-primary) !important;
          color: var(--mfb-primary-text) !important;
          border-color: var(--mfb-primary) !important;
        }
        [data-theme="${theme}"] .bg-zinc-900 * {
          color: var(--mfb-primary-text) !important;
        }
        [data-theme="${theme}"] .bg-zinc-900 .bg-zinc-800,
        [data-theme="${theme}"] .bg-zinc-900 .bg-zinc-700 {
          background-color: rgba(0, 0, 0, 0.25) !important;
          color: var(--mfb-primary-text) !important;
        }

        /* INPUTS, SELECTS Y CORRECCIÓN DE FOCUS BLANCO */
        [data-theme="${theme}"] input:not([type="color"]),
        [data-theme="${theme}"] select,
        [data-theme="${theme}"] textarea,
        [data-theme="${theme}"] input:not([type="color"]):focus,
        [data-theme="${theme}"] select:focus,
        [data-theme="${theme}"] textarea:focus,
        [data-theme="${theme}"] [class*="focus:bg-white"]:focus {
          background-color: var(--mfb-surface) !important;
          color: var(--mfb-text) !important;
          border-color: var(--mfb-border) !important;
        }
        [data-theme="${theme}"] input:not([type="color"]):focus,
        [data-theme="${theme}"] select:focus,
        [data-theme="${theme}"] textarea:focus {
          border-color: var(--mfb-primary) !important;
        }
        [data-theme="${theme}"] select option {
          background-color: var(--mfb-surface) !important;
          color: var(--mfb-text) !important;
        }

        [data-theme="${theme}"] .text-zinc-900,
        [data-theme="${theme}"] .text-zinc-800,
        [data-theme="${theme}"] .text-zinc-700 {
          color: var(--mfb-text) !important;
        }
        [data-theme="${theme}"] .text-zinc-600,
        [data-theme="${theme}"] .text-zinc-500,
        [data-theme="${theme}"] .text-zinc-400 {
          color: var(--mfb-muted) !important;
        }
        [data-theme="${theme}"] .border-zinc-100,
        [data-theme="${theme}"] .border-zinc-200,
        [data-theme="${theme}"] .border-zinc-300,
        [data-theme="${theme}"] .divide-zinc-200 > :not([hidden]) ~ :not([hidden]) {
          border-color: var(--mfb-border) !important;
        }

        @media print {
          aside, header, .no-print { display: none !important; }
          body, .mfb-theme-root { background: #ffffff !important; color: #000000 !important; }
        }
      `}</style>

      {/* ===================================================================== */}
      {/* MODO GUEST (VISITANTE) Y RUTA SECRETA DE LOGIN ADMIN (/1620)          */}
      {/* ===================================================================== */}
      {!isAdmin && activeTab !== 'details' ? (
        <div className="flex-1 min-h-screen flex flex-col justify-between p-4 sm:p-8 max-w-4xl mx-auto w-full">
          {/* Top Guest Header (Sin rastro de botones de Admin) */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-zinc-200">
            <div className="flex items-center gap-3">
              <MyFanBoxBrandLogo logoUrl={brandLogoUrl} brandName={brandName} size="lg" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold tracking-tight text-zinc-900">{brandName}</span>
                  <span className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-zinc-100 border border-zinc-200 rounded text-zinc-700">
                    TRACKING & INVOICE
                  </span>
                </div>
                <p className="text-xs text-zinc-500">
                  Colección Oficial: {collectionName}
                </p>
              </div>
            </div>

            {/* Selector de Temas Eye-Care para el Visitante */}
            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-zinc-200 text-xs">
              <Palette className="w-3.5 h-3.5 text-zinc-500" />
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="bg-transparent font-medium text-zinc-800 focus:outline-none cursor-pointer"
              >
                {EYE_CARE_THEMES.map(t => (
                  <option key={t.id} value={t.id}>
                    Tema: {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* SI LA URL ES #/1620 O /1620 -> MOSTRAR PANTALLA SECRETA DE LOGIN ADMIN */}
          {isSecretLoginRoute ? (
            <div className="my-auto py-8 max-w-md mx-auto w-full">
              <div className="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 space-y-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-800 text-xs font-semibold">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Acceso Secreto · Ruta /1620</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSecretLoginRoute(false);
                      try {
                        window.history.replaceState(null, '', window.location.pathname + window.location.search);
                      } catch {
                        window.location.hash = '';
                      }
                    }}
                    className="text-xs text-zinc-400 hover:text-zinc-800"
                  >
                    ✕ Salir
                  </button>
                </div>

                <div>
                  <h2 className="text-lg font-bold text-zinc-900">Iniciar Sesión (Admin MyFanBox)</h2>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Portal oculto exclusivo para gestionar ventas, inventario por hacer, mapa de envíos y NeonDB.
                  </p>
                </div>

                <form onSubmit={handleAdminLoginSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">
                      Usuario Administrador
                    </label>
                    <input
                      type="text"
                      required
                      autoFocus
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      placeholder="admin"
                      className="w-full h-9 px-3 text-xs bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 focus:bg-white focus:border-zinc-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">
                      Contraseña Maestra
                    </label>
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full h-9 px-3 text-xs bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 focus:bg-white focus:border-zinc-900 focus:outline-none"
                    />
                  </div>

                  <label className="flex items-center gap-2 text-xs text-zinc-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberSession}
                      onChange={(e) => setRememberSession(e.target.checked)}
                      className="rounded border-zinc-300"
                    />
                    <span>Mantener sesión iniciada en este dispositivo</span>
                  </label>

                  {loginError && (
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium">
                      {loginError}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full h-10 rounded-xl bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Desbloquear Panel Admin</span>
                  </button>
                </form>

                {!adminConfig.hideDefaultHint && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 space-y-1">
                    <div className="font-semibold">Acceso administrativo protegido</div>
                    <div>Las credenciales iniciales se definen en las variables privadas del servidor. No se guardan en este navegador.</div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* PORTAL PÚBLICO PARA CLIENTES (SIN RASTRO VISIBLE DEL LOGIN DE ADMIN) */
            <div className="my-auto py-8 max-w-2xl mx-auto w-full">
              <div className="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-9 space-y-6 shadow-xs">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-800 text-xs font-semibold">
                    <Fingerprint className="w-3.5 h-3.5" />
                    <span>Portal Oficial de Seguimiento y Facturación</span>
                  </div>

                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
                    Consulta el estado de tu pedido y tu Factura Digital
                  </h1>

                  <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                    Para proteger tus datos personales y dirección de entrega, cada pedido de <strong>MyFanBox</strong> cuenta con un <strong>código único privado (UUID)</strong>. Pega a continuación el código o el enlace que recibiste por WhatsApp:
                  </p>
                </div>

                <form onSubmit={handleGuestOpenUuidTracking} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                      Código Único de Seguimiento (UUID)
                    </label>
                    <input
                      type="text"
                      value={guestUuidInput}
                      onChange={(e) => {
                        setGuestUuidInput(e.target.value);
                        setGuestLookupError('');
                      }}
                      placeholder="Ej: 4f8a2b1c-9d3e-4a1b-8c2d-7e6f5a4b3c2d"
                      className="w-full h-11 px-3.5 font-mono text-xs bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 focus:bg-white focus:border-zinc-900 focus:outline-none"
                    />
                  </div>

                  {guestLookupError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                      <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <span>{guestLookupError}</span>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="submit"
                      className="h-10 px-5 rounded-xl bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 inline-flex items-center gap-2 cursor-pointer"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Consultar Estado e Invoice</span>
                    </button>

                    {orders.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          const sampleOrder = orders[0];
                          setGuestUuidInput(sampleOrder.uuid);
                          handleOpenOrderDetails(sampleOrder.uuid, true);
                        }}
                        className="h-10 px-3.5 rounded-xl border border-zinc-200 bg-zinc-50 text-xs font-medium text-zinc-700 hover:bg-zinc-100 cursor-pointer"
                      >
                        Ver demo de factura cliente
                      </button>
                    )}
                  </div>
                </form>

                <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-[11px] text-zinc-500 space-y-1">
                  <div className="font-semibold text-zinc-800 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Privacidad Garantizada</span>
                  </div>
                  <p>
                    Los pedidos no pueden ser buscados por número consecutivo (<code className="font-mono">MFB-XXXX</code>), nombre ni teléfono. Solo quien posea el enlace privado enviado por WhatsApp tiene acceso a los detalles del envío.
                  </p>
                </div>
              </div>
            </div>
          )}

          <footer className="pt-4 border-t border-zinc-200 flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-400">
            <span>MyFanBox · Viajando por el Mundo — Karol G</span>
            <span>Seguimiento Encriptado con UUID v4</span>
          </footer>
        </div>
      ) : (
      <>
      {/* Mobile Backdrop */}
      {mobileMenuOpen && isAdmin && !isPublicCustomerView && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-zinc-950/30 backdrop-blur-[1px] z-30 lg:hidden"
        />
      )}

      {/* ===================================================================== */}
      {/* SIDEBAR LATERAL MINIMALISTA (SOLO VISIBLE PARA ADMINISTRADOR)         */}
      {/* ===================================================================== */}
      {isAdmin && !isPublicCustomerView && (
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-white border-r border-zinc-200 flex flex-col justify-between transition-transform duration-200 ease-out shrink-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-14 px-4 flex items-center justify-between border-b border-zinc-200">
            <div className="flex items-center gap-2.5">
              <MyFanBoxBrandLogo
                logoUrl={brandLogoUrl}
                brandName={brandName}
                size="sm"
                onUploadLogo={(dataUrl) => {
                  setBrandLogoUrl(dataUrl);
                  notify('Logo de MyFanBox actualizado');
                }}
              />
              <div>
                <div className="text-xs font-semibold tracking-tight text-zinc-900 leading-none flex items-center gap-1.5">
                  <span>{brandName} Ops</span>
                  <span className="px-1.5 py-0.5 text-[9px] font-mono bg-emerald-50 text-emerald-800 rounded border border-emerald-200">
                    ADMIN
                  </span>
                </div>
                <div className="text-[11px] text-zinc-500 mt-0.5 truncate max-w-[145px]">
                  {collectionName}
                </div>
              </div>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1 rounded-md text-zinc-400 hover:text-zinc-900"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Primary Navigation */}
          <nav className="p-2.5 space-y-0.5">
            <div className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              Operación Diaria
            </div>

            <button
              onClick={() => { handleExitDetailsToAdmin('orders'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'orders'
                  ? 'bg-zinc-900 text-white'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <span className="flex items-center gap-2">
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>1. Ventas y Pedidos</span>
              </span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                  activeTab === 'orders' ? 'bg-zinc-800 text-zinc-200' : 'bg-zinc-100 text-zinc-600'
                }`}
              >
                {metrics.activeOrdersCount}
              </span>
            </button>

            <button
              onClick={() => { handleExitDetailsToAdmin('inventory'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'inventory'
                  ? 'bg-zinc-900 text-white'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <span className="flex items-center gap-2">
                <Layers className="w-3.5 h-3.5" />
                <span>2. Inventario por Hacer</span>
              </span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                  activeTab === 'inventory'
                    ? 'bg-zinc-800 text-amber-300'
                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}
              >
                {productionMatrix.totalMissingToMake} pend
              </span>
            </button>

            <button
              onClick={() => { handleExitDetailsToAdmin('shipping'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'shipping'
                  ? 'bg-zinc-900 text-white'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <span className="flex items-center gap-2">
                <Truck className="w-3.5 h-3.5" />
                <span>3. Envíos y Guías</span>
              </span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                  activeTab === 'shipping'
                    ? 'bg-zinc-800 text-sky-300'
                    : 'bg-sky-50 text-sky-800 border border-sky-200'
                }`}
              >
                {metrics.countPorEnviar} listos
              </span>
            </button>

            <button
              onClick={() => { handleExitDetailsToAdmin('map'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'map'
                  ? 'bg-zinc-900 text-white'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <span className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" />
                <span>4. Mapa de Envíos y ETA</span>
              </span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                  activeTab === 'map'
                    ? 'bg-zinc-800 text-emerald-300'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}
              >
                Rutas
              </span>
            </button>

            <button
              onClick={() => { handleExitDetailsToAdmin('costs'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'costs'
                  ? 'bg-zinc-900 text-white'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <span className="flex items-center gap-2">
                <Calculator className="w-3.5 h-3.5" />
                <span>5. Catálogo y Costos</span>
              </span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                  activeTab === 'costs' ? 'bg-zinc-800 text-zinc-200' : 'bg-zinc-100 text-zinc-600'
                }`}
              >
                {catalog.length} refs
              </span>
            </button>

            <div className="pt-2 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              Cliente & Cloud
            </div>

            <button
              onClick={() => {
                handleOpenOrderDetails(detailOrderUuid || orders[0]?.uuid, false);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'details'
                  ? 'bg-zinc-900 text-white'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <span className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" />
                <span>Portal /details/ (UUID)</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600">
                UUID
              </span>
            </button>

            <button
              onClick={() => { handleExitDetailsToAdmin('neondb'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'neondb'
                  ? 'bg-zinc-900 text-white'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <span className="flex items-center gap-2">
                <Database className="w-3.5 h-3.5" />
                <span>6. Base de Datos NeonDB</span>
              </span>
              <span className="flex items-center gap-1 text-[10px]">
                <span
                  className={`w-2 h-2 rounded-full ${
                    neonStatus === 'connected'
                      ? 'bg-emerald-500'
                      : neonStatus === 'error'
                      ? 'bg-rose-500'
                      : 'bg-zinc-300'
                  }`}
                />
              </span>
            </button>

            <button
              onClick={() => { handleExitDetailsToAdmin('config'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${activeTab === 'config' ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'}`}
            >
              <span className="flex items-center gap-2"><SlidersHorizontal className="w-3.5 h-3.5" /><span>7. Set Config</span></span>
              <span className="text-[10px] text-zinc-400">Ajustes</span>
            </button>

            {/* Selector de Temas Eye-Care en Sidebar */}
            <div className="pt-3 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Palette className="w-3 h-3" />
              <span>Temas Descanso Visual</span>
            </div>
            <div className="grid grid-cols-2 gap-1 px-2">
              {EYE_CARE_THEMES.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  title={t.desc}
                  className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[11px] font-medium border transition-all cursor-pointer ${
                    theme === t.id
                      ? 'bg-zinc-900 text-white border-zinc-900'
                      : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:text-zinc-900'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 border"
                    style={{ backgroundColor: t.dot, borderColor: t.border }}
                  />
                  <span className="truncate">{t.short}</span>
                </button>
              ))}
            </div>
          </nav>
        </div>

        {/* Sidebar Bottom Financial Box + Admin Security / Logout */}
        <div className="p-3 border-t border-zinc-200 bg-zinc-50/70 space-y-2">
          <div className="bg-white p-2.5 rounded-xl border border-zinc-200 space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-zinc-500">Recaudado real</span>
              <span className="font-semibold text-emerald-700 tabular-nums">{formatCOP(metrics.collectedCash)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-500">Falta por cobrar</span>
              <span className="font-semibold text-amber-700 tabular-nums">{formatCOP(metrics.pendingToCollect)}</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-zinc-100">
              <span className="text-zinc-500">Ganancia Neta Est.</span>
              <span className="font-semibold text-zinc-900 tabular-nums">{formatCOP(metrics.netProfitProjected)}</span>
            </div>
          </div>

          {/* Indicador del Link Secreto de Login (#/1620) */}
          <div
            onClick={() =>
              copyToClipboard(
                `${window.location.origin}${window.location.pathname}#/1620`,
                'Enlace secreto de Login Admin (#/1620) copiado'
              )
            }
            title="Haz clic para copiar tu link secreto de administrador"
            className="px-2.5 py-1.5 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-between text-[10px] font-mono text-zinc-600 hover:text-zinc-900 cursor-pointer"
          >
            <span>🔒 Login oculto: #/1620</span>
            <Copy className="w-3 h-3" />
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={handleOpenSecurityModal}
              className="h-8 px-2 rounded-lg border border-zinc-200 bg-white text-[11px] font-medium text-zinc-700 hover:bg-zinc-100 flex items-center justify-center gap-1 cursor-pointer"
              title="Cambiar contraseña de Admin"
            >
              <KeyRound className="w-3 h-3" />
              <span>Clave Admin</span>
            </button>
            <button
              onClick={handleAdminLogout}
              className="h-8 px-2 rounded-lg border border-zinc-200 bg-white text-[11px] font-medium text-rose-700 hover:bg-rose-50 flex items-center justify-center gap-1 cursor-pointer"
              title="Cerrar sesión y ver como Guest"
            >
              <LogOut className="w-3 h-3" />
              <span>Salir (Guest)</span>
            </button>
          </div>
        </div>
      </aside>
      )}

      {/* ===================================================================== */}
      {/* CONTENEDOR PRINCIPAL + BARRA SUPERIOR FLOTANTE                        */}
      {/* ===================================================================== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Floating Top Bar (Only for logged-in Admin) */}
        {isAdmin && !isPublicCustomerView && (
        <header className="sticky top-0 z-20 h-14 bg-white/90 backdrop-blur-md border-b border-zinc-200 px-4 sm:px-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Instant Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activeTab !== 'orders') setActiveTab('orders');
                }}
                placeholder="Buscar clienta, @instagram, ciudad, guía, UUID o #MFB..."
                className="w-full h-8 pl-8 pr-12 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:bg-white focus:border-zinc-900 transition-colors"
              />
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400 hover:text-zinc-700 px-1"
                >
                  ✕
                </button>
              ) : (
                <kbd className="hidden sm:inline-block absolute right-2 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 bg-white border border-zinc-200 rounded">
                  /
                </kbd>
              )}
            </div>

            {/* Floating Quick Switcher on Desktop */}
            <div className="hidden xl:flex items-center bg-zinc-100 p-0.5 rounded-lg border border-zinc-200">
              {[
                { id: 'orders', label: 'Ventas' },
                { id: 'inventory', label: 'Inventario' },
                { id: 'shipping', label: 'Envíos' },
                { id: 'map', label: 'Mapa & ETA' },
                { id: 'details', label: 'Factura /details/' },
                { id: 'costs', label: 'Costos' },
                { id: 'neondb', label: 'NeonDB' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (tab.id === 'details') {
                      handleOpenOrderDetails(detailOrderUuid || orders[0]?.uuid, false);
                    } else {
                      handleExitDetailsToAdmin(tab.id);
                    }
                  }}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-white text-zinc-900 shadow-2xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right Action Buttons + Theme Selector */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Eye-Care Quick Theme Switcher */}
            <div className="flex items-center gap-1 bg-zinc-100 px-1.5 py-1 rounded-lg border border-zinc-200">
              <Palette className="w-3.5 h-3.5 text-zinc-500 hidden sm:inline" />
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                aria-label="Cambiar tema visual"
                className="h-6 px-1.5 text-[11px] font-medium bg-transparent text-zinc-800 focus:outline-none cursor-pointer"
              >
                {EYE_CARE_THEMES.map(t => (
                  <option key={t.id} value={t.id}>
                    Tema: {t.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => handleExitDetailsToAdmin('neondb')}
              className={`hidden md:inline-flex h-8 px-2.5 rounded-lg border text-xs font-medium items-center gap-1.5 transition-colors ${
                neonStatus === 'connected'
                  ? 'border-emerald-200 bg-emerald-50/60 text-emerald-800'
                  : 'border-zinc-200 bg-white text-zinc-600 hover:text-zinc-900'
              }`}
              title="Estado de Base de Datos NeonDB"
            >
              <Database className="w-3.5 h-3.5" />
              <span>{neonStatus === 'connected' ? 'NeonDB Conectado' : 'NeonDB'}</span>
            </button>

            <button
              onClick={() => handleOpenOrderModal(null)}
              className="h-8 px-3 rounded-lg bg-zinc-900 text-white text-xs font-medium hover:bg-zinc-800 active:scale-[0.99] transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Nuevo Pedido</span>
            </button>
          </div>
        </header>
        )}

        {/* Main View Area */}
        <main className="flex-1 p-4 sm:p-6 max-w-[1440px] w-full mx-auto space-y-5">
          {/* ================================================================= */}
          {/* VISTA 1: VENTAS Y PEDIDOS CON FILTROS Y ACCIONES RÁPIDAS          */}
          {/* ================================================================= */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {/* Top KPI Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                <div className="bg-white border border-zinc-200 rounded-xl p-3">
                  <div className="text-[11px] text-zinc-500 font-medium">Pedidos Activos</div>
                  <div className="text-lg font-semibold text-zinc-900 tabular-nums mt-0.5">
                    {metrics.activeOrdersCount}
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">
                    {metrics.cancelledOrders} canc · {metrics.refundedOrders} reemb
                  </div>
                </div>

                <div className="bg-white border border-zinc-200 rounded-xl p-3">
                  <div className="text-[11px] text-zinc-500 font-medium">Recaudado (En Caja)</div>
                  <div className="text-lg font-semibold text-emerald-700 tabular-nums mt-0.5">
                    {formatCOP(metrics.collectedCash)}
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">
                    {metrics.countPagado} pagados + {metrics.countSemi} al 50%
                  </div>
                </div>

                <div className="bg-white border border-zinc-200 rounded-xl p-3">
                  <div className="text-[11px] text-zinc-500 font-medium">Saldo por Cobrar</div>
                  <div className="text-lg font-semibold text-amber-700 tabular-nums mt-0.5">
                    {formatCOP(metrics.pendingToCollect)}
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">
                    {metrics.countPendiente} sin abono · {metrics.countSemi} deben 50%
                  </div>
                </div>

                <div className="bg-white border border-zinc-200 rounded-xl p-3">
                  <div className="text-[11px] text-zinc-500 font-medium">Por Preparar / Hacer</div>
                  <div className="text-lg font-semibold text-zinc-900 tabular-nums mt-0.5">
                    {metrics.countPorPreparar}
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">
                    {productionMatrix.totalMissingToMake} prendas por estampar
                  </div>
                </div>

                <div className="bg-white border border-zinc-200 rounded-xl p-3">
                  <div className="text-[11px] text-zinc-500 font-medium">Por Enviar / Enviados</div>
                  <div className="text-lg font-semibold text-sky-700 tabular-nums mt-0.5">
                    {metrics.countPorEnviar} <span className="text-zinc-300 font-normal">/</span>{' '}
                    <span className="text-emerald-700">{metrics.countEnviado}</span>
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">
                    Paquetes listos vs despachados
                  </div>
                </div>

                <div className="bg-white border border-zinc-200 rounded-xl p-3">
                  <div className="text-[11px] text-zinc-500 font-medium">Alerta Cobro Pre-Envío</div>
                  <div className="text-lg font-semibold text-rose-700 tabular-nums mt-0.5">
                    {metrics.shipWithDebtCount}
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">
                    Listos pero deben 50% o 100%
                  </div>
                </div>
              </div>

              {/* Filter Bar & Seed Data Actions */}
              <div className="bg-white border border-zinc-200 rounded-xl p-3.5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  {/* Status Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    {[
                      { id: 'ALL', label: 'Todos', count: orders.length, dot: 'bg-zinc-900' },
                      { id: 'Pendiente', label: 'Pendiente', count: metrics.countPendiente, dot: 'bg-rose-500' },
                      { id: 'Semi-pagado (50%)', label: 'Semi-pagado (50%)', count: metrics.countSemi, dot: 'bg-amber-500' },
                      { id: 'Pagado', label: 'Pagado', count: metrics.countPagado, dot: 'bg-emerald-500' },
                      { id: 'Por preparar', label: 'Por preparar', count: metrics.countPorPreparar, dot: 'bg-zinc-500' },
                      { id: 'Por enviar', label: 'Por enviar', count: metrics.countPorEnviar, dot: 'bg-sky-500' },
                      { id: 'Enviado', label: 'Enviado', count: metrics.countEnviado, dot: 'bg-emerald-600' },
                      { id: 'Cancelado', label: 'Cancelado', count: metrics.cancelledOrders, dot: 'bg-zinc-400' },
                      { id: 'Reembolsado', label: 'Reembolsado', count: metrics.refundedOrders, dot: 'bg-purple-500' },
                      ...(metrics.shipWithDebtCount > 0
                        ? [{ id: 'ALERT_COBROS', label: '⚠️ Cobrar antes de enviar', count: metrics.shipWithDebtCount, dot: 'bg-amber-600' }]
                        : [])
                    ].map(pill => {
                      const active = quickStatusFilter === pill.id;
                      return (
                        <button
                          key={pill.id}
                          onClick={() => {
                            setQuickStatusFilter(pill.id);
                            setPayFilter('ALL');
                            setShipFilter('ALL');
                          }}
                          className={`h-7 px-2.5 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1.5 border transition-all cursor-pointer ${
                            active
                              ? 'bg-zinc-900 text-white border-zinc-900'
                              : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:text-zinc-900 hover:bg-zinc-100'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-white' : pill.dot}`} />
                          <span>{pill.label}</span>
                          <span
                            className={`text-[10px] font-mono px-1 rounded ${
                              active ? 'bg-zinc-700 text-zinc-100' : 'bg-white text-zinc-500'
                            }`}
                          >
                            {pill.count}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Export & Seed Controls */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleExportCSV}
                      className="h-7 px-2.5 rounded-lg border border-zinc-200 bg-white text-xs font-medium text-zinc-700 hover:bg-zinc-50 flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Exportar CSV</span>
                    </button>

                  </div>
                </div>

                {/* Secondary Dropdown Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 pt-2 border-t border-zinc-100">
                  <select
                    value={payFilter}
                    onChange={(e) => { setPayFilter(e.target.value); setQuickStatusFilter('ALL'); }}
                    className="h-8 px-2.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-800 focus:outline-none focus:bg-white focus:border-zinc-900"
                  >
                    <option value="ALL">Estado de Pago: Todos</option>
                    {PAYMENT_STATUSES.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>

                  <select
                    value={shipFilter}
                    onChange={(e) => { setShipFilter(e.target.value); setQuickStatusFilter('ALL'); }}
                    className="h-8 px-2.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-800 focus:outline-none focus:bg-white focus:border-zinc-900"
                  >
                    <option value="ALL">Estado de Envío: Todos</option>
                    {SHIPPING_STATUSES.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>

                  <select
                    value={productFilter}
                    onChange={(e) => setProductFilter(e.target.value)}
                    className="h-8 px-2.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-800 focus:outline-none focus:bg-white focus:border-zinc-900"
                  >
                    <option value="ALL">Prenda del Catálogo: Todas</option>
                    {catalog.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>

                  <div className="grid grid-cols-2 gap-1.5">
                    <select
                      value={sizeFilter}
                      onChange={(e) => setSizeFilter(e.target.value)}
                      className="h-8 px-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-800 focus:outline-none focus:bg-white focus:border-zinc-900"
                    >
                      <option value="ALL">Talla: Todas</option>
                      {['XS', 'S', 'M', 'L', 'XL', '2XL', 'Única'].map(sz => (
                        <option key={sz} value={sz}>Talla {sz}</option>
                      ))}
                    </select>

                    <select
                      value={genderFilter}
                      onChange={(e) => setGenderFilter(e.target.value)}
                      className="h-8 px-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-800 focus:outline-none focus:bg-white focus:border-zinc-900"
                    >
                      <option value="ALL">Corte: Todos</option>
                      {GARMENT_GENDERS.map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-2">
                    {(searchQuery || quickStatusFilter !== 'ALL' || payFilter !== 'ALL' || shipFilter !== 'ALL' || productFilter !== 'ALL' || sizeFilter !== 'ALL' || genderFilter !== 'ALL') && (
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setQuickStatusFilter('ALL');
                          setPayFilter('ALL');
                          setShipFilter('ALL');
                          setProductFilter('ALL');
                          setSizeFilter('ALL');
                          setGenderFilter('ALL');
                        }}
                        className="h-8 px-2.5 rounded-lg border border-zinc-200 bg-white text-xs text-zinc-700 hover:bg-zinc-50"
                      >
                        Limpiar filtros
                      </button>
                    )}
                    <span className="text-xs font-mono text-zinc-500">
                      {filteredOrders.length} resultado{filteredOrders.length === 1 ? '' : 's'}
                    </span>
                  </div>
                </div>

                {/* Bulk Selection Action Bar */}
                {selectedOrderIds.length > 0 && (
                  <div className="pt-2 border-t border-zinc-200 flex flex-wrap items-center justify-between gap-2 bg-zinc-900 text-white px-3 py-2 rounded-lg text-xs">
                    <span className="font-medium">{selectedOrderIds.length} pedidos seleccionados</span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-zinc-400 mr-1">Cambiar pago a:</span>
                      {['Pagado', 'Semi-pagado (50%)', 'Pendiente', 'Cancelado'].map(st => (
                        <button
                          key={st}
                          onClick={() => handleBulkStatusUpdate('payment', st)}
                          className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-100"
                        >
                          {st}
                        </button>
                      ))}
                      <span className="text-zinc-400 mx-1">| Envío a:</span>
                      {SHIPPING_STATUSES.map(st => (
                        <button
                          key={st}
                          onClick={() => handleBulkStatusUpdate('shipping', st)}
                          className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-100"
                        >
                          {st}
                        </button>
                      ))}
                      <button
                        onClick={() => setSelectedOrderIds([])}
                        className="ml-2 text-zinc-400 hover:text-white"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Orders Table */}
              <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-200 bg-zinc-50/80 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                        <th className="py-2.5 px-3 w-9 text-center">
                          <input
                            type="checkbox"
                            checked={
                              paginatedOrders.length > 0 &&
                              paginatedOrders.every(o => selectedOrderIds.includes(o.id))
                            }
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedOrderIds(paginatedOrders.map(o => o.id));
                              } else {
                                setSelectedOrderIds([]);
                              }
                            }}
                            className="rounded border-zinc-300"
                          />
                        </th>
                        <th className="py-2.5 px-3 w-24">Orden</th>
                        <th className="py-2.5 px-3 min-w-[180px]">Cliente & Ciudad</th>
                        <th className="py-2.5 px-3 min-w-[260px]">Prendas Pedidas</th>
                        <th className="py-2.5 px-3 min-w-[140px]">Total / Saldo</th>
                        <th className="py-2.5 px-3 min-w-[165px]">Estado de Pago</th>
                        <th className="py-2.5 px-3 min-w-[165px]">Estado de Envío</th>
                        <th className="py-2.5 px-3 text-right min-w-[115px]">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 text-xs">
                      {paginatedOrders.map(order => {
                        const active = isOrderActive(order);
                        const paid = getPaidAmount(order);
                        const pending = getPendingAmount(order);
                        const showDebtWarning =
                          active &&
                          (order.shippingStatus === 'Por enviar' || order.shippingStatus === 'Enviado') &&
                          pending > 0;

                        return (
                          <tr
                            key={order.id}
                            className={`hover:bg-zinc-50/90 transition-colors ${
                              !active ? 'bg-zinc-50/50 opacity-70' : ''
                            }`}
                          >
                            <td className="py-3 px-3 align-top text-center">
                              <input
                                type="checkbox"
                                checked={selectedOrderIds.includes(order.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedOrderIds(prev => [...prev, order.id]);
                                  } else {
                                    setSelectedOrderIds(prev => prev.filter(id => id !== order.id));
                                  }
                                }}
                                className="rounded border-zinc-300"
                              />
                            </td>

                            <td className="py-3 px-3 align-top">
                              <div className="font-mono font-semibold text-zinc-900">{order.id}</div>
                              <div className="text-[11px] text-zinc-400 tabular-nums mt-0.5">{order.createdAt}</div>
                              <div
                                onClick={() =>
                                  copyToClipboard(
                                    getCustomerTrackingUrl(order),
                                    `Enlace privado UUID de ${order.id} copiado`
                                  )
                                }
                                title={`UUID secreto: ${order.uuid} (Clic para copiar enlace /details/)`}
                                className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-[9px] font-mono text-zinc-500 hover:text-zinc-900 cursor-pointer"
                              >
                                <Fingerprint className="w-2.5 h-2.5 text-sky-600" />
                                <span>{order.uuid.slice(0, 8)}…</span>
                              </div>
                            </td>

                            <td className="py-3 px-3 align-top">
                              <div className="font-medium text-zinc-900 flex items-center gap-1.5 flex-wrap">
                                <span>{order.customerName}</span>
                                {order.cedula && (
                                  <span className="px-1.5 py-0.2 rounded bg-zinc-100 border border-zinc-200 text-[10px] font-mono text-zinc-700">
                                    C.C. {order.cedula}
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-zinc-500 flex flex-wrap items-center gap-1.5 mt-0.5">
                                <span>{order.instagram}</span>
                                <span>·</span>
                                <span className="font-mono">{order.phone}</span>
                              </div>
                              <div className="text-[11px] text-zinc-400 mt-0.5 truncate max-w-[210px]">
                                {order.city} {order.neighborhood ? `(${order.neighborhood})` : ''} — {order.address}
                              </div>
                              <div className="flex items-center gap-1.5 mt-1">
                                {order.postalCode && (
                                  <span className="px-1.5 py-0.2 rounded bg-zinc-100 border border-zinc-200 text-[10px] font-mono text-zinc-700">
                                    CP {order.postalCode}
                                  </span>
                                )}
                                <span
                                  className={`px-1.5 py-0.2 rounded text-[10px] font-medium border ${
                                    order.addressVerified
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                      : 'bg-amber-50 text-amber-800 border-amber-200'
                                  }`}
                                >
                                  {order.addressVerified ? '✓ Mapa OK' : 'Por corroborar'}
                                </span>
                              </div>
                            </td>

                            <td className="py-3 px-3 align-top space-y-1">
                              {order.items.map((it, idx) => (
                                <div
                                  key={idx}
                                  className={`flex items-center gap-1.5 leading-snug ${
                                    !active ? 'line-through text-zinc-400' : ''
                                  }`}
                                >
                                  <span className="font-mono font-semibold text-zinc-900">{it.qty}×</span>
                                  <span className="font-medium text-zinc-900">{it.productName}</span>
                                  <span className="text-zinc-500 truncate max-w-[130px]">· {it.variantName}</span>
                                  <span className="px-1.5 py-0.2 bg-zinc-100 border border-zinc-200 rounded text-[10px] font-semibold text-zinc-800">
                                    {it.size}
                                  </span>
                                  <span className="px-1.5 py-0.2 bg-zinc-50 border border-zinc-200 rounded text-[10px] text-zinc-600">
                                    {it.gender || 'Sin especificar'}
                                  </span>
                                </div>
                              ))}
                              {order.notes && (
                                <div className="text-[11px] text-zinc-500 italic">Nota: {order.notes}</div>
                              )}
                            </td>

                            <td className="py-3 px-3 align-top tabular-nums">
                              <div className="font-semibold text-zinc-900">{formatCOP(order.total)}</div>
                              {!active ? (
                                <div className="text-[11px] text-zinc-400">{order.paymentStatus}</div>
                              ) : pending > 0 ? (
                                <>
                                  <div className="text-[11px] font-medium text-amber-700 mt-0.5">
                                    Debe: {formatCOP(pending)}
                                  </div>
                                  <div className="text-[10px] text-zinc-400">Abonó: {formatCOP(paid)}</div>
                                </>
                              ) : (
                                <div className="text-[11px] font-medium text-emerald-700 mt-0.5">Pagado 100%</div>
                              )}
                            </td>

                            {/* 1-Click Payment Status Selector */}
                            <td className="py-3 px-3 align-top">
                              <select
                                value={order.paymentStatus}
                                onChange={(e) => handleUpdateOrderPayment(order.id, e.target.value)}
                                className={`h-7 px-2 rounded-lg border text-xs font-medium cursor-pointer focus:outline-none ${getPayStatusBadgeClass(
                                  order.paymentStatus
                                )}`}
                              >
                                {PAYMENT_STATUSES.map(st => (
                                  <option key={st} value={st}>
                                    {st}
                                  </option>
                                ))}
                              </select>
                            </td>

                            {/* 1-Click Shipping Status Selector */}
                            <td className="py-3 px-3 align-top">
                              <select
                                value={order.shippingStatus}
                                onChange={(e) => handleUpdateOrderShipping(order.id, e.target.value)}
                                className={`h-7 px-2 rounded-lg border text-xs font-medium cursor-pointer focus:outline-none ${getShipStatusBadgeClass(
                                  order.shippingStatus
                                )}`}
                              >
                                {SHIPPING_STATUSES.map(st => (
                                  <option key={st} value={st}>
                                    {st}
                                  </option>
                                ))}
                              </select>

                              {showDebtWarning && (
                                <div className="mt-1.5 px-2 py-1 rounded-md bg-amber-100 border border-amber-300 text-[10px] font-semibold text-amber-900 leading-tight">
                                  ⚠️ Cobrar saldo de {formatCOP(pending)} antes de enviar
                                </div>
                              )}
                            </td>

                            <td className="py-3 px-3 align-top text-right">
                              <div className="inline-flex items-center gap-1">
                                <button
                                  onClick={() => handleOpenOrderDetails(order.uuid, false)}
                                  className="h-7 px-2 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 font-medium inline-flex items-center gap-1"
                                  title={`Abrir página privada /details/${order.uuid}`}
                                >
                                  <FileText className="w-3.5 h-3.5 text-sky-600" />
                                  <span>/details/</span>
                                </button>
                                <button
                                  onClick={() => handleOpenWhatsApp(order)}
                                  className="h-7 px-2 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 font-medium inline-flex items-center gap-1"
                                  title="Enviar resumen y link UUID privado por WhatsApp"
                                >
                                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>WA</span>
                                </button>
                                <button
                                  onClick={() => handleOpenOrderModal(order)}
                                  className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
                                  title="Editar pedido"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (!isAdmin) return;
                                    setOrders(prev => prev.filter(o => o.id !== order.id));
                                    notify(`Pedido ${order.id} eliminado`);
                                  }}
                                  className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50"
                                  title="Eliminar pedido"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}

                      {paginatedOrders.length === 0 && (
                        <tr>
                          <td colSpan={8} className="py-12 text-center text-xs text-zinc-500">
                            No se encontraron pedidos con los filtros actuales.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Bar */}
                <div className="px-4 py-2.5 border-t border-zinc-200 bg-zinc-50/60 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500">
                  <div className="flex items-center gap-2">
                    <span className="tabular-nums">
                      Página {currentPage} de {totalPages} ({filteredOrders.length} pedidos)
                    </span>
                    <select
                      value={pageSize}
                      onChange={(e) => setPageSize(Number(e.target.value))}
                      className="h-7 px-2 rounded border border-zinc-200 bg-white text-xs text-zinc-700"
                    >
                      <option value={25}>25 por página</option>
                      <option value={50}>50 por página</option>
                      <option value={150}>Ver todos (150)</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      className="h-7 px-2.5 rounded border border-zinc-200 bg-white text-zinc-700 disabled:opacity-40 flex items-center gap-1"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" /> Anterior
                    </button>
                    <button
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      className="h-7 px-2.5 rounded border border-zinc-200 bg-white text-zinc-700 disabled:opacity-40 flex items-center gap-1"
                    >
                      Siguiente <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* VISTA 2: INVENTARIO POR HACER (COMPRAR, ESTAMPAR, EMPACAR)        */}
          {/* ================================================================= */}
          {activeTab === 'inventory' && (
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

                {/* Sub-navigation */}
                <div className="inline-flex p-1 rounded-xl bg-white border border-zinc-200 self-start">
                  <button
                    onClick={() => setInvSubtab('buy')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      invSubtab === 'buy' ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:text-zinc-900'
                    }`}
                  >
                    A. ¿Qué toca comprar? ({shoppingNeeds.totalMissingToBuy})
                  </button>
                  <button
                    onClick={() => setInvSubtab('make')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      invSubtab === 'make' ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:text-zinc-900'
                    }`}
                  >
                    B. ¿Qué toca estampar? ({productionMatrix.totalMissingToMake})
                  </button>
                  <button
                    onClick={() => setInvSubtab('pack')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      invSubtab === 'pack' ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:text-zinc-900'
                    }`}
                  >
                    C. ¿Qué toca empacar? ({metrics.countPorPreparar})
                  </button>
                </div>
              </div>

              {/* SUB-TAB A: QUÉ TOCA COMPRAR AL PROVEEDOR */}
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
                              .map((r: any) => {
                                const gParts = Object.entries(r.genderBreakdown || {})
                                  .filter(([, count]) => Number(count) > 0)
                                  .map(([g, count]) => `${count} ${g}`)
                                  .join(', ');
                                return `• ${r.blankName} [Talla ${r.sizeOrSpec}${gParts ? ` — ${gParts}` : ''}] -> COMPRAR: ${r.missing} uds (Pedidos: ${r.required}, En stock: ${r.bought})`;
                              })
                              .join('\n');
                          copyToClipboard(txt, 'Lista de compras para proveedor copiada');
                        }}
                        className="h-8 px-3 rounded-lg bg-zinc-900 text-white text-xs font-medium hover:bg-zinc-800 inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar lista para proveedor</span>
                      </button>
                    </div>

                    {/* Filtros rápidos de Inventario (Por defecto muestra TODAS las prendas y TODAS las tallas) */}
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
                            !invShowOnlyOrdered
                              ? 'bg-zinc-900 text-white border-zinc-900'
                              : 'bg-zinc-50 text-zinc-600 border-zinc-200'
                          }`}
                        >
                          Ver todas las tallas ({shoppingNeeds.rows.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setInvShowOnlyOrdered(true)}
                          className={`h-8 px-3 rounded-lg border text-xs font-medium cursor-pointer ${
                            invShowOnlyOrdered
                              ? 'bg-zinc-900 text-white border-zinc-900'
                              : 'bg-zinc-50 text-zinc-600 border-zinc-200'
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
                            <th className="py-2.5 px-4 text-center">Talla / Corte Pedido</th>
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
                            .map((row: any) => {
                              const femCount = row.genderBreakdown?.Femenino || 0;
                              const mascCount = row.genderBreakdown?.Masculino || 0;
                              const unspecCount = row.genderBreakdown?.['Sin especificar'] || 0;
                              return (
                                <tr key={row.key} className="hover:bg-zinc-50/80">
                                  <td className="py-2.5 px-4 text-zinc-500">{row.categoryLabel}</td>
                                  <td className="py-2.5 px-4">
                                    <div className="font-medium text-zinc-900">{row.blankName}</div>
                                    {Array.isArray(row.refNames) && row.refNames.length > 0 && (
                                      <div className="text-[10px] text-zinc-400">
                                        Ref: {row.refNames.join(' · ')}
                                      </div>
                                    )}
                                  </td>
                                  <td className="py-2.5 px-4 text-center">
                                    <div className="inline-flex flex-wrap items-center justify-center gap-1">
                                      <span className="px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200 font-semibold text-zinc-800">
                                        {row.sizeOrSpec}
                                      </span>
                                      {femCount > 0 && (
                                        <span className="px-1.5 py-0.5 rounded bg-rose-50 border border-rose-200 text-[10px] text-rose-800">
                                          {femCount} Fem
                                        </span>
                                      )}
                                      {mascCount > 0 && (
                                        <span className="px-1.5 py-0.5 rounded bg-sky-50 border border-sky-200 text-[10px] text-sky-800">
                                          {mascCount} Masc
                                        </span>
                                      )}
                                      {unspecCount > 0 && (
                                        <span className="px-1.5 py-0.5 rounded bg-zinc-50 border border-zinc-200 text-[10px] text-zinc-600">
                                          {unspecCount} S/E
                                        </span>
                                      )}
                                    </div>
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
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* SUB-TAB B: MATRIZ DE ESTAMPADO Y PRODUCCIÓN */}
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
                              .map((r: any) => {
                                const gParts = Object.entries(r.genderBreakdown || {})
                                  .filter(([, count]) => Number(count) > 0)
                                  .map(([g, count]) => `${count} ${g}`)
                                  .join(', ');
                                return `• ${r.productName} (${r.variantName}) — Talla ${r.size}${gParts ? ` [${gParts}]` : ''} -> HACER: ${r.missing} uds`;
                              })
                              .join('\n');
                          copyToClipboard(txt, 'Orden de taller copiada al portapapeles');
                        }}
                        className="h-8 px-3 rounded-lg bg-zinc-900 text-white text-xs font-medium hover:bg-zinc-800 inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar orden para estampador</span>
                      </button>
                    </div>

                    {/* Filtros rápidos de Matriz de Producción */}
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
                            !invShowOnlyOrdered
                              ? 'bg-zinc-900 text-white border-zinc-900'
                              : 'bg-zinc-50 text-zinc-600 border-zinc-200'
                          }`}
                        >
                          Ver todas las tallas ({productionMatrix.rows.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setInvShowOnlyOrdered(true)}
                          className={`h-8 px-3 rounded-lg border text-xs font-medium cursor-pointer ${
                            invShowOnlyOrdered
                              ? 'bg-zinc-900 text-white border-zinc-900'
                              : 'bg-zinc-50 text-zinc-600 border-zinc-200'
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
                            <th className="py-2.5 px-4 text-center">Talla / Corte</th>
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
                              const femCount = row.genderBreakdown?.Femenino || 0;
                              const mascCount = row.genderBreakdown?.Masculino || 0;
                              const unspecCount = row.genderBreakdown?.['Sin especificar'] || 0;
                              return (
                                <tr key={row.key} className="hover:bg-zinc-50/80">
                                  <td className="py-2.5 px-4 font-medium text-zinc-900">{row.productName}</td>
                                  <td className="py-2.5 px-4 text-zinc-600">{row.variantName}</td>
                                  <td className="py-2.5 px-4 text-center">
                                    <div className="inline-flex flex-wrap items-center justify-center gap-1">
                                      <span className="px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200 font-semibold text-zinc-800">
                                        {row.size}
                                      </span>
                                      {femCount > 0 && (
                                        <span className="px-1.5 py-0.5 rounded bg-rose-50 border border-rose-200 text-[10px] text-rose-800">
                                          {femCount} Fem
                                        </span>
                                      )}
                                      {mascCount > 0 && (
                                        <span className="px-1.5 py-0.5 rounded bg-sky-50 border border-sky-200 text-[10px] text-sky-800">
                                          {mascCount} Masc
                                        </span>
                                      )}
                                      {unspecCount > 0 && (
                                        <span className="px-1.5 py-0.5 rounded bg-zinc-50 border border-zinc-200 text-[10px] text-zinc-600">
                                          {unspecCount} S/E
                                        </span>
                                      )}
                                    </div>
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
                                        className={`h-full transition-all ${
                                          row.progress >= 100 ? 'bg-emerald-600' : 'bg-zinc-900'
                                        }`}
                                        style={{ width: `${row.progress}%` }}
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

              {/* SUB-TAB C: MESA DE EMPAQUE POR PEDIDO */}
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
                                <span
                                  className={`px-2 py-0.5 rounded border text-[10px] font-medium ${getPayStatusBadgeClass(
                                    order.paymentStatus
                                  )}`}
                                >
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
                                allPacked
                                  ? 'bg-zinc-900 text-white hover:bg-zinc-800'
                                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
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
          )}

          {/* ================================================================= */}
          {/* VISTA 3: ENVÍOS Y GUÍAS (CON ALERTA DE COBRO PRE-DESPACHO)        */}
          {/* ================================================================= */}
          {activeTab === 'shipping' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-base sm:text-lg font-semibold text-zinc-900">
                    Tablero de Envíos, Transportadoras y Guías
                  </h1>
                  <p className="text-xs text-zinc-500">
                    Verifica que ningún paquete en <strong>"Por enviar"</strong> salga sin haber cobrado el 50% restante.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={shippingBoardFilter}
                    onChange={(e) => setShippingBoardFilter(e.target.value)}
                    className="h-8 px-3 text-xs bg-white border border-zinc-200 rounded-lg text-zinc-800"
                  >
                    <option value="ALL">Ver: Todos los activos ({metrics.activeOrdersCount})</option>
                    <option value="Por enviar">Solo: Por enviar ({metrics.countPorEnviar})</option>
                    <option value="Por preparar">Solo: Por preparar ({metrics.countPorPreparar})</option>
                    <option value="Enviado">Solo: Enviados ({metrics.countEnviado})</option>
                    <option value="DEBT_ALERT">⚠️ Solo: Listos con saldo pendiente ({metrics.shipWithDebtCount})</option>
                  </select>

                  <button
                    onClick={() => {
                      const ready = orders.filter(o => isOrderActive(o) && o.shippingStatus === 'Por enviar');
                      if (!ready.length) {
                        notify('No hay paquetes en estado "Por enviar"');
                        return;
                      }
                      const txt =
                        `*PLANILLA DE DESPACHO — MYFANBOX (${ready.length} paquetes)*\n` +
                        ready
                          .map(
                            o =>
                              `• ${o.id} | ${o.customerName} | Tel: ${o.phone} | ${o.city} (${o.address}) | ${o.carrier} ${
                                getPendingAmount(o) > 0 ? `[⚠️ COBRAR ANTES: ${formatCOP(getPendingAmount(o))}]` : '[100% PAGADO]'
                              }`
                          )
                          .join('\n');
                      copyToClipboard(txt, 'Planilla de envíos copiada');
                    }}
                    className="h-8 px-3 rounded-lg bg-zinc-900 text-white text-xs font-medium hover:bg-zinc-800 inline-flex items-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar planilla de despacho</span>
                  </button>
                </div>
              </div>

              {/* 3 Stage Summary Columns */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div
                  onClick={() => setShippingBoardFilter('Por preparar')}
                  className="bg-white border border-zinc-200 rounded-xl p-3.5 cursor-pointer hover:border-zinc-400 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span>1. Por preparar (En taller/empaque)</span>
                    <Clock className="w-4 h-4 text-zinc-400" />
                  </div>
                  <div className="text-xl font-semibold text-zinc-900 tabular-nums mt-1">
                    {metrics.countPorPreparar} paquetes
                  </div>
                </div>

                <div
                  onClick={() => setShippingBoardFilter('Por enviar')}
                  className="bg-white border border-sky-200 rounded-xl p-3.5 cursor-pointer hover:border-sky-400 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs text-sky-800 font-medium">
                    <span>2. Por enviar (Empacados listos)</span>
                    <Package className="w-4 h-4 text-sky-600" />
                  </div>
                  <div className="text-xl font-semibold text-sky-900 tabular-nums mt-1">
                    {metrics.countPorEnviar} paquetes
                  </div>
                  {metrics.shipWithDebtCount > 0 && (
                    <div className="text-[11px] font-semibold text-amber-800 mt-1">
                      ⚠️ {metrics.shipWithDebtCount} tienen saldo pendiente por cobrar
                    </div>
                  )}
                </div>

                <div
                  onClick={() => setShippingBoardFilter('Enviado')}
                  className="bg-white border border-emerald-200 rounded-xl p-3.5 cursor-pointer hover:border-emerald-400 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs text-emerald-800 font-medium">
                    <span>3. Enviados (Con guía asignada)</span>
                    <Truck className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-xl font-semibold text-emerald-900 tabular-nums mt-1">
                    {metrics.countEnviado} paquetes
                  </div>
                </div>
              </div>

              {/* Shipping Table */}
              <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-200 bg-zinc-50/80 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                        <th className="py-2.5 px-4 w-24">Orden</th>
                        <th className="py-2.5 px-4 min-w-[180px]">Destinatario & Teléfono</th>
                        <th className="py-2.5 px-4 min-w-[200px]">Ciudad & Dirección</th>
                        <th className="py-2.5 px-4 min-w-[185px]">Verificación de Pago</th>
                        <th className="py-2.5 px-4 min-w-[155px]">Transportadora</th>
                        <th className="py-2.5 px-4 min-w-[160px]">Número de Guía</th>
                        <th className="py-2.5 px-4 min-w-[140px]">Estado Envío</th>
                        <th className="py-2.5 px-4 text-right">Aviso WA</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 text-xs">
                      {orders
                        .filter(o => {
                          if (!isOrderActive(o)) return false;
                          if (shippingBoardFilter === 'ALL') return true;
                          if (shippingBoardFilter === 'DEBT_ALERT') {
                            return (
                              (o.shippingStatus === 'Por enviar' || o.shippingStatus === 'Enviado') &&
                              getPendingAmount(o) > 0
                            );
                          }
                          return o.shippingStatus === shippingBoardFilter;
                        })
                        .slice(0, 60)
                        .map(order => {
                          const pending = getPendingAmount(order);
                          return (
                            <tr key={order.id} className="hover:bg-zinc-50/80">
                              <td className="py-3 px-4 font-mono font-semibold text-zinc-900">{order.id}</td>
                              <td className="py-3 px-4">
                                <div className="font-medium text-zinc-900">{order.customerName}</div>
                                {order.cedula && (
                                  <div className="text-[11px] font-mono text-zinc-600">C.C. {order.cedula}</div>
                                )}
                                <div className="text-[11px] text-zinc-500 font-mono">{order.phone}</div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="font-medium text-zinc-800">{order.city}</div>
                                <input
                                  type="text"
                                  value={order.address || ''}
                                  onChange={(e) => handleUpdateOrderField(order.id, 'address', e.target.value)}
                                  placeholder="Dirección..."
                                  className="mt-0.5 w-full h-7 px-2 text-xs bg-zinc-50 border border-zinc-200 rounded text-zinc-800 focus:bg-white focus:border-zinc-900 focus:outline-none"
                                />
                              </td>
                              <td className="py-3 px-4 tabular-nums">
                                {pending > 0 ? (
                                  <div className="inline-flex flex-col px-2.5 py-1 rounded-lg bg-amber-100/80 border border-amber-300 text-amber-950">
                                    <span className="font-semibold text-[11px]">
                                      ⚠️ Cobrar saldo de {formatCOP(pending)}
                                    </span>
                                    <span className="text-[10px] text-amber-800">
                                      Estado actual: {order.paymentStatus}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium">
                                    ✓ Pagado 100% ({formatCOP(order.total)})
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-4">
                                <select
                                  value={order.carrier || 'Interrapidísimo'}
                                  onChange={(e) => handleUpdateOrderField(order.id, 'carrier', e.target.value)}
                                  className="w-full h-7 px-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-800"
                                >
                                  {CARRIERS.map(c => (
                                    <option key={c} value={c}>
                                      {c}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="py-3 px-4">
                                <input
                                  type="text"
                                  value={order.trackingNumber || ''}
                                  onChange={(e) => handleUpdateOrderField(order.id, 'trackingNumber', e.target.value)}
                                  placeholder="Pegar # guía..."
                                  className="w-full h-7 px-2.5 font-mono text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 focus:bg-white focus:border-zinc-900 focus:outline-none"
                                />
                              </td>
                              <td className="py-3 px-4">
                                <select
                                  value={order.shippingStatus}
                                  onChange={(e) => handleUpdateOrderShipping(order.id, e.target.value)}
                                  className={`h-7 px-2 rounded-lg border text-xs font-medium cursor-pointer ${getShipStatusBadgeClass(
                                    order.shippingStatus
                                  )}`}
                                >
                                  {SHIPPING_STATUSES.map(st => (
                                    <option key={st} value={st}>
                                      {st}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="inline-flex items-center gap-1">
                                  <button
                                    onClick={() => handleOpenOrderDetails(order.uuid, false)}
                                    className="h-7 px-2 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-medium text-zinc-800"
                                    title={`Abrir factura privada /details/${order.uuid}`}
                                  >
                                    /details/
                                  </button>
                                  <button
                                    onClick={() => handleOpenWhatsApp(order)}
                                    className="h-7 px-2.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-medium text-zinc-800"
                                  >
                                    Enviar WA
                                  </button>
                                </div>
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

          {/* ================================================================= */}
          {/* VISTA 3.B: MAPA INTERACTIVO DE ENVÍOS Y CALCULADORA DE ETA        */}
          {/* ================================================================= */}
          {activeTab === 'map' && (
            <div className="space-y-4">
              <section className="bg-white border border-zinc-200 rounded-xl p-4 space-y-3">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                  <div>
                    <h1 className="text-lg font-semibold text-zinc-900 flex items-center gap-2"><MapPin className="w-5 h-5 text-sky-600" /> Mapa de envíos y ETA</h1>
                    <p className="text-xs text-zinc-500 mt-1">Direcciones de pedidos activos guardados en NeonDB. No hay ubicaciones de demostración.</p>
                  </div>
                  <div className="flex flex-wrap gap-2 items-center">
                    <label className="text-xs text-zinc-500">Despacho desde</label>
                    <select value={originHub} onChange={e => setOriginHub(e.target.value)} className="h-8 px-2 rounded-lg border border-zinc-200 bg-zinc-50 text-xs text-zinc-900">{Object.keys(COLOMBIA_CITIES_GEO).map(city => <option key={city} value={city}>{city}</option>)}</select>
                    <select value={mapCarrierFilter} onChange={e => setMapCarrierFilter(e.target.value)} className="h-8 px-2 rounded-lg border border-zinc-200 bg-zinc-50 text-xs text-zinc-900"><option value="ALL">Todas las transportadoras</option>{CARRIERS.map(c => <option key={c}>{c}</option>)}</select>
                    <select value={mapStatusFilter} onChange={e => setMapStatusFilter(e.target.value)} className="h-8 px-2 rounded-lg border border-zinc-200 bg-zinc-50 text-xs text-zinc-900"><option value="ALL">Todos los estados</option>{SHIPPING_STATUSES.map(st => <option key={st}>{st}</option>)}</select>
                  </div>
                </div>
                {selectedMapEntry ? (
                  <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_1fr] gap-3">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="inline-flex p-0.5 rounded-lg bg-zinc-100 border border-zinc-200 text-xs">
                          <button
                            type="button"
                            onClick={() => setMapEngine('manual-pin')}
                            className={`px-2.5 py-1 rounded-md font-medium ${mapEngine === 'manual-pin' ? 'bg-white text-zinc-900 shadow-2xs' : 'text-zinc-600'}`}
                          >
                            📍 Mover Pin Manualmente
                          </button>
                          <button
                            type="button"
                            onClick={() => setMapEngine('gmaps')}
                            className={`px-2.5 py-1 rounded-md font-medium ${mapEngine === 'gmaps' ? 'bg-white text-zinc-900 shadow-2xs' : 'text-zinc-600'}`}
                          >
                            Google Maps Vista Calle
                          </button>
                        </div>
                        <span className="text-[11px] font-mono text-zinc-500">
                          Coordenadas: {selectedMapEntry.eta.coords.lat}, {selectedMapEntry.eta.coords.lng}
                        </span>
                      </div>

                      {mapEngine === 'manual-pin' ? (
                        <InteractiveManualPinMap
                          lat={selectedMapEntry.eta.coords.lat}
                          lng={selectedMapEntry.eta.coords.lng}
                          title={`${selectedMapEntry.order.id} · ${selectedMapEntry.order.customerName}`}
                          subtitle={`${selectedMapEntry.order.address || ''}, ${selectedMapEntry.order.city}`}
                          heightClass="h-[360px]"
                          onPinChange={async (newLat, newLng) => {
                            const targetId = selectedMapEntry.order.id;
                            const quick = inferMetadataFromCoordinates(newLat, newLng);
                            setOrders(prev =>
                              prev.map(o =>
                                o.id === targetId
                                  ? {
                                      ...o,
                                      lat: newLat,
                                      lng: newLng,
                                      city: quick.city,
                                      neighborhood: quick.neighborhood,
                                      postalCode: quick.postalCode,
                                      manualPin: true,
                                      addressVerified: true
                                    }
                                  : o
                              )
                            );
                            notify(`Pin manual fijado en ${newLat}, ${newLng} (${quick.neighborhood}, CP ${quick.postalCode})`);
                            const rev = await reverseGeocodeFromCoordinates(newLat, newLng, googleMapsApiKey);
                            setOrders(prev =>
                              prev.map(o =>
                                o.id === targetId
                                  ? {
                                      ...o,
                                      lat: rev.lat,
                                      lng: rev.lng,
                                      city: rev.city,
                                      neighborhood: rev.neighborhood,
                                      postalCode: rev.postalCode,
                                      address: rev.streetAddress || o.address,
                                      formattedAddress: rev.formattedAddress,
                                      manualPin: true,
                                      addressVerified: true
                                    }
                                  : o
                              )
                            );
                          }}
                        />
                      ) : (
                        <div className="rounded-xl overflow-hidden border border-zinc-200 bg-zinc-100 min-h-[360px]">
                          <iframe
                            title={`Mapa de ${selectedMapEntry.order.id}`}
                            className="w-full h-[360px] border-0"
                            loading="lazy"
                            src={`https://maps.google.com/maps?q=${encodeURIComponent(
                              selectedMapEntry.order.manualPin && typeof selectedMapEntry.order.lat === 'number'
                                ? `${selectedMapEntry.order.lat},${selectedMapEntry.order.lng}`
                                : `${selectedMapEntry.order.address || ''}, ${selectedMapEntry.order.neighborhood || ''}, ${selectedMapEntry.order.city || 'Medellín'}, Colombia`
                            )}&z=16&output=embed`}
                          />
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs">
                        <div>
                          <label className="block text-[10px] text-zinc-500 mb-0.5">Latitud Manual</label>
                          <input
                            type="number"
                            step="0.0001"
                            value={selectedMapEntry.eta.coords.lat}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              if (!isNaN(val)) {
                                setOrders(prev =>
                                  prev.map(o => (o.id === selectedMapEntry.order.id ? { ...o, lat: val, manualPin: true, addressVerified: true } : o))
                                );
                              }
                            }}
                            className="w-full h-7 px-2 rounded border border-zinc-200 bg-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-zinc-500 mb-0.5">Longitud Manual</label>
                          <input
                            type="number"
                            step="0.0001"
                            value={selectedMapEntry.eta.coords.lng}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              if (!isNaN(val)) {
                                setOrders(prev =>
                                  prev.map(o => (o.id === selectedMapEntry.order.id ? { ...o, lng: val, manualPin: true, addressVerified: true } : o))
                                );
                              }
                            }}
                            className="w-full h-7 px-2 rounded border border-zinc-200 bg-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-zinc-500 mb-0.5">Pegar Coordenadas / Link Maps</label>
                          <input
                            type="text"
                            value={mapCoordPaste}
                            onChange={(e) => {
                              const txt = e.target.value;
                              setMapCoordPaste(txt);
                              const parsed = parseCoordsFromInput(txt);
                              if (parsed) {
                                setOrders(prev =>
                                  prev.map(o =>
                                    o.id === selectedMapEntry.order.id
                                      ? { ...o, lat: parsed.lat, lng: parsed.lng, manualPin: true, addressVerified: true }
                                      : o
                                  )
                                );
                                notify(`Coordenadas aplicadas: ${parsed.lat}, ${parsed.lng}`);
                              }
                            }}
                            placeholder="Ej: 6.2089, -75.5678"
                            className="w-full h-7 px-2 rounded border border-zinc-200 bg-white font-mono"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="rounded-xl border border-zinc-200 p-3 space-y-2">
                        <div className="flex items-center justify-between gap-2"><span className="font-semibold text-zinc-900">{selectedMapEntry.order.id} · {selectedMapEntry.order.customerName}</span><span className={`text-[10px] px-2 py-1 rounded border ${getShipStatusBadgeClass(selectedMapEntry.order.shippingStatus)}`}>{selectedMapEntry.order.shippingStatus}</span></div>
                        <p className="text-xs text-zinc-600">{selectedMapEntry.order.address || 'Sin dirección'}, {selectedMapEntry.order.neighborhood || 'Zona urbana'}, {selectedMapEntry.order.city}</p>
                        <p className="text-[11px] text-zinc-500">CP {selectedMapEntry.order.postalCode || '—'} · {selectedMapEntry.order.carrier}</p>
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-100">
                          <div><div className="text-[10px] text-zinc-500">Tiempo estimado</div><div className="font-semibold text-sm text-zinc-900">{selectedMapEntry.eta.etaLabel}</div></div>
                          <div><div className="text-[10px] text-zinc-500">Fecha estimada</div><div className="font-semibold text-sm text-emerald-700">{selectedMapEntry.eta.windowDates}</div></div>
                        </div>
                        <div className="text-[11px] text-zinc-500">Distancia aprox.: {selectedMapEntry.eta.distanceKm} km · Envío GRATIS</div>
                        <div className="flex gap-2 pt-1">
                          <button onClick={() => handleOpenOrderDetails(selectedMapEntry.order.uuid, false)} className="flex-1 h-8 rounded-lg bg-zinc-900 text-white text-xs font-semibold">Ver factura</button>
                          <button onClick={() => handleOpenWhatsApp(selectedMapEntry.order)} className="flex-1 h-8 rounded-lg border border-zinc-200 text-xs font-semibold text-emerald-700">WhatsApp</button>
                        </div>
                      </div>
                      <div className="rounded-xl border border-zinc-200 p-3 space-y-2">
                        <label className="block text-[11px] text-zinc-500">Cambiar transportadora</label>
                        <select value={selectedMapEntry.order.carrier} onChange={e => handleUpdateOrderField(selectedMapEntry.order.id, 'carrier', e.target.value)} className="w-full h-8 px-2 rounded-lg border border-zinc-200 bg-zinc-50 text-xs text-zinc-900">{CARRIERS.map(c => <option key={c}>{c}</option>)}</select>
                        <label className="block text-[11px] text-zinc-500">Número de guía</label>
                        <input value={selectedMapEntry.order.trackingNumber || ''} onChange={e => handleUpdateOrderField(selectedMapEntry.order.id, 'trackingNumber', e.target.value)} placeholder="Ingresar guía" className="w-full h-8 px-2 rounded-lg border border-zinc-200 bg-zinc-50 text-xs text-zinc-900" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-zinc-300 p-10 text-center text-xs text-zinc-500">Todavía no hay pedidos activos con direcciones para mostrar en el mapa.</div>
                )}
              </section>
              <section className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-zinc-200 flex items-center justify-between"><h2 className="text-sm font-semibold text-zinc-900">Pedidos con ubicación ({mapOrdersWithGeo.length})</h2><span className="text-[11px] text-zinc-500">Selecciona uno para centrar el mapa</span></div>
                <div className="divide-y divide-zinc-200 max-h-[420px] overflow-auto">
                  {mapOrdersWithGeo.map(({ order, eta }) => <button key={order.id} onClick={() => setSelectedMapOrderId(order.id)} className={`w-full p-3 flex flex-wrap items-center justify-between gap-2 text-left hover:bg-zinc-50 ${selectedMapEntry?.order.id === order.id ? 'bg-sky-50' : ''}`}>
                    <span className="min-w-0"><span className="block text-xs font-semibold text-zinc-900">{order.id} · {order.customerName}</span><span className="block text-[11px] text-zinc-500 truncate">{order.city} · {order.address || 'Sin dirección'}</span></span>
                    <span className="text-right"><span className="block text-[11px] font-medium text-zinc-700">{order.carrier}</span><span className="block text-[10px] text-zinc-500">{eta.etaLabel}</span></span>
                  </button>)}
                  {!mapOrdersWithGeo.length && <div className="p-6 text-center text-xs text-zinc-500">Sin pedidos que coincidan con los filtros.</div>}
                </div>
              </section>
            </div>
          )}

          {/* ================================================================= */}
          {/* VISTA 3.C: PORTAL DE SEGUIMIENTO Y FACTURA (/details/:uuid)       */}
          {/* ================================================================= */}
          {activeTab === 'details' && (
            <div className="space-y-4 max-w-4xl mx-auto">
              {!isAdmin && <div className="bg-white border border-zinc-200 rounded-xl p-3 flex items-center justify-between gap-2 text-xs">
                <span className="font-semibold text-zinc-900">{brandName} · Seguimiento privado</span>
                <select value={theme} onChange={e => setTheme(e.target.value)} className="h-8 px-2 rounded-lg border border-zinc-200 bg-zinc-50">{EYE_CARE_THEMES.map(t => <option key={t.id} value={t.id}>{t.short}</option>)}</select>
              </div>}
              {isAdmin && <div className="no-print bg-white border border-zinc-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2"><span className="font-semibold text-zinc-700">Pedido</span><select value={currentDetailOrder?.uuid || ''} onChange={e => handleOpenOrderDetails(e.target.value, false)} className="h-8 px-2 rounded-lg border border-zinc-200 bg-zinc-50 font-mono max-w-[260px]">{orders.map(o => <option key={o.uuid} value={o.uuid}>{o.id} — {o.customerName}</option>)}</select></div>
                {currentDetailOrder && <div className="flex flex-wrap gap-1.5">
                  <button onClick={() => handleRegenerateOrderUUID(currentDetailOrder.id)} className="h-8 px-2.5 rounded-lg border border-zinc-200">Regenerar UUID</button>
                  <button onClick={() => copyToClipboard(getCustomerTrackingUrl(currentDetailOrder), 'Enlace privado copiado')} className="h-8 px-2.5 rounded-lg border border-zinc-200">Copiar link</button>
                  <button onClick={() => handleOpenWhatsApp(currentDetailOrder)} className="h-8 px-2.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800">WhatsApp</button>
                  <button onClick={() => window.print()} className="h-8 px-2.5 rounded-lg bg-zinc-900 text-white">Imprimir PDF</button>
                </div>}
              </div>}
              {(detailSecurityError || !currentDetailOrder) ? (
                <div className="bg-white border border-zinc-200 rounded-2xl p-8 text-center space-y-3">
                  <ShieldAlert className="w-8 h-8 text-rose-500 mx-auto" />
                  <h2 className="text-lg font-semibold text-zinc-900">No se pudo abrir este pedido</h2>
                  <p className="text-xs text-zinc-600">{detailSecurityError || (activeTab === 'details' ? 'Buscando el pedido en NeonDB…' : 'No encontramos el pedido.')}</p>
                  <button onClick={() => handleExitDetailsToAdmin(isAdmin ? 'orders' : 'orders')} className="h-9 px-4 rounded-lg bg-zinc-900 text-white text-xs font-semibold">Volver</button>
                </div>
              ) : (() => {
                const o = currentDetailOrder;
                const eta = calculateOrderETA(o, originHub);
                const paid = getPaidAmount(o);
                const pending = getPendingAmount(o);
                const subtotal = (o.items || []).reduce((sum, item) => sum + (Number(item.unitPrice) || 0) * (Number(item.qty) || 0), 0);
                const currentStep = !isOrderActive(o) ? 0 : o.shippingStatus === 'Enviado' ? 4 : o.shippingStatus === 'Por enviar' ? 3 : (o.paymentStatus === 'Pagado' || o.paymentStatus === 'Semi-pagado (50%)') ? 2 : 1;
                const steps = ['Pedido registrado', 'En preparación', 'Empacado', 'Enviado'];
                return <div className="bg-white border border-zinc-200 rounded-2xl p-5 sm:p-8 shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 border-b border-zinc-200 pb-4">
                    <div><div className="flex items-center gap-2"><MyFanBoxBrandLogo logoUrl={brandLogoUrl} brandName={brandName} size="lg" /><div><h1 className="text-lg font-bold text-zinc-900">{brandName} · FACTURA</h1><p className="text-[11px] text-zinc-500">{collectionName}</p></div></div><p className="text-[11px] text-zinc-400 font-mono mt-2">Pedido {o.id} · Fecha {o.createdAt || '—'}</p></div>
                    <div className="flex flex-wrap gap-2"><span className={`px-2.5 py-1 rounded-lg border text-xs font-semibold ${getPayStatusBadgeClass(o.paymentStatus)}`}>Pago: {o.paymentStatus}</span><span className={`px-2.5 py-1 rounded-lg border text-xs font-semibold ${getShipStatusBadgeClass(o.shippingStatus)}`}>Envío: {o.shippingStatus}</span></div>
                  </div>
                  <section className="space-y-2"><div className="flex items-center justify-between gap-2"><h2 className="text-sm font-semibold text-zinc-900">Seguimiento del pedido</h2><span className="text-xs text-sky-700">{eta.etaLabel} · {eta.windowDates}</span></div><div className="grid grid-cols-2 sm:grid-cols-4 gap-2">{steps.map((step, idx) => <div key={step} className={`rounded-xl border p-3 text-xs ${currentStep >= idx + 1 ? 'border-emerald-200 bg-emerald-50/50' : 'border-zinc-200 bg-zinc-50'}`}><div className="font-semibold text-zinc-900">{idx + 1}. {step}</div><div className="text-[10px] text-zinc-500 mt-1">{currentStep >= idx + 1 ? 'Completado' : 'Pendiente'}</div></div>)}</div></section>
                  <section className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 space-y-1 text-xs"><h2 className="font-semibold text-zinc-900">Datos del cliente y entrega</h2><div className="text-zinc-700 font-medium">{o.customerName} {o.cedula ? `· C.C. ${o.cedula}` : ''}</div><div className="text-zinc-600">{o.address || 'Dirección pendiente'} · {o.neighborhood || 'Zona urbana'} · {o.city}</div><div className="text-zinc-500">Código postal: {o.postalCode || '—'} · {o.carrier}{o.trackingNumber ? ` · Guía ${o.trackingNumber}` : ''} · Envío GRATIS</div><div className="pt-2 text-[11px] text-zinc-500">Origen: {originHub} · Distancia aproximada: {eta.distanceKm} km · Coordenadas: {eta.coords.lat}, {eta.coords.lng}</div></section>
                  <section className="border border-zinc-200 rounded-xl overflow-hidden"><table className="w-full text-left text-xs"><thead className="bg-zinc-50 text-zinc-500"><tr><th className="p-3">Producto</th><th className="p-3">Variante</th><th className="p-3">Talla / Corte</th><th className="p-3 text-center">Cant.</th><th className="p-3 text-right">Subtotal</th></tr></thead><tbody className="divide-y divide-zinc-200">{(o.items || []).map((item, idx) => <tr key={item.id || idx}><td className="p-3 font-semibold text-zinc-900">{item.productName}</td><td className="p-3 text-zinc-600">{item.variantName}</td><td className="p-3">{item.size} · <span className="text-zinc-500">{item.gender || 'Sin especificar'}</span></td><td className="p-3 text-center">{item.qty}</td><td className="p-3 text-right font-medium">{formatCOP((Number(item.unitPrice) || 0) * (Number(item.qty) || 0))}</td></tr>)}</tbody></table></section>
                  <div className="flex flex-col sm:flex-row gap-3 justify-between"><div className="flex-1">{pending > 0 && isOrderActive(o) ? <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900"><strong>Saldo pendiente: {formatCOP(pending)}</strong><p className="mt-1 text-[11px]">Para despachar el pedido debe estar cancelado el 100%.</p></div> : <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-900"><strong>¡Gracias por tu compra!</strong> Tu pedido está al día.</div>}<button onClick={() => window.print()} className="no-print mt-2 h-8 px-3 rounded-lg border border-zinc-200 text-xs font-semibold">Descargar / Imprimir PDF</button></div><div className="w-full sm:w-72 rounded-xl bg-zinc-50 border border-zinc-200 p-4 space-y-2 text-xs"><div className="flex justify-between"><span>Subtotal</span><strong>{formatCOP(subtotal)}</strong></div>{(o.discount || 0) > 0 && <div className="flex justify-between text-emerald-700"><span>Descuento</span><strong>-{formatCOP(o.discount)}</strong></div>}<div className="border-t border-zinc-200 pt-2 flex justify-between text-sm font-bold"><span>Total</span><span>{formatCOP(o.total)}</span></div><div className="flex justify-between text-emerald-700"><span>Pagado</span><strong>{formatCOP(paid)}</strong></div><div className="flex justify-between text-amber-700"><span>Pendiente</span><strong>{formatCOP(pending)}</strong></div></div></div>
                  <p className="text-[10px] text-zinc-400 font-mono break-all">Código privado: {o.uuid}</p>
                </div>;
              })()}
            </div>
          )}

          {/* ================================================================= */}
          {/* VISTA 4: CATÁLOGO OFICIAL Y COSTOS (GANANCIA NETA)                */}
          {/* ================================================================= */}
          {activeTab === 'costs' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-base sm:text-lg font-semibold text-zinc-900">
                    Catálogo Oficial "Viajando por el Mundo - Karol G" & Ganancia Neta
                  </h1>
                  <p className="text-xs text-zinc-500">
                    Edita el <strong>Costo Unitario de Producción</strong> cuando tu novia te confirme cuánto le cuesta cada prenda para ver la ganancia real al instante.
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

              {/* Financial Summary Banner */}
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
                    {formatCOP(metrics.netProfitProjected)}
                  </div>
                </div>
                <div className="bg-white border border-zinc-200 rounded-xl p-4">
                  <div className="text-xs text-zinc-500">Margen Promedio</div>
                  <div className="text-xl font-semibold text-zinc-900 tabular-nums mt-1">
                    {metrics.marginPct}%
                  </div>
                </div>
              </div>

              {/* Catalog Cost Editor Table */}
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
          )}

          {/* ================================================================= */}
          {/* VISTA 6: BASE DE DATOS NEONDB — CONEXIÓN DESDE EL SERVIDOR       */}
          {/* ================================================================= */}
          {activeTab === 'neondb' && (
            <div className="space-y-4">
              <section className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-lg font-semibold text-zinc-900">NeonDB · PostgreSQL compartido</h1>
                      <span className={`px-2.5 py-1 rounded-full border text-[11px] font-semibold ${neonStatus === 'connected' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : neonStatus === 'error' ? 'bg-rose-50 text-rose-800 border-rose-200' : 'bg-amber-50 text-amber-800 border-amber-200'}`}>
                        {neonStatus === 'connected' ? 'Conectado' : neonStatus === 'error' ? 'Sin conexión' : 'Comprobando…'}
                      </span>
                      {isSavingData && <span className="text-[11px] text-sky-700">Guardando cambios…</span>}
                    </div>
                    <p className="text-xs text-zinc-500 mt-1 max-w-2xl">
                      Los pedidos, el catálogo y el inventario se leen y escriben en NeonDB a través del backend. Abrir la app en incógnito o en otro dispositivo no crea otra base ni vuelve a cargar pedidos ficticios.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={handleInitNeonTables} className="h-9 px-3 rounded-lg bg-zinc-900 text-white text-xs font-semibold inline-flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verificar tablas
                    </button>
                    <button onClick={handlePushAllToNeon} disabled={!isDataReady || isSavingData} className="h-9 px-3 rounded-lg border border-zinc-200 bg-white text-zinc-800 text-xs font-semibold disabled:opacity-50 inline-flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" /> Guardar ahora
                    </button>
                    <button onClick={handlePullFromNeon} className="h-9 px-3 rounded-lg border border-zinc-200 bg-white text-zinc-800 text-xs font-semibold inline-flex items-center gap-1.5">
                      <Download className="w-3.5 h-3.5" /> Recargar desde Neon
                    </button>
                  </div>
                </div>
                {dataError && <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">{dataError}</div>}
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
                  <p>Ya no pegues tu Connection String en el navegador. Configura <code>DATABASE_URL</code> en el servidor (por ejemplo Render). La clave queda privada en el backend y la web usa únicamente <code>/api</code>.</p>
                </div>
                <div className="flex items-center justify-between text-[11px] text-zinc-500">
                  <span>Última sincronización: {neonLastSync || '—'}</span>
                  <span>Guardado automático habilitado</span>
                </div>
              </section>

              <section className="bg-white border border-zinc-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-sm font-semibold text-zinc-900">Consola SQL de solo lectura</h2>
                  <button onClick={async () => {
                    const result = await executeNeonQuery(customSqlQuery);
                    if (result.ok) { setCustomSqlResult(result.data?.rows || []); notify('Consulta ejecutada en NeonDB.'); }
                    else notify(`La consulta falló: ${result.error}`, 'error');
                  }} className="h-8 px-3 rounded-lg bg-zinc-900 text-white text-xs font-semibold inline-flex items-center gap-1.5">
                    <Play className="w-3.5 h-3.5" /> Ejecutar SELECT
                  </button>
                </div>
                <textarea rows={3} value={customSqlQuery} onChange={e => setCustomSqlQuery(e.target.value)} className="w-full p-3 font-mono text-xs bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900" />
                <p className="text-[11px] text-zinc-500">Por seguridad, esta consola solo acepta consultas de lectura (SELECT, WITH, EXPLAIN o SHOW).</p>
                {customSqlResult && <pre className="p-3 rounded-xl bg-zinc-950 text-zinc-100 font-mono text-[11px] max-h-56 overflow-auto">{JSON.stringify(customSqlResult, null, 2)}</pre>}
              </section>
              <section className="bg-white border border-zinc-200 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-zinc-900">Registro de actividad</h2>
                  <button onClick={() => setSqlLogs([])} className="text-[11px] text-zinc-500 hover:text-zinc-900">Limpiar</button>
                </div>
                <div className="space-y-2 max-h-60 overflow-auto">
                  {sqlLogs.map(log => <div key={log.id} className="rounded-lg bg-zinc-50 border border-zinc-200 p-2.5 font-mono text-[11px]">
                    <div className="flex justify-between gap-2 text-zinc-400"><span>{log.timestamp}</span><span>{log.status} · {log.durationMs}ms</span></div>
                    <div className="text-zinc-800 break-all mt-1">{log.sql}</div>
                    {log.detail && <div className="text-zinc-500 mt-1">{log.detail}</div>}
                  </div>)}
                  {sqlLogs.length === 0 && <p className="text-xs text-zinc-500">Sin actividad registrada.</p>}
                </div>
              </section>
            </div>
          )}

          {/* ================================================================= */}
          {/* VISTA 7: SET CONFIG — PARÁMETROS EDITABLES DE LA OPERACIÓN       */}
          {/* ================================================================= */}
          {activeTab === 'config' && (
            <div className="space-y-4 max-w-5xl">
              <div>
                <h1 className="text-lg font-semibold text-zinc-900 flex items-center gap-2"><SlidersHorizontal className="w-5 h-5" /> Set Config</h1>
                <p className="text-xs text-zinc-500 mt-1">Parámetros operativos y visuales editables sin tocar el código. Los cambios se guardan en NeonDB y se comparten entre dispositivos.</p>
              </div>
              <section className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-4">
                <h2 className="text-sm font-semibold text-zinc-900">Identidad y Logo de MyFanBox</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="text-xs text-zinc-600 space-y-1"><span>Nombre de marca</span><input value={brandName} onChange={e => setBrandName(e.target.value)} className="w-full h-9 px-3 rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-900" /></label>
                  <label className="text-xs text-zinc-600 space-y-1"><span>Nombre de colección</span><input value={collectionName} onChange={e => setCollectionName(e.target.value)} className="w-full h-9 px-3 rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-900" /></label>
                </div>
                <div className="pt-2 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <MyFanBoxBrandLogo
                      logoUrl={brandLogoUrl}
                      brandName={brandName}
                      size="lg"
                      onUploadLogo={(dataUrl) => {
                        setBrandLogoUrl(dataUrl);
                        notify('Logo de MyFanBox cargado');
                      }}
                    />
                    <div className="text-xs">
                      <div className="font-semibold text-zinc-900">Logo Oficial de MyFanBox</div>
                      <p className="text-[11px] text-zinc-500">Haz clic sobre el logo para subir una imagen (.png / .jpg / .svg) o pega una URL de imagen.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-1 max-w-md">
                    <input
                      type="text"
                      value={brandLogoUrl}
                      onChange={(e) => setBrandLogoUrl(e.target.value)}
                      placeholder="Pegar URL del logo o subir haciendo clic en el emblema..."
                      className="flex-1 h-8 px-2.5 text-xs rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-900"
                    />
                    {brandLogoUrl && (
                      <button
                        type="button"
                        onClick={() => setBrandLogoUrl('')}
                        className="h-8 px-2.5 rounded-lg border border-zinc-200 text-xs text-rose-600 hover:bg-rose-50"
                      >
                        Restaurar emblema
                      </button>
                    )}
                  </div>
                </div>
              </section>
              <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-950 space-y-1">
                <div className="flex items-center gap-2 text-sm font-semibold"><Truck className="w-4 h-4" /> Política de envíos: GRATIS</div>
                <p className="text-xs">Todos los envíos son gratuitos para el cliente, sin importar la transportadora o ciudad. El sistema no suma ningún cargo de envío al total del pedido.</p>
              </section>
              <section className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-4">
                <h2 className="text-sm font-semibold text-zinc-900">Operación y logística</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="text-xs text-zinc-600 space-y-1"><span>Centro de despacho predeterminado</span><select value={originHub} onChange={e => setOriginHub(e.target.value)} className="w-full h-9 px-3 rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-900">{Object.keys(COLOMBIA_CITIES_GEO).map(city => <option key={city} value={city}>{city}</option>)}</select></label>
                  <label className="text-xs text-zinc-600 space-y-1"><span>Transportadora predeterminada</span><select value={defaultCarrier} onChange={e => setDefaultCarrier(e.target.value)} className="w-full h-9 px-3 rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-900">{CARRIERS.map(carrier => <option key={carrier} value={carrier}>{carrier}</option>)}</select></label>
                  <label className="text-xs text-zinc-600 space-y-1"><span>Descuento por combo con llavero (COP)</span><input type="number" min="0" step="500" value={comboDiscountValue} onChange={e => setComboDiscountValue(Math.max(0, Number(e.target.value) || 0))} className="w-full h-9 px-3 rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-900" /></label>
                  <label className="text-xs text-zinc-600 space-y-1"><span>Google Maps Geocoding API Key (opcional)</span><input type="password" value={googleMapsApiKey} onChange={e => setGoogleMapsApiKey(e.target.value)} placeholder="AIza..." className="w-full h-9 px-3 rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-900 font-mono" /></label>
                </div>
              </section>
              <section className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between gap-2"><h2 className="text-sm font-semibold text-zinc-900">Apariencia</h2><span className="text-[11px] text-zinc-500">{EYE_CARE_THEMES.length} temas disponibles</span></div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {EYE_CARE_THEMES.map(t => <button key={t.id} onClick={() => setTheme(t.id)} title={t.desc} className={`flex items-center gap-2 rounded-xl border p-3 text-left text-xs transition-all ${theme === t.id ? 'border-zinc-900 ring-1 ring-zinc-900 bg-zinc-50' : 'border-zinc-200 hover:border-zinc-400'}`}>
                    <span className="w-5 h-5 rounded-full border shrink-0" style={{ backgroundColor: t.dot, borderColor: t.border }} />
                    <span className="min-w-0"><span className="block font-semibold text-zinc-900 truncate">{t.name}</span><span className="block text-[10px] text-zinc-500 truncate">{t.desc}</span></span>
                  </button>)}
                </div>
              </section>
              <section className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div><h2 className="text-sm font-semibold text-zinc-900">Editor Visual de Tema (Colores, Hovers y Selección)</h2><p className="text-xs text-zinc-500 mt-1">Personaliza los 12 canales de color en vivo. Los cambios se sincronizan con NeonDB.</p></div>
                  <button type="button" onClick={() => setTheme('custom')} className="rounded-lg px-3 py-2 text-xs font-semibold bg-zinc-900 text-white">Aplicar mi tema</button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {[
                    ['background', 'Fondo general'],
                    ['surface', 'Tarjetas y paneles'],
                    ['surfaceAlt', 'Superficie secundaria'],
                    ['border', 'Bordes y separadores'],
                    ['hover', 'Fondo Hover (Cursor)'],
                    ['hoverText', 'Texto Hover (Cursor)'],
                    ['selectedBg', 'Fondo Seleccionado'],
                    ['selectedText', 'Texto Seleccionado'],
                    ['text', 'Texto principal'],
                    ['muted', 'Texto secundario'],
                    ['primary', 'Color de acción'],
                    ['primaryText', 'Texto sobre acciones']
                  ].map(([key, label]) => (
                    <label key={key} className="flex items-center gap-2 rounded-xl border border-zinc-200 p-2.5 text-xs text-zinc-700 cursor-pointer hover:bg-zinc-50">
                      <input
                        type="color"
                        value={(activeThemePalette as any)[key] || '#1C232D'}
                        onChange={e => {
                          const val = e.target.value;
                          setCustomTheme(prev => ({ ...(theme === 'custom' ? prev : activeThemePalette), [key]: val }));
                          if (theme !== 'custom') setTheme('custom');
                        }}
                        className="w-9 h-9 rounded-lg border-0 bg-transparent cursor-pointer shrink-0"
                      />
                      <span className="min-w-0">
                        <span className="block font-semibold truncate">{label}</span>
                        <span className="block font-mono text-[10px] text-zinc-500">{(activeThemePalette as any)[key]}</span>
                      </span>
                    </label>
                  ))}
                </div>
                <div className="rounded-xl p-4 border space-y-2" style={{ background: customTheme.background, color: customTheme.text, borderColor: customTheme.border }}>
                  <div className="rounded-lg border p-3" style={{ background: customTheme.surface, borderColor: customTheme.border }}><div className="font-semibold text-sm">Vista previa de MyFanBox</div><div className="text-xs mt-1" style={{ color: customTheme.muted }}>Texto secundario · pedidos · inventario</div><button type="button" onClick={() => setTheme('custom')} className="mt-3 rounded-lg px-3 py-2 text-xs font-semibold" style={{ background: customTheme.primary, color: customTheme.primaryText }}>Acción principal</button></div>
                  <div className="text-[10px]" style={{ color: customTheme.muted }}>Vista previa de superficies, tipografía y acento.</div>
                </div>
                <div className="flex flex-wrap gap-2 text-[11px]">
                  <span className={`rounded-lg px-2.5 py-1.5 border ${getContrastRatio(customTheme.text, customTheme.surface) >= 4.5 ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-amber-300 bg-amber-50 text-amber-900'}`}>Texto / tarjeta: {getContrastRatio(customTheme.text, customTheme.surface).toFixed(2)}:1 {getContrastRatio(customTheme.text, customTheme.surface) >= 4.5 ? '· Buen contraste' : '· Conviene aumentarlo'}</span>
                  <span className={`rounded-lg px-2.5 py-1.5 border ${getContrastRatio(customTheme.primaryText, customTheme.primary) >= 4.5 ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-amber-300 bg-amber-50 text-amber-900'}`}>Botón: {getContrastRatio(customTheme.primaryText, customTheme.primary).toFixed(2)}:1 {getContrastRatio(customTheme.primaryText, customTheme.primary) >= 4.5 ? '· Buen contraste' : '· Conviene aumentarlo'}</span>
                </div>
                <div className="flex flex-wrap gap-2"><button type="button" onClick={() => setCustomTheme({ background:'#F4F1EA', surface:'#FFFFFF', surfaceAlt:'#E9E4DA', text:'#24211D', muted:'#625C53', primary:'#315C52', primaryText:'#FFFFFF', border:'#CFC7B9' })} className="rounded-lg border border-zinc-200 px-3 py-2 text-xs">Restaurar paleta equilibrada</button><button type="button" onClick={() => setTheme('custom')} className="rounded-lg bg-zinc-900 text-white px-3 py-2 text-xs font-semibold">Usar este tema</button></div>
              </section>
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900">
                <span>{isSavingData ? 'Guardando configuración…' : 'La configuración se sincroniza automáticamente con NeonDB.'}</span>
                <button onClick={handlePushAllToNeon} disabled={isSavingData} className="h-8 px-3 rounded-lg bg-zinc-900 text-white font-semibold disabled:opacity-50">Guardar ahora</button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ===================================================================== */}
      {/* MODAL: NUEVO PEDIDO / EDITAR PEDIDO CON GOOGLE MAPS & CÓDIGO POSTAL   */}
      {/* ===================================================================== */}
      {orderModalOpen && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/50 backdrop-blur-[2px]">
          <form
            onSubmit={handleSaveOrderModal}
            className="bg-white border border-zinc-200 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-xl overflow-hidden"
          >
            <div className="px-5 py-3.5 border-b border-zinc-200 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-base font-semibold text-zinc-900">
                  {editingOrder ? `Editar Pedido ${editingOrder.id}` : 'Nuevo Pedido MyFanBox'}
                </h2>
                <p className="text-xs text-zinc-500">
                  Corrobora la dirección en Google Maps para autocompletar barrio, código postal y coordenadas exactas.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOrderModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-5 text-xs">
              {/* 1. Datos del Cliente y Verificador Google Maps */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                    1. Datos del Cliente y Verificación de Dirección en Google Maps
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
                    <label className="block font-medium text-zinc-700 mb-1">Cédula / Documento *</label>
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

                {/* Bloque Único: Pin de Ubicación Manual con Coordenadas (Autocompleta Ciudad, Barrio, Código Postal y Dirección) */}
                <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-zinc-800 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Poner Pin de Ubicación Manualmente o Coordenadas (Autocompleta Ciudad, Barrio y Código Postal)</span>
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
                          setDraftCustomer(prev => ({
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
                          setDraftCustomer(prev => ({
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
                        setDraftCustomer(prev => ({
                          ...prev,
                          lat: newLat,
                          city: quick.city,
                          neighborhood: quick.neighborhood,
                          postalCode: quick.postalCode,
                          manualPin: true,
                          addressVerified: true
                        }));
                        const rev = await reverseGeocodeFromCoordinates(newLat, draftCustomer.lng, googleMapsApiKey);
                        setDraftCustomer(prev => ({
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
                        setDraftCustomer(prev => ({
                          ...prev,
                          lng: newLng,
                          city: quick.city,
                          neighborhood: quick.neighborhood,
                          postalCode: quick.postalCode,
                          manualPin: true,
                          addressVerified: true
                        }));
                        const rev = await reverseGeocodeFromCoordinates(draftCustomer.lat, newLng, googleMapsApiKey);
                        setDraftCustomer(prev => ({
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
                      setDraftCustomer(prev => ({
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
                      setDraftCustomer(prev => ({
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

                  {/* Resumen automático detectado por las coordenadas + campo editable para Apto/Casa/Detalle */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-1">
                    <div className="sm:col-span-3 px-2.5 py-1.5 rounded-lg bg-white border border-zinc-200">
                      <span className="block text-[10px] text-zinc-400">Ciudad (Auto por Pin)</span>
                      <span className="font-semibold text-zinc-900">{draftCustomer.city || '—'}</span>
                    </div>
                    <div className="sm:col-span-3 px-2.5 py-1.5 rounded-lg bg-white border border-zinc-200">
                      <span className="block text-[10px] text-zinc-400">Barrio / Zona (Auto por Pin)</span>
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
                        placeholder="Dirección / Apto / Casa (Autocompletada)"
                        className="w-full h-full min-h-[38px] px-2.5 bg-white border border-zinc-200 rounded-lg text-zinc-900 text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Prendas del Pedido */}
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
                        setSelVarId(prod.variants[0]?.id || '');
                        setSelSize(prod.sizes[0] || 'M');
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
                        <option key={v.id} value={v.id}>
                          {v.name}
                        </option>
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
                        return sizeList.map(sz => (
                          <option key={sz} value={sz}>
                            {sz}
                          </option>
                        ));
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
                      {GARMENT_GENDERS.map(g => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
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

                {/* Lista de prendas añadidas */}
                {draftItems.length > 0 && (
                  <div className="space-y-1.5">
                    {draftItems.map((it, idx) => (
                      <div
                        key={it.id || idx}
                        className="flex items-center justify-between px-3 py-2 rounded-lg bg-white border border-zinc-200"
                      >
                        <div>
                          <span className="font-semibold text-zinc-900">
                            {it.qty}× {it.productName}
                          </span>{' '}
                          <span className="text-zinc-500">· {it.variantName}</span>{' '}
                          <select
                            value={it.size || 'M'}
                            onChange={(e) => {
                              const newSize = e.target.value;
                              setDraftItems(prev => prev.map((row, rIdx) => (rIdx === idx ? { ...row, size: newSize } : row)));
                            }}
                            className="h-6 px-1.5 rounded bg-zinc-100 border border-zinc-200 text-[10px] font-semibold"
                            title="Cambiar talla"
                          >
                            {([...ALL_GARMENT_SIZES, 'Única']).map(sz => (
                              <option key={sz} value={sz}>Talla {sz}</option>
                            ))}
                          </select>{' '}
                          <select
                            value={it.gender || 'Sin especificar'}
                            onChange={(e) => {
                              const newGender = e.target.value;
                              setDraftItems(prev => prev.map((row, rIdx) => (rIdx === idx ? { ...row, gender: newGender } : row)));
                            }}
                            className="h-6 px-1.5 rounded bg-zinc-50 border border-zinc-200 text-[10px] font-medium"
                          >
                            {GARMENT_GENDERS.map(g => (
                              <option key={g} value={g}>{g}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold">{formatCOP(it.unitPrice * it.qty)}</span>
                          <button
                            type="button"
                            onClick={() => setDraftItems(prev => prev.filter((_, i) => i !== idx))}
                            className="text-zinc-400 hover:text-rose-600"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. Estado de Pago, Transportadora y Guía */}
              <div className="pt-3 border-t border-zinc-200 grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-medium text-zinc-700 mb-1">Estado de Pago</label>
                  <select
                    value={draftCustomer.paymentStatus}
                    onChange={(e) => setDraftCustomer({ ...draftCustomer, paymentStatus: e.target.value })}
                    className="w-full h-9 px-2.5 bg-zinc-50 border border-zinc-200 rounded-lg font-semibold"
                  >
                    {PAYMENT_STATUSES.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-zinc-700 mb-1">Estado de Envío</label>
                  <select
                    value={draftCustomer.shippingStatus}
                    onChange={(e) => setDraftCustomer({ ...draftCustomer, shippingStatus: e.target.value })}
                    className="w-full h-9 px-2.5 bg-zinc-50 border border-zinc-200 rounded-lg font-semibold"
                  >
                    {SHIPPING_STATUSES.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-zinc-700 mb-1">Transportadora</label>
                  <select
                    value={draftCustomer.carrier}
                    onChange={(e) => setDraftCustomer({ ...draftCustomer, carrier: e.target.value })}
                    className="w-full h-9 px-2.5 bg-zinc-50 border border-zinc-200 rounded-lg"
                  >
                    {CARRIERS.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
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
            </div>

            <div className="px-5 py-3.5 border-t border-zinc-200 bg-zinc-50 flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setOrderModalOpen(false)}
                className="h-9 px-4 rounded-lg border border-zinc-200 bg-white text-xs font-medium text-zinc-700"
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
          </form>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: SEGURIDAD ADMINISTRADOR (CAMBIAR USUARIO Y CLAVE SHA-256)      */}
      {/* ===================================================================== */}
      {securityModalOpen && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-[2px]">
          <form
            onSubmit={handleSaveSecuritySettings}
            className="bg-white border border-zinc-200 rounded-2xl w-full max-w-md overflow-hidden shadow-xl"
          >
            <div className="px-5 py-3.5 border-b border-zinc-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-zinc-800" />
                <h2 className="text-sm font-semibold text-zinc-900">
                  Seguridad y Credenciales de Administrador
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSecurityModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-zinc-700 mb-1">
                  Usuario de Administrador
                </label>
                <input
                  type="text"
                  required
                  value={newAdminUser}
                  onChange={(e) => setNewAdminUser(e.target.value)}
                  className="w-full h-8 px-2.5 bg-zinc-50 border border-zinc-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-medium text-zinc-700 mb-1">
                  Nueva Contraseña Maestra (dejar en blanco para mantener actual)
                </label>
                <input
                  type="password"
                  value={newAdminPass}
                  onChange={(e) => setNewAdminPass(e.target.value)}
                  placeholder="Mínimo 6 caracteres..."
                  className="w-full h-8 px-2.5 bg-zinc-50 border border-zinc-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-medium text-zinc-700 mb-1">
                  Confirmar Nueva Contraseña
                </label>
                <input
                  type="password"
                  value={newAdminPassConfirm}
                  onChange={(e) => setNewAdminPassConfirm(e.target.value)}
                  placeholder="Repetir nueva contraseña..."
                  className="w-full h-8 px-2.5 bg-zinc-50 border border-zinc-200 rounded-lg"
                />
              </div>

              <label className="flex items-center gap-2 pt-1 text-zinc-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hideHintToggle}
                  onChange={(e) => setHideHintToggle(e.target.checked)}
                  className="rounded border-zinc-300"
                />
                <span>Ocultar pista de credenciales iniciales en la pantalla de Login (/1620)</span>
              </label>

              <div className="pt-2 border-t border-zinc-200">
                <label className="block font-medium text-zinc-700 mb-1">
                  Google Maps Geocoding API Key (Opcional)
                </label>
                <input
                  type="password"
                  value={googleMapsApiKey}
                  onChange={(e) => setGoogleMapsApiKey(e.target.value)}
                  placeholder="AIzaSy... (Opcional — funciona gratis sin clave también)"
                  className="w-full h-8 px-2.5 font-mono bg-zinc-50 border border-zinc-200 rounded-lg"
                />
              </div>

              <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200 text-[11px] text-zinc-500">
                La contraseña se procesa y almacena con hash seguro en el servidor. El acceso administrativo está disponible en <code className="font-mono">#/1620</code>.
              </div>
            </div>

            <div className="px-5 py-3 border-t border-zinc-200 bg-zinc-50 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSecurityModalOpen(false)}
                className="h-8 px-3.5 rounded-lg border border-zinc-200 bg-white text-xs font-medium text-zinc-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="h-8 px-4 rounded-lg bg-zinc-900 text-white text-xs font-medium hover:bg-zinc-800"
              >
                Guardar Credenciales
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-zinc-900 text-white text-xs font-medium shadow-lg">
          <span
            className={`w-2 h-2 rounded-full ${
              toast.type === 'error'
                ? 'bg-rose-400'
                : toast.type === 'warning'
                ? 'bg-amber-400'
                : 'bg-emerald-400'
            }`}
          />
          <span>{toast.message}</span>
        </div>
      )}
      </>
      )}
    </div>
  );
}

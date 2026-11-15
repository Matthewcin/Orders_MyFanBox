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
  Info
} from 'lucide-react';

// ============================================================================
// 1. CATÁLOGO OFICIAL PRECARGADO ("VIAJANDO POR EL MUNDO - KAROL G")
// ============================================================================
const INITIAL_CATALOG = [
  {
    id: 'cat-1',
    code: 'TROPICOQUETA',
    name: 'Hoodie Tropicoqueta',
    category: 'Prenda',
    basePrice: 140000,
    unitCost: 66000,
    blankName: 'Hoodie Base Beige (Sin estampar)',
    sizes: ['S', 'M', 'L', 'XL'],
    variants: [
      { id: 'v1-std', name: 'Estándar', extraPrice: 0, extraCost: 0, needsRhinestones: false, needsGlitterVinyl: false },
      { id: 'v1-brillos', name: 'Con Brillos (+$10.000)', extraPrice: 10000, extraCost: 3500, needsRhinestones: true, needsGlitterVinyl: false }
    ]
  },
  {
    id: 'cat-2',
    code: 'STAR-HOODIE',
    name: 'Star Hoodie',
    category: 'Prenda',
    basePrice: 140000,
    unitCost: 68000,
    blankName: 'Hoodie Base Negro (Sin estampar)',
    sizes: ['S', 'M', 'L', 'XL'],
    variants: [
      { id: 'v2-std', name: 'Estrella de Brillos (Estándar)', extraPrice: 0, extraCost: 0, needsRhinestones: true, needsGlitterVinyl: false },
      { id: 'v2-extra', name: 'Con Brillos Extra (+$10.000)', extraPrice: 10000, extraCost: 3500, needsRhinestones: true, needsGlitterVinyl: false }
    ]
  },
  {
    id: 'cat-3',
    code: 'LATINA-CROP',
    name: 'Latina Croptop',
    category: 'Prenda',
    basePrice: 80000,
    unitCost: 32000,
    blankName: 'Croptop Base',
    sizes: ['S', 'M', 'L', 'XL'],
    variants: [
      { id: 'v3-crema', name: 'Blanco/Crema (Congas)', extraPrice: 0, extraCost: 0, blankOverride: 'Croptop Base Blanco/Crema', needsRhinestones: false, needsGlitterVinyl: false },
      { id: 'v3-negro', name: 'Negro (Latina Foreva)', extraPrice: 0, extraCost: 0, blankOverride: 'Croptop Base Negro', needsRhinestones: false, needsGlitterVinyl: false }
    ]
  },
  {
    id: 'cat-4',
    code: 'NMADST',
    name: 'NMADST (Raglan "No me arrepiento de sentir tanto")',
    category: 'Prenda',
    basePrice: 90000,
    unitCost: 41000,
    blankName: 'Camiseta Raglan Blanca / Mangas Negras',
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
    variants: [
      { id: 'v4-azul', name: 'Pedrería Mangas + Vinilo Escarchado Azul', extraPrice: 0, extraCost: 0, needsRhinestones: true, needsGlitterVinyl: true, vinylColor: 'Azul Escarchado' },
      { id: 'v4-negro', name: 'Pedrería Mangas + Vinilo Escarchado Negro', extraPrice: 0, extraCost: 0, needsRhinestones: true, needsGlitterVinyl: true, vinylColor: 'Negro Escarchado' }
    ]
  },
  {
    id: 'cat-5',
    code: 'SPARKLY',
    name: 'Sparkly Oversized Unisex',
    category: 'Prenda',
    basePrice: 90000,
    unitCost: 43000,
    blankName: 'Camiseta Oversized Unisex Negra',
    sizes: ['S', 'M', 'L', 'XL'],
    variants: [
      { id: 'v5-mun-neg', name: 'Muñeca + Pedrería Negra (Vinilo Azul)', extraPrice: 0, extraCost: 0, needsRhinestones: true, needsGlitterVinyl: true, vinylColor: 'Azul Escarchado' },
      { id: 'v5-mun-pla', name: 'Muñeca + Pedrería Plateada (Vinilo Azul)', extraPrice: 0, extraCost: 0, needsRhinestones: true, needsGlitterVinyl: true, vinylColor: 'Azul Escarchado' },
      { id: 'v5-fir-neg', name: 'Firma Karol G + Pedrería Negra (Vinilo Azul)', extraPrice: 0, extraCost: 0, needsRhinestones: true, needsGlitterVinyl: true, vinylColor: 'Azul Escarchado' },
      { id: 'v5-fir-pla', name: 'Firma Karol G + Pedrería Plateada (Vinilo Azul)', extraPrice: 0, extraCost: 0, needsRhinestones: true, needsGlitterVinyl: true, vinylColor: 'Azul Escarchado' }
    ]
  },
  {
    id: 'cat-6',
    code: 'CANTAR-CORA',
    name: 'Cantar con Cora Croptop',
    category: 'Prenda',
    basePrice: 85000,
    unitCost: 35000,
    blankName: 'Croptop Base',
    sizes: ['S', 'M', 'L', 'XL'],
    variants: [
      { id: 'v6-celeste', name: 'Celeste ("Still love you")', extraPrice: 0, extraCost: 0, blankOverride: 'Croptop Base Celeste', needsGlitterVinyl: true, vinylColor: 'Azul Escarchado' },
      { id: 'v6-blanco', name: 'Blanco ("Matadora")', extraPrice: 0, extraCost: 0, blankOverride: 'Croptop Base Blanco', needsGlitterVinyl: true, vinylColor: 'Azul Escarchado' },
      { id: 'v6-negro', name: 'Negro ("Bby Wow")', extraPrice: 0, extraCost: 0, blankOverride: 'Croptop Base Negro', needsGlitterVinyl: true, vinylColor: 'Azul Escarchado' }
    ]
  },
  {
    id: 'cat-7',
    code: 'CD-NFC',
    name: 'Llavero Mini CD (Con NFC)',
    category: 'Accesorio',
    basePrice: 30000,
    unitCost: 9500,
    blankName: 'Caja Acrílica Mini CD + Herraje Estrella',
    sizes: ['Única'],
    variants: [
      { id: 'v7-msb', name: 'Mañana Será Bonito (Con NFC)', extraPrice: 0, extraCost: 0, needsNFC: true },
      { id: 'v7-bs', name: 'Bichota Season (Con NFC)', extraPrice: 0, extraCost: 0, needsNFC: true },
      { id: 'v7-kg', name: 'KG0516 (Con NFC)', extraPrice: 0, extraCost: 0, needsNFC: true },
      { id: 'v7-ocean', name: 'Ocean (Con NFC)', extraPrice: 0, extraCost: 0, needsNFC: true },
      { id: 'v7-unstop', name: 'Unstoppable (Con NFC)', extraPrice: 0, extraCost: 0, needsNFC: true },
      { id: 'v7-tropi', name: 'Tropicoqueta (Con NFC)', extraPrice: 0, extraCost: 0, needsNFC: true }
    ]
  },
  {
    id: 'cat-8',
    code: 'CD-QR',
    name: 'Llavero Mini CD (Sin NFC / QR)',
    category: 'Accesorio',
    basePrice: 28000,
    unitCost: 7200,
    blankName: 'Caja Acrílica Mini CD + Herraje Estrella',
    sizes: ['Única'],
    variants: [
      { id: 'v8-msb', name: 'Mañana Será Bonito (Sin NFC / QR)', extraPrice: 0, extraCost: 0, needsNFC: false },
      { id: 'v8-bs', name: 'Bichota Season (Sin NFC / QR)', extraPrice: 0, extraCost: 0, needsNFC: false },
      { id: 'v8-kg', name: 'KG0516 (Sin NFC / QR)', extraPrice: 0, extraCost: 0, needsNFC: false },
      { id: 'v8-ocean', name: 'Ocean (Sin NFC / QR)', extraPrice: 0, extraCost: 0, needsNFC: false },
      { id: 'v8-unstop', name: 'Unstoppable (Sin NFC / QR)', extraPrice: 0, extraCost: 0, needsNFC: false },
      { id: 'v8-tropi', name: 'Tropicoqueta (Sin NFC / QR)', extraPrice: 0, extraCost: 0, needsNFC: false }
    ]
  },
  {
    id: 'cat-9',
    code: 'DTF-FANBOX',
    name: 'Nueva DTF Fanbox (Kit Personaliza tú mismx)',
    category: 'Accesorio',
    basePrice: 30000,
    unitCost: 11000,
    blankName: 'Cajita Fanbox + Plancha Parches DTF',
    sizes: ['Única'],
    variants: [
      { id: 'v9-kit', name: 'Kit Parches DTF para Planchar', extraPrice: 0, extraCost: 0 }
    ]
  },
  {
    id: 'cat-10',
    code: 'CUSTOM',
    name: 'Prenda Personalizada ("Idea en mente")',
    category: 'Prenda',
    basePrice: 110000,
    unitCost: 52000,
    blankName: 'Prenda Base Custom (Según diseño)',
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
    variants: [
      { id: 'v10-tee', name: 'Camiseta Personalizada desde cero', extraPrice: 0, extraCost: 0 },
      { id: 'v10-hoodie', name: 'Hoodie Personalizado desde cero (+$35.000)', extraPrice: 35000, extraCost: 18000 }
    ]
  }
];

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

const STORAGE_KEY = 'mfb_react_neondb_v1';

// ============================================================================
// 2. GENERADOR DE 124 PEDIDOS REALISTAS PARA ESCALA REAL DE MYFANBOX
// ============================================================================
function generateSeedOrders(catalog, count = 124) {
  const firstNames = [
    'Valentina', 'Camila', 'Sofía', 'Mariana', 'Isabella', 'Daniela', 'Laura', 'Natalia',
    'Sara', 'Paula', 'Juliana', 'Manuela', 'Andrea', 'Carolina', 'Gabriela', 'Alejandra',
    'Valeria', 'Tatiana', 'Luisa', 'Estefanía', 'Melissa', 'Angie', 'Katherin', 'Diana',
    'Mónica', 'Ana María', 'Verónica', 'María José', 'Michelle', 'Yuliana', 'Nicolás',
    'Sebastián', 'Mateo', 'Santiago', 'Camilo', 'Juan Pablo', 'Salomé', 'Antonia', 'Luciana', 'Ximena'
  ];
  const lastNames = [
    'Gómez', 'Rodríguez', 'Martínez', 'Torres', 'Hernández', 'López', 'Castro', 'Ramírez',
    'Sánchez', 'Vargas', 'Moreno', 'Rojas', 'Díaz', 'Ortiz', 'Silva', 'Ruiz', 'Mendoza',
    'Peña', 'Gil', 'Cruz', 'Ospina', 'Morales', 'Jiménez', 'Pineda', 'Navarro', 'Restrepo',
    'Cardona', 'Salazar', 'Mejía', 'León', 'Acosta', 'Parra', 'Giraldo', 'Bedoya', 'Duarte'
  ];
  const locations = [
    { city: 'Medellín', address: 'El Poblado Cra 43A #11-40', carrier: 'Entrega Personal' },
    { city: 'Medellín', address: 'Laureles Circular 4 #70-18', carrier: 'Entrega Personal' },
    { city: 'Bogotá', address: 'Chapinero Cra 7 #64-22', carrier: 'Interrapidísimo' },
    { city: 'Bogotá', address: 'Usaquén Calle 140 #15-30', carrier: 'Coordinadora' },
    { city: 'Bogotá', address: 'Cedritos Calle 147 #19-50', carrier: 'Interrapidísimo' },
    { city: 'Cali', address: 'Ciudad Jardín Cra 102 #14-80', carrier: 'Envía' },
    { city: 'Cali', address: 'Granada Av 9N #15-20', carrier: 'Interrapidísimo' },
    { city: 'Barranquilla', address: 'Alto Prado Cra 53 #82-15', carrier: 'Servientrega' },
    { city: 'Bucaramanga', address: 'Cabecera Calle 48 #35-10', carrier: 'Interrapidísimo' },
    { city: 'Pereira', address: 'Pinares Cra 17 #10-45', carrier: 'Coordinadora' },
    { city: 'Manizales', address: 'Palermo Calle 67 #25-12', carrier: 'Interrapidísimo' },
    { city: 'Cartagena', address: 'Bocagrande Av San Martín #7-90', carrier: 'Servientrega' },
    { city: 'Envigado', address: 'Calle 37 Sur #41-28', carrier: 'Entrega Personal' },
    { city: 'Sabaneta', address: 'Cra 45 #71 Sur-15', carrier: 'Entrega Personal' },
    { city: 'Ibagué', address: 'El Vergel Calle 60 #8-40', carrier: 'Interrapidísimo' },
    { city: 'Villavicencio', address: 'Barzal Alto Cra 38 #33-14', carrier: 'Envía' }
  ];

  // Realistic distribution of statuses across 124 orders
  const statusPatterns = [
    { pay: 'Semi-pagado (50%)', ship: 'Por preparar' },
    { pay: 'Semi-pagado (50%)', ship: 'Por preparar' },
    { pay: 'Pagado', ship: 'Por preparar' },
    { pay: 'Pagado', ship: 'Por enviar' },
    { pay: 'Semi-pagado (50%)', ship: 'Por enviar' }, // Triggers warning: Cobrar saldo antes de enviar!
    { pay: 'Pagado', ship: 'Enviado' },
    { pay: 'Pagado', ship: 'Enviado' },
    { pay: 'Pendiente', ship: 'Por preparar' },
    { pay: 'Semi-pagado (50%)', ship: 'Por preparar' },
    { pay: 'Pagado', ship: 'Por enviar' },
    { pay: 'Pendiente', ship: 'Por enviar' }, // Triggers warning!
    { pay: 'Cancelado', ship: 'Por preparar' },
    { pay: 'Reembolsado', ship: 'Por preparar' }
  ];

  const itemCombos = [
    [{ catIdx: 0, varIdx: 1, size: 'M', qty: 1 }], // Hoodie Tropicoqueta + Brillos
    [{ catIdx: 1, varIdx: 0, size: 'S', qty: 1 }, { catIdx: 6, varIdx: 0, size: 'Única', qty: 1 }], // Star Hoodie + Llavero NFC
    [{ catIdx: 3, varIdx: 0, size: 'L', qty: 1 }], // NMADST Raglan Azul
    [{ catIdx: 4, varIdx: 0, size: 'M', qty: 1 }], // Sparkly Muñeca Negra
    [{ catIdx: 5, varIdx: 0, size: 'S', qty: 1 }, { catIdx: 5, varIdx: 1, size: 'M', qty: 1 }], // 2x Cantar con Cora
    [{ catIdx: 2, varIdx: 0, size: 'M', qty: 1 }, { catIdx: 6, varIdx: 5, size: 'Única', qty: 1 }], // Latina Croptop + Llavero Tropicoqueta
    [{ catIdx: 0, varIdx: 0, size: 'L', qty: 1 }], // Hoodie Tropicoqueta Estándar
    [{ catIdx: 4, varIdx: 3, size: 'XL', qty: 1 }, { catIdx: 8, varIdx: 0, size: 'Única', qty: 1 }], // Sparkly Firma Plateada + DTF Fanbox
    [{ catIdx: 1, varIdx: 1, size: 'M', qty: 1 }], // Star Hoodie + Brillos Extra
    [{ catIdx: 2, varIdx: 1, size: 'S', qty: 1 }], // Latina Croptop Negro
    [{ catIdx: 3, varIdx: 1, size: 'XL', qty: 1 }, { catIdx: 7, varIdx: 0, size: 'Única', qty: 1 }], // NMADST Negro + Llavero QR
    [{ catIdx: 6, varIdx: 1, size: 'Única', qty: 2 }, { catIdx: 8, varIdx: 0, size: 'Única', qty: 1 }], // 2 Llaveros NFC + DTF Fanbox
    [{ catIdx: 9, varIdx: 1, size: 'M', qty: 1 }], // Hoodie Personalizado
    [{ catIdx: 5, varIdx: 2, size: 'L', qty: 1 }], // Cantar con Cora Negro Bby Wow
    [{ catIdx: 3, varIdx: 0, size: '2XL', qty: 1 }], // NMADST 2XL
    [{ catIdx: 3, varIdx: 0, size: 'XS', qty: 1 }, { catIdx: 6, varIdx: 2, size: 'Única', qty: 1 }] // NMADST XS + Llavero KG0516
  ];

  const notesPool = [
    '',
    'Urgente para el concierto del sábado',
    'Confirmó abono por Nequi',
    'Revisar bien pedrería en mangas',
    'Empacar regalo con sticker extra',
    'Pagó por transferencia Bancolombia',
    '',
    ''
  ];

  const orders = [];
  for (let i = 0; i < count; i++) {
    const fName = firstNames[i % firstNames.length];
    const lName = lastNames[(i * 3) % lastNames.length];
    const customerName = `${fName} ${lName}`;
    const igHandle = `@${fName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '')}.${lName.toLowerCase().slice(0, 4)}${10 + (i % 89)}`;
    const phone = `3${10 + (i % 12)}${String(3401122 + i * 137).slice(0, 7)}`;
    const loc = locations[i % locations.length];
    const pat = statusPatterns[i % statusPatterns.length];
    const combo = itemCombos[i % itemCombos.length];

    const items = combo.map((c, idx) => {
      const prod = catalog[c.catIdx] || catalog[0];
      const variant = prod.variants[c.varIdx] || prod.variants[0];
      const unitPrice = prod.basePrice + (variant.extraPrice || 0);
      return {
        id: `it-${1000 + i}-${idx}`,
        productId: prod.id,
        productName: prod.name,
        variantId: variant.id,
        variantName: variant.name,
        size: c.size,
        qty: c.qty,
        unitPrice,
        packed: pat.ship === 'Por enviar' || pat.ship === 'Enviado'
      };
    });

    const subtotal = items.reduce((acc, it) => acc + it.unitPrice * it.qty, 0);
    const hasGarment = items.some(it => {
      const p = catalog.find(x => x.id === it.productId);
      return p && p.category === 'Prenda';
    });
    const hasKeychain = items.some(it => it.productName.toLowerCase().includes('llavero'));
    const discount = hasGarment && hasKeychain ? 5000 : 0;
    const total = Math.max(0, subtotal - discount);

    const dayOffset = Math.floor(i / 4);
    const dateObj = new Date(2026, 10, 15 - dayOffset);
    const createdAt = dateObj.toISOString().split('T')[0];

    orders.push({
      id: `MFB-${String(1001 + i)}`,
      customerName,
      instagram: igHandle,
      phone,
      city: loc.city,
      address: loc.address,
      carrier: loc.carrier,
      trackingNumber: pat.ship === 'Enviado' ? `2400981${100 + i}` : '',
      paymentStatus: pat.pay,
      shippingStatus: pat.ship,
      items,
      discount,
      total,
      notes: notesPool[i % notesPool.length],
      createdAt
    });
  }

  return orders.reverse();
}

// ============================================================================
// 3. UTILIDADES DE FORMATO Y CÁLCULO FINANCIERO
// ============================================================================
const formatCOP = (val) => {
  const num = Number(val) || 0;
  return '$' + Math.round(num).toLocaleString('es-CO');
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
// 4. CLIENTE HTTP SERVERLESS PARA NEONDB (POSTGRESQL OVER HTTPS)
// ============================================================================
function parseNeonConnectionString(connStr) {
  if (!connStr || typeof connStr !== 'string') return null;
  const trimmed = connStr.trim();
  try {
    // Format: postgresql://user:pass@ep-xyz.region.aws.neon.tech/dbname?sslmode=require
    const match = trimmed.match(/postgres(?:ql)?:\/\/([^:]+):([^@]+)@([^/?#]+)\/([^?#]+)/i);
    if (!match) return null;
    return {
      user: match[1],
      password: match[2],
      host: match[3],
      database: match[4],
      endpoint: `https://${match[3]}/sql`,
      raw: trimmed
    };
  } catch {
    return null;
  }
}

const POSTGRES_SCHEMA_SQL = `-- Esquema Oficial MyFanBox en NeonDB (Serverless PostgreSQL)
CREATE TABLE IF NOT EXISTS mfb_catalog (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  base_price INTEGER NOT NULL,
  unit_cost INTEGER NOT NULL,
  blank_name TEXT,
  sizes JSONB NOT NULL,
  variants JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mfb_orders (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  instagram TEXT,
  phone TEXT,
  city TEXT,
  address TEXT,
  carrier TEXT,
  tracking_number TEXT,
  payment_status TEXT NOT NULL,
  shipping_status TEXT NOT NULL,
  items JSONB NOT NULL,
  discount INTEGER DEFAULT 0,
  total INTEGER NOT NULL,
  notes TEXT,
  created_at TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mfb_inventory_progress (
  item_key TEXT PRIMARY KEY,
  kind TEXT NOT NULL, -- 'BOUGHT_SUPPLY' | 'MADE_PRODUCT'
  quantity INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mfb_orders_payment ON mfb_orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_mfb_orders_shipping ON mfb_orders(shipping_status);`;

// ============================================================================
// 5. COMPONENTE PRINCIPAL DE LA APLICACIÓN
// ============================================================================
export default function App() {
  // Navigation & UI state
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'inventory' | 'shipping' | 'costs' | 'neondb'
  const [invSubtab, setInvSubtab] = useState('buy'); // 'buy' | 'make' | 'pack'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Core Data State
  const [catalog, setCatalog] = useState(INITIAL_CATALOG);
  const [orders, setOrders] = useState([]);
  const [boughtSupplies, setBoughtSupplies] = useState({
    'Hoodie Base Beige (Sin estampar)___M': 8,
    'Hoodie Base Beige (Sin estampar)___L': 6,
    'Hoodie Base Negro (Sin estampar)___S': 9,
    'Croptop Base Blanco/Crema___M': 7,
    'Camiseta Raglan Blanca / Mangas Negras___L': 5,
    'Caja Acrílica Mini CD + Herraje Estrella___Única': 24
  });
  const [madeItems, setMadeItems] = useState({
    'cat-1|||v1-brillos|||M': 6,
    'cat-2|||v2-std|||S': 7,
    'cat-4|||v4-azul|||L': 5
  });
  const [comboDiscountValue, setComboDiscountValue] = useState(5000);

  // Filters & Table Pagination State
  const [searchQuery, setSearchQuery] = useState('');
  const [quickStatusFilter, setQuickStatusFilter] = useState('ALL');
  const [payFilter, setPayFilter] = useState('ALL');
  const [shipFilter, setShipFilter] = useState('ALL');
  const [productFilter, setProductFilter] = useState('ALL');
  const [sizeFilter, setSizeFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);

  // Shipping View Filter
  const [shippingBoardFilter, setShippingBoardFilter] = useState('ALL');

  // Order Modal State
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);

  // NeonDB Integration State
  const [neonConnString, setNeonConnString] = useState('');
  const [neonAutoSync, setNeonAutoSync] = useState(false);
  const [neonStatus, setNeonStatus] = useState('disconnected'); // 'disconnected' | 'connecting' | 'connected' | 'error'
  const [neonLastSync, setNeonLastSync] = useState(null);
  const [sqlLogs, setSqlLogs] = useState([
    {
      id: 'log-init',
      timestamp: new Date().toLocaleTimeString(),
      type: 'INFO',
      sql: '-- Motor MyFanBox listo. Conecta tu URL de NeonDB o trabaja con caché local instantáneo.',
      durationMs: 0,
      status: 'OK'
    }
  ]);
  const [customSqlQuery, setCustomSqlQuery] = useState('SELECT payment_status, COUNT(*) as total_pedidos, SUM(total) as monto_cop FROM mfb_orders GROUP BY payment_status;');
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

  // Load initial state from localStorage or seed 124 realistic orders
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.catalog?.length) setCatalog(parsed.catalog);
        if (Array.isArray(parsed.orders)) setOrders(parsed.orders);
        else setOrders(generateSeedOrders(INITIAL_CATALOG, 124));
        if (parsed.boughtSupplies) setBoughtSupplies(parsed.boughtSupplies);
        if (parsed.madeItems) setMadeItems(parsed.madeItems);
        if (parsed.neonConnString) setNeonConnString(parsed.neonConnString);
        if (typeof parsed.neonAutoSync === 'boolean') setNeonAutoSync(parsed.neonAutoSync);
      } else {
        setOrders(generateSeedOrders(INITIAL_CATALOG, 124));
      }
    } catch (err) {
      console.error('Error loading local state:', err);
      setOrders(generateSeedOrders(INITIAL_CATALOG, 124));
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          catalog,
          orders,
          boughtSupplies,
          madeItems,
          neonConnString,
          neonAutoSync
        })
      );
    } catch (e) {
      console.error('Error saving state:', e);
    }
  }, [catalog, orders, boughtSupplies, madeItems, neonConnString, neonAutoSync]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
        if (e.key === 'Escape') {
          document.activeElement.blur();
        }
        return;
      }
      if (e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === '1') setActiveTab('orders');
      else if (e.key === '2') setActiveTab('inventory');
      else if (e.key === '3') setActiveTab('shipping');
      else if (e.key === '4') setActiveTab('costs');
      else if (e.key === '5') setActiveTab('neondb');
      else if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleOpenOrderModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ============================================================================
  // 6. EJECUTOR SQL EN NEONDB (SERVERLESS HTTP DRIVER)
  // ============================================================================
  const appendSqlLog = useCallback((sql, status = 'OK', durationMs = 12, detail = '') => {
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

  const executeNeonQuery = useCallback(async (query, params = []) => {
    const parsed = parseNeonConnectionString(neonConnString);
    if (!parsed) {
      appendSqlLog(query, 'LOCAL_ONLY', 1, 'Sin Connection String de NeonDB configurada (Guardado en caché local)');
      return { ok: false, localOnly: true };
    }

    const start = performance.now();
    try {
      const response = await fetch(parsed.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Neon-Connection-String': parsed.raw
        },
        body: JSON.stringify({ query, params })
      });
      const elapsed = Math.round(performance.now() - start);
      if (!response.ok) {
        const errText = await response.text();
        appendSqlLog(query, 'ERROR', elapsed, errText.slice(0, 180));
        setNeonStatus('error');
        return { ok: false, error: errText };
      }
      const data = await response.json();
      appendSqlLog(query, 'OK', elapsed, `Filas afectadas/devueltas: ${data.rows?.length ?? data.rowCount ?? 0}`);
      setNeonStatus('connected');
      setNeonLastSync(new Date().toLocaleTimeString());
      return { ok: true, data };
    } catch (err) {
      const elapsed = Math.round(performance.now() - start);
      appendSqlLog(query, 'ERROR', elapsed, err.message);
      setNeonStatus('error');
      return { ok: false, error: err.message };
    }
  }, [neonConnString, appendSqlLog]);

  // Auto-sync helper when an order is created/updated
  const syncSingleOrderToNeon = useCallback(async (order) => {
    if (!neonAutoSync || !parseNeonConnectionString(neonConnString)) return;
    const q = `INSERT INTO mfb_orders (id, customer_name, instagram, phone, city, address, carrier, tracking_number, payment_status, shipping_status, items, discount, total, notes, created_at, updated_at)
VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::jsonb,$12,$13,$14,$15,NOW())
ON CONFLICT (id) DO UPDATE SET
  customer_name=EXCLUDED.customer_name,
  instagram=EXCLUDED.instagram,
  phone=EXCLUDED.phone,
  city=EXCLUDED.city,
  address=EXCLUDED.address,
  carrier=EXCLUDED.carrier,
  tracking_number=EXCLUDED.tracking_number,
  payment_status=EXCLUDED.payment_status,
  shipping_status=EXCLUDED.shipping_status,
  items=EXCLUDED.items,
  discount=EXCLUDED.discount,
  total=EXCLUDED.total,
  notes=EXCLUDED.notes,
  updated_at=NOW();`;

    await executeNeonQuery(q, [
      order.id,
      order.customerName,
      order.instagram || '',
      order.phone || '',
      order.city || '',
      order.address || '',
      order.carrier || '',
      order.trackingNumber || '',
      order.paymentStatus,
      order.shippingStatus,
      JSON.stringify(order.items),
      order.discount || 0,
      order.total || 0,
      order.notes || '',
      order.createdAt || ''
    ]);
  }, [neonAutoSync, neonConnString, executeNeonQuery]);

  // Initialize NeonDB Schema & Tables
  const handleInitNeonTables = async () => {
    const parsed = parseNeonConnectionString(neonConnString);
    if (!parsed) {
      notify('Pega primero tu Connection String de NeonDB (postgresql://...)', 'warning');
      return;
    }
    setNeonStatus('connecting');
    const statements = POSTGRES_SCHEMA_SQL.split(';').map(s => s.trim()).filter(Boolean);
    for (const stmt of statements) {
      const res = await executeNeonQuery(stmt + ';');
      if (!res.ok) {
        notify('Error al crear tablas en NeonDB. Revisa el registro SQL.', 'error');
        return;
      }
    }
    notify('¡Tablas mfb_orders, mfb_catalog y mfb_inventory_progress creadas en NeonDB!');
  };

  // Push all local data to NeonDB
  const handlePushAllToNeon = async () => {
    const parsed = parseNeonConnectionString(neonConnString);
    if (!parsed) {
      notify('Configura primero tu Connection String de NeonDB', 'warning');
      return;
    }
    setNeonStatus('connecting');
    await handleInitNeonTables();

    // Upsert catalog
    for (const prod of catalog) {
      await executeNeonQuery(
        `INSERT INTO mfb_catalog (id, code, name, category, base_price, unit_cost, blank_name, sizes, variants, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9::jsonb,NOW())
         ON CONFLICT (id) DO UPDATE SET base_price=EXCLUDED.base_price, unit_cost=EXCLUDED.unit_cost, variants=EXCLUDED.variants, updated_at=NOW();`,
        [prod.id, prod.code, prod.name, prod.category, prod.basePrice, prod.unitCost, prod.blankName, JSON.stringify(prod.sizes), JSON.stringify(prod.variants)]
      );
    }

    // Batch upsert orders (first 35 in a single transaction or sequential for speed)
    let syncedCount = 0;
    for (const o of orders) {
      const res = await executeNeonQuery(
        `INSERT INTO mfb_orders (id, customer_name, instagram, phone, city, address, carrier, tracking_number, payment_status, shipping_status, items, discount, total, notes, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::jsonb,$12,$13,$14,$15,NOW())
         ON CONFLICT (id) DO UPDATE SET payment_status=EXCLUDED.payment_status, shipping_status=EXCLUDED.shipping_status, tracking_number=EXCLUDED.tracking_number, items=EXCLUDED.items, total=EXCLUDED.total, updated_at=NOW();`,
        [o.id, o.customerName, o.instagram, o.phone, o.city, o.address, o.carrier, o.trackingNumber, o.paymentStatus, o.shippingStatus, JSON.stringify(o.items), o.discount || 0, o.total, o.notes || '', o.createdAt || '']
      );
      if (res.ok) syncedCount++;
    }

    notify(`Sincronización Push completada (${syncedCount} pedidos enviados a NeonDB)`);
  };

  // Pull orders from NeonDB
  const handlePullFromNeon = async () => {
    const parsed = parseNeonConnectionString(neonConnString);
    if (!parsed) {
      notify('Configura primero tu Connection String de NeonDB', 'warning');
      return;
    }
    const res = await executeNeonQuery(`SELECT * FROM mfb_orders ORDER BY id DESC;`);
    if (res.ok && Array.isArray(res.data?.rows)) {
      if (res.data.rows.length === 0) {
        notify('La tabla mfb_orders en NeonDB está vacía. Usa "Subir Datos (Push)" primero.');
        return;
      }
      const loaded = res.data.rows.map(r => ({
        id: r.id,
        customerName: r.customer_name,
        instagram: r.instagram || '',
        phone: r.phone || '',
        city: r.city || '',
        address: r.address || '',
        carrier: r.carrier || 'Interrapidísimo',
        trackingNumber: r.tracking_number || '',
        paymentStatus: r.payment_status,
        shippingStatus: r.shipping_status,
        items: typeof r.items === 'string' ? JSON.parse(r.items) : r.items,
        discount: Number(r.discount) || 0,
        total: Number(r.total) || 0,
        notes: r.notes || '',
        createdAt: r.created_at || ''
      }));
      setOrders(loaded);
      notify(`¡${loaded.length} pedidos descargados desde NeonDB!`);
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

  // A. ¿QUÉ TOCA COMPRAR? (Prendas base en blanco + Insumos de pedrería, vinilo escarchado y chips NFC)
  const shoppingNeeds = useMemo(() => {
    const activeOrders = orders.filter(isOrderActive);
    const map = {};

    const addRequirement = (blankName, sizeOrSpec, categoryLabel, qty) => {
      const key = `${blankName}___${sizeOrSpec}`;
      if (!map[key]) {
        map[key] = {
          key,
          blankName,
          sizeOrSpec,
          categoryLabel,
          required: 0
        };
      }
      map[key].required += qty;
    };

    activeOrders.forEach(order => {
      order.items.forEach(item => {
        const prod = catalog.find(c => c.id === item.productId);
        if (!prod) {
          addRequirement(item.productName, item.size, 'Prenda Base', item.qty);
          return;
        }
        const variant = prod.variants.find(v => v.id === item.variantId || v.name === item.variantName) || prod.variants[0] || {};
        const blankTitle = variant.blankOverride || prod.blankName || `${prod.name} (En blanco)`;

        addRequirement(blankTitle, item.size, prod.category === 'Prenda' ? 'Prenda en Blanco' : 'Base Accesorio', item.qty);

        // Additional supplies required
        if (variant.needsRhinestones || item.variantName.toLowerCase().includes('brillos') || item.variantName.toLowerCase().includes('pedrería')) {
          addRequirement('Insumo: Kit Pedrería / Brillos Termoadhesivos', 'Paquete x Prenda', 'Insumo Taller', item.qty);
        }
        if (variant.needsGlitterVinyl) {
          addRequirement(`Insumo: Vinilo Textil (${variant.vinylColor || 'Escarchado'})`, 'Corte Estampado', 'Insumo Taller', item.qty);
        }
        if (variant.needsNFC || item.productName.toLowerCase().includes('con nfc')) {
          addRequirement('Insumo: Chip Sticker NFC Programable', 'Unidad NFC', 'Insumo Electrónico', item.qty);
        }
      });
    });

    const rows = Object.values(map)
      .map(r => {
        const bought = Number(boughtSupplies[r.key]) || 0;
        const missing = Math.max(0, r.required - bought);
        return { ...r, bought, missing };
      })
      .sort((a, b) => a.categoryLabel.localeCompare(b.categoryLabel) || a.blankName.localeCompare(b.blankName));

    const totalMissingToBuy = rows.reduce((acc, r) => acc + r.missing, 0);
    return { rows, totalMissingToBuy };
  }, [orders, catalog, boughtSupplies]);

  // B. ¿QUÉ TOCA ESTAMPAR / HACER? (Matriz de producción por Referencia, Variante y Talla)
  const productionMatrix = useMemo(() => {
    const activeOrders = orders.filter(isOrderActive);
    const map = {};

    activeOrders.forEach(order => {
      order.items.forEach(item => {
        const key = `${item.productId}|||${item.variantId || item.variantName}|||${item.size}`;
        if (!map[key]) {
          map[key] = {
            key,
            productId: item.productId,
            productName: item.productName,
            variantName: item.variantName,
            size: item.size,
            orderedQty: 0
          };
        }
        map[key].orderedQty += item.qty;
      });
    });

    const rows = Object.values(map)
      .map(r => {
        const made = Number(madeItems[r.key]) || 0;
        const missing = Math.max(0, r.orderedQty - made);
        const progress = r.orderedQty > 0 ? Math.min(100, Math.round((made / r.orderedQty) * 100)) : 100;
        return { ...r, made, missing, progress };
      })
      .sort((a, b) => a.productName.localeCompare(b.productName) || a.variantName.localeCompare(b.variantName));

    const totalOrderedUnits = rows.reduce((acc, r) => acc + r.orderedQty, 0);
    const totalMissingToMake = rows.reduce((acc, r) => acc + r.missing, 0);
    return { rows, totalOrderedUnits, totalMissingToMake };
  }, [orders, madeItems]);

  // ============================================================================
  // 8. FILTRADO RÁPIDO DE PEDIDOS Y ACCIONES DE TABLA
  // ============================================================================
  const filteredOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return orders.filter(o => {
      if (q) {
        const hay = `${o.id} ${o.customerName} ${o.instagram} ${o.phone} ${o.city} ${o.address} ${o.trackingNumber} ${o.notes}`.toLowerCase();
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

      return true;
    });
  }, [orders, searchQuery, quickStatusFilter, payFilter, shipFilter, productFilter, sizeFilter]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, quickStatusFilter, payFilter, shipFilter, productFilter, sizeFilter]);

  // 1-Click Status Updaters
  const handleUpdateOrderPayment = (orderId, newPayStatus) => {
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

  // Bulk Status Change for Selected Orders
  const handleBulkStatusUpdate = (type, newValue) => {
    if (selectedOrderIds.length === 0) return;
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

  // WhatsApp Click-to-Chat Generator
  const handleOpenWhatsApp = (order) => {
    const cleanPhone = (order.phone || '').replace(/\D/g, '');
    const fullPhone = cleanPhone.startsWith('57') ? cleanPhone : `57${cleanPhone}`;
    const firstName = order.customerName.split(' ')[0];
    const itemsList = order.items.map(i => `• ${i.qty}x ${i.productName} (${i.variantName} - Talla ${i.size})`).join('\n');
    const paid = getPaidAmount(order);
    const pending = getPendingAmount(order);

    let statusMessage = '';
    if (order.shippingStatus === 'Enviado') {
      statusMessage = `¡Tu pedido de *MyFanBox* ya fue *ENVIADO*! 📦\nTransportadora: *${order.carrier}*\nNúmero de guía: *${order.trackingNumber || 'Asignada'}*`;
    } else if (order.shippingStatus === 'Por enviar' && pending > 0) {
      statusMessage = `¡Tu pedido de *MyFanBox* ya está listo y empacado *POR ENVIAR*! ✨\nPara despacharlo hoy mismo con *${order.carrier}*, queda pendiente el saldo restante del 50% por valor de *${formatCOP(pending)}*.`;
    } else if (order.paymentStatus === 'Pendiente') {
      statusMessage = `Recibimos tu pedido en *MyFanBox*. Para agendar tus prendas en producción puedes abonar el 50% (*${formatCOP(Math.round(order.total * 0.5))}*) o el pago total (*${formatCOP(order.total)}*).`;
    } else if (order.paymentStatus === 'Semi-pagado (50%)') {
      statusMessage = `Confirmamos tu abono del 50% (*${formatCOP(paid)}*). Tus prendas están en preparación (${order.shippingStatus}). Saldo restante antes de envío: *${formatCOP(pending)}*.`;
    } else {
      statusMessage = `Tu pedido está 100% pagado (*${formatCOP(order.total)}*) y en estado: *${order.shippingStatus}*.`;
    }

    const fullText = `¡Hola ${firstName}! Te escribimos de *MyFanBox* sobre tu pedido *${order.id}*:\n\n${statusMessage}\n\n*Detalle de tu orden:*\n${itemsList}\n📍 Destino: ${order.city} (${order.address || 'Confirmar dirección'})`;
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
      'ID', 'Fecha', 'Cliente', 'Instagram', 'WhatsApp', 'Ciudad', 'Direccion',
      'Prendas', 'Total_COP', 'Pagado_COP', 'Saldo_Pendiente_COP',
      'Estado_Pago', 'Estado_Envio', 'Transportadora', 'Guia', 'Notas'
    ];
    const rows = filteredOrders.map(o => [
      o.id,
      o.createdAt,
      o.customerName,
      o.instagram,
      o.phone,
      o.city,
      o.address,
      o.items.map(i => `${i.qty}x ${i.productName} [${i.variantName} - Talla ${i.size}]`).join(' | '),
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
  // 9. MODAL DE CREACIÓN / EDICIÓN DE PEDIDO
  // ============================================================================
  const [draftCustomer, setDraftCustomer] = useState({
    customerName: '',
    instagram: '',
    phone: '',
    city: 'Medellín',
    address: '',
    carrier: 'Interrapidísimo',
    trackingNumber: '',
    paymentStatus: 'Semi-pagado (50%)',
    shippingStatus: 'Por preparar',
    notes: ''
  });
  const [draftItems, setDraftItems] = useState([]);
  const [selProdId, setSelProdId] = useState(INITIAL_CATALOG[0].id);
  const [selVarId, setSelVarId] = useState(INITIAL_CATALOG[0].variants[0].id);
  const [selSize, setSelSize] = useState(INITIAL_CATALOG[0].sizes[0]);
  const [selQty, setSelQty] = useState(1);
  const [applyComboDiscount, setApplyComboDiscount] = useState(true);

  const handleOpenOrderModal = (orderToEdit = null) => {
    if (orderToEdit) {
      setEditingOrder(orderToEdit);
      setDraftCustomer({
        customerName: orderToEdit.customerName,
        instagram: orderToEdit.instagram || '',
        phone: orderToEdit.phone || '',
        city: orderToEdit.city || '',
        address: orderToEdit.address || '',
        carrier: orderToEdit.carrier || 'Interrapidísimo',
        trackingNumber: orderToEdit.trackingNumber || '',
        paymentStatus: orderToEdit.paymentStatus,
        shippingStatus: orderToEdit.shippingStatus,
        notes: orderToEdit.notes || ''
      });
      setDraftItems(orderToEdit.items.map(i => ({ ...i })));
      setApplyComboDiscount((orderToEdit.discount || 0) > 0);
    } else {
      setEditingOrder(null);
      setDraftCustomer({
        customerName: '',
        instagram: '',
        phone: '',
        city: 'Medellín',
        address: '',
        carrier: 'Interrapidísimo',
        trackingNumber: '',
        paymentStatus: 'Semi-pagado (50%)',
        shippingStatus: 'Por preparar',
        notes: ''
      });
      setDraftItems([]);
      setApplyComboDiscount(true);
    }
    const defaultProd = catalog[0];
    setSelProdId(defaultProd.id);
    setSelVarId(defaultProd.variants[0]?.id || '');
    setSelSize(defaultProd.sizes[0] || 'M');
    setSelQty(1);
    setOrderModalOpen(true);
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
        qty: Math.max(1, Number(selQty) || 1),
        unitPrice,
        packed: false
      }
    ]);
    setSelQty(1);
  };

  const handleSaveOrderModal = (e) => {
    e.preventDefault();
    if (!draftCustomer.customerName.trim()) {
      notify('Escribe el nombre de la clienta o cliente', 'warning');
      return;
    }

    let finalItems = [...draftItems];
    if (finalItems.length === 0) {
      const prod = catalog.find(c => c.id === selProdId) || catalog[0];
      const variant = prod.variants.find(v => v.id === selVarId) || prod.variants[0];
      finalItems.push({
        id: `dit-${Date.now()}`,
        productId: prod.id,
        productName: prod.name,
        variantId: variant.id,
        variantName: variant.name,
        size: selSize,
        qty: Math.max(1, Number(selQty) || 1),
        unitPrice: prod.basePrice + (variant.extraPrice || 0),
        packed: false
      });
    }

    const subtotal = finalItems.reduce((acc, it) => acc + it.unitPrice * it.qty, 0);
    const hasGarment = finalItems.some(it => catalog.find(c => c.id === it.productId)?.category === 'Prenda');
    const hasKeychain = finalItems.some(it => it.productName.toLowerCase().includes('llavero'));
    const discount = hasGarment && hasKeychain && applyComboDiscount ? comboDiscountValue : 0;
    const total = Math.max(0, subtotal - discount);

    if (editingOrder) {
      const updatedOrder = {
        ...editingOrder,
        ...draftCustomer,
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
      const newOrder = {
        id: `MFB-${maxNum + 1}`,
        ...draftCustomer,
        items: finalItems,
        discount,
        total,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setOrders(prev => [newOrder, ...prev]);
      syncSingleOrderToNeon(newOrder);
      notify(`Nuevo pedido ${newOrder.id} registrado`);
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
  // RENDERIZADO PRINCIPAL
  // ============================================================================
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 flex flex-col lg:flex-row font-sans antialiased selection:bg-zinc-900 selection:text-white">
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-zinc-950/30 backdrop-blur-[1px] z-30 lg:hidden"
        />
      )}

      {/* ===================================================================== */}
      {/* SIDEBAR LATERAL MINIMALISTA (ESTILO LINEAR / NOTION)                  */}
      {/* ===================================================================== */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-white border-r border-zinc-200 flex flex-col justify-between transition-transform duration-200 ease-out shrink-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-14 px-4 flex items-center justify-between border-b border-zinc-200">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold text-xs tracking-tighter">
                MFB
              </div>
              <div>
                <div className="text-xs font-semibold tracking-tight text-zinc-900 leading-none flex items-center gap-1.5">
                  <span>MyFanBox Ops</span>
                  <span className="px-1.5 py-0.5 text-[9px] font-mono bg-zinc-100 text-zinc-600 rounded border border-zinc-200">
                    v2.4
                  </span>
                </div>
                <div className="text-[11px] text-zinc-500 mt-0.5 truncate max-w-[145px]">
                  Karol G · Viajando x el Mundo
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
              onClick={() => { setActiveTab('orders'); setMobileMenuOpen(false); }}
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
              onClick={() => { setActiveTab('inventory'); setMobileMenuOpen(false); }}
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
              onClick={() => { setActiveTab('shipping'); setMobileMenuOpen(false); }}
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
              onClick={() => { setActiveTab('costs'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'costs'
                  ? 'bg-zinc-900 text-white'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <span className="flex items-center gap-2">
                <Calculator className="w-3.5 h-3.5" />
                <span>4. Catálogo y Costos</span>
              </span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                  activeTab === 'costs' ? 'bg-zinc-800 text-zinc-200' : 'bg-zinc-100 text-zinc-600'
                }`}
              >
                {catalog.length} refs
              </span>
            </button>

            <div className="pt-3 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              Infraestructura Cloud
            </div>

            <button
              onClick={() => { setActiveTab('neondb'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'neondb'
                  ? 'bg-zinc-900 text-white'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <span className="flex items-center gap-2">
                <Database className="w-3.5 h-3.5" />
                <span>5. Base de Datos NeonDB</span>
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

            {/* Quick Sub-Links for Inventory */}
            <div className="pt-3 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              Atajos de Taller
            </div>
            <button
              onClick={() => { setActiveTab('inventory'); setInvSubtab('buy'); setMobileMenuOpen(false); }}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
            >
              <span>• ¿Qué toca comprar?</span>
              <span className="font-mono text-[11px] text-zinc-500">{shoppingNeeds.totalMissingToBuy} uds</span>
            </button>
            <button
              onClick={() => { setActiveTab('inventory'); setInvSubtab('make'); setMobileMenuOpen(false); }}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
            >
              <span>• ¿Qué toca estampar?</span>
              <span className="font-mono text-[11px] text-zinc-500">{productionMatrix.totalMissingToMake} uds</span>
            </button>
            <button
              onClick={() => { setActiveTab('inventory'); setInvSubtab('pack'); setMobileMenuOpen(false); }}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
            >
              <span>• ¿Qué toca empacar?</span>
              <span className="font-mono text-[11px] text-zinc-500">{metrics.countPorPreparar} ped</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Bottom Financial Box */}
        <div className="p-3 border-t border-zinc-200 bg-zinc-50/70 space-y-2.5">
          <div className="bg-white p-3 rounded-xl border border-zinc-200 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-zinc-500">Recaudado real</span>
              <span className="font-semibold text-emerald-700 tabular-nums">{formatCOP(metrics.collectedCash)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-500">Falta por cobrar</span>
              <span className="font-semibold text-amber-700 tabular-nums">{formatCOP(metrics.pendingToCollect)}</span>
            </div>
            <div className="flex items-center justify-between pt-1.5 border-t border-zinc-100">
              <span className="text-zinc-500">Ganancia Neta Est.</span>
              <span className="font-semibold text-zinc-900 tabular-nums">{formatCOP(metrics.netProfitProjected)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-400 px-1">
            <span className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${neonStatus === 'connected' ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
              {neonStatus === 'connected' ? 'NeonDB Online' : 'Local + Neon SQL'}
            </span>
            <span className="font-mono">Atajos: 1–5, N, /</span>
          </div>
        </div>
      </aside>

      {/* ===================================================================== */}
      {/* CONTENEDOR PRINCIPAL + BARRA SUPERIOR FLOTANTE                        */}
      {/* ===================================================================== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Floating Top Bar */}
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
                placeholder="Buscar clienta, @instagram, ciudad, guía o #MFB..."
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
                { id: 'inventory', label: 'Inventario por Hacer' },
                { id: 'shipping', label: 'Envíos' },
                { id: 'costs', label: 'Costos' },
                { id: 'neondb', label: 'NeonDB' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
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

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('neondb')}
              className={`hidden sm:inline-flex h-8 px-2.5 rounded-lg border text-xs font-medium items-center gap-1.5 transition-colors ${
                neonStatus === 'connected'
                  ? 'border-emerald-200 bg-emerald-50/60 text-emerald-800'
                  : 'border-zinc-200 bg-white text-zinc-600 hover:text-zinc-900'
              }`}
              title="Estado de Base de Datos NeonDB"
            >
              <Database className="w-3.5 h-3.5" />
              <span>{neonStatus === 'connected' ? 'NeonDB Conectado' : 'Conectar NeonDB'}</span>
            </button>

            <button
              onClick={() => handleOpenOrderModal(null)}
              className="h-8 px-3 rounded-lg bg-zinc-900 text-white text-xs font-medium hover:bg-zinc-800 active:scale-[0.99] transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nuevo Pedido</span>
            </button>
          </div>
        </header>

        {/* Main View Area */}
        <main className="flex-1 p-4 sm:p-6 max-w-[1440px] w-full mx-auto space-y-5">
          {/* ================================================================= */}
          {/* VISTA 1: VENTAS Y PEDIDOS (124+ PEDIDOS CON FILTROS Y 1-CLIC)     */}
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
                    <button
                      onClick={() => {
                        setOrders(generateSeedOrders(catalog, 124));
                        notify('124 pedidos de prueba restaurados');
                      }}
                      className="h-7 px-2.5 rounded-lg border border-zinc-200 bg-white text-xs text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
                      title="Cargar simulación de 124 pedidos reales"
                    >
                      124 Ejemplos
                    </button>
                    <button
                      onClick={() => {
                        setOrders([]);
                        setBoughtSupplies({});
                        setMadeItems({});
                        notify('Tabla vaciada (0 pedidos). Lista para empezar de cero.');
                      }}
                      className="h-7 px-2.5 rounded-lg border border-zinc-200 bg-white text-xs text-zinc-500 hover:text-rose-700 hover:bg-rose-50"
                      title="Vaciar pedidos de prueba para empezar de cero"
                    >
                      Empezar de 0
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

                  <select
                    value={sizeFilter}
                    onChange={(e) => setSizeFilter(e.target.value)}
                    className="h-8 px-2.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-800 focus:outline-none focus:bg-white focus:border-zinc-900"
                  >
                    <option value="ALL">Talla: Todas</option>
                    {['XS', 'S', 'M', 'L', 'XL', '2XL', 'Única'].map(sz => (
                      <option key={sz} value={sz}>Talla {sz}</option>
                    ))}
                  </select>

                  <div className="flex items-center justify-between sm:justify-end gap-2">
                    {(searchQuery || quickStatusFilter !== 'ALL' || payFilter !== 'ALL' || shipFilter !== 'ALL' || productFilter !== 'ALL' || sizeFilter !== 'ALL') && (
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setQuickStatusFilter('ALL');
                          setPayFilter('ALL');
                          setShipFilter('ALL');
                          setProductFilter('ALL');
                          setSizeFilter('ALL');
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
                            </td>

                            <td className="py-3 px-3 align-top">
                              <div className="font-medium text-zinc-900">{order.customerName}</div>
                              <div className="text-[11px] text-zinc-500 flex flex-wrap items-center gap-1.5 mt-0.5">
                                <span>{order.instagram}</span>
                                <span>·</span>
                                <span className="font-mono">{order.phone}</span>
                              </div>
                              <div className="text-[11px] text-zinc-400 mt-0.5 truncate max-w-[190px]">
                                {order.city} — {order.address}
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
                                  onClick={() => handleOpenWhatsApp(order)}
                                  className="h-7 px-2 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 font-medium inline-flex items-center gap-1"
                                  title="Enviar resumen o cobro por WhatsApp"
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
                  <div className="bg-white border border-zinc-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-sm font-semibold text-zinc-900">
                        A. Prendas en Blanco e Insumos para Comprar al Proveedor
                      </h2>
                      <p className="text-xs text-zinc-500">
                        Consolida cuántas prendas base sin estampar, chips NFC, kits de brillos y vinilos necesitas para cumplir todos los pedidos.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        const missing = shoppingNeeds.rows.filter(r => r.missing > 0);
                        if (!missing.length) {
                          notify('¡Ya tienes todos los insumos comprados!');
                          return;
                        }
                        const txt =
                          `*LISTA DE COMPRAS A PROVEEDOR — MYFANBOX*\n` +
                          missing
                            .map(r => `• ${r.blankName} [${r.sizeOrSpec}] -> COMPRAR: ${r.missing} uds (Pedidos: ${r.required}, Ya tengo: ${r.bought})`)
                            .join('\n');
                        copyToClipboard(txt, 'Lista de compras para proveedor copiada');
                      }}
                      className="h-8 px-3 rounded-lg bg-zinc-900 text-white text-xs font-medium hover:bg-zinc-800 inline-flex items-center gap-1.5 shrink-0"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar lista para proveedor</span>
                    </button>
                  </div>

                  <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-zinc-200 bg-zinc-50/80 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                            <th className="py-2.5 px-4">Categoría</th>
                            <th className="py-2.5 px-4">Prenda Base / Insumo</th>
                            <th className="py-2.5 px-4 text-center">Talla / Especificación</th>
                            <th className="py-2.5 px-4 text-center">Total Pedido</th>
                            <th className="py-2.5 px-4 text-center">Ya Comprado / En Stock</th>
                            <th className="py-2.5 px-4 text-right">Falta Comprar</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 text-xs tabular-nums">
                          {shoppingNeeds.rows.map(row => (
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
                                    className="w-6 h-6 rounded border border-zinc-200 bg-white hover:bg-zinc-100 font-bold"
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
                                    className="w-6 h-6 rounded border border-zinc-200 bg-white hover:bg-zinc-100 font-bold"
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
                                ) : (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium">
                                    ✓ Completo
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

              {/* SUB-TAB B: MATRIZ DE ESTAMPADO Y PRODUCCIÓN */}
              {invSubtab === 'make' && (
                <div className="space-y-3">
                  <div className="bg-white border border-zinc-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-sm font-semibold text-zinc-900">
                        B. Matriz de Producción y Estampado (Por Referencia, Variante y Talla XS–2XL)
                      </h2>
                      <p className="text-xs text-zinc-500">
                        Marca con <strong className="text-zinc-900">[-]</strong> y <strong className="text-zinc-900">[+]</strong> las prendas que ya salieron de estampado y pedrería.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        const pending = productionMatrix.rows.filter(r => r.missing > 0);
                        if (!pending.length) {
                          notify('¡Todas las prendas ya están estampadas!');
                          return;
                        }
                        const txt =
                          `*ORDEN DE TALLER / ESTAMPADO — MYFANBOX*\n` +
                          pending
                            .map(r => `• ${r.productName} (${r.variantName}) — Talla ${r.size} -> HACER: ${r.missing} uds`)
                            .join('\n');
                        copyToClipboard(txt, 'Orden de taller copiada al portapapeles');
                      }}
                      className="h-8 px-3 rounded-lg bg-zinc-900 text-white text-xs font-medium hover:bg-zinc-800 inline-flex items-center gap-1.5 shrink-0"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar orden para estampador</span>
                    </button>
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
                          {productionMatrix.rows.map(row => (
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
                                    className="w-6 h-6 rounded border border-zinc-200 bg-white hover:bg-zinc-100 font-bold"
                                  >
                                    -
                                  </button>
                                  <span className="w-12 text-center font-semibold">
                                    {row.made}/{row.orderedQty}
                                  </span>
                                  <button
                                    onClick={() =>
                                      setMadeItems(prev => ({
                                        ...prev,
                                        [row.key]: row.made + 1
                                      }))
                                    }
                                    className="w-6 h-6 rounded border border-zinc-200 bg-white hover:bg-zinc-100 font-bold"
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
                                ) : (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium">
                                    ✓ Listas
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
                                        {it.variantName} · Talla <strong>{it.size}</strong>
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
                                <button
                                  onClick={() => handleOpenWhatsApp(order)}
                                  className="h-7 px-2.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-medium text-zinc-800"
                                >
                                  Enviar WA
                                </button>
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
          {/* VISTA 5: BASE DE DATOS NEONDB (SERVERLESS POSTGRESQL & SQL LIVE)  */}
          {/* ================================================================= */}
          {activeTab === 'neondb' && (
            <div className="space-y-4">
              <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-base sm:text-lg font-semibold text-zinc-900">
                        Conexión Serverless a NeonDB (PostgreSQL)
                      </h1>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                          neonStatus === 'connected'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : neonStatus === 'error'
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : 'bg-zinc-100 text-zinc-600 border-zinc-200'
                        }`}
                      >
                        {neonStatus === 'connected'
                          ? `Conectado (${neonLastSync || 'Activo'})`
                          : neonStatus === 'error'
                          ? 'Error de conexión'
                          : 'Modo Caché Local'}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Conecta tu proyecto de Neon.tech pegando la cadena <code className="font-mono bg-zinc-100 px-1 rounded">postgresql://...</code> para sincronizar pedidos, catálogo y costos sobre HTTPS (<code className="font-mono bg-zinc-100 px-1 rounded">POST https://&lt;host&gt;/sql</code>).
                    </p>
                  </div>

                  <label className="inline-flex items-center gap-2 text-xs font-medium text-zinc-800 cursor-pointer bg-zinc-50 px-3 py-2 rounded-lg border border-zinc-200">
                    <input
                      type="checkbox"
                      checked={neonAutoSync}
                      onChange={(e) => setNeonAutoSync(e.target.checked)}
                      className="rounded border-zinc-300"
                    />
                    <span>Auto-Sync en cada cambio</span>
                  </label>
                </div>

                {/* Connection String Input */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5">
                  <div className="lg:col-span-7">
                    <label className="block text-[11px] font-medium text-zinc-500 mb-1">
                      Neon Connection String (Direct o Pooler URL)
                    </label>
                    <input
                      type="password"
                      value={neonConnString}
                      onChange={(e) => setNeonConnString(e.target.value)}
                      placeholder="postgresql://neondb_owner:npg_...@ep-cool-forest-123456.us-east-2.aws.neon.tech/neondb?sslmode=require"
                      className="w-full h-9 px-3 font-mono text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 focus:bg-white focus:border-zinc-900 focus:outline-none"
                    />
                  </div>
                  <div className="lg:col-span-5 flex flex-wrap items-end gap-2">
                    <button
                      onClick={handleInitNeonTables}
                      className="h-9 px-3 rounded-lg bg-zinc-900 text-white text-xs font-medium hover:bg-zinc-800 flex items-center gap-1.5"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>1. Crear Tablas en Neon</span>
                    </button>
                    <button
                      onClick={handlePushAllToNeon}
                      className="h-9 px-3 rounded-lg border border-zinc-200 bg-white text-zinc-800 text-xs font-medium hover:bg-zinc-50 flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Subir Datos (Push)</span>
                    </button>
                    <button
                      onClick={handlePullFromNeon}
                      className="h-9 px-3 rounded-lg border border-zinc-200 bg-white text-zinc-800 text-xs font-medium hover:bg-zinc-50 flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Bajar (Pull)</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* SQL Console & Schema Viewer */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Left: SQL Schema & Custom Query Runner */}
                <div className="bg-white border border-zinc-200 rounded-xl p-4 space-y-3 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-zinc-900 flex items-center gap-1.5">
                        <FileCode className="w-4 h-4" />
                        <span>Esquema PostgreSQL (`schema.sql`)</span>
                      </span>
                      <button
                        onClick={() => copyToClipboard(POSTGRES_SCHEMA_SQL, 'Esquema SQL copiado para Neon SQL Editor')}
                        className="h-7 px-2.5 rounded border border-zinc-200 text-xs text-zinc-700 hover:bg-zinc-50 inline-flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" /> Copiar SQL
                      </button>
                    </div>
                    <pre className="p-3 rounded-lg bg-zinc-950 text-zinc-200 font-mono text-[11px] overflow-x-auto max-h-56 leading-relaxed">
                      {POSTGRES_SCHEMA_SQL}
                    </pre>

                    {/* Live SQL Runner */}
                    <div className="pt-2 border-t border-zinc-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-zinc-900">
                          Consola SQL en Vivo (Ejecutar en NeonDB)
                        </label>
                        <button
                          onClick={async () => {
                            const res = await executeNeonQuery(customSqlQuery);
                            if (res.ok) {
                              setCustomSqlResult(res.data?.rows || []);
                              notify('Consulta SQL ejecutada en NeonDB');
                            } else {
                              notify('Conecta una URL válida de NeonDB para ejecutar consultas remotas', 'warning');
                            }
                          }}
                          className="h-7 px-3 rounded-lg bg-zinc-900 text-white text-xs font-medium hover:bg-zinc-800 inline-flex items-center gap-1"
                        >
                          <Play className="w-3 h-3" /> Ejecutar SQL
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        value={customSqlQuery}
                        onChange={(e) => setCustomSqlQuery(e.target.value)}
                        className="w-full p-2.5 font-mono text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900"
                      />
                      {customSqlResult && (
                        <pre className="p-2.5 rounded-lg bg-zinc-100 text-zinc-800 font-mono text-[11px] overflow-x-auto max-h-36">
                          {JSON.stringify(customSqlResult, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Live SQL Query Log */}
                <div className="bg-white border border-zinc-200 rounded-xl p-4 flex flex-col justify-between space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-900 flex items-center gap-1.5">
                      <Terminal className="w-4 h-4" />
                      <span>Registro de Consultas y Eventos NeonDB</span>
                    </span>
                    <button
                      onClick={() => setSqlLogs([])}
                      className="text-[11px] text-zinc-400 hover:text-zinc-800"
                    >
                      Limpiar log
                    </button>
                  </div>

                  <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                    {sqlLogs.map(log => (
                      <div
                        key={log.id}
                        className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200 font-mono text-[11px] space-y-1"
                      >
                        <div className="flex items-center justify-between text-[10px] text-zinc-400">
                          <span>{log.timestamp}</span>
                          <span
                            className={`px-1.5 py-0.2 rounded font-semibold ${
                              log.status === 'OK'
                                ? 'bg-emerald-100 text-emerald-800'
                                : log.status === 'ERROR'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-zinc-200 text-zinc-700'
                            }`}
                          >
                            {log.status} · {log.durationMs}ms
                          </span>
                        </div>
                        <div className="text-zinc-800 break-all">{log.sql}</div>
                        {log.detail && <div className="text-zinc-500 text-[10px]">{log.detail}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ===================================================================== */}
      {/* MODAL: NUEVO PEDIDO / EDITAR PEDIDO                                   */}
      {/* ===================================================================== */}
      {orderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/40 backdrop-blur-[2px]">
          <form
            onSubmit={handleSaveOrderModal}
            className="bg-white border border-zinc-200 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-xl overflow-hidden"
          >
            <div className="px-5 py-3.5 border-b border-zinc-200 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-zinc-900">
                  {editingOrder ? `Editar Pedido ${editingOrder.id}` : 'Registrar Nuevo Pedido'}
                </h2>
                <p className="text-[11px] text-zinc-500">
                  Selecciona las prendas del catálogo oficial Karol G y define el estado de pago/envío.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOrderModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Customer Data */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-zinc-700 mb-1">Nombre del Cliente *</label>
                  <input
                    type="text"
                    required
                    value={draftCustomer.customerName}
                    onChange={(e) => setDraftCustomer({ ...draftCustomer, customerName: e.target.value })}
                    placeholder="Ej: Valentina Gómez"
                    className="w-full h-8 px-2.5 bg-zinc-50 border border-zinc-200 rounded-lg focus:bg-white focus:border-zinc-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-zinc-700 mb-1">Instagram (@)</label>
                  <input
                    type="text"
                    value={draftCustomer.instagram}
                    onChange={(e) => setDraftCustomer({ ...draftCustomer, instagram: e.target.value })}
                    placeholder="@valengomez"
                    className="w-full h-8 px-2.5 bg-zinc-50 border border-zinc-200 rounded-lg focus:bg-white focus:border-zinc-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-zinc-700 mb-1">WhatsApp / Teléfono *</label>
                  <input
                    type="text"
                    value={draftCustomer.phone}
                    onChange={(e) => setDraftCustomer({ ...draftCustomer, phone: e.target.value })}
                    placeholder="3004128890"
                    className="w-full h-8 px-2.5 bg-zinc-50 border border-zinc-200 rounded-lg focus:bg-white focus:border-zinc-900 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-medium text-zinc-700 mb-1">Ciudad</label>
                    <input
                      type="text"
                      value={draftCustomer.city}
                      onChange={(e) => setDraftCustomer({ ...draftCustomer, city: e.target.value })}
                      placeholder="Medellín"
                      className="w-full h-8 px-2.5 bg-zinc-50 border border-zinc-200 rounded-lg focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-zinc-700 mb-1">Dirección</label>
                    <input
                      type="text"
                      value={draftCustomer.address}
                      onChange={(e) => setDraftCustomer({ ...draftCustomer, address: e.target.value })}
                      placeholder="Cra 43A #11-40"
                      className="w-full h-8 px-2.5 bg-zinc-50 border border-zinc-200 rounded-lg focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Add Item Builder */}
              <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2.5">
                <div className="font-semibold text-zinc-800">Agregar Prendas del Catálogo</div>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <div className="sm:col-span-5">
                    <select
                      value={selProdId}
                      onChange={(e) => {
                        const newProd = catalog.find(c => c.id === e.target.value) || catalog[0];
                        setSelProdId(newProd.id);
                        setSelVarId(newProd.variants[0]?.id || '');
                        setSelSize(newProd.sizes[0] || 'Única');
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
                  <div className="sm:col-span-4">
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
                  <div className="sm:col-span-3 flex items-center gap-1.5">
                    <select
                      value={selSize}
                      onChange={(e) => setSelSize(e.target.value)}
                      className="w-full h-8 px-2 bg-white border border-zinc-200 rounded-lg"
                    >
                      {(catalog.find(c => c.id === selProdId)?.sizes || ['Única']).map(sz => (
                        <option key={sz} value={sz}>
                          {sz}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={selQty}
                      onChange={(e) => setSelQty(e.target.value)}
                      className="w-14 h-8 px-2 text-center bg-white border border-zinc-200 rounded-lg font-semibold"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleAddDraftItem}
                    className="h-7 px-3 rounded-lg bg-zinc-900 text-white text-xs font-medium hover:bg-zinc-800"
                  >
                    + Añadir al pedido
                  </button>
                </div>

                {draftItems.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-zinc-200">
                    {draftItems.map((it, idx) => (
                      <div
                        key={it.id}
                        className="flex items-center justify-between px-2.5 py-1.5 bg-white rounded-lg border border-zinc-200"
                      >
                        <div>
                          <span className="font-semibold">{it.qty}×</span> {it.productName} ·{' '}
                          <span className="text-zinc-500">{it.variantName}</span>{' '}
                          <span className="px-1.5 py-0.2 bg-zinc-100 rounded text-[10px] font-semibold">
                            {it.size}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold tabular-nums">{formatCOP(it.unitPrice * it.qty)}</span>
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

              {/* Payment & Shipping Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-zinc-700 mb-1">Estado de Pago</label>
                  <select
                    value={draftCustomer.paymentStatus}
                    onChange={(e) => setDraftCustomer({ ...draftCustomer, paymentStatus: e.target.value })}
                    className="w-full h-8 px-2.5 bg-zinc-50 border border-zinc-200 rounded-lg font-semibold"
                  >
                    {PAYMENT_STATUSES.map(st => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-zinc-700 mb-1">Estado de Envío</label>
                  <select
                    value={draftCustomer.shippingStatus}
                    onChange={(e) => setDraftCustomer({ ...draftCustomer, shippingStatus: e.target.value })}
                    className="w-full h-8 px-2.5 bg-zinc-50 border border-zinc-200 rounded-lg font-semibold"
                  >
                    {SHIPPING_STATUSES.map(st => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-zinc-700 mb-1">Transportadora</label>
                  <select
                    value={draftCustomer.carrier}
                    onChange={(e) => setDraftCustomer({ ...draftCustomer, carrier: e.target.value })}
                    className="w-full h-8 px-2.5 bg-zinc-50 border border-zinc-200 rounded-lg"
                  >
                    {CARRIERS.map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-zinc-200 bg-zinc-50 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setOrderModalOpen(false)}
                className="h-8 px-3.5 rounded-lg border border-zinc-200 bg-white text-xs font-medium text-zinc-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="h-8 px-4 rounded-lg bg-zinc-900 text-white text-xs font-medium hover:bg-zinc-800"
              >
                Guardar Pedido
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
    </div>
  );
}
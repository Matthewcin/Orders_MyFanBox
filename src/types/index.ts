export interface ProductVariant {
  id: string;
  name: string;
  extraPrice: number;
  extraCost: number;
  blankOverride?: string;
  needsRhinestones?: boolean;
  needsGlitterVinyl?: boolean;
  vinylColor?: string;
  needsNFC?: boolean;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  basePrice: number;
  unitCost: number;
  blankName: string;
  sizes: string[];
  variants: ProductVariant[];
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  variantId: string;
  variantName: string;
  size: string;
  gender: string;
  qty: number;
  unitPrice: number;
  packed: boolean;
  customerCedula?: string;
  manualPin?: boolean;
}

export interface Order {
  id: string;
  uuid: string;
  customerName: string;
  cedula: string;
  instagram: string;
  phone: string;
  city: string;
  neighborhood: string;
  address: string;
  postalCode: string;
  formattedAddress: string;
  lat?: number;
  lng?: number;
  manualPin: boolean;
  addressVerified: boolean;
  paymentStatus: string;
  shippingStatus: string;
  carrier: string;
  trackingNumber: string;
  notes: string;
  discount: number;
  total: number;
  createdAt: string;
  items: OrderItem[];
}

export interface ThemeOption {
  id: string;
  name: string;
  short: string;
  dot: string;
  border: string;
  desc: string;
}

export interface ThemePalette {
  background: string;
  surface: string;
  surfaceAlt: string;
  hover: string;
  hoverText: string;
  selectedBg?: string;
  selectedText?: string;
  text: string;
  muted: string;
  primary: string;
  primaryText: string;
  border: string;
  isDark?: boolean;
}
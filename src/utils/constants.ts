import { Product, ThemeOption, ThemePalette } from '../types';

export const PAYMENT_STATUSES = [
  'Pendiente',
  'Semi-pagado (50%)',
  'Pagado',
  'Cancelado',
  'Reembolsado'
];

export const SHIPPING_STATUSES = [
  'Por preparar',
  'Por enviar',
  'Enviado'
];

export const CARRIERS = [
  'Interrapidísimo',
  'Coordinadora',
  'Envía',
  'Servientrega',
  'Entrega Personal'
];

export const GARMENT_GENDERS = [
  'Femenino',
  'Masculino',
  'Sin especificar'
];

export const ALL_GARMENT_SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL'];

export const CEDULA_STORAGE_KEY = 'mfb_order_cedulas_v2';
export const THEME_STORAGE_KEY = 'mfb_theme';
export const ADMIN_SESSION_KEY = 'mfb_admin_session_token_v2';
export const DEFAULT_ADMIN_USER = 'admin';

export const OFFICIAL_CATALOG_FALLBACK: Product[] = [
  {
    id: "cat-1", code: "TROPICOQUETA", name: "Hoodie Tropicoqueta", category: "Prenda", basePrice: 140000, unitCost: 66000, blankName: "Hoodie Base Beige (Sin estampar)", sizes: ["XS", "S", "M", "L", "XL", "2XL"],
    variants: [
      { id: "v1-std", name: "Estándar", extraPrice: 0, extraCost: 0, needsRhinestones: false, needsGlitterVinyl: false },
      { id: "v1-brillos", name: "Con Brillos (+$10.000)", extraPrice: 10000, extraCost: 3500, needsRhinestones: true, needsGlitterVinyl: false }
    ]
  },
  {
    id: "cat-2", code: "STAR-HOODIE", name: "Star Hoodie", category: "Prenda", basePrice: 140000, unitCost: 68000, blankName: "Hoodie Base Negro (Sin estampar)", sizes: ["XS", "S", "M", "L", "XL", "2XL"],
    variants: [
      { id: "v2-std", name: "Estrella de Brillos (Estándar)", extraPrice: 0, extraCost: 0, needsRhinestones: true, needsGlitterVinyl: false },
      { id: "v2-extra", name: "Con Brillos Extra (+$10.000)", extraPrice: 10000, extraCost: 3500, needsRhinestones: true, needsGlitterVinyl: false }
    ]
  },
  {
    id: "cat-3", code: "LATINA-CROP", name: "Latina Croptop", category: "Prenda", basePrice: 80000, unitCost: 32000, blankName: "Croptop Base", sizes: ["XS", "S", "M", "L", "XL", "2XL"],
    variants: [
      { id: "v3-crema", name: "Blanco/Crema (Congas)", extraPrice: 0, extraCost: 0, blankOverride: "Croptop Base Blanco/Crema", needsRhinestones: false, needsGlitterVinyl: false },
      { id: "v3-negro", name: "Negro (Latina Foreva)", extraPrice: 0, extraCost: 0, blankOverride: "Croptop Base Negro", needsRhinestones: false, needsGlitterVinyl: false }
    ]
  },
  {
    id: "cat-4", code: "NMADST", name: "NMADST (Raglan \"No me arrepiento de sentir tanto\")", category: "Prenda", basePrice: 90000, unitCost: 41000, blankName: "Camiseta Raglan Blanca / Mangas Negras", sizes: ["XS", "S", "M", "L", "XL", "2XL"],
    variants: [
      { id: "v4-azul", name: "Pedrería Mangas + Vinilo Escarchado Azul", extraPrice: 0, extraCost: 0, needsRhinestones: true, needsGlitterVinyl: true, vinylColor: "Azul Escarchado" },
      { id: "v4-negro", name: "Pedrería Mangas + Vinilo Escarchado Negro", extraPrice: 0, extraCost: 0, needsRhinestones: true, needsGlitterVinyl: true, vinylColor: "Negro Escarchado" }
    ]
  },
  {
    id: "cat-5", code: "SPARKLY", name: "Sparkly Oversized Unisex", category: "Prenda", basePrice: 90000, unitCost: 43000, blankName: "Camiseta Oversized Unisex Negra", sizes: ["XS", "S", "M", "L", "XL", "2XL"],
    variants: [
      { id: "v5-mun-neg", name: "Muñeca + Pedrería Negra (Vinilo Azul)", extraPrice: 0, extraCost: 0, needsRhinestones: true, needsGlitterVinyl: true, vinylColor: "Azul Escarchado" },
      { id: "v5-mun-pla", name: "Muñeca + Pedrería Plateada (Vinilo Azul)", extraPrice: 0, extraCost: 0, needsRhinestones: true, needsGlitterVinyl: true, vinylColor: "Azul Escarchado" },
      { id: "v5-fir-neg", name: "Firma Karol G + Pedrería Negra (Vinilo Azul)", extraPrice: 0, extraCost: 0, needsRhinestones: true, needsGlitterVinyl: true, vinylColor: "Azul Escarchado" },
      { id: "v5-fir-pla", name: "Firma Karol G + Pedrería Plateada (Vinilo Azul)", extraPrice: 0, extraCost: 0, needsRhinestones: true, needsGlitterVinyl: true, vinylColor: "Azul Escarchado" }
    ]
  },
  {
    id: "cat-6", code: "CANTAR-CORA", name: "Cantar con Cora Croptop", category: "Prenda", basePrice: 85000, unitCost: 35000, blankName: "Croptop Base", sizes: ["XS", "S", "M", "L", "XL", "2XL"],
    variants: [
      { id: "v6-celeste", name: "Celeste (\"Still love you\")", extraPrice: 0, extraCost: 0, blankOverride: "Croptop Base Celeste", needsGlitterVinyl: true, vinylColor: "Azul Escarchado" },
      { id: "v6-blanco", name: "Blanco (\"Matadora\")", extraPrice: 0, extraCost: 0, blankOverride: "Croptop Base Blanco", needsGlitterVinyl: true, vinylColor: "Azul Escarchado" },
      { id: "v6-negro", name: "Negro (\"Bby Wow\")", extraPrice: 0, extraCost: 0, blankOverride: "Croptop Base Negro", needsGlitterVinyl: true, vinylColor: "Azul Escarchado" }
    ]
  },
  {
    id: "cat-7", code: "CD-NFC", name: "Llavero Mini CD (Con NFC)", category: "Accesorio", basePrice: 30000, unitCost: 9500, blankName: "Caja Acrílica Mini CD + Herraje Estrella", sizes: ["Única"],
    variants: [
      { id: "v7-msb", name: "Mañana Será Bonito (Con NFC)", extraPrice: 0, extraCost: 0, needsNFC: true },
      { id: "v7-bs", name: "Bichota Season (Con NFC)", extraPrice: 0, extraCost: 0, needsNFC: true },
      { id: "v7-kg", name: "KG0516 (Con NFC)", extraPrice: 0, extraCost: 0, needsNFC: true },
      { id: "v7-ocean", name: "Ocean (Con NFC)", extraPrice: 0, extraCost: 0, needsNFC: true },
      { id: "v7-unstop", name: "Unstoppable (Con NFC)", extraPrice: 0, extraCost: 0, needsNFC: true },
      { id: "v7-tropi", name: "Tropicoqueta (Con NFC)", extraPrice: 0, extraCost: 0, needsNFC: true }
    ]
  },
  {
    id: "cat-8", code: "CD-QR", name: "Llavero Mini CD (Sin NFC / QR)", category: "Accesorio", basePrice: 28000, unitCost: 7200, blankName: "Caja Acrílica Mini CD + Herraje Estrella", sizes: ["Única"],
    variants: [
      { id: "v8-msb", name: "Mañana Será Bonito (Sin NFC / QR)", extraPrice: 0, extraCost: 0, needsNFC: false },
      { id: "v8-bs", name: "Bichota Season (Sin NFC / QR)", extraPrice: 0, extraCost: 0, needsNFC: false },
      { id: "v8-kg", name: "KG0516 (Sin NFC / QR)", extraPrice: 0, extraCost: 0, needsNFC: false },
      { id: "v8-ocean", name: "Ocean (Sin NFC / QR)", extraPrice: 0, extraCost: 0, needsNFC: false },
      { id: "v8-unstop", name: "Unstoppable (Sin NFC / QR)", extraPrice: 0, extraCost: 0, needsNFC: false },
      { id: "v8-tropi", name: "Tropicoqueta (Sin NFC / QR)", extraPrice: 0, extraCost: 0, needsNFC: false }
    ]
  },
  {
    id: "cat-9", code: "DTF-FANBOX", name: "Nueva DTF Fanbox (Kit Personaliza tú mismx)", category: "Accesorio", basePrice: 30000, unitCost: 11000, blankName: "Cajita Fanbox + Plancha Parches DTF", sizes: ["Única"],
    variants: [
      { id: "v9-kit", name: "Kit Parches DTF para Planchar", extraPrice: 0, extraCost: 0 }
    ]
  },
  {
    id: "cat-10", code: "CUSTOM", name: "Prenda Personalizada (\"Idea en mente\")", category: "Prenda", basePrice: 110000, unitCost: 52000, blankName: "Prenda Base Custom (Según diseño)", sizes: ["XS", "S", "M", "L", "XL", "2XL"],
    variants: [
      { id: "v10-tee", name: "Camiseta Personalizada desde cero", extraPrice: 0, extraCost: 0 },
      { id: "v10-hoodie", name: "Hoodie Personalizado desde cero (+$35.000)", extraPrice: 35000, extraCost: 18000 }
    ]
  }
];

export const EYE_CARE_THEMES: ThemeOption[] = [
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

export const THEME_PALETTES: Record<string, ThemePalette> = {
  light: { background:'#F7F8FA', surface:'#FFFFFF', surfaceAlt:'#EEF1F5', hover:'#E4E9F0', hoverText:'#0F172A', selectedBg:'#D8ECE8', selectedText:'#133A32', text:'#182230', muted:'#536273', primary:'#285D52', primaryText:'#FFFFFF', border:'#D5DDE5', isDark: false },
  'cream-light': { background:'#F5F0E7', surface:'#FFFCF6', surfaceAlt:'#EAE1D2', hover:'#DFD3C0', hoverText:'#0F172A', text:'#2F2922', muted:'#685B4B', primary:'#76543A', primaryText:'#FFFFFF', border:'#D8C9B5', isDark: false },
  'rose-light': { background:'#FFF5F7', surface:'#FFFFFF', surfaceAlt:'#F8E5EB', hover:'#F0D5DF', hoverText:'#0F172A', text:'#3B2430', muted:'#745666', primary:'#9B3F63', primaryText:'#FFFFFF', border:'#E8C7D3', isDark: false },
  'sky-light': { background:'#F1F7FC', surface:'#FFFFFF', surfaceAlt:'#E4EEF7', hover:'#D5E4F2', hoverText:'#0F172A', text:'#1E3144', muted:'#536B82', primary:'#285B83', primaryText:'#FFFFFF', border:'#C9D8E6', isDark: false },
  'medium-dark': { background:'#151A22', surface:'#1E2530', surfaceAlt:'#26303E', hover:'#303C4E', hoverText:'#F8FAFC', selectedBg:'#243B4A', selectedText:'#F8FAFC', text:'#F1F5F9', muted:'#94A3B8', primary:'#2A7B6F', primaryText:'#F8FAFC', border:'#334155', isDark: true },
  dark: { background:'#0E1015', surface:'#161A22', surfaceAlt:'#1F2530', hover:'#2A3241', hoverText:'#F8FAFC', text:'#F3F4F6', muted:'#9CA3AF', primary:'#4F5D95', primaryText:'#FFFFFF', border:'#2D3545', isDark: true },
  'yellow-dark': { background:'#181510', surface:'#221E17', surfaceAlt:'#2C261D', hover:'#383024', hoverText:'#F8FAFC', text:'#F5EFE4', muted:'#B8AC99', primary:'#8C6B32', primaryText:'#FFFDF9', border:'#42392B', isDark: true },
  'pink-dark': { background:'#1A1217', surface:'#251A21', surfaceAlt:'#31222C', hover:'#3E2B38', hoverText:'#F8FAFC', text:'#FAF0F5', muted:'#C4A8B8', primary:'#944268', primaryText:'#FFF9FC', border:'#4A3342', isDark: true },
  'lavender-dark': { background:'#151320', surface:'#1E1B2E', surfaceAlt:'#28243C', hover:'#342F4E', hoverText:'#F8FAFC', text:'#F3F0FF', muted:'#B0A8CC', primary:'#5E4B9E', primaryText:'#FFFFFF', border:'#3F3859', isDark: true },
  'ocean-dark': { background:'#0F1B22', surface:'#162731', surfaceAlt:'#1E3441', hover:'#274353', hoverText:'#F8FAFC', text:'#ECFEFF', muted:'#99BCC9', primary:'#1F7A8C', primaryText:'#FFFFFF', border:'#2E4C5C', isDark: true },
  'forest-dark': { background:'#111C16', surface:'#182820', surfaceAlt:'#21362B', hover:'#2B4638', hoverText:'#F8FAFC', text:'#ECFDF3', muted:'#9EC2AC', primary:'#2D6A4F', primaryText:'#FFFFFF', border:'#314E3E', isDark: true },
  'sunset-dark': { background:'#1C1413', surface:'#281C1B', surfaceAlt:'#352523', hover:'#44302D', hoverText:'#F8FAFC', text:'#FFF5F0', muted:'#C8AAA0', primary:'#9E4E36', primaryText:'#FFFFFF', border:'#4F3733', isDark: true }
};

export const COLOMBIA_CITIES_GEO: Record<string, any> = {
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

export const COLOMBIA_VERIFIED_ZONES = [
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
const PC_GUIDES_STORAGE_KEY = 'mfb_pc_tracking_guides_v1';
const CACHE_TTL_MS = 2 * 60 * 60 * 1000; // 2 horas

export interface PcGuideRecord {
  trackingNumber: string;
  shippingStatus?: 'Por preparar' | 'Por enviar' | 'Enviado' | 'Entregado' | string;
  lastEvent?: string;
  lastLocation?: string;
  checkedAt: number;
}

export function isAdminSessionActive(): boolean {
  try {
    return Boolean(
      localStorage.getItem('mfb_admin_token') ||
      localStorage.getItem('mfb_token') ||
      sessionStorage.getItem('mfb_admin_token')
    );
  } catch {
    return false;
  }
}

function readAllGuides(): Record<string, PcGuideRecord> {
  try {
    const raw = localStorage.getItem(PC_GUIDES_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeAllGuides(map: Record<string, PcGuideRecord>): void {
  try {
    localStorage.setItem(PC_GUIDES_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Ignorar errores de cuota o modo privado
  }
}

export function getPcCachedGuide(
  trackingNumber: string,
  options?: { isAdmin?: boolean; ignoreTtl?: boolean }
): PcGuideRecord | null {
  const admin = options?.isAdmin ?? isAdminSessionActive();
  if (admin) return null;

  const key = String(trackingNumber || '').trim();
  if (!key) return null;

  const record = readAllGuides()[key];
  if (!record) return null;

  // Si ya figura como Entregado, no hace falta volver a consultar
  if (record.shippingStatus === 'Entregado') return record;

  if (!options?.ignoreTtl && Date.now() - record.checkedAt > CACHE_TTL_MS) {
    return null;
  }

  return record;
}

export function savePcCachedGuide(
  trackingNumber: string,
  data: { shippingStatus?: string; lastEvent?: string; lastLocation?: string },
  isAdmin?: boolean
): void {
  const admin = isAdmin ?? isAdminSessionActive();
  if (admin) return;

  const key = String(trackingNumber || '').trim();
  if (!key) return;

  const all = readAllGuides();
  all[key] = {
    trackingNumber: key,
    shippingStatus: data.shippingStatus,
    lastEvent: data.lastEvent,
    lastLocation: data.lastLocation,
    checkedAt: Date.now()
  };
  writeAllGuides(all);
}
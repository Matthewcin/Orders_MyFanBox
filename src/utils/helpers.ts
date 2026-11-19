import { Product, Order, OrderItem } from '../types';
import { 
  ALL_GARMENT_SIZES, 
  GARMENT_GENDERS, 
  PAYMENT_STATUSES, 
  SHIPPING_STATUSES, 
  CARRIERS, 
  CEDULA_STORAGE_KEY, 
  COLOMBIA_CITIES_GEO, 
  COLOMBIA_VERIFIED_ZONES 
} from './constants';

export function toSafeText(val: any, fallback = ''): string {
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

export function sanitizeCatalogRecord(rawProd: any, idx = 0): Product {
  const name = toSafeText(rawProd?.name ?? rawProd?.label, `Referencia ${idx + 1}`);
  const category = toSafeText(rawProd?.category, 'Prenda');
  const rawSizes = Array.isArray(rawProd?.sizes)
    ? rawProd.sizes.map((s: any) => toSafeText(s, 'M')).filter(Boolean)
    : [];

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

export function readStoredCedulas(): Record<string, string> {
  try {
    const raw = localStorage.getItem(CEDULA_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveStoredCedula(orderId: string, uuid: string, cedula: string) {
  if (!cedula) return;
  try {
    const current = readStoredCedulas();
    if (orderId) current[orderId] = cedula;
    if (uuid) current[uuid.toLowerCase()] = cedula;
    localStorage.setItem(CEDULA_STORAGE_KEY, JSON.stringify(current));
  } catch {}
}

const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidUUID(str: any): boolean {
  if (!str || typeof str !== 'string') return false;
  return UUID_V4_REGEX.test(str.trim());
}

export function generateUUIDv4(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function sanitizeOrderRecord(rawOrder: any, idx = 0, settingsCedulas: Record<string, string> = {}): Order {
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

  const items: OrderItem[] = rawItems.map((it: any, iIdx: number) => {
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

export function parseCoordsFromInput(raw: string): { lat: number; lng: number } | null {
  if (!raw) return null;
  const match = String(raw).match(/(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/);
  if (!match) return null;
  const lat = parseFloat(match[1]);
  const lng = parseFloat(match[2]);
  if (isNaN(lat) || isNaN(lng)) return null;
  return { lat: Number(lat.toFixed(5)), lng: Number(lng.toFixed(5)) };
}

export function formatCOP(val: any): string {
  const num = Number(val) || 0;
  return '$' + Math.round(num).toLocaleString('es-CO');
}

export function getContrastRatio(hexA: string, hexB: string): number {
  const luminance = (hex: string) => {
    const raw = String(hex || '#000000').replace('#', '');
    const normalized = raw.length === 3 ? raw.split('').map(ch => ch + ch).join('') : raw;
    const rgb = [0, 2, 4].map(i => parseInt(normalized.slice(i, i + 2), 16) / 255);
    const linear = rgb.map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
    return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
  };
  const a = luminance(hexA);
  const b = luminance(hexB);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

export function isOrderActive(order: Order): boolean {
  return order.paymentStatus !== 'Cancelado' && order.paymentStatus !== 'Reembolsado';
}

export function getPaidAmount(order: Order): number {
  if (!isOrderActive(order)) return 0;
  if (order.paymentStatus === 'Pagado') return order.total;
  if (order.paymentStatus === 'Semi-pagado (50%)') return Math.round(order.total * 0.5);
  return 0;
}

export function getPendingAmount(order: Order): number {
  if (!isOrderActive(order)) return 0;
  if (order.paymentStatus === 'Pagado') return 0;
  if (order.paymentStatus === 'Semi-pagado (50%)') return order.total - Math.round(order.total * 0.5);
  return order.total;
}

export function inferColombianAddressMetadata(city: string, addressText = '') {
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
    lng: matchedZone?.lng || cityGeo.lng,
    city: cleanCity,
    streetAddress: addressText
  };
}

export function inferMetadataFromCoordinates(lat: number, lng: number) {
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

export async function reverseGeocodeFromCoordinates(lat: number, lng: number, googleApiKey = '') {
  const localFallback = inferMetadataFromCoordinates(lat, lng);
  const safeLat = Number(Number(lat).toFixed(5));
  const safeLng = Number(Number(lng).toFixed(5));

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
            comps.find((c: any) => types.some((t: string) => c.types?.includes(t)))?.long_name;
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
    } catch (err) {}
  }

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
  } catch (err) {}

  return {
    ...localFallback,
    formattedAddress: `${localFallback.streetAddress}, Barrio ${localFallback.neighborhood}, ${localFallback.city}, Colombia (CP ${localFallback.postalCode})`,
    lat: safeLat,
    lng: safeLng
  };
}

export function getOrderCoordinates(order: any) {
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

export async function searchAndVerifyColombianAddress(city: string, streetAddress: string, googleApiKey = '') {
  const cleanCity = (city || 'Medellín').trim();
  const cleanStreet = (streetAddress || '').trim();
  const fullQuery = `${cleanStreet}, ${cleanCity}, Colombia`;
  const results: any[] = [];

  if (googleApiKey && googleApiKey.trim().length > 10) {
    try {
      const gUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        fullQuery
      )}&region=co&language=es&key=${encodeURIComponent(googleApiKey.trim())}`;
      const gRes = await fetch(gUrl);
      if (gRes.ok) {
        const gData = await gRes.json();
        if (Array.isArray(gData.results)) {
          gData.results.slice(0, 4).forEach((item: any, idx: number) => {
            const comps = item.address_components || [];
            const postalComp = comps.find((c: any) => c.types.includes('postal_code'));
            const barrioComp = comps.find(
              (c: any) =>
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
    } catch (e) {}
  }

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
  } catch (e) {}

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

export function calcDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
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
  return Math.max(4, Math.round(R * c * 1.28));
}

export function calculateOrderETA(order: any, originHub = 'Medellín') {
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

  const prepBufferDays = order.shippingStatus === 'Por preparar' ? 2 : 0;
  const baseDate = new Date();
  const minDate = new Date(baseDate);
  minDate.setDate(baseDate.getDate() + minDays + prepBufferDays);
  const maxDate = new Date(baseDate);
  maxDate.setDate(baseDate.getDate() + maxDays + prepBufferDays);

  const fmtDate = (d: Date) =>
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
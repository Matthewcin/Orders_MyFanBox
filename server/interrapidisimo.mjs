const CONSULTAR_GUIAS_URL =
  'https://gateway.interrapidisimo.com/ConsultaGuiasSTE/api/v1/Guias/ConsultarGuias';

const HEADERS = {
  Accept: 'application/json, text/plain, */*',
  'Accept-Language': 'es-419,es;q=0.9',
  Origin: 'https://siguetuenvio.interrapidisimo.com',
  Referer: 'https://siguetuenvio.interrapidisimo.com/',
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36'
};

function mapEstadoToShippingStatus(rawStatusText = '') {
  const s = String(rawStatusText || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

  if (!s) return null;
  if (s.includes('entregad') || s.includes('delivered')) {
    return 'Entregado';
  }
  if (
    s.includes('enviad') ||
    s.includes('transito') ||
    s.includes('reparto') ||
    s.includes('admision') ||
    s.includes('en ruta') ||
    s.includes('despach') ||
    s.includes('centro') ||
    s.includes('recogid')
  ) {
    return 'Enviado';
  }
  return null;
}

function extractTrackingInfo(payload) {
  if (!payload || typeof payload !== 'object') {
    return { shippingStatus: null, lastEvent: '', lastLocation: '', raw: payload };
  }

  // Interrapidísimo puede devolver un array o un objeto con lista/detalle/estados
  const candidate = Array.isArray(payload)
    ? payload[0]
    : Array.isArray(payload.data)
    ? payload.data[0]
    : Array.isArray(payload.guias)
    ? payload.guias[0]
    : payload.data && typeof payload.data === 'object'
    ? payload.data
    : payload;

  const history =
    candidate?.estados ||
    candidate?.movimientos ||
    candidate?.trazabilidad ||
    candidate?.historial ||
    candidate?.detalleEstados ||
    [];

  const latestItem = Array.isArray(history) && history.length > 0 ? history[history.length - 1] : null;

  const statusText =
    candidate?.estadoActual ||
    candidate?.estado ||
    candidate?.nombreEstado ||
    candidate?.descripcionEstado ||
    latestItem?.estado ||
    latestItem?.descripcion ||
    latestItem?.observacion ||
    '';

  const lastEvent =
    latestItem?.descripcion ||
    latestItem?.observacion ||
    latestItem?.estado ||
    statusText ||
    '';

  const lastLocation =
    latestItem?.ciudad ||
    latestItem?.ubicacion ||
    candidate?.ciudadDestino ||
    candidate?.ciudad ||
    '';

  return {
    shippingStatus: mapEstadoToShippingStatus(statusText || lastEvent),
    lastEvent: String(lastEvent || '').trim(),
    lastLocation: String(lastLocation || '').trim(),
    raw: payload
  };
}

export async function consultarGuiaInterrapidisimo(numeroGuia, altchaPayloadOverride = '') {
  const cleanGuia = String(numeroGuia || '').trim();
  const payload = String(
    altchaPayloadOverride || process.env.INTERRAPIDISIMO_ALTCHA_PAYLOAD || ''
  ).trim();

  if (!cleanGuia || !payload) {
    return { ok: false, reason: 'missing_guia_or_payload', shippingStatus: null, lastEvent: '' };
  }

  const url = new URL(CONSULTAR_GUIAS_URL);
  url.searchParams.set('NumerosGuias', cleanGuia);
  url.searchParams.set('altchaPayload', payload);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 7000);

  try {
    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: HEADERS,
      signal: controller.signal
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        reason: 'http_error',
        shippingStatus: null,
        lastEvent: ''
      };
    }

    const parsed = extractTrackingInfo(data);
    return {
      ok: true,
      status: res.status,
      shippingStatus: parsed.shippingStatus,
      lastEvent: parsed.lastEvent,
      lastLocation: parsed.lastLocation
    };
  } catch (err) {
    return {
      ok: false,
      reason: err?.name === 'AbortError' ? 'timeout' : 'network_error',
      shippingStatus: null,
      lastEvent: ''
    };
  } finally {
    clearTimeout(timer);
  }
}
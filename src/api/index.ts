export async function apiRequest(path: string, token: string | null = null, options: any = {}) {
  const { headers: customHeaders, ...fetchOptions } = options || {};
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
}
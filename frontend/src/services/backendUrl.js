export function getBackendBaseUrl(rawValue = import.meta.env.VITE_API_URL) {
  if (!rawValue) return 'http://localhost:9090';
  const trimmed = String(rawValue).trim().replace(/\/+$/, '');
  if (trimmed === '/api' || trimmed.endsWith('/api')) {
    return 'http://localhost:9090';
  }
  return trimmed;
}

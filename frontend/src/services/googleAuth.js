import { getBackendBaseUrl } from './backendUrl';

export function getGoogleLoginUrl() {
  const baseUrl = getBackendBaseUrl() || 'http://localhost:9090';
  return `${baseUrl}/api/auth/google`;
}

export function startGoogleLogin() {
  window.location.assign(getGoogleLoginUrl());
}

export function consumeGoogleAuthCallback() {
  const params = new URLSearchParams(window.location.search);
  const auth = params.get('auth');
  const token = params.get('token');
  const error = params.get('error');

  if (auth !== 'google' && !token && !error) {
    return { handled: false };
  }

  if (token) {
    localStorage.setItem('rumi_token', token);
  }

  const nextUrl = new URL(window.location.href);
  nextUrl.searchParams.delete('auth');
  nextUrl.searchParams.delete('token');
  nextUrl.searchParams.delete('error');
  window.history.replaceState({}, document.title, nextUrl.pathname + nextUrl.search + nextUrl.hash);

  if (error) {
    return { handled: true, error };
  }

  if (!token) {
    return { handled: true, error: 'missing_google_token' };
  }

  return { handled: true, token };
}

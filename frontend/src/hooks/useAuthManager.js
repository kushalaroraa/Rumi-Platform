import { useState } from 'react';
import { login, register, sendOtp, verifyOtp } from '../services/api';

export function useAuthManager() {
  const [mode, setMode] = useState('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // A generic error formatter
  const getFriendlyAuthError = (err, fallback) => {
    const isNetworkError =
      err?.code === 'ERR_NETWORK' ||
      err?.code === 'ECONNREFUSED' ||
      err?.message === 'Network Error' ||
      String(err?.message || '').toLowerCase().includes('network');

    if (isNetworkError) {
      return 'Cannot reach the backend. Check your network or backend server.';
    }
    return err?.response?.data?.message || err?.message || fallback;
  };

  const handleLogin = async () => {
    setError('');
    setSubmitting(true);
    try {
      const res = await login({ email: email.trim(), password });
      const token = res?.data?.token;
      const user = res?.data?.user;
      if (token) localStorage.setItem('rumi_token', token);
      if (user) localStorage.setItem('rumi_user', JSON.stringify(user));
      return { success: true, email: email.trim() };
    } catch (err) {
      setError(getFriendlyAuthError(err, 'Sign in failed.'));
      return { success: false };
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async () => {
    setError('');
    setSubmitting(true);
    try {
      if (!name?.trim() || name.trim().length < 3) {
        throw new Error('Name must be at least 3 characters.');
      }
      const res = await register({ name: name.trim(), email: email.trim(), password });
      if (!res?.data?.success) throw new Error(res?.data?.message || 'Failed to register.');
      
      const token = res?.data?.token;
      const user = res?.data?.user;
      if (token) localStorage.setItem('rumi_token', token);
      if (user) localStorage.setItem('rumi_user', JSON.stringify(user));
      
      return { success: true, email: email.trim() };
    } catch (err) {
      setError(getFriendlyAuthError(err, 'Sign up failed.'));
      return { success: false };
    } finally {
      setSubmitting(false);
    }
  };

  return {
    mode, setMode,
    email, setEmail,
    password, setPassword,
    name, setName,
    error, setError,
    submitting,
    handleLogin,
    handleRegister
  };
}

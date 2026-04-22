import { io } from 'socket.io-client';
import { API_BASE_URL } from './api';

let socket = null;

function getToken() {
  const token = localStorage.getItem('rumi_token');
  return token ? token.trim() : '';
}

export function getSocket() {
  const token = getToken();
  if (!token) return null;

  if (socket && socket.connected) return socket;

  if (!socket) {
    socket = io(API_BASE_URL || window.location.origin, {
      autoConnect: true,
      transports: ['websocket'],
      auth: { token },
    });
  } else {
    socket.auth = { token };
    socket.connect();
  }

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

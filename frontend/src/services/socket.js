import { io } from 'socket.io-client';
import { API_BASE_URL } from './api';

let socket = null;
let socketToken = '';

function getToken() {
  const token = localStorage.getItem('rumi_token');
  return token ? token.trim() : '';
}

export function getSocket() {
  const token = getToken();
  if (!token) return null;

  if (socket && socketToken && socketToken !== token) {
    socket.disconnect();
    socket = null;
    socketToken = '';
  }

  if (socket && socket.connected) return socket;

  if (!socket) {
    socketToken = token;
    socket = io(API_BASE_URL || window.location.origin, {
      autoConnect: true,
      transports: ['websocket'],
      auth: { token },
    });
  } else {
    socketToken = token;
    socket.auth = { token };
    socket.connect();
  }

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
    socketToken = '';
  }
}

import axios from 'axios';
export const API_BASE_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.startsWith('http')
    ? import.meta.env.VITE_API_URL
    : `${window.location.origin}${import.meta.env.VITE_API_URL}`
  : 'http://localhost:9090';
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});
api.interceptors.request.use(config => {
  const token = localStorage.getItem('rumi_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
export async function getMatches(params) {
  return api.get('/matches', {
    params
  });
}
export async function getReceivedRequests() {
  return api.get('/request/received');
}
export async function getReceivedAcceptedRequests() {
  return api.get('/request/received/accepted');
}
export async function getSentRequests() {
  return api.get('/request/sent');
}
export async function sendRequest(toUserId) {
  return api.post('/request/send', {
    toUserId
  });
}
export async function passRequest(toUserId) {
  return api.post('/request/pass', {
    toUserId
  });
}
export async function acceptRequest(data) {
  return api.post('/request/accept', data);
}
export async function rejectRequest(data) {
  return api.post('/request/reject', data);
}

// Auth
export async function register(data) {
  return api.post('/api/auth/register', data);
}
export async function login(data) {
  return api.post('/api/auth/login', data);
}
export async function sendOtp(data) {
  return api.post('/api/auth/otp/send', data);
}
export async function verifyOtp(data) {
  return api.post('/api/auth/otp/verify', data);
}
export async function getChatHistory(otherUserId) {
  return api.get('/chat/history', {
    params: {
      userId: otherUserId
    }
  });
}

// Assistant (Gemini RAG)
export async function sendRagMessage(payload) { //The payload contains the user query in the format { message: string }
  return api.post('/api/rag/chat', payload);
}

// Backwards-compatible alias for older callers
export async function sendAssistantMessage(payload) {
  return sendRagMessage(payload);
}

// Profile
export async function updateProfile(data) {
  return api.put('/user/profile', data);
}
export async function getProfile() {
  return api.get('/user/profile');
}
export async function uploadProfilePhoto(file) {
  const form = new FormData();
  form.append('photo', file);
  return api.post('/user/profile/photo', form, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

// Rooms (Offer a Room / Just Exploring)
export async function createRoom(form) {
  return api.post('/rooms', form, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}
export async function getRecommendedRooms(limit = 5) {
  return api.get('/rooms/recommended', {
    params: {
      limit
    }
  });
}

// --- Offer a Room (room owner dashboard) ---

export async function getMyRooms() {
  return api.get('/rooms/mine');
}
export async function updateRoomStatus(roomId, status) {
  return api.patch(`/rooms/${roomId}/status`, {
    status
  });
}
export async function updateRoom(roomId, form) {
  return api.put(`/rooms/${roomId}`, form, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}
export async function deleteRoom(roomId) {
  return api.delete(`/rooms/${roomId}`);
}
export async function incrementRoomView(roomId) {
  return api.post(`/rooms/${roomId}/view`);
}
export async function getRoomReceivedRequests(roomId) {
  return api.get('/request/received', {
    params: {
      roomId
    }
  });
}
export async function getRoomReceivedAcceptedRequests(roomId) {
  return api.get('/request/received/accepted', {
    params: {
      roomId
    }
  });
}
export async function getChatThreads(roomId) {
  return api.get('/chat/threads', {
    params: {
      roomId
    }
  });
}
export async function getChatHistoryWithRoom(otherUserId, roomId) {
  return api.get('/chat/history', {
    params: {
      userId: otherUserId,
      roomId
    }
  });
}
export async function getRoomSuggestions(roomId, limit = 10) {
  return api.get(`/rooms/${roomId}/suggestions`, {
    params: {
      limit
    }
  });
}

// Invite to Connect (room-scoped request)
export async function inviteToConnect(toUserId, roomId) {
  return api.post('/request/send', {
    toUserId,
    roomId
  });
}
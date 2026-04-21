import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, Edit, Home, MessageCircle, Plus, Search, Settings, LogOut, Users, Sparkles } from 'lucide-react';
import { API_BASE_URL, getChatHistoryWithRoom, getChatThreads, getMyRooms, getProfile, getRoomReceivedRequests, getRoomSuggestions, incrementRoomView, inviteToConnect, updateRoom, updateRoomStatus, createRoom, deleteRoom } from '../../services/api';
import { acceptRequest, rejectRequest } from '../../services/api';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { RoomFormModal } from './RoomFormModal';
import { ListingCard } from './ListingCard';
import { IncomingRequestCard } from './IncomingRequestCard';
import { ChatThreadCard } from './ChatThreadCard';
import { SuggestedMatchCard } from './SuggestedMatchCard';
import { Sidebar } from '../layout/Sidebar';
import RoomProfile from '../../pages/RoomProfile';
import SettingsPage from '../../pages/Settings';

export const OfferRoomDashboard = ({
  onLogout,
  userEmail,
  onEditProfile
}) => {
  const [activeNav, setActiveNav] = useState('dashboard');
  const [avatarSrc, setAvatarSrc] = useState('');
  const [intentLoading, setIntentLoading] = useState(true);
  const [loadingListings, setLoadingListings] = useState(false);
  const [listings, setListings] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [incomingLoading, setIncomingLoading] = useState(false);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [threadsLoading, setThreadsLoading] = useState(false);
  const [chatThreads, setChatThreads] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [actionSending, setActionSending] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [activeOtherUserId, setActiveOtherUserId] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [roomModalMode, setRoomModalMode] = useState('create');
  const [roomModalInitialRoom, setRoomModalInitialRoom] = useState(undefined);
  const requestsCardRef = useRef(null);
  const chatsCardRef = useRef(null);
  const normalizeImageUrl = src => {
    if (!src) return '';
    const str = String(src);
    if (str.startsWith('http://') || str.startsWith('https://')) return str;
    if (str.startsWith('/')) return `${API_BASE_URL}${str}`;
    return `${API_BASE_URL}/${str}`;
  };
  const selectedRoom = useMemo(() => {
    if (!selectedRoomId) return null;
    return listings.find(r => String(r._id) === String(selectedRoomId)) || null;
  }, [selectedRoomId, listings]);
  const loadAvatar = async () => {
    try {
      const res = await getProfile();
      const u = res?.data?.user;
      const src = u?.photo || u?.profilePicture;
      if (src) setAvatarSrc(normalizeImageUrl(src));
    } catch {
      // ignore
    }
  };
  const loadListings = async () => {
    setLoadingListings(true);
    try {
      const res = await getMyRooms();
      const rooms = res?.data?.rooms || [];
      setListings(rooms.map(r => ({
        ...r,
        coverUrl: normalizeImageUrl(r?.coverUrl || r?.photoUrls?.[0] || '')
      })));
      setSelectedRoomId(prev => {
        if (rooms.length === 0) return null;
        if (prev && rooms.some(x => String(x._id) === String(prev))) return prev;
        return String(rooms[0]?._id || '');
      });
    } finally {
      setLoadingListings(false);
    }
  };
  const loadRoomPanels = async roomId => {
    setIncomingLoading(true);
    setThreadsLoading(true);
    setSuggestionsLoading(true);
    try {
      // Track views when owner opens a room in the dashboard.
      await incrementRoomView(roomId).catch(() => { });
      const [reqRes, threadRes, suggRes] = await Promise.all([getRoomReceivedRequests(roomId), getChatThreads(roomId), getRoomSuggestions(roomId, 10)]);
      const reqs = reqRes?.data?.requests || [];
      setIncomingRequests(reqs.map(r => ({
        ...r,
        fromUserId: {
          ...(r.fromUserId || {}),
          image: normalizeImageUrl(r.fromUserId?.photo || r.fromUserId?.profilePicture || '') || r.fromUserId?.photo || r.fromUserId?.profilePicture || ''
        }
      })));
      const threads = threadRes?.data?.threads || [];
      setChatThreads(threads.map(t => ({
        ...t,
        image: normalizeImageUrl(t?.image || '')
      })));
      const suggestionsRes = suggRes?.data?.suggestions || [];
      setSuggestions(suggestionsRes.map(s => ({
        ...s,
        image: normalizeImageUrl(s?.image || '')
      })));
    } finally {
      setIncomingLoading(false);
      setThreadsLoading(false);
      setSuggestionsLoading(false);
    }
  };
  useEffect(() => {
    const run = async () => {
      setIntentLoading(true);
      await loadAvatar();
      // If user is not logged in, avoid crashes.
      const token = localStorage.getItem('rumi_token');
      if (!token) {
        setIntentLoading(false);
        return;
      }
      await loadListings();
      setIntentLoading(false);
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (!selectedRoomId) return;
    loadRoomPanels(String(selectedRoomId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRoomId]);
  const openChat = async otherUserId => {
    if (!selectedRoomId) return;
    setChatOpen(true);
    setActiveOtherUserId(otherUserId);
    setChatLoading(true);
    setChatMessages([]);
    try {
      const res = await getChatHistoryWithRoom(otherUserId, selectedRoomId);
      setChatMessages(res?.data?.messages || []);
      // Refresh unread counts after opening.
      await getChatThreads(selectedRoomId).then(r => setChatThreads(r?.data?.threads || []));
    } catch {
      setChatMessages([]);
    } finally {
      setChatLoading(false);
    }
  };
  const openCreateEditor = () => {
    setRoomModalMode('create');
    setRoomModalInitialRoom(undefined);
    setRoomModalOpen(true);
  };
  const openEditEditor = room => {
    setSelectedRoomId(room?._id ? String(room._id) : null);
    setRoomModalMode('edit');
    setRoomModalInitialRoom(room);
    setRoomModalOpen(true);
  };
  const reloadEverything = async () => {
    await loadListings();
  };
  const handleAcceptRequest = async requestId => {
    if (!selectedRoomId) return;
    setActionSending(true);
    try {
      await acceptRequest({
        requestId,
        roomId: selectedRoomId
      });
      await reloadEverything();
    } finally {
      setActionSending(false);
    }
  };
  const handleRejectRequest = async requestId => {
    if (!selectedRoomId) return;
    setActionSending(true);
    try {
      await rejectRequest({
        requestId,
        roomId: selectedRoomId
      });
      await reloadEverything();
    } finally {
      setActionSending(false);
    }
  };
  const handleTogglePause = async roomId => {
    setActionSending(true);
    try {
      const room = listings.find(r => String(r._id) === String(roomId));
      const current = room?.status || 'active';
      const next = current === 'active' ? 'paused' : 'active';
      await updateRoomStatus(roomId, next);
      await loadListings();
    } finally {
      setActionSending(false);
    }
  };
  const handleDeleteRoom = async roomId => {
    setActionSending(true);
    try {
      await deleteRoom(roomId);
      await loadListings();
    } finally {
      setActionSending(false);
    }
  };
  const quickActions = [{
    key: 'add',
    label: 'Add New Listing',
    icon: Plus,
    onClick: () => {
      openCreateEditor();
    }
  }, {
    key: 'edit',
    label: 'Edit Listing',
    icon: Edit,
    onClick: () => {
      if (!selectedRoomId) return;
      const room = listings.find(r => String(r._id) === String(selectedRoomId));
      if (!room) return;
      openEditEditor(room);
    },
    disabled: !selectedRoomId
  }, {
    key: 'view-requests',
    label: 'View Requests',
    icon: Users,
    onClick: () => {
      requestsCardRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, {
    key: 'open-messages',
    label: 'Open Messages',
    icon: MessageCircle,
    onClick: () => {
      if (chatThreads.length > 0) openChat(String(chatThreads[0].otherUserId)); else chatsCardRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }];
  if (intentLoading) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-gray-500">Loading dashboard...</div>
    </div>;
  }
  const ownerNavItems = [
    { id: 'dashboard', label: 'Discover Matches', icon: Home },
    {
      id: 'listings',
      label: 'My Listings',
      customIcon: (isActive) => (
        <span className={`w-5 h-5 rounded flex items-center justify-center font-semibold ${isActive ? 'bg-white text-blue-600' : 'bg-blue-50 text-blue-600'
          }`}>
          +
        </span>
      )
    },
    { id: 'requests', label: 'Requests', icon: Users },
    { id: 'messages', label: 'Messages', icon: MessageCircle },
    {
      id: 'profile',
      label: 'Profile',
      customIcon: (isActive) => (
        <span className={`w-5 h-5 rounded flex items-center justify-center font-semibold ${isActive ? 'bg-white text-blue-600' : 'bg-gray-100 text-gray-600'
          }`}>
          P
        </span>
      )
    },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return <div className="min-h-screen bg-gray-100 flex h-screen overflow-hidden">
    <Sidebar
      items={ownerNavItems}
      activeNav={activeNav}
      onNavChange={setActiveNav}
      onLogout={onLogout}
      aiCard={{
        title: 'AI in action',
        desc: 'Get better flatmate matches by improving your listing.',
        icon: Sparkles
      }}
    />

    {/* Main */}
    <main className="flex-1 overflow-auto">
      <header className="bg-white shadow-sm px-8 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search listings, requests, messages" className="pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-80" />
            </div>

            <button className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-10 h-10 rounded-full overflow-hidden focus:outline-none">
                  <img src={avatarSrc || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80'} alt="Profile" className="w-full h-full object-cover" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 bg-white text-gray-900 border border-gray-200 rounded-xl shadow-lg p-1 z-[100]">
                <DropdownMenuLabel className="flex flex-col gap-1">
                  <span className="text-sm font-semibold text-gray-900">Account</span>
                  <span className="text-xs text-gray-500 truncate">{userEmail || 'Signed in'}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => onEditProfile?.()} className="gap-2">
                  <span className="text-sm">Edit Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setActiveNav('settings')} className="gap-2">
                  <Settings size={16} /> Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={onLogout} className="gap-2 text-red-600">
                  <LogOut size={16} /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="p-8">
        {activeNav === 'profile' && <RoomProfile />}
        {activeNav === 'settings' && <SettingsPage />}

        {(activeNav === 'dashboard' || activeNav === 'listings' || activeNav === 'requests' || activeNav === 'messages') && <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-8 shadow-sm">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-1">My Listings</h2>
                <p className="text-gray-500">Manage your rooms, respond to requests, and track performance.</p>
              </div>

              {selectedRoom && <div className="mb-6 border border-gray-100 rounded-3xl overflow-hidden bg-gray-50">
                <div className="p-5 flex flex-col md:flex-row gap-4 items-start">
                  <div className="w-full md:w-48 md:flex-shrink-0">
                    <div className="h-28 md:h-32 bg-slate-100 rounded-2xl overflow-hidden">
                      <img src={selectedRoom.coverUrl || selectedRoom.photoUrls?.[0] || 'https://images.unsplash.com/photo-1496307653780-42ee777d4833?w=400&h=240&fit=crop'} alt="Listing cover" className="w-full h-full object-cover" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {selectedRoom.propertyType || 'Room'}{' '}
                          {selectedRoom.roomType ? `- ${selectedRoom.roomType}` : ''}
                        </p>
                        <p className="text-xs text-gray-500 truncate mt-1">
                          {selectedRoom.location?.area || selectedRoom.location?.city || selectedRoom.location?.address || 'Location'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">₹{selectedRoom.monthlyRent ?? 0}</p>
                        <p className="text-xs text-gray-500">/ month</p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-xs text-gray-500 mb-2">Description</p>
                      {selectedRoom.roomDescription ? <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {selectedRoom.roomDescription}
                      </p> : <p className="text-sm text-gray-500">No description added yet.</p>}
                    </div>
                  </div>
                </div>
              </div>}

              {loadingListings ? <div className="text-center text-gray-400 py-10">
                <Users size={56} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg">Loading listings...</p>
              </div> : listings.length === 0 ? <div className="text-center border border-gray-100 rounded-3xl p-10 bg-gray-50">
                <p className="text-gray-700 font-semibold">You haven’t listed a room yet. Add your first listing.</p>
                <button type="button" onClick={() => {
                  openCreateEditor();
                }} className="mt-6 w-full md:w-auto px-6 py-3 bg-[#081A35] text-white rounded-xl font-semibold hover:bg-[#081A35]/90 transition-all shadow-lg shadow-blue-900/10">
                  Add New Listing
                </button>
              </div> : <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {listings.map(room => <ListingCard key={room._id} room={room} selected={String(room._id) === String(selectedRoomId)} onSelect={() => {
                  setSelectedRoomId(String(room._id));
                }} onEdit={() => {
                  openEditEditor(room);
                }} onTogglePause={() => handleTogglePause(String(room._id))} onDelete={() => handleDeleteRoom(String(room._id))} />)}
              </div>}
            </div>
          </div>

          <div className="space-y-6">
            {/* Incoming Requests */}
            <div ref={requestsCardRef} className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Users size={20} className="text-blue-600" />
                  Incoming Requests
                </h3>
                {selectedRoomId && <span className="text-xs text-gray-500">
                  For <span className="font-semibold">{selectedRoom?.propertyType || 'Room'}</span>
                </span>}
              </div>

              {!selectedRoomId ? <div className="text-sm text-gray-500">Select a listing to see requests.</div> : incomingLoading ? <div className="text-sm text-gray-500">Loading requests...</div> : incomingRequests.length === 0 ? <div className="text-sm text-gray-600 bg-gray-50 border border-gray-100 rounded-2xl p-4">
                No requests yet. Improve your listing to attract users.
              </div> : <div className="space-y-4">
                {incomingRequests.map(request => <IncomingRequestCard key={request._id} request={request} onAccept={() => handleAcceptRequest(String(request._id))} onReject={() => handleRejectRequest(String(request._id))} />)}
              </div>}
            </div>

            {/* Active Chats */}
            <div ref={chatsCardRef} className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MessageCircle size={20} className="text-blue-600" />
                Active Chats
              </h3>

              {!selectedRoomId ? <div className="text-sm text-gray-500">Select a listing to see active chats.</div> : threadsLoading ? <div className="text-sm text-gray-500">Loading chats...</div> : chatThreads.length === 0 ? <div className="text-sm text-gray-600 bg-gray-50 border border-gray-100 rounded-2xl p-4">
                No active chats yet.
              </div> : <div className="space-y-4">
                {chatThreads.map(thread => <ChatThreadCard key={thread.otherUserId} thread={thread} onOpen={() => openChat(String(thread.otherUserId))} />)}
              </div>}
            </div>

            {/* Listing Performance */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Listing Performance</h3>

              {!selectedRoom ? <div className="text-sm text-gray-500">Select a listing to see metrics.</div> : <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500">Total views</p>
                  <p className="text-2xl font-bold text-gray-900">{selectedRoom.viewsCount ?? 0}</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500">Total requests</p>
                  <p className="text-2xl font-bold text-gray-900">{selectedRoom.totalRequests ?? 0}</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-xl">
                  <p className="text-xs text-blue-700">Acceptance rate</p>
                  <p className="text-2xl font-bold text-blue-800">{selectedRoom.acceptanceRate ?? 0}%</p>
                </div>
                <div className="text-center p-3 bg-emerald-50 rounded-xl">
                  <p className="text-xs text-emerald-700">Avg compatibility</p>
                  <p className="text-2xl font-bold text-emerald-800">{selectedRoom.avgCompatibilityScore ?? 0}%</p>
                </div>
              </div>}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                {quickActions.map(a => {
                  const Icon = a.icon;
                  return <button key={a.key} type="button" onClick={a.onClick} disabled={Boolean(a.disabled) || actionSending} className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                      <Icon size={20} />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{a.label}</span>
                  </button>;
                })}
              </div>
            </div>

            {/* Suggested Matches */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Suggested Matches</h3>

              {!selectedRoomId ? <div className="text-sm text-gray-500">Select a listing to see matches.</div> : suggestionsLoading ? <div className="text-sm text-gray-500">Loading suggestions...</div> : suggestions.length === 0 ? <div className="text-sm text-gray-600 bg-gray-50 border border-gray-100 rounded-2xl p-4">
                No suggested matches right now.
              </div> : <div className="space-y-4">
                {suggestions.map(s => <SuggestedMatchCard key={s.userId} suggestion={s} onInvite={() => {
                  if (!selectedRoomId) return;
                  inviteToConnect(s.userId, selectedRoomId).then(async () => {
                    await reloadEverything();
                  }).catch(() => { });
                }} />)}
              </div>}
            </div>
          </div>
        </div>}
      </div>
    </main>

    {/* Room create/edit modal */}
    <RoomFormModal mode={roomModalMode} open={roomModalOpen} variant="page" initialRoom={roomModalMode === 'edit' ? roomModalInitialRoom : undefined} onClose={() => setRoomModalOpen(false)} onSave={async form => {
      if (roomModalMode === 'create') {
        await createRoom(form);
      } else if (roomModalInitialRoom?._id) {
        await updateRoom(String(roomModalInitialRoom._id), form);
      }
      await reloadEverything();
    }} />

    {/* Chat modal */}
    {chatOpen && selectedRoomId && activeOtherUserId && <div className="fixed inset-0 z-[300] bg-black/50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Chat with {chatThreads.find(t => String(t.otherUserId) === String(activeOtherUserId))?.name || 'User'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">Room chat</p>
          </div>
          <button type="button" onClick={() => {
            setChatOpen(false);
            setChatMessages([]);
            setActiveOtherUserId(null);
          }} className="w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center">
            <span className="text-gray-600">×</span>
          </button>
        </div>

        <div className="p-6 max-h-[60vh] overflow-auto space-y-3">
          {chatLoading ? <div className="text-sm text-gray-500">Loading messages...</div> : chatMessages.length === 0 ? <div className="text-sm text-gray-500">No messages yet.</div> : chatMessages.map(m => <div key={m._id} className={`flex ${m.isOwn ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${m.isOwn ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
              <div className="font-medium mb-1 text-xs opacity-90">
                {m.isOwn ? 'You' : m.senderId?.name || 'User'}
              </div>
              <div className="whitespace-pre-wrap">{m.message}</div>
            </div>
          </div>)}
        </div>

        <div className="p-6 border-t border-gray-100">
          <input disabled value="Message sending is not enabled in this build." className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-500" />
        </div>
      </div>
    </div>}
  </div>;
};
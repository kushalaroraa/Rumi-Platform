import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Home, Search, Heart, MessageCircle, User, Settings, LogOut, Bell, Users, DollarSign, Sparkles, BarChart3, Target, X, Edit, Send, Clock, Check, XCircle, Inbox } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '../ui/dropdown-menu';
import { getMatches, getReceivedRequests, getReceivedAcceptedRequests, getSentRequests, sendRequest, passRequest, acceptRequest, rejectRequest, getChatHistory, getProfile, getRecommendedRooms, normalizeImageUrl } from '../../services/api';
import { API_BASE_URL } from '../../services/api';
import { RecommendedRoomsSection } from '../explore/RecommendedRoomsSection';
import { RoomDetailsModal } from '../explore/RoomDetailsModal';
import { OfferRoomDashboard } from '../offer/OfferRoomDashboard';
import { Sidebar } from '../layout/Sidebar';
import UserProfile from '../../pages/UserProfile';
import SettingsPage from '../../pages/Settings';
import ChatPage from '../../pages/ChatPage';
import { Avatar } from '../common/Avatar';

export const Dashboard = ({
  onLogout,
  userEmail,
  onEditProfile
}) => {
  const [activeNav, setActiveNav] = useState('dashboard');
  const [selectedMonth, setSelectedMonth] = useState('August 2025');
  const [showLoginNotice, setShowLoginNotice] = useState(false);
  const [renderOfferDashboard, setRenderOfferDashboard] = useState(false);
  const [intentResolved, setIntentResolved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [swipeCards, setSwipeCards] = useState([]);
  const [requestsReceived, setRequestsReceived] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [activeMatches, setActiveMatches] = useState([]);
  const [sending, setSending] = useState(false);
  const [chatWithUserId, setChatWithUserId] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [avatarSrc, setAvatarSrc] = useState('');
  const [isExploreLocked, setIsExploreLocked] = useState(false);
  const [recommendedRooms, setRecommendedRooms] = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [revealExploreMatches, setRevealExploreMatches] = useState(false);
  const [showExploreProfileModal, setShowExploreProfileModal] = useState(false);
  const scrollTriggerCountRef = useRef(0);
  const explorePromptShownRef = useRef(false);
  const [roomDetailsOpen, setRoomDetailsOpen] = useState(false);
  const [roomDetailsRoom, setRoomDetailsRoom] = useState(null);
    const getCurrentUserId = () => {
      try {
        const raw = localStorage.getItem('rumi_user');
        return raw ? String(JSON.parse(raw)?._id || '') : '';
      } catch {
        return '';
      }
    };
    const resolveChatTarget = (candidate) => {
      const target = candidate ? String(candidate) : '';
      const meId = getCurrentUserId();
      if (!target || target === meId) return null;
      return target;
    };
  
  // Swipe & Animation state
  const [isLocked, setIsLocked] = useState(false);
  const [animatingId, setAnimatingId] = useState(null);
  const [swipeDirection, setSwipeDirection] = useState(null);

  const avgMatchScore = useMemo(() => {
    if (!swipeCards.length) return 0;
    const total = swipeCards.reduce((s, c) => s + (Number(c.match) || 0), 0);
    return Math.round(total / swipeCards.length);
  }, [swipeCards]);
  const nearbyMatchesCount = swipeCards.length;
  const lifestyleMatchScore = avgMatchScore;
  const notifications = useMemo(() => {
    const items = [];

    for (const req of requestsReceived) {
      items.push({
        id: `received-${req.id}`,
        title: 'New request received',
        subtitle: `${req.name} sent you a request`,
        type: 'request',
      });
    }

    for (const req of sentRequests) {
      items.push({
        id: `sent-${req.id}`,
        title: `Request ${req.status}`,
        subtitle: `${req.name} • ${req.status}`,
        type: 'sent',
      });
    }

    for (const match of activeMatches) {
      items.push({
        id: `match-${match.id}`,
        title: 'New active match',
        subtitle: `${match.name} is now an active match`,
        type: 'match',
      });
    }

    return items.slice(0, 30);
  }, [requestsReceived, sentRequests, activeMatches]);
  useEffect(() => {
    if (userEmail) {
      setShowLoginNotice(true);
      const t = window.setTimeout(() => setShowLoginNotice(false), 4000);
      return () => window.clearTimeout(t);
    }
  }, [userEmail]);
  const budgetToDisplay = budgetRange => {
    const minV = budgetRange?.min ?? 0;
    const thousand = Math.round(minV / 1000);
    return thousand;
  };
  const deriveTags = (u, reasons = []) => {
    const prefs = u?.lifestylePreferences || {};
    const tags = [];
    if (prefs.cleanlinessLevel === 'high') tags.push('Clean & Tidy');
    if (prefs.cleanlinessLevel === 'medium') tags.push('Moderate');
    if (prefs.cleanlinessLevel === 'low') tags.push('Relaxed');
    if (prefs.sleepSchedule === 'early_sleeper') tags.push('Early Riser');
    if (prefs.sleepSchedule === 'night_owl') tags.push('Night Owl');
    if (prefs.smoking === 'no') tags.push('Non-Smoker');
    if (prefs.smoking === 'yes') tags.push('Smoker');

    // Keep the card clean: only show a few tags.
    const reasonTags = (reasons || []).slice(0, 2);
    return [...tags, ...reasonTags].filter(Boolean).slice(0, 4);
  };
  const reloadDashboard = async () => {
    const token = localStorage.getItem('rumi_token');
    if (!token) {
      setSwipeCards([]);
      setRequestsReceived([]);
      setSentRequests([]);
      setActiveMatches([]);
      return;
    }
    setLoading(true);
    try {
      // Use individual try-catch or settled promises to prevent one failure from breaking everything
      const matchesPromise = getMatches({ limit: 20 }).catch(e => {
        console.error('getMatches error', e);
        return { data: { matches: [] } };
      });
      const receivedPromise = getReceivedRequests().catch(e => {
        console.error('getReceivedRequests error', e);
        return { data: { requests: [] } };
      });
      const sentPromise = getSentRequests().catch(e => {
        console.error('getSentRequests error', e);
        return { data: { requests: [] } };
      });
      const receivedAcceptedPromise = getReceivedAcceptedRequests().catch(e => {
        console.error('getReceivedAcceptedRequests error', e);
        return { data: { requests: [] } };
      });

      const [matchesRes, receivedRes, sentRes, receivedAcceptedRes] = await Promise.all([
        matchesPromise,
        receivedPromise,
        sentPromise,
        receivedAcceptedPromise
      ]);

      const matches = matchesRes?.data?.matches || [];
      const received = receivedRes?.data?.requests || [];
      const sent = sentRes?.data?.requests || [];
      const receivedAccepted = receivedAcceptedRes?.data?.requests || [];

      const mappedSwipe = matches.map(m => {
        const u = m.user || m;
        const budgetDisplay = budgetToDisplay(u?.budgetRange);
        const rawImg = u?.photo || u?.profilePicture;
        const baseTags = deriveTags(u, m.reasons || []);
        const hasRoom = u?.intent === 'offer';
        const tags = hasRoom ? ['Has a room', ...baseTags].slice(0, 4) : baseTags;
        return {
          id: u._id,
          userId: u._id,
          name: u.name,
          age: u.age ?? '',
          image: rawImg ? normalizeImageUrl(rawImg) : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
          match: m.matchScore ?? m.compatibility ?? 0,
          bio: u.bio || '',
          tags,
          hasRoom,
          budget: budgetDisplay
        };
      });

      const mappedReceived = received.map(r => {
        const u = r.fromUserId || {};
        return {
          id: r._id,
          name: u.name,
          age: u.age ?? '',
          image: normalizeImageUrl(u.photo || u.profilePicture),
          match: r.matchScore ?? r.match ?? 0,
          userId: u._id,
          requestId: r._id
        };
      });

      const mappedSent = sent.map(r => {
        const u = r.toUserId || {};
        return {
          id: r._id,
          name: u.name,
          age: u.age ?? '',
          image: normalizeImageUrl(u.photo || u.profilePicture),
          match: r.matchScore ?? r.match ?? 0,
          status: r.status,
          userId: u._id,
          requestId: r._id
        };
      });

      const activeMap = new Map();
      mappedSent.filter(r => r.status === 'accepted').forEach(r => activeMap.set(r.userId, r));
      receivedAccepted.forEach(r => {
        const u = r.fromUserId || {};
        activeMap.set(u._id, {
          id: r._id,
          name: u.name,
          match: r.matchScore ?? r.match ?? 0,
          image: normalizeImageUrl(u.photo || u.profilePicture),
          userId: u._id
        });
      });

      setSwipeCards(mappedSwipe);
      setRequestsReceived(mappedReceived);
      setSentRequests(mappedSent);
      setActiveMatches(Array.from(activeMap.values()));
    } catch (e) {
      console.error('reloadDashboard critical error', e);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const run = async () => {
      const token = localStorage.getItem('rumi_token');
      if (!token) {
        setIntentResolved(true);
        return;
      }
      try {
        const res = await getProfile();
        const u = res?.data?.user;
        if (u?.intent === 'offer') {
          setRenderOfferDashboard(true);
          setIntentResolved(true);
          return;
        }
        const exploreLocked = u?.intent === 'explore' && !u?.profileCompleted;
        setIsExploreLocked(Boolean(exploreLocked));
        setRoomsLoading(true);
        try {
          const roomsRes = await getRecommendedRooms(30);
          setRecommendedRooms(roomsRes?.data?.rooms || []);
        } finally {
          setRoomsLoading(false);
        }
        if (exploreLocked) {
          setSwipeCards([]);
          setRequestsReceived([]);
          setSentRequests([]);
          setActiveMatches([]);
        } else {
          reloadDashboard();
        }
        setIntentResolved(true);
      } catch {
        reloadDashboard();
        setIntentResolved(true);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // In "Just Exploring" mode we start with room recommendations only.
  // After a few scrolls, we reveal matching profiles and show a full-screen lock prompt.
  useEffect(() => {
    if (!isExploreLocked) {
      scrollTriggerCountRef.current = 0;
      explorePromptShownRef.current = false;
      setRevealExploreMatches(false);
      setShowExploreProfileModal(false);
      return;
    }
    const onScroll = () => {
      if (explorePromptShownRef.current) return;
      scrollTriggerCountRef.current += 1;

      // "After a few scrolls"
      if (scrollTriggerCountRef.current >= 4) {
        explorePromptShownRef.current = true;
        setRevealExploreMatches(true);
        setShowExploreProfileModal(true);
        reloadDashboard();
      }
    };
    window.addEventListener('scroll', onScroll, {
      passive: true
    });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isExploreLocked]);
  useEffect(() => {
    // Load user avatar from localStorage so navbar matches the logged-in account.
    try {
      const raw = localStorage.getItem('rumi_user');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const src = parsed?.photo || parsed?.profilePicture || '';
      if (src) setAvatarSrc(normalizeImageUrl(src));
    } catch {
      // ignore
    }
  }, [userEmail]);
  useEffect(() => {
    // Prefer the real profile from backend so avatar updates after photo upload.
    const run = async () => {
      try {
        const res = await getProfile();
        const u = res?.data?.user;
        const src = u?.photo || u?.profilePicture;
        if (src) setAvatarSrc(normalizeImageUrl(src));
      } catch {
        // ignore (profile may not be ready, or token missing)
      }
    };
    if (localStorage.getItem('rumi_token')) run();
  }, []);
  useEffect(() => {
    if (activeNav !== 'messages') return;
    if (!chatWithUserId) return;
    const run = async () => {
      setChatLoading(true);
      try {
        const res = await getChatHistory(chatWithUserId);
        setChatMessages(res?.data?.messages || []);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('getChatHistory error', e);
        setChatMessages([]);
      } finally {
        setChatLoading(false);
      }
    };
    run();
  }, [activeNav, chatWithUserId]);
  const handleSwipe = async direction => {
    const top = swipeCards[0];
    if (!top || isLocked) return;

    // 1. Lock and trigger animation immediately
    setIsLocked(true);
    setAnimatingId(top.id);
    setSwipeDirection(direction);

    // 2. Start backend sync independently
    try {
      if (direction === 'left') {
        passRequest(top.userId).catch(e => console.error('passRequest error', e));
      } else {
        const linkedRoom = top.hasRoom
          ? (recommendedRooms || []).find(r => String(r?.ownerUserId) === String(top.userId))
          : null;
        const roomId = linkedRoom?._id || null;
        sendRequest(top.userId, roomId).catch(e => console.error('sendRequest error', e));
      }
    } catch (e) {
      console.error('handleSwipe backend start error', e);
    }

    // 3. Wait for animation to finish before updating state
    setTimeout(() => {
      setSwipeCards(prev => prev.filter(c => c.id !== top.id));
      // Reset animation keys
      setAnimatingId(null);
      setSwipeDirection(null);
      setIsLocked(false);
      
      // Optional: background re-sync
      reloadDashboard();
    }, 300); // matches duration: 0.3
  };
  const quickActions = [{
    icon: MessageCircle,
    label: 'View Messages',
    color: 'blue',
    onClick: () => setActiveNav('messages')
  }, {
    icon: Edit,
    label: 'Edit Preferences',
    color: 'purple',
    onClick: () => onEditProfile?.()
  }, {
    icon: User,
    label: 'Complete Profile',
    color: 'green',
    onClick: () => setActiveNav('profile')
  }];
  if (!intentResolved) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-gray-500">Loading dashboard...</div>
    </div>;
  }
  if (renderOfferDashboard) {
    return <OfferRoomDashboard onLogout={onLogout} userEmail={userEmail} onEditProfile={onEditProfile} />;
  }
  const seekerNavItems = [
    { id: 'dashboard', label: 'Discover Matches', icon: Home },
    { id: 'requests', label: 'Requests', icon: Inbox },
    { id: 'messages', label: 'Messages', icon: MessageCircle },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const pageTitle = activeNav === 'dashboard'
    ? 'Dashboard'
    : activeNav === 'requests'
      ? 'Requests'
      : activeNav === 'messages'
        ? 'Messages'
        : activeNav === 'notifications'
          ? 'Notifications'
          : activeNav === 'profile'
            ? 'Profile'
            : 'Settings';

  const showDashboardWidgets = activeNav === 'dashboard';

  return <div className="min-h-screen bg-gray-100 flex h-screen overflow-hidden">
    <Sidebar
      items={seekerNavItems}
      activeNav={activeNav}
      onNavChange={setActiveNav}
      onLogout={onLogout}
    />

    {/* Main Content */}
    <main className="flex-1 overflow-auto">
      {/* Top Navigation Bar */}
      <header className="bg-white shadow-sm px-8 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">{pageTitle}</h1>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search matches, locations, preferences" className="pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-80" />
            </div>

            {/* Icons */}
            <button type="button" onClick={() => setActiveNav('notifications')} className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-10 h-10 rounded-full overflow-hidden focus:outline-none">
                  <Avatar src={avatarSrc} alt="Profile" className="w-full h-full" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 bg-white text-gray-900 border border-gray-200 rounded-xl shadow-lg p-1 z-[100]">
                <DropdownMenuLabel className="flex flex-col gap-1">
                  <span className="text-sm font-semibold text-gray-900">Account</span>
                  <span className="text-xs text-gray-500 truncate">
                    {userEmail || 'Signed in'}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => onEditProfile?.()} className="gap-2">
                  <User size={16} /> Edit Profile
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

      {/* Dashboard Content */}
      <div className="p-8">
        {showLoginNotice && userEmail && <div className="mb-6 rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3 text-emerald-800 text-sm">
          Logged in as <span className="font-semibold">{userEmail}</span>
        </div>}
        {activeNav === 'messages' ? <div className="w-full">
          <ChatPage initialOtherUserId={chatWithUserId} />
        </div> : <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column - Content switching (2/3 width) */}
          <div className="lg:col-span-2">
            {activeNav === 'profile' && <UserProfile />}
            {activeNav === 'settings' && <SettingsPage />}

            {activeNav === 'requests' && <div className="bg-white rounded-3xl p-8 shadow-sm space-y-8">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-1">Requests</h2>
                <p className="text-gray-500">Review incoming and sent requests.</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Incoming Requests</h3>
                <div className="space-y-4">
                  {requestsReceived.length === 0 ? <p className="text-sm text-gray-500">No incoming requests.</p> : requestsReceived.map(request => <div key={request.id} className="flex items-center justify-between gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar src={request.image} alt={request.name} className="w-12 h-12 rounded-full" />
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">{request.name}, {request.age}</p>
                        <p className="text-xs text-emerald-600 font-medium">{request.match}% Match</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={async () => {
                        try {
                          setSending(true);
                          await acceptRequest({ requestId: request.requestId });
                          await reloadDashboard();
                          setChatWithUserId(request.userId);
                          setActiveNav('messages');
                        } finally {
                          setSending(false);
                        }
                      }} disabled={sending} className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                        Accept
                      </button>
                      <button type="button" onClick={async () => {
                        try {
                          setSending(true);
                          await rejectRequest({ requestId: request.requestId });
                          await reloadDashboard();
                        } finally {
                          setSending(false);
                        }
                      }} disabled={sending} className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 disabled:opacity-50">
                        Reject
                      </button>
                    </div>
                  </div>)}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Sent Requests</h3>
                <div className="space-y-3">
                  {sentRequests.length === 0 ? <p className="text-sm text-gray-500">No sent requests yet.</p> : sentRequests.map(request => <div key={request.id} className="flex items-center justify-between gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar src={request.image} alt={request.name} className="w-10 h-10 rounded-full" />
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">{request.name}, {request.age}</p>
                        <p className="text-xs text-gray-500">{request.match}% Match</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${request.status === 'pending' ? 'bg-yellow-50 text-yellow-600' : request.status === 'accepted' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </div>)}
                </div>
              </div>
            </div>}

            {activeNav === 'notifications' && <div className="bg-white rounded-3xl p-8 shadow-sm">
              <h2 className="text-2xl font-semibold text-gray-900 mb-1">Notifications</h2>
              <p className="text-gray-500 mb-6">Recent activity from your account.</p>
              <div className="space-y-3">
                {notifications.length === 0 ? <p className="text-sm text-gray-500">No notifications yet.</p> : notifications.map((n) => <div key={n.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50">
                  <p className="text-sm font-semibold text-gray-900">{n.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{n.subtitle}</p>
                </div>)}
              </div>
            </div>}

            {activeNav === 'dashboard' && <div className="bg-white rounded-3xl p-8 shadow-sm">
              <div className="mb-6">
                {isExploreLocked && !revealExploreMatches ? <>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-1">
                    Here are rooms you might like
                  </h2>
                  <p className="text-gray-500">
                    Complete your profile to unlock matching.
                  </p>
                </> : <>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-1">Discover Matches</h2>
                  <p className="text-gray-500">Swipe right to connect, left to pass.</p>
                </>}
              </div>

              {/* Swipe Card Stack */}
              {(!isExploreLocked || revealExploreMatches) && <div className="relative h-[600px] flex items-center justify-center">
                <AnimatePresence>
                  {loading ? <div className="text-center text-gray-400">
                    <Users size={64} className="mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Loading matches…</p>
                  </div> : swipeCards.length > 0 ? swipeCards.map((card, index) => index < 3 && <motion.div key={card.id} className="absolute w-full max-w-md" style={{
                    zIndex: swipeCards.length - index
                  }} initial={index === 0 ? {
                    scale: 1,
                    y: 0,
                    opacity: 1
                  } : {
                    scale: 0.95 - index * 0.05,
                    y: index * 10,
                    opacity: 1 - index * 0.3
                  }} animate={{
                    scale: 1 - index * 0.05,
                    y: index * 10,
                    opacity: 1 - index * 0.3
                  }} exit={animatingId === card.id ? {
                    x: swipeDirection === 'left' ? -1000 : 1000,
                    opacity: 0,
                    rotate: swipeDirection === 'left' ? -20 : 20
                  } : {
                    opacity: 0,
                    scale: 0.9 // Subtle fade-out for non-swiped cards during reload
                  }} transition={{
                    duration: 0.3
                  }}>
                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                      {/* Profile Image */}
                      <div className="relative h-80">
                        <Avatar src={card.image} alt={card.name} className="w-full h-full" />
                        {/* Match Badge */}
                        <div className="absolute top-4 right-4 bg-emerald-500 text-white px-4 py-2 rounded-full font-semibold text-sm shadow-lg">
                          {card.match}% Match
                        </div>
                      </div>

                      {/* Profile Details */}
                      <div className="p-6">
                        <h3 className="text-2xl font-semibold text-gray-900 mb-1">
                          {card.name}, {card.age}
                        </h3>
                        <p className="text-gray-600 mb-4 leading-relaxed">
                          {card.bio}
                        </p>

                        {/* Lifestyle Tags */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {card.tags.map((tag, i) => <span key={i} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium">
                            {tag}
                          </span>)}
                        </div>

                        {/* Budget */}
                        <div className="flex items-center gap-2 text-gray-700">
                          <DollarSign size={20} className="text-blue-600" />
                          <span className="font-semibold">Budget: ₹{card.budget}k/month</span>
                        </div>

                        {/* Offerer room details */}
                        {card.hasRoom && (() => {
                          const offerRoom = recommendedRooms?.find(r => String(r?.ownerUserId) === String(card.userId)) || null;
                          if (!offerRoom) return null;
                          return <button type="button" onClick={e => {
                            e.stopPropagation();
                            setRoomDetailsRoom(offerRoom);
                            setRoomDetailsOpen(true);
                          }} className="mt-4 w-full px-3 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
                            View room details
                          </button>;
                        })()}
                      </div>
                    </div>
                  </motion.div>) : <div className="text-center text-gray-400">
                    <Users size={64} className="mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No more profiles to show</p>
                    <p className="text-sm">Check back later for new matches!</p>
                  </div>}
                </AnimatePresence>
              </div>}

              {/* Action Buttons */}
              {(!isExploreLocked || revealExploreMatches) && !showExploreProfileModal && swipeCards.length > 0 && <div className="flex items-center justify-center gap-6 mt-8">
                <button onClick={() => handleSwipe('left')} disabled={isLocked || loading} className="w-16 h-16 bg-red-50 hover:bg-red-100 rounded-full flex items-center justify-center text-red-500 transition-all hover:scale-110 shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
                  <X size={32} strokeWidth={2.5} />
                </button>
                <button onClick={() => handleSwipe('right')} disabled={isLocked || loading} className="w-16 h-16 bg-emerald-50 hover:bg-emerald-100 rounded-full flex items-center justify-center text-emerald-500 transition-all hover:scale-110 shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
                  <Heart size={32} strokeWidth={2.5} />
                </button>
              </div>}

              {/* Recommended Rooms */}
              <RecommendedRoomsSection rooms={recommendedRooms} loading={roomsLoading} title="Recommended Rooms" />
            </div>}
          </div>

          {/* Right Column - Side Widgets */}
          <div className="space-y-6">
            {/* Requests Received */}
            {showDashboardWidgets && <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Heart size={20} className="text-blue-600" />
                Requests Received
              </h3>
              <div className="space-y-4">
                {requestsReceived.map(request => <div key={request.id} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar src={request.image} alt={request.name} className="w-12 h-12 rounded-full" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">
                        {request.name}, {request.age}
                      </p>
                      <p className="text-xs text-emerald-600 font-medium">
                        {request.match}% Match
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={async () => {
                      try {
                        setSending(true);
                        await acceptRequest({
                          requestId: request.requestId
                        });
                        await reloadDashboard();
                      } finally {
                        setSending(false);
                      }
                    }} disabled={sending} className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
                      Accept & Chat
                    </button>
                    <button type="button" onClick={async () => {
                      try {
                        setSending(true);
                        await rejectRequest({
                          requestId: request.requestId
                        });
                        await reloadDashboard();
                      } finally {
                        setSending(false);
                      }
                    }} disabled={sending} className="flex-1 px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50">
                      Reject
                    </button>
                  </div>
                </div>)}
              </div>
            </div>}

            {/* Sent Requests */}
            {showDashboardWidgets && <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Send size={20} className="text-blue-600" />
                Sent Requests
              </h3>
              <div className="space-y-3">
                {sentRequests.map(request => <div key={request.id} className="flex items-center gap-3">
                  <Avatar src={request.image} alt={request.name} className="w-10 h-10 rounded-full" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">
                      {request.name}, {request.age}
                    </p>
                    <p className="text-xs text-gray-500">{request.match}% Match</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${request.status === 'pending' ? 'bg-yellow-50 text-yellow-600' : request.status === 'accepted' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                    {request.status === 'pending' && <Clock size={12} className="inline mr-1" />}
                    {request.status === 'accepted' && <Check size={12} className="inline mr-1" />}
                    {request.status === 'rejected' && <XCircle size={12} className="inline mr-1" />}
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </div>)}
              </div>
            </div>}

            {/* Active Matches */}
            {showDashboardWidgets && <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users size={20} className="text-blue-600" />
                Active Matches
              </h3>
              <div className="space-y-3">
                {activeMatches.map(match => <div key={match.id} className="flex items-center gap-3">
                  <Avatar src={match.image} alt={match.name} className="w-10 h-10 rounded-full" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">
                      {match.name}
                    </p>
                    <p className="text-xs text-emerald-600 font-medium">{match.match}% Match</p>
                  </div>
                  <button type="button" onClick={() => {
                    const target = resolveChatTarget(match.userId ?? match.id);
                    if (!target) return;
                    setChatWithUserId(target);
                    setActiveNav('messages');
                  }} className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white hover:bg-blue-700 transition-colors">
                    <MessageCircle size={16} />
                  </button>
                </div>)}
              </div>
            </div>}

            {/* Quick Actions */}
            {showDashboardWidgets && <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return <button key={index} type="button" onClick={action.onClick} className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${action.color === 'blue' ? 'bg-blue-100 text-blue-600' : action.color === 'purple' ? 'bg-purple-100 text-purple-600' : 'bg-emerald-100 text-emerald-600'}`}>
                      <Icon size={20} />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{action.label}</span>
                  </button>;
                })}
              </div>
            </div>}

            {/* Compatibility Insights */}
            {showDashboardWidgets && <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Target size={20} className="text-blue-600" />
                Compatibility Insights
              </h3>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="relative inline-flex items-center justify-center w-24 h-24 mb-2">
                    <svg className="w-full h-full -rotate-90">
                      <circle cx="48" cy="48" r="40" stroke="#E5E7EB" strokeWidth="8" fill="none" />
                      <circle cx="48" cy="48" r="40" stroke="#3B82F6" strokeWidth="8" fill="none" strokeDasharray={`${2 * Math.PI * 40}`} strokeDashoffset={`${2 * Math.PI * 40 * (1 - (avgMatchScore / 100 || 0))}`} strokeLinecap="round" />
                    </svg>
                    <span className="absolute text-2xl font-bold text-gray-900">{avgMatchScore}%</span>
                  </div>
                  <p className="text-sm text-gray-600">Average Match Score</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-blue-50 rounded-xl">
                    <p className="text-2xl font-bold text-blue-600">{nearbyMatchesCount}</p>
                    <p className="text-xs text-gray-600">Nearby Matches</p>
                  </div>
                  <div className="text-center p-3 bg-emerald-50 rounded-xl">
                    <p className="text-2xl font-bold text-emerald-600">{lifestyleMatchScore}%</p>
                    <p className="text-xs text-gray-600">Lifestyle Match</p>
                  </div>
                </div>
              </div>
            </div>}
          </div>
        </div>}
      </div>
    </main>

    <RoomDetailsModal open={roomDetailsOpen} room={roomDetailsRoom} onClose={() => {
      setRoomDetailsOpen(false);
      setRoomDetailsRoom(null);
    }} />

    {/* Full-screen lock prompt for explore mode */}
    {showExploreProfileModal && <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-xl text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Want better matches?
        </h2>
        <p className="text-gray-600 mb-6">Complete your profile.</p>
        <button type="button" onClick={() => {
          setShowExploreProfileModal(false);
          onEditProfile?.();
        }} className="w-full py-3.5 px-4 bg-[#081A35] text-white rounded-xl font-semibold hover:bg-[#081A35]/90 transition-all shadow-lg">
          Complete Profile
        </button>
      </div>
    </div>}

  </div>;
};
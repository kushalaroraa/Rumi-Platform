import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, CheckCheck, MessageCircle, Search, Send } from 'lucide-react';
import { getChatHistory, getChatThreads, normalizeImageUrl, sendChatMessage } from '../services/api';
import { getSocket } from '../services/socket';
import { Avatar } from '../components/common/Avatar';

function normalizeUserId(value) {
  if (!value) return '';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (typeof value === 'object') return String(value?._id || value?.id || '');
  return '';
}

function getCurrentUserId() {
  try {
    const raw = localStorage.getItem('rumi_user');
    return raw ? normalizeUserId(JSON.parse(raw)?._id) : '';
  } catch {
    return '';
  }
}

function formatTimestamp(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatConversationTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime()) || date.getTime() <= 0) return '';
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return 'now';
  if (diffMinutes < 60) return `${diffMinutes}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function formatDayDivider(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
}

const ChatPage = ({ initialOtherUserId = null }) => {
  const resolveOtherUserId = useCallback((candidate) => {
    const otherUserId = normalizeUserId(candidate);
    const meId = getCurrentUserId();
    if (!otherUserId || otherUserId === meId) return null;
    return otherUserId;
  }, []);

  const [threads, setThreads] = useState([]);
  const [threadsLoading, setThreadsLoading] = useState(false);
  const [threadSearch, setThreadSearch] = useState('');
  const [activeUserId, setActiveUserId] = useState(() => resolveOtherUserId(initialOtherUserId));
  const [mobileShowThread, setMobileShowThread] = useState(() => Boolean(resolveOtherUserId(initialOtherUserId)));
  const [messagesByConversation, setMessagesByConversation] = useState({});
  const [loadingByConversation, setLoadingByConversation] = useState({});
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const messagesEndRef = useRef(null);

  useEffect(() => {
    const resolved = resolveOtherUserId(initialOtherUserId);
    if (resolved) {
      setActiveUserId(resolved);
      setMobileShowThread(true);
    }
  }, [initialOtherUserId, resolveOtherUserId]);

  const filteredThreads = useMemo(() => {
    const q = threadSearch.trim().toLowerCase();
    if (!q) return threads;
    return threads.filter((t) => String(t?.name || '').toLowerCase().includes(q));
  }, [threads, threadSearch]);

  const activeThread = useMemo(
    () => threads.find((t) => String(t.otherUserId) === String(activeUserId)) || null,
    [threads, activeUserId]
  );

  const activeMessages = useMemo(
    () => messagesByConversation[activeUserId] || [],
    [messagesByConversation, activeUserId]
  );

  const activeLoading = Boolean(loadingByConversation[activeUserId]);

  const groupedMessages = useMemo(() => {
    const groups = [];
    let lastDay = '';

    activeMessages.forEach((message) => {
      const dayLabel = formatDayDivider(message.createdAt || Date.now());
      if (dayLabel && dayLabel !== lastDay) {
        groups.push({ type: 'divider', label: dayLabel });
        lastDay = dayLabel;
      }
      groups.push({ type: 'message', message });
    });

    return groups;
  }, [activeMessages]);

  const loadThreads = useCallback(async () => {
    setThreadsLoading(true);
    try {
      const res = await getChatThreads();
      const meId = getCurrentUserId();
      const list = (res?.data?.threads || [])
        .map((thread) => {
          const otherUserId = resolveOtherUserId(thread?.otherUserId);
          if (!otherUserId) return null;
          return {
            ...thread,
            otherUserId,
            image: thread?.image ? normalizeImageUrl(thread.image) : '',
          };
        })
        .filter(Boolean)
        .filter((thread) => String(thread.otherUserId) !== meId);

      setThreads(list);

      setActiveUserId((prev) => {
        if (prev && list.some((t) => String(t.otherUserId) === String(prev))) {
          return prev;
        }
        return resolveOtherUserId(list[0]?.otherUserId);
      });
    } catch (e) {
      setThreads([]);
      setError(e?.response?.data?.message || 'Failed to load conversations.');
    } finally {
      setThreadsLoading(false);
    }
  }, [resolveOtherUserId]);

  const loadHistory = useCallback(async (otherUserId, { silent = false } = {}) => {
    if (!otherUserId) return;
    if (!silent) {
      setLoadingByConversation((prev) => ({ ...prev, [otherUserId]: true }));
      setError('');
    }
    try {
      const res = await getChatHistory(otherUserId);
      setMessagesByConversation((prev) => ({
        ...prev,
        [otherUserId]: res?.data?.messages || [],
      }));
    } catch (e) {
      if (!silent) {
        setMessagesByConversation((prev) => ({
          ...prev,
          [otherUserId]: [],
        }));
        setError(e?.response?.data?.message || 'Cannot load chat history.');
      }
    } finally {
      if (!silent) {
        setLoadingByConversation((prev) => ({ ...prev, [otherUserId]: false }));
      }
    }
  }, []);

  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  useEffect(() => {
    if (!activeUserId) return;
    const resolved = resolveOtherUserId(activeUserId);
    if (!resolved) {
      setError('Pick another user to start chatting.');
      setActiveUserId(null);
      return;
    }
    loadHistory(resolved);
  }, [activeUserId, loadHistory, resolveOtherUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeUserId, activeMessages.length]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return undefined;

    const joinActiveRoom = () => {
      const resolved = resolveOtherUserId(activeUserId);
      if (resolved) {
        socket.emit('join_chat', { otherUserId: resolved }, () => {});
      }
    };

    if (socket.connected) {
      joinActiveRoom();
    }
    socket.on('connect', joinActiveRoom);

    const onNewMessage = (msg) => {
      const sender = normalizeUserId(msg?.senderId);
      const receiver = normalizeUserId(msg?.receiverId);
      const meId = getCurrentUserId();
      const otherUserId = sender === meId ? receiver : sender;
      if (!otherUserId || otherUserId === meId) return;

      const nextMessage = {
        _id: msg._id,
        senderId: msg.senderId,
        receiverId: msg.receiverId,
        message: msg.message,
        createdAt: msg.createdAt,
        isOwn: sender === meId,
      };

      setMessagesByConversation((prev) => {
        const existing = prev[otherUserId] || [];
        if (existing.some((item) => String(item._id) === String(nextMessage._id))) return prev;
        return {
          ...prev,
          [otherUserId]: [...existing, nextMessage],
        };
      });

      setThreads((prev) => {
        const idx = prev.findIndex((t) => String(t.otherUserId) === String(otherUserId));
        if (idx === -1) return prev;
        const updated = {
          ...prev[idx],
          lastMessagePreview: nextMessage.message,
          updatedAt: nextMessage.createdAt || new Date().toISOString(),
        };
        return [updated, ...prev.slice(0, idx), ...prev.slice(idx + 1)];
      });
    };

    socket.on('new_message', onNewMessage);

    return () => {
      socket.off('connect', joinActiveRoom);
      socket.off('new_message', onNewMessage);
    };
  }, [activeUserId, resolveOtherUserId]);

  // Fallback refresh if socket is unavailable/disconnected in production environments
  useEffect(() => {
    if (!activeUserId) return undefined;
    const interval = window.setInterval(() => {
      const socket = getSocket();
      if (!socket || !socket.connected) {
        loadHistory(activeUserId, { silent: true });
      }
    }, 6000);
    return () => window.clearInterval(interval);
  }, [activeUserId, loadHistory]);

  const handleSendMessage = async () => {
    const text = draft.trim();
    if (!text || !activeUserId || sending) return;

    const resolved = resolveOtherUserId(activeUserId);
    if (!resolved) {
      setError('Pick another user to start chatting.');
      return;
    }

    setSending(true);
    setError('');
    setDraft('');

    try {
      const res = await sendChatMessage({
        otherUserId: resolved,
        message: text,
        roomId: activeThread?.roomId || null,
      });

      const savedMsg = res?.data?.message;
      if (savedMsg) {
        setMessagesByConversation((prev) => {
          const existing = prev[resolved] || [];
          if (existing.some((item) => String(item._id) === String(savedMsg._id))) return prev;
          return {
            ...prev,
            [resolved]: [...existing, savedMsg],
          };
        });

        setThreads((prev) => {
          const idx = prev.findIndex((t) => String(t.otherUserId) === String(resolved));
          if (idx === -1) return prev;
          const updated = {
            ...prev[idx],
            lastMessagePreview: savedMsg.message,
            updatedAt: savedMsg.createdAt || new Date().toISOString(),
          };
          return [updated, ...prev.slice(0, idx), ...prev.slice(idx + 1)];
        });
      }
    } catch (err) {
      setDraft(text);
      setError(err?.response?.data?.message || err?.message || 'Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="rumi-chat-shell">
      {/* Conversations Card */}
      <aside className={`rumi-chat-sidebar-card ${mobileShowThread ? 'rumi-chat-hidden-mobile' : ''}`}>
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Chats</h2>
            <span className="rumi-chip-blue">{threads.length}</span>
          </div>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={threadSearch}
              onChange={(e) => setThreadSearch(e.target.value)}
              placeholder="Search conversations…"
              className="rumi-search-input"
            />
          </div>
        </div>

        <div className="rumi-chat-list">
          {threadsLoading ? (
            <div className="p-6 text-center text-sm text-gray-500">Loading conversations…</div>
          ) : filteredThreads.length === 0 ? (
            <div className="p-6 text-center">
              <div className="rumi-empty-state-icon">
                <MessageCircle size={18} />
              </div>
              <p className="text-sm font-semibold text-gray-900">
                {threads.length === 0 ? 'No conversations yet' : 'No matching chats'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {threads.length === 0
                  ? 'Accept a match request to start chatting with your future roommate.'
                  : 'Try searching for another name.'}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredThreads.map((thread) => {
                const isActive = String(activeUserId) === String(thread.otherUserId);
                const timeLabel = formatConversationTime(thread.updatedAt);

                return (
                  <button
                    key={thread.otherUserId}
                    type="button"
                    onClick={() => {
                      const resolved = resolveOtherUserId(thread.otherUserId);
                      if (!resolved) return;
                      setActiveUserId(resolved);
                      setMobileShowThread(true);
                    }}
                    className={`rumi-chat-item ${isActive ? 'rumi-chat-item--active' : ''}`}
                  >
                    <Avatar
                      src={thread.image}
                      alt={thread.name || 'User'}
                      className="w-12 h-12 rounded-full"
                      iconSize={20}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-gray-900 truncate">
                          {thread.name || 'Rumi Member'}
                        </span>
                        {timeLabel && (
                          <span className="text-xs text-gray-400 flex-shrink-0">{timeLabel}</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-1">
                        {thread.lastMessagePreview || 'Say hello to start the conversation'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </aside>

      {/* Active Conversation Card */}
      <section className={`rumi-chat-thread-card ${!mobileShowThread ? 'rumi-chat-hidden-mobile' : ''}`}>
        {activeThread || activeUserId ? (
          <>
            {/* Header (functional controls only — no video/voice call buttons) */}
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between gap-3 bg-white flex-shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => setMobileShowThread(false)}
                  aria-label="Back to conversations"
                  className="rumi-chat-mobile-back w-9 h-9 rounded-full bg-gray-100 items-center justify-center text-gray-700 flex-shrink-0"
                >
                  <ArrowLeft size={18} />
                </button>
                <Avatar
                  src={activeThread?.image || ''}
                  alt={activeThread?.name || 'User'}
                  className="w-10 h-10 rounded-full"
                  iconSize={18}
                />
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">
                    {activeThread?.name || 'Conversation'}
                  </h3>
                  <p className="text-xs text-emerald-600 font-medium">
                    Connected Match
                  </p>
                </div>
              </div>
            </div>

            {/* Message History */}
            <div className="rumi-chat-messages">
              <div className="flex flex-col gap-3">
                {error && (
                  <div className="rumi-banner-error">
                    {error}
                  </div>
                )}

                {activeLoading ? (
                  <div className="py-12 text-center text-sm text-gray-500">
                    Loading messages…
                  </div>
                ) : groupedMessages.length === 0 ? (
                  <div className="py-12 text-center">
                    <div className="rumi-empty-state-icon">
                      <MessageCircle size={18} />
                    </div>
                    <p className="text-sm font-semibold text-gray-900">No messages yet</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Send a message below to introduce yourself!
                    </p>
                  </div>
                ) : (
                  groupedMessages.map((entry, idx) => {
                    if (entry.type === 'divider') {
                      return (
                        <div key={`divider-${entry.label}-${idx}`} className="flex justify-center py-2">
                          <span className="px-3 py-1 rounded-full bg-white border border-gray-100 text-xs text-gray-500 font-medium shadow-sm">
                            {entry.label}
                          </span>
                        </div>
                      );
                    }

                    const msg = entry.message;
                    const isOwn = Boolean(msg?.isOwn);
                    const timeStr = formatTimestamp(msg?.createdAt);

                    return (
                      <div
                        key={msg._id || idx}
                        className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}
                      >
                        <div className={`rumi-chat-bubble ${isOwn ? 'rumi-chat-bubble--own' : 'rumi-chat-bubble--peer'}`}>
                          <div>{msg.message}</div>
                          <div className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${isOwn ? 'text-blue-50' : 'text-gray-400'}`}>
                            <span>{timeStr}</span>
                            {isOwn && <CheckCheck size={12} />}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Composer */}
            <div className="rumi-chat-composer">
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={!activeUserId || sending}
                placeholder="Type a message…"
                aria-label="Type a message"
                className="rumi-chat-input"
              />
              <button
                type="button"
                onClick={handleSendMessage}
                disabled={!activeUserId || !draft.trim() || sending}
                aria-label="Send message"
                className="w-10 h-10 rounded-full rumi-btn-primary flex items-center justify-center flex-shrink-0"
              >
                <Send size={17} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8 text-center">
            <div>
              <div className="rumi-empty-state-icon">
                <MessageCircle size={20} />
              </div>
              <h3 className="text-base font-semibold text-gray-900">Your Rumi Messages</h3>
              <p className="text-sm text-gray-500 mt-1">
                Select a conversation on the left to start chatting with your matches.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default ChatPage;

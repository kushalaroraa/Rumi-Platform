import React, { useEffect, useMemo, useState } from 'react';
import {
  Camera,
  CheckCheck,
  Circle,
  Heart,
  Image as ImageIcon,
  Info,
  Mic,
  MessageCircle,
  Phone,
  PencilLine,
  Pin,
  Send,
  Video,
} from 'lucide-react';
import { getChatHistory, getChatThreads } from '../services/api';
import { getSocket } from '../services/socket';

const getInitials = (name) => {
  const value = String(name || '').trim();
  if (!value) return 'U';
  const parts = value.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

const ChatAvatar = ({
  name,
  src,
  sizeClass,
  hasStory = false,
  invisible = false,
}) => {
  const [imgError, setImgError] = useState(false);
  const showImage = Boolean(src) && !imgError;

  const avatarContent = (
    <div className={`${sizeClass} rounded-full overflow-hidden bg-gray-200 ${invisible ? 'invisible' : ''}`}>
      {showImage ? (
        <img
          src={src}
          alt={name || 'User'}
          className="h-10 w-10 object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="h-full w-full flex items-center justify-center text-[9px] font-bold text-gray-600 select-none">
          {getInitials(name)}
        </div>
      )}
    </div>
  );

  if (hasStory) {
    return (
      <div className={`rounded-full p-[2px] bg-gradient-to-tr from-[#f58529] via-[#dd2a7b] to-[#8134af] ${invisible ? 'invisible' : ''}`}>
        {avatarContent}
      </div>
    );
  }

  return avatarContent;
};

const ChatPage = ({
  initialOtherUserId = null,
}) => {
  const getCurrentUserId = () => {
    try {
      const raw = localStorage.getItem('rumi_user');
      return raw ? String(JSON.parse(raw)?._id || '') : '';
    } catch {
      return '';
    }
  };

  const resolveOtherUserId = (candidate) => {
    const otherUserId = candidate ? String(candidate) : '';
    const meId = getCurrentUserId();
    if (!otherUserId || otherUserId === meId) return null;
    return otherUserId;
  };

  const [threads, setThreads] = useState([]);
  const [threadsLoading, setThreadsLoading] = useState(false);
  const [activeUserId, setActiveUserId] = useState(resolveOtherUserId(initialOtherUserId));
  const [messagesByConversation, setMessagesByConversation] = useState({});
  const [loadingByConversation, setLoadingByConversation] = useState({});
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const currentUserName = useMemo(() => {
    try {
      const raw = localStorage.getItem('rumi_user');
      if (!raw) return 'Messages';
      const user = JSON.parse(raw);
      return user?.name || user?.username || 'Messages';
    } catch {
      return 'Messages';
    }
  }, []);

  const activeThread = useMemo(
    () => threads.find((t) => String(t.otherUserId) === String(activeUserId)) || null,
    [threads, activeUserId]
  );

  const activeMessages = useMemo(
    () => messagesByConversation[activeUserId] || [],
    [messagesByConversation, activeUserId]
  );

  const activeLoading = Boolean(loadingByConversation[activeUserId]);

  const formatTimestamp = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatConversationTime = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
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
  };

  const groupedMessages = useMemo(() => {
    const groups = [];
    let lastMessage = null;

    activeMessages.forEach((message) => {
      const currentDate = new Date(message.createdAt || Date.now());
      const needsDivider = !lastMessage
        || (currentDate.toDateString() !== new Date(lastMessage.createdAt || Date.now()).toDateString())
        || ((currentDate.getTime() - new Date(lastMessage.createdAt || Date.now()).getTime()) / 60000 > 45);

      if (needsDivider) {
        groups.push({ type: 'divider', label: formatConversationTime(message.createdAt) });
      }

      groups.push({ type: 'message', message });
      lastMessage = message;
    });

    return groups;
  }, [activeMessages]);

  const loadThreads = async () => {
    setThreadsLoading(true);
    try {
      const res = await getChatThreads();
      const meId = getCurrentUserId();
      const list = (res?.data?.threads || []).filter((thread) => String(thread?.otherUserId || '') !== meId);
      setThreads(list);
      if (activeUserId && !list.some((thread) => String(thread.otherUserId) === String(activeUserId))) {
        setActiveUserId(resolveOtherUserId(list[0]?.otherUserId));
      } else if (!activeUserId) {
        setActiveUserId(resolveOtherUserId(list[0]?.otherUserId));
      }
    } catch (e) {
      setThreads([]);
      setError(e?.response?.data?.message || 'Failed to load threads.');
    } finally {
      setThreadsLoading(false);
    }
  };

  const loadHistory = async (otherUserId) => {
    if (!otherUserId) return;
    setLoadingByConversation((prev) => ({ ...prev, [otherUserId]: true }));
    setError('');
    try {
      const res = await getChatHistory(otherUserId);
      setMessagesByConversation((prev) => ({
        ...prev,
        [otherUserId]: res?.data?.messages || [],
      }));
    } catch (e) {
      setMessagesByConversation((prev) => ({
        ...prev,
        [otherUserId]: [],
      }));
      setError(e?.response?.data?.message || 'Cannot load chat history.');
    } finally {
      setLoadingByConversation((prev) => ({ ...prev, [otherUserId]: false }));
    }
  };

  useEffect(() => {
    loadThreads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!activeUserId) return;
    const resolved = resolveOtherUserId(activeUserId);
    if (!resolved) {
      setError('Pick another user to start chatting.');
      setActiveUserId(null);
      return;
    }
    loadHistory(resolved);
  }, [activeUserId]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const onNewMessage = (msg) => {
      const sender = String(msg?.senderId?._id || msg?.senderId || '');
      const receiver = String(msg?.receiverId?._id || msg?.receiverId || '');
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
    };

    socket.on('new_message', onNewMessage);
    return () => socket.off('new_message', onNewMessage);
  }, [activeUserId]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !activeUserId) return;

    const resolved = resolveOtherUserId(activeUserId);
    if (!resolved) return;

    socket.emit('join_chat', { otherUserId: resolved }, () => {});
  }, [activeUserId]);

  const sendMessage = async () => {
    const text = draft.trim();
    if (!text || !activeUserId) return;

    const resolved = resolveOtherUserId(activeUserId);
    if (!resolved) {
      setError('Pick another user to start chatting.');
      return;
    }

    const socket = getSocket();
    if (!socket) {
      setError('Socket unavailable. Please login again.');
      return;
    }

    setDraft('');
    setError('');

    socket.emit('send_message', { otherUserId: resolved, message: text }, (ack) => {
      if (!ack?.ok) {
        setError(ack?.error || 'Failed to send message.');
      }
    });
  };

  return (
    <div className="w-full min-h-[calc(100vh-190px)] bg-white text-black overflow-hidden rounded-[28px] border border-gray-200 shadow-2xl">
      <div className="flex h-full min-h-[calc(100vh-190px)]">
        <aside className="w-[350px] shrink-0 border-r border-gray-200 bg-white flex flex-col">
          <div className="h-16 px-4 flex items-center justify-between border-b border-gray-200">
            <div className="min-w-0">
              <div className="text-[11px] uppercase tracking-[0.18em] text-gray-500">Messages</div>
              <div className="mt-0.5 flex items-center gap-2 min-w-0">
                <span className="font-semibold text-black truncate">{currentUserName}</span>
              </div>
            </div>
            <button type="button" className="grid h-9 w-9 place-items-center rounded-full bg-white text-black border border-gray-200 hover:bg-gray-50 transition-colors" aria-label="Compose message">
              <PencilLine size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {threadsLoading ? (
              <div className="px-3 py-4 text-sm text-gray-500">Loading chats...</div>
            ) : threads.length === 0 ? (
              <div className="px-3 py-4 text-sm text-gray-500">No chats yet. Accept a request to start chatting.</div>
            ) : (
              <div className="space-y-1">
                {threads.map((thread) => {
                  const isActive = String(activeUserId) === String(thread.otherUserId);
                  const preview = thread.lastMessagePreview || 'Start conversation';
                  const unreadCount = Number(thread.unreadCount || 0);
                  const isLikedPreview = /liked your message/i.test(preview);
                  const hasActiveStory = Boolean(thread?.hasActiveStory || thread?.activeStory);

                  return (
                    <button
                      key={thread.otherUserId}
                      type="button"
                      onClick={() => {
                        const resolved = resolveOtherUserId(thread.otherUserId);
                        if (!resolved) return;
                        setActiveUserId(resolved);
                      }}
                      className={`w-full rounded-2xl px-3 py-3 text-left transition-colors ${
                        isActive ? 'bg-gray-100' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <ChatAvatar
                          name={thread.name}
                          src={thread.image}
                          sizeClass="h-11 w-11"
                          hasStory={hasActiveStory}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="font-semibold text-sm text-black truncate">{thread.name}</span>
                              {(thread.pinned || thread.isPinned) ? <Pin size={13} className="text-black shrink-0" /> : null}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[11px] text-gray-500">{formatConversationTime(thread.updatedAt)}</span>
                              {unreadCount > 0 ? <Circle size={8} className="fill-[#3797f0] text-[#3797f0]" /> : null}
                            </div>
                          </div>
                          <p className={`mt-1 truncate text-sm ${isLikedPreview ? 'text-gray-500 italic' : 'text-gray-500'}`}>
                            {preview}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </aside>

        <section className="flex-1 min-w-0 flex flex-col bg-white">
          <header className="h-16 shrink-0 border-b border-gray-200 px-5 flex items-center justify-between bg-white">
            <div className="flex items-center gap-3 min-w-0">
              {activeThread ? (
                <ChatAvatar
                  name={activeThread.name}
                  src={activeThread.image}
                  sizeClass="h-10 w-10"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-gray-100 border border-gray-200" />
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <h3 className="font-semibold text-sm text-black truncate">
                    {activeThread ? activeThread.name : 'Select a conversation'}
                  </h3>
                  {activeThread ? <span className="h-2 w-2 rounded-full bg-[#3797f0]" /> : null}
                </div>
                <p className="text-xs text-gray-500">{activeThread ? 'Active now' : 'Choose a conversation to begin'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button type="button" className="grid h-9 w-9 place-items-center rounded-full bg-white border border-gray-200 text-black hover:bg-gray-50 transition-colors" aria-label="Video call">
                <Video size={17} />
              </button>
              <button type="button" className="grid h-9 w-9 place-items-center rounded-full bg-white border border-gray-200 text-black hover:bg-gray-50 transition-colors" aria-label="Phone call">
                <Phone size={17} />
              </button>
              <button type="button" className="grid h-9 w-9 place-items-center rounded-full bg-white border border-gray-200 text-black hover:bg-gray-50 transition-colors" aria-label="Conversation info">
                <Info size={17} />
              </button>
            </div>
          </header>

          <div className="flex-1 min-h-0 overflow-y-auto bg-white px-5 py-5">
            <div className="flex min-h-full flex-col justify-end gap-4 max-w-4xl mx-auto w-full">
              {error ? <p className="text-xs text-red-600">{error}</p> : null}
              {activeLoading ? (
                <p className="text-sm text-gray-500">Loading messages...</p>
              ) : !activeUserId ? (
                <p className="text-sm text-gray-500">Pick a chat from the left.</p>
              ) : groupedMessages.length === 0 ? (
                <p className="text-sm text-gray-500">No messages yet. Say hi!</p>
              ) : (
                groupedMessages.map((entry, index) => {
                  if (entry.type === 'divider') {
                    return (
                      <div key={`divider-${index}`} className="flex justify-center py-2">
                        <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-[11px] text-gray-500">
                          {entry.label}
                        </span>
                      </div>
                    );
                  }

                  const message = entry.message;
                  const sender = String(message?.senderId?._id || message?.senderId || '');
                  const isOwn = Boolean(message?.isOwn);
                  const isVideo = message?.mediaType === 'video' || message?.videoUrl;
                  const replyLabel = message?.replyTo?.authorName || message?.replyAuthor || '';
                  const replyText = message?.replyTo?.message || message?.replyText || '';
                  const senderName = message?.senderId?.name || activeThread?.name || 'User';
                  const senderImage = message?.senderId?.photo || message?.senderId?.profilePicture || activeThread?.image || '';
                  const nextEntry = groupedMessages[index + 1];
                  const nextMessage = nextEntry?.type === 'message' ? nextEntry.message : null;
                  const nextSender = String(nextMessage?.senderId?._id || nextMessage?.senderId || '');
                  const showReceivedAvatar = !isOwn && (!nextMessage || Boolean(nextMessage?.isOwn) || nextSender !== sender);

                  return (
                    <div key={message._id} className={`flex items-end gap-1.5 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      {!isOwn ? (
                        <ChatAvatar
                          name={senderName}
                          src={senderImage}
                          sizeClass="h-7 w-7"
                          invisible={!showReceivedAvatar}
                        />
                      ) : null}

                      <div className={`max-w-[68%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                        {(replyLabel || replyText) ? (
                          <div className={`mb-1.5 max-w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-[11px] text-gray-500 ${isOwn ? 'self-end' : 'self-start'}`}>
                            {replyLabel ? <div className="font-medium text-black">{replyLabel} replied to you</div> : null}
                            {replyText ? <div className="mt-0.5 truncate">{replyText}</div> : null}
                          </div>
                        ) : null}

                        {isVideo ? (
                          <div className={`mb-1.5 overflow-hidden rounded-2xl border border-gray-200 bg-white ${isOwn ? 'self-end' : 'self-start'} w-[280px] max-w-full`}>
                            <div className="relative aspect-video bg-gray-100">
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="grid h-12 w-12 place-items-center rounded-full bg-black/60 text-white border border-white/10">
                                  <Video size={20} />
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : null}

                        <div className={`rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${isOwn ? 'bg-[#3797f0] text-black rounded-br-md' : 'bg-white text-black border border-gray-200 rounded-bl-md'} ${message?.message ? '' : 'min-h-10'}`}>
                          {message?.message ? <div className="whitespace-pre-wrap break-words">{message.message}</div> : null}
                        </div>

                        <div className={`mt-1 text-[10px] text-gray-500 ${isOwn ? 'self-end' : 'self-start'}`}>
                          {formatTimestamp(message?.createdAt)}
                          {isOwn ? <CheckCheck size={11} className="ml-1 inline" /> : null}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <footer className="shrink-0 border-t border-gray-200 bg-white px-4 py-3">
            <div className="mx-auto flex w-full max-w-5xl items-center gap-3">
              <div className="flex items-center gap-2 text-black">
                <button type="button" className="grid h-9 w-9 place-items-center rounded-full hover:bg-gray-100 transition-colors" aria-label="Open camera">
                  <Camera size={18} />
                </button>
                <button type="button" className="grid h-9 w-9 place-items-center rounded-full hover:bg-gray-100 transition-colors" aria-label="Open photo picker">
                  <ImageIcon size={18} />
                </button>
                <button type="button" className="grid h-9 w-9 place-items-center rounded-full hover:bg-gray-100 transition-colors" aria-label="Record audio">
                  <Mic size={18} />
                </button>
                <button type="button" className="grid h-9 w-9 place-items-center rounded-full hover:bg-gray-100 transition-colors" aria-label="Send GIF or sticker">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.12em]">gif</span>
                </button>
              </div>

              <div className="flex-1 rounded-full border border-gray-200 bg-white px-4 py-2.5 flex items-center gap-3">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') sendMessage();
                  }}
                  disabled={!activeUserId}
                  placeholder="Message..."
                  className="w-full bg-transparent text-sm text-black placeholder:text-gray-500 focus:outline-none disabled:cursor-not-allowed"
                />

                {draft.trim() ? (
                  <button
                    type="button"
                    onClick={sendMessage}
                    disabled={!activeUserId}
                    className="grid h-9 w-9 place-items-center rounded-full bg-[#3797f0] text-white shadow-sm hover:brightness-110 disabled:opacity-50"
                    aria-label="Send message"
                  >
                    <Send size={16} />
                  </button>
                ) : (
                  <button
                    type="button"
                    className="grid h-9 w-9 place-items-center rounded-full text-black hover:bg-gray-100 transition-colors"
                    aria-label="Like message"
                  >
                    <Heart size={17} />
                  </button>
                )}
              </div>
            </div>
          </footer>
        </section>
      </div>
    </div>
  );
};

export default ChatPage;

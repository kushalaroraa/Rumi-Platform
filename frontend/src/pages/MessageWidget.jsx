import React from 'react';
import { MessageCircle } from 'lucide-react';

const MessageWidget = ({
  activeNav,
  setActiveNav,
  chatLoading,
  chatWithUserId,
  chatMessages,
  setChatWithUserId,
  setChatMessages
}) => {
  if (activeNav !== 'messages') return null;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4 mb-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <MessageCircle size={20} className="text-blue-600" />
          Messages
        </h3>
        <button
          type="button"
          onClick={() => {
            setActiveNav('dashboard');
            setChatWithUserId(null);
            setChatMessages([]);
          }}
          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors"
        >
          Back
        </button>
      </div>

      <div className="space-y-3 max-h-[320px] overflow-auto pr-2">
        {chatLoading ? (
          <p className="text-sm text-gray-500">Loading messages...</p>
        ) : chatWithUserId ? (
          chatMessages.length ? (
            chatMessages.map((m) => (
              <div key={m._id} className={`flex ${m.isOwn ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    m.isOwn ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="font-medium mb-1 text-xs opacity-90">
                    {m.isOwn ? 'You' : m.senderId?.name || 'User'}
                  </div>
                  <div className="whitespace-pre-wrap">{m.message}</div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No messages yet.</p>
          )
        ) : (
          <p className="text-sm text-gray-500">Select an active match to view messages.</p>
        )}
      </div>

      <div className="mt-4">
        <input
          disabled
          value="Messaging sending is not enabled in this design build."
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-500"
        />
      </div>
    </div>
  );
};

export default MessageWidget;

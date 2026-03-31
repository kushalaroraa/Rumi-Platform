import { Send, Paperclip, MoreVertical, Phone, Video, Search } from 'lucide-react';
import { useState } from 'react';

export function Messages() {
  const [selectedChat, setSelectedChat] = useState(1);
  const [message, setMessage] = useState('');

  const conversations = [
    {
      id: 1,
      name: 'Aarushi Kapoor',
      lastMessage: 'That sounds great! When would be a good time?',
      time: '2m ago',
      unread: 2,
      image: 'https://images.unsplash.com/photo-1623594675959-02360202d4d6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMHNtaWxpbmclMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzQ3MjgzMjV8MA&ixlib=rb-4.1.0&q=80&w=400',
      online: true,
    },
    {
      id: 2,
      name: 'Vikram Patel',
      lastMessage: 'Thanks for accepting my request!',
      time: '1h ago',
      unread: 0,
      image: 'https://images.unsplash.com/photo-1629507208649-70919ca33793?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYW4lMjBidXNpbmVzcyUyMHBvcnRyYWl0fGVufDF8fHx8MTc3NDY5MzkzNHww&ixlib=rb-4.1.0&q=80&w=400',
      online: false,
    },
    {
      id: 3,
      name: 'Neha Verma',
      lastMessage: 'I love hiking too! We should go together',
      time: '3h ago',
      unread: 1,
      image: 'https://images.unsplash.com/photo-1672390933634-6ccb1da5fa40?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHdvbWFuJTIwc3VuZ2xhc3NlcyUyMHBvcnRyYWl0fGVufDF8fHx8MTc3NDgxMDQ4OHww&ixlib=rb-4.1.0&q=80&w=400',
      online: true,
    },
    {
      id: 4,
      name: 'Rohan Singh',
      lastMessage: 'The apartment looks perfect!',
      time: '5h ago',
      unread: 0,
      image: 'https://images.unsplash.com/photo-1768489038932-a63eef1fe51f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW4lMjBmb3JtYWwlMjBwb3J0cmFpdCUyMGhlYWRzaG90fGVufDF8fHx8MTc3NDgxMDQ4OXww&ixlib=rb-4.1.0&q=80&w=400',
      online: false,
    },
    {
      id: 5,
      name: 'Priya Nair',
      lastMessage: 'Looking forward to meeting you!',
      time: '1d ago',
      unread: 0,
      image: 'https://images.unsplash.com/photo-1762474316414-afbf5c1eff26?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHdvbWFuJTIwcmVkJTIwc2hpcnQlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzQ4MTA0ODl8MA&ixlib=rb-4.1.0&q=80&w=400',
      online: true,
    },
  ];

  const messages = [
    {
      id: 1,
      sender: 'them',
      text: 'Hi! I saw your profile and we have a 92% match! Would love to connect.',
      time: '10:30 AM',
    },
    {
      id: 2,
      sender: 'me',
      text: 'Hey! Yes, I noticed that too. Your profile looks great!',
      time: '10:32 AM',
    },
    {
      id: 3,
      sender: 'them',
      text: 'Thanks! I love that you enjoy hiking. Do you have any favorite trails?',
      time: '10:35 AM',
    },
    {
      id: 4,
      sender: 'me',
      text: "I usually go to the trails near the national park. They're beautiful in the morning!",
      time: '10:38 AM',
    },
    {
      id: 5,
      sender: 'them',
      text: 'That sounds great! When would be a good time?',
      time: '10:40 AM',
    },
  ];

  const handleSend = () => {
    if (message.trim()) {
      // Handle send message
      setMessage('');
    }
  };

  const selectedConversation = conversations.find(c => c.id === selectedChat);

  return (
    <div className="flex gap-6 h-full">
      {/* Conversations List */}
      <div className="w-[380px] bg-white rounded-3xl shadow-sm flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-2xl font-semibold mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-lg border-none outline-none text-gray-600"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setSelectedChat(conv.id)}
              className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                selectedChat === conv.id ? 'bg-blue-50' : ''
              }`}
            >
              <div className="relative">
                <img
                  src={conv.image}
                  alt={conv.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                {conv.online && (
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold truncate">{conv.name}</h3>
                  <span className="text-xs text-gray-500">{conv.time}</span>
                </div>
                <p className="text-sm text-gray-600 truncate">{conv.lastMessage}</p>
              </div>
              {conv.unread > 0 && (
                <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                  {conv.unread}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-white rounded-3xl shadow-sm flex flex-col">
        {/* Chat Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={selectedConversation?.image}
                alt={selectedConversation?.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              {selectedConversation?.online && (
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-lg">{selectedConversation?.name}</h3>
              <p className="text-sm text-gray-500">
                {selectedConversation?.online ? 'Active now' : 'Offline'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors">
              <Phone className="w-5 h-5 text-gray-600" />
            </button>
            <button className="w-10 h-10 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors">
              <Video className="w-5 h-5 text-gray-600" />
            </button>
            <button className="w-10 h-10 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors">
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] ${
                  msg.sender === 'me'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                } rounded-2xl px-4 py-3`}
              >
                <p className="mb-1">{msg.text}</p>
                <span
                  className={`text-xs ${
                    msg.sender === 'me' ? 'text-blue-100' : 'text-gray-500'
                  }`}
                >
                  {msg.time}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="p-6 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors">
              <Paperclip className="w-5 h-5 text-gray-600" />
            </button>
            <input
              type="text"
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 px-4 py-3 bg-gray-50 rounded-lg border-none outline-none text-gray-600"
            />
            <button
              onClick={handleSend}
              className="w-10 h-10 bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center justify-center transition-colors"
            >
              <Send className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

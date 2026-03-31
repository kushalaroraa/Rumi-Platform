import { Sparkles, MessageSquare, Edit, UserPlus, Target, Heart, Clock, CheckCircle } from 'lucide-react';
const mainProfileImg = 'https://images.unsplash.com/photo-1704726135027-9c6f034cfa41?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1c2VyJTIwcHJvZmlsZSUyMGF2YXRhcnxlbnwxfHx8fDE3NzQ3MzEzMDF8MA&ixlib=rb-4.1.0&q=80&w=400';

export function Dashboard({ onNavigate }) {
  const requestsReceived = [
    {
      id: 1,
      name: 'Amit Sharma',
      age: 26,
      match: 87,
      image: 'https://images.unsplash.com/photo-1629507208649-70919ca33793?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYW4lMjBidXNpbmVzcyUyMHBvcnRyYWl0fGVufDF8fHx8MTc3NDY5MzkzNHww&ixlib=rb-4.1.0&q=80&w=400',
    },
    {
      id: 2,
      name: 'Priya Singh',
      age: 25,
      match: 91,
      image: 'https://images.unsplash.com/photo-1672390933634-6ccb1da5fa40?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHdvbWFuJTIwc3VuZ2xhc3NlcyUyMHBvcnRyYWl0fGVufDF8fHx8MTc3NDgxMDQ4OHww&ixlib=rb-4.1.0&q=80&w=400',
    },
  ];

  const sentRequests = [
    {
      id: 1,
      name: 'Ritika Mehra',
      match: 95,
      status: 'Pending',
      image: 'https://images.unsplash.com/photo-1762474316414-afbf5c1eff26?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHdvbWFuJTIwcmVkJTIwc2hpcnQlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzQ4MTA0ODl8MA&ixlib=rb-4.1.0&q=80&w=400',
    },
    {
      id: 2,
      name: 'Vikram Patel',
      match: 88,
      status: 'Accepted',
      image: 'https://images.unsplash.com/photo-1768489038932-a63eef1fe51f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW4lMjBmb3JtYWwlMjBwb3J0cmFpdCUyMGhlYWRzaG90fGVufDF8fHx8MTc3NDgxMDQ4OXww&ixlib=rb-4.1.0&q=80&w=400',
    },
  ];

  const matchesInArea = [
    {
      id: 1,
      name: 'Rajesh Kumar',
      budget: '₹800/month',
      location: 'Mumbai',
      interests: 'Hiking, Photography',
      compatibility: 95,
      image: 'https://images.unsplash.com/photo-1548600983-a171dced97f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBidXNpbmVzc21hbiUyMGhlYWRzaG90fGVufDF8fHx8MTc3NDgwODI4M3ww&ixlib=rb-4.1.0&q=80&w=400',
      bgColor: 'bg-purple-200',
    },
    {
      id: 2,
      name: 'Neha Verma',
      budget: '₹950/month',
      location: 'Bengaluru',
      interests: 'Hiking, Photography',
      compatibility: 92,
      image: 'https://images.unsplash.com/photo-1762474316414-afbf5c1eff26?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHdvbWFuJTIwcmVkJTIwc2hpcnQlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzQ4MTA0ODl8MA&ixlib=rb-4.1.0&q=80&w=400',
      bgColor: 'bg-yellow-200',
    },
  ];

  return (
    <div className="flex gap-6">
      {/* Main Column */}
      <div className="flex-1 space-y-6">
        {/* Discover Matches Card */}
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <h2 className="text-3xl font-semibold mb-2">Discover Matches</h2>
          <p className="text-gray-500 mb-8">Swipe right to connect, left to pass.</p>
          
          <div className="relative max-w-xl mx-auto">
            <img
              src={mainProfileImg}
              alt="Aarav Sharma"
              className="w-full h-[450px] object-cover rounded-2xl"
            />
            <div className="absolute top-6 right-6">
              <span className="bg-emerald-500 text-white px-6 py-2 rounded-full font-semibold">
                92% Match
              </span>
            </div>
            <div className="mt-6">
              <h3 className="text-3xl font-semibold mb-2">Aarav Sharma, 26</h3>
              <p className="text-gray-600">
                Software engineer who loves cooking and weekend hikes. Looking for a clean, respectful flatmate.
              </p>
            </div>
          </div>
        </div>

        {/* Matches in Your Area */}
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <h2 className="text-2xl font-semibold mb-1">
            Matches in <span className="text-purple-600">Your Area</span>
          </h2>
          
          <div className="mt-6 relative">
            <div className="flex gap-4 overflow-x-auto pb-4">
              {matchesInArea.map((match) => (
                <div
                  key={match.id}
                  className={`${match.bgColor} rounded-3xl p-6 min-w-[320px] flex flex-col`}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <img
                      src={match.image}
                      alt={match.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{match.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-700 mt-1">
                        <span>{match.budget}</span>
                        <span>•</span>
                        <span>{match.location}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">
                    <strong>Interests:</strong> {match.interests}
                  </p>
                  <div className="flex items-center gap-2 bg-white/70 rounded-lg px-3 py-2 w-fit">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm font-semibold">{match.compatibility}% Compatibility</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-center gap-2">
              <button className="w-8 h-8 bg-gray-800 text-white rounded flex items-center justify-center">
                ‹
              </button>
              <div className="flex-1 bg-gray-300 rounded-full h-1">
                <div className="bg-gray-800 h-1 rounded-full" style={{ width: '50%' }}></div>
              </div>
              <button className="w-8 h-8 bg-gray-800 text-white rounded flex items-center justify-center">
                ›
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <h2 className="text-2xl font-semibold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-3 gap-6">
            <button 
              onClick={() => onNavigate('messages')}
              className="flex flex-col items-center gap-3 p-6 rounded-2xl hover:bg-gray-50 transition-colors"
            >
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-7 h-7 text-blue-600" />
              </div>
              <span className="font-medium">View Messages</span>
            </button>
            <button 
              onClick={() => onNavigate('preferences')}
              className="flex flex-col items-center gap-3 p-6 rounded-2xl hover:bg-gray-50 transition-colors"
            >
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
                <Edit className="w-7 h-7 text-purple-600" />
              </div>
              <span className="font-medium">Edit Preferences</span>
            </button>
            <button 
              onClick={() => onNavigate('profile')}
              className="flex flex-col items-center gap-3 p-6 rounded-2xl hover:bg-gray-50 transition-colors"
            >
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                <UserPlus className="w-7 h-7 text-green-600" />
              </div>
              <span className="font-medium">Complete Profile</span>
            </button>
          </div>
        </div>

        {/* Compatibility Insights */}
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Target className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-semibold">Compatibility Insights</h2>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="relative w-40 h-40 mb-4">
              <svg className="w-40 h-40 transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="#e5e7eb"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="#3b82f6"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 70}`}
                  strokeDashoffset={`${2 * Math.PI * 70 * (1 - 0.89)}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-bold text-blue-600">89%</span>
              </div>
            </div>
            <p className="text-gray-600 mb-8">Average Match Score</p>
            
            <div className="grid grid-cols-2 gap-6 w-full">
              <div className="bg-blue-50 rounded-2xl p-6 text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">24</div>
                <p className="text-gray-600">Nearby Matches</p>
              </div>
              <div className="bg-green-50 rounded-2xl p-6 text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">91%</div>
                <p className="text-gray-600">Lifestyle Match</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-[380px] space-y-6">
        {/* Requests Received */}
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Heart className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold">Requests Received</h2>
          </div>
          <div className="space-y-4">
            {requestsReceived.map((request) => (
              <div key={request.id} className="pb-4 border-b border-gray-100 last:border-0">
                <div className="flex items-start gap-3 mb-3">
                  <img
                    src={request.image}
                    alt={request.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{request.name}, {request.age}</h3>
                    <span className="text-sm text-green-600 font-semibold">{request.match}% Match</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                    Accept
                  </button>
                  <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sent Requests */}
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold">Sent Requests</h2>
          </div>
          <div className="space-y-4">
            {sentRequests.map((request) => (
              <div key={request.id} className="flex items-center gap-3">
                <img
                  src={request.image}
                  alt={request.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold">{request.name}</h3>
                  <span className="text-sm text-gray-600">{request.match}% Match</span>
                </div>
                <div className="flex items-center gap-1">
                  {request.status === 'Pending' ? (
                    <>
                      <Clock className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm text-yellow-600 font-semibold">Pending</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-600 font-semibold">Accepted</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Matches */}
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Heart className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold">Active Matches</h2>
          </div>
          <div className="text-center py-8 text-gray-500">
            <p>Connect with people to see your active matches here.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

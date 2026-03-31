import { Heart, MessageCircle, MapPin, Calendar, Filter } from 'lucide-react';

export function MyMatches() {
  const matches = [
    {
      id: 1,
      name: 'Aarushi Kapoor',
      age: 24,
      match: 92,
      location: 'Mumbai',
      budget: '₹8000/month',
      moveInDate: 'April 2026',
      bio: 'Software engineer who loves cooking and weekend hikes.',
      image: 'https://images.unsplash.com/photo-1623594675959-02360202d4d6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMHNtaWxpbmclMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzQ3MjgzMjV8MA&ixlib=rb-4.1.0&q=80&w=400',
      status: 'active',
    },
    {
      id: 2,
      name: 'Vikram Patel',
      age: 26,
      match: 87,
      location: 'Delhi',
      budget: '₹950/month',
      moveInDate: 'May 2026',
      bio: 'Graphic designer looking for a creative and quiet flatmate.',
      image: 'https://images.unsplash.com/photo-1629507208649-70919ca33793?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYW4lMjBidXNpbmVzcyUyMHBvcnRyYWl0fGVufDF8fHx8MTc3NDY5MzkzNHww&ixlib=rb-4.1.0&q=80&w=400',
      status: 'active',
    },
    {
      id: 3,
      name: 'Neha Verma',
      age: 25,
      match: 91,
      location: 'Bengaluru',
      budget: '₹750/month',
      moveInDate: 'June 2026',
      bio: 'Marketing professional who enjoys yoga and healthy cooking.',
      image: 'https://images.unsplash.com/photo-1672390933634-6ccb1da5fa40?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHdvbWFuJTIwc3VuZ2xhc3NlcyUyMHBvcnRyYWl0fGVufDF8fHx8MTc3NDgxMDQ4OHww&ixlib=rb-4.1.0&q=80&w=400',
      status: 'active',
    },
    {
      id: 4,
      name: 'Rohan Singh',
      age: 28,
      match: 88,
      location: 'Chennai',
      budget: '₹850/month',
      moveInDate: 'March 2026',
      bio: 'Finance professional, clean and organized.',
      image: 'https://images.unsplash.com/photo-1768489038932-a63eef1fe51f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW4lMjBmb3JtYWwlMjBwb3J0cmFpdCUyMGhlYWRzaG90fGVufDF8fHx8MTc3NDgxMDQ4OXww&ixlib=rb-4.1.0&q=80&w=400',
      status: 'pending',
    },
    {
      id: 5,
      name: 'Priya Nair',
      age: 23,
      match: 95,
      location: 'Kochi',
      budget: '₹900/month',
      moveInDate: 'April 2026',
      bio: 'Teacher who loves reading and coffee shops.',
      image: 'https://images.unsplash.com/photo-1762474316414-afbf5c1eff26?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHdvbWFuJTIwcmVkJTIwc2hpcnQlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzQ4MTA0ODl8MA&ixlib=rb-4.1.0&q=80&w=400',
      status: 'active',
    },
    {
      id: 6,
      name: 'Arjun Reddy',
      age: 27,
      match: 90,
      location: 'Hyderabad',
      budget: '₹800/month',
      moveInDate: 'May 2026',
      bio: 'Photographer who loves hiking and outdoor activities.',
      image: 'https://images.unsplash.com/photo-1548600983-a171dced97f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBidXNpbmVzc21hbiUyMGhlYWRzaG90fGVufDF8fHx8MTc3NDgwODI4M3ww&ixlib=rb-4.1.0&q=80&w=400',
      status: 'active',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-8 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-semibold mb-2">My Matches</h2>
            <p className="text-gray-500">You have {matches.length} active matches</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
            <Filter className="w-5 h-5" />
            <span className="font-medium">Filter</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-3xl font-bold text-blue-600">6</span>
          </div>
          <p className="text-gray-600">Total Matches</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-3xl font-bold text-green-600">5</span>
          </div>
          <p className="text-gray-600">Active Chats</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-3xl font-bold text-purple-600">4</span>
          </div>
          <p className="text-gray-600">In Your Area</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-yellow-600" />
            </div>
            <span className="text-3xl font-bold text-yellow-600">3</span>
          </div>
          <p className="text-gray-600">This Week</p>
        </div>
      </div>

      {/* Matches Grid */}
      <div className="grid grid-cols-3 gap-6">
        {matches.map((match) => (
          <div key={match.id} className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative">
              <img
                src={match.image}
                alt={match.name}
                className="w-full h-64 object-cover"
              />
              <div className="absolute top-4 right-4">
                <span className="bg-emerald-500 text-white px-4 py-1.5 rounded-full text-sm font-semibold">
                  {match.match}% Match
                </span>
              </div>
              {match.status === 'pending' && (
                <div className="absolute top-4 left-4">
                  <span className="bg-yellow-500 text-white px-4 py-1.5 rounded-full text-sm font-semibold">
                    Pending
                  </span>
                </div>
              )}
            </div>
            
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">
                {match.name}, {match.age}
              </h3>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>{match.location}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>Move-in: {match.moveInDate}</span>
                </div>
                <p className="text-gray-600 text-sm">{match.budget}</p>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{match.bio}</p>

              <div className="flex gap-2">
                <button className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Message
                </button>
                <button className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  <Heart className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

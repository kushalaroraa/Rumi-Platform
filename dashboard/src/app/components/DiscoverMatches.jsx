import { Heart, X, Star, TrendingUp, Calendar, MessageCircle, Eye } from 'lucide-react';
import { useState } from 'react';

export function DiscoverMatches() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const profiles = [
    {
      id: 1,
      name: 'Aarushi Kapoor',
      age: 24,
      match: 92,
      location: 'Mumbai',
      budget: '₹800/month',
      bio: 'Software engineer who loves cooking and weekend hikes. Looking for a clean, respectful flatmate.',
      interests: ['Hiking', 'Cooking', 'Photography', 'Reading'],
      image: 'https://images.unsplash.com/photo-1623594675959-02360202d4d6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMHNtaWxpbmclMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzQ3MjgzMjV8MA&ixlib=rb-4.1.0&q=80&w=800',
    },
    {
      id: 2,
      name: 'Rahul Mehta',
      age: 26,
      match: 87,
      location: 'Delhi',
      budget: '₹950/month',
      bio: 'Graphic designer looking for a creative and quiet flatmate. Love art galleries and indie films.',
      interests: ['Design', 'Art', 'Movies', 'Music'],
      image: 'https://images.unsplash.com/photo-1629507208649-70919ca33793?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYW4lMjBidXNpbmVzcyUyMHBvcnRyYWl0fGVufDF8fHx8MTc3NDY5MzkzNHww&ixlib=rb-4.1.0&q=80&w=800',
    },
    {
      id: 3,
      name: 'Neha Sharma',
      age: 25,
      match: 91,
      location: 'Bengaluru',
      budget: '₹750/month',
      bio: 'Marketing professional who enjoys yoga and healthy cooking. Looking for a positive living environment.',
      interests: ['Yoga', 'Fitness', 'Cooking', 'Meditation'],
      image: 'https://images.unsplash.com/photo-1672390933634-6ccb1da5fa40?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHdvbWFuJTIwc3VuZ2xhc3NlcyUyMHBvcnRyYWl0fGVufDF8fHx8MTc3NDgxMDQ4OHww&ixlib=rb-4.1.0&q=80&w=800',
    },
  ];

  const currentProfile = profiles[currentIndex];

  const handleLike = () => {
    if (currentIndex < profiles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePass = () => {
    if (currentIndex < profiles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Main Card */}
      <div className="col-span-2 bg-white rounded-3xl p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-semibold">Discover Matches</h2>
          <span className="text-gray-500">
            {currentIndex + 1} / {profiles.length}
          </span>
        </div>

        {currentProfile ? (
          <div className="space-y-6">
            <div className="relative">
              <img
                src={currentProfile.image}
                alt={currentProfile.name}
                className="w-full h-[500px] object-cover rounded-2xl"
              />
              <div className="absolute top-6 right-6">
                <span className="bg-emerald-500 text-white px-6 py-2 rounded-full font-semibold">
                  {currentProfile.match}% Match
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-3xl font-semibold mb-2">
                {currentProfile.name}, {currentProfile.age}
              </h3>
              <div className="flex items-center gap-4 text-gray-600 mb-4">
                <span>📍 {currentProfile.location}</span>
                <span>💰 {currentProfile.budget}</span>
              </div>
              <p className="text-gray-600 mb-6">{currentProfile.bio}</p>

              <div className="flex flex-wrap gap-2 mb-8">
                {currentProfile.interests.map((interest) => (
                  <span
                    key={interest}
                    className="px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-medium"
                  >
                    {interest}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-center gap-6">
                <button
                  onClick={handlePass}
                  className="w-16 h-16 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="w-8 h-8 text-gray-600" />
                </button>
                <button className="w-16 h-16 bg-yellow-100 hover:bg-yellow-200 rounded-full flex items-center justify-center transition-colors">
                  <Star className="w-8 h-8 text-yellow-600" />
                </button>
                <button
                  onClick={handleLike}
                  className="w-16 h-16 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors"
                >
                  <Heart className="w-8 h-8 text-white" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-xl text-gray-500">No more profiles to show</p>
            <button
              onClick={() => setCurrentIndex(0)}
              className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Start Over
            </button>
          </div>
        )}
      </div>

      {/* Sidebar Stats */}
      <div className="space-y-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <h3 className="text-xl font-semibold mb-4">Today's Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Eye className="w-5 h-5 text-blue-600" />
                </div>
                <span className="font-medium">Profiles Viewed</span>
              </div>
              <span className="text-2xl font-bold text-blue-600">12</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-red-600" />
                </div>
                <span className="font-medium">Likes Sent</span>
              </div>
              <span className="text-2xl font-bold text-red-600">5</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <span className="font-medium">New Matches</span>
              </div>
              <span className="text-2xl font-bold text-green-600">3</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-6 shadow-sm text-white">
          <Star className="w-8 h-8 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Upgrade to Premium</h3>
          <p className="text-sm text-blue-100 mb-4">
            Get unlimited likes, see who liked you, and boost your profile
          </p>
          <button className="w-full bg-white text-blue-600 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors">
            Upgrade Now
          </button>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <h3 className="text-xl font-semibold mb-4">Quick Tips</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <p className="text-sm text-gray-700">
                Complete your profile to increase match quality
              </p>
            </div>
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
              <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
              <p className="text-sm text-gray-700">
                Be responsive to messages within 24 hours
              </p>
            </div>
            <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
              <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
              <p className="text-sm text-gray-700">
                Update your preferences regularly for better matches
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

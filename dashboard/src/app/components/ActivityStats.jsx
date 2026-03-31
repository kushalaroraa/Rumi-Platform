import { TrendingUp, Eye, Heart, MessageCircle, Users, Calendar, Target, Award } from 'lucide-react';

export function ActivityStats() {
  const weeklyData = [
    { day: 'Mon', views: 45, likes: 12, messages: 8 },
    { day: 'Tue', views: 52, likes: 15, messages: 10 },
    { day: 'Wed', views: 48, likes: 10, messages: 7 },
    { day: 'Thu', views: 65, likes: 18, messages: 12 },
    { day: 'Fri', views: 58, likes: 14, messages: 9 },
    { day: 'Sat', views: 70, likes: 20, messages: 15 },
    { day: 'Sun', views: 55, likes: 16, messages: 11 },
  ];

  const maxValue = Math.max(...weeklyData.map(d => Math.max(d.views, d.likes, d.messages)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="w-6 h-6 text-blue-600" />
          <h2 className="text-3xl font-semibold">Activity & Statistics</h2>
        </div>
        <p className="text-gray-500">Track your profile performance and engagement</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-sm text-white">
          <Eye className="w-8 h-8 mb-3 opacity-80" />
          <div className="text-4xl font-bold mb-1">393</div>
          <p className="text-blue-100">Profile Views</p>
          <div className="flex items-center gap-1 mt-2 text-sm">
            <TrendingUp className="w-4 h-4" />
            <span>+12% this week</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 shadow-sm text-white">
          <Heart className="w-8 h-8 mb-3 opacity-80" />
          <div className="text-4xl font-bold mb-1">105</div>
          <p className="text-red-100">Likes Received</p>
          <div className="flex items-center gap-1 mt-2 text-sm">
            <TrendingUp className="w-4 h-4" />
            <span>+8% this week</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 shadow-sm text-white">
          <MessageCircle className="w-8 h-8 mb-3 opacity-80" />
          <div className="text-4xl font-bold mb-1">72</div>
          <p className="text-green-100">Messages</p>
          <div className="flex items-center gap-1 mt-2 text-sm">
            <TrendingUp className="w-4 h-4" />
            <span>+15% this week</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 shadow-sm text-white">
          <Users className="w-8 h-8 mb-3 opacity-80" />
          <div className="text-4xl font-bold mb-1">24</div>
          <p className="text-purple-100">Total Matches</p>
          <div className="flex items-center gap-1 mt-2 text-sm">
            <TrendingUp className="w-4 h-4" />
            <span>+3 this week</span>
          </div>
        </div>
      </div>

      {/* Weekly Activity Chart */}
      <div className="bg-white rounded-3xl p-8 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-semibold">Weekly Activity</h3>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              <span className="text-sm text-gray-600">Views</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-600 rounded-full"></div>
              <span className="text-sm text-gray-600">Likes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-600 rounded-full"></div>
              <span className="text-sm text-gray-600">Messages</span>
            </div>
          </div>
        </div>

        <div className="flex items-end justify-between gap-4 h-80">
          {weeklyData.map((data) => (
            <div key={data.day} className="flex-1 flex flex-col items-center gap-4">
              <div className="w-full flex items-end justify-center gap-1 h-64">
                <div
                  className="w-full bg-blue-200 rounded-t-lg hover:bg-blue-300 transition-colors cursor-pointer"
                  style={{ height: `${(data.views / maxValue) * 100}%` }}
                  title={`${data.views} views`}
                ></div>
                <div
                  className="w-full bg-red-200 rounded-t-lg hover:bg-red-300 transition-colors cursor-pointer"
                  style={{ height: `${(data.likes / maxValue) * 100}%` }}
                  title={`${data.likes} likes`}
                ></div>
                <div
                  className="w-full bg-green-200 rounded-t-lg hover:bg-green-300 transition-colors cursor-pointer"
                  style={{ height: `${(data.messages / maxValue) * 100}%` }}
                  title={`${data.messages} messages`}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-600">{data.day}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Match Success Rate */}
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Target className="w-5 h-5 text-blue-600" />
            <h3 className="text-xl font-semibold">Match Success Rate</h3>
          </div>

          <div className="flex items-center justify-center mb-6">
            <div className="relative w-48 h-48">
              <svg className="w-48 h-48 transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="#e5e7eb"
                  strokeWidth="16"
                  fill="none"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="#3b82f6"
                  strokeWidth="16"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 88}`}
                  strokeDashoffset={`${2 * Math.PI * 88 * (1 - 0.76)}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-bold text-blue-600">76%</span>
                <span className="text-sm text-gray-500">Success Rate</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Sent Requests</span>
              <span className="font-semibold">42</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Accepted</span>
              <span className="font-semibold text-green-600">32</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Pending</span>
              <span className="font-semibold text-yellow-600">7</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Declined</span>
              <span className="font-semibold text-red-600">3</span>
            </div>
          </div>
        </div>

        {/* Response Time & Achievements */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h3 className="text-xl font-semibold">Response Time</h3>
            </div>

            <div className="text-center mb-4">
              <div className="text-5xl font-bold text-blue-600 mb-2">2.4h</div>
              <p className="text-gray-600">Average Response Time</p>
            </div>

            <div className="bg-green-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-900">Quick Responder</span>
              </div>
              <p className="text-sm text-green-700">
                You respond 65% faster than average users!
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Award className="w-5 h-5 text-blue-600" />
              <h3 className="text-xl font-semibold">Achievements</h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                <div className="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center text-2xl">
                  🏆
                </div>
                <div>
                  <p className="font-semibold text-yellow-900">100 Likes</p>
                  <p className="text-sm text-yellow-700">Reached 100 profile likes</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center text-2xl">
                  ⭐
                </div>
                <div>
                  <p className="font-semibold text-blue-900">Perfect Match</p>
                  <p className="text-sm text-blue-700">Found a 95%+ match</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center text-2xl">
                  💬
                </div>
                <div>
                  <p className="font-semibold text-green-900">Conversationalist</p>
                  <p className="text-sm text-green-700">Sent 50+ messages</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Performance Tips */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-8 shadow-sm text-white">
        <h3 className="text-2xl font-semibold mb-4">Boost Your Profile Performance</h3>
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white/10 backdrop-blur rounded-xl p-4">
            <div className="text-3xl mb-2">📸</div>
            <h4 className="font-semibold mb-2">Add More Photos</h4>
            <p className="text-sm text-blue-100">
              Profiles with 5+ photos get 3x more matches
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-4">
            <div className="text-3xl mb-2">✍️</div>
            <h4 className="font-semibold mb-2">Complete Bio</h4>
            <p className="text-sm text-blue-100">
              Detailed bios increase responses by 80%
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-4">
            <div className="text-3xl mb-2">⚡</div>
            <h4 className="font-semibold mb-2">Stay Active</h4>
            <p className="text-sm text-blue-100">
              Active users get prioritized in search
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

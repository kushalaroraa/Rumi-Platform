import { Users, TrendingUp, DollarSign, AlertTriangle, UserPlus, Activity, Eye, MessageSquare } from 'lucide-react';

export function AdminDashboard() {
  const recentUsers = [
    {
      id: 1,
      name: 'Priya Sharma',
      email: 'priya.sharma@email.com',
      joined: '2 hours ago',
      status: 'active',
      image: 'https://images.unsplash.com/photo-1623594675959-02360202d4d6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMHNtaWxpbmclMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzQ3MjgzMjV8MA&ixlib=rb-4.1.0&q=80&w=400',
    },
    {
      id: 2,
      name: 'Arjun Patel',
      email: 'arjun.patel@email.com',
      joined: '5 hours ago',
      status: 'active',
      image: 'https://images.unsplash.com/photo-1629507208649-70919ca33793?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYW4lMjBidXNpbmVzcyUyMHBvcnRyYWl0fGVufDF8fHx8MTc3NDY5MzkzNHww&ixlib=rb-4.1.0&q=80&w=400',
    },
    {
      id: 3,
      name: 'Ananya Reddy',
      email: 'ananya.reddy@email.com',
      joined: '1 day ago',
      status: 'pending',
      image: 'https://images.unsplash.com/photo-1672390933634-6ccb1da5fa40?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHdvbWFuJTIwc3VuZ2xhc3NlcyUyMHBvcnRyYWl0fGVufDF8fHx8MTc3NDgxMDQ4OHww&ixlib=rb-4.1.0&q=80&w=400',
    },
  ];

  const pendingReports = [
    { id: 1, reporter: 'User #2451', reported: 'User #1532', reason: 'Inappropriate content', time: '30 min ago' },
    { id: 2, reporter: 'User #3892', reported: 'User #2104', reason: 'Spam messages', time: '1 hour ago' },
    { id: 3, reporter: 'User #1245', reported: 'User #4521', reason: 'Fake profile', time: '3 hours ago' },
  ];

  const weeklyData = [
    { day: 'Mon', users: 45 },
    { day: 'Tue', users: 52 },
    { day: 'Wed', users: 48 },
    { day: 'Thu', users: 65 },
    { day: 'Fri', users: 58 },
    { day: 'Sat', users: 70 },
    { day: 'Sun', users: 55 },
  ];

  const maxUsers = Math.max(...weeklyData.map(d => d.users));

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-sm text-white">
          <Users className="w-8 h-8 mb-3 opacity-80" />
          <div className="text-4xl font-bold mb-1">12,458</div>
          <p className="text-blue-100">Total Users</p>
          <div className="flex items-center gap-1 mt-2 text-sm">
            <TrendingUp className="w-4 h-4" />
            <span>+8.2% this month</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 shadow-sm text-white">
          <Activity className="w-8 h-8 mb-3 opacity-80" />
          <div className="text-4xl font-bold mb-1">8,234</div>
          <p className="text-green-100">Active Users</p>
          <div className="flex items-center gap-1 mt-2 text-sm">
            <TrendingUp className="w-4 h-4" />
            <span>+12.5% this week</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 shadow-sm text-white">
          <DollarSign className="w-8 h-8 mb-3 opacity-80" />
          <div className="text-4xl font-bold mb-1">₹38.2L</div>
          <p className="text-purple-100">Revenue (MTD)</p>
          <div className="flex items-center gap-1 mt-2 text-sm">
            <TrendingUp className="w-4 h-4" />
            <span>+15.3% vs last month</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 shadow-sm text-white">
          <AlertTriangle className="w-8 h-8 mb-3 opacity-80" />
          <div className="text-4xl font-bold mb-1">8</div>
          <p className="text-red-100">Pending Reports</p>
          <div className="flex items-center gap-1 mt-2 text-sm">
            <span>Requires attention</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* User Growth Chart */}
        <div className="col-span-2 bg-white rounded-3xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-semibold mb-1">User Growth</h3>
              <p className="text-gray-500">New user registrations this week</p>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">Week</button>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">Month</button>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">Year</button>
            </div>
          </div>

          <div className="flex items-end justify-between gap-4 h-64">
            {weeklyData.map((data) => (
              <div key={data.day} className="flex-1 flex flex-col items-center gap-4">
                <div className="w-full flex items-end justify-center h-48">
                  <div
                    className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg hover:from-blue-600 hover:to-blue-500 transition-colors cursor-pointer relative group"
                    style={{ height: `${(data.users / maxUsers) * 100}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {data.users} users
                    </div>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-600">{data.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">393</p>
                <p className="text-sm text-gray-600">New Today</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">15.2K</p>
                <p className="text-sm text-gray-600">Profile Views</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">8.7K</p>
                <p className="text-sm text-gray-600">Messages Sent</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">Recent Users</h3>
            <button className="text-blue-600 text-sm font-medium hover:underline">View All</button>
          </div>

          <div className="space-y-4">
            {recentUsers.map((user) => (
              <div key={user.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <img
                  src={user.image}
                  alt={user.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold truncate">{user.name}</h4>
                  <p className="text-sm text-gray-600 truncate">{user.email}</p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      user.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {user.status}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">{user.joined}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Reports */}
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-semibold">Pending Reports</h3>
              <span className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-1 rounded-full">
                {pendingReports.length}
              </span>
            </div>
            <button className="text-blue-600 text-sm font-medium hover:underline">View All</button>
          </div>

          <div className="space-y-4">
            {pendingReports.map((report) => (
              <div key={report.id} className="p-4 bg-red-50 rounded-xl border border-red-100">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{report.reason}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {report.reporter} reported {report.reported}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500">{report.time}</span>
                </div>
                <div className="flex gap-2 mt-3">
                  <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                    Review
                  </button>
                  <button className="px-4 py-2 bg-white text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors border border-gray-200">
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white rounded-3xl p-8 shadow-sm">
        <h3 className="text-xl font-semibold mb-6">System Health</h3>
        <div className="grid grid-cols-4 gap-6">
          <div className="text-center">
            <div className="relative w-32 h-32 mx-auto mb-3">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="56" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="#10b981"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - 0.98)}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-green-600">98%</span>
              </div>
            </div>
            <p className="font-medium">Server Uptime</p>
          </div>

          <div className="text-center">
            <div className="relative w-32 h-32 mx-auto mb-3">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="56" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="#3b82f6"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - 0.45)}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-600">45%</span>
              </div>
            </div>
            <p className="font-medium">CPU Usage</p>
          </div>

          <div className="text-center">
            <div className="relative w-32 h-32 mx-auto mb-3">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="56" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="#8b5cf6"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - 0.62)}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-purple-600">62%</span>
              </div>
            </div>
            <p className="font-medium">Memory Usage</p>
          </div>

          <div className="text-center">
            <div className="relative w-32 h-32 mx-auto mb-3">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="56" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="#f59e0b"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - 0.78)}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-yellow-600">78%</span>
              </div>
            </div>
            <p className="font-medium">Storage Usage</p>
          </div>
        </div>
      </div>
    </div>
  );
}

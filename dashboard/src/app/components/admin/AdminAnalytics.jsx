import { TrendingUp, Users, DollarSign, Activity, ArrowUp, ArrowDown } from 'lucide-react';

export function AdminAnalytics() {
  const monthlyData = [
    { month: 'Jan', users: 850, revenue: 12400, matches: 4200 },
    { month: 'Feb', users: 920, revenue: 14200, matches: 4800 },
    { month: 'Mar', users: 1050, revenue: 16800, matches: 5400 },
    { month: 'Apr', users: 980, revenue: 15200, matches: 5100 },
    { month: 'May', users: 1150, revenue: 18600, matches: 6200 },
    { month: 'Jun', users: 1280, revenue: 21400, matches: 6800 },
  ];

  const maxValue = Math.max(...monthlyData.map(d => Math.max(d.users, d.revenue / 20, d.matches / 50)));

  const topLocations = [
    { city: 'New York', users: 3245, percentage: 26 },
    { city: 'Los Angeles', users: 2456, percentage: 20 },
    { city: 'Chicago', users: 1892, percentage: 15 },
    { city: 'Houston', users: 1543, percentage: 12 },
    { city: 'Phoenix', users: 1234, percentage: 10 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-8 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-semibold mb-2">Analytics & Insights</h2>
            <p className="text-gray-500">Track platform performance and user behavior</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">Last 7 Days</button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">Last 30 Days</button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">Last 6 Months</button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <span className="flex items-center gap-1 text-green-600 text-sm font-semibold">
              <ArrowUp className="w-4 h-4" />
              12.5%
            </span>
          </div>
          <p className="text-gray-600 text-sm mb-1">User Growth</p>
          <p className="text-3xl font-bold text-gray-900">+7,236</p>
          <p className="text-xs text-gray-500 mt-1">vs last 6 months</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <span className="flex items-center gap-1 text-green-600 text-sm font-semibold">
              <ArrowUp className="w-4 h-4" />
              18.3%
            </span>
          </div>
          <p className="text-gray-600 text-sm mb-1">Revenue Growth</p>
          <p className="text-3xl font-bold text-gray-900">$98.8K</p>
          <p className="text-xs text-gray-500 mt-1">vs last 6 months</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
            <span className="flex items-center gap-1 text-green-600 text-sm font-semibold">
              <ArrowUp className="w-4 h-4" />
              15.7%
            </span>
          </div>
          <p className="text-gray-600 text-sm mb-1">Match Success Rate</p>
          <p className="text-3xl font-bold text-gray-900">78.4%</p>
          <p className="text-xs text-gray-500 mt-1">vs last 6 months</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-red-600" />
            </div>
            <span className="flex items-center gap-1 text-red-600 text-sm font-semibold">
              <ArrowDown className="w-4 h-4" />
              3.2%
            </span>
          </div>
          <p className="text-gray-600 text-sm mb-1">Churn Rate</p>
          <p className="text-3xl font-bold text-gray-900">4.8%</p>
          <p className="text-xs text-gray-500 mt-1">vs last 6 months</p>
        </div>
      </div>

      {/* Growth Chart */}
      <div className="bg-white rounded-3xl p-8 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-semibold">6-Month Performance Overview</h3>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              <span className="text-sm text-gray-600">Users</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-600 rounded-full"></div>
              <span className="text-sm text-gray-600">Revenue ($)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
              <span className="text-sm text-gray-600">Matches</span>
            </div>
          </div>
        </div>

        <div className="flex items-end justify-between gap-8 h-96">
          {monthlyData.map((data) => (
            <div key={data.month} className="flex-1 flex flex-col items-center gap-4">
              <div className="w-full flex items-end justify-center gap-2 h-80">
                <div
                  className="w-full bg-blue-200 rounded-t-lg hover:bg-blue-300 transition-colors cursor-pointer relative group"
                  style={{ height: `${(data.users / maxValue) * 100}%` }}
                  title={`${data.users} users`}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {data.users} users
                  </div>
                </div>
                <div
                  className="w-full bg-green-200 rounded-t-lg hover:bg-green-300 transition-colors cursor-pointer relative group"
                  style={{ height: `${((data.revenue / 20) / maxValue) * 100}%` }}
                  title={`$${data.revenue}`}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    ${data.revenue}
                  </div>
                </div>
                <div
                  className="w-full bg-purple-200 rounded-t-lg hover:bg-purple-300 transition-colors cursor-pointer relative group"
                  style={{ height: `${((data.matches / 50) / maxValue) * 100}%` }}
                  title={`${data.matches} matches`}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {data.matches} matches
                  </div>
                </div>
              </div>
              <span className="text-sm font-medium text-gray-600">{data.month}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Top Locations */}
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <h3 className="text-2xl font-semibold mb-6">Top Locations</h3>
          <div className="space-y-4">
            {topLocations.map((location, index) => (
              <div key={location.city} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                    <span className="font-semibold">{location.city}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{location.users.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">{location.percentage}%</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${location.percentage * 4}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Demographics */}
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <h3 className="text-2xl font-semibold mb-6">User Demographics</h3>
          
          <div className="space-y-6">
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">Age Distribution</p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-600 w-20">18-24</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '35%' }}></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 w-12 text-right">35%</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-600 w-20">25-34</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '42%' }}></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 w-12 text-right">42%</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-600 w-20">35-44</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '18%' }}></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 w-12 text-right">18%</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-600 w-20">45+</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '5%' }}></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 w-12 text-right">5%</span>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">Gender Distribution</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-blue-600 mb-1">52%</p>
                  <p className="text-sm text-gray-600">Female</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-purple-600 mb-1">48%</p>
                  <p className="text-sm text-gray-600">Male</p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">Subscription Status</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-green-600 mb-1">23%</p>
                  <p className="text-sm text-gray-600">Premium</p>
                </div>
                <div className="bg-gray-100 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-gray-600 mb-1">77%</p>
                  <p className="text-sm text-gray-600">Free</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Engagement Metrics */}
      <div className="bg-white rounded-3xl p-8 shadow-sm">
        <h3 className="text-2xl font-semibold mb-6">Engagement Metrics</h3>
        <div className="grid grid-cols-4 gap-6">
          <div className="text-center p-6 bg-blue-50 rounded-2xl">
            <p className="text-4xl font-bold text-blue-600 mb-2">4.2</p>
            <p className="text-gray-600">Avg. Sessions/Day</p>
          </div>
          <div className="text-center p-6 bg-green-50 rounded-2xl">
            <p className="text-4xl font-bold text-green-600 mb-2">12m</p>
            <p className="text-gray-600">Avg. Session Duration</p>
          </div>
          <div className="text-center p-6 bg-purple-50 rounded-2xl">
            <p className="text-4xl font-bold text-purple-600 mb-2">8.5</p>
            <p className="text-gray-600">Messages per User</p>
          </div>
          <div className="text-center p-6 bg-yellow-50 rounded-2xl">
            <p className="text-4xl font-bold text-yellow-600 mb-2">2.4h</p>
            <p className="text-gray-600">Avg. Response Time</p>
          </div>
        </div>
      </div>
    </div>
  );
}

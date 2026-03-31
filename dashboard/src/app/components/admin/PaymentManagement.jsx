import { DollarSign, CreditCard, TrendingUp, CheckCircle, Clock, XCircle, Download } from 'lucide-react';

export function PaymentManagement() {
  const transactions = [
    {
      id: 1,
      user: 'Aarushi Kapoor',
      email: 'aarushi.kapoor@email.com',
      amount: 29.99,
      plan: 'Premium Monthly',
      status: 'completed',
      date: 'Mar 28, 2026',
      method: 'Visa •••• 4242',
      image: 'https://images.unsplash.com/photo-1623594675959-02360202d4d6?w=400',
    },
    {
      id: 2,
      user: 'Vikram Patel',
      email: 'vikram.patel@email.com',
      amount: 299.99,
      plan: 'Premium Yearly',
      status: 'completed',
      date: 'Mar 27, 2026',
      method: 'Mastercard •••• 5555',
      image: 'https://images.unsplash.com/photo-1629507208649-70919ca33793?w=400',
    },
    {
      id: 3,
      user: 'Neha Verma',
      email: 'neha.verma@email.com',
      amount: 29.99,
      plan: 'Premium Monthly',
      status: 'pending',
      date: 'Mar 29, 2026',
      method: 'Visa •••• 1234',
      image: 'https://images.unsplash.com/photo-1672390933634-6ccb1da5fa40?w=400',
    },
    {
      id: 4,
      user: 'Rohan Singh',
      email: 'rohan.singh@email.com',
      amount: 29.99,
      plan: 'Premium Monthly',
      status: 'failed',
      date: 'Mar 28, 2026',
      method: 'Amex •••• 8888',
      image: 'https://images.unsplash.com/photo-1768489038932-a63eef1fe51f?w=400',
    },
    {
      id: 5,
      user: 'Priya Nair',
      email: 'priya.nair@email.com',
      amount: 299.99,
      plan: 'Premium Yearly',
      status: 'completed',
      date: 'Mar 26, 2026',
      method: 'Visa •••• 9999',
      image: 'https://images.unsplash.com/photo-1762474316414-afbf5c1eff26?w=400',
    },
  ];

  const revenueData = [
    { month: 'Oct', revenue: 32400 },
    { month: 'Nov', revenue: 38200 },
    { month: 'Dec', revenue: 42800 },
    { month: 'Jan', revenue: 45200 },
    { month: 'Feb', revenue: 48600 },
    { month: 'Mar', revenue: 51400 },
  ];

  const maxRevenue = Math.max(...revenueData.map(d => d.revenue));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-8 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-semibold mb-2">Payment Management</h2>
            <p className="text-gray-500">Track and manage all platform transactions</p>
          </div>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Report
          </button>
        </div>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 shadow-sm text-white">
          <DollarSign className="w-8 h-8 mb-3 opacity-80" />
          <div className="text-4xl font-bold mb-1">$51.4K</div>
          <p className="text-green-100">Revenue (MTD)</p>
          <div className="flex items-center gap-1 mt-2 text-sm">
            <TrendingUp className="w-4 h-4" />
            <span>+15.2% vs last month</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-sm text-white">
          <CreditCard className="w-8 h-8 mb-3 opacity-80" />
          <div className="text-4xl font-bold mb-1">1,247</div>
          <p className="text-blue-100">Transactions</p>
          <div className="flex items-center gap-1 mt-2 text-sm">
            <TrendingUp className="w-4 h-4" />
            <span>+8.5% this month</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 shadow-sm text-white">
          <CheckCircle className="w-8 h-8 mb-3 opacity-80" />
          <div className="text-4xl font-bold mb-1">2,856</div>
          <p className="text-purple-100">Active Subscriptions</p>
          <div className="flex items-center gap-1 mt-2 text-sm">
            <TrendingUp className="w-4 h-4" />
            <span>+12.3% this month</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-6 shadow-sm text-white">
          <DollarSign className="w-8 h-8 mb-3 opacity-80" />
          <div className="text-4xl font-bold mb-1">$41.23</div>
          <p className="text-yellow-100">Avg. Transaction</p>
          <div className="flex items-center gap-1 mt-2 text-sm">
            <span>Per user</span>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-3xl p-8 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-semibold mb-1">Revenue Overview</h3>
            <p className="text-gray-500">Monthly revenue trends</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">6 Months</button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">Year</button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">All Time</button>
          </div>
        </div>

        <div className="flex items-end justify-between gap-6 h-80">
          {revenueData.map((data) => (
            <div key={data.month} className="flex-1 flex flex-col items-center gap-4">
              <div className="w-full flex items-end justify-center h-64">
                <div
                  className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t-lg hover:from-green-600 hover:to-green-500 transition-colors cursor-pointer relative group"
                  style={{ height: `${(data.revenue / maxRevenue) * 100}%` }}
                >
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    <p className="font-semibold">${(data.revenue / 1000).toFixed(1)}K</p>
                  </div>
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white font-bold text-sm">
                    ${(data.revenue / 1000).toFixed(1)}K
                  </div>
                </div>
              </div>
              <span className="text-sm font-medium text-gray-600">{data.month}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Transaction Status */}
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <h3 className="text-xl font-semibold mb-6">Transaction Status</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-green-900">Completed</p>
                  <p className="text-sm text-green-700">1,198 transactions</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-green-600">96%</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="font-semibold text-yellow-900">Pending</p>
                  <p className="text-sm text-yellow-700">32 transactions</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-yellow-600">3%</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="font-semibold text-red-900">Failed</p>
                  <p className="text-sm text-red-700">17 transactions</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-red-600">1%</span>
            </div>
          </div>
        </div>

        {/* Subscription Plans */}
        <div className="col-span-2 bg-white rounded-3xl p-8 shadow-sm">
          <h3 className="text-xl font-semibold mb-6">Subscription Plans Distribution</h3>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border-2 border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-blue-900">Monthly Premium</h4>
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  $29.99
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-800">Active Users</span>
                  <span className="text-xl font-bold text-blue-900">1,842</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-800">Monthly Revenue</span>
                  <span className="text-xl font-bold text-blue-900">$55.2K</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '64%' }}></div>
                </div>
                <p className="text-xs text-blue-700">64% of premium users</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border-2 border-purple-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-purple-900">Yearly Premium</h4>
                <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  $299.99
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-purple-800">Active Users</span>
                  <span className="text-xl font-bold text-purple-900">1,014</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-purple-800">Annual Revenue</span>
                  <span className="text-xl font-bold text-purple-900">$304K</span>
                </div>
                <div className="w-full bg-purple-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '36%' }}></div>
                </div>
                <p className="text-xs text-purple-700">36% of premium users</p>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">Total Premium Revenue</p>
                <p className="text-sm text-gray-600">Combined monthly average</p>
              </div>
              <p className="text-3xl font-bold text-gray-900">$80.5K</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-200">
          <h3 className="text-2xl font-semibold">Recent Transactions</h3>
        </div>

        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-8 py-4 text-sm font-semibold text-gray-700">User</th>
              <th className="text-left px-4 py-4 text-sm font-semibold text-gray-700">Plan</th>
              <th className="text-left px-4 py-4 text-sm font-semibold text-gray-700">Amount</th>
              <th className="text-left px-4 py-4 text-sm font-semibold text-gray-700">Payment Method</th>
              <th className="text-left px-4 py-4 text-sm font-semibold text-gray-700">Date</th>
              <th className="text-left px-8 py-4 text-sm font-semibold text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-8 py-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={transaction.image}
                      alt={transaction.user}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">{transaction.user}</p>
                      <p className="text-sm text-gray-500">{transaction.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                    {transaction.plan}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <p className="font-bold text-gray-900">${transaction.amount}</p>
                </td>
                <td className="px-4 py-4">
                  <p className="text-sm text-gray-600">{transaction.method}</p>
                </td>
                <td className="px-4 py-4">
                  <p className="text-sm text-gray-600">{transaction.date}</p>
                </td>
                <td className="px-8 py-4">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                      transaction.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : transaction.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {transaction.status === 'completed' ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : transaction.status === 'pending' ? (
                      <Clock className="w-3 h-3" />
                    ) : (
                      <XCircle className="w-3 h-3" />
                    )}
                    {transaction.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="px-8 py-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-600">Showing 5 of 1,247 transactions</p>
          <button className="text-blue-600 text-sm font-medium hover:underline">View All Transactions</button>
        </div>
      </div>
    </div>
  );
}

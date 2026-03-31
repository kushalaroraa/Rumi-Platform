import { Search, Filter, MoreVertical, Ban, CheckCircle, Mail, Shield, Eye, Trash2 } from 'lucide-react';
import { useState } from 'react';

export function UserManagement() {
  const [filter, setFilter] = useState('all');

  const users = [
    {
      id: 1,
      name: 'Aarushi Kapoor',
      email: 'aarushi.kapoor@email.com',
      phone: '+1 234 567 8900',
      joined: 'Jan 15, 2026',
      status: 'active',
      verified: true,
      matches: 24,
      subscription: 'Premium',
      image: 'https://images.unsplash.com/photo-1623594675959-02360202d4d6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMHNtaWxpbmclMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzQ3MjgzMjV8MA&ixlib=rb-4.1.0&q=80&w=400',
    },
    {
      id: 2,
      name: 'Vikram Patel',
      email: 'vikram.patel@email.com',
      phone: '+1 234 567 8901',
      joined: 'Jan 20, 2026',
      status: 'active',
      verified: true,
      matches: 18,
      subscription: 'Free',
      image: 'https://images.unsplash.com/photo-1629507208649-70919ca33793?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYW4lMjBidXNpbmVzcyUyMHBvcnRyYWl0fGVufDF8fHx8MTc3NDY5MzkzNHww&ixlib=rb-4.1.0&q=80&w=400',
    },
    {
      id: 3,
      name: 'Neha Verma',
      email: 'neha.verma@email.com',
      phone: '+1 234 567 8902',
      joined: 'Feb 5, 2026',
      status: 'suspended',
      verified: false,
      matches: 12,
      subscription: 'Free',
      image: 'https://images.unsplash.com/photo-1672390933634-6ccb1da5fa40?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHdvbWFuJTIwc3VuZ2xhc3NlcyUyMHBvcnRyYWl0fGVufDF8fHx8MTc3NDgxMDQ4OHww&ixlib=rb-4.1.0&q=80&w=400',
    },
    {
      id: 4,
      name: 'Rohan Singh',
      email: 'rohan.singh@email.com',
      phone: '+1 234 567 8903',
      joined: 'Feb 10, 2026',
      status: 'active',
      verified: true,
      matches: 31,
      subscription: 'Premium',
      image: 'https://images.unsplash.com/photo-1768489038932-a63eef1fe51f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW4lMjBmb3JtYWwlMjBwb3J0cmFpdCUyMGhlYWRzaG90fGVufDF8fHx8MTc3NDgxMDQ4OXww&ixlib=rb-4.1.0&q=80&w=400',
    },
    {
      id: 5,
      name: 'Priya Nair',
      email: 'priya.nair@email.com',
      phone: '+1 234 567 8904',
      joined: 'Mar 1, 2026',
      status: 'inactive',
      verified: false,
      matches: 5,
      subscription: 'Free',
      image: 'https://images.unsplash.com/photo-1762474316414-afbf5c1eff26?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHdvbWFuJTIwcmVkJTIwc2hpcnQlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzQ4MTA0ODl8MA&ixlib=rb-4.1.0&q=80&w=400',
    },
    {
      id: 6,
      name: 'Arjun Reddy',
      email: 'arjun.reddy@email.com',
      phone: '+1 234 567 8905',
      joined: 'Mar 10, 2026',
      status: 'active',
      verified: true,
      matches: 27,
      subscription: 'Premium',
      image: 'https://images.unsplash.com/photo-1548600983-a171dced97f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBidXNpbmVzc21hbiUyMGhlYWRzaG90fGVufDF8fHx8MTc3NDgwODI4M3ww&ixlib=rb-4.1.0&q=80&w=400',
    },
  ];

  const filteredUsers = filter === 'all' ? users : users.filter(u => u.status === filter || u.subscription.toLowerCase() === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-8 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-semibold mb-2">User Management</h2>
            <p className="text-gray-500">Manage and monitor all registered users</p>
          </div>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
            Export Users
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <p className="text-gray-600 text-sm mb-1">Total Users</p>
          <p className="text-3xl font-bold text-gray-900">12,458</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <p className="text-gray-600 text-sm mb-1">Active</p>
          <p className="text-3xl font-bold text-green-600">8,234</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <p className="text-gray-600 text-sm mb-1">Suspended</p>
          <p className="text-3xl font-bold text-red-600">142</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <p className="text-gray-600 text-sm mb-1">Premium</p>
          <p className="text-3xl font-bold text-purple-600">2,856</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <p className="text-gray-600 text-sm mb-1">Verified</p>
          <p className="text-3xl font-bold text-blue-600">9,432</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name, email, or phone..."
              className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-lg border border-gray-200 outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                filter === 'active' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter('suspended')}
              className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                filter === 'suspended' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Suspended
            </button>
            <button
              onClick={() => setFilter('premium')}
              className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                filter === 'premium' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Premium
            </button>
          </div>
          <button className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-8 py-4 text-sm font-semibold text-gray-700">User</th>
              <th className="text-left px-4 py-4 text-sm font-semibold text-gray-700">Contact</th>
              <th className="text-left px-4 py-4 text-sm font-semibold text-gray-700">Joined</th>
              <th className="text-left px-4 py-4 text-sm font-semibold text-gray-700">Status</th>
              <th className="text-left px-4 py-4 text-sm font-semibold text-gray-700">Subscription</th>
              <th className="text-left px-4 py-4 text-sm font-semibold text-gray-700">Matches</th>
              <th className="text-right px-8 py-4 text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-8 py-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.image}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-gray-900 flex items-center gap-2">
                        {user.name}
                        {user.verified && (
                          <CheckCircle className="w-4 h-4 text-blue-600" />
                        )}
                      </p>
                      <p className="text-sm text-gray-500">ID: #{user.id}2451</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <p className="text-sm text-gray-900">{user.email}</p>
                  <p className="text-sm text-gray-500">{user.phone}</p>
                </td>
                <td className="px-4 py-4">
                  <p className="text-sm text-gray-900">{user.joined}</p>
                </td>
                <td className="px-4 py-4">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      user.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : user.status === 'suspended'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {user.status}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      user.subscription === 'Premium'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {user.subscription}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <p className="text-sm font-semibold text-gray-900">{user.matches}</p>
                </td>
                <td className="px-8 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-2 hover:bg-blue-50 rounded-lg transition-colors" title="View Profile">
                      <Eye className="w-4 h-4 text-blue-600" />
                    </button>
                    <button className="p-2 hover:bg-green-50 rounded-lg transition-colors" title="Send Email">
                      <Mail className="w-4 h-4 text-green-600" />
                    </button>
                    <button className="p-2 hover:bg-red-50 rounded-lg transition-colors" title="Suspend User">
                      <Ban className="w-4 h-4 text-red-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <MoreVertical className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Pagination */}
        <div className="px-8 py-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-600">Showing 1 to 6 of 12,458 users</p>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
              Previous
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">1</button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
              2
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
              3
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

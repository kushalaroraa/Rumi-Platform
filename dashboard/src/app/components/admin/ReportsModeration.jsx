import { AlertTriangle, Ban, CheckCircle, Eye, MessageSquare, Shield } from 'lucide-react';
import { useState } from 'react';

export function ReportsModeration() {
  const [filter, setFilter] = useState('all');

  const reports = [
    {
      id: 1,
      type: 'Inappropriate Content',
      reporter: { name: 'Aarushi Kapoor', id: '2451', image: 'https://images.unsplash.com/photo-1623594675959-02360202d4d6?w=400' },
      reported: { name: 'Aarav Sharma', id: '1532', image: 'https://images.unsplash.com/photo-1704726135027-9c6f034cfa41?w=400' },
      reason: 'Posted inappropriate photos in profile',
      date: '30 min ago',
      status: 'pending',
      severity: 'high',
    },
    {
      id: 2,
      type: 'Spam Messages',
      reporter: { name: 'Vikram Patel', id: '3892', image: 'https://images.unsplash.com/photo-1629507208649-70919ca33793?w=400' },
      reported: { name: 'Neha Verma', id: '2104', image: 'https://images.unsplash.com/photo-1672390933634-6ccb1da5fa40?w=400' },
      reason: 'Sending repetitive spam messages to multiple users',
      date: '1 hour ago',
      status: 'pending',
      severity: 'medium',
    },
    {
      id: 3,
      type: 'Fake Profile',
      reporter: { name: 'Neha Verma', id: '1245', image: 'https://images.unsplash.com/photo-1672390933634-6ccb1da5fa40?w=400' },
      reported: { name: 'Rohan Singh', id: '4521', image: 'https://images.unsplash.com/photo-1768489038932-a63eef1fe51f?w=400' },
      reason: 'Using stolen photos and fake information',
      date: '3 hours ago',
      status: 'under-review',
      severity: 'high',
    },
    {
      id: 4,
      type: 'Harassment',
      reporter: { name: 'Priya Nair', id: '5632', image: 'https://images.unsplash.com/photo-1762474316414-afbf5c1eff26?w=400' },
      reported: { name: 'Arjun Reddy', id: '7845', image: 'https://images.unsplash.com/photo-1548600983-a171dced97f5?w=400' },
      reason: 'Sending threatening and harassing messages',
      date: '5 hours ago',
      status: 'resolved',
      severity: 'high',
    },
  ];

  const filteredReports = filter === 'all' ? reports : reports.filter(r => r.status === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-8 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-semibold mb-2">Reports & Moderation</h2>
            <p className="text-gray-500">Review and manage user reports and content moderation</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors">
              Urgent Reports
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-3xl font-bold text-red-600">8</span>
          </div>
          <p className="text-gray-600">Pending</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Eye className="w-5 h-5 text-yellow-600" />
            </div>
            <span className="text-3xl font-bold text-yellow-600">15</span>
          </div>
          <p className="text-gray-600">Under Review</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-3xl font-bold text-green-600">142</span>
          </div>
          <p className="text-gray-600">Resolved</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Ban className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-3xl font-bold text-purple-600">34</span>
          </div>
          <p className="text-gray-600">Users Banned</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-3 rounded-lg font-medium transition-colors ${
              filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Reports
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-3 rounded-lg font-medium transition-colors ${
              filter === 'pending' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('under-review')}
            className={`px-4 py-3 rounded-lg font-medium transition-colors ${
              filter === 'under-review' ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Under Review
          </button>
          <button
            onClick={() => setFilter('resolved')}
            className={`px-4 py-3 rounded-lg font-medium transition-colors ${
              filter === 'resolved' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Resolved
          </button>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.map((report) => (
          <div
            key={report.id}
            className={`bg-white rounded-2xl p-6 shadow-sm border-2 ${
              report.severity === 'high' ? 'border-red-200' : 'border-gray-100'
            }`}
          >
            <div className="flex items-start gap-6">
              {/* Report Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">{report.type}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          report.status === 'pending'
                            ? 'bg-red-100 text-red-700'
                            : report.status === 'under-review'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {report.status.replace('-', ' ')}
                      </span>
                      {report.severity === 'high' && (
                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                          High Priority
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-4">{report.reason}</p>
                    <p className="text-sm text-gray-500">Report ID: #{report.id}5421 • {report.date}</p>
                  </div>
                </div>

                {/* Users Involved */}
                <div className="grid grid-cols-2 gap-6 mb-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Reporter</p>
                    <div className="flex items-center gap-3">
                      <img
                        src={report.reporter.image}
                        alt={report.reporter.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold">{report.reporter.name}</p>
                        <p className="text-sm text-gray-600">ID: #{report.reporter.id}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                    <p className="text-xs font-semibold text-red-700 uppercase mb-3">Reported User</p>
                    <div className="flex items-center gap-3">
                      <img
                        src={report.reported.image}
                        alt={report.reported.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold">{report.reported.name}</p>
                        <p className="text-sm text-gray-600">ID: #{report.reported.id}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {report.status !== 'resolved' && (
                  <div className="flex gap-3">
                    <button className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                      <Eye className="w-4 h-4" />
                      Review Details
                    </button>
                    <button className="flex-1 bg-yellow-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-yellow-700 transition-colors flex items-center justify-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Contact Reporter
                    </button>
                    <button className="flex-1 bg-red-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2">
                      <Ban className="w-4 h-4" />
                      Suspend User
                    </button>
                    <button className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">
                      Dismiss
                    </button>
                  </div>
                )}

                {report.status === 'resolved' && (
                  <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                    <div className="flex items-center gap-2 text-green-800">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-semibold">Resolved - User has been suspended and reporter has been notified</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Moderation Guidelines */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-8 shadow-sm text-white">
        <div className="flex items-start gap-4">
          <Shield className="w-8 h-8 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-2xl font-semibold mb-3">Moderation Guidelines</h3>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold mb-2">High Priority</h4>
                <ul className="text-sm text-blue-100 space-y-1">
                  <li>• Harassment & Threats</li>
                  <li>• Inappropriate Content</li>
                  <li>• Identity Theft</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Medium Priority</h4>
                <ul className="text-sm text-blue-100 space-y-1">
                  <li>• Spam Messages</li>
                  <li>• Misleading Information</li>
                  <li>• Multiple Accounts</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Low Priority</h4>
                <ul className="text-sm text-blue-100 space-y-1">
                  <li>• Profile Disputes</li>
                  <li>• Minor Violations</li>
                  <li>• General Complaints</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

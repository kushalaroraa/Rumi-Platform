import { Camera, User, Mail, Phone, MapPin, Briefcase, GraduationCap, Home, Calendar, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';

export function Profile({ onNavigate }) {
  const [profileData, setProfileData] = useState({
    firstName: 'Aarav',
    lastName: 'Sharma',
    email: 'aarav.sharma@example.com',
    phone: '+91 98765 43210',
    location: 'Mumbai',
    occupation: 'Software Engineer',
    education: 'Bachelor in Computer Science',
    budget: '800',
    moveInDate: '2026-04-15',
    bio: 'Software engineer who loves cooking and weekend hikes. Looking for a clean, respectful flatmate.',
  });

  const completionStats = [
    { label: 'Basic Info', progress: 100, color: 'bg-green-500' },
    { label: 'Photos', progress: 60, color: 'bg-yellow-500' },
    { label: 'Preferences', progress: 80, color: 'bg-blue-500' },
    { label: 'Verification', progress: 50, color: 'bg-purple-500' },
  ];

  const overallProgress = 72;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-8 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-semibold mb-2">Complete Your Profile</h2>
            <p className="text-gray-500">A complete profile gets 5x more matches!</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-blue-600 mb-1">{overallProgress}%</div>
            <p className="text-sm text-gray-500">Complete</p>
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={() => onNavigate('preferences')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Complete Bio
          </button>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-6">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all"
              style={{ width: `${overallProgress}%` }}
            ></div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            {completionStats.map((stat) => (
              <div key={stat.label} className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{stat.label}</span>
                  <span className="text-sm font-bold text-gray-900">{stat.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`${stat.color} h-2 rounded-full transition-all`}
                    style={{ width: `${stat.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Profile Photo */}
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Camera className="w-5 h-5 text-blue-600" />
            <h3 className="text-xl font-semibold">Profile Photos</h3>
          </div>

          <div className="space-y-4">
            <div className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden group cursor-pointer">
              <img
                src="https://images.unsplash.com/photo-1704726135027-9c6f034cfa41?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1c2VyJTIwcHJvZmlsZSUyMGF2YXRhcnxlbnwxfHx8fDE3NzQ3MzEzMDF8MA&ixlib=rb-4.1.0&q=80&w=400"
                alt="Profile"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                Primary
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
                >
                  <Upload className="w-6 h-6 text-gray-400" />
                </div>
              ))}
            </div>

            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800">
                  Add at least 3 photos to increase your profile visibility by 80%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="col-span-2 bg-white rounded-3xl p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <User className="w-5 h-5 text-blue-600" />
            <h3 className="text-xl font-semibold">Basic Information</h3>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <input
                type="text"
                value={profileData.firstName}
                onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <input
                type="text"
                value={profileData.lastName}
                onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-1" />
                Email Address
              </label>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-1" />
                Phone Number
              </label>
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Current Location
              </label>
              <input
                type="text"
                value={profileData.location}
                onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Briefcase className="w-4 h-4 inline mr-1" />
                Occupation
              </label>
              <input
                type="text"
                value={profileData.occupation}
                onChange={(e) => setProfileData({ ...profileData, occupation: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <GraduationCap className="w-4 h-4 inline mr-1" />
                Education
              </label>
              <input
                type="text"
                value={profileData.education}
                onChange={(e) => setProfileData({ ...profileData, education: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Home className="w-4 h-4 inline mr-1" />
                Monthly Budget (₹)
              </label>
              <input
                type="text"
                value={profileData.budget}
                onChange={(e) => setProfileData({ ...profileData, budget: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Preferred Move-in Date
              </label>
              <input
                type="date"
                value={profileData.moveInDate}
                onChange={(e) => setProfileData({ ...profileData, moveInDate: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                value={profileData.bio}
                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 outline-none focus:border-blue-500 transition-colors resize-none"
                placeholder="Tell potential flatmates about yourself..."
              />
              <p className="text-sm text-gray-500 mt-1">
                {profileData.bio.length}/500 characters
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Verification */}
      <div className="bg-white rounded-3xl p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <CheckCircle className="w-5 h-5 text-blue-600" />
          <h3 className="text-xl font-semibold">Verification & Trust</h3>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="border-2 border-gray-200 rounded-2xl p-6 hover:border-blue-500 transition-colors cursor-pointer">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold">Email</h4>
                <span className="text-xs text-green-600 font-semibold">Verified</span>
              </div>
            </div>
            <p className="text-sm text-gray-600">Your email has been verified</p>
          </div>

          <div className="border-2 border-gray-200 rounded-2xl p-6 hover:border-blue-500 transition-colors cursor-pointer">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Phone className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h4 className="font-semibold">Phone</h4>
                <span className="text-xs text-yellow-600 font-semibold">Pending</span>
              </div>
            </div>
            <p className="text-sm text-gray-600">Verify your phone number</p>
          </div>

          <div className="border-2 border-gray-200 rounded-2xl p-6 hover:border-blue-500 transition-colors cursor-pointer">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <h4 className="font-semibold">ID Verification</h4>
                <span className="text-xs text-gray-500 font-semibold">Not Started</span>
              </div>
            </div>
            <p className="text-sm text-gray-600">Verify your identity</p>
          </div>
        </div>

        <div className="mt-6 bg-green-50 rounded-xl p-4">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-800">
              Verified profiles receive <strong>3x more responses</strong> and are prioritized in search results
            </p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-4">
        <button className="px-8 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors">
          Preview Profile
        </button>
        <button className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
          Save Changes
        </button>
      </div>
    </div>
  );
}

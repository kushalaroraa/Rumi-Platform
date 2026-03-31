import { Sliders, MapPin, DollarSign, Users, Home, Coffee, Music, Book, Dumbbell, Utensils } from 'lucide-react';
import { useState } from 'react';

export function Preferences() {
  const [ageRange, setAgeRange] = useState([22, 35]);
  const [budgetRange, setBudgetRange] = useState([500, 1500]);
  const [location, setLocation] = useState('New York');
  const [distance, setDistance] = useState(10);
  const [gender, setGender] = useState('any');
  const [lifestyle, setLifestyle] = useState({
    smoking: false,
    pets: true,
    parties: false,
    earlyBird: true,
    nightOwl: false,
  });

  const [interests, setInterests] = useState([
    { id: 1, name: 'Hiking', icon: Dumbbell, selected: true },
    { id: 2, name: 'Cooking', icon: Utensils, selected: true },
    { id: 3, name: 'Reading', icon: Book, selected: false },
    { id: 4, name: 'Music', icon: Music, selected: true },
    { id: 5, name: 'Coffee', icon: Coffee, selected: false },
    { id: 6, name: 'Gym', icon: Dumbbell, selected: true },
  ]);

  const toggleInterest = (id) => {
    setInterests(interests.map(interest => 
      interest.id === id ? { ...interest, selected: !interest.selected } : interest
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <Sliders className="w-6 h-6 text-blue-600" />
          <h2 className="text-3xl font-semibold">Edit Preferences</h2>
        </div>
        <p className="text-gray-500">Customize your matching criteria to find the perfect flatmate</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Location & Distance */}
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <MapPin className="w-5 h-5 text-blue-600" />
            <h3 className="text-xl font-semibold">Location & Distance</h3>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  Search Radius
                </label>
                <span className="text-sm font-semibold text-blue-600">{distance} km</span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                value={distance}
                onChange={(e) => setDistance(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1 km</span>
                <span>50 km</span>
              </div>
            </div>
          </div>
        </div>

        {/* Budget Range */}
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <h3 className="text-xl font-semibold">Budget Range</h3>
          </div>
          
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  Monthly Budget
                </label>
                <span className="text-sm font-semibold text-blue-600">
                  ₹{budgetRange[0]} - ₹{budgetRange[1]}
                </span>
              </div>
              <div className="relative pt-2">
                <input
                  type="range"
                  min="0"
                  max="3000"
                  step="50"
                  value={budgetRange[0]}
                  onChange={(e) => setBudgetRange([Number(e.target.value), budgetRange[1]])}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <input
                  type="range"
                  min="0"
                  max="3000"
                  step="50"
                  value={budgetRange[1]}
                  onChange={(e) => setBudgetRange([budgetRange[0], Number(e.target.value)])}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 mt-2"
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>₹0</span>
                <span>₹3000+</span>
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-sm text-blue-800">
                <strong>Average in your area:</strong> ₹850/month
              </p>
            </div>
          </div>
        </div>

        {/* Age & Gender */}
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Users className="w-5 h-5 text-blue-600" />
            <h3 className="text-xl font-semibold">Age & Gender Preferences</h3>
          </div>
          
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  Age Range
                </label>
                <span className="text-sm font-semibold text-blue-600">
                  {ageRange[0]} - {ageRange[1]} years
                </span>
              </div>
              <div className="relative pt-2">
                <input
                  type="range"
                  min="18"
                  max="60"
                  value={ageRange[0]}
                  onChange={(e) => setAgeRange([Number(e.target.value), ageRange[1]])}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <input
                  type="range"
                  min="18"
                  max="60"
                  value={ageRange[1]}
                  onChange={(e) => setAgeRange([ageRange[0], Number(e.target.value)])}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 mt-2"
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>18</span>
                <span>60</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-3 block">
                Gender Preference
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setGender('male')}
                  className={`py-3 rounded-lg font-medium transition-colors ${
                    gender === 'male'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Male
                </button>
                <button
                  onClick={() => setGender('female')}
                  className={`py-3 rounded-lg font-medium transition-colors ${
                    gender === 'female'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Female
                </button>
                <button
                  onClick={() => setGender('any')}
                  className={`py-3 rounded-lg font-medium transition-colors ${
                    gender === 'any'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Any
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Interests */}
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Music className="w-5 h-5 text-blue-600" />
            <h3 className="text-xl font-semibold">Shared Interests</h3>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            {interests.map((interest) => (
              <button
                key={interest.id}
                onClick={() => toggleInterest(interest.id)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-colors ${
                  interest.selected
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <interest.icon className="w-6 h-6" />
                <span className="text-sm font-medium">{interest.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lifestyle Preferences */}
      <div className="bg-white rounded-3xl p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <Home className="w-5 h-5 text-blue-600" />
          <h3 className="text-xl font-semibold">Lifestyle Preferences</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <span className="font-medium">Smoking Allowed</span>
            <button
              onClick={() => setLifestyle({ ...lifestyle, smoking: !lifestyle.smoking })}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                lifestyle.smoking ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                  lifestyle.smoking ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              ></div>
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <span className="font-medium">Pets Allowed</span>
            <button
              onClick={() => setLifestyle({ ...lifestyle, pets: !lifestyle.pets })}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                lifestyle.pets ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                  lifestyle.pets ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              ></div>
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <span className="font-medium">Parties/Social Events</span>
            <button
              onClick={() => setLifestyle({ ...lifestyle, parties: !lifestyle.parties })}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                lifestyle.parties ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                  lifestyle.parties ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              ></div>
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <span className="font-medium">Early Bird</span>
            <button
              onClick={() => setLifestyle({ ...lifestyle, earlyBird: !lifestyle.earlyBird })}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                lifestyle.earlyBird ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                  lifestyle.earlyBird ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              ></div>
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <span className="font-medium">Night Owl</span>
            <button
              onClick={() => setLifestyle({ ...lifestyle, nightOwl: !lifestyle.nightOwl })}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                lifestyle.nightOwl ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                  lifestyle.nightOwl ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              ></div>
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-4">
        <button className="px-8 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors">
          Cancel
        </button>
        <button className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
          Save Preferences
        </button>
      </div>
    </div>
  );
}

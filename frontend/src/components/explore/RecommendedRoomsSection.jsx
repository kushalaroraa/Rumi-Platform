import React from 'react';
import { MapPin, Users } from 'lucide-react';
import { RecommendedRoomCard } from './RecommendedRoomCard';
import { RoomDetailsModal } from './RoomDetailsModal';
export const RecommendedRoomsSection = ({
  rooms,
  loading,
  title = 'Recommended Rooms',
  roomStatusMap = {},
  currentUserId = '',
  availableCities = [],
  selectedCity = '',
  filterByLocation = false,
  onSelectCity,
  onToggleFilterByLocation,
  onLikeRoom,
  onPassRoom
}) => {
  const [open, setOpen] = React.useState(false);
  const [selectedRoom, setSelectedRoom] = React.useState(null);
  const selectedRoomStatus = selectedRoom?._id
    ? (roomStatusMap[String(selectedRoom._id)] || selectedRoom.userInteractionStatus || null)
    : null;
  const cityOptions = Array.isArray(availableCities) ? availableCities : [];

  return <div className="mt-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500 mt-1">
            {filterByLocation && selectedCity
              ? `Sorted by compatibility · Prioritizing ${selectedCity}`
              : 'Sorted by compatibility'}
          </p>
        </div>

        <div className="rumi-section-controls">
          {filterByLocation && selectedCity && (
            <span className="rumi-city-pill">
              <MapPin size={12} />
              {selectedCity}
            </span>
          )}
          <select
            aria-label="Select room city"
            value={selectedCity}
            onChange={(e) => onSelectCity?.(e.target.value)}
            disabled={loading || cityOptions.length === 0}
            className="rumi-city-select"
          >
            <option value="">All cities</option>
            {cityOptions.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <label className="rumi-filter-toggle">
            <input
              type="checkbox"
              checked={Boolean(filterByLocation)}
              onChange={(e) => onToggleFilterByLocation?.(e.target.checked)}
              disabled={loading}
            />
            <span>Filter by location</span>
          </label>
        </div>
      </div>

      {loading ? <div className="flex items-center justify-center py-10 text-gray-500">
          <Users size={36} className="mr-3" />
          Loading rooms…
        </div> : rooms.length === 0 ? <div className="text-sm text-gray-500">No recommended rooms found.</div> : <div className="overflow-x-auto pb-2">
          <div className="flex gap-3">
            {rooms.map(room => <RecommendedRoomCard
              key={room._id}
              room={room}
              interactionStatus={roomStatusMap[String(room._id)] || room.userInteractionStatus || null}
              onViewDetails={r => {
                setSelectedRoom(r);
                setOpen(true);
              }}
            />)}
          </div>
        </div>}

      <RoomDetailsModal
        open={open}
        room={selectedRoom}
        interactionStatus={selectedRoomStatus}
        currentUserId={currentUserId}
        onLikeRoom={onLikeRoom}
        onPassRoom={onPassRoom}
        onClose={() => {
          setOpen(false);
          setSelectedRoom(null);
        }}
      />
    </div>;
};
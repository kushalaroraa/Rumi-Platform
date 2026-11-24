import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Search, X } from 'lucide-react';
import { Avatar } from '../common/Avatar';
import { normalizeImageUrl, searchProfiles } from '../../services/api';

export const ProfileSearchBar = ({ onSelectProfile }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const trimmed = query.trim();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!trimmed) {
      setResults([]);
      setLoading(false);
      setError('');
      setActiveIndex(-1);
      return undefined;
    }

    const controller = new AbortController();
    setLoading(true);
    setError('');

    const timer = window.setTimeout(async () => {
      try {
        const res = await searchProfiles(
          { q: trimmed, limit: 8 },
          { signal: controller.signal }
        );
        const list = res?.data?.profiles || [];
        setResults(list);
        setActiveIndex(list.length > 0 ? 0 : -1);
      } catch (err) {
        if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') return;
        setResults([]);
        setError('Unable to search profiles right now.');
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 280);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [trimmed]);

  const handleSelect = (profile) => {
    if (!profile) return;
    setOpen(false);
    setActiveIndex(-1);
    onSelectProfile?.(profile);
  };

  const handleKeyDown = (e) => {
    if (!open && e.key === 'ArrowDown' && trimmed) {
      setOpen(true);
      return;
    }
    if (!open) return;

    if (e.key === 'Escape') {
      setOpen(false);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (results.length === 0) return;
      setActiveIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (results.length === 0) return;
      setActiveIndex((prev) => (prev <= 0 ? results.length - 1 : prev - 1));
    } else if (e.key === 'Enter') {
      if (results.length > 0) {
        e.preventDefault();
        const chosen = activeIndex >= 0 && activeIndex < results.length ? results[activeIndex] : results[0];
        handleSelect(chosen);
      }
    }
  };

  return (
    <div ref={containerRef} className="rumi-search-wrap">
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            if (trimmed) setOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search matches, locations, preferences"
          aria-label="Search roommate profiles"
          aria-expanded={open && Boolean(trimmed)}
          aria-autocomplete="list"
          className="rumi-search-input"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setResults([]);
              setOpen(false);
              setError('');
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
            className="rumi-search-clear-btn"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {open && trimmed && (
        <div className="rumi-search-dropdown" role="listbox">
          {loading ? (
            <div className="p-4 text-center text-sm text-gray-500">
              Searching profiles…
            </div>
          ) : error ? (
            <div className="p-4 text-center text-sm text-red-600">
              {error}
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-sm font-medium text-gray-900">No profiles found</p>
              <p className="text-xs text-gray-500 mt-1">
                Try searching by name, city, or preference (e.g. non-veg, non-smoker).
              </p>
            </div>
          ) : (
            <div>
              {results.map((profile, idx) => {
                const avatar = normalizeImageUrl(profile?.photo || profile?.profilePicture || '');
                const city = profile?.city || profile?.location?.city || '';
                const score = typeof profile?.matchScore === 'number'
                  ? Math.round(profile.matchScore)
                  : null;
                const matchedOn = Array.isArray(profile?.matchedOn) ? profile.matchedOn : [];

                return (
                  <button
                    key={profile._id}
                    type="button"
                    role="option"
                    aria-selected={idx === activeIndex}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={() => handleSelect(profile)}
                    className={`rumi-search-item ${idx === activeIndex ? 'rumi-search-item--active' : ''}`}
                  >
                    <Avatar
                      src={avatar}
                      alt={profile?.name || 'User'}
                      className="w-10 h-10 rounded-full"
                      iconSize={16}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {profile?.name || 'User'}{profile?.age ? `, ${profile.age}` : ''}
                        </p>
                        {score !== null && (
                          <span className="rumi-match-badge">
                            {score}% Match
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        {city && (
                          <span className="text-xs text-gray-500 inline-flex items-center gap-1">
                            <MapPin size={11} className="text-blue-600 flex-shrink-0" />
                            {city}
                          </span>
                        )}
                        {matchedOn.map((tag) => (
                          <span key={tag} className="rumi-chip-blue" style={{ padding: '0.1rem 0.45rem', fontSize: '10px' }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface SearchFiltersProps {
  seasons: number[];
}

export default function SearchFilters({ seasons }: SearchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [season, setSeason] = useState(searchParams.get('season') || '');
  const [guestStar, setGuestStar] = useState(searchParams.get('guest_star') || '');
  const [setting, setSetting] = useState(searchParams.get('setting') || '');
  const [minRating, setMinRating] = useState(searchParams.get('min_rating') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort_by') || 'episode');
  const [sortOrder, setSortOrder] = useState(searchParams.get('sort_order') || 'asc');

  const [guestStarSuggestions, setGuestStarSuggestions] = useState<string[]>([]);
  const [settingSuggestions, setSettingSuggestions] = useState<string[]>([]);
  const [showGuestStarSuggestions, setShowGuestStarSuggestions] = useState(false);
  const [showSettingSuggestions, setShowSettingSuggestions] = useState(false);

  const buildQuery = useCallback(
    (overrides: Record<string, string> = {}) => {
      const values: Record<string, string> = {
        search,
        season,
        guest_star: guestStar,
        setting,
        min_rating: minRating,
        sort_by: sortBy === 'episode' ? '' : sortBy,
        sort_order: sortOrder === 'asc' ? '' : sortOrder,
        ...overrides,
      };

      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(values)) {
        if (value) params.set(key, value);
      }
      return params.toString();
    },
    [search, season, guestStar, setting, minRating, sortBy, sortOrder]
  );

  // A changed filter invalidates the current page, so `page` is deliberately
  // dropped rather than carried over.
  const applyFilters = useCallback(() => {
    router.push(`/?${buildQuery()}`);
  }, [buildQuery, router]);

  // Only the free-text inputs are debounced; the selects navigate on change.
  // Skipping the first run stops this from rewriting the URL the user just
  // arrived on, which would strip an existing `page` param.
  const isFirstRun = useRef(true);
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    const timer = setTimeout(applyFilters, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, guestStar, setting]);

  // Fetch guest star suggestions
  useEffect(() => {
    if (guestStar.length < 2) {
      setGuestStarSuggestions([]);
      return;
    }
    let cancelled = false;
    fetch(`/api/guest-stars?q=${encodeURIComponent(guestStar)}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setGuestStarSuggestions(data.guest_stars?.map((g: { name: string }) => g.name) || []);
      })
      .catch(() => {
        if (!cancelled) setGuestStarSuggestions([]);
      });
    return () => {
      cancelled = true;
    };
  }, [guestStar]);

  // Fetch setting suggestions
  useEffect(() => {
    if (setting.length < 2) {
      setSettingSuggestions([]);
      return;
    }
    let cancelled = false;
    fetch(`/api/settings?q=${encodeURIComponent(setting)}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setSettingSuggestions(data.settings || []);
      })
      .catch(() => {
        if (!cancelled) setSettingSuggestions([]);
      });
    return () => {
      cancelled = true;
    };
  }, [setting]);

  const clearFilters = () => {
    setSearch('');
    setSeason('');
    setGuestStar('');
    setSetting('');
    setMinRating('');
    setSortBy('episode');
    setSortOrder('asc');
    router.push('/');
  };

  const hasFilters = search || season || guestStar || setting || minRating || sortBy !== 'episode' || sortOrder !== 'asc';

  return (
    <div className="bg-slate-800 rounded-lg p-4 mb-6">
      {/* Search bar */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search episodes, guest stars, locations..."
          aria-label="Search episodes"
          className="w-full bg-slate-700 text-white rounded px-4 py-2 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Filters row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
        {/* Season filter */}
        <select
          value={season}
          onChange={(e) => {
            setSeason(e.target.value);
            router.push(`/?${buildQuery({ season: e.target.value })}`);
          }}
          aria-label="Filter by season"
          className="bg-slate-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">All Seasons</option>
          {seasons.map((s) => (
            <option key={s} value={s}>
              Season {s}
            </option>
          ))}
        </select>

        {/* Guest star typeahead */}
        <div className="relative">
          <input
            type="text"
            value={guestStar}
            onChange={(e) => setGuestStar(e.target.value)}
            onFocus={() => setShowGuestStarSuggestions(true)}
            onBlur={() => setTimeout(() => setShowGuestStarSuggestions(false), 200)}
            placeholder="Guest star..."
            aria-label="Filter by guest star"
            role="combobox"
            aria-expanded={showGuestStarSuggestions && guestStarSuggestions.length > 0}
            aria-controls="guest-star-suggestions"
            aria-autocomplete="list"
            className="w-full bg-slate-700 text-white rounded px-3 py-2 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          {showGuestStarSuggestions && guestStarSuggestions.length > 0 && (
            <div
              id="guest-star-suggestions"
              role="listbox"
              className="absolute top-full left-0 right-0 bg-slate-700 rounded mt-1 z-10 max-h-48 overflow-y-auto"
            >
              {guestStarSuggestions.map((name) => (
                <button
                  key={name}
                  type="button"
                  role="option"
                  aria-selected={guestStar === name}
                  onClick={() => {
                    setGuestStar(name);
                    setShowGuestStarSuggestions(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-white hover:bg-slate-600"
                >
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Setting typeahead */}
        <div className="relative">
          <input
            type="text"
            value={setting}
            onChange={(e) => setSetting(e.target.value)}
            onFocus={() => setShowSettingSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSettingSuggestions(false), 200)}
            placeholder="Location..."
            aria-label="Filter by location"
            role="combobox"
            aria-expanded={showSettingSuggestions && settingSuggestions.length > 0}
            aria-controls="setting-suggestions"
            aria-autocomplete="list"
            className="w-full bg-slate-700 text-white rounded px-3 py-2 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          {showSettingSuggestions && settingSuggestions.length > 0 && (
            <div
              id="setting-suggestions"
              role="listbox"
              className="absolute top-full left-0 right-0 bg-slate-700 rounded mt-1 z-10 max-h-48 overflow-y-auto"
            >
              {settingSuggestions.map((name) => (
                <button
                  key={name}
                  type="button"
                  role="option"
                  aria-selected={setting === name}
                  onClick={() => {
                    setSetting(name);
                    setShowSettingSuggestions(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-white hover:bg-slate-600"
                >
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Min rating */}
        <select
          value={minRating}
          onChange={(e) => {
            setMinRating(e.target.value);
            router.push(`/?${buildQuery({ min_rating: e.target.value })}`);
          }}
          aria-label="Filter by minimum TMDB rating"
          className="bg-slate-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">Any Rating</option>
          <option value="9">9+ TMDB</option>
          <option value="8">8+ TMDB</option>
          <option value="7">7+ TMDB</option>
          <option value="6">6+ TMDB</option>
        </select>

        {/* Sort */}
        <select
          value={`${sortBy}-${sortOrder}`}
          onChange={(e) => {
            const [by, order] = e.target.value.split('-');
            setSortBy(by);
            setSortOrder(order);
            router.push(
              `/?${buildQuery({
                sort_by: by === 'episode' ? '' : by,
                sort_order: order === 'asc' ? '' : order,
              })}`
            );
          }}
          aria-label="Sort episodes"
          className="bg-slate-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="episode-asc">Episode (oldest)</option>
          <option value="episode-desc">Episode (newest)</option>
          <option value="title-asc">Title A-Z</option>
          <option value="title-desc">Title Z-A</option>
          <option value="rating-desc">Rating (high-low)</option>
          <option value="rating-asc">Rating (low-high)</option>
        </select>
      </div>

      {/* Clear filters */}
      {hasFilters && (
        <button
          onClick={clearFilters}
          className="text-slate-400 hover:text-white text-sm"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}

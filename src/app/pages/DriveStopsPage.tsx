import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { useParams, Navigate } from 'react-router';
import { MapPin, Globe, Star, Navigation, ChevronDown, ChevronUp, Coffee, UtensilsCrossed, ShoppingBag, Trees, Landmark, Wine, Fuel, Baby } from 'lucide-react';
import { drives } from '../../data/drives';
import type { RoadStop } from '../../data/types';
import { useUserLocation, haversineKm } from '../utils/now-utils';

// ── Type badge colors ────────────────────────────────────────

const TYPE_CONFIG: Record<string, { color: string; bg: string; icon: typeof Coffee }> = {
  'Coffee':         { color: '#92400e', bg: '#fef3c7', icon: Coffee },
  'Food':           { color: '#9a3412', bg: '#ffedd5', icon: UtensilsCrossed },
  'Quick bites':    { color: '#9a3412', bg: '#ffedd5', icon: UtensilsCrossed },
  'Wine':           { color: '#6b21a8', bg: '#f3e8ff', icon: Wine },
  'Shopping':       { color: '#1e40af', bg: '#dbeafe', icon: ShoppingBag },
  'Scenic':         { color: '#166534', bg: '#dcfce7', icon: Trees },
  'History':        { color: '#78350f', bg: '#fef9c3', icon: Landmark },
  'Kids':           { color: '#0e7490', bg: '#cffafe', icon: Baby },
  'Gas-Restrooms':  { color: '#475569', bg: '#f1f5f9', icon: Fuel },
};

function getTypeConfig(type: string) {
  return TYPE_CONFIG[type] ?? { color: '#475569', bg: '#f1f5f9', icon: MapPin };
}

// ── Distance formatting ──────────────────────────────────────

function formatDistance(
  userGeo: { lat: number; lng: number },
  stopGeo: { lat: number; lng: number },
): { miles: string; driveMin: string } | null {
  const km = haversineKm(userGeo, stopGeo);
  const roadKm = km * 1.35; // rough road correction factor
  const miles = roadKm * 0.621371;
  const avgSpeedMph = 40;
  const minutes = Math.round((miles / avgSpeedMph) * 60);

  if (miles < 0.5) return { miles: '<1', driveMin: '<5' };
  return {
    miles: miles < 10 ? miles.toFixed(1) : Math.round(miles).toString(),
    driveMin: minutes.toString(),
  };
}

// ── Google Maps embed URL builder ────────────────────────────

function buildGmapUrl(stops: RoadStop[]): string {
  if (stops.length < 2) return '';

  const first = stops[0]!;
  const last = stops[stops.length - 1]!;
  const origin = `${first.geo.lat},${first.geo.lng}`;
  const dest = `${last.geo.lat},${last.geo.lng}`;

  // Google Maps supports up to ~20 waypoints in a directions URL.
  // If we have more intermediate stops, sample evenly to stay within the limit.
  const intermediates = stops.slice(1, -1);
  let waypoints: RoadStop[];
  if (intermediates.length <= 18) {
    waypoints = intermediates;
  } else {
    const step = intermediates.length / 18;
    waypoints = Array.from({ length: 18 }, (_, i) =>
      intermediates[Math.round(i * step)]!
    );
  }

  const waypointStr = waypoints
    .map((s) => `${s.geo.lat},${s.geo.lng}`)
    .join('|');

  return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&waypoints=${encodeURIComponent(waypointStr)}&travelmode=driving`;
}

// ── Stop card component ──────────────────────────────────────

function StopCard({
  stop,
  userGeo,
}: {
  stop: RoadStop;
  userGeo: { lat: number; lng: number } | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const dist = userGeo ? formatDistance(userGeo, stop.geo) : null;

  const hasDir = stop.google_maps_url.length > 0;
  const hasWeb = stop.official_url.length > 0;
  const hasReview = stop.review_url.length > 0;

  const noteLines = stop.notes.length > 180;

  return (
    <article
      id={`stop-${stop.id}`}
      className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
    >
      <div className="p-5 sm:p-6">
        {/* Header: name + distance */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3
            className="text-base sm:text-lg font-semibold text-gray-900 leading-snug"
            style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
          >
            {stop.name}
          </h3>
          {dist && (
            <span
              className="shrink-0 inline-flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-50 border border-gray-200 rounded-full px-2.5 py-1"
              title={`~${dist.driveMin} min drive`}
            >
              <Navigation className="w-3 h-3" />
              ~{dist.miles} mi
            </span>
          )}
        </div>

        {/* Type pills */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {stop.types.map((type) => {
            const cfg = getTypeConfig(type);
            const Icon = cfg.icon;
            return (
              <span
                key={type}
                className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
                style={{ color: cfg.color, backgroundColor: cfg.bg }}
              >
                <Icon className="w-3 h-3" />
                {type}
              </span>
            );
          })}
        </div>

        {/* Address */}
        <p className="text-sm text-gray-500 mb-3">{stop.address}</p>

        {/* Notes */}
        <div className="relative">
          <p
            className="text-sm leading-relaxed text-gray-700"
            style={{
              fontFamily: "'Crimson Pro', serif",
              ...(noteLines && !expanded
                ? {
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical' as const,
                    overflow: 'hidden',
                  }
                : {}),
            }}
          >
            {stop.notes}
          </p>
          {noteLines && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-1 text-xs font-medium text-gray-500 hover:text-gray-700 inline-flex items-center gap-0.5 cursor-pointer"
            >
              {expanded ? (
                <>
                  Less <ChevronUp className="w-3 h-3" />
                </>
              ) : (
                <>
                  Read more <ChevronDown className="w-3 h-3" />
                </>
              )}
            </button>
          )}
        </div>

        {/* Action links */}
        {(hasDir || hasWeb || hasReview) && (
          <div className="flex items-center flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
            {hasDir && (
              <a
                href={stop.google_maps_url[0]}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 transition-colors text-xs font-medium"
              >
                <MapPin className="w-3.5 h-3.5" /> Directions
              </a>
            )}
            {hasWeb && (
              <a
                href={stop.official_url[0]}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 transition-colors text-xs font-medium"
              >
                <Globe className="w-3.5 h-3.5" /> Website
              </a>
            )}
            {hasReview && (
              <a
                href={stop.review_url[0]}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 transition-colors text-xs font-medium"
              >
                <Star className="w-3.5 h-3.5" /> Reviews
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

// ── Main page component ──────────────────────────────────────

export default function DriveStopsPage() {
  const { driveId } = useParams<{ driveId: string }>();
  const drive = driveId ? drives[driveId] : undefined;

  const { coords: userGeo } = useUserLocation();
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const listRef = useRef<HTMLDivElement>(null);

  // Reset filters when navigating between drives
  useEffect(() => {
    setActiveFilters(new Set());
  }, [driveId]);

  // Derive all unique types and ordered segments from stops
  const { allTypes, segmentGroups } = useMemo(() => {
    if (!drive) return { allTypes: [] as string[], segmentGroups: [] as { segment: string; stops: RoadStop[] }[] };

    const typeSet = new Set<string>();
    const groups: { segment: string; stops: RoadStop[] }[] = [];

    for (const stop of drive.stops) {
      for (const t of stop.types) typeSet.add(t);

      const last = groups[groups.length - 1];
      if (last && last.segment === stop.segment) {
        last.stops.push(stop);
      } else {
        groups.push({ segment: stop.segment, stops: [stop] });
      }
    }

    return { allTypes: Array.from(typeSet), segmentGroups: groups };
  }, [drive]);

  // Filter stops
  const filteredGroups = useMemo(() => {
    if (activeFilters.size === 0) return segmentGroups;
    return segmentGroups
      .map((g) => ({
        ...g,
        stops: g.stops.filter((s) => s.types.some((t) => activeFilters.has(t))),
      }))
      .filter((g) => g.stops.length > 0);
  }, [segmentGroups, activeFilters]);

  // Google Maps link for "Open in Maps" button
  const gmapUrl = useMemo(() => (drive ? buildGmapUrl(drive.stops) : ''), [drive]);

  const toggleFilter = useCallback((type: string) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setActiveFilters(new Set());
  }, []);

  if (!drive) return <Navigate to="/" replace />;

  const totalVisible = filteredGroups.reduce((sum, g) => sum + g.stops.length, 0);

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      {/* ── Hero map section ──────────────────────────────── */}
      <div className="relative h-[40vh] sm:h-[45vh] bg-gray-200">
        <iframe
          title={`Route map — ${drive.title}`}
          src={`https://www.google.com/maps/embed?pb=!1m28!1m12!1m3!1d1!2d0!3d0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1`}
          className="absolute inset-0 w-full h-full border-0 hidden"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        {/* Fallback static map with link to Google Maps */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${drive.heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-[#faf8f5]" />
        </div>

        {/* Hero content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center pt-16">
          <h1
            className="text-3xl sm:text-5xl lg:text-6xl font-light text-white mb-3 tracking-tight"
            style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
          >
            {drive.title}
          </h1>
          <p
            className="text-base sm:text-lg text-white/85 max-w-xl leading-relaxed"
            style={{ fontFamily: "'Crimson Pro', serif" }}
          >
            {drive.subtitle}
          </p>
          <a
            href={gmapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-white border border-white/30 bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
          >
            <MapPin className="w-4 h-4" />
            Open full route in Google Maps
          </a>
        </div>
      </div>

      {/* ── Filter bar ────────────────────────────────────── */}
      <div className="sticky top-16 z-40 bg-[#faf8f5]/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-12 py-3">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <button
              onClick={clearFilters}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                activeFilters.size === 0
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All ({drive.stops.length})
            </button>
            {allTypes.map((type) => {
              const cfg = getTypeConfig(type);
              const Icon = cfg.icon;
              const isOn = activeFilters.has(type);
              return (
                <button
                  key={type}
                  onClick={() => toggleFilter(type)}
                  className={`shrink-0 inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                    isOn
                      ? 'text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  style={isOn ? { backgroundColor: cfg.color, color: '#fff' } : {}}
                >
                  <Icon className="w-3 h-3" />
                  {type}
                </button>
              );
            })}
            {activeFilters.size > 0 && (
              <span className="shrink-0 text-xs text-gray-400 pl-2">
                {totalVisible} stop{totalVisible !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Stop listings by segment ──────────────────────── */}
      <div ref={listRef} className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-12 py-8 sm:py-12">
        {filteredGroups.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-sm">No stops match the selected filters.</p>
            <button
              onClick={clearFilters}
              className="mt-3 text-sm font-medium text-[#b8956d] hover:underline cursor-pointer"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="space-y-10 sm:space-y-14">
            {filteredGroups.map((group) => (
              <section key={group.segment}>
                {/* Segment heading */}
                <div className="mb-5 sm:mb-6">
                  <h2
                    className="text-sm sm:text-base font-semibold uppercase tracking-wider text-gray-400"
                    style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
                  >
                    {group.segment}
                  </h2>
                  <div className="mt-2 h-px bg-gray-200" />
                </div>

                {/* Stop cards grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  {group.stops.map((stop) => (
                    <StopCard
                      key={stop.id}
                      stop={stop}
                      userGeo={userGeo}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

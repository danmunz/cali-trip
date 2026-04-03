import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link, useLocation } from 'react-router';
import { MapPin, Clock, Navigation, ChevronUp, Menu, X, Globe, Star, ExternalLink } from 'lucide-react';
import {
  useTimeline,
  useUserLocation,
  useCurrentIndex,
  type TimelineEntry,
  type GeoStatus,
} from '../utils/now-utils';
import { segments, type SegmentId } from '../../data/segments';
import { tripMeta } from '../../data/trip-meta.generated';
import locationsData from '../../data/locations.json';
import type { Location } from '../../data/types';

// ── Location lookup ──────────────────────────────────────────

const locationMap = new Map<string, Location>();
for (const loc of (locationsData as { locations: Location[] }).locations) {
  locationMap.set(loc.id, loc);
}

// ── Nav links (reused from Root) ─────────────────────────────

const navLinks = [
  { path: '/', label: 'Overview' },
  { path: '/lodging', label: 'Lodging' },
  { path: '/itinerary', label: 'Experience' },
  { path: '/full-itinerary', label: 'Full Itinerary' },
  { path: '/now', label: 'Now' },
] as const;

// ── Format helpers ───────────────────────────────────────────

function formatDate(isoDate: string, dayOfWeek: string): string {
  const parts = isoDate.split('-').map(Number);
  const m = parts[1]!;
  const d = parts[2]!;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${dayOfWeek}, ${months[m - 1]} ${d}`;
}

// ── Segment style helpers ────────────────────────────────────

function getSegmentColor(segmentId: string): string {
  return segments[segmentId as SegmentId]?.color ?? '#b8956d';
}

function getSegmentLabel(segmentId: string): string {
  return segments[segmentId as SegmentId]?.navLabel ?? segmentId;
}

function getSegmentBgImage(segmentId: string): string {
  return segments[segmentId as SegmentId]?.bgImage ?? '';
}

// ── Geo status indicator ─────────────────────────────────────

function GeoIndicator({ status }: { status: GeoStatus }) {
  if (status === 'granted') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest opacity-60">
        <MapPin size={10} />
        <span>Live</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest opacity-60">
      <Clock size={10} />
      <span>Schedule</span>
    </span>
  );
}

// ── Activity card ────────────────────────────────────────────

interface CardProps {
  entry: TimelineEntry;
  position: 'far-prev' | 'prev' | 'current' | 'next' | 'far-next';
  isCurrent: boolean;
  isLiveTarget: boolean;
  onClick: () => void;
}

function ActivityCard({ entry, position, isCurrent, isLiveTarget, onClick }: CardProps) {
  const color = getSegmentColor(entry.segmentId);
  const segLabel = getSegmentLabel(entry.segmentId);

  const sizeClasses: Record<string, string> = {
    'far-prev': 'py-3 px-4',
    'prev': 'py-4 px-5',
    'current': 'py-6 px-6 sm:py-8 sm:px-8',
    'next': 'py-4 px-5',
    'far-next': 'py-3 px-4',
  };

  // Resolve locations for this activity
  const activityLocations = useMemo(() => {
    if (!isCurrent) return [];
    const seen = new Set<string>();
    const locs: Location[] = [];
    for (const id of entry.activity.locationIds) {
      const loc = locationMap.get(id);
      if (loc && !seen.has(id)) {
        seen.add(id);
        locs.push(loc);
      }
    }
    return locs;
  }, [isCurrent, entry.activity.locationIds]);

  // Build full-itinerary anchor
  const itineraryAnchor = `day-${entry.dayNumber}-${entry.segmentId}-stop-${entry.activityIndexInDay}`;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); }}
      className={`
        w-full text-left rounded-2xl transition-all duration-500 ease-out
        relative overflow-hidden cursor-pointer
        ${sizeClasses[position]}
        ${isCurrent
          ? 'bg-white shadow-xl ring-1 ring-black/[0.04]'
          : 'bg-white/60 backdrop-blur-sm shadow-md hover:bg-white/80'
        }
      `}
      style={{
        borderLeft: isCurrent ? `3px solid ${color}` : '3px solid transparent',
      }}
    >
      {/* Live indicator dot */}
      {isLiveTarget && (
        <span
          className="absolute top-3 right-3 flex items-center gap-1.5"
        >
          <span className="relative flex h-2 w-2">
            <span
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
              style={{ backgroundColor: color }}
            />
            <span
              className="relative inline-flex rounded-full h-2 w-2"
              style={{ backgroundColor: color }}
            />
          </span>
          <span className="text-[10px] uppercase tracking-widest font-medium" style={{ color }}>
            Now
          </span>
        </span>
      )}

      {/* Segment badge */}
      <div className="flex items-center gap-2 mb-1">
        <span
          className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: color }}
        />
        <span className="text-[10px] uppercase tracking-widest text-gray-400 font-medium">
          {segLabel} · Day {entry.dayNumber}
        </span>
      </div>

      {/* Time */}
      <p className={`font-sans text-gray-500 ${isCurrent ? 'text-xs mb-1.5' : 'text-[11px] mb-1'}`}>
        {entry.activity.time}
      </p>

      {/* Activity name */}
      <h3
        className={`font-serif leading-snug text-gray-900 ${
          isCurrent ? 'text-xl sm:text-2xl font-medium' :
          position === 'prev' || position === 'next' ? 'text-base font-medium' :
          'text-sm font-normal'
        }`}
      >
        {entry.activity.name}
      </h3>

      {/* Description — current only */}
      {isCurrent && (
        <p className="mt-3 text-sm leading-relaxed text-gray-600 line-clamp-4 sm:line-clamp-6">
          {entry.activity.description}
        </p>
      )}

      {/* Travel after — current only */}
      {isCurrent && entry.activity.travelAfter && (
        <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
          <Navigation size={12} className="rotate-90" />
          <span>
            {entry.activity.travelAfter.duration} drive to {entry.activity.travelAfter.to}
          </span>
        </div>
      )}

      {/* Location links — current only */}
      {isCurrent && activityLocations.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-2.5" onClick={(e) => e.stopPropagation()}>
          {activityLocations.map((loc) => {
            const hasDir = !!loc.google_maps_url?.[0];
            const hasWeb = !!loc.official_url?.[0];
            const hasReview = !!loc.review_url?.[0];
            if (!hasDir && !hasWeb && !hasReview) return null;

            return (
              <div key={loc.id}>
                <div className="flex items-center flex-wrap gap-x-1.5 gap-y-1.5 text-xs">
                  <span className="text-gray-500 font-semibold mr-0.5">{loc.name}</span>
                  {hasDir && (
                    <a
                      href={loc.google_maps_url[0]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 transition-colors font-medium"
                    >
                      <MapPin className="w-3 h-3" /> Directions
                    </a>
                  )}
                  {hasWeb && (
                    <a
                      href={loc.official_url[0]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 transition-colors font-medium"
                    >
                      <Globe className="w-3 h-3" /> Website
                    </a>
                  )}
                  {hasReview && (
                    <a
                      href={loc.review_url[0]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 transition-colors font-medium"
                    >
                      <Star className="w-3 h-3" /> Reviews
                    </a>
                  )}
                </div>
              </div>
            );
          })}

          {/* Link to full itinerary entry */}
          <Link
            to={`/full-itinerary#${itineraryAnchor}`}
            className="inline-flex items-center gap-1.5 mt-1 text-xs text-gray-400 hover:text-[#b8956d] transition-colors font-medium"
          >
            <ExternalLink className="w-3 h-3" />
            View full details
          </Link>
        </div>
      )}
    </div>
  );
}

// ── Main NowPage ─────────────────────────────────────────────

export default function NowPage() {
  const timeline = useTimeline();
  const { coords, status } = useUserLocation();
  const liveIndex = useCurrentIndex(timeline, coords);
  const location = useLocation();

  const [activeIndex, setActiveIndex] = useState(liveIndex);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hasScrolledAway, setHasScrolledAway] = useState(false);
  const [initialScrollDone, setInitialScrollDone] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const isScrollingRef = useRef(false);

  // Track live index changes
  useEffect(() => {
    setHasScrolledAway(activeIndex !== liveIndex);
  }, [activeIndex, liveIndex]);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  // Initial scroll to live activity
  useEffect(() => {
    if (initialScrollDone) return;
    const card = cardRefs.current.get(liveIndex);
    if (card && scrollContainerRef.current) {
      // Use requestAnimationFrame to ensure layout is computed
      requestAnimationFrame(() => {
        card.scrollIntoView({ block: 'center', behavior: 'instant' });
        setActiveIndex(liveIndex);
        setInitialScrollDone(true);
      });
    }
  }, [liveIndex, initialScrollDone, timeline]);

  // Intersection observer to track which card is centered
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (observerEntries) => {
        if (isScrollingRef.current) return;

        let bestEntry: IntersectionObserverEntry | null = null;
        let bestRatio = 0;

        for (const obsEntry of observerEntries) {
          if (obsEntry.intersectionRatio > bestRatio) {
            bestRatio = obsEntry.intersectionRatio;
            bestEntry = obsEntry;
          }
        }

        if (bestEntry?.target) {
          const idx = Number(bestEntry.target.getAttribute('data-index'));
          if (!isNaN(idx)) {
            setActiveIndex(idx);
          }
        }
      },
      {
        root: container,
        rootMargin: '-35% 0px -35% 0px',
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    );

    for (const [, el] of cardRefs.current) {
      observer.observe(el);
    }

    return () => observer.disconnect();
  }, [timeline]);

  // Scroll to a specific card
  const scrollToCard = useCallback((index: number) => {
    const card = cardRefs.current.get(index);
    if (card) {
      isScrollingRef.current = true;
      card.scrollIntoView({ block: 'center', behavior: 'smooth' });
      setActiveIndex(index);
      setTimeout(() => { isScrollingRef.current = false; }, 600);
    }
  }, []);

  // Return to Now
  const returnToNow = useCallback(() => {
    scrollToCard(liveIndex);
  }, [scrollToCard, liveIndex]);

  // Current active entry for header
  const activeEntry = timeline[activeIndex] ?? timeline[0];
  const activeColor = activeEntry ? getSegmentColor(activeEntry.segmentId) : '#b8956d';
  const activeBgImage = activeEntry ? getSegmentBgImage(activeEntry.segmentId) : '';

  // Compute position label for each card
  const getPosition = useCallback((cardIndex: number): CardProps['position'] => {
    const diff = cardIndex - activeIndex;
    if (diff === 0) return 'current';
    if (diff === -1) return 'prev';
    if (diff === 1) return 'next';
    if (diff < -1) return 'far-prev';
    return 'far-next';
  }, [activeIndex]);

  // Memoize visible range — show all cards but only render details for nearby ones
  const visibleRange = useMemo(() => {
    return { start: 0, end: timeline.length };
  }, [timeline.length]);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-[#faf8f5] overflow-hidden">
      {/* Background image — segment-aware */}
      <div
        className="absolute inset-0 z-0 transition-opacity duration-1000 ease-out"
        style={{
          backgroundImage: activeBgImage ? `url(${activeBgImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.08,
        }}
      />

      {/* Header bar */}
      <header
        className="relative z-30 flex-shrink-0 px-4 sm:px-6 pt-[env(safe-area-inset-top)] border-b border-black/[0.06]"
        style={{ backgroundColor: `color-mix(in oklch, ${activeColor} 4%, #faf8f5)` }}
      >
        <div className="flex items-center justify-between h-14 max-w-lg mx-auto">
          {/* Left: segment + where/when */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span
                className="inline-block w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: activeColor }}
              />
              <span className="text-[11px] uppercase tracking-widest font-medium text-gray-500 truncate">
                {activeEntry ? getSegmentLabel(activeEntry.segmentId) : ''}
              </span>
            </div>
            <p className="text-xs text-gray-400 truncate mt-0.5">
              {activeEntry ? `${formatDate(activeEntry.date, activeEntry.dayOfWeek)} · ${activeEntry.activity.time}` : ''}
            </p>
          </div>

          {/* Center: geo indicator */}
          <div className="flex-shrink-0 mx-3">
            <GeoIndicator status={status} />
          </div>

          {/* Right: hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {/* Mobile nav overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-white/98 backdrop-blur-md flex flex-col">
          <div className="flex items-center justify-between h-14 px-4 sm:px-6 border-b border-gray-100">
            <span className="text-sm font-semibold text-gray-900">{tripMeta.title}</span>
            <button
              onClick={() => setMenuOpen(false)}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>
          <nav className="flex-1 flex flex-col justify-center px-8 space-y-1">
            {navLinks.map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setMenuOpen(false)}
                className={`block py-4 text-2xl font-serif transition-colors ${
                  isActive(path)
                    ? 'text-[#b8956d]'
                    : 'text-gray-400 hover:text-gray-900'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="px-8 pb-8 text-xs text-gray-300">
            {tripMeta.subtitle.replace(' | ', ' \u2022 ')}
          </div>
        </div>
      )}

      {/* Scroll container */}
      <div
        ref={scrollContainerRef}
        className="relative z-10 flex-1 overflow-y-auto overscroll-contain scroll-smooth"
        style={{
          scrollSnapType: 'y proximity',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* Top spacer so first card can be centered */}
        <div className="h-[35dvh]" />

        <div className="max-w-lg mx-auto px-4 sm:px-6 space-y-3">
          {timeline.slice(visibleRange.start, visibleRange.end).map((entry) => {
            const pos = getPosition(entry.index);
            return (
              <div
                key={entry.index}
                ref={(el) => {
                  if (el) cardRefs.current.set(entry.index, el);
                  else cardRefs.current.delete(entry.index);
                }}
                data-index={entry.index}
                style={{ scrollSnapAlign: 'center' }}
              >
                <ActivityCard
                  entry={entry}
                  position={pos}
                  isCurrent={pos === 'current'}
                  isLiveTarget={entry.index === liveIndex}
                  onClick={() => scrollToCard(entry.index)}
                />
              </div>
            );
          })}
        </div>

        {/* Bottom spacer */}
        <div className="h-[35dvh]" />
      </div>

      {/* "Return to Now" FAB */}
      {hasScrolledAway && (
        <button
          onClick={returnToNow}
          className="fixed z-20 bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2.5 rounded-full bg-gray-900 text-white text-xs font-medium tracking-wide shadow-lg shadow-black/20 hover:bg-gray-800 transition-all duration-300 animate-fade-in"
          style={{
            paddingBottom: `calc(0.625rem + env(safe-area-inset-bottom, 0px))`,
          }}
        >
          <ChevronUp size={14} />
          Return to Now
        </button>
      )}

      {/* Day transition markers */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateX(-50%) translateY(8px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

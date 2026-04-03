import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link } from 'react-router';
import { MapPin, Clock, Navigation, ChevronUp, Globe, Star, ExternalLink } from 'lucide-react';
import {
  useTimeline,
  useUserLocation,
  useCurrentIndex,
  type TimelineEntry,
  type GeoStatus,
} from '../utils/now-utils';
import { segments, type SegmentId } from '../../data/segments';
import locationsData from '../../data/locations.json';
import type { Location } from '../../data/types';

// ── Location lookup ──────────────────────────────────────────

const locationMap = new Map<string, Location>();
for (const loc of (locationsData as { locations: Location[] }).locations) {
  locationMap.set(loc.id, loc);
}

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
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
          {activityLocations.map((loc) => {
            const dirUrl = loc.google_maps_url?.[0];
            const webUrl = loc.official_url?.[0];
            const reviewUrl = loc.review_url?.[0];
            if (!dirUrl && !webUrl && !reviewUrl) return null;

            return (
              <React.Fragment key={loc.id}>
                {dirUrl && (
                  <a
                    href={dirUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-[#b8956d] transition-colors"
                  >
                    <MapPin className="w-3 h-3" /> Directions
                  </a>
                )}
                {webUrl && (
                  <a
                    href={webUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-[#b8956d] transition-colors"
                  >
                    <Globe className="w-3 h-3" /> Website
                  </a>
                )}
                {reviewUrl && (
                  <a
                    href={reviewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-[#b8956d] transition-colors"
                  >
                    <Star className="w-3 h-3" /> Reviews
                  </a>
                )}
              </React.Fragment>
            );
          })}
          <span className="text-gray-200">·</span>
          <Link
            to={`/full-itinerary#${itineraryAnchor}`}
            className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-[#b8956d] transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            Full details
          </Link>
        </div>
      )}

      {/* View full details — fallback when no location links */}
      {isCurrent && activityLocations.length === 0 && (
        <div className="mt-4 pt-3 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
          <Link
            to={`/full-itinerary#${itineraryAnchor}`}
            className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-[#b8956d] transition-colors"
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

  const [activeIndex, setActiveIndex] = useState(liveIndex);
  const [hasScrolledAway, setHasScrolledAway] = useState(false);
  const [initialScrollDone, setInitialScrollDone] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const isScrollingRef = useRef(false);

  // Track live index changes
  useEffect(() => {
    setHasScrolledAway(activeIndex !== liveIndex);
  }, [activeIndex, liveIndex]);

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

  return (
    <div className="fixed inset-0 top-16 flex flex-col bg-[#faf8f5] overflow-hidden">
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

      {/* Compact context bar */}
      <div
        className="relative z-30 flex-shrink-0 px-4 sm:px-6 border-b border-black/[0.06]"
        style={{ backgroundColor: `color-mix(in oklch, ${activeColor} 4%, #faf8f5)` }}
      >
        <div className="flex items-center justify-between h-10 max-w-lg mx-auto">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="inline-block w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: activeColor }}
            />
            <span className="text-[11px] uppercase tracking-widest font-medium text-gray-500 truncate">
              {activeEntry ? getSegmentLabel(activeEntry.segmentId) : ''}
            </span>
            <span className="text-[11px] text-gray-300">·</span>
            <span className="text-[11px] text-gray-400 truncate">
              {activeEntry ? `${formatDate(activeEntry.date, activeEntry.dayOfWeek)} · ${activeEntry.activity.time}` : ''}
            </span>
          </div>
          <GeoIndicator status={status} />
        </div>
      </div>

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

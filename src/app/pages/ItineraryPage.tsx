import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Car, ChevronLeft, ChevronRight, Map, X } from 'lucide-react';
import { itinerary } from '../../data/itinerary.generated';
import { segments, type SegmentId } from '../../data/segments';
import type { TripDay } from '../../data/types';
import JourneyMap from '../components/JourneyMap';

/** Group flat TripDay[] into contiguous segment runs. */
function groupBySegment(days: TripDay[]) {
  const groups: { segmentId: SegmentId; days: TripDay[] }[] = [];
  for (const day of days) {
    const last = groups[groups.length - 1];
    if (last && last.segmentId === day.segmentId) {
      last.days.push(day);
    } else {
      groups.push({ segmentId: day.segmentId as SegmentId, days: [day] });
    }
  }
  return groups;
}

function formatDayDate(iso: string, dayOfWeek: string): string {
  const d = new Date(iso + 'T12:00:00');
  return `${dayOfWeek}, ${d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`;
}

function sectionDateRange(days: TripDay[]): string {
  const first = new Date(days[0]!.date + 'T12:00:00');
  const last = new Date(days[days.length - 1]!.date + 'T12:00:00');
  const fMonth = first.toLocaleDateString('en-US', { month: 'long' });
  if (first.getTime() === last.getTime()) {
    return `${fMonth} ${first.getDate()}`;
  }
  if (first.getMonth() === last.getMonth()) {
    return `${fMonth} ${first.getDate()}–${last.getDate()}`;
  }
  const lMonth = last.toLocaleDateString('en-US', { month: 'long' });
  return `${fMonth} ${first.getDate()} – ${lMonth} ${last.getDate()}`;
}

/** Parse the URL hash and return it if it's a known segment ID, else undefined. */
function getSegmentFromHash(): SegmentId | undefined {
  const hash = window.location.hash.replace('#', '');
  return hash in segments ? (hash as SegmentId) : undefined;
}

export default function ItineraryPage() {
  const sections = useMemo(() => groupBySegment(itinerary), []);
  const [activeSection, setActiveSection] = useState<SegmentId>(
    () => getSegmentFromHash() ?? sections[0]?.segmentId ?? 'napa',
  );
  /** Location IDs for the activity the user is hovering over in text. */
  const [hoveredLocationIds, setHoveredLocationIds] = useState<string[]>([]);
  /** Location ID of the pin the user is hovering on the map. */
  const [mapHoveredId, setMapHoveredId] = useState<string | null>(null);
  /** Location the user has scrolled to (debounced) — drives map fly-to. */
  const [scrollFocusedLocationId, setScrollFocusedLocationId] = useState<string | null>(null);
  /** True during the brief crossfade between segments. */
  const [isFading, setIsFading] = useState(false);
  /** Mobile map overlay visible */
  const [mobileMapOpen, setMobileMapOpen] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // \u2500\u2500 Derived data \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

  const activeSectionIdx = sections.findIndex((s) => s.segmentId === activeSection);
  const activeData = sections[activeSectionIdx];
  const seg = activeData ? segments[activeData.segmentId] : null;
  const prevSection = activeSectionIdx > 0 ? sections[activeSectionIdx - 1] : null;
  const nextSection =
    activeSectionIdx < sections.length - 1 ? sections[activeSectionIdx + 1] : null;

  // Chronologically ordered, deduplicated location IDs for the active segment.
  const orderedLocationIds = useMemo(() => {
    if (!activeData) return [];
    const seen = new Set<string>();
    const ordered: string[] = [];
    for (const day of activeData.days) {
      for (const activity of day.activities) {
        for (const id of activity.locationIds) {
          if (!seen.has(id)) {
            seen.add(id);
            ordered.push(id);
          }
        }
      }
    }
    return ordered;
  }, [activeData]);

  // \u2500\u2500 Navigate between segments with crossfade \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

  const goToSegment = useCallback((segmentId: SegmentId) => {
    if (segmentId === activeSection) return;
    setIsFading(true);
    setHoveredLocationIds([]);
    setScrollFocusedLocationId(null);
    setTimeout(() => {
      setActiveSection(segmentId);
      history.replaceState(null, '', '#' + segmentId);
      scrollContainerRef.current?.scrollTo({ top: 0 });
      requestAnimationFrame(() => setIsFading(false));
    }, 200);
  }, [activeSection]);

  // \u2500\u2500 Activity-level observer (rooted in scroll container) \u2500

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const DEBOUNCE_MS = 500;

    const activityObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const ids = entry.target.getAttribute('data-location-ids');
            const firstId = ids?.split(',')[0] ?? null;
            if (debounceRef.current) clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() => {
              setScrollFocusedLocationId(firstId);
            }, DEBOUNCE_MS);
          }
        }
      },
      { root: container, rootMargin: '-30% 0px -55% 0px', threshold: 0 },
    );

    const cards = container.querySelectorAll('[data-location-ids]');
    cards.forEach((el) => activityObserver.observe(el));

    return () => {
      activityObserver.disconnect();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [activeSection]);

  // \u2500\u2500 Scroll to a location within the container (map pin click) \u2500

  const scrollToLocation = useCallback(
    (locationId: string) => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const cards = container.querySelectorAll('[data-location-ids]');
      for (const card of cards) {
        const ids = card.getAttribute('data-location-ids')?.split(',') ?? [];
        if (ids.includes(locationId)) {
          const offset = 80;
          const containerRect = container.getBoundingClientRect();
          const cardRect = card.getBoundingClientRect();
          const scrollTarget =
            cardRect.top - containerRect.top + container.scrollTop - offset;
          container.scrollTo({ top: scrollTarget, behavior: 'smooth' });
          // Close mobile map after selecting a pin
          setMobileMapOpen(false);
          return;
        }
      }
    },
    [activeSection],
  );

  // Prevent body scroll when mobile map is open
  useEffect(() => {
    document.body.style.overflow = mobileMapOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMapOpen]);

  if (!activeData || !seg) return null;

  return (
    <div className="fixed top-16 left-0 right-0 bottom-0 flex flex-col">
      {/* Sub-Navigation */}
      <div className="z-40 bg-stone-50/90 backdrop-blur-md border-b border-stone-200/50 shadow-sm shrink-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-12 py-2">
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 overflow-x-auto">
            {sections.map((s) => {
              const isActive = activeSection === s.segmentId;
              const color = segments[s.segmentId].color;
              return (
              <button
                key={s.segmentId}
                onClick={() => goToSegment(s.segmentId)}
                className={`cursor-pointer relative group flex-shrink-0 px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm transition-all duration-200 font-bold flex flex-col items-center gap-0.5 ${
                  isActive
                    ? 'text-white shadow-md shadow-black/20'
                    : 'text-gray-700 hover:shadow-sm'
                }`}
                style={{
                  backgroundColor: isActive ? color : undefined,
                }}
              >
                <span className="relative z-10">{segments[s.segmentId].navLabel}</span>
                <span className={`relative z-10 text-[9px] sm:text-[10px] tracking-wide ${
                  isActive ? 'text-white/60' : 'text-gray-500'
                }`}>
                  {sectionDateRange(s.days)}
                </span>
                {/* Hover pill tint */}
                {!isActive && (
                  <span
                    className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-[0.12] transition-opacity duration-200 pointer-events-none"
                    style={{ backgroundColor: color }}
                  />
                )}
              </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content + Map */}
      <div className="flex-1 flex min-h-0">
        {/* Scrollable Content — only the active segment */}
        <div
          ref={scrollContainerRef}
          className="lg:w-1/2 w-full overflow-y-auto transition-colors duration-700 ease-in-out"
          style={{ backgroundColor: `color-mix(in oklab, ${seg.color} 35%, #000)` }}
        >
          <div
            className="transition-opacity duration-200"
            style={{ opacity: isFading ? 0 : 1 }}
          >
            <section
              data-section={activeData.segmentId}
              className="relative"
            >
              {/* Hero image — fixed to the scroll container, vivid at top */}
              <div
                className="sticky top-0 h-[60vh] sm:h-[70vh] -mb-[60vh] sm:-mb-[70vh] z-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${seg.bgImage})` }}
              >
                {/* Light overlay at top, fading to segment-tinted dark at bottom */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.5) 50%, color-mix(in oklab, ${seg.color} 35%, #000))`,
                  }}
                />
              </div>

              {/* Content — scrolls over the hero */}
              <div className="relative z-10">
                {/* Spacer so the hero is visible before content begins */}
                <div className="h-[30vh] sm:h-[40vh]" />

                <div
                  className="px-5 sm:px-6 lg:px-12 pb-16 sm:pb-20"
                  style={{
                    background: `linear-gradient(to bottom, transparent, color-mix(in oklab, ${seg.color} 35%, #000) 25%)`,
                  }}
                >
                  {/* Section Header */}
                  <div className="mb-8 sm:mb-12">
                    <h2 className="text-4xl sm:text-5xl lg:text-7xl text-white mb-3 sm:mb-4 tracking-tight font-medium drop-shadow-lg">
                      {seg.title}
                    </h2>
                    <p className="text-xl sm:text-2xl text-white/90 mb-4 sm:mb-6 italic drop-shadow-md">
                      {seg.subtitle}
                    </p>

                    <div className="mb-6 sm:mb-8">
                      <p className="text-xs text-white/60 uppercase tracking-widest mb-1 font-medium">
                        When
                      </p>
                      <p className="text-lg sm:text-xl text-white font-medium">
                        {sectionDateRange(activeData.days)}
                      </p>
                    </div>

                    <p className="text-lg sm:text-xl text-white/95 leading-relaxed mb-6 sm:mb-8 max-w-2xl">
                      {seg.description}
                    </p>
                  </div>

                {/* Days */}
                <div className="space-y-12 sm:space-y-16">
                  {activeData.days.map((day) => (
                    <div key={day.day} className="relative">
                      {/* Sticky date header */}
                      <div
                        className="sticky top-0 z-20 -mx-5 sm:-mx-6 lg:-mx-12 px-5 sm:px-6 lg:px-12 py-2 backdrop-blur-md border-b border-white/10"
                        style={{ backgroundColor: `color-mix(in oklab, ${seg.color} 40%, rgba(0,0,0,0.7))` }}
                      >
                        <p className="text-xs sm:text-sm text-white/80 uppercase tracking-widest font-medium">
                          {formatDayDate(day.date, day.dayOfWeek)}
                          <span className="text-white/50 mx-2">·</span>
                          <span className="normal-case tracking-normal text-white/70">{day.title}</span>
                        </p>
                      </div>

                      <div className="mb-6 sm:mb-8 mt-5 sm:mt-6">
                        <h3 className="text-3xl sm:text-4xl lg:text-5xl text-white mb-3 sm:mb-4 font-medium">
                          {day.title}
                        </h3>
                        <p className="text-lg sm:text-xl text-white/90 leading-relaxed">
                          {day.summary}
                        </p>
                      </div>

                      <div className="pl-5 sm:pl-6 border-l-2 border-white/30 space-y-6 sm:space-y-8">
                        {day.activities.map((activity, actIdx) => {
                          const locIds = activity.locationIds ?? [];
                          const hasLocations = locIds.length > 0;
                          const isMapHighlighted =
                            mapHoveredId !== null &&
                            locIds.includes(mapHoveredId);
                          const isHovered =
                            hasLocations &&
                            locIds.some((id) =>
                              hoveredLocationIds.includes(id),
                            );
                          const isActive = isHovered || isMapHighlighted;

                          return (
                            <div
                              key={actIdx}
                              data-location-ids={
                                hasLocations ? locIds.join(',') : undefined
                              }
                              onMouseEnter={() => {
                                if (hasLocations)
                                  setHoveredLocationIds(locIds);
                              }}
                              onMouseLeave={() => setHoveredLocationIds([])}
                              className={`transition-all duration-300 rounded-lg -mx-3 px-3 py-1 ${
                                isActive
                                  ? 'bg-white/10 ring-1 ring-white/20'
                                  : ''
                              }`}
                            >
                              <div className="relative">
                                {/* Timeline dot — pulses when active */}
                                <div
                                  className={`absolute -left-[26px] sm:-left-[29px] w-3.5 sm:w-4 h-3.5 sm:h-4 rounded-full border-2 border-white ${
                                    isActive
                                      ? 'animate-dot-pulse'
                                      : ''
                                  }`}
                                  style={{
                                    backgroundColor: isActive
                                      ? seg.color
                                      : 'rgba(255, 255, 255, 0.9)',
                                    boxShadow: isActive
                                      ? `0 0 8px ${seg.color}, 0 0 16px ${seg.color}50`
                                      : 'none',
                                    transition:
                                      'background-color 0.4s ease, box-shadow 0.4s ease',
                                  }}
                                ></div>
                                <div className="text-xs sm:text-sm text-white/70 uppercase tracking-wider mb-2 font-medium" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>
                                  {activity.time}
                                </div>
                                <h4
                                  className="text-xl sm:text-2xl text-white mb-2 sm:mb-3 font-medium"
                                  style={{
                                    textShadow: isActive
                                      ? `0 0 12px ${seg.color}90, 0 0 4px ${seg.color}60`
                                      : 'none',
                                    transition: 'text-shadow 0.4s ease',
                                  }}
                                >
                                  {activity.name}
                                </h4>
                                <p className="text-base sm:text-lg text-white/85 leading-relaxed" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                                  {activity.description}
                                </p>
                                {activity.subgroup && (
                                  <p className="mt-2 text-xs text-white/50 italic">
                                    {activity.subgroup} only
                                  </p>
                                )}
                              </div>
                              {activity.travelAfter && (
                                <div className="flex items-center gap-2 mt-3 sm:mt-4 py-2 px-3 text-xs text-white/70 bg-white/5 rounded-md backdrop-blur-sm" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
                                  <Car className="w-3.5 h-3.5 shrink-0" />
                                  <span>{activity.travelAfter.duration}</span>
                                  <span className="text-white/40">—</span>
                                  <span>
                                    {activity.travelAfter.from} → {activity.travelAfter.to}
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Prev / Next Segment Navigation */}
                <div className="flex items-center justify-between mt-16 sm:mt-20 pt-6 sm:pt-8 border-t border-white/20">
                  {prevSection ? (
                    <button
                      onClick={() => goToSegment(prevSection.segmentId)}
                      className="flex items-center gap-2 sm:gap-3 text-white/70 hover:text-white transition-colors group cursor-pointer"
                    >
                      <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                      <div className="text-left">
                        <p className="text-xs uppercase tracking-wider text-white/50">
                          Previous
                        </p>
                        <p className="text-base sm:text-lg font-medium">
                          {segments[prevSection.segmentId].navLabel}
                        </p>
                      </div>
                    </button>
                  ) : (
                    <div />
                  )}
                  {nextSection ? (
                    <button
                      onClick={() => goToSegment(nextSection.segmentId)}
                      className="flex items-center gap-2 sm:gap-3 text-white/70 hover:text-white transition-colors group cursor-pointer"
                    >
                      <div className="text-right">
                        <p className="text-xs uppercase tracking-wider text-white/50">
                          Next
                        </p>
                        <p className="text-base sm:text-lg font-medium">
                          {segments[nextSection.segmentId].navLabel}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  ) : (
                    <div />
                  )}
                </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Desktop Map */}
        <div
          className="w-1/2 hidden lg:block p-3 transition-colors duration-700 ease-in-out"
          style={{
            backgroundColor: `color-mix(in oklab, ${segments[activeSection].color} 40%, #1a1a1a)`,
          }}
        >
          <div className="relative h-full rounded-2xl overflow-hidden ring-2 ring-white/20 shadow-2xl">
            {/* Inset vignette for depth */}
            <div className="absolute inset-0 rounded-2xl shadow-[inset_0_0_24px_rgba(0,0,0,0.35)] pointer-events-none z-10" />
            <JourneyMap
              activeSegment={activeSection}
              orderedLocationIds={orderedLocationIds}
              hoveredLocationIds={hoveredLocationIds}
              scrollFocusedLocationId={scrollFocusedLocationId}
              onMarkerHover={setMapHoveredId}
              onPinClick={scrollToLocation}
            />
          </div>
        </div>
      </div>

      {/* Mobile Map FAB */}
      <button
        onClick={() => setMobileMapOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white cursor-pointer transition-transform active:scale-95"
        style={{ backgroundColor: seg.color }}
        aria-label="Show map"
      >
        <Map className="w-6 h-6" />
      </button>

      {/* Mobile Map Overlay */}
      {mobileMapOpen && (
        <div className="lg:hidden fixed inset-0 z-[60] flex flex-col">
          {/* Header bar */}
          <div
            className="flex items-center justify-between px-5 py-3 shadow-md"
            style={{ backgroundColor: `color-mix(in oklab, ${seg.color} 50%, #1a1a1a)` }}
          >
            <span className="text-white font-medium text-sm">{seg.title} Map</span>
            <button
              onClick={() => setMobileMapOpen(false)}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-white cursor-pointer"
              aria-label="Close map"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {/* Map */}
          <div className="flex-1">
            <JourneyMap
              activeSegment={activeSection}
              orderedLocationIds={orderedLocationIds}
              hoveredLocationIds={hoveredLocationIds}
              scrollFocusedLocationId={scrollFocusedLocationId}
              onMarkerHover={setMapHoveredId}
              onPinClick={scrollToLocation}
            />
          </div>
        </div>
      )}
    </div>
  );
}

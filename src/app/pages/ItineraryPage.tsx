import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Car, ChevronLeft, ChevronRight } from 'lucide-react';
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

function sectionDateRangeShort(days: TripDay[]): string {
  const first = new Date(days[0]!.date + 'T12:00:00');
  const last = new Date(days[days.length - 1]!.date + 'T12:00:00');
  if (first.getTime() === last.getTime()) {
    return `${first.getMonth() + 1}/${first.getDate()}`;
  }
  return `${first.getMonth() + 1}/${first.getDate()}–${last.getDate()}`;
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
  /** Mobile bottom sheet: true when sheet is swiped down to reveal map. */
  const [sheetDown, setSheetDown] = useState(false);
  /** Location ID to focus on the map (entered by clicking an activity card). */
  const [focusLocationId, setFocusLocationId] = useState<string | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const mobileScrollRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Bottom-sheet touch tracking refs
  const touchStartY = useRef(0);
  const touchDelta = useRef(0);
  const sheetRef = useRef<HTMLDivElement>(null);

  /** Return the currently-visible scroll container (desktop or mobile). */
  const getActiveScrollContainer = useCallback(() => {
    if (window.innerWidth >= 1024) return scrollContainerRef.current;
    return mobileScrollRef.current;
  }, []);

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
    setFocusLocationId(null);
    setTimeout(() => {
      setActiveSection(segmentId);
      history.replaceState(null, '', '#' + segmentId);
      scrollContainerRef.current?.scrollTo({ top: 0 });
      mobileScrollRef.current?.scrollTo({ top: 0 });
      requestAnimationFrame(() => setIsFading(false));
    }, 200);
  }, [activeSection]);

  // \u2500\u2500 Activity-level observer (rooted in scroll container) \u2500

  useEffect(() => {
    const container = scrollContainerRef.current;
    const mobileContainer = mobileScrollRef.current;
    if (!container && !mobileContainer) return;
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
      { root: getActiveScrollContainer(), rootMargin: '-30% 0px -55% 0px', threshold: 0 },
    );

    const activeContainer = getActiveScrollContainer();
    if (activeContainer) {
      const cards = activeContainer.querySelectorAll('[data-location-ids]');
      cards.forEach((el) => activityObserver.observe(el));
    }

    return () => {
      activityObserver.disconnect();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [activeSection, getActiveScrollContainer]);

  // ── Scroll to a location within the container (map pin click) ─

  const scrollToLocation = useCallback(
    (locationId: string) => {
      const container = getActiveScrollContainer();
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
          // On mobile, bring sheet back up after selecting a pin
          setSheetDown(false);
          return;
        }
      }
    },
    [activeSection],
  );

  // ── Bottom-sheet touch handlers ─────────────────────────

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0]!.clientY;
    touchDelta.current = 0;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchDelta.current = e.touches[0]!.clientY - touchStartY.current;
    // Live drag feedback on the sheet
    const sheet = sheetRef.current;
    if (!sheet) return;
    if (sheetDown) {
      // Sheet is down — allow dragging up (negative delta)
      const clamped = Math.min(0, touchDelta.current);
      sheet.style.transition = 'none';
      sheet.style.transform = `translateY(calc(85% + ${clamped}px))`;
    } else {
      // Sheet is up — only allow dragging down (positive delta) when at scroll top
      const container = mobileScrollRef.current ?? scrollContainerRef.current;
      if (container && container.scrollTop > 0) return; // don't hijack content scroll
      const clamped = Math.max(0, touchDelta.current);
      sheet.style.transition = 'none';
      sheet.style.transform = `translateY(${clamped}px)`;
    }
  }, [sheetDown]);

  const handleTouchEnd = useCallback(() => {
    const sheet = sheetRef.current;
    if (!sheet) return;
    const THRESHOLD = 80;
    sheet.style.transition = '';
    if (sheetDown) {
      // Was down — swipe up to close
      if (touchDelta.current < -THRESHOLD) {
        setSheetDown(false);
        sheet.style.transform = '';
      } else {
        sheet.style.transform = '';
      }
    } else {
      // Was up — swipe down to reveal map
      if (touchDelta.current > THRESHOLD) {
        setSheetDown(true);
      }
      sheet.style.transform = '';
    }
    touchDelta.current = 0;
  }, [sheetDown]);

  if (!activeData || !seg) return null;

  return (
    <div className="fixed top-16 left-0 right-0 bottom-0 flex flex-col">
      {/* Sub-Navigation — dark translucent bar */}
      <div className="z-40 bg-black/60 backdrop-blur-md border-b border-white/10 shadow-sm shrink-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-12 py-2">
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 sm:overflow-x-auto">
            {sections.map((s) => {
              const isActive = activeSection === s.segmentId;
              const color = segments[s.segmentId].color;
              const seg = segments[s.segmentId];
              return (
              <button
                key={s.segmentId}
                onClick={() => goToSegment(s.segmentId)}
                className={`cursor-pointer relative group flex-shrink-0 whitespace-nowrap px-3 sm:px-6 py-1.5 sm:py-2 rounded-full text-sm transition-all duration-200 font-bold flex flex-col items-center gap-0.5 ${
                  isActive
                    ? 'text-white shadow-md shadow-black/20'
                    : 'text-white/70 hover:text-white hover:shadow-sm'
                }`}
                style={{
                  backgroundColor: isActive ? color : undefined,
                }}
              >
                <span className="relative z-10 sm:hidden">{seg.mobileNavLabel}</span>
                <span className="relative z-10 hidden sm:inline">{seg.navLabel}</span>
                <span className={`relative z-10 text-[10px] tracking-wide ${
                  isActive ? 'text-white/60' : 'text-white/40'
                }`}>
                  <span className="sm:hidden">{sectionDateRangeShort(s.days)}</span>
                  <span className="hidden sm:inline">{sectionDateRange(s.days)}</span>
                </span>
                {/* Hover pill tint */}
                {!isActive && (
                  <span
                    className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-200 pointer-events-none"
                    style={{ backgroundColor: color }}
                  />
                )}
              </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Map + Itinerary overlay */}
      <div className="flex-1 relative min-h-0">
        {/* Full-viewport map background */}
        <div className="absolute inset-0 z-0">
          <JourneyMap
            activeSegment={activeSection}
            orderedLocationIds={orderedLocationIds}
            hoveredLocationIds={hoveredLocationIds}
            scrollFocusedLocationId={scrollFocusedLocationId}
            focusLocationId={focusLocationId}
            onMarkerHover={setMapHoveredId}
            onPinClick={scrollToLocation}
            onExitFocus={() => setFocusLocationId(null)}
          />
        </div>

        {/* Desktop: translucent left-panel overlay */}
        <div
          ref={scrollContainerRef}
          className="hidden lg:block absolute top-0 bottom-0 left-0 z-10 w-[38%] xl:w-1/3 overflow-y-auto bg-black/45 backdrop-blur-md border-r border-white/10"
        >
          <div
            className="transition-opacity duration-200"
            style={{ opacity: isFading ? 0 : 1 }}
          >
            <section data-section={activeData.segmentId} className="relative">
              {/* Compact hero image */}
              <div
                className="sticky top-0 h-[25vh] -mb-[25vh] z-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${seg.bgImage})` }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.6) 60%, rgba(0,0,0,0.7))',
                  }}
                />
              </div>

              <div className="relative z-10">
                <div className="h-[10vh]" />

                <div className="px-5 sm:px-6 lg:px-8 pb-16">
                  {/* Section Header */}
                  <div className="mb-6 sm:mb-8">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl text-white mb-2 sm:mb-3 tracking-tight font-medium drop-shadow-lg" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.7)' }}>
                      {seg.title}
                    </h2>
                    <p className="text-lg sm:text-xl text-white/90 mb-3 sm:mb-4 italic drop-shadow-md" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>
                      {seg.subtitle}
                    </p>
                    <div className="mb-4 sm:mb-5">
                      <p className="text-xs text-white/60 uppercase tracking-widest mb-1 font-medium">When</p>
                      <p className="text-base sm:text-lg text-white font-medium" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>
                        {sectionDateRange(activeData.days)}
                      </p>
                    </div>
                    <p className="text-base sm:text-lg text-white/95 leading-relaxed mb-4 sm:mb-6" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                      {seg.description}
                    </p>
                  </div>

                  {/* Days */}
                  <div className="space-y-10 sm:space-y-12">
                    {activeData.days.map((day) => (
                      <div key={day.day} className="relative">
                        <div
                          className="sticky top-0 z-20 -mx-5 sm:-mx-6 lg:-mx-8 px-5 sm:px-6 lg:px-8 py-2 backdrop-blur-md border-b border-white/10"
                          style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
                        >
                          <p className="text-xs sm:text-sm text-white/80 uppercase tracking-widest font-medium" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
                            {formatDayDate(day.date, day.dayOfWeek)}
                            <span className="text-white/50 mx-2">·</span>
                            <span className="normal-case tracking-normal text-white/70">{day.title}</span>
                          </p>
                        </div>
                        <div className="mb-4 sm:mb-6 mt-4 sm:mt-5">
                          <h3 className="text-2xl sm:text-3xl text-white mb-2 sm:mb-3 font-medium" style={{ textShadow: '0 2px 6px rgba(0,0,0,0.6)' }}>
                            {day.title}
                          </h3>
                          <p className="text-base sm:text-lg text-white/90 leading-relaxed" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                            {day.summary}
                          </p>
                        </div>
                        <div className="pl-4 sm:pl-5 border-l-2 border-white/30 space-y-5 sm:space-y-6">
                          {day.activities.map((activity, actIdx) => {
                            const locIds = activity.locationIds ?? [];
                            const hasLocations = locIds.length > 0;
                            const isMapHighlighted = mapHoveredId !== null && locIds.includes(mapHoveredId);
                            const isHovered = hasLocations && locIds.some((id) => hoveredLocationIds.includes(id));
                            const isActive = isHovered || isMapHighlighted;
                            return (
                              <div
                                key={actIdx}
                                data-location-ids={hasLocations ? locIds.join(',') : undefined}
                                onMouseEnter={() => { if (hasLocations) setHoveredLocationIds(locIds); }}
                                onMouseLeave={() => setHoveredLocationIds([])}
                                onClick={() => { if (hasLocations) setFocusLocationId(locIds[0]!); }}
                                className={`transition-all duration-300 rounded-lg -mx-2 px-2 py-1 ${hasLocations ? 'cursor-pointer' : ''} ${isActive ? 'bg-white/10 ring-1 ring-white/20' : ''}`}
                              >
                                <div className="relative">
                                  <div
                                    className={`absolute -left-[22px] sm:-left-[25px] w-3 sm:w-3.5 h-3 sm:h-3.5 rounded-full border-2 border-white ${isActive ? 'animate-dot-pulse' : ''}`}
                                    style={{
                                      backgroundColor: isActive ? seg.color : 'rgba(255, 255, 255, 0.9)',
                                      boxShadow: isActive ? `0 0 8px ${seg.color}, 0 0 16px ${seg.color}50` : 'none',
                                      transition: 'background-color 0.4s ease, box-shadow 0.4s ease',
                                    }}
                                  />
                                  <div className="text-xs sm:text-sm text-white/70 uppercase tracking-wider mb-1.5 font-medium" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>
                                    {activity.time}
                                  </div>
                                  <h4
                                    className="text-lg sm:text-xl text-white mb-1.5 sm:mb-2 font-medium"
                                    style={{
                                      textShadow: isActive ? `0 0 12px ${seg.color}90, 0 0 4px ${seg.color}60` : '0 1px 4px rgba(0,0,0,0.5)',
                                      transition: 'text-shadow 0.4s ease',
                                    }}
                                  >
                                    {activity.name}
                                  </h4>
                                  <p className="text-sm sm:text-base text-white/85 leading-relaxed" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                                    {activity.description}
                                  </p>
                                  {activity.subgroup && (
                                    <p className="mt-1.5 text-xs text-white/50 italic">{activity.subgroup} only</p>
                                  )}
                                </div>
                                {activity.travelAfter && (
                                  <div className="flex items-center gap-2 mt-2 sm:mt-3 py-1.5 px-2.5 text-xs text-white/70 bg-white/5 rounded-md backdrop-blur-sm" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
                                    <Car className="w-3.5 h-3.5 shrink-0" />
                                    <span>{activity.travelAfter.duration}</span>
                                    <span className="text-white/40">—</span>
                                    <span>{activity.travelAfter.from} → {activity.travelAfter.to}</span>
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
                  <div className="flex items-center justify-between mt-12 sm:mt-16 pt-5 sm:pt-6 border-t border-white/20">
                    {prevSection ? (
                      <button
                        onClick={() => goToSegment(prevSection.segmentId)}
                        className="flex items-center gap-2 text-white/70 hover:text-white transition-colors group cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <div className="text-left">
                          <p className="text-xs uppercase tracking-wider text-white/50">Previous</p>
                          <p className="text-sm sm:text-base font-medium">{segments[prevSection.segmentId].navLabel}</p>
                        </div>
                      </button>
                    ) : <div />}
                    {nextSection ? (
                      <button
                        onClick={() => goToSegment(nextSection.segmentId)}
                        className="flex items-center gap-2 text-white/70 hover:text-white transition-colors group cursor-pointer"
                      >
                        <div className="text-right">
                          <p className="text-xs uppercase tracking-wider text-white/50">Next</p>
                          <p className="text-sm sm:text-base font-medium">{segments[nextSection.segmentId].navLabel}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    ) : <div />}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Mobile: bottom-sheet itinerary over the map */}
        <div
          ref={sheetRef}
          className="lg:hidden absolute inset-0 z-10 flex flex-col bg-black/50 backdrop-blur-md transition-transform duration-300 ease-out"
          style={{ transform: sheetDown ? 'translateY(85%)' : 'translateY(0)' }}
        >
          {/* Drag handle */}
          <div
            className="flex-shrink-0 flex items-center justify-center py-3 cursor-grab active:cursor-grabbing"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="w-10 h-1 bg-white/40 rounded-full" />
          </div>

          {/* Scrollable itinerary content */}
          <div
            ref={mobileScrollRef}
            className="flex-1 overflow-y-auto min-h-0"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className="transition-opacity duration-200"
              style={{ opacity: isFading ? 0 : 1 }}
            >
              <section data-section={activeData.segmentId} className="relative">
                {/* Compact hero image */}
                <div
                  className="sticky top-0 h-[30vh] -mb-[30vh] z-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${seg.bgImage})` }}
                >
                  <div
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.6) 60%, rgba(0,0,0,0.7))',
                    }}
                  />
                </div>

                <div className="relative z-10">
                  <div className="h-[15vh]" />

                  <div className="px-5 sm:px-6 pb-16 sm:pb-20">
                    {/* Section Header */}
                    <div className="mb-8 sm:mb-10">
                      <h2 className="text-4xl sm:text-5xl text-white mb-3 sm:mb-4 tracking-tight font-medium drop-shadow-lg" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.7)' }}>
                        {seg.title}
                      </h2>
                      <p className="text-xl sm:text-2xl text-white/90 mb-4 sm:mb-5 italic drop-shadow-md" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>
                        {seg.subtitle}
                      </p>
                      <div className="mb-5 sm:mb-6">
                        <p className="text-xs text-white/60 uppercase tracking-widest mb-1 font-medium">When</p>
                        <p className="text-lg sm:text-xl text-white font-medium" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>
                          {sectionDateRange(activeData.days)}
                        </p>
                      </div>
                      <p className="text-lg sm:text-xl text-white/95 leading-relaxed mb-5 sm:mb-6" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                        {seg.description}
                      </p>
                    </div>

                    {/* Days */}
                    <div className="space-y-12 sm:space-y-14">
                      {activeData.days.map((day) => (
                        <div key={day.day} className="relative">
                          <div
                            className="sticky top-0 z-20 -mx-5 sm:-mx-6 px-5 sm:px-6 py-2 backdrop-blur-md border-b border-white/10"
                            style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
                          >
                            <p className="text-xs sm:text-sm text-white/80 uppercase tracking-widest font-medium" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
                              {formatDayDate(day.date, day.dayOfWeek)}
                              <span className="text-white/50 mx-2">·</span>
                              <span className="normal-case tracking-normal text-white/70">{day.title}</span>
                            </p>
                          </div>
                          <div className="mb-6 sm:mb-8 mt-5 sm:mt-6">
                            <h3 className="text-3xl sm:text-4xl text-white mb-3 sm:mb-4 font-medium" style={{ textShadow: '0 2px 6px rgba(0,0,0,0.6)' }}>
                              {day.title}
                            </h3>
                            <p className="text-lg sm:text-xl text-white/90 leading-relaxed" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                              {day.summary}
                            </p>
                          </div>
                          <div className="pl-5 sm:pl-6 border-l-2 border-white/30 space-y-6 sm:space-y-8">
                            {day.activities.map((activity, actIdx) => {
                              const locIds = activity.locationIds ?? [];
                              const hasLocations = locIds.length > 0;
                              const isMapHighlighted = mapHoveredId !== null && locIds.includes(mapHoveredId);
                              const isHovered = hasLocations && locIds.some((id) => hoveredLocationIds.includes(id));
                              const isActive = isHovered || isMapHighlighted;
                              return (
                                <div
                                  key={actIdx}
                                  data-location-ids={hasLocations ? locIds.join(',') : undefined}
                                  onMouseEnter={() => { if (hasLocations) setHoveredLocationIds(locIds); }}
                                  onMouseLeave={() => setHoveredLocationIds([])}
                                  onClick={() => { if (hasLocations) setFocusLocationId(locIds[0]!); }}
                                  className={`transition-all duration-300 rounded-lg -mx-3 px-3 py-1 ${hasLocations ? 'cursor-pointer' : ''} ${isActive ? 'bg-white/10 ring-1 ring-white/20' : ''}`}
                                >
                                  <div className="relative">
                                    <div
                                      className={`absolute -left-[26px] sm:-left-[29px] w-3.5 sm:w-4 h-3.5 sm:h-4 rounded-full border-2 border-white ${isActive ? 'animate-dot-pulse' : ''}`}
                                      style={{
                                        backgroundColor: isActive ? seg.color : 'rgba(255, 255, 255, 0.9)',
                                        boxShadow: isActive ? `0 0 8px ${seg.color}, 0 0 16px ${seg.color}50` : 'none',
                                        transition: 'background-color 0.4s ease, box-shadow 0.4s ease',
                                      }}
                                    />
                                    <div className="text-xs sm:text-sm text-white/70 uppercase tracking-wider mb-2 font-medium" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>
                                      {activity.time}
                                    </div>
                                    <h4
                                      className="text-xl sm:text-2xl text-white mb-2 sm:mb-3 font-medium"
                                      style={{
                                        textShadow: isActive ? `0 0 12px ${seg.color}90, 0 0 4px ${seg.color}60` : '0 1px 4px rgba(0,0,0,0.5)',
                                        transition: 'text-shadow 0.4s ease',
                                      }}
                                    >
                                      {activity.name}
                                    </h4>
                                    <p className="text-base sm:text-lg text-white/85 leading-relaxed" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                                      {activity.description}
                                    </p>
                                    {activity.subgroup && (
                                      <p className="mt-2 text-xs text-white/50 italic">{activity.subgroup} only</p>
                                    )}
                                  </div>
                                  {activity.travelAfter && (
                                    <div className="flex items-center gap-2 mt-3 sm:mt-4 py-2 px-3 text-xs text-white/70 bg-white/5 rounded-md backdrop-blur-sm" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
                                      <Car className="w-3.5 h-3.5 shrink-0" />
                                      <span>{activity.travelAfter.duration}</span>
                                      <span className="text-white/40">—</span>
                                      <span>{activity.travelAfter.from} → {activity.travelAfter.to}</span>
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
                            <p className="text-xs uppercase tracking-wider text-white/50">Previous</p>
                            <p className="text-base sm:text-lg font-medium">{segments[prevSection.segmentId].navLabel}</p>
                          </div>
                        </button>
                      ) : <div />}
                      {nextSection ? (
                        <button
                          onClick={() => goToSegment(nextSection.segmentId)}
                          className="flex items-center gap-2 sm:gap-3 text-white/70 hover:text-white transition-colors group cursor-pointer"
                        >
                          <div className="text-right">
                            <p className="text-xs uppercase tracking-wider text-white/50">Next</p>
                            <p className="text-base sm:text-lg font-medium">{segments[nextSection.segmentId].navLabel}</p>
                          </div>
                          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                      ) : <div />}
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

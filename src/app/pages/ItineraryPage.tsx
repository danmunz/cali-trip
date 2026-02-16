import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Car, ChevronDown } from 'lucide-react';
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

  const contentRef = useRef<HTMLDivElement>(null);

  // ── Restore scroll position from URL hash on mount ───────

  useEffect(() => {
    const segmentFromHash = getSegmentFromHash();
    if (segmentFromHash) {
      const el = document.querySelector(`[data-section="${segmentFromHash}"]`);
      if (el) {
        // Delay slightly so layout is settled before measuring
        requestAnimationFrame(() => {
          const offset = 120;
          const top = el.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({ top, behavior: 'instant' });
        });
      }
    }
  }, []);

  // ── IntersectionObserver for section tracking ────────────

  useEffect(() => {
    // Section-level observer: determines activeSection for map segment
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('data-section');
            if (id) {
              setActiveSection(id as SegmentId);
              history.replaceState(null, '', '#' + id);
            }
          }
        }
      },
      { rootMargin: '-40% 0px -40% 0px', threshold: 0 },
    );

    const sections = document.querySelectorAll('[data-section]');
    sections.forEach((el) => sectionObserver.observe(el));

    return () => {
      sectionObserver.disconnect();
    };
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.querySelector(`[data-section="${sectionId}"]`);
    if (element) {
      history.replaceState(null, '', '#' + sectionId);
      const offset = 120;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  /** Scroll to the first activity card matching a location within the active segment. */
  const scrollToLocation = useCallback(
    (locationId: string) => {
      const section = document.querySelector(
        `[data-section="${activeSection}"]`,
      );
      if (!section) return;

      // Find all activity cards in the active section that reference this location
      const cards = section.querySelectorAll('[data-location-ids]');
      for (const card of cards) {
        const ids = card.getAttribute('data-location-ids')?.split(',') ?? [];
        if (ids.includes(locationId)) {
          const offset = 160;
          const rect = card.getBoundingClientRect();
          const scrollTarget = rect.top + window.pageYOffset - offset;
          window.scrollTo({ top: scrollTarget, behavior: 'smooth' });
          return;
        }
      }
    },
    [activeSection],
  );

  return (
    <div className="pt-16">
      {/* Sub-Navigation - Sticky */}
      <div className="sticky top-16 z-40 bg-gray-200/95 backdrop-blur-sm border-b border-gray-300 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 lg:px-12 py-4">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {sections.map((s) => (
              <button
                key={s.segmentId}
                onClick={() => scrollToSection(s.segmentId)}
                className={`px-6 py-3 rounded-full text-base transition-all font-medium ${
                  activeSection === s.segmentId
                    ? 'bg-gray-700 text-white shadow-lg'
                    : 'bg-transparent text-gray-900 hover:bg-gray-300'
                }`}
              >
                {segments[s.segmentId].navLabel}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Fixed Map */}
      <div className="fixed top-32 right-0 w-1/2 bottom-0 hidden lg:block">
        <JourneyMap
          activeSegment={activeSection}
          hoveredLocationIds={hoveredLocationIds}
          onMarkerHover={setMapHoveredId}
          onPinClick={scrollToLocation}
        />
      </div>

      {/* Scrollable Content */}
      <div ref={contentRef} className="lg:w-1/2 min-h-screen">
        {sections.map((s, sIdx) => {
          const seg = segments[s.segmentId];
          return (
            <section
              key={s.segmentId}
              data-section={s.segmentId}
              className="min-h-screen relative"
            >
              {/* Background Image with Overlay */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${seg.bgImage})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/75 to-black/80"></div>
              </div>

              {/* Content */}
              <div className="relative z-10 px-6 lg:px-12 py-20">
                {/* Section Header */}
                <div className="mb-12">
                  <h2 className="text-6xl sm:text-7xl lg:text-8xl text-white mb-4 tracking-tight font-light">
                    {seg.title}
                  </h2>
                  <p className="text-2xl text-white/90 mb-6 italic">
                    {seg.subtitle}
                  </p>

                  <div className="mb-8">
                    <p className="text-xs text-white/60 uppercase tracking-widest mb-1 font-medium">
                      When
                    </p>
                    <p className="text-xl text-white font-medium">
                      {sectionDateRange(s.days)}
                    </p>
                  </div>

                  <p className="text-2xl text-white/95 leading-relaxed mb-8 max-w-2xl">
                    {seg.description}
                  </p>
                </div>

                {/* Days */}
                <div className="space-y-16">
                  {s.days.map((day) => (
                    <div key={day.day} className="relative">
                      <div className="mb-8">
                        <div className="text-base text-white/70 uppercase tracking-wider mb-2 font-medium">
                          {formatDayDate(day.date, day.dayOfWeek)}
                        </div>
                        <h3 className="text-4xl sm:text-5xl text-white mb-4 font-medium">
                          {day.title}
                        </h3>
                        <p className="text-xl text-white/90 leading-relaxed">
                          {day.summary}
                        </p>
                      </div>

                      <div className="pl-6 border-l-2 border-white/30 space-y-8">
                        {day.activities.map((activity, actIdx) => {
                          const locIds = activity.locationIds ?? [];
                          const hasLocations = locIds.length > 0;
                          // Reverse highlight: a map pin hover matches this card
                          const isMapHighlighted =
                            mapHoveredId !== null &&
                            locIds.includes(mapHoveredId);
                          // Hover-driven highlight: user is mousing over this card
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
                                  className={`absolute -left-[29px] w-4 h-4 rounded-full border-2 border-white ${
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
                                <div className="text-sm text-white/70 uppercase tracking-wider mb-2 font-medium">
                                  {activity.time}
                                </div>
                                <h4
                                  className="text-2xl text-white mb-3 font-medium"
                                  style={{
                                    textShadow: isActive
                                      ? `0 0 12px ${seg.color}90, 0 0 4px ${seg.color}60`
                                      : 'none',
                                    transition: 'text-shadow 0.4s ease',
                                  }}
                                >
                                  {activity.name}
                                </h4>
                                <p className="text-lg text-white/85 leading-relaxed">
                                  {activity.description}
                                </p>
                                {activity.subgroup && (
                                  <p className="mt-2 text-xs text-white/50 italic">
                                    {activity.subgroup} only
                                  </p>
                                )}
                              </div>
                              {activity.travelAfter && (
                                <div className="flex items-center gap-2 mt-4 py-2 text-xs text-white/50">
                                  <Car className="w-3.5 h-3.5 shrink-0" />
                                  <span>{activity.travelAfter.duration}</span>
                                  <span className="text-white/30">—</span>
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

                {sIdx < sections.length - 1 && (
                  <div className="flex justify-center mt-20">
                    <div className="animate-bounce">
                      <ChevronDown className="w-10 h-10 text-white/40" />
                    </div>
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

import { useState, useEffect, useRef, useMemo } from 'react';
import { Car, MapPin, Globe, Star, Plane, Building2 } from 'lucide-react';
import { itinerary } from '../../data/itinerary.generated';
import { tripMeta } from '../../data/trip-meta.generated';
import { segments } from '../../data/segments';
import locationsData from '../../data/locations.json';
import type { Location } from '../../data/types';

// ── Helpers ──────────────────────────────────────────────────

const locationMap = new Map<string, Location>(
  (locationsData.locations as Location[]).map((l) => [l.id, l]),
);

function segmentColor(segmentId: string): string {
  return (
    (segments as Record<string, { color: string }>)[segmentId]?.color ??
    '#64748b'
  );
}

function formatDate(iso: string, dayOfWeek: string): string {
  const d = new Date(iso + 'T12:00:00');
  return `${dayOfWeek}, ${d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`;
}

// ── Segment background images (ordered, unique) ─────────────

const segmentBgImages: { segmentId: string; url: string }[] = [];
{
  const seen = new Set<string>();
  for (const day of itinerary) {
    if (!seen.has(day.segmentId)) {
      seen.add(day.segmentId);
      const seg = (segments as Record<string, { bgImage?: string }>)[day.segmentId];
      if (seg?.bgImage) segmentBgImages.push({ segmentId: day.segmentId, url: seg.bgImage });
    }
  }
}

// ── Crossfading segment background ──────────────────────────

function SegmentBackground() {
  const [activeSegment, setActiveSegment] = useState<string>(segmentBgImages[0]?.segmentId ?? '');

  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>('[data-segment]');
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the topmost visible section
        let best: { id: string; top: number } | null = null;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const seg = entry.target.getAttribute('data-segment')!;
          const top = entry.boundingClientRect.top;
          if (!best || top < best.top) best = { id: seg, top };
        }
        // Fallback: scan all sections if none from this batch
        if (!best) {
          for (const section of sections) {
            const rect = section.getBoundingClientRect();
            if (rect.bottom > 100) {
              best = { id: section.getAttribute('data-segment')!, top: rect.top };
              break;
            }
          }
        }
        if (best) setActiveSegment(best.id);
      },
      { rootMargin: '-10% 0px -60% 0px', threshold: 0 },
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="fixed inset-0 z-[1] pointer-events-none print:hidden" aria-hidden="true">
      {/* Segment images */}
      {segmentBgImages.map(({ segmentId, url }) => (
        <div
          key={segmentId}
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-[2000ms] ease-in-out"
          style={{
            backgroundImage: `url(${url})`,
            opacity: activeSegment === segmentId ? 0.10 : 0,
          }}
        />
      ))}
    </div>
  );
}

// ── Location link pills ──────────────────────────────────────

function LocationLinks({ locationIds }: { locationIds: string[] }) {
  const seen = new Set<string>();
  const locs: Location[] = [];
  for (const id of locationIds) {
    const loc = locationMap.get(id);
    if (loc && !seen.has(id)) {
      seen.add(id);
      locs.push(loc);
    }
  }
  if (locs.length === 0) return null;

  return (
    <div className="mt-4 space-y-2.5">
      {locs.map((loc) => {
        const hasDir = !!loc.google_maps_url?.[0];
        const hasWeb = !!loc.official_url?.[0];
        const hasReview = !!loc.review_url?.[0];
        if (!hasDir && !hasWeb && !hasReview) return null;

        // For print: show just the website URL as plain text
        const printUrl = hasWeb
          ? loc.official_url[0]!.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')
          : null;

        return (
          <div key={loc.id}>
            {/* Screen: pill buttons */}
            <div className="flex items-center flex-wrap gap-x-2 gap-y-2 text-sm print:hidden">
              <span className="text-gray-600 font-semibold mr-1">{loc.name}</span>
              {hasDir && (
                <a
                  href={loc.google_maps_url[0]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 transition-colors font-medium"
                >
                  <MapPin className="w-3.5 h-3.5" /> Directions
                </a>
              )}
              {hasWeb && (
                <a
                  href={loc.official_url[0]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 transition-colors font-medium"
                >
                  <Globe className="w-3.5 h-3.5" /> Website
                </a>
              )}
              {hasReview && (
                <a
                  href={loc.review_url[0]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 transition-colors font-medium"
                >
                  <Star className="w-3.5 h-3.5" /> Reviews
                </a>
              )}
            </div>
            {/* Print: location name + plain URL */}
            <div className="hidden print:block text-gray-600" style={{ fontSize: '8pt' }}>
              <span className="font-semibold">{loc.name}</span>
              {printUrl && (
                <span className="text-gray-400 ml-1">— {printUrl}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Table of Contents Sidebar ────────────────────────────────

function TocSidebar() {
  const [visible, setVisible] = useState(false);
  const [activeId, setActiveId] = useState('');
  const hoveredRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  // Group itinerary days by segment
  const tocGroups = useMemo(() => {
    const groups: {
      segmentId: string;
      label: string;
      color: string;
      days: typeof itinerary;
    }[] = [];
    let current: (typeof groups)[number] | null = null;
    for (const day of itinerary) {
      if (!current || current.segmentId !== day.segmentId) {
        const seg = (segments as Record<string, { navLabel: string; color: string }>)[
          day.segmentId
        ];
        current = {
          segmentId: day.segmentId,
          label: seg?.navLabel ?? day.segmentId,
          color: seg?.color ?? '#64748b',
          days: [],
        };
        groups.push(current);
      }
      current.days.push(day);
    }
    return groups;
  }, []);

  // Scroll: reveal sidebar + track active day section
  useEffect(() => {
    let rafId = 0;
    const onScroll = () => {
      setVisible(true);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        if (!hoveredRef.current) setVisible(false);
      }, 1500);

      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const sections = document.querySelectorAll<HTMLElement>('section[id^="day-"]');
        let active = '';
        for (const section of sections) {
          if (!/^day-\d+$/.test(section.id)) continue;
          const rect = section.getBoundingClientRect();
          if (rect.top <= 120) active = section.id;
        }
        if (active) setActiveId(active);
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      clearTimeout(timerRef.current);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const activeDayNum = parseInt(activeId.replace('day-', ''), 10) || -1;

  return (
    <nav
      data-toc-sidebar
      className="fixed left-0 top-16 bottom-0 w-56 z-40 hidden lg:block transition-all duration-300 ease-in-out"
      style={{
        transform: visible ? 'translateX(0)' : 'translateX(calc(-100% + 0.75rem))',
      }}
      onMouseEnter={() => {
        hoveredRef.current = true;
        clearTimeout(timerRef.current);
        setVisible(true);
      }}
      onMouseLeave={() => {
        hoveredRef.current = false;
        timerRef.current = setTimeout(() => setVisible(false), 800);
      }}
    >
      {/* Main panel */}
      <div
        className={`absolute inset-0 right-3 bg-white/95 backdrop-blur-sm border-r border-gray-200 overflow-y-auto overscroll-contain transition-shadow duration-300 ${
          visible ? 'shadow-xl' : 'shadow-md'
        }`}
      >
        <div className="py-6 px-3">
        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-5 px-2">
          Contents
        </p>

        {tocGroups.map((group) => (
          <div key={group.segmentId} className="mb-5">
            {/* Segment header */}
            <div className="flex items-center gap-2 px-2 mb-2">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: group.color }}
              />
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                {group.label}
              </span>
            </div>

            {/* Days within segment */}
            <div className="space-y-0.5">
              {group.days.map((day) => {
                const isActive = activeDayNum === day.day;
                return (
                  <div key={day.day}>
                    <button
                      onClick={() => scrollTo(`day-${day.day}`)}
                      className={`w-full text-left px-3 py-1.5 text-[13px] rounded-md transition-all duration-200 ${
                        isActive
                          ? 'text-gray-900 font-semibold bg-gray-100/80'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                      style={
                        isActive
                          ? { borderLeft: `3px solid ${group.color}`, paddingLeft: '9px' }
                          : { marginLeft: '3px' }
                      }
                    >
                      <span
                        className="block text-[10px] uppercase tracking-wider font-medium mb-0.5"
                        style={{ color: isActive ? group.color : undefined }}
                      >
                        Day {day.day}
                      </span>
                      <span className="block truncate">{day.title}</span>
                    </button>

                    {/* Nested stops — active day only */}
                    {isActive && (
                      <div className="ml-3 border-l border-gray-200 pl-3 py-1 space-y-0.5 animate-[fadeIn_200ms_ease-out]">
                        {day.activities.map((act, i) => (
                          <button
                            key={i}
                            onClick={() => scrollTo(`day-${day.day}-stop-${i}`)}
                            className="block w-full text-left text-[11px] text-gray-400 hover:text-gray-600 py-0.5 truncate transition-colors"
                            title={act.name}
                          >
                            {act.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        </div>
      </div>

      {/* Peek tab — always visible edge with colored dots */}
      <div className="absolute right-0 top-0 bottom-0 w-3 flex flex-col items-center pt-8 gap-3">
        {tocGroups.map((group) =>
          group.days.map((day) => (
            <span
              key={day.day}
              className={`w-1.5 rounded-full transition-all duration-300 ${
                activeDayNum === day.day ? 'h-4' : 'h-1.5'
              }`}
              style={{
                backgroundColor: activeDayNum === day.day
                  ? group.color
                  : `${group.color}66`,
              }}
            />
          )),
        )}
      </div>
    </nav>
  );
}

// ── Page ─────────────────────────────────────────────────────

export default function FullItineraryPage() {
  return (
    <div className="pt-16 min-h-screen bg-transparent">
      <SegmentBackground />
      <TocSidebar />

      {/* Header */}
      <div className="relative z-[2] border-b border-gray-200 py-20 px-6 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-gray-400 mb-6 font-bold">
          Full Itinerary
        </p>
        <h1 className="text-5xl sm:text-6xl text-gray-900 mb-3 tracking-tight font-medium">
          {tripMeta.title}
        </h1>
        <p className="text-lg text-gray-500 font-medium">
          {tripMeta.subtitle.replace(' | ', ' · ')}
        </p>
      </div>

      <main className="relative z-10 max-w-3xl mx-auto px-6 lg:px-12 py-16">
        {/* Overview */}
        <section className="mb-16">
          <p className="text-2xl leading-relaxed text-gray-700">
            {tripMeta.overview}
          </p>
        </section>

        {/* Schedule Table */}
        <section className="mb-12">
          <h2 className="text-3xl text-gray-900 mb-6 font-medium">Schedule</h2>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-gray-600 font-bold">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-gray-600 font-bold">
                    Base
                  </th>
                  <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-gray-600 font-bold hidden sm:table-cell">
                    Logistics
                  </th>
                </tr>
              </thead>
              <tbody>
                {tripMeta.dailySchedule.map((row, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-gray-100 last:border-0"
                  >
                    <td className="py-3 px-4 font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{
                            backgroundColor: segmentColor(row.segmentId),
                          }}
                        />
                        {row.date}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-800">{row.base}</td>
                    <td className="py-3 px-4 text-gray-600 hidden sm:table-cell">
                      {row.logistics}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Flights + Lodging */}
        <div className="grid sm:grid-cols-2 gap-8 mb-16">
          {/* Flights */}
          <section className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Plane className="w-5 h-5 text-gray-400" />
              <h3 className="text-lg text-gray-900 font-medium">Flights</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  Outbound
                </div>
                <div className="text-gray-900 font-medium">
                  {tripMeta.flights.outbound.number} ·{' '}
                  {tripMeta.flights.outbound.date}
                </div>
                <div className="text-gray-600">
                  {tripMeta.flights.outbound.departure} →{' '}
                  {tripMeta.flights.outbound.arrival}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  Return
                </div>
                <div className="text-gray-900 font-medium">
                  {tripMeta.flights.return.number} ·{' '}
                  {tripMeta.flights.return.date}
                </div>
                <div className="text-gray-600">
                  {tripMeta.flights.return.departure} →{' '}
                  {tripMeta.flights.return.arrival}
                </div>
              </div>
              <div className="text-xs text-gray-400 pt-1">
                {tripMeta.flights.airline} · Confirmation:{' '}
                <span className="font-mono">
                  {tripMeta.flights.confirmation}
                </span>
              </div>
            </div>
          </section>

          {/* Lodging */}
          <section className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-5 h-5 text-gray-400" />
              <h3 className="text-lg text-gray-900 font-medium">Lodging</h3>
            </div>
            <div className="space-y-4 text-sm">
              {tripMeta.lodgingConfirmations.map((lodge, idx) => (
                <div key={idx}>
                  <div className="text-gray-900 font-medium">{lodge.name}</div>
                  <div className="text-gray-500">{lodge.dates}</div>
                  <div className="text-xs text-gray-400">{lodge.address}</div>
                  {lodge.confirmations.map((c, ci) => (
                    <div key={ci} className="text-xs text-gray-400 font-mono">
                      {c}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-16">
          <div className="flex-1 border-t border-gray-200" />
          <span className="text-xs uppercase tracking-[0.2em] text-gray-400 font-bold">
            Day-by-Day
          </span>
          <div className="flex-1 border-t border-gray-200" />
        </div>

        {/* Day-by-Day Itinerary */}
        <div className="space-y-20">
          {itinerary.map((day) => {
            const color = segmentColor(day.segmentId);

            return (
              <section key={day.day} id={`day-${day.day}`} data-segment={day.segmentId} className="scroll-mt-20">
                {/* Day Header */}
                <div
                  className="border-l-4 pl-6 mb-10"
                  style={{ borderLeftColor: color }}
                >
                  <div
                    className="inline-block px-5 py-2 rounded-full text-xs tracking-widest uppercase mb-4 font-bold shadow-sm text-white"
                    style={{ backgroundColor: color }}
                  >
                    Day {day.day} · {formatDate(day.date, day.dayOfWeek)}
                  </div>
                  <h2 className="text-3xl sm:text-4xl text-gray-900 font-medium mb-3">
                    {day.title}
                  </h2>
                  <p className="text-[28px] text-gray-600 leading-[1.6]">
                    {day.summary}
                  </p>
                </div>

                {/* Activities */}
                <div className="space-y-2">
                  {day.activities.map((activity, idx) => (
                    <div key={idx} id={`day-${day.day}-stop-${idx}`} className="scroll-mt-20">
                      {/* Activity card */}
                      <div className="py-6 px-5 rounded-lg hover:bg-white/60 transition-colors">
                        <span
                          className="inline-block px-4 py-1.5 rounded-full text-xs tracking-widest uppercase font-bold text-white shadow-lg mb-3"
                          style={{ backgroundColor: color }}
                        >
                          {activity.time}
                        </span>
                        <div className="flex items-baseline gap-3 mb-2 flex-wrap">
                          <h3 className="text-xl text-gray-900 font-medium">
                            {activity.name}
                          </h3>
                          {activity.subgroup && (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 shrink-0">
                              {activity.subgroup}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-700 leading-[1.6] text-[24px]">
                          {activity.description}
                        </p>
                        <LocationLinks locationIds={activity.locationIds} />
                      </div>

                      {/* Drive interlude */}
                      {activity.travelAfter && (
                        <div className="flex items-center gap-3 py-4 px-5 text-base text-gray-500">
                          <div className="flex-1 border-t border-dashed border-gray-300" />
                          <Car className="w-5 h-5 flex-shrink-0" />
                          <span className="font-medium whitespace-nowrap">
                            {activity.travelAfter.duration} —{' '}
                            {activity.travelAfter.from} →{' '}
                            {activity.travelAfter.to}
                          </span>
                          <div className="flex-1 border-t border-dashed border-gray-300" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </main>
    </div>
  );
}

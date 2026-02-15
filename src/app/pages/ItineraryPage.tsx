import { useEffect, useMemo, useState } from 'react';
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
  if (first.getMonth() === last.getMonth()) {
    return `${fMonth} ${first.getDate()}–${last.getDate()}`;
  }
  const lMonth = last.toLocaleDateString('en-US', { month: 'long' });
  return `${fMonth} ${first.getDate()} – ${lMonth} ${last.getDate()}`;
}

export default function ItineraryPage() {
  const sections = useMemo(() => groupBySegment(itinerary), []);
  const [activeSection, setActiveSection] = useState(sections[0]?.segmentId ?? 'napa');

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('[data-section]');
      const scrollPosition = window.scrollY + window.innerHeight / 2;

      sections.forEach((section) => {
        const sectionTop = (section as HTMLElement).offsetTop;
        const sectionBottom =
          sectionTop + (section as HTMLElement).offsetHeight;

        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
          const sectionId = section.getAttribute('data-section') || '';
          if (sectionId !== activeSection) {
            setActiveSection(sectionId as SegmentId);
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeSection]);

  const scrollToSection = (sectionId: string) => {
    const element = document.querySelector(`[data-section="${sectionId}"]`);
    if (element) {
      const offset = 120;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

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
      <div className="fixed top-32 right-0 w-1/2 h-screen hidden lg:block">
        <JourneyMap activeSegment={activeSection} />
      </div>

      {/* Scrollable Content */}
      <div className="lg:w-1/2 min-h-screen">
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
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70"></div>
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
                    <p className="text-lg text-white font-medium">
                      {sectionDateRange(s.days)}
                    </p>
                  </div>

                  <p className="text-xl text-white/95 leading-relaxed mb-8 max-w-2xl">
                    {seg.description}
                  </p>
                </div>

                {/* Days */}
                <div className="space-y-16">
                  {s.days.map((day) => (
                    <div key={day.day} className="relative">
                      <div className="mb-8">
                        <div className="text-sm text-white/70 uppercase tracking-wider mb-2 font-medium">
                          {formatDayDate(day.date, day.dayOfWeek)}
                        </div>
                        <h3 className="text-4xl sm:text-5xl text-white mb-4 font-medium">
                          {day.title}
                        </h3>
                        <p className="text-lg text-white/90 leading-relaxed">
                          {day.summary}
                        </p>
                      </div>

                      <div className="pl-6 border-l-2 border-white/30 space-y-8">
                        {day.activities.map((activity, actIdx) => (
                          <div key={actIdx}>
                            <div className="relative">
                              <div
                                className="absolute -left-[29px] w-4 h-4 rounded-full border-2 border-white"
                                style={{
                                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                }}
                              ></div>
                              <div className="text-xs text-white/70 uppercase tracking-wider mb-2 font-medium">
                                {activity.time}
                              </div>
                              <h4 className="text-xl text-white mb-3 font-medium">
                                {activity.name}
                              </h4>
                              <p className="text-base text-white/85 leading-relaxed">
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
                        ))}
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

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { ChevronDown } from 'lucide-react';
import { itineraryData } from '../../data/itinerary';

// Set your Mapbox access token here
mapboxgl.accessToken =
  'pk.eyJ1IjoiZXhhbXBsZXVzZXIiLCJhIjoiY2wxMjM0NTY3ODkwMWFiYzEyMyJ9.example';

export default function ItineraryPage() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState('napa');

  useEffect(() => {
    if (!mapContainer.current) return;
    // Placeholder for map initialization
    console.log('Map would initialize here with Mapbox GL');
  }, []);

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
            setActiveSection(sectionId);
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
            {itineraryData.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`px-6 py-3 rounded-full text-base transition-all font-medium ${
                  activeSection === section.id
                    ? 'bg-gray-700 text-white shadow-lg'
                    : 'bg-transparent text-gray-900 hover:bg-gray-300'
                }`}
              >
                {section.navLabel}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Fixed Map */}
      <div className="fixed top-32 right-0 w-1/2 h-screen hidden lg:block">
        <div ref={mapContainer} className="w-full h-full" />
        <div
          className="absolute inset-0 transition-colors duration-1000"
          style={{ backgroundColor: '#e5e0d8' }}
        >
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8">
              <p className="text-sm text-[#8b7d6b] mb-2">
                Interactive Map Placeholder
              </p>
              <p className="text-xs text-[#b8a588]">
                Add your Mapbox token to enable the interactive map
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="lg:w-1/2 min-h-screen">
        {itineraryData.map((section, sectionIdx) => (
          <section
            key={section.id}
            data-section={section.id}
            className="min-h-screen relative"
          >
            {/* Background Image with Overlay */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${section.bgImage})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 px-6 lg:px-12 py-20">
              {/* Section Header */}
              <div className="mb-12">
                <h2 className="text-6xl sm:text-7xl lg:text-8xl text-white mb-4 tracking-tight font-light">
                  {section.title}
                </h2>
                <p className="text-2xl text-white/90 mb-6 italic">
                  {section.subtitle}
                </p>

                <div className="mb-8">
                  <p className="text-xs text-white/60 uppercase tracking-widest mb-1 font-medium">
                    When
                  </p>
                  <p className="text-lg text-white font-medium">
                    {section.dates}
                  </p>
                </div>

                <p className="text-xl text-white/95 leading-relaxed mb-8 max-w-2xl">
                  {section.description}
                </p>
              </div>

              {/* Days */}
              <div className="space-y-16">
                {section.days.map((day) => (
                  <div key={day.day} className="relative">
                    <div className="mb-8">
                      <div className="text-sm text-white/70 uppercase tracking-wider mb-2 font-medium">
                        {day.date}
                      </div>
                      <h3 className="text-4xl sm:text-5xl text-white mb-4 font-medium">
                        {day.title}
                      </h3>
                      <p className="text-lg text-white/90 leading-relaxed">
                        {day.description}
                      </p>
                    </div>

                    <div className="pl-6 border-l-2 border-white/30 space-y-8">
                      {day.activities.map((activity, actIdx) => (
                        <div key={actIdx} className="relative">
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
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {sectionIdx < itineraryData.length - 1 && (
                <div className="flex justify-center mt-20">
                  <div className="animate-bounce">
                    <ChevronDown className="w-10 h-10 text-white/40" />
                  </div>
                </div>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

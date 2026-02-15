import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { ChevronDown, MapPin, ExternalLink } from 'lucide-react';

// Set your Mapbox access token here
mapboxgl.accessToken = 'pk.eyJ1IjoiZXhhbXBsZXVzZXIiLCJhIjoiY2wxMjM0NTY3ODkwMWFiYzEyMyJ9.example';

// Background images for each section
const bgImages = {
  napa: 'https://images.unsplash.com/photo-1716779162557-b43745a2ed20?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdWlyJTIwd29vZHMlMjByZWR3b29kJTIwZm9yZXN0JTIwZm9nJTIwY2F0aGVkcmFsfGVufDF8fHx8MTc3MTE2MjAyMXww&ixlib=rb-4.1.0&q=80&w=1080',
  napaAlt: 'https://images.unsplash.com/photo-1701623785014-181cda1bcc37?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXBhJTIwdmFsbGV5JTIwdmluZXlhcmQlMjByb3dzJTIwc3Vuc2V0JTIwYWVyaWFsfGVufDF8fHx8MTc3MTE2MjAyMnww&ixlib=rb-4.1.0&q=80&w=1080',
  yosemite: 'https://images.unsplash.com/photo-1571047772429-47fafc26d064?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3NlbWl0ZSUyMGhhbGYlMjBkb21lJTIwdmFsbGV5JTIwZ3Jhbml0ZXxlbnwxfHx8fDE3NzExNjIwMjJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
  carmel: 'https://images.unsplash.com/photo-1747334142570-f2af433f40a0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiaWclMjBzdXIlMjBoaWdod2F5JTIwMSUyMGNvYXN0YWwlMjBjbGlmZnMlMjBwYWNpZmljfGVufDF8fHx8MTc3MTE2MjAyM3ww&ixlib=rb-4.1.0&q=80&w=1080',
};

const itineraryData = [
  {
    id: 'napa',
    navLabel: 'Arrival + Muir Woods',
    title: 'Arrival + Muir Woods',
    subtitle: 'Redwoods',
    dates: 'April 3-4',
    terrain: 'Coastal Redwoods',
    elevation: '200 ft',
    color: '#b8956d',
    bgImage: bgImages.napa,
    center: [-122.360126, 38.399828] as [number, number],
    zoom: 11,
    locations: [
      { name: 'San Francisco International Airport (SFO)', url: 'https://www.flysfo.com/' },
      { name: 'Muir Woods National Monument', url: 'https://www.nps.gov/muwo/index.htm' },
      { name: 'Muir Woods Main Trail', url: 'https://www.nps.gov/muwo/planyourvisit/maps.htm' },
      { name: 'The Estate Yountville', url: 'https://www.theestateyountville.com/' },
      { name: 'Bottega Napa Valley', url: 'https://www.botteganapavalley.com/' },
    ],
    description: 'Arrive under the cathedral canopy of coastal redwoods—trees so tall they make their own weather. The Pacific fog drifts through ancient groves, muffling sound, bending light.',
    days: [
      {
        day: 1,
        date: 'Friday, April 3',
        title: 'Arrival + Redwoods + Yountville',
        description: 'Arrive in Northern California and ease into the trip with a redwood walk at Muir Woods, then settle into Yountville for the first taste of Napa\'s culinary heart.',
        activities: [
          {
            time: '10:45am–12:15pm',
            name: 'Land at SFO + rental car + lunch to-go',
            description: 'Pick up the rental car and grab lunch before heading to the redwoods.',
          },
          {
            time: '1:15pm–3:00pm',
            name: 'Muir Woods National Monument',
            description: 'Walk the mostly flat, shaded Main Trail for an easy introduction to California\'s coastal redwoods.',
          },
          {
            time: '4:00pm',
            name: 'Check-in at The Estate Yountville',
            description: 'Settle into your wine country home for the next three nights.',
          },
          {
            time: '7:00pm',
            name: 'Dinner at Bottega Napa Valley',
            description: 'Celebrate the first evening with farm-to-table Italian cuisine.',
          },
        ],
      },
    ],
  },
  {
    id: 'napa-valley',
    navLabel: 'Napa Valley',
    title: 'Napa & Sonoma',
    subtitle: 'Wine Country',
    dates: 'April 4-6',
    terrain: 'Rolling Vineyards',
    elevation: '300 ft',
    color: '#b8956d',
    bgImage: bgImages.napaAlt,
    center: [-122.360126, 38.399828] as [number, number],
    zoom: 11,
    locations: [
      { name: 'The Estate Yountville', url: 'https://www.theestateyountville.com/' },
      { name: 'Farmstead at Long Meadow Ranch', url: 'https://longmeadowranch.com/farmstead/' },
      { name: 'Napa Farmers Market', url: 'https://napafarmersmarket.org/' },
      { name: 'Sonoma Plaza', url: 'https://www.sonomaplaza.com/' },
    ],
    description: 'Golden hills, endless vine rows, warm evenings. The Napa Valley unfolds in layers—wine, food, light. This is California at its most refined.',
    days: [
      {
        day: 2,
        date: 'Saturday, April 4',
        title: 'Napa Valley Exploration',
        description: 'Discover the best of Napa with wine tastings, farm-to-table meals, and vineyard landscapes.',
        activities: [
          {
            time: '9:00am',
            name: 'Breakfast at The Estate',
            description: 'Start the day with a leisurely breakfast at the hotel.',
          },
          {
            time: '10:30am–12:30pm',
            name: 'Wine Tasting',
            description: 'Visit select wineries for tastings and tours through the vineyards.',
          },
          {
            time: '1:00pm',
            name: 'Lunch in Yountville',
            description: 'Explore the town and enjoy lunch at one of the local bistros.',
          },
        ],
      },
      {
        day: 3,
        date: 'Sunday, April 5',
        title: 'Sonoma & Farmers Markets',
        description: 'Venture into Sonoma for farmers markets, more wine tasting, and a relaxed pace.',
        activities: [
          {
            time: '9:00am',
            name: 'Sonoma Farmers Market',
            description: 'Browse local produce, artisan goods, and enjoy the community atmosphere.',
          },
          {
            time: '11:00am',
            name: 'Sonoma Plaza',
            description: 'Stroll the historic plaza and visit local shops.',
          },
          {
            time: '2:00pm',
            name: 'Afternoon at leisure',
            description: 'Relax by the pool or explore Yountville at your own pace.',
          },
        ],
      },
    ],
  },
  {
    id: 'yosemite',
    navLabel: 'Yosemite',
    title: 'Yosemite',
    subtitle: 'Sierra Nevada Mountains',
    dates: 'April 6-8',
    terrain: 'Granite Mountains',
    elevation: '4,000 ft',
    color: '#5a8a6f',
    bgImage: bgImages.yosemite,
    center: [-119.538329, 37.8651] as [number, number],
    zoom: 10,
    locations: [
      { name: 'Rush Creek Lodge & Spa at Yosemite', url: 'https://www.rushcreeklodge.com/' },
      { name: 'Yosemite Valley', url: 'https://www.nps.gov/yose/planyourvisit/yv.htm' },
      { name: 'Tunnel View', url: 'https://www.nps.gov/yose/planyourvisit/tunnelview.htm' },
      { name: 'Bridalveil Fall Trail', url: 'https://www.nps.gov/yose/planyourvisit/bridalveilfall.htm' },
      { name: 'Lower Yosemite Falls Loop', url: 'https://www.nps.gov/yose/planyourvisit/lowerfall.htm' },
    ],
    description: 'Glacial valleys. Sheer granite faces carved by ancient ice. Waterfalls thundering through the Sierra Nevada. The scale humbles everything human.',
    days: [
      {
        day: 4,
        date: 'Monday, April 6',
        title: 'Drive to Yosemite',
        description: 'Leave wine country behind and head into the Sierra Nevada mountains.',
        activities: [
          {
            time: '8:00am',
            name: 'Checkout from The Estate',
            description: 'Pack up and begin the scenic drive to Yosemite.',
          },
          {
            time: '8:30am–12:30pm',
            name: 'Drive to Yosemite Area',
            description: 'Approximately 4 hours through California\'s Central Valley and into the mountains.',
          },
          {
            time: '1:00pm',
            name: 'Check-in at Rush Creek Lodge',
            description: 'Arrive at your mountain retreat just outside Yosemite.',
          },
          {
            time: '3:00pm',
            name: 'Relax and Explore the Lodge',
            description: 'Enjoy the spa, pools, or simply take in the mountain views.',
          },
        ],
      },
      {
        day: 5,
        date: 'Tuesday, April 7',
        title: 'Yosemite Full Day',
        description: 'Experience the iconic landscapes of Yosemite National Park—waterfalls, granite cliffs, and giant sequoias.',
        activities: [
          {
            time: '8:00am',
            name: 'Enter Yosemite National Park',
            description: 'Drive into Yosemite Valley for a full day of exploration.',
          },
          {
            time: '9:00am–12:00pm',
            name: 'Valley Floor Tour',
            description: 'See El Capitan, Half Dome, Bridalveil Fall, and Yosemite Falls.',
          },
          {
            time: '12:30pm',
            name: 'Lunch in the Valley',
            description: 'Grab lunch at Yosemite Village or pack a picnic.',
          },
          {
            time: '2:00pm–4:00pm',
            name: 'Hiking & Photography',
            description: 'Choose from easy walks or more challenging hikes to waterfalls.',
          },
          {
            time: '6:00pm',
            name: 'Return to Rush Creek Lodge',
            description: 'Relax after a full day in the park.',
          },
        ],
      },
    ],
  },
  {
    id: 'carmel',
    navLabel: 'Carmel + Big Sur',
    title: 'Monterey & Carmel',
    subtitle: 'Big Sur Coast',
    dates: 'April 8-11',
    terrain: 'Coastal Cliffs',
    elevation: 'Sea Level',
    color: '#4a7c8e',
    bgImage: bgImages.carmel,
    center: [-121.9376, 36.501859] as [number, number],
    zoom: 11,
    locations: [
      { name: 'Hyatt Carmel Highlands', url: 'https://highlandsinn.hyatt.com/' },
      { name: 'Point Lobos State Reserve', url: 'https://www.parks.ca.gov/?page_id=571' },
      { name: 'Carmel Beach', url: 'https://www.carmelcalifornia.com/activities/beaches/' },
      { name: 'Bixby Bridge', url: 'https://www.visitcalifornia.com/attraction/bixby-bridge/' },
      { name: 'McWay Falls', url: 'https://www.parks.ca.gov/?page_id=578' },
    ],
    description: 'Highway 1 clings to the edge of the continent. Cliffs drop into the Pacific. Waves crash white against dark rocks. This is Big Sur—wild, raw, eternal.',
    days: [
      {
        day: 6,
        date: 'Wednesday, April 8',
        title: 'Drive to the Coast',
        description: 'Leave the mountains and descend to California\'s dramatic coastline.',
        activities: [
          {
            time: '8:00am',
            name: 'Checkout from Rush Creek',
            description: 'Begin the journey to the coast.',
          },
          {
            time: '8:30am–1:00pm',
            name: 'Scenic Drive to Carmel',
            description: 'Drive through the Central Valley and over to the Pacific Coast.',
          },
          {
            time: '2:00pm',
            name: 'Check-in at Hyatt Carmel Highlands',
            description: 'Settle into your cliffside ocean-view rooms.',
          },
          {
            time: '4:00pm',
            name: 'Explore the Property',
            description: 'Walk the coastal trails and enjoy the cliff-top hot tubs.',
          },
        ],
      },
      {
        day: 7,
        date: 'Thursday, April 9',
        title: 'Carmel & Point Lobos',
        description: 'Discover charming Carmel-by-the-Sea and the stunning natural beauty of Point Lobos.',
        activities: [
          {
            time: '9:00am',
            name: 'Breakfast with Ocean Views',
            description: 'Enjoy breakfast at the hotel restaurant.',
          },
          {
            time: '10:30am',
            name: 'Point Lobos State Reserve',
            description: 'Hike the coastal trails and spot sea lions, sea otters, and migrating whales.',
          },
          {
            time: '1:00pm',
            name: 'Lunch in Carmel',
            description: 'Explore Carmel\'s art galleries, shops, and cafes.',
          },
          {
            time: '3:00pm',
            name: 'Carmel Beach',
            description: 'Stroll the white sand beach and watch the sunset.',
          },
        ],
      },
      {
        day: 8,
        date: 'Friday, April 10',
        title: 'Big Sur & Bixby Bridge',
        description: 'Drive the iconic Highway 1 through Big Sur\'s dramatic coastal scenery.',
        activities: [
          {
            time: '9:00am',
            name: 'Drive South on Highway 1',
            description: 'Experience one of the world\'s most scenic coastal drives.',
          },
          {
            time: '10:00am',
            name: 'Bixby Bridge',
            description: 'Stop at this iconic bridge for photos and views.',
          },
          {
            time: '11:30am',
            name: 'McWay Falls',
            description: 'Visit this stunning waterfall that drops directly onto the beach.',
          },
          {
            time: '1:00pm',
            name: 'Lunch in Big Sur',
            description: 'Enjoy lunch with coastal views.',
          },
          {
            time: '3:00pm',
            name: 'Return to Hyatt',
            description: 'Relax for the evening at the hotel.',
          },
        ],
      },
      {
        day: 9,
        date: 'Saturday, April 11',
        title: 'Departure',
        description: 'Say goodbye to California and head home.',
        activities: [
          {
            time: '9:00am',
            name: 'Checkout from Hyatt',
            description: 'Pack up and begin the drive to SFO.',
          },
          {
            time: '9:30am–12:00pm',
            name: 'Drive to SFO',
            description: 'Approximately 2.5 hours along the coast and through San Jose.',
          },
          {
            time: '2:00pm',
            name: 'Depart SFO',
            description: 'UA 2386 to DCA, arriving 10:28pm EDT.',
          },
        ],
      },
    ],
  },
];

export default function ItineraryPage() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [activeSection, setActiveSection] = useState('napa');
  const [expandedLocations, setExpandedLocations] = useState<{ [key: string]: boolean }>({});

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
        const sectionBottom = sectionTop + (section as HTMLElement).offsetHeight;

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
      const offset = 120; // Account for sticky header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const toggleLocation = (sectionId: string) => {
    setExpandedLocations(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
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
                style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
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
        {/* Placeholder map background */}
        <div 
          className="absolute inset-0 transition-colors duration-1000"
          style={{ 
            backgroundColor: '#e5e0d8'
          }}
        >
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8">
              <p className="text-sm text-[#8b7d6b] mb-2" style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
                Interactive Map Placeholder
              </p>
              <p className="text-xs text-[#b8a588]" style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
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
                <h2 
                  className="text-6xl sm:text-7xl lg:text-8xl text-white mb-4 tracking-tight font-light"
                  style={{ 
                    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", 
                  }}
                >
                  {section.title}
                </h2>
                <p 
                  className="text-2xl text-white/90 mb-6 italic"
                  style={{ fontFamily: "'Crimson Pro', serif" }}
                >
                  {section.subtitle}
                </p>

                {/* Metadata */}
                <div className="mb-8">
                  <p className="text-xs text-white/60 uppercase tracking-widest mb-1 font-medium" style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
                    When
                  </p>
                  <p className="text-lg text-white font-medium" style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
                    {section.dates}
                  </p>
                </div>

                {/* Description */}
                <p 
                  className="text-xl text-white/95 leading-relaxed mb-8 max-w-2xl"
                  style={{ fontFamily: "'Crimson Pro', serif" }}
                >
                  {section.description}
                </p>
              </div>

              {/* Days */}
              <div className="space-y-16">
                {section.days.map((day, dayIdx) => (
                  <div key={day.day} className="relative">
                    {/* Day Header */}
                    <div className="mb-8">
                      <div 
                        className="text-sm text-white/70 uppercase tracking-wider mb-2 font-medium"
                        style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
                      >
                        {day.date}
                      </div>
                      <h3 
                        className="text-4xl sm:text-5xl text-white mb-4 font-medium"
                        style={{ 
                          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", 
                        }}
                      >
                        {day.title}
                      </h3>
                      <p 
                        className="text-lg text-white/90 leading-relaxed"
                        style={{ fontFamily: "'Crimson Pro', serif" }}
                      >
                        {day.description}
                      </p>
                    </div>

                    {/* Activities */}
                    <div className="pl-6 border-l-2 border-white/30 space-y-8">
                      {day.activities.map((activity, actIdx) => (
                        <div key={actIdx} className="relative">
                          <div 
                            className="absolute -left-[29px] w-4 h-4 rounded-full border-2 border-white"
                            style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
                          ></div>
                          <div 
                            className="text-xs text-white/70 uppercase tracking-wider mb-2 font-medium"
                            style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
                          >
                            {activity.time}
                          </div>
                          <h4 
                            className="text-xl text-white mb-3 font-medium"
                            style={{ 
                              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", 
                            }}
                          >
                            {activity.name}
                          </h4>
                          <p 
                            className="text-base text-white/85 leading-relaxed"
                            style={{ fontFamily: "'Crimson Pro', serif" }}
                          >
                            {activity.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Continue indicator */}
              {sectionIdx < itineraryData.length - 1 && (
                <div className="flex justify-center mt-20">
                  <div className="animate-bounce">
                    <ChevronDown 
                      className="w-10 h-10 text-white/40"
                    />
                  </div>
                </div>
              )}
            </div>
          </section>
        ))}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-100 py-16 px-6 lg:w-1/2">
        <div className="max-w-2xl mx-auto text-center" style={{ fontFamily: "'Crimson Pro', serif" }}>
          <p className="text-lg mb-2">Susan's 70th Birthday Celebration</p>
          <p className="text-sm text-gray-400">California, USA • April 3-11, 2026</p>
        </div>
      </footer>
    </div>
  );
}
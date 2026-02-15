import { useState } from 'react';
import { MapPin, ExternalLink, Star, Globe, Phone, Mail } from 'lucide-react';

const lodgingData = {
  yountville: {
    id: 'estate-yountville',
    name: 'The Estate Yountville',
    dates: 'April 3–6, 2026',
    nights: '3 nights',
    address: '6481 Washington St, Yountville, CA 94599',
    phone: '(707) 944-2452',
    email: 'reservations@theestateyountville.com',
    confirmation: '#OB25123113564304',
    description: 'Nestled in the heart of Napa Valley, The Estate Yountville offers sophisticated wine country elegance. This boutique property features vineyard views, a heated pool, and walking distance to world-class restaurants including The French Laundry and Bouchon.',
    amenities: ['Heated Pool', 'Spa Services', 'Wine Tasting', 'Farm-to-Table Breakfast', 'Vineyard Views', 'Walking to Restaurants'],
    propertyImage: 'https://images.unsplash.com/photo-1701622420355-aabbe1901e81?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjB2aW5leWFyZCUyMGhvdGVsJTIwbmFwYSUyMHZhbGxleXxlbnwxfHx8fDE3NzExMDQ4ODF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    roomImage: 'https://images.unsplash.com/photo-1766928210443-0be92ed5884a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwaG90ZWwlMjByb29tJTIwYmVkJTIwaW50ZXJpb3J8ZW58MXx8fHwxNzcxMTA0ODgyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    color: '#b8956d',
    geo: { lat: 38.399828, lng: -122.360126 },
    official_url: 'https://www.theestateyountville.com/',
    google_maps_url: 'https://www.google.com/maps/search/?api=1&query=38.3998275,-122.3601258',
    review_url: 'https://www.tripadvisor.com/Hotel_Review-g33300-d125028-Reviews-The_Estate_Yountville-Yountville_Napa_Valley_California.html',
  },
  yosemite: {
    id: 'rush-creek-lodge',
    name: 'Rush Creek Lodge & Spa at Yosemite',
    dates: 'April 6–8, 2026',
    nights: '2 nights',
    address: '34001 CA-120, Groveland, CA 95321',
    phone: '(209) 379-2373',
    email: 'info@rushcreeklodge.com',
    confirmation: '#30251B0386853',
    description: 'Your gateway to Yosemite National Park. This contemporary mountain lodge combines rustic charm with modern luxury, featuring stunning Sierra Nevada views, a full-service spa, and easy access to the park\'s iconic landscapes.',
    amenities: ['Full-Service Spa', 'Heated Saltwater Pool', 'Hot Tubs', 'Tavern Restaurant', 'General Store', 'Fire Pits'],
    propertyImage: 'https://images.unsplash.com/photo-1706815568781-04081dc5c46f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3NlbWl0ZSUyMGxvZGdlJTIwbW91bnRhaW4lMjBzcGF8ZW58MXx8fHwxNzcxMTA0ODgxfDA&ixlib=rb-4.1.0&q=80&w=1080',
    roomImage: 'https://images.unsplash.com/photo-1761679297197-91478b218201?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxydXN0aWMlMjBtb2Rlcm4lMjBob3RlbCUyMHJvb20lMjBtb3VudGFpbiUyMHZpZXd8ZW58MXx8fHwxNzcxMTA0ODgyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    color: '#5a8a6f',
    geo: { lat: 37.812447, lng: -119.880978 },
    official_url: 'https://www.rushcreeklodge.com/',
    google_maps_url: 'https://www.google.com/maps/search/?api=1&query=37.8124471,-119.8809784',
    review_url: 'https://www.tripadvisor.com/Hotel_Review-g32460-d8547692-Reviews-Rush_Creek_Lodge_At_Yosemite-Groveland_California.html',
  },
  carmel: {
    id: 'hyatt-carmel',
    name: 'Hyatt Carmel Highlands',
    dates: 'April 8–11, 2026',
    nights: '3 nights',
    address: '120 Highlands Dr, Carmel Highlands, CA 93923',
    phone: '(831) 620-1234',
    email: 'carmel.highlands@hyatt.com',
    confirmation: '#62046930 (Dan, Jen, Ava) • #40702652 (Susan & Ted)',
    description: 'Perched on the dramatic cliffs of Big Sur, this iconic coastal retreat offers breathtaking Pacific Ocean views. Experience California\'s legendary coastline with luxurious accommodations, cliff-top hot tubs, and proximity to Point Lobos and the Carmel art scene.',
    amenities: ['Ocean View Rooms', 'Cliff-Top Hot Tubs', 'California Market Restaurant', 'Full Spa', 'Coastal Trails', 'Fire Pits'],
    propertyImage: 'https://images.unsplash.com/photo-1654607006745-b98f5a55686a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXJtZWwlMjBjYWxpZm9ybmlhJTIwY29hc3RhbCUyMGx1eHVyeSUyMHJlc29ydHxlbnwxfHx8fDE3NzExMDQ4ODF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    roomImage: 'https://images.unsplash.com/photo-1648132249480-2f433f2d6e34?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvY2VhbiUyMHZpZXclMjBob3RlbCUyMGJhbGNvbnklMjBjYWxpZm9ybmlhfGVufDF8fHx8MTc3MTEwNDg4NXww&ixlib=rb-4.1.0&q=80&w=1080',
    color: '#4a7c8e',
    geo: { lat: 36.501859, lng: -121.9376 },
    official_url: 'https://highlandsinn.hyatt.com/',
    google_maps_url: 'https://www.google.com/maps/search/?api=1&query=36.5018591,-121.9375999',
    review_url: 'https://www.tripadvisor.com/Hotel_Review-g32172-d32696831-Reviews-Hyatt_Carmel_Highlands-Carmel_Monterey_County_California.html',
  },
};

type LodgingKey = keyof typeof lodgingData;

export default function LodgingPage() {
  const [activeLodging, setActiveLodging] = useState<LodgingKey>('yountville');
  const lodge = lodgingData[activeLodging];

  return (
    <div className="pt-16 min-h-screen">
      {/* Sub-Navigation */}
      <div className="border-b border-gray-200 bg-white/95 backdrop-blur-sm sticky top-16 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 lg:px-12">
          <div className="flex items-center gap-2 overflow-x-auto py-4">
            {Object.entries(lodgingData).map(([key, data]) => (
              <button
                key={key}
                onClick={() => setActiveLodging(key as LodgingKey)}
                className={`flex-shrink-0 px-6 py-3 rounded-full text-sm font-bold transition-all ${
                  activeLodging === key
                    ? 'text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                style={{
                  backgroundColor: activeLodging === key ? data.color : 'transparent',
                  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                }}
              >
                {data.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Property Hero Image */}
      <div className="w-full h-[60vh] relative overflow-hidden">
        <img 
          src={lodge.propertyImage} 
          alt={lodge.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 pb-12 px-6 lg:px-12">
          <div className="max-w-4xl mx-auto">
            <div 
              className="inline-block px-5 py-2 rounded-full text-xs tracking-widest uppercase mb-4 font-bold shadow-lg"
              style={{ 
                backgroundColor: lodge.color,
                color: 'white',
                fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif"
              }}
            >
              {lodge.dates} • {lodge.nights}
            </div>
            <h1 
              className="text-5xl sm:text-6xl lg:text-7xl text-white mb-4 tracking-tight drop-shadow-lg"
              style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontWeight: 500 }}
            >
              {lodge.name}
            </h1>
            <div className="flex items-center gap-2 text-white/95">
              <MapPin className="w-5 h-5" />
              <span className="font-medium" style={{ fontFamily: "'Crimson Pro', serif" }}>{lodge.address}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 lg:px-12 py-16">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-10">
            {/* Description */}
            <section>
              <p 
                className="text-lg text-gray-700 leading-relaxed"
                style={{ fontFamily: "'Crimson Pro', serif" }}
              >
                {lodge.description}
              </p>
            </section>

            {/* Room Image */}
            <section>
              <h2 
                className="text-3xl text-gray-900 mb-4"
                style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontWeight: 500 }}
              >
                Your Room
              </h2>
              <div className="rounded-xl overflow-hidden shadow-2xl">
                <img 
                  src={lodge.roomImage} 
                  alt="Room interior"
                  className="w-full h-auto"
                />
              </div>
            </section>

            {/* Amenities */}
            <section>
              <h2 
                className="text-3xl text-gray-900 mb-5"
                style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontWeight: 500 }}
              >
                Amenities
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {lodge.amenities.map((amenity, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center gap-3 px-4 py-3 bg-white rounded-lg border border-gray-200 shadow-sm"
                  >
                    <div 
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: lodge.color }}
                    ></div>
                    <span 
                      className="text-sm text-gray-800 font-medium"
                      style={{ fontFamily: "'Crimson Pro', serif" }}
                    >
                      {amenity}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column - Contact & Links */}
          <div className="space-y-6">
            {/* Booking Info */}
            <div className="bg-white rounded-xl shadow-2xl p-6 border border-gray-200 sticky top-32">
              <h3 
                className="text-xl text-gray-900 mb-5"
                style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontWeight: 500 }}
              >
                Booking Details
              </h3>
              
              <div className="space-y-4 mb-6">
                <div className="text-sm">
                  <div className="text-gray-600 mb-1 font-medium" style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>Confirmation</div>
                  <div 
                    className="text-gray-900 font-mono text-xs font-bold"
                    style={{ fontFamily: "'Crimson Pro', serif" }}
                  >
                    {lodge.confirmation}
                  </div>
                </div>

                <div className="text-sm">
                  <div className="text-gray-600 mb-1 font-medium" style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>Phone</div>
                  <a 
                    href={`tel:${lodge.phone}`}
                    className="hover:underline flex items-center gap-2 font-medium"
                    style={{ color: lodge.color }}
                  >
                    <Phone className="w-3.5 h-3.5" />
                    {lodge.phone}
                  </a>
                </div>

                <div className="text-sm">
                  <div className="text-gray-600 mb-1 font-medium" style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>Email</div>
                  <a 
                    href={`mailto:${lodge.email}`}
                    className="hover:underline flex items-center gap-2 break-all font-medium"
                    style={{ color: lodge.color }}
                  >
                    <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                    {lodge.email}
                  </a>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-200">
                <a
                  href={lodge.google_maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-700 transition-colors font-medium"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>View on Map</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 opacity-50" />
                </a>
                
                <a
                  href={lodge.official_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-700 transition-colors font-medium"
                >
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    <span>Official Website</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 opacity-50" />
                </a>
                
                <a
                  href={lodge.review_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-700 transition-colors font-medium"
                >
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    <span>Read Reviews</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 opacity-50" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-100 py-16 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-lg mb-2" style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontWeight: 500 }}>Susan's 70th Birthday Celebration</p>
          <p className="text-sm text-gray-400" style={{ fontFamily: "'Crimson Pro', serif" }}>California, USA • April 3-11, 2026</p>
        </div>
      </footer>
    </div>
  );
}
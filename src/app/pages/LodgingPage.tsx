import { useState } from 'react';
import { MapPin, ExternalLink, Star, Globe, Phone, Mail } from 'lucide-react';
import { lodgingData, type LodgingKey } from '../../data/lodging';

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
                  backgroundColor:
                    activeLodging === key ? data.color : 'transparent',
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
              className="inline-block px-5 py-2 rounded-full text-xs tracking-widest uppercase mb-4 font-bold shadow-lg text-white"
              style={{ backgroundColor: lodge.color }}
            >
              {lodge.dates} • {lodge.nights}
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl text-white mb-4 tracking-tight drop-shadow-lg font-medium">
              {lodge.name}
            </h1>
            <div className="flex items-center gap-2 text-white/95">
              <MapPin className="w-5 h-5" />
              <span className="font-medium">{lodge.address}</span>
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
              <p className="text-lg text-gray-700 leading-relaxed">
                {lodge.description}
              </p>
            </section>

            {/* Room Image */}
            <section>
              <h2 className="text-3xl text-gray-900 mb-4 font-medium">
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
              <h2 className="text-3xl text-gray-900 mb-5 font-medium">
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
                    <span className="text-sm text-gray-800 font-medium">
                      {amenity}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column - Contact & Links */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-2xl p-6 border border-gray-200 sticky top-32">
              <h3 className="text-xl text-gray-900 mb-5 font-medium">
                Booking Details
              </h3>

              <div className="space-y-4 mb-6">
                <div className="text-sm">
                  <div className="text-gray-600 mb-1 font-medium">
                    Confirmation
                  </div>
                  <div className="text-gray-900 font-mono text-xs font-bold">
                    {lodge.confirmation}
                  </div>
                </div>

                <div className="text-sm">
                  <div className="text-gray-600 mb-1 font-medium">Phone</div>
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
                  <div className="text-gray-600 mb-1 font-medium">Email</div>
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
    </div>
  );
}

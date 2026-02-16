import { useState } from 'react';
import { MapPin, ExternalLink, Star, Globe, Phone, Mail, ChevronLeft, ChevronRight } from 'lucide-react';
import { lodgingData, type LodgingKey } from '../../data/lodging';

export default function LodgingPage() {
  const [activeLodging, setActiveLodging] = useState<LodgingKey>('yountville');
  const [carouselIdx, setCarouselIdx] = useState(0);
  const lodge = lodgingData[activeLodging];

  const switchLodging = (key: LodgingKey) => {
    setActiveLodging(key);
    setCarouselIdx(0);
  };

  const images = lodge.roomImages;
  const totalImages = images.length;

  return (
    <div className="pt-16 min-h-screen">
      {/* Sub-Navigation — mirrors itinerary style with dates */}
      <div className="border-b border-gray-200 bg-white/95 backdrop-blur-sm sticky top-16 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 lg:px-12 py-2">
          <div className="flex items-center justify-center gap-2 overflow-x-auto">
            {Object.entries(lodgingData).map(([key, data]) => (
              <button
                key={key}
                onClick={() => switchLodging(key as LodgingKey)}
                className={`flex-shrink-0 px-6 py-2 rounded-full text-sm font-bold transition-all flex flex-col items-center gap-0.5 ${
                  activeLodging === key
                    ? 'text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                style={{
                  backgroundColor:
                    activeLodging === key ? data.color : 'transparent',
                }}
              >
                <span>{data.name}</span>
                <span
                  className={`text-[10px] tracking-wide ${
                    activeLodging === key ? 'text-white/60' : 'text-gray-500'
                  }`}
                >
                  {data.dates} · {data.nights}
                </span>
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
              <p className="text-xl leading-relaxed text-gray-700">
                {lodge.description}
              </p>
            </section>

            {/* Room Image Carousel */}
            <section>
              <h2 className="text-3xl text-gray-900 mb-4 font-medium">
                Your Room
              </h2>

              {/* Carousel container */}
              <div className="relative rounded-xl overflow-hidden shadow-2xl group">
                {/* Current image */}
                <div className="relative aspect-[16/10] bg-gray-100">
                  <img
                    key={`${activeLodging}-${carouselIdx}`}
                    src={images[carouselIdx]}
                    alt={`Room photo ${carouselIdx + 1}`}
                    className="w-full h-full object-cover animate-[fadeIn_0.3s_ease-in-out]"
                  />

                  {/* Prev / Next buttons — only show when more than 1 image */}
                  {totalImages > 1 && (
                    <>
                      <button
                        onClick={() =>
                          setCarouselIdx(
                            (carouselIdx - 1 + totalImages) % totalImages,
                          )
                        }
                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() =>
                          setCarouselIdx((carouselIdx + 1) % totalImages)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                        aria-label="Next image"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}

                  {/* Counter badge */}
                  {totalImages > 1 && (
                    <div className="absolute top-3 right-3 bg-black/50 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm">
                      {carouselIdx + 1} / {totalImages}
                    </div>
                  )}
                </div>

                {/* Dot indicators */}
                {totalImages > 1 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2">
                    {images.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCarouselIdx(idx)}
                        className={`rounded-full transition-all ${
                          idx === carouselIdx
                            ? 'w-2.5 h-2.5 bg-white shadow-md'
                            : 'w-2 h-2 bg-white/50 hover:bg-white/75'
                        }`}
                        aria-label={`Go to image ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Room description text */}
              <p className="mt-5 text-xl leading-relaxed text-gray-600 italic">
                {lodge.roomDescription}
              </p>
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

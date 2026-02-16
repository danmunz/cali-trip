import { Calendar, Plane, Cloud, CloudRain, Sun } from 'lucide-react';
import mapImage from '../../assets/1becf1fb274bdda2aefe747340a99d4afe32758c.png';
import { weatherData } from '../../data/overview';
import { tripMeta } from '../../data/trip-meta.generated';
import { segments } from '../../data/segments';

function WeatherIcon({ condition }: { condition: string }) {
  switch (condition) {
    case 'sunny':
      return <Sun className="w-5 h-5 text-amber-500" />;
    case 'partly-cloudy':
      return <Cloud className="w-5 h-5 text-slate-500" />;
    case 'cloudy':
      return <Cloud className="w-5 h-5 text-slate-600" />;
    case 'light-rain':
      return <CloudRain className="w-5 h-5 text-blue-600" />;
    default:
      return <Sun className="w-5 h-5 text-amber-500" />;
  }
}

function FlightLeg({ value }: { value: string }) {
  const [airport, ...rest] = value.split(' ');
  return (
    <>
      <span className="font-bold">{airport}</span> {rest.join(' ')}
    </>
  );
}

function scheduleColor(segmentId: string): string {
  return (segments as Record<string, { color: string }>)[segmentId]?.color ?? '#64748b';
}

export default function OverviewPage() {
  return (
    <div className="pt-16">
      {/* Hero Map - Full Width */}
      <div className="w-full h-[70vh] min-h-[500px] max-h-[800px] relative overflow-hidden">
        <img
          src={mapImage}
          alt="California Trip Map"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#faf8f5]"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.35em] text-white/60 mb-5 font-medium drop-shadow">
              April 2026 · California
            </p>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl mb-5 text-white tracking-tight drop-shadow-xl font-light">
              {tripMeta.title}
            </h1>
            <div className="w-16 h-px bg-white/40 mx-auto mb-5" />
            <p className="text-lg text-white/80 italic drop-shadow font-light">
              Nine days through California's landscapes &amp; vineyards
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 lg:px-12 pb-24 -mt-8">
        {/* Segment Preview Images */}
        <section className="mb-12">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(Object.entries(segments) as [string, typeof segments[keyof typeof segments]][]).map(
              ([id, seg]) => (
                <div
                  key={id}
                  className="relative aspect-square rounded-lg overflow-hidden group"
                >
                  <img
                    src={seg.bgImage}
                    alt={seg.navLabel}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-white text-sm font-bold uppercase tracking-wider drop-shadow">
                      {seg.navLabel}
                    </p>
                    <p className="text-white/70 text-xs mt-0.5">{seg.subtitle}</p>
                  </div>
                </div>
              ),
            )}
          </div>
        </section>

        {/* Overview */}
        <section className="mb-16">
          <p className="text-xl sm:text-2xl leading-relaxed text-gray-700 max-w-3xl mx-auto text-center">
            {tripMeta.overview}
          </p>
        </section>

        {/* Trip Itinerary Table */}
        <section className="mb-16">
          <div className="bg-white rounded-xl shadow-2xl p-8 sm:p-10 border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="w-7 h-7 text-[#b8956d]" />
              <h2 className="text-4xl text-gray-900 font-medium">
                Daily Itinerary
              </h2>
            </div>
            <p className="text-gray-600 mb-6">{tripMeta.duration}</p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-4 px-3 text-xs tracking-widest uppercase text-gray-700 font-bold">
                      Date
                    </th>
                    <th className="text-left py-4 px-3 text-xs tracking-widest uppercase text-gray-700 font-bold">
                      Base
                    </th>
                    <th className="text-left py-4 px-3 text-xs tracking-widest uppercase text-gray-700 font-bold">
                      Logistics
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tripMeta.dailySchedule.map((row, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-3 text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: scheduleColor(row.segmentId) }}
                          ></div>
                          <span className="font-medium">{row.date}</span>
                        </div>
                      </td>
                      <td className="py-4 px-3 text-sm text-gray-800 font-medium">
                        {row.base}
                      </td>
                      <td className="py-4 px-3 text-sm text-gray-700">
                        {row.logistics}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Flights */}
          <section>
            <div className="bg-white rounded-xl shadow-2xl p-8 border border-gray-200 h-full">
              <div className="flex items-center gap-3 mb-6">
                <Plane className="w-7 h-7 text-[#4a7c8e]" />
                <h2 className="text-4xl text-gray-900 font-medium">Flights</h2>
              </div>
              <div className="space-y-6">
                <div className="flex items-start gap-4 text-sm">
                  <div className="text-gray-600 w-24 font-medium">Airline</div>
                  <div className="text-gray-900">{tripMeta.flights.airline}</div>
                </div>
                <div className="flex items-start gap-4 text-sm">
                  <div className="text-gray-600 w-24 font-medium">Confirmation</div>
                  <div className="text-gray-900 font-mono text-xs font-bold">
                    {tripMeta.flights.confirmation}
                  </div>
                </div>

                <div className="pt-4 space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#4a7c8e]"></div>
                      <h3 className="text-xs tracking-widest uppercase text-[#4a7c8e] font-bold">
                        Outbound
                      </h3>
                    </div>
                    <div className="pl-4 space-y-2 text-sm text-gray-800">
                      <div>
                        <span className="font-semibold">{tripMeta.flights.outbound.number}</span>
                        <span className="text-gray-500 mx-2">•</span>
                        <span>{tripMeta.flights.outbound.date}</span>
                      </div>
                      <div className="text-xs">
                        <FlightLeg value={tripMeta.flights.outbound.departure} /> →{' '}
                        <FlightLeg value={tripMeta.flights.outbound.arrival} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-700"></div>
                      <h3 className="text-xs tracking-widest uppercase text-gray-700 font-bold">
                        Return
                      </h3>
                    </div>
                    <div className="pl-4 space-y-2 text-sm text-gray-800">
                      <div>
                        <span className="font-semibold">{tripMeta.flights.return.number}</span>
                        <span className="text-gray-500 mx-2">•</span>
                        <span>{tripMeta.flights.return.date}</span>
                      </div>
                      <div className="text-xs">
                        <FlightLeg value={tripMeta.flights.return.departure} /> →{' '}
                        <FlightLeg value={tripMeta.flights.return.arrival} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Weather */}
          <section>
            <div className="bg-white rounded-xl shadow-2xl p-8 border border-gray-200 h-full">
              <div className="flex items-center gap-3 mb-6">
                <Sun className="w-7 h-7 text-amber-500" />
                <h2 className="text-4xl text-gray-900 font-medium">Weather</h2>
              </div>
              <div className="space-y-3">
                {weatherData.map((day, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 rounded transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <WeatherIcon condition={day.condition} />
                      <div className="text-sm">
                        <div className="text-gray-900 font-semibold">
                          {day.date}
                        </div>
                        <div className="text-xs text-gray-600">
                          {day.location}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-800">
                      <span className="font-bold">{day.high}°</span>
                      <span className="text-gray-500 mx-1">/</span>
                      <span className="text-gray-600">{day.low}°</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-4 italic">
                Forecast temperatures in Fahrenheit
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

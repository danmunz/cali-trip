import { Calendar, Plane, Cloud, CloudRain, Sun } from 'lucide-react';
import mapImage from 'figma:asset/1becf1fb274bdda2aefe747340a99d4afe32758c.png';

export default function OverviewPage() {
  const weatherData = [
    { date: 'Apr 3', location: 'SF/Napa', high: 68, low: 52, condition: 'sunny' },
    { date: 'Apr 4', location: 'Napa', high: 72, low: 54, condition: 'sunny' },
    { date: 'Apr 5', location: 'Napa', high: 70, low: 53, condition: 'partly-cloudy' },
    { date: 'Apr 6', location: 'Yosemite', high: 62, low: 38, condition: 'partly-cloudy' },
    { date: 'Apr 7', location: 'Yosemite', high: 64, low: 40, condition: 'sunny' },
    { date: 'Apr 8', location: 'Carmel', high: 66, low: 50, condition: 'partly-cloudy' },
    { date: 'Apr 9', location: 'Carmel', high: 64, low: 51, condition: 'cloudy' },
    { date: 'Apr 10', location: 'Carmel', high: 63, low: 52, condition: 'light-rain' },
    { date: 'Apr 11', location: 'SF', high: 65, low: 54, condition: 'partly-cloudy' },
  ];

  const getWeatherIcon = (condition: string) => {
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
  };

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
        <div className="absolute bottom-0 left-0 right-0 pb-12 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 
              className="text-6xl sm:text-7xl lg:text-8xl mb-4 text-gray-900 tracking-tight drop-shadow-lg"
              style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontWeight: 500 }}
            >
              Susan's 70th Birthday
            </h1>
            <p className="text-xl text-gray-700 font-medium" style={{ fontFamily: "'Crimson Pro', serif" }}>
              California, USA • April 3-11, 2026
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 lg:px-12 pb-24 -mt-8">
        {/* Trip Itinerary Table */}
        <section className="mb-16">
          <div className="bg-white rounded-xl shadow-2xl p-8 sm:p-10 border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="w-7 h-7 text-[#b8956d]" />
              <h2 
                className="text-4xl text-gray-900" 
                style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontWeight: 500 }}
              >
                Daily Itinerary
              </h2>
            </div>
            <p className="text-gray-600 mb-6" style={{ fontFamily: "'Crimson Pro', serif" }}>
              9 days / 8 nights
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-4 px-3 text-xs tracking-widest uppercase text-gray-700 font-bold" style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
                      Date
                    </th>
                    <th className="text-left py-4 px-3 text-xs tracking-widest uppercase text-gray-700 font-bold" style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
                      Base
                    </th>
                    <th className="text-left py-4 px-3 text-xs tracking-widest uppercase text-gray-700 font-bold" style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
                      Logistics
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { date: 'Fri Apr 3', base: 'Napa / Sonoma', logistics: 'Fly DCA → SFO → Drive SFO → Muir Woods → Napa/Sonoma', color: '#b8956d' },
                    { date: 'Sat Apr 4', base: 'Napa / Sonoma', logistics: 'Stay Napa/Sonoma', color: '#b8956d' },
                    { date: 'Sun Apr 5', base: 'Napa / Sonoma', logistics: 'Stay Napa/Sonoma', color: '#b8956d' },
                    { date: 'Mon Apr 6', base: 'Yosemite Area', logistics: 'Checkout Napa → Drive Napa → Yosemite → Check-in Yosemite', color: '#5a8a6f' },
                    { date: 'Tue Apr 7', base: 'Yosemite Area', logistics: 'Yosemite full day', color: '#5a8a6f' },
                    { date: 'Wed Apr 8', base: 'Monterey / Carmel', logistics: 'Checkout Yosemite → Drive Yosemite → Monterey/Carmel → Check-in', color: '#4a7c8e' },
                    { date: 'Thu Apr 9', base: 'Monterey / Carmel', logistics: 'Stay Monterey/Carmel', color: '#4a7c8e' },
                    { date: 'Fri Apr 10', base: 'Monterey / Carmel', logistics: 'Stay Monterey/Carmel', color: '#4a7c8e' },
                    { date: 'Sat Apr 11', base: '—', logistics: 'Checkout Monterey/Carmel → Drive to SFO → Fly home', color: '#64748b' },
                  ].map((row, idx) => (
                    <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-3 text-sm text-gray-900" style={{ fontFamily: "'Crimson Pro', serif" }}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-2.5 h-2.5 rounded-full" 
                            style={{ backgroundColor: row.color }}
                          ></div>
                          <span className="font-medium">{row.date}</span>
                        </div>
                      </td>
                      <td className="py-4 px-3 text-sm text-gray-800 font-medium" style={{ fontFamily: "'Crimson Pro', serif" }}>
                        {row.base}
                      </td>
                      <td className="py-4 px-3 text-sm text-gray-700" style={{ fontFamily: "'Crimson Pro', serif" }}>{row.logistics}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Photo accent strip - subtle 3 region preview */}
        <section className="mb-16">
          <div className="grid grid-cols-3 gap-4">
            <div className="relative h-48 rounded-lg overflow-hidden group">
              <img 
                src="https://images.unsplash.com/photo-1701624019104-d37423bd30bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXBhJTIwdmFsbGV5JTIwd2luZSUyMHZpbmV5YXJkJTIwc3Vuc2V0JTIwZ29sZGVufGVufDF8fHx8MTc3MTEwNjM1Nnww&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Napa Valley"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-3 left-3">
                <p className="text-white text-sm font-medium" style={{ fontFamily: "'Crimson Pro', serif" }}>Napa & Sonoma</p>
              </div>
            </div>
            <div className="relative h-48 rounded-lg overflow-hidden group">
              <img 
                src="https://images.unsplash.com/photo-1526837283165-8e18dae94c89?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3NlbWl0ZSUyMGdyYW5pdGUlMjBtb3VudGFpbnMlMjB3YXRlcmZhbGx8ZW58MXx8fHwxNzcxMTA2MzU2fDA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Yosemite"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-3 left-3">
                <p className="text-white text-sm font-medium" style={{ fontFamily: "'Crimson Pro', serif" }}>Yosemite</p>
              </div>
            </div>
            <div className="relative h-48 rounded-lg overflow-hidden group">
              <img 
                src="https://images.unsplash.com/photo-1734186612578-60c86bcc212c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXJtZWwlMjBjYWxpZm9ybmlhJTIwY29hc3QlMjBvY2VhbiUyMHdhdmVzfGVufDF8fHx8MTc3MTEwNjM1N3ww&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Carmel"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-3 left-3">
                <p className="text-white text-sm font-medium" style={{ fontFamily: "'Crimson Pro', serif" }}>Monterey & Carmel</p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Flights */}
          <section>
            <div className="bg-white rounded-xl shadow-2xl p-8 border border-gray-200 h-full">
              <div className="flex items-center gap-3 mb-6">
                <Plane className="w-7 h-7 text-[#4a7c8e]" />
                <h2 
                  className="text-4xl text-gray-900" 
                  style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontWeight: 500 }}
                >
                  Flights
                </h2>
              </div>
              <div className="space-y-6" style={{ fontFamily: "'Crimson Pro', serif" }}>
                <div className="flex items-start gap-4 text-sm">
                  <div className="text-gray-600 w-24 font-medium">Airline</div>
                  <div className="text-gray-900">United Airlines</div>
                </div>
                <div className="flex items-start gap-4 text-sm">
                  <div className="text-gray-600 w-24 font-medium">Confirmation</div>
                  <div className="text-gray-900 font-mono text-xs font-bold">#CST454</div>
                </div>
                
                <div className="pt-4 space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#4a7c8e]"></div>
                      <h3 className="text-xs tracking-widest uppercase text-[#4a7c8e] font-bold" style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>Outbound</h3>
                    </div>
                    <div className="pl-4 space-y-2 text-sm text-gray-800">
                      <div>
                        <span className="font-semibold">UA 369</span>
                        <span className="text-gray-500 mx-2">•</span>
                        <span>Fri, Apr 3, 2026</span>
                      </div>
                      <div className="text-xs">
                        <span className="font-bold">DCA</span> 7:30am EDT → <span className="font-bold">SFO</span> 10:42am PDT
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-700"></div>
                      <h3 className="text-xs tracking-widest uppercase text-gray-700 font-bold" style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>Return</h3>
                    </div>
                    <div className="pl-4 space-y-2 text-sm text-gray-800">
                      <div>
                        <span className="font-semibold">UA 2386</span>
                        <span className="text-gray-500 mx-2">•</span>
                        <span>Sat, Apr 11, 2026</span>
                      </div>
                      <div className="text-xs">
                        <span className="font-bold">SFO</span> 2:00pm PDT → <span className="font-bold">DCA</span> 10:28pm EDT
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
                <h2 
                  className="text-4xl text-gray-900" 
                  style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontWeight: 500 }}
                >
                  Weather
                </h2>
              </div>
              <div className="space-y-3">
                {weatherData.map((day, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 rounded transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {getWeatherIcon(day.condition)}
                      <div className="text-sm" style={{ fontFamily: "'Crimson Pro', serif" }}>
                        <div className="text-gray-900 font-semibold">{day.date}</div>
                        <div className="text-xs text-gray-600">{day.location}</div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-800" style={{ fontFamily: "'Crimson Pro', serif" }}>
                      <span className="font-bold">{day.high}°</span>
                      <span className="text-gray-500 mx-1">/</span>
                      <span className="text-gray-600">{day.low}°</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-4 italic" style={{ fontFamily: "'Crimson Pro', serif" }}>
                Forecast temperatures in Fahrenheit
              </p>
            </div>
          </section>
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

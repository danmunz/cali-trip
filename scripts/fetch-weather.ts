/**
 * fetch-weather.ts — Fetches NWS forecasts and generates weather.generated.ts.
 *
 * Run via: pnpm weather
 *
 * Uses the National Weather Service API (https://www.weather.gov/documentation/services-web-api)
 * which is free and requires no API key.
 *
 * For each trip day, fetches the forecast for the corresponding location.
 * If a real forecast isn't available (NWS only provides ~7 days out), falls
 * back to the hardcoded monthly average.
 *
 * Reads:  (NWS API)
 * Writes: src/data/weather.generated.ts
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { WeatherDay, WeatherCondition, WeatherData } from '../src/data/types.js';

// ── Paths ───────────────────────────────────────────────────

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'src', 'data');
const OUTPUT_PATH = path.join(DATA_DIR, 'weather.generated.ts');

// ── Trip day definitions ────────────────────────────────────
// Each day maps to its primary location for weather lookup.
// For travel days, use the destination as the anchor.

interface TripDayLocation {
  date: string;           // ISO date "2026-04-03"
  displayDate: string;    // "Apr 3"
  location: string;       // Display name
  lat: number;
  lng: number;
  fallback: {             // Monthly average fallback
    high: number;
    low: number;
    condition: WeatherCondition;
  };
}

const tripDays: TripDayLocation[] = [
  {
    date: '2026-04-03',
    displayDate: 'Apr 3',
    location: 'SF/Napa',
    lat: 38.2975,       // Yountville (destination)
    lng: -122.3633,
    fallback: { high: 68, low: 52, condition: 'sunny' },
  },
  {
    date: '2026-04-04',
    displayDate: 'Apr 4',
    location: 'Napa',
    lat: 38.2975,
    lng: -122.3633,
    fallback: { high: 72, low: 54, condition: 'sunny' },
  },
  {
    date: '2026-04-05',
    displayDate: 'Apr 5',
    location: 'Napa',
    lat: 38.2975,
    lng: -122.3633,
    fallback: { high: 70, low: 53, condition: 'partly-cloudy' },
  },
  {
    date: '2026-04-06',
    displayDate: 'Apr 6',
    location: 'Yosemite',
    lat: 37.7490,       // Yosemite Valley
    lng: -119.5885,
    fallback: { high: 62, low: 38, condition: 'partly-cloudy' },
  },
  {
    date: '2026-04-07',
    displayDate: 'Apr 7',
    location: 'Yosemite',
    lat: 37.7490,
    lng: -119.5885,
    fallback: { high: 64, low: 40, condition: 'sunny' },
  },
  {
    date: '2026-04-08',
    displayDate: 'Apr 8',
    location: 'Carmel',
    lat: 36.5558,       // Carmel-by-the-Sea
    lng: -121.9233,
    fallback: { high: 66, low: 50, condition: 'partly-cloudy' },
  },
  {
    date: '2026-04-09',
    displayDate: 'Apr 9',
    location: 'Carmel',
    lat: 36.5558,
    lng: -121.9233,
    fallback: { high: 64, low: 51, condition: 'cloudy' },
  },
  {
    date: '2026-04-10',
    displayDate: 'Apr 10',
    location: 'Carmel',
    lat: 36.5558,
    lng: -121.9233,
    fallback: { high: 63, low: 52, condition: 'light-rain' },
  },
  {
    date: '2026-04-11',
    displayDate: 'Apr 11',
    location: 'SF',
    lat: 37.6224,       // SFO (departure)
    lng: -122.3840,
    fallback: { high: 65, low: 54, condition: 'partly-cloudy' },
  },
];

// ── NWS API helpers ─────────────────────────────────────────

const NWS_BASE = 'https://api.weather.gov';
const USER_AGENT = 'cali-trip-planner (github.com/danmunz/cali-trip)';

async function fetchJson(url: string): Promise<unknown> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      Accept: 'application/geo+json',
    },
  });
  if (!res.ok) {
    throw new Error(`NWS API ${res.status}: ${url}`);
  }
  return res.json();
}

interface NwsForecastPeriod {
  number: number;
  name: string;
  startTime: string;
  endTime: string;
  isDaytime: boolean;
  temperature: number;
  temperatureUnit: string;
  shortForecast: string;
  detailedForecast: string;
}

/** Get the NWS forecast grid endpoint for a lat/lng. */
async function getGridEndpoint(lat: number, lng: number): Promise<string> {
  const data = await fetchJson(
    `${NWS_BASE}/points/${lat.toFixed(4)},${lng.toFixed(4)}`,
  ) as { properties?: { forecast?: string } };

  const forecastUrl = data?.properties?.forecast;
  if (!forecastUrl) {
    throw new Error(`No forecast URL for ${lat},${lng}`);
  }
  return forecastUrl;
}

/** Fetch forecast periods from a grid endpoint. */
async function getForecastPeriods(
  forecastUrl: string,
): Promise<NwsForecastPeriod[]> {
  const data = await fetchJson(forecastUrl) as {
    properties?: { periods?: NwsForecastPeriod[] };
  };
  return data?.properties?.periods ?? [];
}

/** Map NWS short forecast text to our condition enum. */
function mapCondition(shortForecast: string): WeatherCondition {
  const lower = shortForecast.toLowerCase();
  if (lower.includes('thunder')) return 'thunderstorm';
  if (lower.includes('snow') || lower.includes('sleet') || lower.includes('ice'))
    return 'snow';
  if (lower.includes('fog') || lower.includes('haze') || lower.includes('mist'))
    return 'fog';
  if (lower.includes('rain') || lower.includes('showers') || lower.includes('drizzle')) {
    if (lower.includes('slight') || lower.includes('light') || lower.includes('chance'))
      return 'light-rain';
    return 'rain';
  }
  if (lower.includes('cloudy') || lower.includes('overcast')) {
    if (lower.includes('partly') || lower.includes('mostly sunny'))
      return 'partly-cloudy';
    return 'cloudy';
  }
  if (lower.includes('sunny') || lower.includes('clear')) return 'sunny';
  return 'partly-cloudy'; // safe default
}

// ── Main ────────────────────────────────────────────────────

async function main() {
  console.log('Fetching NWS weather forecasts…');

  // De-duplicate grid lookups — multiple trip days may share the same location
  const coordKey = (lat: number, lng: number) => `${lat.toFixed(4)},${lng.toFixed(4)}`;
  const uniqueCoords = new Map<string, { lat: number; lng: number }>();
  for (const day of tripDays) {
    const key = coordKey(day.lat, day.lng);
    if (!uniqueCoords.has(key)) {
      uniqueCoords.set(key, { lat: day.lat, lng: day.lng });
    }
  }

  // Fetch grid endpoints in parallel
  const gridEndpoints = new Map<string, string>();
  const gridResults = await Promise.allSettled(
    [...uniqueCoords.entries()].map(async ([key, { lat, lng }]) => {
      const url = await getGridEndpoint(lat, lng);
      return { key, url };
    }),
  );

  for (const result of gridResults) {
    if (result.status === 'fulfilled') {
      gridEndpoints.set(result.value.key, result.value.url);
    } else {
      console.warn('  ⚠ Grid lookup failed:', result.reason);
    }
  }

  // Fetch forecasts in parallel
  const forecastsByCoord = new Map<string, NwsForecastPeriod[]>();
  const forecastResults = await Promise.allSettled(
    [...gridEndpoints.entries()].map(async ([key, url]) => {
      const periods = await getForecastPeriods(url);
      return { key, periods };
    }),
  );

  for (const result of forecastResults) {
    if (result.status === 'fulfilled') {
      forecastsByCoord.set(result.value.key, result.value.periods);
    } else {
      console.warn('  ⚠ Forecast fetch failed:', result.reason);
    }
  }

  // Build weather data for each trip day
  let forecastCount = 0;
  const days: WeatherDay[] = tripDays.map((tripDay) => {
    const key = coordKey(tripDay.lat, tripDay.lng);
    const periods = forecastsByCoord.get(key) ?? [];

    // Find matching day and night periods for this date
    const dayPeriods = periods.filter((p) => {
      const periodDate = p.startTime.slice(0, 10); // "2026-04-03"
      return periodDate === tripDay.date;
    });

    const daytimePeriod = dayPeriods.find((p) => p.isDaytime);
    const nightPeriod = dayPeriods.find((p) => !p.isDaytime);

    if (daytimePeriod) {
      forecastCount++;
      // Real forecast available
      const high = daytimePeriod.temperature;
      const low = nightPeriod?.temperature ?? high - 15;
      return {
        date: tripDay.date,
        displayDate: tripDay.displayDate,
        location: tripDay.location,
        high,
        low,
        condition: mapCondition(daytimePeriod.shortForecast),
        shortForecast: daytimePeriod.shortForecast,
        source: 'forecast' as const,
      };
    }

    // Fall back to monthly average
    return {
      date: tripDay.date,
      displayDate: tripDay.displayDate,
      location: tripDay.location,
      high: tripDay.fallback.high,
      low: tripDay.fallback.low,
      condition: tripDay.fallback.condition,
      source: 'average' as const,
    };
  });

  const weatherData: WeatherData = {
    days,
    fetchedAt: forecastCount > 0 ? new Date().toISOString() : null,
  };

  console.log(
    `  ✓ ${forecastCount} day(s) with real forecasts, ${days.length - forecastCount} using monthly averages`,
  );

  // Write generated file
  const output = [
    '// Auto-generated by scripts/fetch-weather.ts — do not edit.',
    '// Run: pnpm weather',
    '',
    `import type { WeatherData } from './types';`,
    '',
    `export const weatherData: WeatherData = ${JSON.stringify(weatherData, null, 2)};`,
    '',
  ].join('\n');

  fs.writeFileSync(OUTPUT_PATH, output, 'utf-8');
  console.log(`  ✓ Wrote ${OUTPUT_PATH}`);
}

main().catch((err) => {
  console.error('Weather fetch failed:', err);
  // On failure, write fallback data so the build still works
  const fallbackDays: WeatherDay[] = tripDays.map((tripDay) => ({
    date: tripDay.date,
    displayDate: tripDay.displayDate,
    location: tripDay.location,
    high: tripDay.fallback.high,
    low: tripDay.fallback.low,
    condition: tripDay.fallback.condition,
    source: 'average' as const,
  }));

  const weatherData: WeatherData = { days: fallbackDays, fetchedAt: null };

  const output = [
    '// Auto-generated by scripts/fetch-weather.ts — do not edit.',
    '// Run: pnpm weather',
    '// NOTE: Generated with fallback data (NWS API was unavailable).',
    '',
    `import type { WeatherData } from './types';`,
    '',
    `export const weatherData: WeatherData = ${JSON.stringify(weatherData, null, 2)};`,
    '',
  ].join('\n');

  fs.writeFileSync(OUTPUT_PATH, output, 'utf-8');
  console.log(`  ✓ Wrote fallback weather data to ${OUTPUT_PATH}`);
});

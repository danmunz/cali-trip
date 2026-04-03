import { useState, useEffect, useRef, useCallback } from 'react';
import type { TripDay, Activity } from '../../data/types';
import { itinerary } from '../../data/itinerary.generated';
import locationsData from '../../data/locations.json';

// ── Types ────────────────────────────────────────────────────

export interface TimelineEntry {
  index: number;
  activity: Activity;
  date: string;        // ISO "2026-04-03"
  dayOfWeek: string;
  dayTitle: string;
  dayNumber: number;
  segmentId: string;
  startTime: Date | null;
  endTime: Date | null;
  geo: { lat: number; lng: number } | null;
}

export interface UserGeo {
  lat: number;
  lng: number;
}

export type GeoStatus = 'prompt' | 'requesting' | 'granted' | 'denied' | 'unavailable';

// ── Constants ────────────────────────────────────────────────

// PDT = UTC-7
const PDT_OFFSET = -7 * 60;

// Scoring weights
const GEO_WEIGHT = 0.7;
const TIME_WEIGHT = 0.3;

// Distance thresholds (km)
const CLOSE_PROXIMITY_KM = 0.5;
const FAR_DISTANCE_KM = 20;

// ── Location lookup ──────────────────────────────────────────

const locationGeoMap = new Map<string, { lat: number; lng: number }>();
const locData = (locationsData as { locations: Array<{ id: string; geo: { lat: number; lng: number } }> }).locations;
for (const loc of locData) {
  locationGeoMap.set(loc.id, loc.geo);
}

// ── Time parsing ─────────────────────────────────────────────

const TIME_RE = /^(\d{1,2}):(\d{2})(am|pm)$/i;

function parseTimeStr(timeStr: string): { hours: number; minutes: number } | null {
  const match = timeStr.trim().match(TIME_RE);
  if (!match) return null;
  let hours = parseInt(match[1]!, 10);
  const minutes = parseInt(match[2]!, 10);
  const ampm = match[3]!.toLowerCase();
  if (ampm === 'pm' && hours !== 12) hours += 12;
  if (ampm === 'am' && hours === 12) hours = 0;
  return { hours, minutes };
}

function makePDTDate(isoDate: string, hours: number, minutes: number): Date {
  // Create a date in PDT by computing UTC manually
  const parts = isoDate.split('-').map(Number);
  const y = parts[0]!;
  const m = parts[1]!;
  const d = parts[2]!;
  const utcMs = Date.UTC(y, m - 1, d, hours, minutes, 0, 0);
  // Subtract offset to go from PDT to UTC (PDT is UTC-7, so add 7 hours)
  return new Date(utcMs - PDT_OFFSET * 60 * 1000);
}

/**
 * Fuzzy time names → approximate hour
 */
function fuzzyTimeToHour(time: string): { hours: number; minutes: number } | null {
  const lower = time.toLowerCase().trim();
  if (lower === 'evening') return { hours: 18, minutes: 0 };
  if (lower === 'after dinner') return { hours: 20, minutes: 30 };
  if (lower === 'morning') return { hours: 9, minutes: 0 };
  if (lower === 'afternoon') return { hours: 14, minutes: 0 };
  if (lower === 'night' || lower === 'late evening') return { hours: 21, minutes: 0 };
  return null;
}

interface ParsedTime {
  start: Date | null;
  end: Date | null;
}

function parseActivityTime(time: string, isoDate: string): ParsedTime {
  // Try range: "10:45am–12:15pm" (various dash characters)
  const rangeParts = time.split(/[–—-]/);
  if (rangeParts.length === 2) {
    const s = parseTimeStr(rangeParts[0]!);
    const e = parseTimeStr(rangeParts[1]!);
    if (s && e) {
      return {
        start: makePDTDate(isoDate, s.hours, s.minutes),
        end: makePDTDate(isoDate, e.hours, e.minutes),
      };
    }
  }

  // Try point time: "4:00pm"
  const point = parseTimeStr(time);
  if (point) {
    return {
      start: makePDTDate(isoDate, point.hours, point.minutes),
      end: null,
    };
  }

  // Try fuzzy: "Evening", "After dinner"
  const fuzzy = fuzzyTimeToHour(time);
  if (fuzzy) {
    return {
      start: makePDTDate(isoDate, fuzzy.hours, fuzzy.minutes),
      end: null,
    };
  }

  return { start: null, end: null };
}

// ── Geo utilities ────────────────────────────────────────────

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Haversine distance in km */
export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h = sinLat * sinLat + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinLng * sinLng;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function resolveActivityGeo(activity: Activity): { lat: number; lng: number } | null {
  for (const locId of activity.locationIds) {
    const geo = locationGeoMap.get(locId);
    if (geo) return geo;
  }
  return null;
}

// ── Build timeline ───────────────────────────────────────────

export function buildTimeline(days: TripDay[]): TimelineEntry[] {
  const entries: TimelineEntry[] = [];
  let idx = 0;

  for (const day of days) {
    for (const activity of day.activities) {
      const { start, end } = parseActivityTime(activity.time, day.date);
      const geo = resolveActivityGeo(activity);

      entries.push({
        index: idx,
        activity,
        date: day.date,
        dayOfWeek: day.dayOfWeek,
        dayTitle: day.title,
        dayNumber: day.day,
        segmentId: day.segmentId,
        startTime: start,
        endTime: end,
        geo,
      });
      idx++;
    }
  }

  // Fill in null geo by inheriting from nearest neighbor
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i]!;
    if (!entry.geo) {
      // Look backward first, then forward
      for (let j = i - 1; j >= 0; j--) {
        if (entries[j]!.geo) {
          entry.geo = entries[j]!.geo;
          break;
        }
      }
      if (!entry.geo) {
        for (let j = i + 1; j < entries.length; j++) {
          if (entries[j]!.geo) {
            entry.geo = entries[j]!.geo;
            break;
          }
        }
      }
    }
  }

  // Fill in null end times (next activity's start, or +1hr)
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i]!;
    if (entry.startTime && !entry.endTime) {
      const next = entries[i + 1];
      if (next?.startTime) {
        entry.endTime = next.startTime;
      } else {
        entry.endTime = new Date(entry.startTime.getTime() + 60 * 60 * 1000);
      }
    }
  }

  return entries;
}

// ── Scoring ──────────────────────────────────────────────────

function timeScore(entry: TimelineEntry, now: Date): number {
  if (!entry.startTime) return 0;

  const start = entry.startTime.getTime();
  const end = (entry.endTime ?? entry.startTime).getTime();
  const nowMs = now.getTime();

  // Currently within the activity window → 1.0
  if (nowMs >= start && nowMs <= end) return 1.0;

  // Compute distance in hours
  const distMs = nowMs < start ? start - nowMs : nowMs - end;
  const distHours = distMs / (1000 * 60 * 60);

  // Decay over ~12 hours (so activities on the same day still score decently)
  return Math.max(0, 1 - distHours / 12);
}

function locationScore(entry: TimelineEntry, userGeo: UserGeo): number {
  if (!entry.geo) return 0;

  const dist = haversineKm(userGeo, entry.geo);

  // Very close → 1.0
  if (dist <= CLOSE_PROXIMITY_KM) return 1.0;

  // Decay: score drops to ~0 at ~50km
  return Math.max(0, 1 - dist / 50);
}

export function getCurrentActivityIndex(
  entries: TimelineEntry[],
  now: Date,
  userGeo: UserGeo | null,
): number {
  if (entries.length === 0) return 0;

  let bestIndex = 0;
  let bestScore = -1;

  const hasGeo = userGeo !== null;
  const geoW = hasGeo ? GEO_WEIGHT : 0;
  const timeW = hasGeo ? TIME_WEIGHT : 1.0;

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i]!;
    let score = timeW * timeScore(entry, now);

    if (hasGeo && entry.geo) {
      const ls = locationScore(entry, userGeo!);

      // Strong proximity override: if very close, boost significantly
      const dist = haversineKm(userGeo!, entry.geo);
      if (dist <= CLOSE_PROXIMITY_KM) {
        score += geoW * 1.0 + 0.5; // hard boost
      } else if (dist > FAR_DISTANCE_KM) {
        // Far from all activities → lean heavier on time
        score += geoW * ls * 0.3;
      } else {
        score += geoW * ls;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestIndex = i;
    }
  }

  return bestIndex;
}

// ── React hooks ──────────────────────────────────────────────

export function useUserLocation(): {
  coords: UserGeo | null;
  status: GeoStatus;
  requestPermission: () => void;
} {
  const [coords, setCoords] = useState<UserGeo | null>(null);
  const [status, setStatus] = useState<GeoStatus>('prompt');
  const watchRef = useRef<number | null>(null);

  const startWatching = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus('unavailable');
      return;
    }

    setStatus('requesting');

    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setStatus('granted');
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setStatus('denied');
        } else {
          setStatus('unavailable');
        }
      },
      { enableHighAccuracy: false, maximumAge: 60_000, timeout: 10_000 },
    );
  }, []);

  const requestPermission = useCallback(() => {
    if (status === 'prompt' || status === 'unavailable') {
      startWatching();
    }
  }, [status, startWatching]);

  // Auto-request on mount
  useEffect(() => {
    startWatching();
    return () => {
      if (watchRef.current !== null) {
        navigator.geolocation.clearWatch(watchRef.current);
      }
    };
  }, [startWatching]);

  return { coords, status, requestPermission };
}

export function useTimeline() {
  // Build once (itinerary is static)
  const [timeline] = useState(() => buildTimeline(itinerary));
  return timeline;
}

export function useCurrentIndex(
  timeline: TimelineEntry[],
  userGeo: UserGeo | null,
): number {
  const [index, setIndex] = useState(() =>
    getCurrentActivityIndex(timeline, new Date(), userGeo),
  );

  useEffect(() => {
    // Re-evaluate whenever geo changes
    setIndex(getCurrentActivityIndex(timeline, new Date(), userGeo));
  }, [timeline, userGeo]);

  // Auto-refresh every 60s
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex(getCurrentActivityIndex(timeline, new Date(), userGeo));
    }, 60_000);
    return () => clearInterval(interval);
  }, [timeline, userGeo]);

  return index;
}

// Shared types for generated + hand-maintained data files.

// ── Itinerary ────────────────────────────────────────────────

export interface TravelAfter {
  mode: 'drive';
  duration: string; // "~1 hr", "~4 hr 30 min"
  from: string;
  to: string;
}

export interface Activity {
  time: string; // "10:45am–12:15pm" | "4:00pm" | "Evening"
  name: string;
  description: string; // plain-text (markdown stripped)
  locationIds: string[];
  subgroup?: string; // "Susan + Ted"
  travelAfter?: TravelAfter;
}

export interface TripDay {
  day: number; // 1-9
  date: string; // ISO "2026-04-03"
  dayOfWeek: string; // "Friday"
  title: string; // "Arrival + Redwoods + Yountville"
  summary: string; // day intro paragraph, plain text
  segmentId: string; // "napa" | "yosemite" | "carmel"
  activities: Activity[];
}

// ── Trip metadata ────────────────────────────────────────────

export interface Flight {
  number: string; // "UA 369"
  date: string; // "Fri Apr 3, 2026"
  departure: string; // "DCA 7:30am EDT"
  arrival: string; // "SFO 10:42am PDT"
}

export interface LodgingConfirmation {
  name: string;
  dates: string; // "Apr 3–6"
  address: string;
  confirmations: string[];
}

export interface DailyScheduleRow {
  date: string; // "Fri Apr 3"
  base: string; // "Napa / Sonoma"
  logistics: string;
  segmentId: string;
}

export interface TripMeta {
  title: string; // "Susan's 70th Birthday"
  subtitle: string; // "California, USA | April 3-11, 2026"
  overview: string; // overview paragraph, plain text
  dates: string; // "April 3-11, 2026"
  duration: string; // "9 days / 8 nights"
  flights: {
    airline: string;
    confirmation: string;
    outbound: Flight;
    return: Flight;
  };
  dailySchedule: DailyScheduleRow[];
  lodgingConfirmations: LodgingConfirmation[];
}

// ── Locations ────────────────────────────────────────────────

export interface LocationTripPart {
  day: number;
  date: string;
  segment_id: string;
}

export interface Location {
  id: string;
  name: string;
  address: string;
  geo: { lat: number; lng: number };
  type: string;
  notes: string;
  images: string[];
  official_url: string[];
  google_maps_url: string[];
  review_url: string[];
  trip_parts: LocationTripPart[];
}

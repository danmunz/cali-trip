/**
 * generate-data.ts — Parses full-trip.md into typed data files and syncs locations.json.
 *
 * Run via: pnpm generate
 *
 * Reads:  src/data/full-trip.md, src/data/locations.json
 * Writes: src/data/itinerary.generated.ts, src/data/trip-meta.generated.ts
 * Syncs:  src/data/locations.json (trip_parts regenerated, stubs added)
 */

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import { toString } from 'mdast-util-to-string';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import type {
  Root,
  RootContent,
  Heading,
  Paragraph,
  Table,
  List,
  PhrasingContent,
} from 'mdast';
import type {
  TripMeta,
  TripDay,
  Activity,
  Flight,
  LodgingConfirmation,
  DailyScheduleRow,
  Location,
  LocationTripPart,
} from '../src/data/types.js';

// ── Paths ───────────────────────────────────────────────────

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'src', 'data');
const MD_PATH = path.join(DATA_DIR, 'full-trip.md');
const LOCATIONS_PATH = path.join(DATA_DIR, 'locations.json');

// ── Load inputs ─────────────────────────────────────────────

const mdSource = fs.readFileSync(MD_PATH, 'utf-8');
const locationsRaw: { locations: Location[] } = JSON.parse(
  fs.readFileSync(LOCATIONS_PATH, 'utf-8'),
);
const locations = locationsRaw.locations;

// ── Parse ───────────────────────────────────────────────────

const tree = unified().use(remarkParse).use(remarkGfm).parse(mdSource) as Root;

// ── Helpers ─────────────────────────────────────────────────

function nodeText(node: RootContent | PhrasingContent): string {
  return toString(node).trim();
}

/** True if the paragraph's only meaningful child is a single <strong>. */
function isStrongOnly(node: RootContent): node is Paragraph {
  if (node.type !== 'paragraph') return false;
  const meaningful = node.children.filter(
    (c) => !(c.type === 'text' && c.value.trim() === '') && c.type !== 'break',
  );
  return meaningful.length === 1 && meaningful[0]!.type === 'strong';
}

/** True if the paragraph's only meaningful child is a single <em>. */
function isEmphasisOnly(node: RootContent): node is Paragraph {
  if (node.type !== 'paragraph') return false;
  const meaningful = node.children.filter(
    (c) => !(c.type === 'text' && c.value.trim() === '') && c.type !== 'break',
  );
  return meaningful.length === 1 && meaningful[0]!.type === 'emphasis';
}

/** Detect a time-block paragraph: `**time — name**` */
function isTimeBlock(node: RootContent): boolean {
  if (!isStrongOnly(node)) return false;
  return nodeText(node).includes(' — ');
}

/** Detect a travel line: `*Travel (drive): ~duration — from → to*` */
const TRAVEL_RE = /^Travel \(drive\):\s*(.+?)\s*—\s*(.+?)\s*→\s*(.+)$/;
function isTravelLine(node: RootContent): boolean {
  if (!isEmphasisOnly(node)) return false;
  return TRAVEL_RE.test(nodeText(node));
}

function parseTravelLine(text: string) {
  const m = text.match(TRAVEL_RE);
  if (!m) return undefined;
  return { mode: 'drive' as const, duration: m[1]!, from: m[2]!, to: m[3]! };
}

// ── Section splitting ───────────────────────────────────────

interface Section {
  heading: string;
  depth: number;
  children: RootContent[];
}

function splitByHeading(nodes: RootContent[], depth: number): Section[] {
  const sections: Section[] = [];
  let current: Section | null = null;
  for (const node of nodes) {
    if (node.type === 'heading' && (node as Heading).depth === depth) {
      current = { heading: nodeText(node), depth, children: [] };
      sections.push(current);
    } else if (current) {
      current.children.push(node);
    }
  }
  return sections;
}

/** Collect all nodes between two headings at a given depth, starting after startIdx. */
function collectAfterH1(
  nodes: RootContent[],
  startIdx: number,
): RootContent[] {
  const result: RootContent[] = [];
  for (let i = startIdx + 1; i < nodes.length; i++) {
    const n = nodes[i]!;
    if (n.type === 'heading' && (n as Heading).depth === 1) break;
    result.push(n);
  }
  return result;
}

// ── Location matching ───────────────────────────────────────

/** Normalize curly quotes and dashes for comparison. */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[\u2018\u2019\u2032]/g, "'") // curly single quotes → straight
    .replace(/[\u2014]/g, '—')
    .trim();
}

/** Build search aliases for a location name. */
function buildAliases(name: string): string[] {
  const lower = normalize(name);
  const aliases = [lower];

  // Parenthetical abbreviation: "San Francisco International Airport (SFO)" → "sfo"
  const paren = name.match(/\(([^)]+)\)/);
  if (paren) aliases.push(normalize(paren[1]!));

  // Name without parenthetical
  const noParen = lower.replace(/\s*\([^)]*\)/, '').trim();
  if (noParen !== lower) aliases.push(noParen);

  // Name without common suffixes
  const noSuffix = noParen
    .replace(
      /\s+(?:state park|state reserve|national monument|national park|winery|estate|lodge.*|& spa.*)$/,
      '',
    )
    .trim();
  if (noSuffix !== noParen && noSuffix.length >= 4) aliases.push(noSuffix);

  // For trails/loops: also strip "trail", "loop", "walk" suffix
  const noTrailSuffix = noParen
    .replace(/\s+(?:trail|loop|walk)$/i, '')
    .trim();
  if (noTrailSuffix !== noParen && noTrailSuffix.length >= 5)
    aliases.push(noTrailSuffix);

  // For multi-word names (4+ words), also try the last 2–3 significant words
  // E.g. "Andrew Molera Bluff Trail" → "bluff trail"
  const words = noParen.split(/\s+/);
  if (words.length >= 4) {
    const tail2 = words.slice(-2).join(' ');
    if (tail2.length >= 5) aliases.push(tail2);
    const tail3 = words.slice(-3).join(' ');
    if (tail3.length >= 8 && tail3 !== noParen) aliases.push(tail3);
  }

  return [...new Set(aliases)];
}

/** Pre-built alias map: alias → location id (longest alias first). */
const aliasEntries: Array<{ alias: string; id: string }> = [];
for (const loc of locations) {
  for (const alias of buildAliases(loc.name)) {
    aliasEntries.push({ alias, id: loc.id });
  }
}
aliasEntries.sort((a, b) => b.alias.length - a.alias.length);

/** Find all location IDs whose alias appears in `text`. */
function matchLocationsByText(text: string): string[] {
  const lower = normalize(text);
  const ids: string[] = [];
  for (const { alias, id } of aliasEntries) {
    if (alias.length < 4) {
      // Short aliases (e.g. "SFO") need word boundaries
      const re = new RegExp(`\\b${alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (re.test(text)) ids.push(id);
    } else if (lower.includes(alias)) {
      ids.push(id);
    }
  }
  return [...new Set(ids)];
}

function matchLocationByUrl(url: string): string | null {
  for (const loc of locations) {
    if (loc.official_url.some((u) => u === url)) return loc.id;
  }
  return null;
}

/** Walk a paragraph's children to find bold names and links, return matched location IDs. */
function extractLocationIdsFromNodes(nodes: RootContent[]): string[] {
  const ids = new Set<string>();
  for (const node of nodes) {
    if (node.type !== 'paragraph') continue;
    for (const child of (node as Paragraph).children) {
      if (child.type === 'strong') {
        for (const id of matchLocationsByText(nodeText(child))) ids.add(id);
      }
      if (child.type === 'link') {
        const byUrl = matchLocationByUrl(child.url);
        if (byUrl) {
          ids.add(byUrl);
        } else {
          for (const id of matchLocationsByText(nodeText(child))) ids.add(id);
        }
      }
    }
  }
  return [...ids];
}

// ── Subgroup extraction ─────────────────────────────────────

function extractSubgroup(name: string): {
  cleanName: string;
  subgroup?: string;
} {
  const m = name.match(
    /\s*\(([^)]*(?:Susan|Ted|Dan|Jen|Ava)[^)]*)\)\s*$/,
  );
  if (m) return { cleanName: name.replace(m[0]!, '').trim(), subgroup: m[1] };
  return { cleanName: name };
}

// ── Date helpers ────────────────────────────────────────────

const MONTHS: Record<string, string> = {
  Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
  Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12',
};
const DAYS_FULL: Record<string, string> = {
  Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday',
  Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday',
};

function parseDayHeading(
  text: string,
  year: string,
): { dayOfWeek: string; date: string; title: string } {
  const m = text.match(/^(\w{3}) (\w{3}) (\d{1,2}) — (.+)$/);
  if (!m) throw new Error(`Cannot parse day heading: "${text}"`);
  return {
    dayOfWeek: DAYS_FULL[m[1]!] ?? m[1]!,
    date: `${year}-${MONTHS[m[2]!]}-${m[3]!.padStart(2, '0')}`,
    title: m[4]!,
  };
}

// ── Segment inference from table ────────────────────────────

const BASE_TO_SEGMENT: Record<string, string> = {
  'sfo + muir woods': 'napa',
  'napa / sonoma': 'napa',
  napa: 'napa',
  yosemite: 'yosemite',
  'yosemite area': 'yosemite',
  'monterey / carmel': 'carmel',
  'carmel / big sur': 'carmel',
  carmel: 'carmel',
};

function segmentForBase(base: string, prev: string): string {
  const key = base.toLowerCase().trim();
  if (key === '—' || key === '-' || key === '') return prev;
  return BASE_TO_SEGMENT[key] ?? prev;
}

// ════════════════════════════════════════════════════════════
// MAIN EXTRACTION
// ════════════════════════════════════════════════════════════

const children = tree.children;

// ── 1. Extract year from subtitle ───────────────────────────

const subtitleNode = children.find(
  (n) => n.type === 'heading' && (n as Heading).depth === 2,
);
const subtitleText = subtitleNode ? nodeText(subtitleNode) : '';
const yearMatch = subtitleText.match(/(\d{4})/);
const year = yearMatch ? yearMatch[1]! : '2026';

// ── 2. Extract title from first H1 ─────────────────────────

const titleNode = children.find(
  (n) => n.type === 'heading' && (n as Heading).depth === 1,
);
const rawTitle = titleNode ? nodeText(titleNode) : '';
// "SUSAN'S 70TH BIRTHDAY" → "Susan's 70th Birthday"
const title = rawTitle
  .split(' ')
  .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
  .join(' ');

// ── 3. Find top-level H1 sections ──────────────────────────

function findH1Index(label: string): number {
  return children.findIndex(
    (n) =>
      n.type === 'heading' &&
      (n as Heading).depth === 1 &&
      nodeText(n).toLowerCase().includes(label.toLowerCase()),
  );
}

// Overview
const overviewIdx = findH1Index('Overview');
const overviewNodes = overviewIdx >= 0 ? collectAfterH1(children, overviewIdx) : [];
const overviewText =
  overviewNodes
    .filter((n) => n.type === 'paragraph')
    .map((n) => nodeText(n))
    .join(' ') || '';

// Trip Itinerary
const itinIdx = findH1Index('Trip Itinerary');
const itinNodes = itinIdx >= 0 ? collectAfterH1(children, itinIdx) : [];

// Day-by-day itinerary
const dayByDayIdx = findH1Index('Day-by-day');
const dayByDayNodes =
  dayByDayIdx >= 0 ? collectAfterH1(children, dayByDayIdx) : [];

// ── 4. Parse daily schedule table ───────────────────────────

const tableNode = itinNodes.find((n) => n.type === 'table') as
  | Table
  | undefined;
const dailySchedule: DailyScheduleRow[] = [];
let prevSegment = 'napa';

if (tableNode) {
  // Skip header row (index 0)
  for (let r = 1; r < tableNode.children.length; r++) {
    const row = tableNode.children[r]!;
    const cells = row.children.map((c) => nodeText(c));
    const base = cells[1] ?? '';
    const seg = segmentForBase(base, prevSegment);
    prevSegment = seg;
    dailySchedule.push({
      date: cells[0] ?? '',
      base,
      logistics: cells[2] ?? '',
      segmentId: seg,
    });
  }
}

// Build a day-number → segmentId map
const daySegmentMap = new Map<number, string>();
dailySchedule.forEach((row, idx) => daySegmentMap.set(idx + 1, row.segmentId));

// ── 5. Parse "Dates:" line ──────────────────────────────────

const datesLine = itinNodes.find(
  (n) => n.type === 'paragraph' && nodeText(n).startsWith('Dates:'),
);
const datesText = datesLine ? nodeText(datesLine) : '';
const datesMatch = datesText.match(/Dates:\s*(.+?)\s*\((.+?)\)/);
const dates = datesMatch ? datesMatch[1]! : '';
const duration = datesMatch ? datesMatch[2]! : '';

// ── 6. Parse flights ────────────────────────────────────────

const flightH2 = itinNodes.findIndex(
  (n) =>
    n.type === 'heading' &&
    (n as Heading).depth === 2 &&
    nodeText(n).toLowerCase().includes('flight'),
);

let airline = '';
let flightConfirmation = '';
let outbound: Flight = { number: '', date: '', departure: '', arrival: '' };
let returnFlight: Flight = {
  number: '',
  date: '',
  departure: '',
  arrival: '',
};

if (flightH2 >= 0) {
  // Find the list node after the flights heading
  for (let i = flightH2 + 1; i < itinNodes.length; i++) {
    const n = itinNodes[i]!;
    if (n.type === 'heading') break;
    if (n.type === 'list') {
      for (const item of (n as List).children) {
        const text = nodeText(item);
        if (text.startsWith('Airline:')) airline = text.replace('Airline:', '').trim();
        else if (text.startsWith('Confirmation:'))
          flightConfirmation = text.replace('Confirmation:', '').trim();
        else if (text.startsWith('Outbound:')) {
          const raw = text.replace('Outbound:', '').trim();
          outbound = parseFlight(raw);
        } else if (text.startsWith('Return:')) {
          const raw = text.replace('Return:', '').trim();
          returnFlight = parseFlight(raw);
        }
      }
      break;
    }
  }
}

function parseFlight(raw: string): Flight {
  const [depPart, arrPart] = raw.split(' → ');
  const parts = (depPart ?? '').split(', ');
  return {
    number: parts[0] ?? '',
    date: parts.slice(1, -1).join(', '),
    departure: parts[parts.length - 1] ?? '',
    arrival: (arrPart ?? '').trim(),
  };
}

// ── 7. Parse lodging confirmations ──────────────────────────

const lodgingH2 = itinNodes.findIndex(
  (n) =>
    n.type === 'heading' &&
    (n as Heading).depth === 2 &&
    nodeText(n).toLowerCase().includes('lodging'),
);

const lodgingConfirmations: LodgingConfirmation[] = [];

if (lodgingH2 >= 0) {
  // Collect nodes until next H2 or end
  const lodgingNodes: RootContent[] = [];
  for (let i = lodgingH2 + 1; i < itinNodes.length; i++) {
    const n = itinNodes[i]!;
    if (n.type === 'heading' && (n as Heading).depth === 2) break;
    lodgingNodes.push(n);
  }
  const h3Sections = splitByHeading(lodgingNodes, 3);
  for (const sec of h3Sections) {
    const parts = sec.heading.split(' — ');
    const datePart = parts[0] ?? '';
    const namePart = parts.slice(1).join(' — ');
    let address = '';
    const confirmations: string[] = [];
    for (const child of sec.children) {
      if (child.type === 'list') {
        for (const item of (child as List).children) {
          const text = nodeText(item);
          if (text.startsWith('Address:'))
            address = text.replace('Address:', '').trim();
          else if (text.startsWith('Confirmation:'))
            confirmations.push(text.replace('Confirmation:', '').trim());
        }
      }
    }
    lodgingConfirmations.push({
      name: namePart,
      dates: datePart,
      address,
      confirmations,
    });
  }
}

// ── 8. Parse day-by-day itinerary ───────────────────────────

const dayH2s = splitByHeading(dayByDayNodes, 2);
const tripDays: TripDay[] = [];

for (let dayIdx = 0; dayIdx < dayH2s.length; dayIdx++) {
  const sec = dayH2s[dayIdx]!;
  const dayNum = dayIdx + 1;
  const { dayOfWeek, date, title: dayTitle } = parseDayHeading(
    sec.heading,
    year,
  );
  const segmentId = daySegmentMap.get(dayNum) ?? 'napa';

  // First paragraph(s) before the first time block are the day summary
  const activities: Activity[] = [];
  const summaryParts: string[] = [];
  let currentActivity: {
    time: string;
    name: string;
    descParagraphs: RootContent[];
    locationIds: Set<string>;
    subgroup?: string;
  } | null = null;

  function flushActivity() {
    if (!currentActivity) return;
    const descText = currentActivity.descParagraphs
      .map((n) => nodeText(n))
      .join(' ');

    // Extract location IDs from description paragraphs (bold names + links)
    const descLocIds = extractLocationIdsFromNodes(
      currentActivity.descParagraphs,
    );
    for (const id of descLocIds) currentActivity.locationIds.add(id);

    // Also scan the full activity name + description text
    const fullText = currentActivity.name + ' ' + descText;
    for (const id of matchLocationsByText(fullText))
      currentActivity.locationIds.add(id);

    activities.push({
      time: currentActivity.time,
      name: currentActivity.name,
      description: descText,
      locationIds: [...currentActivity.locationIds],
      ...(currentActivity.subgroup
        ? { subgroup: currentActivity.subgroup }
        : {}),
    });
    currentActivity = null;
  }

  for (const node of sec.children) {
    if (isTimeBlock(node)) {
      flushActivity();
      const fullText = nodeText(node);
      const dashIdx = fullText.indexOf(' — ');
      const time = fullText.slice(0, dashIdx);
      const rawName = fullText.slice(dashIdx + 3);
      const { cleanName, subgroup } = extractSubgroup(rawName);
      currentActivity = {
        time,
        name: cleanName,
        descParagraphs: [],
        locationIds: new Set(),
        subgroup,
      };
    } else if (isTravelLine(node)) {
      // Attach to the most recent activity
      if (currentActivity) {
        // Flush description first, then attach travel
        const travel = parseTravelLine(nodeText(node));
        if (travel) {
          // We need to attach travel AFTER flushing, so store it temporarily
          flushActivity();
          const lastActivity = activities[activities.length - 1];
          if (lastActivity) lastActivity.travelAfter = travel;
        }
      } else {
        // Travel line before any activity — ignore (shouldn't happen)
      }
    } else if (currentActivity) {
      currentActivity.descParagraphs.push(node);
    } else {
      // Before any time block — this is the day summary
      if (node.type === 'paragraph') summaryParts.push(nodeText(node));
    }
  }
  flushActivity();

  tripDays.push({
    day: dayNum,
    date,
    dayOfWeek,
    title: dayTitle,
    summary: summaryParts.join(' '),
    segmentId,
    activities,
  });
}

// ── 9. Build TripMeta ───────────────────────────────────────

const tripMeta: TripMeta = {
  title,
  subtitle: subtitleText,
  overview: overviewText,
  dates,
  duration,
  flights: {
    airline,
    confirmation: flightConfirmation,
    outbound,
    return: returnFlight,
  },
  dailySchedule,
  lodgingConfirmations,
};

// ════════════════════════════════════════════════════════════
// LOCATIONS.JSON SYNC
// ════════════════════════════════════════════════════════════

// Collect all (locationId, dayNum, date, segmentId) references from the itinerary
const locationRefs = new Map<
  string,
  Set<string>
>(); // id → Set of "day|date|segment"

for (const day of tripDays) {
  for (const act of day.activities) {
    for (const locId of act.locationIds) {
      if (!locationRefs.has(locId)) locationRefs.set(locId, new Set());
      locationRefs
        .get(locId)!
        .add(`${day.day}|${day.date}|${day.segmentId}`);
    }
  }
}

// Regenerate trip_parts for every location
const locIndex = new Map<string, Location>();
for (const loc of locations) locIndex.set(loc.id, loc);

// Update trip_parts for referenced locations
for (const [locId, refs] of locationRefs) {
  const loc = locIndex.get(locId);
  if (loc) {
    loc.trip_parts = [...refs]
      .map((ref) => {
        const [d, dt, seg] = ref.split('|');
        return { day: Number(d), date: dt!, segment_id: seg! };
      })
      .sort((a, b) => a.day - b.day);
  } else {
    // Stub: new location mentioned in markdown but not in locations.json
    const stub: Location = {
      id: locId,
      name: locId.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      address: '',
      geo: { lat: 0, lng: 0 },
      type: 'attraction',
      notes: '',
      images: [],
      official_url: [],
      google_maps_url: [],
      review_url: [],
      trip_parts: [...refs]
        .map((ref) => {
          const [d, dt, seg] = ref.split('|');
          return { day: Number(d), date: dt!, segment_id: seg! };
        })
        .sort((a, b) => a.day - b.day),
    };
    locations.push(stub);
    locIndex.set(locId, stub);
    console.warn(`⚠  Stub created for new location: "${locId}" — enrich in locations.json`);
  }
}

// Clear trip_parts for locations NOT referenced in the itinerary
for (const loc of locations) {
  if (!locationRefs.has(loc.id)) {
    if (loc.trip_parts.length > 0) {
      console.warn(
        `⚠  Orphaned location (trip_parts cleared): "${loc.name}" (${loc.id})`,
      );
      loc.trip_parts = [];
    }
  }
}

// ════════════════════════════════════════════════════════════
// WRITE OUTPUT FILES
// ════════════════════════════════════════════════════════════

const HEADER = '// AUTO-GENERATED by scripts/generate-data.ts — do not edit.\n// Run `pnpm generate` to regenerate from full-trip.md.\n\n';

// ── itinerary.generated.ts ──────────────────────────────────

const itinOutput =
  HEADER +
  `import type { TripDay } from './types';\n\n` +
  `export const itinerary: TripDay[] = ${JSON.stringify(tripDays, null, 2)};\n`;

fs.writeFileSync(path.join(DATA_DIR, 'itinerary.generated.ts'), itinOutput);

// ── trip-meta.generated.ts ──────────────────────────────────

const metaOutput =
  HEADER +
  `import type { TripMeta } from './types';\n\n` +
  `export const tripMeta: TripMeta = ${JSON.stringify(tripMeta, null, 2)};\n`;

fs.writeFileSync(path.join(DATA_DIR, 'trip-meta.generated.ts'), metaOutput);

// ── locations.json (sync trip_parts) ────────────────────────

fs.writeFileSync(
  LOCATIONS_PATH,
  JSON.stringify({ locations }, null, 2) + '\n',
);

// ── Summary ─────────────────────────────────────────────────

console.log(`✓ Generated itinerary.generated.ts — ${tripDays.length} days, ${tripDays.reduce((s, d) => s + d.activities.length, 0)} activities`);
console.log(`✓ Generated trip-meta.generated.ts — ${dailySchedule.length} schedule rows, ${lodgingConfirmations.length} lodging entries`);
console.log(`✓ Synced locations.json — ${locations.length} locations`);

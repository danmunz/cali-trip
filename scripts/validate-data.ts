#!/usr/bin/env tsx
/**
 * validate-data.ts — Basic validation of generated data files
 * 
 * Run via: pnpm validate (or tsx scripts/validate-data.ts)
 * 
 * Checks:
 * - Generated files exist
 * - Data can be imported and parsed
 * - Basic structural integrity
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'src', 'data');

let errors = 0;

function check(condition: boolean, message: string) {
  if (!condition) {
    console.error(`✗ ${message}`);
    errors++;
  } else {
    console.log(`✓ ${message}`);
  }
}

// Check generated files exist
const itineraryPath = path.join(DATA_DIR, 'itinerary.generated.ts');
const tripMetaPath = path.join(DATA_DIR, 'trip-meta.generated.ts');

check(fs.existsSync(itineraryPath), 'itinerary.generated.ts exists');
check(fs.existsSync(tripMetaPath), 'trip-meta.generated.ts exists');

// Try to import generated data (this will fail if there are syntax/type errors)
try {
  // Use dynamic import for ESM
  const { itinerary } = await import('../src/data/itinerary.generated.js');
  check(Array.isArray(itinerary), 'itinerary is an array');
  check(itinerary.length > 0, `itinerary has ${itinerary.length} days`);
  
  // Check first day structure
  const firstDay = itinerary[0];
  check(typeof firstDay?.day === 'number', 'day has numeric day field');
  check(typeof firstDay?.date === 'string', 'day has date string');
  check(Array.isArray(firstDay?.activities), 'day has activities array');
  
  console.log(`  → ${itinerary.length} days, ${itinerary.reduce((sum: number, d: any) => sum + d.activities.length, 0)} activities`);
} catch (error) {
  console.error('✗ Failed to import itinerary.generated.ts:', error);
  errors++;
}

try {
  const { tripMeta } = await import('../src/data/trip-meta.generated.js');
  check(typeof tripMeta === 'object', 'tripMeta is an object');
  check(typeof tripMeta?.title === 'string', 'tripMeta has title');
  check(Array.isArray(tripMeta?.dailySchedule), 'tripMeta has dailySchedule');
  check(typeof tripMeta?.flights === 'object', 'tripMeta has flights object');
  
  console.log(`  → "${tripMeta.title}"`);
  console.log(`  → ${tripMeta.dailySchedule.length} schedule rows`);
} catch (error) {
  console.error('✗ Failed to import trip-meta.generated.ts:', error);
  errors++;
}

// Summary
console.log('');
if (errors === 0) {
  console.log('✓ All validation checks passed');
  process.exit(0);
} else {
  console.error(`✗ ${errors} validation error(s) found`);
  process.exit(1);
}

// Hand-maintained display config for drive route pages.
// These are design choices (colors, images, labels) — not generated from the markdown.

import type { RoadStop } from './types';
import napaToYosemiteStops from './yountville_to_yosemite_stops.json';
import yosemiteToCarmelStops from './groveland_to_carmel_stops.json';

export interface DriveConfig {
  id: string;
  title: string;
  subtitle: string;
  color: string;
  heroImage: string;
  stops: RoadStop[];
}

export const drives: Record<string, DriveConfig> = {
  'napa-to-yosemite': {
    id: 'napa-to-yosemite',
    title: 'Napa → Yosemite',
    subtitle: 'Wine country to the Sierra Nevada — stops, provisions & detours along the way',
    color: '#b8956d',
    heroImage:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=2160',
    stops: napaToYosemiteStops as RoadStop[],
  },
  'yosemite-to-carmel': {
    id: 'yosemite-to-carmel',
    title: 'Yosemite → Carmel',
    subtitle: 'Sierra foothills to the Pacific coast — a full day of Gold Rush towns & garlic',
    color: '#5a8a6f',
    heroImage:
      'https://images.unsplash.com/photo-1518098268026-4e89f1a2cd8e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=2160',
    stops: yosemiteToCarmelStops as RoadStop[],
  },
} as const;

export type DriveId = keyof typeof drives;

// Hand-maintained display config for itinerary segments.
// These are design choices (colors, images, prose) — not generated from the markdown.

const bgImages = {
  arrival:
    'https://images.unsplash.com/photo-1587582534064-eb80e0ffdaa1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080',
  napa: 'https://images.unsplash.com/photo-1701623785014-181cda1bcc37?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXBhJTIwdmFsbGV5JTIwdmluZXlhcmQlMjByb3dzJTIwc3Vuc2V0JTIwYWVyaWFsfGVufDF8fHx8MTc3MTE2MjAyMnww&ixlib=rb-4.1.0&q=80&w=1080',
  yosemite:
    'https://images.unsplash.com/photo-1571047772429-47fafc26d064?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3NlbWl0ZSUyMGhhbGYlMjBkb21lJTIwdmFsbGV5JTIwZ3Jhbml0ZXxlbnwxfHx8fDE3NzExNjIwMjJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
  carmel:
    'https://images.unsplash.com/photo-1747334142570-f2af433f40a0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiaWclMjBzdXIlMjBoaWdod2F5JTIwMSUyMGNvYXN0YWwlMjBjbGlmZnMlMjBwYWNpZmljfGVufDF8fHx8MTc3MTE2MjAyM3ww&ixlib=rb-4.1.0&q=80&w=1080',
};

export const segments = {
  arrival: {
    navLabel: 'Arrival + Muir Woods',
    title: 'Arrival + Muir Woods',
    subtitle: 'SFO & Coastal Redwoods',
    color: '#8b6e5a',
    bgImage: bgImages.arrival,
    description:
      'Touch down in Northern California and drive straight into the ancient redwoods of Muir Woods—one of the last old-growth coastal groves on earth. A gentle first afternoon under the canopy before settling into wine country.',
    center: [-122.48, 37.76] as [number, number],
    zoom: 10,
  },
  napa: {
    navLabel: 'Napa & Sonoma',
    title: 'Napa & Sonoma',
    subtitle: "California's Food & Wine Bounty",
    color: '#b8956d',
    bgImage: bgImages.napa,
    description:
      'Golden hills, endless vine rows, warm evenings. The Napa Valley unfolds in layers—wine, food, light. This is California at its most refined.',
    center: [-122.360126, 38.399828] as [number, number],
    zoom: 11,
  },
  yosemite: {
    navLabel: 'Yosemite',
    title: 'Yosemite',
    subtitle: 'Sierra Nevada Mountains',
    color: '#5a8a6f',
    bgImage: bgImages.yosemite,
    description:
      'Glacial valleys. Sheer granite faces carved by ancient ice. Waterfalls thundering through the Sierra Nevada. The scale humbles everything human.',
    center: [-119.538329, 37.8651] as [number, number],
    zoom: 10,
  },
  carmel: {
    navLabel: 'Carmel + Big Sur',
    title: 'Monterey & Carmel',
    subtitle: 'Big Sur Coast',
    color: '#4a7c8e',
    bgImage: bgImages.carmel,
    description:
      'Highway 1 clings to the edge of the continent. Cliffs drop into the Pacific. Waves crash white against dark rocks. This is Big Sur—wild, raw, eternal.',
    center: [-121.9376, 36.501859] as [number, number],
    zoom: 11,
  },
} as const;

export type SegmentId = keyof typeof segments;

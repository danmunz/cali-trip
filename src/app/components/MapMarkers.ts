import mapboxgl from 'mapbox-gl';
import { segments, type SegmentId } from '../../data/segments';
import type { Location } from '../../data/types';

// ── SVG pin builder ──────────────────────────────────────────

/** Inline SVG icon paths by location type. */
const typeIcons: Record<string, string> = {
  // Fork & knife
  restaurant: `<path d="M7 2v6.5L9 10v8h2V10l2-1.5V2h-1v5h-1V2h-1v5h-1V2H7z" fill="#fff" fill-opacity="0.9"/>`,
  // House
  lodging: `<path d="M10 3L4 8v8h4v-5h4v5h4V8l-6-5z" fill="#fff" fill-opacity="0.9"/>`,
  // Tree
  park: `<path d="M10 2L5 9h3l-2 4h3v5h2v-5h3l-2-4h3L10 2z" fill="#fff" fill-opacity="0.9"/>`,
  trailhead: `<path d="M10 2L5 9h3l-2 4h3v5h2v-5h3l-2-4h3L10 2z" fill="#fff" fill-opacity="0.9"/>`,
  // Binoculars / viewpoint (simple eye)
  attraction: `<circle cx="10" cy="10" r="3" fill="#fff" fill-opacity="0.9"/><circle cx="10" cy="10" r="1.2" fill="currentColor" opacity="0.4"/>`,
  // Plane
  airport: `<path d="M10 3l-2 6H4l-1 1.5L8 13v4l-1.5 1H10h3.5L12 17v-4l5-2.5L16 9h-4l-2-6z" fill="#fff" fill-opacity="0.9"/>`,
};

function buildPinSvg(color: string, type: string): string {
  const icon = typeIcons[type] ?? typeIcons.attraction!;
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="44" viewBox="0 0 32 44">
      <defs>
        <filter id="s" x="-20%" y="-10%" width="140%" height="130%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-color="#000" flood-opacity="0.3"/>
        </filter>
      </defs>
      <g filter="url(#s)">
        <path d="M16 42C16 42 28 26 28 16A12 12 0 0 0 4 16C4 26 16 42 16 42Z"
              fill="${color}" stroke="#fff" stroke-width="1.5"/>
        <g transform="translate(6 5)">
          ${icon}
        </g>
      </g>
    </svg>`;
}

// ── Tooltip element builder ──────────────────────────────────

function buildTooltip(name: string, type: string): HTMLDivElement {
  const el = document.createElement('div');
  el.className = 'map-marker-tooltip';
  el.innerHTML = `
    <div style="
      position: absolute;
      bottom: calc(100% + 8px);
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0,0,0,0.85);
      color: #fff;
      padding: 6px 10px;
      border-radius: 6px;
      font-size: 12px;
      font-family: 'Helvetica Neue', sans-serif;
      white-space: nowrap;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.15s;
      z-index: 10;
    ">
      <div style="font-weight:600">${name}</div>
      <div style="font-size:10px;opacity:0.7;text-transform:capitalize">${type}</div>
    </div>`;
  return el;
}

// ── Public API ────────────────────────────────────────────────

const STAGGER_MS = 60;

export function createMarkers(
  map: mapboxgl.Map,
  locations: Location[],
  segmentId: SegmentId,
  onClick: (loc: Location) => void,
): mapboxgl.Marker[] {
  const color = segments[segmentId].color;
  const markers: mapboxgl.Marker[] = [];

  locations.forEach((loc, i) => {
    // Skip locations with (0,0) — stubs
    if (loc.geo.lat === 0 && loc.geo.lng === 0) return;

    const el = document.createElement('div');
    el.style.cursor = 'pointer';
    el.style.position = 'relative';
    el.style.width = '32px';
    el.style.height = '44px';
    el.style.opacity = '0';
    el.style.transform = 'translateY(-12px)';
    el.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    el.innerHTML = buildPinSvg(color, loc.type);

    // Tooltip
    const tooltip = buildTooltip(loc.name, loc.type);
    el.appendChild(tooltip);

    el.addEventListener('mouseenter', () => {
      const tip = tooltip.firstElementChild as HTMLElement;
      if (tip) tip.style.opacity = '1';
    });
    el.addEventListener('mouseleave', () => {
      const tip = tooltip.firstElementChild as HTMLElement;
      if (tip) tip.style.opacity = '0';
    });

    el.addEventListener('click', (e) => {
      e.stopPropagation();
      onClick(loc);
    });

    const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
      .setLngLat([loc.geo.lng, loc.geo.lat])
      .addTo(map);

    // Staggered drop-in animation
    setTimeout(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, i * STAGGER_MS);

    markers.push(marker);
  });

  return markers;
}

export function removeAllMarkers(markers: mapboxgl.Marker[]): void {
  for (const m of markers) m.remove();
}

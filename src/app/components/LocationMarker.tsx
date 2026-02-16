import { useState } from 'react';
import { Marker } from 'react-map-gl/mapbox';
import type { Location } from '../../data/types';

const TYPE_LABELS: Record<string, string> = {
  airport: 'Airport',
  lodging: 'Lodging',
  restaurant: 'Restaurant',
  park: 'Park',
  attraction: 'Attraction',
  trailhead: 'Trail',
};

/** Muted, editorial palette — low saturation, cohesive value range. */
const TYPE_COLORS: Record<string, string> = {
  airport: '#7c8794',   // cool steel
  lodging: '#957f6e',   // warm sandstone
  restaurant: '#a8806e', // dusty copper
  park: '#6d8e7b',      // sage
  attraction: '#8e7f9a', // dusty lavender
  trailhead: '#728f80', // eucalyptus
};

const DEFAULT_PIN_COLOR = '#7c8490';

interface LocationMarkerProps {
  location: Location;
  color: string;
  isSelected?: boolean;
  /** Scroll-driven or hover-driven highlight from the itinerary text. */
  isFocused?: boolean;
  /** True when another pin is focused and this one should recede. */
  isDimmed?: boolean;
  onClick: () => void;
  onHover?: (hovering: boolean) => void;
}

export default function LocationMarker({
  location,
  color: _segmentColor,
  isSelected = false,
  isFocused = false,
  isDimmed = false,
  onClick,
  onHover,
}: LocationMarkerProps) {
  const [isHovered, setIsHovered] = useState(false);
  const typeLabel = TYPE_LABELS[location.type] || location.type;
  const pinColor = TYPE_COLORS[location.type] ?? DEFAULT_PIN_COLOR;

  const highlighted = isSelected || isFocused || isHovered;
  // Only show tooltip text on direct hover or selection, not passive scroll focus
  const showLabel = isSelected || isHovered;

  // ── Visual tiers ─────────────────────────────────────────

  // Scale jumps: selected bounces up big, hover/focus lifts noticeably
  const scale = isSelected ? 1.5 : highlighted ? 1.3 : 1;

  // Shadow intensity ramps with engagement
  const filter = isSelected
    ? `drop-shadow(0 0 16px ${pinColor}) drop-shadow(0 0 6px ${pinColor})`
    : highlighted
      ? `drop-shadow(0 0 10px ${pinColor})`
      : `drop-shadow(0 1px 3px rgba(0,0,0,0.35))`;

  // Opacity: dimmed pins recede
  const opacity = isDimmed ? 0.35 : 1;

  return (
    <Marker
      longitude={location.geo.lng}
      latitude={location.geo.lat}
      anchor="center"
      style={{ zIndex: highlighted ? 10 : 1 }}
      onClick={(e) => {
        e.originalEvent.stopPropagation();
        onClick();
      }}
    >
      <button
        className="relative group cursor-pointer focus:outline-none"
        onMouseEnter={() => {
          setIsHovered(true);
          onHover?.(true);
        }}
        onMouseLeave={() => {
          setIsHovered(false);
          onHover?.(false);
        }}
        aria-label={`${location.name} – ${typeLabel}`}
        style={{ opacity, transition: 'opacity 0.3s ease' }}
      >
        {/* Pulse ring behind dot when selected */}
        {isSelected && (
          <span
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full animate-ping"
            style={{ backgroundColor: pinColor, opacity: 0.25 }}
          />
        )}

        {/* Clean circle dot — modern and minimal */}
        <svg
          className="relative z-10"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          style={{
            filter,
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
            transition: 'transform 0.3s cubic-bezier(.34,1.56,.64,1), filter 0.3s ease',
          }}
        >
          <circle cx="12" cy="12" r="10" fill={pinColor} stroke="white" strokeWidth="2" />
        </svg>

        {/* Tooltip on hover / focused / selected */}
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none"
          style={{
            opacity: showLabel ? 1 : 0,
            transform: showLabel ? 'translateY(0)' : 'translateY(4px)',
            transition: 'opacity 0.2s ease, transform 0.2s ease',
          }}
        >
          <div className="bg-black/90 backdrop-blur-sm px-3.5 py-2 rounded-lg shadow-xl whitespace-nowrap">
            <p className="text-white text-[13px] font-semibold leading-tight">
              {location.name}
            </p>
            <p className="text-white/55 text-[10px] capitalize mt-0.5">
              {typeLabel}
            </p>
          </div>
        </div>
      </button>
    </Marker>
  );
}

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
  color,
  isSelected = false,
  isFocused = false,
  isDimmed = false,
  onClick,
  onHover,
}: LocationMarkerProps) {
  const [isHovered, setIsHovered] = useState(false);
  const typeLabel = TYPE_LABELS[location.type] || location.type;

  const highlighted = isSelected || isFocused || isHovered;
  const showLabel = highlighted;

  // Scale: selected > focused/hovered > normal
  const scale = isSelected
    ? 'scale-125'
    : highlighted
      ? 'scale-110'
      : 'scale-100';

  // Shadow: selected gets strong glow, focused gets soft glow, default is drop shadow
  const filter = isSelected
    ? `drop-shadow(0 0 12px ${color})`
    : isFocused
      ? `drop-shadow(0 0 8px ${color})`
      : `drop-shadow(0 2px 6px rgba(0,0,0,0.35))`;

  // Opacity: dimmed pins recede
  const opacity = isDimmed ? 0.4 : 1;

  return (
    <Marker
      longitude={location.geo.lng}
      latitude={location.geo.lat}
      anchor="bottom"
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
        {/* Pin SVG */}
        <svg
          className={`relative z-10 transition-all duration-300 ${scale}`}
          width="32"
          height="44"
          viewBox="0 0 32 44"
          style={{ filter }}
        >
          <path
            d="M16 0C9.373 0 4 5.373 4 12c0 9 12 30 12 30s12-21 12-30C28 5.373 22.627 0 16 0z"
            fill={color}
          />
          <circle cx="16" cy="12" r="5" fill="white" fillOpacity="0.9" />
        </svg>

        {/* Tooltip on hover / focused / selected */}
        <div
          className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 transition-opacity duration-200 pointer-events-none ${
            showLabel ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="bg-black/85 backdrop-blur-sm px-3 py-1.5 rounded-md shadow-lg whitespace-nowrap">
            <p className="text-white text-xs font-semibold">{location.name}</p>
            <p className="text-white/60 text-[10px] capitalize">{typeLabel}</p>
          </div>
        </div>
      </button>
    </Marker>
  );
}

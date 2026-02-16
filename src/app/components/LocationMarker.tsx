import { useState } from 'react';
import { Marker } from 'react-map-gl/mapbox';
import { ExternalLink, MapPin, Star } from 'lucide-react';
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

/** Turn trip_parts day numbers into a friendly label: "Day 3" or "Days 4–6". */
function formatDays(tripParts: { day: number }[]): string {
  const days = [...new Set(tripParts.map((tp) => tp.day))].sort((a, b) => a - b);
  if (days.length === 0) return '';
  if (days.length === 1) return `Day ${days[0]}`;
  return `Days ${days[0]}–${days[days.length - 1]}`;
}

/** Trim an address to city + state, dropping the street line. */
function shortAddress(address: string): string {
  const parts = address.split(',').map((s) => s.trim());
  if (parts.length >= 3) {
    const state = parts[parts.length - 1]!.replace(/\d{5}(-\d{4})?/, '').trim();
    return `${parts[parts.length - 2]}, ${state}`;
  }
  return address;
}

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

  // Name-only tooltip: hover or scroll-focus, but NOT when selected (full tooltip shows instead)
  const showNameTooltip = !isSelected && (isHovered || isFocused);
  // Full rich tooltip: only when selected (pin click)
  const showFullTooltip = isSelected;

  // ── Visual tiers ─────────────────────────────────────────

  // Scale jumps: selected bounces up big, hover/focus lifts noticeably
  const scale = isSelected ? 2.0 : highlighted ? 1.5 : 1;

  // Shadow intensity ramps with engagement
  const filter = isSelected
    ? `drop-shadow(0 0 16px ${pinColor}) drop-shadow(0 0 6px ${pinColor})`
    : highlighted
      ? `drop-shadow(0 0 10px ${pinColor})`
      : `drop-shadow(0 1px 3px rgba(0,0,0,0.35))`;

  // Opacity: dimmed pins recede
  const opacity = isDimmed ? 0.35 : 1;

  // ── Links ────────────────────────────────────────────────

  const websiteUrl = location.official_url?.[0];
  const mapsUrl = location.google_maps_url?.[0];
  const reviewUrl = location.review_url?.[0];

  return (
    <Marker
      longitude={location.geo.lng}
      latitude={location.geo.lat}
      anchor="center"
      style={{ zIndex: isSelected ? 20 : highlighted ? 10 : 1 }}
      onClick={(e) => {
        e.originalEvent.stopPropagation();
        onClick();
      }}
    >
      <div
        className="relative group cursor-pointer"
        onMouseEnter={() => {
          setIsHovered(true);
          onHover?.(true);
        }}
        onMouseLeave={() => {
          setIsHovered(false);
          onHover?.(false);
        }}
        role="button"
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

        {/* ── Name-only tooltip (Region Overview mode) ──────── */}
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none"
          style={{
            opacity: showNameTooltip ? 1 : 0,
            transform: showNameTooltip ? 'translateY(0)' : 'translateY(4px)',
            transition: 'opacity 0.2s ease, transform 0.2s ease',
          }}
        >
          <div className="bg-black/90 backdrop-blur-sm px-3.5 py-2 rounded-lg shadow-xl whitespace-nowrap">
            <p className="text-white text-[13px] font-semibold leading-tight">
              {location.name}
            </p>
          </div>
        </div>

        {/* ── Full rich tooltip (Pin Focus mode) ────────────── */}
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4"
          style={{
            opacity: showFullTooltip ? 1 : 0,
            transform: showFullTooltip ? 'translateY(0)' : 'translateY(6px)',
            transition: 'opacity 0.2s ease, transform 0.2s ease',
            pointerEvents: showFullTooltip ? 'auto' : 'none',
            width: 390,
          }}
        >
          <div className="bg-black/95 backdrop-blur-md rounded-xl shadow-2xl overflow-hidden border border-white/10">
            {/* Photo strip */}
            {location.images.length > 0 && (
              <div className="flex h-[150px] overflow-hidden">
                {location.images.slice(0, 3).map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt=""
                    className="object-cover flex-1 min-w-0"
                    loading="lazy"
                  />
                ))}
              </div>
            )}

            {/* Body */}
            <div className="px-5 py-4">
              {/* Name + type badge */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="text-white text-lg font-semibold leading-snug">
                  {location.name}
                </p>
                <span
                  className="shrink-0 text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: pinColor + '25',
                    color: pinColor,
                  }}
                >
                  {typeLabel}
                </span>
              </div>

              {/* Address */}
              <p className="text-white/50 text-sm leading-tight mb-2">
                {shortAddress(location.address)}
              </p>

              {/* Visit days */}
              {location.trip_parts.length > 0 && (
                <p className="text-white/40 text-[13px] mb-3">
                  {formatDays(location.trip_parts)}
                </p>
              )}

              {/* Links row */}
              {(websiteUrl || mapsUrl || reviewUrl) && (
                <div className="flex items-center gap-4 pt-3 border-t border-white/10">
                  {websiteUrl && (
                    <a
                      href={websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-[13px] text-white/50 hover:text-white transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="w-4 h-4" />
                      Website
                    </a>
                  )}
                  {mapsUrl && (
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-[13px] text-white/50 hover:text-white transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MapPin className="w-4 h-4" />
                      Directions
                    </a>
                  )}
                  {reviewUrl && (
                    <a
                      href={reviewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-[13px] text-white/50 hover:text-white transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Star className="w-4 h-4" />
                      Reviews
                    </a>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </Marker>
  );
}

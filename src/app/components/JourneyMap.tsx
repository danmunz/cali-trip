import { useRef, useEffect, useCallback, useState } from 'react';
import Map, { type MapRef } from 'react-map-gl/mapbox';
import { LngLatBounds } from 'mapbox-gl';
import { ZoomOut } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';

import LocationMarker from './LocationMarker';
import { segments, type SegmentId } from '../../data/segments';
import locationsData from '../../data/locations.json';
import type { Location } from '../../data/types';

const allLocations = locationsData.locations as Location[];

const MAPBOX_STYLE = 'mapbox://styles/danmunz/cmkuhcg15003m01pa76iy0g4v';

/**
 * Max distance (degrees) a location can be from a segment's center to
 * receive a pin on that segment's map view. Prevents locations that
 * appear in a segment for scheduling reasons (e.g. Rush Creek Lodge
 * on the carmel departure day) from dropping a pin far off-screen.
 */
const GEO_RADIUS_DEG = 1.5;

/** Padding (px) inside the map viewport so pins aren't flush to the edge. */
const BOUNDS_PADDING = { top: 60, bottom: 60, left: 40, right: 40 };

/** Filter locations for a segment, enforcing geographic proximity. */
function getLocationsForSegment(segmentId: SegmentId): Location[] {
  const [cLng, cLat] = segments[segmentId].center;
  return allLocations.filter((loc) => {
    if (!loc.trip_parts.some((tp) => tp.segment_id === segmentId)) return false;
    if (loc.geo.lat === 0 && loc.geo.lng === 0) return false;
    return (
      Math.abs(loc.geo.lat - cLat) <= GEO_RADIUS_DEG &&
      Math.abs(loc.geo.lng - cLng) <= GEO_RADIUS_DEG
    );
  });
}

/** Compute a LngLatBounds that encompasses every location in the list. */
function calculateBounds(locations: Location[]): LngLatBounds | null {
  if (locations.length === 0) return null;
  const bounds = new LngLatBounds();
  for (const loc of locations) {
    bounds.extend([loc.geo.lng, loc.geo.lat]);
  }
  return bounds;
}

interface JourneyMapProps {
  activeSegment: SegmentId;
  /** Location IDs highlighted by scroll position (activity in viewport). */
  focusedLocationIds?: string[];
  /** Location IDs highlighted by text hover. */
  hoveredLocationIds?: string[];
  onLocationSelect?: (location: Location | null) => void;
  /** Called when user hovers/unhovers a map pin. */
  onMarkerHover?: (locationId: string | null) => void;
}

export default function JourneyMap({
  activeSegment,
  focusedLocationIds = [],
  hoveredLocationIds = [],
  onLocationSelect,
  onMarkerHover,
}: JourneyMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const prevSegmentRef = useRef<SegmentId>(activeSegment);

  const zoneLocations = getLocationsForSegment(activeSegment);
  const seg = segments[activeSegment];

  // Union of all "highlighted" location IDs (scroll focus + hover + selected)
  const highlightedIds = new Set([
    ...focusedLocationIds,
    ...hoveredLocationIds,
    ...(selectedId ? [selectedId] : []),
  ]);
  // Whether *any* pin is currently highlighted — used to dim the rest
  const anyHighlighted = highlightedIds.size > 0;

  // ── Fit map to all locations in a segment ────────────────

  const fitToSegment = useCallback(
    (segmentId: SegmentId, animate = true) => {
      const map = mapRef.current;
      if (!map) return;
      const locs = getLocationsForSegment(segmentId);
      const bounds = calculateBounds(locs);
      if (!bounds) return;
      setSelectedId(null);
      map.fitBounds(bounds, {
        padding: BOUNDS_PADDING,
        maxZoom: 13,
        duration: animate ? 2500 : 0,
      });
    },
    [],
  );

  // ── Fly to a single location ─────────────────────────────

  const flyToLocation = useCallback((loc: Location) => {
    const map = mapRef.current;
    if (!map) return;
    map.flyTo({
      center: [loc.geo.lng, loc.geo.lat],
      zoom: 14,
      duration: 1500,
      essential: true,
    });
  }, []);

  // ── Handle map load — jump to initial segment ────────────

  const handleMapLoad = useCallback(() => {
    setIsMapLoaded(true);
    // Immediately fit to the active segment (no animation on first load)
    setTimeout(() => fitToSegment(activeSegment, false), 50);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitToSegment]);

  // ── React to segment changes ─────────────────────────────

  useEffect(() => {
    if (!isMapLoaded) return;
    if (activeSegment !== prevSegmentRef.current) {
      prevSegmentRef.current = activeSegment;
      fitToSegment(activeSegment);
    }
  }, [activeSegment, isMapLoaded, fitToSegment]);

  // ── Render ───────────────────────────────────────────────

  const token = import.meta.env.VITE_MAPBOX_TOKEN;
  if (!token) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-stone-100 text-stone-400 text-sm">
        Map disabled — VITE_MAPBOX_TOKEN not set
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <Map
        ref={mapRef}
        mapboxAccessToken={token}
        initialViewState={{
          longitude: seg.center[0],
          latitude: seg.center[1],
          zoom: seg.zoom,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle={MAPBOX_STYLE}
        onLoad={handleMapLoad}
        scrollZoom={false}
        boxZoom={false}
        dragRotate={false}
        dragPan={false}
        keyboard={false}
        doubleClickZoom={false}
        touchZoomRotate={false}
        touchPitch={false}
        attributionControl={false}
      >
        {zoneLocations.map((location) => (
          <LocationMarker
            key={location.id}
            location={location}
            color={seg.color}
            isSelected={selectedId === location.id}
            isFocused={
              !selectedId &&
              (focusedLocationIds.includes(location.id) ||
                hoveredLocationIds.includes(location.id))
            }
            isDimmed={anyHighlighted && !highlightedIds.has(location.id)}
            onClick={() => {
              setSelectedId(location.id);
              flyToLocation(location);
              onLocationSelect?.(location);
            }}
            onHover={(hovering) =>
              onMarkerHover?.(hovering ? location.id : null)
            }
          />
        ))}
      </Map>

      {/* Zoom-out button — visible when focused on a single location */}
      {selectedId && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
          <button
            onClick={() => fitToSegment(activeSegment)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/90 backdrop-blur-sm shadow-lg text-sm font-medium text-gray-700 hover:bg-white transition-colors cursor-pointer"
          >
            <ZoomOut className="w-4 h-4" />
            Show all {seg.navLabel}
          </button>
        </div>
      )}
    </div>
  );
}

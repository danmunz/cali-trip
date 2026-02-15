import { useRef, useEffect, useCallback, useState } from 'react';
import Map, { type MapRef } from 'react-map-gl/mapbox';
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

interface JourneyMapProps {
  activeSegment: SegmentId;
  onLocationSelect?: (location: Location | null) => void;
}

export default function JourneyMap({
  activeSegment,
  onLocationSelect,
}: JourneyMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const prevSegmentRef = useRef<SegmentId>(activeSegment);

  const zoneLocations = getLocationsForSegment(activeSegment);
  const seg = segments[activeSegment];

  // ── Fly to segment center ────────────────────────────────

  const flyToSegment = useCallback((segmentId: SegmentId) => {
    const map = mapRef.current;
    if (!map) return;
    const s = segments[segmentId];
    map.flyTo({
      center: s.center,
      zoom: s.zoom,
      duration: 2500,
      essential: true,
    });
  }, []);

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

  // ── Handle map load ──────────────────────────────────────

  const handleMapLoad = useCallback(() => {
    setIsMapLoaded(true);
  }, []);

  // ── React to segment changes ─────────────────────────────

  useEffect(() => {
    if (!isMapLoaded) return;
    if (activeSegment !== prevSegmentRef.current) {
      prevSegmentRef.current = activeSegment;
      flyToSegment(activeSegment);
    }
  }, [activeSegment, isMapLoaded, flyToSegment]);

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
      interactive={false}
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
          onClick={() => {
            flyToLocation(location);
            onLocationSelect?.(location);
          }}
        />
      ))}
    </Map>
  );
}

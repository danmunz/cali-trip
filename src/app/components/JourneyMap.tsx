import { useEffect, useRef, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import { segments, type SegmentId } from '../../data/segments';
import { createMarkers, removeAllMarkers } from './MapMarkers';
import locationsData from '../../data/locations.json';
import type { Location } from '../../data/types';

const locations = locationsData.locations as Location[];

const MAPBOX_STYLE = 'mapbox://styles/danmunz/cmkuhcg15003m01pa76iy0g4v';

interface JourneyMapProps {
  activeSegment: SegmentId;
  onLocationSelect?: (location: Location | null) => void;
}

export default function JourneyMap({
  activeSegment,
  onLocationSelect,
}: JourneyMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const prevSegmentRef = useRef<SegmentId | null>(null);
  const selectedRef = useRef<Location | null>(null);

  // ── Helpers ──────────────────────────────────────────────

  const getLocationsForSegment = useCallback((segmentId: SegmentId) => {
    return locations.filter((loc) =>
      loc.trip_parts.some((tp) => tp.segment_id === segmentId),
    );
  }, []);

  const flyToSegment = useCallback((segmentId: SegmentId) => {
    const map = mapRef.current;
    if (!map) return;
    const seg = segments[segmentId];
    map.flyTo({
      center: seg.center,
      zoom: seg.zoom,
      duration: 2500,
      essential: true,
    });
  }, []);

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

  // ── Initialize map ───────────────────────────────────────

  useEffect(() => {
    if (!containerRef.current) return;

    const token = import.meta.env.VITE_MAPBOX_TOKEN;
    if (!token) {
      console.warn('VITE_MAPBOX_TOKEN not set — map disabled');
      return;
    }
    mapboxgl.accessToken = token;

    const seg = segments[activeSegment];
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: MAPBOX_STYLE,
      center: seg.center,
      zoom: seg.zoom,
      interactive: false,
      attributionControl: false,
      fadeDuration: 0,
    });

    mapRef.current = map;

    map.on('load', () => {
      // Drop initial markers
      const locs = getLocationsForSegment(activeSegment);
      markersRef.current = createMarkers(map, locs, activeSegment, (loc: Location) => {
        selectedRef.current = loc;
        flyToLocation(loc);
        onLocationSelect?.(loc);
      });
      prevSegmentRef.current = activeSegment;
    });

    return () => {
      removeAllMarkers(markersRef.current);
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── React to segment changes ─────────────────────────────

  useEffect(() => {
    const map = mapRef.current;
    if (!map || prevSegmentRef.current === activeSegment) return;

    // Clear any selection
    if (selectedRef.current) {
      selectedRef.current = null;
      onLocationSelect?.(null);
    }

    // Fly to new segment
    flyToSegment(activeSegment);

    // Swap markers
    removeAllMarkers(markersRef.current);
    markersRef.current = [];

    // Slight delay so the fly animation starts before markers appear
    const timer = setTimeout(() => {
      if (!mapRef.current) return;
      const locs = getLocationsForSegment(activeSegment);
      markersRef.current = createMarkers(
        mapRef.current,
        locs,
        activeSegment,
        (loc: Location) => {
          selectedRef.current = loc;
          flyToLocation(loc);
          onLocationSelect?.(loc);
        },
      );
    }, 800);

    prevSegmentRef.current = activeSegment;
    return () => clearTimeout(timer);
  }, [
    activeSegment,
    flyToSegment,
    flyToLocation,
    getLocationsForSegment,
    onLocationSelect,
  ]);

  // ── Render ───────────────────────────────────────────────

  return <div ref={containerRef} className="w-full h-full" />;
}

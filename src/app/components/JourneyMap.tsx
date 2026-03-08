import { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import Map, { type MapRef, Source, Layer } from 'react-map-gl/mapbox';
import { LngLatBounds } from 'mapbox-gl';
import { ChevronLeft, ChevronRight, MapIcon, Satellite, Map as MapLayers, ExternalLink, MapPin, Star } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';

import LocationMarker from './LocationMarker';
import { segments, type SegmentId } from '../../data/segments';
import locationsData from '../../data/locations.json';
import type { Location } from '../../data/types';

const allLocations = locationsData.locations as Location[];

const MAPBOX_STYLE = 'mapbox://styles/danmunz/cmkuhcg15003m01pa76iy0g4v';
const SATELLITE_STYLE = 'mapbox://styles/mapbox/satellite-streets-v12';

/**
 * Max distance (degrees) a location can be from a segment's center to
 * receive a pin on that segment's map view. Prevents locations that
 * appear in a segment for scheduling reasons (e.g. Rush Creek Lodge
 * on the carmel departure day) from dropping a pin far off-screen.
 */
const GEO_RADIUS_DEG = 1.5;

/** Padding (px) inside the map viewport so pins aren't flush to the edge. */
const BOUNDS_PADDING = { top: 140, bottom: 60, left: 40, right: 40 };

const MAP_PITCH = 72;
const MAP_BEARING = -10;
/** Lower pitch when zoomed to a single pin — avoids terrain occluding valley-floor markers. */
const PIN_FOCUS_PITCH = 75;

/**
 * Pin a location to a specific segment map, overriding its trip_parts.
 * SFO is referenced on Day 9 (carmel) for the departure drive, but should
 * only appear as a pin on the arrival segment — not the Carmel/Big Sur map.
 */
const MAP_SEGMENT_OVERRIDES: Record<string, SegmentId> = {
  'san-francisco-international-airport-sfo': 'arrival',
};

/** Filter locations for a segment, enforcing geographic proximity. */
function getLocationsForSegment(segmentId: SegmentId): Location[] {
  const [cLng, cLat] = segments[segmentId].center;
  return allLocations.filter((loc) => {
    if (loc.geo.lat === 0 && loc.geo.lng === 0) return false;

    // If overridden, show this location only on the designated segment
    const override = MAP_SEGMENT_OVERRIDES[loc.id];
    if (override) return override === segmentId;

    if (!loc.trip_parts.some((tp) => tp.segment_id === segmentId)) return false;
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
  /** Chronologically ordered, deduplicated location IDs for this segment. */
  orderedLocationIds: string[];
  /** Location IDs highlighted by text hover. */
  hoveredLocationIds?: string[];
  /** Single location ID the user has scrolled to (debounced) — drives pin emphasis in overview. */
  scrollFocusedLocationId?: string | null;
  /** Parent-driven Focus Mode entry: set to a location ID to zoom in and select it. */
  focusLocationId?: string | null;
  /** Called when user hovers/unhovers a map pin. */
  onMarkerHover?: (locationId: string | null) => void;
  /** Called when user clicks a map pin — used to scroll itinerary text. */
  onPinClick?: (locationId: string) => void;
  /** Called when Focus Mode is exited (map background click). */
  onExitFocus?: () => void;
}

export default function JourneyMap({
  activeSegment,
  orderedLocationIds,
  hoveredLocationIds = [],
  scrollFocusedLocationId,
  focusLocationId,
  onMarkerHover,
  onPinClick,
  onExitFocus,
}: JourneyMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isStyleReady, setIsStyleReady] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSatellite, setIsSatellite] = useState(true);
  const prevSegmentRef = useRef<SegmentId>(activeSegment);

  const zoneLocations = getLocationsForSegment(activeSegment);
  const seg = segments[activeSegment];

  // Compute padded bounds for the segment to constrain panning
  const segmentMaxBounds = useMemo(() => {
    const bounds = calculateBounds(zoneLocations);
    if (!bounds) return undefined;
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();
    const lngPad = (ne.lng - sw.lng) * 0.5;
    const latPad = (ne.lat - sw.lat) * 0.5;
    return [
      [sw.lng - lngPad, sw.lat - latPad],
      [ne.lng + lngPad, ne.lat + latPad],
    ] as [[number, number], [number, number]];
  }, [zoneLocations]);

  // Filter orderedLocationIds to only locations that have a pin on this segment map
  const zoneIds = new Set(zoneLocations.map((l) => l.id));
  const filteredOrderedIds = orderedLocationIds.filter((id) => zoneIds.has(id));

  // Union of all "highlighted" location IDs (scroll focus + hover + selected)
  const highlightedIds = new Set([
    ...hoveredLocationIds,
    ...(scrollFocusedLocationId ? [scrollFocusedLocationId] : []),
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
        maxZoom: 11,
        pitch: MAP_PITCH,
        bearing: MAP_BEARING,
        duration: animate ? 2500 : 0,
      });
    },
    [],
  );

  // ── Fly to a single location ─────────────────────────────

  const flyToLocation = useCallback((loc: Location) => {
    const map = mapRef.current;
    if (!map) return;
    // On desktop (>=1024px), the left ~38% is covered by the itinerary panel.
    // Offset the pin so it centers in the *visible* portion of the map.
    const container = map.getContainer();
    const w = container.clientWidth;
    const isDesktop = window.innerWidth >= 1024;
    // Panel is ~38% (or 1/3 on xl) — shift right by half the panel width
    const panelOffset = isDesktop ? Math.round(w * 0.38 * 0.5) : 0;
    map.flyTo({
      center: [loc.geo.lng, loc.geo.lat],
      zoom: 15,
      pitch: PIN_FOCUS_PITCH,
      bearing: MAP_BEARING,
      offset: [panelOffset, 60],
      duration: 1500,
      essential: true,
    });
  }, []);

  // ── Handle map load — jump to initial segment ────────────

  const handleMapLoad = useCallback(() => {
    setIsMapLoaded(true);
    setIsStyleReady(true);
    // Immediately fit to the active segment (no animation on first load)
    setTimeout(() => fitToSegment(activeSegment, false), 50);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitToSegment]);

  // ── Track style changes (toggling satellite/map) ─────────

  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;
    const onStyleData = () => setIsStyleReady(true);
    // style.load fires after each setStyle completes
    map.on('style.load', onStyleData);
    return () => { map.off('style.load', onStyleData); };
  }, [isMapLoaded]);

  // ── React to segment changes ─────────────────────────────

  useEffect(() => {
    if (!isMapLoaded) return;
    if (activeSegment !== prevSegmentRef.current) {
      prevSegmentRef.current = activeSegment;
      setSelectedId(null);
      fitToSegment(activeSegment);
    }
  }, [activeSegment, isMapLoaded, fitToSegment]);

  // ── Focus Mode: scroll-driven camera tracking ────────────
  // When a pin is selected (Focus Mode) and the user scrolls to a
  // different activity, wait for scrolling to settle before flying to
  // the new location. This prevents overlapping fly-to animations when
  // the user scrolls quickly through many activities.

  const scrollFlyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Clean up any pending fly-to when deps change
    if (scrollFlyTimerRef.current) {
      clearTimeout(scrollFlyTimerRef.current);
      scrollFlyTimerRef.current = null;
    }
    if (!selectedId || !scrollFocusedLocationId) return;
    if (scrollFocusedLocationId === selectedId) return;
    const targetId = scrollFocusedLocationId;
    scrollFlyTimerRef.current = setTimeout(() => {
      const loc = zoneLocations.find((l) => l.id === targetId);
      if (!loc) return;
      setSelectedId(targetId);
      flyToLocation(loc);
      onPinClick?.(targetId);
    }, 600);
    return () => {
      if (scrollFlyTimerRef.current) {
        clearTimeout(scrollFlyTimerRef.current);
        scrollFlyTimerRef.current = null;
      }
    };
  }, [scrollFocusedLocationId, selectedId, zoneLocations, flyToLocation, onPinClick]);

  // ── Parent-driven Focus Mode entry ─────────────────────
  // When the parent sets focusLocationId (e.g. activity card click),
  // enter Focus Mode by selecting the pin and flying to it.

  useEffect(() => {
    if (!focusLocationId) return;
    if (focusLocationId === selectedId) return;
    const loc = zoneLocations.find((l) => l.id === focusLocationId);
    if (!loc) return;
    setSelectedId(focusLocationId);
    flyToLocation(loc);
  }, [focusLocationId, selectedId, zoneLocations, flyToLocation]);

  // ── Navigate between pins (prev/next in tooltip) ─────────

  const navigateToPin = useCallback(
    (locationId: string) => {
      const loc = zoneLocations.find((l) => l.id === locationId);
      if (!loc) return;
      setSelectedId(locationId);
      flyToLocation(loc);
      onPinClick?.(locationId);
    },
    [zoneLocations, flyToLocation, onPinClick],
  );

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
          pitch: MAP_PITCH,
          bearing: MAP_BEARING,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle={isSatellite ? SATELLITE_STYLE : MAPBOX_STYLE}
        onLoad={handleMapLoad}
        minZoom={seg.zoom - 1}
        maxBounds={segmentMaxBounds}
        terrain={{ source: 'mapbox-dem', exaggeration: 1.2 }}
        fadeDuration={0}
        maxTileCacheSize={200}
        renderWorldCopies={false}
        onClick={(e) => {
          // Zoom out when clicking the map background (not a marker pin)
          const target = e.originalEvent.target as HTMLElement;
          if (!target.closest('.mapboxgl-marker') && selectedId) {
            fitToSegment(activeSegment);
            onExitFocus?.();
          }
        }}
        scrollZoom={true}
        boxZoom={false}
        dragRotate={false}
        dragPan={true}
        keyboard={false}
        doubleClickZoom={true}
        touchZoomRotate={true}
        touchPitch={false}
        attributionControl={false}
      >
        {isStyleReady && (
          <>
            <Source
              id="mapbox-dem"
              type="raster-dem"
              url="mapbox://mapbox.mapbox-terrain-dem-v1"
              tileSize={512}
              maxzoom={12}
            />
            <Layer
              id="sky"
              type="sky"
              paint={{
                'sky-type': 'atmosphere',
                'sky-atmosphere-sun': [0, 0],
                'sky-atmosphere-sun-intensity': 15,
              }}
            />
            <Layer
              id="3d-buildings"
              source="composite"
              source-layer="building"
              type="fill-extrusion"
              minzoom={15}
              filter={['==', 'extrude', 'true']}
              paint={{
                'fill-extrusion-color': '#aaa',
                'fill-extrusion-height': ['get', 'height'],
                'fill-extrusion-base': ['get', 'min_height'],
                'fill-extrusion-opacity': 0.5,
              }}
            />
          </>
        )}

        {zoneLocations.map((location) => (
          <LocationMarker
            key={location.id}
            location={location}
            color={seg.color}
            isSelected={selectedId === location.id}
            isFocused={
              location.id !== selectedId &&
              (scrollFocusedLocationId === location.id ||
                hoveredLocationIds.includes(location.id))
            }
            isDimmed={anyHighlighted && !highlightedIds.has(location.id)}
            onClick={() => {
              setSelectedId(location.id);
              flyToLocation(location);
              onPinClick?.(location.id);
            }}
            onHover={(hovering) =>
              onMarkerHover?.(hovering ? location.id : null)
            }
          />
        ))}
      </Map>

      {/* Style toggle */}
      <button
        onClick={() => {
          setIsStyleReady(false);
          setIsSatellite((v) => !v);
        }}
        className="absolute top-4 right-4 z-10 flex items-center gap-2 px-3 py-2 rounded-lg bg-white/90 backdrop-blur-sm shadow-lg text-sm font-medium text-gray-700 hover:bg-white transition-colors cursor-pointer"
        title={isSatellite ? 'Switch to map view' : 'Switch to satellite view'}
      >
        {isSatellite ? (
          <><MapLayers className="w-4 h-4" /> Map</>
        ) : (
          <><Satellite className="w-4 h-4" /> Satellite</>
        )}
      </button>

      {/* Map overlay controls — visible when focused on a single pin */}
      {selectedId && (() => {
        const idx = filteredOrderedIds.indexOf(selectedId);
        const prevId = idx > 0 ? filteredOrderedIds[idx - 1] : undefined;
        const nextId = idx >= 0 && idx < filteredOrderedIds.length - 1 ? filteredOrderedIds[idx + 1] : undefined;
        const selectedLoc = zoneLocations.find((l) => l.id === selectedId);

        const TYPE_LABELS: Record<string, string> = {
          airport: 'Airport', lodging: 'Lodging', restaurant: 'Restaurant',
          park: 'Park', attraction: 'Attraction', trailhead: 'Trail',
        };
        const TYPE_COLORS: Record<string, string> = {
          airport: '#7c8794', lodging: '#957f6e', restaurant: '#a8806e',
          park: '#6d8e7b', attraction: '#8e7f9a', trailhead: '#728f80',
        };

        const typeLabel = selectedLoc ? (TYPE_LABELS[selectedLoc.type] || selectedLoc.type) : '';
        const pinColor = selectedLoc ? (TYPE_COLORS[selectedLoc.type] ?? '#7c8490') : '#7c8490';
        const websiteUrl = selectedLoc?.official_url?.[0];
        const mapsUrl = selectedLoc?.google_maps_url?.[0];
        const reviewUrl = selectedLoc?.review_url?.[0];

        // Trim address to city + state
        const shortAddress = (addr: string) => {
          const parts = addr.split(',').map((s) => s.trim());
          if (parts.length >= 3) {
            const state = parts[parts.length - 1]!.replace(/\d{5}(-\d{4})?/, '').trim();
            return `${parts[parts.length - 2]}, ${state}`;
          }
          return addr;
        };

        return (
          <>
            {/* Detail card — bottom-right corner */}
            {selectedLoc && (
              <div
                className="absolute bottom-16 right-4 z-10 w-[360px] animate-in fade-in slide-in-from-bottom-2 duration-200"
              >
                <div
                  className="overflow-hidden rounded-xl shadow-2xl border border-white/10 backdrop-blur-md"
                  style={{ backgroundColor: `color-mix(in oklab, ${seg.color} 50%, rgba(0,0,0,0.85))` }}
                >
                  {/* Photo grid — 3 photos */}
                  {selectedLoc.images.length > 0 && (
                    <div className="flex gap-0.5 p-0.5 pb-0 h-[140px]">
                      <img
                        src={selectedLoc.images[0]}
                        alt=""
                        className="object-cover w-1/2 h-full rounded-l-md"
                        loading="lazy"
                      />
                      <div className="flex flex-col gap-0.5 w-1/2">
                        {selectedLoc.images[1] && (
                          <img
                            src={selectedLoc.images[1]}
                            alt=""
                            className="object-cover w-full flex-1 min-h-0 rounded-tr-md"
                            loading="lazy"
                          />
                        )}
                        {selectedLoc.images[2] && (
                          <img
                            src={selectedLoc.images[2]}
                            alt=""
                            className="object-cover w-full flex-1 min-h-0 rounded-br-md"
                            loading="lazy"
                          />
                        )}
                      </div>
                    </div>
                  )}
                  {/* Info */}
                  <div className="px-4 py-3">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <p className="text-white text-[15px] font-semibold leading-snug">
                        {selectedLoc.name}
                      </p>
                      <span
                        className="shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mt-0.5"
                        style={{ backgroundColor: pinColor + '25', color: pinColor }}
                      >
                        {typeLabel}
                      </span>
                    </div>
                    <p className="text-white/50 text-xs leading-tight mb-2">
                      {shortAddress(selectedLoc.address)}
                    </p>
                    {(websiteUrl || mapsUrl || reviewUrl) && (
                      <div className="flex items-center gap-3 pt-2 border-t border-white/10">
                        {websiteUrl && (
                          <a href={websiteUrl} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[11px] text-white/50 hover:text-white transition-colors">
                            <ExternalLink className="w-3 h-3" /> Website
                          </a>
                        )}
                        {mapsUrl && (
                          <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[11px] text-white/50 hover:text-white transition-colors">
                            <MapPin className="w-3 h-3" /> Directions
                          </a>
                        )}
                        {reviewUrl && (
                          <a href={reviewUrl} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[11px] text-white/50 hover:text-white transition-colors">
                            <Star className="w-3 h-3" /> Reviews
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Prev / Zoom out / Next controls */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
            <button
              disabled={!prevId}
              onClick={() => prevId && navigateToPin(prevId)}
              className={`flex items-center gap-1 px-3 py-2.5 rounded-full shadow-lg text-sm font-medium backdrop-blur-sm transition-colors ${
                prevId
                  ? 'bg-white/90 text-gray-700 hover:bg-white cursor-pointer'
                  : 'bg-white/40 text-gray-400 cursor-default'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              Prev
            </button>
            <button
              onClick={() => fitToSegment(activeSegment)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/90 backdrop-blur-sm shadow-lg text-sm font-medium text-gray-700 hover:bg-white transition-colors cursor-pointer"
            >
              <MapIcon className="w-4 h-4" />
              Zoom out
            </button>
            <button
              disabled={!nextId}
              onClick={() => nextId && navigateToPin(nextId)}
              className={`flex items-center gap-1 px-3 py-2.5 rounded-full shadow-lg text-sm font-medium backdrop-blur-sm transition-colors ${
                nextId
                  ? 'bg-white/90 text-gray-700 hover:bg-white cursor-pointer'
                  : 'bg-white/40 text-gray-400 cursor-default'
              }`}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
            </div>
          </>
        );
      })()}
    </div>
  );
}

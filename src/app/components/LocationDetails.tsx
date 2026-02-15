import { ExternalLink, MapPin, Star, Globe } from 'lucide-react';

interface LocationData {
  id: string;
  name: string;
  address: string;
  geo: { lat: number; lng: number };
  type: string;
  official_url?: string;
  google_maps_url?: string;
  review_url?: string;
}

interface LocationDetailsProps {
  location: LocationData;
  isExpanded: boolean;
}

export function LocationDetails({ location, isExpanded }: LocationDetailsProps) {
  if (!isExpanded) return null;

  return (
    <div 
      className="mt-3 pt-3 border-t border-[#e8e0d0] animate-in fade-in slide-in-from-top-2 duration-200"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <div className="flex flex-wrap gap-3">
        {location.google_maps_url && (
          <a
            href={location.google_maps_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2 bg-[#faf8f3] hover:bg-[#f0ebe0] border border-[#e8e0d0] rounded-md text-xs text-[#6b5d4f] transition-colors"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>View on Map</span>
            <ExternalLink className="w-3 h-3 opacity-50" />
          </a>
        )}
        
        {location.official_url && (
          <a
            href={location.official_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2 bg-[#faf8f3] hover:bg-[#f0ebe0] border border-[#e8e0d0] rounded-md text-xs text-[#6b5d4f] transition-colors"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Official Website</span>
            <ExternalLink className="w-3 h-3 opacity-50" />
          </a>
        )}
        
        {location.review_url && (
          <a
            href={location.review_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2 bg-[#faf8f3] hover:bg-[#f0ebe0] border border-[#e8e0d0] rounded-md text-xs text-[#6b5d4f] transition-colors"
          >
            <Star className="w-3.5 h-3.5" />
            <span>Read Reviews</span>
            <ExternalLink className="w-3 h-3 opacity-50" />
          </a>
        )}
      </div>
      
      <div className="mt-3 text-xs text-[#8b7d6b] space-y-1">
        <p>
          <span className="inline-block w-20">Address:</span>
          <span>{location.address}</span>
        </p>
        <p>
          <span className="inline-block w-20">Coordinates:</span>
          <span className="font-mono">{location.geo.lat.toFixed(6)}, {location.geo.lng.toFixed(6)}</span>
        </p>
      </div>
    </div>
  );
}

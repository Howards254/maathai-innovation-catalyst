import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapPickerProps {
  onLocationSelect: (lat: number, lng: number, address?: string) => void;
  initialPosition?: [number, number];
  height?: string;
}

const MapUpdater: React.FC<{ position: [number, number] }> = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(position, 13);
  }, [position, map]);
  return null;
};

const LocationMarker: React.FC<{ position: [number, number]; onPositionChange: (lat: number, lng: number) => void }> = ({ position, onPositionChange }) => {
  useMapEvents({
    click(e) {
      onPositionChange(e.latlng.lat, e.latlng.lng);
    },
  });

  return <Marker position={position} />;
};

const MapPicker: React.FC<MapPickerProps> = ({ 
  onLocationSelect, 
  initialPosition = [-1.2921, 36.8219],
  height = '400px'
}) => {
  const [position, setPosition] = useState<[number, number]>(initialPosition);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  const handlePositionChange = async (lat: number, lng: number) => {
    setPosition([lat, lng]);
    
    // Reverse geocoding to get address
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      onLocationSelect(lat, lng, data.display_name);
    } catch (error) {
      onLocationSelect(lat, lng);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    setSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
      );
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleSearchInput = (value: string) => {
    setSearchQuery(value);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      handleSearch(value);
    }, 300);
  };

  const selectSuggestion = (suggestion: any) => {
    const lat = parseFloat(suggestion.lat);
    const lng = parseFloat(suggestion.lon);
    setPosition([lat, lng]);
    setSearchQuery(suggestion.display_name);
    setSuggestions([]);
    onLocationSelect(lat, lng, suggestion.display_name);
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="relative">
          <span className="absolute left-3 top-3 text-gray-400 text-lg">📍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchInput(e.target.value)}
            placeholder="Type location: Central Park, Nairobi, etc."
            className="w-full pl-10 pr-10 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
          />
          {searching && (
            <div className="absolute right-3 top-3">
              <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
        {suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-2 bg-white border-2 border-green-500 rounded-xl shadow-2xl max-h-80 overflow-y-auto">
            <div className="p-2 bg-green-50 border-b border-green-200">
              <p className="text-xs font-semibold text-green-700">📍 Select a location</p>
            </div>
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => selectSuggestion(suggestion)}
                className="w-full px-4 py-3 text-left hover:bg-green-50 border-b border-gray-100 last:border-b-0 transition-all group"
              >
                <div className="flex items-start gap-3">
                  <span className="text-green-500 text-xl group-hover:scale-110 transition-transform">📍</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 group-hover:text-green-600">{suggestion.display_name.split(',')[0]}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{suggestion.display_name}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      <div style={{ height, width: '100%' }} className="rounded-lg overflow-hidden border border-gray-300">
        <MapContainer
          center={position}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} onPositionChange={handlePositionChange} />
          <MapUpdater position={position} />
        </MapContainer>
      </div>
      <p className="text-sm text-gray-500">💡 Type to search or click on the map to select location</p>
    </div>
  );
};

export default MapPicker;
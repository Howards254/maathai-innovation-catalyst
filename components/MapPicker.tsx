import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
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
  initialLat?: number;
  initialLng?: number;
  height?: string;
}

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
  initialLat = -1.2921, 
  initialLng = 36.8219,
  height = '400px'
}) => {
  const [position, setPosition] = useState<[number, number]>([initialLat, initialLng]);

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

  return (
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
      </MapContainer>
    </div>
  );
};

export default MapPicker;
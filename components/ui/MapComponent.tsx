'use client';

import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in Leaflet with Webpack/Next.js
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

interface MapComponentProps {
  lat: number;
  lng: number;
  onLocationChange?: (lat: number, lng: number) => void;
}

function MapEvents({ onLocationChange, position }: { onLocationChange?: (lat: number, lng: number) => void, position: [number, number] }) {
  const map = useMapEvents({
    click(e) {
      if (onLocationChange) {
        onLocationChange(e.latlng.lat, e.latlng.lng);
      }
    },
  });

  useEffect(() => {
    map.setView(position, map.getZoom());
  }, [position[0], position[1], map]);

  return null;
}

export default function MapComponent({ lat, lng, onLocationChange }: MapComponentProps) {
  const [position, setPosition] = useState<[number, number]>([lat, lng]);

  useEffect(() => {
    setPosition([lat, lng]);
  }, [lat, lng]);

  if (typeof window === 'undefined') return null;

  return (
    <div className="h-[300px] w-full rounded-xl overflow-hidden border border-default z-0">
      <MapContainer 
        center={position} 
        zoom={lat === 19.4326 && lng === -99.1332 ? 5 : 15} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker 
          position={position} 
          draggable={true}
          eventHandlers={{
            dragend: (e) => {
              const marker = e.target;
              const pos = marker.getLatLng();
              setPosition([pos.lat, pos.lng]);
              if (onLocationChange) {
                onLocationChange(pos.lat, pos.lng);
              }
            },
          }}
        />
        <MapEvents position={position} onLocationChange={(lat, lng) => {
          setPosition([lat, lng]);
          if (onLocationChange) onLocationChange(lat, lng);
        }} />
      </MapContainer>
    </div>
  );
}

'use client';

import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Search, Loader2, AlertCircle } from 'lucide-react';

// Import Leaflet map dynamically without SSR
const MapComponent = dynamic(() => import('./MapComponent'), { 
  ssr: false,
  loading: () => (
    <div className="h-[300px] w-full rounded-xl bg-app border border-default flex items-center justify-center text-muted">
      <Loader2 className="animate-spin mr-2" size={24} />
      Cargando mapa...
    </div>
  )
});

interface LocationPickerProps {
  ubicacion: string;
  latitud: string | number | null;
  longitud: string | number | null;
  onChange: (ubicacion: string, lat: number | null, lng: number | null) => void;
}

interface NominatimResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
}

export default function LocationPicker({ ubicacion, latitud, longitud, onChange }: LocationPickerProps) {
  const [searchTerm, setSearchTerm] = useState(ubicacion);
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard accessibility
  useEffect(() => {
    function handleKeyDown(e: globalThis.KeyboardEvent) {
      if (e.key === 'Escape') {
        setShowDropdown(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Update internal search term when prop changes externally (e.g. initial load)
  useEffect(() => {
    if (ubicacion !== searchTerm && !isSearching) {
      setSearchTerm(ubicacion);
    }
  }, [ubicacion, isSearching, searchTerm]);

  const fetchLocations = async (query: string) => {
    if (query.length <= 3) {
      setSuggestions([]);
      setShowDropdown(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/geocoding/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error("Error en la respuesta de la API");
      
      const data = await res.json();
      console.log('Respuesta:', data);
      setSuggestions(data);
      setShowDropdown(true);
      setFocusedIndex(-1);
    } catch (err) {
      console.error("Error searching location:", err);
      setErrorMsg("Error al conectar con el servicio de mapas.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onChange(value, latitud ? Number(latitud) : null, longitud ? Number(longitud) : null);
    setShowDropdown(true);
    
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchLocations(value);
    }, 500);
  };

  const handleSelectLocation = (result: NominatimResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setSearchTerm(result.display_name);
    setSuggestions([]);
    setShowDropdown(false);
    setFocusedIndex(-1);
    onChange(result.display_name, lat, lng);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (focusedIndex >= 0 && focusedIndex < suggestions.length) {
        handleSelectLocation(suggestions[focusedIndex]);
      }
    }
  };

  const handleMapChange = async (lat: number, lng: number) => {
    // Reverse geocoding to get address name
    try {
      const res = await fetch(`/api/geocoding/reverse?lat=${lat}&lon=${lng}`);
      const data = await res.json();
      console.log('Respuesta:', data);
      if (data && data.display_name) {
        setSearchTerm(data.display_name);
        onChange(data.display_name, lat, lng);
      } else {
        onChange(searchTerm, lat, lng);
      }
    } catch (err) {
      console.error("Error reverse geocoding:", err);
      onChange(searchTerm, lat, lng); // fall back to current search term
    }
  };

  // Default to Mexico City if no lat/lng
  const currentLat = latitud ? Number(latitud) : 19.4326;
  const currentLng = longitud ? Number(longitud) : -99.1332;
  const hasCoordinates = latitud !== null && latitud !== '' && longitud !== null && longitud !== '';

  return (
    <div className="space-y-4" ref={wrapperRef}>
      <div className="relative">
        <label className="block text-xs font-semibold text-secondary mb-1.5">
          Buscar Dirección o Ubicación <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            required
            placeholder="Ej. Av. Reforma, Ciudad de México..."
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (suggestions.length > 0 || errorMsg) setShowDropdown(true);
            }}
            className="input-base pl-9 pr-10"
          />
          {isSearching && (
            <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted animate-spin" />
          )}
        </div>

        {/* Dropdown Suggestions */}
        {showDropdown && (
          <div className="absolute z-10 w-full mt-1 bg-card border border-default rounded-xl shadow-lg overflow-hidden max-h-60 overflow-y-auto">
            {errorMsg ? (
              <div className="p-4 text-sm text-red-500 flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            ) : isSearching ? (
              <div className="p-4 text-sm text-muted flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                <span>Buscando direcciones...</span>
              </div>
            ) : suggestions.length > 0 ? (
              suggestions.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectLocation(s)}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-start gap-2 border-b border-default last:border-0 ${
                    focusedIndex === i ? 'bg-app text-primary' : 'text-secondary hover:bg-app hover:text-primary'
                  }`}
                >
                  <MapPin size={16} className={`shrink-0 mt-0.5 ${focusedIndex === i ? 'text-sigo-primary' : 'text-muted'}`} />
                  <span className="line-clamp-2">{s.display_name}</span>
                </button>
              ))
            ) : searchTerm.length > 3 ? (
              <div className="p-4 text-sm text-muted flex items-center justify-center italic">
                No se encontraron direcciones. Puedes escribirla manualmente.
              </div>
            ) : null}
          </div>
        )}
      </div>

      <div className="relative z-0">
        <MapComponent 
          lat={currentLat} 
          lng={currentLng} 
          onLocationChange={handleMapChange} 
        />
        {!hasCoordinates && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm rounded-xl flex items-center justify-center border border-default z-10">
            <div className="text-center p-4">
              <MapPin className="mx-auto text-muted mb-2" size={24} />
              <p className="text-sm font-medium text-secondary">Busca una dirección para mostrar el mapa</p>
              <p className="text-xs text-muted mt-1">O escribe la ubicación manualmente</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

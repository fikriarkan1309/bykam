import React, { useState, useEffect, useRef, useMemo } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { MapPin, Search, Compass, ShieldAlert, Loader2, Navigation, Undo2 } from 'lucide-react';

// Get Google Maps Platform API Key safely according to official AI Studio guidelines
const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';

const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY' && API_KEY.trim() !== '';

// Puri Cileungsi (Bykam Central Office)
const BYKAM_CENTER = { lat: -6.419875, lng: 107.028682 };

interface GoogleMapsPickerProps {
  currentAddress: string;
  onLocationSelected: (address: string, distanceKm: number) => void;
  currentDistance: number;
}

export default function GoogleMapsPicker({
  currentAddress,
  onLocationSelected,
  currentDistance,
}: GoogleMapsPickerProps) {
  if (!hasValidKey) {
    return <GoogleMapsKeySplash />;
  }

  return (
    <APIProvider apiKey={API_KEY} version="weekly">
      <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-md">
        <MapInnerContainer
          currentAddress={currentAddress}
          onLocationSelected={onLocationSelected}
          currentDistance={currentDistance}
        />
      </div>
    </APIProvider>
  );
}

// Inner component to leverage hooks from APIProvider
function MapInnerContainer({
  currentAddress,
  onLocationSelected,
  currentDistance,
}: GoogleMapsPickerProps) {
  const map = useMap();
  const placesLib = useMapsLibrary('places');
  const geometryLib = useMapsLibrary('geometry');

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<google.maps.LatLngLiteral>(BYKAM_CENTER);
  const [locating, setLocating] = useState(false);
  const [markerName, setMarkerName] = useState<string>('');
  
  // Instance-level services
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const [distanceMatrixService, setDistanceMatrixService] = useState<google.maps.DistanceMatrixService | null>(null);

  // Initialize helper services
  useEffect(() => {
    if (!placesLib || !map) return;
    
    // Create direct services
    if (!autocompleteServiceRef.current) {
      autocompleteServiceRef.current = new placesLib.AutocompleteService();
    }
    if (!placesServiceRef.current) {
      placesServiceRef.current = new placesLib.PlacesService(map);
    }
    if (!geocoderRef.current) {
      geocoderRef.current = new google.maps.Geocoder();
    }
    if (!distanceMatrixService) {
      setDistanceMatrixService(new google.maps.DistanceMatrixService());
    }
  }, [placesLib, map]);

  // Handle query typing and load suggestions
  useEffect(() => {
    if (!placesLib || !autocompleteServiceRef.current || !searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    setLoadingSuggestions(true);
    const delayDebounce = setTimeout(() => {
      autocompleteServiceRef.current?.getPlacePredictions(
        {
          input: searchQuery,
          locationBias: BYKAM_CENTER,
          radius: 40000, // 40km radius priority
          componentRestrictions: { country: 'id' }, // Restrict to Indonesia (Cileungsi / Bogor / Bekasi)
        },
        (predictions, status) => {
          setLoadingSuggestions(false);
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            setSuggestions(predictions);
          } else {
            setSuggestions([]);
          }
        }
      );
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, placesLib]);

  // Compute and broadcast coordinates + distances to state
  const calculateAndSetLocation = (latLng: google.maps.LatLng, finalAddress: string) => {
    const latLit = { lat: latLng.lat(), lng: latLng.lng() };
    setSelectedLocation(latLit);

    // Try driving route first
    if (distanceMatrixService) {
      distanceMatrixService.getDistanceMatrix(
        {
          origins: [BYKAM_CENTER],
          destinations: [latLit],
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (response, status) => {
          if (status === google.maps.DistanceMatrixStatus.OK && response?.rows[0]?.elements[0]?.distance) {
            const drivingDistKm = parseFloat((response.rows[0].elements[0].distance.value / 1000).toFixed(1));
            const finalDist = Math.max(0.5, drivingDistKm);
            onLocationSelected(finalAddress, finalDist);
          } else {
            // Fallback to coordinates-based spherical distance with driving coefficient factor 1.25
            fallbackSpherical(latLng, finalAddress);
          }
        }
      );
    } else {
      fallbackSpherical(latLng, finalAddress);
    }
  };

  const fallbackSpherical = (latLng: google.maps.LatLng, finalAddress: string) => {
    if (geometryLib) {
      const start = new google.maps.LatLng(BYKAM_CENTER.lat, BYKAM_CENTER.lng);
      const meters = geometryLib.spherical.computeDistanceBetween(start, latLng);
      // Coordinate to road distance conversion estimation multiplier (typically ~1.25 - 1.3)
      const estimatedKm = parseFloat(((meters / 1000) * 1.25).toFixed(1));
      const finalDist = Math.max(0.5, estimatedKm);
      onLocationSelected(finalAddress, finalDist);
    } else {
      // Direct raw calculation (worst case fallback)
      const radlat1 = Math.PI * BYKAM_CENTER.lat / 180;
      const radlat2 = Math.PI * latLng.lat() / 180;
      const theta = BYKAM_CENTER.lng - latLng.lng();
      const radtheta = Math.PI * theta / 180;
      let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
      dist = Math.acos(Math.min(1, dist));
      dist = dist * 180 / Math.PI;
      dist = dist * 60 * 1.1515 * 1.609344; // to kilometers
      const estimatedKm = parseFloat((dist * 1.25).toFixed(1));
      onLocationSelected(finalAddress, Math.max(0.5, estimatedKm));
    }
  };

  // Click handler directly on map
  const handleMapClick = (e: any) => {
    if (!geocoderRef.current || !e.detail.latLng) return;
    const latLngObj = new google.maps.LatLng(e.detail.latLng.lat, e.detail.latLng.lng);
    
    setLocating(true);
    geocoderRef.current.geocode({ location: latLngObj }, (results, status) => {
      setLocating(false);
      if (status === 'OK' && results && results[0]) {
        const fullAddr = results[0].formatted_address;
        setMarkerName(fullAddr);
        setSearchQuery(fullAddr);
        calculateAndSetLocation(latLngObj, fullAddr);
      }
    });
  };

  // Handle prediction click from autocomplete suggestions
  const handleSelectPrediction = (prediction: google.maps.places.AutocompletePrediction) => {
    if (!placesLib || !map) return;
    setLocating(true);
    setSearchQuery(prediction.description);
    setSuggestions([]);

    const geocoder = geocoderRef.current || new google.maps.Geocoder();
    geocoder.geocode({ placeId: prediction.place_id }, (results, status) => {
      setLocating(false);
      if (status === 'OK' && results && results[0]) {
        const loc = results[0].geometry.location;
        const fullAddr = results[0].formatted_address;
        setMarkerName(fullAddr);
        map.panTo(loc);
        map.setZoom(15);
        calculateAndSetLocation(loc, fullAddr);
      }
    });
  };

  // Geolocate customer device
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Fitur GPS tidak didukung di peramban Anda.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const customerLatLng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
        if (geocoderRef.current && map) {
          geocoderRef.current.geocode({ location: customerLatLng }, (results, status) => {
            setLocating(false);
            if (status === 'OK' && results && results[0]) {
              const fullAddr = results[0].formatted_address;
              setMarkerName(fullAddr);
              setSearchQuery(fullAddr);
              map.panTo(customerLatLng);
              map.setZoom(15);
              calculateAndSetLocation(customerLatLng, fullAddr);
            }
          });
        } else {
          setLocating(false);
        }
      },
      () => {
        setLocating(false);
        alert('Gagal mengambil lokasi GPS Anda. Mohon ketikkan alamat secara manual atau klik di peta.');
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  return (
    <div className="flex flex-col">
      {/* Search Header Container */}
      <div className="p-4 bg-slate-50 dark:bg-slate-950/20 border-b border-slate-100 dark:border-slate-800 flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-2 relative">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kelurahan, perumahan, kompleks, atau apartemen Anda..."
              className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primary font-medium"
            />
            {locating && (
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                <Loader2 className="animate-spin text-primary" size={16} />
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleGetCurrentLocation}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-850 dark:hover:bg-slate-750 text-white rounded-xl text-xs font-bold transition-all shadow-sm shrink-0 cursor-pointer active:scale-98"
          >
            <Navigation size={14} className="fill-current" />
            <span>Gunakan GPS Saya</span>
          </button>
        </div>

        {/* Search Suggestions List */}
        {suggestions.length > 0 && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg max-h-56 overflow-y-auto z-55 scrollbar-thin divide-y divide-slate-100 dark:divide-slate-800">
            {suggestions.map((p) => (
              <button
                key={p.place_id}
                type="button"
                onClick={() => handleSelectPrediction(p)}
                className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300"
              >
                <MapPin className="text-slate-400 shrink-0 mt-0.5" size={14} />
                <div>
                  <strong className="font-bold text-slate-900 dark:text-white">{p.structured_formatting.main_text}</strong>
                  <span className="text-slate-400 block text-[10px]">{p.structured_formatting.secondary_text}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Interactive Map component */}
      <div className="h-72 sm:h-80 w-full relative">
        <Map
          defaultCenter={BYKAM_CENTER}
          defaultZoom={13}
          mapId="bykam_booking_picker_v1"
          onClick={handleMapClick}
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          style={{ width: '100%', height: '100%' }}
        >
          {/* Base Headquarter Marker */}
          <AdvancedMarker position={BYKAM_CENTER}>
            <Pin background="#eab308" glyphColor="#1e293b" borderColor="#ca8a04">
              <span className="text-[10px] font-black">BK</span>
            </Pin>
          </AdvancedMarker>

          {/* User Picked Destination Marker */}
          {selectedLocation.lat !== BYKAM_CENTER.lat && (
            <AdvancedMarker position={selectedLocation}>
              <Pin background="#4f46e5" glyphColor="#ffffff" borderColor="#4338ca" />
            </AdvancedMarker>
          )}
        </Map>

        {/* Legend overlays */}
        <div className="absolute bottom-3 left-3 bg-slate-900/90 dark:bg-slate-950/95 p-2 py-1.5 rounded-lg text-[9px] text-slate-300 flex flex-col gap-1 border border-slate-800 shadow-md">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Kantor Pusat Bykam (Puri Cileungsi)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-indigo-500" />
            <span>Lokasi Anda ({currentDistance.toFixed(1)} km)</span>
          </div>
        </div>

        {/* Prompt instructions overlay */}
        <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-950/90 px-2.5 py-1.5 rounded-lg text-[9px] text-slate-700 dark:text-slate-200 border border-slate-200/50 dark:border-slate-800 font-semibold pointer-events-none shadow-sm shadow-black/10">
          📍 Klik pada peta untuk pinpoint koordinat akurat
        </div>
      </div>
    </div>
  );
}

// Highly polished, intuitive splash configuration for setup if key doesn't exist
function GoogleMapsKeySplash() {
  return (
    <div className="bg-slate-50 dark:bg-slate-950/20 border-2 border-dashed border-slate-200 dark:border-slate-800/70 p-6 sm:p-8 rounded-2xl flex flex-col items-center justify-center text-center space-y-4 shadow-inner">
      <div className="p-3.5 bg-amber-500/10 dark:bg-amber-500/5 text-amber-500 rounded-full animate-bounce">
        <ShieldAlert size={28} />
      </div>

      <div className="max-w-md space-y-1.5">
        <h3 className="font-sans font-bold text-base sm:text-lg text-slate-800 dark:text-slate-100 flex items-center justify-center gap-2">
          Aktivasi Google Maps Klik & Cari Akurat
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
          Dapatkan akurasi alamat & jarak 100% menggunakan infrastruktur peta resmi Google Maps Platform.
        </p>
      </div>

      {/* Structured setup guide directly within the card structure */}
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 p-4.5 rounded-xl text-left text-xs text-slate-600 dark:text-slate-300 space-y-2.5">
        <span className="text-[10px] font-black uppercase tracking-wider text-indigo-500 block">LANGKAH INTEGRASI CEPAT:</span>
        
        <div className="flex items-start gap-2.5 leading-normal">
          <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-[10px] text-slate-600 dark:text-slate-300 shrink-0 mt-0.5">1</span>
          <p>
            Dapatkan API Key resmi Anda di{' '}
            <a 
              href="https://console.cloud.google.com/google/maps-apis/start?utm_campaign=gmp-code-assist-ais" 
              target="_blank" 
              rel="noreferrer"
              className="text-primary font-bold hover:underline"
            >
              Google Cloud Console ↗
            </a>
          </p>
        </div>

        <div className="flex items-start gap-2.5 leading-normal">
          <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-[10px] text-slate-600 dark:text-slate-300 shrink-0 mt-0.5">2</span>
          <p>Masukkan API Key tersebut ke dalam rahasia proyek di AI Studio Anda.</p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-150 dark:border-slate-850 text-[11px] text-slate-500 dark:text-slate-400 italic">
          Buka <strong className="font-semibold text-slate-700 dark:text-slate-300">Settings (⚙️ Gear Icon di pojok kanan atas)</strong> &rarr; <strong className="font-semibold text-slate-700 dark:text-slate-300">Secrets</strong> &rarr; tambahkan nama rahasia <code className="bg-white dark:bg-slate-900 px-1 py-0.5 border rounded-sm font-mono text-[9px] text-indigo-500 font-bold">GOOGLE_MAPS_PLATFORM_KEY</code> &rarr; simpan kunci &rarr; selesai.
        </div>
      </div>

      <div className="text-[10px] text-slate-400 bg-slate-100/60 dark:bg-slate-900/40 px-3 py-1 rounded-full border border-slate-100 dark:border-slate-800">
        ℹ️ Layanan sementara menggunakan Fallback Radar Tracker Bykam Cileungsi
      </div>
    </div>
  );
}

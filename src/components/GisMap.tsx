import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import {
  Building2,
  Phone,
  MapPin,
  HeartHandshake,
  ExternalLink,
  Layers,
  Map as MapIcon,
  Navigation,
  Sparkles,
  Compass,
  CheckCircle2,
  Search,
  Globe,
  Mountain,
} from 'lucide-react';
import { CareFacility, DistrictPopulation, UserApiKeys } from '../types';
import { FACILITY_TYPE_CONFIG, GRADE_COLOR_CONFIG } from '../utils/analysis';

interface GisMapProps {
  facilities: CareFacility[];
  districts: DistrictPopulation[];
  selectedDistricts: string[];
  selectedFacility: CareFacility | null;
  onSelectFacility: (facility: CareFacility | null) => void;
  apiKeys: UserApiKeys;
  onOpenApiKeyModal: () => void;
  onSaveApiKeys?: (keys: UserApiKeys) => void;
}

// Google Maps high-speed CDN tile configurations (No API Key required, seamless, zero grey blocks)
const GOOGLE_TILE_LAYERS = {
  roadmap: {
    name: 'Google 일반지도',
    url: 'https://mt{s}.google.com/vt/lyrs=m&hl=ko&gl=KR&x={x}&y={y}&z={z}',
    subdomains: ['0', '1', '2', '3'],
    maxZoom: 20,
    attribution: '© Google Maps',
  },
  satellite: {
    name: 'Google 위성/하이브리드',
    url: 'https://mt{s}.google.com/vt/lyrs=y&hl=ko&gl=KR&x={x}&y={y}&z={z}',
    subdomains: ['0', '1', '2', '3'],
    maxZoom: 20,
    attribution: '© Google Maps Satellite',
  },
  terrain: {
    name: 'Google 지형도',
    url: 'https://mt{s}.google.com/vt/lyrs=p&hl=ko&gl=KR&x={x}&y={y}&z={z}',
    subdomains: ['0', '1', '2', '3'],
    maxZoom: 20,
    attribution: '© Google Maps Terrain',
  },
};

export const GisMap: React.FC<GisMapProps> = ({
  facilities,
  districts,
  selectedDistricts,
  selectedFacility,
  onSelectFacility,
}) => {
  // Google Map Tile Style: 'roadmap' | 'satellite' | 'terrain'
  const [googleLayerType, setGoogleLayerType] = useState<'roadmap' | 'satellite' | 'terrain'>('roadmap');

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Default Busan Center (City Hall / Yeonje-gu area)
  const busanCenter: [number, number] = [35.1796, 129.0756];

  // Initialize and mount Leaflet map with Google Maps tiles
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!leafletMapRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: busanCenter,
        zoom: 12,
        zoomControl: true,
        attributionControl: false,
      });

      // Add selected Google Maps tile layer with buffer to prevent tile flickering or grey edges
      const currentConfig = GOOGLE_TILE_LAYERS[googleLayerType];
      const tileLayer = L.tileLayer(currentConfig.url, {
        maxZoom: currentConfig.maxZoom,
        subdomains: currentConfig.subdomains,
        crossOrigin: true,
        keepBuffer: 6,
        updateWhenIdle: false,
      }).addTo(map);

      tileLayerRef.current = tileLayer;

      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;
      leafletMapRef.current = map;

      // Handle container resizing with ResizeObserver to prevent any grey gaps
      const resizeObserver = new ResizeObserver(() => {
        if (leafletMapRef.current) {
          leafletMapRef.current.invalidateSize();
        }
      });
      resizeObserver.observe(mapContainerRef.current);

      // Force initial size recalculation
      setTimeout(() => {
        map.invalidateSize();
      }, 150);

      return () => {
        resizeObserver.disconnect();
      };
    }
  }, []);

  // Update Tile Layer dynamically when style (Roadmap / Satellite / Terrain) changes
  useEffect(() => {
    if (!leafletMapRef.current) return;

    const currentConfig = GOOGLE_TILE_LAYERS[googleLayerType];

    if (tileLayerRef.current) {
      leafletMapRef.current.removeLayer(tileLayerRef.current);
    }

    const newTileLayer = L.tileLayer(currentConfig.url, {
      maxZoom: currentConfig.maxZoom,
      subdomains: currentConfig.subdomains,
      crossOrigin: true,
      keepBuffer: 6,
      updateWhenIdle: false,
    }).addTo(leafletMapRef.current);

    tileLayerRef.current = newTileLayer;
    leafletMapRef.current.invalidateSize();
  }, [googleLayerType]);

  // Update Facility Markers
  useEffect(() => {
    if (!leafletMapRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    facilities.forEach((facility) => {
      const isSelected = selectedFacility?.id === facility.id;
      const typeCfg = FACILITY_TYPE_CONFIG[facility.type] || {
        colorHex: '#2563eb',
        pinBg: '#3b82f6',
      };

      const markerHtml = `
        <div class="relative flex items-center justify-center cursor-pointer transition-transform duration-200 ${
          isSelected ? 'scale-135 z-50' : 'hover:scale-115'
        }">
          <div style="background-color: ${typeCfg.colorHex}; border: 2px solid #ffffff;" 
               class="w-6 h-6 rounded-full shadow-md text-white font-mono text-[10px] font-bold flex items-center justify-center ${
                 isSelected ? 'ring-3 ring-blue-600 ring-offset-2' : ''
               }">
            ${facility.grade}
          </div>
          ${
            facility.remaining > 0
              ? `<span class="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white" title="잔여석 +${facility.remaining}석"></span>`
              : ''
          }
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-gis-marker',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([facility.lat, facility.lng], { icon: customIcon });

      marker.on('click', () => {
        onSelectFacility(facility);
      });

      markersLayerRef.current?.addLayer(marker);
    });

    // If a facility is selected, smoothly pan to it
    if (selectedFacility) {
      leafletMapRef.current.setView([selectedFacility.lat, selectedFacility.lng], 15, {
        animate: true,
      });
    } else if (selectedDistricts.length === 1) {
      const dist = districts.find((d) => d.name === selectedDistricts[0]);
      if (dist) {
        leafletMapRef.current.setView([dist.centerLat, dist.centerLng], 13, {
          animate: true,
        });
      }
    }
  }, [facilities, selectedFacility, selectedDistricts, districts, onSelectFacility]);

  // Google Maps Search and Directions URLs
  const getGoogleMapsSearchUrl = (facility: CareFacility) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      facility.name + ' ' + facility.address
    )}`;
  };

  const getGoogleMapsDirectionsUrl = (facility: CareFacility) => {
    return `https://www.google.com/maps/dir/?api=1&destination=${facility.lat},${facility.lng}`;
  };

  const handleResetToBusanCenter = () => {
    if (leafletMapRef.current) {
      leafletMapRef.current.setView(busanCenter, 12, { animate: true });
    }
    onSelectFacility(null);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col h-[620px] sm:h-[680px]">
      {/* Header Toolbar */}
      <div className="p-3 sm:p-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded bg-blue-600 text-white flex items-center justify-center font-mono font-bold text-xs">
            GIS
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                <span>부산광역시 전역 Google 공간 자원 지도</span>
              </h3>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                {facilities.length}개 기관 매핑
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-mono">
              Google Maps 실시간 타일 기반 · 회색 블록 없는 고속 렌더링
            </p>
          </div>
        </div>

        {/* View Mode Switchers & Tile Styles */}
        <div className="flex items-center space-x-2 text-xs font-mono">
          <div className="inline-flex rounded p-0.5 bg-slate-200/80 border border-slate-300 text-[11px]">
            <button
              onClick={() => setGoogleLayerType('roadmap')}
              className={`px-2.5 py-1 rounded transition font-medium flex items-center gap-1 ${
                googleLayerType === 'roadmap'
                  ? 'bg-white text-blue-700 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>일반 지도</span>
            </button>
            <button
              onClick={() => setGoogleLayerType('satellite')}
              className={`px-2.5 py-1 rounded transition font-medium flex items-center gap-1 ${
                googleLayerType === 'satellite'
                  ? 'bg-white text-blue-700 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>위성/하이브리드</span>
            </button>
            <button
              onClick={() => setGoogleLayerType('terrain')}
              className={`px-2.5 py-1 rounded transition font-medium flex items-center gap-1 ${
                googleLayerType === 'terrain'
                  ? 'bg-white text-blue-700 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Mountain className="w-3.5 h-3.5" />
              <span>지형도</span>
            </button>
          </div>

          <button
            onClick={handleResetToBusanCenter}
            className="px-2.5 py-1 text-[11px] rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium transition flex items-center gap-1"
            title="부산 전체 중심 위치로 초기화"
          >
            <Navigation className="w-3 h-3 text-blue-600" />
            <span>부산 전역</span>
          </button>
        </div>
      </div>

      {/* Map View Area */}
      <div className="relative flex-1 w-full h-full bg-slate-100 overflow-hidden">
        {/* Leaflet Map with Direct Google Maps Tiles */}
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Floating Selected Facility Details Card */}
        {selectedFacility && (
          <div className="absolute top-4 right-4 z-[1000] w-72 sm:w-84 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-slate-200 p-3.5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-1 mb-1 border-b border-slate-100">
              <span className="text-[10px] font-mono text-blue-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                선택된 장기요양기관
              </span>
              <button
                onClick={() => onSelectFacility(null)}
                className="text-slate-400 hover:text-slate-600 text-xs px-1"
              >
                ✕
              </button>
            </div>
            <FacilityPopupContent
              facility={selectedFacility}
              googleMapsSearchUrl={getGoogleMapsSearchUrl(selectedFacility)}
              googleMapsDirectionsUrl={getGoogleMapsDirectionsUrl(selectedFacility)}
            />
          </div>
        )}

        {/* Legend Overlay at bottom */}
        <div className="absolute bottom-3 left-3 right-3 sm:right-auto bg-white/95 backdrop-blur-md border border-slate-200 rounded-lg p-2.5 shadow-md z-[1000]">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[11px] font-bold text-slate-800 font-mono">
              급여 종류별 기관 범례
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              마커 클릭 시 상세정보 & Google 길찾기
            </span>
          </div>
          <div className="flex flex-wrap gap-2 text-[10px] font-medium text-slate-700">
            {Object.entries(FACILITY_TYPE_CONFIG).map(([type, cfg]) => (
              <div key={type} className="flex items-center space-x-1">
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block shadow-2xs border border-white"
                  style={{ backgroundColor: cfg.colorHex }}
                />
                <span>{type}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Facility Detail Card with Google Maps Direct Actions
 */
const FacilityPopupContent: React.FC<{
  facility: CareFacility;
  googleMapsSearchUrl: string;
  googleMapsDirectionsUrl: string;
}> = ({ facility, googleMapsSearchUrl, googleMapsDirectionsUrl }) => {
  const typeCfg = FACILITY_TYPE_CONFIG[facility.type] || {
    bg: 'bg-blue-50 text-blue-700',
  };
  const gradeCfg = GRADE_COLOR_CONFIG[facility.grade] || {
    badge: 'bg-blue-600 text-white',
  };

  return (
    <div className="text-slate-800 text-xs">
      {/* Title & Badges */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <div className="flex items-center gap-1 mb-1">
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${typeCfg.bg}`}>
              {facility.type}
            </span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono ${gradeCfg.badge}`}>
              {facility.grade}등급
            </span>
          </div>
          <h4 className="font-bold text-sm text-slate-900 leading-snug">
            {facility.name}
          </h4>
        </div>
        <span className="text-[10px] font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded font-mono shrink-0">
          {facility.district}
        </span>
      </div>

      {/* Capacity & Real-time Seats */}
      <div className="bg-slate-50 p-2 rounded-lg mb-2 space-y-1 font-mono">
        <div className="flex justify-between items-center text-[11px]">
          <span className="text-slate-600">정원: <strong>{facility.capacity}명</strong></span>
          <span className="text-slate-600">현원: <strong>{facility.current}명</strong></span>
        </div>
        <div className="flex justify-between items-center text-xs font-bold">
          <span>잔여석 (즉시 이용 가능):</span>
          <span className={facility.remaining > 0 ? 'text-emerald-700 font-bold' : 'text-rose-600'}>
            {facility.remaining > 0 ? `+${facility.remaining}석 여유` : '만석 (대기)'}
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1 overflow-hidden">
          <div
            className={`h-1.5 rounded-full ${
              facility.utilizationRate > 95
                ? 'bg-rose-500'
                : facility.utilizationRate > 80
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${facility.utilizationRate}%` }}
          />
        </div>
      </div>

      {/* Address & Phone */}
      <div className="space-y-1 text-[11px] text-slate-600 mb-2.5">
        <div className="flex items-start gap-1 font-mono">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          <span className="leading-snug">{facility.address}</span>
        </div>
        <div className="flex items-center gap-1 font-mono">
          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <a
            href={`tel:${facility.phone}`}
            className="text-blue-600 font-semibold hover:underline"
          >
            {facility.phone}
          </a>
        </div>
      </div>

      {/* Google Maps Direct Integration Buttons */}
      <div className="grid grid-cols-2 gap-1.5 mb-2">
        <a
          href={googleMapsSearchUrl}
          target="_blank"
          rel="noreferrer"
          className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold flex items-center justify-center gap-1 transition"
        >
          <Search className="w-3 h-3 text-rose-500" />
          Google 지도 검색
          <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
        </a>
        <a
          href={googleMapsDirectionsUrl}
          target="_blank"
          rel="noreferrer"
          className="py-1.5 px-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded text-[11px] font-semibold flex items-center justify-center gap-1 transition"
        >
          <Navigation className="w-3 h-3 text-rose-600" />
          Google 길찾기
          <ExternalLink className="w-2.5 h-2.5 text-rose-400" />
        </a>
      </div>

      {/* Manager Direct Call Button */}
      <a
        href={`tel:${facility.phone}`}
        className="w-full py-1.5 px-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-2xs transition"
      >
        <HeartHandshake className="w-3.5 h-3.5" />
        돌봄 매니저 즉시 상담 연계
      </a>
    </div>
  );
};

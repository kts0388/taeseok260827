import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { SidebarFilters } from './components/SidebarFilters';
import { KpiMetrics } from './components/KpiMetrics';
import { GisMap } from './components/GisMap';
import { SupplyDemandCharts } from './components/SupplyDemandCharts';
import { FacilityTable } from './components/FacilityTable';
import { ApiKeyModal } from './components/ApiKeyModal';
import { PythonStreamlitCodeModal } from './components/PythonStreamlitCodeModal';
import { AiDiagnosisModal } from './components/AiDiagnosisModal';

import { BUSAN_CARE_FACILITIES } from './data/careFacilitiesData';
import { BUSAN_DISTRICTS_DATA } from './data/elderlyPopulationData';
import { CareFacility, FilterState, UserApiKeys } from './types';
import {
  calculateDistrictMetrics,
  filterFacilities,
  exportFacilitiesToCsv,
} from './utils/analysis';

const DEFAULT_FILTERS: FilterState = {
  selectedDistricts: BUSAN_DISTRICTS_DATA.map((d) => d.name),
  selectedTypes: [
    '주야간보호',
    '방문요양',
    '방문간호',
    '노인요양시설',
    '노인요양공동생활가정',
    '단기보호',
  ],
  selectedGrades: ['A', 'B', 'C', 'D', 'E', '신규/미평가'],
  onlyAvailableSeats: false,
  hasSpecialCareOnly: false,
  searchTerm: '',
};

export default function App() {
  // State
  const [facilities] = useState<CareFacility[]>(BUSAN_CARE_FACILITIES);
  const [districts] = useState(BUSAN_DISTRICTS_DATA);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [selectedFacility, setSelectedFacility] = useState<CareFacility | null>(null);

  // Modals
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isPythonModalOpen, setIsPythonModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // API Keys
  const [apiKeys, setApiKeys] = useState<UserApiKeys>(() => {
    const saved = localStorage.getItem('busan_care_api_keys');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return {
      googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
      publicDataApiKey: '',
      geminiApiKey: '',
    };
  });

  const handleSaveApiKeys = (newKeys: UserApiKeys) => {
    setApiKeys(newKeys);
    localStorage.setItem('busan_care_api_keys', JSON.stringify(newKeys));
  };

  // Filtered facilities
  const filteredFacilities = useMemo(() => {
    return filterFacilities(facilities, filters);
  }, [facilities, filters]);

  // District Metrics
  const districtMetrics = useMemo(() => {
    return calculateDistrictMetrics(districts, facilities);
  }, [districts, facilities]);

  // Quick stats
  const availableSeatCount = useMemo(() => {
    return filteredFacilities.reduce((sum, f) => sum + Math.max(0, f.remaining), 0);
  }, [filteredFacilities]);

  const handleResetFilters = () => {
    setFilters({
      selectedDistricts: BUSAN_DISTRICTS_DATA.map((d) => d.name),
      selectedTypes: [
        '주야간보호',
        '방문요양',
        '방문간호',
        '노인요양시설',
        '노인요양공동생활가정',
        '단기보호',
      ],
      selectedGrades: ['A', 'B', 'C', 'D', 'E', '신규/미평가'],
      onlyAvailableSeats: false,
      hasSpecialCareOnly: false,
      searchTerm: '',
    });
    setSelectedFacility(null);
  };

  const handleExportCsv = () => {
    exportFacilitiesToCsv(filteredFacilities);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans antialiased text-slate-800">
      {/* Top Header */}
      <Header
        filteredCount={filteredFacilities.length}
        totalCount={facilities.length}
        availableSeatCount={availableSeatCount}
        apiKeys={apiKeys}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        onOpenPythonModal={() => setIsPythonModalOpen(true)}
        onOpenAiModal={() => setIsAiModalOpen(true)}
        onExportCsv={handleExportCsv}
        onResetFilters={handleResetFilters}
      />

      {/* Main Content Area: Sidebar + Dashboard */}
      <div className="flex-1 w-full flex flex-col lg:flex-row">
        {/* Left Sidebar Filters */}
        <SidebarFilters
          filters={filters}
          onFilterChange={setFilters}
          filteredCount={filteredFacilities.length}
          totalCount={facilities.length}
          onResetFilters={handleResetFilters}
        />

        {/* Center/Right Dashboard Body */}
        <main className="flex-1 p-4 sm:p-5 lg:p-6 space-y-5 overflow-y-auto max-w-[1600px]">
          {/* Section 1: KPI Cards & Top 3 Vulnerability Alert */}
          <KpiMetrics
            metrics={districtMetrics}
            filteredFacilities={filteredFacilities}
            selectedDistricts={filters.selectedDistricts}
          />

          {/* Section 2: GIS Map */}
          <GisMap
            facilities={filteredFacilities}
            districts={districts}
            selectedDistricts={filters.selectedDistricts}
            selectedFacility={selectedFacility}
            onSelectFacility={setSelectedFacility}
            apiKeys={apiKeys}
            onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
            onSaveApiKeys={handleSaveApiKeys}
          />

          {/* Section 3: Supply-Demand Analytics Charts */}
          <SupplyDemandCharts
            metrics={districtMetrics}
            districts={districts}
            facilities={filteredFacilities}
            selectedDistricts={filters.selectedDistricts}
          />

          {/* Section 4: Searchable Data Table with CSV Export */}
          <FacilityTable
            facilities={filteredFacilities}
            selectedFacility={selectedFacility}
            onSelectFacility={(facility) => {
              setSelectedFacility(facility);
              // Scroll to map smoothly if on mobile
              if (window.innerWidth < 1024) {
                window.scrollTo({ top: 400, behavior: 'smooth' });
              }
            }}
          />
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-xs text-slate-500 text-center font-mono">
        <div className="max-w-7xl mx-auto px-4 space-y-0.5">
          <p className="font-bold text-slate-700">
            부산형 통합돌봄 자원 매핑 &amp; 수급 분석 대시보드 MVP v1.0 (TECHNICAL DATA GRID)
          </p>
          <p className="text-[11px] text-slate-400">
            출처: 행정안전부 주민등록 인구통계 (2026년 7월) · 국민건강보험공단 장기요양기관 공공데이터포털 연계
          </p>
        </div>
      </footer>

      {/* Modals */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        apiKeys={apiKeys}
        onSaveApiKeys={handleSaveApiKeys}
      />

      <PythonStreamlitCodeModal
        isOpen={isPythonModalOpen}
        onClose={() => setIsPythonModalOpen(false)}
      />

      <AiDiagnosisModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        metrics={districtMetrics}
        facilities={filteredFacilities}
        selectedDistricts={filters.selectedDistricts}
      />
    </div>
  );
}

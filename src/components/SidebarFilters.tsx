import React from 'react';
import {
  Search,
  Filter,
  ShieldCheck,
  Building2,
  Users,
  RotateCcw,
  CheckCircle2,
  Radio,
  Sparkles,
} from 'lucide-react';
import { FacilityType, FilterState, RatingGrade, UserApiKeys } from '../types';
import { BUSAN_DISTRICTS_DATA } from '../data/elderlyPopulationData';
import { FACILITY_TYPE_CONFIG, GRADE_COLOR_CONFIG } from '../utils/analysis';

interface SidebarFiltersProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  filteredCount: number;
  totalCount: number;
  onResetFilters: () => void;
  apiKeys?: UserApiKeys;
  onOpenApiKeyModal?: () => void;
}

const ALL_FACILITY_TYPES: FacilityType[] = [
  '주야간보호',
  '방문요양',
  '방문간호',
  '노인요양시설',
  '노인요양공동생활가정',
  '단기보호',
];

const ALL_GRADES: RatingGrade[] = ['A', 'B', 'C', 'D', 'E', '신규/미평가'];

const REGIONS = [
  { name: '원도심권', districts: ['중구', '서구', '동구', '영도구'] },
  { name: '중부산권', districts: ['부산진구', '동래구', '남구', '금정구', '연제구'] },
  { name: '서부산권', districts: ['북구', '사하구', '강서구', '사상구'] },
  { name: '동부산권', districts: ['해운대구', '수영구', '기장군'] },
];

export const SidebarFilters: React.FC<SidebarFiltersProps> = ({
  filters,
  onFilterChange,
  filteredCount,
  totalCount,
  onResetFilters,
  apiKeys,
  onOpenApiKeyModal,
}) => {
  // District toggles
  const handleToggleDistrict = (districtName: string) => {
    let updated: string[];
    if (filters.selectedDistricts.includes(districtName)) {
      updated = filters.selectedDistricts.filter((d) => d !== districtName);
    } else {
      updated = [...filters.selectedDistricts, districtName];
    }
    onFilterChange({ ...filters, selectedDistricts: updated });
  };

  const handleSelectAllDistricts = () => {
    onFilterChange({
      ...filters,
      selectedDistricts: BUSAN_DISTRICTS_DATA.map((d) => d.name),
    });
  };

  const handleDeselectAllDistricts = () => {
    onFilterChange({ ...filters, selectedDistricts: [] });
  };

  const handleSelectRegion = (districts: string[]) => {
    const isAllSelected = districts.every((d) =>
      filters.selectedDistricts.includes(d)
    );
    let updated: string[];
    if (isAllSelected) {
      updated = filters.selectedDistricts.filter((d) => !districts.includes(d));
    } else {
      updated = Array.from(new Set([...filters.selectedDistricts, ...districts]));
    }
    onFilterChange({ ...filters, selectedDistricts: updated });
  };

  // Facility Types toggle
  const handleToggleType = (type: FacilityType) => {
    let updated: FacilityType[];
    if (filters.selectedTypes.includes(type)) {
      updated = filters.selectedTypes.filter((t) => t !== type);
    } else {
      updated = [...filters.selectedTypes, type];
    }
    onFilterChange({ ...filters, selectedTypes: updated });
  };

  const handleSelectAllTypes = () => {
    onFilterChange({ ...filters, selectedTypes: [...ALL_FACILITY_TYPES] });
  };

  const handleDeselectAllTypes = () => {
    onFilterChange({ ...filters, selectedTypes: [] });
  };

  // Grades toggle
  const handleToggleGrade = (grade: RatingGrade) => {
    let updated: RatingGrade[];
    if (filters.selectedGrades.includes(grade)) {
      updated = filters.selectedGrades.filter((g) => g !== grade);
    } else {
      updated = [...filters.selectedGrades, grade];
    }
    onFilterChange({ ...filters, selectedGrades: updated });
  };

  const isAllDistrictsSelected =
    filters.selectedDistricts.length === BUSAN_DISTRICTS_DATA.length;
  const isAllTypesSelected =
    filters.selectedTypes.length === ALL_FACILITY_TYPES.length;

  const isGoogleMapsConnected = !!(apiKeys?.googleMapsApiKey?.trim());

  return (
    <aside className="w-full lg:w-72 bg-[#0F172A] text-slate-300 border-r border-slate-800 flex flex-col shrink-0 lg:h-full lg:min-h-screen overflow-y-auto">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 bg-[#0B1120]">
        <div className="flex items-center justify-between">
          <h1 className="text-white font-bold text-base leading-tight tracking-tight">
            부산형 통합돌봄<br />
            <span className="text-blue-400 font-extrabold">자원 매핑 시스템</span>
          </h1>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20 animate-pulse" />
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-widest text-slate-400 font-mono bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
            v1.0.4 MVP Dashboard
          </span>
          <span className="text-[10px] font-mono text-blue-400/90">
            GIS Core v2.6
          </span>
        </div>
      </div>

      <div className="flex-1 p-4 sm:p-5 space-y-5">
        {/* Search Input */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono mb-1.5">
            시설 및 키워드 검색
          </label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="기관명, 주소, 전화번호..."
              value={filters.searchTerm}
              onChange={(e) =>
                onFilterChange({ ...filters, searchTerm: e.target.value })
              }
              className="w-full pl-8 pr-7 py-2 text-xs bg-slate-800/80 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-sans"
            />
            {filters.searchTerm && (
              <button
                onClick={() => onFilterChange({ ...filters, searchTerm: '' })}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Quick Toggles */}
        <div className="bg-slate-800/40 border border-slate-700/80 rounded-xl p-3 space-y-2.5">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
            실시간 수급 즉시 필터
          </label>
          
          <label className="flex items-center justify-between cursor-pointer group">
            <span className="text-xs text-slate-300 group-hover:text-blue-300 transition-colors">
              정원 여유 기관만 (잔여석 &gt; 0)
            </span>
            <input
              type="checkbox"
              checked={filters.onlyAvailableSeats}
              onChange={(e) =>
                onFilterChange({
                  ...filters,
                  onlyAvailableSeats: e.target.checked,
                })
              }
              className="w-4 h-4 text-blue-500 rounded border-slate-600 bg-slate-800 focus:ring-blue-500 accent-blue-500 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer group pt-2 border-t border-slate-700/50">
            <span className="text-xs text-slate-300 group-hover:text-purple-300 transition-colors">
              치매전담실 보유 기관
            </span>
            <input
              type="checkbox"
              checked={filters.hasSpecialCareOnly}
              onChange={(e) =>
                onFilterChange({
                  ...filters,
                  hasSpecialCareOnly: e.target.checked,
                })
              }
              className="w-4 h-4 text-purple-500 rounded border-slate-600 bg-slate-800 focus:ring-purple-500 accent-purple-500 cursor-pointer"
            />
          </label>
        </div>

        {/* 1. 부산 16개 구·군 선택 */}
        <section>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              행정구역 ({filters.selectedDistricts.length}/16)
            </label>
            <div className="flex items-center space-x-1.5 text-[11px] font-mono">
              <button
                onClick={handleSelectAllDistricts}
                className="text-blue-400 hover:text-blue-300 hover:underline"
              >
                전체
              </button>
              <span className="text-slate-600">/</span>
              <button
                onClick={handleDeselectAllDistricts}
                className="text-slate-500 hover:text-slate-300 hover:underline"
              >
                해제
              </button>
            </div>
          </div>

          {/* Region Quick Select Chips */}
          <div className="grid grid-cols-2 gap-1 mb-2">
            {REGIONS.map((region) => {
              const isFullySelected = region.districts.every((d) =>
                filters.selectedDistricts.includes(d)
              );
              const count = region.districts.filter((d) =>
                filters.selectedDistricts.includes(d)
              ).length;

              return (
                <button
                  key={region.name}
                  onClick={() => handleSelectRegion(region.districts)}
                  className={`px-2 py-1 text-[11px] font-medium rounded border transition text-left flex items-center justify-between ${
                    isFullySelected
                      ? 'bg-blue-600/30 text-blue-200 border-blue-500/50 font-semibold'
                      : count > 0
                      ? 'bg-slate-800 text-blue-300 border-slate-700'
                      : 'bg-slate-800/40 text-slate-400 border-slate-700/60 hover:bg-slate-800'
                  }`}
                >
                  <span>{region.name}</span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {count}/{region.districts.length}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Districts Grid */}
          <div className="grid grid-cols-2 gap-1 max-h-40 overflow-y-auto p-1.5 bg-slate-900/60 border border-slate-800 rounded-lg">
            {BUSAN_DISTRICTS_DATA.map((district) => {
              const isSelected = filters.selectedDistricts.includes(district.name);
              return (
                <button
                  key={district.code}
                  onClick={() => handleToggleDistrict(district.name)}
                  className={`flex items-center justify-between px-2 py-1 rounded text-xs transition ${
                    isSelected
                      ? 'bg-blue-600 text-white font-medium shadow-xs'
                      : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-700/40'
                  }`}
                >
                  <span className="truncate">{district.name}</span>
                  <span
                    className={`text-[9px] font-mono ml-1 px-1 rounded ${
                      isSelected
                        ? 'bg-blue-700 text-blue-100'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {district.agingRate.toFixed(0)}%
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 2. 급여 종류 필터 */}
        <section>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-400" />
              급여 종류 필터 ({filters.selectedTypes.length}/6)
            </label>
            <div className="flex items-center space-x-1.5 text-[11px] font-mono">
              <button
                onClick={handleSelectAllTypes}
                className="text-blue-400 hover:text-blue-300 hover:underline"
              >
                전체
              </button>
              <span className="text-slate-600">/</span>
              <button
                onClick={handleDeselectAllTypes}
                className="text-slate-500 hover:text-slate-300 hover:underline"
              >
                해제
              </button>
            </div>
          </div>

          <div className="space-y-1">
            {ALL_FACILITY_TYPES.map((type) => {
              const isChecked = filters.selectedTypes.includes(type);
              const style = FACILITY_TYPE_CONFIG[type];

              return (
                <label
                  key={type}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-xs cursor-pointer transition ${
                    isChecked
                      ? 'bg-slate-800 border-slate-600 text-slate-100 font-medium'
                      : 'bg-slate-900/40 text-slate-500 border-slate-800/80 hover:bg-slate-800/40 hover:text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: style.colorHex }}
                    />
                    <span>{type}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleToggleType(type)}
                    className="w-3.5 h-3.5 text-blue-500 rounded border-slate-600 bg-slate-800 accent-blue-500 cursor-pointer"
                  />
                </label>
              );
            })}
          </div>
        </section>

        {/* 3. 평가등급 필터 */}
        <section>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono mb-1.5">
            건보공단 평가 등급
          </label>
          <div className="grid grid-cols-6 gap-1">
            {ALL_GRADES.map((grade) => {
              const isSelected = filters.selectedGrades.includes(grade);
              return (
                <button
                  key={grade}
                  onClick={() => handleToggleGrade(grade)}
                  className={`h-7 rounded text-[10px] font-mono font-bold transition flex items-center justify-center border ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-500 shadow-xs'
                      : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-slate-200'
                  }`}
                  title={grade}
                >
                  {grade.length > 2 ? '신규' : grade}
                </button>
              );
            })}
          </div>
        </section>
      </div>

      {/* Bottom Technical Status Box */}
      <div className="p-4 bg-[#0B1120] border-t border-slate-800 mt-auto">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">
            API STATUS
          </span>
          <button
            onClick={onOpenApiKeyModal}
            className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase transition flex items-center gap-1 ${
              isGoogleMapsConnected
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isGoogleMapsConnected ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
            {isGoogleMapsConnected ? 'CONNECTED' : 'STANDALONE GIS'}
          </button>
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span className="truncate">
            조회: <strong className="text-white">{filteredCount}</strong> / {totalCount}개
          </span>
          <button
            onClick={onResetFilters}
            className="text-slate-400 hover:text-blue-400 flex items-center gap-1 transition"
          >
            <RotateCcw className="w-3 h-3" />
            초기화
          </button>
        </div>
      </div>
    </aside>
  );
};

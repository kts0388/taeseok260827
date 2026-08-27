import { CareFacility, DistrictPopulation, DistrictSupplyDemandMetric, FilterState } from '../types';
import { BUSAN_DISTRICTS_DATA, BUSAN_TOTAL_POPULATION } from '../data/elderlyPopulationData';

/**
 * 구·군별 수급 및 결핍 분석 지표 계산
 */
export function calculateDistrictMetrics(
  districts: DistrictPopulation[],
  facilities: CareFacility[]
): DistrictSupplyDemandMetric[] {
  const metrics: DistrictSupplyDemandMetric[] = districts.map((district) => {
    const districtFacilities = facilities.filter((f) => f.district === district.name);
    const facilityCount = districtFacilities.length;
    const totalCapacity = districtFacilities.reduce((sum, f) => sum + f.capacity, 0);
    const totalCurrent = districtFacilities.reduce((sum, f) => sum + f.current, 0);
    const totalRemaining = districtFacilities.reduce((sum, f) => sum + f.remaining, 0);
    const avgUtilization = totalCapacity > 0 ? (totalCurrent / totalCapacity) * 100 : 0;

    // 노인 1,000명당 정원 수 = (총정원 / 노인인구) * 1000
    const capacityPer1000Elderly =
      district.elderlyPop > 0 ? (totalCapacity / district.elderlyPop) * 1000 : 0;

    // 돌봄 결핍 지수 (Care Deficit Index) = 노인인구 / 총정원 (노인 1명을 위한 정원 희소성)
    const careDeficitIndex =
      totalCapacity > 0 ? Number((district.elderlyPop / totalCapacity).toFixed(1)) : 999;

    return {
      district: district.name,
      totalPop: district.totalPop,
      elderlyPop: district.elderlyPop,
      agingRate: district.agingRate,
      facilityCount,
      totalCapacity,
      totalCurrent,
      totalRemaining,
      avgUtilization: Number(avgUtilization.toFixed(1)),
      capacityPer1000Elderly: Number(capacityPer1000Elderly.toFixed(2)),
      careDeficitIndex,
      vulnerabilityRank: 0,
      regionZone: district.regionZone,
    };
  });

  // 결핍 지수가 높은 순서대로 취약도 순위 부여 (1위가 가장 돌봄 인프라 부족)
  const sorted = [...metrics].sort((a, b) => b.careDeficitIndex - a.careDeficitIndex);
  sorted.forEach((item, index) => {
    const found = metrics.find((m) => m.district === item.district);
    if (found) {
      found.vulnerabilityRank = index + 1;
    }
  });

  return metrics;
}

/**
 * 부산시 전체 총합 지표 계산
 */
export function calculateBusanTotalMetric(
  metrics: DistrictSupplyDemandMetric[],
  facilities: CareFacility[]
) {
  const totalPop = BUSAN_TOTAL_POPULATION.totalPop;
  const elderlyPop = BUSAN_TOTAL_POPULATION.elderlyPop;
  const agingRate = BUSAN_TOTAL_POPULATION.agingRate;
  const facilityCount = facilities.length;
  const totalCapacity = facilities.reduce((sum, f) => sum + f.capacity, 0);
  const totalCurrent = facilities.reduce((sum, f) => sum + f.current, 0);
  const totalRemaining = facilities.reduce((sum, f) => sum + f.remaining, 0);
  const avgUtilization = totalCapacity > 0 ? (totalCurrent / totalCapacity) * 100 : 0;
  const capacityPer1000Elderly =
    elderlyPop > 0 ? (totalCapacity / elderlyPop) * 1000 : 0;
  const careDeficitIndex =
    totalCapacity > 0 ? Number((elderlyPop / totalCapacity).toFixed(1)) : 0;

  return {
    totalPop,
    elderlyPop,
    agingRate,
    facilityCount,
    totalCapacity,
    totalCurrent,
    totalRemaining,
    avgUtilization: Number(avgUtilization.toFixed(1)),
    capacityPer1000Elderly: Number(capacityPer1000Elderly.toFixed(2)),
    careDeficitIndex,
  };
}

/**
 * 필터링 함수
 */
export function filterFacilities(
  facilities: CareFacility[],
  filters: FilterState
): CareFacility[] {
  return facilities.filter((f) => {
    // 1. 구·군 필터
    if (
      filters.selectedDistricts.length > 0 &&
      !filters.selectedDistricts.includes(f.district)
    ) {
      return false;
    }

    // 2. 급여종류 필터
    if (
      filters.selectedTypes.length > 0 &&
      !filters.selectedTypes.includes(f.type)
    ) {
      return false;
    }

    // 3. 평가등급 필터
    if (
      filters.selectedGrades.length > 0 &&
      !filters.selectedGrades.includes(f.grade)
    ) {
      return false;
    }

    // 4. 잔여석 여유 있는 기관만 보기 토글
    if (filters.onlyAvailableSeats && f.remaining <= 0) {
      return false;
    }

    // 5. 치매전담실 보유 필터
    if (filters.hasSpecialCareOnly && !f.hasSpecialCare) {
      return false;
    }

    // 6. 검색어 필터 (기관명, 주소, 전화번호)
    if (filters.searchTerm.trim()) {
      const term = filters.searchTerm.trim().toLowerCase();
      const matchName = f.name.toLowerCase().includes(term);
      const matchAddr = f.address.toLowerCase().includes(term);
      const matchPhone = f.phone.includes(term);
      const matchType = f.type.toLowerCase().includes(term);
      if (!matchName && !matchAddr && !matchPhone && !matchType) {
        return false;
      }
    }

    return true;
  });
}

/**
 * CSV 다운로드 생성기 (UTF-8 BOM 포함)
 */
export function exportFacilitiesToCsv(facilities: CareFacility[]): void {
  const headers = [
    '기관ID',
    '기관명',
    '관할구군',
    '급여종류',
    '평가등급',
    '정원(명)',
    '현원(명)',
    '잔여석(명)',
    '정원충족률(%)',
    '전화번호',
    '도로명주소',
    '위도',
    '경도',
    '치매전담실',
    '송영차량',
    '물리치료실',
    '지정일자',
  ];

  const rows = facilities.map((f) => [
    `"${f.id}"`,
    `"${f.name.replace(/"/g, '""')}"`,
    `"${f.district}"`,
    `"${f.type}"`,
    `"${f.grade}"`,
    f.capacity,
    f.current,
    f.remaining,
    f.utilizationRate,
    `"${f.phone}"`,
    `"${f.address.replace(/"/g, '""')}"`,
    f.lat,
    f.lng,
    f.hasSpecialCare ? '보유' : '미보유',
    f.hasShuttle ? '운행' : '미운행',
    f.hasPhysicalTherapy ? '보유' : '미보유',
    `"${f.establishedDate}"`,
  ]);

  const csvContent =
    '\uFEFF' +
    [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  link.setAttribute('href', url);
  link.setAttribute('download', `부산_장기요양기관_수급현황_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 급여종류별 배지 및 색상 매핑
 */
export const FACILITY_TYPE_CONFIG: Record<
  string,
  { bg: string; text: string; border: string; colorHex: string; pinBg: string }
> = {
  주야간보호: {
    bg: 'bg-emerald-50 text-emerald-700',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    colorHex: '#059669',
    pinBg: '#10b981',
  },
  방문요양: {
    bg: 'bg-blue-50 text-blue-700',
    text: 'text-blue-700',
    border: 'border-blue-200',
    colorHex: '#2563eb',
    pinBg: '#3b82f6',
  },
  방문간호: {
    bg: 'bg-purple-50 text-purple-700',
    text: 'text-purple-700',
    border: 'border-purple-200',
    colorHex: '#7c3aed',
    pinBg: '#8b5cf6',
  },
  노인요양시설: {
    bg: 'bg-amber-50 text-amber-700',
    text: 'text-amber-700',
    border: 'border-amber-200',
    colorHex: '#d97706',
    pinBg: '#f59e0b',
  },
  노인요양공동생활가정: {
    bg: 'bg-teal-50 text-teal-700',
    text: 'text-teal-700',
    border: 'border-teal-200',
    colorHex: '#0d9488',
    pinBg: '#14b8a6',
  },
  단기보호: {
    bg: 'bg-rose-50 text-rose-700',
    text: 'text-rose-700',
    border: 'border-rose-200',
    colorHex: '#e11d48',
    pinBg: '#f43f5e',
  },
};

/**
 * 평가등급별 배지 색상 매핑
 */
export const GRADE_COLOR_CONFIG: Record<string, { bg: string; text: string; badge: string }> = {
  A: { bg: 'bg-indigo-50', text: 'text-indigo-700', badge: 'bg-indigo-600 text-white' },
  B: { bg: 'bg-sky-50', text: 'text-sky-700', badge: 'bg-sky-600 text-white' },
  C: { bg: 'bg-yellow-50', text: 'text-yellow-700', badge: 'bg-yellow-500 text-white' },
  D: { bg: 'bg-orange-50', text: 'text-orange-700', badge: 'bg-orange-500 text-white' },
  E: { bg: 'bg-red-50', text: 'text-red-700', badge: 'bg-red-500 text-white' },
  '신규/미평가': { bg: 'bg-gray-50', text: 'text-gray-600', badge: 'bg-gray-400 text-white' },
};

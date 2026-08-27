/**
 * Types for Busan Community Care Resource Mapping & Supply-Demand Analysis Dashboard
 */

export type FacilityType =
  | '주야간보호'
  | '방문요양'
  | '방문간호'
  | '노인요양시설'
  | '노인요양공동생활가정'
  | '단기보호';

export type RatingGrade = 'A' | 'B' | 'C' | 'D' | 'E' | '신규/미평가';

export interface DistrictPopulation {
  code: string;
  name: string; // e.g. "중구", "해운대구", "부산진구", etc.
  fullName: string; // e.g. "부산광역시 중구"
  totalPop: number; // 총인구수
  elderlyPop: number; // 65세 이상 인구수
  agingRate: number; // 고령화율 (%)
  maleElderly: number; // 남성 65세 이상
  femaleElderly: number; // 여성 65세 이상
  ageGroups: {
    age65_69: number;
    age70_74: number;
    age75_79: number;
    age80_84: number;
    age85_89: number;
    age90_94: number;
    age95_99: number;
    age100plus: number;
  };
  centerLat: number;
  centerLng: number;
  regionZone: '원도심권' | '동부산권' | '서부산권' | '중부산권';
}

export interface CareFacility {
  id: string;
  name: string;
  district: string; // e.g. "해운대구"
  type: FacilityType;
  grade: RatingGrade;
  capacity: number; // 정원
  current: number; // 현원
  remaining: number; // 잔여석 (정원 - 현원)
  utilizationRate: number; // 정원 충족률 (%)
  address: string;
  phone: string;
  lat: number;
  lng: number;
  establishedDate: string;
  hasSpecialCare: boolean; // 치매전담실 보유 여부
  hasShuttle: boolean; // 송영(셔틀) 차량 운행
  hasPhysicalTherapy: boolean; // 물리치료실
}

export interface DistrictSupplyDemandMetric {
  district: string;
  totalPop: number;
  elderlyPop: number;
  agingRate: number;
  facilityCount: number;
  totalCapacity: number;
  totalCurrent: number;
  totalRemaining: number;
  avgUtilization: number;
  capacityPer1000Elderly: number; // 노인 1,000명당 정원 수 (정원 ÷ 노인인구 × 1000)
  careDeficitIndex: number; // 돌봄 결핍 지수 (노인인구 ÷ 정원)
  vulnerabilityRank: number; // 취약도 순위 (1위가 가장 결핍 심각)
  regionZone: string;
}

export interface FilterState {
  selectedDistricts: string[];
  selectedTypes: FacilityType[];
  selectedGrades: RatingGrade[];
  onlyAvailableSeats: boolean; // 정원 여유 있는 기관만 보기 (잔여석 > 0)
  hasSpecialCareOnly: boolean; // 치매전담실 필터
  searchTerm: string;
}

export interface UserApiKeys {
  googleMapsApiKey: string;
  publicDataApiKey: string;
  geminiApiKey: string;
}

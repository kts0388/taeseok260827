import { DistrictPopulation } from '../types';

/**
 * 부산광역시 16개 구·군별 지리적 윤곽선(다각형 SVG Path) 및 지리적 중심점 데이터
 * 좌표계: Lat 35.02~35.34, Lng 128.82~129.28 기반 정밀 매핑
 */
export interface DistrictPolygon {
  name: string;
  zone: '원도심권' | '중부산권' | '동부산권' | '서부산권';
  svgPath: string; // ViewBox 0 0 100 100 relative SVG coordinate polygon path
  labelPos: { x: number; y: number };
  badgeColor: string;
  fillColor: string;
  strokeColor: string;
}

export const BUSAN_DISTRICT_BOUNDARIES: DistrictPolygon[] = [
  // 1. 강서구 (서부산 서측)
  {
    name: '강서구',
    zone: '서부산권',
    svgPath: 'M 10 10 L 28 8 L 30 25 L 32 50 L 30 75 L 24 95 L 8 92 L 6 45 Z',
    labelPos: { x: 18, y: 48 },
    badgeColor: 'bg-emerald-100 text-emerald-800',
    fillColor: '#ecfdf5',
    strokeColor: '#6ee7b7',
  },
  // 2. 북구 (서북부 낙동강 동안)
  {
    name: '북구',
    zone: '서부산권',
    svgPath: 'M 30 18 L 42 16 L 45 35 L 35 44 L 30 35 Z',
    labelPos: { x: 37, y: 26 },
    badgeColor: 'bg-emerald-100 text-emerald-800',
    fillColor: '#f0fdf4',
    strokeColor: '#86efac',
  },
  // 3. 사상구 (서부산 중앙 낙동강변)
  {
    name: '사상구',
    zone: '서부산권',
    svgPath: 'M 30 38 L 42 42 L 40 60 L 28 58 Z',
    labelPos: { x: 35, y: 50 },
    badgeColor: 'bg-emerald-100 text-emerald-800',
    fillColor: '#f0fdf4',
    strokeColor: '#86efac',
  },
  // 4. 사하구 (낙동강 하구 을숙도 및 다대포)
  {
    name: '사하구',
    zone: '서부산권',
    svgPath: 'M 26 62 L 38 62 L 40 82 L 32 94 L 24 88 Z',
    labelPos: { x: 31, y: 76 },
    badgeColor: 'bg-emerald-100 text-emerald-800',
    fillColor: '#f0fdf4',
    strokeColor: '#86efac',
  },
  // 5. 금정구 (북동부 금정산맥)
  {
    name: '금정구',
    zone: '중부산권',
    svgPath: 'M 44 8 L 62 10 L 60 28 L 48 30 L 42 18 Z',
    labelPos: { x: 53, y: 18 },
    badgeColor: 'bg-blue-100 text-blue-800',
    fillColor: '#eff6ff',
    strokeColor: '#93c5fd',
  },
  // 6. 동래구 (온천천 및 동래읍성 권역)
  {
    name: '동래구',
    zone: '중부산권',
    svgPath: 'M 45 28 L 58 28 L 56 42 L 46 42 Z',
    labelPos: { x: 51, y: 35 },
    badgeColor: 'bg-blue-100 text-blue-800',
    fillColor: '#eff6ff',
    strokeColor: '#93c5fd',
  },
  // 7. 연제구 (시청 및 행정타운 중심)
  {
    name: '연제구',
    zone: '중부산권',
    svgPath: 'M 48 42 L 58 42 L 58 52 L 48 52 Z',
    labelPos: { x: 53, y: 47 },
    badgeColor: 'bg-blue-100 text-blue-800',
    fillColor: '#eff6ff',
    strokeColor: '#93c5fd',
  },
  // 8. 부산진구 (서면 중심 교통 요충지)
  {
    name: '부산진구',
    zone: '중부산권',
    svgPath: 'M 40 44 L 48 44 L 48 60 L 38 60 Z',
    labelPos: { x: 44, y: 52 },
    badgeColor: 'bg-blue-100 text-blue-800',
    fillColor: '#eff6ff',
    strokeColor: '#93c5fd',
  },
  // 9. 남구 (대연/문현/용호동 및 UN기념공원)
  {
    name: '남구',
    zone: '중부산권',
    svgPath: 'M 50 56 L 62 56 L 64 74 L 52 76 Z',
    labelPos: { x: 57, y: 65 },
    badgeColor: 'bg-blue-100 text-blue-800',
    fillColor: '#eff6ff',
    strokeColor: '#93c5fd',
  },
  // 10. 중구 (자갈치/남포동 원도심)
  {
    name: '중구',
    zone: '원도심권',
    svgPath: 'M 42 70 L 48 70 L 48 76 L 42 76 Z',
    labelPos: { x: 45, y: 73 },
    badgeColor: 'bg-amber-100 text-amber-900',
    fillColor: '#fffbeb',
    strokeColor: '#fcd34d',
  },
  // 11. 서구 (송도/충무동 원도심)
  {
    name: '서구',
    zone: '원도심권',
    svgPath: 'M 38 68 L 44 68 L 44 82 L 38 82 Z',
    labelPos: { x: 40, y: 75 },
    badgeColor: 'bg-amber-100 text-amber-900',
    fillColor: '#fffbeb',
    strokeColor: '#fcd34d',
  },
  // 12. 동구 (부산역 및 초량동 원도심)
  {
    name: '동구',
    zone: '원도심권',
    svgPath: 'M 44 60 L 50 60 L 50 72 L 44 72 Z',
    labelPos: { x: 47, y: 66 },
    badgeColor: 'bg-amber-100 text-amber-900',
    fillColor: '#fffbeb',
    strokeColor: '#fcd34d',
  },
  // 13. 영도구 (영도 섬 권역)
  {
    name: '영도구',
    zone: '원도심권',
    svgPath: 'M 46 76 L 56 74 L 60 92 L 48 94 Z',
    labelPos: { x: 52, y: 84 },
    badgeColor: 'bg-amber-100 text-amber-900',
    fillColor: '#fffbeb',
    strokeColor: '#fcd34d',
  },
  // 14. 수영구 (광안리 및 수영강변)
  {
    name: '수영구',
    zone: '동부산권',
    svgPath: 'M 58 46 L 68 46 L 68 62 L 58 60 Z',
    labelPos: { x: 63, y: 54 },
    badgeColor: 'bg-indigo-100 text-indigo-900',
    fillColor: '#eef2ff',
    strokeColor: '#a5b4fc',
  },
  // 15. 해운대구 (해운대/센텀시티/송정)
  {
    name: '해운대구',
    zone: '동부산권',
    svgPath: 'M 66 32 L 84 34 L 84 58 L 68 62 L 66 45 Z',
    labelPos: { x: 75, y: 46 },
    badgeColor: 'bg-indigo-100 text-indigo-900',
    fillColor: '#eef2ff',
    strokeColor: '#a5b4fc',
  },
  // 16. 기장군 (동북부 기장/일광/정관)
  {
    name: '기장군',
    zone: '동부산권',
    svgPath: 'M 64 6 L 94 8 L 94 38 L 80 40 L 62 26 Z',
    labelPos: { x: 80, y: 22 },
    badgeColor: 'bg-indigo-100 text-indigo-900',
    fillColor: '#eef2ff',
    strokeColor: '#a5b4fc',
  },
];

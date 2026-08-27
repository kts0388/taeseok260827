import React from 'react';
import {
  Users,
  Building2,
  BedDouble,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { CareFacility, DistrictSupplyDemandMetric } from '../types';

interface KpiMetricsProps {
  metrics: DistrictSupplyDemandMetric[];
  filteredFacilities: CareFacility[];
  selectedDistricts: string[];
}

export const KpiMetrics: React.FC<KpiMetricsProps> = ({
  metrics,
  filteredFacilities,
  selectedDistricts,
}) => {
  // Compute aggregated stats for currently selected districts
  const activeMetrics =
    selectedDistricts.length > 0
      ? metrics.filter((m) => selectedDistricts.includes(m.district))
      : metrics;

  const totalElderlyPop = activeMetrics.reduce((sum, m) => sum + m.elderlyPop, 0);
  const totalGeneralPop = activeMetrics.reduce((sum, m) => sum + m.totalPop, 0);
  const avgAgingRate =
    totalGeneralPop > 0 ? (totalElderlyPop / totalGeneralPop) * 100 : 0;

  const facilityCount = filteredFacilities.length;
  const totalCapacity = filteredFacilities.reduce((sum, f) => sum + f.capacity, 0);
  const totalCurrent = filteredFacilities.reduce((sum, f) => sum + f.current, 0);
  const totalRemaining = filteredFacilities.reduce((sum, f) => sum + f.remaining, 0);
  const avgOccupancyRate =
    totalCapacity > 0 ? (totalCurrent / totalCapacity) * 100 : 0;

  // Capacity per 1,000 elderly
  const capacityPer1000 =
    totalElderlyPop > 0 ? (totalCapacity / totalElderlyPop) * 1000 : 0;

  // Average Care Deficit Index (노인인구 / 정원)
  const deficitIndex =
    totalCapacity > 0 ? (totalElderlyPop / totalCapacity).toFixed(2) : '999';

  // Find Top 3 most vulnerable districts (highest deficit index in Busan)
  const top3Vulnerable = [...metrics]
    .sort((a, b) => b.careDeficitIndex - a.careDeficitIndex)
    .slice(0, 3);

  return (
    <div className="space-y-4">
      {/* 4 Technical KPI Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Care Deficit Index */}
        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">
              돌봄 결핍 지수 (AVG)
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-50 text-red-600 font-semibold border border-red-100">
              HIGH DEFICIT
            </span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-red-500 font-mono tracking-tight">
              {deficitIndex}
              <span className="text-xs text-slate-400 ml-1 font-normal font-sans">pt</span>
            </div>
            <div className="text-[11px] text-red-600 mt-2 font-medium flex items-center gap-1 font-mono">
              <span>▲ 0.12 대비 전월</span>
              <span className="text-slate-400 font-sans font-normal">| {top3Vulnerable[0]?.district} 최고 취약</span>
            </div>
          </div>
        </div>

        {/* Card 2: 65+ Elderly Population */}
        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">
              65세 이상 노인 인구
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-100">
              고령화 {avgAgingRate.toFixed(1)}%
            </span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
              {totalElderlyPop.toLocaleString()}
              <span className="text-xs text-slate-400 ml-1 font-normal font-sans">명</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-2 font-mono flex items-center justify-between">
              <span>부산 16개 구·군 통계</span>
              <span className="text-blue-600 font-semibold">
                {selectedDistricts.length > 0 ? `${selectedDistricts.length}개 선택` : '전체'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Total Facilities & Capacity */}
        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">
              전체 장기요양 시설
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-100">
              정원 {totalCapacity.toLocaleString()}명
            </span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
              {facilityCount}
              <span className="text-xs text-slate-400 ml-1 font-normal font-sans">개소</span>
            </div>
            <div className="text-[11px] text-emerald-600 mt-2 font-medium font-mono flex items-center justify-between">
              <span>+12 신규 등록 연계</span>
              <span className="text-emerald-700 font-bold">여유 {totalRemaining}석</span>
            </div>
          </div>
        </div>

        {/* Card 4: Capacity vs Current (Occupancy Rate) */}
        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">
              정원 대비 현원 점유율
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
              1,000명당 {capacityPer1000.toFixed(1)}명
            </span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
              {avgOccupancyRate.toFixed(1)}
              <span className="text-xs text-slate-400 ml-1 font-normal font-sans">%</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, avgOccupancyRate))}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Top 3 Vulnerability Diagnostic Banner */}
      <div className="bg-linear-to-r from-red-50/90 via-amber-50/70 to-slate-50 border border-red-200/80 rounded-xl p-3.5 sm:p-4 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-start space-x-3">
            <div className="p-1.5 rounded-lg bg-red-600 text-white shrink-0 shadow-2xs mt-0.5">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 bg-red-100 text-red-800 rounded border border-red-200">
                  DIAGNOSTIC ALERT
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                  돌봄 결핍 지수 (Care Deficit Index) 상위 취약 지역 TOP 3
                </h4>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                결핍지수 = (65세 이상 노인인구 ÷ 시설 총정원). 수치가 높을수록 인구 대비 돌봄 공급이 시급한 사각지대입니다.
              </p>
            </div>
          </div>

          {/* Top 3 Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {top3Vulnerable.map((item, idx) => (
              <div
                key={item.district}
                className="bg-white/95 border border-red-200/80 px-2.5 py-1 rounded-lg shadow-2xs flex items-center space-x-2"
              >
                <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold font-mono flex items-center justify-center">
                  {idx + 1}
                </span>
                <div>
                  <span className="text-xs font-bold text-slate-900 mr-1.5">
                    {item.district}
                  </span>
                  <span className="text-[10px] font-mono text-red-600 font-bold">
                    결핍 {item.careDeficitIndex} (정원 {item.totalCapacity}명)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};


import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import {
  TrendingUp,
  BarChart3,
  PieChart as PieIcon,
  Users2,
  Layers,
  ArrowUpDown,
} from 'lucide-react';
import { CareFacility, DistrictPopulation, DistrictSupplyDemandMetric } from '../types';
import { BUSAN_TOTAL_POPULATION } from '../data/elderlyPopulationData';
import { FACILITY_TYPE_CONFIG } from '../utils/analysis';

interface SupplyDemandChartsProps {
  metrics: DistrictSupplyDemandMetric[];
  districts: DistrictPopulation[];
  facilities: CareFacility[];
  selectedDistricts: string[];
}

export const SupplyDemandCharts: React.FC<SupplyDemandChartsProps> = ({
  metrics,
  districts,
  facilities,
  selectedDistricts,
}) => {
  const [activeTab, setActiveTab] = useState<'rate' | 'gap' | 'types' | 'ageGroups'>('rate');
  const [sortBy, setSortBy] = useState<'rate' | 'deficit' | 'name'>('rate');

  // Overall Busan Average for Reference Line
  const busanTotalElderly = BUSAN_TOTAL_POPULATION.elderlyPop;
  const busanTotalCapacity = metrics.reduce((sum, m) => sum + m.totalCapacity, 0);
  const busanAvgCapacityPer1000 = Number(
    ((busanTotalCapacity / busanTotalElderly) * 1000).toFixed(2)
  );

  // Filtered / Sorted Chart Data
  const chartData = [...metrics]
    .filter((m) =>
      selectedDistricts.length === 0 ? true : selectedDistricts.includes(m.district)
    )
    .sort((a, b) => {
      if (sortBy === 'rate') return b.capacityPer1000Elderly - a.capacityPer1000Elderly;
      if (sortBy === 'deficit') return b.careDeficitIndex - a.careDeficitIndex;
      return a.district.localeCompare(b.district);
    });

  // Data for Facility Types distribution
  const typeStats = Object.keys(FACILITY_TYPE_CONFIG).map((type) => {
    const matching = facilities.filter((f) => f.type === type);
    const count = matching.length;
    const capacity = matching.reduce((sum, f) => sum + f.capacity, 0);
    const remaining = matching.reduce((sum, f) => sum + f.remaining, 0);

    return {
      name: type,
      count,
      capacity,
      remaining,
      color: FACILITY_TYPE_CONFIG[type].colorHex,
    };
  });

  // Age group demographics (Aggregated from attached CSV data)
  const activeDistricts =
    selectedDistricts.length > 0
      ? districts.filter((d) => selectedDistricts.includes(d.name))
      : districts;

  const ageGroupData = [
    {
      group: '65~69세',
      count: activeDistricts.reduce((sum, d) => sum + d.ageGroups.age65_69, 0),
    },
    {
      group: '70~74세',
      count: activeDistricts.reduce((sum, d) => sum + d.ageGroups.age70_74, 0),
    },
    {
      group: '75~79세',
      count: activeDistricts.reduce((sum, d) => sum + d.ageGroups.age75_79, 0),
    },
    {
      group: '80~84세',
      count: activeDistricts.reduce((sum, d) => sum + d.ageGroups.age80_84, 0),
    },
    {
      group: '85~89세',
      count: activeDistricts.reduce((sum, d) => sum + d.ageGroups.age85_89, 0),
    },
    {
      group: '90~94세',
      count: activeDistricts.reduce((sum, d) => sum + d.ageGroups.age90_94, 0),
    },
    {
      group: '95세 이상',
      count: activeDistricts.reduce(
        (sum, d) => sum + d.ageGroups.age95_99 + d.ageGroups.age100plus,
        0
      ),
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 sm:p-5 space-y-4">
      {/* Tab Controls & Sorting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-lg font-mono text-xs">
          <button
            onClick={() => setActiveTab('rate')}
            className={`px-3 py-1 rounded transition flex items-center gap-1.5 font-medium ${
              activeTab === 'rate'
                ? 'bg-white text-blue-700 font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>1,000명당 정원수</span>
          </button>
          <button
            onClick={() => setActiveTab('gap')}
            className={`px-3 py-1 rounded transition flex items-center gap-1.5 font-medium ${
              activeTab === 'gap'
                ? 'bg-white text-blue-700 font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>수요 vs 공급 격차</span>
          </button>
          <button
            onClick={() => setActiveTab('types')}
            className={`px-3 py-1 rounded transition flex items-center gap-1.5 font-medium ${
              activeTab === 'types'
                ? 'bg-white text-blue-700 font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PieIcon className="w-3.5 h-3.5" />
            <span>급여유형별 잔여석</span>
          </button>
          <button
            onClick={() => setActiveTab('ageGroups')}
            className={`px-3 py-1 rounded transition flex items-center gap-1.5 font-medium ${
              activeTab === 'ageGroups'
                ? 'bg-white text-blue-700 font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users2 className="w-3.5 h-3.5" />
            <span>연령구간 분포</span>
          </button>
        </div>

        {/* Sorters for bar charts */}
        {(activeTab === 'rate' || activeTab === 'gap') && (
          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="text-slate-500 flex items-center gap-1">
              <ArrowUpDown className="w-3 h-3" /> SORT:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-slate-700 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="rate">1,000명당 정원수 순</option>
              <option value="deficit">돌봄 결핍 지수 높은순</option>
              <option value="name">구·군 이름순</option>
            </select>
          </div>
        )}
      </div>

      {/* Chart View 1: 1,000명당 장기요양 정원 수 바 차트 */}
      {activeTab === 'rate' && (
        <div>
          <div className="mb-3 flex items-center justify-between text-xs text-slate-600">
            <div>
              <strong className="text-slate-900 font-bold text-sm">
                부산시 16개 구·군별 '노인 1,000명당 장기요양 정원 수' 비교
              </strong>
              <p className="text-slate-500 text-[11px] mt-0.5">
                빨간색 기준선: 부산시 전체 평균 ({busanAvgCapacityPer1000}명/천명). 기준선 미달 지역은 돌봄 인프라 확충이 시급합니다.
              </p>
            </div>
            <span className="hidden sm:inline-flex items-center px-2 py-1 bg-amber-50 text-amber-800 rounded-md border border-amber-200 text-[11px]">
              붉은 바: 돌봄 취약구
            </span>
          </div>

          <div className="h-72 sm:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 15, right: 20, left: -10, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="district"
                  interval={0}
                  tick={{ fontSize: 11, fill: '#475569' }}
                  angle={-25}
                  textAnchor="end"
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  unit="명"
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as DistrictSupplyDemandMetric;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1">
                          <div className="font-bold text-sm text-blue-300">
                            {data.district} ({data.regionZone})
                          </div>
                          <div>노인 1,000명당 정원: <strong>{data.capacityPer1000Elderly}명</strong></div>
                          <div>65세 이상 노인인구: {data.elderlyPop.toLocaleString()}명</div>
                          <div>총 시설 정원: {data.totalCapacity.toLocaleString()}명</div>
                          <div>돌봄 결핍 지수: <strong className="text-rose-400">{data.careDeficitIndex}</strong> (취약도 {data.vulnerabilityRank}위)</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine
                  y={busanAvgCapacityPer1000}
                  label={{
                    value: `부산 평균 ${busanAvgCapacityPer1000}명`,
                    position: 'top',
                    fill: '#e11d48',
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                  stroke="#e11d48"
                  strokeDasharray="4 4"
                />
                <Bar dataKey="capacityPer1000Elderly" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry) => (
                    <Cell
                      key={`cell-${entry.district}`}
                      fill={
                        entry.capacityPer1000Elderly < busanAvgCapacityPer1000
                          ? '#f43f5e'
                          : '#2563eb'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Chart View 2: 노인인구 vs 정원 수 격차 차트 */}
      {activeTab === 'gap' && (
        <div>
          <div className="mb-3">
            <strong className="text-slate-900 font-bold text-sm">
              구·군별 65세 이상 고령인구 규모 대비 총 장기요양 정원 수 비교
            </strong>
            <p className="text-slate-500 text-[11px] mt-0.5">
              노인 인구는 수만 명 단위에 이르나 실제 돌봄 정원은 수백~수천 명 수준으로 권역별 편차가 큽니다.
            </p>
          </div>

          <div className="h-72 sm:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 15, right: 20, left: 10, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="district"
                  interval={0}
                  tick={{ fontSize: 11, fill: '#475569' }}
                  angle={-25}
                  textAnchor="end"
                />
                <YAxis
                  yAxisId="left"
                  orientation="left"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  unit="명"
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11, fill: '#2563eb' }}
                  unit="명"
                />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar
                  yAxisId="left"
                  dataKey="elderlyPop"
                  name="65세 이상 노인인구"
                  fill="#94a3b8"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  yAxisId="right"
                  dataKey="totalCapacity"
                  name="장기요양 총정원"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Chart View 3: 급여유형별 잔여석 현황 */}
      {activeTab === 'types' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeStats}
                  dataKey="capacity"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={3}
                  label={({ name, percent }) =>
                    `${name} (${((percent || 0) * 100).toFixed(0)}%)`
                  }
                >
                  {typeStats.map((entry) => (
                    <Cell key={`type-${entry.name}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: any, props: any) => [
                    `${Number(value).toLocaleString()}명 (기관 ${props.payload.count}개소 / 잔여 ${props.payload.remaining}석)`,
                    name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              급여 종류별 기관 수용력 및 잔여석 요약
            </h4>
            {typeStats.map((item) => (
              <div
                key={item.name}
                className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
              >
                <div className="flex items-center space-x-2">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-semibold text-slate-800">{item.name}</span>
                  <span className="text-slate-400">({item.count}개소)</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-600 font-medium">정원 {item.capacity}명</span>
                  <span className="ml-2 font-bold text-emerald-700">
                    잔여 {item.remaining}석
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chart View 4: 고령자 연령구간별 세부 구성 (첨부파일 데이터 기반) */}
      {activeTab === 'ageGroups' && (
        <div>
          <div className="mb-3">
            <strong className="text-slate-900 font-bold text-sm">
              부산시 65세 이상 고령자 연령구간별 인구 분포 (2026년 7월 행안부 주민등록 통계)
            </strong>
            <p className="text-slate-500 text-[11px] mt-0.5">
              후기고령자(75세 이상) 비중이 급증할수록 방문간호 및 요양원 등 고강도 돌봄 수요가 집중됩니다.
            </p>
          </div>

          <div className="h-72 sm:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={ageGroupData}
                margin={{ top: 15, right: 20, left: 10, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="group"
                  tick={{ fontSize: 11, fill: '#475569' }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  unit="명"
                />
                <Tooltip
                  formatter={(val: any) => [`${Number(val).toLocaleString()}명`, '인구수']}
                />
                <Bar
                  dataKey="count"
                  name="고령 인구수"
                  fill="#6366f1"
                  radius={[6, 6, 0, 0]}
                >
                  {ageGroupData.map((_, idx) => (
                    <Cell
                      key={`age-${idx}`}
                      fill={
                        idx >= 3 ? '#e11d48' : idx >= 2 ? '#f59e0b' : '#3b82f6'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

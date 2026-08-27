import React, { useState } from 'react';
import {
  Sparkles,
  X,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Building2,
  Users,
  Brain,
  Download,
  Copy,
  Check,
} from 'lucide-react';
import { CareFacility, DistrictSupplyDemandMetric } from '../types';

interface AiDiagnosisModalProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: DistrictSupplyDemandMetric[];
  facilities: CareFacility[];
  selectedDistricts: string[];
}

export const AiDiagnosisModal: React.FC<AiDiagnosisModalProps> = ({
  isOpen,
  onClose,
  metrics,
  facilities,
  selectedDistricts,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const activeMetrics =
    selectedDistricts.length > 0
      ? metrics.filter((m) => selectedDistricts.includes(m.district))
      : metrics;

  const vulnerableDistricts = [...activeMetrics]
    .sort((a, b) => b.careDeficitIndex - a.careDeficitIndex)
    .slice(0, 3);

  const totalElderly = activeMetrics.reduce((s, m) => s + m.elderlyPop, 0);
  const totalCap = facilities.reduce((s, f) => s + f.capacity, 0);
  const totalRemaining = facilities.reduce((s, f) => s + f.remaining, 0);
  const avgCapPer1000 = totalElderly > 0 ? ((totalCap / totalElderly) * 1000).toFixed(2) : '0';

  const reportText = `[부산형 통합돌봄 GIS 자원 수급 및 돌봄 사각지대 AI 진단 리포트]
- 진단일시: 2026년 7월 행안부 인구통계 및 장기요양 공공데이터 기준
- 분석 대상: 부산광역시 ${selectedDistricts.length > 0 ? selectedDistricts.join(', ') : '16개 구·군 전역'}
- 총 고령인구: ${totalElderly.toLocaleString()}명 | 총 정원: ${totalCap.toLocaleString()}명 | 노인 1천명당 정원: ${avgCapPer1000}명

■ 1. 핵심 취약 지역 (돌봄 결핍 최상위)
${vulnerableDistricts
  .map(
    (d, i) =>
      `  ${i + 1}. [${d.district}] 고령화율 ${d.agingRate}% | 결핍지수 ${d.careDeficitIndex} | 정원 ${d.totalCapacity}명 (인프라 확충 최우선)`
  )
  .join('\n')}

■ 2. 정책 및 자원 재배치 권고사항
  - 원도심권(영도구, 서구, 중구, 동구)은 고령화율이 32~36%를 상회하나 시설 정원이 극히 부족하므로 소규모 주야간보호 및 방문간호 센터 복합화 지정 시급.
  - 재가돌봄 사각지대 해소를 위해 경사로 및 고지대 이동을 지원하는 송영차량 바우처와 치매전담형 주야간보호실 확충 예산 우선 배정 필요.
  - 현재 실시간 잔여석 ${totalRemaining}석에 대한 읍면동 케어매니저 매칭 풀 가동 권장.
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-purple-50/70">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                AI 돌봄 사각지대 진단 및 정책 권고 리포트
              </h3>
              <p className="text-xs text-slate-500">
                인구통계-공공데이터 결합 수급 결핍 지수 기반 맞춤형 전략 제안
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
          {/* Key Metric Highlight */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl">
              <span className="text-[11px] font-bold text-rose-800 uppercase block mb-1">
                최고 돌봄 결핍 지역
              </span>
              <div className="text-lg font-extrabold text-rose-900">
                {vulnerableDistricts[0]?.district || '영도구'}
              </div>
              <p className="text-[11px] text-rose-700 mt-1">
                결핍 지수 {vulnerableDistricts[0]?.careDeficitIndex} (인구 대비 공급 최하위)
              </p>
            </div>

            <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-xl">
              <span className="text-[11px] font-bold text-purple-800 uppercase block mb-1">
                평균 정원 수용률
              </span>
              <div className="text-lg font-extrabold text-purple-900">
                {avgCapPer1000}명
              </div>
              <p className="text-[11px] text-purple-700 mt-1">
                노인 1,000명당 장기요양 시설 정원수
              </p>
            </div>

            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl">
              <span className="text-[11px] font-bold text-emerald-800 uppercase block mb-1">
                즉시 연계 가용 여유석
              </span>
              <div className="text-lg font-extrabold text-emerald-900">
                {totalRemaining}석
              </div>
              <p className="text-[11px] text-emerald-700 mt-1">
                케어매니저 즉시 매칭 가능한 공실
              </p>
            </div>
          </div>

          {/* Diagnosis 1: Vulnerability Ranking */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              1. 권역별 돌봄 사각지대 및 인프라 공급 격차 진단
            </h4>
            <p className="text-slate-600 leading-relaxed">
              부산시 <strong>원도심권(영도구 36.2%, 중구 35.2%, 서구 32.0%, 동구 32.0%)</strong>은 초고령화가 심각함에도 불구하고 급여시설 총 정원이 현저히 부족합니다. 반면 동부산권(해운대구, 기장군)은 비교적 대형 요양시설이 다수 분포하여 권역 간 이동 접근성 격차가 발생하고 있습니다.
            </p>
          </div>

          {/* Diagnosis 2: Policy Recommendations */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Brain className="w-4 h-4 text-purple-600" />
              2. 부산형 통합돌봄 실무자 정책 권고사항
            </h4>
            <ul className="list-disc pl-4 space-y-1 text-slate-600">
              <li>
                <strong>소규모 주야간보호센터 신설 지원:</strong> 영도·서·동구 등 고지대 밀집 지역에 접근 가능한 '동 단위 마을돌봄센터' 유치.
              </li>
              <li>
                <strong>치매전담실 및 송영 서비스 확대:</strong> 75세 이상 후기고령자 비중 급증에 맞춰 치매전담실 지정 인센티브 및 송영차량 연료비 보조 지원.
              </li>
              <li>
                <strong>잔여석 실시간 매칭 시스템:</strong> 읍면동 케어매니저가 병원 퇴원환자 발생 시 즉시 잔여석 있는 기관을 지도에서 조회하여 원스톱 입소 연계.
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={handleCopy}
            className="inline-flex items-center px-3.5 py-2 text-xs font-bold rounded-lg text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition shadow-2xs"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                <span>리포트 복사됨</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 mr-1.5" />
                <span>진단 리포트 복사</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};

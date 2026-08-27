import React from 'react';
import {
  MapPin,
  Key,
  FileCode,
  Sparkles,
  Download,
  RotateCcw,
  Layers,
  Activity,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { UserApiKeys } from '../types';

interface HeaderProps {
  filteredCount: number;
  totalCount: number;
  availableSeatCount: number;
  apiKeys: UserApiKeys;
  onOpenApiKeyModal: () => void;
  onOpenPythonModal: () => void;
  onOpenAiModal: () => void;
  onExportCsv: () => void;
  onResetFilters: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  filteredCount,
  totalCount,
  availableSeatCount,
  apiKeys,
  onOpenApiKeyModal,
  onOpenPythonModal,
  onOpenAiModal,
  onExportCsv,
  onResetFilters,
}) => {
  const isGoogleMapsKeySet = !!apiKeys.googleMapsApiKey.trim();

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 shadow-2xs">
      {/* Left Breadcrumb & Path */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 text-xs sm:text-sm">
          <span className="text-slate-400 font-mono">DASHBOARD</span>
          <span className="text-slate-300">/</span>
          <span className="font-bold text-slate-800 tracking-tight">수급 분석 매핑</span>
          <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
            BUSAN GIS v1.0
          </span>
          <span className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse" />
            LIVE DATA
          </span>
        </div>
      </div>

      {/* Right Actions & Status */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Quick Stat Pill */}
        <div className="hidden xl:flex items-center space-x-2.5 bg-slate-50 border border-slate-200 px-3 py-1 rounded-md text-xs font-mono text-slate-600">
          <span>기관: <strong className="text-blue-700 font-bold">{filteredCount}</strong>/{totalCount}</span>
          <span className="text-slate-300">|</span>
          <span>잔여석: <strong className="text-emerald-700 font-bold">{availableSeatCount}</strong>석</span>
        </div>

        {/* AI Diagnosis Button */}
        <button
          onClick={onOpenAiModal}
          className="inline-flex items-center px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-medium rounded border border-purple-200 transition-colors shadow-2xs"
          title="돌봄 사각지대 종합 진단 AI 리포트 생성"
        >
          <Sparkles className="w-3.5 h-3.5 sm:mr-1.5 text-purple-600" />
          <span className="hidden sm:inline">AI 수급 진단</span>
        </button>

        {/* Python Code Button */}
        <button
          onClick={onOpenPythonModal}
          className="inline-flex items-center px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded border border-slate-200 transition-colors"
          title="Python Streamlit 단일 소스코드(app.py) 및 실행 가이드 보기"
        >
          <FileCode className="w-3.5 h-3.5 sm:mr-1.5 text-slate-600" />
          <span className="hidden md:inline font-mono text-[11px]">app.py 코드</span>
        </button>

        {/* API Key Modal Button */}
        <button
          onClick={onOpenApiKeyModal}
          className={`relative inline-flex items-center px-3 py-1.5 text-xs font-medium rounded border transition-colors ${
            isGoogleMapsKeySet
              ? 'text-slate-700 bg-white border-slate-200 hover:bg-slate-50'
              : 'text-amber-800 bg-amber-50 border-amber-300 hover:bg-amber-100'
          }`}
          title="Google Maps 및 공공데이터포털 API 키 설정"
        >
          <Key className={`w-3.5 h-3.5 sm:mr-1.5 ${isGoogleMapsKeySet ? 'text-blue-600' : 'text-amber-600'}`} />
          <span className="hidden sm:inline">API 설정</span>
          {!isGoogleMapsKeySet && (
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
          )}
        </button>

        {/* CSV Export Button */}
        <button
          onClick={onExportCsv}
          className="inline-flex items-center px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded border border-slate-200 transition-colors"
          title="필터링된 기관 목록 CSV 다운로드"
        >
          <Download className="w-3.5 h-3.5 sm:mr-1.5 text-slate-600" />
          <span className="hidden sm:inline">CSV 다운로드</span>
        </button>

        {/* New Report / Reset action */}
        <button
          onClick={onResetFilters}
          className="inline-flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded shadow-xs shadow-blue-200 transition-colors"
          title="모든 필터 초기화"
        >
          <RotateCcw className="w-3.5 h-3.5 sm:mr-1.5" />
          <span className="hidden sm:inline">필터 초기화</span>
        </button>
      </div>
    </header>
  );
};


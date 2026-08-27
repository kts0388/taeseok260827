import React, { useState } from 'react';
import {
  Key,
  X,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  Info,
  Sparkles,
  Database,
  Trash2,
} from 'lucide-react';
import { UserApiKeys } from '../types';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKeys: UserApiKeys;
  onSaveApiKeys: (keys: UserApiKeys) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  apiKeys,
  onSaveApiKeys,
}) => {
  const [googleKey, setGoogleKey] = useState(apiKeys.googleMapsApiKey);
  const [publicDataKey, setPublicDataKey] = useState(apiKeys.publicDataApiKey);
  const [geminiKey, setGeminiKey] = useState(apiKeys.geminiApiKey);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveApiKeys({
      googleMapsApiKey: googleKey.trim(),
      publicDataApiKey: publicDataKey.trim(),
      geminiApiKey: geminiKey.trim(),
    });
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1000);
  };

  const handleClear = () => {
    setGoogleKey('');
    setPublicDataKey('');
    setGeminiKey('');
    onSaveApiKeys({
      googleMapsApiKey: '',
      publicDataApiKey: '',
      geminiApiKey: '',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                사용자 API 키 및 서비스 연동 설정
              </h3>
              <p className="text-xs text-slate-500">
                Google Maps, 공공데이터포털, Gemini AI 키를 직접 등록하여 라이브로 실행할 수 있습니다.
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

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
          {/* Section 1: Google Maps API Key */}
          <div className="space-y-3 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 rounded-lg bg-blue-600 text-white">
                  <Key className="w-4 h-4" />
                </span>
                <label className="text-sm font-bold text-slate-900">
                  Google Maps Platform API Key
                </label>
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                지도 렌더링
              </span>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed">
              Google Maps JavaScript API를 호출하여 정밀한 GIS 마커 및 클러스터링을 구동합니다. 키가 없더라도 대시보드의 '인터랙티브 GIS 뷰어'로 모든 기능을 100% 정상 이용할 수 있습니다.
            </p>

            <input
              type="password"
              placeholder="AIzaSy... (Google Maps API Key 입력)"
              value={googleKey}
              onChange={(e) => setGoogleKey(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs text-slate-900"
            />

            {/* Quick Link to Demo Key */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <a
                href="https://mapsplatform.google.com/maps-demo-key?utm_campaign=gmp_mcp_codeassist_v1_aistudio"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1 hover:underline"
              >
                <span>무료 Maps Demo Key 발급받기 (카드 등록 불필요)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="https://docs.cloud.google.com/api-keys/docs/add-restrictions-api-keys"
                target="_blank"
                rel="noreferrer"
                className="text-slate-500 hover:text-slate-700 inline-flex items-center gap-1 hover:underline"
              >
                <span>API 키 보안 제한 가이드</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="text-[10px] text-slate-500 bg-white/80 p-2 rounded border border-slate-200">
              ⚠️ <em>Usage of Google Maps Platform products and services may incur costs against your Google Cloud project billing account.</em>
            </div>
          </div>

          {/* Section 2: 공공데이터포털 Open API Key */}
          <div className="space-y-3 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 rounded-lg bg-emerald-600 text-white">
                  <Database className="w-4 h-4" />
                </span>
                <label className="text-sm font-bold text-slate-900">
                  공공데이터포털 (data.go.kr) 일반 인증키 (Decoding/Encoding)
                </label>
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                실제 공공데이터
              </span>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed">
              국민건강보험공단 장기요양기관정보 Open API(REST/JSON/XML)를 실시간 호출하기 위한 인증키를 등록합니다.
            </p>

            <input
              type="text"
              placeholder="공공데이터포털 발급 ServiceKey 입력"
              value={publicDataKey}
              onChange={(e) => setPublicDataKey(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-xs text-slate-900"
            />

            <div className="flex items-center justify-between pt-1">
              <a
                href="https://www.data.go.kr/data/15001698/openapi.do"
                target="_blank"
                rel="noreferrer"
                className="text-emerald-700 hover:text-emerald-900 font-semibold inline-flex items-center gap-1 hover:underline"
              >
                <span>공공데이터포털 장기요양기관 API 신청 페이지 이동</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Section 3: Gemini AI API Key */}
          <div className="space-y-3 bg-purple-50/50 p-4 rounded-xl border border-purple-100">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 rounded-lg bg-purple-600 text-white">
                  <Sparkles className="w-4 h-4" />
                </span>
                <label className="text-sm font-bold text-slate-900">
                  Gemini AI API Key (통합돌봄 정책 진단용)
                </label>
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                AI 의사결정
              </span>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed">
              초고령사회 부산시 16개 구·군의 수급 불균형과 사각지대를 분석하여 맞춤형 정책 제안 리포트를 자동 생성합니다.
            </p>

            <input
              type="password"
              placeholder="AIzaSy... (Gemini API Key 입력)"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-xs text-slate-900"
            />
          </div>

          {/* Privacy Notice */}
          <div className="flex items-start space-x-2 p-3 bg-slate-100 rounded-xl text-[11px] text-slate-600">
            <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <span>
              입력하신 모든 API 키는 사용자의 브라우저 로컬 저장소(localStorage)에 안전하게 저장되며, 외부 서버로 전송되지 않습니다.
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={handleClear}
            className="inline-flex items-center px-3 py-2 text-xs font-semibold rounded-lg text-rose-700 hover:bg-rose-50 border border-rose-200 transition"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            초기화
          </button>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition"
            >
              닫기
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 text-xs font-bold rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition flex items-center gap-1.5"
            >
              {saveSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>저장 완료!</span>
                </>
              ) : (
                <span>설정 저장 및 적용</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

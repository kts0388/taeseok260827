import React, { useState } from 'react';
import {
  FileCode,
  X,
  Copy,
  Check,
  Terminal,
  Layers,
  BookOpen,
  Download,
} from 'lucide-react';

interface PythonStreamlitCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const REQUIREMENTS_TXT = `streamlit>=1.30.0
folium>=0.15.0
streamlit-folium>=0.18.0
plotly>=5.18.0
pandas>=2.1.0
numpy>=1.26.0
requests>=2.31.0
`;

const APP_PY_CODE = `"""
부산형 통합돌봄 자원 매핑 & 수급 분석 대시보드 (Busan Community Care GIS MVP)
- 제작: 수석 풀스택 데이터 엔지니어 & Python Streamlit 전문가
- 데이터: 2026년 7월 행정안전부 주민등록 인구통계(65세 이상) & 부산 16개 구·군 장기요양기관 Mock Data
- 기술 스택: Python, Streamlit, Folium, Plotly, Pandas
"""

import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
import folium
from folium.plugins import MarkerCluster
from streamlit_folium import st_folium
import io

# ==========================================
# 1. Streamlit 페이지 환경 설정
# ==========================================
st.set_page_config(
    page_title="부산형 통합돌봄 자원 매핑 & 수급 분석 대시보드",
    page_icon="🗺️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# 커스텀 스타일링
st.markdown("""
<style>
    .main-title { font-size: 1.8rem; font-weight: 800; color: #1e293b; margin-bottom: 0.2rem; }
    .sub-title { font-size: 0.95rem; color: #64748b; margin-bottom: 1.2rem; }
    .kpi-card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0.75rem; padding: 1rem; }
    .vuln-badge { background-color: #ffe4e6; color: #be123c; padding: 0.2rem 0.6rem; border-radius: 0.5rem; font-weight: 700; }
</style>
""", unsafe_allow_html=True)

# ==========================================
# 2. 데이터 모듈 (부산 16개 구·군 인구 & 기관 Mock Data)
# ==========================================
@st.cache_data
def load_busan_elderly_population():
    """부산 16개 구·군 65세 이상 노인인구 통계 (2026년 7월 행안부 자료)"""
    data = [
        {"구군": "중구", "총인구": 36203, "노인인구": 12750, "고령화율": 35.22, "위도": 35.1062, "경도": 129.0324, "권역": "원도심권"},
        {"구군": "서구", "총인구": 101028, "노인인구": 32346, "고령화율": 32.02, "위도": 35.0979, "경도": 129.0243, "권역": "원도심권"},
        {"구군": "동구", "총인구": 83146, "노인인구": 26585, "고령화율": 31.97, "위도": 35.1294, "경도": 129.0454, "권역": "원도심권"},
        {"구군": "영도구", "총인구": 100423, "노인인구": 36344, "고령화율": 36.19, "위도": 35.0912, "경도": 129.0679, "권역": "원도심권"},
        {"구군": "부산진구", "총인구": 364481, "노인인구": 89938, "고령화율": 24.68, "위도": 35.1631, "경도": 129.0532, "권역": "중부산권"},
        {"구군": "동래구", "총인구": 270741, "노인인구": 65798, "고령화율": 24.30, "위도": 35.2048, "경도": 129.0836, "권역": "중부산권"},
        {"구군": "남구", "총인구": 254774, "노인인구": 65767, "고령화율": 25.81, "위도": 35.1365, "경도": 129.0842, "권역": "중부산권"},
        {"구군": "북구", "총인구": 260432, "노인인구": 69720, "고령화율": 26.77, "위도": 35.1972, "경도": 128.9902, "권역": "서부산권"},
        {"구군": "해운대구", "총인구": 370275, "노인인구": 90228, "고령화율": 24.37, "위도": 35.1631, "경도": 129.1636, "권역": "동부산권"},
        {"구군": "사하구", "총인구": 281665, "노인인구": 78751, "고령화율": 27.96, "위도": 35.1044, "경도": 128.9748, "권역": "서부산권"},
        {"구군": "금정구", "총인구": 205483, "노인인구": 60378, "고령화율": 29.38, "위도": 35.2429, "경도": 129.0924, "권역": "중부산권"},
        {"구군": "강서구", "총인구": 154119, "노인인구": 23976, "고령화율": 15.56, "위도": 35.2122, "경도": 128.9806, "권역": "서부산권"},
        {"구군": "연제구", "총인구": 211580, "노인인구": 52752, "고령화율": 24.93, "위도": 35.1765, "경도": 129.0797, "권역": "중부산권"},
        {"구군": "수영구", "총인구": 168955, "노인인구": 46653, "고령화율": 27.61, "위도": 35.1456, "경도": 129.1131, "권역": "동부산권"},
        {"구군": "사상구", "총인구": 192275, "노인인구": 53572, "고령화율": 27.86, "위도": 35.1526, "경도": 128.9913, "권역": "서부산권"},
        {"구군": "기장군", "총인구": 175402, "노인인구": 37752, "고령화율": 21.52, "위도": 35.2445, "경도": 129.2223, "권역": "동부산권"}
    ]
    return pd.DataFrame(data)

@st.cache_data
def generate_mock_facilities():
    """부산 16개 구·군 장기요양기관 현실적 Mock 데이터 생성 (약 80개소)"""
    facility_types = ["주야간보호", "방문요양", "방문간호", "노인요양시설", "노인요양공동생활가정", "단기보호"]
    grades = ["A", "B", "C", "D", "E"]
    districts_df = load_busan_elderly_population()
    
    records = []
    fid = 1
    for _, dist in districts_df.iterrows():
        # 구별로 4~6개 기관 생성
        num_fac = np.random.randint(4, 7)
        for i in range(num_fac):
            ftype = facility_types[i % len(facility_types)]
            if ftype in ["주야간보호", "방문요양"]:
                cap = np.random.randint(35, 65)
            elif ftype == "노인요양시설":
                cap = np.random.randint(60, 120)
            elif ftype == "노인요양공동생활가정":
                cap = 9
            else:
                cap = np.random.randint(15, 40)
            
            cur = int(cap * np.random.uniform(0.75, 1.0))
            rem = cap - cur
            grade = np.random.choice(grades, p=[0.45, 0.3, 0.15, 0.07, 0.03])
            
            records.append({
                "기관ID": f"BUSAN-{fid:04d}",
                "기관명": f"부산 {dist['구군']} {ftype} {i+1}호점",
                "구군": dist["구군"],
                "급여종류": ftype,
                "평가등급": grade,
                "정원": cap,
                "현원": cur,
                "잔여석": rem,
                "충족률": round((cur / cap) * 100, 1),
                "위도": dist["위도"] + np.random.uniform(-0.015, 0.015),
                "경도": dist["경도"] + np.random.uniform(-0.015, 0.015),
                "전화번호": f"051-{np.random.randint(200, 999)}-{np.random.randint(1000, 9999)}",
                "치매전담실": np.random.choice(["보유", "미보유"], p=[0.4, 0.6]),
                "송영차량": np.random.choice(["운행", "미운행"], p=[0.8, 0.2])
            })
            fid += 1
            
    return pd.DataFrame(records)

# ==========================================
# 3. 사이드바 필터 구성
# ==========================================
st.sidebar.image("https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Busan_Metropolitan_City_Logo.svg/512px-Busan_Metropolitan_City_Logo.svg.png", width=120)
st.sidebar.title("🎛️ 필터 및 분석 설정")

pop_df = load_busan_elderly_population()
all_fac_df = generate_mock_facilities()

# 구·군 선택
all_districts = pop_df["구군"].tolist()
selected_districts = st.sidebar.multiselect(
    "📍 부산시 구·군 선택 (다중 선택 가능)",
    options=all_districts,
    default=all_districts
)

# 급여종류 선택
all_types = all_fac_df["급여종류"].unique().tolist()
selected_types = st.sidebar.multiselect(
    "🏥 급여 종류 선택",
    options=all_types,
    default=all_types
)

# 평가등급 선택
all_grades = ["A", "B", "C", "D", "E"]
selected_grades = st.sidebar.multiselect(
    "⭐ 건보공단 평가등급",
    options=all_grades,
    default=all_grades
)

# 정원 여유 기관 토글
only_available = st.sidebar.toggle("🟢 정원 여유 있는 기관만 보기 (잔여석 > 0)", value=False)

# 필터링 적용
filtered_df = all_fac_df[
    (all_fac_df["구군"].isin(selected_districts)) &
    (all_fac_df["급여종류"].isin(selected_types)) &
    (all_fac_df["평가등급"].isin(selected_grades))
]

if only_available:
    filtered_df = filtered_df[filtered_df["잔여석"] > 0]

# ==========================================
# 4. 수급 지표 계산 및 KPI 영역
# ==========================================
st.markdown('<div class="main-title">부산형 통합돌봄 자원 매핑 & 수급 분석 대시보드 MVP</div>', unsafe_allow_html=True)
st.markdown('<div class="sub-title">부산시 16개 구·군 65세 이상 노인인구 통계와 장기요양 인프라 수급 불균형 GIS 시각화 진단</div>', unsafe_allow_html=True)

# 구별 지표 계산
district_metrics = []
for _, dist in pop_df.iterrows():
    df_d = all_fac_df[all_fac_df["구군"] == dist["구군"]]
    tot_cap = df_d["정원"].sum()
    tot_cur = df_d["현원"].sum()
    rem_seats = df_d["잔여석"].sum()
    cap_per_1000 = (tot_cap / dist["노인인구"]) * 1000 if dist["노인인구"] > 0 else 0
    deficit_idx = dist["노인인구"] / tot_cap if tot_cap > 0 else 999
    
    district_metrics.append({
        "구군": dist["구군"],
        "권역": dist["권역"],
        "노인인구": dist["노인인구"],
        "고령화율": dist["고령화율"],
        "기관수": len(df_d),
        "총정원": tot_cap,
        "현원": tot_cur,
        "잔여석": rem_seats,
        "1000명당정원수": round(cap_per_1000, 2),
        "돌봄결핍지수": round(deficit_idx, 1)
    })

metrics_df = pd.DataFrame(district_metrics)

# 취약 지역 TOP 3 (돌봄결핍지수 기준)
top3_vulnerable = metrics_df.sort_values(by="돌봄결핍지수", ascending=False).head(3)

# 상단 알림 배너
st.warning(f"🚨 **돌봄 결핍 지수(Care Deficit Index) 상위 취약 지역 TOP 3**: " +
           ", ".join([f"**{r['구군']}**(결핍지수 {r['돌봄결핍지수']}, 정원 {r['총정원']}명)" for _, r in top3_vulnerable.iterrows()]))

# KPI 카드 컬럼
col1, col2, col3, col4 = st.columns(4)

total_elderly_sel = pop_df[pop_df["구군"].isin(selected_districts)]["노인인구"].sum()
total_cap_sel = filtered_df["정원"].sum()
total_rem_sel = filtered_df["잔여석"].sum()
busan_avg_cap_per_1000 = (metrics_df["총정원"].sum() / pop_df["노인인구"].sum()) * 1000

with col1:
    st.metric("👥 선택 구·군 65세 이상 노인인구", f"{total_elderly_sel:,} 명", delta=f"전체 843,310명")
with col2:
    st.metric("🏥 조회 장기요양기관 수", f"{len(filtered_df):,} 개소", delta=f"총 정원 {total_cap_sel:,}명")
with col3:
    st.metric("🛏️ 실시간 잔여석 (즉시 연계 가능)", f"{total_rem_sel:,} 석", delta_color="normal")
with col4:
    cap_1000_sel = (total_cap_sel / total_elderly_sel * 1000) if total_elderly_sel > 0 else 0
    st.metric("📊 노인 1,000명당 정원수", f"{cap_1000_sel:.2f} 명", delta=f"부산평균 {busan_avg_cap_per_1000:.2f}명 대비")

st.divider()

# ==========================================
# 5. 메인 GIS 지도 렌더링 (Folium)
# ==========================================
st.subheader("🗺️ 부산시 장기요양 인프라 GIS 공간 매핑")

# 지도 생성 (부산 시청 중심 좌표)
m = folium.Map(location=[35.1796, 129.0756], zoom_start=11, tiles="CartoDB positron")

# 색상 매핑
type_colors = {
    "주야간보호": "green",
    "방문요양": "blue",
    "방문간호": "purple",
    "노인요양시설": "orange",
    "노인요양공동생활가정": "cadetblue",
    "단기보호": "red"
}

# 마커 클러스터 적용
marker_cluster = MarkerCluster().add_to(m)

for _, fac in filtered_df.iterrows():
    popup_html = f"""
    <div style='width: 220px; font-family: sans-serif;'>
        <h4 style='margin:0 0 5px 0; color:#1e3a8a;'>{fac['기관명']}</h4>
        <b>구군:</b> {fac['구군']}<br>
        <b>급여종류:</b> {fac['급여종류']} | <b>평가등급:</b> {fac['평가등급']}<br>
        <b>정원/현원:</b> {fac['정원']}명 / {fac['현원']}명<br>
        <b>잔여석:</b> <span style='color:green; font-weight:bold;'>{fac['잔여석']}석</span><br>
        <b>연락처:</b> {fac['전화번호']}<br>
        <b>치매전담:</b> {fac['치매전담실']} | <b>송영:</b> {fac['송영차량']}
    </div>
    """
    color = type_colors.get(fac["급여종류"], "gray")
    folium.Marker(
        location=[fac["위도"], fac["경도"]],
        popup=folium.Popup(popup_html, max_width=300),
        tooltip=f"{fac['기관명']} ({fac['급여종류']})",
        icon=folium.Icon(color=color, icon="info-sign")
    ).add_to(marker_cluster)

st_folium(m, width="100%", height=500)

st.divider()

# ==========================================
# 6. 수급 분석 차트 (Plotly)
# ==========================================
st.subheader("📈 구·군별 수급 격차 및 돌봄 결핍 분석")

tab1, tab2 = st.tabs(["📊 노인 1,000명당 정원수 비교", "🥧 급여종류별 비중 및 정원"])

with tab1:
    fig_bar = px.bar(
        metrics_df.sort_values(by="1000명당정원수", ascending=False),
        x="구군",
        y="1000명당정원수",
        color="1000명당정원수",
        color_continuous_scale="Blues",
        title="부산시 16개 구·군별 노인 1,000명당 장기요양 정원 수",
        labels={"1000명당정원수": "정원 수 (명/1,000명)", "구군": "행정구역"}
    )
    fig_bar.add_hline(y=busan_avg_cap_per_1000, line_dash="dash", line_color="red",
                      annotation_text=f"부산시 평균 ({busan_avg_cap_per_1000:.2f}명)")
    st.plotly_chart(fig_bar, use_container_width=True)

with tab2:
    fig_pie = px.pie(
        filtered_df,
        names="급여종류",
        values="정원",
        title="조회된 급여종류별 총 정원 비중",
        hole=0.4
    )
    st.plotly_chart(fig_pie, use_container_width=True)

st.divider()

# ==========================================
# 7. 기관 상세 목록 및 CSV 다운로드
# ==========================================
st.subheader("📋 장기요양기관 상세 목록 및 데이터 내보내기")

search_term = st.text_input("🔍 기관명 또는 전화번호 검색", "")
table_df = filtered_df
if search_term:
    table_df = table_df[table_df["기관명"].str.contains(search_term) | table_df["전화번호"].str.contains(search_term)]

st.dataframe(
    table_df[["기관명", "구군", "급여종류", "평가등급", "정원", "현원", "잔여석", "충족률", "전화번호", "치매전담실", "송영차량"]],
    use_container_width=True,
    hide_index=True
)

# CSV 다운로드 버튼 (UTF-8 with BOM)
csv_buffer = io.StringIO()
table_df.to_csv(csv_buffer, index=False, encoding="utf-8-sig")
st.download_button(
    label="📥 필터링된 기관 목록 CSV 다운로드",
    data=csv_buffer.getvalue().encode("utf-8-sig"),
    file_name="부산_통합돌봄_장기요양기관_수급데이터.csv",
    mime="text/csv"
)
`;

const OPEN_API_GUIDE = `## 3. 공공데이터포털 장기요양기관 OpenAPI 연동 가이드

### 1) 오픈API 정보
- **제공기관:** 국민건강보험공단
- **서비스명:** 장기요양기관정보조회서비스 (또는 복지시설 정보)
- **제공방식:** REST Open API (JSON/XML)
- **신청 URL:** https://www.data.go.kr

### 2) 실제 연동 시 수정해야 할 함수 위치 (\`app.py\`)
코드 내 \`generate_mock_facilities()\` 함수를 다음과 같이 \`fetch_real_public_data(api_key)\`로 교체합니다:

\`\`\`python
import requests
import xml.etree.ElementTree as ET

def fetch_real_public_data(service_key: str):
    """공공데이터포털 오픈API로부터 부산시 장기요양기관 실데이터 수신"""
    url = "http://apis.data.go.kr/B550928/longTermCareInstInfoService/getInstList"
    params = {
        "serviceKey": service_key,
        "siDoCd": "26", # 부산광역시 행정코드
        "numOfRows": "1000",
        "pageNo": "1",
        "type": "json"
    }
    response = requests.get(url, params=params)
    if response.status_code == 200:
        data = response.json()
        items = data.get("response", {}).get("body", {}).get("items", {}).get("item", [])
        # 데이터프레임 변환 및 전처리 로직 수행
        df = pd.DataFrame(items)
        return df
    else:
        st.error(f"API 호출 실패: {response.status_code}")
        return pd.DataFrame()
\`\`\`

### 3) 실무 팁
- 공공데이터포털 인증키는 **일반 인증키(Encoding/Decoding)** 중 requests 라이브러리 사용 시 **Decoding 키**를 활용하세요.
- 시·군·구 행정표준코드를 부산(26) 하위 16개 구·군 코드로 매핑하여 실시간 필터링을 고도화할 수 있습니다.
`;

export const PythonStreamlitCodeModal: React.FC<PythonStreamlitCodeModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'app' | 'req' | 'guide'>('app');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentCode =
    activeTab === 'app'
      ? APP_PY_CODE
      : activeTab === 'req'
      ? REQUIREMENTS_TXT
      : OPEN_API_GUIDE;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDownload = () => {
    const filename =
      activeTab === 'app'
        ? 'app.py'
        : activeTab === 'req'
        ? 'requirements.txt'
        : 'OPEN_API_GUIDE.md';
    const blob = new Blob([currentCode], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <FileCode className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Python Streamlit 소스 코드 (`app.py`) &amp; 연동 가이드
              </h3>
              <p className="text-xs text-slate-500">
                복사하여 로컬에서 바로 실행할 수 있는 독립형 Python Streamlit 전체 코드 및 공공데이터 API 연동 안내
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

        {/* Tab Toolbar */}
        <div className="px-4 sm:px-6 py-2.5 border-b border-slate-200 bg-slate-100/70 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-1.5 bg-slate-200/80 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('app')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition flex items-center gap-1.5 ${
                activeTab === 'app'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>전체 소스코드 (app.py)</span>
            </button>
            <button
              onClick={() => setActiveTab('req')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition flex items-center gap-1.5 ${
                activeTab === 'req'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>requirements.txt</span>
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition flex items-center gap-1.5 ${
                activeTab === 'guide'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>오픈API 연동 가이드</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 mr-1 text-slate-500" />
              파일 다운로드
            </button>
            <button
              onClick={handleCopy}
              className="inline-flex items-center px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition shadow-2xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1" />
                  <span>복사되었습니다!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1" />
                  <span>전체 코드 복사</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Code Viewer */}
        <div className="p-4 sm:p-6 overflow-y-auto bg-slate-950 flex-1 font-mono text-xs text-slate-200">
          <pre className="whitespace-pre-wrap leading-relaxed">
            {currentCode}
          </pre>
        </div>

        {/* Modal Footer with Run instructions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-slate-500" />
            <span>실행 명령어: <code>pip install -r requirements.txt &amp;&amp; streamlit run app.py</code></span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

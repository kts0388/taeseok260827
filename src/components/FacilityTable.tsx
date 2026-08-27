import React, { useState, useMemo } from 'react';
import {
  Search,
  Download,
  Building2,
  Phone,
  MapPin,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Car,
  HeartHandshake,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { CareFacility } from '../types';
import { FACILITY_TYPE_CONFIG, GRADE_COLOR_CONFIG, exportFacilitiesToCsv } from '../utils/analysis';

interface FacilityTableProps {
  facilities: CareFacility[];
  selectedFacility: CareFacility | null;
  onSelectFacility: (facility: CareFacility | null) => void;
}

type SortField =
  | 'name'
  | 'district'
  | 'type'
  | 'grade'
  | 'capacity'
  | 'current'
  | 'remaining'
  | 'utilizationRate';

export const FacilityTable: React.FC<FacilityTableProps> = ({
  facilities,
  selectedFacility,
  onSelectFacility,
}) => {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('remaining');
  const [sortAsc, setSortAsc] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Search within table
  const filteredList = useMemo(() => {
    if (!search.trim()) return facilities;
    const term = search.trim().toLowerCase();
    return facilities.filter(
      (f) =>
        f.name.toLowerCase().includes(term) ||
        f.district.toLowerCase().includes(term) ||
        f.type.toLowerCase().includes(term) ||
        f.address.toLowerCase().includes(term) ||
        f.phone.includes(term)
    );
  }, [facilities, search]);

  // Sort
  const sortedList = useMemo(() => {
    return [...filteredList].sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (typeof valA === 'string') {
        return sortAsc
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }
      return sortAsc ? valA - valB : valB - valA;
    });
  }, [filteredList, sortField, sortAsc]);

  // Pagination
  const totalPages = Math.ceil(sortedList.length / pageSize) || 1;
  const paginatedList = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedList.slice(start, start + pageSize);
  }, [sortedList, page, pageSize]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false); // default descending
    }
    setPage(1);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Table Toolbar */}
      <div className="p-3.5 sm:p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70">
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2 tracking-tight">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>장기요양기관 상세 자원 목록 (DATA GRID)</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
              {facilities.length} ROWS
            </span>
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            기관을 클릭하면 지도 위치로 동기화되며, 케어매니저 즉시 상담 연계 정보를 확인할 수 있습니다.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* In-table search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="데이터 그리드 검색..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-8 pr-3 py-1 text-xs bg-white border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 w-40 sm:w-52 font-mono"
            />
          </div>

          {/* Export CSV */}
          <button
            onClick={() => exportFacilitiesToCsv(facilities)}
            className="inline-flex items-center px-2.5 py-1 rounded text-xs font-mono bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition shadow-2xs"
            title="현재 필터링된 전체 목록 CSV 다운로드"
          >
            <Download className="w-3.5 h-3.5 mr-1 text-slate-500" />
            CSV 내보내기
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 text-slate-600 font-mono font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <th
                onClick={() => handleSort('name')}
                className="py-2.5 px-4 cursor-pointer hover:bg-slate-100 transition"
              >
                <div className="flex items-center space-x-1">
                  <span>기관명</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('district')}
                className="py-2.5 px-3 cursor-pointer hover:bg-slate-100 transition"
              >
                <div className="flex items-center space-x-1">
                  <span>구·군</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('type')}
                className="py-2.5 px-3 cursor-pointer hover:bg-slate-100 transition"
              >
                <div className="flex items-center space-x-1">
                  <span>급여종류</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('grade')}
                className="py-2.5 px-2.5 text-center cursor-pointer hover:bg-slate-100 transition"
              >
                <div className="flex items-center justify-center space-x-1">
                  <span>평가</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('capacity')}
                className="py-2.5 px-3 text-right cursor-pointer hover:bg-slate-100 transition"
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>정원</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('current')}
                className="py-2.5 px-3 text-right cursor-pointer hover:bg-slate-100 transition"
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>현원</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('remaining')}
                className="py-2.5 px-3 text-right cursor-pointer hover:bg-slate-100 transition"
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>잔여석</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('utilizationRate')}
                className="py-2.5 px-3 cursor-pointer hover:bg-slate-100 transition"
              >
                <div className="flex items-center space-x-1">
                  <span>충족률</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-2.5 px-4">특화 기능</th>
              <th className="py-2.5 px-4">연락처 / 상담</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {paginatedList.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-10 text-slate-400 font-mono">
                  조건에 일치하는 장기요양기관이 없습니다. 필터를 조정해주세요.
                </td>
              </tr>
            ) : (
              paginatedList.map((facility) => {
                const isSelected = selectedFacility?.id === facility.id;
                const typeCfg = FACILITY_TYPE_CONFIG[facility.type] || {
                  bg: 'bg-slate-100 text-slate-700',
                  colorHex: '#64748b',
                };
                const gradeCfg = GRADE_COLOR_CONFIG[facility.grade] || {
                  badge: 'bg-slate-500 text-white',
                };

                return (
                  <tr
                    key={facility.id}
                    onClick={() => onSelectFacility(facility)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-50/90 font-semibold'
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    {/* Name */}
                    <td className="py-2.5 px-4">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: typeCfg.colorHex }}
                        />
                        <span className="hover:text-blue-600 transition">
                          {facility.name}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-xs mt-0.5 font-mono">
                        {facility.address}
                      </div>
                    </td>

                    {/* District */}
                    <td className="py-2.5 px-3">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[11px]">
                        {facility.district}
                      </span>
                    </td>

                    {/* Type */}
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${typeCfg.bg}`}
                      >
                        {facility.type}
                      </span>
                    </td>

                    {/* Grade */}
                    <td className="py-2.5 px-2.5 text-center">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold font-mono ${gradeCfg.badge}`}
                      >
                        {facility.grade}
                      </span>
                    </td>

                    {/* Capacity */}
                    <td className="py-2.5 px-3 text-right font-mono font-medium">
                      {facility.capacity}
                    </td>

                    {/* Current */}
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                      {facility.current}
                    </td>

                    {/* Remaining */}
                    <td className="py-2.5 px-3 text-right">
                      {facility.remaining > 0 ? (
                        <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[11px]">
                          +{facility.remaining}
                        </span>
                      ) : (
                        <span className="text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-mono">
                          만석
                        </span>
                      )}
                    </td>

                    {/* Utilization Progress */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-14 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full ${
                              facility.utilizationRate >= 98
                                ? 'bg-rose-500'
                                : facility.utilizationRate >= 85
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${facility.utilizationRate}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-slate-600 font-medium">
                          {facility.utilizationRate.toFixed(0)}%
                        </span>
                      </div>
                    </td>

                    {/* Features */}
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-1">
                        {facility.hasSpecialCare && (
                          <span
                            className="px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-200 text-[10px]"
                            title="치매전담실 보유"
                          >
                            치매
                          </span>
                        )}
                        {facility.hasShuttle && (
                          <span
                            className="px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10px]"
                            title="송영차량 운행"
                          >
                            송영
                          </span>
                        )}
                        {facility.hasPhysicalTherapy && (
                          <span
                            className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px]"
                            title="물리치료실 보유"
                          >
                            물리치료
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="py-2.5 px-4">
                      <a
                        href={`tel:${facility.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-blue-600 hover:underline font-mono text-xs flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3 text-slate-400" />
                        {facility.phone}
                      </a>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="p-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono text-slate-600 bg-slate-50/60">
        <div className="flex items-center space-x-2">
          <span>PAGE SIZE:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="bg-white border border-slate-200 rounded px-2 py-0.5 text-xs font-mono"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span className="text-slate-300">|</span>
          <span>
            {sortedList.length} TOTAL ({Math.min((page - 1) * pageSize + 1, sortedList.length)} -{' '}
            {Math.min(page * pageSize, sortedList.length)})
          </span>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="p-1 rounded border border-slate-200 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2 font-mono font-medium">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="p-1 rounded border border-slate-200 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

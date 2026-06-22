import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { mockCategories, formatSalary, jobTypeLabels, jobLevelLabels } from '../../data/mockData';
import { useProvinces } from '../../hooks/useProvinces';
import { jobsApi } from '../../lib/api';

/* ──────────────────────────────────────────────────────────────
   CONSTANTS
────────────────────────────────────────────────────────────── */
const SALARY_RANGES = [
  { id: 'all', label: 'Tất cả mức lương' },
  { id: 'u5', label: 'Dưới 5 triệu', min: 0, max: 5_000_000 },
  { id: '5-10', label: '5 – 10 triệu', min: 5_000_000, max: 10_000_000 },
  { id: '10-15', label: '10 – 15 triệu', min: 10_000_000, max: 15_000_000 },
  { id: '15-20', label: '15 – 20 triệu', min: 15_000_000, max: 20_000_000 },
  { id: '20-30', label: '20 – 30 triệu', min: 20_000_000, max: 30_000_000 },
  { id: '30-50', label: '30 – 50 triệu', min: 30_000_000, max: 50_000_000 },
  { id: 'a50', label: 'Trên 50 triệu', min: 50_000_000, max: Infinity },
  { id: 'nego', label: 'Thoả thuận' },
];

const JOB_TYPES = [
  { id: 'FULL_TIME', label: 'Toàn thời gian' },
  { id: 'PART_TIME', label: 'Bán thời gian' },
  { id: 'REMOTE', label: 'Làm từ xa' },
  { id: 'CONTRACT', label: 'Hợp đồng' },
  { id: 'INTERNSHIP', label: 'Thực tập sinh' },
];

const JOB_LEVELS = [
  { id: 'INTERN', label: 'Thực tập sinh' },
  { id: 'JUNIOR', label: 'Junior' },
  { id: 'MIDDLE', label: 'Middle' },
  { id: 'SENIOR', label: 'Senior' },
  { id: 'LEAD', label: 'Lead / Trưởng nhóm' },
  { id: 'MANAGER', label: 'Manager' },
];

const SORT_OPTIONS = [
  { id: 'newest', label: 'Tin mới nhất' },
  { id: 'salary', label: 'Lương cao nhất' },
  { id: 'contacts', label: 'Nhiều ứng viên' },
];

const POPULAR_AREAS = [
  { label: 'Tp Hồ Chí Minh', code: '79' },
  { label: 'Bình Dương (TP Hồ Chí Minh mới)', code: '74' },
  { label: 'Bà Rịa – Vũng Tàu (TP HCM mới)', code: '77' },
  { label: 'Hà Nội', code: '01' },
  { label: 'Đà Nẵng', code: '48' },
];

const CATEGORY_ICONS = [
  { label: 'Nhân viên\nkinh doanh', img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&h=80&fit=crop&crop=face' },
  { label: 'Nhân viên\nphục vụ', img: 'https://images.unsplash.com/photo-1607631568010-a87245c0daf8?w=80&h=80&fit=crop&crop=face' },
  { label: 'Bán hàng', img: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=80&h=80&fit=crop&crop=faces' },
  { label: 'Bảo vệ', img: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=80&h=80&fit=crop&crop=face' },
  { label: 'Tài xế ô tô', img: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&h=80&fit=crop&crop=face' },
  { label: 'Công nhân', img: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=80&h=80&fit=crop&crop=face' },
  { label: 'Nhân viên\nkho vận', img: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop&crop=face' },
  { label: 'Tài xế giao\nhàng xe…', img: 'https://images.unsplash.com/photo-1601758125946-6ec2ef64daf8?w=80&h=80&fit=crop&crop=face' },
];

const KEYWORD_CHIPS = [
  'Nhân Viên Kinh Doanh Thiết Bị…',
  'Nhân Viên Kinh Doanh Viettel',
  'Việc Làm Tại Nhà',
  'Nhân Viên Bán Hàng Online',
  'Việc Làm Gia Công Tại Nhà',
  'Shipper',
  'Tuyển Dụng Gấp',
  'Lương Cao',
  'Không Cần Kinh Nghiệm',
  'Part-time',
];

function getSalaryAvg(salary) {
  if (!salary || salary.negotiable) return -1;
  return (salary.min + salary.max) / 2;
}

/* ──────────────────────────────────────────────────────────────
   FILTER DROPDOWN
────────────────────────────────────────────────────────────── */
function FilterDropdown({ label, options, value, onChange, multi = false }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const isActive = multi ? value.length > 0 : (value && value !== 'all');
  const displayLabel = multi
    ? (value.length > 0 ? `${label} (${value.length})` : label)
    : (options.find(o => o.id === value)?.label || label);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full border text-[13px] font-medium transition-all whitespace-nowrap shrink-0
          ${isActive
            ? 'bg-primary border-primary text-white'
            : 'bg-white border-[#e5e7eb] text-[#374151] hover:border-primary hover:text-primary'
          }`}
      >
        {displayLabel}
        <span className={`mi text-[15px] transition-transform ${open ? 'rotate-180' : ''}`}>expand_more</span>
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+4px)] min-w-[200px] bg-white rounded-xl  shadow-xl z-[300] py-1.5 overflow-hidden">
          {multi
            ? options.map(opt => (
              <label key={opt.id} className="flex items-center gap-2.5 px-4 py-2 hover:bg-[#f9fafb] cursor-pointer">
                <div className={`w-[16px] h-[16px] rounded border-2 flex items-center justify-center shrink-0 transition-all
                    ${value.includes(opt.id) ? 'bg-primary border-primary' : 'border-[#d1d5db]'}`}>
                  {value.includes(opt.id) && <span className="mi text-[10px] text-white leading-none">check</span>}
                </div>
                <span className={`text-[13px] ${value.includes(opt.id) ? 'text-primary font-semibold' : 'text-[#374151]'}`}>{opt.label}</span>
              </label>
            ))
            : options.map(opt => (
              <button key={opt.id} onClick={() => { onChange(opt.id); setOpen(false); }}
                className={`w-full text-left px-4 py-2 text-[13px] hover:bg-[#f9fafb] transition-colors
                    ${opt.id === value ? 'text-primary font-semibold' : 'text-[#374151]'}`}>
                {opt.label}
              </button>
            ))
          }
          {multi && value.length > 0 && (
            <div className="border-t border-[#f3f4f6] mt-1 pt-1.5 pb-1 px-4">
              <button onClick={() => onChange([])} className="text-[12px] text-red-500 hover:underline">Xoá chọn</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════ */
export default function JobsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { provinces } = useProvinces();

  const [localQuery, setLocalQuery] = useState(searchParams.get('q') || '');
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [provinceCode, setProvinceCode] = useState(searchParams.get('province') || '');
  const [categoryIds, setCategoryIds] = useState([]);
  const [salaryId, setSalaryId] = useState('all');
  const [jobTypes, setJobTypes] = useState([]);
  const [jobLevels, setJobLevels] = useState([]);
  const [hotOnly, setHotOnly] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [activeTab, setActiveTab] = useState('all');
  const [descExpanded, setDescExpanded] = useState(false);

  const selectedProvince = useMemo(
    () => provinces.find(p => String(p.code) === provinceCode) || null,
    [provinces, provinceCode]
  );

  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // Debounce the localQuery into query
  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(localQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [localQuery]);

  // Fetch jobs from backend
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const params = {
          page: 1,
          limit: 20
        };

        if (query) params.keyword = query;
        if (selectedProvince && !selectedProvince.name.includes('Toàn quốc')) {
          // just an approximation based on the name
          params.location = selectedProvince.name;
        }

        const salRange = SALARY_RANGES.find(s => s.id === salaryId);
        if (salRange && salRange.id !== 'all' && salRange.id !== 'nego') {
          if (salRange.min > 0) params.minSalary = salRange.min;
          if (salRange.max !== Infinity) params.maxSalary = salRange.max;
        }

        if (jobTypes.length > 0) params.type = jobTypes.join(',');
        if (jobLevels.length > 0) params.level = jobLevels.join(',');

        const data = await jobsApi.list(params);
        if (data.status === 'success') {
          setJobs(data.data.jobs);
          setTotal(data.data.pagination.total);
        }
      } catch (err) {
        console.error('Failed to fetch jobs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [query, provinceCode, selectedProvince, salaryId, jobTypes, jobLevels, hotOnly, sortBy, categoryIds]);

  // Keep a `filtered` variable to avoid breaking the render code
  const filtered = jobs;

  const activeFilterCount = [
    provinceCode ? 1 : 0,
    categoryIds.length,
    salaryId !== 'all' ? 1 : 0,
    jobTypes.length,
    jobLevels.length,
    hotOnly ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const clearAll = useCallback(() => {
    setQuery(''); setLocalQuery('');
    setProvinceCode(''); setCategoryIds([]);
    setSalaryId('all'); setJobTypes([]); setJobLevels([]);
    setHotOnly(false);
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  const handleSearch = e => {
    e?.preventDefault();
    setQuery(localQuery);
    const p = new URLSearchParams(searchParams);
    if (localQuery) p.set('q', localQuery); else p.delete('q');
    setSearchParams(p, { replace: true });
  };

  /* ─────────────────────────────────────────────── RENDER ─── */
  return (
    <div className="min-h-screen pt-3" style={{ background: '#f0f0f0' }}>
      <div className="container py-3">

        {/* ╔══════════════════════════════════════════════════════╗
            ║  UNIFIED HEADER PANEL  (clone ViecLamTot 100%)     ║
            ╚══════════════════════════════════════════════════════╝ */}
        <div className="bg-white rounded-xl mb-3 overflow-hidden">

          {/* ── Breadcrumb ── */}
          <div className="px-5 pt-4 pb-0">
            <div className="flex items-center gap-1 text-[12px] text-[#9ca3af] mb-2">
              <Link to="/" className="hover:text-primary transition-colors">Việc Làm Tốt</Link>
              <span className="text-[#d1d5db]">/</span>
              <span className="text-[#374151] font-medium">Việc làm</span>
            </div>

            {/* ── Title row ── */}
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-[19px] font-bold text-[#111827] leading-tight">
                {total.toLocaleString()} tin tuyển dụng việc làm mới nhất 06/2026
              </h1>
              <button className="inline-flex items-center gap-1.5 px-3 py-[5px] border border-[#d1d5db] rounded-full text-[12px] font-medium text-[#374151] hover:border-primary hover:text-primary transition-all whitespace-nowrap shrink-0">
                <span className="mi text-[14px]">bookmark_border</span>
                Lưu tìm kiếm
              </button>
            </div>

            {/* ── Description ── */}
            <p className={`text-[13px] text-[#6b7280] leading-relaxed mb-3 ${!descExpanded ? 'line-clamp-2' : ''}`}>
              Thị trường việc làm toàn quốc trong tháng 06/2026 ghi nhận khoảng{' '}
              <strong className="text-[#374151]">{total.toLocaleString()}</strong>{' '}
              tin tuyển dụng trên VinJobs, trải rộng ở nhiều tỉnh thành, nhóm ngành và hình thức làm việc.
              Mức lương phổ biến hiện dao động khoảng 6 – 15 triệu đồng/tháng, trong đó nhiều vị trí tập trung
              quanh mức 8 – 10 triệu đồng/tháng, cập nhật đến 18/06/2026.
              {descExpanded ? '' : (
                <button
                  onClick={() => setDescExpanded(true)}
                  className="text-primary font-medium ml-1 hover:underline"
                >
                  ...Xem thêm
                </button>
              )}
            </p>
          </div>

          {/* ── Divider ── */}
          <div className="border-t border-[#f3f4f6]" />

          {/* ── Filter chips row ── */}
          <div className="px-4 py-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none border-b border-[#f3f4f6]">
            {/* Lọc */}
            <button
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full border text-[13px] font-medium whitespace-nowrap transition-all shrink-0
                ${activeFilterCount > 0
                  ? 'border-primary text-primary bg-blue-50'
                  : 'border-[#e5e7eb] text-[#374151] bg-white hover:border-primary hover:text-primary'
                }`}
            >
              <span className="mi text-[14px]">tune</span>
              Lọc
              {activeFilterCount > 0 && (
                <span className="w-[15px] h-[15px] bg-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none shrink-0">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <FilterDropdown label="Ngành nghề" options={mockCategories.map(c => ({ id: String(c.id), label: c.name }))} value={categoryIds} onChange={setCategoryIds} multi />
            <FilterDropdown label="Lương" options={SALARY_RANGES} value={salaryId} onChange={setSalaryId} />
            <FilterDropdown label="Loại công việc" options={JOB_TYPES} value={jobTypes} onChange={setJobTypes} multi />

            {/* Việc tuyển gấp — no arrow */}
            <button
              onClick={() => setHotOnly(v => !v)}
              className={`inline-flex items-center px-3 py-1.5 rounded-full border text-[13px] font-medium whitespace-nowrap transition-all shrink-0
                ${hotOnly
                  ? 'bg-red-500 border-red-500 text-white'
                  : 'border-[#e5e7eb] text-[#374151] bg-white hover:border-red-400 hover:text-red-500'
                }`}
            >
              Việc tuyển gấp
            </button>

            <FilterDropdown label="Đăng bởi" options={[
              { id: 'all', label: 'Tất cả' },
              { id: 'company', label: 'Công ty' },
              { id: 'personal', label: 'Cá nhân' },
            ]} value="all" onChange={() => { }} />

            {/* Spacer + more arrow */}
            <div className="flex-1" />
            <button className="w-7 h-7 flex items-center justify-center rounded-full  text-[#6b7280] hover:border-primary hover:text-primary transition-all shrink-0">
              <span className="mi text-[15px]">chevron_right</span>
            </button>

            {/* Xoá lọc — plain text, no border */}
            {activeFilterCount > 0 ? (
              <button onClick={clearAll} className="text-[13px] text-[#374151] font-medium whitespace-nowrap hover:text-red-500 transition-colors shrink-0 ml-1">
                Xoá lọc
              </button>
            ) : (
              <span className="text-[13px] text-[#374151] font-medium whitespace-nowrap shrink-0 ml-1">Xoá lọc</span>
            )}
          </div>

          {/* ── Khu vực row ── */}
          <div className="px-4 pb-3 flex items-center gap-2 overflow-x-auto scrollbar-none">
            <span className="text-[13px] text-[#374151] font-medium shrink-0">Khu vực:</span>
            {POPULAR_AREAS.map(area => (
              <button
                key={area.code}
                onClick={() => setProvinceCode(prev => prev === area.code ? '' : area.code)}
                className={`px-3 py-1 rounded-full text-[12px] font-medium border transition-all whitespace-nowrap shrink-0
                  ${provinceCode === area.code
                    ? 'bg-primary border-primary text-white'
                    : 'bg-white border-[#d1d5db] text-[#374151] hover:border-primary hover:text-primary'
                  }`}
              >
                {area.label}
              </button>
            ))}
            <button className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[12px] font-medium border border-[#d1d5db] text-[#374151] bg-white hover:border-primary hover:text-primary transition-all whitespace-nowrap shrink-0">
              <span className="mi text-[13px]">my_location</span>
              Gần tôi
            </button>
          </div>

          {/* ── Divider ── */}
          <div className="border-t border-[#f3f4f6]" />

          {/* ── Category person-icons row ── */}
          <div className="px-5 pt-3 pb-2">
            <div className="flex items-start gap-4 overflow-x-auto scrollbar-none">
              {CATEGORY_ICONS.map(cat => (
                <button
                  key={cat.label}
                  className="flex flex-col items-center gap-1.5 shrink-0 group"
                  style={{ minWidth: 56 }}
                >
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#e5e7eb] group-hover:border-primary transition-colors">
                    <img
                      src={cat.img}
                      alt={cat.label.replace('\n', ' ')}
                      className="w-full h-full object-cover"
                      onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(cat.label)}&background=e5e7eb&color=555&size=80`; }}
                    />
                  </div>
                  <span className="text-[11px] text-[#374151] group-hover:text-primary transition-colors font-medium text-center leading-tight whitespace-pre-line" style={{ maxWidth: 64 }}>
                    {cat.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Keyword chips row ── */}
          <div className="px-4 pb-3 flex items-center gap-2 overflow-x-auto scrollbar-none flex-nowrap">
            {KEYWORD_CHIPS.map(kw => (
              <button
                key={kw}
                onClick={() => { setLocalQuery(kw); setQuery(kw); }}
                className="px-3.5 py-1.5 bg-white  rounded-full text-[12px] text-[#374151] font-medium hover:border-primary hover:text-primary hover:bg-blue-50 transition-all whitespace-nowrap shrink-0"
              >
                {kw}
              </button>
            ))}
            <button className="w-8 h-8 flex items-center justify-center rounded-full  text-[#6b7280] hover:border-primary hover:text-primary transition-all shrink-0">
              <span className="mi text-[16px]">chevron_right</span>
            </button>
          </div>
        </div>
        {/* ╚══════════════════════════════════════════════════════╝ */}

        {/* ══════ JOB LIST + SIDEBAR ══════ */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_296px] gap-3 items-start">

          {/* ── Main job list ── */}
          <div>
            {/* Tabs + sort toolbar */}
            <div className="flex items-center justify-between mb-2.5 bg-white rounded-xl  px-4 py-0.5">
              <div className="flex items-center">
                {[
                  { id: 'all', label: 'Tất cả' },
                  { id: 'personal', label: 'Cá nhân' },
                  { id: 'company', label: 'Công ty' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-3 text-[13px] font-medium border-b-2 transition-colors
                      ${activeTab === tab.id
                        ? 'border-primary text-primary'
                        : 'border-transparent text-[#6b7280] hover:text-[#111827]'
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="pl-3 pr-7 py-1.5 bg-white  rounded-full text-[12px] text-[#374151] appearance-none cursor-pointer focus:outline-none focus:border-primary"
                  >
                    {SORT_OPTIONS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                  <span className="mi text-[14px] text-[#9ca3af] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">expand_more</span>
                </div>
                <button className="p-1.5  rounded-lg hover:border-primary hover:text-primary text-[#9ca3af] transition-colors">
                  <span className="mi text-[18px]">grid_view</span>
                </button>
              </div>
            </div>

            {/* Empty state & Loading */}
            {loading && (
              <div className="bg-white rounded-xl  p-12 text-center text-[#6b7280]">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                Đang tìm kiếm việc làm...
              </div>
            )}
            {!loading && filtered.length === 0 && (
              <div className="bg-white rounded-xl  p-12 text-center">
                <div className="text-[52px] mb-3">😔</div>
                <p className="text-[15px] font-bold text-[#111827] mb-1">Không tìm thấy việc làm phù hợp</p>
                <p className="text-[13px] text-[#6b7280] mb-4">Hãy thử thay đổi từ khoá hoặc điều chỉnh bộ lọc</p>
                <button onClick={clearAll}
                  className="px-5 py-2 text-[13px] font-semibold text-primary border border-primary rounded-full hover:bg-blue-50 transition-colors">
                  Xoá tất cả bộ lọc
                </button>
              </div>
            )}

            {/* Job cards */}
            {!loading && (
              <div className="space-y-2">
                {filtered.map(job => <JobCard key={job._id || job.id} job={job} />)}
              </div>
            )}
          </div>

          {/* ── Right sidebar ── */}
          <aside className="hidden lg:flex flex-col gap-3 sticky top-[calc(var(--spacing-header-height)+12px)]">

            {/* Search box */}
            <div className="bg-white rounded-xl  p-4">
              <h3 className="text-[14px] font-bold text-[#111827] mb-3">Tìm việc làm</h3>
              <form onSubmit={handleSearch} className="space-y-2">
                <div className="flex items-center gap-2  rounded-lg px-3 py-2 focus-within:border-primary transition-colors">
                  <span className="mi text-[16px] text-[#9ca3af]">search</span>
                  <input
                    type="text"
                    placeholder="Tên việc làm, kỹ năng..."
                    value={localQuery}
                    onChange={e => setLocalQuery(e.target.value)}
                    className="flex-1 text-[13px] text-[#111827] bg-transparent border-none outline-none placeholder:text-[#9ca3af]"
                  />
                </div>
                <button type="submit"
                  className="w-full py-2.5 bg-primary text-white text-[13px] font-bold rounded-lg hover:bg-blue-700 transition-colors">
                  Tìm kiếm
                </button>
              </form>
            </div>

            {/* Category stats */}
            <div className="bg-white rounded-xl  p-4">
              <h3 className="text-[14px] font-bold text-[#111827] mb-3">Ngành nghề nổi bật</h3>
              <div className="space-y-1.5">
                {mockCategories.slice(0, 7).map(cat => (
                  <div key={cat.id}
                    className="flex items-center justify-between hover:bg-[#f9fafb] rounded-lg px-2 py-1.5 -mx-2 cursor-pointer group transition-colors">
                    <span className="text-[13px] text-[#374151] group-hover:text-primary transition-colors">{cat.name}</span>
                    <span className="text-[11px] font-semibold text-primary bg-blue-50 px-2 py-0.5 rounded-full">{cat.count.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA banner */}
            <div className="bg-gradient-to-br from-primary to-blue-800 rounded-xl p-4 text-white">
              <p className="text-[13px] font-bold mb-1">🎯 Đăng tin miễn phí</p>
              <p className="text-[12px] text-white/80 mb-3">Tiếp cận hàng nghìn ứng viên chất lượng ngay hôm nay</p>
              <Link to="/employer/post-job"
                className="block text-center py-2 bg-white text-primary font-bold text-[12px] rounded-lg hover:bg-white/90 transition-colors">
                Đăng tin ngay
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   JOB CARD
══════════════════════════════════════════════════════════════ */
function JobCard({ job }) {
  const [saved, setSaved] = useState(false);

  const salaryText = useMemo(() => {
    if (!job.salary_min && !job.salary_max) return 'Thoả thuận';
    const min = ((job.salary_min || 0) / 1_000_000).toFixed(0);
    const max = ((job.salary_max || 0) / 1_000_000).toFixed(0);
    if (min === '0') return `Lên đến ${max} triệu/tháng`;
    if (max === '0' || max === 'Infinity') return `Từ ${min} triệu/tháng`;
    return `${min} – ${max} triệu/tháng`;
  }, [job.salary_min, job.salary_max]);

  return (
    <div className="bg-white rounded-xl  hover:shadow-md hover:border-[#bfdbfe] transition-all group relative">
      <Link to={`/jobs/${job.id}`} className="flex gap-3.5 p-4 pr-12">
        {/* Logo */}
        <div className="w-[60px] h-[60px] rounded-lg  overflow-hidden shrink-0 flex items-center justify-center bg-white p-1">
          <img
            src={job.company_id?.logo || '/default-company-logo.png'}
            alt={job.company_id?.name || 'Company Logo'}
            className="w-full h-full object-contain"
            onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(job.company_id?.name || 'Company')}&background=e5e7eb&color=555&size=120`; }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Badges + Title */}
          <div className="flex items-start gap-1.5 flex-wrap mb-1">
            {job.badge === 'hot' && (
              <span className="inline-flex items-center px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded shrink-0">
                ⚡ Tuyển gấp
              </span>
            )}
            {job.badge === 'premium' && (
              <span className="inline-flex items-center px-1.5 py-0.5 bg-amber-500 text-white text-[10px] font-bold rounded shrink-0">
                ⭐ Đối Tác
              </span>
            )}
            {job.badge === 'new' && (
              <span className="inline-flex items-center px-1.5 py-0.5 bg-primary text-white text-[10px] font-bold rounded shrink-0">
                ✨ Mới
              </span>
            )}
            <h3 className="text-[14px] font-bold text-[#111827] group-hover:text-primary transition-colors leading-tight">
              {job.title.toUpperCase()}
            </h3>
          </div>

          {/* Company */}
          <p className="text-[12px] text-[#6b7280] mb-1.5">{job.company_id?.name || 'VinJobs'}</p>

          {/* Salary red */}
          <p className="text-[13px] font-bold text-red-500 mb-1.5">{salaryText}</p>

          {/* Location */}
          <div className="flex items-center gap-1 text-[12px] text-[#6b7280] mb-2">
            <span className="mi text-[13px] text-[#9ca3af]">location_on</span>
            <span>{job.location}</span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-2">
            {job.level && (
              <span className="px-2 py-0.5 bg-[#f9fafb]  text-[11px] text-[#4b5563] rounded">
                {jobLevelLabels[job.level]}
              </span>
            )}
            {job.type && (
              <span className="px-2 py-0.5 bg-[#f9fafb]  text-[11px] text-[#4b5563] rounded">
                {jobTypeLabels[job.type]}
              </span>
            )}
            {job.deadline && (
              <span className="px-2 py-0.5 bg-orange-50 border border-orange-200 text-[11px] text-orange-600 rounded">
                HSD: {job.deadline}
              </span>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center gap-1.5 text-[11px] text-[#9ca3af]">
            <span className="mi text-[12px]">schedule</span>
            <span>{job.postedAt}</span>
            {job.contacts > 0 && (
              <>
                <span className="text-[#e5e7eb]">·</span>
                <span>{job.contacts} Liên Hệ</span>
              </>
            )}
          </div>
        </div>
      </Link>

      {/* Save heart */}
      <button
        className={`absolute top-4 right-4 transition-colors
          ${saved ? 'text-red-500' : 'text-[#d1d5db] hover:text-red-400'}`}
        onClick={e => { e.preventDefault(); e.stopPropagation(); setSaved(v => !v); }}
      >
        <span className="mi text-[22px]">{saved ? 'favorite' : 'favorite_border'}</span>
      </button>
    </div>
  );
}

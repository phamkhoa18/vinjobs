import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jobsApi, companiesApi, blogApi, publicApi, getImageUrl } from '../../lib/api';
import { useProvinces } from '../../hooks/useProvinces';
import * as AntdIcons from '@ant-design/icons';

/* ========================================================
   Helper: Format Salary
   ======================================================== */
const formatSalaryVal = (job) => {
  if (job.salary_negotiable || (!job.salary_min && !job.salary_max)) return "Thỏa thuận";
  const min = job.salary_min ? (job.salary_min / 1000000).toFixed(0) : 0;
  const max = job.salary_max ? (job.salary_max / 1000000).toFixed(0) : 0;
  return `${min} - ${max} triệu/tháng`;
};

/* ========================================================
   INDUSTRIES — dùng cho dropdown picker
   ======================================================== */
const INDUSTRIES = [
  { id: 'it',    name: 'Công nghệ thông tin',   icon: 'computer',          color: '#3b82f6', jobs: 1250 },
  { id: 'biz',   name: 'Kinh doanh / Sales',    icon: 'trending_up',       color: '#22c55e', jobs: 980  },
  { id: 'acc',   name: 'Kế toán / Tài chính',   icon: 'account_balance',   color: '#f59e0b', jobs: 720  },
  { id: 'mkt',   name: 'Marketing',             icon: 'campaign',          color: '#ec4899', jobs: 560  },
  { id: 'hr',    name: 'Nhân sự',               icon: 'groups',            color: '#8b5cf6', jobs: 430  },
  { id: 'design',name: 'Thiết kế / Creative',   icon: 'palette',           color: '#ef4444', jobs: 380  },
  { id: 'eng',   name: 'Xây dựng / Kỹ thuật',  icon: 'construction',      color: '#f97316', jobs: 290  },
  { id: 'log',   name: 'Logistics / Vận tải',   icon: 'local_shipping',    color: '#06b6d4', jobs: 340  },
  { id: 'edu',   name: 'Giáo dục / Đào tạo',   icon: 'school',            color: '#14b8a6', jobs: 210  },
  { id: 'med',   name: 'Y tế / Dược phẩm',      icon: 'health_and_safety', color: '#dc2626', jobs: 180  },
  { id: 'food',  name: 'F&B / Nhà hàng',        icon: 'restaurant',        color: '#d97706', jobs: 270  },
  { id: 'ret',   name: 'Bán lẻ / Siêu thị',    icon: 'shopping_cart',     color: '#0891b2', jobs: 390  },
];

const HOT_KEYWORDS = [
  'Lập trình viên React', 'Marketing Digital', 'Kế toán tổng hợp',
  'Product Manager', 'DevOps Engineer', 'Nhân viên kinh doanh',
  'Thiết kế đồ họa', 'Data Analyst', 'HR Manager', 'Fullstack Developer',
];

/* ========================================================
   HERO SEARCH — dùng API tỉnh thành và danh mục thực tế
   ======================================================== */
function HeroSearch({ topCategories = [] }) {
  const navigate = useNavigate();
  const { provinces, loading: loadingProvinces } = useProvinces();

  const [query, setQuery]       = useState('');
  const [province, setProvince] = useState(null);   // { code, name, icon, isCity, ... }
  const [industry, setIndustry] = useState(null);   // INDUSTRIES item

  const [showSugg,     setShowSugg]     = useState(false);
  const [showLoc,      setShowLoc]      = useState(false);
  const [showInd,      setShowInd]      = useState(false);
  const [locSearch,    setLocSearch]    = useState('');
  const [indSearch,    setIndSearch]    = useState('');
  const [isSearching,  setIsSearching]  = useState(false);

  const [suggestions,       setSuggestions]       = useState([]);
  const [loadingSugg,       setLoadingSugg]       = useState(false);

  const wrapperRef     = useRef(null);
  const searchInputRef = useRef(null);

  /* ── Fetch suggestions (simulated API 180ms) ── */
  const fetchSuggestions = useCallback((q) => {
    if (!q.trim()) { setSuggestions([]); return; }
    setLoadingSugg(true);
    const t = setTimeout(async () => {
      try {
        const res = await jobsApi.list({ keyword: q, limit: 5 });
        const jobs = (res?.data?.jobs || []).map(j => ({
          type: 'job', id: j._id || j.id, title: j.title, sub: j.company_id?.name || 'VinJobs',
          salary: formatSalary(j.salary_min), logo: j.company_id?.logo ? getImageUrl(j.company_id.logo) : '/default-company-logo.png'
        }));

        const kws = HOT_KEYWORDS
          .filter(k => k.toLowerCase().includes(q.toLowerCase()))
          .slice(0, 3)
          .map(k => ({ type: 'keyword', title: k }));

        setSuggestions([...kws, ...jobs]);
      } catch (err) {
        console.error('Suggestion fetch error:', err);
      } finally {
        setLoadingSugg(false);
      }
    }, 180);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => { fetchSuggestions(query); }, [query, fetchSuggestions]);

  /* ── Close on outside click ── */
  useEffect(() => {
    const h = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSugg(false); setShowLoc(false); setShowInd(false);
      }
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  /* ── Search action ── */
  const doSearch = useCallback((q = query, prov = province, ind = industry) => {
    setIsSearching(true);
    setShowSugg(false); setShowLoc(false); setShowInd(false);
    const p = new URLSearchParams();
    if (q)        p.set('q', q);
    if (prov?.code) p.set('province', prov.code);
    if (ind?._id)  p.set('category_id', ind._id);
    setTimeout(() => {
      setIsSearching(false);
      navigate(`/jobs?${p.toString()}`);
    }, 350);
  }, [query, province, industry, navigate]);

  const handleSubmit = (e) => { e?.preventDefault(); doSearch(); };

  const handleSelectSugg = (s) => {
    setShowSugg(false);
    if (s.type === 'job') navigate(`/jobs/${s.id}`);
    else { setQuery(s.title); searchInputRef.current?.focus(); }
  };

  /* ── Filtered lists ── */
  const filteredProvinces = provinces.filter(p =>
    !locSearch || p.name.toLowerCase().includes(locSearch.toLowerCase())
  );
  const cities   = filteredProvinces.filter(p => p.isCity);
  const nonCities = filteredProvinces.filter(p => !p.isCity);

  const filteredIndustries = topCategories.filter(i =>
    !indSearch || i.name.toLowerCase().includes(indSearch.toLowerCase())
  );

  return (
    <div ref={wrapperRef} className="max-w-[860px] mx-auto">

      {/* ═══ Main bar — clone ViecLamTot 100% ═══ */}
      <form onSubmit={handleSubmit}
        className="flex flex-col lg:flex-row items-stretch lg:items-center bg-white rounded-2xl lg:rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] lg:shadow-[0_4px_24px_rgba(0,0,0,0.16)] relative z-20 overflow-visible p-2 lg:p-0 gap-2 lg:gap-0"
      >
        {/* ── Keyword input ── */}
        <div className="relative flex-1 flex items-center gap-2.5 px-4 h-[52px] lg:h-[56px] bg-[#f9fafb] lg:bg-transparent rounded-xl lg:rounded-none min-w-0">
          <span className="mi text-[20px] text-[#9ca3af] shrink-0">search</span>
          <input
            ref={searchInputRef}
            id="hero-search-input"
            type="text"
            autoComplete="off"
            placeholder="Tìm việc làm..."
            value={query}
            onChange={e => { setQuery(e.target.value); setShowSugg(true); setShowLoc(false); setShowInd(false); }}
            onFocus={() => { setShowSugg(true); setShowLoc(false); setShowInd(false); }}
            className="flex-1 bg-transparent text-[14px] lg:text-[15px] text-[#111827] placeholder:text-[#9ca3af] min-w-0 outline-none border-none"
            style={{ boxShadow: 'none' }}
          />
          {query && (
            <button type="button" onClick={() => { setQuery(''); setSuggestions([]); searchInputRef.current?.focus(); }}
              className="shrink-0 text-[#9ca3af] hover:text-[#374151] transition-colors p-1">
              <span className="mi text-[18px] block">close</span>
            </button>
          )}

          {/* Suggestions Dropdown */}
          {showSugg && (
            <div className="absolute left-0 right-0 top-[calc(100%+8px)] bg-white rounded-2xl shadow-[0_8px_48px_rgba(0,0,0,0.15)] border border-[#e5e7eb] z-[500] overflow-hidden">
              {!query ? (
                <div className="p-3">
                  <p className="text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider px-2 mb-2">🔥 Từ khoá phổ biến</p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {HOT_KEYWORDS.slice(0, 8).map(k => (
                      <button key={k} type="button"
                        onClick={() => { setQuery(k); setShowSugg(false); }}
                        className="text-[12px] px-3 py-1 bg-blue-50 text-primary rounded-full hover:bg-blue-100 transition-colors font-medium">
                        {k}
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-[#f3f4f6] pt-2">
                    <p className="text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider px-2 mb-1.5">Tiếp tục tìm kiếm</p>
                  </div>
                </div>
              ) : (
                <div className="p-2">
                  {loadingSugg ? (
                    <div className="flex items-center gap-2 p-4 text-[13px] text-[#6b7280]">
                      <span className="mi text-[20px] animate-spin">autorenew</span> Đang tìm kiếm...
                    </div>
                  ) : suggestions.length === 0 ? (
                    <div className="p-5 text-center">
                      <span className="mi text-[36px] text-[#9ca3af] block mb-1">search_off</span>
                      <p className="text-[13px] text-[#6b7280]">Không tìm thấy "<strong>{query}</strong>"</p>
                      <p className="text-[12px] text-[#9ca3af] mt-0.5">Nhấn "Tìm việc" để xem tất cả kết quả</p>
                    </div>
                  ) : (
                    <>
                      {suggestions.filter(s => s.type === 'keyword').map((s, i) => (
                        <button key={i} type="button" onClick={() => handleSelectSugg(s)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#f9fafb] transition-colors text-left">
                          <span className="mi text-[18px] text-[#9ca3af]">search</span>
                          <span className="text-[14px] text-[#111827] flex-1">{s.title}</span>
                          <span className="mi text-[14px] text-[#9ca3af]">north_west</span>
                        </button>
                      ))}
                      {suggestions.filter(s => s.type === 'job').length > 0 && (
                        <>
                          <p className="text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider px-3 pt-1 pb-0.5">Việc làm phù hợp</p>
                          {suggestions.filter(s => s.type === 'job').map((s, i) => (
                            <button key={i} type="button" onClick={() => handleSelectSugg(s)}
                              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#f9fafb] transition-colors text-left group">
                              <div className="w-8 h-8 rounded-lg border border-[#e5e7eb] overflow-hidden shrink-0 flex items-center justify-center bg-white p-0.5">
                                <img src={s.logo} alt="" className="w-full h-full object-contain"
                                  onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(s.sub)}&background=random&size=60`; }} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-semibold text-[#111827] truncate group-hover:text-primary transition-colors">{s.title}</p>
                                <p className="text-[11px] text-[#6b7280]">{s.sub} · <span className="text-red-500">{s.salary}</span></p>
                              </div>
                              <span className="mi text-[14px] text-[#9ca3af] opacity-0 group-hover:opacity-100 transition-opacity">north_west</span>
                            </button>
                          ))}
                        </>
                      )}
                      <div className="border-t border-[#f3f4f6] mt-1 pt-1">
                        <button type="submit"
                          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-blue-50 transition-colors text-left text-primary font-semibold text-[13px]">
                          <span className="mi text-[18px]">search</span>
                          Tìm tất cả kết quả cho "{query}"
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Filters Group for Mobile */}
        <div className="flex gap-2 lg:gap-0 lg:contents">
          {/* ── Province pill button ── */}
          <div className="relative flex-1 lg:flex-none lg:shrink-0 lg:px-1.5">
            <button type="button" id="btn-location-picker"
              onClick={() => { setShowLoc(v => !v); setShowSugg(false); setShowInd(false); setLocSearch(''); }}
              className={`w-full flex items-center justify-center lg:justify-start gap-1.5 lg:gap-2 px-3 lg:px-4 h-[44px] lg:h-[40px] rounded-xl lg:rounded-lg border text-[13px] lg:text-[14px] font-medium transition-all
                ${showLoc || province
                  ? 'border-primary text-primary bg-blue-50'
                  : 'border-[#e5e7eb] text-[#374151] bg-[#f9fafb] lg:bg-white hover:border-primary hover:text-primary'
                }`}>
              <span className={`mi text-[18px] ${province || showLoc ? 'text-primary' : 'text-primary'}`}>location_on</span>
              <span className="truncate max-w-[100px] lg:max-w-[140px]">{province ? province.name : 'Địa điểm'}</span>
              {loadingProvinces
                ? <span className="mi text-[15px] text-[#9ca3af] animate-spin hidden lg:block">autorenew</span>
                : <span className={`mi text-[18px] text-[#9ca3af] transition-transform duration-200 hidden lg:block ${showLoc ? 'rotate-180' : ''}`}>expand_more</span>
              }
            </button>

            {showLoc && (
              <div className="absolute left-0 lg:left-0 top-[calc(100%+8px)] bg-white rounded-2xl shadow-[0_8px_48px_rgba(0,0,0,0.15)] border border-[#e5e7eb] z-[500] overflow-hidden w-[calc(100vw-32px)] max-w-[320px] lg:w-auto lg:min-w-[280px]">
                <div className="p-3 border-b border-[#f3f4f6]">
                  <div className="flex items-center gap-2 bg-[#f9fafb] rounded-xl px-3 py-2">
                    <span className="mi text-[18px] text-[#9ca3af]">search</span>
                    <input type="text" placeholder="Tìm tỉnh thành..." value={locSearch}
                      onChange={e => setLocSearch(e.target.value)} autoFocus
                      className="flex-1 bg-transparent text-[13px] text-[#111827] placeholder:text-[#9ca3af] border-none outline-none" />
                    {locSearch && (
                      <button type="button" onClick={() => setLocSearch('')}>
                        <span className="mi text-[16px] text-[#9ca3af] hover:text-[#374151]">close</span>
                      </button>
                    )}
                  </div>
                </div>
                <div className="max-h-[320px] overflow-y-auto">
                  <div className="px-2 pt-2">
                    <button type="button"
                      onClick={() => { setProvince(null); setShowLoc(false); setLocSearch(''); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#f9fafb] transition-colors text-left ${!province ? 'bg-blue-50' : ''}`}>
                      <span className={`mi text-[18px] shrink-0 ${!province ? 'text-primary' : 'text-[#9ca3af]'}`}>public</span>
                      <span className={`text-[14px] flex-1 ${!province ? 'font-semibold text-primary' : 'text-[#374151]'}`}>Toàn quốc</span>
                      {!province && <span className="mi text-[18px] text-primary">check</span>}
                    </button>
                  </div>
                  {cities.length > 0 && (
                    <div className="px-2 pt-2">
                      <p className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest px-3 pb-1">⭐ Thành phố trực thuộc TW</p>
                      {cities.map(p => (
                        <button key={p.code} type="button"
                          onClick={() => { setProvince(p); setShowLoc(false); setLocSearch(''); }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#f9fafb] transition-colors text-left ${province?.code === p.code ? 'bg-blue-50' : ''}`}>
                          <span className={`mi text-[18px] shrink-0 ${province?.code === p.code ? 'text-primary' : 'text-[#9ca3af]'}`}>location_city</span>
                          <span className={`text-[14px] flex-1 ${province?.code === p.code ? 'font-semibold text-primary' : 'text-[#374151]'}`}>{p.name}</span>
                          {province?.code === p.code && <span className="mi text-[18px] text-primary shrink-0">check</span>}
                        </button>
                      ))}
                    </div>
                  )}
                  {nonCities.length > 0 && (
                    <div className="px-2 pt-2 pb-2">
                      {cities.length > 0 && <p className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest px-3 pb-1">Tỉnh thành</p>}
                      {nonCities.map(p => (
                        <button key={p.code} type="button"
                          onClick={() => { setProvince(p); setShowLoc(false); setLocSearch(''); }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#f9fafb] transition-colors text-left ${province?.code === p.code ? 'bg-blue-50' : ''}`}>
                          <span className={`mi text-[18px] shrink-0 ${province?.code === p.code ? 'text-primary' : 'text-[#9ca3af]'}`}>apartment</span>
                          <span className={`text-[14px] flex-1 ${province?.code === p.code ? 'font-semibold text-primary' : 'text-[#374151]'}`}>{p.name}</span>
                          {province?.code === p.code && <span className="mi text-[18px] text-primary shrink-0">check</span>}
                        </button>
                      ))}
                    </div>
                  )}
                  {loadingProvinces && (
                    <div className="flex items-center gap-2 p-4 text-[13px] text-[#6b7280]">
                      <span className="mi text-[20px] animate-spin">autorenew</span> Đang tải...
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── Industry pill button ── */}
          <div className="relative flex-1 lg:flex-none lg:shrink-0 lg:px-1.5">
            <button type="button" id="btn-industry-picker"
              onClick={() => { setShowInd(v => !v); setShowSugg(false); setShowLoc(false); setIndSearch(''); }}
              className={`w-full flex items-center justify-center lg:justify-start gap-1.5 lg:gap-2 px-3 lg:px-4 h-[44px] lg:h-[40px] rounded-xl lg:rounded-lg border text-[13px] lg:text-[14px] font-medium transition-all
                ${showInd || industry
                  ? 'border-primary text-primary bg-blue-50'
                  : 'border-[#e5e7eb] text-[#374151] bg-[#f9fafb] lg:bg-white hover:border-primary hover:text-primary'
                }`}>
              <span className={`mi text-[18px] ${industry || showInd ? 'text-primary' : 'text-primary'}`}>work_outline</span>
              <span className="truncate max-w-[100px] lg:max-w-[120px]">{industry ? industry.name : 'Ngành nghề'}</span>
            </button>

            {showInd && (
              <div className="absolute right-0 lg:right-0 top-[calc(100%+8px)] bg-white rounded-2xl shadow-[0_8px_48px_rgba(0,0,0,0.15)] border border-[#e5e7eb] z-[500] overflow-hidden w-[calc(100vw-32px)] max-w-[320px] lg:w-auto lg:min-w-[300px]">
                <div className="p-3 border-b border-[#f3f4f6]">
                  <div className="flex items-center gap-2 bg-[#f9fafb] rounded-xl px-3 py-2">
                    <span className="mi text-[18px] text-[#9ca3af]">search</span>
                    <input type="text" placeholder="Tìm ngành nghề..." value={indSearch}
                      onChange={e => setIndSearch(e.target.value)} autoFocus
                      className="flex-1 bg-transparent text-[13px] text-[#111827] placeholder:text-[#9ca3af] border-none outline-none" />
                  </div>
                </div>
                <div className="max-h-[340px] overflow-y-auto p-2">
                  <button type="button" className="w-full flex items-center gap-3 p-3 hover:bg-[#f3f4f6] rounded-xl transition-colors group text-left"
                    onClick={() => { setIndustry(null); setShowInd(false); }}>
                    <span className="mi text-[#374151] group-hover:text-primary transition-colors text-[20px]">apps</span>
                    <span className="text-[14px] text-[#374151] group-hover:text-primary font-medium transition-colors">Tất cả ngành nghề</span>
                  </button>
                  {filteredIndustries.map(ind => {
                    const IconComp = AntdIcons[ind.icon] || AntdIcons.AppstoreOutlined;
                    return (
                      <button key={ind._id} type="button" className="w-full flex items-center gap-3 p-3 hover:bg-[#f3f4f6] rounded-xl transition-colors group text-left"
                        onClick={() => { setIndustry(ind); setShowInd(false); }}>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${ind.bg_color || '#eef2ff'}`, color: `${ind.icon_color || '#3674c5'}` }}>
                          {ind.custom_svg ? (
                            <span className="w-5 h-5 flex items-center justify-center" dangerouslySetInnerHTML={{ __html: ind.custom_svg }} style={{ fill: 'currentColor' }} />
                          ) : (
                            <IconComp className="text-[18px]" />
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className={`text-[13px] font-semibold truncate ${industry?._id === ind._id ? 'text-primary' : 'text-[#111827]'}`}>{ind.name}</span>
                          <span className="text-[11px] text-[#6b7280]">{(ind.count || 0).toLocaleString()} việc làm</span>
                        </div>
                        {industry?._id === ind._id && <span className="mi text-[18px] text-primary shrink-0 ml-auto">check</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Tìm việc button ── */}
        <div className="lg:px-2 pt-1 lg:pt-0">
          <button type="submit" id="btn-hero-search" disabled={isSearching}
            className="w-full lg:w-auto flex items-center justify-center gap-2 px-6 h-[48px] lg:h-[40px] bg-primary text-white text-[15px] font-bold rounded-xl lg:rounded-lg whitespace-nowrap hover:bg-blue-700 transition-all disabled:opacity-70 min-w-[110px]">
            {isSearching
              ? <><span className="mi text-[18px] animate-spin">autorenew</span> Đang tìm...</>
              : <>Tìm việc ngay</>}
          </button>
        </div>
      </form>



      {/* ═══ Active filter chips ═══ */}
      {(province || industry) && (
        <div className="flex flex-wrap items-center gap-2 mt-3 justify-center">
          <span className="text-[12px] text-white/70 font-medium">Đang lọc:</span>
          {province && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-[12px] font-semibold border border-white/20">
              <span className="mi text-[14px]">location_on</span>{province.name}
              <button type="button" onClick={() => setProvince(null)} className="ml-1 hover:text-white/70">
                <span className="mi text-[14px]">close</span>
              </button>
            </span>
          )}
          {industry && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-[12px] font-semibold border border-white/20">
              <span className="mi text-[14px]">work_outline</span>{industry.name}
              <button type="button" onClick={() => setIndustry(null)} className="ml-1 hover:text-white/70">
                <span className="mi text-[14px]">close</span>
              </button>
            </span>
          )}
          <button type="button" onClick={() => { setProvince(null); setIndustry(null); setQuery(''); }}
            className="text-[12px] text-white/60 underline hover:text-white transition-colors">
            Xoá tất cả
          </button>
        </div>
      )}

      {/* ═══ Hot keyword shortcuts ═══ */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1.5">
        <span className="text-[12px] text-white/70 font-medium">Tìm nhiều:</span>
        {HOT_KEYWORDS.slice(0, 5).map(k => (
          <button key={k} type="button"
            onClick={() => { setQuery(k); doSearch(k); }}
            className="text-[12px] px-3 py-0.5 bg-white/15 hover:bg-white/25 backdrop-blur-sm rounded-full text-white transition-colors font-medium border border-white/20">
            {k}
          </button>
        ))}
      </div>
    </div>
  );
}
/* ========================================================
   MAIN HOME PAGE
   ======================================================== */
export default function HomePage() {
  const [topJobs, setTopJobs] = useState([]);
  const [topCategories, setTopCategories] = useState([]);
  const [topCompanies, setTopCompanies] = useState([]);
  const [blogPosts, setBlogPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('Tin nổi bật');
  const [hotJobs, setHotJobs] = useState([]);
  const [latestJobs, setLatestJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const blogTabs   = ['Tin nổi bật', 'Cẩm nang tìm việc', 'Cẩm nang ngành nghề'];

  useEffect(() => {
    // 1. Fetch Top Jobs
    publicApi.jobs({ limit: 10, sort: '-createdAt' })
      .then(res => setTopJobs(res.data?.jobs || []))
      .catch(err => console.error(err));

    // 2. Fetch Top Categories
    publicApi.getCategories()
      .then(res => setTopCategories(res.categories || []))
      .catch(err => console.error(err));

    // 3. Fetch Top Companies
    publicApi.getTopCompanies(8)
      .then(res => setTopCompanies(res.companies || []))
      .catch(err => console.error(err));

    // 4. Fetch Blog Posts
    blogApi.getPosts({ limit: 4 })
      .then(res => setBlogPosts(res?.posts || []))
      .catch(err => console.error(err));

    const fetchHomeData = async () => {
      try {
        const [hotRes, latestRes, compRes] = await Promise.all([
          publicApi.jobs({ limit: 6, level: 'MANAGER' }), // Giả lập hot jobs
          publicApi.jobs({ limit: 6, sort: '-createdAt' }),
          companiesApi.list({ limit: 10 })
        ]);
        if (hotRes.status === 'success') setHotJobs(hotRes.data.jobs);
        if (latestRes.status === 'success') setLatestJobs(latestRes.data.jobs);
        if (compRes.status === 'success') setCompanies(compRes.data.companies);
      } catch (err) {
        console.error('Lỗi lấy dữ liệu trang chủ:', err);
      }
    };
    fetchHomeData();
  }, []);

  return (
    <div>
      {/* ===== HERO ===== */}
      <section className="relative pt-header-height bg-gradient-to-br from-[#3674c5] via-[#5a9be6] to-[#4a8dd9] text-center overflow-visible flex items-center justify-center min-h-[320px]">
        <div className="absolute inset-0 bg-[url('/banner_vinjobs.png')] bg-center bg-cover bg-no-repeat mix-blend-multiply opacity-90 pointer-events-none" />
        <div className="container relative z-10 py-8">
          <h1 className="text-[28px] md:text-[32px] font-extrabold italic text-white mb-5 drop-shadow-lg">
            Việc tới tay, đi làm ngay!
          </h1>
          <HeroSearch topCategories={topCategories} />
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      <section className="bg-white py-8 border-b border-border-main">
        <div className="container">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {topCategories.slice(0, 10).map((cat) => {
              const IconComp = AntdIcons[cat.icon] || AntdIcons.AppstoreOutlined;
              return (
                <Link to={`/jobs?category_id=${cat._id}`} key={cat._id} className="group relative bg-white p-5 rounded-2xl border border-border-main hover:border-primary hover:shadow-card transition-all duration-300">
                  <div className="flex flex-col gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:-translate-y-1" style={{ backgroundColor: cat.bg_color || '#eef2ff', color: cat.icon_color || '#3674c5' }}>
                      {cat.custom_svg ? (
                        <span className="w-6 h-6 flex items-center justify-center" dangerouslySetInnerHTML={{ __html: cat.custom_svg }} style={{ fill: 'currentColor' }} />
                      ) : (
                        <IconComp className="text-2xl" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-text-primary mb-1 group-hover:text-primary transition-colors">{cat.name}</h3>
                      <p className="text-sm text-text-secondary">{cat.count || 0} việc làm</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
          <div className="text-center mt-4">
            <Link to="/jobs" className="inline-flex items-center px-4 py-2 text-sm font-semibold text-text-primary border border-border-main rounded-full hover:border-primary hover:text-primary transition-all">
              Xem tất cả ngành nghề
            </Link>
          </div>
        </div>
      </section>

      {/* ===== VIỆC TUYỂN GẤP ===== */}
      <section className="py-8">
        <div className="container">
          <div className="mb-4">
            <div className="flex items-center gap-1.5 mb-1.5">
              <h2 className="text-xl font-bold text-text-primary">Việc tuyển gấp</h2>
              <span className="mi text-[20px] text-text-muted cursor-pointer">info_outline</span>
            </div>
            <div className="flex flex-wrap gap-4">
              <span className="flex items-center gap-1 text-[13px] text-text-secondary font-medium">
                <span className="mi text-[18px] text-primary">verified</span>Việc làm xác thực
              </span>
              <span className="flex items-center gap-1 text-[13px] text-text-secondary font-medium">
                <span className="mi text-[18px] text-primary">verified</span>Phỏng vấn và nhận việc trong 1-2 ngày
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {hotJobs.map((job) => (<JobCard key={job._id || job.id} job={job} />))}
          </div>
          <div className="text-center mt-5">
            <Link to="/jobs" className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-text-primary border border-border-main rounded-full hover:border-primary hover:text-primary transition-all">
              Xem thêm việc tuyển gấp
            </Link>
          </div>
        </div>
      </section>

      {/* ===== NHÀ TUYỂN DỤNG TIÊU BIỂU ===== */}
      <section className="bg-white py-8 border-t border-b border-border-main">
        <div className="container">
          <h2 className="text-xl font-bold text-text-primary mb-4">Việc làm từ Nhà tuyển dụng tiêu biểu</h2>
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
            {topCompanies.map((company) => (
              <Link to={`/companies/${company.slug || company._id || company.id}`} key={company._id || company.id} className="shrink-0 flex flex-col items-center gap-2 w-[120px] p-4 border border-border-main rounded-xl bg-white text-center hover:border-primary-100 hover:shadow-card transition-all">
                <div className="w-[60px] h-[60px] flex items-center justify-center">
                  <img src={company.logo ? getImageUrl(company.logo) : '/default-company-logo.png'} alt={company.name} className="max-w-full max-h-full object-contain"
                    onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&background=random&size=100`; }} />
                </div>
                <span className="text-xs font-semibold text-text-primary leading-tight line-clamp-2">{company.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== VIỆC LÀM MỚI NHẤT ===== */}
      <section className="py-8">
        <div className="container">
          <h2 className="text-xl font-bold text-text-primary mb-4">Việc làm mới nhất</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {latestJobs.map((job) => (<JobCard key={job._id || job.id} job={job} />))}
          </div>
        </div>
      </section>

      {/* ===== TOP NGÀNH NGHỀ ===== */}
      <section className="bg-white py-8 border-t border-border-main">
        <div className="container">
          <h2 className="text-xl font-bold text-text-primary">Top ngành nghề nổi bật</h2>
          <div className="flex gap-2 mt-3 mb-4">
            <button className="px-4 py-2 text-sm font-semibold text-white bg-text-primary rounded-full">Ngành</button>
            <button className="px-4 py-2 text-sm font-semibold text-text-secondary border border-border-main rounded-full bg-white hover:border-primary hover:text-primary transition-all">Nghề</button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {topCategories.slice(0, 5).map((cat) => (
              <Link to={`/jobs?category_id=${cat._id}`} key={cat._id} className="group bg-white border border-border-main rounded-xl overflow-hidden hover:shadow-card transition-all flex flex-col">
                <div className="h-[140px] overflow-hidden bg-gray-100 flex items-center justify-center">
                  {cat.image ? (
                    <img src={getImageUrl(cat.image)} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <span className="mi text-4xl text-gray-400">{cat.icon || 'work'}</span>
                  )}
                </div>
                <div className="p-3.5 flex-1 flex flex-col">
                  <h3 className="text-sm font-bold text-text-primary mb-1 leading-tight line-clamp-2">{cat.name}</h3>
                  <p className="text-xs text-text-muted mb-0.5">Việc làm hiện có</p>
                  <p className="text-sm font-bold text-salary mb-2">{cat.count || 0} công việc</p>
                  <span className="text-[13px] font-medium text-text-primary underline mt-auto">Xem tin tuyển dụng</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TƯ VẤN VIỆC LÀM ===== */}
      <section className="py-8">
        <div className="container">
          <h2 className="text-xl font-bold text-text-primary">Tư vấn việc làm</h2>
          <div className="flex gap-2 mt-3 mb-4">
            {blogTabs.map(tab => (
              <button key={tab} className={`px-4 py-2 text-sm font-semibold rounded-full border transition-all
                ${activeTab === tab ? 'bg-text-primary text-white border-text-primary' : 'bg-white text-text-secondary border-border-main hover:border-primary hover:text-primary'}
              `} onClick={() => setActiveTab(tab)}>
                {tab}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {blogPosts.filter(p => activeTab === 'Tin nổi bật' || p.category_id?.name === activeTab).slice(0, 4).map((post) => (
              <Link to={`/blog/${post.slug}`} key={post._id} className="group bg-white border border-border-main rounded-xl overflow-hidden hover:shadow-card transition-all flex flex-col">
                <div className="h-[150px] overflow-hidden bg-gray-100 flex items-center justify-center">
                  {post.thumbnail ? (
                    <img src={getImageUrl(post.thumbnail)} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <span className="mi text-4xl text-gray-400">article</span>
                  )}
                </div>
                <div className="p-3 flex-1 flex flex-col">
                  <h3 className="text-sm font-semibold text-text-primary leading-snug mb-1.5 line-clamp-2 group-hover:text-primary transition-colors">{post.title}</h3>
                  <span className="text-xs text-text-muted mt-auto">{new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA APP ===== */}
      <section className="py-8">
        <div className="container">
          <div className="bg-gradient-to-br from-[#3674c5] to-[#5a9be6] rounded-2xl p-8 md:p-10 relative overflow-hidden">
            <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/5" />
            <div className="relative z-10">
              <h2 className="text-2xl md:text-[28px] font-extrabold text-white mb-1.5">Tải app VinJobs ngay!</h2>
              <p className="text-[15px] text-white/80 mb-5">Tìm việc nhanh hơn, nhận thông báo việc làm mới nhất</p>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <button className="flex items-center gap-2 px-4 py-2 bg-text-primary text-white rounded-lg hover:opacity-85 transition-opacity">
                  <span className="mi text-[24px]">apple</span>
                  <div><small className="block text-[10px] opacity-70">Tải trên</small><strong className="block text-sm">App Store</strong></div>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-text-primary text-white rounded-lg hover:opacity-85 transition-opacity">
                  <span className="mi text-[24px]">shop</span>
                  <div><small className="block text-[10px] opacity-70">Tải trên</small><strong className="block text-sm">Google Play</strong></div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ========================================================
   JOB CARD
   ======================================================== */
function JobCard({ job }) {
  return (
    <Link to={`/jobs/${job.slug || job._id || job.id}`} className="flex gap-3.5 p-4 bg-white border border-border-main rounded-xl hover:shadow-card transition-all group">
      <div className="w-[52px] h-[52px] rounded-lg border border-border-main overflow-hidden shrink-0 flex items-center justify-center bg-white p-0.5">
        <img src={job.company_id?.logo ? getImageUrl(job.company_id.logo) : '/default-company-logo.png'} alt={job.company_id?.name || 'Company Logo'} className="w-full h-full object-contain"
          onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(job.company_id?.name || 'Company')}&background=random&size=80`; }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex gap-1 mb-1">
          {(job.badge === 'hot' || job.badge === 'premium') && <span className="inline-flex items-center gap-0.5 px-2 py-0.5 text-xs font-bold bg-danger text-white rounded">🔥 Tuyển gấp</span>}
          {job.badge === 'premium' && <span className="inline-flex items-center px-2 py-0.5 text-xs font-bold bg-partner text-white rounded">Đối Tác</span>}
          {job.badge === 'new' && <span className="inline-flex items-center px-2 py-0.5 text-xs font-bold bg-primary text-white rounded">Mới</span>}
        </div>
        <h3 className="text-sm font-bold text-text-primary leading-tight mb-0.5 line-clamp-2 group-hover:text-primary transition-colors">{job.title.toUpperCase()}</h3>
        <p className="text-[13px] text-text-secondary mb-1">{job.company_id?.name || 'VinJobs'}</p>
        <p className="text-sm font-bold text-salary mb-1">{job.salary_min ? `${(job.salary_min/1_000_000).toFixed(0)} - ${(job.salary_max/1_000_000).toFixed(0)} triệu` : 'Thỏa thuận'}</p>
        <p className="flex items-center gap-0.5 text-xs text-text-secondary mb-2">
          <span className="mi text-[15px] text-text-muted">location_on</span>{job.location}
        </p>
        <div className="flex items-center justify-between pt-2 border-t border-border-light">
          <span className="text-xs text-text-muted">{new Date(job.createdAt).toLocaleDateString()}</span>
          <button className="text-text-muted hover:text-danger transition-colors" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
            <span className="mi text-[20px]">favorite_border</span>
          </button>
        </div>
      </div>
    </Link>
  );
}

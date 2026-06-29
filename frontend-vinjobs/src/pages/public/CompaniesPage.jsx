import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { formatSalary } from '../../utils/format';
import { companiesApi, getImageUrl, savedJobsApi, userStorage, sanitizeHtml } from '../../lib/api';
import toast from 'react-hot-toast';

const INDUSTRIES = ['Tất cả', 'Công nghệ', 'E-commerce', 'FMCG', 'Bán lẻ', 'Vận tải', 'Viễn thông', 'Điện tử'];
const SIZES = ['Tất cả quy mô', 'Dưới 100', '100-500', '500-1000', '1000-5000', '5000+'];

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <span key={s} className={`mi text-[14px] ${s <= Math.round(rating) ? 'text-amber-400' : 'text-[#d1d5db]'}`}>star</span>
      ))}
    </div>
  );
}

function CompanyJobCard({ job, company }) {
  const [saved, setSaved] = useState(false);

  const handleToggleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const user = userStorage.get();
    if (!user) {
      toast.error('Vui lòng đăng nhập để lưu tin');
      return;
    }
    if (user.role !== 'CANDIDATE') {
      toast.error('Chỉ ứng viên mới có thể lưu tin');
      return;
    }
    try {
      const res = await savedJobsApi.toggle(job._id || job.id);
      if (res.status === 'success') {
        setSaved(res.data.saved);
        toast.success(res.data.saved ? 'Đã lưu việc làm' : 'Đã bỏ lưu việc làm');
      }
    } catch (error) {
      toast.error('Lỗi khi lưu tin');
    }
  };

  const displayImg = job.images?.[0] ? getImageUrl(job.images[0]) : (company.logo ? getImageUrl(company.logo) : '/default-company-logo.png');
  return (
    <Link to={`/jobs/${job.slug || job._id || job.id}`} className="block group cursor-pointer">
      <div className="aspect-square rounded-lg overflow-hidden relative border border-[#e5e7eb] mb-2">
        <img src={displayImg} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        
        {/* Heart Icon Top Right */}
        <button className={`absolute top-2 right-2 transition-colors z-10 drop-shadow-md ${saved ? 'text-red-500' : 'text-white hover:text-red-500'}`} onClick={handleToggleSave}>
          <span className="mi text-[22px]">{saved ? 'favorite' : 'favorite_border'}</span>
        </button>
        
        {/* Gradient Overlay Bottom */}
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/70 to-transparent flex items-end justify-between p-2">
          <span className="text-white text-[11px] font-medium drop-shadow-sm">
            {new Date(job.createdAt).toLocaleDateString('vi-VN')}
          </span>
          {(job.images?.length > 0 || job.video_url) && (
            <div className="flex items-center gap-1 text-white text-[11px] font-medium drop-shadow-sm">
              {job.images?.length > 0 && (
                <span className="flex items-center gap-0.5">{job.images.length} <span className="mi text-[13px]">image</span></span>
              )}
              {job.video_url && (
                <span className="flex items-center gap-0.5"><span className="mi text-[13px]">play_circle</span></span>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Job Info */}
      <h3 className="text-[14px] text-[#222] line-clamp-2 leading-snug mb-1 group-hover:text-primary transition-colors">
        {job.title}
      </h3>
      <p className="text-[14px] font-bold text-[#e11d48]">
        {job.salary_min && job.salary_max ? `${(job.salary_min / 1_000_000).toFixed(0)} - ${(job.salary_max / 1_000_000).toFixed(0)} triệu/tháng` : (job.salary_min ? `Từ ${(job.salary_min / 1_000_000).toFixed(0)} triệu/tháng` : (job.salary_max ? `Đến ${(job.salary_max / 1_000_000).toFixed(0)} triệu/tháng` : 'Thỏa thuận'))}
      </p>
      <div className="flex items-start gap-1 text-[12px] text-[#9ca3af] mt-1.5">
        <span className="mi text-[14px] mt-0.5 shrink-0">location_on</span>
        <span className="line-clamp-1">{job.location}</span>
      </div>
    </Link>
  );
}

// ─── COMPANY DETAIL PAGE ─────────────────────────────────────────
function CompanyDetailPage({ id }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  useEffect(() => {
    const fetchCompany = async () => {
      setLoading(true);
      try {
        const res = await companiesApi.get(id);
        if (res.status === 'success') {
          setData(res.data);
          setFollowersCount(res.data.company?.followers || Math.floor(Math.random() * 200) + 10);
          
          const user = userStorage.get();
          if (user && user.role === 'CANDIDATE') {
            try {
              const followRes = await companiesApi.checkFollow(id);
              if (followRes.status === 'success') {
                setIsFollowing(followRes.data.followed);
              }
            } catch (error) {
              console.log('Error checking follow status');
            }
          }
        }
      } catch (err) {
        console.error('Lỗi khi lấy thông tin công ty:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCompany();
  }, [id]);

  if (loading) {
    return (
      <div className=" pb-12 bg-[#f3f4f6] min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data || !data.company) {
    return (
      <div className=" pb-12 bg-[#f3f4f6] min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="text-[60px]">🏢</div>
        <h2 className="text-xl font-bold text-[#222]">Không tìm thấy công ty</h2>
        <Link to="/companies" className="text-primary hover:underline font-medium">Quay lại danh sách</Link>
      </div>
    );
  }

  const { company, activeJobs } = data;
  const coverUrl = company.cover ? getImageUrl(company.cover) : "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=300&fit=crop";
  const logoUrl = company.logo ? getImageUrl(company.logo) : '/default-company-logo.png';

  const handleToggleFollow = async () => {
    const user = userStorage.get();
    if (!user) {
      toast.error('Vui lòng đăng nhập để theo dõi công ty');
      return;
    }
    if (user.role !== 'CANDIDATE') {
      toast.error('Chỉ ứng viên mới có thể theo dõi công ty');
      return;
    }

    try {
      const res = await companiesApi.toggleFollow(id);
      if (res.status === 'success') {
        const newStatus = res.data.followed;
        setIsFollowing(newStatus);
        setFollowersCount(prev => newStatus ? prev + 1 : prev - 1);
        toast.success(newStatus ? 'Đã theo dõi công ty' : 'Đã bỏ theo dõi công ty');
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra, vui lòng thử lại');
    }
  };

  return (
    <div className=" pb-12 bg-[#f4f4f4] min-h-screen">
      <div className="container max-w-[1024px] mx-auto pt-3 space-y-3">
        {/* Profile Card */}
        <div className="bg-white rounded-xl overflow-hidden">
          {/* Cover */}
          <div className="h-[140px] md:h-[180px] w-full bg-[#0d4f3b] flex items-center justify-center relative">
            {company.cover ? (
              <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <h2 className="text-white text-xl md:text-2xl font-serif uppercase tracking-widest px-4 text-center">KIẾN TẠO CHUẨN MỰC NÂNG TẦM TINH HOA</h2>
            )}
            {/* Overlapping menu btn top right */}
            <button className="absolute top-4 right-4 w-8 h-8 bg-black/20 rounded-full flex items-center justify-center text-white backdrop-blur-sm hover:bg-black/40 transition-colors">
              <span className="mi">more_vert</span>
            </button>
          </div>

          {/* Info Section */}
          <div className="px-5 md:px-8 pb-8 relative">
            <div className="flex flex-col md:flex-row gap-4 md:gap-6">
              {/* Logo */}
              <div className="w-[100px] h-[100px] md:w-[120px] md:h-[120px] rounded-full border-4 border-white bg-white overflow-hidden shrink-0 -mt-10 md:-mt-12 relative z-10">
                <img src={logoUrl} alt={company.name} className="w-full h-full object-contain p-1"
                  onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&background=0d4f3b&color=fff&size=120`; }} />
              </div>

              {/* Details */}
              <div className="flex-1 pt-3 md:pt-4">
                <h1 className="text-[18px] md:text-[22px] font-bold text-[#111827] uppercase leading-snug">{company.name}</h1>
                <div className="flex flex-wrap items-center gap-2 md:gap-3 text-[13px] text-[#374151] mt-1.5 md:mt-2 font-medium">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500"></span> Đang hoạt động</span>
                  <span className="text-[#d1d5db] hidden sm:inline">•</span>
                  <span>Tỷ lệ phản hồi: 72%</span>
                  <span className="text-[#d1d5db] hidden sm:inline">•</span>
                  <span>Người theo dõi: {followersCount}</span>
                </div>

                <div className="flex flex-col gap-1.5 mt-3 text-[13px] text-[#6b7280]">
                  <div className="flex items-center gap-2"><span className="mi text-[18px]">calendar_today</span> Đã tham gia: {company.founded || '2 năm 2 tháng'}</div>
                  <div className="flex items-center gap-2"><span className="mi text-[18px]">location_on</span> {company.address || 'Thành phố Thủ Đức, Tp Hồ Chí Minh'}</div>
                </div>
              </div>

              {/* Buttons */}
              <div className="pt-4 md:pt-5 flex gap-2 shrink-0 h-fit">
                <button className="flex items-center gap-1.5 px-4 py-1.5 border border-[#d1d5db] rounded-full text-[13px] font-bold text-[#111827] hover:bg-gray-50 transition-colors">
                  <span className="mi text-[18px]">reply</span> Chia sẻ
                </button>
                <button 
                  onClick={handleToggleFollow}
                  className={`flex items-center gap-1.5 px-4 py-1.5 border rounded-full text-[13px] font-bold transition-colors ${
                    isFollowing 
                    ? 'border-[#e11d48] text-[#e11d48] bg-rose-50 hover:bg-rose-100' 
                    : 'border-[#d1d5db] text-[#111827] hover:bg-gray-50'
                  }`}
                >
                  <span className="mi text-[18px]">{isFollowing ? 'check' : 'add'}</span> 
                  {isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section: Jobs and Info */}
        <div className="bg-white rounded-xl p-5 md:p-8">
          <h2 className="text-[18px] font-bold text-[#111827] mb-4">Tất cả tin đăng ({activeJobs?.length || 0})</h2>

          {/* Tabs */}
          <div className="flex items-center gap-2 mb-6">
            <button className="px-4 py-1.5 bg-[#222] text-white text-[13px] font-bold rounded-full">
              Tin đang hoạt động ({activeJobs?.length || 0})
            </button>
            <button className="px-4 py-1.5 bg-[#f3f4f6] text-[#4b5563] text-[13px] font-bold rounded-full hover:bg-[#e5e7eb] transition-colors">
              Đã ẩn (0)
            </button>
          </div>

          {/* Grid of Jobs */}
          {activeJobs && activeJobs.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                {activeJobs.map(job => (
                  <CompanyJobCard key={job._id || job.id} job={job} company={company} />
                ))}
              </div>
              <div className="flex justify-center mb-10">
                <Link to="/jobs" className="px-6 py-2 border border-[#d1d5db] rounded-full text-[14px] font-bold text-[#111827] hover:bg-gray-50 transition-colors">
                  Xem thêm tin đăng
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-10 text-[#6b7280] italic bg-[#f9fafb] rounded-xl border border-dashed border-[#d1d5db] mb-10">
              Công ty này chưa có tin tuyển dụng nào đang hoạt động.
            </div>
          )}

          {/* Company Intro & Gallery */}
          <hr className="border-[#e5e7eb] mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-[16px] font-bold text-[#111827] mb-3 flex items-center gap-2"><span className="mi text-primary">info</span> Giới thiệu công ty</h3>
              {company.description ? (
                <div className="text-[14px] text-[#374151] leading-relaxed [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&_p]:mb-2" dangerouslySetInnerHTML={{ __html: sanitizeHtml(company.description) }} />
              ) : (
                <p className="text-[14px] text-[#6b7280] italic">Chưa có thông tin giới thiệu.</p>
              )}
            </div>
            <div>
              {company.gallery && company.gallery.length > 0 && (
                <>
                  <h3 className="text-[16px] font-bold text-[#111827] mb-3 flex items-center gap-2"><span className="mi text-primary">photo_library</span> Hình ảnh công ty</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {company.gallery.map((img, idx) => (
                      <div key={idx} className="aspect-video w-full rounded-lg overflow-hidden border border-[#e5e7eb] bg-gray-50">
                        <img src={getImageUrl(img)} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── COMPANIES LIST PAGE ─────────────────────────────────────────
export default function CompaniesPage() {
  const { id } = useParams();
  const [search, setSearch] = useState('');
  const [industry, setIndustry] = useState('Tất cả');
  const [sort, setSort] = useState('jobs');

  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(!id);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (id) return; // If on detail page, don't fetch list
    const fetchCompanies = async () => {
      setLoading(true);
      try {
        const params = { limit: 20 };
        if (search) params.keyword = search;
        if (industry !== 'Tất cả') params.industry = industry;

        const res = await companiesApi.list(params);
        if (res.status === 'success') {
          setCompanies(res.data.companies);
          setTotal(res.data.pagination.total);
        }
      } catch (err) {
        console.error('Failed to fetch companies:', err);
      } finally {
        setLoading(false);
      }
    };
    // Debounce manual search input slightly by putting it in a timer if needed, but for simplicity we fetch right away
    const timer = setTimeout(fetchCompanies, 500);
    return () => clearTimeout(timer);
  }, [search, industry, id]);

  // If detail page
  if (id) {
    return <CompanyDetailPage id={id} />;
  }

  return (
    <div className=" pb-12 bg-[#f3f4f6] min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#3674c5] via-[#5a9be6] to-[#4a8dd9] py-10">
        <div className="container text-center">
          <h1 className="text-[28px] font-extrabold text-white mb-2">Công ty hàng đầu</h1>
          <p className="text-[15px] text-white/80 mb-6">Khám phá doanh nghiệp uy tín đang tuyển dụng</p>
          {/* Search */}
          <div className="max-w-[560px] mx-auto flex gap-2">
            <div className="flex-1 flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 shadow">
              <span className="mi text-[20px] text-[#9ca3af]">search</span>
              <input type="text" placeholder="Tìm công ty..." value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 text-[15px] text-[#111827] placeholder:text-[#9ca3af] border-none outline-none bg-transparent" />
            </div>
            <button className="px-5 py-2.5 bg-white text-primary font-bold rounded-xl hover:bg-blue-50 transition-all text-[14px]">
              Tìm kiếm
            </button>
          </div>
        </div>
      </div>

      <div className="container mt-5">
        {/* Filter bar */}
        <div className="bg-white rounded-xl border border-[#e5e7eb] p-4 mb-5 flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-2 flex-1">
            {INDUSTRIES.map(ind => (
              <button key={ind} onClick={() => setIndustry(ind)}
                className={`px-3 py-1.5 rounded-lg text-[13px] font-medium border transition-all
                  ${industry === ind ? 'bg-primary text-white border-primary' : 'bg-white text-[#374151] border-[#e5e7eb] hover:border-primary hover:text-primary'}`}>
                {ind}
              </button>
            ))}
          </div>
          <select value={sort} onChange={e => setSort(e.target.value)}
            className="px-3 py-2 border border-[#e5e7eb] rounded-lg text-[13px] text-[#374151] outline-none cursor-pointer">
            <option value="jobs">Nhiều việc nhất</option>
            <option value="rating">Đánh giá cao</option>
            <option value="name">A-Z</option>
          </select>
        </div>

        <p className="text-[13px] text-[#6b7280] mb-4">Hiển thị {companies.length} / {total} công ty</p>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {companies.map(company => (
              <Link to={`/companies/${company.slug || company._id || company.id}`} key={company._id || company.id}
                className="bg-white border border-[#e5e7eb] rounded-xl overflow-hidden hover:shadow-[0_4px_20px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 transition-all group">
                {/* Cover */}
                <div className="h-[100px] overflow-hidden bg-gradient-to-r from-blue-50 to-indigo-50 relative">
                  <img src={company.cover ? getImageUrl(company.cover) : "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=200&fit=crop"} alt="" className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/20" />
                </div>
                <div className="p-4 -mt-8 relative">
                  <div className="w-14 h-14 rounded-xl border-2 border-white bg-white flex items-center justify-center p-1.5 shadow-md mb-3">
                    <img src={company.logo ? getImageUrl(company.logo) : '/default-company-logo.png'} alt={company.name} className="w-full h-full object-contain"
                      onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&background=random&size=80`; }} />
                  </div>
                  <h3 className="text-[14px] font-bold text-[#111827] group-hover:text-primary transition-colors mb-1">{company.name}</h3>
                  <p className="text-[12px] text-[#6b7280] mb-2 line-clamp-1">{company.industry || 'Đa ngành'} · {company.size || '0'} nhân sự</p>
                  <div className="flex items-center justify-between pt-3 border-t border-[#f3f4f6]">
                    <span className="text-[13px] font-semibold text-primary flex items-center gap-1">
                      <span className="mi text-[16px]">work_outline</span>Xem chi tiết
                    </span>
                    <span className="mi text-[18px] text-[#9ca3af] group-hover:text-primary group-hover:translate-x-1 transition-all">arrow_forward</span>
                  </div>
                </div>
              </Link>
            ))}
            {companies.length === 0 && (
              <div className="col-span-full py-12 text-center text-[14px] text-[#6b7280]">
                Không tìm thấy công ty phù hợp
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

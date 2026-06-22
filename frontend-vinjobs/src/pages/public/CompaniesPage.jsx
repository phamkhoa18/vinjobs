import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { formatSalary } from '../../data/mockData';
import { companiesApi } from '../../lib/api';


// Extended company data with more details
const companiesExtended = [
  { id: 1, name: "FPT Software", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/FPT_logo_2010.svg/1200px-FPT_logo_2010.svg.png", industry: "Công nghệ", jobs: 47, size: "5000-10000 nhân viên", founded: "1999", website: "fpt.com.vn", location: "Hà Nội, TP.HCM, Đà Nẵng", description: "FPT Software là công ty công nghệ hàng đầu Việt Nam, cung cấp dịch vụ phần mềm và chuyển đổi số cho các doanh nghiệp toàn cầu.", cover: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=300&fit=crop", rating: 4.2, reviews: 342 },
  { id: 2, name: "VNG Corporation", logo: "https://upload.wikimedia.org/wikipedia/vi/thumb/f/fe/VNG_Corporation_Logo.svg/1200px-VNG_Corporation_Logo.svg.png", industry: "Công nghệ", jobs: 32, size: "1000-5000 nhân viên", founded: "2004", website: "vng.com.vn", location: "TP.HCM", description: "VNG là công ty internet hàng đầu Việt Nam với các sản phẩm nổi tiếng như Zalo, ZaloPay, và nhiều game mobile.", cover: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=300&fit=crop", rating: 4.0, reviews: 218 },
  { id: 3, name: "Vinamilk", logo: "https://cdn.haitrieu.com/wp-content/uploads/2022/01/Logo-Vinamilk.png", industry: "FMCG", jobs: 18, size: "5000-10000 nhân viên", founded: "1976", website: "vinamilk.com.vn", location: "TP.HCM, toàn quốc", description: "Vinamilk là thương hiệu sữa số 1 Việt Nam, với hơn 45 năm phát triển và xuất khẩu sang hơn 50 quốc gia.", cover: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1200&h=300&fit=crop", rating: 4.1, reviews: 156 },
  { id: 4, name: "Tiki", logo: "https://salt.tikicdn.com/ts/upload/e4/49/6c/3c52f8c5daa1bfc6e8f79a678fd3b4f0.png", industry: "E-commerce", jobs: 28, size: "1000-5000 nhân viên", founded: "2010", website: "tiki.vn", location: "TP.HCM", description: "Tiki là một trong những sàn thương mại điện tử lớn nhất Việt Nam, nổi tiếng với chính sách giao hàng nhanh 2H.", cover: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=300&fit=crop", rating: 3.9, reviews: 289 },
  { id: 5, name: "Shopee", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Shopee.svg/2048px-Shopee.svg.png", industry: "E-commerce", jobs: 56, size: "1000-5000 nhân viên", founded: "2015", website: "shopee.vn", location: "TP.HCM", description: "Shopee là nền tảng thương mại điện tử hàng đầu Đông Nam Á, kết nối hàng triệu người mua và người bán.", cover: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1200&h=300&fit=crop", rating: 3.7, reviews: 412 },
  { id: 6, name: "Grab", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Grab_logo.svg/2560px-Grab_logo.svg.png", industry: "Vận tải", jobs: 24, size: "500-1000 nhân viên", founded: "2012", website: "grab.com", location: "TP.HCM, Hà Nội", description: "Grab là siêu ứng dụng đa dịch vụ bao gồm gọi xe, giao đồ ăn, thanh toán và dịch vụ tài chính tại Đông Nam Á.", cover: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=1200&h=300&fit=crop", rating: 4.3, reviews: 178 },
  { id: 7, name: "Thế Giới Di Động", logo: "https://upload.wikimedia.org/wikipedia/commons/5/53/Th%E1%BA%BF_Gi%E1%BB%9Bi_Di_%C4%90%E1%BB%99ng_logo.png", industry: "Bán lẻ", jobs: 120, size: "10000+ nhân viên", founded: "2004", website: "thegioididong.com", location: "Toàn quốc", description: "Thế Giới Di Động là chuỗi bán lẻ điện tử lớn nhất Việt Nam với hơn 2000 cửa hàng trên khắp cả nước.", cover: "https://images.unsplash.com/photo-1621570168076-4a8b9bc9c5d8?w=1200&h=300&fit=crop", rating: 3.8, reviews: 567 },
  { id: 8, name: "Samsung Vietnam", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Samsung_Logo.svg/2560px-Samsung_Logo.svg.png", industry: "Điện tử", jobs: 35, size: "5000-10000 nhân viên", founded: "1995", website: "samsung.com/vn", location: "Hà Nội, TP.HCM", description: "Samsung Vietnam là nhà đầu tư nước ngoài lớn nhất tại Việt Nam, sản xuất điện thoại và thiết bị điện tử xuất khẩu toàn cầu.", cover: "https://images.unsplash.com/photo-1567581935884-3349723552ca?w=1200&h=300&fit=crop", rating: 4.0, reviews: 203 },
  { id: 9, name: "Viettel", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Viettel_logo_2021.svg/2560px-Viettel_logo_2021.svg.png", industry: "Viễn thông", jobs: 42, size: "10000+ nhân viên", founded: "1989", website: "viettel.com.vn", location: "Hà Nội, toàn quốc", description: "Viettel là tập đoàn viễn thông và công nghệ số lớn nhất Việt Nam, hoạt động tại 11 quốc gia trên toàn cầu.", cover: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=300&fit=crop", rating: 3.9, reviews: 445 },
  { id: 10, name: "Masan Group", logo: "https://cdn.haitrieu.com/wp-content/uploads/2022/01/Logo-Masan-Group.png", industry: "FMCG", jobs: 22, size: "1000-5000 nhân viên", founded: "2004", website: "masangroup.com", location: "TP.HCM", description: "Masan Group là tập đoàn hàng tiêu dùng và thực phẩm hàng đầu Việt Nam với các thương hiệu quen thuộc như Chin-su, Omachi.", cover: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&h=300&fit=crop", rating: 3.8, reviews: 134 },
];

const INDUSTRIES = ['Tất cả', 'Công nghệ', 'E-commerce', 'FMCG', 'Bán lẻ', 'Vận tải', 'Viễn thông', 'Điện tử'];
const SIZES = ['Tất cả quy mô', 'Dưới 100', '100-500', '500-1000', '1000-5000', '5000+'];

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(s => (
        <span key={s} className={`mi text-[14px] ${s <= Math.round(rating) ? 'text-amber-400' : 'text-[#d1d5db]'}`}>star</span>
      ))}
    </div>
  );
}

// ─── COMPANY DETAIL PAGE ─────────────────────────────────────────
function CompanyDetailPage({ id }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompany = async () => {
      setLoading(true);
      try {
        const res = await companiesApi.get(id);
        if (res.status === 'success') {
          setData(res.data);
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
      <div className="pt-header-height pb-12 bg-[#f3f4f6] min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data || !data.company) {
    return (
      <div className="pt-header-height pb-12 bg-[#f3f4f6] min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="text-[60px]">🏢</div>
        <h2 className="text-xl font-bold text-[#222]">Không tìm thấy công ty</h2>
        <Link to="/companies" className="text-primary hover:underline font-medium">Quay lại danh sách</Link>
      </div>
    );
  }

  const { company, activeJobs } = data;
  const coverUrl = "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=300&fit=crop"; // Fake cover since we don't have it in schema
  const logoUrl = company.logo || '/default-company-logo.png';

  return (
    <div className="pt-header-height pb-12 bg-[#f3f4f6] min-h-screen">
      {/* Cover + Header */}
      <div className="bg-white border-b border-[#e5e7eb]">
        <div className="h-[200px] md:h-[240px] w-full overflow-hidden">
          <img src={coverUrl} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-10 pb-5 relative">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl border-4 border-white bg-white flex items-center justify-center shadow-lg p-2 shrink-0">
              <img src={logoUrl} alt={company.name} className="w-full h-full object-contain"
                onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&background=random&size=120`; }} />
            </div>
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-bold text-[#111827]">{company.name}</h1>
                  <div className="flex flex-wrap items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-[13px] text-[#6b7280]">
                      <span className="mi text-[16px]">business</span>{company.industry || 'Đa ngành'}
                    </span>
                    <span className="flex items-center gap-1 text-[13px] text-[#6b7280]">
                      <span className="mi text-[16px]">location_on</span>{company.address || 'Đang cập nhật'}
                    </span>
                    <span className="flex items-center gap-1 text-[13px] text-[#6b7280]">
                      <span className="mi text-[16px]">group</span>{company.size || 'Đang cập nhật'} nhân sự
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {company.website && (
                    <a href={company.website.startsWith('http') ? company.website : `https://${company.website}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-4 py-2 border border-[#e5e7eb] rounded-lg text-[13px] font-medium text-[#374151] hover:border-primary hover:text-primary transition-all">
                      <span className="mi text-[16px]">language</span>Website
                    </a>
                  )}
                  <button className="flex items-center gap-1.5 px-5 py-2 bg-primary text-white rounded-lg text-[13px] font-bold hover:bg-blue-700 transition-all">
                    <span className="mi text-[16px]">notifications</span>Theo dõi
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mt-5">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">
          {/* Left */}
          <div className="space-y-4">
            {/* About */}
            <div className="bg-white rounded-xl border border-[#e5e7eb] p-6">
              <h2 className="text-[17px] font-bold text-[#111827] mb-3">Giới thiệu công ty</h2>
              <p className="text-[14px] text-[#374151] leading-relaxed whitespace-pre-line">{company.description || 'Chưa có thông tin giới thiệu.'}</p>
              <p className="text-[14px] text-[#374151] leading-relaxed mt-3">
                Với đội ngũ chuyên nghiệp và môi trường làm việc năng động, {company.name} luôn tìm kiếm những nhân tài xuất sắc để cùng nhau phát triển và đưa công ty lên tầm cao mới. Chúng tôi coi trọng sự sáng tạo, tinh thần trách nhiệm và khả năng làm việc nhóm.
              </p>
            </div>

            {/* Jobs */}
            <div className="bg-white rounded-xl border border-[#e5e7eb] p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[17px] font-bold text-[#111827]">Việc làm đang tuyển ({activeJobs?.length || 0})</h2>
                <Link to="/jobs" className="text-[13px] text-primary font-medium hover:underline">Xem tất cả</Link>
              </div>
              <div className="space-y-3">
                {activeJobs && activeJobs.map(job => (
                  <Link key={job._id || job.id} to={`/jobs/${job._id || job.id}`}
                    className="flex items-center gap-3 p-4 border border-[#e5e7eb] rounded-xl hover:border-primary hover:shadow-sm transition-all group">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[14px] font-semibold text-[#111827] group-hover:text-primary transition-colors truncate">{job.title}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[12px] font-bold text-red-500">
                          {job.salary_min ? `${(job.salary_min/1_000_000).toFixed(0)} - ${(job.salary_max/1_000_000).toFixed(0)} triệu` : 'Thỏa thuận'}
                        </span>
                        <span className="flex items-center gap-0.5 text-[12px] text-[#6b7280]">
                          <span className="mi text-[14px]">location_on</span>{job.location}
                        </span>
                      </div>
                    </div>
                    <span className="shrink-0 text-[12px] text-[#9ca3af]">{new Date(job.createdAt).toLocaleDateString()}</span>
                  </Link>
                ))}
                {(!activeJobs || activeJobs.length === 0) && (
                  <div className="text-[13px] text-[#6b7280] italic">Chưa có vị trí tuyển dụng nào.</div>
                )}
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-xl border border-[#e5e7eb] p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[17px] font-bold text-[#111827]">Đánh giá từ nhân viên</h2>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-[#111827]">4.5</span>
                  <div>
                    <StarRating rating={4.5} />
                    <p className="text-[11px] text-[#6b7280]">120 đánh giá</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { user: "Nguyễn Văn A", role: "Software Engineer", rating: 4, text: "Môi trường làm việc tốt, đồng nghiệp thân thiện và chuyên nghiệp. Cơ hội học hỏi và phát triển rất nhiều.", date: "15/05/2026" },
                  { user: "Trần Thị B", role: "Product Manager", rating: 5, text: "Công ty có văn hóa làm việc rất tích cực, leadership open-minded và luôn lắng nghe ý kiến nhân viên.", date: "10/05/2026" },
                  { user: "Lê Hoàng C", role: "Marketing Executive", rating: 4, text: "Chính sách đãi ngộ tốt, môi trường dynamic. Đôi khi áp lực nhưng nhìn chung rất hài lòng.", date: "05/05/2026" },
                ].map((review, i) => (
                  <div key={i} className="p-4 bg-[#f9fafb] rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                      <img src={`https://i.pravatar.cc/60?img=${i + 10}`} alt="" className="w-9 h-9 rounded-full" />
                      <div>
                        <p className="text-[13px] font-semibold text-[#111827]">{review.user}</p>
                        <p className="text-[11px] text-[#6b7280]">{review.role}</p>
                      </div>
                      <div className="ml-auto text-right">
                        <StarRating rating={review.rating} />
                        <p className="text-[11px] text-[#9ca3af] mt-0.5">{review.date}</p>
                      </div>
                    </div>
                    <p className="text-[13px] text-[#374151] leading-relaxed">{review.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-[#e5e7eb] p-5">
              <h3 className="text-[15px] font-bold text-[#111827] mb-4">Thông tin công ty</h3>
              <div className="space-y-3">
                {[
                  { icon: 'business', label: 'Ngành nghề', value: company.industry || 'Đang cập nhật' },
                  { icon: 'group', label: 'Quy mô', value: `${company.size || 0} nhân sự` },
                  { icon: 'calendar_today', label: 'Thành lập', value: company.founded || 'Đang cập nhật' },
                  { icon: 'location_on', label: 'Địa điểm', value: company.address || 'Đang cập nhật' },
                  { icon: 'language', label: 'Website', value: company.website || 'Đang cập nhật' },
                  { icon: 'work', label: 'Đang tuyển', value: `${activeJobs?.length || 0} vị trí` },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="mi text-[18px] text-[#9ca3af] shrink-0 mt-0.5">{item.icon}</span>
                    <div>
                      <p className="text-[11px] text-[#9ca3af] font-medium">{item.label}</p>
                      <p className="text-[13px] text-[#374151] font-medium">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rating breakdown */}
            <div className="bg-white rounded-xl border border-[#e5e7eb] p-5">
              <h3 className="text-[15px] font-bold text-[#111827] mb-4">Môi trường làm việc</h3>
              {[
                { label: 'Văn hóa & giá trị', score: 4.3 },
                { label: 'Cân bằng công việc', score: 3.8 },
                { label: 'Đãi ngộ & phúc lợi', score: 4.0 },
                { label: 'Cơ hội phát triển', score: 4.2 },
                { label: 'Ban lãnh đạo', score: 3.9 },
              ].map((item, i) => (
                <div key={i} className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px] text-[#374151]">{item.label}</span>
                    <span className="text-[12px] font-bold text-[#374151]">{item.score}</span>
                  </div>
                  <div className="h-1.5 bg-[#f3f4f6] rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${(item.score / 5) * 100}%` }} />
                  </div>
                </div>
              ))}
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
    <div className="pt-header-height pb-12 bg-[#f3f4f6] min-h-screen">
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
              <Link to={`/companies/${company._id || company.id}`} key={company._id || company.id}
                className="bg-white border border-[#e5e7eb] rounded-xl overflow-hidden hover:shadow-[0_4px_20px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 transition-all group">
                {/* Cover */}
                <div className="h-[100px] overflow-hidden bg-gradient-to-r from-blue-50 to-indigo-50 relative">
                  <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=200&fit=crop" alt="" className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/20" />
                </div>
                <div className="p-4 -mt-8 relative">
                  <div className="w-14 h-14 rounded-xl border-2 border-white bg-white flex items-center justify-center p-1.5 shadow-md mb-3">
                    <img src={company.logo || '/default-company-logo.png'} alt={company.name} className="w-full h-full object-contain"
                      onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&background=random&size=80`; }} />
                  </div>
                  <h3 className="text-[14px] font-bold text-[#111827] group-hover:text-primary transition-colors mb-1">{company.name}</h3>
                  <p className="text-[12px] text-[#6b7280] mb-2">{company.industry || 'Đa ngành'} · {company.size || '0'} nhân sự</p>
                  <div className="flex items-center gap-1 mb-3">
                    <StarRating rating={4.5} />
                    <span className="text-[11px] text-[#6b7280] ml-1">4.5 (120)</span>
                  </div>
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

import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { formatSalary, jobTypeLabels, jobLevelLabels } from '../../utils/format';
import { jobsApi, applicationsApi, getImageUrl, cvApi, uploadApi, sanitizeHtml } from '../../lib/api';
import { userStorage } from '../../lib/api';
import { toast } from 'react-hot-toast';

/* ── helpers ── */
function salaryTextRed(min, max, negotiable) {
  if (negotiable || (!min && !max)) return 'Thoả thuận';
  const minText = ((min || 0) / 1_000_000).toFixed(0);
  const maxText = ((max || 0) / 1_000_000).toFixed(0);
  if (minText === '0') return `Lên đến ${maxText} triệu/tháng`;
  if (maxText === '0' || maxText === 'Infinity') return `Từ ${minText} triệu/tháng`;
  return `${minText} – ${maxText} triệu/tháng`;
}

const JOB_TYPES = {
  FULL_TIME: 'Toàn thời gian',
  PART_TIME: 'Bán thời gian',
  INTERNSHIP: 'Thực tập',
  FREELANCE: 'Cộng tác viên / Freelance',
  CONTRACT: 'Hợp đồng'
};

const BENEFITS_MAP = {
  insurance: 'Bảo hiểm',
  bonus: 'Thưởng',
  training: 'Đào tạo',
  lunch: 'Phụ cấp ăn trưa',
  gym: 'Phòng tập thể hình',
  remote: 'Làm việc từ xa',
  team_building: 'Du lịch / Team building',
  flexible: 'Giờ làm linh hoạt',
  travel: 'Phụ cấp công tác',
  extra_leave: 'Nghỉ phép thêm',
  laptop: 'Cấp thiết bị (Laptop/Macbook)',
  health_check: 'Khám sức khỏe',
  other: 'Khác'
};

/* ════════════════════════════════════════════════════════════
   MAIN
════════════════════════════════════════════════════════════ */
export default function JobDetailPage() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);
  const [stickyShow, setStickyShow] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const headerRef = useRef(null);
  const user = userStorage.get();

  const [relatedJobs, setRelatedJobs] = useState([]);
  
  // Application & CV States
  const [hasApplied, setHasApplied] = useState(false);
  const [myCvs, setMyCvs] = useState([]);
  const [useExistingCv, setUseExistingCv] = useState(true);
  const [selectedCvId, setSelectedCvId] = useState('');
  const [newCvFile, setNewCvFile] = useState(null);

  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true);
      try {
        const res = await jobsApi.get(id);
        if (res.status === 'success') {
          const currentJob = res.data.job;
          setJob(currentJob);
          
          if (currentJob.company_id?._id || currentJob.company_id?.id) {
            try {
              const relatedRes = await jobsApi.search({ 
                company_id: currentJob.company_id._id || currentJob.company_id.id,
                limit: 5
              });
              if (relatedRes.status === 'success') {
                setRelatedJobs(relatedRes.data.jobs.filter(j => j._id !== id).slice(0, 4));
              }
            } catch (e) {
              console.error('Failed to fetch related jobs', e);
            }
          }

          if (user?.role === 'CANDIDATE') {
            try {
              const appRes = await applicationsApi.checkApplied(currentJob._id || currentJob.id);
              if (appRes.status === 'success' && appRes.data?.applied) {
                setHasApplied(true);
              }
            } catch (e) {
              console.error('Failed to check applied status', e);
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch job', err);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id, user?.role]);

  useEffect(() => {
    const handler = () => {
      if (headerRef.current) {
        const rect = headerRef.current.getBoundingClientRect();
        setStickyShow(rect.bottom < 0);
      }
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const handleToggleSave = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để lưu tin');
      return;
    }
    if (user.role !== 'CANDIDATE') {
      toast.error('Chỉ ứng viên mới có thể lưu tin');
      return;
    }
    try {
      const res = await savedJobsApi.toggle(job?._id || id);
      if (res.status === 'success') {
        setSaved(res.data.saved);
        if (res.data.saved) {
          toast.success('Đã lưu việc làm');
        } else {
          toast.success('Đã bỏ lưu việc làm');
        }
      }
    } catch (error) {
      toast.error('Lỗi khi lưu tin');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Đã sao chép đường dẫn');
  };

  const handleOpenApplyModal = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để ứng tuyển');
      return;
    }
    if (user.role !== 'CANDIDATE') {
      toast.error('Chỉ ứng viên mới có thể ứng tuyển');
      return;
    }
    if (hasApplied) {
      toast.error('Bạn đã ứng tuyển công việc này rồi');
      return;
    }
    
    const isJobExpired = job?.deadline && new Date(job.deadline).setHours(23, 59, 59, 999) < new Date().getTime();
    if (job?.status === 'CLOSED' || job?.status === 'EXPIRED' || isJobExpired) {
      toast.error('Tin tuyển dụng này đã hết hạn ứng tuyển');
      return;
    }
    
    // Fetch user CVs
    try {
      const res = await cvApi.getMyCVs();
      if (res.status === 'success' && res.data?.cvs?.length > 0) {
        setMyCvs(res.data.cvs);
        setSelectedCvId(res.data.cvs[0]._id);
        setUseExistingCv(true);
      } else {
        setUseExistingCv(false);
      }
    } catch (err) {
      console.error('Failed to fetch CVs', err);
    }
    
    setShowApplyModal(true);
  };

  const handleApply = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để ứng tuyển');
      return;
    }
    if (user.role !== 'CANDIDATE') {
      toast.error('Chỉ ứng viên mới có thể ứng tuyển');
      return;
    }
    
    setApplying(true);
    try {
      let finalCvId = selectedCvId;

      if (!useExistingCv) {
        if (!newCvFile) {
          toast.error('Vui lòng chọn file CV để tải lên');
          setApplying(false);
          return;
        }

        // Upload new CV document
        const formData = new FormData();
        formData.append('document', newCvFile);
        const uploadRes = await uploadApi.uploadDocument(formData);
        
        if (uploadRes.status === 'success') {
          // Create CV record
          const cvRes = await cvApi.uploadCV({
            title: newCvFile.name,
            file_path: uploadRes.data.url
          });
          if (cvRes.status === 'success') {
            finalCvId = cvRes.data.cv._id;
          }
        } else {
          throw new Error('Upload CV thất bại');
        }
      } else {
        if (!finalCvId) {
          toast.error('Vui lòng chọn CV để ứng tuyển');
          setApplying(false);
          return;
        }
      }

      const res = await applicationsApi.apply(job?._id || job?.id || id, finalCvId, coverLetter);
      if (res.status === 'success') {
        toast.success('Ứng tuyển thành công!');
        setHasApplied(true);
        setShowApplyModal(false);
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi khi ứng tuyển');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f0f0]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ backgroundColor: '#f0f0f0' }}>
        <div className="text-[60px]">😕</div>
        <h2 className="text-xl font-bold text-[#222]">Không tìm thấy việc làm</h2>
        <Link to="/jobs"
          className="px-6 py-2.5 bg-primary text-white font-bold rounded-full hover:bg-primary-dark transition-colors">
          Quay lại tìm kiếm
        </Link>
      </div>
    );
  }

  const employerPhone = job?.employer_id?.phone || 'Chưa cập nhật';
  const isExpired = job?.deadline && new Date(job.deadline).setHours(23, 59, 59, 999) < new Date().getTime();
  const cantApply = job?.status === 'CLOSED' || job?.status === 'EXPIRED' || isExpired;

  /* ── Constants ── */

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f0f0f0' }}>

      {/* ── Breadcrumb ── */}
      <div className="bg-white border-b border-[#e5e7eb] py-2.5">
        <div className="container flex items-center gap-1 text-[12px] text-[#999]">
          <Link to="/" className="hover:text-primary">VinJobs</Link>
          <span className="mi text-[14px]">chevron_right</span>
          <Link to="/jobs" className="hover:text-primary">Việc làm</Link>
          <span className="mi text-[14px]">chevron_right</span>
          {job.location && (
            <>
              <Link to={`/jobs?q=${encodeURIComponent(job.location)}`} className="hover:text-primary truncate max-w-[120px]">{job.location}</Link>
              <span className="mi text-[14px]">chevron_right</span>
            </>
          )}
          <span className="text-[#555] font-medium truncate max-w-[240px]">{job.title}</span>
        </div>
      </div>

      <div className="container py-4 pb-24 lg:pb-4">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4 items-start">

          {/* ═══ MAIN CONTENT (LEFT) ═══ */}
          <div className="space-y-4">
            {/* Header Card */}
            <div ref={headerRef} className="bg-white rounded-xl p-4 sm:p-5">
              <div className="flex gap-4">
                {/* Logo */}
                <div className="w-[80px] h-[80px] rounded-xl overflow-hidden shrink-0 flex items-center justify-center bg-white p-1">
                  <img
                    src={job.company_id?.logo ? getImageUrl(job.company_id.logo) : '/default-company-logo.png'}
                    alt={job.company_id?.name || 'Company Logo'}
                    className="w-full h-full object-contain"
                    onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(job.company_id?.name || 'Company')}&background=random&size=160`; }}
                  />
                </div>
                {/* Title & Company */}
                <div className="flex-1">
                  <h1 className="text-[18px] sm:text-[20px] font-bold text-[#111] leading-snug mb-1">{job.title}</h1>
                  <div className="flex items-center gap-1.5 text-[13px] text-[#555]">
                    <span className="font-semibold">{job.company_id?.name || 'VinJobs'}</span>
                    <span className="mi text-[16px] text-primary" title="Đã xác thực">verified</span>
                  </div>
                </div>
              </div>

              {/* Salary */}
              <div className="mt-4 mb-2">
                <span className="text-[18px] sm:text-[20px] font-bold text-[#ef4444]">{salaryTextRed(job.salary_min, job.salary_max, job.salary_negotiable)}</span>
              </div>

              {/* Location */}
              <div className="flex items-start gap-1.5 text-[13px] text-[#555] mb-3">
                <span className="mi text-[18px] text-[#aaa] shrink-0">location_on</span>
                <span className="font-medium mt-0.5">{job.location}</span>
              </div>

              {/* Meta */}
              <div className="flex items-center justify-between text-[13px] text-[#888] mb-4">
                <div className="flex items-center gap-2">
                  <span>{job.postedAt || 'Vừa xong'}</span>
                  <span>·</span>
                  <span>{job.contacts || 0} Liên Hệ</span>
                  {cantApply && <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-600 rounded text-[11px] font-bold">Hết hạn</span>}
                </div>
                <button onClick={handleShare} className="flex items-center gap-1 text-[#444] hover:text-[#2563eb] transition-colors font-medium ml-2 border-l border-[#ddd] pl-3">
                  <span className="mi text-[20px]">share</span>
                  Chia sẻ
                </button>
                <button onClick={handleToggleSave} className="flex items-center gap-1 text-[#444] hover:text-[#ef4444] transition-colors font-medium ml-2 border-l border-[#ddd] pl-3">
                  <span className="mi text-[20px]">{saved ? 'favorite' : 'favorite_border'}</span>
                  Lưu tin
                </button>
              </div>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-4 border-t border-[#f0f0f0]">
                {[
                  { icon: 'payments',    label: 'HT trả lương', value: 'Theo tháng' },
                  { icon: 'school',      label: 'Học vấn',       value: job.education || 'Không yêu cầu' },
                  { icon: 'star_outline',label: 'Kinh nghiệm',   value: job.experience || jobLevelLabels[job?.level] || 'Không yêu cầu' },
                  { icon: 'work_outline',label: 'Loại hình',     value: JOB_TYPES[job?.type] || job?.type || 'Toàn thời gian' },
                  { icon: 'wc',          label: 'Giới tính',     value: job.gender || 'Không yêu cầu' },
                  { icon: 'cake',        label: 'Độ tuổi',       value: (job?.age_min || job?.age_max) ? `Từ ${job?.age_min || 18} - ${job?.age_max || 60} tuổi` : 'Không yêu cầu' }
                ].map((info, i) => (
                  <div key={i} className="flex items-center gap-2.5 bg-[#f9f9f9] p-2.5 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-white border border-[#ddd] flex items-center justify-center shrink-0">
                      <span className="mi text-[16px] text-[#666]">{info.icon}</span>
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] text-[#888] truncate">{info.label}</div>
                      <div className="text-[13px] font-semibold text-[#222] truncate">{info.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Description Card */}
            <div className="bg-white rounded-xl p-4 sm:p-5">
              <h2 className="text-[16px] font-bold text-[#111] mb-4">Đặc điểm công việc</h2>
              
              <div className="mb-6 space-y-3 text-[14px]">
                <div className="flex border-b border-dashed border-[#eee] pb-2">
                  <div className="w-[140px] text-[#666] flex items-center gap-1"><span className="mi text-[18px]">work_history</span> Ngành nghề:</div>
                  <div className="flex-1 font-semibold text-[#222]">{job?.industry || 'Đa ngành'}</div>
                </div>
                <div className="flex border-b border-dashed border-[#eee] pb-2">
                  <div className="w-[140px] text-[#666] flex items-center gap-1"><span className="mi text-[18px]">groups</span> Số lượng:</div>
                  <div className="flex-1 font-semibold text-[#222]">{job?.slots ? `${job.slots} người` : 'Không giới hạn'}</div>
                </div>
                <div className="flex border-b border-dashed border-[#eee] pb-2">
                  <div className="w-[140px] text-[#666] flex items-center gap-1"><span className="mi text-[18px]">calendar_month</span> Ngày làm việc:</div>
                  <div className="flex-1 font-semibold text-[#222]">{job?.working_days?.join(', ') || 'N/A'}</div>
                </div>
                <div className="flex border-b border-dashed border-[#eee] pb-2">
                  <div className="w-[140px] text-[#666] flex items-center gap-1"><span className="mi text-[18px]">access_time</span> Giờ làm việc:</div>
                  <div className="flex-1 font-semibold text-[#222]">{job?.working_hours?.length === 2 ? `${job.working_hours[0]} - ${job.working_hours[1]}` : 'N/A'}</div>
                </div>
              </div>

              <h2 className="text-[16px] font-bold text-[#111] mb-4">Mô tả công việc</h2>
              <div className="text-[14px] text-[#333] leading-relaxed [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&_p]:mb-2" dangerouslySetInnerHTML={{ __html: sanitizeHtml(job?.description) }}></div>

              {job?.requirements && (
                <>
                  <h2 className="text-[16px] font-bold text-[#111] mt-6 mb-4">Yêu cầu ứng viên</h2>
                  <div className="text-[14px] text-[#333] leading-relaxed [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&_p]:mb-2" dangerouslySetInnerHTML={{ __html: sanitizeHtml(job?.requirements) }}></div>
                </>
              )}

              {job?.benefits && job?.benefits.length > 0 && (
                <>
                  <h2 className="text-[16px] font-bold text-[#111] mt-6 mb-4">Quyền lợi</h2>
                  <div className="flex flex-wrap gap-2">
                    {job.benefits.map((b, i) => (
                      <span key={i} className="px-3 py-1.5 bg-[#f0fdf4] text-[#16a34a] rounded-lg text-[13px] font-medium border border-[#bbf7d0]">
                        <span className="mi text-[14px] mr-1 align-text-bottom">check_circle</span>
                        {BENEFITS_MAP[b] || b}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Company Photos Card */}
            {job.images && job.images.length > 0 && (
              <div className="bg-white rounded-xl p-4 sm:p-5">
                <h2 className="text-[16px] font-bold text-[#111] mb-4">Hình ảnh công ty</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {job.images.map((url, i) => (
                    <div 
                      key={i} 
                      className="aspect-video rounded-lg overflow-hidden border border-gray-200 cursor-pointer hover:opacity-90 hover:shadow-md transition-all group relative"
                      onClick={() => setSelectedImageIndex(i)}
                    >
                      <img src={(typeof getImageUrl !== 'undefined' ? getImageUrl : (u) => (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000') + (u.startsWith('/') ? u : '/'+u))(url)} alt={`Ảnh văn phòng ${i+1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                        <span className="mi text-white text-[32px] opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md">zoom_in</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* ═══ RIGHT SIDEBAR (EMPLOYER & ACTIONS) ═══ */}
          <aside className="space-y-4 lg:sticky lg:top-[calc(var(--spacing-header-height)+16px)]">
            
            {/* Employer Card */}
            <div className="bg-white rounded-xl overflow-hidden">
              <div className="p-4 border-b border-[#f0f0f0]">
                <div className="flex items-center gap-3">
                  <div className="w-[60px] h-[60px] rounded-full overflow-hidden bg-white shrink-0 p-1 border border-gray-100">
                    <img src={job.company_id?.logo ? getImageUrl(job.company_id.logo) : `https://ui-avatars.com/api/?name=${encodeURIComponent(job.company_id?.name || 'V')}&background=random`} 
                         alt="Nhà tuyển dụng" className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1">
                    <div className="text-[15px] font-bold text-[#222] mb-0.5 line-clamp-1">{job.company_id?.name || 'VinJobs'}</div>
                    <div className="flex items-center gap-1 text-[12px] text-[#666]">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span> Đang hoạt động
                    </div>
                  </div>
                  <Link to={`/companies/${job.company_id?.slug || job.company_id?._id || job.company_id?.id || ''}`} className="px-3 py-1.5 border border-[#ffba00] text-[#d97706] text-[12px] font-semibold rounded-full hover:bg-[#fffbeb] transition-colors whitespace-nowrap">
                    Xem trang
                  </Link>
                </div>

                <div className="flex justify-between mt-4 text-[12px] text-[#666] bg-[#f9f9f9] p-2.5 rounded-lg">
                  <div className="text-center">
                    <div className="font-bold text-[#222]">85%</div>
                    Phản hồi chat
                  </div>
                  <div className="w-px bg-[#ddd]"></div>
                  <div className="text-center">
                    <div className="font-bold text-[#222]">1 năm</div>
                    Tham gia
                  </div>
                </div>
              </div>

              {/* Action Buttons (Desktop only) */}
              <div className="p-4 hidden lg:flex flex-col gap-2.5">
                <button 
                  onClick={() => setShowPhone(v => !v)}
                  className="w-full py-3 bg-[#2eaa56] text-white rounded-xl text-[14px] font-bold hover:bg-[#1e8a42] transition-colors flex items-center justify-center gap-2">
                  <span className="mi text-[20px]">call</span>
                  {showPhone ? employerPhone : employerPhone.slice(0, Math.max(0, employerPhone.length - 4)) + '****'}
                </button>
                <div className="flex gap-2.5">
                  <button className="flex-1 py-3 border-2 border-primary text-primary rounded-xl text-[14px] font-bold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
                    <span className="mi text-[20px]">chat</span>
                    Chat
                  </button>
                  <button 
                    onClick={handleOpenApplyModal}
                    disabled={hasApplied || cantApply}
                    className={`flex-1 py-3 text-white rounded-xl text-[14px] font-bold transition-colors flex items-center justify-center gap-2 ${hasApplied || cantApply ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-primary-dark'}`}>
                    <span className="mi text-[20px]">{hasApplied ? 'check_circle' : (cantApply ? 'block' : 'send')}</span>
                    {hasApplied ? 'Đã ứng tuyển' : (cantApply ? 'Hết hạn ứng tuyển' : 'Ứng tuyển')}
                  </button>
                </div>
              </div>
            </div>

            {/* Contact form */}
            <div className="bg-white rounded-xl p-4 hidden lg:block">
              <h3 className="text-[14px] font-bold text-[#222] mb-1">Bạn thắc mắc về công việc này?</h3>
              <p className="text-[12px] text-[#888] mb-3">Hãy để lại số điện thoại để nhà tuyển dụng có thể gọi lại cho bạn và trao đổi kỹ hơn nhé!</p>
              <div className="space-y-2.5">
                <div>
                  <input
                    type="text"
                    placeholder="Họ tên *"
                    value={contactName}
                    onChange={e => setContactName(e.target.value)}
                    className="w-full border border-[#ddd] rounded-lg px-3.5 py-2.5 text-[13px] text-[#333] placeholder:text-[#bbb] outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    placeholder="Số điện thoại *"
                    value={contactPhone}
                    onChange={e => setContactPhone(e.target.value)}
                    className="w-full border border-[#ddd] rounded-lg px-3.5 py-2.5 text-[13px] text-[#333] placeholder:text-[#bbb] outline-none focus:border-primary transition-colors"
                  />
                </div>
                <p className="text-[11px] text-[#aaa] leading-relaxed">
                  Bằng việc bấm nút "Gửi thông tin", bạn đã đọc và đồng ý{' '}
                  <Link to="/privacy-policy" className="text-primary hover:underline">
                    Chính sách bảo mật
                  </Link>{' '}
                  của VinJobs.
                </p>
                <button 
                  onClick={() => {
                    if (!contactName || !contactPhone) return toast.error('Vui lòng điền đủ họ tên và số điện thoại');
                    toast.success('Đã gửi thông tin cho nhà tuyển dụng!');
                    setContactName('');
                    setContactPhone('');
                  }}
                  className="w-full py-2.5 bg-primary text-white rounded-lg text-[13px] font-bold hover:bg-primary-dark transition-colors">
                  Gửi thông tin
                </button>
              </div>
            </div>

            {/* Report Button */}
            <div className="text-center pt-2 pb-4 lg:pb-0">
              <button 
                onClick={() => toast.success('Đã gửi báo cáo tin đăng. Cảm ơn bạn!')}
                className="text-[12px] text-[#888] hover:text-[#ef4444] transition-colors underline decoration-[#ccc] underline-offset-2 flex items-center justify-center gap-1 mx-auto"
              >
                <span className="mi text-[14px]">flag</span>
                Có vấn đề với tin đăng này? Báo cáo lừa đảo
              </button>
            </div>

            {/* Related jobs sidebar */}
            <div className="bg-white rounded-xl p-4 hidden lg:block">
              <h3 className="text-[14px] font-bold text-[#222] mb-3">Việc làm tương tự</h3>
              <div className="space-y-2.5">
                {relatedJobs.length > 0 ? relatedJobs.map(rj => (
                  <Link key={rj._id || rj.id} to={`/jobs/${rj._id || rj.id}`}
                    className="flex gap-2.5 group hover:bg-[#f9f9f9] rounded-lg p-1.5 -mx-1.5 transition-colors">
                    <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 flex items-center justify-center p-0.5 bg-white">
                      <img src={rj.company_id?.logo ? getImageUrl(rj.company_id.logo) : '/default-company-logo.png'} alt={rj.company_id?.name || 'Công ty'} className="w-full h-full object-contain"
                        onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(rj.company_id?.name || 'Công ty')}&background=random`; }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-[#222] group-hover:text-primary transition-colors line-clamp-2 leading-tight">{rj.title}</p>
                      <p className="text-[12px] font-bold text-[#ef4444] mt-0.5">{salaryTextRed(rj.salary_min, rj.salary_max, rj.salary_negotiable)}</p>
                    </div>
                  </Link>
                )) : <div className="text-[13px] text-[#888]">Chưa có việc làm nào khác.</div>}
              </div>
              <Link to="/jobs"
                className="flex items-center justify-center gap-1 mt-3 text-[12px] text-primary font-semibold hover:underline">
                Xem thêm <span className="mi text-[14px]">arrow_forward</span>
              </Link>
            </div>

          </aside>
        </div>
      </div>

      {/* ── Mobile Fixed Bottom Action Bar ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#eee] p-3 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-[200]">
        <div className="flex gap-2 max-w-[600px] mx-auto">
          <button className="flex items-center justify-center w-12 h-12 bg-[#f0f0f0] text-[#333] rounded-xl hover:bg-[#e0e0e0] transition-colors shrink-0">
            <span className="mi text-[24px]">chat</span>
          </button>
          <button 
            onClick={() => setShowPhone(v => !v)}
            className="flex-1 h-12 bg-[#2eaa56] text-white rounded-xl text-[14px] font-bold hover:bg-[#1e8a42] transition-colors flex items-center justify-center gap-1.5">
            <span className="mi text-[20px]">call</span>
            {showPhone ? employerPhone : 'Gọi điện'}
          </button>
          <button 
            onClick={handleOpenApplyModal}
            disabled={hasApplied || cantApply}
            className={`flex-1 h-12 text-white rounded-xl text-[14px] font-bold transition-colors flex items-center justify-center gap-1.5 ${hasApplied || cantApply ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-primary-dark'}`}>
            <span className="mi text-[20px]">{hasApplied ? 'check_circle' : (cantApply ? 'block' : 'send')}</span>
            {hasApplied ? 'Đã ứng tuyển' : (cantApply ? 'Hết hạn' : 'Ứng tuyển')}
          </button>
        </div>
      </div>
      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[850px] overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-5 md:p-6 border-b border-[#e5e7eb] flex items-center justify-between bg-white shrink-0 relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-[18px] md:text-[20px] font-bold text-[#111827] pr-8">Ứng tuyển: {job?.title}</h3>
                <p className="text-[13px] text-[#6b7280] mt-1 flex items-center gap-1.5">
                  <span className="mi text-[16px]">business</span> {job?.company_id?.name}
                </p>
              </div>
              <button onClick={() => setShowApplyModal(false)} className="absolute top-5 right-5 text-[#9ca3af] hover:text-[#111827] bg-gray-100 hover:bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center transition-colors z-10">
                <span className="mi text-[20px]">close</span>
              </button>
            </div>
            
            {/* Body */}
            <div className="flex-1 overflow-y-auto bg-[#f9fafb] p-5 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                
                {/* ── CỘT TRÁI: Thông tin cá nhân & Thư giới thiệu ── */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-[14px] font-bold text-[#111827] mb-3 flex items-center gap-1.5">
                      <span className="mi text-primary">person</span> Thông tin liên hệ
                    </h4>
                    <div className="bg-white rounded-xl border border-[#e5e7eb] p-4 shadow-sm hover:border-primary/30 transition-colors">
                      <div className="mb-3 pb-3 border-b border-gray-100">
                        <div className="text-[15px] font-bold text-[#111827]">{user?.name || user?.full_name || 'Tên người dùng'}</div>
                        <div className="text-[12px] text-[#6b7280] mt-0.5">Họ và tên</div>
                      </div>
                      
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <div className="text-[15px] font-bold text-[#111827]">
                            {user?.phone || 'Chưa cập nhật'}
                            <span className={`ml-2 inline-flex items-center gap-0.5 text-[11px] px-1.5 py-0.5 rounded-md font-semibold ${user?.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {user?.status === 'ACTIVE' ? <><span className="mi text-[12px]">verified</span> Đã xác thực</> : 'Chưa xác thực'}
                            </span>
                          </div>
                          <div className="text-[12px] text-[#6b7280] mt-0.5">Số điện thoại</div>
                        </div>
                        {user?.status !== 'ACTIVE' && (
                          <button onClick={() => toast.info('Vui lòng vào trang cá nhân để xác thực số điện thoại')} className="px-3 py-1.5 border border-[#ef4444] text-[#ef4444] text-[12px] font-semibold rounded-lg hover:bg-[#fff5f5] transition-colors shrink-0">
                            Xác thực
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[14px] font-bold text-[#111827] mb-3 flex items-center gap-1.5">
                      <span className="mi text-primary">edit_document</span> Thư giới thiệu
                      <span className="text-[12px] font-normal text-[#6b7280] ml-1">(Không bắt buộc)</span>
                    </h4>
                    <textarea
                      rows="4"
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      placeholder="Viết vài dòng giới thiệu về bản thân và lý do bạn phù hợp với công việc này. Những ứng viên có thư giới thiệu thường được nhà tuyển dụng chú ý hơn."
                      className="w-full bg-white border border-[#e5e7eb] rounded-xl px-4 py-3 text-[14px] text-[#111827] outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-none shadow-sm placeholder:text-[#9ca3af]"
                    />
                  </div>
                </div>

                {/* ── CỘT PHẢI: Hồ sơ đính kèm (CV) ── */}
                <div className="space-y-3">
                  <h4 className="text-[14px] font-bold text-[#111827] flex items-center gap-1.5">
                    <span className="mi text-primary">contact_page</span> Hồ sơ đính kèm (CV)
                  </h4>
                  <div className="bg-white rounded-xl border border-[#e5e7eb] overflow-hidden shadow-sm">
                    
                    {/* Option 1: Dùng CV đã lưu */}
                    {myCvs.length > 0 && (
                      <label className={`flex items-start gap-3 p-4 cursor-pointer transition-all ${useExistingCv ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}>
                        <div className="relative flex items-center justify-center mt-0.5">
                          <input 
                            type="radio" 
                            name="cvOption" 
                            checked={useExistingCv} 
                            onChange={() => setUseExistingCv(true)}
                            className="peer w-4 h-4 text-primary border-gray-300 focus:ring-primary cursor-pointer"
                          />
                        </div>
                        <div className="flex-1">
                          <div className={`text-[14px] font-bold ${useExistingCv ? 'text-primary' : 'text-[#374151]'}`}>Sử dụng CV đã lưu trên VinJobs</div>
                          <div className="text-[12px] text-[#6b7280] mt-0.5 mb-3">Chọn CV bạn đã tải lên hệ thống trước đó</div>
                          {useExistingCv && (
                            <div className="animate-in slide-in-from-top-1 fade-in duration-200">
                              <select 
                                value={selectedCvId}
                                onChange={(e) => setSelectedCvId(e.target.value)}
                                className="w-full border border-[#d1d5db] rounded-lg px-3 py-2 text-[14px] text-[#111827] outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 bg-white"
                              >
                                {myCvs.map(cv => (
                                  <option key={cv._id} value={cv._id}>{cv.title}</option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                      </label>
                    )}
                    
                    {/* Option 2: Upload CV mới */}
                    <label className={`flex items-start gap-3 p-4 cursor-pointer transition-all border-t border-[#e5e7eb] ${!useExistingCv ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}>
                      <div className="relative flex items-center justify-center mt-0.5">
                        <input 
                          type="radio" 
                          name="cvOption" 
                          checked={!useExistingCv} 
                          onChange={() => setUseExistingCv(false)}
                          className="peer w-4 h-4 text-primary border-gray-300 focus:ring-primary cursor-pointer"
                        />
                      </div>
                      <div className="flex-1">
                        <div className={`text-[14px] font-bold ${!useExistingCv ? 'text-primary' : 'text-[#374151]'}`}>Tải CV mới từ thiết bị</div>
                        <div className="text-[12px] text-[#6b7280] mt-0.5 mb-3">Hỗ trợ định dạng PDF. Tối đa 5MB.</div>
                        {!useExistingCv && (
                          <div className="animate-in slide-in-from-top-1 fade-in duration-200">
                            <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-[#d1d5db] rounded-xl hover:bg-gray-50 hover:border-primary transition-colors cursor-pointer bg-white">
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <span className={`mi text-[32px] ${newCvFile ? 'text-green-500' : 'text-[#9ca3af]'}`}>
                                  {newCvFile ? 'task' : 'cloud_upload'}
                                </span>
                                <p className="mt-2 text-[13px] text-gray-500 font-medium text-center px-4 line-clamp-1">
                                  {newCvFile ? newCvFile.name : <><span className="text-primary font-semibold">Nhấn để chọn</span> hoặc kéo thả file</>}
                                </p>
                              </div>
                              <input 
                                type="file" 
                                className="hidden" 
                                accept=".pdf"
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    const file = e.target.files[0];
                                    if(file.type !== 'application/pdf') {
                                      toast.error('Chỉ hỗ trợ file PDF');
                                      return;
                                    }
                                    if(file.size > 5 * 1024 * 1024) {
                                      toast.error('File không vượt quá 5MB');
                                      return;
                                    }
                                    setNewCvFile(file);
                                  }
                                }}
                              />
                            </label>
                          </div>
                        )}
                      </div>
                    </label>

                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-[#e5e7eb] bg-white flex flex-col md:flex-row items-center justify-between gap-4 shrink-0">
              <p className="text-[11px] text-[#6b7280] leading-relaxed max-w-[480px]">
                Bằng việc bấm nút "Nộp hồ sơ ứng tuyển", bạn đã xác nhận đồng ý với <Link to="/terms" className="text-primary hover:underline">Quy định bảo mật</Link> của VinJobs và cho phép chia sẻ thông tin cho Nhà tuyển dụng.
              </p>
              <div className="flex gap-3 w-full md:w-auto">
                <button 
                  onClick={() => setShowApplyModal(false)}
                  className="flex-1 md:flex-none px-6 py-2.5 rounded-xl text-[14px] font-semibold text-[#4b5563] bg-[#f3f4f6] hover:bg-[#e5e7eb] transition-colors">
                  Hủy
                </button>
                <button 
                  onClick={handleApply}
                  disabled={applying || user?.status !== 'ACTIVE'}
                  className={`flex-1 md:flex-none px-8 py-2.5 rounded-xl text-[14px] font-bold text-white transition-all shadow-md flex items-center justify-center gap-2 ${applying || user?.status !== 'ACTIVE' ? 'bg-gray-400 cursor-not-allowed shadow-none' : 'bg-primary hover:bg-primary-dark hover:shadow-lg hover:-translate-y-0.5'}`}>
                  {applying ? (
                    <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Đang gửi...</>
                  ) : (
                    <><span className="mi text-[18px]">send</span> Nộp hồ sơ</>
                  )}
                </button>
              </div>
            </div>
            
          </div>
        </div>
      )}

      {/* Image Gallery Modal */}
      {selectedImageIndex !== null && job.images && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/90 backdrop-blur-sm px-4">
          <button 
            onClick={() => setSelectedImageIndex(null)}
            className="absolute top-4 right-4 md:top-6 md:right-6 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors z-[1001]"
          >
            <span className="mi text-[24px]">close</span>
          </button>
          
          <div className="relative w-full max-w-[1000px] h-full max-h-[80vh] flex items-center justify-center select-none">
            {/* Prev Button */}
            {selectedImageIndex > 0 && (
              <button 
                onClick={(e) => { e.stopPropagation(); setSelectedImageIndex(selectedImageIndex - 1); }}
                className="absolute left-2 md:-left-12 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors z-10"
              >
                <span className="mi text-[28px]">chevron_left</span>
              </button>
            )}

            {/* Image */}
            <img 
              src={getImageUrl(job.images[selectedImageIndex])} 
              alt={`Gallery image ${selectedImageIndex + 1}`} 
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Next Button */}
            {selectedImageIndex < job.images.length - 1 && (
              <button 
                onClick={(e) => { e.stopPropagation(); setSelectedImageIndex(selectedImageIndex + 1); }}
                className="absolute right-2 md:-right-12 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors z-10"
              >
                <span className="mi text-[28px]">chevron_right</span>
              </button>
            )}

            {/* Counter */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-white/80 text-[14px] font-medium tracking-widest">
              {selectedImageIndex + 1} / {job.images.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

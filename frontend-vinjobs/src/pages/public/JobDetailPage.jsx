import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { mockJobs, jobTypeLabels, jobLevelLabels } from '../../data/mockData';
import { jobsApi, applicationsApi } from '../../lib/api';
import { userStorage } from '../../lib/api';
import { toast } from 'react-hot-toast';

/* ── helpers ── */
function salaryTextRed(min, max) {
  if (!min && !max) return 'Thoả thuận';
  const minText = ((min || 0) / 1_000_000).toFixed(0);
  const maxText = ((max || 0) / 1_000_000).toFixed(0);
  if (minText === '0') return `Lên đến ${maxText} triệu/tháng`;
  if (maxText === '0' || maxText === 'Infinity') return `Từ ${minText} triệu/tháng`;
  return `${minText} – ${maxText} triệu/tháng`;
}

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
  const [activeTab, setActiveTab] = useState('photos');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const headerRef = useRef(null);
  const user = userStorage.get();

  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true);
      try {
        const res = await jobsApi.get(id);
        if (res.status === 'success') {
          setJob(res.data.job);
        }
      } catch (err) {
        console.error('Failed to fetch job', err);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

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
      const res = await applicationsApi.apply(id, null, coverLetter);
      if (res.status === 'success') {
        toast.success('Ứng tuyển thành công!');
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

  const relatedJobs = mockJobs.filter(j => j.id !== job.id).slice(0, 4);
  const fakePhone   = '090' + Math.floor(Math.random() * 9000000 + 1000000);

  /* ── Section data ── */
  const descSections = [
    {
      key: 'desc',
      label: 'Mô tả công việc & Quyền lợi',
      content: (
        <div className="prose-sm text-[14px] text-[#444] leading-relaxed">
          <p className="mb-3">🌟 <strong>{job?.company_id?.name || 'Công ty'}</strong> tuyển dụng 🌟</p>
          <p className="font-semibold mb-1">📌 Vị trí tuyển dụng: {job?.title}</p>
          <p className="mb-3">📍 Địa điểm làm việc: {job?.location}</p>
          <p className="font-semibold mb-2">📌 Chi tiết công việc:</p>
          <div className="whitespace-pre-line mb-3">{job?.description}</div>
          <div className="border border-[#e5e7eb] rounded-lg px-4 py-2 inline-flex items-center gap-2 text-[13px]">
            <span className="text-[#666]">SĐT Liên hệ: {showPhone ? fakePhone : fakePhone.slice(0, 6) + '****'}</span>
            {!showPhone && (
              <button onClick={() => setShowPhone(true)}
                className="text-primary font-semibold hover:underline">
                Nhấn để hiện số
              </button>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'specs',
      label: 'Đặc điểm công việc',
      content: (
        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          {[
            { icon: 'wc',          label: 'Giới tính',            value: 'Không yêu cầu' },
            { icon: 'groups',      label: 'Số lượng tuyển dụng',  value: '10' },
            { icon: 'cake',        label: 'Độ tuổi tối thiểu',    value: '18' },
            { icon: 'work_history',label: 'Ngành nghề',            value: 'Đa ngành' },
            { icon: 'elderly',     label: 'Độ tuổi tối đa',       value: '40' },
            { icon: 'work_outline',label: 'Loại công việc',        value: jobTypeLabels[job?.type] || 'Toàn thời gian' },
            { icon: 'school',      label: 'Trình độ học vấn',      value: 'Không yêu cầu' },
            { icon: 'payments',    label: 'Hình thức trả lương',   value: 'Theo tháng' },
            { icon: 'star_outline',label: 'Kinh nghiệm làm việc',  value: jobLevelLabels[job?.level] || 'Không yêu cầu' },
          ].map(item => (
            <div key={item.label} className="flex items-start gap-3">
              <span className="mi text-[18px] text-[#aaa] mt-0.5 shrink-0">{item.icon}</span>
              <div>
                <div className="text-[12px] text-[#999]">{item.label}</div>
                <div className="text-[14px] font-semibold text-[#222]">{item.value}</div>
              </div>
            </div>
          ))}
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f0f0f0' }}>

      {/* ── Sticky top bar (shows when scrolled past header) ── */}
      <div className={`fixed top-[var(--spacing-header-height)] left-0 right-0 z-[200] bg-white border-b border-[#e5e7eb] shadow-md transition-all duration-300 ${stickyShow ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}`}>
        <div className="container flex items-center gap-4 py-2.5">
          <div className="w-9 h-9 rounded-lg border border-[#e5e7eb] overflow-hidden flex items-center justify-center p-0.5 shrink-0 bg-white">
            <img src={job.company_id?.logo || '/default-company-logo.png'} alt={job.company_id?.name} className="w-full h-full object-contain"
              onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(job.company_id?.name || 'Company')}&background=random`; }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold text-[#111] truncate">{job.title}</p>
            <p className="text-[12px] text-[#ef4444] font-semibold">{salaryTextRed(job.salary_min, job.salary_max)}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => setSaved(v => !v)}
              className={`p-2 rounded-full border border-[#ddd] transition-colors ${saved ? 'text-[#ef4444] border-[#ef4444] bg-[#fff5f5]' : 'text-[#aaa] hover:text-[#ef4444]'}`}>
              <span className="mi text-[18px]">{saved ? 'favorite' : 'favorite_border'}</span>
            </button>
            <button className="px-5 py-2 border border-[#ddd] rounded-full text-[13px] font-semibold text-[#444] hover:border-primary hover:text-primary transition-colors">
              Chat
            </button>
            <button className="px-5 py-2 border border-[#333] rounded-full text-[13px] font-semibold text-[#333] hover:bg-[#f5f5f5] transition-colors">
              Hiện số {showPhone ? fakePhone : fakePhone.slice(0, 6) + '****'}
            </button>
            <button 
              onClick={() => setShowApplyModal(true)}
              className="px-6 py-2 bg-primary text-white rounded-full text-[13px] font-bold hover:bg-primary-dark transition-colors flex items-center gap-1.5">
              <span className="mi text-[16px]">person</span>
              Ứng tuyển
            </button>
          </div>
        </div>
      </div>

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

      <div className="container py-4">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 items-start">

          {/* ═══ MAIN CONTENT ═══ */}
          <div className="space-y-3">

            {/* ── Job header card ── */}
            <div ref={headerRef} className="bg-white rounded-xl border border-[#e5e7eb] p-5">
              {/* Top: logo + title */}
              <div className="flex gap-4 mb-4">
                <div className="w-[72px] h-[72px] rounded-xl border border-[#e5e7eb] overflow-hidden shrink-0 flex items-center justify-center bg-white p-1.5">
                  <img
                    src={job.company_id?.logo || '/default-company-logo.png'}
                    alt={job.company_id?.name}
                    className="w-full h-full object-contain"
                    onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(job.company_id?.name || 'Company')}&background=random&size=120`; }}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    {job.badge === 'hot' && (
                      <span className="px-2 py-0.5 bg-[#ef4444] text-white text-[10px] font-bold rounded">⚡ Tuyển gấp</span>
                    )}
                    {job.badge === 'premium' && (
                      <span className="px-2 py-0.5 bg-[#f59e0b] text-white text-[10px] font-bold rounded">⭐ Đối Tác</span>
                    )}
                    {job.badge === 'new' && (
                      <span className="px-2 py-0.5 bg-primary text-white text-[10px] font-bold rounded">✨ Mới</span>
                    )}
                  </div>
                  <h1 className="text-[18px] font-bold text-[#111] leading-snug mb-1">{job.title}</h1>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[13px] font-semibold text-[#555]">{job.company_id?.name || 'VinJobs'}</span>
                    <span className="mi text-[16px] text-primary" title="Đã xác thực">verified</span>
                  </div>
                </div>
                <button className="self-start p-1 text-[#ccc] hover:text-[#888] transition-colors">
                  <span className="mi text-[22px]">more_vert</span>
                </button>
              </div>

              {/* Salary + benefit tags */}
              <div className="mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[16px] font-bold text-[#ef4444]">{salaryTextRed(job.salary_min, job.salary_max)}</span>
                  {job.badge === 'premium' && (
                    <span className="px-2 py-0.5 bg-[#dcfce7] border border-[#86efac] text-[#16a34a] text-[11px] font-bold rounded-full">✓ Lương tốt</span>
                  )}
                  <span className="px-2 py-0.5 bg-[#eff6ff] border border-[#bfdbfe] text-[#2563eb] text-[11px] font-medium rounded-full">Bảo hiểm</span>
                  <span className="px-2 py-0.5 bg-[#fef3c7] border border-[#fde68a] text-[#d97706] text-[11px] font-medium rounded-full">Lương tháng 13</span>
                </div>
              </div>

              {/* Address */}
              <div className="mb-2">
                <div className="flex items-start gap-1.5 text-[13px] text-[#555]">
                  <span className="mi text-[16px] text-[#aaa] mt-0.5 shrink-0">location_on</span>
                  <div>
                    <span className="font-medium">{job.location}</span>
                    {job.location.includes('TP.HCM') && (
                      <div className="text-[12px] text-[#999]">Tp Hồ Chí Minh</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Posted + contacts */}
              <div className="text-[12px] text-[#aaa] mb-4">
                {job.postedAt} · {job.contacts} Liên Hệ
              </div>

              {/* Info boxes: 3 cols */}
              <div className="grid grid-cols-3 gap-0 border border-[#e5e7eb] rounded-xl overflow-hidden mb-4">
                {[
                  { icon: 'payments',    label: 'HT trả lương', value: 'Theo tháng' },
                  { icon: 'school',      label: 'Học vấn',       value: 'Không yêu cầu' },
                  { icon: 'star_outline',label: 'Kinh nghiệm',   value: jobLevelLabels[job?.level] || 'Không yêu cầu' },
                ].map((info, i) => (
                  <div key={info.label}
                    className={`flex items-center gap-2.5 px-4 py-3 ${i < 2 ? 'border-r border-[#e5e7eb]' : ''}`}>
                    <div className="w-8 h-8 rounded-lg bg-[#eff6ff] flex items-center justify-center shrink-0">
                      <span className="mi text-[16px] text-primary">{info.icon}</span>
                    </div>
                    <div>
                      <div className="text-[11px] text-[#999]">{info.label}</div>
                      <div className="text-[13px] font-bold text-[#222]">{info.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSaved(v => !v)}
                  className={`w-10 h-10 flex items-center justify-center rounded-full border transition-all
                    ${saved ? 'border-[#ef4444] text-[#ef4444] bg-[#fff5f5]' : 'border-[#ddd] text-[#aaa] hover:text-[#ef4444] hover:border-[#ef4444]'}`}>
                  <span className="mi text-[20px]">{saved ? 'favorite' : 'favorite_border'}</span>
                </button>
                <button className="w-10 h-10 flex items-center justify-center rounded-full border border-[#ddd] text-[#aaa] hover:text-primary hover:border-primary transition-all">
                  <span className="mi text-[20px]">share</span>
                </button>
                <button className="px-5 py-2.5 border border-[#ddd] rounded-full text-[13px] font-semibold text-[#444] hover:border-primary hover:text-primary transition-colors">
                  Chat
                </button>
                <button
                  onClick={() => setShowPhone(v => !v)}
                  className="px-5 py-2.5 border border-[#333] rounded-full text-[13px] font-semibold text-[#333] hover:bg-[#f5f5f5] transition-colors">
                  Hiện số {showPhone ? fakePhone : fakePhone.slice(0, 6) + '****'}
                </button>
                <button 
                  onClick={() => setShowApplyModal(true)}
                  className="flex-1 py-2.5 bg-primary text-white rounded-full text-[14px] font-bold hover:bg-primary-dark transition-colors flex items-center justify-center gap-1.5">
                  <span className="mi text-[18px]">person</span>
                  Ứng tuyển
                </button>
              </div>
            </div>

            {/* ── Company photos ── */}
            <div className="bg-white rounded-xl border border-[#e5e7eb] p-5">
              <div className="flex gap-4 mb-4 border-b border-[#e5e7eb]">
                {['Hình ảnh', 'Mô tả công việc & Quyền lợi', 'Đặc điểm công việc'].map((tab, i) => {
                  const keys = ['photos', 'desc', 'specs'];
                  return (
                    <button key={tab}
                      onClick={() => setActiveTab(keys[i])}
                      className={`pb-3 text-[13px] font-semibold border-b-2 -mb-px transition-colors whitespace-nowrap
                        ${activeTab === keys[i] ? 'border-primary text-primary' : 'border-transparent text-[#888] hover:text-[#444]'}`}>
                      {tab}
                    </button>
                  );
                })}
              </div>

              {/* Photos tab */}
              {activeTab === 'photos' && (
                <div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=300&h=200&fit=crop',
                      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=300&h=200&fit=crop',
                      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=300&h=200&fit=crop',
                      'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=300&h=200&fit=crop',
                      'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=300&h=200&fit=crop',
                      'https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?w=300&h=200&fit=crop',
                    ].map((url, i) => (
                      <div key={i} className="aspect-video rounded-lg overflow-hidden bg-[#f5f5f5]">
                        <img src={url} alt={`Ảnh ${i+1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description tab */}
              {activeTab === 'desc' && (
                <div>
                  <h2 className="text-[15px] font-bold text-[#222] mb-4">Mô tả công việc & Quyền lợi</h2>
                  {descSections[0].content}
                </div>
              )}

              {/* Specs tab */}
              {activeTab === 'specs' && (
                <div>
                  <h2 className="text-[15px] font-bold text-[#222] mb-4">Đặc điểm công việc</h2>
                  {descSections[1].content}
                </div>
              )}
            </div>

            {/* ── Related jobs from same company ── */}
            <div className="bg-white rounded-xl border border-[#e5e7eb] p-5">
              <h2 className="text-[15px] font-bold text-[#222] mb-4">Việc làm khác cùng công ty</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {relatedJobs.slice(0, 2).map(rj => (
                  <Link key={rj.id} to={`/jobs/${rj.id}`}
                    className="flex gap-3 p-3 border border-[#e5e7eb] rounded-xl hover:border-primary hover:shadow-sm transition-all group">
                    <div className="w-11 h-11 rounded-lg border border-[#e5e7eb] overflow-hidden shrink-0 flex items-center justify-center p-0.5 bg-white">
                      <img src={rj.company.logo} alt={rj.company.name} className="w-full h-full object-contain"
                        onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(rj.company.name)}&background=random`; }} />
                    </div>
                    <div className="min-w-0">
                      {rj.badge === 'premium' && (
                        <span className="px-1.5 py-0.5 bg-[#f59e0b] text-white text-[9px] font-bold rounded mr-1">⭐ Đối Tác</span>
                      )}
                      {rj.badge === 'hot' && (
                        <span className="px-1.5 py-0.5 bg-[#ef4444] text-white text-[9px] font-bold rounded mr-1">⚡ Tuyển gấp</span>
                      )}
                      <p className="text-[13px] font-semibold text-[#111] group-hover:text-primary transition-colors line-clamp-1 mt-0.5">{rj.title}</p>
                      <p className="text-[11px] text-[#888]">{rj.company.name}</p>
                      <p className="text-[12px] font-bold text-[#ef4444]">{formatSalary(rj.salary)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* ═══ RIGHT SIDEBAR ═══ */}
          <aside className="space-y-3 lg:sticky lg:top-[calc(var(--spacing-header-height)+8px)]">

            {/* Company info */}
            <div className="bg-white rounded-xl border border-[#e5e7eb] p-4">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-10 h-10 rounded-lg border border-[#e5e7eb] overflow-hidden shrink-0 flex items-center justify-center p-0.5 bg-white">
                  <img src={job.company_id?.logo || '/default-company-logo.png'} alt={job.company_id?.name} className="w-full h-full object-contain"
                    onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(job.company_id?.name || 'Company')}&background=random`; }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] text-[#888]">Đăng bởi:</div>
                  <div className="flex items-center gap-1">
                    <span className="text-[13px] font-bold text-primary truncate">{job.company_id?.name || 'VinJobs'}</span>
                    <span className="mi text-[15px] text-primary">verified</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-[12px] text-[#777] mb-3">
                <span className="flex items-center gap-1"><span className="mi text-[13px]">business</span>Công ty</span>
                <span className="flex items-center gap-1"><span className="mi text-[13px]">schedule</span>Hoạt động 2 giờ trước</span>
              </div>
              <div className="text-[12px] text-[#777] mb-3">
                Phản hồi: <span className="font-semibold text-[#444]">72%</span>
              </div>
              {job.badge === 'premium' && (
                <div className="flex items-start gap-2 p-2.5 bg-[#fff7ed] border border-[#fed7aa] rounded-lg mb-3">
                  <span className="px-1.5 py-0.5 bg-[#f59e0b] text-white text-[10px] font-bold rounded shrink-0">⭐ Đối Tác</span>
                  <div className="text-[12px] text-[#c2410c]">
                    Là Đối Tác VinJobs<br />
                    <span className="text-[#aaa]">Nhà tuyển dụng cam kết xác thực và phản hồi trong 7 ngày.</span>
                    <span className="text-primary cursor-pointer hover:underline ml-1">Tìm hiểu thêm</span>
                  </div>
                </div>
              )}
              {job.company_id && (
                <Link to={`/companies/${job.company_id._id || job.company_id.id}`}
                  className="flex items-center justify-center w-full py-2 text-[13px] font-semibold text-[#444] border border-[#ddd] rounded-full hover:border-primary hover:text-primary transition-all">
                  Xem trang công ty
                </Link>
              )}
            </div>

            {/* Contact form */}
            <div className="bg-white rounded-xl border border-[#e5e7eb] p-4">
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
                  <span className="text-primary cursor-pointer">Chính sách bảo mật</span> của VinJobs.
                </p>
                <button
                  className="w-full py-3 bg-[#111] text-white text-[13px] font-bold rounded-lg hover:bg-[#333] transition-colors">
                  Gửi thông tin
                </button>
              </div>
            </div>

            {/* Related jobs sidebar */}
            <div className="bg-white rounded-xl border border-[#e5e7eb] p-4">
              <h3 className="text-[14px] font-bold text-[#222] mb-3">Việc làm tương tự</h3>
              <div className="space-y-2.5">
                {relatedJobs.map(rj => (
                  <Link key={rj.id} to={`/jobs/${rj.id}`}
                    className="flex gap-2.5 group hover:bg-[#f9f9f9] rounded-lg p-1.5 -mx-1.5 transition-colors">
                    <div className="w-9 h-9 rounded border border-[#e5e7eb] overflow-hidden shrink-0 flex items-center justify-center p-0.5 bg-white">
                      <img src={rj.company.logo} alt={rj.company.name} className="w-full h-full object-contain"
                        onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(rj.company.name)}&background=random`; }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12px] font-semibold text-[#222] group-hover:text-primary transition-colors line-clamp-2 leading-tight">{rj.title}</p>
                      <p className="text-[11px] text-[#888] truncate">{rj.company.name}</p>
                      <p className="text-[11px] font-bold text-[#ef4444]">{formatSalary(rj.salary)}</p>
                    </div>
                  </Link>
                ))}
              </div>
              <Link to="/jobs"
                className="flex items-center justify-center gap-1 mt-3 text-[12px] text-primary font-semibold hover:underline">
                Xem thêm <span className="mi text-[14px]">arrow_forward</span>
              </Link>
            </div>

            {/* Deadline */}
            {job.deadline && (
              <div className="flex items-center gap-3 bg-[#fff7ed] border border-[#fed7aa] rounded-xl p-4">
                <span className="mi text-[30px] text-[#f59e0b]">timer</span>
                <div>
                  <div className="text-[11px] text-[#888]">Hạn nộp hồ sơ</div>
                  <div className="text-[15px] font-bold text-[#d97706]">{job.deadline}</div>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-[500px] overflow-hidden">
            <div className="p-5 border-b border-[#e5e7eb] flex items-center justify-between bg-[#f8fafc]">
              <h3 className="text-[16px] font-bold text-[#111827]">Ứng tuyển: {job.title}</h3>
              <button onClick={() => setShowApplyModal(false)} className="text-[#9ca3af] hover:text-[#111827] transition-colors">
                <span className="mi text-[24px]">close</span>
              </button>
            </div>
            <div className="p-5">
              <div className="mb-4">
                <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">Thư giới thiệu (Cover Letter)</label>
                <textarea
                  rows="4"
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Viết vài dòng giới thiệu về bản thân và lý do bạn phù hợp với công việc này..."
                  className="w-full border border-[#d1d5db] rounded-lg px-3.5 py-2.5 text-[14px] outline-none focus:border-primary resize-none"
                />
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <button 
                  onClick={() => setShowApplyModal(false)}
                  className="px-5 py-2 rounded-lg text-[14px] font-semibold text-[#4b5563] bg-[#f3f4f6] hover:bg-[#e5e7eb] transition-colors">
                  Hủy
                </button>
                <button 
                  onClick={handleApply}
                  disabled={applying}
                  className="px-6 py-2 rounded-lg text-[14px] font-bold text-white bg-primary hover:bg-primary-dark transition-colors disabled:opacity-50">
                  {applying ? 'Đang gửi...' : 'Gửi hồ sơ ứng tuyển'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

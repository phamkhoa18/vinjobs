import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { applicationsApi, authApi } from '../../lib/api';
import { mockJobs, formatSalary } from '../../data/mockData';
import { useAuth } from '../../contexts/AuthContext';

const STATS = [
  { label: 'Đã ứng tuyển', value: '12', icon: 'send', color: '#3674c5', bg: '#eff6ff' },
  { label: 'Chờ phản hồi', value: '5', icon: 'pending', color: '#f59e0b', bg: '#fffbeb' },
  { label: 'Đã phỏng vấn', value: '3', icon: 'record_voice_over', color: '#10b981', bg: '#ecfdf5' },
  { label: 'Việc đã lưu', value: '18', icon: 'favorite', color: '#ef4444', bg: '#fef2f2' },
];

const RECENT_APPS = [
  { title: 'Frontend Developer (ReactJS)', company: 'FPT Software', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/FPT_logo_2010.svg/200px-FPT_logo_2010.svg.png', date: '14/06/2026', status: 'pending' },
  { title: 'Senior UI/UX Designer', company: 'Tiki', logo: 'https://salt.tikicdn.com/ts/upload/e4/49/6c/3c52f8c5daa1bfc6e8f79a678fd3b4f0.png', date: '12/06/2026', status: 'viewed' },
  { title: 'Product Manager', company: 'Shopee', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Shopee.svg/200px-Shopee.svg.png', date: '10/06/2026', status: 'interview' },
  { title: 'Data Analyst', company: 'VNG', logo: 'https://upload.wikimedia.org/wikipedia/vi/thumb/f/fe/VNG_Corporation_Logo.svg/200px-VNG_Corporation_Logo.svg.png', date: '08/06/2026', status: 'rejected' },
];

const statusConfig = {
  PENDING: { label: 'Chờ duyệt', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  REVIEWING: { label: 'Đã xem', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  INTERVIEW: { label: 'Phỏng vấn', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
  OFFER: { label: 'Đề nghị', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
  ACCEPTED: { label: 'Nhận việc', color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-200' },
  REJECTED: { label: 'Từ chối', color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' },
  WITHDRAWN: { label: 'Đã rút', color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200' },
};

export default function Dashboard() {
  const suggestedJobs = mockJobs.slice(0, 4);
  const { user } = useAuth();
  const [recentApps, setRecentApps] = useState([]);
  const [stats, setStats] = useState({ applied: 0, pending: 0, interview: 0, saved: 0 });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const appRes = await applicationsApi.mine({ limit: 4 });
        
        if (appRes.status === 'success') {
          const apps = appRes.data.applications;
          setRecentApps(apps);
          
          const allAppsRes = await applicationsApi.mine();
          if (allAppsRes.status === 'success') {
            const allApps = allAppsRes.data.applications;
            setStats({
              applied: allApps.length,
              pending: allApps.filter(a => a.status === 'PENDING').length,
              interview: allApps.filter(a => a.status === 'INTERVIEW').length,
              saved: 0, // Mock saved jobs
            });
          }
        }
      } catch (err) {
        console.error('Error fetching dashboard data', err);
      }
    };
    fetchDashboardData();
  }, []);

  const STATS_CARDS = [
    { label: 'Đã ứng tuyển', value: stats.applied, icon: 'send', color: '#3674c5', bg: '#eff6ff' },
    { label: 'Chờ phản hồi', value: stats.pending, icon: 'pending', color: '#f59e0b', bg: '#fffbeb' },
    { label: 'Đã phỏng vấn', value: stats.interview, icon: 'record_voice_over', color: '#10b981', bg: '#ecfdf5' },
    { label: 'Việc đã lưu', value: stats.saved, icon: 'favorite', color: '#ef4444', bg: '#fef2f2' },
  ];

  // Tính % hoàn thiện hồ sơ cơ bản
  const calculateProfileCompletion = () => {
    if (!user) return 0;
    let score = 20; // Có tài khoản cơ bản
    if (user.avatar) score += 10;
    if (user.phone) score += 20;
    if (user.address) score += 10;
    if (user.skills && user.skills.length > 0) score += 20;
    if (user.experience && user.experience.length > 0) score += 20;
    return Math.min(100, score);
  };
  const completionRate = calculateProfileCompletion();

  return (
    <DashboardLayout role="candidate">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-[#3674c5] to-[#5a9be6] rounded-2xl p-6 mb-6 relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-36 h-36 bg-white/10 rounded-full" />
        <div className="absolute -right-4 bottom-0 w-20 h-20 bg-white/5 rounded-full" />
        <div className="relative">
          <h1 className="text-[22px] font-bold text-white mb-1">Chào mừng trở lại, {user?.name || 'bạn'}! 👋</h1>
          <p className="text-[14px] text-white/80 mb-4">Hồ sơ của bạn đã hoàn thiện {completionRate}%. Hoàn thiện để tăng cơ hội được tuyển dụng.</p>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-2 bg-white/30 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full" style={{ width: `${completionRate}%` }} />
            </div>
            <span className="text-[13px] font-bold text-white shrink-0">{completionRate}%</span>
          </div>
          <Link to="/candidate/profile"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-primary text-[13px] font-bold rounded-lg hover:bg-blue-50 transition-all">
            <span className="mi text-[16px]">edit</span>Hoàn thiện hồ sơ
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {STATS_CARDS.map((stat, i) => (
          <div key={i} className="bg-white rounded-xl border border-[#e5e7eb] p-5 flex items-center gap-4 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-shadow">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: stat.bg }}>
              <span className="mi text-[22px]" style={{ color: stat.color }}>{stat.icon}</span>
            </div>
            <div>
              <p className="text-[12px] text-[#6b7280] font-medium">{stat.label}</p>
              <h3 className="text-[26px] font-black" style={{ color: stat.color }}>{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        {/* Recent applications */}
        <div className="bg-white rounded-xl border border-[#e5e7eb] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#f3f4f6]">
            <h2 className="text-[16px] font-bold text-[#111827]">Hồ sơ đã nộp gần đây</h2>
            <Link to="/candidate/applications" className="text-[13px] text-primary font-medium hover:underline flex items-center gap-1">
              Xem tất cả <span className="mi text-[14px]">arrow_forward</span>
            </Link>
          </div>
          <div className="divide-y divide-[#f3f4f6]">
            {recentApps.length === 0 ? (
              <div className="p-8 text-center text-[#6b7280] text-[13px]">Bạn chưa ứng tuyển công việc nào.</div>
            ) : recentApps.map((app) => {
              const s = statusConfig[app.status] || statusConfig['PENDING'];
              const companyName = app.job_id?.company_id?.name || 'Công ty ẩn danh';
              const jobTitle = app.job_id?.title || 'Công việc không còn tồn tại';
              const logo = app.job_id?.company_id?.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&background=random&size=60`;
              
              return (
                <div key={app._id} className="flex items-center gap-4 px-5 py-4 hover:bg-[#fafafa] transition-colors">
                  <div className="w-10 h-10 rounded-lg border border-[#e5e7eb] bg-white flex items-center justify-center p-1 shrink-0 overflow-hidden">
                    <img src={logo} alt="" className="w-full h-full object-contain"
                      onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&background=random&size=60`; }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[#111827] truncate">{jobTitle}</p>
                    <p className="text-[12px] text-[#6b7280]">{companyName} · {new Date(app.applied_at).toLocaleDateString()}</p>
                  </div>
                  <span className={`shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${s.color} ${s.bg} ${s.border}`}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Profile completion tips */}
          <div className="bg-white rounded-xl border border-[#e5e7eb] p-5">
            <h3 className="text-[15px] font-bold text-[#111827] mb-3">Gợi ý hoàn thiện hồ sơ</h3>
            <div className="space-y-2.5">
              {[
                { done: true, text: 'Cập nhật ảnh đại diện' },
                { done: true, text: 'Điền thông tin cá nhân' },
                { done: false, text: 'Upload CV chuyên nghiệp', link: '/candidate/cv' },
                { done: false, text: 'Thêm kinh nghiệm làm việc', link: '/candidate/profile' },
                { done: false, text: 'Thêm kỹ năng & chứng chỉ', link: '/candidate/profile' },
              ].map((tip, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <span className={`mi text-[18px] shrink-0 ${tip.done ? 'text-green-500' : 'text-[#d1d5db]'}`}>
                    {tip.done ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                  {tip.link ? (
                    <Link to={tip.link} className="text-[13px] text-primary hover:underline">{tip.text}</Link>
                  ) : (
                    <span className={`text-[13px] ${tip.done ? 'text-[#6b7280] line-through' : 'text-[#374151]'}`}>{tip.text}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Suggested jobs */}
          <div className="bg-white rounded-xl border border-[#e5e7eb] p-5">
            <h3 className="text-[15px] font-bold text-[#111827] mb-3">Việc làm phù hợp với bạn</h3>
            <div className="space-y-3">
              {suggestedJobs.map(job => (
                <Link key={job.id} to={`/jobs/${job.id}`}
                  className="flex items-center gap-2.5 group">
                  <div className="w-9 h-9 rounded-lg border border-[#e5e7eb] bg-white flex items-center justify-center p-1 shrink-0 overflow-hidden">
                    <img src={job.company.logo} alt="" className="w-full h-full object-contain"
                      onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(job.company.name)}&background=random&size=60`; }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-[#111827] truncate group-hover:text-primary transition-colors">{job.title}</p>
                    <p className="text-[11px] text-red-500 font-semibold">{formatSalary(job.salary)}</p>
                  </div>
                  <span className="mi text-[16px] text-[#9ca3af] group-hover:text-primary shrink-0">arrow_forward</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

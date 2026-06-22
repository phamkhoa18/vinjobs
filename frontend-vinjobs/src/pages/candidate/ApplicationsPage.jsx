import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { applicationsApi } from '../../lib/api';
import { formatSalary } from '../../data/mockData';

const STATUS_CONFIG = {
  PENDING: { label: 'Chờ duyệt', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', icon: 'pending' },
  REVIEWING: { label: 'Đã xem', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', icon: 'visibility' },
  INTERVIEW: { label: 'Phỏng vấn', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', icon: 'record_voice_over' },
  OFFER: { label: 'Đề nghị (Offer)', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', icon: 'local_offer' },
  ACCEPTED: { label: 'Đã nhận việc', color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-200', icon: 'check_circle' },
  REJECTED: { label: 'Không phù hợp', color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200', icon: 'cancel' },
  WITHDRAWN: { label: 'Đã rút đơn', color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200', icon: 'remove_circle' },
};

const FILTER_TABS = ['Tất cả', 'Chờ duyệt', 'Đã xem', 'Phỏng vấn', 'Không phù hợp'];
const statusMap = { 'Chờ duyệt': 'PENDING', 'Đã xem': 'REVIEWING', 'Phỏng vấn': 'INTERVIEW', 'Không phù hợp': 'REJECTED' };

export default function ApplicationsPage() {
  const [activeFilter, setActiveFilter] = useState('Tất cả');
  const [selected, setSelected] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApps = async () => {
      setLoading(true);
      try {
        const res = await applicationsApi.mine({ limit: 50 });
        if (res.status === 'success') {
          setApplications(res.data.applications);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, []);

  const filtered = applications.filter(a => activeFilter === 'Tất cả' || a.status === statusMap[activeFilter]);

  const counts = {
    all: applications.length,
    pending: applications.filter(a => a.status === 'PENDING').length,
    viewed: applications.filter(a => a.status === 'REVIEWING').length,
    interview: applications.filter(a => a.status === 'INTERVIEW').length,
    rejected: applications.filter(a => a.status === 'REJECTED').length,
  };

  return (
    <DashboardLayout role="candidate">
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-[#111827]">Hồ sơ đã nộp</h1>
        <p className="text-[13px] text-[#6b7280] mt-0.5">Theo dõi trạng thái tất cả hồ sơ ứng tuyển của bạn</p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Tổng ứng tuyển', value: counts.all, color: '#3674c5', bg: '#eff6ff', icon: 'description' },
          { label: 'Chờ phản hồi', value: counts.pending, color: '#f59e0b', bg: '#fffbeb', icon: 'pending' },
          { label: 'Đang phỏng vấn', value: counts.interview, color: '#10b981', bg: '#ecfdf5', icon: 'record_voice_over' },
          { label: 'Không phù hợp', value: counts.rejected, color: '#ef4444', bg: '#fef2f2', icon: 'cancel' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-[#e5e7eb] p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: s.bg }}>
              <span className="mi text-[20px]" style={{ color: s.color }}>{s.icon}</span>
            </div>
            <div>
              <p className="text-[11px] text-[#6b7280]">{s.label}</p>
              <p className="text-[22px] font-black" style={{ color: s.color }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-none">
        {FILTER_TABS.map(tab => (
          <button key={tab} onClick={() => setActiveFilter(tab)}
            className={`px-4 py-2 text-[13px] font-semibold rounded-full whitespace-nowrap border transition-all shrink-0
              ${activeFilter === tab ? 'bg-primary text-white border-primary' : 'bg-white text-[#374151] border-[#e5e7eb] hover:border-primary hover:text-primary'}`}>
            {tab}
            <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${activeFilter === tab ? 'bg-white/30 text-white' : 'bg-[#f3f4f6] text-[#6b7280]'}`}>
              {tab === 'Tất cả' ? counts.all : counts[statusMap[tab]] || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Applications list */}
      <div className="bg-white rounded-xl border border-[#e5e7eb] overflow-hidden min-h-[300px]">
        {loading ? (
          <div className="flex justify-center items-center h-full pt-16">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <span className="mi text-[48px] text-[#d1d5db] block mb-3">inbox</span>
            <p className="text-[15px] text-[#6b7280]">Không có hồ sơ nào ở trạng thái này</p>
          </div>
        ) : (
          <div className="divide-y divide-[#f3f4f6]">
            {filtered.map(app => {
              const s = STATUS_CONFIG[app.status] || STATUS_CONFIG['PENDING'];
              const jobTitle = app.job_id?.title || 'Việc làm không còn tồn tại';
              const companyName = app.employer_id?.full_name || 'Công ty';
              const location = app.job_id?.location || 'Không rõ';
              const salaryText = app.job_id?.salary_min ? `${(app.job_id.salary_min/1_000_000).toFixed(0)} - ${(app.job_id.salary_max/1_000_000).toFixed(0)} triệu` : 'Thỏa thuận';

              return (
                <div key={app._id}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-[#fafafa] transition-colors cursor-pointer"
                  onClick={() => setSelected(selected === app._id ? null : app._id)}>
                  <div className="w-12 h-12 rounded-xl border border-[#e5e7eb] bg-white flex items-center justify-center p-1.5 shrink-0 overflow-hidden">
                    <img src="/default-company-logo.png" alt="" className="w-full h-full object-contain"
                      onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&background=random&size=80`; }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[14px] font-bold text-[#111827] truncate">{jobTitle}</h3>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-[12px] text-[#6b7280]">{companyName}</span>
                      <span className="text-[12px] text-[#6b7280] flex items-center gap-0.5">
                        <span className="mi text-[13px]">location_on</span>{location}
                      </span>
                      <span className="text-[12px] font-semibold text-red-500">{salaryText}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[11px] text-[#9ca3af]">{new Date(app.applied_at).toLocaleDateString()}</span>
                    <span className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${s.color} ${s.bg} ${s.border}`}>
                      <span className="mi text-[13px]">{s.icon}</span>{s.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Application detail panel */}
      {selected && (
        <div className="mt-4 bg-white rounded-xl border border-[#e5e7eb] p-6">
          {(() => {
            const app = applications.find(a => a._id === selected);
            if (!app) return null;
            const s = STATUS_CONFIG[app.status] || STATUS_CONFIG['PENDING'];
            const jobTitle = app.job_id?.title || 'Việc làm không còn tồn tại';
            const companyName = app.employer_id?.full_name || 'Công ty';
            const location = app.job_id?.location || 'Không rõ';
            const salaryText = app.job_id?.salary_min ? `${(app.job_id.salary_min/1_000_000).toFixed(0)} - ${(app.job_id.salary_max/1_000_000).toFixed(0)} triệu` : 'Thỏa thuận';
            const appliedDate = new Date(app.applied_at).toLocaleDateString();

            return (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[16px] font-bold text-[#111827]">Chi tiết hồ sơ</h3>
                  <span className={`flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-full border ${s.color} ${s.bg} ${s.border}`}>
                    <span className="mi text-[15px]">{s.icon}</span>{s.label}
                  </span>
                </div>
                <div className="flex items-center gap-3 mb-4 p-4 bg-[#f9fafb] rounded-xl">
                  <div className="w-12 h-12 rounded-xl border border-[#e5e7eb] bg-white flex items-center justify-center p-1.5 overflow-hidden">
                    <img src="/default-company-logo.png" alt="" className="w-full h-full object-contain"
                      onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&background=random&size=80`; }} />
                  </div>
                  <div>
                    <p className="text-[15px] font-bold text-[#111827]">{jobTitle}</p>
                    <p className="text-[13px] text-[#6b7280]">{companyName} · {location} · {salaryText}</p>
                  </div>
                </div>
                {/* Timeline */}
                <div className="relative pl-5 space-y-3">
                  {[
                    { label: `Đã nộp hồ sơ`, date: appliedDate, done: true },
                    { label: 'HR đã xem hồ sơ', date: ['REVIEWING','INTERVIEW','OFFER','ACCEPTED'].includes(app.status) ? new Date(app.updated_at).toLocaleDateString() : '—', done: ['REVIEWING','INTERVIEW','OFFER','ACCEPTED'].includes(app.status) },
                    { label: 'Mời phỏng vấn', date: app.status === 'INTERVIEW' ? new Date(app.updated_at).toLocaleDateString() : '—', done: app.status === 'INTERVIEW' },
                    { label: 'Từ chối / Không phù hợp', date: app.status === 'REJECTED' ? new Date(app.updated_at).toLocaleDateString() : '—', done: app.status === 'REJECTED' },
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${step.done ? 'bg-primary' : 'bg-[#e5e7eb]'}`}>
                        <span className="mi text-[12px] text-white">{step.done ? 'check' : 'radio_button_unchecked'}</span>
                      </div>
                      <div>
                        <p className={`text-[13px] font-medium ${step.done ? 'text-[#111827]' : 'text-[#9ca3af]'}`}>{step.label}</p>
                        <p className="text-[11px] text-[#9ca3af]">{step.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </DashboardLayout>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { mockJobs, formatSalary } from '../../data/mockData';

const savedJobsData = mockJobs.slice(0, 8).map((job, i) => ({
  ...job,
  savedAt: `${10 - i}/06/2026`,
  note: i === 0 ? 'Vị trí phù hợp, cần xem lại yêu cầu kỹ năng' : '',
}));

export default function SavedJobsPage() {
  const [jobs, setJobs] = useState(savedJobsData);
  const [search, setSearch] = useState('');
  const [notes, setNotes] = useState({});
  const [editNote, setEditNote] = useState(null);

  const filtered = jobs.filter(j => !search || j.title.toLowerCase().includes(search.toLowerCase()) || j.company.name.toLowerCase().includes(search.toLowerCase()));

  const removeJob = (id) => setJobs(jobs.filter(j => j.id !== id));

  return (
    <DashboardLayout role="candidate">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold text-[#111827]">Việc làm đã lưu</h1>
          <p className="text-[13px] text-[#6b7280] mt-0.5">{jobs.length} việc làm đang theo dõi</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-white border border-[#e5e7eb] rounded-xl px-4 py-2.5 mb-5">
        <span className="mi text-[20px] text-[#9ca3af]">search</span>
        <input type="text" placeholder="Tìm trong danh sách đã lưu..." value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 text-[14px] text-[#111827] placeholder:text-[#9ca3af] bg-transparent border-none outline-none" />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#e5e7eb] p-12 text-center">
          <span className="mi text-[56px] text-[#d1d5db] block mb-3">favorite_border</span>
          <p className="text-[16px] font-semibold text-[#374151] mb-1">Chưa có việc làm nào được lưu</p>
          <p className="text-[13px] text-[#9ca3af] mb-4">Khám phá và lưu những vị trí phù hợp với bạn</p>
          <Link to="/jobs" className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-primary text-white rounded-xl text-[13px] font-bold hover:bg-blue-700 transition-all">
            <span className="mi text-[16px]">search</span>Tìm việc ngay
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(job => (
            <div key={job.id} className="bg-white rounded-xl border border-[#e5e7eb] p-4 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all group">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl border border-[#e5e7eb] bg-white flex items-center justify-center p-1.5 shrink-0 overflow-hidden">
                  <img src={job.company.logo} alt="" className="w-full h-full object-contain"
                    onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(job.company.name)}&background=random&size=80`; }} />
                </div>
                <div className="flex-1 min-w-0">
                  <Link to={`/jobs/${job.id}`}
                    className="text-[14px] font-bold text-[#111827] hover:text-primary transition-colors line-clamp-1 block">
                    {job.title}
                  </Link>
                  <p className="text-[12px] text-[#6b7280]">{job.company.name}</p>
                </div>
                <button onClick={() => removeJob(job.id)}
                  className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100">
                  <span className="mi text-[18px]">favorite</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-[13px] font-bold text-red-500">{formatSalary(job.salary)}</span>
                <span className="w-1 h-1 bg-[#d1d5db] rounded-full" />
                <span className="flex items-center gap-0.5 text-[12px] text-[#6b7280]">
                  <span className="mi text-[14px]">location_on</span>{job.location}
                </span>
              </div>

              {/* Note */}
              {(notes[job.id] || job.note) && editNote !== job.id && (
                <div className="flex items-start gap-2 mb-3 p-2.5 bg-[#fffbeb] rounded-lg border border-amber-200">
                  <span className="mi text-[15px] text-amber-500 shrink-0 mt-0.5">sticky_note_2</span>
                  <p className="text-[12px] text-amber-700 flex-1">{notes[job.id] || job.note}</p>
                  <button onClick={() => setEditNote(job.id)} className="shrink-0 text-amber-500 hover:text-amber-700">
                    <span className="mi text-[14px]">edit</span>
                  </button>
                </div>
              )}
              {editNote === job.id && (
                <div className="mb-3">
                  <textarea rows={2} defaultValue={notes[job.id] || job.note}
                    id={`note-${job.id}`}
                    placeholder="Thêm ghi chú..."
                    className="w-full px-3 py-2 border border-[#e5e7eb] rounded-lg text-[13px] text-[#374151] focus:outline-none focus:border-primary resize-none" />
                  <div className="flex gap-2 mt-1.5">
                    <button onClick={() => {
                      const el = document.getElementById(`note-${job.id}`);
                      setNotes({ ...notes, [job.id]: el.value });
                      setEditNote(null);
                    }} className="px-3 py-1 bg-primary text-white text-[12px] font-semibold rounded-lg hover:bg-blue-700 transition-all">
                      Lưu
                    </button>
                    <button onClick={() => setEditNote(null)} className="px-3 py-1 border border-[#e5e7eb] text-[12px] text-[#374151] rounded-lg hover:border-primary transition-all">
                      Huỷ
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-[#f3f4f6]">
                <span className="text-[11px] text-[#9ca3af]">Lưu {job.savedAt}</span>
                <div className="flex gap-2">
                  {!notes[job.id] && !job.note && editNote !== job.id && (
                    <button onClick={() => setEditNote(job.id)}
                      className="flex items-center gap-1 px-2.5 py-1 text-[12px] text-[#6b7280] border border-[#e5e7eb] rounded-lg hover:border-amber-300 hover:text-amber-600 transition-all">
                      <span className="mi text-[14px]">sticky_note_2</span>Ghi chú
                    </button>
                  )}
                  <Link to={`/jobs/${job.id}`}
                    className="flex items-center gap-1 px-3 py-1 bg-primary text-white text-[12px] font-semibold rounded-lg hover:bg-blue-700 transition-all">
                    Ứng tuyển
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}

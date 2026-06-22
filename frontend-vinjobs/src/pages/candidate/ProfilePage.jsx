import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { authApi, userStorage } from '../../lib/api';
import { toast } from 'react-hot-toast';

const PROVINCES = ['TP.HCM', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng', 'Bình Dương', 'Đồng Nai'];
const INDUSTRIES = ['Công nghệ thông tin', 'Kinh doanh / Sales', 'Kế toán / Tài chính', 'Marketing', 'Nhân sự', 'Thiết kế', 'Xây dựng'];

const SKILLS_POOL = ['React', 'Node.js', 'Python', 'Java', 'TypeScript', 'SQL', 'AWS', 'Docker', 'Figma', 'Adobe XD', 'Photoshop', 'Excel', 'Word', 'PowerPoint', 'Git', 'Agile/Scrum'];

export default function ProfilePage() {
  const [activeSection, setActiveSection] = useState('basic');
  const [saving, setSaving] = useState(false);
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    gender: 'Nam',
    dob: '',
    address: '',
    intro: '',
    currentJob: '',
    experience: '',
    level: 'Junior',
    salary: '',
    jobType: 'FULL_TIME',
    province: 'TP.HCM',
    industry: 'Công nghệ thông tin',
  });

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await authApi.getMe();
        if (res.status === 'success') {
          const user = res.data.user;
          const p = user.profile || {};
          setForm({
            fullName: user.full_name || user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            gender: p.gender || 'Nam',
            dob: p.dob ? new Date(p.dob).toISOString().split('T')[0] : '',
            address: p.address || '',
            intro: p.intro || '',
            currentJob: p.currentJob || '',
            experience: p.experience || '',
            level: p.level || 'Junior',
            salary: p.salary || '',
            jobType: p.jobType || 'FULL_TIME',
            province: p.province || 'TP.HCM',
            industry: p.industry || 'Công nghệ thông tin',
          });
          setSkills(p.skills || []);
        }
      } catch (err) {
        toast.error('Lỗi khi tải thông tin');
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, []);

  const SECTIONS = [
    { id: 'basic', label: 'Thông tin cơ bản', icon: 'person' },
    { id: 'career', label: 'Mục tiêu nghề nghiệp', icon: 'work' },
    { id: 'experience', label: 'Kinh nghiệm', icon: 'history_edu' },
    { id: 'skills', label: 'Kỹ năng', icon: 'build' },
    { id: 'education', label: 'Học vấn', icon: 'school' },
  ];

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        name: form.fullName,
        phone: form.phone,
        profile: {
          gender: form.gender,
          dob: form.dob,
          address: form.address,
          intro: form.intro,
          currentJob: form.currentJob,
          experience: form.experience,
          level: form.level,
          salary: form.salary,
          jobType: form.jobType,
          province: form.province,
          industry: form.industry,
          skills: skills,
        }
      };
      const res = await authApi.updateProfile(payload);
      if (res.status === 'success') {
        toast.success('Lưu hồ sơ thành công!');
        userStorage.set(res.data.user);
      }
    } catch (err) {
      toast.error('Lỗi khi lưu hồ sơ');
    } finally {
      setSaving(false);
    }
  };

  const addSkill = (skill) => {
    if (skill && !skills.includes(skill)) {
      setSkills([...skills, skill]);
      setNewSkill('');
    }
  };

  return (
    <DashboardLayout role="candidate">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold text-[#111827]">Hồ sơ cá nhân</h1>
          <p className="text-[13px] text-[#6b7280] mt-0.5">Cập nhật thông tin để tăng cơ hội được tuyển dụng</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all
            ${saving ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-primary text-white hover:bg-blue-700'}`}>
          <span className="mi text-[18px]">{saving ? 'hourglass_empty' : 'save'}</span>
          {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </div>

      {/* Avatar + completion */}
      <div className="bg-white rounded-xl border border-[#e5e7eb] p-6 mb-5 flex items-center gap-5">
        <div className="relative shrink-0">
          <img src="https://i.pravatar.cc/100?img=3" alt="" className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg" />
          <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center shadow-md hover:bg-blue-700 transition-colors">
            <span className="mi text-[14px]">camera_alt</span>
          </button>
        </div>
        <div className="flex-1">
          <h2 className="text-[17px] font-bold text-[#111827]">{form.fullName}</h2>
          <p className="text-[13px] text-[#6b7280]">{form.currentJob} · {form.province}</p>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 h-2 bg-[#f3f4f6] rounded-full overflow-hidden max-w-[200px]">
              <div className="h-full bg-primary rounded-full" style={{ width: '70%' }} />
            </div>
            <span className="text-[12px] text-[#6b7280]">Hồ sơ 70% hoàn thiện</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-5">
        {/* Nav */}
        <div className="bg-white rounded-xl border border-[#e5e7eb] p-2 h-fit">
          {SECTIONS.map(s => (
            <button key={s.id} onClick={() => setActiveSection(s.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all mb-0.5
                ${activeSection === s.id ? 'bg-primary text-white' : 'text-[#374151] hover:bg-[#f3f4f6]'}`}>
              <span className="mi text-[18px]">{s.icon}</span>{s.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl border border-[#e5e7eb] p-6">
          {activeSection === 'basic' && (
            <div>
              <h3 className="text-[16px] font-bold text-[#111827] mb-4">Thông tin cơ bản</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: 'Họ và tên', key: 'fullName', type: 'text' },
                  { label: 'Email', key: 'email', type: 'email' },
                  { label: 'Số điện thoại', key: 'phone', type: 'tel' },
                  { label: 'Ngày sinh', key: 'dob', type: 'date' },
                ].map(field => (
                  <div key={field.key}>
                    <label className="block text-[12px] font-semibold text-[#374151] mb-1.5">{field.label}</label>
                    <input type={field.type} value={form[field.key]}
                      onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                      className="w-full px-4 py-2.5 border border-[#e5e7eb] rounded-xl text-[14px] text-[#111827] focus:outline-none focus:border-primary transition-colors" />
                  </div>
                ))}
                <div>
                  <label className="block text-[12px] font-semibold text-[#374151] mb-1.5">Giới tính</label>
                  <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}
                    className="w-full px-4 py-2.5 border border-[#e5e7eb] rounded-xl text-[14px] text-[#111827] focus:outline-none focus:border-primary transition-colors">
                    <option>Nam</option><option>Nữ</option><option>Khác</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-[#374151] mb-1.5">Địa chỉ</label>
                  <select value={form.province} onChange={e => setForm({ ...form, province: e.target.value })}
                    className="w-full px-4 py-2.5 border border-[#e5e7eb] rounded-xl text-[14px] text-[#111827] focus:outline-none focus:border-primary transition-colors">
                    {PROVINCES.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[12px] font-semibold text-[#374151] mb-1.5">Giới thiệu bản thân</label>
                  <textarea rows={4} value={form.intro} onChange={e => setForm({ ...form, intro: e.target.value })}
                    className="w-full px-4 py-3 border border-[#e5e7eb] rounded-xl text-[14px] text-[#111827] focus:outline-none focus:border-primary transition-colors resize-none" />
                </div>
              </div>
            </div>
          )}

          {activeSection === 'career' && (
            <div>
              <h3 className="text-[16px] font-bold text-[#111827] mb-4">Mục tiêu nghề nghiệp</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: 'Vị trí hiện tại', key: 'currentJob', type: 'text' },
                  { label: 'Số năm kinh nghiệm', key: 'experience', type: 'text' },
                ].map(field => (
                  <div key={field.key}>
                    <label className="block text-[12px] font-semibold text-[#374151] mb-1.5">{field.label}</label>
                    <input type={field.type} value={form[field.key]}
                      onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                      className="w-full px-4 py-2.5 border border-[#e5e7eb] rounded-xl text-[14px] focus:outline-none focus:border-primary transition-colors" />
                  </div>
                ))}
                <div>
                  <label className="block text-[12px] font-semibold text-[#374151] mb-1.5">Cấp độ</label>
                  <select value={form.level} onChange={e => setForm({ ...form, level: e.target.value })}
                    className="w-full px-4 py-2.5 border border-[#e5e7eb] rounded-xl text-[14px] focus:outline-none focus:border-primary transition-colors">
                    {['Intern', 'Junior', 'Middle', 'Senior', 'Lead', 'Manager'].map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-[#374151] mb-1.5">Mức lương mong muốn (triệu)</label>
                  <input type="text" value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })}
                    className="w-full px-4 py-2.5 border border-[#e5e7eb] rounded-xl text-[14px] focus:outline-none focus:border-primary transition-colors"
                    placeholder="VD: 20 - 30" />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-[#374151] mb-1.5">Ngành nghề</label>
                  <select value={form.industry} onChange={e => setForm({ ...form, industry: e.target.value })}
                    className="w-full px-4 py-2.5 border border-[#e5e7eb] rounded-xl text-[14px] focus:outline-none focus:border-primary transition-colors">
                    {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-[#374151] mb-1.5">Hình thức làm việc</label>
                  <select value={form.jobType} onChange={e => setForm({ ...form, jobType: e.target.value })}
                    className="w-full px-4 py-2.5 border border-[#e5e7eb] rounded-xl text-[14px] focus:outline-none focus:border-primary transition-colors">
                    <option value="FULL_TIME">Toàn thời gian</option>
                    <option value="PART_TIME">Bán thời gian</option>
                    <option value="REMOTE">Từ xa</option>
                    <option value="HYBRID">Hybrid</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'experience' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[16px] font-bold text-[#111827]">Kinh nghiệm làm việc</h3>
                <button className="flex items-center gap-1.5 px-3 py-1.5 border border-primary text-primary rounded-lg text-[12px] font-semibold hover:bg-blue-50 transition-all">
                  <span className="mi text-[16px]">add</span>Thêm
                </button>
              </div>
              <div className="space-y-4">
                {[
                  { title: 'Frontend Developer', company: 'FPT Software', period: '06/2022 - Hiện tại', desc: 'Phát triển giao diện web với ReactJS, TypeScript. Tham gia thiết kế UI/UX, tối ưu performance.' },
                  { title: 'Junior Frontend', company: 'Tiki', period: '01/2021 - 05/2022', desc: 'Phát triển và maintain các tính năng e-commerce. Làm việc với React, Redux, REST API.' },
                ].map((exp, i) => (
                  <div key={i} className="relative pl-5 border-l-2 border-primary pb-4">
                    <div className="absolute -left-[7px] top-0 w-3 h-3 rounded-full bg-primary" />
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-[14px] font-bold text-[#111827]">{exp.title}</h4>
                        <p className="text-[13px] text-primary font-medium">{exp.company}</p>
                        <p className="text-[12px] text-[#6b7280] mt-0.5">{exp.period}</p>
                        <p className="text-[13px] text-[#374151] mt-2 leading-relaxed">{exp.desc}</p>
                      </div>
                      <div className="flex gap-1 ml-3 shrink-0">
                        <button className="w-7 h-7 rounded-lg border border-[#e5e7eb] flex items-center justify-center hover:border-primary hover:text-primary transition-all">
                          <span className="mi text-[15px]">edit</span>
                        </button>
                        <button className="w-7 h-7 rounded-lg border border-[#e5e7eb] flex items-center justify-center hover:border-red-400 hover:text-red-400 transition-all">
                          <span className="mi text-[15px]">delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'skills' && (
            <div>
              <h3 className="text-[16px] font-bold text-[#111827] mb-4">Kỹ năng</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {skills.map(skill => (
                  <span key={skill} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-primary text-[13px] font-medium rounded-lg border border-blue-200">
                    {skill}
                    <button onClick={() => setSkills(skills.filter(s => s !== skill))}
                      className="hover:text-red-500 transition-colors">
                      <span className="mi text-[14px]">close</span>
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2 mb-4">
                <input type="text" placeholder="Thêm kỹ năng..." value={newSkill}
                  onChange={e => setNewSkill(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addSkill(newSkill)}
                  className="flex-1 px-4 py-2.5 border border-[#e5e7eb] rounded-xl text-[14px] focus:outline-none focus:border-primary transition-colors" />
                <button onClick={() => addSkill(newSkill)}
                  className="px-4 py-2.5 bg-primary text-white rounded-xl text-[13px] font-bold hover:bg-blue-700 transition-all">
                  Thêm
                </button>
              </div>
              <p className="text-[12px] text-[#6b7280] mb-2">Gợi ý:</p>
              <div className="flex flex-wrap gap-1.5">
                {SKILLS_POOL.filter(s => !skills.includes(s)).map(s => (
                  <button key={s} onClick={() => addSkill(s)}
                    className="px-2.5 py-1 bg-[#f3f4f6] text-[12px] text-[#374151] rounded-lg hover:bg-blue-50 hover:text-primary transition-all">
                    + {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'education' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[16px] font-bold text-[#111827]">Học vấn</h3>
                <button className="flex items-center gap-1.5 px-3 py-1.5 border border-primary text-primary rounded-lg text-[12px] font-semibold hover:bg-blue-50 transition-all">
                  <span className="mi text-[16px]">add</span>Thêm
                </button>
              </div>
              <div className="relative pl-5 border-l-2 border-primary">
                <div className="absolute -left-[7px] top-0 w-3 h-3 rounded-full bg-primary" />
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-[14px] font-bold text-[#111827]">Đại học Bách Khoa TP.HCM</h4>
                    <p className="text-[13px] text-primary font-medium">Cử nhân Công nghệ thông tin</p>
                    <p className="text-[12px] text-[#6b7280] mt-0.5">09/2016 - 06/2020 · GPA: 3.4/4.0</p>
                  </div>
                  <div className="flex gap-1 ml-3 shrink-0">
                    <button className="w-7 h-7 rounded-lg border border-[#e5e7eb] flex items-center justify-center hover:border-primary hover:text-primary transition-all">
                      <span className="mi text-[15px]">edit</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

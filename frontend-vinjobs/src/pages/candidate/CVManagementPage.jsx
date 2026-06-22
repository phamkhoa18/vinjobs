import { useState, useRef } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';

const MOCK_CVS = [
  { id: 1, name: 'CV_NguyenVanA_Frontend_2026.pdf', size: '2.4 MB', uploadedAt: '10/06/2026', isDefault: true, views: 24, downloads: 8 },
  { id: 2, name: 'CV_NguyenVanA_Full.pdf', size: '1.8 MB', uploadedAt: '05/05/2026', isDefault: false, views: 11, downloads: 3 },
];

export default function CVManagementPage() {
  const [cvs, setCvs] = useState(MOCK_CVS);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef();

  const setDefault = (id) => setCvs(cvs.map(c => ({ ...c, isDefault: c.id === id })));
  const deleteCV = (id) => setCvs(cvs.filter(c => c.id !== id));

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    // In real app: handle upload
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      setCvs([...cvs, { id: Date.now(), name: file.name, size: `${(file.size / 1048576).toFixed(1)} MB`, uploadedAt: new Date().toLocaleDateString('vi-VN'), isDefault: false, views: 0, downloads: 0 }]);
    }
  };

  return (
    <DashboardLayout role="candidate">
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-[#111827]">Quản lý CV</h1>
        <p className="text-[13px] text-[#6b7280] mt-0.5">Upload và quản lý các phiên bản CV của bạn</p>
      </div>

      {/* Tips */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4 mb-5">
        <span className="mi text-[20px] text-blue-500 shrink-0 mt-0.5">lightbulb</span>
        <div>
          <p className="text-[13px] font-semibold text-blue-700 mb-1">Mẹo tạo CV ấn tượng</p>
          <p className="text-[12px] text-blue-600">CV PDF chuyên nghiệp, tối đa 2 trang, thể hiện thành tích cụ thể với số liệu rõ ràng. Tùy chỉnh CV cho từng vị trí ứng tuyển sẽ tăng 40% cơ hội được chọn.</p>
        </div>
      </div>

      {/* Upload zone */}
      <div
        className={`border-2 border-dashed rounded-2xl p-10 text-center mb-6 transition-all cursor-pointer ${dragging ? 'border-primary bg-blue-50' : 'border-[#d1d5db] hover:border-primary hover:bg-[#fafafa]'}`}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current.click()}>
        <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" className="hidden"
          onChange={e => {
            const file = e.target.files[0];
            if (file) setCvs([...cvs, { id: Date.now(), name: file.name, size: `${(file.size / 1048576).toFixed(1)} MB`, uploadedAt: new Date().toLocaleDateString('vi-VN'), isDefault: false, views: 0, downloads: 0 }]);
          }} />
        <span className={`mi text-[48px] block mb-3 ${dragging ? 'text-primary' : 'text-[#9ca3af]'}`}>upload_file</span>
        <p className="text-[15px] font-semibold text-[#374151] mb-1">{dragging ? 'Thả file vào đây!' : 'Kéo thả CV vào đây'}</p>
        <p className="text-[13px] text-[#9ca3af]">Hoặc <span className="text-primary font-semibold underline">chọn file</span> từ máy tính</p>
        <p className="text-[12px] text-[#9ca3af] mt-1.5">Hỗ trợ PDF, DOC, DOCX · Tối đa 5MB</p>
      </div>

      {/* CV List */}
      <h2 className="text-[16px] font-bold text-[#111827] mb-3">CV đã tải lên ({cvs.length}/3)</h2>
      <div className="space-y-3">
        {cvs.map(cv => (
          <div key={cv.id} className="bg-white rounded-xl border border-[#e5e7eb] p-5 flex items-center gap-4 hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all">
            {/* Icon */}
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
              <span className="mi text-[26px] text-red-500">picture_as_pdf</span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-[14px] font-bold text-[#111827] truncate">{cv.name}</p>
                {cv.isDefault && (
                  <span className="shrink-0 text-[10px] font-bold bg-primary text-white px-2 py-0.5 rounded-full">MẶC ĐỊNH</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[12px] text-[#9ca3af]">{cv.size}</span>
                <span className="text-[12px] text-[#9ca3af]">·</span>
                <span className="text-[12px] text-[#9ca3af]">Upload {cv.uploadedAt}</span>
                <span className="text-[12px] text-[#9ca3af]">·</span>
                <span className="flex items-center gap-0.5 text-[12px] text-[#6b7280]">
                  <span className="mi text-[13px]">visibility</span>{cv.views} lượt xem
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {!cv.isDefault && (
                <button onClick={() => setDefault(cv.id)}
                  className="px-3 py-1.5 border border-[#e5e7eb] text-[12px] font-medium text-[#374151] rounded-lg hover:border-primary hover:text-primary transition-all">
                  Đặt mặc định
                </button>
              )}
              <a href="#" className="flex items-center gap-1 px-3 py-1.5 border border-[#e5e7eb] text-[12px] font-medium text-[#374151] rounded-lg hover:border-primary hover:text-primary transition-all">
                <span className="mi text-[15px]">download</span>Tải xuống
              </a>
              <button onClick={() => deleteCV(cv.id)}
                className="w-8 h-8 flex items-center justify-center border border-[#e5e7eb] rounded-lg text-[#9ca3af] hover:border-red-300 hover:text-red-500 transition-all">
                <span className="mi text-[16px]">delete</span>
              </button>
            </div>
          </div>
        ))}

        {cvs.length === 0 && (
          <div className="bg-white rounded-xl border border-[#e5e7eb] p-10 text-center">
            <span className="mi text-[48px] text-[#d1d5db] block mb-3">description</span>
            <p className="text-[15px] text-[#6b7280]">Chưa có CV nào. Hãy upload CV đầu tiên của bạn!</p>
          </div>
        )}
      </div>

      {/* Create CV tips */}
      <div className="mt-6 bg-white rounded-xl border border-[#e5e7eb] p-5">
        <h3 className="text-[15px] font-bold text-[#111827] mb-3">Tạo CV online miễn phí</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { name: 'Canva', icon: 'palette', desc: 'Template đẹp, dễ dùng', url: 'https://canva.com', color: '#7c3aed' },
            { name: 'Resume.io', icon: 'description', desc: 'CV chuyên nghiệp ATS', url: 'https://resume.io', color: '#3674c5' },
            { name: 'Zety', icon: 'auto_fix_high', desc: 'AI gợi ý nội dung', url: 'https://zety.com', color: '#059669' },
          ].map(tool => (
            <a key={tool.name} href={tool.url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 border border-[#e5e7eb] rounded-xl hover:border-primary hover:bg-[#fafafa] transition-all group">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${tool.color}18` }}>
                <span className="mi text-[20px]" style={{ color: tool.color }}>{tool.icon}</span>
              </div>
              <div>
                <p className="text-[13px] font-semibold text-[#111827] group-hover:text-primary transition-colors">{tool.name}</p>
                <p className="text-[11px] text-[#9ca3af]">{tool.desc}</p>
              </div>
              <span className="mi text-[16px] text-[#9ca3af] ml-auto group-hover:text-primary">open_in_new</span>
            </a>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

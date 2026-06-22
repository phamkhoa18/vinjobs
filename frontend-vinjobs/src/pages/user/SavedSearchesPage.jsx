import { Link } from 'react-router-dom';

export default function SavedSearchesPage() {
  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <div className="max-w-[960px] mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-[13px] mb-4">
          <Link to="/" className="text-primary hover:underline">VinJobs</Link>
          <span className="text-[#9ca3af]">/</span>
          <span className="text-[#6b7280]">Tìm kiếm đã lưu</span>
        </nav>

        {/* Title */}
        <h1 className="text-[20px] font-bold text-[#111827] mb-2">Tìm kiếm đã lưu</h1>
        <p className="text-[13px] text-[#6b7280] mb-6">Lưu các bộ lọc tìm kiếm để nhận thông báo khi có tin mới phù hợp.</p>

        {/* Empty State */}
        <div className="bg-white rounded-xl border border-[#e5e7eb] py-16 px-8 flex flex-col items-center justify-center text-center">
          {/* Icon */}
          <div className="w-20 h-20 rounded-full bg-[#f3f4f6] flex items-center justify-center mb-6">
            <span className="mi text-[40px] text-[#d1d5db]">bookmark_border</span>
          </div>

          {/* Text */}
          <h2 className="text-[16px] font-bold text-[#111827] mb-2">Bạn chưa lưu tìm kiếm nào!</h2>
          <p className="text-[14px] text-[#6b7280] leading-relaxed mb-2">
            Hãy bấm nút <strong>"Lưu tìm kiếm"</strong> khi tìm việc
          </p>
          <p className="text-[14px] text-[#6b7280] leading-relaxed mb-6">
            để nhận thông báo khi có tin mới phù hợp.
          </p>

          {/* CTA */}
          <Link
            to="/jobs"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#f59e0b] text-white font-bold text-[14px] rounded-lg hover:bg-amber-600 transition-all shadow-sm hover:shadow-md"
          >
            Bắt đầu tìm kiếm
          </Link>
        </div>

        {/* Info box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <span className="mi text-[22px] text-primary shrink-0 mt-0.5">info</span>
          <div>
            <p className="text-[13px] font-semibold text-[#111827] mb-1">Cách lưu tìm kiếm</p>
            <ol className="text-[13px] text-[#6b7280] space-y-1 list-decimal list-inside">
              <li>Vào trang <Link to="/jobs" className="text-primary hover:underline">tìm việc làm</Link></li>
              <li>Chọn các bộ lọc (vị trí, ngành nghề, mức lương...)</li>
              <li>Bấm nút <strong>"Lưu tìm kiếm"</strong> để lưu lại</li>
              <li>Nhận thông báo khi có tin mới phù hợp!</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

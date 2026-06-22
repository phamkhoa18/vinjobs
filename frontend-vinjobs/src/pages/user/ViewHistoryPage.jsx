import { useState } from 'react';
import { Link } from 'react-router-dom';

const filterOptions = [
  { key: 'all', label: 'Tất cả' },
  { key: 'today', label: 'Hôm nay' },
  { key: 'week', label: 'Tuần này' },
  { key: 'month', label: 'Tháng này' },
];

export default function ViewHistoryPage() {
  const [activeFilter, setActiveFilter] = useState('all');

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <div className="max-w-[960px] mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-[13px] mb-4">
          <Link to="/" className="text-primary hover:underline">VinJobs</Link>
          <span className="text-[#9ca3af]">/</span>
          <span className="text-[#6b7280]">Lịch sử xem tin</span>
        </nav>

        {/* Title */}
        <h1 className="text-[20px] font-bold text-[#111827] mb-2">Lịch sử xem tin</h1>
        <p className="text-[13px] text-[#6b7280] mb-6">Các tin đăng bạn đã xem gần đây sẽ hiển thị ở đây.</p>

        {/* Filters */}
        <div className="flex items-center gap-1 mb-6">
          {filterOptions.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`px-4 py-2 rounded-full text-[13px] font-semibold transition-all whitespace-nowrap
                ${activeFilter === filter.key
                  ? 'bg-[#111827] text-white'
                  : 'bg-white text-[#374151] border border-[#e5e7eb] hover:border-[#9ca3af]'
                }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Empty State */}
        <div className="bg-white rounded-xl border border-[#e5e7eb] py-16 px-8 flex flex-col items-center justify-center text-center">
          {/* Icon */}
          <div className="w-20 h-20 rounded-full bg-[#f3f4f6] flex items-center justify-center mb-6">
            <span className="mi text-[40px] text-[#d1d5db]">schedule</span>
          </div>

          {/* Text */}
          <h2 className="text-[16px] font-bold text-[#111827] mb-2">Chưa có lịch sử xem tin!</h2>
          <p className="text-[14px] text-[#6b7280] leading-relaxed mb-2">
            Khi bạn xem các tin tuyển dụng,
          </p>
          <p className="text-[14px] text-[#6b7280] leading-relaxed mb-6">
            chúng sẽ được lưu lại ở đây để bạn dễ dàng tìm lại.
          </p>

          {/* CTA */}
          <Link
            to="/jobs"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#f59e0b] text-white font-bold text-[14px] rounded-lg hover:bg-amber-600 transition-all shadow-sm hover:shadow-md"
          >
            Bắt đầu tìm kiếm
          </Link>
        </div>
      </div>
    </div>
  );
}

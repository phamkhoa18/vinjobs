import { useState } from 'react';
import { Link } from 'react-router-dom';

const tabs = [
  { key: 'given', label: 'Đánh giá đã gửi', count: 0 },
  { key: 'received', label: 'Đánh giá đã nhận', count: 0 },
];

export default function MyReviewsPage() {
  const [activeTab, setActiveTab] = useState('given');

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <div className="max-w-[960px] mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-[13px] mb-4">
          <Link to="/" className="text-primary hover:underline">VinJobs</Link>
          <span className="text-[#9ca3af]">/</span>
          <span className="text-[#6b7280]">Đánh giá từ tôi</span>
        </nav>

        {/* Title */}
        <h1 className="text-[20px] font-bold text-[#111827] mb-2">Đánh giá từ tôi</h1>
        <p className="text-[13px] text-[#6b7280] mb-6">Quản lý tất cả đánh giá bạn đã gửi và nhận.</p>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-full text-[13px] font-semibold transition-all whitespace-nowrap
                ${activeTab === tab.key
                  ? 'bg-[#111827] text-white'
                  : 'bg-white text-[#374151] border border-[#e5e7eb] hover:border-[#9ca3af]'
                }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Empty State */}
        <div className="bg-white rounded-xl border border-[#e5e7eb] py-16 px-8 flex flex-col items-center justify-center text-center">
          {/* Icon */}
          <div className="w-20 h-20 rounded-full bg-[#f3f4f6] flex items-center justify-center mb-6">
            <span className="mi text-[40px] text-[#d1d5db]">star_border</span>
          </div>

          {/* Text */}
          {activeTab === 'given' ? (
            <>
              <h2 className="text-[16px] font-bold text-[#111827] mb-2">Bạn chưa đánh giá nào!</h2>
              <p className="text-[14px] text-[#6b7280] leading-relaxed mb-2">
                Hãy đánh giá các công ty bạn đã làm việc
              </p>
              <p className="text-[14px] text-[#6b7280] leading-relaxed mb-6">
                để giúp cộng đồng có thêm thông tin hữu ích.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-[16px] font-bold text-[#111827] mb-2">Chưa có đánh giá nào!</h2>
              <p className="text-[14px] text-[#6b7280] leading-relaxed mb-2">
                Các đánh giá bạn nhận được từ nhà tuyển dụng
              </p>
              <p className="text-[14px] text-[#6b7280] leading-relaxed mb-6">
                sẽ hiển thị ở đây.
              </p>
            </>
          )}

          {/* CTA */}
          <Link
            to="/companies"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#f59e0b] text-white font-bold text-[14px] rounded-lg hover:bg-amber-600 transition-all shadow-sm hover:shadow-md"
          >
            Xem danh sách công ty
          </Link>
        </div>

        {/* Rating info box */}
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <span className="mi text-[22px] text-amber-500 shrink-0 mt-0.5">tips_and_updates</span>
          <div>
            <p className="text-[13px] font-semibold text-[#111827] mb-1">Mẹo đánh giá</p>
            <ul className="text-[13px] text-[#6b7280] space-y-1 list-disc list-inside">
              <li>Đánh giá trung thực giúp cộng đồng phát triển</li>
              <li>Chia sẻ trải nghiệm cụ thể về môi trường làm việc</li>
              <li>Đánh giá sẽ được ẩn danh để bảo vệ quyền riêng tư</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

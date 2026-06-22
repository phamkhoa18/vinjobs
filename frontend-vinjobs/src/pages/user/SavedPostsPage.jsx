import { useState } from 'react';
import { Link } from 'react-router-dom';

const tabs = [
  { key: 'posts', label: 'Tin đăng', limit: 50, count: 0 },
  { key: 'videos', label: 'Video', limit: 100, count: 0 },
  { key: 'articles', label: 'Bài viết', limit: 100, count: 0 },
];

const emptyStates = {
  posts: {
    icon: 'favorite',
    title: 'Bạn chưa lưu Tin đăng nào!',
    desc: 'Hãy bấm nút trái tim\nở tin đăng để lưu và xem lại sau.',
    cta: 'Bắt đầu tìm kiếm',
    ctaLink: '/jobs',
  },
  videos: {
    icon: 'play_circle',
    title: 'Bạn chưa lưu Video nào!',
    desc: 'Hãy bấm nút lưu\nở video để xem lại sau.',
    cta: 'Khám phá video',
    ctaLink: '/blog',
  },
  articles: {
    icon: 'article',
    title: 'Bạn chưa lưu Bài viết nào!',
    desc: 'Hãy bấm nút lưu\nở bài viết để đọc lại sau.',
    cta: 'Đọc bài viết',
    ctaLink: '/blog',
  },
};

export default function SavedPostsPage() {
  const [activeTab, setActiveTab] = useState('posts');
  const current = emptyStates[activeTab];

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <div className="max-w-[960px] mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-[13px] mb-4">
          <Link to="/" className="text-primary hover:underline">VinJobs</Link>
          <span className="text-[#9ca3af]">/</span>
          <span className="text-[#6b7280]">Tin đã lưu</span>
        </nav>

        {/* Title */}
        <h1 className="text-[20px] font-bold text-[#111827] mb-4">Tin đã lưu</h1>

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
              {tab.label} {tab.count}/{tab.limit}
            </button>
          ))}
        </div>

        {/* Empty State */}
        <div className="bg-white rounded-xl border border-[#e5e7eb] py-16 px-8 flex flex-col items-center justify-center text-center">
          {/* Icon */}
          <div className="w-20 h-20 rounded-full bg-[#f3f4f6] flex items-center justify-center mb-6">
            <span className="mi text-[40px] text-[#d1d5db]">{current.icon}</span>
          </div>

          {/* Text */}
          <h2 className="text-[16px] font-bold text-[#111827] mb-2">{current.title}</h2>
          <p className="text-[14px] text-[#6b7280] leading-relaxed whitespace-pre-line mb-6">
            {current.desc}
          </p>

          {/* CTA */}
          <Link
            to={current.ctaLink}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#f59e0b] text-white font-bold text-[14px] rounded-lg hover:bg-amber-600 transition-all shadow-sm hover:shadow-md"
          >
            {current.cta}
          </Link>
        </div>
      </div>
    </div>
  );
}

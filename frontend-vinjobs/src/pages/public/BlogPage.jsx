import { useState } from 'react';
import { Link } from 'react-router-dom';
import { mockPosts } from '../../data/mockData';

const TABS = ['Tất cả', 'Tin nổi bật', 'Cẩm nang tìm việc', 'Cẩm nang ngành nghề'];

const POPULAR_TAGS = ['Kỹ năng mềm', 'CV', 'Phỏng vấn', 'Lương', 'IT', 'Digital Marketing', 'Remote', 'Sinh viên', 'AI', 'Xu hướng 2026'];

export default function BlogPage() {
  const [activeTab, setActiveTab] = useState('Tất cả');
  const [search, setSearch] = useState('');

  const filtered = mockPosts.filter(p => {
    const matchTab = activeTab === 'Tất cả' || p.category === activeTab;
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const featured = mockPosts[0];
  const rest = filtered.slice(featured ? 1 : 0);

  return (
    <div className="pt-header-height pb-12 bg-[#f3f4f6] min-h-screen">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-[#3674c5] via-[#5a9be6] to-[#4a8dd9] py-10">
        <div className="container text-center">
          <h1 className="text-[28px] font-extrabold text-white mb-2">Blog hướng nghiệp</h1>
          <p className="text-[15px] text-white/80 mb-6">Cập nhật xu hướng, cẩm nang tìm việc và phát triển sự nghiệp</p>
          <div className="max-w-[480px] mx-auto flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 shadow">
            <span className="mi text-[20px] text-[#9ca3af]">search</span>
            <input type="text" placeholder="Tìm bài viết..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 text-[15px] text-[#111827] placeholder:text-[#9ca3af] border-none outline-none bg-transparent" />
            {search && (
              <button onClick={() => setSearch('')}><span className="mi text-[18px] text-[#9ca3af]">close</span></button>
            )}
          </div>
        </div>
      </div>

      <div className="container mt-5">
        {/* Tabs */}
        <div className="flex gap-2 mb-5 overflow-x-auto scrollbar-none">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-[13px] font-semibold rounded-full border whitespace-nowrap transition-all shrink-0
                ${activeTab === tab ? 'bg-primary text-white border-primary' : 'bg-white text-[#374151] border-[#e5e7eb] hover:border-primary hover:text-primary'}`}>
              {tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          {/* Main content */}
          <div>
            {/* Featured article */}
            {activeTab === 'Tất cả' && !search && featured && (
              <Link to={`/blog/${featured.id}`}
                className="group block bg-white rounded-xl border border-[#e5e7eb] overflow-hidden hover:shadow-[0_4px_20px_rgba(0,0,0,0.1)] transition-all mb-5">
                <div className="md:flex">
                  <div className="md:w-[380px] h-[220px] md:h-auto overflow-hidden shrink-0">
                    <img src={featured.image} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-6 flex flex-col justify-between">
                    <div>
                      <span className="inline-block text-[11px] font-bold text-primary bg-blue-50 px-2.5 py-1 rounded-full uppercase tracking-wide mb-3">
                        ⭐ Nổi bật · {featured.category}
                      </span>
                      <h2 className="text-[20px] font-bold text-[#111827] leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">{featured.title}</h2>
                      <p className="text-[14px] text-[#6b7280] leading-relaxed line-clamp-3">{featured.excerpt}</p>
                    </div>
                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-[#f3f4f6]">
                      <img src={featured.author.avatar} alt="" className="w-8 h-8 rounded-full" />
                      <div>
                        <p className="text-[12px] font-semibold text-[#111827]">{featured.author.name}</p>
                        <p className="text-[11px] text-[#9ca3af]">{featured.date} · {featured.readTime}</p>
                      </div>
                      <span className="ml-auto flex items-center gap-1 text-[12px] text-[#6b7280]">
                        <span className="mi text-[14px]">visibility</span>{featured.views.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* Grid articles */}
            {filtered.length === 0 ? (
              <div className="bg-white rounded-xl border border-[#e5e7eb] p-12 text-center">
                <span className="mi text-[48px] text-[#d1d5db] block mb-3">article</span>
                <p className="text-[15px] text-[#6b7280]">Không tìm thấy bài viết phù hợp</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(activeTab === 'Tất cả' && !search ? rest : filtered).map(post => (
                  <Link to={`/blog/${post.id}`} key={post.id}
                    className="group bg-white border border-[#e5e7eb] rounded-xl overflow-hidden hover:shadow-[0_4px_20px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 transition-all">
                    <div className="h-[180px] overflow-hidden">
                      <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    <div className="p-4">
                      <span className="inline-block text-[11px] font-semibold text-primary bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-wide mb-2">{post.category}</span>
                      <h3 className="text-[14px] font-bold text-[#111827] leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors">{post.title}</h3>
                      <p className="text-[12px] text-[#6b7280] leading-relaxed mb-3 line-clamp-2">{post.excerpt}</p>
                      <div className="flex items-center gap-2 pt-3 border-t border-[#f3f4f6]">
                        <img src={post.author.avatar} alt="" className="w-6 h-6 rounded-full" />
                        <span className="text-[11px] text-[#6b7280] flex-1 truncate">{post.author.name} · {post.date}</span>
                        <span className="flex items-center gap-0.5 text-[11px] text-[#9ca3af]">
                          <span className="mi text-[13px]">schedule</span>{post.readTime}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Popular tags */}
            <div className="bg-white rounded-xl border border-[#e5e7eb] p-5">
              <h3 className="text-[15px] font-bold text-[#111827] mb-3">Chủ đề phổ biến</h3>
              <div className="flex flex-wrap gap-2">
                {POPULAR_TAGS.map(tag => (
                  <button key={tag} onClick={() => setSearch(tag)}
                    className="px-3 py-1.5 bg-[#f3f4f6] text-[12px] font-medium text-[#374151] rounded-lg hover:bg-blue-50 hover:text-primary transition-all">
                    #{tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Popular articles */}
            <div className="bg-white rounded-xl border border-[#e5e7eb] p-5">
              <h3 className="text-[15px] font-bold text-[#111827] mb-3">Bài viết nhiều lượt xem</h3>
              <div className="space-y-3">
                {[...mockPosts].sort((a, b) => b.views - a.views).slice(0, 4).map((post, i) => (
                  <Link to={`/blog/${post.id}`} key={post.id}
                    className="flex gap-3 group">
                    <span className="text-[20px] font-black text-[#e5e7eb] shrink-0 w-6 leading-tight">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-[#111827] line-clamp-2 group-hover:text-primary transition-colors leading-snug">{post.title}</p>
                      <span className="flex items-center gap-1 text-[11px] text-[#9ca3af] mt-1">
                        <span className="mi text-[12px]">visibility</span>{post.views.toLocaleString()}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Authors */}
            <div className="bg-white rounded-xl border border-[#e5e7eb] p-5">
              <h3 className="text-[15px] font-bold text-[#111827] mb-3">Tác giả nổi bật</h3>
              <div className="space-y-3">
                {mockPosts.filter((p, i, arr) => arr.findIndex(x => x.author.name === p.author.name) === i).map((post, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <img src={post.author.avatar} alt="" className="w-9 h-9 rounded-full" />
                    <div>
                      <p className="text-[13px] font-semibold text-[#111827]">{post.author.name}</p>
                      <p className="text-[11px] text-[#9ca3af]">{post.author.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

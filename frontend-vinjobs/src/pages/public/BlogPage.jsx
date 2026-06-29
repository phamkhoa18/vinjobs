import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { blogApi, getImageUrl, sanitizeHtml } from '../../lib/api';

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const POSTS_PER_PAGE = 6;

  useEffect(() => {
    setLoading(true);
    Promise.all([
      blogApi.getPosts({ limit: 100 }),
      blogApi.getCategories().catch(() => ({ categories: [] })),
    ])
      .then(([postRes, catRes]) => {
        setPosts(postRes?.posts || []);
        setCategories(catRes?.categories || []);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filteredPosts = activeCategory === 'all'
    ? posts
    : posts.filter(p => p.category_id?._id === activeCategory || p.category_id?.name === activeCategory);

  const featuredPosts = filteredPosts.slice(0, 3);
  const remainingPosts = filteredPosts.slice(3);
  const totalPages = Math.max(1, Math.ceil(remainingPosts.length / POSTS_PER_PAGE));
  const normalPosts = remainingPosts.slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="pt-header-height pb-12 bg-bg min-h-screen">
        <div className="container max-w-[1140px] mx-auto px-4 mt-6">
          {/* Skeleton breadcrumb */}
          <div className="flex items-center gap-2 mb-4">
            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
          </div>
          {/* Skeleton featured */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8">
            <div className="md:col-span-8 rounded-2xl bg-gray-200 h-[420px] animate-pulse" />
            <div className="md:col-span-4 flex flex-col gap-4">
              <div className="rounded-2xl bg-gray-200 h-[202px] animate-pulse" />
              <div className="rounded-2xl bg-gray-200 h-[202px] animate-pulse" />
            </div>
          </div>
          {/* Skeleton posts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-border-main">
                <div className="h-[200px] bg-gray-200 animate-pulse" />
                <div className="p-5 space-y-3">
                  <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-1/3 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-header-height pb-12 bg-bg min-h-screen relative">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-[#2b6fbb] via-[#4a90d9] to-[#5a9be6] py-10 md:py-14 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/banner_vinjobs.png')] bg-center bg-cover bg-no-repeat mix-blend-multiply opacity-30 pointer-events-none" />
        <div className="container max-w-[1140px] mx-auto px-4 relative z-10 text-center">
          <h1 className="text-[28px] md:text-[36px] font-extrabold text-white mb-3 drop-shadow-lg">
            Blog hướng nghiệp
          </h1>
          <p className="text-white/80 text-[15px] md:text-[17px] max-w-[600px] mx-auto leading-relaxed">
            Tổng hợp kinh nghiệm tìm việc, viết CV, phỏng vấn và phát triển sự nghiệp dành cho ứng viên
          </p>
        </div>
      </div>

      <div className="container max-w-[1140px] mx-auto px-4 -mt-6 relative z-10">

        {/* Category Filter Tabs */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6 justify-center">
            <button
              onClick={() => { setActiveCategory('all'); setCurrentPage(1); }}
              className={`px-5 py-2.5 text-[13px] font-semibold rounded-full border transition-all duration-200 shadow-sm
                ${activeCategory === 'all'
                  ? 'bg-[#2b6fbb] text-white border-[#2b6fbb] shadow-md'
                  : 'bg-white text-[#374151] border-[#e5e7eb] hover:border-[#2b6fbb] hover:text-[#2b6fbb]'
                }`}
            >
              Tất cả
            </button>
            {categories.map(cat => (
              <button
                key={cat._id}
                onClick={() => { setActiveCategory(cat._id); setCurrentPage(1); }}
                className={`px-5 py-2.5 text-[13px] font-semibold rounded-full border transition-all duration-200 shadow-sm
                  ${activeCategory === cat._id
                    ? 'bg-[#2b6fbb] text-white border-[#2b6fbb] shadow-md'
                    : 'bg-white text-[#374151] border-[#e5e7eb] hover:border-[#2b6fbb] hover:text-[#2b6fbb]'
                  }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Top Featured Section */}
        {featuredPosts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8">
            {/* Main Featured (Left) */}
            <Link to={`/blog/${featuredPosts[0].slug}`} className="md:col-span-8 group relative rounded-2xl overflow-hidden h-[300px] md:h-[420px] block shadow-card hover:shadow-card-hover transition-shadow duration-300">
              {featuredPosts[0].thumbnail ? (
                <img src={getImageUrl(featuredPosts[0].thumbnail)} alt={featuredPosts[0].title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#2b6fbb] to-[#4a90d9] flex items-center justify-center"><span className="mi text-6xl text-white/40">article</span></div>
              )}
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              {/* Content */}
              <div className="absolute bottom-0 left-0 p-5 md:p-8 w-full">
                <span className="inline-block bg-[#2b6fbb] text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase mb-3 tracking-wide">
                  {featuredPosts[0].category_id?.name || 'CẨM NANG TÌM VIỆC'}
                </span>
                <h2 className="text-white text-[20px] md:text-[28px] font-bold leading-snug line-clamp-2 drop-shadow">{featuredPosts[0].title}</h2>
                <div className="flex items-center gap-3 mt-3 text-white/70 text-[12px]">
                  <span className="flex items-center gap-1"><span className="mi text-[14px]">calendar_today</span>{new Date(featuredPosts[0].createdAt).toLocaleDateString('vi-VN')}</span>
                  <span className="flex items-center gap-1"><span className="mi text-[14px]">schedule</span>{featuredPosts[0].reading_time || 5} phút đọc</span>
                </div>
              </div>
            </Link>

            {/* Right Side (2 Stacked) */}
            <div className="md:col-span-4 flex flex-col gap-4">
              {featuredPosts.slice(1, 3).map(post => (
                <Link key={post._id} to={`/blog/${post.slug}`} className="group relative rounded-2xl overflow-hidden h-[150px] md:h-[202px] block shadow-card hover:shadow-card-hover transition-shadow duration-300">
                  {post.thumbnail ? (
                    <img src={getImageUrl(post.thumbnail)} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#4a90d9] to-[#2b6fbb] flex items-center justify-center"><span className="mi text-4xl text-white/40">article</span></div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-4 w-full">
                    <span className="inline-block bg-[#2b6fbb]/90 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase mb-2 tracking-wide">
                      {post.category_id?.name || 'KINH NGHIỆM'}
                    </span>
                    <h3 className="text-white text-[15px] md:text-[16px] font-bold leading-snug line-clamp-2">{post.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Main Layout 2 Columns */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column (70%) */}
          <div className="lg:w-[70%]">
            <div className="mb-6 flex items-center gap-3">
              <div className="w-1 h-7 bg-[#2b6fbb] rounded-full" />
              <h2 className="text-[20px] font-bold text-[#111827]">
                {activeCategory === 'all' ? 'Tất cả bài viết' : categories.find(c => c._id === activeCategory)?.name || 'Bài viết'}
              </h2>
              <span className="text-[13px] text-[#6b7280] bg-[#eef4fb] px-2.5 py-0.5 rounded-full font-medium">
                {filteredPosts.length} bài
              </span>
            </div>

            {filteredPosts.length === 0 && !loading && (
              <div className="text-center py-16 bg-white rounded-2xl border border-border-main">
                <span className="mi text-[56px] text-[#d1d5db] block mb-3">article</span>
                <h3 className="text-[16px] font-bold text-[#374151] mb-1">Chưa có bài viết nào</h3>
                <p className="text-[14px] text-[#6b7280]">Hãy quay lại sau để cập nhật bài viết mới nhất</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {normalPosts.map(post => (
                <Link to={`/blog/${post.slug}`} key={post._id} className="group block bg-white rounded-2xl overflow-hidden border border-border-main hover:shadow-card-hover hover:border-[#d6e5f5] transition-all duration-300">
                  <div className="overflow-hidden h-[200px] relative">
                    {post.thumbnail ? (
                      <img src={getImageUrl(post.thumbnail)} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#eef4fb] to-[#d6e5f5] flex items-center justify-center"><span className="mi text-4xl text-[#2b6fbb]/30">article</span></div>
                    )}
                    <div className="absolute top-3 left-3 bg-[#2b6fbb] text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
                      {post.category_id?.name || 'KINH NGHIỆM'}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-[16px] font-bold text-[#111827] group-hover:text-[#2b6fbb] transition-colors leading-snug mb-2 line-clamp-2">
                      {post.title}
                    </h3>
                    <div className="flex items-center gap-3 text-[12px] text-[#6b7280] mb-3">
                      <span className="flex items-center gap-1"><span className="mi text-[14px]">calendar_today</span>{new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                      <span className="flex items-center gap-1"><span className="mi text-[14px]">visibility</span>{post.view_count || 0}</span>
                    </div>
                    <p className="text-[14px] text-[#4b5563] line-clamp-2 leading-relaxed" dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.excerpt || post.content?.replace(/<[^>]*>?/gm, '').substring(0, 120) + '...') }} />
                    <div className="mt-4 flex items-center gap-1 text-[13px] font-semibold text-[#2b6fbb] group-hover:gap-2 transition-all">
                      Đọc tiếp <span className="mi text-[16px]">arrow_forward</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-10">
                <div className="flex gap-1.5 items-center">
                  <button
                    className="w-9 h-9 rounded-lg border border-[#e5e7eb] flex items-center justify-center text-[#6b7280] hover:bg-[#eef4fb] hover:border-[#2b6fbb] hover:text-[#2b6fbb] disabled:opacity-40 disabled:hover:bg-white disabled:hover:border-[#e5e7eb] disabled:hover:text-[#6b7280] transition-all"
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    <span className="mi text-[18px]">chevron_left</span>
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-9 h-9 rounded-lg border flex items-center justify-center font-semibold text-[14px] transition-all
                        ${page === currentPage
                          ? 'border-[#2b6fbb] bg-[#2b6fbb] text-white shadow-sm'
                          : 'border-[#e5e7eb] text-[#4b5563] hover:border-[#2b6fbb] hover:text-[#2b6fbb] hover:bg-[#eef4fb]'
                        }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    className="w-9 h-9 rounded-lg border border-[#e5e7eb] flex items-center justify-center text-[#6b7280] hover:bg-[#eef4fb] hover:border-[#2b6fbb] hover:text-[#2b6fbb] disabled:opacity-40 disabled:hover:bg-white disabled:hover:border-[#e5e7eb] disabled:hover:text-[#6b7280] transition-all"
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    <span className="mi text-[18px]">chevron_right</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column (Sidebar 30%) */}
          <div className="lg:w-[30%] space-y-6">
            {/* Sticky Container */}
            <div className="sticky top-[80px] space-y-6">
              {/* Latest Posts Widget */}
              <div className="bg-white rounded-2xl border border-border-main p-5 shadow-card">
                <h3 className="text-[15px] font-bold text-[#111827] mb-4 pb-2.5 flex items-center gap-2">
                  <span className="w-1 h-5 bg-[#2b6fbb] rounded-full" />
                  BÀI VIẾT MỚI NHẤT
                </h3>
                <div className="flex flex-col gap-3.5">
                  {posts.slice(0, 5).map((post, idx) => (
                    <Link key={idx} to={`/blog/${post.slug}`} className="flex gap-3 group items-start hover:bg-[#eef4fb] rounded-xl p-1.5 -mx-1.5 transition-colors">
                      <div className="w-[80px] h-[60px] shrink-0 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                        {post.thumbnail ? (
                          <img src={getImageUrl(post.thumbnail)} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[#eef4fb] to-[#d6e5f5] flex items-center justify-center"><span className="mi text-[18px] text-[#2b6fbb]/40">article</span></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[13px] font-bold text-[#111827] group-hover:text-[#2b6fbb] transition-colors leading-snug line-clamp-2 mb-1">
                          {post.title}
                        </h4>
                        <span className="text-[11px] text-[#6b7280] flex items-center gap-1">
                          <span className="mi text-[12px]">schedule</span>
                          {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Newsletter Widget */}
              <div className="bg-gradient-to-br from-[#eef4fb] to-[#d6e5f5] border border-[#c0d6ef] rounded-2xl p-5 text-center shadow-card">
                <div className="w-14 h-14 bg-[#2b6fbb] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
                  <span className="mi text-white text-[28px]">mail</span>
                </div>
                <h3 className="text-[16px] font-bold text-[#111827] mb-2">Đăng ký nhận bản tin</h3>
                <p className="text-[13px] text-[#4b5563] mb-4 leading-relaxed">Để không bỏ lỡ những thông tin tuyển dụng và cẩm nang hữu ích nhất!</p>
                <form className="flex flex-col gap-2.5" onSubmit={e => e.preventDefault()}>
                  <input type="email" placeholder="Email của bạn..." className="w-full px-4 py-2.5 border border-[#c0d6ef] rounded-xl text-[14px] outline-none focus:border-[#2b6fbb] focus:ring-2 focus:ring-[#2b6fbb]/20 bg-white transition-all" />
                  <button className="w-full bg-[#2b6fbb] text-white font-bold py-2.5 rounded-xl text-[14px] hover:bg-[#1a56a0] transition-colors shadow-sm hover:shadow-md">
                    Đăng ký ngay
                  </button>
                </form>
              </div>

              {/* CTA Widget */}
              <div className="bg-gradient-to-br from-[#2b6fbb] to-[#1a56a0] rounded-2xl p-5 text-white shadow-card overflow-hidden relative">
                <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/5" />
                <div className="absolute -left-6 -bottom-6 w-24 h-24 rounded-full bg-white/5" />
                <div className="relative z-10">
                  <span className="mi text-[32px] mb-2 block opacity-90">work_outline</span>
                  <h3 className="text-[15px] font-bold mb-1">Tìm việc làm phù hợp</h3>
                  <p className="text-[12px] opacity-80 mb-3 leading-relaxed">
                    Hàng nghìn cơ hội việc làm đang chờ bạn tại VinJobs
                  </p>
                  <Link to="/jobs" className="flex items-center justify-center gap-1.5 w-full py-2.5 bg-white text-[#2b6fbb] font-bold text-[13px] rounded-xl hover:bg-[#eef4fb] transition-colors">
                    Xem việc làm <span className="mi text-[16px]">arrow_forward</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

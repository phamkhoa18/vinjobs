import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { blogApi, getImageUrl, sanitizeHtml } from '../../lib/api';

const calloutStyles = {
  lightbulb: { bg: 'bg-warning-50', border: 'border-[#fde68a]', text: 'text-warning', label: 'Gợi ý' },
  star:      { bg: 'bg-accent-50',   border: 'border-[#86efac]',  text: 'text-accent',  label: 'Bí quyết' },
  trending_up: { bg: 'bg-primary-50', border: 'border-primary-100', text: 'text-primary', label: 'Số liệu' },
  info:      { bg: 'bg-primary-50',  border: 'border-primary-100', text: 'text-primary', label: 'Lời khuyên' },
  warning:   { bg: 'bg-danger-50',   border: 'border-[#fca5a5]',  text: 'text-danger',  label: 'Chú ý' },
  school:    { bg: 'bg-accent-50',   border: 'border-[#86efac]',  text: 'text-accent',  label: 'Học tập' },
};

function formatViews(n) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return n;
}



const categoryColors = {
  'Cẩm nang tìm việc':   { bg: 'bg-primary-50',  text: 'text-primary',  border: 'border-primary-100' },
  'Cẩm nang ngành nghề': { bg: 'bg-accent-50',   text: 'text-accent',   border: 'border-[#86efac]'   },
  'Tin nổi bật':         { bg: 'bg-warning-50',  text: 'text-warning',  border: 'border-[#fde68a]'   },
};

export default function BlogDetailPage() {
  const { id } = useParams(); // actually slug
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [readProgress, setReadProgress] = useState(0);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      blogApi.getPost(id),
      blogApi.getPosts({ limit: 6 }),
    ])
      .then(([postRes, postsRes]) => {
        const data = postRes?.post || postRes;
        setPost(data);
        setLikeCount(Math.floor((data?.view_count || 0) * 0.08));
        // Filter out current post from related
        const allPosts = postsRes?.posts || [];
        setRelatedPosts(allPosts.filter(p => p.slug !== id).slice(0, 4));
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  // Reading progress bar
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const scrolled = el.scrollTop;
      const total = el.scrollHeight - el.clientHeight;
      setReadProgress(total > 0 ? Math.round((scrolled / total) * 100) : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleLike = () => {
    setLiked(v => !v);
    setLikeCount(v => liked ? v - 1 : v + 1);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><span className="mi text-[24px] animate-spin text-primary">autorenew</span></div>;
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
        <span className="mi text-[80px] text-text-muted">article</span>
        <h2 className="text-xl font-bold text-text-primary">Không tìm thấy bài viết</h2>
        <p className="text-text-muted text-sm">Bài viết bạn tìm kiếm không tồn tại hoặc đã bị xóa.</p>
        <Link to="/blog" className="inline-flex items-center gap-2 mt-2 px-6 py-2.5 bg-primary text-white font-bold text-sm rounded-full hover:bg-primary-dark transition-colors">
          <span className="mi text-[18px]">arrow_back</span> Về trang Blog
        </Link>
      </div>
    );
  }

  const sidebarPosts = relatedPosts;
  const catStyle = categoryColors[post.category_id?.name] || categoryColors['Tin nổi bật'];

  return (
    <div className="min-h-screen bg-bg">
      {/* Reading Progress Bar */}
      <div
        className="fixed top-0 left-0 z-[100] h-[3px] bg-gradient-to-r from-primary to-accent transition-all duration-100"
        style={{ width: `${readProgress}%` }}
      />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-border-main py-3">
        <div className="container flex items-center gap-1 text-[13px] text-text-muted flex-wrap">
          <Link to="/" className="text-text-secondary hover:text-primary transition-colors">Trang chủ</Link>
          <span className="mi text-[16px]">chevron_right</span>
          <Link to="/blog" className="text-text-secondary hover:text-primary transition-colors">Blog hướng nghiệp</Link>
          <span className="mi text-[16px]">chevron_right</span>
          <span className="truncate max-w-[200px] sm:max-w-none">{post.title}</span>
        </div>
      </div>

      <div className="container py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">

          {/* ─── MAIN CONTENT ─── */}
          <main className="space-y-4">

            {/* Hero Card */}
            <article className="bg-white rounded-2xl border border-border-main overflow-hidden shadow-card">
              {/* Cover image */}
              <div className="relative w-full aspect-[16/7] overflow-hidden bg-gray-100 flex items-center justify-center">
                {post.thumbnail ? (
                  <img
                    src={getImageUrl(post.thumbnail)}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="mi text-4xl text-gray-400">article</span>
                )}
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                {/* Category badge on image */}
                <span className={`absolute top-4 left-4 text-[12px] font-bold px-3 py-1 rounded-full ${catStyle.bg} ${catStyle.text} border ${catStyle.border} backdrop-blur-sm`}>
                  {post.category_id?.name || 'Chung'}
                </span>
              </div>

              {/* Article header */}
              <div className="p-5 sm:p-7">
                <h1 className="text-[22px] sm:text-[26px] font-bold text-text-primary leading-tight mb-4">
                  {post.title}
                </h1>

                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pb-4 border-b border-border-light mb-5">
                  {/* Author */}
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-primary font-bold">A</div>
                    <div>
                      <p className="text-[13px] font-semibold text-text-primary leading-none">Admin</p>
                      <p className="text-[11px] text-text-muted mt-0.5">Admin VinJobs</p>
                    </div>
                  </div>
                  {/* Divider */}
                  <span className="hidden sm:block w-px h-8 bg-border-main" />
                  {/* Date */}
                  <span className="flex items-center gap-1.5 text-[13px] text-text-muted">
                    <span className="mi text-[16px]">calendar_today</span> {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                  {/* Read time */}
                  <span className="flex items-center gap-1.5 text-[13px] text-text-muted">
                    <span className="mi text-[16px]">schedule</span> 5 phút
                  </span>
                  {/* Views */}
                  <span className="flex items-center gap-1.5 text-[13px] text-text-muted">
                    <span className="mi text-[16px]">visibility</span> {formatViews(post.view_count || 0)} lượt xem
                  </span>
                </div>

                {/* Content body */}
                <div className="space-y-4 quill-content" dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}>
                </div>

                {/* Action row */}
                <div className="mt-6 pt-5 border-t border-border-light flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      id="btn-like-post"
                      onClick={handleLike}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm font-semibold transition-all
                        ${liked
                          ? 'bg-danger text-white border-danger shadow-sm'
                          : 'bg-white text-text-secondary border-border-main hover:border-danger hover:text-danger'}`}
                    >
                      <span className="mi text-[18px]">{liked ? 'favorite' : 'favorite_border'}</span>
                      {likeCount.toLocaleString()} thích
                    </button>
                    <button
                      id="btn-copy-link"
                      onClick={handleCopy}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm font-semibold transition-all
                        ${copied
                          ? 'bg-accent-50 text-accent border-[#86efac]'
                          : 'bg-white text-text-secondary border-border-main hover:border-primary hover:text-primary'}`}
                    >
                      <span className="mi text-[18px]">{copied ? 'check' : 'link'}</span>
                      {copied ? 'Đã sao chép!' : 'Sao chép link'}
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-[13px] text-text-muted">
                    <span className="mi text-[16px]">share</span>
                    <span>Chia sẻ:</span>
                    {[
                      { icon: 'thumb_up', color: 'bg-[#1877f2]', label: 'Facebook' },
                      { icon: 'public',   color: 'bg-[#0a66c2]', label: 'LinkedIn' },
                    ].map(s => (
                      <button key={s.label} title={s.label}
                        className={`w-8 h-8 ${s.color} text-white rounded-full flex items-center justify-center hover:opacity-80 transition-opacity`}>
                        <span className="mi text-[16px]">{s.icon}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </article>

            {/* Author card */}
            <div className="bg-white rounded-2xl border border-border-main p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-primary text-2xl font-bold">A</div>
              <div className="flex-1">
                <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-0.5">Tác giả</p>
                <h3 className="text-base font-bold text-text-primary">Admin VinJobs</h3>
                <p className="text-[13px] text-primary font-medium">Chuyên gia Nhân sự</p>
                <p className="text-[13px] text-text-muted mt-1 leading-relaxed">
                  Chuyên gia tư vấn nghề nghiệp với hơn 8 năm kinh nghiệm trong lĩnh vực tuyển dụng và phát triển nhân lực tại Việt Nam.
                </p>
              </div>
            </div>

            {/* Related posts (mobile inline) */}
            {sidebarPosts.length > 0 && (
              <div className="lg:hidden bg-white rounded-2xl border border-border-main p-5">
                <h3 className="text-[15px] font-bold text-text-primary mb-3 pb-2.5 border-b border-border-light flex items-center gap-1.5">
                  <span className="mi text-[20px] text-primary">auto_stories</span>Bài viết liên quan
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {sidebarPosts.map(p => <RelatedPostCard key={p.id} post={p} catStyle={categoryColors[p.category]} />)}
                </div>
              </div>
            )}
          </main>

          {/* ─── SIDEBAR ─── */}
          <aside className="hidden lg:block space-y-4 lg:sticky lg:top-[calc(var(--spacing-header-height)+16px)]">

            {/* Reading progress widget */}
            <div className="bg-white rounded-2xl border border-border-main p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] font-semibold text-text-muted uppercase tracking-wider">Tiến độ đọc</span>
                <span className="text-[13px] font-bold text-primary">{readProgress}%</span>
              </div>
              <div className="h-2 bg-bg rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-300"
                  style={{ width: `${readProgress}%` }}
                />
              </div>
              <p className="text-[12px] text-text-muted mt-1.5">5 phút • {formatViews(post.view_count || 0)} lượt xem</p>
            </div>



            {/* Quick actions */}
            <div className="bg-white rounded-2xl border border-border-main p-4">
              <h3 className="text-[14px] font-bold text-text-primary mb-3 flex items-center gap-1.5">
                <span className="mi text-[18px] text-primary">bolt</span>Hành động nhanh
              </h3>
              <div className="space-y-2">
                <button onClick={handleLike}
                  id="sidebar-btn-like"
                  className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[13px] font-semibold transition-all
                    ${liked ? 'bg-danger text-white border-danger' : 'border-border-main text-text-secondary hover:border-danger hover:text-danger'}`}>
                  <span className="mi text-[18px]">{liked ? 'favorite' : 'favorite_border'}</span>
                  {liked ? 'Đã thích bài viết' : 'Thích bài viết'}
                </button>
                <button onClick={handleCopy}
                  id="sidebar-btn-copy"
                  className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[13px] font-semibold transition-all
                    ${copied ? 'bg-accent-50 text-accent border-[#86efac]' : 'border-border-main text-text-secondary hover:border-primary hover:text-primary'}`}>
                  <span className="mi text-[18px]">{copied ? 'check_circle' : 'link'}</span>
                  {copied ? 'Đã sao chép!' : 'Sao chép link'}
                </button>
              </div>
            </div>

            {/* Related posts */}
            {sidebarPosts.length > 0 && (
              <div className="bg-white rounded-2xl border border-border-main p-4">
                <h3 className="text-[14px] font-bold text-text-primary mb-3 pb-2.5 border-b border-border-light flex items-center gap-1.5">
                  <span className="mi text-[18px] text-primary">auto_stories</span>Bài viết liên quan
                </h3>
                <div className="space-y-3">
                  {sidebarPosts.map(p => <SidebarPostCard key={p.id} post={p} />)}
                </div>
              </div>
            )}

            {/* CTA Banner */}
            <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-5 text-white">
              <span className="mi text-[32px] mb-2 block">work_outline</span>
              <h3 className="text-[15px] font-bold mb-1">Tìm việc làm phù hợp</h3>
              <p className="text-[12px] opacity-80 mb-3 leading-relaxed">
                Hàng nghìn cơ hội việc làm đang chờ bạn tại VinJobs
              </p>
              <Link to="/jobs"
                className="flex items-center justify-center gap-1.5 w-full py-2 bg-white text-primary font-bold text-[13px] rounded-full hover:bg-primary-50 transition-colors">
                Xem việc làm <span className="mi text-[16px]">arrow_forward</span>
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function SidebarPostCard({ post }) {
  const catStyle = categoryColors[post.category_id?.name] || {};
  return (
    <Link to={`/blog/${post.slug}`}
      className="flex gap-3 group items-start hover:bg-bg rounded-xl p-1.5 -mx-1.5 transition-colors">
      <div className="w-[72px] h-[52px] rounded-lg overflow-hidden shrink-0 bg-gray-100 flex items-center justify-center">
        {post.thumbnail ? (
          <img src={getImageUrl(post.thumbnail)} alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <span className="mi text-gray-400">article</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-[13px] font-semibold text-text-primary leading-snug line-clamp-2 group-hover:text-primary transition-colors mb-1">
          {post.title}
        </h4>
        <span className={`text-[10px] font-semibold ${catStyle.text || 'text-text-muted'}`}>
          {post.category_id?.name || 'Chung'}
        </span>
      </div>
    </Link>
  );
}

function RelatedPostCard({ post, catStyle }) {
  const cs = catStyle || {};
  return (
    <Link to={`/blog/${post.slug}`}
      className="group flex flex-col bg-white border border-border-main rounded-xl overflow-hidden hover:shadow-card-hover transition-all">
      <div className="h-[130px] overflow-hidden bg-gray-100 flex items-center justify-center">
        {post.thumbnail ? (
          <img src={getImageUrl(post.thumbnail)} alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <span className="mi text-4xl text-gray-400">article</span>
        )}
      </div>
      <div className="p-3">
        <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${cs.bg || 'bg-bg'} ${cs.text || 'text-text-muted'} inline-block mb-1.5`}>
          {post.category_id?.name || 'Chung'}
        </span>
        <h4 className="text-[13px] font-semibold text-text-primary line-clamp-2 leading-snug group-hover:text-primary transition-colors">
          {post.title}
        </h4>
        <p className="text-[11px] text-text-muted mt-1.5 flex items-center gap-1">
          <span className="mi text-[13px]">schedule</span>5 phút
        </p>
      </div>
    </Link>
  );
}

import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getImageUrl, adminApi } from '../../lib/api';
import { useState, useEffect } from 'react';

const MENUS = {
  candidate: [
    { name: 'Dashboard', path: '/candidate', icon: 'dashboard' },
    { name: 'Hồ sơ của tôi', path: '/candidate/profile', icon: 'person' },
    { name: 'Quản lý CV', path: '/candidate/cv', icon: 'description' },
    { name: 'Hồ sơ đã nộp', path: '/candidate/applications', icon: 'work_history' },
    { name: 'Tin đã lưu', path: '/candidate/saved', icon: 'favorite' },
  ],
  employer: [
    { name: 'Dashboard', path: '/employer', icon: 'dashboard' },
    { name: 'Đăng tin tuyển dụng', path: '/employer/post-job', icon: 'add_circle', highlight: true },
    { name: 'Quản lý tin đăng', path: '/employer/jobs', icon: 'post_add' },
    { name: 'Quản lý ứng viên', path: '/employer/applicants', icon: 'group' },
    { name: 'Hồ sơ công ty', path: '/employer/company', icon: 'business' },
    { name: 'Gói dịch vụ', path: '/employer/subscription', icon: 'card_membership' },
  ],
  admin: [
    { name: 'Dashboard', path: '/admin', icon: 'dashboard' },
    { name: 'Người dùng', path: '/admin/users', icon: 'people' },
    { name: 'Công ty', path: '/admin/companies', icon: 'business_center' },
    { name: 'Gói & Doanh thu', path: '/admin/subscriptions', icon: 'payments' },
  ],
  content: [
    { name: 'Quản lý bài viết', path: '/content/posts', icon: 'article' },
    { name: 'Quản lý danh mục', path: '/content/categories', icon: 'category' },
  ]
};

const ROLE_INFO = {
  CANDIDATE: { label: 'Ứng viên', icon: 'person', color: '#3674c5' },
  EMPLOYER: { label: 'Nhà tuyển dụng', icon: 'business', color: '#10b981' },
  ADMIN: { label: 'Admin', icon: 'admin_panel_settings', color: '#8b5cf6' },

};

export default function Sidebar({ role = 'candidate' }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const menus = MENUS[role] || [];
  
  const userRole = user?.role || 'CANDIDATE';
  const info = ROLE_INFO[userRole] || ROLE_INFO.CANDIDATE;

  const [pendingCompanies, setPendingCompanies] = useState(0);

  useEffect(() => {
    if (userRole === 'ADMIN') {
      adminApi.companies({ status: 'PENDING', limit: 1 })
        .then(res => setPendingCompanies(res.total))
        .catch(() => {});
    }
  }, [userRole]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className="w-full lg:w-[240px] bg-white rounded-xl shrink-0 hidden lg:block sticky top-[calc(var(--spacing-header-height)+1.5rem)] h-[calc(100vh-var(--spacing-header-height)-3rem)] overflow-y-auto">
      {/* User info */}
      <div className="p-4 border-b border-[#f3f4f6]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-[#e5e7eb] bg-primary/10 flex items-center justify-center shrink-0">
            {user?.avatar ? (
              <img src={getImageUrl(user.avatar)} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
            ) : (
              <span className="text-[16px] font-bold text-primary">{user?.name?.charAt(0)?.toUpperCase()}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <p className="text-[13px] font-bold text-[#111827] truncate">{user?.name || 'Khách'}</p>
              {userRole === 'EMPLOYER' && user?.status === 'ACTIVE' && (
                <span className="mi text-blue-500 text-[14px]" title="Đã xác minh doanh nghiệp">verified</span>
              )}
              {userRole === 'EMPLOYER' && user?.status !== 'ACTIVE' && (
                <span className="mi text-gray-400 text-[14px]" title="Chưa xác minh">pending</span>
              )}
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full mt-0.5" style={{ background: `${info.color}18`, color: info.color }}>
              <span className="mi text-[12px]">{info.icon}</span>{info.label}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-2">
        {menus.map((item, index) => {
          const isActive = pathname === item.path || (pathname.startsWith(item.path + '/') && item.path !== `/${role}`);
          return (
            <Link key={index} to={item.path}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-medium transition-all duration-150 mb-0.5 text-[13px]
                ${item.highlight && !isActive
                  ? 'bg-primary text-white hover:bg-blue-700'
                  : isActive
                    ? 'bg-blue-50 text-primary'
                    : 'text-[#374151] hover:bg-[#f9fafb] hover:text-primary'
                }`}>
              <span className={`mi text-[20px] shrink-0 ${item.highlight && !isActive ? 'text-white' : isActive ? 'text-primary' : 'text-[#9ca3af]'}`}>{item.icon}</span>
              <span>{item.name}</span>
              {item.path === '/admin/companies' && pendingCompanies > 0 && (
                <span className="ml-auto min-w-[20px] h-[20px] bg-red-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center px-1">
                  {pendingCompanies > 99 ? '99+' : pendingCompanies}
                </span>
              )}
              {isActive && !item.highlight && item.path !== '/admin/companies' && <span className="ml-auto w-1.5 h-1.5 bg-primary rounded-full shrink-0" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom links */}
      <div className="p-2 border-t border-[#f3f4f6] mt-2">
        <Link to="/" className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] text-[#6b7280] hover:bg-[#f9fafb] hover:text-primary transition-all">
          <span className="mi text-[20px] text-[#9ca3af]">home</span>Về trang chủ
        </Link>
        <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] text-[#6b7280] hover:bg-red-50 hover:text-red-500 transition-all">
          <span className="mi text-[20px] text-[#9ca3af]">logout</span>Đăng xuất
        </button>
      </div>
    </aside>
  );
}


import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import { getImageUrl } from '../../lib/api';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [guestMenuOpen, setGuestMenuOpen] = useState(false);
  const guestMenuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, dashboardPath } = useAuth();
  const { settings } = useSettings();
  const userMenuRef = useRef(null);

  const isHome = location.pathname === '/';
  const transparent = isHome && !scrolled;

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 300);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
    setGuestMenuOpen(false);
  }, [location.pathname]);

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
      if (guestMenuRef.current && !guestMenuRef.current.contains(e.target)) {
        setGuestMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const roleLabel = {
    CANDIDATE: { label: 'Ứng viên', icon: 'person', color: '#3674c5' },
    EMPLOYER: { label: 'Nhà tuyển dụng', icon: 'business', color: '#059669' },
    ADMIN: { label: 'Admin', icon: 'admin_panel_settings', color: '#8b5cf6' },
    CONTENT_MANAGER: { label: 'Content', icon: 'edit_note', color: '#f59e0b' },
  };

  const userRole = user ? roleLabel[user.role] : null;

  // ─── User Avatar button ─────────────────────────────────────────
  const UserButton = ({ isMobile = false }) => {
    if (!isAuthenticated) {
      return (
        <>
          <Link to="/login" className={`px-4 py-[7px] text-sm font-semibold rounded-full border transition-all
            ${transparent
              ? 'text-white border-white hover:bg-white hover:text-primary'
              : 'text-[#374151] border-[#d1d5db] hover:border-primary hover:text-primary'}`}>
            Đăng nhập
          </Link>
          <Link to="/register" className={`px-4 py-[7px] text-sm font-bold rounded-full transition-all
            ${transparent ? 'bg-white text-primary hover:bg-white/90' : 'bg-primary text-white hover:bg-blue-700'}`}>
            Đăng tuyển
          </Link>

          {/* Account icon + dropdown for guest */}
          <div className="relative" ref={guestMenuRef}>
            <button
              onClick={() => setGuestMenuOpen(!guestMenuOpen)}
              className={`flex items-center gap-0.5 px-1.5 py-1.5 rounded-full transition-all
                ${transparent
                  ? 'text-white hover:bg-white/15'
                  : 'text-[#6b7280] hover:bg-[#f3f4f6]'}`}
            >
              <span className="mi text-[28px]">account_circle</span>
              <span className={`mi text-[18px] transition-transform duration-200 ${guestMenuOpen ? 'rotate-180' : ''}`}>expand_more</span>
            </button>

            {/* Guest dropdown */}
            {guestMenuOpen && (
              <div
                onMouseDown={(e) => e.stopPropagation()}
                className="absolute right-0 top-full mt-2 w-[320px] bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.15)] border border-[#e5e7eb] overflow-hidden z-50 animate-fade-in"
              >
                {/* CTA Section */}
                <div className="p-5 pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[17px] font-extrabold text-[#111827] leading-snug">Tìm việc dễ dàng,</p>
                      <p className="text-[17px] font-extrabold text-[#111827] leading-snug">ứng tuyển nhanh chóng.</p>
                      <p className="text-[13px] text-[#9ca3af] mt-1">Đăng nhập cái đã!</p>
                    </div>
                    <span className="text-[40px]">🎯</span>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <Link
                      to="/register"
                      onClick={() => setGuestMenuOpen(false)}
                      className="flex-1 text-center py-2.5 text-[14px] font-semibold rounded-lg border border-[#d1d5db] text-[#374151] hover:border-primary hover:text-primary transition-all"
                    >
                      Tạo tài khoản
                    </Link>
                    <Link
                      to="/login"
                      onClick={() => setGuestMenuOpen(false)}
                      className="flex-1 text-center py-2.5 text-[14px] font-bold rounded-lg bg-primary text-white hover:bg-blue-700 transition-all"
                    >
                      Đăng nhập
                    </Link>
                  </div>
                </div>

                {/* Tiện ích */}
                <div className="px-5 pt-3 pb-2">
                  <p className="text-[12px] font-semibold text-[#9ca3af] uppercase tracking-wide mb-1">Tiện ích</p>
                </div>
                <div className="px-2 pb-1">
                  {[
                    { icon: 'favorite', label: 'Tin đã lưu', to: '/saved-posts', color: '#ef4444' },
                    { icon: 'bookmark', label: 'Tìm kiếm đã lưu', to: '/saved-searches', color: '#6b7280' },
                    { icon: 'schedule', label: 'Lịch sử xem tin', to: '/view-history', color: '#3b82f6' },
                    { icon: 'star', label: 'Đánh giá từ tôi', to: '/my-reviews', color: '#f59e0b' },
                  ].map((item) => (
                    <Link
                      key={item.label}
                      to={item.to}
                      onClick={() => setGuestMenuOpen(false)}
                      className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-[#f9fafb] transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="mi text-[22px]" style={{ color: item.color }}>{item.icon}</span>
                        <span className="text-[14px] font-medium text-[#374151] group-hover:text-primary transition-colors">{item.label}</span>
                      </div>
                      <span className="mi text-[18px] text-[#d1d5db] group-hover:text-[#9ca3af] transition-colors">chevron_right</span>
                    </Link>
                  ))}
                </div>

                {/* Dịch vụ trả phí */}
                <div className="px-5 pt-3 pb-2 border-t border-[#f3f4f6]">
                  <p className="text-[12px] font-semibold text-[#9ca3af] uppercase tracking-wide mb-1">Dịch vụ</p>
                </div>
                <div className="px-2 pb-3">
                  {[
                    { icon: 'workspace_premium', label: 'Gói PRO', to: '/pro', color: '#8b5cf6' },
                    { icon: 'verified', label: 'Kênh Đối Tác', to: '/partner', color: '#059669' },
                  ].map((item) => (
                    <Link
                      key={item.label}
                      to={item.to}
                      onClick={() => setGuestMenuOpen(false)}
                      className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-[#f9fafb] transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="mi text-[22px]" style={{ color: item.color }}>{item.icon}</span>
                        <span className="text-[14px] font-medium text-[#374151] group-hover:text-primary transition-colors">{item.label}</span>
                      </div>
                      <span className="mi text-[18px] text-[#d1d5db] group-hover:text-[#9ca3af] transition-colors">chevron_right</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      );
    }

    return (
      <div className="relative" ref={userMenuRef}>
        <button
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-full border transition-all
            ${transparent
              ? 'border-white/40 hover:bg-white/15 text-white'
              : 'border-[#e5e7eb] hover:border-primary bg-white'}`}>
          {/* Avatar */}
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
            {user.avatar
              ? <img src={getImageUrl(user.avatar)} alt="" className="w-full h-full object-cover" />
              : <span className="text-[13px] font-bold text-primary">{user.name?.charAt(0)?.toUpperCase()}</span>
            }
          </div>
          <div className="hidden md:block text-left">
            <p className={`text-[12px] font-bold leading-none ${transparent ? 'text-white' : 'text-[#111827]'}`}>
              {user.name?.split(' ').slice(-1)[0]}
            </p>
            {userRole && (
              <p className="text-[10px] leading-none mt-0.5" style={{ color: transparent ? 'rgba(255,255,255,0.7)' : userRole.color }}>
                {userRole.label}
              </p>
            )}
          </div>
          <span className={`mi text-[18px] ${transparent ? 'text-white/70' : 'text-[#9ca3af]'}`}>expand_more</span>
        </button>

        {/* Dropdown */}
        {userMenuOpen && (
          <div 
            onMouseDown={(e) => e.stopPropagation()}
            className="absolute right-0 top-full mt-2 w-[320px] bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.15)] border border-[#e5e7eb] overflow-hidden z-50 animate-fade-in"
          >
            {/* User info */}
            <div className="p-5 pb-4 flex items-center gap-4 border-b border-[#f3f4f6]">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                {user.avatar
                  ? <img src={getImageUrl(user.avatar)} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  : <span className="text-[20px] font-bold text-primary">{user.name?.charAt(0)?.toUpperCase()}</span>
                }
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-[16px] font-extrabold text-[#111827] truncate">{user.name}</p>
                <p className="text-[13px] text-[#9ca3af] truncate">{user.email}</p>
                {userRole && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full mt-1.5"
                    style={{ background: `${userRole.color}18`, color: userRole.color }}>
                    <span className="mi text-[14px]">{userRole.icon}</span>
                    {userRole.label}
                  </span>
                )}
              </div>
            </div>

            {/* Links */}
            <div className="px-5 pt-3 pb-2">
              <p className="text-[12px] font-semibold text-[#9ca3af] uppercase tracking-wide mb-1">Quản lý</p>
            </div>
            <div className="px-2 pb-1">
              <Link to={dashboardPath()}
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-[#f9fafb] transition-all group"
              >
                <div className="flex items-center gap-3">
                  <span className="mi text-[22px] text-primary">dashboard</span>
                  <span className="text-[14px] font-medium text-[#374151] group-hover:text-primary transition-colors">Dashboard</span>
                </div>
                <span className="mi text-[18px] text-[#d1d5db] group-hover:text-[#9ca3af] transition-colors">chevron_right</span>
              </Link>

              {user.role === 'CANDIDATE' && (
                <>
                  <Link to="/candidate/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-[#f9fafb] transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="mi text-[22px] text-[#8b5cf6]">person</span>
                      <span className="text-[14px] font-medium text-[#374151] group-hover:text-primary transition-colors">Hồ sơ của tôi</span>
                    </div>
                    <span className="mi text-[18px] text-[#d1d5db] group-hover:text-[#9ca3af] transition-colors">chevron_right</span>
                  </Link>
                  <Link to="/candidate/applications"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-[#f9fafb] transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="mi text-[22px] text-[#059669]">work_history</span>
                      <span className="text-[14px] font-medium text-[#374151] group-hover:text-primary transition-colors">Hồ sơ đã nộp</span>
                    </div>
                    <span className="mi text-[18px] text-[#d1d5db] group-hover:text-[#9ca3af] transition-colors">chevron_right</span>
                  </Link>
                  <Link to="/saved-posts"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-[#f9fafb] transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="mi text-[22px] text-[#ef4444]">favorite</span>
                      <span className="text-[14px] font-medium text-[#374151] group-hover:text-primary transition-colors">Tin đã lưu</span>
                    </div>
                    <span className="mi text-[18px] text-[#d1d5db] group-hover:text-[#9ca3af] transition-colors">chevron_right</span>
                  </Link>
                </>
              )}

              {user.role === 'EMPLOYER' && (
                <>
                  <Link to="/employer/post-job"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-[#f9fafb] transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="mi text-[22px] text-[#059669]">add_circle</span>
                      <span className="text-[14px] font-medium text-[#374151] group-hover:text-primary transition-colors">Đăng tin tuyển dụng</span>
                    </div>
                    <span className="mi text-[18px] text-[#d1d5db] group-hover:text-[#9ca3af] transition-colors">chevron_right</span>
                  </Link>
                  <Link to="/employer/company"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-[#f9fafb] transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="mi text-[22px] text-[#8b5cf6]">business</span>
                      <span className="text-[14px] font-medium text-[#374151] group-hover:text-primary transition-colors">Hồ sơ công ty</span>
                    </div>
                    <span className="mi text-[18px] text-[#d1d5db] group-hover:text-[#9ca3af] transition-colors">chevron_right</span>
                  </Link>
                </>
              )}
            </div>

            {/* Dịch vụ */}
            <div className="px-5 pt-3 pb-2 border-t border-[#f3f4f6]">
              <p className="text-[12px] font-semibold text-[#9ca3af] uppercase tracking-wide mb-1">Dịch vụ</p>
            </div>
            <div className="px-2 pb-3 border-b border-[#f3f4f6]">
              <Link to="/pro" onClick={() => setUserMenuOpen(false)} className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-[#f9fafb] transition-all group">
                <div className="flex items-center gap-3">
                  <span className="mi text-[22px] text-[#8b5cf6]">workspace_premium</span>
                  <span className="text-[14px] font-medium text-[#374151] group-hover:text-primary transition-colors">Gói PRO</span>
                </div>
                <span className="mi text-[18px] text-[#d1d5db] group-hover:text-[#9ca3af] transition-colors">chevron_right</span>
              </Link>
              <Link to="/partner" onClick={() => setUserMenuOpen(false)} className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-[#f9fafb] transition-all group">
                <div className="flex items-center gap-3">
                  <span className="mi text-[22px] text-[#059669]">verified</span>
                  <span className="text-[14px] font-medium text-[#374151] group-hover:text-primary transition-colors">Kênh Đối Tác</span>
                </div>
                <span className="mi text-[18px] text-[#d1d5db] group-hover:text-[#9ca3af] transition-colors">chevron_right</span>
              </Link>
            </div>

            {/* Logout */}
            <div className="p-2">
              <button onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-[14px] font-medium text-red-500 hover:bg-red-50 transition-all">
                <span className="mi text-[22px]">logout</span>Đăng xuất
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* === DEFAULT HEADER === */}
      <header className={`fixed top-0 left-0 right-0 h-header-height z-[1000] transition-all duration-300
        ${scrolled ? '-translate-y-full opacity-0 pointer-events-none' : ''}
        ${transparent ? 'bg-transparent border-b-0' : 'bg-white border-b border-[#e5e7eb]'}`}>
        <div className="container flex items-center h-full gap-3">
          {/* Hamburger */}
          <button
            className={`flex items-center justify-center w-9 h-9 rounded-lg shrink-0 ${transparent ? 'text-white' : 'text-[#374151]'} hover:bg-white/15 lg:hidden`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            <span className="mi mi-round text-[28px]">menu</span>
          </button>

          {/* Logo */}
          <Link to="/" className="bg-white rounded-[25px] p-[7px] shrink-0">
            <img src="/vinjobs_logo.png" alt="VinJobs" className="h-8 w-auto object-contain" />
          </Link>

          {/* Employer Link */}
          <Link to="/employer-register"
            className={`hidden lg:block text-sm font-medium px-3 py-1.5 whitespace-nowrap border-l
              ${transparent ? 'text-white border-white/30 hover:opacity-80' : 'text-[#6b7280] border-[#e5e7eb] hover:text-primary'}`}>
            Dành cho Nhà tuyển dụng
          </Link>

          {/* Nav */}
          <nav className="hidden lg:flex items-center ml-auto">
            {(settings?.header_menu || [
              { link: '/jobs', title: 'Việc làm' },
              { link: '/companies', title: 'Công ty' },
              { link: '/blog', title: 'Blog' },
            ]).map(({ link, title, is_new_tab }, idx) => (
              <Link key={idx} to={link}
                target={is_new_tab ? '_blank' : undefined}
                rel={is_new_tab ? 'noopener noreferrer' : undefined}
                className={`px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-all
                  ${location.pathname.startsWith(link) && link !== '/' ? (transparent ? 'text-white font-bold' : 'text-primary font-bold') : (transparent ? 'text-white/80 hover:text-white' : 'text-[#6b7280] hover:text-primary')}`}>
                {title}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1.5 ml-auto lg:ml-2">
            {isAuthenticated && (
              <>
                <button className={`hidden md:flex w-9 h-9 items-center justify-center rounded-full transition-all
                  ${transparent ? 'text-white hover:bg-white/15' : 'text-[#6b7280] hover:bg-[#f3f4f6]'}`}
                  title="Việc đã lưu">
                  <span className="mi">bookmark_border</span>
                </button>
                <button className={`hidden md:flex w-9 h-9 items-center justify-center rounded-full transition-all relative
                  ${transparent ? 'text-white hover:bg-white/15' : 'text-[#6b7280] hover:bg-[#f3f4f6]'}`}
                  title="Thông báo">
                  <span className="mi">notifications_none</span>
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                </button>
              </>
            )}
            <UserButton />
          </div>
        </div>
      </header>

      {/* === MOBILE MENU === */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[2000] lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-2xl animate-slide-in-left">
            <div className="flex items-center justify-between p-4 border-b border-[#e5e7eb]">
              <Link to="/" className="inline-block" onClick={() => setMobileMenuOpen(false)}>
                {settings?.logo ? (
                  <img src={getImageUrl(settings.logo)} alt={settings?.site_name || "VinJobs"} className="h-8 w-auto object-contain" />
                ) : (
                  <img src="/vinjobs_logo.png" alt="VinJobs" className="h-8" />
                )}
              </Link>
              <button onClick={() => setMobileMenuOpen(false)} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#f3f4f6]">
                <span className="mi">close</span>
              </button>
            </div>

            {/* Mobile user info */}
            {isAuthenticated && (
              <div className="p-4 border-b border-[#f3f4f6] flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                  {user.avatar
                    ? <img src={getImageUrl(user.avatar)} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    : <span className="text-[16px] font-bold text-primary">{user.name?.charAt(0)?.toUpperCase()}</span>
                  }
                </div>
                <div>
                  <p className="text-[13px] font-bold text-[#111827]">{user.name}</p>
                  {userRole && (
                    <span className="text-[11px] font-medium" style={{ color: userRole.color }}>{userRole.label}</span>
                  )}
                </div>
              </div>
            )}

            <nav className="p-4 space-y-1">
              {(settings?.header_menu || [
                { link: '/jobs', title: 'Việc làm' },
                { link: '/companies', title: 'Công ty' },
                { link: '/blog', title: 'Blog' }
              ]).map(({ link, title, is_new_tab }, idx) => (
                <Link key={idx} to={link} 
                  target={is_new_tab ? '_blank' : undefined}
                  rel={is_new_tab ? 'noopener noreferrer' : undefined}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[#374151] hover:bg-blue-50 hover:text-primary transition-colors">
                  <span className="mi text-[20px]">label_important</span>{title}
                </Link>
              ))}

              {isAuthenticated ? (
                <>
                  <Link to={dashboardPath()} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-primary bg-blue-50 transition-colors">
                    <span className="mi text-[20px]">dashboard</span>Dashboard
                  </Link>
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
                    <span className="mi text-[20px]">logout</span>Đăng xuất
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[#374151] hover:bg-blue-50 hover:text-primary transition-colors">
                    <span className="mi text-[20px]">login</span>Đăng nhập
                  </Link>
                  <Link to="/register" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[#374151] hover:bg-blue-50 hover:text-primary transition-colors">
                    <span className="mi text-[20px]">person_add</span>Đăng ký
                  </Link>
                </>
              )}
            </nav>

            {!isAuthenticated && (
              <div className="p-4 border-t border-[#e5e7eb]">
                <Link to="/register" className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-white font-bold text-sm rounded-full hover:bg-blue-700 transition-colors">
                  <span className="mi text-[18px]">add_circle</span>Đăng tuyển
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* === COMPACT HEADER (scrolled) === */}
      <header className={`fixed top-0 left-0 right-0 h-header-height bg-white border-b border-[#e5e7eb] z-[1001] transition-all duration-300
        ${scrolled ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}`}>
        <div className="container flex items-center h-full gap-2.5">
          <button className="flex items-center justify-center w-9 h-9 rounded-lg text-[#374151] lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Menu">
            <span className="mi mi-round text-[28px]">menu</span>
          </button>
          {/* Logo */}
          <Link to="/" className="flex items-center">
            {settings?.logo ? (
              <img src={getImageUrl(settings.logo)} alt={settings?.site_name || "VinJobs"} className="h-8 w-auto object-contain" />
            ) : (
              <img src="/vinjobs_logo.png" alt="VinJobs" className="h-8 w-auto object-contain" />
            )}
          </Link>
          <div className="flex-1 flex items-center gap-2 bg-[#f3f4f6] border border-[#e5e7eb] rounded-full px-3.5 h-10">
            <span className="mi text-[20px] text-[#9ca3af]">search</span>
            <input
              type="text"
              placeholder="Tìm việc làm..."
              className="flex-1 border-none bg-transparent text-sm text-[#111827] placeholder:text-[#9ca3af] focus:outline-none"
            />
            <button className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
              <span className="mi text-[18px]">search</span>
            </button>
          </div>
          <div className="hidden md:flex items-center gap-1.5 shrink-0">
            <UserButton />
          </div>
        </div>
      </header>
    </>
  );
}

/**
 * Route Guards
 * ============
 * ProtectedRoute - Yêu cầu đăng nhập
 * RoleRoute      - Yêu cầu đăng nhập + đúng role
 * GuestRoute     - Redirect đến dashboard nếu đã đăng nhập (login/register pages)
 */
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';


// ─── Loading spinner ───────────────────────────────────────────────
function AuthLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f4f8]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-[#e5e7eb] border-t-primary rounded-full animate-spin" />
        <p className="text-[14px] text-[#6b7280] font-medium">Đang xác thực...</p>
      </div>
    </div>
  );
}

// ─── ProtectedRoute — yêu cầu đăng nhập ────────────────────────────
export function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <AuthLoading />;

  if (!isAuthenticated) {
    // Save current path để redirect back sau khi login
    const loginPath = location.pathname.startsWith('/admin') ? '/admin/login' : '/login';
    return <Navigate to={loginPath} state={{ from: location.pathname }} replace />;
  }

  return children;
}

// ─── RoleRoute — yêu cầu đúng role ────────────────────────────────
export function RoleRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <AuthLoading />;

  if (!isAuthenticated) {
    const loginPath = location.pathname.startsWith('/admin') ? '/admin/login' : '/login';
    return <Navigate to={loginPath} state={{ from: location.pathname }} replace />;
  }

  if (!allowedRoles.includes(user?.role)) {
    // Redirect đến dashboard phù hợp với role
    const roleRedirects = {
      CANDIDATE: '/candidate',
      EMPLOYER: '/employer',
      ADMIN: '/admin',
    };
    const redirect = roleRedirects[user?.role] || '/';
    return <Navigate to={redirect} replace />;
  }

  return children;
}

// ─── VerifiedEmployerRoute — yêu cầu đăng nhập, role EMPLOYER và đã duyệt ──
export function VerifiedEmployerRoute({ children }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <AuthLoading />;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (user?.role !== 'EMPLOYER') {
    return <Navigate to="/" replace />;
  }

  // Nếu chưa duyệt, ép sang trang xác minh
  if (user?.status === 'PENDING' || user?.status === 'REJECTED') {
    if (location.pathname !== '/employer/verification' && location.pathname !== '/employer/company') {
      return <Navigate to="/employer/verification" replace />;
    }
  }

  return children;
}

// ─── GuestRoute — redirect nếu đã login (dùng cho /login, /register) ──
export function GuestRoute({ children }) {
  const { isAuthenticated, isLoading, dashboardPath } = useAuth();
  const location = useLocation();

  if (isLoading) return <AuthLoading />;

  if (isAuthenticated) {
    // Redirect đến "from" nếu có, hoặc dashboard
    const from = location.state?.from || dashboardPath();
    return <Navigate to={from} replace />;
  }

  return children;
}

export default ProtectedRoute;

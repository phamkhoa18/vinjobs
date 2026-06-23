/**
 * AuthContext
 * ===========
 * Quản lý trạng thái xác thực toàn bộ ứng dụng.
 * - Cung cấp: user, token, isLoading, login(), logout(), updateUser()
 * - Tự động khôi phục session từ localStorage khi reload trang
 * - Verify token với backend khi khởi động
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, tokenStorage, userStorage, clearSession } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // true ban đầu để verify token

  // ─── Verify session on app start ──────────────────────────────────
  useEffect(() => {
    const initAuth = async () => {
      const token = tokenStorage.get();
      const cachedUser = userStorage.get();

      if (!token) {
        setIsLoading(false);
        return;
      }

      // Restore from cache first (instant UI)
      if (cachedUser) {
        setUser(cachedUser);
      }

      // Then verify token with backend
      try {
        const data = await authApi.getMe();
        const freshUser = data.data.user;
        setUser(freshUser);
        userStorage.set(freshUser);
      } catch {
        // Token invalid / expired → clear session
        clearSession();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // ─── Login ─────────────────────────────────────────────────────────
  const login = useCallback(async (email, password, captchaToken) => {
    const data = await authApi.login(email, password, captchaToken);
    const { token, data: { user: loggedUser } } = data;

    tokenStorage.set(token);
    userStorage.set(loggedUser);
    setUser(loggedUser);

    return loggedUser;
  }, []);

  // ─── Register (chỉ gọi API, không auto login vì cần OTP) ──────────
  const register = useCallback(async (formData) => {
    const data = await authApi.register(formData);
    return data;
  }, []);

  // ─── Verify Email (sau OTP mới được login) ─────────────────────────
  const verifyEmail = useCallback(async (email, otp, companyData) => {
    const data = await authApi.verifyEmail(email, otp, companyData);
    const { token, data: { user: newUser } } = data;

    tokenStorage.set(token);
    userStorage.set(newUser);
    setUser(newUser);

    return newUser;
  }, []);

  // ─── Google Login ──────────────────────────────────────────────────
  const googleLogin = useCallback(async (idToken, role) => {
    const data = await authApi.googleLogin(idToken, role);
    
    // Nếu là tài khoản mới và yêu cầu mật khẩu
    if (data.requires_password) {
      return data;
    }

    const { token, data: { user: loggedUser } } = data;

    tokenStorage.set(token);
    userStorage.set(loggedUser);
    setUser(loggedUser);

    return loggedUser;
  }, []);

  const googleRegister = useCallback(async (idToken, password, role) => {
    const data = await authApi.googleRegister(idToken, password, role);
    const { token, data: { user: newUser } } = data;

    tokenStorage.set(token);
    userStorage.set(newUser);
    setUser(newUser);

    return newUser;
  }, []);

  // ─── Logout ────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      clearSession();
      setUser(null);
      window.location.href = '/login'; // Redirect to login page and full refresh
    }
  }, []);

  const adminLogout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      clearSession();
      setUser(null);
      window.location.href = '/admin/login';
    }
  }, []);

  // ─── Update user data (after profile edit) ─────────────────────────
  const updateUser = useCallback((updatedData) => {
    const merged = { ...user, ...updatedData };
    setUser(merged);
    userStorage.set(merged);
  }, [user]);

  // ─── Role helpers ──────────────────────────────────────────────────
  const isCandidate = user?.role === 'CANDIDATE';
  const isEmployer = user?.role === 'EMPLOYER';
  const isAdmin = user?.role === 'ADMIN';
  const isAuthenticated = !!user;

  const dashboardPath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'CANDIDATE': return '/candidate';
      case 'EMPLOYER': return '/employer';
      case 'ADMIN': return '/admin';

      default: return '/';
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      isLoading,
      isAuthenticated,
      isCandidate,
      isEmployer,
      isAdmin,
      isContentManager,
      login,
      register,
      verifyEmail,
      googleLogin,
      googleRegister,
      logout,
      updateUser,
      dashboardPath,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ──────────────────────────────────────────────────────────
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được dùng trong AuthProvider');
  }
  return context;
}

export default AuthContext;

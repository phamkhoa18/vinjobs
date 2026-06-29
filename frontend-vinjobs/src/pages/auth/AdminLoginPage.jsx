import { useState, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Turnstile } from '@marsidev/react-turnstile';
import { authApi, tokenStorage, userStorage } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [searchParams] = useSearchParams();
  const rawReturnUrl = searchParams.get('returnUrl') || '/admin';
  // Prevent open redirect: only allow relative paths starting with /
  const returnUrl = (rawReturnUrl.startsWith('/') && !rawReturnUrl.startsWith('//')) ? rawReturnUrl : '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const turnstileRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    if (!captchaToken) {
      setError('Vui lòng xác thực Captcha');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await authApi.login(email, password, captchaToken);
      
      // Admin verification
      if (res.data.user.role !== 'ADMIN') {
        throw new Error('Tài khoản không có quyền truy cập trang quản trị');
      }

      // LƯU Ý: Backend trả token ở root (res.token) chứ không phải res.data.token
      tokenStorage.set(res.token);
      userStorage.set(res.data.user);
      
      // Quan trọng: Phải set State user ở Context để React hiểu là đã Login
      // thì RoleRoute mới cho phép render Component của Admin và không đá ra ngoài
      setUser(res.data.user);
      
      toast.success('Đăng nhập quản trị thành công!');
      navigate(returnUrl);
    } catch (err) {
      const msg = err.message || 'Sai email hoặc mật khẩu';
      setError(msg);
      toast.error(msg);
      turnstileRef.current?.reset(); // Reset Captcha để có thể thử lại
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[100dvh] bg-white font-sans overflow-hidden">
      
      {/* LEFT PANEL - BANNER */}
      <div className="hidden lg:block h-[100dvh] bg-[#f8fafc]">
        <img src="/banner_tuyendung.png" alt="Đăng nhập Admin VinJobs" className="h-full w-auto object-contain block" />
      </div>

      {/* RIGHT PANEL - FORM */}
      <div className="flex-1 flex flex-col items-center p-6 sm:p-12 overflow-y-auto bg-white relative">
        
        {/* Mobile Logo */}
        <Link to="/" className="lg:hidden absolute top-6 left-6">
          <img src="/vinjobs_logo.png" alt="VinJobs" className="h-8 w-auto" onError={e => { e.target.style.display = 'none'; }} />
        </Link>

        {/* Back button top left */}
        <div className="absolute top-6 right-6 hidden lg:block">
          <Link to="/" className="text-sm font-semibold text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors">
            <span className="mi text-lg">close</span> Đóng
          </Link>
        </div>

        <div className="w-full max-w-[420px] my-auto shrink-0 pb-8 mt-12 lg:mt-0">
          
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-[28px] font-bold text-gray-900 mb-2">
              Đăng nhập Quản trị viên
            </h2>
            <p className="text-gray-500 text-[15px]">
              Chỉ dành cho Ban quản trị VinJobs. Vui lòng đăng nhập để tiếp tục.
            </p>
          </div>

          {/* Error alert */}
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md mb-6 text-sm flex items-center gap-2 border border-red-100">
              <span className="mi text-lg">error</span> <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Email quản trị viên <span className="text-red-500">*</span></label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email"
                className="w-full h-10 px-3 rounded-md border border-gray-300 focus:border-[#3b5bdb] focus:ring-1 focus:ring-[#3b5bdb] outline-none text-sm transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Mật khẩu <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  className="w-full h-10 pl-3 pr-12 rounded-md border border-gray-300 focus:border-[#3b5bdb] focus:ring-1 focus:ring-[#3b5bdb] outline-none text-sm transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-white flex items-center justify-center"
                  tabIndex="-1"
                >
                  <span className="mi text-[20px]">{showPass ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <Link to="/forgot-password" className="text-[13px] font-semibold text-[#3b5bdb] hover:underline">
                Quên mật khẩu?
              </Link>
            </div>

            {/* Cloudflare Turnstile */}
            <div className="mb-4">
              <Turnstile
                ref={turnstileRef}
                siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'}
                onSuccess={(token) => setCaptchaToken(token)}
                onError={() => setError('Lỗi tải Captcha, vui lòng tải lại trang')}
                onExpire={() => setCaptchaToken('')}
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || !email || !password || !captchaToken}
                className="w-full h-11 bg-[#bad1f8] hover:bg-[#a5c2f3] text-[#1c3c9c] font-semibold rounded-md transition-colors flex items-center justify-center disabled:opacity-50"
              >
                {loading ? <span className="w-5 h-5 border-2 border-[#1c3c9c] border-t-transparent rounded-full animate-spin"></span> : 'Đăng nhập hệ thống'}
              </button>
            </div>
          </form>

          {/* Footer note */}
          <div className="text-center mt-10">
            <p className="text-[14px] text-gray-600 mb-4">
              Không phải Ban quản trị? <Link to="/login" className="text-[#3b5bdb] font-bold hover:underline">Đăng nhập thường</Link>
            </p>
            <div className="flex items-center justify-center gap-3 text-[13px] text-gray-500 font-medium">
              <span>© 2024 VinJobs</span>
              <span className="w-1 h-1 rounded-full bg-gray-300"></span>
              <Link to="/terms" className="hover:text-gray-900 transition-colors">Điều khoản</Link>
              <span className="w-1 h-1 rounded-full bg-gray-300"></span>
              <Link to="/privacy" className="hover:text-gray-900 transition-colors">Bảo mật</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

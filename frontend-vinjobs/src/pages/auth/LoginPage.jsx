import { useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { Turnstile } from '@marsidev/react-turnstile';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, googleLogin, googleRegister } = useAuth();

  const [role, setRole] = useState('employer'); // 'employer' or 'candidate'
  const [step, setStep] = useState('form'); // 'form' | 'google_password'
  const [googleUser, setGoogleUser] = useState(null);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('pass'); // BYPASSED FOR TESTING
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const turnstileRef = useRef(null);

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        setError('');
        
        const response = await googleLogin(tokenResponse.access_token || tokenResponse.credential || tokenResponse.id_token, role);
        
        if (response.requires_password) {
          setGoogleUser({ ...response, access_token: tokenResponse.access_token || tokenResponse.credential || tokenResponse.id_token });
          setStep('google_password');
          return;
        }

        const from = location.state?.from;
        const redirects = { CANDIDATE: '/candidate', EMPLOYER: '/employer', ADMIN: '/admin', CONTENT_MANAGER: '/content/posts' };
        navigate(from || redirects[response.role] || '/', { replace: true });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setError('Đăng nhập Google thất bại');
    }
  });

  const handleGoogleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const user = await googleRegister(googleUser.access_token, password, role);
      const from = location.state?.from;
      const redirects = { CANDIDATE: '/candidate', EMPLOYER: '/employer', ADMIN: '/admin', CONTENT_MANAGER: '/content/posts' };
      navigate(from || redirects[user.role] || '/', { replace: true });
    } catch (err) {
      const msg = err.message || 'Đăng nhập thất bại';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }
    if (!captchaToken) {
      setError('Vui lòng xác thực bạn không phải là robot');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password, captchaToken);
      const from = location.state?.from;
      const redirects = { CANDIDATE: '/candidate', EMPLOYER: '/employer', ADMIN: '/admin', CONTENT_MANAGER: '/content/posts' };
      navigate(from || redirects[user.role] || '/', { replace: true });
    } catch (err) {
      const msg = err.message || 'Đăng nhập thất bại';
      setError(msg);
      toast.error(msg);
      turnstileRef.current?.reset();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[100dvh] bg-white font-sans overflow-hidden">
      
      {/* LEFT PANEL - BANNER */}
      <div className="hidden lg:block h-[100dvh] bg-[#f8fafc]">
        <img src="/banner_tuyendung.png" alt="Đăng nhập VinJobs" className="h-full w-auto object-contain block" />
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
            <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-gray-800 text-sm font-medium mb-6 lg:hidden">
              <span className="mi mr-1">chevron_left</span> Trở lại
            </button>

            {/* Role Toggle Tabs */}
            <div className="inline-flex bg-gray-100 p-1 rounded-full mb-8 relative">
              <button
                type="button"
                onClick={() => setRole('candidate')}
                className={`relative z-10 px-6 py-1.5 text-[13px] font-bold rounded-full transition-all duration-300 ${
                  role === 'candidate' 
                    ? 'bg-white text-[#3b5bdb] shadow-[0_2px_8px_rgba(0,0,0,0.08)]' 
                    : 'text-gray-500 hover:text-gray-800 hover:bg-white/40'
                }`}
              >
                Ứng viên
              </button>
              <button
                type="button"
                onClick={() => setRole('employer')}
                className={`relative z-10 px-6 py-1.5 text-[13px] font-bold rounded-full transition-all duration-300 ${
                  role === 'employer' 
                    ? 'bg-white text-[#3b5bdb] shadow-[0_2px_8px_rgba(0,0,0,0.08)]' 
                    : 'text-gray-500 hover:text-gray-800 hover:bg-white/40'
                }`}
              >
                Nhà tuyển dụng
              </button>
            </div>

            <h2 className="text-[28px] font-bold text-gray-900 mb-2">
              {role === 'employer' ? 'Đăng nhập nhà tuyển dụng' : 'Đăng nhập ứng viên'}
            </h2>
            <p className="text-gray-500 text-[15px]">
              {role === 'employer' ? 'Kết nối với ứng viên tiềm năng chỉ trong vài bước.' : 'Khám phá hàng ngàn cơ hội việc làm ngay hôm nay.'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md mb-6 text-sm flex items-center gap-2 border border-red-100">
              <span className="mi text-lg">error</span> <span>{error}</span>
            </div>
          )}

          {step === 'form' ? (
            <div className="animate-fade-in">
              <button 
                type="button" 
                onClick={() => handleGoogleLogin()}
                className="w-full h-11 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-md flex items-center justify-center gap-2 mb-6 transition-colors shadow-sm"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Đăng nhập bằng Google
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Hoặc</span>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Email <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    className="w-full h-10 px-3 rounded-md border border-gray-300 focus:border-[#3b5bdb] focus:ring-1 focus:ring-[#3b5bdb] outline-none text-sm transition-all"
                    placeholder="Nhập email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Mật khẩu <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      className="w-full h-10 pl-3 pr-12 rounded-md border border-gray-300 focus:border-[#3b5bdb] focus:ring-1 focus:ring-[#3b5bdb] outline-none text-sm transition-all"
                      placeholder="Nhập mật khẩu"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-white flex items-center justify-center">
                      <span className="mi text-[20px]">{showPass ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                </div>
                
                <div className="flex justify-end pt-1 mb-2">
                  <Link to="/forgot-password" className="text-[13px] font-semibold text-[#3b5bdb] hover:underline">Quên mật khẩu?</Link>
                </div>
                
                {/* Turnstile Captcha */}
                <div className="flex justify-center my-3">
                  <div className="mb-4">
                    <Turnstile
                      ref={turnstileRef}
                      siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'}
                      onSuccess={(token) => setCaptchaToken(token)}
                      onError={() => setError('Lỗi tải Captcha, vui lòng tải lại trang')}
                      onExpire={() => setCaptchaToken('')}
                    />
                  </div>
                </div>
                
                <div className="pt-2">
                  <button type="submit" disabled={loading || !email || !password || !captchaToken} className="w-full h-11 bg-[#bad1f8] hover:bg-[#a5c2f3] text-[#1c3c9c] font-semibold rounded-md transition-colors flex items-center justify-center disabled:opacity-50">
                    {loading ? <span className="w-5 h-5 border-2 border-[#1c3c9c] border-t-transparent rounded-full animate-spin"></span> : 'Đăng nhập'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="animate-fade-in text-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="mi text-3xl">check_circle</span>
              </div>
              <p className="text-gray-700 text-[15px] font-medium mb-6">Kết nối google thành công. Vui lòng tiếp tục nhập thông tin để đăng nhập!</p>
              
              <form onSubmit={handleGoogleRegisterSubmit} className="space-y-4 text-left">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Mật khẩu mới <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      className="w-full h-10 pl-3 pr-12 rounded-md border border-gray-300 focus:border-[#3b5bdb] focus:ring-1 focus:ring-[#3b5bdb] outline-none text-sm transition-all"
                      placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      autoFocus
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-white flex items-center justify-center">
                      <span className="mi text-[20px]">{showPass ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                </div>
                
                <div className="pt-4">
                  <button type="submit" disabled={loading || password.length < 6} className="w-full h-11 bg-[#bad1f8] hover:bg-[#a5c2f3] text-[#1c3c9c] font-semibold rounded-md transition-colors flex items-center justify-center disabled:opacity-50">
                    {loading ? <span className="w-5 h-5 border-2 border-[#1c3c9c] border-t-transparent rounded-full animate-spin"></span> : 'Tiếp tục'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Footer Link */}
          {step === 'form' && (
            <div className="text-center mt-10">
              <p className="text-[14px] text-gray-600 mb-4">
                Bạn chưa có tài khoản? <Link to={role === 'employer' ? '/employer-register' : '/register'} className="text-[#3b5bdb] font-bold hover:underline">Đăng ký</Link>
              </p>
              <div className="flex items-center justify-center gap-3 text-[13px] text-gray-500 font-medium">
                <span>© 2024 VinJobs</span>
                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                <Link to="/terms" className="hover:text-gray-900 transition-colors">Điều khoản</Link>
                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                <Link to="/privacy" className="hover:text-gray-900 transition-colors">Bảo mật</Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

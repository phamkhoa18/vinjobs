import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { authApi } from '../../lib/api';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { token } = useParams();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự');
      return;
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await authApi.resetPassword(token, password);
      setSuccess('Đặt lại mật khẩu thành công!');
      // Chờ 2s rồi chuyển về trang login
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-white font-sans overflow-hidden">
      
      {/* LEFT PANEL - BANNER */}
      <div className="hidden lg:block h-screen bg-[#f8fafc]">
        <img src="/banner_tuyendung.png" alt="Đặt lại mật khẩu VinJobs" className="h-full w-auto object-contain block" />
      </div>

      {/* RIGHT PANEL - FORM */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 overflow-y-auto bg-white relative">
        
        {/* Mobile Logo */}
        <Link to="/" className="lg:hidden flex items-center gap-2 mb-8 mt-4 absolute top-4 left-6">
          <span className="w-8 h-8 bg-[#3b5bdb] rounded-lg flex items-center justify-center text-white font-black text-sm shadow-md">V</span>
          <span className="font-black text-lg text-gray-900">VinJobs</span>
        </Link>

        {/* Back button top left */}
        <div className="absolute top-6 right-6 hidden lg:block">
          <Link to="/" className="text-sm font-semibold text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors">
            <span className="mi text-lg">close</span> Đóng
          </Link>
        </div>

        <div className="w-full max-w-[420px]">
          
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-[28px] font-bold text-gray-900 mb-2">
              Tạo mật khẩu mới
            </h2>
            <p className="text-gray-500 text-[15px]">
              Vui lòng nhập mật khẩu mới cho tài khoản của bạn.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md mb-6 text-sm flex items-center gap-2 border border-red-100">
              <span className="mi text-lg">error</span> <span>{error}</span>
            </div>
          )}

          {success ? (
            <div className="animate-fade-in text-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="mi text-3xl">check_circle</span>
              </div>
              <p className="text-gray-700 text-[15px] font-medium mb-6">{success}</p>
              <p className="text-sm text-gray-500">Đang chuyển hướng đến trang đăng nhập...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
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

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Xác nhận mật khẩu <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="w-full h-10 pl-3 pr-12 rounded-md border border-gray-300 focus:border-[#3b5bdb] focus:ring-1 focus:ring-[#3b5bdb] outline-none text-sm transition-all"
                    placeholder="Nhập lại mật khẩu mới"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-white flex items-center justify-center">
                    <span className="mi text-[20px]">{showPass ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>
              
              <div className="pt-2">
                <button type="submit" disabled={loading || !password || !confirmPassword} className="w-full h-11 bg-[#bad1f8] hover:bg-[#a5c2f3] text-[#1c3c9c] font-semibold rounded-md transition-colors flex items-center justify-center disabled:opacity-50">
                  {loading ? <span className="w-5 h-5 border-2 border-[#1c3c9c] border-t-transparent rounded-full animate-spin"></span> : 'Đặt lại mật khẩu'}
                </button>
              </div>
            </form>
          )}

          {/* Footer Link */}
          {!success && (
            <div className="text-center mt-10">
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

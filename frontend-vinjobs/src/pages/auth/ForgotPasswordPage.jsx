import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../lib/api';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Vui lòng nhập email');
      return;
    }
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSuccess(`Đường dẫn khôi phục mật khẩu đã được gửi đến ${email}. Vui lòng kiểm tra hộp thư của bạn.`);
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
        <img src="/banner_tuyendung.png" alt="Khôi phục mật khẩu VinJobs" className="h-full w-auto object-contain block" />
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
            <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-gray-800 text-sm font-medium mb-6">
              <span className="mi mr-1">chevron_left</span> Trở lại
            </button>

            <h2 className="text-[28px] font-bold text-gray-900 mb-2">
              Quên mật khẩu?
            </h2>
            <p className="text-gray-500 text-[15px]">
              Nhập địa chỉ email của bạn để nhận hướng dẫn khôi phục mật khẩu.
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
                <span className="mi text-3xl">mark_email_read</span>
              </div>
              <p className="text-gray-700 text-[15px] font-medium mb-6">{success}</p>
              
              <Link to="/login" className="w-full h-11 bg-[#bad1f8] hover:bg-[#a5c2f3] text-[#1c3c9c] font-semibold rounded-md transition-colors flex items-center justify-center">
                Quay lại đăng nhập
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Email <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  className="w-full h-10 px-3 rounded-md border border-gray-300 focus:border-[#3b5bdb] focus:ring-1 focus:ring-[#3b5bdb] outline-none text-sm transition-all"
                  placeholder="Nhập email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              
              <div className="pt-2">
                <button type="submit" disabled={loading || !email} className="w-full h-11 bg-[#bad1f8] hover:bg-[#a5c2f3] text-[#1c3c9c] font-semibold rounded-md transition-colors flex items-center justify-center disabled:opacity-50">
                  {loading ? <span className="w-5 h-5 border-2 border-[#1c3c9c] border-t-transparent rounded-full animate-spin"></span> : 'Gửi mã khôi phục'}
                </button>
              </div>
            </form>
          )}

          {/* Footer Link */}
          {!success && (
            <div className="text-center mt-10">
              <p className="text-[14px] text-gray-600 mb-4">
                Đã nhớ mật khẩu? <Link to="/login" className="text-[#3b5bdb] font-bold hover:underline">Đăng nhập</Link>
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

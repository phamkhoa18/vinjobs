import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authApi } from '../../lib/api';
import LocationService from '../../services/LocationService';
import { Turnstile } from '@marsidev/react-turnstile';
import toast from 'react-hot-toast';

const COMPANY_TYPES = [
  'Cá nhân',
  'Công ty đa quốc gia',
  'Cổ phần',
  'Liên doanh',
  'TNHH',
  'Nhà nước',
  'Khác'
];

const COMPANY_SIZES = [
  'Dưới 10 người',
  '10 - 24 người',
  '25 - 99 người',
  '100 - 499 người',
  '500 - 999 người',
  'Trên 1000 người'
];


const INDUSTRIES = [
  'IT/CNTT',
  'Bán hàng, Kinh Doanh',
  'Lao động phổ thông',
  'Dịch vụ',
  'Hành chính/ Nhân sự',
  'Kế toán/ Tài chính',
  'Truyền thông/ Media',
  'Kiến trúc/ Thiết kế',
  'Y tế',
  'Sản xuất/ Kỹ thuật',
  'Khoa học tự nhiên',
  'Khác'
];

export default function EmployerRegisterPage() {
  const navigate = useNavigate();
  const { register, verifyEmail } = useAuth();

  const [step, setStep] = useState(1); // 1: Account, 2: Company, 3: OTP
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const turnstileRef = useRef(null);
  
  // Account Form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');
  
  // Company Form
  const [taxCode, setTaxCode] = useState('');
  const [fetchingTax, setFetchingTax] = useState(false);
  const [isFDI, setIsFDI] = useState(false);
  const [companyData, setCompanyData] = useState({
    name: '',
    address: '',
    contactName: '',
    phone: '',
    companyType: '',
    size: '',
    province: '',
    district: '',
    ward: '',
    industry: '',
  });

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  useEffect(() => {
    LocationService.getProvinces().then(setProvinces);
  }, []);
  
  // OTP
  const [otp, setOtp] = useState('');

  const handleNextToCompany = async (e) => {
    e.preventDefault();
    if (!email || password.length < 8) {
      const msg = 'Email không hợp lệ hoặc mật khẩu dưới 8 ký tự.';
      setError(msg);
      toast.error(msg);
      return;
    }
    if (password !== confirmPassword) {
      const msg = 'Mật khẩu xác nhận không khớp.';
      setError(msg);
      toast.error(msg);
      return;
    }
    if (!captchaToken) {
      const msg = 'Vui lòng xác thực bạn không phải là robot.';
      setError(msg);
      toast.error(msg);
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      const res = await authApi.checkEmail(email);
      if (res.exists) {
        const msg = 'Email này đã được sử dụng. Vui lòng đăng nhập hoặc dùng email khác.';
        setError(msg);
        toast.error(msg);
        setLoading(false);
        return;
      }
      setStep(2);
    } catch (err) {
      const msg = 'Lỗi kết nối máy chủ. Vui lòng thử lại sau.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const fetchTaxCodeInfo = async () => {
    if (!taxCode) return;
    setFetchingTax(true);
    setError('');
    try {
      const res = await fetch(`https://api.vietqr.io/v2/business/${taxCode}`);
      const data = await res.json();
      if (data.code === '00' && data.data) {
        setCompanyData(prev => ({
          ...prev,
          name: data.data.name || '',
          address: data.data.address || '',
        }));
        toast.success('Đã lấy thông tin từ MST thành công');
      } else {
        const msg = 'Không tìm thấy thông tin từ Mã số thuế này. Vui lòng kiểm tra lại.';
        setError(msg);
        toast.error(msg);
      }
    } catch (err) {
      const msg = 'Lỗi kết nối khi tra cứu Mã số thuế.';
      setError(msg);
      toast.error(msg);
    } finally {
      setFetchingTax(false);
    }
  };

  const handleNextToOTP = async (e) => {
    e.preventDefault();
    if (!companyData.name || !companyData.contactName || !companyData.phone) {
      const msg = 'Vui lòng điền đầy đủ các thông tin bắt buộc.';
      setError(msg);
      toast.error(msg);
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      await register({
        name: companyData.contactName,
        email,
        password,
        phone: companyData.phone,
        role: 'employer',
        captchaToken,
      });
      setStep(3);
    } catch (err) {
      const msg = err.message || 'Đăng ký thất bại, vui lòng thử lại.';
      setError(msg);
      toast.error(msg);
      turnstileRef.current?.reset();
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      const msg = 'Mã OTP phải gồm 6 chữ số';
      setError(msg);
      toast.error(msg);
      return;
    }
    setLoading(true);
    setError('');
    try {
      await verifyEmail(email, otp, {
        name: companyData.name,
        taxCode,
        address: companyData.address,
        province: companyData.province,
        district: companyData.district,
        ward: companyData.ward,
        companyType: isFDI ? '100% Vốn nước ngoài' : companyData.companyType,
        size: companyData.size,
        industry: companyData.industry
      });
      toast.success('Đăng ký Nhà tuyển dụng thành công!');
      navigate('/employer', { replace: true });
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    try {
      await authApi.resendOTP(email);
      toast.success('Đã gửi lại mã OTP vào email của bạn!');
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    }
  };

  return (
    <div className="flex h-screen bg-white font-sans overflow-hidden">
      
      {/* LEFT PANEL - BRANDING */}
      <div className="hidden lg:block h-screen bg-[#f8fafc]">
        <img src="/banner_tuyendung.png" alt="Tuyển dụng VinJobs" className="h-full w-auto object-contain block" />
      </div>

      {/* RIGHT PANEL - FORM */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 overflow-y-auto bg-white">
        
        {/* Mobile Logo */}
        <Link to="/" className="lg:hidden inline-flex items-center gap-2 mb-8 mt-4">
          <span className="w-10 h-10 bg-[#3b5bdb] rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md">V</span>
          <span className="font-black text-2xl text-gray-900">VinJobs</span>
        </Link>

        <div className="w-full max-w-[540px]">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md mb-6 text-sm flex items-center gap-2 border border-red-100">
              <span className="mi">error</span> {error}
            </div>
          )}

          {/* STEP 1 */}
          {step === 1 && (
            <div className="animate-fade-in">
              {/* Header section */}
              <div className="mb-8">
                <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-gray-800 text-sm font-medium mb-6 lg:hidden">
                  <span className="mi mr-1">chevron_left</span> Trở lại
                </button>

                {/* Role Toggle Tabs */}
                <div className="inline-flex bg-gray-100 p-1 rounded-full mb-8 relative">
                  <button
                    type="button"
                    onClick={() => navigate('/register')}
                    className="relative z-10 px-6 py-1.5 text-[13px] font-bold rounded-full transition-all duration-300 text-gray-500 hover:text-gray-800 hover:bg-white/40"
                  >
                    Ứng viên
                  </button>
                  <button
                    type="button"
                    className="relative z-10 px-6 py-1.5 text-[13px] font-bold rounded-full transition-all duration-300 bg-white text-[#3b5bdb] shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
                  >
                    Nhà tuyển dụng
                  </button>
                </div>
                <h2 className="text-[28px] font-bold text-gray-900 mb-2">Đăng Ký Nhà Tuyển Dụng</h2>
                <p className="text-gray-500 text-[15px]">Nhập thông tin để tạo và quản lý tài khoản nhà tuyển dụng của bạn.</p>
              </div>

              <button type="button" className="w-full h-11 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-md flex items-center justify-center gap-2 mb-6 transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Đăng ký với Google
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-sm text-gray-400 font-medium uppercase tracking-wide">Thông Tin Tài Khoản</span>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>

              <form onSubmit={handleNextToCompany} className="space-y-4">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Email <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    className="w-full h-10 px-3 rounded-md border border-gray-300 focus:border-[#3b5bdb] focus:ring-1 focus:ring-[#3b5bdb] outline-none text-sm transition-all"
                    placeholder="Nhập email công ty"
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
                      className="w-full h-10 pl-3 pr-10 rounded-md border border-gray-300 focus:border-[#3b5bdb] focus:ring-1 focus:ring-[#3b5bdb] outline-none text-sm transition-all"
                      placeholder="Nhập mật khẩu (ít nhất 8 ký tự)"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
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
                      className="w-full h-10 pl-3 pr-10 rounded-md border border-gray-300 focus:border-[#3b5bdb] focus:ring-1 focus:ring-[#3b5bdb] outline-none text-sm transition-all"
                      placeholder="Nhập xác nhận mật khẩu"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      required
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-white flex items-center justify-center">
                      <span className="mi text-[20px]">{showPass ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                </div>
                
                {/* Turnstile Captcha */}
                <div className="flex justify-center my-4">
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
                  <button type="submit" disabled={!captchaToken || loading} className="w-full h-11 bg-[#bad1f8] hover:bg-[#a5c2f3] text-[#1c3c9c] font-semibold rounded-md transition-colors disabled:opacity-50 flex items-center justify-center">
                    {loading ? <span className="w-5 h-5 border-2 border-[#1c3c9c] border-t-transparent rounded-full animate-spin"></span> : 'Tiếp tục'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="animate-fade-in w-full">
              <div className="mb-8">
                <button type="button" onClick={() => setStep(1)} className="flex items-center text-gray-500 hover:text-gray-800 text-sm font-medium mb-6 lg:hidden">
                  <span className="mi mr-1">chevron_left</span> Quay lại
                </button>
                <div className="inline-flex bg-blue-50 text-primary px-3 py-1 rounded-full text-xs font-bold mb-3 border border-blue-100">Bước 2 / 3</div>
                <h2 className="text-[28px] font-bold text-gray-900 mb-2">Đăng Ký Thông Tin Công Ty</h2>
                <p className="text-gray-500 text-[15px]">Hoàn thiện hồ sơ doanh nghiệp để có thể đăng tin tuyển dụng ngay lập tức.</p>
              </div>
              
              <form onSubmit={handleNextToOTP} className="space-y-5">
                
                {/* Row 0: MST */}
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Mã số thuế <span className="text-red-500">*</span></label>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 h-10 px-3 rounded-md border border-gray-300 focus:border-[#3b5bdb] focus:ring-1 focus:ring-[#3b5bdb] outline-none text-sm transition-all"
                      placeholder="Nhập mã số thuế"
                      value={taxCode}
                      onChange={e => setTaxCode(e.target.value)}
                      required
                    />
                    <button type="button" onClick={fetchTaxCodeInfo} disabled={!taxCode || fetchingTax}
                      className="h-10 px-4 bg-[#f3f4f6] hover:bg-[#e5e7eb] text-gray-700 font-medium rounded-md text-sm border border-gray-300 transition-colors disabled:opacity-50">
                      {fetchingTax ? 'Đang tải...' : 'Lấy thông tin'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Row 1 */}
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Người liên hệ <span className="text-red-500">*</span></label>
                    <input
                      className="w-full h-10 px-3 rounded-md border border-gray-300 focus:border-[#3b5bdb] focus:ring-1 focus:ring-[#3b5bdb] outline-none text-sm transition-all"
                      placeholder="Họ và tên"
                      value={companyData.contactName}
                      onChange={e => setCompanyData({...companyData, contactName: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Số điện thoại <span className="text-red-500">*</span></label>
                    <input
                      className="w-full h-10 px-3 rounded-md border border-gray-300 focus:border-[#3b5bdb] focus:ring-1 focus:ring-[#3b5bdb] outline-none text-sm transition-all"
                      placeholder="Nhập số điện thoại"
                      value={companyData.phone}
                      onChange={e => setCompanyData({...companyData, phone: e.target.value})}
                      required
                    />
                  </div>

                  {/* Row 2 */}
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Loại hình Công ty <span className="text-red-500">*</span></label>
                    <select
                      className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white focus:border-[#3b5bdb] focus:ring-1 focus:ring-[#3b5bdb] outline-none text-sm transition-all appearance-none"
                      value={companyData.companyType}
                      onChange={e => setCompanyData({...companyData, companyType: e.target.value})}
                      required={!isFDI}
                      disabled={isFDI}
                      style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239ca3af%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem top 50%', backgroundSize: '0.65rem auto' }}
                    >
                      <option value="">Chọn loại hình công ty</option>
                      {COMPANY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Quy mô Công ty <span className="text-red-500">*</span></label>
                    <select
                      className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white focus:border-[#3b5bdb] focus:ring-1 focus:ring-[#3b5bdb] outline-none text-sm transition-all appearance-none"
                      value={companyData.size}
                      onChange={e => setCompanyData({...companyData, size: e.target.value})}
                      required
                      style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239ca3af%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem top 50%', backgroundSize: '0.65rem auto' }}
                    >
                      <option value="">Chọn quy mô công ty</option>
                      {COMPANY_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                {/* FDI Checkbox */}
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="fdi" className="w-4 h-4 text-[#3b5bdb] rounded border-gray-300 focus:ring-[#3b5bdb]" checked={isFDI} onChange={e => setIsFDI(e.target.checked)} />
                  <label htmlFor="fdi" className="text-sm text-gray-700 font-medium cursor-pointer">Vốn đầu tư nước ngoài</label>
                </div>

                {/* Row 3: Name */}
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Tên Công ty <span className="text-red-500">*</span></label>
                  <input
                    className="w-full h-10 px-3 rounded-md border border-gray-200 bg-gray-50 text-gray-500 outline-none text-sm cursor-not-allowed"
                    placeholder="Nhập tên công ty (Auto-fill từ MST)"
                    value={companyData.name}
                    readOnly
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Row 4 */}
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Lĩnh vực công ty <span className="text-red-500">*</span></label>
                    <select
                      className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white focus:border-[#3b5bdb] focus:ring-1 focus:ring-[#3b5bdb] outline-none text-sm transition-all appearance-none"
                      value={companyData.industry}
                      onChange={e => setCompanyData({...companyData, industry: e.target.value})}
                      required
                      style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239ca3af%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem top 50%', backgroundSize: '0.65rem auto' }}
                    >
                      <option value="">Chọn lĩnh vực công ty</option>
                      {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                    </select>
                  </div>
                </div>

                {/* Location API Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Tỉnh/Thành <span className="text-red-500">*</span></label>
                    <select
                      className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white focus:border-[#3b5bdb] focus:ring-1 focus:ring-[#3b5bdb] outline-none text-sm transition-all appearance-none"
                      value={companyData.province}
                      onChange={async (e) => {
                        const val = e.target.value;
                        setCompanyData({ ...companyData, province: val, district: '', ward: '' });
                        setWards([]);
                        const p = provinces.find(x => x.name === val);
                        if (p) {
                          const d = await LocationService.getDistricts(p.code);
                          setDistricts(d);
                        } else {
                          setDistricts([]);
                        }
                      }}
                      required
                      style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239ca3af%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem top 50%', backgroundSize: '0.65rem auto' }}
                    >
                      <option value="">Chọn Tỉnh/Thành</option>
                      {provinces.map(p => <option key={p.code} value={p.name}>{p.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Quận/Huyện <span className="text-red-500">*</span></label>
                    <select
                      className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white focus:border-[#3b5bdb] focus:ring-1 focus:ring-[#3b5bdb] outline-none text-sm transition-all appearance-none disabled:bg-gray-50"
                      value={companyData.district}
                      disabled={!districts.length}
                      onChange={async (e) => {
                        const val = e.target.value;
                        setCompanyData({ ...companyData, district: val, ward: '' });
                        const d = districts.find(x => x.name === val);
                        if (d) {
                          const w = await LocationService.getWards(d.code);
                          setWards(w);
                        } else {
                          setWards([]);
                        }
                      }}
                      required
                      style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239ca3af%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem top 50%', backgroundSize: '0.65rem auto' }}
                    >
                      <option value="">Chọn Quận/Huyện</option>
                      {districts.map(d => <option key={d.code} value={d.name}>{d.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Phường/Xã <span className="text-red-500">*</span></label>
                    <select
                      className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white focus:border-[#3b5bdb] focus:ring-1 focus:ring-[#3b5bdb] outline-none text-sm transition-all appearance-none disabled:bg-gray-50"
                      value={companyData.ward}
                      disabled={!wards.length}
                      onChange={e => setCompanyData({...companyData, ward: e.target.value})}
                      required
                      style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239ca3af%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem top 50%', backgroundSize: '0.65rem auto' }}
                    >
                      <option value="">Chọn Phường/Xã</option>
                      {wards.map(w => <option key={w.code} value={w.name}>{w.name}</option>)}
                    </select>
                  </div>
                </div>

                {/* Address Input */}
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Địa chỉ cụ thể (Auto-fill từ MST) <span className="text-red-500">*</span></label>
                  <input
                    className="w-full h-10 px-3 rounded-md border border-gray-300 focus:border-[#3b5bdb] focus:ring-1 focus:ring-[#3b5bdb] outline-none text-sm transition-all"
                    placeholder="Số nhà, tên đường..."
                    value={companyData.address}
                    onChange={e => setCompanyData({...companyData, address: e.target.value})}
                    required
                  />
                </div>

                {/* Terms */}
                <div className="flex items-center gap-2 pt-2">
                  <input type="checkbox" id="terms" required className="w-4 h-4 text-[#3b5bdb] rounded border-gray-300 focus:ring-[#3b5bdb]" />
                  <label htmlFor="terms" className="text-sm text-gray-700">
                    Tôi đồng ý với <Link to="#" className="text-[#3b5bdb] hover:underline">Điều khoản sử dụng</Link> và <Link to="#" className="text-[#3b5bdb] hover:underline">Chính sách bảo mật</Link> của VinJobs
                  </label>
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-3 pt-4">
                  <button type="button" onClick={() => setStep(1)} className="w-11 h-11 flex items-center justify-center bg-[#f3f4f6] hover:bg-[#e5e7eb] rounded-md transition-colors text-gray-600">
                    <span className="mi text-xl leading-none">chevron_left</span>
                  </button>
                  <button type="submit" disabled={loading} className="flex-1 h-11 bg-[#bad1f8] hover:bg-[#a5c2f3] text-[#1c3c9c] font-semibold rounded-md transition-colors flex items-center justify-center">
                    {loading ? <span className="w-5 h-5 border-2 border-[#1c3c9c] border-t-transparent rounded-full animate-spin"></span> : 'Đăng ký'}
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="animate-fade-in w-full text-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="mi text-3xl">mark_email_read</span>
              </div>
              <h2 className="text-[22px] font-bold text-gray-900 mb-2">Nhập mã xác nhận</h2>
              <p className="text-gray-600 text-sm mb-8 px-4">
                Mã xác thực (OTP) gồm 6 chữ số đã được gửi đến email <strong>{email}</strong>.
              </p>
              
              <form onSubmit={handleVerifyOTP} className="space-y-6 max-w-sm mx-auto">
                <div>
                  <input
                    className="w-full h-14 text-center text-3xl tracking-[0.5em] font-mono rounded-md border border-gray-300 focus:border-[#3b5bdb] focus:ring-2 focus:ring-[#3b5bdb]/20 outline-none transition-all"
                    placeholder="------"
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                    required
                    autoFocus
                  />
                </div>
                
                <button type="submit" disabled={otp.length !== 6 || loading} className="w-full h-11 bg-[#bad1f8] hover:bg-[#a5c2f3] text-[#1c3c9c] font-semibold rounded-md transition-colors flex items-center justify-center disabled:opacity-50">
                  {loading ? <span className="w-5 h-5 border-2 border-[#1c3c9c] border-t-transparent rounded-full animate-spin"></span> : 'Xác thực'}
                </button>
                
                <button type="button" onClick={resendOTP} className="text-[#3b5bdb] font-medium hover:underline text-sm">
                  Gửi lại mã OTP
                </button>
              </form>
            </div>
          )}

          {/* Footer Link */}
          {step !== 3 && (
            <div className="text-center mt-10">
              <p className="text-[14px] text-gray-600 mb-4">
                Bạn đã có tài khoản? <Link to="/login" className="text-[#3b5bdb] font-bold hover:underline">Đăng nhập</Link>
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

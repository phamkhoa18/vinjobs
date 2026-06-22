import { Link } from 'react-router-dom';

const benefits = [
  {
    icon: 'verified',
    color: '#059669',
    title: 'Huy hiệu Đối Tác Chính Thức',
    desc: 'Hồ sơ công ty được gắn huy hiệu xác thực, tăng uy tín với ứng viên.',
  },
  {
    icon: 'trending_up',
    color: '#3b82f6',
    title: 'Ưu tiên hiển thị tin tuyển dụng',
    desc: 'Tin đăng của bạn luôn xuất hiện ở vị trí đầu tiên trong kết quả tìm kiếm.',
  },
  {
    icon: 'support_agent',
    color: '#8b5cf6',
    title: 'Hỗ trợ chuyên viên riêng',
    desc: 'Đội ngũ chuyên viên tư vấn tuyển dụng hỗ trợ bạn 24/7.',
  },
  {
    icon: 'analytics',
    color: '#f59e0b',
    title: 'Báo cáo & Phân tích nâng cao',
    desc: 'Theo dõi hiệu quả tuyển dụng, phân tích thị trường nhân sự chi tiết.',
  },
  {
    icon: 'group',
    color: '#ef4444',
    title: 'Truy cập kho ứng viên',
    desc: 'Tìm kiếm và liên hệ trực tiếp ứng viên phù hợp từ cơ sở dữ liệu VinJobs.',
  },
  {
    icon: 'campaign',
    color: '#06b6d4',
    title: 'Quảng bá thương hiệu tuyển dụng',
    desc: 'Công ty của bạn được giới thiệu trên trang chủ và các kênh quảng bá.',
  },
];

const steps = [
  { num: '01', title: 'Đăng ký tài khoản', desc: 'Tạo tài khoản nhà tuyển dụng miễn phí trên VinJobs.' },
  { num: '02', title: 'Gửi yêu cầu Đối Tác', desc: 'Điền thông tin công ty và gửi yêu cầu trở thành đối tác.' },
  { num: '03', title: 'Xác minh & Kích hoạt', desc: 'Đội ngũ VinJobs xác minh và kích hoạt tài khoản Đối Tác.' },
  { num: '04', title: 'Bắt đầu tuyển dụng', desc: 'Đăng tin, tìm ứng viên và tận hưởng các quyền lợi đặc biệt.' },
];

export default function PartnerChannelPage() {
  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <div className="max-w-[960px] mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-[13px] mb-4">
          <Link to="/" className="text-primary hover:underline">VinJobs</Link>
          <span className="text-[#9ca3af]">/</span>
          <span className="text-[#6b7280]">Kênh Đối Tác</span>
        </nav>

        {/* Hero */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-8 md:p-10 mb-8 text-white">
          <div className="flex items-center gap-2 mb-3">
            <span className="mi text-[28px]">verified</span>
            <span className="text-[12px] font-bold uppercase tracking-widest opacity-80">Chương trình Đối Tác</span>
          </div>
          <h1 className="text-[28px] md:text-[32px] font-black leading-tight mb-3">
            Trở thành Đối Tác<br />VinJobs
          </h1>
          <p className="text-[15px] opacity-90 max-w-[500px] mb-6">
            Nâng tầm thương hiệu tuyển dụng, tiếp cận ứng viên chất lượng cao và tận hưởng các quyền lợi đặc biệt.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/register?role=employer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-emerald-700 font-bold text-[14px] rounded-xl hover:bg-emerald-50 transition-all shadow-lg"
            >
              <span className="mi text-[18px]">handshake</span>
              Đăng ký ngay
            </Link>
            <a
              href="#benefits"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/15 text-white font-semibold text-[14px] rounded-xl hover:bg-white/25 transition-all border border-white/30"
            >
              Tìm hiểu thêm
            </a>
          </div>
        </div>

        {/* Benefits */}
        <div id="benefits" className="mb-8">
          <h2 className="text-[20px] font-bold text-[#111827] mb-5">Quyền lợi Đối Tác</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {benefits.map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-xl border border-[#e5e7eb] p-5 hover:shadow-md transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `${item.color}14` }}
                  >
                    <span className="mi text-[22px]" style={{ color: item.color }}>{item.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-[14px] font-bold text-[#111827] mb-1 group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-[13px] text-[#6b7280] leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Steps */}
        <div className="mb-8">
          <h2 className="text-[20px] font-bold text-[#111827] mb-5">Quy trình đăng ký</h2>
          <div className="bg-white rounded-xl border border-[#e5e7eb] p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {steps.map((step) => (
                <div key={step.num} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                    <span className="text-[14px] font-black text-emerald-600">{step.num}</span>
                  </div>
                  <div>
                    <h4 className="text-[14px] font-bold text-[#111827] mb-0.5">{step.title}</h4>
                    <p className="text-[13px] text-[#6b7280]">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA bottom */}
        <div className="bg-white rounded-xl border border-[#e5e7eb] p-8 text-center">
          <h2 className="text-[18px] font-bold text-[#111827] mb-2">Sẵn sàng trở thành Đối Tác?</h2>
          <p className="text-[14px] text-[#6b7280] mb-5">Liên hệ với chúng tôi để bắt đầu hợp tác ngay hôm nay.</p>
          <div className="flex items-center justify-center gap-3">
            <Link
              to="/register?role=employer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-bold text-[14px] rounded-xl hover:bg-emerald-700 transition-all"
            >
              <span className="mi text-[18px]">handshake</span>
              Đăng ký Đối Tác
            </Link>
            <a
              href="mailto:partner@vinjobs.vn"
              className="inline-flex items-center gap-2 px-6 py-3 border border-[#d1d5db] text-[#374151] font-semibold text-[14px] rounded-xl hover:border-primary hover:text-primary transition-all"
            >
              <span className="mi text-[18px]">mail</span>
              Liên hệ
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

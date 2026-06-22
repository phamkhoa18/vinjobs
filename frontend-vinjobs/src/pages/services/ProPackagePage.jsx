import { Link } from 'react-router-dom';

const plans = [
  {
    name: 'Cơ bản',
    price: 'Miễn phí',
    color: '#6b7280',
    bg: '#f9fafb',
    features: [
      'Đăng tải hồ sơ ứng viên',
      'Ứng tuyển không giới hạn',
      'Lưu tối đa 50 tin',
      'Nhận thông báo việc làm mới',
    ],
    current: true,
  },
  {
    name: 'PRO',
    price: '99.000đ/tháng',
    color: '#8b5cf6',
    bg: '#f5f3ff',
    badge: 'Phổ biến',
    features: [
      'Tất cả tính năng Cơ bản',
      'Hồ sơ nổi bật — hiển thị ưu tiên',
      'Xem ai đã xem hồ sơ của bạn',
      'Lưu tối đa 200 tin',
      'Nhận đề xuất việc làm AI',
      'Hỗ trợ chỉnh sửa CV chuyên nghiệp',
    ],
    highlight: true,
  },
  {
    name: 'PRO+',
    price: '199.000đ/tháng',
    color: '#f59e0b',
    bg: '#fffbeb',
    features: [
      'Tất cả tính năng PRO',
      'Hỗ trợ 1-1 tư vấn nghề nghiệp',
      'Ưu tiên tiếp cận nhà tuyển dụng',
      'Chứng nhận PRO+ trên hồ sơ',
      'Lưu không giới hạn',
      'Báo cáo phân tích thị trường lương',
      'Quyền truy cập sớm tính năng mới',
    ],
  },
];

export default function ProPackagePage() {
  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <div className="max-w-[960px] mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-[13px] mb-4">
          <Link to="/" className="text-primary hover:underline">VinJobs</Link>
          <span className="text-[#9ca3af]">/</span>
          <span className="text-[#6b7280]">Gói PRO</span>
        </nav>

        {/* Hero */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-violet-100 text-violet-700 rounded-full text-[12px] font-bold mb-4">
            <span className="mi text-[16px]">workspace_premium</span>
            NÂNG CẤP TÀI KHOẢN
          </div>
          <h1 className="text-[28px] font-black text-[#111827] mb-2">Gói PRO — Nổi bật hơn</h1>
          <p className="text-[15px] text-[#6b7280] max-w-[500px] mx-auto">
            Tăng cơ hội ứng tuyển thành công với hồ sơ nổi bật và các tính năng cao cấp.
          </p>
        </div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border-2 p-6 transition-all hover:shadow-lg ${
                plan.highlight
                  ? 'border-violet-400 bg-white shadow-[0_4px_24px_rgba(139,92,246,0.12)]'
                  : 'border-[#e5e7eb] bg-white'
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 bg-violet-500 text-white text-[11px] font-bold rounded-full">
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Header */}
              <div className="text-center mb-5">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
                  style={{ background: plan.bg }}
                >
                  <span className="mi text-[24px]" style={{ color: plan.color }}>workspace_premium</span>
                </div>
                <h3 className="text-[18px] font-bold text-[#111827]">{plan.name}</h3>
                <p className="text-[20px] font-black mt-1" style={{ color: plan.color }}>{plan.price}</p>
              </div>

              {/* Features */}
              <ul className="space-y-2.5 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-[13px] text-[#374151]">
                    <span className="mi text-[16px] text-green-500 shrink-0 mt-0.5">check_circle</span>
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {plan.current ? (
                <button
                  disabled
                  className="w-full py-3 rounded-xl text-[14px] font-semibold bg-[#f3f4f6] text-[#9ca3af] cursor-not-allowed"
                >
                  Gói hiện tại
                </button>
              ) : (
                <Link
                  to="/login"
                  className={`block w-full py-3 rounded-xl text-[14px] font-bold text-center transition-all ${
                    plan.highlight
                      ? 'bg-violet-500 text-white hover:bg-violet-600'
                      : 'bg-[#111827] text-white hover:bg-[#1f2937]'
                  }`}
                >
                  Đăng ký ngay
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-xl border border-[#e5e7eb] p-6">
          <h2 className="text-[16px] font-bold text-[#111827] mb-4">Câu hỏi thường gặp</h2>
          <div className="space-y-4">
            {[
              { q: 'Tôi có thể hủy gói PRO bất cứ lúc nào không?', a: 'Có, bạn có thể hủy bất cứ lúc nào. Gói sẽ còn hiệu lực đến hết kỳ thanh toán.' },
              { q: 'Thanh toán bằng phương thức nào?', a: 'Chúng tôi hỗ trợ thanh toán qua thẻ ngân hàng, Momo, ZaloPay và chuyển khoản.' },
              { q: 'Hồ sơ nổi bật hoạt động như thế nào?', a: 'Hồ sơ PRO sẽ được đánh dấu đặc biệt và hiển thị ưu tiên khi nhà tuyển dụng tìm kiếm ứng viên.' },
            ].map((item, i) => (
              <div key={i} className="border-b border-[#f3f4f6] last:border-b-0 pb-4 last:pb-0">
                <p className="text-[14px] font-semibold text-[#111827] mb-1">{item.q}</p>
                <p className="text-[13px] text-[#6b7280]">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

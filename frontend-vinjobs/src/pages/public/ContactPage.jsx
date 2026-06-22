import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const contactInfo = [
    { icon: 'mail', label: 'Email', value: 'contact@vinjobs.vn', href: 'mailto:contact@vinjobs.vn' },
    { icon: 'call', label: 'Hotline', value: '1900 1234', href: 'tel:19001234' },
    { icon: 'schedule', label: 'Giờ làm việc', value: 'T2 - T6: 8:00 - 18:00' },
    { icon: 'location_on', label: 'Địa chỉ', value: 'Tầng 18, Toà nhà VinTech, Số 6 Tân Trào, Q.7, TP.HCM' },
  ];

  const quickFAQ = [
    { q: 'Làm sao để đăng tin tuyển dụng?', a: 'Đăng ký tài khoản nhà tuyển dụng, sau đó vào Dashboard > Đăng tin tuyển dụng.' },
    { q: 'Tôi không nhận được email xác thực?', a: 'Kiểm tra mục Spam/Junk. Nếu vẫn không thấy, liên hệ hotline 1900 1234.' },
    { q: 'Làm sao để xóa tài khoản?', a: 'Gửi email đến contact@vinjobs.vn kèm thông tin tài khoản. Chúng tôi sẽ xử lý trong 24h.' },
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <div className="max-w-[960px] mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-[13px] mb-4">
          <Link to="/" className="text-primary hover:underline">VinJobs</Link>
          <span className="text-[#9ca3af]">/</span>
          <span className="text-[#6b7280]">Liên hệ</span>
        </nav>

        <h1 className="text-[24px] font-bold text-[#111827] mb-2">Liên hệ với chúng tôi</h1>
        <p className="text-[14px] text-[#6b7280] mb-8">Chúng tôi luôn sẵn sàng hỗ trợ bạn. Hãy liên hệ qua các kênh bên dưới.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Contact Info Cards */}
          <div className="space-y-4">
            {contactInfo.map((item) => (
              <div key={item.label} className="bg-white rounded-xl border border-[#e5e7eb] p-4 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center shrink-0">
                  <span className="mi text-[20px] text-primary">{item.icon}</span>
                </div>
                <div>
                  <p className="text-[12px] text-[#9ca3af] font-medium">{item.label}</p>
                  {item.href ? (
                    <a href={item.href} className="text-[14px] font-semibold text-[#111827] hover:text-primary transition-colors">{item.value}</a>
                  ) : (
                    <p className="text-[14px] font-semibold text-[#111827]">{item.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Contact Form */}
          <div className="md:col-span-2">
            {submitted ? (
              <div className="bg-white rounded-xl border border-[#e5e7eb] p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                  <span className="mi text-[32px] text-emerald-500">check_circle</span>
                </div>
                <h3 className="text-[18px] font-bold text-[#111827] mb-2">Gửi thành công!</h3>
                <p className="text-[14px] text-[#6b7280] mb-4">Chúng tôi đã nhận được tin nhắn của bạn và sẽ phản hồi trong vòng 24 giờ.</p>
                <button
                  onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', subject: '', message: '' }); }}
                  className="px-5 py-2.5 bg-primary text-white font-semibold text-[14px] rounded-xl hover:bg-blue-700 transition-all"
                >
                  Gửi tin nhắn khác
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-[#e5e7eb] p-6">
                <h3 className="text-[16px] font-bold text-[#111827] mb-4">Gửi tin nhắn</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">Họ tên *</label>
                    <input
                      type="text" required value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-3 border border-[#e5e7eb] rounded-xl text-[14px] text-[#111827] focus:outline-none focus:border-primary transition-all"
                      placeholder="Nguyễn Văn A"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">Email *</label>
                    <input
                      type="email" required value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-3 border border-[#e5e7eb] rounded-xl text-[14px] text-[#111827] focus:outline-none focus:border-primary transition-all"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">Số điện thoại</label>
                    <input
                      type="tel" value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-[#e5e7eb] rounded-xl text-[14px] text-[#111827] focus:outline-none focus:border-primary transition-all"
                      placeholder="0912 345 678"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">Chủ đề *</label>
                    <select
                      required value={form.subject}
                      onChange={e => setForm({ ...form, subject: e.target.value })}
                      className="w-full px-4 py-3 border border-[#e5e7eb] rounded-xl text-[14px] text-[#111827] focus:outline-none focus:border-primary transition-all bg-white"
                    >
                      <option value="">Chọn chủ đề</option>
                      <option value="general">Câu hỏi chung</option>
                      <option value="account">Vấn đề tài khoản</option>
                      <option value="employer">Nhà tuyển dụng</option>
                      <option value="bug">Báo lỗi</option>
                      <option value="partnership">Hợp tác</option>
                    </select>
                  </div>
                </div>
                <div className="mb-5">
                  <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">Nội dung *</label>
                  <textarea
                    required rows={5} value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    className="w-full px-4 py-3 border border-[#e5e7eb] rounded-xl text-[14px] text-[#111827] focus:outline-none focus:border-primary transition-all resize-none"
                    placeholder="Mô tả chi tiết vấn đề hoặc câu hỏi của bạn..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full md:w-auto px-8 py-3 bg-primary text-white font-bold text-[14px] rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2"
                >
                  <span className="mi text-[18px]">send</span>
                  Gửi tin nhắn
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Quick FAQ */}
        <div className="bg-white rounded-xl border border-[#e5e7eb] p-6">
          <h2 className="text-[16px] font-bold text-[#111827] mb-4 flex items-center gap-2">
            <span className="mi text-[20px] text-primary">help</span>
            Câu hỏi nhanh
          </h2>
          <div className="space-y-4">
            {quickFAQ.map((item, i) => (
              <div key={i} className="border-b border-[#f3f4f6] last:border-b-0 pb-4 last:pb-0">
                <p className="text-[14px] font-semibold text-[#111827] mb-1">{item.q}</p>
                <p className="text-[13px] text-[#6b7280]">{item.a}</p>
              </div>
            ))}
          </div>
          <Link to="/faq" className="inline-flex items-center gap-1 text-[13px] text-primary font-semibold mt-4 hover:underline">
            Xem tất cả FAQ <span className="mi text-[16px]">arrow_forward</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

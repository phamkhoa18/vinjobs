import { useState } from 'react';
import { Link } from 'react-router-dom';

const categories = [
  { key: 'all', label: 'Tất cả', icon: 'apps' },
  { key: 'candidate', label: 'Ứng viên', icon: 'person' },
  { key: 'employer', label: 'Nhà tuyển dụng', icon: 'business' },
  { key: 'account', label: 'Tài khoản', icon: 'manage_accounts' },
  { key: 'payment', label: 'Thanh toán', icon: 'payments' },
];

const faqs = [
  // Ứng viên
  { cat: 'candidate', q: 'Làm sao để tạo hồ sơ ứng tuyển?', a: 'Đăng ký tài khoản ứng viên → Vào Dashboard → Hồ sơ của tôi → Điền đầy đủ thông tin. Hồ sơ càng đầy đủ, cơ hội được nhà tuyển dụng chú ý càng cao.' },
  { cat: 'candidate', q: 'Tôi có thể ứng tuyển bao nhiêu việc?', a: 'Không giới hạn! Bạn có thể ứng tuyển bất kỳ vị trí nào phù hợp. Tuy nhiên, nên chọn lọc các vị trí thực sự phù hợp để tăng tỷ lệ thành công.' },
  { cat: 'candidate', q: 'Làm sao để biết hồ sơ đã được xem?', a: 'Vào Dashboard → Hồ sơ đã nộp để xem trạng thái từng đơn ứng tuyển. Gói PRO cho phép xem ai đã xem hồ sơ của bạn.' },
  { cat: 'candidate', q: 'Tôi muốn lưu việc làm để xem sau?', a: 'Bấm biểu tượng trái tim ❤️ trên tin tuyển dụng để lưu. Xem lại tại mục Tin đã lưu.' },
  { cat: 'candidate', q: 'CV của tôi có được bảo mật không?', a: 'Có. CV chỉ được gửi đến nhà tuyển dụng khi bạn chủ động ứng tuyển. Bạn có thể tắt chế độ công khai hồ sơ trong cài đặt.' },

  // Nhà tuyển dụng
  { cat: 'employer', q: 'Đăng tin tuyển dụng có mất phí không?', a: 'Gói cơ bản cho phép đăng tin miễn phí với giới hạn. Để đăng nhiều tin hơn và tiếp cận ứng viên tốt hơn, bạn có thể nâng cấp lên gói PRO hoặc Đối Tác.' },
  { cat: 'employer', q: 'Tin đăng hiển thị trong bao lâu?', a: 'Tin tuyển dụng hiển thị trong 30 ngày kể từ ngày đăng. Bạn có thể gia hạn hoặc đăng lại sau khi hết hạn.' },
  { cat: 'employer', q: 'Làm sao để tìm ứng viên phù hợp?', a: 'Sử dụng tính năng tìm kiếm ứng viên với bộ lọc theo ngành nghề, kỹ năng, kinh nghiệm, địa điểm. Gói Đối Tác cho phép truy cập kho ứng viên không giới hạn.' },
  { cat: 'employer', q: 'Tôi có thể liên hệ trực tiếp ứng viên không?', a: 'Có, khi ứng viên ứng tuyển bạn sẽ nhận được thông tin liên lạc. Với gói Đối Tác, bạn có thể chủ động liên hệ ứng viên từ kho dữ liệu.' },

  // Tài khoản
  { cat: 'account', q: 'Quên mật khẩu thì làm sao?', a: 'Vào trang Đăng nhập → Quên mật khẩu → Nhập email đã đăng ký → Kiểm tra email để đặt lại mật khẩu.' },
  { cat: 'account', q: 'Làm sao để đổi email?', a: 'Vào Dashboard → Cài đặt tài khoản → Đổi email. Bạn cần xác thực email mới trước khi thay đổi có hiệu lực.' },
  { cat: 'account', q: 'Tôi muốn xóa tài khoản?', a: 'Gửi email đến contact@vinjobs.vn với tiêu đề "Yêu cầu xóa tài khoản" kèm email đăng ký. Chúng tôi sẽ xử lý trong vòng 3 ngày làm việc.' },

  // Thanh toán
  { cat: 'payment', q: 'Các phương thức thanh toán được hỗ trợ?', a: 'Chúng tôi hỗ trợ: Thẻ ngân hàng (Visa/Mastercard), Momo, ZaloPay, và chuyển khoản ngân hàng.' },
  { cat: 'payment', q: 'Có được hoàn tiền không?', a: 'Có, hoàn tiền 100% trong vòng 7 ngày kể từ ngày thanh toán nếu chưa sử dụng các tính năng trả phí. Sau 7 ngày, không hỗ trợ hoàn tiền.' },
  { cat: 'payment', q: 'Tôi có thể hủy gói PRO bất cứ lúc nào không?', a: 'Có, bạn có thể hủy bất cứ lúc nào. Gói sẽ vẫn hoạt động đến hết kỳ thanh toán hiện tại, sau đó tự động chuyển về gói miễn phí.' },
];

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [openIndex, setOpenIndex] = useState(null);

  const filtered = faqs.filter(faq => {
    const matchCat = activeCategory === 'all' || faq.cat === activeCategory;
    const matchSearch = !search || faq.q.toLowerCase().includes(search.toLowerCase()) || faq.a.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary to-blue-700 py-12">
        <div className="max-w-[960px] mx-auto px-4 text-center">
          <h1 className="text-[28px] font-black text-white mb-3">Câu hỏi thường gặp</h1>
          <p className="text-[15px] text-white/80 mb-6">Tìm câu trả lời nhanh cho mọi thắc mắc của bạn</p>

          {/* Search */}
          <div className="max-w-[500px] mx-auto flex items-center gap-2 bg-white rounded-xl px-4 py-3 shadow-lg">
            <span className="mi text-[20px] text-[#9ca3af]">search</span>
            <input
              type="text"
              placeholder="Tìm kiếm câu hỏi..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 text-[14px] text-[#111827] placeholder:text-[#9ca3af] bg-transparent border-none outline-none"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-[#9ca3af] hover:text-[#374151]">
                <span className="mi text-[18px]">close</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[960px] mx-auto px-4 py-8">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => { setActiveCategory(cat.key); setOpenIndex(null); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-semibold transition-all whitespace-nowrap
                ${activeCategory === cat.key
                  ? 'bg-[#111827] text-white'
                  : 'bg-white text-[#374151] border border-[#e5e7eb] hover:border-[#9ca3af]'
                }`}
            >
              <span className="mi text-[16px]">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results count */}
        <p className="text-[13px] text-[#9ca3af] mb-4">{filtered.length} câu hỏi</p>

        {/* FAQ Accordion */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#e5e7eb] py-12 text-center">
            <span className="mi text-[40px] text-[#d1d5db] block mb-3">search_off</span>
            <p className="text-[15px] font-semibold text-[#374151] mb-1">Không tìm thấy câu hỏi phù hợp</p>
            <p className="text-[13px] text-[#9ca3af] mb-4">Thử tìm kiếm với từ khóa khác hoặc liên hệ chúng tôi</p>
            <Link to="/contact" className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-primary text-white rounded-xl text-[13px] font-bold hover:bg-blue-700 transition-all">
              <span className="mi text-[16px]">mail</span>Liên hệ hỗ trợ
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((faq, i) => (
              <div key={i} className="bg-white rounded-xl border border-[#e5e7eb] overflow-hidden">
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[#fafafa] transition-all"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold ${
                      faq.cat === 'candidate' ? 'bg-blue-50 text-blue-600' :
                      faq.cat === 'employer' ? 'bg-emerald-50 text-emerald-600' :
                      faq.cat === 'account' ? 'bg-purple-50 text-purple-600' :
                      'bg-amber-50 text-amber-600'
                    }`}>
                      <span className="mi text-[14px]">{
                        faq.cat === 'candidate' ? 'person' :
                        faq.cat === 'employer' ? 'business' :
                        faq.cat === 'account' ? 'manage_accounts' : 'payments'
                      }</span>
                    </span>
                    <span className="text-[14px] font-semibold text-[#111827]">{faq.q}</span>
                  </div>
                  <span className={`mi text-[20px] text-[#9ca3af] shrink-0 transition-transform duration-200 ${openIndex === i ? 'rotate-180' : ''}`}>
                    expand_more
                  </span>
                </button>
                {openIndex === i && (
                  <div className="px-5 pb-4 pl-14">
                    <p className="text-[14px] text-[#6b7280] leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Contact CTA */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
          <h3 className="text-[16px] font-bold text-[#111827] mb-2">Không tìm thấy câu trả lời?</h3>
          <p className="text-[14px] text-[#6b7280] mb-4">Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giúp đỡ bạn.</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link to="/contact" className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-bold text-[14px] rounded-xl hover:bg-blue-700 transition-all">
              <span className="mi text-[16px]">mail</span>Liên hệ
            </Link>
            <a href="tel:19001234" className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#d1d5db] text-[#374151] font-semibold text-[14px] rounded-xl hover:border-primary hover:text-primary transition-all">
              <span className="mi text-[16px]">call</span>1900 1234
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

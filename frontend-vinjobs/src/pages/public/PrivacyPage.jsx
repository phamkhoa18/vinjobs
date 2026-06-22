import { Link } from 'react-router-dom';

const sections = [
  { id: 'overview', title: '1. Tổng quan', content: `VinJobs cam kết bảo vệ quyền riêng tư của bạn. Chính sách này giải thích cách chúng tôi thu thập, sử dụng, lưu trữ và bảo vệ thông tin cá nhân của bạn khi sử dụng nền tảng VinJobs.

Chính sách này áp dụng cho tất cả người dùng bao gồm ứng viên, nhà tuyển dụng và khách truy cập.` },
  { id: 'collection', title: '2. Thu thập thông tin', content: `Chúng tôi thu thập các loại thông tin sau:

• Thông tin cá nhân: Họ tên, email, số điện thoại, ngày sinh, địa chỉ
• Thông tin nghề nghiệp: Kinh nghiệm, học vấn, kỹ năng, CV/hồ sơ
• Thông tin đăng nhập: Tên đăng nhập, mật khẩu (được mã hóa)
• Thông tin thiết bị: IP, trình duyệt, hệ điều hành, cookie
• Hành vi sử dụng: Lịch sử tìm kiếm, trang đã xem, thời gian truy cập` },
  { id: 'usage', title: '3. Sử dụng thông tin', content: `Chúng tôi sử dụng thông tin của bạn để:

• Cung cấp và cải thiện dịch vụ
• Kết nối ứng viên phù hợp với nhà tuyển dụng
• Gợi ý việc làm và ứng viên phù hợp (AI matching)
• Gửi thông báo về cơ hội việc làm mới
• Phân tích và cải thiện trải nghiệm người dùng
• Phát hiện và ngăn chặn gian lận
• Tuân thủ các yêu cầu pháp lý` },
  { id: 'sharing', title: '4. Chia sẻ thông tin', content: `Chúng tôi KHÔNG bán thông tin cá nhân của bạn cho bên thứ ba. Thông tin chỉ được chia sẻ trong các trường hợp:

• Ứng viên ứng tuyển: Hồ sơ được gửi đến nhà tuyển dụng theo yêu cầu của ứng viên
• Nhà tuyển dụng tìm kiếm: Hồ sơ công khai có thể được nhà tuyển dụng xem (nếu bạn bật tính năng này)
• Yêu cầu pháp lý: Khi có yêu cầu từ cơ quan chức năng theo quy định pháp luật
• Đối tác tin cậy: Các bên cung cấp dịch vụ kỹ thuật (hosting, email, phân tích) — đều ký thỏa thuận bảo mật` },
  { id: 'security', title: '5. Bảo mật dữ liệu', content: `Chúng tôi áp dụng các biện pháp bảo mật tiêu chuẩn:

• Mã hóa SSL/TLS cho tất cả kết nối
• Mã hóa mật khẩu bằng bcrypt
• Xác thực hai yếu tố (2FA) tùy chọn
• Giám sát hệ thống 24/7
• Sao lưu dữ liệu định kỳ
• Kiểm tra bảo mật định kỳ bởi đội ngũ chuyên gia

Tuy nhiên, không có hệ thống nào an toàn 100%. Chúng tôi khuyến khích bạn sử dụng mật khẩu mạnh và không chia sẻ thông tin đăng nhập.` },
  { id: 'cookies', title: '6. Cookie & Tracking', content: `VinJobs sử dụng cookie và công nghệ tương tự để:

• Duy trì phiên đăng nhập
• Ghi nhớ cài đặt và sở thích
• Phân tích lưu lượng truy cập (Google Analytics)
• Cải thiện trải nghiệm người dùng

Bạn có thể tắt cookie trong cài đặt trình duyệt, tuy nhiên một số tính năng có thể không hoạt động đúng.` },
  { id: 'rights', title: '7. Quyền của bạn', content: `Bạn có các quyền sau đối với dữ liệu cá nhân:

• Quyền truy cập: Xem thông tin cá nhân chúng tôi lưu trữ
• Quyền chỉnh sửa: Cập nhật hoặc sửa đổi thông tin không chính xác
• Quyền xóa: Yêu cầu xóa tài khoản và dữ liệu (trong vòng 30 ngày)
• Quyền di chuyển: Xuất dữ liệu ở định dạng phổ biến
• Quyền từ chối: Tắt nhận email marketing bất cứ lúc nào

Để thực hiện các quyền này, liên hệ: privacy@vinjobs.vn` },
  { id: 'changes', title: '8. Cập nhật chính sách', content: `Chúng tôi có thể cập nhật chính sách này theo thời gian. Mọi thay đổi quan trọng sẽ được thông báo qua email hoặc thông báo trên trang web ít nhất 7 ngày trước khi áp dụng.

Cập nhật lần cuối: 01/06/2026

Nếu có thắc mắc về chính sách bảo mật, vui lòng liên hệ: privacy@vinjobs.vn` },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <div className="max-w-[960px] mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-[13px] mb-4">
          <Link to="/" className="text-primary hover:underline">VinJobs</Link>
          <span className="text-[#9ca3af]">/</span>
          <span className="text-[#6b7280]">Chính sách bảo mật</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* TOC Sidebar */}
          <aside className="md:col-span-1">
            <div className="bg-white rounded-xl border border-[#e5e7eb] p-4 sticky top-20">
              <p className="text-[12px] font-semibold text-[#9ca3af] uppercase tracking-wide mb-3">Mục lục</p>
              <nav className="space-y-1">
                {sections.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="block text-[13px] text-[#6b7280] py-1.5 px-2 rounded-lg hover:bg-blue-50 hover:text-primary transition-all"
                  >
                    {s.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Content */}
          <div className="md:col-span-3">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <span className="mi text-[22px] text-emerald-600">shield</span>
              </div>
              <div>
                <h1 className="text-[24px] font-bold text-[#111827]">Chính sách bảo mật</h1>
                <p className="text-[13px] text-[#9ca3af]">Cập nhật lần cuối: 01/06/2026</p>
              </div>
            </div>

            <div className="space-y-6">
              {sections.map((s) => (
                <div key={s.id} id={s.id} className="bg-white rounded-xl border border-[#e5e7eb] p-6 scroll-mt-24">
                  <h2 className="text-[16px] font-bold text-[#111827] mb-3">{s.title}</h2>
                  <div className="text-[14px] text-[#374151] leading-relaxed whitespace-pre-line">{s.content}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

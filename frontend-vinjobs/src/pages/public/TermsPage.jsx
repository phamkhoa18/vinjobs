import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const sections = [
  { id: 'general', title: '1. Điều khoản chung', content: `Chào mừng bạn đến với VinJobs. Khi sử dụng nền tảng của chúng tôi, bạn đồng ý tuân thủ các điều khoản và điều kiện được nêu dưới đây. Vui lòng đọc kỹ trước khi sử dụng dịch vụ.

VinJobs là nền tảng trực tuyến kết nối người tìm việc với nhà tuyển dụng. Chúng tôi cung cấp công cụ để đăng tin tuyển dụng, tìm kiếm và ứng tuyển việc làm.

Bằng việc truy cập và sử dụng VinJobs, bạn xác nhận rằng bạn đã đủ 18 tuổi hoặc có sự đồng ý của người giám hộ hợp pháp.` },
  { id: 'account', title: '2. Tài khoản người dùng', content: `Khi đăng ký tài khoản trên VinJobs, bạn cam kết cung cấp thông tin chính xác, đầy đủ và cập nhật. Bạn chịu trách nhiệm bảo mật tài khoản và mật khẩu của mình.

Mỗi cá nhân chỉ được phép sở hữu một tài khoản. Chúng tôi có quyền tạm khóa hoặc xóa tài khoản nếu phát hiện vi phạm.

Bạn không được chia sẻ, chuyển nhượng hoặc bán tài khoản cho bất kỳ bên thứ ba nào.` },
  { id: 'content', title: '3. Nội dung đăng tải', content: `Mọi nội dung đăng tải trên VinJobs (tin tuyển dụng, hồ sơ, bình luận, đánh giá) phải tuân thủ pháp luật Việt Nam và các quy định của nền tảng.

Nghiêm cấm đăng tải nội dung: sai sự thật, lừa đảo, vi phạm bản quyền, xúc phạm, phân biệt đối xử, hoặc vi phạm quyền riêng tư của người khác.

VinJobs có quyền xóa hoặc chỉnh sửa bất kỳ nội dung nào vi phạm mà không cần thông báo trước.` },
  { id: 'employer', title: '4. Quy định dành cho Nhà tuyển dụng', content: `Nhà tuyển dụng cam kết đăng tin tuyển dụng chính xác, bao gồm: vị trí, mô tả công việc, yêu cầu, mức lương và địa điểm làm việc.

Nghiêm cấm đăng tin tuyển dụng ẩn (MLM, đa cấp) hoặc yêu cầu ứng viên đóng phí tuyển dụng.

Nhà tuyển dụng phải xử lý hồ sơ ứng viên trong vòng 14 ngày kể từ ngày nhận.` },
  { id: 'candidate', title: '5. Quy định dành cho Ứng viên', content: `Ứng viên cam kết cung cấp thông tin hồ sơ trung thực, bao gồm: kinh nghiệm, học vấn, kỹ năng và thông tin liên lạc.

Nghiêm cấm giả mạo hồ sơ, sử dụng bằng cấp giả, hoặc cung cấp thông tin sai lệch.

Ứng viên nên phản hồi lời mời phỏng vấn trong vòng 48 giờ.` },
  { id: 'services', title: '6. Dịch vụ', content: `Tất cả các tính năng trên VinJobs đều hoàn toàn miễn phí cho cả ứng viên và nhà tuyển dụng, bao gồm: đăng tin tuyển dụng, tìm kiếm việc làm, ứng tuyển và quản lý hồ sơ.

VinJobs cam kết duy trì các dịch vụ miễn phí nhằm hỗ trợ cộng đồng lao động Việt Nam.` },
  { id: 'disputes', title: '7. Giải quyết tranh chấp', content: `Mọi tranh chấp phát sinh sẽ được giải quyết thông qua thương lượng giữa các bên liên quan.

Nếu không đạt được thỏa thuận, tranh chấp sẽ được giải quyết tại Tòa án nhân dân có thẩm quyền theo pháp luật Việt Nam.

Để khiếu nại, vui lòng gửi email đến legal@vinjobs.vn hoặc gọi hotline 1900 1234.` },
  { id: 'changes', title: '8. Thay đổi điều khoản', content: `VinJobs có quyền thay đổi, bổ sung điều khoản sử dụng bất cứ lúc nào. Thay đổi sẽ có hiệu lực ngay khi được đăng tải trên trang web.

Chúng tôi sẽ thông báo qua email về những thay đổi quan trọng ít nhất 7 ngày trước khi áp dụng.

Việc tiếp tục sử dụng dịch vụ sau khi điều khoản thay đổi đồng nghĩa với việc bạn chấp nhận các thay đổi đó.

Cập nhật lần cuối: 01/06/2026` },
];

export default function TermsPage() {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.replace('#', ''));
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [hash]);

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <div className="max-w-[960px] mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-[13px] mb-4">
          <Link to="/" className="text-primary hover:underline">VinJobs</Link>
          <span className="text-[#9ca3af]">/</span>
          <span className="text-[#6b7280]">Điều khoản sử dụng</span>
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
            <h1 className="text-[24px] font-bold text-[#111827] mb-2">Điều khoản sử dụng</h1>
            <p className="text-[13px] text-[#9ca3af] mb-6">Cập nhật lần cuối: 01/06/2026</p>

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

import { Link } from 'react-router-dom';

const stats = [
  { value: '50,000+', label: 'Ứng viên', icon: 'person', color: '#3674c5' },
  { value: '2,500+', label: 'Nhà tuyển dụng', icon: 'business', color: '#059669' },
  { value: '10,000+', label: 'Việc làm', icon: 'work', color: '#f59e0b' },
  { value: '98%', label: 'Hài lòng', icon: 'thumb_up', color: '#8b5cf6' },
];

const values = [
  { icon: 'rocket_launch', title: 'Nhanh chóng', desc: 'Kết nối ứng viên và nhà tuyển dụng trong vài phút, không cần qua trung gian.' },
  { icon: 'verified_user', title: 'Đáng tin cậy', desc: 'Mọi tin tuyển dụng đều được xác minh. Không spam, không lừa đảo.' },
  { icon: 'psychology', title: 'Thông minh', desc: 'AI gợi ý việc làm phù hợp dựa trên kỹ năng, kinh nghiệm và sở thích của bạn.' },
  { icon: 'diversity_3', title: 'Cộng đồng', desc: 'Xây dựng mạng lưới nghề nghiệp, chia sẻ kinh nghiệm và cùng phát triển.' },
];

const team = [
  { name: 'Nguyễn Văn An', role: 'CEO & Founder', icon: 'person' },
  { name: 'Trần Thị Bích', role: 'CTO', icon: 'person' },
  { name: 'Lê Minh Quang', role: 'Head of Product', icon: 'person' },
  { name: 'Phạm Thu Hà', role: 'Head of Marketing', icon: 'person' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary via-blue-600 to-indigo-700 py-16 md:py-24">
        <div className="max-w-[960px] mx-auto px-4 text-center text-white">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/15 backdrop-blur rounded-full text-[12px] font-bold mb-6">
            <span className="mi text-[16px]">info</span>
            VỀ CHÚNG TÔI
          </div>
          <h1 className="text-[32px] md:text-[42px] font-black leading-tight mb-4">
            Kết nối nhân tài,<br />kiến tạo tương lai
          </h1>
          <p className="text-[16px] opacity-90 max-w-[600px] mx-auto mb-8">
            VinJobs là nền tảng tuyển dụng hàng đầu Việt Nam, giúp hàng triệu ứng viên 
            tìm được công việc mơ ước và nhà tuyển dụng tìm được nhân tài phù hợp.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-[700px] mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-white/10 backdrop-blur rounded-2xl p-4">
                <span className="mi text-[28px] mb-1 block" style={{ color: stat.color }}>{stat.icon}</span>
                <p className="text-[24px] font-black">{stat.value}</p>
                <p className="text-[13px] opacity-80">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[960px] mx-auto px-4 py-10">
        {/* Mission */}
        <div className="text-center mb-12">
          <h2 className="text-[24px] font-bold text-[#111827] mb-3">Sứ mệnh của chúng tôi</h2>
          <p className="text-[15px] text-[#6b7280] max-w-[700px] mx-auto leading-relaxed">
            Chúng tôi tin rằng mọi người đều xứng đáng có một công việc phù hợp. VinJobs ra đời 
            với sứ mệnh đơn giản hóa quá trình tìm việc và tuyển dụng, mang lại giá trị thực sự 
            cho cả ứng viên và doanh nghiệp.
          </p>
        </div>

        {/* Values */}
        <h2 className="text-[20px] font-bold text-[#111827] mb-5">Giá trị cốt lõi</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {values.map((v) => (
            <div key={v.title} className="bg-white rounded-xl border border-[#e5e7eb] p-6 hover:shadow-md transition-all group">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/8 flex items-center justify-center shrink-0">
                  <span className="mi text-[24px] text-primary">{v.icon}</span>
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-[#111827] mb-1 group-hover:text-primary transition-colors">{v.title}</h3>
                  <p className="text-[13px] text-[#6b7280] leading-relaxed">{v.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Team */}
        <h2 className="text-[20px] font-bold text-[#111827] mb-5">Đội ngũ lãnh đạo</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {team.map((t) => (
            <div key={t.name} className="bg-white rounded-xl border border-[#e5e7eb] p-5 text-center hover:shadow-md transition-all">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <span className="mi text-[28px] text-primary">{t.icon}</span>
              </div>
              <p className="text-[14px] font-bold text-[#111827]">{t.name}</p>
              <p className="text-[12px] text-[#6b7280]">{t.role}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-white rounded-xl border border-[#e5e7eb] p-8 text-center">
          <h2 className="text-[18px] font-bold text-[#111827] mb-2">Sẵn sàng bắt đầu?</h2>
          <p className="text-[14px] text-[#6b7280] mb-5">Tham gia VinJobs ngay hôm nay — miễn phí!</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link to="/jobs" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold text-[14px] rounded-xl hover:bg-blue-700 transition-all">
              <span className="mi text-[18px]">search</span>Tìm việc ngay
            </Link>
            <Link to="/register?role=employer" className="inline-flex items-center gap-2 px-6 py-3 border border-[#d1d5db] text-[#374151] font-semibold text-[14px] rounded-xl hover:border-primary hover:text-primary transition-all">
              <span className="mi text-[18px]">business</span>Đăng tuyển
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

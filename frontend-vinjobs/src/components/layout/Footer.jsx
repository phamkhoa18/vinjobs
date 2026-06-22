import { Link } from 'react-router-dom';
import { useSettings } from '../../contexts/SettingsContext';

export default function Footer() {
  const { settings } = useSettings();

  return (
    <footer>
      {/* SEO Links */}
      <div className="bg-white py-6 border-t border-border-main">
        <div className="container">
          <h3 className="text-sm font-bold text-text-primary mb-2">Việc làm theo khu vực</h3>
          <div className="flex flex-wrap gap-1.5">
            {[
              { label: 'TP.HCM', value: 'ho-chi-minh' },
              { label: 'Hà Nội', value: 'ha-noi' },
              { label: 'Đà Nẵng', value: 'da-nang' },
              { label: 'Bình Dương', value: 'binh-duong' },
              { label: 'Đồng Nai', value: 'dong-nai' },
              { label: 'Bắc Ninh', value: 'bac-ninh' },
              { label: 'Hải Phòng', value: 'hai-phong' },
              { label: 'Long An', value: 'long-an' },
            ].map(city => (
              <Link key={city.value} to={`/jobs?location=${city.value}`} className="text-[13px] text-primary px-3 py-1 bg-primary-50 rounded-full hover:bg-primary-100 transition-colors">
                Việc làm tại {city.label}
              </Link>
            ))}
          </div>

          <h3 className="text-sm font-bold text-text-primary mb-2 mt-4">Việc làm theo ngành nghề</h3>
          <div className="flex flex-wrap gap-1.5">
            {[
              { label: 'IT', value: 'it' },
              { label: 'Kinh doanh', value: 'kinh-doanh' },
              { label: 'Marketing', value: 'marketing' },
              { label: 'Kế toán', value: 'ke-toan' },
              { label: 'Nhân sự', value: 'nhan-su' },
              { label: 'Thiết kế', value: 'thiet-ke' },
              { label: 'Bán hàng', value: 'ban-hang' },
              { label: 'Logistics', value: 'logistics' },
            ].map(industry => (
              <Link key={industry.value} to={`/jobs?industry=${industry.value}`} className="text-[13px] text-primary px-3 py-1 bg-primary-50 rounded-full hover:bg-primary-100 transition-colors">
                Việc làm {industry.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="bg-white py-8 border-t border-border-main">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Cột tĩnh: Liên hệ & Ứng dụng */}
            <div>
              <h4 className="text-sm font-bold text-text-primary mb-3">Thông tin liên hệ</h4>
              <div className="flex gap-2 mb-3.5">
                {settings?.linkedin_url && (
                  <a href={settings.linkedin_url} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center rounded-full bg-primary text-white hover:opacity-80 transition-opacity" title="LinkedIn">
                    <span className="mi text-[18px]">public</span>
                  </a>
                )}
                {settings?.facebook_url && (
                  <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1877f2] text-white hover:opacity-80 transition-opacity" title="Facebook">
                    <span className="mi text-[18px]">thumb_up</span>
                  </a>
                )}
              </div>
              <div className="space-y-1.5 mb-4">
                <p className="flex items-start gap-1.5 text-[13px] text-text-secondary"><span className="mi text-[16px]">mail</span>{settings?.contact_email || 'contact@vinjobs.vn'}</p>
                <p className="flex items-start gap-1.5 text-[13px] text-text-secondary"><span className="mi text-[16px]">call</span>{settings?.contact_phone || '19001234'}</p>
                <p className="flex items-start gap-1.5 text-[13px] text-text-secondary leading-relaxed"><span className="mi text-[16px] shrink-0">location_on</span>{settings?.address || 'Việt Nam'}</p>
              </div>
              
              {/* App download */}
              <div className="flex gap-3 items-start">
                <div className="flex flex-col gap-1.5">
                  <button className="flex items-center gap-2 px-3 py-1 bg-text-primary text-white rounded hover:opacity-85 transition-opacity">
                    <span className="mi text-[16px]">apple</span>
                    <div className="text-left"><small className="block text-[8px] leading-none opacity-70">Tải trên</small><strong className="block text-[11px] leading-none mt-0.5">App Store</strong></div>
                  </button>
                  <button className="flex items-center gap-2 px-3 py-1 bg-text-primary text-white rounded hover:opacity-85 transition-opacity">
                    <span className="mi text-[16px]">shop</span>
                    <div className="text-left"><small className="block text-[8px] leading-none opacity-70">Tải trên</small><strong className="block text-[11px] leading-none mt-0.5">Google Play</strong></div>
                  </button>
                </div>
              </div>
            </div>

            {/* Các cột động */}
            {(settings?.footer_columns || []).map((col, idx) => (
              <div key={idx}>
                <h4 className="text-sm font-bold text-text-primary mb-3">{col.title}</h4>
                <div className="space-y-1">
                  {(col.links || []).map((linkItem, linkIdx) => (
                    <Link key={linkIdx} to={linkItem.link} className="block text-[13px] text-text-secondary py-0.5 hover:text-primary transition-colors">
                      {linkItem.title}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="bg-bg py-3.5 border-t border-border-main">
        <div className="container">
          <p className="text-xs text-text-muted text-center">{settings?.footer_bottom_text || '© 2026 VinJobs. All rights reserved.'}</p>
        </div>
      </div>
    </footer>
  );
}

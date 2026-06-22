import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema({
  site_name: {
    type: String,
    default: 'VinJobs - Nền tảng tuyển dụng'
  },
  logo: {
    type: String,
    default: ''
  },
  favicon: {
    type: String,
    default: ''
  },
  seo_title: {
    type: String,
    default: 'VinJobs - Tuyển dụng & Tìm việc làm nhanh chóng'
  },
  seo_description: {
    type: String,
    default: 'VinJobs là nền tảng tuyển dụng và tìm việc làm hàng đầu, kết nối ứng viên với các công ty uy tín.'
  },
  seo_keywords: {
    type: String,
    default: 'tuyển dụng, việc làm, vinjobs, tìm việc'
  },
  contact_email: {
    type: String,
    default: 'support@vinjobs.vn'
  },
  contact_phone: {
    type: String,
    default: '1900 1234'
  },
  address: {
    type: String,
    default: 'Hà Nội, Việt Nam'
  },
  facebook_url: {
    type: String,
    default: ''
  },
  linkedin_url: {
    type: String,
    default: ''
  },
  header_menu: {
    type: [
      {
        title: String,
        link: String,
        is_new_tab: { type: Boolean, default: false }
      }
    ],
    default: [
      { title: 'Việc làm', link: '/jobs', is_new_tab: false },
      { title: 'Công ty', link: '/companies', is_new_tab: false },
      { title: 'Blog', link: '/blog', is_new_tab: false }
    ]
  },
  footer_columns: {
    type: [
      {
        title: String,
        links: [
          {
            title: String,
            link: String
          }
        ]
      }
    ],
    default: [
      {
        title: 'Dành cho Ứng viên',
        links: [
          { title: 'Tìm việc làm', link: '/jobs' },
          { title: 'Công ty nổi bật', link: '/companies' },
          { title: 'Cẩm nang nghề nghiệp', link: '/blog' }
        ]
      },
      {
        title: 'Dành cho Nhà Tuyển Dụng',
        links: [
          { title: 'Đăng tin tuyển dụng', link: '/employer/post-job' },
          { title: 'Tìm kiếm hồ sơ', link: '/employer/search-cv' },
          { title: 'Sản phẩm & Dịch vụ', link: '/pricing' }
        ]
      },
      {
        title: 'Về VinJobs',
        links: [
          { title: 'Giới thiệu', link: '/about' },
          { title: 'Liên hệ', link: '/contact' },
          { title: 'Điều khoản dịch vụ', link: '/terms' },
          { title: 'Chính sách bảo mật', link: '/privacy' }
        ]
      }
    ]
  },
  footer_bottom_text: {
    type: String,
    default: '© 2026 VinJobs. All rights reserved.'
  }
}, {
  timestamps: true
});

const Setting = mongoose.model('Setting', settingSchema);
export default Setting;

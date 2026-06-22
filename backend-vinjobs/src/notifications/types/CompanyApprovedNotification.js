import BaseNotification from '../BaseNotification.js';

class CompanyApprovedNotification extends BaseNotification {
  constructor(sender, company, employerUser) {
    super(sender);
    this.company = company;
    this.employerUser = employerUser;
    this.userId = company.employer_id;
    
    this.title = 'Hồ sơ Công ty đã được duyệt';
    this.message = `Chúc mừng! Hồ sơ công ty "${this.company.name}" của bạn đã được Admin phê duyệt thành công. Bạn có thể bắt đầu đăng tin tuyển dụng ngay bây giờ.`;
  }

  async send() {
    await this.sender.sendMessage(this.employerUser.email, this.title, this.message);
    
    return {
      user_id: this.userId,
      title: this.title,
      message: this.message,
      type: 'COMPANY_APPROVED'
    };
  }
}

export default CompanyApprovedNotification;

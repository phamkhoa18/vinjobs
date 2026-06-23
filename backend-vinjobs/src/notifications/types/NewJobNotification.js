import BaseNotification from '../BaseNotification.js';

class NewJobNotification extends BaseNotification {
  constructor(sender, job, company, adminUser) {
    super(sender);
    this.job = job;
    this.company = company;
    this.adminUser = adminUser;
    this.userId = adminUser._id;
    
    this.title = 'Tin tuyển dụng mới chờ duyệt';
    this.message = `Công ty "${this.company.name}" vừa đăng tin tuyển dụng mới: "${this.job.title}". Vui lòng kiểm duyệt tin.`;
  }

  async send() {
    // Optionally send email to admin, but for now just create in-app notification
    // await this.sender.sendMessage(this.adminUser.email, this.title, this.message);
    
    return {
      user_id: this.userId,
      title: this.title,
      message: this.message,
      type: 'NEW_JOB_PENDING'
    };
  }
}

export default NewJobNotification;

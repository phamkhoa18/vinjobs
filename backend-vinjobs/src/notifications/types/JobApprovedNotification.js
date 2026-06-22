import BaseNotification from '../BaseNotification.js';

class JobApprovedNotification extends BaseNotification {
  constructor(sender, job, employerEmail) {
    super(sender);
    this.job = job;
    this.employerEmail = employerEmail;
    this.userId = job.employer_id;
    
    this.title = 'Tin tuyển dụng đã được duyệt';
    this.message = `Tin tuyển dụng "${this.job.title}" của bạn đã được duyệt và hiển thị công khai.`;
  }

  async send() {
    await this.sender.sendMessage(this.employerEmail, this.title, this.message);
    
    return {
      user_id: this.userId,
      title: this.title,
      message: this.message,
      type: 'JOB_APPROVED'
    };
  }
}

export default JobApprovedNotification;

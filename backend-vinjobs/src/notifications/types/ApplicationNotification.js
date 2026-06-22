import BaseNotification from '../BaseNotification.js';

class ApplicationNotification extends BaseNotification {
  constructor(sender, application, candidate, job, employerEmail) {
    super(sender);
    this.application = application;
    this.employerEmail = employerEmail;
    this.userId = job.employer_id;
    
    this.title = 'Có ứng viên mới';
    this.message = `Ứng viên "${candidate.name}" vừa ứng tuyển vào vị trí "${job.title}" của bạn.`;
  }

  async send() {
    await this.sender.sendMessage(this.employerEmail, this.title, this.message);
    
    return {
      user_id: this.userId,
      title: this.title,
      message: this.message,
      type: 'NEW_APPLICATION'
    };
  }
}

export default ApplicationNotification;

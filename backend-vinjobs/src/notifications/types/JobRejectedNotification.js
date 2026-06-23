import BaseNotification from '../BaseNotification.js';

class JobRejectedNotification extends BaseNotification {
  constructor(sender, job, employerUser) {
    super(sender);
    this.job = job;
    this.employerUser = employerUser;
    this.userId = employerUser._id || job.employer_id;
    
    this.title = 'Tin tuyển dụng bị từ chối';
    this.message = `Tin tuyển dụng "${this.job.title}" của bạn đã bị quản trị viên từ chối do không đáp ứng yêu cầu.`;
  }

  async send() {
    const email = this.employerUser.email || this.employerUser;
    if (email) {
      await this.sender.sendMessage(email, this.title, this.message);
    }
    
    return {
      user_id: this.userId,
      title: this.title,
      message: this.message,
      type: 'JOB_REJECTED'
    };
  }
}

export default JobRejectedNotification;

import BaseNotification from '../BaseNotification.js';

class ApplicationStatusNotification extends BaseNotification {
  constructor(sender, application, job, candidateEmail, newStatus) {
    super(sender);
    this.application = application;
    this.candidateEmail = candidateEmail;
    this.userId = application.candidate_id;
    
    this.title = `Cập nhật trạng thái ứng tuyển: ${job.title}`;
    
    let statusText = 'đang được xem xét';
    if (newStatus === 'APPROVED') statusText = 'đã được CHẤP NHẬN';
    if (newStatus === 'REJECTED') statusText = 'rất tiếc đã BỊ TỪ CHỐI';
    if (newStatus === 'SHORTLISTED') statusText = 'đã lọt vào DANH SÁCH NGẮN';

    this.message = `Đơn ứng tuyển của bạn cho vị trí "${job.title}" ${statusText}.`;
  }

  async send() {
    await this.sender.sendMessage(this.candidateEmail, this.title, this.message);
    
    return {
      user_id: this.userId,
      title: this.title,
      message: this.message,
      type: 'APPLICATION_STATUS_UPDATE'
    };
  }
}

export default ApplicationStatusNotification;

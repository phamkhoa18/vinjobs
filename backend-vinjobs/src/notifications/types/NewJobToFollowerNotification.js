import BaseNotification from '../BaseNotification.js';

class NewJobToFollowerNotification extends BaseNotification {
  /**
   * @param {Object} sender - Một thể hiện của MessageSender (ví dụ EmailSender)
   * @param {Object} job - Thông tin công việc mới
   * @param {Object} company - Thông tin công ty
   * @param {Object} followerUser - User object của người theo dõi (để lấy email)
   */
  constructor(sender, job, company, followerUser) {
    super(sender);
    this.job = job;
    this.company = company;
    this.followerUser = followerUser;
    
    // Gán userId để lưu vào database (BaseNotification dùng this.userId)
    this.userId = followerUser._id;
    this.title = `Cơ hội việc làm mới từ công ty bạn theo dõi: ${this.company.name}`;
    
    const jobUrl = `${process.env.CLIENT_URL}/jobs/${this.job.slug || this.job._id}`;
    const companyUrl = `${process.env.CLIENT_URL}/companies/${this.company.slug || this.company._id}`;
    
    this.message = `
      <h2>Chào ${this.followerUser.name || 'bạn'},</h2>
      <p>Công ty <strong><a href="${companyUrl}">${this.company.name}</a></strong> mà bạn đang theo dõi vừa đăng một tin tuyển dụng mới!</p>
      
      <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #1e40af;">${this.job.title}</h3>
        <p><strong>Địa điểm:</strong> ${this.job.location}</p>
        <p><strong>Mức lương:</strong> ${this.job.salary_min && this.job.salary_max ? `${this.job.salary_min / 1000000} - ${this.job.salary_max / 1000000} triệu` : 'Thỏa thuận'}</p>
        <p style="margin-bottom: 0;">
          <a href="${jobUrl}" style="display: inline-block; background-color: #ffba00; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: bold;">Xem chi tiết công việc</a>
        </p>
      </div>

      <p>Chúc bạn ứng tuyển thành công!</p>
      <p>Trân trọng,<br>Đội ngũ VinJobs</p>
    `;
  }

  async send() {
    await this.sender.sendMessage(this.followerUser.email, this.title, this.message);
    
    return {
      user_id: this.userId,
      title: this.title,
      message: this.message,
      type: 'NEW_JOB_FROM_FOLLOWED_COMPANY'
    };
  }
}

export default NewJobToFollowerNotification;

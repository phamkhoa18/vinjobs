/**
 * RecruitmentFacade - Orchestrates complex recruitment workflows
 * Tích hợp nhiều services để thực hiện các thao tác phức tạp
 */
import AppError from '../utils/AppError.js';
import authService from '../services/AuthService.js';
import notificationService from '../services/NotificationService.js';
import jobService from '../services/JobService.js';
import applicationService from '../services/ApplicationService.js';

class RecruitmentFacade {
  /**
   * Đăng tin tuyển dụng (trừ slot gói, tạo job)
   */
  async postJob(employerId, companyId, jobData) {
    const job = await jobService.createJob(employerId, companyId, jobData);
    
    // Notify admins
    const company = await (await import('../models/Company.js')).default.findById(companyId);
    const NotificationFacade = (await import('../patterns/facade/NotificationFacade.js')).default;
    await NotificationFacade.sendNewJobNotification(job, company);
    
    return job;
  }

  /**
   * Ứng tuyển công việc (Tạo đơn, check duplicate)
   */
  async applyForJob(candidateId, jobId, cvId, coverLetter) {
    const candidate = await authService.getUserById(candidateId);
    const job = await jobService.getJobById(jobId);

    if (job.status !== 'APPROVED') {
      throw new AppError('Tin tuyển dụng chưa được duyệt hoặc đã đóng', 400);
    }

    const isDuplicate = await applicationService.checkDuplicate(candidateId, jobId);
    if (isDuplicate) {
      throw new AppError('Bạn đã ứng tuyển công việc này rồi', 400);
    }

    const application = await applicationService.apply(candidateId, jobId, cvId, coverLetter);
    return application;
  }

  /**
   * Đổi trạng thái đơn ứng tuyển
   */
  async changeApplicationStatus(employerId, appId, status) {
    const application = await applicationService.updateStatus(employerId, appId, status);
    return application;
  }
}


export default new RecruitmentFacade();

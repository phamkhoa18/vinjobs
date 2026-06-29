/**
 * RecruitmentFacade — Façade Pattern (GoF)
 * 
 * Điều phối các quy trình tuyển dụng phức tạp bằng cách phối hợp
 * nhiều Service (AuthService, JobService, ApplicationService) và 
 * NotificationFacade thành một giao diện đơn giản.
 * 
 * Facade Pattern giúp Controller KHÔNG CẦN biết chi tiết bên trong:
 * - Khi ứng tuyển: cần check job status → check duplicate → tạo đơn → gửi notification
 * - Khi đổi trạng thái: cần validate quyền → update DB → gửi notification (email + SMS)
 * 
 * Controller chỉ gọi MỘT method duy nhất của Facade.
 * 
 * @example
 * // Thay vì 5-6 dòng code ở Controller:
 * await recruitmentFacade.applyForJob(candidateId, jobId, cvId, coverLetter);
 */
import AppError from '../utils/AppError.js';
import authService from '../services/AuthService.js';
import jobService from '../services/JobService.js';
import applicationService from '../services/ApplicationService.js';
import NotificationFacade from './NotificationFacade.js';

class RecruitmentFacade {
  /**
   * Đăng tin tuyển dụng — Facade điều phối:
   * 1. Gọi JobService tạo job
   * 2. Tìm company
   * 3. Gọi NotificationFacade gửi thông báo cho Admin
   * 
   * @param {string} employerId - ID nhà tuyển dụng
   * @param {string} companyId - ID công ty
   * @param {Object} jobData - Dữ liệu tin tuyển dụng
   * @returns {Object} Job đã tạo
   */
  async postJob(employerId, companyId, jobData) {
    const job = await jobService.createJob(employerId, companyId, jobData);
    
    // Notify admins
    const company = await (await import('../models/Company.js')).default.findById(companyId);
    await NotificationFacade.sendNewJobNotification(job, company);
    
    return job;
  }

  /**
   * Ứng tuyển công việc — Facade điều phối:
   * 1. Lấy thông tin candidate
   * 2. Kiểm tra job còn mở không
   * 3. Kiểm tra đã ứng tuyển chưa (chống duplicate)
   * 4. Tạo đơn ứng tuyển qua ApplicationService
   * 5. Gửi thông báo cho Employer qua NotificationFacade
   * 
   * @param {string} candidateId - ID ứng viên
   * @param {string} jobId - ID công việc
   * @param {string} cvId - ID CV đính kèm
   * @param {string} coverLetter - Thư giới thiệu
   * @returns {Object} Application đã tạo
   */
  async applyForJob(candidateId, jobId, cvId, coverLetter) {
    // 1. Tạo đơn ứng tuyển (Service xử lý validate + CRUD)
    const application = await applicationService.applyForJob(jobId, candidateId, {
      cv_id: cvId,
      cover_letter: coverLetter
    });

    // 2. Gửi thông báo cho Employer (Facade điều phối notification)
    try {
      const User = (await import('../models/User.js')).default;
      const Job = (await import('../models/Job.js')).default;
      const candidateUser = await User.findById(candidateId);
      const job = await Job.findById(jobId);
      const employerUser = await User.findById(job.employer_id);
      
      if (candidateUser && employerUser) {
        await NotificationFacade.sendNewApplicationNotification(application, candidateUser, job, employerUser);
      }
    } catch (err) {
      console.error('[RecruitmentFacade] Lỗi gửi thông báo ứng tuyển mới:', err);
    }

    return application;
  }

  /**
   * Đổi trạng thái đơn ứng tuyển — Facade điều phối:
   * 1. Gọi ApplicationService để update status
   * 2. Gửi thông báo Multi-Channel (Email + SMS) cho ứng viên
   *    → Đây là minh chứng rõ nhất cho BRIDGE PATTERN
   * 
   * @param {string} employerId - ID nhà tuyển dụng (để validate quyền)
   * @param {string} appId - ID đơn ứng tuyển
   * @param {string} status - Trạng thái mới (APPROVED/REJECTED/SHORTLISTED)
   * @returns {Object} Application đã cập nhật
   */
  async changeApplicationStatus(employerId, appId, status) {
    // 1. Update trạng thái (Service xử lý validate + CRUD)
    const application = await applicationService.updateApplicationStatus(appId, employerId, status);

    // 2. Gửi thông báo MULTI-CHANNEL cho ứng viên (Bridge Pattern)
    try {
      const User = (await import('../models/User.js')).default;
      const Job = (await import('../models/Job.js')).default;
      const job = await Job.findById(application.job_id);
      const candidateUser = await User.findById(application.candidate_id);
      
      if (job && candidateUser) {
        // Gửi qua cả Email + SMS → Bridge Pattern hoạt động
        await NotificationFacade.sendApplicationStatusMultiChannel(application, job, candidateUser, status);
      }
    } catch (err) {
      console.error('[RecruitmentFacade] Lỗi gửi thông báo đổi trạng thái:', err);
    }

    return application;
  }
}

export default new RecruitmentFacade();

import ApplicationService from '../services/ApplicationService.js';
import recruitmentFacade from '../facades/RecruitmentFacade.js';
import AppError from '../utils/AppError.js';

/**
 * ApplicationController — HTTP Request Handler
 * 
 * Controller chỉ tiếp nhận HTTP request, extract dữ liệu,
 * và ủy thác xử lý cho Facade hoặc Service:
 * - applyForJob / updateStatus → qua RecruitmentFacade (Façade Pattern)
 *   vì cần phối hợp nhiều subsystem (Service + Notification)
 * - getMyApplications / getEmployerApplications → qua ApplicationService trực tiếp
 *   vì chỉ là CRUD đơn giản, không cần Facade
 */
class ApplicationController {
  /**
   * Ứng tuyển công việc
   * Gọi qua RecruitmentFacade để Facade điều phối:
   * validate → tạo đơn → gửi notification cho Employer
   */
  async applyForJob(req, res, next) {
    try {
      const candidateId = req.user.id;
      const { jobId, cv_id, cover_letter } = req.body;

      if (!jobId) {
        return next(new AppError('Vui lòng cung cấp jobId', 400));
      }

      // Gọi qua Facade thay vì gọi thẳng Service
      const application = await recruitmentFacade.applyForJob(candidateId, jobId, cv_id, cover_letter);

      res.status(201).json({
        status: 'success',
        message: 'Ứng tuyển thành công',
        data: { application }
      });
    } catch (error) {
      next(new AppError(error.message, 400));
    }
  }

  async checkApplied(req, res, next) {
    try {
      const candidateId = req.user.id;
      const { jobId } = req.params;

      if (!jobId) {
        return next(new AppError('Vui lòng cung cấp jobId', 400));
      }

      // Check if Application exists
      const Application = (await import('../models/Application.js')).default;
      const existing = await Application.findOne({ candidate_id: candidateId, job_id: jobId });

      res.status(200).json({
        status: 'success',
        data: {
          applied: !!existing
        }
      });
    } catch (error) {
      next(new AppError(error.message, 400));
    }
  }

  async getMyApplications(req, res, next) {
    try {
      const candidateId = req.user.id;
      const result = await ApplicationService.getApplicationsByCandidate(candidateId, req.query);

      res.status(200).json({
        status: 'success',
        data: result
      });
    } catch (error) {
      next(new AppError(error.message, 400));
    }
  }

  async getEmployerApplications(req, res, next) {
    try {
      const employerId = req.user.id;
      const result = await ApplicationService.getApplicationsByEmployer(employerId, req.query);

      res.status(200).json({
        status: 'success',
        data: result
      });
    } catch (error) {
      next(new AppError(error.message, 400));
    }
  }

  /**
   * Đổi trạng thái đơn ứng tuyển
   * Gọi qua RecruitmentFacade để Facade điều phối:
   * validate → update status → gửi notification multi-channel (Email + SMS)
   */
  async updateStatus(req, res, next) {
    try {
      const employerId = req.user.id;
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return next(new AppError('Vui lòng cung cấp status mới', 400));
      }

      // Gọi qua Facade thay vì gọi thẳng Service
      const application = await recruitmentFacade.changeApplicationStatus(employerId, id, status);

      res.status(200).json({
        status: 'success',
        message: 'Cập nhật trạng thái thành công',
        data: { application }
      });
    } catch (error) {
      next(new AppError(error.message, 400));
    }
  }
}

export default new ApplicationController();

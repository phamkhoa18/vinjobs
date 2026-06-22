import ApplicationService from '../services/ApplicationService.js';
import AppError from '../utils/AppError.js';

class ApplicationController {
  async applyForJob(req, res, next) {
    try {
      const candidateId = req.user.id;
      const { jobId, cv_id, cover_letter } = req.body;

      if (!jobId) {
        return next(new AppError('Vui lòng cung cấp jobId', 400));
      }

      const application = await ApplicationService.applyForJob(jobId, candidateId, { cv_id, cover_letter });

      res.status(201).json({
        status: 'success',
        message: 'Ứng tuyển thành công',
        data: { application }
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

  async updateStatus(req, res, next) {
    try {
      const employerId = req.user.id;
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return next(new AppError('Vui lòng cung cấp status mới', 400));
      }

      const application = await ApplicationService.updateApplicationStatus(id, employerId, status);

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

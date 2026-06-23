import savedJobService from '../services/SavedJobService.js';
import asyncHandler from 'express-async-handler';
import AppError from '../utils/AppError.js';

class SavedJobController {
  toggleSavedJob = asyncHandler(async (req, res, next) => {
    const { jobId } = req.body;
    if (!jobId) {
      return next(new AppError('Vui lòng cung cấp jobId', 400));
    }

    const result = await savedJobService.toggleSavedJob(req.user.id, jobId);
    res.status(200).json({
      status: 'success',
      data: result,
    });
  });

  getMySavedJobs = asyncHandler(async (req, res) => {
    const result = await savedJobService.getMySavedJobs(req.user.id, req.query);
    res.status(200).json({
      status: 'success',
      data: result,
    });
  });

  checkSaved = asyncHandler(async (req, res) => {
    const { jobId } = req.params;
    const isSaved = await savedJobService.checkSaved(req.user.id, jobId);
    res.status(200).json({
      status: 'success',
      data: { isSaved },
    });
  });
}

export default new SavedJobController();

import SavedJob from '../models/SavedJob.js';
import AppError from '../utils/AppError.js';

class SavedJobService {
  async toggleSavedJob(candidateId, jobId) {
    const existing = await SavedJob.findOne({ candidate_id: candidateId, job_id: jobId });
    if (existing) {
      await SavedJob.findByIdAndDelete(existing._id);
      return { saved: false, message: 'Đã bỏ lưu công việc' };
    } else {
      await SavedJob.create({ candidate_id: candidateId, job_id: jobId });
      return { saved: true, message: 'Đã lưu công việc' };
    }
  }

  async getMySavedJobs(candidateId, query) {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const savedJobs = await SavedJob.find({ candidate_id: candidateId })
      .populate({
        path: 'job_id',
        populate: {
          path: 'company_id',
          select: 'name logo province',
        },
      })
      .sort('-saved_at')
      .skip(skip)
      .limit(limit);

    // Filter out jobs that might have been deleted
    const validSavedJobs = savedJobs.filter(sj => sj.job_id);

    const total = await SavedJob.countDocuments({ candidate_id: candidateId });

    return {
      jobs: validSavedJobs.map(sj => sj.job_id),
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  async checkSaved(candidateId, jobId) {
    const existing = await SavedJob.findOne({ candidate_id: candidateId, job_id: jobId });
    return !!existing;
  }
}

export default new SavedJobService();

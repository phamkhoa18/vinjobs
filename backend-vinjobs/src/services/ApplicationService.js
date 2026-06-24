import Application from '../models/Application.js';
import Job from '../models/Job.js';

class ApplicationService {
  async applyForJob(jobId, candidateId, data) {
    const job = await Job.findById(jobId);
    if (!job) throw new Error('Không tìm thấy công việc này');
    if (job.status !== 'APPROVED') throw new Error('Công việc này không mở để ứng tuyển');

    // Check if already applied
    const existing = await Application.findOne({ candidate_id: candidateId, job_id: jobId });
    if (existing) throw new Error('Bạn đã ứng tuyển vào công việc này rồi');

    const application = new Application({
      candidate_id: candidateId,
      job_id: jobId,
      employer_id: job.employer_id,
      cv_id: data.cv_id || undefined,
      cover_letter: data.cover_letter || '',
      status: 'PENDING'
    });

    await application.save();
    
    try {
      const User = (await import('../models/User.js')).default;
      const candidateUser = await User.findById(candidateId);
      const employerUser = await User.findById(job.employer_id);
      if (candidateUser && employerUser) {
        const NotificationFacade = (await import('../patterns/facade/NotificationFacade.js')).default;
        await NotificationFacade.sendNewApplicationNotification(application, candidateUser, job, employerUser);
      }
    } catch (err) {
      console.error('Error sending application notification:', err);
    }

    return application;
  }

  async getApplicationsByCandidate(candidateId, query = {}) {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const applications = await Application.find({ candidate_id: candidateId })
      .populate({
        path: 'job_id',
        select: 'title location salary_min salary_max type level company_id',
        populate: {
          path: 'company_id',
          select: 'name logo'
        }
      })
      .populate('employer_id', 'name email avatar')
      .sort({ applied_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Application.countDocuments({ candidate_id: candidateId });

    return {
      applications,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getApplicationsByEmployer(employerId, query = {}) {
    const { page = 1, limit = 10, status, job_id } = query;
    const skip = (page - 1) * limit;

    const filter = { employer_id: employerId };
    if (status) filter.status = status;
    if (job_id) filter.job_id = job_id;

    const applications = await Application.find(filter)
      .populate('candidate_id', 'name email avatar')
      .populate('job_id', 'title')
      .populate('cv_id')
      .sort({ applied_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Application.countDocuments(filter);

    return {
      applications,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    };
  }

  async updateApplicationStatus(applicationId, employerId, status) {
    const application = await Application.findOne({ _id: applicationId, employer_id: employerId });
    if (!application) throw new Error('Không tìm thấy đơn ứng tuyển hoặc bạn không có quyền');

    application.status = status;
    await application.save();

    try {
      const User = (await import('../models/User.js')).default;
      const job = await Job.findById(application.job_id);
      const candidateUser = await User.findById(application.candidate_id);
      if (job && candidateUser) {
        const NotificationFacade = (await import('../patterns/facade/NotificationFacade.js')).default;
        await NotificationFacade.sendApplicationStatusNotification(application, job, candidateUser, status);
      }
    } catch (err) {
      console.error('Error sending application status notification:', err);
    }

    return application;
  }
}

export default new ApplicationService();

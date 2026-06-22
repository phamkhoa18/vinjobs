import Job from '../models/Job.js';
import AppError from '../utils/AppError.js';

class JobService {
  async createJob(employerId, companyId, data) {
    const job = await Job.create({
      ...data,
      employer_id: employerId,
      company_id: companyId,
      status: 'DRAFT' // Mặc định là nháp khi vừa tạo
    });
    return job;
  }

  async updateJob(employerId, jobId, data) {
    const job = await Job.findOneAndUpdate(
      { _id: jobId, employer_id: employerId },
      data,
      { new: true, runValidators: true }
    );
    if (!job) throw new AppError('Job không tồn tại hoặc bạn không có quyền', 404);
    return job;
  }

  async getJobById(jobId) {
    const job = await Job.findById(jobId).populate('company_id', 'name logo');
    if (!job) throw new AppError('Tin tuyển dụng không tồn tại', 404);
    return job;
  }

  async searchJobs(query) {
    const filter = { status: 'APPROVED' };
    
    // Tìm kiếm văn bản
    if (query.keyword) {
      filter.$text = { $search: query.keyword };
    }
    
    // Lọc cơ bản
    if (query.location) filter.location = new RegExp(query.location, 'i');
    if (query.type) filter.type = query.type;
    if (query.level) filter.level = query.level;
    if (query.category_id) filter.category_id = query.category_id;
    
    // Lọc theo lương (tìm những job có salary_min >= query.min hoặc salary_max >= query.min)
    if (query.minSalary || query.maxSalary) {
      filter.$or = [];
      if (query.minSalary) {
        filter.$or.push({ salary_min: { $gte: Number(query.minSalary) } });
        filter.$or.push({ salary_max: { $gte: Number(query.minSalary) } });
      }
      if (query.maxSalary) {
        filter.$or.push({ salary_min: { $lte: Number(query.maxSalary) } });
        filter.$or.push({ salary_max: { $lte: Number(query.maxSalary) } });
      }
    }

    // Phân trang
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Job.countDocuments(filter);
    
    const jobs = await Job.find(filter)
      .populate('company_id', 'name logo')
      .populate('category_id', 'name slug')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    return {
      jobs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}

export default new JobService();

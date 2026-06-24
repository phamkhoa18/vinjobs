import Job from '../models/Job.js';
import AppError from '../utils/AppError.js';
import mongoose from 'mongoose';

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
    const isValidId = mongoose.Types.ObjectId.isValid(jobId);
    const query = isValidId ? { $or: [{ _id: jobId }, { slug: jobId }] } : { slug: jobId };
    
    const job = await Job.findOneAndUpdate(query, { $inc: { views: 1 } }, { new: true })
      .populate('category_id', 'name slug icon icon_color bg_color')
      .populate('company_id', 'name logo')
      .populate('employer_id', 'name email phone avatar');
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
    if (query.company_id) filter.company_id = query.company_id;
    
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
      .populate('company_id', 'name logo location industry')
      .populate('category_id', 'name slug icon icon_color bg_color')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    return {
      jobs,
      pagination: {
        total,
        page: parseInt(query.page, 10) || 1,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getTopCategories() {
    // Lấy tất cả danh mục active
    const Category = (await import('../models/Category.js')).default;
    const categories = await Category.find({ is_active: true });

    // Đếm số lượng job (APPROVED) cho mỗi category
    const jobCounts = await Job.aggregate([
      { $match: { status: 'APPROVED' } },
      { $group: { _id: '$category_id', count: { $sum: 1 } } }
    ]);

    const countMap = {};
    jobCounts.forEach(c => {
      if (c._id) countMap[c._id.toString()] = c.count;
    });

    const result = categories.map(cat => ({
      _id: cat._id,
      name: cat.name,
      slug: cat.slug,
      icon: cat.icon,
      custom_svg: cat.custom_svg,
      icon_color: cat.icon_color,
      bg_color: cat.bg_color,
      count: countMap[cat._id.toString()] || 0
    })).sort((a, b) => b.count - a.count);

    return result;
  }
}

export default new JobService();

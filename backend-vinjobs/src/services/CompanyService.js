import Company from '../models/Company.js';
import Job from '../models/Job.js';
import AppError from '../utils/AppError.js';
import mongoose from 'mongoose';

/**
 * CompanyService — Singleton Pattern (qua Module Caching)
 * 
 * Service xử lý CRUD cho công ty, tìm kiếm và thống kê top công ty.
 * Sử dụng `export default new CompanyService()` — đảm bảo chỉ có 1 instance
 * duy nhất trong toàn bộ ứng dụng (Singleton Pattern).
 */
class CompanyService {
  async createCompany(employerId, data) {
    const existingCompany = await Company.findOne({ employer_id: employerId });
    if (existingCompany) {
      throw new AppError('Bạn đã có công ty, không thể tạo thêm', 400);
    }

    const company = await Company.create({
      ...data,
      employer_id: employerId,
      status: 'PENDING'
    });
    return company;
  }

  async updateCompany(employerId, data) {
    const company = await Company.findOneAndUpdate(
      { employer_id: employerId },
      data,
      { new: true, runValidators: true }
    );

    if (!company) {
      throw new AppError('Chưa tìm thấy thông tin công ty của bạn', 404);
    }
    return company;
  }

  async getCompanyByEmployer(employerId) {
    return await Company.findOne({ employer_id: employerId });
  }

  async verifyCompany(adminId, companyId, status) {
    // Admin action
    const company = await Company.findByIdAndUpdate(
      companyId,
      { status },
      { new: true }
    );
    if (!company) throw new AppError('Công ty không tồn tại', 404);
    return company;
  }

  async getCompanies(query) {
    const filter = { status: 'ACTIVE' };

    if (query.keyword) {
      filter.$text = { $search: query.keyword };
    }
    if (query.industry) filter.industry = query.industry;

    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Company.countDocuments(filter);
    
    const companies = await Company.find(filter)
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    return {
      companies,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getCompanyById(companyId) {
    const isValidId = mongoose.Types.ObjectId.isValid(companyId);
    const query = isValidId ? { $or: [{ _id: companyId }, { slug: companyId }] } : { slug: companyId };
    
    const company = await Company.findOne(query);
    if (!company) throw new AppError('Công ty không tồn tại', 404);

    // Lấy thêm danh sách việc làm đang mở của công ty
    const activeJobs = await Job.find({ 
      company_id: company._id, 
      status: 'APPROVED' 
    }).sort('-createdAt').limit(10);

    return { company, activeJobs };
  }
  async getTopCompanies(limit = 10) {
    // Tìm các công ty ACTIVE
    const companies = await Company.find({ status: 'ACTIVE' });
    
    // Đếm số job APPROVED cho từng company
    const jobCounts = await Job.aggregate([
      { $match: { status: 'APPROVED' } },
      { $group: { _id: '$company_id', count: { $sum: 1 } } }
    ]);

    const countMap = {};
    jobCounts.forEach(c => {
      if (c._id) countMap[c._id.toString()] = c.count;
    });

    const result = companies.map(comp => {
      const companyObj = comp.toObject();
      companyObj.jobs = countMap[comp._id.toString()] || 0;
      return companyObj;
    }).sort((a, b) => b.jobs - a.jobs).slice(0, limit);

    return result;
  }
}

export default new CompanyService();

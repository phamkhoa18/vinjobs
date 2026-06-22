import Company from '../models/Company.js';
import Job from '../models/Job.js';
import AppError from '../utils/AppError.js';

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
    const company = await Company.findById(companyId);
    if (!company) throw new AppError('Công ty không tồn tại', 404);

    // Lấy thêm danh sách việc làm đang mở của công ty
    const activeJobs = await Job.find({ 
      company_id: companyId, 
      status: 'APPROVED' 
    }).sort('-createdAt').limit(10);

    return { company, activeJobs };
  }
}

export default new CompanyService();

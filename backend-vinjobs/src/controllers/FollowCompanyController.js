import asyncHandler from 'express-async-handler';
import FollowCompany from '../models/FollowCompany.js';
import Company from '../models/Company.js';
import AppError from '../utils/AppError.js';
import mongoose from 'mongoose';

class FollowCompanyController {
  // POST /api/v1/companies/:id/follow
  toggleFollow = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;
    const companyIdOrSlug = req.params.id;

    // Tìm công ty theo id hoặc slug
    const isValidId = mongoose.Types.ObjectId.isValid(companyIdOrSlug);
    const query = isValidId ? { $or: [{ _id: companyIdOrSlug }, { slug: companyIdOrSlug }] } : { slug: companyIdOrSlug };
    const company = await Company.findOne(query);

    if (!company) {
      return next(new AppError('Không tìm thấy công ty', 404));
    }

    const companyId = company._id;

    const existingFollow = await FollowCompany.findOne({
      user_id: userId,
      company_id: companyId,
    });

    if (existingFollow) {
      // Đã follow -> Hủy follow
      await FollowCompany.findByIdAndDelete(existingFollow._id);
      return res.status(200).json({
        status: 'success',
        message: 'Đã bỏ theo dõi công ty',
        data: { followed: false },
      });
    } else {
      // Chưa follow -> Thêm follow
      await FollowCompany.create({
        user_id: userId,
        company_id: companyId,
      });
      return res.status(201).json({
        status: 'success',
        message: 'Đã theo dõi công ty',
        data: { followed: true },
      });
    }
  });

  // GET /api/v1/companies/:id/check-follow
  checkFollow = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;
    const companyIdOrSlug = req.params.id;

    const isValidId = mongoose.Types.ObjectId.isValid(companyIdOrSlug);
    const query = isValidId ? { $or: [{ _id: companyIdOrSlug }, { slug: companyIdOrSlug }] } : { slug: companyIdOrSlug };
    const company = await Company.findOne(query);

    if (!company) {
      return next(new AppError('Không tìm thấy công ty', 404));
    }

    const follow = await FollowCompany.findOne({
      user_id: userId,
      company_id: company._id,
    });

    res.status(200).json({
      status: 'success',
      data: { followed: !!follow },
    });
  });
}

export default new FollowCompanyController();

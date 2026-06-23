import express from 'express';
import asyncHandler from 'express-async-handler';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';
import Company from '../models/Company.js';
import User from '../models/User.js';
import Job from '../models/Job.js';
import AppError from '../utils/AppError.js';

import companyController from '../controllers/CompanyController.js';
import followCompanyController from '../controllers/FollowCompanyController.js';

const router = express.Router();

// ============ PUBLIC ROUTES ============

// GET /api/v1/companies/top - Get top companies
router.get('/top', companyController.getTopCompanies);

// GET /api/v1/companies - List companies
router.get('/', companyController.getCompanies);

// GET /api/v1/companies/:id - Get company detail + jobs
router.get('/:id', companyController.getCompany);

// ============ PROTECTED ROUTES (CANDIDATE & OTHERS) ============

// POST /api/v1/companies/:id/follow - Toggle follow company
router.post('/:id/follow', protect, followCompanyController.toggleFollow);

// GET /api/v1/companies/:id/check-follow - Check follow status
router.get('/:id/check-follow', protect, followCompanyController.checkFollow);

// ============ PROTECTED ROUTES (EMPLOYER) ============
router.use(protect, restrictTo('EMPLOYER', 'ADMIN'));

// GET /api/v1/companies/me - Get my company
router.get('/employer/mine', asyncHandler(async (req, res) => {
  const company = await Company.findOne({ employer_id: req.user.id });
  
  res.status(200).json({
    status: 'success',
    data: { company },
  });
}));

// POST /api/v1/companies - Create company
router.post('/', restrictTo('EMPLOYER'), asyncHandler(async (req, res, next) => {
  const existing = await Company.findOne({ employer_id: req.user.id });
  if (existing) {
    return next(new AppError('Bạn đã có trang công ty. Vui lòng chỉnh sửa thay vì tạo mới.', 400));
  }

  const company = await Company.create({
    ...req.body,
    employer_id: req.user.id,
    status: 'PENDING',
  });

  res.status(201).json({
    status: 'success',
    message: 'Tạo công ty thành công, đang chờ duyệt',
    data: { company },
  });
}));

// PUT /api/v1/companies/verify - Nộp hồ sơ xác minh công ty
router.put('/verify', restrictTo('EMPLOYER'), asyncHandler(async (req, res, next) => {
  const { business_license, taxCode, name, ...rest } = req.body;
  if (!business_license || !taxCode || !name) {
    return next(new AppError('Vui lòng cung cấp Tên công ty, Mã số thuế và Giấy phép kinh doanh', 400));
  }

  const company = await Company.findOneAndUpdate(
    { employer_id: req.user.id },
    { 
      business_license, 
      taxCode, 
      name,
      ...rest,
      status: 'PENDING' // Trở lại trạng thái chờ duyệt nếu đang là REJECTED
    },
    { new: true, runValidators: true, upsert: true }
  );

  // Cập nhật lại status của user thành PENDING nếu user đang bị REJECTED
  await User.findByIdAndUpdate(req.user.id, { status: 'PENDING' });

  res.status(200).json({
    status: 'success',
    message: 'Đã gửi yêu cầu xác minh. Vui lòng chờ quản trị viên phê duyệt.',
    data: { company }
  });
}));

// PATCH /api/v1/companies/:id - Update company
router.patch('/:id', asyncHandler(async (req, res, next) => {
  const filter = req.user.role === 'ADMIN'
    ? { _id: req.params.id }
    : { _id: req.params.id, employer_id: req.user.id };

  const company = await Company.findOneAndUpdate(filter, req.body, { new: true, runValidators: true });
  if (!company) return next(new AppError('Công ty không tồn tại hoặc bạn không có quyền', 404));

  res.status(200).json({
    status: 'success',
    data: { company },
  });
}));

export default router;

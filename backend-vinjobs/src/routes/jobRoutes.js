import express from 'express';
import asyncHandler from 'express-async-handler';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';
import Job from '../models/Job.js';
import Company from '../models/Company.js';
import AppError from '../utils/AppError.js';

import jobController from '../controllers/JobController.js';

const router = express.Router();

// ============ PUBLIC ROUTES ============

// GET /api/v1/jobs/categories - Get top categories with job counts
router.get('/categories', jobController.getCategories);

// GET /api/v1/jobs - Search/List jobs
router.get('/', jobController.searchJobs);

// GET /api/v1/jobs/:id - Get single job
router.get('/:id', jobController.getJob);

// ============ PROTECTED ROUTES (EMPLOYER) ============
router.use(protect);

// GET /api/v1/jobs/employer/mine - Get employer's own jobs
router.get('/employer/mine', restrictTo('EMPLOYER'), asyncHandler(async (req, res) => {
  const jobs = await Job.find({ employer_id: req.user.id })
    .populate('company_id', 'name logo')
    .sort('-createdAt');

  res.status(200).json({
    status: 'success',
    results: jobs.length,
    data: { jobs },
  });
}));

// POST /api/v1/jobs - Create new job
router.post('/', restrictTo('EMPLOYER', 'ADMIN'), asyncHandler(async (req, res, next) => {
  // Find employer's company
  const company = await Company.findOne({ employer_id: req.user.id });
  if (!company) {
    return next(new AppError('Bạn chưa có thông tin công ty. Vui lòng tạo hồ sơ công ty trước.', 400));
  }

  const job = await Job.create({
    ...req.body,
    employer_id: req.user.id,
    company_id: company._id,
    status: 'PENDING',
  });

  // Notify admins
  try {
    const NotificationFacade = (await import('../patterns/facade/NotificationFacade.js')).default;
    await NotificationFacade.sendNewJobNotification(job, company);
  } catch (err) {
    console.error('Lỗi khi gửi thông báo job mới:', err);
  }

  res.status(201).json({
    status: 'success',
    message: 'Đăng tin thành công, đang chờ duyệt',
    data: { job },
  });
}));

// PATCH /api/v1/jobs/:id - Update job
router.patch('/:id', restrictTo('EMPLOYER', 'ADMIN'), asyncHandler(async (req, res, next) => {
  const filter = req.user.role === 'ADMIN'
    ? { _id: req.params.id }
    : { _id: req.params.id, employer_id: req.user.id };

  const job = await Job.findOneAndUpdate(filter, req.body, { new: true, runValidators: true });
  if (!job) return next(new AppError('Tin không tồn tại hoặc bạn không có quyền chỉnh sửa', 404));

  res.status(200).json({
    status: 'success',
    data: { job },
  });
}));

// DELETE /api/v1/jobs/:id - Delete job
router.delete('/:id', restrictTo('EMPLOYER', 'ADMIN'), asyncHandler(async (req, res, next) => {
  const filter = req.user.role === 'ADMIN'
    ? { _id: req.params.id }
    : { _id: req.params.id, employer_id: req.user.id };

  const job = await Job.findOneAndDelete(filter);
  if (!job) return next(new AppError('Tin không tồn tại hoặc bạn không có quyền xoá', 404));

  res.status(204).json({ status: 'success', data: null });
}));

export default router;

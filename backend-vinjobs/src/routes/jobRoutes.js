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
  const Application = (await import('../models/Application.js')).default;
  const jobsRaw = await Job.find({ employer_id: req.user.id })
    .populate('company_id', 'name logo')
    .sort('-createdAt')
    .lean();

  const jobs = await Promise.all(jobsRaw.map(async (job) => {
    const applicantsCount = await Application.countDocuments({ job_id: job._id });
    return { ...job, applicantsCount };
  }));

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
    const NotificationFacade = (await import('../facades/NotificationFacade.js')).default;
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

  // BẢO MẬT: Whitelist fields cho phép — chống Mass Assignment
  const allowedFields = ['title', 'description', 'requirements', 'benefits', 'location', 
    'province_code', 'salary_min', 'salary_max', 'type', 'level', 'category_id',
    'deadline', 'experience', 'quantity', 'skills', 'gender', 'age_range'];
  const filteredBody = {};
  Object.keys(req.body).forEach(key => {
    if (allowedFields.includes(key)) filteredBody[key] = req.body[key];
  });

  const job = await Job.findOneAndUpdate(filter, filteredBody, { new: true, runValidators: true });
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

  // Check if job exists and belongs to user (or is admin)
  const job = await Job.findOne(filter);
  if (!job) return next(new AppError('Tin không tồn tại hoặc bạn không có quyền xoá', 404));

  if (job.status === 'APPROVED' || job.status === 'PENDING') {
    return next(new AppError('Không thể xoá tin đang chờ duyệt hoặc đang mở. Vui lòng chuyển trạng thái sang "Đóng" tin trước.', 400));
  }

  const Application = (await import('../models/Application.js')).default;
  const SavedJob = (await import('../models/SavedJob.js')).default;

  // Cascade delete all associated data
  await Application.deleteMany({ job_id: job._id });
  await SavedJob.deleteMany({ job_id: job._id });
  await Job.findByIdAndDelete(job._id);

  res.status(204).json({ status: 'success', data: null });
}));

export default router;

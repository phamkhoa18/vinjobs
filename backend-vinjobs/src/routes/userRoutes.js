import express from 'express';
import asyncHandler from 'express-async-handler';
import { protect } from '../middlewares/authMiddleware.js';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// GET /api/v1/users/me - Get current user profile
router.get('/me', asyncHandler(async (req, res) => {
  res.status(200).json({
    status: 'success',
    data: { user: req.user },
  });
}));

import Application from '../models/Application.js';
import CV from '../models/CV.js';
import SavedJob from '../models/SavedJob.js';

// GET /api/v1/users/me/candidate-stats
router.get('/me/candidate-stats', asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const [applications, pending, interview, cvs, savedJobs, recentApplications] = await Promise.all([
    Application.countDocuments({ candidate_id: userId }),
    Application.countDocuments({ candidate_id: userId, status: 'PENDING' }),
    Application.countDocuments({ candidate_id: userId, status: 'INTERVIEW' }),
    CV.countDocuments({ candidate_id: userId }),
    SavedJob.countDocuments({ candidate_id: userId }),
    Application.find({ candidate_id: userId })
      .populate('job_id', 'title salary_min salary_max company_id')
      .sort('-applied_at')
      .limit(5)
  ]);

  // populate company for recent applications
  await Application.populate(recentApplications, {
    path: 'job_id.company_id',
    select: 'name logo province',
    model: 'Company'
  });

  res.status(200).json({
    status: 'success',
    data: {
      stats: {
        applications,
        pending,
        interview,
        cvs,
        savedJobs,
        profileViews: 0 // Mock for now
      },
      recentApplications
    }
  });
}));

// PATCH /api/v1/users/me - Update current user profile
router.patch('/me', asyncHandler(async (req, res) => {
  const { name, phone, avatar, profile } = req.body;
  
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { name, phone, avatar, profile },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: 'success',
    data: { user },
  });
}));

// PATCH /api/v1/users/me/password - Change password
router.patch('/me/password', asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(new AppError('Vui lòng cung cấp mật khẩu hiện tại và mới', 400));
  }

  if (newPassword.length < 8) {
    return next(new AppError('Mật khẩu mới phải có ít nhất 8 ký tự', 400));
  }

  const user = await User.findById(req.user.id).select('+password');
  
  if (!(await user.correctPassword(currentPassword, user.password))) {
    return next(new AppError('Mật khẩu hiện tại không đúng', 401));
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Đổi mật khẩu thành công',
  });
}));

// GET /api/v1/users/me/notifications - Get user notifications
import Notification from '../models/Notification.js';

router.get('/me/notifications', asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user_id: req.user.id })
    .sort('-createdAt')
    .limit(20);

  const unreadCount = await Notification.countDocuments({ user_id: req.user.id, is_read: false });

  res.status(200).json({
    status: 'success',
    data: { notifications, unreadCount }
  });
}));

// PATCH /api/v1/users/me/notifications/read-all - Mark all as read
router.patch('/me/notifications/read-all', asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { user_id: req.user.id, is_read: false },
    { is_read: true }
  );

  res.status(200).json({
    status: 'success',
    message: 'Đã đánh dấu tất cả là đã đọc'
  });
}));

export default router;

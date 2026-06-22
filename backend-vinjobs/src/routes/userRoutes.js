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

export default router;

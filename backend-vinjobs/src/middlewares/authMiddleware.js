import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import asyncHandler from 'express-async-handler';

export const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new AppError('Bạn chưa đăng nhập! Vui lòng đăng nhập để truy cập.', 401));
  }

  // 2. Verification token
  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET || 'vinjobs-secret-key-2026'
  );

  // 3. Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('Người dùng không còn tồn tại.', 401));
  }

  // Cấp quyền truy cập vào route
  req.user = currentUser;
  next();
});

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Bạn không có quyền thực hiện hành động này', 403));
    }
    next();
  };
};

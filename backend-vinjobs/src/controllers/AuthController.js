import authService from '../services/AuthService.js';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import { env } from '../config/env.js';

const createSendToken = (user, accessToken, refreshToken, statusCode, res) => {
  const cookieOptions = {
    expires: new Date(
      Date.now() + parseInt(process.env.JWT_REFRESH_COOKIE_EXPIRES_IN || 7) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    sameSite: 'lax',
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt_refresh', refreshToken, cookieOptions);

  res.status(statusCode).json({
    status: 'success',
    token: accessToken,
    data: { user },
  });
};

class AuthController {
  register = asyncHandler(async (req, res, next) => {
    const result = await authService.register(req.body);
    
    // Nếu kết quả trả về requires_verification thì trả thẳng
    if (result.requires_verification) {
      return res.status(200).json({
        status: 'success',
        ...result
      });
    }

    // Nếu không (trường hợp cũ), cấp token
    createSendToken(result.user, result.accessToken, result.refreshToken, 201, res);
  });

  checkEmail = asyncHandler(async (req, res, next) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ status: 'fail', message: 'Vui lòng cung cấp email!' });
    }
    const user = await User.findOne({ email });
    if (user && user.status !== 'UNVERIFIED') {
      return res.status(200).json({ status: 'success', exists: true });
    }
    return res.status(200).json({ status: 'success', exists: false });
  });

  verifyEmail = asyncHandler(async (req, res, next) => {
    const { email, otp, companyData } = req.body;
    const { user, accessToken, refreshToken } = await authService.verifyEmail(email, otp, companyData);
    createSendToken(user, accessToken, refreshToken, 200, res);
  });

  resendOTP = asyncHandler(async (req, res, next) => {
    const { email } = req.body;
    const result = await authService.resendOTP(email);
    res.status(200).json({
      status: 'success',
      ...result
    });
  });

  login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await authService.login(email, password);
    createSendToken(user, accessToken, refreshToken, 200, res);
  });

  logout = (req, res) => {
    res.cookie('jwt_refresh', 'loggedout', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
      sameSite: 'lax',
    });
    res.status(200).json({ status: 'success' });
  };

  googleLogin = asyncHandler(async (req, res, next) => {
    const { idToken, role } = req.body;
    const result = await authService.googleLogin(idToken, role);
    
    if (result.requires_password) {
      return res.status(200).json({
        status: 'success',
        ...result
      });
    }

    createSendToken(result.user, result.accessToken, result.refreshToken, 200, res);
  });

  googleRegister = asyncHandler(async (req, res, next) => {
    const { idToken, password, role } = req.body;
    const { user, accessToken, refreshToken } = await authService.googleRegister(idToken, password, role);
    createSendToken(user, accessToken, refreshToken, 201, res);
  });

  forgotPassword = asyncHandler(async (req, res, next) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ status: 'fail', message: 'Vui lòng cung cấp email!' });
    }
    const result = await authService.forgotPassword(email);
    res.status(200).json({
      status: 'success',
      ...result
    });
  });

  resetPassword = asyncHandler(async (req, res, next) => {
    const { password } = req.body;
    if (!password || password.length < 8) {
      return res.status(400).json({ status: 'fail', message: 'Mật khẩu mới phải có ít nhất 8 ký tự.' });
    }
    const { user, accessToken, refreshToken } = await authService.resetPassword(req.params.token, password);
    createSendToken(user, accessToken, refreshToken, 200, res);
  });

  // --- REFRESH TOKEN ---
  refreshToken = asyncHandler(async (req, res, next) => {
    const refreshToken = req.cookies.jwt_refresh;

    if (!refreshToken) {
      return next(new AppError('Không tìm thấy Refresh Token. Vui lòng đăng nhập lại.', 401));
    }

    try {
      // Xác thực Refresh Token — BẢO MẬT: Dùng env, không fallback
      const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);

      // Kiểm tra user còn tồn tại không
      const user = await User.findById(decoded.id);
      if (!user) {
        return next(new AppError('Người dùng không tồn tại.', 401));
      }

      // Check status
      if (user.status === 'BLOCKED') {
        return next(new AppError('Tài khoản đã bị khóa.', 403));
      }

      // Cấp Access Token mới — BẢO MẬT: Dùng env, không fallback
      const newAccessToken = jwt.sign(
        { id: user._id },
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRES_IN }
      );

      res.status(200).json({
        status: 'success',
        token: newAccessToken,
      });

    } catch (err) {
      return next(new AppError('Refresh Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.', 401));
    }
  });

  getMe = asyncHandler(async (req, res, next) => {
    const user = await authService.getUserById(req.user.id);
    
    res.status(200).json({
      status: 'success',
      data: { user }
    });
  });
}

export default new AuthController();

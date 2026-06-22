import rateLimit from 'express-rate-limit';

// Giới hạn số lần đăng nhập sai (Brute-force protection)
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 5, // Mỗi IP chỉ được thử 5 lần trong 15 phút
  message: {
    status: 'fail',
    message: 'Bạn đã đăng nhập sai quá nhiều lần. Vui lòng thử lại sau 15 phút!',
  },
  standardHeaders: true, 
  legacyHeaders: false,
});

// Giới hạn số lần đăng ký tài khoản (Spam/Bot protection)
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 giờ
  max: 3, // Mỗi IP chỉ được đăng ký 3 tài khoản trong 1 giờ
  message: {
    status: 'fail',
    message: 'Bạn đã đăng ký quá nhiều tài khoản. Vui lòng thử lại sau 1 giờ!',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Giới hạn gửi OTP (Spam SMS/Email protection)
export const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 phút
  max: 3, // Mỗi IP chỉ được gửi mã OTP 3 lần mỗi 10 phút
  message: {
    status: 'fail',
    message: 'Bạn đã yêu cầu gửi mã xác nhận quá nhiều lần. Vui lòng đợi 10 phút!',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Giới hạn số lần nhập sai OTP
export const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 5, // Mỗi IP chỉ được thử 5 lần
  message: {
    status: 'fail',
    message: 'Bạn đã nhập sai mã xác nhận quá nhiều lần. Vui lòng thử lại sau 15 phút!',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

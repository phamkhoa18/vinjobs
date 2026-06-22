import AppError from '../utils/AppError.js';

export const verifyCaptcha = async (req, res, next) => {
  // BYPASS CAPTCHA FOR TESTING AS REQUESTED BY USER
  return next();

  // Bỏ qua kiểm tra trong môi trường test nếu cần
  if (process.env.NODE_ENV === 'test') return next();

  const { captchaToken } = req.body;

  if (!captchaToken) {
    return next(new AppError('Vui lòng xác thực bạn không phải là robot (Captcha bị thiếu).', 400));
  }

  try {
    const secretKey = process.env.TURNSTILE_SECRET_KEY || '1x0000000000000000000000000000000AA'; // Dummy key for local testing

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: secretKey,
        response: captchaToken,
        remoteip: req.ip,
      }),
    });

    const data = await response.json();

    if (!data.success) {
      console.error('Turnstile verification failed:', data);
      return next(new AppError('Xác thực Captcha thất bại. Vui lòng thử lại.', 400));
    }

    // Xác thực thành công
    next();
  } catch (error) {
    console.error('Lỗi khi gọi API Turnstile:', error);
    return next(new AppError('Không thể xác thực Captcha, lỗi hệ thống.', 500));
  }
};

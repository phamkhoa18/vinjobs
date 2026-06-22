import express from 'express';
import authController from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { loginLimiter, registerLimiter, otpLimiter, otpVerifyLimiter } from '../middlewares/rateLimiter.js';
import { verifyCaptcha } from '../middlewares/captchaMiddleware.js';

const router = express.Router();

router.post('/register', registerLimiter, verifyCaptcha, authController.register);
router.post('/login', loginLimiter, verifyCaptcha, authController.login);
router.post('/verify-email', otpVerifyLimiter, authController.verifyEmail);
router.post('/resend-otp', otpLimiter, authController.resendOTP);
router.post('/google', loginLimiter, authController.googleLogin);
router.post('/google/register', registerLimiter, authController.googleRegister);
router.post('/check-email', authController.checkEmail);
router.post('/logout', authController.logout);
router.post('/refresh-token', authController.refreshToken);
router.post('/forgot-password', otpLimiter, authController.forgotPassword);
router.patch('/reset-password/:token', authController.resetPassword);
// Tất cả các route bên dưới protect đều yêu cầu login
router.use(protect);

router.get('/me', authController.getMe);

export default router;

import express from 'express';
import uploadController from '../controllers/uploadController.js';
import { upload } from '../middlewares/uploadMiddleware.js';
import { protect } from '../middlewares/authMiddleware.js';
import { uploadLimiter } from '../middlewares/uploadRateLimiter.js';

const router = express.Router();

// Chỉ những người dùng đã đăng nhập mới được phép upload ảnh
router.use(protect);

// Áp dụng Rate Limiting để chống Spam Upload (Gây quá tải CPU)
router.use(uploadLimiter);

// Nhận file ảnh qua field name là 'image'
router.post('/image', upload.single('image'), uploadController.uploadImage);

export default router;

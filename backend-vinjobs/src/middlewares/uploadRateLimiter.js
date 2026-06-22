import rateLimit from 'express-rate-limit';

// Giới hạn số lượng upload hình ảnh để chống DoS/DDoS làm nghẽn CPU server
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 20, // Tối đa 20 lần upload mỗi IP trong 15 phút
  message: {
    status: 'error',
    message: 'Bạn đã upload quá nhiều ảnh. Vui lòng đợi 15 phút sau rồi thử lại.',
  },
  standardHeaders: true, 
  legacyHeaders: false, 
});

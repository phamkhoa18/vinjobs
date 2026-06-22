import multer from 'multer';
import AppError from '../utils/AppError.js';

// Lưu file vào bộ nhớ đệm (RAM) dưới dạng Buffer để Sharp xử lý
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  console.log(`[Multer] Đang kiểm tra định dạng file: ${file.originalname} (${file.mimetype})`);
  
  // BẢO MẬT: Hỗ trợ JPG, PNG, WebP, SVG và PDF
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml', 'application/pdf'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    console.log(`[Multer] TỪ CHỐI FILE: ${file.mimetype} không hợp lệ!`);
    cb(new AppError(`Định dạng ${file.mimetype} không an toàn! Chỉ hỗ trợ JPG, PNG, WebP, SVG và PDF.`, 400), false);
  }
};

// Khởi tạo multer (Giới hạn dung lượng max 5MB)
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

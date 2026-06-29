import asyncHandler from 'express-async-handler';
import imageService from '../services/ImageService.js';
import AppError from '../utils/AppError.js';
import User from '../models/User.js';

class UploadController {
  /**
   * Upload hình ảnh chung (hoặc Avatar)
   * Trả về đường dẫn hình ảnh đã được lưu và nén thành WebP
   */
  uploadImage = asyncHandler(async (req, res, next) => {
    console.log('========== BẮT ĐẦU UPLOAD ẢNH ==========');
    console.log('- Body:', req.body);
    console.log('- File info:', req.file ? {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    } : 'KHÔNG CÓ FILE');

    if (!req.file) {
      return next(new AppError('Vui lòng chọn một file ảnh để tải lên.', 400));
    }

    // Nếu người dùng up từ tính năng Avatar thì crop vuông
    const isAvatar = req.body.isAvatar === 'true';

    // Gọi ImageService để xử lý ảnh hoặc PDF
    const imageUrl = await imageService.processAndSaveImage(req.file.buffer, {
      mimetype: req.file.mimetype,
      isAvatar: isAvatar,
      maxWidth: 1200
    });

    // Nếu request yêu cầu cập nhật luôn vào profile đang login
    if (req.body.updateProfile === 'true' && req.user) {
      const user = await User.findById(req.user.id);
      if (user) {
        user.avatar = imageUrl; // Cập nhật avatar url mới
        await user.save({ validateBeforeSave: false });
        console.log('- Đã cập nhật ảnh vào Profile User:', user.email);
      }
    }

    console.log('========== UPLOAD THÀNH CÔNG ==========\n');

    res.status(200).json({
      status: 'success',
      message: 'Tải ảnh lên thành công',
      data: {
        url: imageUrl
      }
    });
  });

  /**
   * Upload tài liệu (PDF, DOC, DOCX)
   */
  uploadDocument = asyncHandler(async (req, res, next) => {
    try {
      if (!req.file) {
        return next(new AppError('Vui lòng chọn một file tài liệu để tải lên.', 400));
      }

      const fileUrl = await imageService.processAndSaveImage(req.file.buffer, {
        mimetype: req.file.mimetype
      });

      res.status(200).json({
        status: 'success',
        message: 'Tải tài liệu lên thành công',
        data: {
          url: fileUrl
        }
      });
    } catch (error) {
      console.error('[uploadDocument] Error:', error);
      // BẢO MẬT: Không trả về stack trace cho client
      res.status(500).json({
        status: 'error',
        message: 'Có lỗi xảy ra khi tải tài liệu. Vui lòng thử lại.'
      });
    }
  });
}

export default new UploadController();

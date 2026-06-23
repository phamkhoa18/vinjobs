import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

class ImageService {
  constructor() {
    // Thư mục lưu trữ ảnh gốc
    this.uploadDir = path.resolve('public', 'uploads', 'images');
    
    // Đảm bảo thư mục tồn tại, nếu chưa có thì tạo mới
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Xử lý file ảnh buffer (nén sang webp và resize nếu cần)
   * @param {Buffer} buffer - Dữ liệu ảnh từ multer
   * @param {Object} options - Các tùy chọn (width, height, isAvatar)
   * @returns {string} - Đường dẫn file đã lưu
   */
  async processAndSaveImage(buffer, options = {}) {
    let extension = 'webp';
    if (options.mimetype === 'image/svg+xml') extension = 'svg';
    else if (options.mimetype === 'application/pdf') extension = 'pdf';
    else if (options.mimetype === 'application/msword') extension = 'doc';
    else if (options.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') extension = 'docx';

    const isDoc = ['pdf', 'doc', 'docx'].includes(extension);
    const prefix = isDoc ? 'doc' : 'img';
    const filename = `${prefix}-${uuidv4()}-${Date.now()}.${extension}`;
    const filepath = path.join(this.uploadDir, filename);

    try {
      if (options.mimetype === 'image/svg+xml' || isDoc) {
        // Đối với SVG và Document, chúng ta không dùng Sharp
        // Mà ghi trực tiếp ra đĩa
        fs.writeFileSync(filepath, buffer);
        return `/uploads/images/${filename}`;
      }

      // Khởi tạo pipe của Sharp cho các định dạng khác
      let sharpInstance = sharp(buffer);

      // Resize ảnh nếu có yêu cầu (vd: Avatar thì resize nhỏ hình vuông)
      if (options.isAvatar) {
        sharpInstance = sharpInstance.resize(400, 400, {
          fit: 'cover', // Cắt ảnh thừa để đảm bảo lấp đầy 400x400
          position: 'center'
        });
      } else if (options.maxWidth) {
        // Dành cho ảnh thường (cover, banner) nhưng ko được to quá mức
        sharpInstance = sharpInstance.resize(options.maxWidth, null, {
          withoutEnlargement: true // Tránh việc làm mờ ảnh nếu ảnh gốc nhỏ hơn maxWidth
        });
      }

      // Convert sang định dạng WebP siêu nhẹ, chất lượng 80% (đẹp và nhẹ)
      await sharpInstance
        .webp({ quality: 80 })
        .toFile(filepath);

      // Trả về relative path để lưu vào Database
      return `/uploads/images/${filename}`;
    } catch (error) {
      console.error('[Sharp] LỖI BIẾN ĐỔI ẢNH:', error);
      // BẢO MẬT: Nếu Sharp không đọc được buffer, tức là file bị hỏng 
      // hoặc hacker đang cố tình giấu mã độc (PHP/JS Shell) vào trong file ảnh.
      throw new Error('File bị hỏng hoặc chứa nội dung không an toàn!');
    }
  }
}

export default new ImageService();

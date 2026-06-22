import imageCompression from 'browser-image-compression';
import { uploadApi } from '../lib/api';
import toast from 'react-hot-toast';

class ImageUploadService {
  /**
   * Nén ảnh ở phía Client (Frontend) trước khi gửi
   * @param {File} file - File ảnh gốc
   * @param {Object} options - Tùy chọn nén
   * @returns {Promise<File>} - File đã nén
   */
  async compressImage(file, options = {}) {
    const defaultOptions = {
      maxSizeMB: 1, // Mặc định nén xuống dưới 1MB
      maxWidthOrHeight: 1024,
      useWebWorker: true,
      ...options
    };

    try {
      // Bỏ qua nén nếu file quá nhẹ (dưới 100KB) hoặc không phải định dạng ảnh tiêu chuẩn
      if (file.size < 100 * 1024 || !file.type.startsWith('image/')) {
        return file;
      }

      console.log(`Bắt đầu nén ảnh... Gốc: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
      const compressedFile = await imageCompression(file, defaultOptions);
      console.log(`Đã nén xong! Mới: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);
      
      return compressedFile;
    } catch (error) {
      console.error('Lỗi khi nén ảnh:', error);
      // Nếu lỗi nén thì trả về file gốc để upload cho an toàn
      return file;
    }
  }

  /**
   * Upload ảnh Avatar (Nén cục bộ -> Gọi API upload -> Lấy link WebP)
   * @param {File} file - File người dùng chọn
   * @param {boolean} updateProfile - Tự động cập nhật DB Profile user đang login?
   * @returns {Promise<string>} - Đường link URL của ảnh WebP đã xử lý
   */
  async uploadAvatar(file, updateProfile = false) {
    try {
      // 1. Nén file để tiết kiệm 3G cho user (Mức cực nhỏ cho avatar)
      const compressedFile = await this.compressImage(file, {
        maxSizeMB: 0.5, 
        maxWidthOrHeight: 500
      });

      console.log(`>> Nén xong! Mới: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);

      // 2. Gói vào FormData, BẮT BUỘC TRUYỀN TÊN FILE GỐC để Backend không bị mất định dạng
      const formData = new FormData();
      formData.append('image', compressedFile, file.name || 'avatar.webp');
      formData.append('isAvatar', 'true');
      if (updateProfile) {
        formData.append('updateProfile', 'true');
      }

      console.log('>> Đang gửi request lên Backend...');
      // 3. Đẩy lên Backend
      const response = await uploadApi.uploadImage(formData);
      
      console.log('>> Backend phản hồi:', response);
      // 4. Backend trả về URL WebP
      return response.data.url;
      
    } catch (error) {
      console.error('>> Frontend Error:', error);
      const msg = error.response?.data?.message || 'Lỗi khi upload hình ảnh. Vui lòng kiểm tra lại mạng hoặc thử ảnh khác!';
      toast.error(msg);
      throw error;
    }
  }
}

export default new ImageUploadService();

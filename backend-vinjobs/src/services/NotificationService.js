import Notification from '../models/Notification.js';

/**
 * NotificationService — Singleton Pattern (GoF)
 * 
 * Service quản lý việc gửi và lưu trữ thông báo. Áp dụng 
 * Singleton Pattern tường minh (giống DatabaseConnection) để đảm bảo 
 * toàn bộ ứng dụng chỉ sử dụng DUY NHẤT 1 instance.
 * 
 * Tại sao cần Singleton?
 *   - Tránh khởi tạo nhiều instance gây lãng phí bộ nhớ
 *   - Đảm bảo mọi module đều dùng chung 1 service (consistent state)
 *   - Dễ dàng quản lý vòng đời (lifecycle) của service
 * 
 * Cách triển khai:
 *   - Constructor private (giả lập bằng check instance)
 *   - Static method getInstance() trả về instance duy nhất
 *   - Export instance thông qua getInstance()
 */
class NotificationService {
  constructor() {
    // Ngăn chặn việc tạo instance mới nếu đã tồn tại
    if (NotificationService.instance) {
      return NotificationService.instance;
    }
    NotificationService.instance = this;
  }

  /**
   * Lấy instance duy nhất của NotificationService
   * @returns {NotificationService} Singleton instance
   */
  static getInstance() {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Gửi và lưu thông báo bằng Notification Object (Bridge Pattern)
   * 
   * Method này nhận một đối tượng notification (Abstraction trong Bridge),
   * gọi send() — notification sẽ tự động dùng đúng Sender (Email/SMS)
   * rồi lưu kết quả vào CSDL.
   * 
   * @param {import('../notifications/BaseNotification.js').default} notificationObj
   */
  async sendAndSaveNotification(notificationObj) {
    // 1. Gọi hàm send() của đối tượng notification
    // Nó sẽ tự động dùng đúng Sender (Email/SMS) — Bridge Pattern
    const dbPayload = await notificationObj.send();

    // 2. Lưu vào CSDL
    const savedNotification = await Notification.create(dbPayload);
    return savedNotification;
  }

  async getUserNotifications(userId) {
    return await Notification.find({ user_id: userId }).sort('-created_at');
  }
}

// Export Singleton instance thông qua getInstance()
export default NotificationService.getInstance();

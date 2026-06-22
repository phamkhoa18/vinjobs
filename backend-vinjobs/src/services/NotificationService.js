import Notification from '../models/Notification.js';

class NotificationService {
  /**
   * Gửi và lưu thông báo bằng Notification Object (Bridge Pattern)
   * @param {import('../notifications/BaseNotification.js').default} notificationObj
   */
  async sendAndSaveNotification(notificationObj) {
    // 1. Gọi hàm send() của đối tượng notification
    // Nó sẽ tự động dùng đúng Sender (Email/SMS)
    const dbPayload = await notificationObj.send();

    // 2. Lưu vào CSDL
    const savedNotification = await Notification.create(dbPayload);
    return savedNotification;
  }

  async getUserNotifications(userId) {
    return await Notification.find({ user_id: userId }).sort('-created_at');
  }
}

export default new NotificationService();

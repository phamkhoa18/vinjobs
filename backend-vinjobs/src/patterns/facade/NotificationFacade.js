import NotificationService from '../../services/NotificationService.js';
import EmailSender from '../../notifications/senders/EmailSender.js';
import CompanyApprovedNotification from '../../notifications/types/CompanyApprovedNotification.js';

class NotificationFacade {
  /**
   * Tự động khởi tạo Email Sender, Notification Type và gửi thông báo
   * Che giấu sự phức tạp của quá trình lắp ráp (Bridge) và Service.
   * 
   * @param {Object} company - Đối tượng Company
   * @param {Object} employerUser - Đối tượng User của nhà tuyển dụng
   */
  static async sendCompanyApproved(company, employerUser) {
    try {
      const sender = new EmailSender();
      const notification = new CompanyApprovedNotification(sender, company, employerUser);
      
      await NotificationService.sendAndSaveNotification(notification);
      console.log(`[NotificationFacade] Đã gửi thông báo CompanyApproved cho ${employerUser.email}`);
    } catch (err) {
      console.error(`[NotificationFacade] Lỗi khi gửi thông báo CompanyApproved:`, err);
    }
  }
}

export default NotificationFacade;

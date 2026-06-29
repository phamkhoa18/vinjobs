/**
 * NotificationFacade — Façade Pattern (GoF)
 * 
 * Cung cấp một giao diện đơn giản (simplified interface) cho hệ thống
 * Notification phức tạp bên dưới. Client (Controller/Route) chỉ cần gọi
 * MỘT method duy nhất thay vì phải tự tay thực hiện các bước:
 *   1. Khởi tạo Sender (EmailSender / SmsSender — Bridge Pattern)
 *   2. Khởi tạo Notification object (Refined Abstraction)
 *   3. Gọi NotificationService để lưu DB + gửi tin nhắn
 * 
 * Facade che giấu toàn bộ sự phức tạp trên, giúp code ở Controller
 * ngắn gọn và dễ bảo trì.
 * 
 * @example
 * // Chỉ cần 1 dòng code duy nhất:
 * await NotificationFacade.sendJobApprovedNotification(job, employer);
 */
import NotificationService from '../services/NotificationService.js';
import EmailSender from '../notifications/senders/EmailSender.js';
import SmsSender from '../notifications/senders/SmsSender.js';
import CompanyApprovedNotification from '../notifications/types/CompanyApprovedNotification.js';

class NotificationFacade {

  /**
   * Factory method chọn kênh gửi phù hợp — minh chứng Bridge Pattern
   * 
   * Bridge Pattern tách biệt "loại thông báo" (Abstraction) khỏi
   * "kênh gửi" (Implementation). Method này cho phép chọn Sender
   * một cách linh hoạt tại runtime.
   * 
   * @param {'EMAIL'|'SMS'} channel - Kênh gửi thông báo
   * @returns {import('../notifications/MessageSender.js').default} Sender instance
   */
  static _getSender(channel = 'EMAIL') {
    switch (channel) {
      case 'SMS':
        return new SmsSender();
      case 'EMAIL':
      default:
        return new EmailSender();
    }
  }

  /**
   * Gửi thông báo công ty được duyệt cho Employer
   * Che giấu: tạo EmailSender → tạo CompanyApprovedNotification → gọi Service
   * 
   * @param {Object} company - Đối tượng Company
   * @param {Object} employerUser - Đối tượng User của nhà tuyển dụng
   */
  static async sendCompanyApproved(company, employerUser) {
    try {
      const sender = NotificationFacade._getSender('EMAIL');
      const notification = new CompanyApprovedNotification(sender, company, employerUser);
      
      await NotificationService.sendAndSaveNotification(notification);
      console.log(`[NotificationFacade] Đã gửi thông báo CompanyApproved cho ${employerUser.email}`);
    } catch (err) {
      console.error(`[NotificationFacade] Lỗi khi gửi thông báo CompanyApproved:`, err);
    }
  }

  /**
   * Gửi thông báo có tin tuyển dụng mới cho toàn bộ Admin
   */
  static async sendNewJobNotification(job, company) {
    try {
      const User = (await import('../models/User.js')).default;
      const admins = await User.find({ role: 'ADMIN' });
      
      const sender = NotificationFacade._getSender('EMAIL');
      
      const NewJobNotification = (await import('../notifications/types/NewJobNotification.js')).default;
      
      for (const admin of admins) {
        const notification = new NewJobNotification(sender, job, company, admin);
        await NotificationService.sendAndSaveNotification(notification);
      }
      console.log(`[NotificationFacade] Đã gửi thông báo NewJob cho ${admins.length} Admins`);
    } catch (err) {
      console.error(`[NotificationFacade] Lỗi khi gửi thông báo NewJob:`, err);
    }
  }

  /**
   * Gửi thông báo khi tin tuyển dụng được duyệt
   */
  static async sendJobApprovedNotification(job, employerUser) {
    try {
      const sender = NotificationFacade._getSender('EMAIL');
      const JobApprovedNotification = (await import('../notifications/types/JobApprovedNotification.js')).default;
      const notification = new JobApprovedNotification(sender, job, employerUser.email);
      // Ghi đè userId vì class nhận email thay vì user object trong constructor
      notification.userId = employerUser._id;
      
      await NotificationService.sendAndSaveNotification(notification);
      console.log(`[NotificationFacade] Đã gửi thông báo JobApproved cho ${employerUser.email}`);
    } catch (err) {
      console.error(`[NotificationFacade] Lỗi khi gửi thông báo JobApproved:`, err);
    }
  }

  /**
   * Gửi thông báo khi tin tuyển dụng bị từ chối
   */
  static async sendJobRejectedNotification(job, employerUser) {
    try {
      const sender = NotificationFacade._getSender('EMAIL');
      const JobRejectedNotification = (await import('../notifications/types/JobRejectedNotification.js')).default;
      const notification = new JobRejectedNotification(sender, job, employerUser);
      
      await NotificationService.sendAndSaveNotification(notification);
      console.log(`[NotificationFacade] Đã gửi thông báo JobRejected cho ${employerUser.email}`);
    } catch (err) {
      console.error(`[NotificationFacade] Lỗi khi gửi thông báo JobRejected:`, err);
    }
  }

  /**
   * Gửi thông báo cho toàn bộ followers của công ty khi công ty có job mới được duyệt
   */
  static async sendNewJobToFollowersNotification(job, company) {
    try {
      const FollowCompany = (await import('../models/FollowCompany.js')).default;
      const User = (await import('../models/User.js')).default;
      const NewJobToFollowerNotification = (await import('../notifications/types/NewJobToFollowerNotification.js')).default;
      
      // Tìm tất cả những người theo dõi công ty này
      const followers = await FollowCompany.find({ company_id: company._id }).lean();
      
      if (!followers || followers.length === 0) return;

      const sender = NotificationFacade._getSender('EMAIL');
      
      for (const follow of followers) {
        const followerUser = await User.findById(follow.user_id).lean();
        if (followerUser) {
          const notification = new NewJobToFollowerNotification(sender, job, company, followerUser);
          await NotificationService.sendAndSaveNotification(notification);
        }
      }
      console.log(`[NotificationFacade] Đã gửi thông báo NewJobToFollower cho ${followers.length} followers của công ty ${company.name}`);
    } catch (err) {
      console.error(`[NotificationFacade] Lỗi khi gửi thông báo NewJobToFollower:`, err);
    }
  }

  /**
   * Gửi thông báo cho Employer khi có ứng viên mới ứng tuyển
   */
  static async sendNewApplicationNotification(application, candidateUser, job, employerUser) {
    try {
      const sender = NotificationFacade._getSender('EMAIL');
      const ApplicationNotification = (await import('../notifications/types/ApplicationNotification.js')).default;
      const notification = new ApplicationNotification(sender, application, candidateUser, job, employerUser.email);
      
      await NotificationService.sendAndSaveNotification(notification);
      console.log(`[NotificationFacade] Đã gửi thông báo NewApplication cho ${employerUser.email}`);
    } catch (err) {
      console.error(`[NotificationFacade] Lỗi khi gửi thông báo NewApplication:`, err);
    }
  }

  /**
   * Gửi thông báo cho ứng viên khi trạng thái đơn ứng tuyển thay đổi
   * Gửi qua Email (thông báo chi tiết)
   */
  static async sendApplicationStatusNotification(application, job, candidateUser, newStatus) {
    try {
      const sender = NotificationFacade._getSender('EMAIL');
      const ApplicationStatusNotification = (await import('../notifications/types/ApplicationStatusNotification.js')).default;
      const notification = new ApplicationStatusNotification(sender, application, job, candidateUser.email, newStatus);
      
      await NotificationService.sendAndSaveNotification(notification);
      console.log(`[NotificationFacade] Đã gửi thông báo ApplicationStatus cho ${candidateUser.email}`);
    } catch (err) {
      console.error(`[NotificationFacade] Lỗi khi gửi thông báo ApplicationStatus:`, err);
    }
  }

  /**
   * Gửi thông báo trạng thái ứng tuyển qua NHIỀU KÊNH (Multi-Channel)
   * 
   * ĐÂY LÀ MINH CHỨNG RÕ NHẤT CHO BRIDGE PATTERN:
   * Cùng một loại thông báo (ApplicationStatusNotification) nhưng 
   * được gửi qua CẢ HAI kênh khác nhau (Email + SMS) chỉ bằng cách 
   * thay đổi đối tượng Sender — KHÔNG cần sửa class Notification.
   * 
   * @param {Object} application - Đơn ứng tuyển
   * @param {Object} job - Công việc
   * @param {Object} candidateUser - User ứng viên
   * @param {string} newStatus - Trạng thái mới (APPROVED/REJECTED/SHORTLISTED)
   */
  static async sendApplicationStatusMultiChannel(application, job, candidateUser, newStatus) {
    try {
      const ApplicationStatusNotification = (await import('../notifications/types/ApplicationStatusNotification.js')).default;

      // ===== BRIDGE PATTERN IN ACTION =====
      // Cùng 1 class Notification, nhưng 2 Sender khác nhau

      // Kênh 1: Gửi qua Email (nội dung chi tiết)
      const emailSender = NotificationFacade._getSender('EMAIL');
      const emailNotification = new ApplicationStatusNotification(emailSender, application, job, candidateUser.email, newStatus);
      await NotificationService.sendAndSaveNotification(emailNotification);

      // Kênh 2: Gửi qua SMS (thông báo ngắn gọn)
      if (candidateUser.phone) {
        const smsSender = NotificationFacade._getSender('SMS');
        const smsNotification = new ApplicationStatusNotification(smsSender, application, job, candidateUser.phone, newStatus);
        await smsNotification.send(); // Chỉ gửi SMS, không lưu DB lần 2
      }

      console.log(`[NotificationFacade] Đã gửi thông báo ApplicationStatus MULTI-CHANNEL cho ${candidateUser.email}`);
    } catch (err) {
      console.error(`[NotificationFacade] Lỗi khi gửi thông báo ApplicationStatus Multi-Channel:`, err);
    }
  }
}

export default NotificationFacade;

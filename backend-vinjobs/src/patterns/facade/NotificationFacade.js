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
  /**
   * Gửi thông báo có tin tuyển dụng mới cho toàn bộ Admin
   */
  static async sendNewJobNotification(job, company) {
    try {
      const User = (await import('../../models/User.js')).default;
      const admins = await User.find({ role: 'ADMIN' });
      
      const sender = new EmailSender(); // In-app notification sender is mocked via base class or we just skip email sending
      
      const NewJobNotification = (await import('../../notifications/types/NewJobNotification.js')).default;
      
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
      const sender = new EmailSender();
      const JobApprovedNotification = (await import('../../notifications/types/JobApprovedNotification.js')).default;
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
      const sender = new EmailSender();
      const JobRejectedNotification = (await import('../../notifications/types/JobRejectedNotification.js')).default;
      // JobRejectedNotification.js constructor is (sender, job, employerUser)
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
      const FollowCompany = (await import('../../models/FollowCompany.js')).default;
      const User = (await import('../../models/User.js')).default;
      const NewJobToFollowerNotification = (await import('../../notifications/types/NewJobToFollowerNotification.js')).default;
      
      // Tìm tất cả những người theo dõi công ty này
      const followers = await FollowCompany.find({ company_id: company._id }).lean();
      
      if (!followers || followers.length === 0) return;

      const sender = new EmailSender();
      
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

  static async sendNewApplicationNotification(application, candidateUser, job, employerUser) {
    try {
      const sender = new EmailSender();
      const ApplicationNotification = (await import('../../notifications/types/ApplicationNotification.js')).default;
      const notification = new ApplicationNotification(sender, application, candidateUser, job, employerUser.email);
      
      await NotificationService.sendAndSaveNotification(notification);
      console.log(`[NotificationFacade] Đã gửi thông báo NewApplication cho ${employerUser.email}`);
    } catch (err) {
      console.error(`[NotificationFacade] Lỗi khi gửi thông báo NewApplication:`, err);
    }
  }

  static async sendApplicationStatusNotification(application, job, candidateUser, newStatus) {
    try {
      const sender = new EmailSender();
      const ApplicationStatusNotification = (await import('../../notifications/types/ApplicationStatusNotification.js')).default;
      const notification = new ApplicationStatusNotification(sender, application, job, candidateUser.email, newStatus);
      
      await NotificationService.sendAndSaveNotification(notification);
      console.log(`[NotificationFacade] Đã gửi thông báo ApplicationStatus cho ${candidateUser.email}`);
    } catch (err) {
      console.error(`[NotificationFacade] Lỗi khi gửi thông báo ApplicationStatus:`, err);
    }
  }
}

export default NotificationFacade;

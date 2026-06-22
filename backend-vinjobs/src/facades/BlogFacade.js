import EmailSender from '../notifications/senders/EmailSender.js';
import PostApprovedNotification from '../notifications/types/PostApprovedNotification.js';

class BlogFacade {
  constructor(postService, authService, notificationService) {
    this.postService = postService;
    this.authService = authService;
    this.notificationService = notificationService;
  }

  async approvePost(adminId, postId) {
    // 1. Admin action (có thể check admin role nếu chưa check ở middleware)
    // 2. Chuyển trạng thái bài
    const post = await this.postService.approvePost(postId);
    
    // 3. Thông báo cho Tác giả
    const author = await this.authService.getUserById(post.author_id);
    const notification = new PostApprovedNotification(new EmailSender(), post, author.email);
    await this.notificationService.sendAndSaveNotification(notification);

    return post;
  }
}

import postService from '../services/PostService.js';
import authService from '../services/AuthService.js';
import notificationService from '../services/NotificationService.js';

export default new BlogFacade(postService, authService, notificationService);

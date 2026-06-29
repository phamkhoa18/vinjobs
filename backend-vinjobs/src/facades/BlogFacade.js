/**
 * BlogFacade — Façade Pattern (GoF)
 * 
 * Điều phối quy trình duyệt bài viết Blog bằng cách phối hợp
 * nhiều Service (PostService, AuthService, NotificationService):
 *   1. Chuyển trạng thái bài viết → PostService
 *   2. Tìm tác giả → AuthService
 *   3. Gửi thông báo cho tác giả → NotificationService + Bridge Pattern
 * 
 * Controller chỉ cần gọi: blogFacade.approvePost(adminId, postId)
 * mà không cần biết chi tiết các bước bên trong.
 */
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

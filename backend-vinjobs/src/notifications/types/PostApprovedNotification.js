import BaseNotification from '../BaseNotification.js';

class PostApprovedNotification extends BaseNotification {
  constructor(sender, post, authorEmail) {
    super(sender);
    this.post = post;
    this.authorEmail = authorEmail;
    this.userId = post.author_id;
    
    this.title = 'Bài viết đã được xuất bản';
    this.message = `Bài viết "${this.post.title}" của bạn đã được duyệt và hiển thị trên Blog.`;
  }

  async send() {
    await this.sender.sendMessage(this.authorEmail, this.title, this.message);
    
    return {
      user_id: this.userId,
      title: this.title,
      message: this.message,
      type: 'POST_APPROVED'
    };
  }
}

export default PostApprovedNotification;

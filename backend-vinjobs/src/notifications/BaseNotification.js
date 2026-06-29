/**
 * BaseNotification — Abstraction trong Bridge Pattern (GoF)
 * 
 * Lớp trừu tượng đại diện cho một "thông báo". Giữ tham chiếu (reference)
 * đến đối tượng MessageSender (Implementor) để ủy thác việc gửi tin nhắn.
 * 
 * BRIDGE PATTERN cho phép tách biệt 2 chiều phát triển độc lập:
 *   - Chiều 1 (Abstraction): Thêm loại thông báo mới 
 *     (JobApproved, ApplicationStatus,...) mà KHÔNG sửa Sender
 *   - Chiều 2 (Implementation): Thêm kênh gửi mới 
 *     (Email, SMS, Push,...) mà KHÔNG sửa Notification
 * 
 * Các lớp con (Refined Abstractions) kế thừa BaseNotification và 
 * định nghĩa nội dung cụ thể (title, message), rồi gọi 
 * this.sender.sendMessage() để gửi qua kênh đã chọn.
 */
class BaseNotification {
  /**
   * @param {import('../MessageSender.js').default} sender - Kênh gửi (Bridge)
   */
  constructor(sender) {
    if (!sender) {
      throw new Error('Notification must have a MessageSender');
    }
    this.sender = sender;
    this.title = '';
    this.message = '';
    this.userId = null;
  }

  async send() {
    throw new Error('Method "send" must be implemented by concrete Notification.');
  }
}

export default BaseNotification;

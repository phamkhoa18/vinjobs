/**
 * MessageSender — Implementor Interface trong Bridge Pattern (GoF)
 * 
 * Định nghĩa giao diện (interface) cho các kênh gửi thông báo.
 * JavaScript không có keyword "interface" như Java/C#, ta dùng class 
 * với method ném lỗi (throw Error) để giả lập hành vi tương tự.
 * 
 * Các lớp con (Concrete Implementors) sẽ triển khai cụ thể:
 *   - EmailSender: Gửi qua SMTP (Nodemailer)
 *   - SmsSender: Gửi qua SMS Gateway (Twilio/mock)
 *   - (Có thể mở rộng thêm: PushSender, SlackSender,...)
 * 
 * Nhờ Bridge Pattern, ta có thể thêm kênh gửi mới mà KHÔNG cần 
 * sửa bất kỳ class Notification nào.
 */
class MessageSender {
  async sendMessage(to, title, body) {
    throw new Error('Method "sendMessage" must be implemented.');
  }

  getSenderType() {
    throw new Error('Method "getSenderType" must be implemented.');
  }
}

export default MessageSender;

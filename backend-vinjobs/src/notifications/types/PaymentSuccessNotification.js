import BaseNotification from '../BaseNotification.js';

class PaymentSuccessNotification extends BaseNotification {
  constructor(sender, payment, subscription, employerEmail) {
    super(sender);
    this.payment = payment;
    this.subscription = subscription;
    this.employerEmail = employerEmail;
    this.userId = payment.employer_id;
    
    this.title = 'Thanh toán thành công';
    this.message = `Bạn đã thanh toán thành công gói "${this.subscription.name}". Số tiền: ${this.payment.amount} VNĐ.`;
  }

  async send() {
    // 1. Gửi qua kênh được cấu hình (Email/SMS/Push)
    await this.sender.sendMessage(this.employerEmail, this.title, this.message);
    
    // 2. Trả về data để lưu vào Database Notification Collection
    return {
      user_id: this.userId,
      title: this.title,
      message: this.message,
      type: 'PAYMENT_SUCCESS'
    };
  }
}

export default PaymentSuccessNotification;

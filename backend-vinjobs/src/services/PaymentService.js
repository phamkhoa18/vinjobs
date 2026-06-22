import Payment from '../models/Payment.js';
import Invoice from '../models/Invoice.js';
import AppError from '../utils/AppError.js';

class PaymentService {
  async createPayment(data) {
    const payment = await Payment.create({
      employer_id: data.employerId,
      subscription_id: data.planId,
      amount: data.amount,
      payment_method: data.method,
      status: 'PENDING'
    });
    return payment;
  }

  async processPayment(paymentId) {
    // Mô phỏng kết nối cổng thanh toán (MOMO, VNPAY...)
    const payment = await Payment.findById(paymentId);
    if (!payment) throw new AppError('Giao dịch không tồn tại', 404);

    // Giả lập thành công 100%
    payment.status = 'COMPLETED';
    payment.paid_at = new Date();
    await payment.save();

    return true;
  }

  async generateInvoice(paymentId, amount) {
    const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const invoice = await Invoice.create({
      payment_id: paymentId,
      invoice_number: invoiceNumber,
      total_amount: amount,
      tax: amount * 0.1 // Giả lập VAT 10%
    });
    return invoice;
  }
}

export default new PaymentService();

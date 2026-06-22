import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    employer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Giao dịch phải thuộc về một Employer'],
    },
    subscription_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription',
      required: [true, 'Giao dịch phải gắn với một Gói dịch vụ'],
    },
    amount: {
      type: Number,
      required: [true, 'Số tiền không được để trống'],
      min: [0, 'Số tiền không được âm'],
    },
    payment_method: {
      type: String,
      enum: {
        values: ['BANK_TRANSFER', 'MOMO', 'VNPAY', 'CREDIT_CARD', 'ZALOPAY'],
        message: '{VALUE} không phải là phương thức thanh toán hợp lệ',
      },
      required: [true, 'Phương thức thanh toán không được để trống'],
    },
    status: {
      type: String,
      enum: {
        values: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'],
        message: '{VALUE} không phải là trạng thái giao dịch hợp lệ',
      },
      default: 'PENDING',
    },
    paid_at: {
      type: Date,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: false },
  }
);

paymentSchema.index({ employer_id: 1 });

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;

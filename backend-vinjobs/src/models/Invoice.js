import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema(
  {
    payment_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      required: [true, 'Hóa đơn phải gắn với một Giao dịch'],
      unique: true,
    },
    invoice_number: {
      type: String,
      required: [true, 'Mã hóa đơn không được để trống'],
      unique: true,
    },
    total_amount: {
      type: Number,
      required: [true, 'Tổng tiền không được để trống'],
      min: [0, 'Tổng tiền không được âm'],
    },
    tax: {
      type: Number,
      default: 0,
      min: [0, 'Thuế không được âm'],
    },
  },
  {
    timestamps: { createdAt: 'issued_date', updatedAt: false },
  }
);

const Invoice = mongoose.model('Invoice', invoiceSchema);

export default Invoice;

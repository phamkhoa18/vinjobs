import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên gói không được để trống'],
      trim: true,
      maxlength: [50, 'Tên gói không vượt quá 50 ký tự'],
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
      required: [true, 'Giá gói không được để trống'],
      min: [0, 'Giá gói không được âm'],
    },
    job_limit: {
      type: Number,
      required: [true, 'Giới hạn số bài đăng không được để trống'],
      min: [0, 'Giới hạn không được âm (0 là không giới hạn)'],
    },
    duration: {
      type: Number,
      required: [true, 'Thời hạn gói không được để trống (tính theo ngày)'],
      min: [1, 'Thời hạn tối thiểu là 1 ngày'],
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Không có trong design doc cũ nhưng nên có cho NoSQL
  }
);

const Subscription = mongoose.model('Subscription', subscriptionSchema);

export default Subscription;

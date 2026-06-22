import mongoose from 'mongoose';

const employerSubscriptionSchema = new mongoose.Schema(
  {
    employer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Phải thuộc về một Employer'],
    },
    subscription_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription',
      required: [true, 'Phải gắn với một Gói dịch vụ'],
    },
    jobs_used: {
      type: Number,
      default: 0,
      min: [0, 'Số bài đã dùng không được âm'],
    },
    jobs_remaining: {
      type: Number,
      required: [true, 'Số bài còn lại không được để trống'],
      min: [0, 'Số bài còn lại không được âm'],
    },
    start_date: {
      type: Date,
      required: [true, 'Ngày bắt đầu không được để trống'],
    },
    end_date: {
      type: Date,
      required: [true, 'Ngày kết thúc không được để trống'],
    },
    status: {
      type: String,
      enum: {
        values: ['ACTIVE', 'EXPIRED', 'CANCELLED'],
        message: '{VALUE} không hợp lệ',
      },
      default: 'ACTIVE',
    },
  },
  {
    timestamps: true,
  }
);

employerSubscriptionSchema.index({ employer_id: 1 });

const EmployerSubscription = mongoose.model(
  'EmployerSubscription',
  employerSubscriptionSchema
);

export default EmployerSubscription;

import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    candidate_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Đơn ứng tuyển phải thuộc về một Ứng viên'],
    },
    job_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Đơn ứng tuyển phải gắn với một Công việc'],
    },
    employer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Đơn ứng tuyển phải thuộc về một Nhà tuyển dụng'],
    },
    cv_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CV',
      // optional - candidate may apply without uploaded CV
    },
    cover_letter: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: [
          'PENDING',
          'REVIEWING',
          'INTERVIEW',
          'OFFER',
          'ACCEPTED',
          'REJECTED',
          'WITHDRAWN',
        ],
        message: '{VALUE} không phải là trạng thái hợp lệ',
      },
      default: 'PENDING',
    },
  },
  {
    timestamps: { createdAt: 'applied_at', updatedAt: 'updated_at' },
  }
);

// Indexes
applicationSchema.index({ candidate_id: 1, job_id: 1 }, { unique: true }); // Chống apply 2 lần
applicationSchema.index({ job_id: 1 });

const Application = mongoose.model('Application', applicationSchema);

export default Application;

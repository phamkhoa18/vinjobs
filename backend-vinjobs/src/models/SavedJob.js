import mongoose from 'mongoose';

const savedJobSchema = new mongoose.Schema(
  {
    candidate_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Phải có Ứng viên'],
    },
    job_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Phải có Công việc'],
    },
  },
  {
    timestamps: { createdAt: 'saved_at', updatedAt: false },
  }
);

// Indexes
savedJobSchema.index({ candidate_id: 1, job_id: 1 }, { unique: true });

const SavedJob = mongoose.model('SavedJob', savedJobSchema);

export default SavedJob;

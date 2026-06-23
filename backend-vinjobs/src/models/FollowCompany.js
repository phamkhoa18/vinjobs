import mongoose from 'mongoose';

const followCompanySchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Phải có ID người dùng'],
    },
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Phải có ID công ty'],
    },
  },
  {
    timestamps: true,
  }
);

// Một user chỉ có thể follow 1 công ty 1 lần
followCompanySchema.index({ user_id: 1, company_id: 1 }, { unique: true });
followCompanySchema.index({ company_id: 1 });

const FollowCompany = mongoose.model('FollowCompany', followCompanySchema);

export default FollowCompany;

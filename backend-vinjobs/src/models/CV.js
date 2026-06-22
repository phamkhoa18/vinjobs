import mongoose from 'mongoose';

const cvSchema = new mongoose.Schema(
  {
    candidate_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'CV phải thuộc về một Ứng viên'],
    },
    title: {
      type: String,
      required: [true, 'Tiêu đề CV không được để trống'],
      trim: true,
      maxlength: [200, 'Tiêu đề không được vượt quá 200 ký tự'],
    },
    file_path: {
      type: String,
      required: [true, 'Đường dẫn file CV không được để trống'],
    },
    file_type: {
      type: String,
      default: 'PDF',
      enum: ['PDF', 'DOC', 'DOCX'],
    },
    is_primary: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: 'uploaded_at', updatedAt: false },
  }
);

cvSchema.index({ candidate_id: 1 });

const CV = mongoose.model('CV', cvSchema);

export default CV;

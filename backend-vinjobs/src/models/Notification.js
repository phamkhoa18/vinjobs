import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Thông báo phải gắn với một User'],
    },
    title: {
      type: String,
      required: [true, 'Tiêu đề thông báo không được để trống'],
      maxlength: [200, 'Tiêu đề không vượt quá 200 ký tự'],
    },
    message: {
      type: String,
      required: [true, 'Nội dung thông báo không được để trống'],
    },
    type: {
      type: String,
      required: [true, 'Loại thông báo không được để trống'],
      maxlength: [50, 'Loại thông báo không vượt quá 50 ký tự'],
    },
    is_read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: false },
  }
);

// Indexes
notificationSchema.index({ user_id: 1 });
notificationSchema.index({ is_read: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;

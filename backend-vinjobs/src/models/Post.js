import mongoose from 'mongoose';
import slugify from 'slugify';

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Tiêu đề bài viết không được để trống'],
      trim: true,
      maxlength: [300, 'Tiêu đề không được vượt quá 300 ký tự'],
    },
    content: {
      type: String,
      required: [true, 'Nội dung bài viết không được để trống'],
    },
    thumbnail: {
      type: String,
    },
    slug: {
      type: String,
      unique: true,
    },
    status: {
      type: String,
      enum: {
        values: [
          'DRAFT',
          'PENDING_REVIEW',
          'PUBLISHED',
          'REJECTED',
          'ARCHIVED',
        ],
        message: '{VALUE} không phải là trạng thái hợp lệ',
      },
      default: 'DRAFT',
    },
    author_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Bài viết phải có tác giả (Content Manager)'],
    },
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
    view_count: {
      type: Number,
      default: 0,
    },
    published_at: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
postSchema.index({ author_id: 1 });
postSchema.index({ status: 1 });
postSchema.index({ slug: 1 });

// Auto-generate slug trước khi save
postSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    // Thêm Date.now để đảm bảo slug unique cho các bài viết trùng tên
    this.slug = slugify(`${this.title}-${Date.now()}`, {
      lower: true,
      strict: true,
    });
  }
  next();
});

const Post = mongoose.model('Post', postSchema);

export default Post;

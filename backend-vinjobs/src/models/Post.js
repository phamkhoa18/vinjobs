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
    excerpt: {
      type: String,
      maxlength: [500, 'Tóm tắt không được vượt quá 500 ký tự'],
    },
    tags: [{
      type: String,
      trim: true,
    }],
    is_featured: {
      type: Boolean,
      default: false,
    },
    reading_time: {
      type: Number,
      default: 0,
    },
    seo: {
      meta_title: String,
      meta_description: String,
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

// Auto-generate slug trước khi save
postSchema.pre('save', function () {
  if (this.isModified('title')) {
    // Thêm Date.now để đảm bảo slug unique cho các bài viết trùng tên
    this.slug = slugify(`${this.title}-${Date.now()}`, {
      lower: true,
      strict: true,
    });
  }
});

const Post = mongoose.model('Post', postSchema);

export default Post;

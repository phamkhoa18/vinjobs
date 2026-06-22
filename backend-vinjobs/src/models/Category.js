import mongoose from 'mongoose';
import slugify from 'slugify';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên danh mục không được để trống'],
      trim: true,
      unique: true,
      maxlength: [100, 'Tên danh mục không được vượt quá 100 ký tự'],
    },
    slug: {
      type: String,
      unique: true,
    },
    description: {
      type: String,
    },
    icon: {
      type: String,
      default: '',
    },
    custom_svg: {
      type: String,
      default: '',
    },
    image: {
      type: String,
      default: '',
    },
    icon_color: {
      type: String,
      default: '#3674c5',
    },
    bg_color: {
      type: String,
      default: '#eef2ff',
    },
    parent_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate slug trước khi save
categorySchema.pre('save', function () {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
});

const Category = mongoose.model('Category', categorySchema);

export default Category;

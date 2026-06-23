import mongoose from 'mongoose';
import slugify from 'slugify';

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên công ty không được để trống'],
      trim: true,
      maxlength: [200, 'Tên công ty không được vượt quá 200 ký tự'],
    },
    slug: {
      type: String,
      unique: true,
      sparse: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    logo: {
      type: String,
      default: '',
    },
    cover: {
      type: String,
      default: '',
    },
    website: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      trim: true,
      maxlength: [500, 'Địa chỉ không được vượt quá 500 ký tự'],
      default: '',
    },
    industry: {
      type: String,
      trim: true,
      maxlength: [100, 'Ngành nghề không được vượt quá 100 ký tự'],
      default: '',
    },
    size: {
      type: String,
      default: '',
    },
    founded: {
      type: String,
      default: '',
    },
    companyType: {
      type: String,
      default: '',
    },
    province: {
      type: String,
      default: '',
    },
    district: {
      type: String,
      default: '',
    },
    ward: {
      type: String,
      default: '',
    },
    taxCode: {
      type: String,
      default: '',
    },
    facebook: {
      type: String,
      default: '',
    },
    linkedin: {
      type: String,
      default: '',
    },
    mission: {
      type: String,
      default: '',
    },
    contact_email: {
      type: String,
      trim: true,
      default: '',
    },
    contact_phone: {
      type: String,
      trim: true,
      default: '',
    },
    working_days: {
      type: String,
      default: '',
    },
    overtime_policy: {
      type: String,
      default: '',
    },
    benefits: {
      type: [String],
      default: [],
    },
    gallery: {
      type: [String],
      default: [],
    },
    video_url: {
      type: String,
      default: '',
    },
    business_license: {
      type: String,
      default: '',
    },
    rejection_reason: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: ['PENDING', 'ACTIVE', 'REJECTED', 'SUSPENDED'],
        message: '{VALUE} không phải là trạng thái hợp lệ',
      },
      default: 'PENDING',
    },
    employer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Công ty phải thuộc về một Employer'],
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index text cho tìm kiếm
companySchema.index({ name: 'text', industry: 'text', description: 'text' });
companySchema.index({ employer_id: 1 });
companySchema.index({ status: 1 });

// Middleware: Auto generate slug from name
companySchema.pre('save', async function () {
  if (!this.isModified('name')) return;

  let baseSlug = slugify(this.name, { lower: true, strict: true, locale: 'vi' });
  let slug = baseSlug;
  
  // Tránh trùng lặp slug
  const CompanyModel = mongoose.model('Company');
  let slugExists = await CompanyModel.findOne({ slug });
  let count = 1;
  while (slugExists) {
    slug = `${baseSlug}-${count}`;
    slugExists = await CompanyModel.findOne({ slug });
    count++;
  }
  
  this.slug = slug;
});

const Company = mongoose.model('Company', companySchema);

export default Company;

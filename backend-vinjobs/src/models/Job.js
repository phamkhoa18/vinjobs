import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Tiêu đề công việc không được để trống'],
      trim: true,
      maxlength: [200, 'Tiêu đề không được vượt quá 200 ký tự'],
    },
    description: {
      type: String,
      required: [true, 'Mô tả công việc không được để trống'],
    },
    requirements: {
      type: String,
    },
    location: {
      type: String,
      trim: true,
      maxlength: [200, 'Địa điểm không được vượt quá 200 ký tự'],
    },
    industry: {
      type: String,
      trim: true,
    },
    slots: {
      type: Number,
      default: 1,
    },
    salary_min: {
      type: Number,
      min: [0, 'Lương tối thiểu không thể âm'],
    },
    salary_max: {
      type: Number,
      min: [0, 'Lương tối đa không thể âm'],
      validate: {
        validator: function (val) {
          // Chỉ kiểm tra khi có cả hai lương
          return !this.salary_min || val >= this.salary_min;
        },
        message: 'Lương tối đa phải lớn hơn hoặc bằng lương tối thiểu',
      },
    },
    salary_negotiable: {
      type: Boolean,
      default: false,
    },
    nice_to_have: {
      type: String,
      default: '',
    },
    benefits: {
      type: [String],
      default: [],
    },
    working_days: {
      type: [String],
      default: [],
    },
    working_hours: {
      type: [String],
      default: [],
    },
    probation: {
      type: String,
      default: '',
    },
    images: {
      type: [String],
      default: [],
    },
    video_url: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      enum: {
        values: ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'REMOTE'],
        message: '{VALUE} không phải là loại công việc hợp lệ',
      },
      default: 'FULL_TIME',
    },
    level: {
      type: String,
      default: 'Nhân viên',
    },
    status: {
      type: String,
      enum: {
        values: [
          'DRAFT',
          'PENDING',
          'APPROVED',
          'REJECTED',
          'EXPIRED',
          'CLOSED',
        ],
        message: '{VALUE} không phải là trạng thái hợp lệ',
      },
      default: 'DRAFT',
    },
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Công việc phải thuộc về một Công ty'],
    },
    employer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Công việc phải được đăng bởi một Employer'],
    },
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
    deadline: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
jobSchema.index({ company_id: 1 });
jobSchema.index({ employer_id: 1 });
jobSchema.index({ status: 1 });
jobSchema.index({ title: 'text', location: 'text' });

const Job = mongoose.model('Job', jobSchema);

export default Job;

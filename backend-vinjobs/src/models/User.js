import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import validator from 'validator';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên không được để trống'],
      trim: true,
      maxlength: [100, 'Tên không được vượt quá 100 ký tự'],
    },
    email: {
      type: String,
      required: [true, 'Email không được để trống'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Vui lòng cung cấp email hợp lệ'],
    },
    password: {
      type: String,
      required: [true, 'Mật khẩu không được để trống'],
      minlength: [8, 'Mật khẩu phải có ít nhất 8 ký tự'],
      select: false, // Ẩn mật khẩu mặc định khi query
    },
    phone: {
      type: String,
      validate: {
        validator: function (v) {
          return !v || /^[0-9]{10,11}$/.test(v);
        },
        message: 'Số điện thoại không hợp lệ',
      },
    },
    avatar: {
      type: String,
      default: '',
    },
    position: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: {
        values: ['ADMIN', 'EMPLOYER', 'CANDIDATE'],
        message: '{VALUE} không phải là quyền hợp lệ',
      },
      required: [true, 'Vai trò không được để trống'],
    },
    googleId: {
      type: String,
      default: null,
    },
    verificationCode: String,
    verificationCodeExpires: Date,
    profile: {
      gender: { type: String, enum: ['Nam', 'Nữ', 'Khác'] },
      dob: Date,
      address: String,
      intro: String,
      currentJob: String,
      experience: String,
      level: String,
      salary: String,
      jobType: String,
      province: String,
      industry: String,
      skills: [String],
      cv_url: String,
      cv_name: String,
      education: [
        {
          school: String,
          degree: String,
          period: String,
        }
      ],
      workExperience: [
        {
          title: String,
          company: String,
          period: String,
          desc: String,
        }
      ]
    },
    status: {
      type: String,
      enum: {
        values: ['ACTIVE', 'INACTIVE', 'BLOCKED', 'PENDING', 'UNVERIFIED'],
        message: '{VALUE} không phải là trạng thái hợp lệ',
      },
      default: 'UNVERIFIED',
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  {
    timestamps: true, // Tự động tạo createdAt và updatedAt
  }
);

// Hash password trước khi lưu vào DB
userSchema.pre('save', async function () {
  // Chỉ chạy hàm này nếu password bị thay đổi
  if (!this.isModified('password')) return;

  // Hash password với cost là 12
  this.password = await bcrypt.hash(this.password, 12);
});

// Hàm kiểm tra password khi login
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Token expires in 10 minutes
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  
  return resetToken;
};

const User = mongoose.model('User', userSchema);

export default User;

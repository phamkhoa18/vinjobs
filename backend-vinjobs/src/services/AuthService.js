import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import crypto from 'crypto';
import User from '../models/User.js';
import Company from '../models/Company.js';
import AppError from '../utils/AppError.js';
import sendEmail from '../utils/email.js';
import { env } from '../config/env.js';

// BẢO MẬT: Không dùng fallback hardcoded — env.js đã validate khi khởi động
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// BẢO MẬT: Helper escape HTML để chống XSS trong email
const escapeHtml = (str) => {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
};

/**
 * AuthService — Singleton Pattern (qua Module Caching)
 * 
 * Service xử lý authentication & authorization (đăng ký, đăng nhập, JWT, OTP).
 * Sử dụng `export default new AuthService()` — Node.js module system đảm bảo
 * file chỉ được evaluate 1 lần, nên mọi import đều nhận cùng 1 instance.
 * Đây là Singleton Pattern phổ biến trong hệ sinh thái JavaScript.
 */
class AuthService {
  static signAccessToken(id) {
    return jwt.sign({ id }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
  }

  static signRefreshToken(id) {
    return jwt.sign({ id }, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN });
  }

  // Tạo OTP 6 số
  static generateOTP() {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');
    // OTP hết hạn sau 10 phút
    const expires = Date.now() + 10 * 60 * 1000;
    
    // BẢO MẬT: OTP chỉ tồn tại trong email và dưới dạng hash trong DB
    // Không bao giờ ghi ra file hay log ra console
    
    return { otp, hashedOTP, expires };
  }

  async register(data) {
    const { name, email, password, phone, role, companyName } = data;

    const roleMap = {
      'CANDIDATE': 'CANDIDATE',
      'candidate': 'CANDIDATE',
      'EMPLOYER': 'EMPLOYER',
      'employer': 'EMPLOYER',
    };

    const mappedRole = roleMap[role];
    if (!mappedRole) {
      throw new AppError('Vai trò không hợp lệ. Chỉ chấp nhận CANDIDATE hoặc EMPLOYER', 400);
    }

    // Check if user already exists
    let user = await User.findOne({ email });

    if (user) {
      if (user.status !== 'UNVERIFIED') {
        throw new AppError('Email này đã được sử dụng. Vui lòng dùng email khác.', 400);
      }
      // If user exists but unverified, we update their details and resend OTP
      user.name = name;
      user.password = password;
      user.phone = phone;
      user.role = mappedRole;
    } else {
      user = new User({
        name,
        email,
        password,
        phone,
        role: mappedRole,
        status: 'UNVERIFIED',
      });
    }

    const { otp, hashedOTP, expires } = AuthService.generateOTP();
    user.verificationCode = hashedOTP;
    user.verificationCodeExpires = expires;
    
    await user.save({ validateBeforeSave: false });

    // Send email
    // BẢO MẬT: Escape HTML trong name để chống XSS qua email
    const safeName = escapeHtml(name);
    const message = `Chào ${name},\n\nMã xác thực (OTP) của bạn tại VinJobs là: ${otp}\n\nMã này sẽ hết hạn sau 10 phút.`;
    const html = `<h3>Chào ${safeName},</h3><p>Mã xác thực (OTP) của bạn tại VinJobs là: <strong style="font-size: 24px; color: #3674c5;">${otp}</strong></p><p>Mã này sẽ hết hạn sau 10 phút.</p>`;
    
    try {
      await sendEmail({
        email: user.email,
        subject: 'Mã xác thực đăng ký VinJobs',
        message,
        html,
      });
    } catch (err) {
      user.verificationCode = undefined;
      user.verificationCodeExpires = undefined;
      await user.save({ validateBeforeSave: false });
      throw new AppError('Có lỗi xảy ra khi gửi email xác thực. Vui lòng thử lại sau.', 500);
    }

    return { 
      requires_verification: true,
      email: user.email,
      message: 'Mã xác thực đã được gửi đến email của bạn.'
    };
  }

  async verifyEmail(email, otp, companyData) {
    const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');
    
    const user = await User.findOne({
      email,
      verificationCode: hashedOTP,
      verificationCodeExpires: { $gt: Date.now() }
    });

    if (!user) {
      throw new AppError('Mã xác thực không hợp lệ hoặc đã hết hạn', 400);
    }

    // Xác thực thành công
    user.status = user.role === 'EMPLOYER' ? 'PENDING' : 'ACTIVE';
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save({ validateBeforeSave: false });

    // Tạo company nếu là Employer
    if (user.role === 'EMPLOYER' && companyData?.name) {
      await Company.create({
        name: companyData.name,
        taxCode: companyData.taxCode || '',
        address: companyData.address || '',
        province: companyData.province || '',
        companyType: companyData.companyType || '',
        size: companyData.size || '',
        industry: companyData.industry || '',
        employer_id: user._id,
        status: 'PENDING',
      });
    }

    const accessToken = AuthService.signAccessToken(user._id);
    const refreshToken = AuthService.signRefreshToken(user._id);
    user.password = undefined;

    return { user, accessToken, refreshToken };
  }

  async resendOTP(email) {
    const user = await User.findOne({ email, status: 'UNVERIFIED' });
    if (!user) {
      throw new AppError('Tài khoản không tồn tại hoặc đã được xác thực.', 400);
    }

    const { otp, hashedOTP, expires } = AuthService.generateOTP();
    user.verificationCode = hashedOTP;
    user.verificationCodeExpires = expires;
    await user.save({ validateBeforeSave: false });

    const safeName = escapeHtml(user.name);
    const html = `<h3>Chào ${safeName},</h3><p>Mã xác thực (OTP) mới của bạn tại VinJobs là: <strong style="font-size: 24px; color: #3674c5;">${otp}</strong></p><p>Mã này sẽ hết hạn sau 10 phút.</p>`;
    
    try {
      await sendEmail({
        email: user.email,
        subject: 'Mã xác thực mới - VinJobs',
        message: `Mã OTP mới của bạn là: ${otp}`,
        html,
      });
    } catch (err) {
      throw new AppError('Có lỗi xảy ra khi gửi email xác thực. Vui lòng thử lại sau.', 500);
    }

    return { message: 'Mã xác thực mới đã được gửi.' };
  }

  async login(email, password) {
    if (!email || !password) {
      throw new AppError('Vui lòng cung cấp email và mật khẩu', 400);
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
      throw new AppError('Email hoặc mật khẩu không chính xác', 401);
    }

    if (user.status === 'UNVERIFIED') {
      throw new AppError('Tài khoản chưa được xác thực email. Vui lòng xác thực.', 403);
    }

    if (user.status === 'BLOCKED') {
      throw new AppError('Tài khoản của bạn đã bị khoá. Vui lòng liên hệ hỗ trợ.', 403);
    }

    const accessToken = AuthService.signAccessToken(user._id);
    const refreshToken = AuthService.signRefreshToken(user._id);
    user.password = undefined;

    return { user, accessToken, refreshToken };
  }

  async googleLogin(accessToken, role) {
    if (!process.env.GOOGLE_CLIENT_ID) {
      throw new AppError('Google Login chưa được cấu hình trên server', 500);
    }

    try {
      // Vì frontend dùng useGoogleLogin (implicit flow) nên sẽ trả về access_token
      // Ta dùng access_token này để gọi Google API lấy thông tin user
      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      if (!response.ok) {
        throw new Error('Không thể lấy thông tin từ Google');
      }

      const payload = await response.json();
      const { email, name, picture, sub: googleId } = payload;

      if (!email) {
        throw new Error('Không lấy được email từ Google');
      }

      let user = await User.findOne({ email });

      if (!user) {
        // Tài khoản chưa tồn tại -> Yêu cầu thiết lập mật khẩu
        return { 
          requires_password: true,
          email,
          name,
          avatar: picture,
          access_token: accessToken
        };
      } else {
        // Tài khoản đã tồn tại, kiểm tra status và cập nhật googleId
        if (user.status === 'BLOCKED') {
          throw new AppError('Tài khoản của bạn đã bị khoá.', 403);
        }
        if (!user.googleId) {
          user.googleId = googleId;
          if (user.status === 'UNVERIFIED') user.status = 'ACTIVE';
          await user.save({ validateBeforeSave: false });
        }
      }

      const accessTokenGen = AuthService.signAccessToken(user._id);
      const refreshTokenGen = AuthService.signRefreshToken(user._id);
      user.password = undefined;
      return { user, accessToken: accessTokenGen, refreshToken: refreshTokenGen };

    } catch (error) {
      throw new AppError('Xác thực Google thất bại: ' + error.message, 401);
    }
  }

  async googleRegister(accessToken, password, role) {
    if (!password || password.length < 8) {
      throw new AppError('Mật khẩu phải có ít nhất 8 ký tự', 400);
    }

    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      if (!response.ok) {
        throw new Error('Không thể xác thực token với Google');
      }

      const payload = await response.json();
      const { email, name, picture, sub: googleId } = payload;

      if (!email) {
        throw new Error('Không lấy được email từ Google');
      }

      let user = await User.findOne({ email });

      if (user) {
        throw new AppError('Tài khoản đã tồn tại, vui lòng đăng nhập', 400);
      }

      const mappedRole = role === 'employer' ? 'EMPLOYER' : 'CANDIDATE';
      user = await User.create({
        name,
        email,
        password,
        role: mappedRole,
        status: mappedRole === 'EMPLOYER' ? 'PENDING' : 'ACTIVE',
        googleId,
        avatar: picture
      });

      const accessToken = AuthService.signAccessToken(user._id);
      const refreshToken = AuthService.signRefreshToken(user._id);
      user.password = undefined;
      return { user, accessToken, refreshToken };

    } catch (error) {
      if (error.isOperational) throw error;
      throw new AppError('Đăng ký Google thất bại: ' + error.message, 401);
    }
  }
  async forgotPassword(email) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError('Không tìm thấy tài khoản với email này.', 404);
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // BẢO MẬT: Dùng biến môi trường thay vì hardcode localhost
    const resetURL = `${env.CLIENT_URL}/reset-password/${resetToken}`;

    const message = `Bạn đã yêu cầu đặt lại mật khẩu. Vui lòng truy cập đường dẫn dưới đây để thay đổi mật khẩu của bạn:\n\n${resetURL}\n\nNếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này. Mã khôi phục này sẽ hết hạn sau 10 phút.`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Yêu cầu đặt lại mật khẩu (Có hiệu lực 10 phút)',
        message
      });

      return { message: 'Mã khôi phục đã được gửi đến email của bạn!' };
    } catch (error) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      throw new AppError('Có lỗi xảy ra khi gửi email. Vui lòng thử lại sau!', 500);
    }
  }

  async resetPassword(token, newPassword) {
    // 1. Mã hoá token do user gửi lên
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // 2. Tìm user có token khớp và chưa hết hạn
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      throw new AppError('Mã khôi phục không hợp lệ hoặc đã hết hạn', 400);
    }

    // 3. Đổi mật khẩu
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    
    // Nếu tài khoản đang UNVERIFIED thì tiện thể active luôn
    if (user.status === 'UNVERIFIED') {
      user.status = 'ACTIVE';
    }

    await user.save();

    // 4. Sinh JWT mới
    const jwtToken = AuthService.signToken(user._id);
    user.password = undefined;

    return { user, token: jwtToken };
  }


  async getUserById(id) {
    const user = await User.findById(id);
    if (!user) {
      throw new AppError('Không tìm thấy người dùng này', 404);
    }
    return user;
  }
}

export default new AuthService();

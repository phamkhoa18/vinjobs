/**
 * Environment Variables Validation
 * =================================
 * Kiểm tra tất cả biến môi trường bắt buộc khi khởi động server.
 * Nếu thiếu bất kỳ biến nào → crash ngay lập tức (fail-fast).
 * 
 * BẢO MẬT: Không bao giờ dùng fallback/hardcoded secrets.
 */

const requiredEnvVars = [
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'DATABASE_URL',
];

const optionalEnvVars = [
  'JWT_EXPIRES_IN',
  'JWT_REFRESH_EXPIRES_IN',
  'JWT_REFRESH_COOKIE_EXPIRES_IN',
  'EMAIL_USER',
  'EMAIL_PASS',
  'EMAIL_HOST',
  'EMAIL_PORT',
  'EMAIL_FROM',
  'CLIENT_URL',
  'GOOGLE_CLIENT_ID',
  'TURNSTILE_SECRET_KEY',
];

export function validateEnv() {
  const missing = requiredEnvVars.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ FATAL: Thiếu biến môi trường bắt buộc:');
    missing.forEach(key => console.error(`   - ${key}`));
    console.error('   Vui lòng kiểm tra file .env');
    process.exit(1);
  }

  // Cảnh báo các biến optional thiếu
  const missingOptional = optionalEnvVars.filter(key => !process.env[key]);
  if (missingOptional.length > 0) {
    console.warn('⚠️  Các biến môi trường tùy chọn chưa được cấu hình:');
    missingOptional.forEach(key => console.warn(`   - ${key}`));
  }

  // Validate JWT_SECRET strength (phải ít nhất 32 ký tự)
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.warn('⚠️  JWT_SECRET quá ngắn (< 32 ký tự). Nên dùng chuỗi random dài hơn.');
  }

  console.log('✅ Kiểm tra biến môi trường: OK');
}

// Export các biến để dùng trong toàn app (thay vì process.env trực tiếp)
export const env = {
  get JWT_SECRET() { return process.env.JWT_SECRET; },
  get JWT_REFRESH_SECRET() { return process.env.JWT_REFRESH_SECRET; },
  get JWT_EXPIRES_IN() { return process.env.JWT_EXPIRES_IN || '15m'; },
  get JWT_REFRESH_EXPIRES_IN() { return process.env.JWT_REFRESH_EXPIRES_IN || '7d'; },
  get JWT_REFRESH_COOKIE_EXPIRES_IN() { return parseInt(process.env.JWT_REFRESH_COOKIE_EXPIRES_IN || '7'); },
  get CLIENT_URL() { return process.env.CLIENT_URL || 'http://localhost:5173'; },
  get NODE_ENV() { return process.env.NODE_ENV || 'development'; },
};

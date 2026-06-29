/**
 * Security Helpers
 * ================
 * Các hàm hỗ trợ bảo mật dùng chung trong toàn bộ ứng dụng.
 */

/**
 * BẢO MẬT: Escape ký tự đặc biệt trong chuỗi trước khi dùng làm RegExp.
 * Ngăn chặn ReDoS (Regular Expression Denial of Service) và NoSQL Injection.
 * 
 * @param {string} str - Chuỗi cần escape
 * @returns {string} - Chuỗi đã được escape an toàn cho RegExp
 */
export const escapeRegex = (str) => {
  if (!str) return '';
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * BẢO MẬT: Escape HTML entities để chống XSS.
 * Dùng khi chèn user input vào HTML template (email, v.v.)
 * 
 * @param {string} str - Chuỗi cần escape
 * @returns {string} - Chuỗi đã escape HTML entities
 */
export const escapeHtml = (str) => {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

# VinJobs - Hệ Thống Tuyển Dụng & Tìm Việc Làm (MERN Stack)

VinJobs là một nền tảng tuyển dụng hiện đại được xây dựng dựa trên công nghệ **MERN Stack** (MongoDB, Express, React, Node.js). Hệ thống cung cấp luồng quy trình đầy đủ cho 3 đối tượng người dùng chính: **Ứng viên (Job Seeker)**, **Nhà tuyển dụng (Employer)**, và **Quản trị viên (Admin)**.

## 🌟 Tính Năng Nổi Bật

### 1. Dành cho Ứng viên (Job Seeker)
- **Đăng ký / Đăng nhập:** Hệ thống Authentication an toàn với JWT, tích hợp Captcha chống Spam.
- **Tìm kiếm Việc làm:** Công cụ lọc việc làm nâng cao theo Từ khóa, Địa điểm, Ngành nghề, Cấp bậc, Mức lương.
- **Quản lý Hồ sơ & CV:** Cập nhật Profile cá nhân, Upload CV ứng tuyển nhanh chóng.
- **Theo dõi Trạng thái:** Xem lại lịch sử ứng tuyển và trạng thái xét duyệt của Nhà tuyển dụng.

### 2. Dành cho Nhà Tuyển Dụng (Employer)
- **Quản lý Hồ sơ Công ty:** Đăng tải Logo, Thông tin giới thiệu, Video giới thiệu công ty.
- **Đăng & Cập nhật Tin tuyển dụng (CRUD):** 
  - Giao diện đăng tin nhiều bước (Multi-step form) thân thiện, dễ sử dụng.
  - Tích hợp **Rich Text Editor** để viết Mô tả & Yêu cầu công việc chuyên nghiệp.
  - Tùy biến Địa điểm cực kỳ chi tiết theo Tỉnh/Thành -> Quận/Huyện -> Phường/Xã (Tích hợp API Hành chính mở).
  - Tùy chọn **Upload hình ảnh** và nhúng **Video YouTube** giới thiệu môi trường làm việc trực tiếp vào Tin đăng.
- **Quản lý Ứng viên:** Nhận và duyệt CV của ứng viên nộp vào tin tuyển dụng.

### 3. Dành cho Quản Trị Viên (Admin)
- **Kiểm duyệt Hệ thống:** Xét duyệt công ty và tin tuyển dụng trước khi cho phép hiển thị lên nền tảng.
- **Chi tiết Tin Đăng:** Tính năng xem trước (Preview Modal) hiển thị mọi góc độ của tin đăng (Ảnh, Video, Text) để Admin có cái nhìn tổng quan nhất.
- **Thống kê Báo cáo:** Dashboard quản trị bao quát toàn bộ hoạt động của hệ thống.

---

## 🛠 Công Nghệ Sử Dụng

### Backend (`/backend-vinjobs`)
- **Node.js & Express.js**: Xây dựng RESTful API tốc độ cao.
- **MongoDB & Mongoose**: Lưu trữ và quản lý cơ sở dữ liệu NoSQL linh hoạt.
- **Bảo mật**: `bcryptjs` (Mã hóa mật khẩu), `jsonwebtoken` (Xác thực người dùng), `cors`, `helmet`.
- **Upload File**: `multer` và `cloudinary` (hoặc lưu trữ local) để quản lý Hình ảnh / CV.

### Frontend (`/frontend-vinjobs`)
- **React.js 19**: Xây dựng UI linh hoạt, sử dụng Vite làm module bundler siêu tốc.
- **Tailwind CSS & Ant Design**: Kết hợp sức mạnh tùy biến Layout của Tailwind và các Components chuyên nghiệp, chuẩn UI/UX của Ant Design (Form, Select, Table, Modal...).
- **State Management**: React Hooks.
- **Rich Text Editor**: `react-simple-wysiwyg` (Nhẹ nhàng, không xung đột trên React 19).
- **HTTP Client**: `axios` kết hợp cơ chế Interceptors để quản lý Token tự động.

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Dự Án

### Yêu Cầu Môi Trường
- **Node.js** (Phiên bản v18 trở lên)
- **MongoDB** (Local hoặc MongoDB Atlas)

### Bước 1: Khởi chạy Backend
1. Mở Terminal, di chuyển vào thư mục backend:
   ```bash
   cd backend-vinjobs
   ```
2. Cài đặt các thư viện phụ thuộc:
   ```bash
   npm install
   ```
3. Tạo file `.env` từ file `.env.example` (nếu có) và điền các thông số:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/vinjobs_db
   JWT_SECRET=your_jwt_secret_key
   ```
4. Chạy Server ở môi trường dev:
   ```bash
   npm run dev
   ```
   *Backend sẽ chạy tại: `http://localhost:5000`*

### Bước 2: Khởi chạy Frontend
1. Mở một Terminal mới, di chuyển vào thư mục frontend:
   ```bash
   cd frontend-vinjobs
   ```
2. Cài đặt các thư viện:
   ```bash
   npm install
   ```
3. Chạy giao diện ở môi trường dev:
   ```bash
   npm run dev
   ```
   *Frontend sẽ tự động mở tại: `http://localhost:5173`*

---

## 🛡️ Tài Khoản Test (Tham khảo)
- **Admin**: `admin@gmail.com` / `123456`
- **Employer**: `phamkhoatailieu@gmail.com` / `01265737697Khoa`
*(Tài khoản trên mang tính tham khảo, có thể thay đổi tùy thuộc vào Data có trong Database của bạn)*

---

*Dự án được xây dựng và tối ưu UX/UI theo phong cách hiện đại (Flat Design, No Shadow).*

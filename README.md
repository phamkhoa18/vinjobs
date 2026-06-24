# 🚀 VinJobs — Nền Tảng Tuyển Dụng & Tìm Việc Làm

<div align="center">

![VinJobs](vinjobs_scale.png)

**Hệ thống tuyển dụng trực tuyến toàn diện xây dựng trên MERN Stack**
**MongoDB · Express.js · React.js · Node.js**

[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-v7+-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

</div>

---

## 📋 Mục Lục

- [Giới Thiệu](#-giới-thiệu)
- [Kiến Trúc Hệ Thống](#-kiến-trúc-hệ-thống)
- [Thiết Kế Hướng Đối Tượng & Design Patterns](#-thiết-kế-hướng-đối-tượng--design-patterns)
- [Mô Hình Cơ Sở Dữ Liệu](#-mô-hình-cơ-sở-dữ-liệu)
- [Tính Năng Chi Tiết](#-tính-năng-chi-tiết)
- [Công Nghệ Sử Dụng](#-công-nghệ-sử-dụng)
- [Cấu Trúc Thư Mục](#-cấu-trúc-thư-mục)
- [Hướng Dẫn Cài Đặt](#-hướng-dẫn-cài-đặt)
- [Tài Khoản Demo](#-tài-khoản-demo)
- [API Endpoints](#-api-endpoints)

---

## 📖 Giới Thiệu

**VinJobs** là một nền tảng công nghệ tuyển dụng hiện đại, hoàn toàn **miễn phí**, được thiết kế và phát triển theo mô hình **MERN Stack** với trọng tâm là **Thiết kế Phần mềm Hướng Đối Tượng (OOD)**. Hệ thống áp dụng chặt chẽ các Mẫu thiết kế (Design Patterns) của GoF để đảm bảo mã nguồn có tính mở rộng cao, dễ bảo trì và tối ưu hiệu suất.

Hệ thống phục vụ **3 đối tượng người dùng chính:**

| Vai trò | Mô tả |
|---------|-------|
| 🧑‍💻 **Ứng viên (Candidate)** | Tìm kiếm việc làm, nộp CV, theo dõi công ty, nhận thông báo |
| 🏢 **Nhà tuyển dụng (Employer)** | Đăng tin, quản lý ứng viên, xét duyệt hồ sơ, gửi phỏng vấn |
| ⚙️ **Quản trị viên (Admin)** | Kiểm duyệt toàn bộ nền tảng, quản lý người dùng & nội dung |

---

## 🏗 Kiến Trúc Hệ Thống

### Kiến trúc Tổng thể: Client – Server RESTful API

```
┌─────────────────────┐         ┌──────────────────────────────────┐
│   Frontend (React)  │  HTTP   │        Backend (Express.js)      │
│   Vite + Tailwind   │◄──────►│   MVC + Service Layer Pattern    │
│   Ant Design + SPA  │  REST   │                                  │
└─────────────────────┘         │  ┌────────┐  ┌─────────┐        │
                                │  │ Routes  │─►│Controllers│       │
                                │  └────────┘  └────┬──────┘       │
                                │                   ▼              │
                                │            ┌──────────┐          │
                                │            │ Services  │          │
                                │            └────┬─────┘          │
                                │                 ▼                │
                                │          ┌──────────┐            │
                                │          │  Models   │            │
                                │          │(Mongoose) │            │
                                │          └────┬─────┘            │
                                └───────────────┼──────────────────┘
                                                ▼
                                        ┌──────────────┐
                                        │   MongoDB     │
                                        └──────────────┘
```

- **Backend:** Mô hình **MVC mở rộng** với **Service Layer** — Controllers chỉ tiếp nhận/phản hồi HTTP, mọi Business Logic được đóng gói trong Services.
- **Frontend:** Kiến trúc **Component-Based** của React, kết hợp **Context API** quản lý State toàn cục (Auth, Settings) và kỹ thuật phân tách UI Component tái sử dụng.

---

## 🎯 Thiết Kế Hướng Đối Tượng & Design Patterns

Dự án áp dụng mạnh mẽ các nguyên lý **SOLID** và **4 mẫu thiết kế kinh điển GoF**:

### 1. 🏛 Facade Pattern (Mẫu Mặt Tiền)

> **File:** `src/patterns/facade/NotificationFacade.js`

**Vấn đề:** Gửi thông báo đòi hỏi nhiều bước: tìm user → khởi tạo Sender → khởi tạo Notification → gọi Service lưu DB & gửi email.

**Giải pháp:** `NotificationFacade` cung cấp các phương thức tĩnh đơn giản:
```javascript
// Chỉ cần 1 dòng code duy nhất
await NotificationFacade.sendJobApprovedNotification(job, employer);
await NotificationFacade.sendNewApplicationNotification(application, candidate, job, employer);
await NotificationFacade.sendApplicationStatusNotification(application, job, candidate, 'INTERVIEW');
```

### 2. 🌉 Strategy / Bridge Pattern (Mẫu Cây Cầu)

> **File:** `src/notifications/BaseNotification.js` + `src/notifications/senders/`

**Vấn đề:** Tách biệt **nội dung thông báo** khỏi **kênh gửi** (Email, SMS, In-app).

**Giải pháp:** Lớp trừu tượng `BaseNotification` chứa đối tượng `sender` (kiểu `MessageSender`). Các lớp con (`JobApprovedNotification`, `ApplicationStatusNotification`,...) chỉ cần định nghĩa nội dung, rồi gọi `this.sender.sendMessage()`. Muốn thêm kênh SMS thì chỉ cần tạo thêm `SMSSender` mà không sửa bất kỳ Notification class nào.

### 3. 🔒 Singleton Pattern (Mẫu Độc Bản)

> **File:** `src/services/*.js`, `src/config/database.js`

**Vấn đề:** Tránh khởi tạo nhiều instance không cần thiết gây rò rỉ bộ nhớ.

**Giải pháp:** Mỗi file Service export ra `export default new ServiceName()` — đảm bảo toàn bộ ứng dụng chỉ dùng đúng 1 instance duy nhất.

### 4. 👁 Observer Pattern (Mẫu Quan Sát)

> **File:** Tính năng **Follow Company** + `NotificationFacade.sendNewJobToFollowersNotification()`

**Vấn đề:** Khi công ty đăng tin mới được duyệt, tất cả ứng viên đang theo dõi cần được thông báo.

**Giải pháp:** Công ty (Subject) → Followers (Observers). Khi trạng thái thay đổi (job approved), hệ thống tự động duyệt danh sách followers và phát thông báo email + in-app cho từng người.

---

## 🗃 Mô Hình Cơ Sở Dữ Liệu

Sử dụng **Mongoose ODM** ánh xạ các Class thành MongoDB Documents:

```
┌──────────┐     1:N      ┌──────────┐     1:N      ┌──────────────┐
│   User   │─────────────►│ Company  │─────────────►│     Job      │
│(Candidate│              │          │              │              │
│ Employer │              └──────────┘              └──────┬───────┘
│  Admin)  │                   │                           │
└────┬─────┘                   │ M:N                       │ N:M
     │                    ┌────┴────────┐            ┌─────┴────────┐
     │                    │FollowCompany│            │ Application  │
     │                    └─────────────┘            │(CV, Status)  │
     │                                               └──────────────┘
     │ 1:N           1:N            1:N
  ┌──┴───┐      ┌────┴────┐    ┌────┴──────┐
  │  CV  │      │SavedJob │    │Notification│
  └──────┘      └─────────┘    └───────────┘
```

| Model | Mô tả | Thuộc tính chính |
|-------|--------|------------------|
| **User** | Người dùng (3 roles) | name, email, password (bcrypt), role, avatar, profile |
| **Company** | Thông tin doanh nghiệp | name, logo, cover, industry, size, employer_id |
| **Job** | Tin tuyển dụng | title, slug, description, salary, type, status, views |
| **Application** | Đơn ứng tuyển | candidate_id, job_id, cv_id, status, cover_letter |
| **CV** | Hồ sơ xin việc (PDF) | candidate_id, file_url, title |
| **Category** | Danh mục ngành nghề | name, icon, icon_color, bg_color |
| **Notification** | Thông báo hệ thống | user_id, title, message, type, is_read |
| **FollowCompany** | Theo dõi công ty | user_id, company_id (compound unique index) |
| **SavedJob** | Lưu tin tuyển dụng | candidate_id, job_id |
| **Post** | Bài viết Blog | title, content, author_id, category |
| **Setting** | Cấu hình website | site_name, logo, SEO, header_menu |

---

## ✨ Tính Năng Chi Tiết

### 🧑‍💻 Ứng Viên (Candidate)
- ✅ Đăng ký / Đăng nhập (JWT + Refresh Token + Cloudflare Captcha)
- ✅ Tìm kiếm việc làm nâng cao (Full-text search, lọc lương, ngành, loại hình)
- ✅ Xem chi tiết tin tuyển dụng (tự động đếm lượt xem)
- ✅ Nộp hồ sơ ứng tuyển (chọn CV + thư giới thiệu)
- ✅ Upload & quản lý CV (chỉ nhận PDF)
- ✅ Lưu tin yêu thích
- ✅ Theo dõi công ty → nhận thông báo khi có job mới
- ✅ Nhận thông báo chuông + email khi trạng thái hồ sơ thay đổi
- ✅ Dashboard thống kê cá nhân

### 🏢 Nhà Tuyển Dụng (Employer)
- ✅ Đăng ký doanh nghiệp (Xác minh OTP email)
- ✅ Xác minh Giấy phép kinh doanh (Upload + Admin duyệt)
- ✅ CRUD tin tuyển dụng (Rich Text Editor)
- ✅ Quản lý ứng viên: Xem CV, đổi trạng thái (Chờ → Phỏng vấn → Chấp nhận / Từ chối)
- ✅ Hệ thống thông báo chuông khi có ứng viên mới
- ✅ Gửi email tự động cho ứng viên khi đổi trạng thái
- ✅ Dashboard thống kê: Số tin đang chạy, lượt xem, số ứng viên
- ✅ Quản lý hồ sơ công ty (Logo, Cover, Mô tả, Video YouTube)

### ⚙️ Quản Trị Viên (Admin)
- ✅ Kiểm duyệt Công ty & Tin tuyển dụng (PENDING → APPROVED / REJECTED)
- ✅ Quản lý toàn bộ User (CRUD, Ban/Unban)
- ✅ Quản lý danh mục ngành nghề
- ✅ Quản lý Blog & Bài viết (CMS tích hợp)
- ✅ Tùy chỉnh giao diện Website (Logo, Banner, Menu, SEO)
- ✅ Cấu hình hệ thống (Settings)
- ✅ Dashboard tổng quan với biểu đồ thống kê (Recharts)

### 🔔 Hệ Thống Thông Báo (Notification System)
- ✅ **Khi ứng viên nộp hồ sơ:** Nhà tuyển dụng nhận thông báo chuông + email
- ✅ **Khi NTD đổi trạng thái:** Ứng viên nhận thông báo chuông + email
- ✅ **Khi job được duyệt:** Nhà tuyển dụng nhận thông báo
- ✅ **Khi job mới ở công ty đang follow:** Ứng viên nhận email
- ✅ **Khi công ty được duyệt:** Nhà tuyển dụng nhận thông báo

---

## 🛠 Công Nghệ Sử Dụng

### Backend
| Công nghệ | Phiên bản | Mục đích |
|-----------|-----------|----------|
| Node.js | v18+ | Runtime JavaScript |
| Express.js | v5.x | RESTful API Framework |
| MongoDB | v7+ | NoSQL Database |
| Mongoose | v9.x | ODM (Object Document Mapping) |
| JWT | v9.x | Authentication & Authorization |
| Bcrypt.js | v3.x | Mã hóa mật khẩu |
| Nodemailer | v9.x | Gửi email SMTP |
| Multer | v2.x | Upload file |
| Sharp | v0.35 | Xử lý & tối ưu hình ảnh |
| Helmet | v8.x | Bảo mật HTTP headers |
| Morgan | v1.x | Logging HTTP requests |

### Frontend
| Công nghệ | Phiên bản | Mục đích |
|-----------|-----------|----------|
| React.js | v19.x | UI Library |
| Vite | v8.x | Build Tool (HMR siêu nhanh) |
| Tailwind CSS | v4.x | Utility-first CSS Framework |
| Ant Design | v6.x | Enterprise UI Components |
| React Router | v6.x | Client-side Routing (SPA) |
| Recharts | v3.x | Biểu đồ thống kê Dashboard |
| React Quill | v3.x | Rich Text Editor (WYSIWYG) |
| React Helmet | v3.x | SEO Management |

---

## 📁 Cấu Trúc Thư Mục

```
VinJobs/
├── backend-vinjobs/
│   ├── app.js                    # Express app configuration
│   ├── server.js                 # Entry point
│   ├── seed.js                   # Database seeder (demo data)
│   └── src/
│       ├── config/               # Database connection (Singleton)
│       ├── controllers/          # HTTP Request handlers
│       ├── facades/              # RecruitmentFacade
│       ├── middlewares/          # Auth, Error, Upload middlewares
│       ├── models/               # Mongoose schemas (11 models)
│       ├── notifications/
│       │   ├── BaseNotification.js
│       │   ├── senders/          # EmailSender (Bridge Pattern)
│       │   └── types/            # 8 notification types
│       ├── patterns/
│       │   └── facade/           # NotificationFacade
│       ├── routes/               # API route definitions
│       ├── services/             # Business logic layer
│       └── utils/                # AppError, helpers
│
├── frontend-vinjobs/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/             # RouteGuards (Protected, Role, Guest)
│   │   │   ├── layout/           # Header, Footer, Sidebar, DashboardLayout
│   │   │   └── ui/               # Reusable UI components
│   │   ├── contexts/             # AuthContext, SettingsContext
│   │   ├── hooks/                # Custom hooks (useProvinces)
│   │   ├── lib/                  # API client (Axios + Interceptors)
│   │   ├── pages/
│   │   │   ├── admin/            # Admin dashboard pages
│   │   │   ├── auth/             # Login, Register, ForgotPassword
│   │   │   ├── candidate/        # Candidate dashboard pages
│   │   │   ├── employer/         # Employer dashboard pages
│   │   │   └── public/           # Home, Jobs, Companies, Blog, FAQ
│   │   ├── services/             # ImageUpload, Location services
│   │   ├── App.jsx               # Root component + Routing
│   │   └── main.jsx              # Entry point
│   └── public/                   # Static assets
│
└── README.md
```

---

## 🚀 Hướng Dẫn Cài Đặt

### Yêu Cầu Môi Trường
- **Node.js** v18 trở lên
- **MongoDB** (Local hoặc MongoDB Atlas)
- **npm** hoặc **yarn**

### Bước 1: Clone Repository

```bash
git clone https://github.com/phamkhoa18/vinjobs.git
cd vinjobs
```

### Bước 2: Cài Đặt & Khởi Chạy Backend

```bash
cd backend-vinjobs
npm install
```

Tạo file `.env` với nội dung:

```env
PORT=5000
DATABASE_URL=mongodb://localhost:27017/vinjobs
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_refresh_secret_key_here
CLIENT_URL=http://localhost:5173

# Email (SMTP Gmail)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
```

Khởi chạy server:

```bash
npm run dev
```

> Server chạy tại `http://localhost:5000`

### Bước 3: Seed Dữ Liệu Demo (Tùy chọn)

```bash
node seed.js
```

> Tự động tạo: 14 danh mục, 15 nhà tuyển dụng, 20 ứng viên, 15 công ty, ~90 tin tuyển dụng kèm ảnh thật.

### Bước 4: Cài Đặt & Khởi Chạy Frontend

```bash
cd ../frontend-vinjobs
npm install
npm run dev
```

> Website chạy tại `http://localhost:5173`

---

## 🔑 Tài Khoản Demo

Sau khi chạy `seed.js`, bạn có thể đăng nhập với các tài khoản sau:

### Nhà Tuyển Dụng

| Email | Mật khẩu |
|-------|----------|
| employer1@vinjobs.com | password123 |
| employer2@vinjobs.com | password123 |
| ... đến employer15@vinjobs.com | password123 |

### Ứng Viên

| Email | Mật khẩu |
|-------|----------|
| candidate1@vinjobs.com | password123 |
| candidate2@vinjobs.com | password123 |
| ... đến candidate20@vinjobs.com | password123 |

### Admin
> Tài khoản Admin được tạo riêng, không nằm trong seed.

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/v1/auth/register` | Đăng ký tài khoản |
| POST | `/api/v1/auth/login` | Đăng nhập |
| POST | `/api/v1/auth/verify-email` | Xác thực OTP email |
| POST | `/api/v1/auth/refresh-token` | Làm mới access token |

### Jobs
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/v1/jobs` | Tìm kiếm việc làm |
| GET | `/api/v1/jobs/:id` | Chi tiết tin tuyển dụng |
| GET | `/api/v1/jobs/categories` | Danh mục ngành nghề |
| POST | `/api/v1/jobs` | Đăng tin (Employer) |
| PATCH | `/api/v1/jobs/:id` | Cập nhật tin |
| DELETE | `/api/v1/jobs/:id` | Xóa tin |

### Applications
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/v1/applications` | Nộp hồ sơ ứng tuyển |
| GET | `/api/v1/applications/me` | Lịch sử ứng tuyển (Candidate) |
| GET | `/api/v1/applications/employer/all` | Danh sách ứng viên (Employer) |
| PATCH | `/api/v1/applications/:id/status` | Đổi trạng thái hồ sơ |

### Companies
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/v1/companies` | Danh sách công ty |
| GET | `/api/v1/companies/top` | Top công ty nổi bật |
| POST | `/api/v1/companies/:id/follow` | Theo dõi công ty |

### Users & Notifications
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/v1/users/me` | Thông tin cá nhân |
| GET | `/api/v1/users/me/notifications` | Danh sách thông báo |
| PATCH | `/api/v1/users/me/notifications/read-all` | Đánh dấu đã đọc |

---

## 📝 Ghi Chú

- Tất cả tính năng trên VinJobs đều **hoàn toàn miễn phí** cho cả ứng viên và nhà tuyển dụng.
- Hệ thống sử dụng **JWT** với cơ chế **Access Token + Refresh Token** (httpOnly Cookie) để bảo mật.
- Upload ảnh sử dụng **Sharp** để tối ưu hóa (nén WebP) trước khi lưu trữ.
- Upload CV chỉ chấp nhận file **PDF**.
- Mọi Công ty và Tin tuyển dụng phải qua bước **kiểm duyệt Admin** trước khi hiển thị công khai.

---

<div align="center">

*Dự án được xây dựng tập trung vào kiến trúc Phần Mềm Hướng Đối Tượng, đảm bảo tính đóng gói (Encapsulation), kế thừa (Inheritance) và đa hình (Polymorphism) chặt chẽ giữa các thành phần.*

**© 2026 VinJobs — All Rights Reserved**

</div>

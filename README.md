# 🚀 VinJobs — Nền Tảng Tuyển Dụng & Tìm Việc Làm

<div align="center">

![VinJobs](vinjobs_scale.png)

**Hệ thống tuyển dụng trực tuyến toàn diện xây dựng trên MERN Stack**
**MongoDB · Express.js · React.js · Node.js**

[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-v7+-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express-v5-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

</div>

---

## 📋 Mục Lục

- [Giới Thiệu](#-giới-thiệu)
- [Kiến Trúc Hệ Thống](#-kiến-trúc-hệ-thống)
- [Thiết Kế Hướng Đối Tượng & Design Patterns](#-thiết-kế-hướng-đối-tượng--design-patterns)
- [Mô Hình Cơ Sở Dữ Liệu](#-mô-hình-cơ-sở-dữ-liệu)
- [Tính Năng Chi Tiết](#-tính-năng-chi-tiết)
- [Bảo Mật Hệ Thống](#-bảo-mật-hệ-thống)
- [Công Nghệ Sử Dụng](#-công-nghệ-sử-dụng)
- [Cấu Trúc Thư Mục](#-cấu-trúc-thư-mục)
- [Hướng Dẫn Cài Đặt](#-hướng-dẫn-cài-đặt)
- [Biến Môi Trường](#-biến-môi-trường)
- [Tài Khoản Demo](#-tài-khoản-demo)
- [API Endpoints](#-api-endpoints)

---

## 📖 Giới Thiệu

**VinJobs** là một nền tảng công nghệ tuyển dụng hiện đại, hoàn toàn **miễn phí**, được thiết kế và phát triển theo mô hình **MERN Stack** với trọng tâm là **Thiết kế Phần mềm Hướng Đối Tượng (OOD)** và **Bảo mật Web (Web Security)**. Hệ thống áp dụng chặt chẽ các Mẫu thiết kế (Design Patterns) của GoF và triển khai 7 tầng bảo mật để đảm bảo an toàn cho người dùng.

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

> **File:** `src/facades/NotificationFacade.js`

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
- ✅ Đăng nhập bằng Google (OAuth 2.0)
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

## 🔐 Bảo Mật Hệ Thống

### Kiến trúc bảo mật 7 tầng (Defense in Depth)

```
┌─────────────────────────────────────────────────┐
│  Tầng 1: Helmet — HTTP Security Headers         │
│  ┌─────────────────────────────────────────────┐ │
│  │  Tầng 2: CORS — Origin Whitelist            │ │
│  │  ┌─────────────────────────────────────────┐ │ │
│  │  │  Tầng 3: Rate Limiting — Chống DDoS     │ │ │
│  │  │  ┌─────────────────────────────────────┐ │ │ │
│  │  │  │  Tầng 4: CAPTCHA — Chống Bot        │ │ │ │
│  │  │  │  ┌─────────────────────────────────┐ │ │ │ │
│  │  │  │  │  Tầng 5: JWT — Authentication   │ │ │ │ │
│  │  │  │  │  ┌─────────────────────────────┐ │ │ │ │ │
│  │  │  │  │  │  Tầng 6: RBAC — Role Auth   │ │ │ │ │ │
│  │  │  │  │  │  ┌─────────────────────────┐ │ │ │ │ │ │
│  │  │  │  │  │  │  Tầng 7: Input Valid.   │ │ │ │ │ │ │
│  │  │  │  │  │  │  + XSS Prevention      │ │ │ │ │ │ │
│  │  │  │  │  │  │  + bcrypt password      │ │ │ │ │ │ │
│  │  │  │  │  │  │                         │ │ │ │ │ │ │
│  │  │  │  │  │  │   🎯 Business Logic    │ │ │ │ │ │ │
│  │  │  │  │  │  └─────────────────────────┘ │ │ │ │ │ │
│  │  │  │  │  └─────────────────────────────┘ │ │ │ │ │
│  │  │  │  └─────────────────────────────────┘ │ │ │ │
│  │  │  └─────────────────────────────────────┘ │ │ │
│  │  └─────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

### Token & Thời Gian Sống

| Token/Secret | Thời gian sống | Nơi lưu (Client) | Nơi lưu (Server) | Mục đích |
|-------------|---------------|-------------------|-------------------|----------|
| **Access Token (JWT)** | **15 phút** | `localStorage` | Không lưu (stateless) | Xác thực mỗi API request |
| **Refresh Token (JWT)** | **7 ngày** | `httpOnly` cookie | Không lưu (stateless) | Cấp Access Token mới |
| **OTP (6 số)** | **10 phút** | Email (plaintext) | MongoDB (SHA-256 hash) | Xác thực email đăng ký |
| **Password Reset Token** | **10 phút** | URL link trong email | MongoDB (SHA-256 hash) | Đặt lại mật khẩu |
| **CAPTCHA Token** | ~5 phút | React state | Verify qua Cloudflare | Chống bot |
| **Mật khẩu** | Vĩnh viễn | Không lưu | MongoDB (bcrypt, cost=12) | Xác thực đăng nhập |

### Flow Đăng Nhập

```
Người dùng                   Frontend                    Backend                    Database
    │                           │                           │                          │
    │── Nhập email + password ─►│                           │                          │
    │── Giải CAPTCHA ──────────►│                           │                          │
    │── Bấm "Đăng nhập" ──────►│                           │                          │
    │                           │── POST /auth/login ──────►│                          │
    │                           │   {email, pass, captcha}  │                          │
    │                           │                           │── loginLimiter ──────────►│
    │                           │                           │   (5 req/15min/IP)       │
    │                           │                           │── verifyCaptcha ─► Cloudflare
    │                           │                           │── bcrypt.compare() ──────►│
    │                           │                           │   (so sánh password hash) │
    │                           │                           │                          │
    │                           │                           │◄─ User document ─────────│
    │                           │                           │                          │
    │                           │                           │── jwt.sign(id, SECRET, 15m)
    │                           │                           │── jwt.sign(id, REFRESH_SECRET, 7d)
    │                           │                           │                          │
    │                           │◄── 200 {token, user} ────│                          │
    │                           │    + Set-Cookie: jwt_refresh (httpOnly)              │
    │                           │                           │                          │
    │                           │── localStorage['vj_token'] = accessToken            │
    │                           │── localStorage['vj_user'] = user                    │
    │                           │── setUser(user) → React state                       │
    │                           │                           │                          │
    │◄── Redirect → Dashboard ─│                           │                          │
```

### Flow Refresh Token (Silent Refresh)

Khi Access Token hết hạn (sau 15 phút), hệ thống tự động refresh mà user không cần đăng nhập lại:

```
1. Client kiểm tra token trước mỗi API call: isTokenValid(token)?
2. Nếu hết hạn → POST /auth/refresh-token (cookie jwt_refresh tự động gửi)
3. Backend verify refresh token → sinh Access Token mới (15 phút)
4. Client cập nhật token mới → retry request ban đầu
5. Nếu cả Refresh Token cũng hết hạn → redirect /login?expired=true
```

**Hai lớp bảo vệ:**
- **Lớp 1 (Client):** Decode JWT payload, kiểm tra `exp` trước khi gọi API → tiết kiệm 1 HTTP request
- **Lớp 2 (Server):** Nếu backend trả 401 → tự động retry với refresh token

### Chống tấn công

| Kiểu tấn công | Cơ chế bảo vệ | File |
|---------------|---------------|------|
| **Brute-force** | Rate Limiting (5/15min) + CAPTCHA + bcrypt (cost=12) | `rateLimiter.js`, `captchaMiddleware.js` |
| **XSS (Stored)** | DOMPurify sanitize tất cả `dangerouslySetInnerHTML` (18 điểm) | `api.js` (frontend) |
| **XSS (Email)** | `escapeHtml()` cho user input trong email template | `security.js` (backend) |
| **NoSQL Injection** | Mongoose ODM + `escapeRegex()` | `security.js` |
| **ReDoS** | `escapeRegex()` trước khi dùng `new RegExp()` | `adminRoutes.js` |
| **CSRF** | SameSite=Lax cookie + CORS origin check | `app.js`, `AuthController.js` |
| **DDoS** | Global Rate Limit (200 req/1h/IP) | `app.js` |
| **Bot/Spam** | Cloudflare Turnstile CAPTCHA | `captchaMiddleware.js` |
| **Clickjacking** | Helmet `X-Frame-Options` | `app.js` |
| **Open Redirect** | `returnUrl` validation (only relative paths) | `AdminLoginPage.jsx` |
| **Token Theft** | Short-lived Access (15m) + httpOnly Refresh cookie | `AuthService.js` |
| **Password Leak** | bcrypt hash + `select: false` (never in API response) | `User.js` |

### Phân quyền RBAC (Role-Based Access Control)

```
Request → protect (JWT verify) → restrictTo('ADMIN') → Controller
                ↓                        ↓
          401 Unauthorized         403 Forbidden
```

| Role | Route Prefix | Quyền |
|------|-------------|-------|
| `CANDIDATE` | `/candidate/*` | Tìm/ứng tuyển job, quản lý CV |
| `EMPLOYER` | `/employer/*` | Đăng job, quản lý ứng viên |
| `ADMIN` | `/admin/*` | Toàn quyền CRUD |

**Frontend Route Guards:**
- `ProtectedRoute` — Yêu cầu đăng nhập
- `RoleRoute` — Yêu cầu đăng nhập + đúng role
- `VerifiedEmployerRoute` — Employer + company đã được duyệt
- `GuestRoute` — Chỉ cho phép khi chưa đăng nhập (login/register pages)

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
| Bcrypt.js | v3.x | Mã hóa mật khẩu (cost factor = 12) |
| Nodemailer | v9.x | Gửi email SMTP |
| Multer | v2.x | Upload file |
| Sharp | v0.35 | Xử lý & tối ưu hình ảnh (WebP) |
| Helmet | v8.x | Bảo mật HTTP headers |
| express-rate-limit | — | Rate Limiting / chống DDoS |
| cookie-parser | — | Parse httpOnly cookies |
| Morgan | v1.x | Logging HTTP requests |

### Frontend
| Công nghệ | Phiên bản | Mục đích |
|-----------|-----------|----------|
| React.js | v19.x | UI Library |
| Vite | v8.x | Build Tool (HMR siêu nhanh) |
| Tailwind CSS | v4.x | Utility-first CSS Framework |
| Ant Design | v6.x | Enterprise UI Components |
| React Router | v6.x | Client-side Routing (SPA) |
| DOMPurify | v3.x | XSS Prevention (sanitize HTML) |
| Recharts | v3.x | Biểu đồ thống kê Dashboard |
| React Quill | v3.x | Rich Text Editor (WYSIWYG) |
| @marsidev/react-turnstile | — | Cloudflare CAPTCHA widget |
| @react-oauth/google | — | Google OAuth 2.0 login |

### External Services
| Dịch vụ | Mục đích |
|---------|----------|
| Cloudflare Turnstile | CAPTCHA chống bot |
| Google OAuth 2.0 | Đăng nhập bằng Google |
| SMTP (Gmail) | Gửi email OTP, thông báo |

---

## 📁 Cấu Trúc Thư Mục

```
VinJobs/
├── backend-vinjobs/
│   ├── app.js                    # Express app (Helmet, CORS, Rate Limit)
│   ├── server.js                 # Entry point + MongoDB connect
│   ├── seed.js                   # Database seeder (demo data)
│   └── src/
│       ├── config/
│       │   ├── database.js       # MongoDB connection (Singleton)
│       │   └── env.js            # Environment validation (fail-fast)
│       ├── controllers/          # HTTP Request handlers
│       │   ├── AuthController.js # Login, Register, JWT, Refresh Token
│       │   └── ...
│       ├── facades/
│       │   ├── NotificationFacade.js  # Facade Pattern
│       │   └── RecruitmentFacade.js
│       ├── middlewares/
│       │   ├── authMiddleware.js      # JWT verify + RBAC (protect, restrictTo)
│       │   ├── captchaMiddleware.js   # Cloudflare Turnstile verify
│       │   ├── rateLimiter.js         # Login/Register/OTP rate limiters
│       │   ├── errorMiddleware.js     # Global error handler
│       │   └── uploadMiddleware.js    # Multer file upload
│       ├── models/               # Mongoose schemas (11 models)
│       │   ├── User.js           # bcrypt pre-save hook, password reset token
│       │   └── ...
│       ├── notifications/
│       │   ├── BaseNotification.js    # Abstract class (Bridge Pattern)
│       │   ├── MessageSender.js       # Abstract sender
│       │   ├── senders/              # EmailSender implementation
│       │   └── types/                # 8 notification types
│       ├── routes/
│       │   ├── authRoutes.js     # Auth endpoints + middleware chain
│       │   ├── adminRoutes.js    # Admin-only (protect + restrictTo('ADMIN'))
│       │   └── ...
│       ├── services/             # Business logic layer (Singleton)
│       │   ├── AuthService.js    # JWT sign, OTP, bcrypt, Google OAuth
│       │   └── ...
│       └── utils/
│           ├── AppError.js       # Custom error class
│           ├── security.js       # escapeRegex, escapeHtml
│           └── email.js          # Nodemailer transporter
│
├── frontend-vinjobs/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   └── RouteGuards.jsx    # Protected, Role, Guest, VerifiedEmployer
│   │   │   ├── layout/               # Header, Footer, Sidebar, AdminLayout
│   │   │   └── ui/                    # Reusable UI components
│   │   ├── contexts/
│   │   │   ├── AuthContext.jsx        # Auth state management + JWT flow
│   │   │   └── SettingsContext.jsx
│   │   ├── hooks/                     # Custom hooks (useProvinces)
│   │   ├── lib/
│   │   │   └── api.js                 # HTTP client + sanitizeHtml + tokenStorage
│   │   ├── pages/
│   │   │   ├── admin/                 # Admin dashboard (8 pages)
│   │   │   ├── auth/                  # Login, Register, ForgotPassword, AdminLogin
│   │   │   ├── candidate/             # Candidate dashboard (5 pages)
│   │   │   ├── employer/              # Employer dashboard (6 pages)
│   │   │   └── public/                # Home, Jobs, Companies, Blog, FAQ
│   │   ├── services/                  # LocationService, ImageUpload
│   │   ├── utils/                     # Formatters, helpers
│   │   ├── App.jsx                    # Root component + Routing
│   │   └── main.jsx                   # Entry point + env validation
│   └── public/                        # Static assets
│
├── .gitignore
├── README.md
└── vinjobs_scale.png
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

Tạo file `.env`:

```env
# Server
PORT=8000
NODE_ENV=development

# Database
DATABASE_URL=mongodb://localhost:27017/vinjobs

# JWT (BẮT BUỘC — Server sẽ crash nếu thiếu)
JWT_SECRET=your_jwt_secret_key_at_least_32_chars_long
JWT_REFRESH_SECRET=your_refresh_secret_key_different_from_above
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
JWT_REFRESH_COOKIE_EXPIRES_IN=7

# Frontend URL (CORS)
CLIENT_URL=http://localhost:5173

# Email (SMTP Gmail)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_FROM=VinJobs <noreply@vinjobs.com>

# Cloudflare Turnstile (CAPTCHA)
TURNSTILE_SECRET_KEY=your_turnstile_secret_key

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
```

Khởi chạy server:

```bash
npm run dev
```

> Server chạy tại `http://localhost:8000`

### Bước 3: Seed Dữ Liệu Demo (Tùy chọn)

```bash
node seed.js
```

> Tự động tạo: 14 danh mục, 15 nhà tuyển dụng, 20 ứng viên, 15 công ty, ~90 tin tuyển dụng kèm ảnh thật.

### Bước 4: Cài Đặt & Khởi Chạy Frontend

```bash
cd ../frontend-vinjobs
npm install
```

Tạo file `.env`:

```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_BACKEND_URL=http://localhost:8000
VITE_TURNSTILE_SITE_KEY=your_turnstile_site_key
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

Khởi chạy:

```bash
npm run dev
```

> Website chạy tại `http://localhost:5173`

---

## ⚙️ Biến Môi Trường

### Backend

| Biến | Bắt buộc | Mô tả | Mặc định |
|------|----------|-------|----------|
| `JWT_SECRET` | ✅ | Secret key cho Access Token (≥ 32 ký tự) | — |
| `JWT_REFRESH_SECRET` | ✅ | Secret key cho Refresh Token | — |
| `DATABASE_URL` | ✅ | MongoDB connection string | — |
| `JWT_EXPIRES_IN` | ❌ | Access Token TTL | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | ❌ | Refresh Token TTL | `7d` |
| `TURNSTILE_SECRET_KEY` | ❌ | Cloudflare CAPTCHA secret | Testing key (always pass) |
| `GOOGLE_CLIENT_ID` | ❌ | Google OAuth Client ID | — |
| `CLIENT_URL` | ❌ | Frontend URL (CORS) | `http://localhost:5173` |

> ⚠️ **Lưu ý:** Server sẽ **crash ngay lập tức** nếu thiếu `JWT_SECRET`, `JWT_REFRESH_SECRET`, hoặc `DATABASE_URL` (fail-fast design).

### Frontend

| Biến | Mô tả | Mặc định |
|------|-------|----------|
| `VITE_API_URL` | Backend API URL | `http://localhost:8000/api/v1` |
| `VITE_BACKEND_URL` | Backend base URL (cho ảnh) | `http://localhost:8000` |
| `VITE_TURNSTILE_SITE_KEY` | Cloudflare Turnstile public key | Testing key |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID | — |

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

### Authentication (`/api/v1/auth`)
| Method | Endpoint | Middleware | Mô tả |
|--------|----------|-----------|-------|
| POST | `/register` | `registerLimiter` + `verifyCaptcha` | Đăng ký tài khoản |
| POST | `/login` | `loginLimiter` + `verifyCaptcha` | Đăng nhập |
| POST | `/verify-email` | `otpVerifyLimiter` | Xác thực OTP email |
| POST | `/resend-otp` | `otpLimiter` | Gửi lại mã OTP |
| POST | `/google` | `loginLimiter` | Đăng nhập bằng Google |
| POST | `/google/register` | `registerLimiter` | Đăng ký bằng Google |
| POST | `/check-email` | — | Kiểm tra email đã tồn tại |
| POST | `/logout` | — | Đăng xuất (xóa refresh cookie) |
| POST | `/refresh-token` | — | Làm mới Access Token |
| POST | `/forgot-password` | `otpLimiter` | Yêu cầu reset mật khẩu |
| PATCH | `/reset-password/:token` | — | Đặt lại mật khẩu mới |
| GET | `/me` | `protect` | Lấy thông tin user hiện tại |

### Jobs (`/api/v1/jobs`)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/` | Tìm kiếm việc làm (public) |
| GET | `/:slug` | Chi tiết tin tuyển dụng |
| GET | `/categories` | Danh mục ngành nghề |
| POST | `/` | Đăng tin (Employer, protect) |
| PATCH | `/:id` | Cập nhật tin |
| DELETE | `/:id` | Xóa tin |

### Applications (`/api/v1/applications`)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/` | Nộp hồ sơ ứng tuyển (Candidate) |
| GET | `/me` | Lịch sử ứng tuyển |
| GET | `/employer/all` | Danh sách ứng viên (Employer) |
| PATCH | `/:id/status` | Đổi trạng thái hồ sơ |

### Companies (`/api/v1/companies`)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/` | Danh sách công ty (public) |
| GET | `/top` | Top công ty nổi bật |
| GET | `/:id` | Chi tiết công ty |
| POST | `/:id/follow` | Theo dõi / Bỏ theo dõi |

### Admin (`/api/v1/admin`) — Yêu cầu `protect + restrictTo('ADMIN')`
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/stats` | Dashboard thống kê tổng quan |
| GET | `/users` | Danh sách users |
| PATCH | `/users/:id/status` | Block/Unblock user |
| GET | `/companies` | Danh sách công ty |
| PATCH | `/companies/:id/status` | Duyệt/Từ chối công ty |
| GET | `/jobs` | Danh sách tin tuyển dụng |
| PATCH | `/jobs/:id/status` | Duyệt/Từ chối tin |
| GET/POST/PATCH/DELETE | `/categories/*` | CRUD danh mục |

---

## 📝 Ghi Chú

- Tất cả tính năng trên VinJobs đều **hoàn toàn miễn phí** cho cả ứng viên và nhà tuyển dụng.
- Hệ thống sử dụng **JWT** với cơ chế **Access Token (15m) + Refresh Token (7d, httpOnly Cookie)** để bảo mật.
- Upload ảnh sử dụng **Sharp** để tối ưu hóa (nén WebP) trước khi lưu trữ.
- Upload CV chỉ chấp nhận file **PDF**.
- Mọi Công ty và Tin tuyển dụng phải qua bước **kiểm duyệt Admin** trước khi hiển thị công khai.
- Tất cả HTML content (job descriptions, blog posts, company descriptions) đều được **sanitize bằng DOMPurify** trước khi render để chống XSS.
- Biến môi trường bảo mật được **validate khi server khởi động** (fail-fast) — không sử dụng fallback/hardcoded secrets.

---

<div align="center">

*Dự án được xây dựng tập trung vào Kiến trúc Phần Mềm Hướng Đối Tượng và Bảo Mật Web, đảm bảo tính đóng gói (Encapsulation), kế thừa (Inheritance), đa hình (Polymorphism) và phòng thủ theo chiều sâu (Defense in Depth).*

**© 2026 VinJobs — All Rights Reserved**

</div>

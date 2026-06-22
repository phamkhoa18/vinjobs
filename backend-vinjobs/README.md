# VinJobs Backend API

**Stack**: Node.js (ES Module) · Express 5 · MongoDB (Mongoose) · JWT

## Yêu cầu
- Node.js v18+
- MongoDB đang chạy (local hoặc Atlas)

## Khởi động nhanh

```bash
# 1. Vào thư mục backend
cd backend-vinjobs

# 2. Cài dependencies (nếu chưa)
npm install

# 3. Kiểm tra / chỉnh .env
# Mặc định dùng mongodb://localhost:27017/vinjobs

# 4. Chạy development mode (auto-reload)
npm run dev

# Hoặc chạy production
npm start
```

Server sẽ chạy tại: http://localhost:8000

## API Endpoints

### Auth
| Method | Path | Mô tả |
|--------|------|--------|
| POST | `/api/v1/auth/register` | Đăng ký (CANDIDATE / EMPLOYER) |
| POST | `/api/v1/auth/login` | Đăng nhập |
| GET | `/api/v1/auth/me` | Lấy thông tin cá nhân (cần token) |

**Body đăng ký ứng viên:**
```json
{
  "name": "Nguyễn Văn A",
  "email": "test@gmail.com",
  "password": "12345678",
  "phone": "0901234567",
  "role": "CANDIDATE"
}
```

**Body đăng ký nhà tuyển dụng:**
```json
{
  "name": "HR Manager",
  "email": "hr@company.com",
  "password": "12345678",
  "phone": "0901234567",
  "role": "EMPLOYER",
  "companyName": "ABC Corp"
}
```

### Jobs (Public)
| Method | Path | Mô tả |
|--------|------|--------|
| GET | `/api/v1/jobs` | Danh sách việc làm (filter: keyword, location, type, level) |
| GET | `/api/v1/jobs/:id` | Chi tiết việc làm |

### Jobs (Employer)
| Method | Path | Mô tả |
|--------|------|--------|
| POST | `/api/v1/jobs` | Đăng tin tuyển dụng |
| PATCH | `/api/v1/jobs/:id` | Chỉnh sửa tin |
| DELETE | `/api/v1/jobs/:id` | Xoá tin |
| GET | `/api/v1/jobs/employer/mine` | Danh sách tin của tôi |

### Companies
| Method | Path | Mô tả |
|--------|------|--------|
| GET | `/api/v1/companies` | Danh sách công ty |
| GET | `/api/v1/companies/:id` | Chi tiết công ty + danh sách việc làm |
| POST | `/api/v1/companies` | Tạo trang công ty |
| PATCH | `/api/v1/companies/:id` | Cập nhật thông tin |

### Applications
| Method | Path | Mô tả |
|--------|------|--------|
| POST | `/api/v1/applications` | Ứng tuyển việc làm |
| GET | `/api/v1/applications/me` | Hồ sơ đã ứng tuyển (candidate) |
| GET | `/api/v1/applications/job/:jobId` | Danh sách ứng viên (employer) |
| PATCH | `/api/v1/applications/:id/status` | Cập nhật trạng thái |

### Admin
| Method | Path | Mô tả |
|--------|------|--------|
| GET | `/api/v1/admin/stats` | Thống kê dashboard |
| GET | `/api/v1/admin/users` | Quản lý người dùng |
| PATCH | `/api/v1/admin/users/:id/status` | Khoá / mở khoá tài khoản |
| GET | `/api/v1/admin/companies` | Quản lý công ty |
| PATCH | `/api/v1/admin/companies/:id/status` | Duyệt / từ chối công ty |
| GET | `/api/v1/admin/jobs` | Quản lý tin đăng |
| PATCH | `/api/v1/admin/jobs/:id/status` | Duyệt / từ chối tin |

## Health Check
```
GET http://localhost:8000/health
```

## File .env
```env
NODE_ENV=development
PORT=8000
DATABASE_URL=mongodb://localhost:27017/vinjobs
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=90d
CLIENT_URL=http://localhost:5173
```

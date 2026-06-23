# VinJobs - Hệ Thống Tuyển Dụng & Tìm Việc Làm (MERN Stack)

VinJobs là một nền tảng công nghệ tuyển dụng hiện đại được thiết kế và xây dựng theo mô hình **MERN Stack** (MongoDB, Express.js, React.js, Node.js). Hệ thống được phát triển với trọng tâm là **Thiết kế Phần mềm Hướng Đối Tượng (Object-Oriented Design - OOD)**, áp dụng chặt chẽ các Mẫu thiết kế (Design Patterns) để đảm bảo mã nguồn mở rộng, dễ bảo trì và tối ưu hiệu suất.

Hệ thống phục vụ 3 đối tượng người dùng chính: **Ứng viên (Candidate)**, **Nhà tuyển dụng (Employer)**, và **Quản trị viên (Admin)**.

---

## 1. Kiến Trúc Hệ Thống (System Architecture)

- **Kiến trúc Tổng thể:** Client - Server API.
- **Backend Architecture:** Sử dụng mô hình **MVC (Model-View-Controller)** mở rộng với **Service Layer**. 
  - *Controllers* chỉ làm nhiệm vụ tiếp nhận HTTP Request và phản hồi HTTP Response.
  - *Services* đóng gói toàn bộ logic nghiệp vụ (Business Logic).
- **Frontend Architecture:** Mô hình **Component-Based** của React kết hợp với **Context API** (Quản lý State toàn cục như phiên đăng nhập) và kỹ thuật phân tách UI Component độc lập.

---

## 2. Phân Tích Thiết Kế Hướng Đối Tượng (OOP & Design Patterns)

Dự án áp dụng mạnh mẽ các nguyên lý SOLID và các mẫu thiết kế hướng đối tượng kinh điển của GoF (Gang of Four).

### 2.1. Các Design Patterns Được Sử Dụng

1. **Facade Pattern (Mẫu Mặt Tiền)**
   - **Áp dụng:** Lớp `NotificationFacade` (`src/patterns/facade/NotificationFacade.js`).
   - **Lý do:** Khi hệ thống cần gửi thông báo (ví dụ: Job được duyệt), hệ thống phải thực hiện nhiều bước phức tạp: Tìm người dùng, khởi tạo `EmailSender`, khởi tạo `JobApprovedNotification`, gọi `NotificationService` để lưu DB và gửi.
   - **Tác dụng:** Cung cấp các giao diện tĩnh (Static Methods) cực kì đơn giản như `sendJobApprovedNotification(job, user)`. Các luồng Controller bên ngoài chỉ cần gọi 1 dòng code duy nhất, ẩn giấu đi toàn bộ sự phức tạp bên trong hệ thống.

2. **Strategy / Bridge Pattern (Mẫu Chiến Lược / Cây Cầu)**
   - **Áp dụng:** Hệ thống Notification. Lớp trừu tượng `BaseNotification` có chứa một đối tượng `sender` (kiểu `MessageSender`).
   - **Lý do:** Tách biệt cấu trúc của Thông báo (Gồm Tiêu đề, Nội dung) ra khỏi logic Gửi Thông báo (Qua Email, Qua SMS, In-app).
   - **Tác dụng:** Lớp `NewJobToFollowerNotification` chỉ cần tập trung định nghĩa nội dung HTML email, sau đó gọi `this.sender.send()`. Khác với cách code thủ tục truyền thống là nhét luôn hàm gửi email vào Controller.

3. **Singleton Pattern (Mẫu Độc Bản)**
   - **Áp dụng:** Các lớp Services (`JobService.js`, `CompanyService.js`) và Database Connection Object.
   - **Lý do:** Đảm bảo trong suốt vòng đời ứng dụng chỉ có duy nhất 1 phiên bản của đối tượng xử lý Database hoặc Logic, tránh rò rỉ bộ nhớ (Memory Leak) khi khởi tạo lại class liên tục.

4. **Observer Pattern (Mô phỏng Mẫu Quan Sát)**
   - **Áp dụng:** Tính năng **Follow Company**.
   - **Lý do:** Một Công ty (Subject) có nhiều Ứng viên theo dõi (Observers). Khi Công ty thay đổi trạng thái (Đăng tin tuyển dụng mới được duyệt), toàn bộ các Observers sẽ được thông báo ngay lập tức.
   - **Tác dụng:** Sự tách biệt hoàn hảo, luồng đăng Job không cần quan tâm ứng viên nào đang follow, mà chỉ cần phát ra sự kiện thông qua Facade.

### 2.2. Sơ Đồ Lớp và Các Lớp Đối Tượng (Models) Cốt Lõi

Backend sử dụng `Mongoose` như một **ORM/ODM** để ánh xạ các Class trong code Node.js trực tiếp thành các Document trong MongoDB.

* **Lớp `User`**: Đối tượng cơ sở quản lý thông tin định danh (Tên, Email, Password đã hash bằng Bcrypt, Role). Định nghĩa hàm instance `matchPassword()` đóng gói logic kiểm tra bảo mật bên trong Class.
* **Lớp `Company`**: Quản lý thông tin pháp nhân của doanh nghiệp (Tên, Mã số thuế, Logo, Cover). Liên kết 1-1 với `User` (Employer). Ứng dụng Encapsulation (Đóng gói) bằng Mongoose Virtuals và Pre-save Hooks để tự động tạo `slug` thân thiện URL.
* **Lớp `Job`**: Đối tượng Tin tuyển dụng. Chứa các thuộc tính nghiệp vụ (Salary, Location, Yêu cầu). Liên kết với `Company`.
* **Lớp `Application`**: Lớp ánh xạ mối quan hệ N-N giữa `User` (Ứng viên) và `Job`. Một Object Application chứa thông tin CV, Thư giới thiệu, và trạng thái phỏng vấn (Pending, Accepted, Rejected).
* **Lớp `FollowCompany`**: Đối tượng quản lý quan hệ M-N (Ứng viên - Công ty). Đảm bảo tính Uniqueness bằng Compound Indexing ở tầng Database.
* **Hệ thống Lớp Notifications**: Lớp cha `BaseNotification` và các lớp con kế thừa (Inheritance) như `JobApprovedNotification`, `NewJobToFollowerNotification`. Bắt buộc triển khai phương thức đa hình (Polymorphism) `send()`.

---

## 3. Tính Năng Nổi Bật

### 🧑‍💻 Dành cho Ứng viên (Candidate)
- **Đăng nhập & Xác thực:** Đăng nhập JWT an toàn, hỗ trợ Captcha và Phân quyền Guard Route chặt chẽ ở Frontend.
- **Theo dõi Công ty (Follow):** Tương tác Realtime với công ty yêu thích.
- **Tìm kiếm Việc làm Nâng cao:** Lọc theo ngành nghề, khu vực, mức lương. Tìm kiếm full-text search theo từ khóa.
- **Nộp Hồ sơ (Apply):** Quản lý trạng thái ứng tuyển.
- **Nhận Thông báo Tự động:** Nhận email khi công ty theo dõi có việc làm mới.

### 🏢 Dành cho Nhà Tuyển Dụng (Employer)
- **Quản lý Hồ sơ Công ty:** Đăng tải Logo, Banner, tích hợp Video giới thiệu công ty bằng Youtube.
- **CRUD Tin tuyển dụng:** Tích hợp Rich Text Editor (Wysiwyg). Quản lý chi tiết địa điểm hành chính theo Tỉnh/Huyện/Xã.
- **Quản lý CV & Trạng thái Ứng viên:** Duyệt hồ sơ và tương tác với các đơn ứng tuyển.

### ⚙️ Dành cho Quản Trị Viên (Admin)
- **Hệ thống Kiểm duyệt (Moderation):** Mọi công ty và tin đăng đều bắt buộc qua trạng thái `PENDING` và phải được Admin chuyển sang `APPROVED` mới hiển thị lên website.
- **Quản lý User:** Thống kê, giám sát và chặn (Ban) tài khoản vi phạm.
- **Dashboards:** Phân tích dữ liệu vận hành.

---

## 4. Công Nghệ Sử Dụng (Tech Stack)

### Backend
- **Node.js** & **Express.js** (RESTful API).
- **MongoDB** & **Mongoose** (Database & ODM).
- **Security:** `bcryptjs`, `jsonwebtoken`, `helmet`, `cors`.
- **Upload File:** `multer`, `cloudinary` API (Lưu trữ ảnh mây).
- **Email:** `nodemailer` (SMTP).

### Frontend
- **React.js 19** & **Vite** (Giao diện siêu tốc).
- **UI Frameworks:** **Tailwind CSS** (Utility-first CSS) & **Ant Design** (Enterprise-level UI Components).
- **HTTP Client:** `axios` (với Interceptors tự động đính kèm Token).
- **Routing:** `react-router-dom` v6.

---

## 5. Hướng Dẫn Cài Đặt (Local Development)

### Yêu Cầu Môi Trường
- **Node.js** (v18+)
- **MongoDB** (Local / MongoDB Atlas)

### Bước 1: Khởi chạy Backend
1. Chuyển thư mục: `cd backend-vinjobs`
2. Cài đặt thư viện: `npm install`
3. Tạo file `.env` và thiết lập các biến môi trường:
   ```env
   PORT=5000
   DATABASE_URL=mongodb://localhost:27017/vinjobs
   JWT_SECRET=your_jwt_secret
   CLIENT_URL=http://localhost:5173
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   ```
4. Khởi động: `npm run dev` (Server chạy tại port 5000)

### Bước 2: Khởi chạy Frontend
1. Chuyển thư mục: `cd frontend-vinjobs`
2. Cài đặt thư viện: `npm install`
3. Cấu hình `.env` nếu cần (Ví dụ: `VITE_API_URL=http://localhost:5000/api/v1`)
4. Khởi động giao diện: `npm run dev` (Website chạy tại `http://localhost:5173`)

---
*Dự án được xây dựng tập trung vào kiến trúc Phần Mềm Hướng Đối Tượng mạnh mẽ, đảm bảo tính đóng gói, kế thừa và đa hình chặt chẽ giữa các thành phần.*

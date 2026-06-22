// Mock data: 20+ việc làm mẫu
export const mockJobs = [
  {
    id: 1,
    title: "Lập trình viên Frontend React",
    company: { id: 1, name: "FPT Software", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/FPT_logo_2010.svg/1200px-FPT_logo_2010.svg.png" },
    salary: { min: 15000000, max: 25000000, currency: "VNĐ", negotiable: false },
    location: "Quận 1, TP.HCM",
    type: "FULL_TIME",
    level: "MIDDLE",
    badge: "hot",
    postedAt: "2 giờ trước",
    contacts: 45,
    deadline: "30/06/2026",
    description: "Phát triển giao diện web với ReactJS, TypeScript. Tham gia thiết kế UI/UX cùng team.",
    requirements: "3+ năm kinh nghiệm React, biết Redux/Zustand, responsive design."
  },
  {
    id: 2,
    title: "Nhân viên Kinh doanh B2B",
    company: { id: 2, name: "VNG Corporation", logo: "https://upload.wikimedia.org/wikipedia/vi/thumb/f/fe/VNG_Corporation_Logo.svg/1200px-VNG_Corporation_Logo.svg.png" },
    salary: { min: 10000000, max: 18000000, currency: "VNĐ", negotiable: false },
    location: "Quận 7, TP.HCM",
    type: "FULL_TIME",
    level: "JUNIOR",
    badge: "premium",
    postedAt: "5 giờ trước",
    contacts: 32,
    deadline: "25/06/2026",
    description: "Tìm kiếm khách hàng mới, duy trì quan hệ khách hàng hiện tại.",
    requirements: "1+ năm kinh nghiệm sales, kỹ năng giao tiếp tốt."
  },
  {
    id: 3,
    title: "Kế toán tổng hợp",
    company: { id: 3, name: "Vinamilk", logo: "https://upload.wikimedia.org/wikipedia/vi/thumb/6/sixty/Vinamilk_logo.svg/1200px-Vinamilk_logo.svg.png" },
    salary: { min: 12000000, max: 16000000, currency: "VNĐ", negotiable: false },
    location: "Quận Bình Thạnh, TP.HCM",
    type: "FULL_TIME",
    level: "MIDDLE",
    badge: "hot",
    postedAt: "1 ngày trước",
    contacts: 28,
    deadline: "20/06/2026",
    description: "Quản lý sổ sách kế toán, báo cáo tài chính hàng tháng/quý/năm.",
    requirements: "3+ năm kinh nghiệm kế toán tổng hợp, thành thạo MISA."
  },
  {
    id: 4,
    title: "Thiết kế đồ họa (Graphic Designer)",
    company: { id: 4, name: "Tiki Corporation", logo: "https://salt.tikicdn.com/ts/upload/e4/49/6c/3c52f8c5daa1bfc6e8f79a678fd3b4f0.png" },
    salary: { min: 10000000, max: 15000000, currency: "VNĐ", negotiable: false },
    location: "Quận 1, TP.HCM",
    type: "FULL_TIME",
    level: "JUNIOR",
    badge: "new",
    postedAt: "3 giờ trước",
    contacts: 19,
    deadline: "28/06/2026",
    description: "Thiết kế banner, social media content, ấn phẩm marketing.",
    requirements: "Thành thạo Photoshop, Illustrator, Figma. Portfolio yêu cầu."
  },
  {
    id: 5,
    title: "Chuyên viên Marketing Digital",
    company: { id: 5, name: "Shopee Việt Nam", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Shopee.svg/2048px-Shopee.svg.png" },
    salary: { min: 12000000, max: 20000000, currency: "VNĐ", negotiable: false },
    location: "Quận 3, TP.HCM",
    type: "FULL_TIME",
    level: "MIDDLE",
    badge: "premium",
    postedAt: "8 giờ trước",
    contacts: 56,
    deadline: "22/06/2026",
    description: "Lên kế hoạch và triển khai chiến dịch digital marketing trên đa kênh.",
    requirements: "2+ năm kinh nghiệm digital marketing, Google Ads, Facebook Ads."
  },
  {
    id: 6,
    title: "Nhân viên Chăm sóc Khách hàng",
    company: { id: 6, name: "Grab Vietnam", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Grab_logo.svg/2560px-Grab_logo.svg.png" },
    salary: { min: 8000000, max: 12000000, currency: "VNĐ", negotiable: false },
    location: "Quận Tân Bình, TP.HCM",
    type: "FULL_TIME",
    level: "JUNIOR",
    badge: "hot",
    postedAt: "30 phút trước",
    contacts: 72,
    deadline: "30/06/2026",
    description: "Hỗ trợ khách hàng qua điện thoại, email, chat. Xử lý khiếu nại.",
    requirements: "Giọng nói dễ nghe, kiên nhẫn, chịu được áp lực."
  },
  {
    id: 7,
    title: "Lập trình viên Backend Java",
    company: { id: 1, name: "FPT Software", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/FPT_logo_2010.svg/1200px-FPT_logo_2010.svg.png" },
    salary: { min: 20000000, max: 35000000, currency: "VNĐ", negotiable: false },
    location: "Quận Cầu Giấy, Hà Nội",
    type: "FULL_TIME",
    level: "SENIOR",
    badge: "premium",
    postedAt: "1 ngày trước",
    contacts: 38,
    deadline: "25/06/2026",
    description: "Phát triển hệ thống microservices với Spring Boot, Cloud.",
    requirements: "5+ năm Java, Spring Boot, AWS/GCP, Docker, Kubernetes."
  },
  {
    id: 8,
    title: "Trưởng nhóm Kinh doanh",
    company: { id: 7, name: "Thế Giới Di Động", logo: "https://upload.wikimedia.org/wikipedia/commons/5/53/Th%E1%BA%BF_Gi%E1%BB%9Bi_Di_%C4%90%E1%BB%99ng_logo.png" },
    salary: { min: 18000000, max: 30000000, currency: "VNĐ", negotiable: false },
    location: "Quận 10, TP.HCM",
    type: "FULL_TIME",
    level: "LEAD",
    badge: "hot",
    postedAt: "4 giờ trước",
    contacts: 23,
    deadline: "20/06/2026",
    description: "Quản lý đội ngũ kinh doanh 10-15 người, đạt target doanh số.",
    requirements: "3+ năm kinh nghiệm quản lý sales team."
  },
  {
    id: 9,
    title: "Nhân viên Hành chính Nhân sự",
    company: { id: 8, name: "Samsung Vietnam", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Samsung_Logo.svg/2560px-Samsung_Logo.svg.png" },
    salary: { min: 10000000, max: 14000000, currency: "VNĐ", negotiable: false },
    location: "Bắc Ninh",
    type: "FULL_TIME",
    level: "JUNIOR",
    badge: "new",
    postedAt: "6 giờ trước",
    contacts: 41,
    deadline: "28/06/2026",
    description: "Quản lý hồ sơ nhân sự, chấm công, tuyển dụng.",
    requirements: "Tốt nghiệp QTKD/QTNL, Word/Excel thành thạo."
  },
  {
    id: 10,
    title: "DevOps Engineer",
    company: { id: 2, name: "VNG Corporation", logo: "https://upload.wikimedia.org/wikipedia/vi/thumb/f/fe/VNG_Corporation_Logo.svg/1200px-VNG_Corporation_Logo.svg.png" },
    salary: { min: 25000000, max: 40000000, currency: "VNĐ", negotiable: false },
    location: "Quận 7, TP.HCM",
    type: "FULL_TIME",
    level: "SENIOR",
    badge: "premium",
    postedAt: "12 giờ trước",
    contacts: 15,
    deadline: "30/06/2026",
    description: "Xây dựng CI/CD pipeline, quản lý infrastructure trên cloud.",
    requirements: "4+ năm DevOps, AWS, Terraform, K8s, CI/CD."
  },
  {
    id: 11,
    title: "Nhân viên Bán hàng tại cửa hàng",
    company: { id: 7, name: "Thế Giới Di Động", logo: "https://upload.wikimedia.org/wikipedia/commons/5/53/Th%E1%BA%BF_Gi%E1%BB%9Bi_Di_%C4%90%E1%BB%99ng_logo.png" },
    salary: { min: 7000000, max: 15000000, currency: "VNĐ", negotiable: false },
    location: "Toàn quốc",
    type: "FULL_TIME",
    level: "INTERN",
    badge: "hot",
    postedAt: "2 ngày trước",
    contacts: 120,
    deadline: "30/06/2026",
    description: "Tư vấn bán hàng điện thoại, laptop tại cửa hàng.",
    requirements: "Không yêu cầu kinh nghiệm, có đào tạo."
  },
  {
    id: 12,
    title: "Product Manager",
    company: { id: 5, name: "Shopee Việt Nam", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Shopee.svg/2048px-Shopee.svg.png" },
    salary: { min: 30000000, max: 50000000, currency: "VNĐ", negotiable: false },
    location: "Quận 3, TP.HCM",
    type: "FULL_TIME",
    level: "SENIOR",
    badge: "premium",
    postedAt: "1 ngày trước",
    contacts: 67,
    deadline: "25/06/2026",
    description: "Quản lý sản phẩm, roadmap, phối hợp cross-functional teams.",
    requirements: "5+ năm PM, có kinh nghiệm e-commerce."
  }
];

export const mockCategories = [
  { id: 1, name: "Công nghệ thông tin", icon: "computer", count: 1250, color: "#3b82f6" },
  { id: 2, name: "Kinh doanh", icon: "trending_up", count: 980, color: "#22c55e" },
  { id: 3, name: "Kế toán / Tài chính", icon: "account_balance", count: 720, color: "#f59e0b" },
  { id: 4, name: "Marketing", icon: "campaign", count: 560, color: "#ec4899" },
  { id: 5, name: "Nhân sự", icon: "groups", count: 430, color: "#8b5cf6" },
  { id: 6, name: "Thiết kế", icon: "palette", count: 380, color: "#ef4444" },
  { id: 7, name: "Xây dựng", icon: "construction", count: 290, color: "#f97316" },
  { id: 8, name: "Logistics", icon: "local_shipping", count: 340, color: "#06b6d4" },
  { id: 9, name: "Giáo dục", icon: "school", count: 210, color: "#14b8a6" },
  { id: 10, name: "Y tế / Sức khỏe", icon: "health_and_safety", count: 180, color: "#dc2626" },
];

export const mockCompanies = [
  { id: 1, name: "FPT Software", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/FPT_logo_2010.svg/1200px-FPT_logo_2010.svg.png", industry: "Công nghệ", jobs: 45 },
  { id: 2, name: "VNG Corporation", logo: "https://upload.wikimedia.org/wikipedia/vi/thumb/f/fe/VNG_Corporation_Logo.svg/1200px-VNG_Corporation_Logo.svg.png", industry: "Công nghệ", jobs: 32 },
  { id: 3, name: "Vinamilk", logo: "https://cdn.haitrieu.com/wp-content/uploads/2022/01/Logo-Vinamilk.png", industry: "FMCG", jobs: 18 },
  { id: 4, name: "Tiki", logo: "https://salt.tikicdn.com/ts/upload/e4/49/6c/3c52f8c5daa1bfc6e8f79a678fd3b4f0.png", industry: "E-commerce", jobs: 28 },
  { id: 5, name: "Shopee", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Shopee.svg/2048px-Shopee.svg.png", industry: "E-commerce", jobs: 56 },
  { id: 6, name: "Grab", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Grab_logo.svg/2560px-Grab_logo.svg.png", industry: "Vận tải", jobs: 24 },
  { id: 7, name: "Thế Giới Di Động", logo: "https://upload.wikimedia.org/wikipedia/commons/5/53/Th%E1%BA%BF_Gi%E1%BB%9Bi_Di_%C4%90%E1%BB%99ng_logo.png", industry: "Bán lẻ", jobs: 120 },
  { id: 8, name: "Samsung Vietnam", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Samsung_Logo.svg/2560px-Samsung_Logo.svg.png", industry: "Điện tử", jobs: 35 },
  { id: 9, name: "Viettel", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Viettel_logo_2021.svg/2560px-Viettel_logo_2021.svg.png", industry: "Viễn thông", jobs: 42 },
  { id: 10, name: "Masan Group", logo: "https://cdn.haitrieu.com/wp-content/uploads/2022/01/Logo-Masan-Group.png", industry: "FMCG", jobs: 22 },
];

export const mockIndustries = [
  { id: 1, name: "Công nghệ thông tin", image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=250&fit=crop", salary: "15 - 40 triệu", jobs: 1250 },
  { id: 2, name: "Tài chính - Ngân hàng", image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=250&fit=crop", salary: "12 - 30 triệu", jobs: 890 },
  { id: 3, name: "Marketing & Truyền thông", image: "https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=400&h=250&fit=crop", salary: "10 - 25 triệu", jobs: 670 },
  { id: 4, name: "Xây dựng & Bất động sản", image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=250&fit=crop", salary: "12 - 28 triệu", jobs: 450 },
  { id: 5, name: "Bán hàng & Dịch vụ", image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=250&fit=crop", salary: "8 - 20 triệu", jobs: 1100 },
];

export const mockPosts = [
  {
    id: 1,
    title: "Top 10 kỹ năng được nhà tuyển dụng tìm kiếm 2026",
    excerpt: "Thị trường lao động đang thay đổi nhanh chóng. Khám phá những kỹ năng quan trọng nhất mà nhà tuyển dụng hàng đầu đang tìm kiếm trong năm 2026.",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=630&fit=crop",
    category: "Cẩm nang tìm việc",
    date: "05/06/2026",
    author: { name: "Nguyễn Minh Tuấn", avatar: "https://i.pravatar.cc/100?img=11", role: "Career Expert" },
    readTime: "7 phút đọc",
    views: 12840,
    tags: ["Kỹ năng mềm", "Tuyển dụng", "Phát triển bản thân", "2026"],
    content: [
      { type: "intro", text: "Trong bối cảnh cách mạng công nghiệp 4.0 và sự bùng nổ của AI, thị trường lao động Việt Nam đang chứng kiến những thay đổi chưa từng có. Các nhà tuyển dụng hàng đầu không chỉ tìm kiếm chuyên môn kỹ thuật mà còn đặc biệt coi trọng một bộ kỹ năng toàn diện." },
      { type: "heading", text: "1. Tư duy phản biện và giải quyết vấn đề" },
      { type: "paragraph", text: "Khả năng phân tích tình huống, đặt câu hỏi đúng và đề xuất giải pháp sáng tạo là kỹ năng được 87% nhà tuyển dụng coi là ưu tiên hàng đầu. Doanh nghiệp cần những người có thể nhìn nhận vấn đề từ nhiều góc độ khác nhau." },
      { type: "heading", text: "2. Giao tiếp và cộng tác hiệu quả" },
      { type: "paragraph", text: "Trong môi trường làm việc hybrid ngày nay, kỹ năng giao tiếp rõ ràng — cả bằng lời nói lẫn văn bản — trở nên cực kỳ quan trọng. Khả năng làm việc nhóm đa văn hóa, đa thế hệ là lợi thế cạnh tranh lớn." },
      { type: "callout", icon: "lightbulb", text: "Mẹo: Thực hành kỹ năng giao tiếp mỗi ngày bằng cách tóm tắt công việc trong 3 câu ngắn gọn trước khi báo cáo với cấp trên." },
      { type: "heading", text: "3. Thích ứng và học hỏi liên tục" },
      { type: "paragraph", text: "Với tốc độ thay đổi công nghệ như hiện nay, người lao động cần liên tục cập nhật kiến thức. Các doanh nghiệp ưu tiên ứng viên có tư duy growth mindset — sẵn sàng học kỹ năng mới và thích nghi với môi trường mới." },
      { type: "heading", text: "4. Thành thạo công cụ AI và kỹ thuật số" },
      { type: "paragraph", text: "Không cần phải là lập trình viên, nhưng việc biết cách sử dụng các công cụ AI như ChatGPT, Copilot, hay các nền tảng phân tích dữ liệu sẽ giúp bạn tăng năng suất đáng kể và trở nên nổi bật trong mắt nhà tuyển dụng." },
      { type: "heading", text: "5. Quản lý thời gian và tự chủ" },
      { type: "paragraph", text: "Đặc biệt với xu hướng làm việc từ xa, khả năng tự quản lý công việc, ưu tiên nhiệm vụ và hoàn thành deadline mà không cần giám sát chặt chẽ là kỹ năng được đánh giá rất cao." },
      { type: "list", title: "Các kỹ năng khác cần phát triển:", items: ["Trí tuệ cảm xúc (EQ)", "Tư duy dữ liệu (Data Literacy)", "Kỹ năng thương lượng", "Xây dựng thương hiệu cá nhân", "Quản lý sức khỏe tinh thần"] },
      { type: "conclusion", text: "Đầu tư vào phát triển bản thân là khoản đầu tư sinh lời nhất. Hãy dành ít nhất 1 giờ mỗi ngày để học hỏi và rèn luyện những kỹ năng trên — thành công sẽ đến với bạn." }
    ]
  },
  {
    id: 2,
    title: "Cách viết CV ấn tượng cho sinh viên mới ra trường",
    excerpt: "CV là cánh cửa đầu tiên để bạn gây ấn tượng với nhà tuyển dụng. Hãy cùng tìm hiểu bí quyết tạo ra một CV nổi bật dù bạn chưa có nhiều kinh nghiệm.",
    image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=1200&h=630&fit=crop",
    category: "Cẩm nang tìm việc",
    date: "04/06/2026",
    author: { name: "Trần Thị Lan Anh", avatar: "https://i.pravatar.cc/100?img=47", role: "HR Manager" },
    readTime: "5 phút đọc",
    views: 9230,
    tags: ["CV", "Sinh viên", "Phỏng vấn", "Tìm việc"],
    content: [
      { type: "intro", text: "Nhiều sinh viên mới ra trường lo lắng vì chưa có kinh nghiệm làm việc. Nhưng thực tế, một CV được viết tốt hoàn toàn có thể giúp bạn vượt qua vòng lọc hồ sơ và gây ấn tượng với nhà tuyển dụng." },
      { type: "heading", text: "Cấu trúc CV hoàn hảo cho sinh viên" },
      { type: "paragraph", text: "CV của bạn nên bắt đầu bằng phần tóm tắt cá nhân ngắn gọn (3-4 câu) thể hiện mục tiêu nghề nghiệp và điểm mạnh. Tiếp theo là học vấn, dự án thực tế, kỹ năng, và hoạt động ngoại khóa." },
      { type: "callout", icon: "star", text: "Bí quyết: Thay vì liệt kê nhiệm vụ, hãy mô tả kết quả và thành tích cụ thể. Ví dụ: 'Tăng traffic website 40% thông qua SEO optimization' thay vì 'Làm SEO'." },
      { type: "heading", text: "Những lỗi phổ biến cần tránh" },
      { type: "list", title: "", items: ["Ảnh đại diện không chuyên nghiệp", "Font chữ lộn xộn, khó đọc", "Thông tin liên lạc lỗi thời", "Mô tả chung chung không có số liệu cụ thể", "CV dài hơn 2 trang"] },
      { type: "conclusion", text: "Đầu tư thời gian vào CV chất lượng là bước đầu tiên để chinh phục công việc mơ ước. Hãy luôn tùy chỉnh CV cho từng vị trí ứng tuyển." }
    ]
  },
  {
    id: 3,
    title: "Ngành IT Việt Nam: Xu hướng và mức lương 2026",
    excerpt: "Ngành công nghệ thông tin tiếp tục bùng nổ tại Việt Nam với mức lương hấp dẫn. Cùng điểm qua những xu hướng nổi bật và cơ hội việc làm trong năm 2026.",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&h=630&fit=crop",
    category: "Cẩm nang ngành nghề",
    date: "03/06/2026",
    author: { name: "Lê Hoàng Phúc", avatar: "https://i.pravatar.cc/100?img=33", role: "Tech Analyst" },
    readTime: "10 phút đọc",
    views: 18560,
    tags: ["IT", "Lương", "Xu hướng", "Công nghệ", "AI"],
    content: [
      { type: "intro", text: "Với sự tăng trưởng mạnh mẽ của nền kinh tế số, ngành IT Việt Nam đang trở thành một trong những lĩnh vực có mức tăng trưởng việc làm nhanh nhất và mức lương hấp dẫn nhất." },
      { type: "heading", text: "Mức lương IT theo vị trí" },
      { type: "paragraph", text: "Senior Developer có thể nhận từ 30-60 triệu/tháng, trong khi các vị trí AI/ML Engineer có thể lên đến 80-120 triệu tại các công ty nước ngoài. DevOps và Cloud Engineer cũng ghi nhận mức tăng lương 25% so với năm ngoái." },
      { type: "callout", icon: "trending_up", text: "Số liệu: 73% doanh nghiệp IT Việt Nam dự kiến tuyển dụng thêm nhân sự trong 6 tháng tới, theo khảo sát VinJobs 2026." },
      { type: "heading", text: "Công nghệ hot nhất 2026" },
      { type: "list", title: "", items: ["AI/Machine Learning & GenAI", "Cloud Native Development", "Cybersecurity", "Blockchain & Web3", "Low-code/No-code Platforms"] },
      { type: "conclusion", text: "Ngành IT vẫn là lựa chọn hàng đầu cho những ai muốn có thu nhập ổn định và cơ hội phát triển rộng mở. Đầu tư học hỏi ngay hôm nay để đón đầu xu hướng." }
    ]
  },
  {
    id: 4,
    title: "Bí quyết đàm phán lương khi phỏng vấn",
    excerpt: "Đàm phán lương là kỹ năng mà nhiều ứng viên Việt Nam còn e ngại. Khám phá những chiến lược đơn giản giúp bạn tự tin thương lượng mức lương xứng đáng.",
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=1200&h=630&fit=crop",
    category: "Tin nổi bật",
    date: "02/06/2026",
    author: { name: "Phạm Thu Hằng", avatar: "https://i.pravatar.cc/100?img=45", role: "Executive Recruiter" },
    readTime: "6 phút đọc",
    views: 7890,
    tags: ["Lương", "Phỏng vấn", "Thương lượng", "Kỹ năng"],
    content: [
      { type: "intro", text: "Theo khảo sát, hơn 60% ứng viên chấp nhận mức lương đầu tiên được đề nghị mà không thương lượng. Đây là sai lầm có thể khiến bạn mất hàng chục triệu đồng trong nhiều năm làm việc." },
      { type: "heading", text: "Nghiên cứu thị trường trước" },
      { type: "paragraph", text: "Trước buổi phỏng vấn, hãy tìm hiểu mức lương thị trường cho vị trí tương tự thông qua các trang tuyển dụng, LinkedIn Salary, hoặc hỏi những người trong ngành. Điều này giúp bạn có cơ sở vững chắc để thương lượng." },
      { type: "callout", icon: "info", text: "Lời khuyên vàng: Hãy để nhà tuyển dụng đưa ra con số trước. Nếu họ hỏi mức lương mong muốn, hãy hỏi ngược lại: 'Budget của công ty cho vị trí này là bao nhiêu?'" },
      { type: "heading", text: "Kỹ thuật thương lượng hiệu quả" },
      { type: "list", title: "", items: ["Đặt range lương cao hơn 10-15% so với mức mong muốn thực tế", "Dùng dữ liệu cụ thể để justify mức lương", "Không chỉ đàm phán lương mà cả benefit, working hours", "Thể hiện sự nhiệt tình với công việc trước khi nói về lương"] },
      { type: "conclusion", text: "Đàm phán lương không phải là tham lam — đó là tôn trọng giá trị của bản thân. Hãy tự tin và chuẩn bị kỹ để đạt được mức lương xứng đáng với năng lực của bạn." }
    ]
  },
  {
    id: 5,
    title: "Làm việc hybrid: Lợi ích và thách thức",
    excerpt: "Mô hình làm việc hybrid đang trở thành chuẩn mực mới. Hiểu rõ lợi ích và thách thức để bạn chuẩn bị tốt nhất cho môi trường làm việc linh hoạt này.",
    image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200&h=630&fit=crop",
    category: "Cẩm nang tìm việc",
    date: "01/06/2026",
    author: { name: "Nguyễn Minh Tuấn", avatar: "https://i.pravatar.cc/100?img=11", role: "Career Expert" },
    readTime: "8 phút đọc",
    views: 5430,
    tags: ["Hybrid", "Remote", "Work-life Balance", "Năng suất"],
    content: [
      { type: "intro", text: "78% doanh nghiệp Việt Nam đã áp dụng hoặc đang xem xét mô hình làm việc hybrid. Đây không chỉ là xu hướng tạm thời mà là sự thay đổi cơ bản trong cách chúng ta làm việc." },
      { type: "heading", text: "Lợi ích của hybrid working" },
      { type: "list", title: "", items: ["Cân bằng tốt hơn giữa công việc và cuộc sống", "Tiết kiệm thời gian và chi phí di chuyển", "Tăng năng suất khi làm việc ở môi trường thoải mái", "Thu hút talent từ khắp nơi trên cả nước"] },
      { type: "callout", icon: "warning", text: "Chú ý: Ranh giới giữa công việc và cuộc sống cá nhân dễ bị xóa nhòa khi làm việc tại nhà. Hãy thiết lập giờ làm việc cố định và không gian làm việc riêng." },
      { type: "conclusion", text: "Hybrid working là cơ hội tuyệt vời nếu bạn biết tận dụng đúng cách. Chủ động trong giao tiếp, xây dựng kỷ luật bản thân và đầu tư cho không gian làm việc tại nhà." }
    ]
  },
  {
    id: 6,
    title: "Digital Marketing: Lộ trình nghề nghiệp chi tiết",
    excerpt: "Digital Marketing là ngành hot với nhu cầu nhân lực tăng trưởng mạnh. Khám phá lộ trình từ Fresher đến Expert và những kỹ năng cần thiết ở mỗi cấp độ.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=630&fit=crop",
    category: "Cẩm nang ngành nghề",
    date: "31/05/2026",
    author: { name: "Trần Thị Lan Anh", avatar: "https://i.pravatar.cc/100?img=47", role: "HR Manager" },
    readTime: "9 phút đọc",
    views: 11200,
    tags: ["Digital Marketing", "SEO", "Content", "Lộ trình nghề nghiệp"],
    content: [
      { type: "intro", text: "Digital Marketing đang là một trong những lĩnh vực có tốc độ tuyển dụng nhanh nhất tại Việt Nam. Với sự bùng nổ của thương mại điện tử và mạng xã hội, nhu cầu nhân lực chất lượng cao trong ngành này ngày càng lớn." },
      { type: "heading", text: "Lộ trình sự nghiệp Digital Marketing" },
      { type: "paragraph", text: "Giai đoạn Fresher (0-2 năm) tập trung vào học các kênh cơ bản: SEO, Social Media, Content Marketing. Giai đoạn Middle (2-5 năm) mở rộng sang Performance Marketing, Analytics, CRM. Senior và Manager cần kỹ năng chiến lược và quản lý ngân sách lớn." },
      { type: "callout", icon: "school", text: "Chứng chỉ quan trọng: Google Ads, Facebook Blueprint, HubSpot Content Marketing, Google Analytics 4. Những chứng chỉ này miễn phí và được nhà tuyển dụng đánh giá cao." },
      { type: "list", title: "Công cụ cần thành thạo:", items: ["Google Analytics 4 & Search Console", "Meta Ads Manager", "Semrush / Ahrefs", "Canva / Adobe Creative Suite", "HubSpot / Mailchimp"] },
      { type: "conclusion", text: "Digital Marketing là nghề đòi hỏi sự sáng tạo, tư duy phân tích và khả năng thích nghi nhanh. Hãy bắt đầu xây dựng portfolio ngay hôm nay với các dự án thực tế nhỏ." }
    ]
  },
];

export const formatSalary = (salary) => {
  if (salary.negotiable) return "Thỏa thuận";
  const min = (salary.min / 1000000).toFixed(0);
  const max = (salary.max / 1000000).toFixed(0);
  return `${min} - ${max} triệu/tháng`;
};

export const jobTypeLabels = {
  FULL_TIME: "Toàn thời gian",
  PART_TIME: "Bán thời gian",
  CONTRACT: "Hợp đồng",
  INTERNSHIP: "Thực tập",
  REMOTE: "Từ xa",
};

export const jobLevelLabels = {
  INTERN: "Thực tập sinh",
  JUNIOR: "Junior",
  MIDDLE: "Middle",
  SENIOR: "Senior",
  LEAD: "Lead",
  MANAGER: "Manager",
};

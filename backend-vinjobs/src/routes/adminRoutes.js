import express from 'express';
import asyncHandler from 'express-async-handler';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';
import User from '../models/User.js';
import Company from '../models/Company.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import Category from '../models/Category.js';
import AppError from '../utils/AppError.js';
import { upload } from '../middlewares/uploadMiddleware.js';
import imageService from '../services/ImageService.js';
import settingController from '../controllers/settingController.js';
import NotificationFacade from '../patterns/facade/NotificationFacade.js';

const router = express.Router();

// All routes require ADMIN role
router.use(protect, restrictTo('ADMIN'));

// --- STATS ---
// GET /api/v1/admin/stats - Dashboard statistics
router.get('/stats', asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalCompanies,
    totalJobs,
    totalApplications,
    pendingCompanies,
    categoryDataRaw,
    recentUsers,
    recentCompanies,
    userGrowthRaw,
    jobGrowthRaw
  ] = await Promise.all([
    User.countDocuments(),
    Company.countDocuments(),
    Job.countDocuments({ status: 'APPROVED' }),
    Application.countDocuments(),
    Company.countDocuments({ status: 'PENDING' }),
    // Category Data
    Job.aggregate([
      { $group: { _id: '$category', value: { $sum: 1 } } },
      { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'categoryDoc' } },
      { $unwind: { path: '$categoryDoc', preserveNullAndEmptyArrays: true } },
      { $project: { _id: 0, name: { $ifNull: ['$categoryDoc.name', 'Khác'] }, value: 1 } },
      { $sort: { value: -1 } },
      { $limit: 5 }
    ]),
    // Recent Users
    User.find().sort('-createdAt').limit(5).select('name role createdAt'),
    // Recent Companies
    Company.find().sort('-createdAt').limit(5).select('company_name status createdAt'),
    // User Growth (6 months)
    User.aggregate([
      { $match: { createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 5)) } } },
      { $group: { _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } }, users: { $sum: 1 } } }
    ]),
    // Job Growth (6 months)
    Job.aggregate([
      { $match: { createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 5)) } } },
      { $group: { _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } }, jobs: { $sum: 1 } } }
    ])
  ]);

  // Format Recent Activities
  const recentActivities = [
    ...recentUsers.map(u => ({ id: u._id.toString(), user: u.name, action: `Đăng ký ứng viên mới`, time: u.createdAt, status: 'success' })),
    ...recentCompanies.map(c => ({ id: c._id.toString(), user: c.company_name, action: 'Đăng ký công ty', time: c.createdAt, status: c.status === 'APPROVED' ? 'success' : 'pending' }))
  ].sort((a, b) => b.time - a.time).slice(0, 5);

  // Format Growth Data (last 6 months including current)
  const growthData = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const m = d.getMonth() + 1;
    const y = d.getFullYear();
    
    const uMatch = userGrowthRaw.find(x => x._id.month === m && x._id.year === y);
    const jMatch = jobGrowthRaw.find(x => x._id.month === m && x._id.year === y);
    
    growthData.push({
      name: `T${m}`,
      users: uMatch ? uMatch.users : 0,
      jobs: jMatch ? jMatch.jobs : 0
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      stats: {
        totalUsers,
        totalCompanies,
        totalJobs,
        totalApplications,
        pendingCompanies,
      },
      categoryData: categoryDataRaw.length > 0 ? categoryDataRaw : [{ name: 'Chưa có data', value: 1 }],
      recentActivities,
      growthData
    },
  });
}));

// --- USERS ---
// GET /api/v1/admin/users
router.get('/users', asyncHandler(async (req, res) => {
  const { role, status, search, page = 1, limit = 20 } = req.query;
  
  const filter = {};
  if (role) filter.role = role;
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { name: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
    ];
  }

  const users = await User.find(filter)
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await User.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    results: users.length,
    total,
    data: { users },
  });
}));

// PATCH /api/v1/admin/users/:id/status - Block/unblock user
router.patch('/users/:id/status', asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  const allowed = ['ACTIVE', 'BLOCKED', 'INACTIVE'];
  
  if (!allowed.includes(status)) {
    return next(new AppError('Trạng thái không hợp lệ', 400));
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );

  if (!user) return next(new AppError('Không tìm thấy người dùng', 404));

  res.status(200).json({
    status: 'success',
    data: { user },
  });
}));

// POST /api/v1/admin/users - Tạo mới user
router.post('/users', asyncHandler(async (req, res, next) => {
  const { name, email, password, role, status, phone } = req.body;

  // Kiểm tra email trùng
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('Email này đã được sử dụng', 400));
  }

  const user = await User.create({
    name,
    email,
    password: password || '123456', // Mật khẩu mặc định nếu không cung cấp
    role: role || 'CANDIDATE',
    status: status || 'ACTIVE',
    phone
  });

  res.status(201).json({
    status: 'success',
    data: { user },
  });
}));

// GET /api/v1/admin/users/:id - Lấy chi tiết user
router.get('/users/:id', asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new AppError('Không tìm thấy người dùng', 404));

  res.status(200).json({
    status: 'success',
    data: { user },
  });
}));

// PATCH /api/v1/admin/users/:id - Cập nhật toàn bộ thông tin
router.patch('/users/:id', asyncHandler(async (req, res, next) => {
  const { name, role, status, phone, email, password } = req.body;
  
  const user = await User.findById(req.params.id);
  if (!user) return next(new AppError('Không tìm thấy người dùng', 404));

  if (name) user.name = name;
  if (role) user.role = role;
  if (status) user.status = status;
  if (phone) user.phone = phone;
  
  if (email && email !== user.email) {
    const existing = await User.findOne({ email });
    if (existing) return next(new AppError('Email này đã được sử dụng', 400));
    user.email = email;
  }

  if (password) {
    user.password = password;
  }

  await user.save(); // Chạy qua hook pre('save') để hash password nếu có

  res.status(200).json({
    status: 'success',
    data: { user },
  });
}));

// DELETE /api/v1/admin/users/:id - Xoá người dùng
router.delete('/users/:id', asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return next(new AppError('Không tìm thấy người dùng', 404));

  res.status(204).json({
    status: 'success',
    data: null,
  });
}));

// --- COMPANIES ---
// GET /api/v1/admin/companies
router.get('/companies', asyncHandler(async (req, res) => {
  const { status, search, page = 1, limit = 20 } = req.query;
  
  const filter = {};
  if (status) filter.status = status;
  if (search) filter.name = new RegExp(search, 'i');

  const companies = await Company.find(filter)
    .populate('employer_id', 'name email')
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Company.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    results: companies.length,
    total,
    data: { companies },
  });
}));

// PATCH /api/v1/admin/companies/:id/status - Approve/reject/suspend company
router.patch('/companies/:id/status', asyncHandler(async (req, res, next) => {
  const { status, rejection_reason } = req.body;
  const allowed = ['PENDING', 'ACTIVE', 'REJECTED', 'SUSPENDED'];
  
  if (!allowed.includes(status)) {
    return next(new AppError('Trạng thái không hợp lệ', 400));
  }

  const updateData = { status };
  if (status === 'REJECTED' && rejection_reason) {
    updateData.rejection_reason = rejection_reason;
  }

  const company = await Company.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true }
  );

  if (!company) return next(new AppError('Không tìm thấy công ty', 404));

  // Nếu duyệt (ACTIVE), tự động cập nhật trạng thái User thành ACTIVE và gửi Email
  if (status === 'ACTIVE') {
    const employerUser = await User.findByIdAndUpdate(company.employer_id, { status: 'ACTIVE' }, { new: true });
    
    // Bắn thông báo chúc mừng qua Email bằng Façade Pattern
    if (employerUser) {
      await NotificationFacade.sendCompanyApproved(company, employerUser);
    }
  } else if (status === 'REJECTED' || status === 'SUSPENDED') {
    // Nếu từ chối hoặc đình chỉ, khóa tài khoản (hoặc chuyển về PENDING/BLOCKED tùy logic)
    // Ở đây ta có thể chuyển Employer về PENDING để họ cập nhật lại hồ sơ
    await User.findByIdAndUpdate(company.employer_id, { status: status === 'REJECTED' ? 'PENDING' : 'BLOCKED' });
  }

  res.status(200).json({
    status: 'success',
    data: { company },
  });
}));

// POST /api/v1/admin/companies - Tạo mới công ty
router.post('/companies', asyncHandler(async (req, res, next) => {
  const { employer_id, name, email, phone, website, taxCode, status, industry, size, address, description } = req.body;

  if (!employer_id) {
    return next(new AppError('Vui lòng chọn tài khoản Nhà tuyển dụng (employer_id)', 400));
  }

  // Kiểm tra xem employer này đã có công ty chưa
  const existingCompany = await Company.findOne({ employer_id });
  if (existingCompany) {
    return next(new AppError('Tài khoản Nhà tuyển dụng này đã sở hữu một công ty', 400));
  }

  const company = await Company.create({
    employer_id,
    name,
    email,
    phone,
    website,
    taxCode,
    status: status || 'PENDING',
    industry,
    size,
    address,
    description
  });

  res.status(201).json({
    status: 'success',
    data: { company },
  });
}));

// GET /api/v1/admin/companies/:id - Lấy chi tiết công ty
router.get('/companies/:id', asyncHandler(async (req, res, next) => {
  const company = await Company.findById(req.params.id).populate('employer_id', 'name email phone');
  if (!company) return next(new AppError('Không tìm thấy công ty', 404));

  res.status(200).json({
    status: 'success',
    data: { company },
  });
}));

// PATCH /api/v1/admin/companies/:id - Cập nhật toàn bộ thông tin công ty
router.patch('/companies/:id', asyncHandler(async (req, res, next) => {
  const company = await Company.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!company) return next(new AppError('Không tìm thấy công ty', 404));

  res.status(200).json({
    status: 'success',
    data: { company },
  });
}));

// DELETE /api/v1/admin/companies/:id - Xoá công ty
router.delete('/companies/:id', asyncHandler(async (req, res, next) => {
  const company = await Company.findByIdAndDelete(req.params.id);
  if (!company) return next(new AppError('Không tìm thấy công ty', 404));

  res.status(204).json({
    status: 'success',
    data: null,
  });
}));

// --- CATEGORIES ---
// GET /api/v1/admin/categories - Lấy toàn bộ danh mục (dạng phẳng, Frontend sẽ tự build Tree)
router.get('/categories', asyncHandler(async (req, res) => {
  const categories = await Category.find().sort('createdAt');
  res.status(200).json({
    status: 'success',
    results: categories.length,
    data: { categories },
  });
}));

// POST /api/v1/admin/categories - Tạo mới danh mục
router.post('/categories', upload.single('image'), asyncHandler(async (req, res, next) => {
  const { name, description, icon, custom_svg, parent_id, is_active, icon_color, bg_color } = req.body;
  
  const existing = await Category.findOne({ name });
  if (existing) return next(new AppError('Tên danh mục đã tồn tại', 400));

  let imageUrl = '';
  if (req.file) {
    // Lưu hình ảnh bằng Sharp, maxWidth 800px
    imageUrl = await imageService.processAndSaveImage(req.file.buffer, { maxWidth: 800, mimetype: req.file.mimetype });
  }

  const category = await Category.create({
    name, description, icon, custom_svg, image: imageUrl, parent_id: parent_id || null, is_active, icon_color, bg_color
  });

  res.status(201).json({
    status: 'success',
    data: { category },
  });
}));

// PATCH /api/v1/admin/categories/:id - Cập nhật danh mục
router.patch('/categories/:id', upload.single('image'), asyncHandler(async (req, res, next) => {
  const { name, description, icon, custom_svg, parent_id, is_active, icon_color, bg_color } = req.body;
  
  // Nếu có cập nhật tên, check trùng
  if (name) {
    const existing = await Category.findOne({ name, _id: { $ne: req.params.id } });
    if (existing) return next(new AppError('Tên danh mục đã tồn tại', 400));
  }

  // Không cho phép set parent_id là chính nó
  if (parent_id === req.params.id) {
    return next(new AppError('Danh mục cha không hợp lệ', 400));
  }

  const category = await Category.findById(req.params.id);
  if (!category) return next(new AppError('Không tìm thấy danh mục', 404));

  if (name) category.name = name;
  if (description !== undefined) category.description = description;
  if (icon !== undefined) category.icon = icon;
  if (custom_svg !== undefined) category.custom_svg = custom_svg;
  if (icon_color !== undefined) category.icon_color = icon_color;
  if (bg_color !== undefined) category.bg_color = bg_color;
  if (parent_id !== undefined) category.parent_id = parent_id || null;
  if (is_active !== undefined) category.is_active = is_active;

  if (req.file) {
    const imageUrl = await imageService.processAndSaveImage(req.file.buffer, { maxWidth: 800, mimetype: req.file.mimetype });
    category.image = imageUrl;
  }

  await category.save();

  res.status(200).json({
    status: 'success',
    data: { category },
  });
}));

// DELETE /api/v1/admin/categories/:id - Xóa danh mục
router.delete('/categories/:id', asyncHandler(async (req, res, next) => {
  // Check nếu có danh mục con
  const children = await Category.findOne({ parent_id: req.params.id });
  if (children) return next(new AppError('Không thể xóa vì còn chứa danh mục con', 400));

  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) return next(new AppError('Không tìm thấy danh mục', 404));

  res.status(204).json({
    status: 'success',
    data: null,
  });
}));

// --- SETTINGS ---
// PATCH /api/v1/admin/settings - Cập nhật cấu hình hệ thống
router.patch('/settings', upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'favicon', maxCount: 1 }
]), settingController.updateSettings);

// --- JOBS ---
// GET /api/v1/admin/jobs
router.get('/jobs', asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;

  const filter = {};
  if (status) filter.status = status;

  const jobs = await Job.find(filter)
    .populate('company_id', 'name logo')
    .populate('employer_id', 'name email')
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Job.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    results: jobs.length,
    total,
    data: { jobs },
  });
}));

// PATCH /api/v1/admin/jobs/:id/status - Approve/reject job
router.patch('/jobs/:id/status', asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  const allowed = ['APPROVED', 'REJECTED', 'CLOSED'];

  if (!allowed.includes(status)) {
    return next(new AppError('Trạng thái không hợp lệ', 400));
  }

  const job = await Job.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );

  if (!job) return next(new AppError('Không tìm thấy tin tuyển dụng', 404));

  res.status(200).json({
    status: 'success',
    data: { job },
  });
}));

export default router;

import express from 'express';
import recruitmentController from '../controllers/RecruitmentController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Route cho Employer mua gói dịch vụ
router.post(
  '/purchase-plan',
  protect,
  restrictTo('EMPLOYER'), // Áp dụng phân quyền bằng middleware
  recruitmentController.purchasePlan
);

export default router;

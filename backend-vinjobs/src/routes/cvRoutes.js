import express from 'express';
import cvController from '../controllers/CVController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(restrictTo('CANDIDATE'));

router.route('/')
  .get(cvController.getMyCVs)
  .post(cvController.uploadCV);

export default router;

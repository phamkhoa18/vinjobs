import express from 'express';
import savedJobController from '../controllers/SavedJobController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(restrictTo('CANDIDATE'));

router.route('/')
  .post(savedJobController.toggleSavedJob);

router.get('/me', savedJobController.getMySavedJobs);
router.get('/check/:jobId', savedJobController.checkSaved);

export default router;

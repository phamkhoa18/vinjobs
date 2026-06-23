import express from 'express';
import ApplicationController from '../controllers/ApplicationController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

// Routes for CANDIDATE
router.post('/', restrictTo('CANDIDATE'), ApplicationController.applyForJob);
router.get('/me', restrictTo('CANDIDATE'), ApplicationController.getMyApplications);
router.get('/check/:jobId', restrictTo('CANDIDATE'), ApplicationController.checkApplied);

// Routes for EMPLOYER
router.get('/employer/all', restrictTo('EMPLOYER'), ApplicationController.getEmployerApplications);
router.patch('/:id/status', restrictTo('EMPLOYER'), ApplicationController.updateStatus);

export default router;

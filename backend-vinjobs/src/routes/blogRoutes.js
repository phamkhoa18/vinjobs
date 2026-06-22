import express from 'express';
import blogController from '../controllers/BlogController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/categories', blogController.getCategories);
router.get('/posts', blogController.getPublishedPosts);
router.get('/posts/:slug', blogController.getPost);

// Protected routes (Content Manager & Admin)
router.use(protect);

router.post('/categories', restrictTo('CONTENT_MANAGER', 'ADMIN'), blogController.createCategory);
router.post('/posts', restrictTo('CONTENT_MANAGER', 'ADMIN'), blogController.createPost);

router.patch('/posts/:postId/approve', restrictTo('ADMIN'), blogController.approvePost);

export default router;

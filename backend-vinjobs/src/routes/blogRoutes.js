import express from 'express';
import blogController from '../controllers/BlogController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';
import { upload } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

// Public routes
router.get('/categories', blogController.getCategories);
router.get('/posts', blogController.getPublishedPosts);
router.get('/posts/:slug', blogController.getPost);

// Protected routes (Content Manager & Admin)
router.use(protect);

router.post('/categories', restrictTo('ADMIN'), blogController.createCategory);
router.post('/posts', restrictTo('ADMIN'), upload.single('thumbnail'), blogController.createPost);

router.get('/admin/posts', restrictTo('ADMIN'), blogController.getAdminPosts);
router.put('/posts/:postId', restrictTo('ADMIN'), upload.single('thumbnail'), blogController.updatePost);
router.delete('/posts/:postId', restrictTo('ADMIN'), blogController.deletePost);

router.patch('/posts/:postId/approve', restrictTo('ADMIN'), blogController.approvePost);

export default router;

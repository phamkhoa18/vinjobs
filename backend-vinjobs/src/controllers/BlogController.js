import postService from '../services/PostService.js';
import categoryService from '../services/CategoryService.js';
import blogFacade from '../facades/BlogFacade.js';
import imageService from '../services/ImageService.js';
import asyncHandler from 'express-async-handler';

class BlogController {
  // Category
  createCategory = asyncHandler(async (req, res) => {
    const category = await categoryService.createCategory(req.body);
    res.status(201).json({ status: 'success', data: { category } });
  });

  getCategories = asyncHandler(async (req, res) => {
    const categories = await categoryService.getAllCategories();
    res.status(200).json({ status: 'success', results: categories.length, data: { categories } });
  });

  // Post
  createPost = asyncHandler(async (req, res) => {
    const postData = { ...req.body };
    if (req.file) {
      postData.thumbnail = await imageService.processAndSaveImage(req.file.buffer, {
        mimetype: req.file.mimetype,
        maxWidth: 1200
      });
    }
    
    if (postData.tags) {
      try { postData.tags = JSON.parse(postData.tags); } catch (e) { postData.tags = []; }
    }
    
    postData.seo = {
      meta_title: req.body.seo?.meta_title || req.body['seo[meta_title]'] || '',
      meta_description: req.body.seo?.meta_description || req.body['seo[meta_description]'] || ''
    };

    const post = await postService.createPost(req.user.id, postData);
    res.status(201).json({ status: 'success', data: { post } });
  });

  updatePost = asyncHandler(async (req, res) => {
    const postData = { ...req.body };
    if (req.file) {
      postData.thumbnail = await imageService.processAndSaveImage(req.file.buffer, {
        mimetype: req.file.mimetype,
        maxWidth: 1200
      });
    }

    if (postData.tags) {
      try { postData.tags = JSON.parse(postData.tags); } catch (e) { postData.tags = []; }
    }
    
    postData.seo = {
      meta_title: req.body.seo?.meta_title || req.body['seo[meta_title]'] || '',
      meta_description: req.body.seo?.meta_description || req.body['seo[meta_description]'] || ''
    };

    const post = await postService.updatePost(req.params.postId, postData);
    res.status(200).json({ status: 'success', data: { post } });
  });

  deletePost = asyncHandler(async (req, res) => {
    await postService.deletePost(req.params.postId);
    res.status(204).json({ status: 'success', data: null });
  });

  getAdminPosts = asyncHandler(async (req, res) => {
    const posts = await postService.getAdminPosts(req.query);
    res.status(200).json({ status: 'success', results: posts.length, data: { posts } });
  });

  getPublishedPosts = asyncHandler(async (req, res) => {
    const posts = await postService.getPublishedPosts(req.query);
    res.status(200).json({ status: 'success', results: posts.length, data: { posts } });
  });

  getPost = asyncHandler(async (req, res) => {
    const post = await postService.getPostBySlug(req.params.slug);
    res.status(200).json({ status: 'success', data: { post } });
  });

  // Admin approval (Facade)
  approvePost = asyncHandler(async (req, res) => {
    const post = await blogFacade.approvePost(req.user.id, req.params.postId);
    res.status(200).json({ status: 'success', message: 'Duyệt bài thành công', data: { post } });
  });
}

export default new BlogController();

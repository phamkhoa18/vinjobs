import Post from '../models/Post.js';
import AppError from '../utils/AppError.js';

/**
 * PostService — Singleton Pattern (qua Module Caching)
 * 
 * Service xử lý CRUD cho bài viết Blog, duyệt bài, tìm kiếm bài viết.
 * Sử dụng `export default new PostService()` — đảm bảo chỉ có 1 instance
 * duy nhất trong toàn bộ ứng dụng (Singleton Pattern).
 */
class PostService {
  async createPost(authorId, data) {
    if (data.content) {
      data.reading_time = Math.max(1, Math.ceil(data.content.replace(/<[^>]*>?/gm, '').split(/\s+/).length / 200));
    }
    return await Post.create({
      ...data,
      author_id: authorId,
      status: data.status || 'DRAFT'
    });
  }

  async updatePost(postId, data) {
    if (data.content) {
      data.reading_time = Math.max(1, Math.ceil(data.content.replace(/<[^>]*>?/gm, '').split(/\s+/).length / 200));
    }
    const post = await Post.findOneAndUpdate(
      { _id: postId }, // Admin can update any post
      data,
      { new: true, runValidators: true }
    );
    if (!post) throw new AppError('Bài viết không tồn tại', 404);
    return post;
  }

  async deletePost(postId) {
    const post = await Post.findByIdAndDelete(postId);
    if (!post) throw new AppError('Bài viết không tồn tại', 404);
    return post;
  }

  async getAdminPosts(query) {
    return await Post.find()
      .populate('author_id', 'name avatar')
      .populate('category_id', 'name slug')
      .sort('-createdAt');
  }

  async getPublishedPosts(query) {
    const filter = { status: 'PUBLISHED' };
    if (query.category_id) filter.category_id = query.category_id;
    
    return await Post.find(filter)
      .populate('author_id', 'name avatar')
      .populate('category_id', 'name slug')
      .sort('-published_at');
  }

  async getPostBySlug(slug) {
    const post = await Post.findOneAndUpdate(
      { slug, status: 'PUBLISHED' },
      { $inc: { view_count: 1 } }, // Tăng view mỗi lần đọc
      { new: true }
    )
    .populate('author_id', 'name avatar bio')
    .populate('category_id', 'name slug');
    
    if (!post) throw new AppError('Bài viết không tồn tại', 404);
    return post;
  }

  async approvePost(postId) {
    const post = await Post.findByIdAndUpdate(
      postId,
      { status: 'PUBLISHED', published_at: new Date() },
      { new: true }
    ).populate('author_id');
    
    if (!post) throw new AppError('Bài viết không tồn tại', 404);
    return post;
  }
}

export default new PostService();

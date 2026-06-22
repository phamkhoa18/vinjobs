import Post from '../models/Post.js';
import AppError from '../utils/AppError.js';

class PostService {
  async createPost(authorId, data) {
    return await Post.create({
      ...data,
      author_id: authorId,
      status: 'DRAFT'
    });
  }

  async updatePost(authorId, postId, data) {
    const post = await Post.findOneAndUpdate(
      { _id: postId, author_id: authorId },
      data,
      { new: true, runValidators: true }
    );
    if (!post) throw new AppError('Bài viết không tồn tại hoặc bạn không có quyền sửa', 404);
    return post;
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

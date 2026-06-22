import Category from '../models/Category.js';
import AppError from '../utils/AppError.js';

class CategoryService {
  async createCategory(data) {
    return await Category.create(data);
  }

  async getAllCategories() {
    return await Category.find({ is_active: true }).populate('parent_id', 'name slug');
  }

  async updateCategory(id, data) {
    const category = await Category.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true
    });
    if (!category) throw new AppError('Danh mục không tồn tại', 404);
    return category;
  }
}

export default new CategoryService();

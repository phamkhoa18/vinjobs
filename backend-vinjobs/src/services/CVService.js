import CV from '../models/CV.js';
import AppError from '../utils/AppError.js';

class CVService {
  async uploadCV(candidateId, data) {
    // Nếu đây là CV đầu tiên, tự động set làm primary
    const cvCount = await CV.countDocuments({ candidate_id: candidateId });
    const isPrimary = data.is_primary || cvCount === 0;

    if (isPrimary && cvCount > 0) {
      // Bỏ primary của các CV cũ
      await CV.updateMany({ candidate_id: candidateId }, { is_primary: false });
    }

    const cv = await CV.create({
      candidate_id: candidateId,
      title: data.title,
      file_path: data.file_path, // Giả sử client gửi link file sau khi upload cloud
      file_type: data.file_type || 'PDF',
      is_primary: isPrimary
    });

    return cv;
  }

  async getMyCVs(candidateId) {
    return await CV.find({ candidate_id: candidateId }).sort('-uploaded_at');
  }

  async getCVById(cvId) {
    const cv = await CV.findById(cvId);
    if (!cv) throw new AppError('Không tìm thấy CV', 404);
    return cv;
  }

  async deleteCV(candidateId, cvId) {
    const cv = await CV.findOneAndDelete({ _id: cvId, candidate_id: candidateId });
    if (!cv) throw new AppError('Không tìm thấy CV hoặc bạn không có quyền xóa', 404);
    return cv;
  }

  async setDefaultCV(candidateId, cvId) {
    const cv = await CV.findOne({ _id: cvId, candidate_id: candidateId });
    if (!cv) throw new AppError('Không tìm thấy CV', 404);

    // Remove primary from others
    await CV.updateMany({ candidate_id: candidateId }, { is_primary: false });

    // Set this as primary
    cv.is_primary = true;
    await cv.save();

    return cv;
  }
}

export default new CVService();

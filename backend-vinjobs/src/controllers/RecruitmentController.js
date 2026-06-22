import recruitmentFacade from '../facades/RecruitmentFacade.js';
import asyncHandler from 'express-async-handler';

class RecruitmentController {
  purchasePlan = asyncHandler(async (req, res, next) => {
    const { planId, method } = req.body;
    const employerId = req.user.id; // Lấy từ authMiddleware

    // Chỉ gọi đúng 1 dòng Facade thay vì viết logic loằng ngoằng ở đây
    const result = await recruitmentFacade.purchasePlan(employerId, planId, method);

    res.status(200).json({
      status: 'success',
      message: 'Mua gói dịch vụ thành công',
      data: result
    });
  });
}

export default new RecruitmentController();

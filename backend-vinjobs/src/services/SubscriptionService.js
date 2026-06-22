import Subscription from '../models/Subscription.js';
import EmployerSubscription from '../models/EmployerSubscription.js';
import AppError from '../utils/AppError.js';

class SubscriptionService {
  async getPlanById(planId) {
    const plan = await Subscription.findById(planId);
    if (!plan) throw new AppError('Không tìm thấy gói dịch vụ này', 404);
    if (!plan.is_active) throw new AppError('Gói dịch vụ này không còn hoạt động', 400);
    return plan;
  }

  async activateSubscription(employerId, plan) {
    // Vô hiệu hóa gói cũ (nếu có)
    await EmployerSubscription.updateMany(
      { employer_id: employerId, status: 'ACTIVE' },
      { status: 'EXPIRED' }
    );

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + plan.duration);

    const newEmpSub = await EmployerSubscription.create({
      employer_id: employerId,
      subscription_id: plan._id,
      jobs_remaining: plan.job_limit,
      start_date: startDate,
      end_date: endDate,
      status: 'ACTIVE'
    });

    return newEmpSub;
  }
}

export default new SubscriptionService();

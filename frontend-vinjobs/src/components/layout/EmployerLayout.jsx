import { useAuth } from '../../contexts/AuthContext';
import { Alert, Button } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';

export default function EmployerLayout({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isPending = user?.status === 'PENDING';
  const isRejected = user?.status === 'REJECTED';
  const needsVerification = isPending || isRejected;

  // Không hiển thị alert mặc định nếu đang ở trang chủ Dashboard (nơi có Stepper) 
  // hoặc trang Verification (nơi có hướng dẫn upload chi tiết)
  const hideAlert = location.pathname === '/employer' || location.pathname === '/employer/verification';

  return (
    <DashboardLayout role="employer">
      {needsVerification && !hideAlert && (
        <div className="mb-6">
          <Alert
            message={
              <span className="font-semibold text-lg">
                {isPending ? 'Tài khoản đang chờ xác minh' : 'Tài khoản bị từ chối xác minh'}
              </span>
            }
            description={
              <div className="mt-1 flex flex-col gap-2">
                <span>
                  {isPending 
                    ? 'Bạn chưa thể sử dụng các tính năng đăng tin tuyển dụng. Vui lòng gửi hồ sơ Giấy phép kinh doanh để được xác minh.'
                    : 'Hồ sơ xác minh của bạn đã bị từ chối. Vui lòng kiểm tra lại lý do và cập nhật thông tin để được duyệt lại.'}
                </span>
                <div>
                  <Button type="primary" onClick={() => navigate('/employer/verification')}>
                    Đi đến trang Xác minh Doanh nghiệp
                  </Button>
                </div>
              </div>
            }
            type={isPending ? 'warning' : 'error'}
            showIcon
            className="shadow-sm border-0 rounded-xl"
          />
        </div>
      )}
      {/* Cần kiểm tra xem page con có tự quản lý quyền truy cập hay không. VerifiedEmployerRoute đã lo phần chặn trang */}
      {children}
    </DashboardLayout>
  );
}

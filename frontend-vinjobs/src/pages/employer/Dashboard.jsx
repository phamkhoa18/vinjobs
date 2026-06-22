import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import EmployerLayout from '../../components/layout/EmployerLayout';
import { jobsApi, applicationsApi, companiesApi } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { Row, Col, Statistic, Table, Tag, Typography, Button, Steps, Alert, message, Spin } from 'antd';
import { 
  TeamOutlined, 
  ShopOutlined, 
  FileDoneOutlined, 
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  PlusOutlined,
  RightOutlined
} from '@ant-design/icons';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer 
} from 'recharts';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const statusConfig = {
  PENDING: { label: 'Mới', color: 'blue' },
  REVIEWING: { label: 'Đang xem', color: 'orange' },
  INTERVIEW: { label: 'Phỏng vấn', color: 'purple' },
  ACCEPTED: { label: 'Nhận việc', color: 'green' },
  REJECTED: { label: 'Từ chối', color: 'red' },
};

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalApps: 0,
    totalViews: 0
  });
  const [activeJobs, setActiveJobs] = useState([]);
  const [recentApps, setRecentApps] = useState([]);
  const [company, setCompany] = useState(null);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Toast notification for verification
  useEffect(() => {
    if (!user) return;
    if (user.status === 'REJECTED') {
      message.error('Hồ sơ doanh nghiệp của bạn đã bị từ chối! Vui lòng cập nhật lại.');
    } else if (user.status === 'PENDING') {
      message.warning('Tài khoản đang chờ xác minh. Bạn cần hoàn tất hồ sơ để đăng tin.');
    }
  }, [user]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const [jobsRes, appsRes, compRes] = await Promise.all([
        jobsApi.mine(),
        applicationsApi.allForEmployer({ limit: 5 }),
        companiesApi.mine()
      ]);
      
      let numJobs = 0;
      if (jobsRes.status === 'success') {
        const jobs = jobsRes.data.jobs;
        numJobs = jobs.filter(j => j.status === 'APPROVED').length;
        setActiveJobs(jobs.filter(j => j.status === 'APPROVED').slice(0, 5));
      }

      let numApps = 0;
      if (appsRes.status === 'success') {
        const apps = appsRes.data.applications;
        setRecentApps(apps.slice(0, 5));
        const allAppsRes = await applicationsApi.allForEmployer();
        if (allAppsRes.status === 'success') numApps = allAppsRes.data.applications.length;
      }

      if (compRes.status === 'success') {
        setCompany(compRes.data.company);
      }

      setStats({
        activeJobs: numJobs,
        totalApps: numApps,
        totalViews: numJobs * 150 // Mock views
      });

    } catch (err) {
      console.error('Error fetching employer dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const isPending = user?.status === 'PENDING';
  const isRejected = user?.status === 'REJECTED';
  const isActive = user?.status === 'ACTIVE';

  let currentStep = 0;
  let stepStatus = 'process';

  if (isRejected) {
    currentStep = 1;
    stepStatus = 'error';
  } else if (isPending) {
    if (!company?.business_license) {
      currentStep = 1;
      stepStatus = 'process';
    } else {
      currentStep = 2;
      stepStatus = 'process';
    }
  } else if (isActive) {
    currentStep = 3;
    stepStatus = 'finish';
  }

  const renderOnboardingAlert = () => {
    if (isActive) return null;
    
    if (isRejected) {
      return (
        <Alert
          message="Hồ sơ xác minh của bạn đã bị từ chối"
          description={
            <div className="mt-2">
              <p className="mb-3"><strong>Lý do:</strong> {company?.rejection_reason}</p>
              <Button type="primary" danger onClick={() => navigate('/employer/verification')}>
                Cập nhật lại Giấy phép kinh doanh ngay
              </Button>
            </div>
          }
          type="error"
          showIcon
          className="mb-6"
        />
      );
    }
    
    if (isPending && !company?.business_license) {
      return (
        <Alert
          message={<span className="font-semibold">Cần xác minh Doanh nghiệp (KYB)</span>}
          description={
            <div className="mt-2">
              <p className="mb-3 text-gray-600">Để đảm bảo tính xác thực, VinJobs yêu cầu Nhà tuyển dụng cung cấp Giấy phép kinh doanh trước khi có thể đăng tin.</p>
              <Button type="primary" onClick={() => navigate('/employer/verification')}>
                Xác minh ngay
              </Button>
            </div>
          }
          type="warning"
          showIcon
          className="mb-6"
        />
      );
    }
    
    if (isPending && company?.business_license) {
      return (
        <Alert
          message={<span className="font-semibold">Đang chờ Admin phê duyệt</span>}
          description="Hồ sơ xác minh doanh nghiệp của bạn đã được gửi. Đội ngũ VinJobs đang tiến hành xem xét (thường mất 1-2 ngày làm việc)."
          type="info"
          showIcon
          className="mb-6"
        />
      );
    }
    return null;
  };

  const MOCK_GROWTH_DATA = [
    { name: 'T2', views: 120, apps: 10 },
    { name: 'T3', views: 250, apps: 25 },
    { name: 'T4', views: 180, apps: 15 },
    { name: 'T5', views: 320, apps: 35 },
    { name: 'T6', views: 280, apps: 30 },
    { name: 'T7', views: 450, apps: 50 },
    { name: 'CN', views: 400, apps: 45 },
  ];

  const jobsColumns = [
    {
      title: 'Tên công việc',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: () => <Tag color="green">Đang chạy</Tag>,
    },
    {
      title: 'Hạn nộp',
      dataIndex: 'deadline',
      key: 'deadline',
      render: (text) => text ? dayjs(text).format('DD/MM/YYYY') : 'Không thời hạn',
    }
  ];

  const appsColumns = [
    {
      title: 'Ứng viên',
      key: 'candidate',
      render: (_, record) => (
        <Text strong>{record.candidate_id?.full_name || 'Ẩn danh'}</Text>
      ),
    },
    {
      title: 'Vị trí',
      key: 'job',
      render: (_, record) => record.job_id?.title || 'Không rõ',
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, record) => {
        const s = statusConfig[record.status] || statusConfig['PENDING'];
        return <Tag color={s.color}>{s.label}</Tag>;
      }
    }
  ];

  if (loading) return <EmployerLayout><div className="flex justify-center p-10"><Spin size="large" /></div></EmployerLayout>;

  return (
    <EmployerLayout>
      {/* Onboarding Stepper */}
      {!isActive && (
        <div className="bg-white rounded-xl p-6 !mb-6">
          <Title level={4} className="mb-6">Tiến trình bắt đầu sử dụng</Title>
          <Steps
            current={currentStep}
            status={stepStatus}
            items={[
              { title: 'Đăng ký', description: 'Hoàn tất thông tin' },
              { title: 'Xác minh', description: 'Cung cấp GPKD' },
              { title: 'Phê duyệt', description: 'Admin duyệt hồ sơ' },
              { title: 'Hoàn tất', description: 'Bắt đầu đăng tin' },
            ]}
            className="mb-8"
          />
          {renderOnboardingAlert()}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Title level={3} style={{ margin: 0 }}>Tổng quan tuyển dụng</Title>
          <Text type="secondary">{company?.name || 'Chưa cập nhật tên công ty'} · {dayjs().format('DD/MM/YYYY')}</Text>
        </div>
        <Link to="/employer/post-job">
          <Button type="primary" icon={<PlusOutlined />} size="large">Đăng tin mới</Button>
        </Link>
      </div>

      {/* THỐNG KÊ NHANH */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <div className="bg-white rounded-xl p-6">
            <Statistic
              title="Tin đang hoạt động"
              value={stats.activeJobs}
              prefix={<FileDoneOutlined className="text-blue-500" />}
              valueStyle={{ fontWeight: 700, color: '#3674c5' }}
            />
          </div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <div className="bg-white rounded-xl p-6">
            <Statistic
              title="Tổng ứng viên"
              value={stats.totalApps}
              prefix={<TeamOutlined className="text-emerald-500" />}
              valueStyle={{ fontWeight: 700, color: '#059669' }}
            />
          </div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <div className="bg-white rounded-xl p-6">
            <Statistic
              title="Lượt xem tin (Ước tính)"
              value={stats.totalViews}
              prefix={<EyeOutlined className="text-amber-500" />}
              valueStyle={{ fontWeight: 700, color: '#d97706' }}
            />
          </div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <div className="bg-white rounded-xl p-6">
            <Statistic
              title="Job credits còn lại"
              value="Vô hạn"
              prefix={<ShopOutlined className="text-purple-500" />}
              valueStyle={{ fontWeight: 700, color: '#7c3aed' }}
            />
          </div>
        </Col>
      </Row>

      {/* BIỂU ĐỒ & DANH SÁCH */}
      <Row gutter={[16, 16]}>
        {/* Biểu đồ tương tác */}
        <Col xs={24} lg={16}>
          <div className="bg-white rounded-xl p-6 h-full flex flex-col">
            <div className="mb-6">
              <span className="font-semibold text-lg text-[#111827]">Biểu đồ tương tác (7 ngày qua)</span>
            </div>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <AreaChart data={MOCK_GROWTH_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <RechartsTooltip />
                  <Area type="monotone" dataKey="views" name="Lượt xem" stroke="#f59e0b" fillOpacity={1} fill="url(#colorViews)" />
                  <Area type="monotone" dataKey="apps" name="Ứng tuyển" stroke="#10b981" fillOpacity={1} fill="url(#colorApps)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Col>

        {/* Cột phải: Tin mới & Ứng viên mới */}
        <Col xs={24} lg={8} className="flex flex-col gap-4">
          <div className="bg-white rounded-xl flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <span className="font-semibold text-lg text-[#111827]">Tin tuyển dụng nổi bật</span>
              <Link to="/employer/jobs" className="text-blue-600 font-medium text-sm">Xem tất cả</Link>
            </div>
            <div className="p-0">
              <Table 
                columns={jobsColumns} 
                dataSource={activeJobs} 
                rowKey="_id"
                pagination={false}
                size="small"
                locale={{ emptyText: 'Chưa có tin nào đang chạy' }}
              />
            </div>
          </div>

          <div className="bg-white rounded-xl flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <span className="font-semibold text-lg text-[#111827]">Ứng viên mới nhất</span>
              <Link to="/employer/applicants" className="text-blue-600 font-medium text-sm">Xem tất cả</Link>
            </div>
            <div className="p-0">
              <Table 
                columns={appsColumns} 
                dataSource={recentApps} 
                rowKey="_id"
                pagination={false}
                size="small"
                locale={{ emptyText: 'Chưa có ứng viên mới' }}
              />
            </div>
          </div>
        </Col>
      </Row>
    </EmployerLayout>
  );
}

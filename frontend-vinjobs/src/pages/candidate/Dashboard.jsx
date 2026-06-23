import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { authApi, publicJobsApi } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { Row, Col, Card, Statistic, List, Typography, Tag, Progress, Button, Avatar, Spin, Space } from 'antd';
import { 
  SendOutlined, 
  ClockCircleOutlined, 
  AudioOutlined, 
  HeartOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const statusConfig = {
  PENDING: { label: 'Chờ duyệt', color: 'orange' },
  REVIEWING: { label: 'Đã xem', color: 'blue' },
  INTERVIEW: { label: 'Phỏng vấn', color: 'purple' },
  OFFER: { label: 'Đề nghị', color: 'geekblue' },
  ACCEPTED: { label: 'Nhận việc', color: 'green' },
  REJECTED: { label: 'Từ chối', color: 'red' },
  WITHDRAWN: { label: 'Đã rút', color: 'default' },
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [recentApps, setRecentApps] = useState([]);
  const [suggestedJobs, setSuggestedJobs] = useState([]);
  const [stats, setStats] = useState({ applied: 0, pending: 0, interview: 0, saved: 0 });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsRes, jobsRes] = await Promise.all([
          authApi.getCandidateStats(),
          publicJobsApi.search({ limit: 4 })
        ]);
        
        if (statsRes.status === 'success') {
          const data = statsRes.data;
          setStats({
            applied: data.stats.applications || 0,
            pending: data.stats.pending || 0,
            interview: data.stats.interview || 0,
            saved: data.stats.savedJobs || 0,
          });
          setRecentApps(data.recentApplications || []);
        }

        if (jobsRes.status === 'success') {
          setSuggestedJobs(jobsRes.data.jobs || []);
        }
      } catch (err) {
        console.error('Error fetching dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const formatSalary = (min, max) => {
    if (!min && !max) return 'Thoả thuận';
    if (!max) return `Từ ${min / 1000000} Tr`;
    if (!min) return `Đến ${max / 1000000} Tr`;
    return `${min / 1000000} - ${max / 1000000} Tr`;
  };

  const calculateProfileCompletion = () => {
    if (!user) return 0;
    let score = 20;
    if (user.avatar) score += 10;
    if (user.phone) score += 20;
    if (user.address) score += 10;
    if (user.skills && user.skills.length > 0) score += 20;
    if (user.experience && user.experience.length > 0) score += 20;
    return Math.min(100, score);
  };
  const completionRate = calculateProfileCompletion();

  const profileTips = [
    { done: !!user?.avatar, text: 'Cập nhật ảnh đại diện', link: '/candidate/profile' },
    { done: !!user?.phone, text: 'Điền thông tin cá nhân', link: '/candidate/profile' },
    { done: false, text: 'Upload CV chuyên nghiệp', link: '/candidate/cv' },
    { done: !!user?.experience?.length, text: 'Thêm kinh nghiệm', link: '/candidate/profile' },
    { done: !!user?.skills?.length, text: 'Thêm kỹ năng', link: '/candidate/profile' },
  ];

  return (
    <DashboardLayout role="candidate">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      ) : (
        <>
          <Card className="bg-gradient-to-r from-blue-600 to-blue-400 text-white overflow-hidden relative border-0" style={{ marginBottom: '24px' }}>
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full" />
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <Title level={4} style={{ color: 'white', margin: 0 }}>Chào mừng trở lại, {user?.name || 'bạn'}! 👋</Title>
                <Text style={{ color: 'rgba(255,255,255,0.9)' }}>
                  Hồ sơ đã hoàn thiện {completionRate}%. Cập nhật thêm để tăng cơ hội trúng tuyển.
                </Text>
              </div>
              <Space size="large" className="w-full md:w-auto">
                <Progress 
                  type="circle" 
                  percent={completionRate} 
                  size={60}
                  strokeColor="#ffffff" 
                  trailColor="rgba(255,255,255,0.3)"
                  format={(percent) => <span style={{ color: 'white' }}>{percent}%</span>}
                />
                <Button type="default" onClick={() => navigate('/candidate/profile')}>
                  Cập nhật ngay
                </Button>
              </Space>
            </div>
          </Card>

          <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
            <Col xs={12} sm={12} md={6}>
              <Card bordered={false} className="shadow-sm">
                <Statistic title="Đã ứng tuyển" value={stats.applied} prefix={<SendOutlined style={{ color: '#1677ff' }} />} />
              </Card>
            </Col>
            <Col xs={12} sm={12} md={6}>
              <Card bordered={false} className="shadow-sm">
                <Statistic title="Chờ phản hồi" value={stats.pending} prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />} />
              </Card>
            </Col>
            <Col xs={12} sm={12} md={6}>
              <Card bordered={false} className="shadow-sm">
                <Statistic title="Đã phỏng vấn" value={stats.interview} prefix={<AudioOutlined style={{ color: '#52c41a' }} />} />
              </Card>
            </Col>
            <Col xs={12} sm={12} md={6}>
              <Card bordered={false} className="shadow-sm">
                <Statistic title="Việc đã lưu" value={stats.saved} prefix={<HeartOutlined style={{ color: '#ff4d4f' }} />} />
              </Card>
            </Col>
          </Row>

          <Row gutter={[24, 24]}>
            <Col xs={24} lg={16}>
              <Card 
                title="Hồ sơ đã nộp gần đây" 
                bordered={false} 
                className="shadow-sm"
                extra={<Link to="/candidate/applications">Xem tất cả</Link>}
                bodyStyle={{ padding: 0 }}
              >
                <List
                  itemLayout="horizontal"
                  dataSource={recentApps}
                  locale={{ emptyText: 'Bạn chưa ứng tuyển công việc nào.' }}
                  renderItem={(app) => {
                    const s = statusConfig[app.status] || statusConfig['PENDING'];
                    const companyName = app.job_id?.company_id?.name || 'Công ty ẩn danh';
                    const jobTitle = app.job_id?.title || 'Công việc không còn tồn tại';
                    const logo = app.job_id?.company_id?.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&background=random&size=60`;
                    
                    return (
                      <List.Item className="px-6 hover:bg-gray-50 transition-colors">
                        <List.Item.Meta
                          avatar={<Avatar shape="square" size={48} src={logo} className="border border-gray-200" />}
                          title={<Text strong>{jobTitle}</Text>}
                          description={`${companyName} · ${dayjs(app.applied_at).format('DD/MM/YYYY')}`}
                        />
                        <Tag color={s.color}>{s.label}</Tag>
                      </List.Item>
                    );
                  }}
                />
              </Card>
            </Col>

            <Col xs={24} lg={8}>
              <Space direction="vertical" size="large" className="w-full">
                <Card title="Hoàn thiện hồ sơ" bordered={false} className="shadow-sm">
                  <List
                    size="small"
                    split={false}
                    dataSource={profileTips}
                    renderItem={(item) => (
                      <List.Item>
                        <Space>
                          {item.done ? (
                            <CheckCircleOutlined style={{ color: '#52c41a' }} />
                          ) : (
                            <div className="w-3.5 h-3.5 rounded-full border border-gray-300" />
                          )}
                          {item.done ? (
                            <Text type="secondary" delete>{item.text}</Text>
                          ) : (
                            <Link to={item.link}>{item.text}</Link>
                          )}
                        </Space>
                      </List.Item>
                    )}
                  />
                </Card>

                <Card title="Gợi ý việc làm" bordered={false} className="shadow-sm" bodyStyle={{ padding: 0 }}>
                  <List
                    itemLayout="horizontal"
                    dataSource={suggestedJobs}
                    locale={{ emptyText: 'Chưa có gợi ý phù hợp.' }}
                    renderItem={(job) => (
                      <List.Item className="px-6 hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/jobs/${job._id}`)}>
                        <List.Item.Meta
                          avatar={<Avatar shape="square" src={job.company_id?.logo || '/default-company-logo.png'} />}
                          title={<Text strong className="text-sm truncate block">{job.title}</Text>}
                          description={<Text type="danger" className="text-xs font-semibold">{formatSalary(job.salary_min, job.salary_max)}</Text>}
                        />
                        <ArrowRightOutlined className="text-gray-400" />
                      </List.Item>
                    )}
                  />
                </Card>
              </Space>
            </Col>
          </Row>
        </>
      )}
    </DashboardLayout>
  );
}

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { savedJobsApi, getImageUrl } from '../../lib/api';
import { toast } from 'react-hot-toast';
import { Card, Typography, Input, Row, Col, Space, Button, Spin, Tag, Avatar, Empty } from 'antd';
import { 
  HeartFilled, 
  EnvironmentOutlined,
  SearchOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const { Title, Text } = Typography;

export default function SavedJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    try {
      setLoading(true);
      const res = await savedJobsApi.getMySavedJobs({ limit: 100 });
      if (res.status === 'success') {
        setJobs(res.data.jobs || []);
      }
    } catch (err) {
      toast.error('Lỗi khi tải danh sách việc làm đã lưu');
    } finally {
      setLoading(false);
    }
  };

  const filtered = jobs.filter(j => {
    if (!j) return false;
    const s = search.toLowerCase();
    const titleMatch = j.title?.toLowerCase().includes(s);
    const companyMatch = j.company_id?.name?.toLowerCase().includes(s);
    return !search || titleMatch || companyMatch;
  });

  const removeJob = async (e, id) => {
    e.stopPropagation(); // Prevent card click
    try {
      await savedJobsApi.toggle(id);
      toast.success('Đã bỏ lưu');
      setJobs(jobs.filter(j => j._id !== id));
    } catch (error) {
      toast.error('Lỗi khi bỏ lưu');
    }
  };

  const formatSalary = (min, max) => {
    if (!min && !max) return 'Thoả thuận';
    if (!max) return `Từ ${min / 1000000} Tr`;
    if (!min) return `Đến ${max / 1000000} Tr`;
    return `${min / 1000000} - ${max / 1000000} Tr`;
  };

  return (
    <DashboardLayout role="candidate">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" style={{ marginBottom: '24px' }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>Việc làm đã lưu</Title>
          <Text type="secondary">{jobs.length} việc làm đang theo dõi</Text>
        </div>
        <Input
          placeholder="Tìm trong danh sách đã lưu..."
          prefix={<SearchOutlined className="text-gray-400" />}
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: 300, borderRadius: 8 }}
          size="large"
        />
      </div>

      <Spin spinning={loading} size="large">
        {filtered.length === 0 && !loading ? (
          <Card bordered={false} className="shadow-sm p-10 text-center">
            <Empty 
              image={Empty.PRESENTED_IMAGE_SIMPLE} 
              description={<Text type="secondary">Chưa có việc làm nào được lưu</Text>} 
            >
              <Button type="primary" onClick={() => navigate('/jobs')} className="mt-4">
                Khám phá Việc làm
              </Button>
            </Empty>
          </Card>
        ) : (
          <Row gutter={[16, 16]}>
            {filtered.map(job => (
              <Col xs={24} md={12} key={job._id}>
                <Card 
                  bordered={false} 
                  hoverable 
                  className="shadow-sm h-full"
                  bodyStyle={{ padding: '20px' }}
                  onClick={() => navigate(`/jobs/${job._id}`)}
                >
                  <div className="flex items-start gap-4">
                    <Avatar 
                      shape="square" 
                      size={64} 
                      src={job.company_id?.logo ? getImageUrl(job.company_id.logo) : '/default-company-logo.png'} 
                      className="border border-gray-100 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <Title level={5} className="truncate m-0 text-gray-900 hover:text-blue-600 transition-colors">
                          {job.title}
                        </Title>
                        <Button 
                          type="text" 
                          icon={<HeartFilled className="text-red-500 text-lg" />} 
                          onClick={(e) => removeJob(e, job._id)}
                          className="hover:bg-red-50"
                        />
                      </div>
                      
                      <Text type="secondary" className="block truncate mt-1">
                        {job.company_id?.name}
                      </Text>

                      <Space className="mt-3 flex-wrap" size={[8, 8]}>
                        <Tag color="red" className="font-semibold rounded border-0 bg-red-50 text-red-600 m-0">
                          {formatSalary(job.salary_min, job.salary_max)}
                        </Tag>
                        <Tag icon={<EnvironmentOutlined />} className="rounded border-0 bg-gray-100 text-gray-600 m-0">
                          {job.company_id?.province || job.location?.province || 'Chưa rõ'}
                        </Tag>
                      </Space>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Spin>
    </DashboardLayout>
  );
}

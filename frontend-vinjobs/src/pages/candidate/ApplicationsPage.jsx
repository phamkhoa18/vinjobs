import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { applicationsApi } from '../../lib/api';
import { Card, Typography, Tabs, Table, Tag, Row, Col, Statistic, Space, Button, Drawer, Steps, Avatar } from 'antd';
import { 
  FileDoneOutlined, 
  HourglassOutlined, 
  AudioOutlined, 
  CloseCircleOutlined,
  EyeOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const STATUS_CONFIG = {
  PENDING: { label: 'Chờ duyệt', color: 'orange', step: 0 },
  REVIEWING: { label: 'Đã xem', color: 'blue', step: 1 },
  INTERVIEW: { label: 'Phỏng vấn', color: 'purple', step: 2 },
  OFFER: { label: 'Đề nghị (Offer)', color: 'geekblue', step: 3 },
  ACCEPTED: { label: 'Đã nhận việc', color: 'green', step: 4 },
  REJECTED: { label: 'Không phù hợp', color: 'red', step: -1 },
  WITHDRAWN: { label: 'Đã rút đơn', color: 'default', step: -1 },
};

export default function ApplicationsPage() {
  const [activeTab, setActiveTab] = useState('ALL');
  const [selectedApp, setSelectedApp] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
    setLoading(true);
    try {
      const res = await applicationsApi.getMyApplications({ limit: 100 });
      if (res.status === 'success') {
        setApplications(res.data.applications || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const counts = {
    ALL: applications.length,
    PENDING: applications.filter(a => a.status === 'PENDING').length,
    REVIEWING: applications.filter(a => a.status === 'REVIEWING').length,
    INTERVIEW: applications.filter(a => a.status === 'INTERVIEW').length,
    REJECTED: applications.filter(a => a.status === 'REJECTED').length,
  };

  const filteredApps = applications.filter(a => activeTab === 'ALL' || a.status === activeTab);

  const columns = [
    {
      title: 'Công việc',
      key: 'job',
      render: (_, record) => {
        const jobTitle = record.job_id?.title || 'Việc làm không còn tồn tại';
        const companyName = record.job_id?.company_id?.name || record.employer_id?.full_name || 'Công ty';
        const logo = record.job_id?.company_id?.logo || '/default-company-logo.png';
        return (
          <Space>
            <Avatar shape="square" size={40} src={logo} />
            <div>
              <Text strong className="block">{jobTitle}</Text>
              <Text type="secondary" className="text-xs">{companyName}</Text>
            </div>
          </Space>
        );
      }
    },
    {
      title: 'Ngày nộp',
      dataIndex: 'applied_at',
      key: 'applied_at',
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
      sorter: (a, b) => dayjs(a.applied_at).unix() - dayjs(b.applied_at).unix()
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const config = STATUS_CONFIG[status] || STATUS_CONFIG['PENDING'];
        return <Tag color={config.color}>{config.label}</Tag>;
      }
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="link" 
          icon={<EyeOutlined />} 
          onClick={() => {
            setSelectedApp(record);
            setDrawerVisible(true);
          }}
        >
          Chi tiết
        </Button>
      )
    }
  ];

  return (
    <DashboardLayout role="candidate">
      <div style={{ marginBottom: '24px' }}>
        <Title level={4} style={{ margin: 0 }}>Hồ sơ đã nộp</Title>
        <Text type="secondary">Theo dõi trạng thái tất cả hồ sơ ứng tuyển của bạn</Text>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={12} md={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic title="Tổng ứng tuyển" value={counts.ALL} prefix={<FileDoneOutlined style={{ color: '#1677ff' }} />} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic title="Chờ phản hồi" value={counts.PENDING} prefix={<HourglassOutlined style={{ color: '#faad14' }} />} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic title="Đang phỏng vấn" value={counts.INTERVIEW} prefix={<AudioOutlined style={{ color: '#722ed1' }} />} />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic title="Không phù hợp" value={counts.REJECTED} prefix={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />} />
          </Card>
        </Col>
      </Row>

      <Card bordered={false} className="shadow-sm">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            { key: 'ALL', label: `Tất cả (${counts.ALL})` },
            { key: 'PENDING', label: `Chờ duyệt (${counts.PENDING})` },
            { key: 'REVIEWING', label: `Đã xem (${counts.REVIEWING})` },
            { key: 'INTERVIEW', label: `Phỏng vấn (${counts.INTERVIEW})` },
            { key: 'REJECTED', label: `Không phù hợp (${counts.REJECTED})` },
          ]}
        />
        <Table 
          columns={columns} 
          dataSource={filteredApps} 
          rowKey="_id" 
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Drawer
        title="Chi tiết hồ sơ ứng tuyển"
        placement="right"
        width={400}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
      >
        {selectedApp && (() => {
          const s = STATUS_CONFIG[selectedApp.status] || STATUS_CONFIG['PENDING'];
          const jobTitle = selectedApp.job_id?.title || 'Việc làm không còn tồn tại';
          const companyName = selectedApp.job_id?.company_id?.name || selectedApp.employer_id?.full_name || 'Công ty';
          const location = selectedApp.job_id?.location?.province || selectedApp.job_id?.location || 'Không rõ';
          const salaryText = selectedApp.job_id?.salary_min ? `${(selectedApp.job_id.salary_min/1000000).toFixed(0)} - ${(selectedApp.job_id.salary_max/1000000).toFixed(0)} triệu` : 'Thỏa thuận';
          
          let currentStep = s.step;
          let stepStatus = 'process';
          if (selectedApp.status === 'REJECTED') {
            currentStep = 1; // Mark rejected after reviewing
            stepStatus = 'error';
          }

          return (
            <div className="space-y-6">
              <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <Avatar 
                  shape="square" 
                  size={56} 
                  src={selectedApp.job_id?.company_id?.logo || '/default-company-logo.png'} 
                  className="bg-white border border-gray-200"
                />
                <div>
                  <Title level={5} style={{ margin: 0 }}>{jobTitle}</Title>
                  <Text type="secondary" className="text-xs block mt-1">{companyName}</Text>
                  <Text type="danger" className="text-xs font-semibold">{salaryText}</Text>
                </div>
              </div>

              <div>
                <Title level={5} className="mb-4">Trạng thái hồ sơ</Title>
                {selectedApp.status === 'REJECTED' ? (
                  <Steps
                    direction="vertical"
                    current={1}
                    status="error"
                    items={[
                      { title: 'Đã nộp hồ sơ', description: dayjs(selectedApp.applied_at).format('DD/MM/YYYY HH:mm') },
                      { title: 'Không phù hợp', description: `Nhà tuyển dụng đã phản hồi` },
                    ]}
                  />
                ) : (
                  <Steps
                    direction="vertical"
                    current={currentStep}
                    items={[
                      { title: 'Đã nộp hồ sơ', description: dayjs(selectedApp.applied_at).format('DD/MM/YYYY HH:mm') },
                      { title: 'Nhà tuyển dụng đã xem', description: currentStep >= 1 ? 'Hồ sơ đang được xem xét' : 'Chờ nhà tuyển dụng xem' },
                      { title: 'Phỏng vấn', description: currentStep >= 2 ? 'Có lịch phỏng vấn' : '' },
                      { title: 'Đề nghị nhận việc', description: currentStep >= 3 ? 'Đã gửi Offer' : '' },
                      { title: 'Hoàn tất', description: currentStep >= 4 ? 'Đã nhận việc' : '' },
                    ]}
                  />
                )}
              </div>

              {selectedApp.cover_letter && (
                <div>
                  <Title level={5} className="mb-2">Thư giới thiệu (Cover Letter)</Title>
                  <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-700 whitespace-pre-wrap border border-gray-200">
                    {selectedApp.cover_letter}
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </Drawer>
    </DashboardLayout>
  );
}

import { useState, useEffect } from 'react';
import EmployerLayout from '../../components/layout/EmployerLayout';
import { applicationsApi, getImageUrl } from '../../lib/api';
import { Table, Tag, Button, Typography, Space, Input, Select, Row, Col, Drawer, Descriptions, Avatar, Statistic, message } from 'antd';
import { SearchOutlined, EyeOutlined, CheckCircleOutlined, CloseCircleOutlined, CalendarOutlined, FileTextOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const STATUS_CONFIG = {
  PENDING: { label: 'Mới ứng tuyển', color: 'blue' },
  REVIEWING: { label: 'Đang xem xét', color: 'orange' },
  INTERVIEW: { label: 'Phỏng vấn', color: 'purple' },
  OFFER: { label: 'Đề nghị', color: 'cyan' },
  ACCEPTED: { label: 'Nhận việc', color: 'green' },
  REJECTED: { label: 'Từ chối', color: 'red' },
};

export default function ManageApplicantsPage() {
  const [applicants, setApplicants] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
    setLoading(true);
    try {
      const res = await applicationsApi.allForEmployer({ limit: 100 });
      if (res.status === 'success') {
        setApplicants(res.data.applications);
      }
    } catch (error) {
      message.error('Lỗi khi tải danh sách ứng viên');
    } finally {
      setLoading(false);
    }
  };

  const filtered = applicants.filter(a => {
    const matchStatus = filterStatus === 'all' || a.status === filterStatus;
    const candidateName = a.candidate_id?.name || '';
    const jobTitle = a.job_id?.title || '';
    const matchSearch = !search || candidateName.toLowerCase().includes(search.toLowerCase()) || jobTitle.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const updateStatus = async (id, status) => {
    try {
      await applicationsApi.updateStatus(id, status);
      setApplicants(applicants.map(a => a._id === id ? { ...a, status } : a));
      if (selectedApplicant && selectedApplicant._id === id) {
        setSelectedApplicant({ ...selectedApplicant, status });
      }
      message.success('Cập nhật trạng thái thành công');
    } catch (err) {
      message.error('Lỗi khi cập nhật trạng thái');
    }
  };

  const handleViewDetail = (record) => {
    setSelectedApplicant(record);
    setDrawerVisible(true);
  };

  const columns = [
    {
      title: 'Ứng viên',
      key: 'candidate',
      render: (_, record) => {
        const name = record.candidate_id?.name || 'Ẩn danh';
        const avatar = record.candidate_id?.avatar ? getImageUrl(record.candidate_id.avatar) : `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
        return (
          <div className="flex items-center gap-3">
            <Avatar src={avatar} size="large" />
            <div>
              <Text strong>{name}</Text>
              <div className="text-gray-500 text-xs">{record.candidate_id?.email}</div>
            </div>
          </div>
        );
      }
    },
    {
      title: 'Vị trí ứng tuyển',
      key: 'job',
      render: (_, record) => <Text strong>{record.job_id?.title || 'Không rõ'}</Text>,
    },
    {
      title: 'Ngày nộp',
      dataIndex: 'applied_at',
      key: 'applied_at',
      render: (text) => dayjs(text).format('DD/MM/YYYY HH:mm'),
      sorter: (a, b) => new Date(a.applied_at) - new Date(b.applied_at),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const s = STATUS_CONFIG[status] || STATUS_CONFIG['PENDING'];
        return <Tag color={s.color}>{s.label}</Tag>;
      }
    },
    {
      title: 'Hành động',
      key: 'action',
      align: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button type="primary" size="small" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
            Chi tiết
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <EmployerLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Title level={3} style={{ margin: 0 }}>Quản lý ứng viên</Title>
          <Text type="secondary">Theo dõi và phản hồi hồ sơ ứng tuyển</Text>
        </div>
      </div>

      {/* Stats row */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={12} sm={8} lg={4}>
          <div className="bg-white rounded-xl p-6">
            <Statistic title="Mới ứng tuyển" value={applicants.filter(a => a.status === 'PENDING').length} valueStyle={{ color: '#1677ff' }} />
          </div>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <div className="bg-white rounded-xl p-6">
            <Statistic title="Đang xem xét" value={applicants.filter(a => a.status === 'REVIEWING').length} valueStyle={{ color: '#fa8c16' }} />
          </div>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <div className="bg-white rounded-xl p-6">
            <Statistic title="Phỏng vấn" value={applicants.filter(a => a.status === 'INTERVIEW').length} valueStyle={{ color: '#722ed1' }} />
          </div>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <div className="bg-white rounded-xl p-6">
            <Statistic title="Nhận việc" value={applicants.filter(a => a.status === 'ACCEPTED').length} valueStyle={{ color: '#52c41a' }} />
          </div>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <div className="bg-white rounded-xl p-6">
            <Statistic title="Từ chối" value={applicants.filter(a => a.status === 'REJECTED').length} valueStyle={{ color: '#ff4d4f' }} />
          </div>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <div className="bg-white rounded-xl p-6">
            <Statistic title="Tổng cộng" value={applicants.length} />
          </div>
        </Col>
      </Row>

      <div className="bg-white rounded-xl p-6 !mb-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Input 
            placeholder="Tìm theo tên ứng viên, vị trí..." 
            prefix={<SearchOutlined className="text-gray-400" />}
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
          <Space>
            <Text strong>Trạng thái:</Text>
            <Select value={filterStatus} onChange={setFilterStatus} style={{ width: 160 }}>
              <Option value="all">Tất cả hồ sơ</Option>
              {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                <Option key={k} value={k}>{v.label}</Option>
              ))}
            </Select>
          </Space>
        </div>

        <Table 
          columns={columns} 
          dataSource={filtered} 
          rowKey="_id" 
          loading={loading}
          pagination={{ pageSize: 15, showSizeChanger: true }}
          className="employer-applicants-table"
        />
      </div>

      {/* Applicant Detail Drawer */}
      <Drawer
        title="Chi tiết hồ sơ ứng viên"
        placement="right"
        width={500}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        extra={
          <Space>
            <Button 
              type="primary" 
              danger 
              icon={<CloseCircleOutlined />}
              onClick={() => updateStatus(selectedApplicant._id, 'REJECTED')}
              disabled={selectedApplicant?.status === 'REJECTED'}
            >
              Từ chối
            </Button>
            <Button 
              type="primary" 
              icon={<CalendarOutlined />}
              style={{ backgroundColor: '#52c41a' }}
              onClick={() => updateStatus(selectedApplicant._id, 'INTERVIEW')}
              disabled={['INTERVIEW', 'OFFER', 'ACCEPTED', 'REJECTED'].includes(selectedApplicant?.status)}
            >
              Mời Phỏng Vấn
            </Button>
          </Space>
        }
      >
        {selectedApplicant && (
          <div>
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
              <Avatar 
                src={selectedApplicant.candidate_id?.avatar ? getImageUrl(selectedApplicant.candidate_id.avatar) : `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedApplicant.candidate_id?.name)}&background=random`} 
                size={80} 
              />
              <div>
                <Title level={4} style={{ margin: 0 }}>{selectedApplicant.candidate_id?.name}</Title>
                <Text type="secondary" className="block mb-2">{selectedApplicant.candidate_id?.email}</Text>
                <Tag color={(STATUS_CONFIG[selectedApplicant.status] || STATUS_CONFIG['PENDING']).color}>
                  {(STATUS_CONFIG[selectedApplicant.status] || STATUS_CONFIG['PENDING']).label}
                </Tag>
              </div>
            </div>

            <Descriptions column={1} bordered size="small" className="mb-6">
              <Descriptions.Item label="Vị trí ứng tuyển">
                <Text strong>{selectedApplicant.job_id?.title}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian nộp">
                {dayjs(selectedApplicant.applied_at).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái hiện tại">
                <Select 
                  value={selectedApplicant.status} 
                  onChange={(val) => updateStatus(selectedApplicant._id, val)}
                  style={{ width: '100%' }}
                  bordered={false}
                  className="font-semibold"
                >
                  {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                    <Option key={k} value={k}><Tag color={v.color}>{v.label}</Tag></Option>
                  ))}
                </Select>
              </Descriptions.Item>
            </Descriptions>

            <div className="mb-6">
              <Title level={5}><FileTextOutlined className="mr-2" /> Thư giới thiệu (Cover Letter)</Title>
              <div className="bg-gray-50 p-4 rounded-xl">
                <div className="whitespace-pre-line text-gray-700 italic">
                  {selectedApplicant.cover_letter || 'Ứng viên không đính kèm thư giới thiệu.'}
                </div>
              </div>
            </div>

            {selectedApplicant.cv_id && (
              <div>
                <Title level={5}>Hồ sơ đính kèm (CV)</Title>
                <Button type="dashed" block icon={<FileTextOutlined />} size="large" href={getImageUrl(selectedApplicant.cv_id?.file_path)} target="_blank">
                  Xem/Tải xuống CV
                </Button>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </EmployerLayout>
  );
}

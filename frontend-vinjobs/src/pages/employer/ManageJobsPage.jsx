import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import EmployerLayout from '../../components/layout/EmployerLayout';
import { jobsApi } from '../../lib/api';
import { Table, Tag, Button, Space, Typography, Popconfirm, message, Row, Col, Statistic, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, PauseCircleOutlined, PlayCircleOutlined, TeamOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const JOB_STATUS = {
  APPROVED: { label: 'Đang chạy', color: 'green' },
  PENDING: { label: 'Chờ duyệt', color: 'blue' },
  DRAFT: { label: 'Bản nháp', color: 'default' },
  CLOSED: { label: 'Đã đóng', color: 'orange' },
  EXPIRED: { label: 'Hết hạn', color: 'default' },
  REJECTED: { label: 'Từ chối', color: 'red' },
};

export default function ManageJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await jobsApi.mine();
      if (res.status === 'success') {
        setJobs(res.data.jobs);
      }
    } catch (err) {
      message.error('Lỗi khi tải danh sách tin tuyển dụng');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'APPROVED' ? 'CLOSED' : currentStatus === 'CLOSED' ? 'APPROVED' : currentStatus;
      if (newStatus === currentStatus) return;
      
      await jobsApi.update(id, { status: newStatus });
      setJobs(jobs.map(j => j._id === id ? { ...j, status: newStatus } : j));
      message.success('Cập nhật trạng thái thành công');
    } catch (err) {
      message.error('Lỗi khi cập nhật trạng thái');
    }
  };

  const deleteJob = async (id) => {
    try {
      await jobsApi.delete(id);
      setJobs(jobs.filter(j => j._id !== id));
      message.success('Xoá tin thành công');
    } catch (err) {
      message.error(err.message || 'Lỗi khi xoá tin');
    }
  };

  const filteredJobs = jobs.filter(j => filter === 'all' || j.status === filter);

  const columns = [
    {
      title: 'Vị trí tuyển dụng',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text>
          <div className="text-gray-500 text-xs mt-1">{record.location} • {record.type}</div>
        </div>
      )
    },
    {
      title: 'Hạn nộp hồ sơ',
      dataIndex: 'deadline',
      key: 'deadline',
      render: (text) => text ? dayjs(text).format('DD/MM/YYYY') : 'Không thời hạn'
    },
    {
      title: 'Thống kê',
      key: 'metrics',
      render: (_, record) => (
        <div className="flex gap-4 text-center">
          <div><Text strong className="text-blue-600">{record.applicantsCount || 0}</Text><br/><Text type="secondary" className="text-[10px]">Ứng viên</Text></div>
          <div><Text strong className="text-gray-700">{record.views || 0}</Text><br/><Text type="secondary" className="text-[10px]">Lượt xem</Text></div>
        </div>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const s = JOB_STATUS[status] || JOB_STATUS['DRAFT'];
        return <Tag color={s.color}>{s.label}</Tag>;
      }
    },
    {
      title: 'Hành động',
      key: 'action',
      align: 'right',
      render: (_, record) => (
        <Space size="small">
          <Link to={`/employer/applicants?job_id=${record._id}`}>
            <Button type="primary" size="small" icon={<TeamOutlined />} title="Ứng viên" />
          </Link>
          
          <Link to={`/employer/edit-job/${record._id}`}>
            <Button size="small" icon={<EditOutlined />} title="Chỉnh sửa" />
          </Link>
          
          {['APPROVED', 'CLOSED'].includes(record.status) && (
            <Button 
              size="small" 
              onClick={() => toggleStatus(record._id, record.status)}
              icon={record.status === 'APPROVED' ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
            >
              {record.status === 'APPROVED' ? 'Đóng' : 'Mở'}
            </Button>
          )}

          <Popconfirm
            title="Bạn có chắc muốn xoá tin này?"
            onConfirm={() => deleteJob(record._id)}
            okText="Xoá"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button danger size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <EmployerLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Title level={3} style={{ margin: 0 }}>Quản lý tin tuyển dụng</Title>
          <Text type="secondary">{jobs.filter(j => j.status === 'APPROVED').length} tin đang hoạt động</Text>
        </div>
        <Link to="/employer/post-job">
          <Button type="primary" icon={<PlusOutlined />} size="large">Đăng tin mới</Button>
        </Link>
      </div>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={12} sm={6}>
          <div className="bg-white rounded-xl p-6">
            <Statistic title="Đang chạy" value={jobs.filter(j => j.status === 'APPROVED').length} valueStyle={{ color: '#52c41a' }} />
          </div>
        </Col>
        <Col xs={12} sm={6}>
          <div className="bg-white rounded-xl p-6">
            <Statistic title="Chờ duyệt" value={jobs.filter(j => j.status === 'PENDING').length} valueStyle={{ color: '#1677ff' }} />
          </div>
        </Col>
        <Col xs={12} sm={6}>
          <div className="bg-white rounded-xl p-6">
            <Statistic title="Đã đóng" value={jobs.filter(j => j.status === 'CLOSED').length} valueStyle={{ color: '#fa8c16' }} />
          </div>
        </Col>
        <Col xs={12} sm={6}>
          <div className="bg-white rounded-xl p-6">
            <Statistic title="Hết hạn/Nháp" value={jobs.filter(j => ['EXPIRED', 'DRAFT'].includes(j.status)).length} valueStyle={{ color: '#8c8c8c' }} />
          </div>
        </Col>
      </Row>

      <div className="bg-white rounded-xl p-6 !mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Text strong>Bộ lọc trạng thái:</Text>
          <Select value={filter} onChange={setFilter} style={{ width: 160 }}>
            <Select.Option value="all">Tất cả</Select.Option>
            {Object.entries(JOB_STATUS).map(([k, v]) => (
              <Select.Option key={k} value={k}>{v.label}</Select.Option>
            ))}
          </Select>
        </div>

        <Table 
          columns={columns} 
          dataSource={filteredJobs} 
          rowKey="_id" 
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          className="employer-jobs-table"
        />
      </div>
    </EmployerLayout>
  );
}

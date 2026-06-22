import { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { Card, Table, Tag, Button, Input, Space, Typography, Select, Modal, Row, Col, Divider, message } from 'antd';
import { SearchOutlined, CheckCircleOutlined, StopOutlined, EyeOutlined } from '@ant-design/icons';
import { adminApi } from '../../lib/api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export default function ManageJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, [statusFilter, search]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (search) params.search = search;
      
      const res = await adminApi.jobs(params);
      if (res.status === 'success') {
        setJobs(res.data.jobs);
      }
    } catch (err) {
      message.error('Lỗi tải danh sách tin tuyển dụng');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await adminApi.updateJobStatus(id, newStatus);
      message.success(`Đã ${newStatus === 'APPROVED' ? 'duyệt' : 'từ chối'} tin`);
      fetchJobs();
      if (detailModalVisible && selectedJob?._id === id) {
        setDetailModalVisible(false);
      }
    } catch (err) {
      message.error('Lỗi cập nhật trạng thái');
    }
  };

  const showJobDetail = (job) => {
    setSelectedJob(job);
    setDetailModalVisible(true);
  };

  const columns = [
    {
      title: 'Chức danh',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <b>{text}</b>,
    },
    {
      title: 'Công ty',
      dataIndex: 'company_id',
      key: 'company',
      render: (company) => <Text type="secondary">{company?.name || 'N/A'}</Text>,
    },
    {
      title: 'Ứng viên',
      dataIndex: 'applicants',
      key: 'applicants',
      align: 'center',
      render: (count) => <Tag color="blue">{count || 0} người</Tag>,
    },
    {
      title: 'Ngày đăng',
      dataIndex: 'createdAt',
      key: 'date',
      render: (date) => dayjs(date).format('DD/MM/YYYY')
    },
    {
      title: 'Trạng thái',
      key: 'status',
      dataIndex: 'status',
      render: (status) => {
        const config = {
          APPROVED: { color: 'success', text: 'Đã duyệt' },
          PENDING: { color: 'warning', text: 'Chờ duyệt' },
          REJECTED: { color: 'error', text: 'Từ chối' },
          CLOSED: { color: 'default', text: 'Đã đóng' },
          EXPIRED: { color: 'default', text: 'Hết hạn' }
        };
        const c = config[status] || config['PENDING'];
        return <Tag color={c.color}>{c.text}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      align: 'right',
      render: (_, record) => (
        <Space size="small">
          {record.status === 'PENDING' && (
            <>
              <Button 
                type="text" 
                style={{ color: '#52c41a' }}
                icon={<CheckCircleOutlined />} 
                onClick={() => updateStatus(record._id, 'APPROVED')}
                title="Duyệt" 
              />
              <Button 
                type="text" 
                danger
                icon={<StopOutlined />} 
                onClick={() => updateStatus(record._id, 'REJECTED')}
                title="Từ chối" 
              />
            </>
          )}
          {record.status === 'APPROVED' && (
            <Button 
              type="text" 
              danger
              icon={<StopOutlined />} 
              onClick={() => updateStatus(record._id, 'REJECTED')}
              title="Gỡ bài" 
            />
          )}
          {record.status === 'REJECTED' && (
            <Button 
              type="text" 
              style={{ color: '#52c41a' }}
              icon={<CheckCircleOutlined />} 
              onClick={() => updateStatus(record._id, 'APPROVED')}
              title="Phục hồi" 
            />
          )}
          <Button type="text" icon={<EyeOutlined />} onClick={() => showJobDetail(record)} title="Xem chi tiết" />
        </Space>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="mb-6 flex justify-between items-end">
        <div>
          <Title level={3} style={{ margin: 0 }}>Quản lý Việc làm</Title>
          <Text type="secondary">Kiểm duyệt và quản lý tin tuyển dụng trên hệ thống</Text>
        </div>
      </div>

      <Card bordered={false} className="shadow-sm">
        <Space style={{ marginBottom: 16 }} wrap>
          <Input 
            placeholder="Tìm theo tiêu đề hoặc công ty..." 
            prefix={<SearchOutlined className="text-gray-400" />} 
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
          <Select 
            defaultValue="all" 
            style={{ width: 160 }} 
            onChange={setStatusFilter}
            options={[
              { value: 'all', label: 'Tất cả trạng thái' },
              { value: 'APPROVED', label: 'Đã duyệt' },
              { value: 'PENDING', label: 'Chờ duyệt' },
              { value: 'REJECTED', label: 'Từ chối' },
              { value: 'CLOSED', label: 'Đã đóng' },
            ]}
          />
        </Space>

        <Table 
          columns={columns} 
          dataSource={jobs} 
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          size="middle"
        />
      </Card>

      <Modal
        title={<span className="text-lg font-bold text-[#111827]">Chi tiết tin tuyển dụng</span>}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={900}
        footer={selectedJob?.status === 'PENDING' ? [
          <Button key="reject" danger onClick={() => updateStatus(selectedJob._id, 'REJECTED')}>Từ chối</Button>,
          <Button key="approve" type="primary" className="bg-[#111827]" onClick={() => updateStatus(selectedJob._id, 'APPROVED')}>Duyệt tin</Button>
        ] : [
          <Button key="close" onClick={() => setDetailModalVisible(false)}>Đóng</Button>
        ]}
      >
        {selectedJob && (
          <div className="py-4">
            <Title level={4} className="mb-1">{selectedJob.title}</Title>
            <Text type="secondary" className="block mb-4">{selectedJob.company_id?.name || 'N/A'}</Text>

            <Row gutter={[16, 16]} className="mb-4 bg-gray-50 p-4 rounded-lg">
              <Col xs={12} md={6}>
                <Text type="secondary" className="block text-xs uppercase mb-1">Mức lương</Text>
                <Text strong>{selectedJob.salary?.negotiable ? 'Thỏa thuận' : `${selectedJob.salary?.min} - ${selectedJob.salary?.max} triệu`}</Text>
              </Col>
              <Col xs={12} md={6}>
                <Text type="secondary" className="block text-xs uppercase mb-1">Địa điểm</Text>
                <Text strong>{selectedJob.location}</Text>
              </Col>
              <Col xs={12} md={6}>
                <Text type="secondary" className="block text-xs uppercase mb-1">Hình thức</Text>
                <Text strong>{selectedJob.type}</Text>
              </Col>
              <Col xs={12} md={6}>
                <Text type="secondary" className="block text-xs uppercase mb-1">Cấp bậc</Text>
                <Text strong>{selectedJob.level}</Text>
              </Col>
            </Row>

            {selectedJob.images && selectedJob.images.length > 0 && (
              <div className="mb-6">
                <Title level={5}>Hình ảnh văn phòng</Title>
                <div className="flex flex-wrap gap-4 mt-2">
                  {selectedJob.images.map((url, idx) => (
                    <div key={idx} className="w-32 h-32 rounded-lg overflow-hidden border border-gray-200">
                      <img src={url} alt={`Job Image ${idx}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedJob.video_url && selectedJob.video_url.includes('youtube.com') && (
              <div className="mb-6">
                <Title level={5}>Video giới thiệu</Title>
                <div className="mt-2 aspect-video rounded-lg overflow-hidden border border-gray-200 shadow-sm max-w-lg">
                  <iframe 
                    width="100%" height="100%" 
                    src={`https://www.youtube.com/embed/${selectedJob.video_url.match(/(?:v=|youtu\.be\/)([\w-]+)/)?.[1] || ''}`} 
                    title="YouTube video player" 
                    frameBorder="0" allowFullScreen>
                  </iframe>
                </div>
              </div>
            )}

            <Divider />
            <Title level={5}>Mô tả công việc</Title>
            <div className="text-gray-700 quill-content" dangerouslySetInnerHTML={{ __html: selectedJob.description }} />
            
            <Title level={5} className="mt-6">Yêu cầu ứng viên</Title>
            <div className="text-gray-700 quill-content" dangerouslySetInnerHTML={{ __html: selectedJob.requirements }} />
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}

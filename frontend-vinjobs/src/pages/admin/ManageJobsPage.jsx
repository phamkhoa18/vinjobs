import { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { Card, Table, Tag, Button, Input, Space, Typography, Select, Modal, Row, Col, Divider, message, Descriptions } from 'antd';
import { SearchOutlined, CheckCircleOutlined, StopOutlined, EyeOutlined } from '@ant-design/icons';
import { adminApi } from '../../lib/api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const JOB_TYPES = {
  FULL_TIME: 'Toàn thời gian',
  PART_TIME: 'Bán thời gian',
  INTERNSHIP: 'Thực tập',
  FREELANCE: 'Cộng tác viên / Freelance',
  CONTRACT: 'Hợp đồng'
};

const BENEFITS_MAP = {
  insurance: 'Bảo hiểm',
  bonus: 'Thưởng',
  training: 'Đào tạo',
  lunch: 'Phụ cấp ăn trưa',
  gym: 'Phòng tập thể hình',
  remote: 'Làm việc từ xa',
  team_building: 'Du lịch / Team building',
  flexible: 'Giờ làm linh hoạt',
  travel: 'Phụ cấp công tác',
  extra_leave: 'Nghỉ phép thêm',
  laptop: 'Cấp thiết bị (Laptop/Macbook)',
  health_check: 'Khám sức khỏe',
  other: 'Khác'
};

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
      title: 'Người đăng',
      dataIndex: 'employer_id',
      key: 'employer',
      render: (employer) => (
        <div className="flex flex-col">
          <Text strong className="text-sm">{employer?.name || 'N/A'}</Text>
          <Text type="secondary" className="text-xs">{employer?.email || ''}</Text>
        </div>
      ),
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
        centered
        style={{ paddingBottom: 0 }}
        footer={selectedJob?.status === 'PENDING' ? [
          <Button key="reject" danger onClick={() => updateStatus(selectedJob._id, 'REJECTED')}>Từ chối</Button>,
          <Button key="approve" type="primary" className="bg-[#111827]" onClick={() => updateStatus(selectedJob._id, 'APPROVED')}>Duyệt tin</Button>
        ] : [
          <Button key="close" onClick={() => setDetailModalVisible(false)}>Đóng</Button>
        ]}
      >
        {selectedJob && (
          <div className="py-4 max-h-[70vh] overflow-y-auto overflow-x-hidden px-2">
            <div className="flex justify-between items-start mb-4">
              <div>
                <Title level={4} className="mb-1">{selectedJob.title}</Title>
                <div className="flex flex-wrap items-center gap-3">
                  <Text type="secondary">{selectedJob.company_id?.name || 'N/A'}</Text>
                  <Divider type="vertical" className="m-0" />
                  <Text type="secondary">
                    Đăng bởi: <Text strong>{selectedJob.employer_id?.name || 'N/A'}</Text> ({selectedJob.employer_id?.email || 'N/A'})
                  </Text>
                  <Tag color="blue" className="m-0">{selectedJob.industry}</Tag>
                </div>
              </div>
              <div className="text-right">
                <Text type="secondary" className="block text-xs uppercase">Hạn nộp</Text>
                <Text strong className="text-red-500">{dayjs(selectedJob.deadline).format('DD/MM/YYYY')}</Text>
              </div>
            </div>

            <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }} className="mb-6 bg-white" size="small">
              <Descriptions.Item label="Mức lương" span={1}>
                <Text strong>{selectedJob.salary_negotiable ? 'Thỏa thuận' : `${selectedJob.salary_min / 1000000} - ${selectedJob.salary_max / 1000000} triệu`}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Địa điểm" span={1}>
                <Text strong>{selectedJob.location}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Hình thức" span={1}>
                <Text strong>{JOB_TYPES[selectedJob.type] || selectedJob.type}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Cấp bậc" span={1}>
                <Text strong>{selectedJob.level}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Kinh nghiệm" span={1}>
                <Text strong>{selectedJob.experience || 'Không yêu cầu'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Học vấn" span={1}>
                <Text strong>{selectedJob.education || 'Không yêu cầu'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Giới tính" span={1}>
                <Text strong>{selectedJob.gender || 'Không yêu cầu'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Độ tuổi" span={1}>
                <Text strong>{(selectedJob.age_min || selectedJob.age_max) ? `Từ ${selectedJob.age_min || 18} - ${selectedJob.age_max || 60} tuổi` : 'Không yêu cầu'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Số lượng tuyển" span={1}>
                <Text strong>{selectedJob.slots || 'Không giới hạn'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Thử việc" span={1}>
                <Text strong>{selectedJob.probation || 'Không yêu cầu'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian làm việc" span={2}>
                <Text strong>
                  {selectedJob.working_days?.join(', ') || 'N/A'} <br />
                  {selectedJob.working_hours && selectedJob.working_hours.length === 2 
                    ? `${selectedJob.working_hours[0]} - ${selectedJob.working_hours[1]}` 
                    : 'N/A'}
                </Text>
              </Descriptions.Item>
            </Descriptions>

            {selectedJob.benefits && selectedJob.benefits.length > 0 && (
              <div className="mb-6">
                <Title level={5}>Phúc lợi & Chế độ</Title>
                <Space size={[0, 8]} wrap>
                  {selectedJob.benefits.map((b, i) => <Tag color="green" key={i}>{BENEFITS_MAP[b] || b}</Tag>)}
                </Space>
              </div>
            )}

            {selectedJob.images && selectedJob.images.length > 0 && (
              <div className="mb-6">
                <Title level={5}>Hình ảnh văn phòng</Title>
                <div className="flex flex-wrap gap-4 mt-2">
                  {selectedJob.images.map((url, idx) => (
                    <div key={idx} className="w-32 h-32 rounded-lg overflow-hidden border border-gray-200">
                      <img src={(typeof getImageUrl !== 'undefined' ? getImageUrl : (u) => (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000') + (u.startsWith('/') ? u : '/'+u))(url)} alt={`Job Image ${idx}`} className="w-full h-full object-cover" />
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
            <div className="text-gray-700 quill-content bg-gray-50 p-4 rounded-lg" dangerouslySetInnerHTML={{ __html: selectedJob.description }} />
            
            <Title level={5} className="mt-6">Yêu cầu ứng viên</Title>
            <div className="text-gray-700 quill-content bg-gray-50 p-4 rounded-lg" dangerouslySetInnerHTML={{ __html: selectedJob.requirements }} />
            
            {selectedJob.nice_to_have && selectedJob.nice_to_have.trim() !== '<p><br></p>' && (
              <>
                <Title level={5} className="mt-6">Yêu cầu ưu tiên (Không bắt buộc)</Title>
                <div className="text-gray-700 quill-content bg-blue-50 p-4 rounded-lg" dangerouslySetInnerHTML={{ __html: selectedJob.nice_to_have }} />
              </>
            )}
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}

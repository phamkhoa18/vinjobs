import { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { Card, Table, Tag, Button, Input, Space, Typography, Select, message, Modal, Form, Drawer, Descriptions, Popconfirm, Avatar, Row, Col, Tabs, Alert } from 'antd';
import { SearchOutlined, CheckCircleOutlined, StopOutlined, EyeOutlined, EditOutlined, DeleteOutlined, PlusOutlined, BankOutlined, FilterOutlined } from '@ant-design/icons';
import { adminApi, getImageUrl } from '../../lib/api';
import LocationService from '../../services/LocationService';

const { Title, Text } = Typography;

export default function ManageCompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  
  // Params
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [form] = Form.useForm();
  
  // Employers List for Select
  const [employers, setEmployers] = useState([]);
  const [loadingEmployers, setLoadingEmployers] = useState(false);

  // Drawer View Profile
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [viewingCompany, setViewingCompany] = useState(null);

  // Provinces
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  // Reject Modal
  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
  const [rejectingCompanyId, setRejectingCompanyId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetchCompanies = async (page = pagination.current, limit = pagination.pageSize, q = search, s = statusFilter) => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (q) params.search = q;
      if (s) params.status = s;
      
      const res = await adminApi.companies(params);
      setCompanies(res.data.companies);
      setTotal(res.total);
      setPagination({ current: page, pageSize: limit });
      
      // Nếu không đang filter theo pending thì fetch riêng số lượng pending
      if (s !== 'PENDING') {
        adminApi.companies({ status: 'PENDING', limit: 1 })
          .then(res => setPendingCount(res.total))
          .catch(() => {});
      } else {
        setPendingCount(res.total);
      }
    } catch (err) {
      message.error(err.message || 'Lỗi khi tải danh sách công ty');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployersList = async () => {
    setLoadingEmployers(true);
    try {
      const res = await adminApi.users({ role: 'EMPLOYER', limit: 1000, status: 'ACTIVE' });
      setEmployers(res.data.users);
    } catch (err) {
      message.error('Không thể tải danh sách Nhà tuyển dụng');
    } finally {
      setLoadingEmployers(false);
    }
  };

  useEffect(() => {
    fetchCompanies(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  useEffect(() => {
    LocationService.getProvinces().then(data => {
      setProvinces(data);
    });
  }, []);

  const handleTableChange = (pag) => {
    fetchCompanies(pag.current, pag.pageSize);
  };

  const handleSearch = (value) => {
    fetchCompanies(1, pagination.pageSize, value);
  };

  const updateStatus = async (id, newStatus, reason = '') => {
    try {
      const payload = { status: newStatus };
      if (reason) payload.rejection_reason = reason;

      await adminApi.updateCompanyStatus(id, payload);
      message.success(`Đã cập nhật trạng thái thành ${newStatus}`);
      fetchCompanies();
      setIsRejectModalVisible(false);
      setRejectReason('');
    } catch (err) {
      message.error(err.message || 'Có lỗi xảy ra');
    }
  };

  const handleRejectClick = (id) => {
    setRejectingCompanyId(id);
    setIsRejectModalVisible(true);
  };

  const submitReject = () => {
    if (!rejectReason.trim()) {
      message.error('Vui lòng nhập lý do từ chối');
      return;
    }
    updateStatus(rejectingCompanyId, 'REJECTED', rejectReason);
  };

  const handleDelete = async (id) => {
    try {
      await adminApi.deleteCompany(id);
      message.success('Đã xóa công ty thành công');
      fetchCompanies();
    } catch (err) {
      message.error(err.message || 'Không thể xóa công ty');
    }
  };

  const openAddModal = () => {
    setEditingCompany(null);
    form.resetFields();
    form.setFieldsValue({ status: 'PENDING' });
    if (employers.length === 0) fetchEmployersList();
    setIsModalVisible(true);
  };

  const openEditModal = async (company) => {
    setEditingCompany(company);
    form.setFieldsValue({
      employer_id: company.employer_id?._id,
      name: company.name,
      taxCode: company.taxCode,
      email: company.email,
      phone: company.phone,
      website: company.website,
      industry: company.industry,
      size: company.size,
      address: company.address,
      status: company.status,
      contact_email: company.contact_email,
      contact_phone: company.contact_phone,
      working_days: company.working_days,
      overtime_policy: company.overtime_policy,
      benefits: company.benefits ? company.benefits.join(', ') : '',
      video_url: company.video_url,
      mission: company.mission,
      facebook: company.facebook,
      linkedin: company.linkedin,
      location: company.location,
      district: company.district,
      ward: company.ward,
    });
    
    // Load districts and wards
    setDistricts([]);
    setWards([]);
    if (company.location) {
      const p = provinces.find(x => x.name === company.location);
      if (p) {
        const dList = await LocationService.getDistricts(p.code);
        setDistricts(dList);
        if (company.district) {
          const d = dList.find(x => x.name === company.district);
          if (d) {
            const wList = await LocationService.getWards(d.code);
            setWards(wList);
          }
        }
      }
    }

    if (employers.length === 0) fetchEmployersList();
    setIsModalVisible(true);
  };

  const handleModalSubmit = async (values) => {
    try {
      const payload = { ...values };
      if (payload.benefits) {
        payload.benefits = payload.benefits.split(',').map(b => b.trim()).filter(Boolean);
      }
      if (editingCompany) {
        await adminApi.updateCompany(editingCompany._id, payload);
        message.success('Cập nhật thông tin thành công');
      } else {
        await adminApi.createCompany(payload);
        message.success('Tạo công ty mới thành công');
      }
      setIsModalVisible(false);
      fetchCompanies();
    } catch (err) {
      message.error(err.message || 'Có lỗi xảy ra khi lưu thông tin');
    }
  };

  const openViewDrawer = async (id) => {
    try {
      const res = await adminApi.getCompany(id);
      setViewingCompany(res.data.company);
      setIsDrawerVisible(true);
    } catch (err) {
      message.error(err.message || 'Không thể lấy thông tin chi tiết');
    }
  };

  const columns = [
    {
      title: 'Tên Công ty',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div className="flex items-center gap-3">
          <Avatar src={record.logo ? getImageUrl(record.logo) : null} icon={<BankOutlined />} shape="square" className="bg-gray-100 text-gray-400" />
          <b>{text}</b>
        </div>
      ),
    },
    {
      title: 'Nhà tuyển dụng',
      key: 'employer',
      render: (_, record) => record.employer_id ? (
        <div>
          <div className="text-sm">{record.employer_id.name}</div>
          <div className="text-xs text-gray-500">{record.employer_id.email}</div>
        </div>
      ) : <Text type="secondary">N/A</Text>
    },
    {
      title: 'Mã số thuế',
      dataIndex: 'taxCode',
      key: 'taxCode',
      render: (text) => text || <Text type="secondary">N/A</Text>
    },
    {
      title: 'Ngày ĐK',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => <Text type="secondary">{new Date(text).toLocaleDateString('vi-VN')}</Text>,
    },
    {
      title: 'Trạng thái',
      key: 'status',
      dataIndex: 'status',
      render: (status) => {
        const config = {
          ACTIVE: { color: 'success', text: 'Hoạt động' },
          PENDING: { color: 'warning', text: 'Chờ duyệt' },
          REJECTED: { color: 'error', text: 'Từ chối' },
          SUSPENDED: { color: 'error', text: 'Đình chỉ' }
        };
        const c = config[status] || { color: 'default', text: status };
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
            <Button type="text" style={{ color: '#52c41a' }} icon={<CheckCircleOutlined />} onClick={() => updateStatus(record._id, 'ACTIVE')} title="Phê duyệt" />
          )}
          {record.status === 'PENDING' && (
            <Button type="text" danger icon={<StopOutlined />} onClick={() => handleRejectClick(record._id)} title="Từ chối" />
          )}
          {record.status === 'ACTIVE' && (
            <Button type="text" danger icon={<StopOutlined />} onClick={() => handleRejectClick(record._id)} title="Đình chỉ" />
          )}
          {record.status === 'SUSPENDED' && (
            <Button type="text" style={{ color: '#52c41a' }} icon={<CheckCircleOutlined />} onClick={() => updateStatus(record._id, 'ACTIVE')} title="Khôi phục" />
          )}
          
          <Button type="text" icon={<EyeOutlined />} onClick={() => openViewDrawer(record._id)} title="Xem chi tiết" />
          <Button type="text" icon={<EditOutlined />} onClick={() => openEditModal(record)} title="Sửa" />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa?"
            description="Tất cả tin tuyển dụng của công ty này có thể bị mồ côi."
            onConfirm={() => handleDelete(record._id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" danger icon={<DeleteOutlined />} title="Xóa" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <Title level={3} style={{ margin: 0 }}>Quản lý Nhà tuyển dụng</Title>
          <Text type="secondary">Phê duyệt đăng ký và quản lý hồ sơ doanh nghiệp</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal} className="h-10 px-6 font-medium shadow-md">
          Thêm công ty
        </Button>
      </div>

      {pendingCount > 0 && statusFilter !== 'PENDING' && (
        <Alert
          message={
            <div className="flex items-center justify-between">
              <span className="font-semibold text-amber-600">Bạn có {pendingCount} doanh nghiệp mới cần phê duyệt Giấy phép kinh doanh!</span>
              <Button type="primary" size="small" onClick={() => setStatusFilter('PENDING')} className="bg-amber-500 hover:bg-amber-600 border-none" icon={<FilterOutlined />}>
                Xem danh sách chờ duyệt
              </Button>
            </div>
          }
          type="warning"
          showIcon
          className="mb-6 rounded-lg border border-amber-200 bg-amber-50"
        />
      )}

      <Card bordered={false} className="shadow-sm rounded-xl overflow-hidden">
        <Space className="mb-5 w-full flex-wrap" size="middle">
          <Input.Search 
            placeholder="Tìm theo tên hoặc MST..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            onSearch={handleSearch}
            className="w-full sm:w-[320px]"
            allowClear
            size="large"
          />
          <Select 
            value={statusFilter} 
            className="min-w-[160px]"
            onChange={setStatusFilter}
            size="large"
            options={[
              { value: '', label: 'Tất cả trạng thái' },
              { value: 'ACTIVE', label: 'Hoạt động' },
              { value: 'PENDING', label: 'Chờ duyệt' },
              { value: 'REJECTED', label: 'Từ chối' },
              { value: 'SUSPENDED', label: 'Đình chỉ' },
            ]}
          />
        </Space>

        <Table 
          columns={columns} 
          dataSource={companies} 
          rowKey="_id"
          pagination={{ 
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: total,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} công ty`
          }}
          loading={loading}
          onChange={handleTableChange}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Modal Thêm/Sửa */}
      <Modal
        title={<span className="text-lg font-bold">{editingCompany ? 'Chỉnh sửa Công ty' : 'Thêm Công ty mới'}</span>}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        destroyOnClose
        width={800}
        centered
      >
        <Form layout="vertical" form={form} onFinish={handleModalSubmit} className="mt-4">
          <Tabs defaultActiveKey="1" items={[
            {
              key: '1',
              label: 'Thông tin cơ bản',
              children: (
                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item name="employer_id" label="Tài khoản Nhà tuyển dụng (Chủ sở hữu)" rules={[{ required: true, message: 'Vui lòng chọn chủ sở hữu' }]}>
                      <Select 
                        showSearch
                        placeholder="Chọn tài khoản Employer" 
                        size="large" 
                        loading={loadingEmployers}
                        disabled={!!editingCompany}
                        optionFilterProp="children"
                        filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                        options={employers.map(e => ({ value: e._id, label: `${e.name} (${e.email})` }))}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="name" label="Tên công ty" rules={[{ required: true, message: 'Vui lòng nhập tên công ty' }]}>
                      <Input placeholder="Tên công ty đầy đủ" size="large" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="taxCode" label="Mã số thuế">
                      <Input placeholder="Mã số thuế" size="large" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="industry" label="Lĩnh vực / Ngành nghề">
                      <Input placeholder="Ví dụ: Công nghệ thông tin" size="large" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="size" label="Quy mô nhân sự">
                      <Input placeholder="Ví dụ: 100-500 nhân viên" size="large" />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item name="website" label="Website công ty">
                      <Input placeholder="https://" size="large" />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
                      <Select size="large">
                        <Select.Option value="PENDING">Chờ duyệt</Select.Option>
                        <Select.Option value="ACTIVE">Hoạt động (Đã duyệt)</Select.Option>
                        <Select.Option value="REJECTED">Từ chối</Select.Option>
                        <Select.Option value="SUSPENDED">Đình chỉ</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
              )
            },
            {
              key: '2',
              label: 'Địa chỉ & Liên hệ',
              children: (
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item name="location" label="Tỉnh/Thành phố">
                      <Select
                        showSearch
                        placeholder="Chọn tỉnh/thành phố"
                        size="large"
                        optionFilterProp="children"
                        filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                        options={provinces.map(p => ({ value: p.name, label: p.name }))}
                        onChange={async (val) => {
                          form.setFieldsValue({ district: undefined, ward: undefined });
                          setWards([]);
                          const p = provinces.find(x => x.name === val);
                          if (p) {
                            const d = await LocationService.getDistricts(p.code);
                            setDistricts(d);
                          } else {
                            setDistricts([]);
                          }
                        }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="district" label="Quận/Huyện">
                      <Select
                        showSearch
                        placeholder="Chọn quận/huyện"
                        size="large"
                        disabled={!districts.length}
                        optionFilterProp="children"
                        filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                        options={districts.map(d => ({ value: d.name, label: d.name }))}
                        onChange={async (val) => {
                          form.setFieldsValue({ ward: undefined });
                          const d = districts.find(x => x.name === val);
                          if (d) {
                            const w = await LocationService.getWards(d.code);
                            setWards(w);
                          } else {
                            setWards([]);
                          }
                        }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="ward" label="Phường/Xã">
                      <Select
                        showSearch
                        placeholder="Chọn phường/xã"
                        size="large"
                        disabled={!wards.length}
                        optionFilterProp="children"
                        filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                        options={wards.map(w => ({ value: w.name, label: w.name }))}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item name="address" label="Số nhà, tên đường">
                      <Input.TextArea placeholder="Nhập số nhà, tên đường..." rows={2} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="contact_email" label="Email liên hệ (Public)">
                      <Input placeholder="Email liên hệ" size="large" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="contact_phone" label="Số điện thoại liên hệ">
                      <Input placeholder="Số điện thoại" size="large" />
                    </Form.Item>
                  </Col>
                </Row>
              )
            },
            {
              key: '3',
              label: 'Phúc lợi & Mạng xã hội',
              children: (
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="working_days" label="Ngày làm việc">
                      <Input placeholder="Thứ 2 - Thứ 6" size="large" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="overtime_policy" label="Chính sách OT">
                      <Input placeholder="Ví dụ: Không OT" size="large" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="video_url" label="Video URL (Youtube)">
                      <Input placeholder="https://youtube.com/watch?v=..." size="large" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="facebook" label="Facebook Link">
                      <Input placeholder="https://facebook.com/..." size="large" />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item name="benefits" label="Phúc lợi (Cách nhau bởi dấu phẩy)">
                      <Input.TextArea placeholder="Bảo hiểm sức khỏe, Thưởng tháng 13..." rows={2} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="linkedin" label="LinkedIn Link">
                      <Input placeholder="https://linkedin.com/company/..." size="large" />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item name="mission" label="Sứ mệnh & Tầm nhìn">
                      <Input.TextArea placeholder="Sứ mệnh của công ty..." rows={3} />
                    </Form.Item>
                  </Col>
                </Row>
              )
            }
          ]} />

          <div className="flex justify-end gap-3 mt-4">
            <Button size="large" onClick={() => setIsModalVisible(false)}>Hủy</Button>
            <Button size="large" type="primary" htmlType="submit" className="px-8">{editingCompany ? 'Lưu thay đổi' : 'Tạo mới'}</Button>
          </div>
        </Form>
      </Modal>

      {/* Drawer Xem Chi Tiết Công Ty */}
      <Drawer
        title={<span className="font-bold text-lg">Hồ sơ Công ty</span>}
        placement="right"
        width={700}
        onClose={() => setIsDrawerVisible(false)}
        open={isDrawerVisible}
      >
        {viewingCompany && (
          <div className="flex flex-col gap-6">
            <div className="relative rounded-xl overflow-hidden h-40 bg-gray-100 border border-gray-200">
              {viewingCompany.cover ? (
                <img src={getImageUrl(viewingCompany.cover)} alt="Cover" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium">Chưa có ảnh bìa</div>
              )}
            </div>

            <div className="flex items-start gap-4 -mt-12 px-6">
              <Avatar 
                size={90} 
                src={viewingCompany.logo ? getImageUrl(viewingCompany.logo) : null} 
                icon={<BankOutlined />} 
                shape="square"
                className="bg-white border-4 border-white shadow-md text-primary rounded-xl" 
              />
              <div className="mt-14">
                <Title level={3} style={{ margin: 0 }}>{viewingCompany.name}</Title>
                <div className="mt-2 flex gap-2">
                  <Tag color={viewingCompany.status === 'ACTIVE' ? 'success' : viewingCompany.status === 'PENDING' ? 'warning' : 'error'}>
                    {viewingCompany.status}
                  </Tag>
                  {viewingCompany.industry && <Tag color="blue">{viewingCompany.industry}</Tag>}
                </div>
              </div>
            </div>

            <Descriptions title="Thông tin cơ bản" bordered column={1} size="small" className="bg-white">
              <Descriptions.Item label="Chủ sở hữu">
                {viewingCompany.employer_id ? `${viewingCompany.employer_id.name} (${viewingCompany.employer_id.email})` : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Mã số thuế">{viewingCompany.taxCode || 'Chưa cập nhật'}</Descriptions.Item>
              <Descriptions.Item label="Quy mô">{viewingCompany.size || 'Chưa cập nhật'}</Descriptions.Item>
              <Descriptions.Item label="Ngày thành lập">{viewingCompany.founded || 'Chưa cập nhật'}</Descriptions.Item>
              <Descriptions.Item label="Website">
                {viewingCompany.website ? <a href={viewingCompany.website} target="_blank" rel="noreferrer">{viewingCompany.website}</a> : 'Chưa cập nhật'}
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ">{viewingCompany.address || 'Chưa cập nhật'}</Descriptions.Item>
            </Descriptions>

            <Descriptions title="Hồ sơ xác minh (KYB)" bordered column={1} size="small" className="bg-white mt-4">
              <Descriptions.Item label="Giấy phép kinh doanh">
                {viewingCompany.business_license ? (
                  <a href={getImageUrl(viewingCompany.business_license)} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                    Xem tài liệu đính kèm
                  </a>
                ) : (
                  <Text type="secondary">Chưa tải lên</Text>
                )}
              </Descriptions.Item>
              {viewingCompany.rejection_reason && (
                <Descriptions.Item label="Lý do từ chối (Gần nhất)">
                  <Text type="danger">{viewingCompany.rejection_reason}</Text>
                </Descriptions.Item>
              )}
            </Descriptions>

            <Descriptions title="Mô tả & Sứ mệnh" bordered column={1} size="small" className="bg-white">
              <Descriptions.Item label="Sứ mệnh">
                <div className="whitespace-pre-line text-sm text-gray-600">{viewingCompany.mission || 'Chưa cập nhật'}</div>
              </Descriptions.Item>
              <Descriptions.Item label="Giới thiệu chi tiết">
                <div 
                  className="prose prose-sm max-w-none text-gray-600"
                  dangerouslySetInnerHTML={{ __html: viewingCompany.description || 'Chưa có thông tin giới thiệu' }}
                />
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Drawer>

      <Modal
        title="Từ chối/Đình chỉ Doanh nghiệp"
        open={isRejectModalVisible}
        onOk={submitReject}
        onCancel={() => setIsRejectModalVisible(false)}
        okText="Xác nhận"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <p className="mb-2 font-medium">Vui lòng nhập lý do (Sẽ được gửi tới nhà tuyển dụng):</p>
        <Input.TextArea
          rows={4}
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="Ví dụ: Giấy phép kinh doanh mờ, mã số thuế không khớp..."
        />
      </Modal>
    </AdminLayout>
  );
}

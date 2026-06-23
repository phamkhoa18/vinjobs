import { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { Card, Table, Tag, Button, Input, Space, Typography, Select, message, Modal, Form, Drawer, Descriptions, Popconfirm, Avatar } from 'antd';
import { SearchOutlined, EditOutlined, DeleteOutlined, LockOutlined, UnlockOutlined, PlusOutlined, EyeOutlined, UserOutlined } from '@ant-design/icons';
import { adminApi, getImageUrl } from '../../lib/api';

const { Title, Text } = Typography;

export default function ManageUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  
  // Params
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();
  
  // Drawer View Profile
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [viewingUser, setViewingUser] = useState(null);

  const fetchUsers = async (page = pagination.current, limit = pagination.pageSize, q = search, r = roleFilter, s = statusFilter) => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (q) params.search = q;
      if (r) params.role = r;
      if (s) params.status = s;
      
      const res = await adminApi.users(params);
      setUsers(res.data.users);
      setTotal(res.total);
      setPagination({ current: page, pageSize: limit });
    } catch (err) {
      message.error(err.message || 'Lỗi khi tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter, statusFilter]);

  const handleTableChange = (pag) => {
    fetchUsers(pag.current, pag.pageSize);
  };

  const handleSearch = (value) => {
    fetchUsers(1, pagination.pageSize, value);
  };

  const toggleStatus = async (user) => {
    const newStatus = user.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    try {
      await adminApi.updateUserStatus(user._id, newStatus);
      message.success(`Đã ${newStatus === 'ACTIVE' ? 'mở khóa' : 'khóa'} tài khoản ${user.name}`);
      fetchUsers();
    } catch (err) {
      message.error(err.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id) => {
    try {
      await adminApi.deleteUser(id);
      message.success('Đã xóa người dùng thành công');
      fetchUsers();
    } catch (err) {
      message.error(err.message || 'Không thể xóa người dùng');
    }
  };

  const openAddModal = () => {
    setEditingUser(null);
    form.resetFields();
    form.setFieldsValue({ role: 'CANDIDATE', status: 'ACTIVE' });
    setIsModalVisible(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    form.setFieldsValue({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      status: user.status,
    });
    setIsModalVisible(true);
  };

  const handleModalSubmit = async (values) => {
    try {
      if (editingUser) {
        await adminApi.updateUser(editingUser._id, values);
        message.success('Cập nhật thông tin thành công');
      } else {
        await adminApi.createUser(values);
        message.success('Tạo người dùng mới thành công');
      }
      setIsModalVisible(false);
      fetchUsers();
    } catch (err) {
      message.error(err.message || 'Có lỗi xảy ra khi lưu thông tin');
    }
  };

  const openViewDrawer = async (id) => {
    try {
      const res = await adminApi.getUser(id);
      setViewingUser(res.data.user);
      setIsDrawerVisible(true);
    } catch (err) {
      message.error(err.message || 'Không thể lấy thông tin chi tiết');
    }
  };

  const columns = [
    {
      title: 'Người dùng',
      key: 'user',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar src={record.avatar ? getImageUrl(record.avatar) : null} icon={<UserOutlined />} className="bg-primary/20 text-primary" />
          <div>
            <div className="font-semibold">{record.name}</div>
            <div className="text-xs text-gray-500">{record.email}</div>
          </div>
        </div>
      )
    },
    {
      title: 'SĐT',
      dataIndex: 'phone',
      key: 'phone',
      render: (text) => text || <Text type="secondary">N/A</Text>
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        const colors = { CANDIDATE: 'blue', EMPLOYER: 'green', ADMIN: 'purple' };
        return <Tag color={colors[role] || 'default'}>{role}</Tag>;
      },
    },
    {
      title: 'Ngày tham gia',
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
          UNVERIFIED: { color: 'warning', text: 'Chưa xác thực' },
          BLOCKED: { color: 'error', text: 'Đã khóa' },
          INACTIVE: { color: 'default', text: 'Vô hiệu hóa' }
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
          <Button type="text" icon={<EyeOutlined />} onClick={() => openViewDrawer(record._id)} title="Xem chi tiết" />
          <Button type="text" icon={<EditOutlined />} onClick={() => openEditModal(record)} title="Sửa nhanh" />
          <Button 
            type="text" 
            danger={record.status !== 'BLOCKED'}
            icon={record.status === 'BLOCKED' ? <UnlockOutlined /> : <LockOutlined />} 
            onClick={() => toggleStatus(record)}
            title={record.status === 'BLOCKED' ? 'Mở khóa' : 'Khóa'}
          />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa?"
            description="Hành động này không thể hoàn tác."
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
          <Title level={3} style={{ margin: 0 }}>Quản lý Người dùng</Title>
          <Text type="secondary">Quản lý và cấp quyền cho tất cả tài khoản trong hệ thống</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal} className="h-10 px-6 font-medium shadow-md">
          Thêm người dùng
        </Button>
      </div>

      <Card bordered={false} className="shadow-sm rounded-xl overflow-hidden">
        <Space className="mb-5 w-full flex-wrap" size="middle">
          <Input.Search 
            placeholder="Tìm theo tên hoặc email..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            onSearch={handleSearch}
            className="w-full sm:w-[320px]"
            allowClear
            size="large"
          />
          <Select 
            value={roleFilter} 
            className="min-w-[160px]"
            onChange={setRoleFilter}
            size="large"
            options={[
              { value: '', label: 'Tất cả vai trò' },
              { value: 'CANDIDATE', label: 'Ứng viên' },
              { value: 'EMPLOYER', label: 'Nhà tuyển dụng' },
              { value: 'ADMIN', label: 'Quản trị viên' },

            ]}
          />
          <Select 
            value={statusFilter} 
            className="min-w-[160px]"
            onChange={setStatusFilter}
            size="large"
            options={[
              { value: '', label: 'Tất cả trạng thái' },
              { value: 'ACTIVE', label: 'Hoạt động' },
              { value: 'UNVERIFIED', label: 'Chưa xác thực' },
              { value: 'BLOCKED', label: 'Đã khóa' },
            ]}
          />
        </Space>

        <Table 
          columns={columns} 
          dataSource={users} 
          rowKey="_id"
          pagination={{ 
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: total,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} tài khoản`
          }}
          loading={loading}
          onChange={handleTableChange}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Modal Thêm/Sửa */}
      <Modal
        title={<span className="text-lg font-bold">{editingUser ? 'Chỉnh sửa Người dùng' : 'Thêm Người dùng mới'}</span>}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        destroyOnClose
        centered
      >
        <Form layout="vertical" form={form} onFinish={handleModalSubmit} className="mt-4">
          <Form.Item name="name" label="Họ và Tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
            <Input placeholder="Nhập họ tên đầy đủ" size="large" />
          </Form.Item>
          
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Vui lòng nhập email hợp lệ' }]}>
            <Input placeholder="Nhập địa chỉ email" size="large" disabled={!!editingUser} />
          </Form.Item>

          <Form.Item name="phone" label="Số điện thoại">
            <Input placeholder="Nhập số điện thoại" size="large" />
          </Form.Item>

          {!editingUser && (
            <Form.Item name="password" label="Mật khẩu" extra="Nếu bỏ trống, mật khẩu mặc định là 123456">
              <Input.Password placeholder="Nhập mật khẩu" size="large" />
            </Form.Item>
          )}

          {editingUser && (
            <Form.Item name="password" label="Mật khẩu mới" extra="Chỉ nhập khi bạn muốn đổi mật khẩu cho người dùng này">
              <Input.Password placeholder="Nhập mật khẩu mới (nếu có)" size="large" />
            </Form.Item>
          )}

          <div className="flex gap-4">
            <Form.Item name="role" label="Vai trò" className="flex-1" rules={[{ required: true }]}>
              <Select size="large">
                <Select.Option value="CANDIDATE">Ứng viên</Select.Option>
                <Select.Option value="EMPLOYER">Nhà tuyển dụng</Select.Option>
                <Select.Option value="ADMIN">Quản trị viên</Select.Option>

              </Select>
            </Form.Item>

            <Form.Item name="status" label="Trạng thái" className="flex-1" rules={[{ required: true }]}>
              <Select size="large">
                <Select.Option value="ACTIVE">Hoạt động</Select.Option>
                <Select.Option value="UNVERIFIED">Chưa xác thực</Select.Option>
                <Select.Option value="BLOCKED">Khóa</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button size="large" onClick={() => setIsModalVisible(false)}>Hủy</Button>
            <Button size="large" type="primary" htmlType="submit" className="px-8">{editingUser ? 'Lưu thay đổi' : 'Tạo mới'}</Button>
          </div>
        </Form>
      </Modal>

      {/* Drawer Xem Chi Tiết Profile */}
      <Drawer
        title={<span className="font-bold text-lg">Hồ sơ Chi tiết</span>}
        placement="right"
        width={600}
        onClose={() => setIsDrawerVisible(false)}
        open={isDrawerVisible}
      >
        {viewingUser && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <Avatar size={80} src={viewingUser.avatar ? getImageUrl(viewingUser.avatar) : null} icon={<UserOutlined />} className="bg-primary/20 text-primary" />
              <div>
                <Title level={4} style={{ margin: 0 }}>{viewingUser.name}</Title>
                <Text type="secondary">{viewingUser.email}</Text>
                <div className="mt-2">
                  <Tag color="blue">{viewingUser.role}</Tag>
                  <Tag color={viewingUser.status === 'ACTIVE' ? 'success' : 'error'}>{viewingUser.status}</Tag>
                </div>
              </div>
            </div>

            <Descriptions title="Thông tin cơ bản" bordered column={1} size="small" className="bg-white">
              <Descriptions.Item label="Số điện thoại">{viewingUser.phone || 'Chưa cập nhật'}</Descriptions.Item>
              <Descriptions.Item label="Ngày tham gia">{new Date(viewingUser.createdAt).toLocaleString('vi-VN')}</Descriptions.Item>
              <Descriptions.Item label="Giới tính">{viewingUser.profile?.gender || 'Chưa cập nhật'}</Descriptions.Item>
              <Descriptions.Item label="Ngày sinh">{viewingUser.profile?.dob ? new Date(viewingUser.profile.dob).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</Descriptions.Item>
              <Descriptions.Item label="Địa chỉ">{viewingUser.profile?.address || 'Chưa cập nhật'}</Descriptions.Item>
            </Descriptions>

            {viewingUser.role === 'CANDIDATE' && viewingUser.profile && (
              <Descriptions title="Thông tin nghề nghiệp" bordered column={1} size="small" className="bg-white">
                <Descriptions.Item label="Công việc hiện tại">{viewingUser.profile.currentJob || 'Chưa cập nhật'}</Descriptions.Item>
                <Descriptions.Item label="Kinh nghiệm">{viewingUser.profile.experience || 'Chưa cập nhật'}</Descriptions.Item>
                <Descriptions.Item label="Cấp bậc">{viewingUser.profile.level || 'Chưa cập nhật'}</Descriptions.Item>
                <Descriptions.Item label="Mức lương">{viewingUser.profile.salary || 'Thỏa thuận'}</Descriptions.Item>
                <Descriptions.Item label="Lĩnh vực">{viewingUser.profile.industry || 'Chưa cập nhật'}</Descriptions.Item>
                <Descriptions.Item label="Kỹ năng">
                  {viewingUser.profile.skills?.length > 0 
                    ? viewingUser.profile.skills.map(s => <Tag key={s} className="mb-1">{s}</Tag>)
                    : 'Chưa cập nhật'}
                </Descriptions.Item>
                <Descriptions.Item label="Giới thiệu">
                  <div className="whitespace-pre-line text-sm text-gray-600">{viewingUser.profile.intro || 'Chưa có giới thiệu'}</div>
                </Descriptions.Item>
              </Descriptions>
            )}
          </div>
        )}
      </Drawer>
    </AdminLayout>
  );
}

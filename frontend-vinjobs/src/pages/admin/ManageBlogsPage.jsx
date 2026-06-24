import { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { Card, Table, Tag, Button, Space, Typography, Switch, Modal, Form, Input, Popconfirm, message, Select, Upload } from 'antd';
import ImgCrop from 'antd-img-crop';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import api, { adminApi, getImageUrl } from '../../lib/api';
import { useNavigate } from 'react-router-dom';
import 'react-quill-new/dist/quill.snow.css';

const { Title, Text } = Typography;

export default function ManageBlogsPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/blog/admin/posts?limit=1000');
      setPosts(res.data?.posts || []);

      const catRes = await api.get('/blog/categories');
      setCategories(catRes.data?.categories || []);

    } catch (err) {
      message.error(err.message || 'Lỗi khi tải danh sách bài viết');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = () => {
    navigate('/admin/blogs/create');
  };

  const handleEdit = (post) => {
    navigate(`/admin/blogs/edit/${post._id}`);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/blog/posts/${id}`);
      message.success('Xóa bài viết thành công');
      fetchData();
    } catch (err) {
      message.error(err.message || 'Không thể xóa bài viết này');
    }
  };

  const columns = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <Space>
          {record.thumbnail ? (
            <img src={getImageUrl(record.thumbnail)} alt={text} className="w-12 h-12 rounded object-cover shadow-sm border" />
          ) : (
            <div className="w-12 h-12 rounded flex items-center justify-center bg-gray-100 text-gray-400 border">
              No Img
            </div>
          )}
          <div className="max-w-xs">
            <div className="font-semibold text-gray-700 line-clamp-2">{text}</div>
            <div className="text-xs text-gray-400 mt-1">{new Date(record.createdAt).toLocaleDateString('vi-VN')}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Danh mục',
      dataIndex: ['category_id', 'name'],
      key: 'category',
      render: (text) => <Tag color="blue">{text || 'Không có'}</Tag>
    },
    {
      title: 'Trạng thái',
      key: 'status',
      dataIndex: 'status',
      render: (status) => {
        let color = 'gray';
        if (status === 'PUBLISHED') color = 'green';
        if (status === 'DRAFT') color = 'orange';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: 'Lượt xem',
      dataIndex: 'view_count',
      key: 'view_count',
      align: 'center',
    },
    {
      title: 'Thao tác',
      key: 'action',
      align: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} title="Sửa" />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa bài viết này?"
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

  const categoryOptions = categories.map(c => ({ value: c._id, label: c.name }));

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <Title level={3} style={{ margin: 0 }}>Quản lý Cẩm nang / Blog</Title>
          <Text type="secondary">Quản lý các bài viết tin tức, cẩm nang tìm việc</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} className="h-10 px-6 font-medium shadow-md">
          Viết bài mới
        </Button>
      </div>

      <Card bordered={false} className="shadow-sm rounded-xl overflow-hidden">
        <Table 
          columns={columns} 
          dataSource={posts} 
          rowKey="_id"
          pagination={{ pageSize: 10 }}
          loading={loading}
          scroll={{ x: 800 }}
        />
      </Card>
    </AdminLayout>
  );
}

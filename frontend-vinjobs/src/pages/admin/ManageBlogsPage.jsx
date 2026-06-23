import { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { Card, Table, Tag, Button, Space, Typography, Switch, Modal, Form, Input, Popconfirm, message, Select, Upload } from 'antd';
import ImgCrop from 'antd-img-crop';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import { adminApi, getImageUrl } from '../../lib/api';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const { Title, Text } = Typography;

export default function ManageBlogsPage() {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Modal State
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [form] = Form.useForm();
  
  // File Upload State
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      // Get all posts - Assuming adminApi.posts() exists, if not we will use blogApi and adjust
      // Wait, let's use the public blog API for getting posts since Admin is just content manager
      const token = localStorage.getItem('token');
      const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
      
      const res = await fetch(`${BASE_URL}/blog/posts?limit=1000`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setPosts(data.data?.posts || []);

      const catRes = await fetch(`${BASE_URL}/blog/categories`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const catData = await catRes.json();
      setCategories(catData.data?.categories || []);

    } catch (err) {
      message.error(err.message || 'Lỗi khi tải danh sách bài viết');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingPost(null);
    setSelectedImage(null);
    setPreviewImage('');
    form.resetFields();
    form.setFieldsValue({ status: 'PUBLISHED' });
    setIsModalVisible(true);
  };

  const openEditModal = (post) => {
    setEditingPost(post);
    setSelectedImage(null);
    setPreviewImage('');
    form.setFieldsValue({
      title: post.title,
      content: post.content,
      category_id: post.category_id?._id,
      status: post.status,
    });
    setIsModalVisible(true);
  };

  const handleModalSubmit = async (values) => {
    try {
      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('content', values.content);
      if (values.category_id) formData.append('category_id', values.category_id);
      formData.append('status', values.status);

      if (selectedImage) {
        formData.append('thumbnail', selectedImage);
      }

      const token = localStorage.getItem('token');
      const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

      let res;
      if (editingPost) {
        // Assume PUT /blog/posts/:id exists
        res = await fetch(`${BASE_URL}/blog/posts/${editingPost._id}`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });
      } else {
        res = await fetch(`${BASE_URL}/blog/posts`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi');

      message.success(editingPost ? 'Cập nhật bài viết thành công' : 'Tạo bài viết thành công');
      setIsModalVisible(false);
      fetchData();
    } catch (err) {
      message.error(err.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
      const res = await fetch(`${BASE_URL}/blog/posts/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Không thể xóa');
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
          <Button type="text" icon={<EditOutlined />} onClick={() => openEditModal(record)} title="Sửa" />
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
        <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal} className="h-10 px-6 font-medium shadow-md">
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

      <Modal
        title={<span className="text-xl font-bold">{editingPost ? 'Chỉnh sửa Bài viết' : 'Thêm Bài viết mới'}</span>}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        destroyOnClose
        centered
        width={900}
        styles={{ body: { maxHeight: 'calc(100vh - 120px)', overflowY: 'auto', paddingRight: '8px' } }}
      >
        <Form layout="vertical" form={form} onFinish={handleModalSubmit} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Form.Item name="title" label={<span className="font-semibold">Tiêu đề bài viết</span>} rules={[{ required: true }]}>
                <Input placeholder="Nhập tiêu đề..." size="large" />
              </Form.Item>
              
              <Form.Item name="content" label={<span className="font-semibold">Nội dung</span>} rules={[{ required: true }]}>
                <ReactQuill theme="snow" style={{ height: 300, marginBottom: 40 }} />
              </Form.Item>
            </div>

            <div>
              <Form.Item name="category_id" label={<span className="font-semibold">Chuyên mục</span>}>
                <Select size="large" options={categoryOptions} placeholder="Chọn chuyên mục" />
              </Form.Item>

              <Form.Item name="status" label={<span className="font-semibold">Trạng thái</span>}>
                <Select size="large" options={[
                  { value: 'PUBLISHED', label: 'Xuất bản (Hiển thị)' },
                  { value: 'DRAFT', label: 'Bản nháp (Ẩn)' },
                ]} />
              </Form.Item>

              <Form.Item label={<span className="font-semibold">Ảnh Thumbnail</span>}>
                <ImgCrop rotationSlider aspect={16/9}>
                  <Upload
                    listType="picture-card"
                    showUploadList={false}
                    beforeUpload={(file) => {
                      setSelectedImage(file);
                      setPreviewImage(URL.createObjectURL(file));
                      return false;
                    }}
                  >
                    {previewImage || editingPost?.thumbnail ? (
                      <img src={previewImage || getImageUrl(editingPost?.thumbnail)} alt="thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div className="flex flex-col items-center">
                        <UploadOutlined className="text-2xl" />
                        <div className="mt-2 text-sm">Tải ảnh lên</div>
                      </div>
                    )}
                  </Upload>
                </ImgCrop>
              </Form.Item>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
            <Button size="large" onClick={() => setIsModalVisible(false)} className="rounded-lg">Hủy bỏ</Button>
            <Button size="large" type="primary" htmlType="submit" className="px-8 rounded-lg shadow-md font-medium">
              {editingPost ? 'Lưu thay đổi' : 'Đăng bài viết'}
            </Button>
          </div>
        </Form>
      </Modal>
    </AdminLayout>
  );
}

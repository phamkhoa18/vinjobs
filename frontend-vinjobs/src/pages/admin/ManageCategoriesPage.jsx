import { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { Card, Table, Tag, Button, Space, Typography, Switch, Modal, Form, Input, Popconfirm, message, Select, Upload, ColorPicker } from 'antd';
import ImgCrop from 'antd-img-crop';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, AppstoreOutlined, UploadOutlined
} from '@ant-design/icons';
import * as AntdIcons from '@ant-design/icons';
import { adminApi } from '../../lib/api';

const { Title, Text } = Typography;

// Lấy toàn bộ Icon Outlined từ Ant Design (Hơn 400 icon)
const allIconNames = Object.keys(AntdIcons).filter(
  key => key.endsWith('Outlined') && typeof AntdIcons[key] === 'object'
);

const renderIcon = (record) => {
  if (record.custom_svg) {
    return (
      <span 
        className="custom-svg-icon w-5 h-5 flex items-center justify-center" 
        dangerouslySetInnerHTML={{ __html: record.custom_svg }} 
        style={{ fill: 'currentColor' }}
      />
    );
  }
  if (!record.icon) return <AppstoreOutlined />;
  const IconComponent = AntdIcons[record.icon];
  if (IconComponent) {
    return <IconComponent />;
  }
  return <AppstoreOutlined />;
};

const BASE_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api/v1', '') : 'http://localhost:8000';
const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${BASE_URL}${url}`;
};

export default function ManageCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [treeData, setTreeData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Modal State
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form] = Form.useForm();
  
  // File Upload State
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState('');

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await adminApi.categories();
      const flatData = res.data.categories;
      setCategories(flatData);
      setTreeData(buildTree(flatData));
    } catch (err) {
      message.error(err.message || 'Lỗi khi tải danh sách danh mục');
    } finally {
      setLoading(false);
    }
  };

  const buildTree = (flatCategories) => {
    const tree = [];
    const mappedArr = {};

    flatCategories.forEach(c => {
      mappedArr[c._id] = { ...c, key: c._id, children: [] };
    });

    flatCategories.forEach(c => {
      if (c.parent_id) {
        if (mappedArr[c.parent_id]) {
          mappedArr[c.parent_id].children.push(mappedArr[c._id]);
        } else {
          tree.push(mappedArr[c._id]);
        }
      } else {
        tree.push(mappedArr[c._id]);
      }
    });

    const removeEmptyChildren = (nodes) => {
      nodes.forEach(n => {
        if (n.children.length === 0) delete n.children;
        else removeEmptyChildren(n.children);
      });
    };
    removeEmptyChildren(tree);

    return tree;
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    setSelectedImage(null);
    setPreviewImage('');
    form.resetFields();
    form.setFieldsValue({ 
      is_active: true,
      icon_color: '#3674c5',
      bg_color: '#eef2ff',
    });
    setIsModalVisible(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setSelectedImage(null);
    setPreviewImage('');
    form.setFieldsValue({
      name: category.name,
      description: category.description,
      icon: category.icon,
      custom_svg: category.custom_svg,
      icon_color: category.icon_color || '#3674c5',
      bg_color: category.bg_color || '#eef2ff',
      parent_id: category.parent_id || null,
      is_active: category.is_active,
    });
    setIsModalVisible(true);
  };

  const handleModalSubmit = async (values) => {
    try {
      const formData = new FormData();
      formData.append('name', values.name);
      if (values.description) formData.append('description', values.description);
      if (values.icon) formData.append('icon', values.icon);
      if (values.custom_svg) formData.append('custom_svg', values.custom_svg);
      if (values.icon_color) {
        formData.append('icon_color', typeof values.icon_color === 'string' ? values.icon_color : values.icon_color.toHexString());
      }
      if (values.bg_color) {
        formData.append('bg_color', typeof values.bg_color === 'string' ? values.bg_color : values.bg_color.toHexString());
      }
      if (values.parent_id) formData.append('parent_id', values.parent_id);
      formData.append('is_active', values.is_active);

      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      if (editingCategory) {
        await adminApi.updateCategory(editingCategory._id, formData);
        message.success('Cập nhật danh mục thành công');
      } else {
        await adminApi.createCategory(formData);
        message.success('Tạo danh mục thành công');
      }
      setIsModalVisible(false);
      fetchCategories();
    } catch (err) {
      message.error(err.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id) => {
    try {
      await adminApi.deleteCategory(id);
      message.success('Xóa danh mục thành công');
      fetchCategories();
    } catch (err) {
      message.error(err.message || 'Không thể xóa danh mục này');
    }
  };

  const toggleActive = async (checked, record) => {
    try {
      await adminApi.updateCategory(record._id, { is_active: checked });
      message.success(`Đã ${checked ? 'bật' : 'tắt'} danh mục ${record.name}`);
      fetchCategories();
    } catch (err) {
      message.error(err.message || 'Có lỗi xảy ra');
    }
  };

  const columns = [
    {
      title: 'Tên Danh mục',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          {record.image ? (
            <img src={getImageUrl(record.image)} alt={text} className="w-8 h-8 rounded object-cover shadow-sm border" />
          ) : (
            <div 
              className="w-8 h-8 rounded flex items-center justify-center shadow-sm border border-gray-100"
              style={{ 
                backgroundColor: record.bg_color || '#eef2ff',
                color: record.icon_color || '#3674c5'
              }}
            >
              {renderIcon(record)}
            </div>
          )}
          <span className="font-semibold text-gray-700">{text}</span>
          {record.children && record.children.length > 0 && (
            <Tag color="blue" className="ml-2">{record.children.length} nhóm con</Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Đường dẫn (Slug)',
      dataIndex: 'slug',
      key: 'slug',
      render: (text) => <Text type="secondary">{text}</Text>
    },
    {
      title: 'Hiển thị',
      key: 'is_active',
      dataIndex: 'is_active',
      render: (isActive, record) => (
        <Switch 
          checked={isActive} 
          onChange={(checked) => toggleActive(checked, record)}
          checkedChildren="Bật"
          unCheckedChildren="Tắt"
        />
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      align: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button type="text" icon={<EditOutlined />} onClick={() => openEditModal(record)} title="Sửa" />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa danh mục này?"
            description="Không thể xóa nếu đang chứa các danh mục con."
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

  const parentOptions = [
    { value: null, label: 'Không (Danh mục gốc)' },
    ...categories
      .filter(c => !c.parent_id && c._id !== editingCategory?._id)
      .map(c => ({ value: c._id, label: c.name }))
  ];

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <Title level={3} style={{ margin: 0 }}>Quản lý Danh mục Nghề nghiệp</Title>
          <Text type="secondary">Cấu trúc phân tầng danh mục để dễ dàng quản lý tin tuyển dụng</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal} className="h-10 px-6 font-medium shadow-md">
          Thêm danh mục
        </Button>
      </div>

      <Card bordered={false} className="shadow-sm rounded-xl overflow-hidden">
        <Table 
          columns={columns} 
          dataSource={treeData} 
          rowKey="_id"
          pagination={{
            defaultPageSize: 5,
            showSizeChanger: true,
            pageSizeOptions: ['5', '10', '20', '50'],
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} danh mục gốc`,
            position: ['bottomCenter']
          }}
          loading={loading}
          scroll={{ x: 800 }}
          defaultExpandAllRows
        />
      </Card>

      <Modal
        title={<span className="text-xl font-bold">{editingCategory ? 'Chỉnh sửa Danh mục' : 'Thêm Danh mục mới'}</span>}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        destroyOnClose
        centered
        width={850}
        styles={{ body: { maxHeight: 'calc(100vh - 120px)', overflowY: 'auto', paddingRight: '8px' } }}
      >
        <Form layout="vertical" form={form} onFinish={handleModalSubmit} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
            {/* Cột trái: Thông tin cơ bản */}
            <div>
              <Form.Item name="name" label={<span className="font-semibold">Tên danh mục</span>} rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}>
                <Input placeholder="Ví dụ: Công nghệ thông tin" size="large" />
              </Form.Item>
              
              <Form.Item name="parent_id" label={<span className="font-semibold">Thuộc danh mục cha</span>}>
                <Select 
                  size="large" 
                  options={parentOptions}
                  disabled={editingCategory && categories.some(c => c.parent_id === editingCategory._id)}
                  allowClear
                  placeholder="Chọn danh mục cha (nếu có)"
                />
              </Form.Item>

              <Form.Item name="description" label={<span className="font-semibold">Mô tả danh mục</span>}>
                <Input.TextArea placeholder="Nhập mô tả ngắn gọn..." rows={4} />
              </Form.Item>

              <Form.Item name="is_active" valuePropName="checked" className="mb-0">
                <Switch checkedChildren="Đang hiển thị" unCheckedChildren="Đang ẩn" />
              </Form.Item>
            </div>

            {/* Cột phải: Nhận diện & Media */}
            <div>
              <Form.Item name="icon" label={<span className="font-semibold">Chọn Icon (Ant Design)</span>}>
                <Select
                  showSearch
                  placeholder="Tìm kiếm biểu tượng..."
                  allowClear
                  virtual={true}
                  dropdownStyle={{ minWidth: 250 }}
                  size="large"
                >
                  {allIconNames.map(iconName => {
                    const IconComponent = AntdIcons[iconName];
                    return (
                      <Select.Option key={iconName} value={iconName}>
                        <Space>
                          <IconComponent className="text-gray-500 text-lg" />
                          <span className="text-gray-600 text-sm truncate">{iconName.replace('Outlined', '')}</span>
                        </Space>
                      </Select.Option>
                    )
                  })}
                </Select>
              </Form.Item>

              <Form.Item name="custom_svg" label={<span className="font-semibold text-[#3674c5]">Hoặc Dán mã SVG Custom (Ưu tiên)</span>}>
                <Input.TextArea placeholder="<svg viewBox='0 0 24 24'>...</svg>" rows={2} style={{ fontFamily: 'monospace' }} />
              </Form.Item>

              <div className="flex gap-4">
                <Form.Item name="icon_color" label={<span className="font-semibold">Màu Icon</span>} className="w-1/2">
                  <ColorPicker showText format="hex" />
                </Form.Item>
                <Form.Item name="bg_color" label={<span className="font-semibold">Màu Nền</span>} className="w-1/2">
                  <ColorPicker showText format="hex" />
                </Form.Item>
              </div>

              <Form.Item label={<span className="font-semibold">Hình ảnh Banner (Tùy chọn)</span>}>
                <ImgCrop 
                  rotationSlider 
                  aspect={16/9} 
                  shape="rect" 
                  modalTitle="Cắt Hình Ảnh"
                  modalOk="Cắt ảnh"
                  modalCancel="Hủy"
                  beforeCrop={(file) => {
                    const isImage = file.type.startsWith('image/');
                    if (!isImage) {
                      message.error('Chỉ cho phép tải lên file hình ảnh!');
                      return Upload.LIST_IGNORE;
                    }
                    return true;
                  }}
                >
                  <Upload
                    listType="picture-card"
                    showUploadList={false}
                    beforeUpload={(file) => {
                      setSelectedImage(file);
                      setPreviewImage(URL.createObjectURL(file));
                      return false;
                    }}
                  >
                    {previewImage || editingCategory?.image ? (
                      <img src={previewImage || getImageUrl(editingCategory?.image)} alt="category" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
                    ) : (
                      <div className="flex flex-col items-center justify-center p-4">
                        <UploadOutlined className="text-2xl text-gray-400" />
                        <div className="mt-2 text-sm text-gray-500 text-center">Nhấp để tải ảnh lên (16:9)</div>
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
              {editingCategory ? 'Lưu thay đổi' : 'Tạo danh mục mới'}
            </Button>
          </div>
        </Form>
      </Modal>
    </AdminLayout>
  );
}

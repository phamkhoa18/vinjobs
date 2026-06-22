import { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { Card, Form, Input, Button, Typography, message, Upload, Avatar, Divider, Row, Col, Tag, Spin } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, LockOutlined, SaveOutlined, CameraOutlined, LoadingOutlined } from '@ant-design/icons';
import ImgCrop from 'antd-img-crop';
import { useAuth } from '../../contexts/AuthContext';
import ImageUploadService from '../../services/ImageUploadService';
import { getImageUrl, userStorage } from '../../lib/api';

const { Title, Text } = Typography;

export default function AdminProfilePage() {
  const { user, setUser } = useAuth();
  const [formProfile] = Form.useForm();
  const [formPassword] = Form.useForm();
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      formProfile.setFieldsValue({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
      });
      setAvatarUrl(user.avatar ? getImageUrl(user.avatar) : '');
    }
  }, [user, formProfile]);

  const handleUpdateProfile = (values) => {
    console.log('Update profile:', values);
    message.success('Cập nhật thông tin cá nhân thành công!');
  };

  const handleUpdatePassword = (values) => {
    if (values.newPassword !== values.confirmPassword) {
      return message.error('Mật khẩu xác nhận không khớp!');
    }
    console.log('Update password:', values);
    message.success('Đổi mật khẩu thành công!');
    formPassword.resetFields();
  };

  const customUpload = async ({ file, onSuccess, onError }) => {
    setUploading(true);
    try {
      // Dùng ImageUploadService để nén -> upload -> auto update profile
      const newUrl = await ImageUploadService.uploadAvatar(file, true);
      
      // Thành công thì update URL hiển thị
      setAvatarUrl(getImageUrl(newUrl));
      
      // BẮT BUỘC cập nhật lại Context để các nơi khác (Header) nhận diện được ảnh mới
      const updatedUser = { ...user, avatar: newUrl };
      setUser(updatedUser);
      userStorage.set(updatedUser);

      message.success('Cập nhật ảnh đại diện thành công!');
      onSuccess('ok');
    } catch (err) {
      onError(err);
    } finally {
      setUploading(false);
    }
  };

  const uploadButton = (
    <div className="flex flex-col items-center justify-center text-gray-500">
      {uploading ? <LoadingOutlined className="text-xl mb-1 text-blue-500" /> : <CameraOutlined className="text-xl mb-1" />}
      <div className="text-xs">{uploading ? 'Đang tải lên...' : 'Đổi Ảnh'}</div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="mb-6">
        <Title level={3} style={{ margin: 0 }}>Hồ sơ cá nhân</Title>
        <Text type="secondary">Cập nhật thông tin tài khoản quản trị viên của bạn</Text>
      </div>

      <Row gutter={[24, 24]}>
        {/* Thông tin cá nhân */}
        <Col xs={24} lg={16}>
          <Card 
            title={<span className="font-semibold text-lg">Thông tin cơ bản</span>} 
            bordered={false} 
            className="shadow-sm h-full"
          >
            <div className="flex flex-col md:flex-row gap-8">
              {/* Cột Avatar */}
              <div className="flex flex-col items-center gap-4">
                <ImgCrop 
                  rotationSlider 
                  aspect={1} 
                  shape="round" 
                  modalTitle="Chỉnh sửa ảnh đại diện"
                  modalOk="Cập nhật"
                  modalCancel="Hủy"
                  beforeCrop={(file) => {
                    const isImage = file.type.startsWith('image/');
                    if (!isImage) {
                      message.error('Bạn chỉ có thể chọn file hình ảnh!');
                      return Upload.LIST_IGNORE;
                    }
                    return true;
                  }}
                >
                  <Upload
                    name="avatar"
                    listType="picture-circle"
                    className="avatar-uploader overflow-hidden"
                    showUploadList={false}
                    customRequest={customUpload}
                  >
                    {avatarUrl ? (
                      <div className="relative group w-full h-full">
                        <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover rounded-full" />
                        {/* Lớp mờ đen khi hover */}
                        <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all cursor-pointer">
                           {uploading ? <LoadingOutlined className="text-white text-2xl" /> : <CameraOutlined className="text-white text-2xl" />}
                        </div>
                      </div>
                    ) : (
                      uploadButton
                    )}
                  </Upload>
                </ImgCrop>
                <div className="text-center">
                  <Tag color="purple" className="m-0 text-sm px-3 py-1 font-semibold rounded-full border-0 bg-purple-100 text-purple-700">
                    QUẢN TRỊ VIÊN
                  </Tag>
                </div>
              </div>

              {/* Cột Form */}
              <div className="flex-1">
                <Form 
                  form={formProfile} 
                  layout="vertical" 
                  onFinish={handleUpdateProfile}
                  size="large"
                >
                  <Form.Item 
                    name="name" 
                    label={<span className="font-medium">Họ và Tên</span>}
                    rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                  >
                    <Input prefix={<UserOutlined className="text-gray-400 mr-1" />} placeholder="Nhập họ tên đầy đủ..." />
                  </Form.Item>
                  
                  <Form.Item 
                    name="email" 
                    label={<span className="font-medium">Địa chỉ Email</span>}
                  >
                    <Input prefix={<MailOutlined className="text-gray-400 mr-1" />} disabled className="bg-gray-50" />
                  </Form.Item>

                  <Form.Item 
                    name="phone" 
                    label={<span className="font-medium">Số điện thoại liên hệ</span>}
                  >
                    <Input prefix={<PhoneOutlined className="text-gray-400 mr-1" />} placeholder="Nhập số điện thoại..." />
                  </Form.Item>

                  <Form.Item className="mb-0 mt-6">
                    <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                      Lưu thay đổi
                    </Button>
                  </Form.Item>
                </Form>
              </div>
            </div>
          </Card>
        </Col>

        {/* Đổi mật khẩu */}
        <Col xs={24} lg={8}>
          <Card 
            title={<span className="font-semibold text-lg">Đổi mật khẩu</span>} 
            bordered={false} 
            className="shadow-sm h-full"
          >
            <Form 
              form={formPassword} 
              layout="vertical" 
              onFinish={handleUpdatePassword}
              size="large"
            >
              <Form.Item 
                name="currentPassword" 
                label={<span className="font-medium">Mật khẩu hiện tại</span>}
                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu cũ' }]}
              >
                <Input.Password prefix={<LockOutlined className="text-gray-400 mr-1" />} placeholder="••••••••" />
              </Form.Item>
              
              <Form.Item 
                name="newPassword" 
                label={<span className="font-medium">Mật khẩu mới</span>}
                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới' }, { min: 6, message: 'Tối thiểu 6 ký tự' }]}
              >
                <Input.Password prefix={<LockOutlined className="text-gray-400 mr-1" />} placeholder="••••••••" />
              </Form.Item>

              <Form.Item 
                name="confirmPassword" 
                label={<span className="font-medium">Xác nhận mật khẩu mới</span>}
                rules={[{ required: true, message: 'Vui lòng xác nhận mật khẩu' }]}
              >
                <Input.Password prefix={<LockOutlined className="text-gray-400 mr-1" />} placeholder="••••••••" />
              </Form.Item>

              <Form.Item className="mb-0 mt-6">
                <Button type="default" htmlType="submit" className="w-full">
                  Cập nhật Mật khẩu
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>

      <style>{`
        .avatar-uploader .ant-upload.ant-upload-select-picture-circle {
          width: 120px !important;
          height: 120px !important;
          border: 2px dashed #d9d9d9;
          background-color: #fafafa;
        }
        .avatar-uploader .ant-upload.ant-upload-select-picture-circle:hover {
          border-color: #3674c5;
        }
      `}</style>
    </AdminLayout>
  );
}

import { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { Card, Tabs, Form, Input, Switch, Button, Typography, message, Upload, Spin } from 'antd';
import { SaveOutlined, UploadOutlined, LoadingOutlined } from '@ant-design/icons';
import { adminApi, publicApi, getImageUrl } from '../../lib/api';
import { useSettings } from '../../contexts/SettingsContext';
import ImgCrop from 'antd-img-crop';

const { Title, Text } = Typography;

export default function SettingsPage() {
  const [formGeneral] = Form.useForm();
  const [formSEO] = Form.useForm();
  const [formContact] = Form.useForm();
  const { fetchSettings } = useSettings();
  const [loading, setLoading] = useState(true);
  
  // Image states
  const [logoFile, setLogoFile] = useState(null);
  const [faviconFile, setFaviconFile] = useState(null);
  const [previewLogo, setPreviewLogo] = useState('');
  const [previewFavicon, setPreviewFavicon] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await publicApi.getSettings();
      const st = res.data.settings;
      
      formGeneral.setFieldsValue({
        site_name: st.site_name,
      });
      
      formSEO.setFieldsValue({
        seo_title: st.seo_title,
        seo_description: st.seo_description,
        seo_keywords: st.seo_keywords,
      });

      formContact.setFieldsValue({
        contact_email: st.contact_email,
        contact_phone: st.contact_phone,
        address: st.address,
        facebook_url: st.facebook_url,
        linkedin_url: st.linkedin_url,
      });

      setPreviewLogo(st.logo ? getImageUrl(st.logo) : '');
      setPreviewFavicon(st.favicon ? getImageUrl(st.favicon) : '');

    } catch (error) {
      message.error('Không thể tải cấu hình hệ thống');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (values) => {
    try {
      const formData = new FormData();
      Object.keys(values).forEach(key => {
        if (values[key] !== undefined) {
          formData.append(key, values[key]);
        }
      });

      if (logoFile) formData.append('logo', logoFile);
      if (faviconFile) formData.append('favicon', faviconFile);

      await adminApi.updateSettings(formData);
      message.success('Cập nhật cấu hình hệ thống thành công!');
      
      // Update global context
      fetchSettings();
      
      // Reset files after upload
      setLogoFile(null);
      setFaviconFile(null);
    } catch (err) {
      message.error(err.message || 'Cập nhật thất bại');
    }
  };

  const generalSettings = (
    <Form 
      form={formGeneral} 
      layout="vertical" 
      onFinish={handleSave}
    >
      <Form.Item name="site_name" label={<span className="font-semibold">Tên Website (Site Name)</span>} rules={[{ required: true }]}>
        <Input size="large" />
      </Form.Item>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
        <div>
          <div className="font-semibold mb-2">Logo Website</div>
          <div className="text-sm text-gray-500 mb-4">Logo xuất hiện trên thanh điều hướng. (Tỷ lệ khuyến nghị 3:1 hoặc 4:1)</div>
          <ImgCrop aspect={3/1} shape="rect" rotationSlider>
            <Upload
              listType="picture-card"
              showUploadList={false}
              beforeUpload={(file) => {
                setLogoFile(file);
                setPreviewLogo(URL.createObjectURL(file));
                return false;
              }}
            >
              {previewLogo ? (
                <img src={previewLogo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              ) : (
                <div>
                  <UploadOutlined />
                  <div className="mt-2">Tải Logo</div>
                </div>
              )}
            </Upload>
          </ImgCrop>
        </div>

        <div>
          <div className="font-semibold mb-2">Favicon</div>
          <div className="text-sm text-gray-500 mb-4">Biểu tượng xuất hiện trên tab trình duyệt. (Vuông 1:1)</div>
          <ImgCrop aspect={1} shape="rect" rotationSlider>
            <Upload
              listType="picture-card"
              showUploadList={false}
              beforeUpload={(file) => {
                setFaviconFile(file);
                setPreviewFavicon(URL.createObjectURL(file));
                return false;
              }}
            >
              {previewFavicon ? (
                <img src={previewFavicon} alt="Favicon" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              ) : (
                <div>
                  <UploadOutlined />
                  <div className="mt-2">Tải Favicon</div>
                </div>
              )}
            </Upload>
          </ImgCrop>
        </div>
      </div>

      <Form.Item className="mt-8 mb-0">
        <Button type="primary" htmlType="submit" icon={<SaveOutlined />} size="large">Lưu thay đổi Logo & Tên</Button>
      </Form.Item>
    </Form>
  );

  const seoSettings = (
    <Form 
      form={formSEO} 
      layout="vertical" 
      onFinish={handleSave}
    >
      <Form.Item name="seo_title" label={<span className="font-semibold">Tiêu đề SEO Mặc định (Title Tag)</span>}>
        <Input size="large" showCount maxLength={70} />
      </Form.Item>
      
      <Form.Item name="seo_description" label={<span className="font-semibold">Mô tả SEO Mặc định (Meta Description)</span>}>
        <Input.TextArea size="large" rows={4} showCount maxLength={160} />
      </Form.Item>
      
      <Form.Item name="seo_keywords" label={<span className="font-semibold">Từ khóa SEO (Keywords)</span>}>
        <Input size="large" placeholder="việc làm, tuyển dụng, it, marketing..." />
      </Form.Item>

      <Form.Item className="mt-6 mb-0">
        <Button type="primary" htmlType="submit" icon={<SaveOutlined />} size="large">Cập nhật SEO</Button>
      </Form.Item>
    </Form>
  );

  const contactSettings = (
    <Form 
      form={formContact} 
      layout="vertical" 
      onFinish={handleSave}
    >
      <div className="grid grid-cols-2 gap-4">
        <Form.Item name="contact_email" label={<span className="font-semibold">Email hỗ trợ</span>}>
          <Input size="large" />
        </Form.Item>
        <Form.Item name="contact_phone" label={<span className="font-semibold">Hotline</span>}>
          <Input size="large" />
        </Form.Item>
      </div>
      
      <Form.Item name="address" label={<span className="font-semibold">Địa chỉ trụ sở</span>}>
        <Input size="large" />
      </Form.Item>
      
      <div className="grid grid-cols-2 gap-4 mt-4">
        <Form.Item name="facebook_url" label={<span className="font-semibold">Facebook URL</span>}>
          <Input size="large" placeholder="https://facebook.com/..." />
        </Form.Item>
        <Form.Item name="linkedin_url" label={<span className="font-semibold">LinkedIn URL</span>}>
          <Input size="large" placeholder="https://linkedin.com/..." />
        </Form.Item>
      </div>

      <Form.Item className="mt-6 mb-0">
        <Button type="primary" htmlType="submit" icon={<SaveOutlined />} size="large">Lưu Liên hệ & Mạng xã hội</Button>
      </Form.Item>
    </Form>
  );

  const items = [
    {
      key: '1',
      label: <span className="font-semibold px-4">Cơ bản & Thương hiệu</span>,
      children: <div className="max-w-3xl pt-2 pb-6">{generalSettings}</div>,
    },
    {
      key: '2',
      label: <span className="font-semibold px-4">Tối ưu SEO</span>,
      children: <div className="max-w-3xl pt-2 pb-6">{seoSettings}</div>,
    },
    {
      key: '3',
      label: <span className="font-semibold px-4">Liên hệ & Footer</span>,
      children: <div className="max-w-3xl pt-2 pb-6">{contactSettings}</div>,
    },
  ];

  return (
    <AdminLayout>
      <div className="mb-6">
        <Title level={3} style={{ margin: 0 }}>Cài đặt Hệ thống</Title>
        <Text type="secondary">Cấu hình nhận diện thương hiệu, SEO và các thông số hoạt động cốt lõi</Text>
      </div>

      <Card bordered={false} className="shadow-sm" bodyStyle={{ padding: 0 }}>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spin indicator={<LoadingOutlined style={{ fontSize: 32 }} spin />} />
          </div>
        ) : (
          <Tabs 
            tabPosition="left" 
            items={items} 
            style={{ minHeight: 500 }}
            className="admin-settings-tabs"
            destroyInactiveTabPane={true}
          />
        )}
      </Card>
      
      {/* CSS custom for vertical tabs to look cleaner */}
      <style>{`
        .admin-settings-tabs .ant-tabs-nav {
          padding-top: 16px !important;
          background-color: #fafafa;
          border-right: 1px solid #f0f0f0;
          min-width: 220px;
        }
        .admin-settings-tabs .ant-tabs-content-holder {
          padding: 16px 32px;
        }
        .admin-settings-tabs .ant-upload-picture-card-wrapper {
          width: 100%;
        }
        .admin-settings-tabs .ant-upload-list-picture-card-container, 
        .admin-settings-tabs .ant-upload-select-picture-card {
          width: 100% !important;
          height: 120px !important;
        }
      `}</style>
    </AdminLayout>
  );
}

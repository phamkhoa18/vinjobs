import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Form, Input, Button, Upload, Alert, message, Spin, Typography, Row, Col, Image } from 'antd';
import { UploadOutlined, SafetyCertificateOutlined, EyeOutlined, FilePdfOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { companiesApi, uploadApi, getImageUrl } from '../../lib/api';

const { Title, Text } = Typography;

export default function VerificationPage() {
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [company, setCompany] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [previewImage, setPreviewImage] = useState('');
  const [isPdf, setIsPdf] = useState(false);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const res = await companiesApi.mine();
        if (res.status === 'success') {
          setCompany(res.data.company);
          form.setFieldsValue({
            name: res.data.company.name,
            taxCode: res.data.company.taxCode,
          });
          if (res.data.company.business_license) {
            const imgUrl = getImageUrl(res.data.company.business_license);
            const isPdfFile = res.data.company.business_license.toLowerCase().endsWith('.pdf');
            setIsPdf(isPdfFile);
            setFileList([
              {
                uid: '-1',
                name: isPdfFile ? 'business_license.pdf' : 'business_license.jpg',
                status: 'done',
                url: imgUrl,
                response: { url: res.data.company.business_license }
              }
            ]);
            setPreviewImage(imgUrl);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setFetching(false);
      }
    };
    fetchCompany();
  }, [form]);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      
      let business_license = '';
      if (fileList.length > 0) {
        const file = fileList[0];
        const fileToUpload = file.originFileObj || (file instanceof File ? file : null);
        
        if (fileToUpload) {
          const formData = new FormData();
          formData.append('image', fileToUpload);
          const uploadRes = await uploadApi.uploadImage(formData);
          if (uploadRes.status === 'success') {
            business_license = uploadRes.data.url;
          }
        } else if (file.url || file.response?.url) {
          business_license = file.url || file.response?.url;
        }
      }

      if (!business_license) {
        message.error('Vui lòng tải lên Giấy phép kinh doanh!');
        return;
      }

      const res = await companiesApi.verify({
        name: values.name,
        taxCode: values.taxCode,
        business_license
      });

      if (res.status === 'success') {
        message.success('Đã gửi yêu cầu xác minh thành công!');
        window.location.href = '/employer';
      }
    } catch (err) {
      console.error('VERIFY ERROR:', err, err.response?.data);
      message.error(err.response?.data?.message || err.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const uploadProps = {
    onRemove: () => {
      setFileList([]);
      setPreviewImage('');
      setIsPdf(false);
    },
    beforeUpload: (file) => {
      const isPdfFile = file.type === 'application/pdf';
      const isImage = file.type.startsWith('image/');
      
      if (!isImage && !isPdfFile) {
        message.error('Chỉ hỗ trợ tệp hình ảnh (JPG, PNG) hoặc PDF!');
        return Upload.LIST_IGNORE;
      }
      
      setIsPdf(isPdfFile);
      const reader = new FileReader();
      reader.onload = (e) => setPreviewImage(e.target.result);
      reader.readAsDataURL(file);

      setFileList([file]);
      return false; 
    },
    fileList,
    maxCount: 1,
    showUploadList: false, // Ẩn list mặc định để tự custom hiển thị ảnh
  };

  if (fetching) {
    return (
      <DashboardLayout role="employer">
        <div className="flex justify-center items-center h-64"><Spin size="large" /></div>
      </DashboardLayout>
    );
  }

  const isPending = user?.status === 'PENDING';
  const isRejected = user?.status === 'REJECTED';

  return (
    <DashboardLayout role="employer">
      <div className="mb-6">
        <Title level={3} style={{ margin: 0 }}>Xác minh Doanh nghiệp (KYB)</Title>
        <Text type="secondary">Cung cấp hồ sơ pháp lý để bảo vệ quyền lợi và uy tín tuyển dụng</Text>
      </div>

      {isRejected && company?.rejection_reason && (
        <Alert
          message={<span className="font-bold">Hồ sơ bị từ chối</span>}
          description={
            <div>
              <strong>Lý do:</strong> {company.rejection_reason}
              <br />Vui lòng cập nhật lại giấy tờ hợp lệ và gửi lại yêu cầu.
            </div>
          }
          type="error"
          showIcon
          className="mb-6"
        />
      )}

      <div className="bg-white rounded-xl p-6">
        <div className="mb-6">
          <span className="font-semibold text-lg text-[#111827] flex items-center">
            <SafetyCertificateOutlined className="text-blue-600 mr-2" />
            Thông tin pháp lý
          </span>
        </div>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          size="large"
        >
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                name="name"
                label={<span className="font-semibold text-gray-700">Tên công ty (Như trên GPKD)</span>}
                rules={[{ required: true, message: 'Vui lòng nhập tên công ty' }]}
              >
                <Input placeholder="Ví dụ: Công ty Cổ phần VinJobs" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="taxCode"
                label={<span className="font-semibold text-gray-700">Mã số thuế</span>}
                rules={[{ required: true, message: 'Vui lòng nhập mã số thuế' }]}
              >
                <Input placeholder="Nhập mã số thuế" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label={
              <div>
                <span className="font-semibold text-gray-700 block">Tải lên Giấy phép kinh doanh</span>
                <Text type="secondary" className="text-xs">Hỗ trợ JPG, PNG, PDF (Tối đa 5MB).</Text>
              </div>
            }
            required
          >
            {!previewImage ? (
              <Upload.Dragger {...uploadProps} className="bg-gray-50 border-gray-300 hover:border-blue-500 transition-colors">
                <p className="ant-upload-drag-icon">
                  <UploadOutlined className="text-blue-500" />
                </p>
                <p className="ant-upload-text font-semibold">Nhấn hoặc kéo thả tệp vào đây</p>
                <p className="ant-upload-hint text-gray-500">Giấy phép đăng ký kinh doanh hợp lệ (Hỗ trợ Ảnh & PDF)</p>
              </Upload.Dragger>
            ) : (
              <div className="relative rounded-xl border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center p-2 group" style={{ minHeight: 200 }}>
                {isPdf ? (
                  <div className="flex flex-col items-center justify-center py-8 w-full">
                    <FilePdfOutlined className="text-red-500 text-6xl mb-4" />
                    <Text strong>Đã chọn file PDF</Text>
                  </div>
                ) : (
                  <Image
                    src={previewImage}
                    alt="Giấy phép kinh doanh"
                    style={{ maxHeight: 300, objectFit: 'contain' }}
                    className="rounded-lg"
                  />
                )}
                
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  {!isPdf && (
                    <Image.PreviewGroup>
                      <Image
                        src={previewImage}
                        style={{ display: 'none' }}
                        preview={{ visible: false }}
                      />
                    </Image.PreviewGroup>
                  )}
                  <Button type="primary" onClick={() => {
                    if (isPdf) {
                      window.open(previewImage, '_blank');
                    } else {
                      const imgElement = document.querySelector('.ant-image-img');
                      if (imgElement) imgElement.click();
                    }
                  }} icon={<EyeOutlined />}>Xem chi tiết</Button>
                  <Button danger onClick={() => {
                    setFileList([]);
                    setPreviewImage('');
                    setIsPdf(false);
                  }}>Xóa {isPdf ? 'file' : 'ảnh'}</Button>
                </div>
              </div>
            )}
          </Form.Item>

          <Form.Item className="mb-0 mt-6 text-right">
            <Button 
              type="primary" 
              htmlType="submit" 
              size="large" 
              loading={loading}
              className="px-8"
            >
              {isPending ? 'Cập nhật lại hồ sơ' : 'Gửi yêu cầu xác minh'}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </DashboardLayout>
  );
}

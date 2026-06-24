import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api, { cvApi, getImageUrl } from '../../lib/api';
import { toast } from 'react-hot-toast';
import { Card, Typography, Upload, List, Button, Tag, Space, Alert, Popconfirm, Spin, Row, Col } from 'antd';
import { 
  InboxOutlined, 
  FilePdfOutlined, 
  DeleteOutlined, 
  DownloadOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Dragger } = Upload;

export default function CVManagementPage() {
  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchCVs();
  }, []);

  const fetchCVs = async () => {
    try {
      setLoading(true);
      const res = await cvApi.getMyCVs();
      if (res.status === 'success') {
        setCvs(res.data.cvs);
      }
    } catch (error) {
      toast.error('Lỗi khi tải danh sách CV');
    } finally {
      setLoading(false);
    }
  };

  const setDefault = async (id) => {
    try {
      const res = await cvApi.setDefault(id);
      if (res.status === 'success') {
        toast.success('Đã đặt CV mặc định');
        fetchCVs();
      }
    } catch (error) {
      toast.error('Không thể đặt mặc định');
    }
  };

  const deleteCV = async (id) => {
    try {
      await cvApi.deleteCV(id);
      toast.success('Xóa CV thành công');
      fetchCVs();
    } catch (error) {
      toast.error('Không thể xóa CV');
    }
  };

  const uploadProps = {
    name: 'document',
    multiple: false,
    showUploadList: false,
    customRequest: async (options) => {
      const { file, onSuccess, onError } = options;
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File không được vượt quá 5MB');
        onError(new Error('File quá lớn'));
        return;
      }
      
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append('document', file);
        
        const uploadRes = await api.post('/upload/document', formData);
        
        if (uploadRes.status === 'success') {
          const filePath = uploadRes.data.url;
          
          const saveRes = await cvApi.uploadCV({
            title: file.name,
            file_path: filePath,
            file_type: file.name.split('.').pop().toUpperCase()
          });
          
          if (saveRes.status === 'success') {
            toast.success('Upload CV thành công');
            fetchCVs();
            onSuccess(saveRes.data, file);
          }
        }
      } catch (error) {
        toast.error('Lỗi khi upload CV');
        onError(error);
      } finally {
        setUploading(false);
      }
    },
    beforeUpload: (file) => {
      const isPdfOrWord = file.type === 'application/pdf' || file.type === 'application/msword' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      if (!isPdfOrWord) {
        toast.error('Chỉ hỗ trợ file PDF, DOC, DOCX');
      }
      return isPdfOrWord || Upload.LIST_IGNORE;
    }
  };

  return (
    <DashboardLayout role="candidate">
      <div style={{ marginBottom: '24px' }}>
        <Title level={4} style={{ margin: 0 }}>Quản lý CV</Title>
        <Text type="secondary">Upload và quản lý các phiên bản CV của bạn</Text>
      </div>

      <Alert
        message="Mẹo tạo CV ấn tượng"
        description="CV PDF chuyên nghiệp, tối đa 2 trang, thể hiện thành tích cụ thể với số liệu rõ ràng. Tùy chỉnh CV cho từng vị trí ứng tuyển sẽ tăng 40% cơ hội được chọn."
        type="info"
        showIcon
        className="shadow-sm border-0"
        style={{ marginBottom: '24px' }}
      />

      <Card bordered={false} className="shadow-sm" style={{ marginBottom: '24px' }}>
        <Spin spinning={uploading} tip="Đang tải lên...">
          <Dragger {...uploadProps}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined style={{ color: '#1677ff' }} />
            </p>
            <p className="ant-upload-text">Nhấp hoặc kéo thả file vào khu vực này để upload</p>
            <p className="ant-upload-hint">
              Hỗ trợ tải lên file PDF, DOC, DOCX. Dung lượng tối đa 5MB.
            </p>
          </Dragger>
        </Spin>
      </Card>

      <Card 
        title={`CV đã tải lên (${cvs.length}/5)`} 
        bordered={false} 
        className="shadow-sm"
        style={{ marginBottom: '24px' }}
      >
        <Spin spinning={loading}>
          <List
            itemLayout="horizontal"
            dataSource={cvs}
            locale={{ emptyText: 'Chưa có CV nào được tải lên.' }}
            renderItem={(cv) => (
              <List.Item
                className="hover:bg-gray-50 px-4 transition-colors"
                actions={[
                  !cv.is_primary && (
                    <Button type="default" size="small" onClick={() => setDefault(cv._id)}>
                      Đặt mặc định
                    </Button>
                  ),
                  <Button 
                    type="primary" 
                    ghost 
                    size="small" 
                    icon={<DownloadOutlined />} 
                    href={getImageUrl(cv.file_path)} 
                    target="_blank"
                  >
                    Tải xuống
                  </Button>,
                  <Popconfirm title="Bạn có chắc muốn xóa CV này?" onConfirm={() => deleteCV(cv._id)}>
                    <Button danger size="small" icon={<DeleteOutlined />} />
                  </Popconfirm>
                ]}
              >
                <List.Item.Meta
                  avatar={<FilePdfOutlined style={{ fontSize: '32px', color: '#ff4d4f' }} />}
                  title={
                    <Space>
                      <Text strong>{cv.title}</Text>
                      {cv.is_primary && <Tag color="green" icon={<CheckCircleOutlined />}>MẶC ĐỊNH</Tag>}
                    </Space>
                  }
                  description={
                    <Space split={<Text type="secondary">•</Text>}>
                      <Text type="secondary">{cv.file_type}</Text>
                      <Text type="secondary">Upload {dayjs(cv.uploaded_at).format('DD/MM/YYYY')}</Text>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        </Spin>
      </Card>

      <Card title="Tạo CV online miễn phí" bordered={false} className="shadow-sm">
        <Row gutter={[16, 16]}>
          {[
            { name: 'Canva', desc: 'Template đẹp, dễ dùng', url: 'https://canva.com', color: '#7c3aed' },
            { name: 'Resume.io', desc: 'CV chuyên nghiệp chuẩn ATS', url: 'https://resume.io', color: '#3674c5' },
            { name: 'Zety', desc: 'AI gợi ý nội dung', url: 'https://zety.com', color: '#059669' },
          ].map((tool, i) => (
            <Col xs={24} sm={8} key={i}>
              <Card 
                type="inner" 
                hoverable 
                onClick={() => window.open(tool.url, '_blank')}
              >
                <Title level={5} style={{ color: tool.color, margin: 0 }}>{tool.name}</Title>
                <Text type="secondary" className="text-xs">{tool.desc}</Text>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>
    </DashboardLayout>
  );
}

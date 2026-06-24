import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import { Card, Form, Input, Button, Switch, Select, Upload, message, Typography, Spin } from 'antd';
import ImgCrop from 'antd-img-crop';
import { ArrowLeftOutlined, UploadOutlined } from '@ant-design/icons';
import api, { getImageUrl } from '../../lib/api';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const { Title } = Typography;

export default function BlogFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const quillRef = useRef(null);
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState('');
  const [existingThumbnail, setExistingThumbnail] = useState('');

  const isEditMode = !!id;

  // Xử lý Custom Image Upload cho ReactQuill
  const imageHandler = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('image', file);

      try {
        const data = await api.post('/upload/image', formData);
        
        if (data.status === 'success') {
          const quill = quillRef.current.getEditor();
          const range = quill.getSelection();
          quill.insertEmbed(range.index, 'image', getImageUrl(data.data.url));
        } else {
          message.error(data.message || 'Lỗi khi upload ảnh');
        }
      } catch (err) {
        message.error('Không thể upload ảnh, vui lòng thử lại');
      }
    };
  };

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'color': [] }, { 'background': [] }],
        ['link', 'image', 'video'],
        ['clean']
      ],
      handlers: {
        image: imageHandler
      }
    }
  }), []);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        // Fetch categories
        const catData = await api.get('/blog/categories');
        setCategories(catData.data?.categories || []);

        // Fetch post if edit mode
        if (isEditMode) {
          const postData = await api.get('/blog/admin/posts?limit=1000');
          const post = postData.data?.posts?.find(p => p._id === id);
          
          if (post) {
            form.setFieldsValue({
              title: post.title,
              content: post.content,
              category_id: post.category_id?._id,
              status: post.status,
              excerpt: post.excerpt,
              tags: post.tags,
              is_featured: post.is_featured,
              meta_title: post.seo?.meta_title,
              meta_description: post.seo?.meta_description,
            });
            setExistingThumbnail(post.thumbnail);
          } else {
            message.error('Không tìm thấy bài viết!');
            navigate('/admin/blogs');
          }
        } else {
          form.setFieldsValue({ status: 'PUBLISHED', is_featured: false });
        }
      } catch (err) {
        message.error('Lỗi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [id, form, navigate]);

  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('content', values.content);
      if (values.category_id) formData.append('category_id', values.category_id);
      formData.append('status', values.status);
      if (values.excerpt) formData.append('excerpt', values.excerpt);
      if (values.tags) formData.append('tags', JSON.stringify(values.tags));
      if (values.is_featured !== undefined) formData.append('is_featured', values.is_featured);
      if (values.meta_title) formData.append('seo[meta_title]', values.meta_title);
      if (values.meta_description) formData.append('seo[meta_description]', values.meta_description);

      if (selectedImage) {
        formData.append('thumbnail', selectedImage);
      }

      let data;
      if (isEditMode) {
        data = await api.put(`/blog/posts/${id}`, formData);
      } else {
        data = await api.post('/blog/posts', formData);
      }

      message.success(isEditMode ? 'Cập nhật thành công!' : 'Tạo bài viết thành công!');
      navigate('/admin/blogs');
    } catch (err) {
      message.error(err.message || 'Có lỗi xảy ra khi lưu bài viết');
    } finally {
      setSubmitting(false);
    }
  };

  const categoryOptions = categories.map(c => ({ value: c._id, label: c.name }));

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64"><Spin size="large" /></div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center gap-4">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/blogs')} />
        <div>
          <Title level={3} style={{ margin: 0 }}>{isEditMode ? 'Chỉnh sửa Bài viết' : 'Thêm Bài viết mới'}</Title>
        </div>
      </div>

      <Form layout="vertical" form={form} onFinish={onFinish}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="shadow-sm rounded-xl mb-6" bordered={false}>
              <Form.Item name="title" label={<span className="font-semibold">Tiêu đề bài viết</span>} rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}>
                <Input placeholder="Nhập tiêu đề..." size="large" />
              </Form.Item>
              
              <Form.Item name="excerpt" label={<span className="font-semibold">Tóm tắt (Excerpt)</span>}>
                <Input.TextArea placeholder="Nhập mô tả ngắn gọn về bài viết..." rows={3} />
              </Form.Item>
              
              <Form.Item name="content" label={<span className="font-semibold">Nội dung bài viết</span>} rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}>
                <ReactQuill 
                  ref={quillRef}
                  theme="snow" 
                  modules={modules}
                  className="bg-white"
                  style={{ height: '500px', marginBottom: '50px' }} 
                />
              </Form.Item>
            </Card>

            <Card title={<span className="font-semibold text-lg">Cấu hình SEO</span>} className="shadow-sm rounded-xl" bordered={false}>
              <Form.Item name="meta_title" label="SEO Title (Tiêu đề trên thẻ tab)">
                <Input placeholder="Nhập SEO Meta Title..." size="large" />
              </Form.Item>
              <Form.Item name="meta_description" label="SEO Description (Mô tả tìm kiếm Google)">
                <Input.TextArea placeholder="Nhập SEO Meta Description..." rows={3} />
              </Form.Item>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="shadow-sm rounded-xl mb-6" bordered={false}>
              <div className="mb-6 pb-6 border-b border-gray-100 flex justify-between items-center">
                <span className="font-semibold text-lg">Xuất bản</span>
                <Button type="primary" htmlType="submit" size="large" loading={submitting} className="font-medium shadow-md">
                  {isEditMode ? 'Lưu thay đổi' : 'Đăng bài viết'}
                </Button>
              </div>

              <Form.Item name="status" label={<span className="font-semibold">Trạng thái</span>}>
                <Select size="large" options={[
                  { value: 'PUBLISHED', label: 'Xuất bản (Hiển thị)' },
                  { value: 'DRAFT', label: 'Bản nháp (Ẩn)' },
                ]} />
              </Form.Item>

              <Form.Item name="is_featured" valuePropName="checked">
                <Switch checkedChildren="Nổi bật" unCheckedChildren="Bình thường" />
              </Form.Item>
            </Card>

            <Card className="shadow-sm rounded-xl mb-6" title={<span className="font-semibold text-lg">Chuyên mục & Thẻ</span>} bordered={false}>
              <Form.Item name="category_id" label={<span className="font-semibold">Chuyên mục chính</span>}>
                <Select size="large" options={categoryOptions} placeholder="Chọn chuyên mục" allowClear />
              </Form.Item>

              <Form.Item name="tags" label={<span className="font-semibold">Thẻ (Tags)</span>} help="Nhập từ khóa và gõ Enter để tạo thẻ mới">
                <Select mode="tags" size="large" placeholder="Ví dụ: Lập trình viên, UI/UX..." />
              </Form.Item>
            </Card>

            <Card className="shadow-sm rounded-xl" title={<span className="font-semibold text-lg">Ảnh đại diện (Thumbnail)</span>} bordered={false}>
              <Form.Item>
                <ImgCrop rotationSlider aspect={16/9}>
                  <Upload
                    listType="picture-card"
                    showUploadList={false}
                    beforeUpload={(file) => {
                      setSelectedImage(file);
                      setPreviewImage(URL.createObjectURL(file));
                      return false;
                    }}
                    className="w-full"
                  >
                    {previewImage || existingThumbnail ? (
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden group">
                        <img 
                          src={previewImage || getImageUrl(existingThumbnail)} 
                          alt="thumb" 
                          className="w-full h-full object-cover" 
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-white font-medium"><UploadOutlined /> Thay đổi ảnh</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-6">
                        <UploadOutlined className="text-3xl text-gray-400 mb-3" />
                        <div className="text-sm font-medium text-gray-600">Tải ảnh bìa lên</div>
                        <div className="text-xs text-gray-400 mt-1">Hỗ trợ JPG, PNG, WEBP</div>
                      </div>
                    )}
                  </Upload>
                </ImgCrop>
              </Form.Item>
            </Card>
          </div>
        </div>
      </Form>
    </AdminLayout>
  );
}

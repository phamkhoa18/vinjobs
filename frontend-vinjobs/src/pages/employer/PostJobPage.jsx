import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EmployerLayout from '../../components/layout/EmployerLayout';
import { jobsApi, blogApi } from '../../lib/api';
import LocationService from '../../services/LocationService';
import { Form, Input, Select, Button, Steps, Row, Col, Checkbox, InputNumber, DatePicker, TimePicker, message, Typography, Space, Divider, Tag, Upload } from 'antd';
import { CheckCircleOutlined, PlusOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { DefaultEditor } from 'react-simple-wysiwyg';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const STEPS = [
  { title: 'Thông tin cơ bản' },
  { title: 'Mô tả & Yêu cầu' },
  { title: 'Phúc lợi & Chế độ' },
  { title: 'Xem trước & Đăng' }
];

const BENEFITS_LIST = [
  { id: 'insurance', label: 'Bảo hiểm đầy đủ', icon: '🏥' },
  { id: 'bonus', label: 'Thưởng hiệu suất', icon: '💰' },
  { id: 'training', label: 'Đào tạo & phát triển', icon: '🎓' },
  { id: 'flexible', label: 'Giờ làm linh hoạt', icon: '⏰' },
  { id: 'remote', label: 'Làm việc từ xa', icon: '💻' },
  { id: 'lunch', label: 'Phụ cấp ăn trưa', icon: '🍱' },
  { id: 'travel', label: 'Phụ cấp đi lại', icon: '🚗' },
  { id: 'extra_leave', label: 'Nghỉ phép thêm', icon: '🏖️' },
  { id: 'team_building', label: 'Team building', icon: '🤝' },
  { id: 'gym', label: 'Gym / Sức khỏe', icon: '🏋️' },
];

export default function PostJobPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [provinces, setProvinces] = useState([]);
  const [saving, setSaving] = useState(false);

  const [categories, setCategories] = useState([]);
  const [parentCategoryId, setParentCategoryId] = useState('');
  const [showCustomIndustry, setShowCustomIndustry] = useState(false);

  // Dữ liệu Hành chính
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const negotiable = Form.useWatch('negotiable', form);
  const formValues = Form.useWatch([], form);
  const selectedProvinceCode = Form.useWatch('province_code', form);
  const selectedDistrictCode = Form.useWatch('district_code', form);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [provs, catsRes] = await Promise.all([
          LocationService.getProvinces(),
          blogApi.getCategories().catch(() => ({ categories: [] }))
        ]);
        setProvinces(provs);
        if (catsRes && catsRes.categories) {
          setCategories(catsRes.categories);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();

    form.setFieldsValue({
      type: 'FULL_TIME',
      level: ['Nhân viên'],
      slots: 1,
      negotiable: false,
      benefits: ['insurance', 'bonus', 'training'],
      working_days: ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6'],
      working_hours: [dayjs().hour(8).minute(0).second(0), dayjs().hour(17).minute(0).second(0)],
      probation: '2 tháng'
    });
  }, [form]);

  // Handle Location Cascade
  useEffect(() => {
    if (!selectedProvinceCode) {
      setDistricts([]);
      setWards([]);
      return;
    }
    LocationService.getDistricts(selectedProvinceCode).then(setDistricts);
  }, [selectedProvinceCode]);

  useEffect(() => {
    if (!selectedDistrictCode) {
      setWards([]);
      return;
    }
    LocationService.getWards(selectedDistrictCode).then(setWards);
  }, [selectedDistrictCode]);

  const handleProvinceChange = () => {
    form.setFieldsValue({ district_code: undefined, ward_code: undefined });
  };

  const handleDistrictChange = () => {
    form.setFieldsValue({ ward_code: undefined });
  };

  const handleParentIndustryChange = (val) => {
    setParentCategoryId(val);
    form.setFieldsValue({ industry_child: undefined, custom_industry: '' });
    setShowCustomIndustry(val === 'OTHER');
  };

  const handleNext = async () => {
    try {
      if (currentStep === 0) {
        await form.validateFields(['title', 'industry_parent', 'type', 'level', 'province_code', 'district_code', 'ward_code', 'exact_address', 'deadline', 'slots']);
        if (!negotiable) await form.validateFields(['salaryMin', 'salaryMax']);
      } else if (currentStep === 1) {
        await form.validateFields(['description', 'requirements']);
      }
      setCurrentStep(prev => prev + 1);
    } catch (err) { }
  };

  const handlePrev = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleFinish = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      let finalIndustry = '';
      if (values.industry_parent === 'OTHER') {
        finalIndustry = values.custom_industry;
      } else {
        const childCat = categories.find(c => c._id === values.industry_child);
        const parentCat = categories.find(c => c._id === values.industry_parent);
        finalIndustry = childCat ? childCat.name : (parentCat ? parentCat.name : '');
      }

      // Build Location string
      const provinceName = provinces.find(p => p.code === values.province_code)?.name || '';
      const districtName = districts.find(d => d.code === values.district_code)?.name || '';
      const wardName = wards.find(w => w.code === values.ward_code)?.name || '';
      const fullLocation = [values.exact_address, wardName, districtName, provinceName].filter(Boolean).join(', ');

      const payload = {
        title: values.title,
        industry: finalIndustry,
        type: values.type,
        level: Array.isArray(values.level) ? values.level[0] : values.level,
        location: fullLocation,
        deadline: values.deadline.format('YYYY-MM-DD'),
        slots: values.slots,
        salary: {
          min: values.negotiable ? null : values.salaryMin,
          max: values.negotiable ? null : values.salaryMax,
          negotiable: values.negotiable,
        },
        description: values.description,
        requirements: values.requirements,
        nice_to_have: values.nice_to_have || '',
        benefits: values.benefits || [],
        working_days: values.working_days || [],
        working_hours: values.working_hours ? values.working_hours.map(t => t.format('HH:mm')) : [],
        probation: values.probation,
        images: values.images?.map(file => file.response?.data?.url || file.url).filter(Boolean) || [],
        video_url: values.video_url || '',
      };

      const res = await jobsApi.create(payload);
      if (res.status === 'success') {
        message.success('Đăng tin thành công!');
        navigate('/employer/jobs');
      }
    } catch (err) {
      message.error(err.message || 'Lỗi khi đăng tin');
    } finally {
      setSaving(false);
    }
  };

  return (
    <EmployerLayout>
      <div className="mb-6">
        <Title level={3} style={{ margin: 0 }}>Đăng tin tuyển dụng</Title>
        <Text type="secondary">Tạo tin đăng chuyên nghiệp, tiếp cận hàng ngàn ứng viên tiềm năng</Text>
      </div>

      <div className="bg-white rounded-xl p-6 !mb-6">
        <Steps current={currentStep} items={STEPS} size="small" />
      </div>

      <Form
        form={form}
        layout="vertical"
        requiredMark="optional"
        className="post-job-form"
      >
        <div className="bg-white rounded-xl p-6 !mb-6">
          <div style={{ display: currentStep === 0 ? 'block' : 'none' }}>
            <Row gutter={[24, 16]}>
              <Col xs={24}>
                <Form.Item name="title" label={<span className="font-medium text-[#111827]">Tên vị trí tuyển dụng</span>} rules={[{ required: true, message: 'Vui lòng nhập tên vị trí' }]}>
                  <Input placeholder="VD: Senior Frontend Developer" />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item name="industry_parent" label={<span className="font-medium text-[#111827]">Ngành nghề chính</span>} rules={[{ required: true, message: 'Chọn ngành nghề' }]}>
                  <Select onChange={handleParentIndustryChange} placeholder="Chọn ngành">
                    {categories.filter(c => !c.parent_id).map(c => <Option key={c._id} value={c._id}>{c.name}</Option>)}
                    <Option value="OTHER">Khác</Option>
                  </Select>
                </Form.Item>
              </Col>

              {parentCategoryId && parentCategoryId !== 'OTHER' && categories.some(c => c.parent_id && (c.parent_id._id === parentCategoryId || c.parent_id === parentCategoryId)) && (
                <Col xs={24} md={8}>
                  <Form.Item name="industry_child" label={<span className="font-medium text-[#111827]">Ngành con</span>}>
                    <Select placeholder="Chọn ngành con">
                      {categories.filter(c => c.parent_id && (c.parent_id._id === parentCategoryId || c.parent_id === parentCategoryId)).map(c => <Option key={c._id} value={c._id}>{c.name}</Option>)}
                    </Select>
                  </Form.Item>
                </Col>
              )}

              {showCustomIndustry && (
                <Col xs={24} md={8}>
                  <Form.Item name="custom_industry" label={<span className="font-medium text-[#111827]">Nhập ngành nghề khác</span>} rules={[{ required: true }]}>
                    <Input placeholder="Ví dụ: Công nghệ sinh học" />
                  </Form.Item>
                </Col>
              )}

              <Col xs={24} md={8}>
                <Form.Item name="type" label={<span className="font-medium text-[#111827]">Hình thức làm việc</span>}>
                  <Select>
                    <Option value="FULL_TIME">Toàn thời gian</Option>
                    <Option value="PART_TIME">Bán thời gian</Option>
                    <Option value="CONTRACT">Hợp đồng</Option>
                    <Option value="INTERNSHIP">Thực tập</Option>
                    <Option value="REMOTE">Remote</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="level" label={<span className="font-medium text-[#111827]">Cấp bậc</span>} rules={[{ required: true, message: 'Nhập cấp bậc' }]}>
                  <Select 
                    mode="tags" 
                    maxCount={1} 
                    showSearch 
                    placeholder="Chọn hoặc nhập cấp bậc"
                    filterOption={(input, option) => (option?.value ?? '').toLowerCase().includes(input.toLowerCase())}
                  >
                    {['Thực tập sinh', 'Nhân viên mới ra trường', 'Nhân viên', 'Chuyên viên', 'Trưởng nhóm', 'Trưởng phòng', 'Giám đốc'].map(l => <Option key={l} value={l}>{l}</Option>)}
                  </Select>
                </Form.Item>
              </Col>
              
              <Col xs={24} md={8}>
                <Form.Item name="deadline" label={<span className="font-medium text-[#111827]">Hạn nộp hồ sơ</span>} rules={[{ required: true, message: 'Vui lòng chọn hạn nộp' }]}>
                  <DatePicker className="w-full" format="DD/MM/YYYY" disabledDate={d => !d || d.isBefore(dayjs().startOf('day'))} />
                </Form.Item>
              </Col>
              <Col xs={24} md={4}>
                <Form.Item name="slots" label={<span className="font-medium text-[#111827]">Số lượng</span>} rules={[{ required: true, message: 'Nhập SL' }]}>
                  <InputNumber min={1} max={999} className="w-full" />
                </Form.Item>
              </Col>

              <Col xs={24}>
                <Divider className="my-2 border-gray-100" />
                <Title level={5} className="mt-2 mb-4 text-[#111827]">Chi tiết địa điểm làm việc</Title>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item name="province_code" label={<span className="font-medium text-[#111827]">Tỉnh/Thành phố</span>} rules={[{ required: true, message: 'Chọn Tỉnh/Thành' }]}>
                  <Select 
                    showSearch 
                    placeholder="Chọn Tỉnh/Thành" 
                    onChange={handleProvinceChange}
                    filterOption={(input, option) => (option?.children ?? '').toLowerCase().includes(input.toLowerCase())}
                  >
                    {provinces.map(p => <Option key={p.code} value={p.code}>{p.name}</Option>)}
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item name="district_code" label={<span className="font-medium text-[#111827]">Quận/Huyện</span>} rules={[{ required: true, message: 'Chọn Quận/Huyện' }]}>
                  <Select 
                    showSearch 
                    placeholder="Chọn Quận/Huyện" 
                    onChange={handleDistrictChange}
                    disabled={!selectedProvinceCode}
                    filterOption={(input, option) => (option?.children ?? '').toLowerCase().includes(input.toLowerCase())}
                  >
                    {districts.map(d => <Option key={d.code} value={d.code}>{d.name}</Option>)}
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item name="ward_code" label={<span className="font-medium text-[#111827]">Phường/Xã</span>} rules={[{ required: true, message: 'Chọn Phường/Xã' }]}>
                  <Select 
                    showSearch 
                    placeholder="Chọn Phường/Xã" 
                    disabled={!selectedDistrictCode}
                    filterOption={(input, option) => (option?.children ?? '').toLowerCase().includes(input.toLowerCase())}
                  >
                    {wards.map(w => <Option key={w.code} value={w.code}>{w.name}</Option>)}
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24}>
                <Form.Item name="exact_address" label={<span className="font-medium text-[#111827]">Số nhà, tên đường</span>} rules={[{ required: true, message: 'Vui lòng nhập số nhà, tên đường' }]}>
                  <Input placeholder="Ví dụ: Tòa nhà Vincom, 72 Lê Thánh Tôn..." />
                </Form.Item>
              </Col>
            </Row>

            <Divider className="my-6 border-gray-100" />

            <div className="mb-2 mt-4 flex flex-col">
              <Title level={5} style={{ margin: 0, color: '#111827' }}>Mức lương dự kiến</Title>
              <Text type="secondary" className="text-sm">Đơn vị: Triệu VNĐ. Chọn "Thỏa thuận" nếu muốn bảo mật mức lương.</Text>
            </div>

            <div className="bg-gray-50/80 p-4 rounded-xl">
              <Row gutter={[16, 16]} align="middle">
                <Col xs={12} sm={8}>
                  <Form.Item name="salaryMin" rules={[{ required: !negotiable, message: 'Nhập tối thiểu' }]} style={{ marginBottom: 0 }}>
                    <InputNumber
                      placeholder="Tối thiểu"
                      min={1}
                      disabled={negotiable}
                      className="w-full"
                      addonAfter={<span className="text-gray-500 font-medium">Triệu</span>}
                    />
                  </Form.Item>
                </Col>

                <Col xs={12} sm={8}>
                  <Form.Item name="salaryMax" rules={[{ required: !negotiable, message: 'Nhập tối đa' }]} style={{ marginBottom: 0 }}>
                    <InputNumber
                      placeholder="Tối đa"
                      min={1}
                      disabled={negotiable}
                      className="w-full"
                      addonAfter={<span className="text-gray-500 font-medium">Triệu</span>}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={8}>
                  <Form.Item name="negotiable" valuePropName="checked" style={{ marginBottom: 0 }}>
                    <div className="flex items-center sm:justify-end">
                      <Checkbox className="text-[#111827] font-medium">Thỏa thuận</Checkbox>
                    </div>
                  </Form.Item>
                </Col>
              </Row>
            </div>
          </div>

          <div style={{ display: currentStep === 1 ? 'block' : 'none' }}>
            <Row gutter={[24, 16]}>
              <Col xs={24}>
                <Form.Item name="description" label={<span className="font-medium text-[#111827]">Mô tả công việc</span>} rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}>
                  <DefaultEditor placeholder="Ứng viên sẽ làm những công việc gì..." />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item name="requirements" label={<span className="font-medium text-[#111827]">Yêu cầu ứng viên</span>} rules={[{ required: true, message: 'Vui lòng nhập yêu cầu' }]}>
                  <DefaultEditor placeholder="Kinh nghiệm, kỹ năng bắt buộc..." />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item name="nice_to_have" label={<span className="font-medium text-[#111827]">Điểm cộng (Nice to have)</span>}>
                  <DefaultEditor placeholder="Kỹ năng ưu tiên, ngoại ngữ..." />
                </Form.Item>
              </Col>
            </Row>

            <Divider className="my-6 border-gray-100" />
            
            <div className="mb-2 mt-4 flex flex-col">
              <Title level={5} style={{ margin: 0, color: '#111827' }}>Hình ảnh & Video giới thiệu (Tùy chọn)</Title>
              <Text type="secondary" className="text-sm">Giúp ứng viên hình dung rõ hơn về môi trường làm việc</Text>
            </div>

            <Row gutter={[24, 16]} className="bg-gray-50/80 p-4 rounded-xl mt-2">
              <Col xs={24}>
                <Form.Item 
                  name="images" 
                  label={<span className="font-medium text-[#111827]">Thư viện ảnh (Văn phòng, Hoạt động...)</span>}
                  valuePropName="fileList"
                  getValueFromEvent={(e) => Array.isArray(e) ? e : e?.fileList}
                >
                  <Upload
                    name="image"
                    listType="picture-card"
                    action="http://localhost:5000/api/upload/image"
                    headers={{ Authorization: `Bearer ${localStorage.getItem('token')}` }}
                    multiple
                  >
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
                    </div>
                  </Upload>
                </Form.Item>
              </Col>
              
              <Col xs={24}>
                <Form.Item name="video_url" label={<span className="font-medium text-[#111827]">Video giới thiệu (YouTube URL)</span>}>
                  <Input prefix={<VideoCameraOutlined className="text-gray-400" />} placeholder="VD: https://www.youtube.com/watch?v=..." />
                </Form.Item>
                {formValues?.video_url && formValues.video_url.includes('youtube.com') && (
                  <div className="mt-3 aspect-video rounded-lg overflow-hidden border border-gray-200 shadow-sm max-w-lg">
                    <iframe 
                      width="100%" 
                      height="100%" 
                      src={`https://www.youtube.com/embed/${formValues.video_url.match(/(?:v=|youtu\.be\/)([\w-]+)/)?.[1] || ''}`} 
                      title="YouTube video player" 
                      frameBorder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                    ></iframe>
                  </div>
                )}
              </Col>
            </Row>
          </div>

          <div style={{ display: currentStep === 2 ? 'block' : 'none' }}>
            <Row gutter={[24, 16]}>
              <Col xs={24} md={8}>
                <Form.Item name="working_days" label="Ngày làm việc">
                  <Select mode="multiple" placeholder="Chọn ngày">
                    {['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'].map(d => <Option key={d} value={d}>{d}</Option>)}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="working_hours" label="Giờ làm việc">
                  <TimePicker.RangePicker format="HH:mm" placeholder={['Bắt đầu', 'Kết thúc']} className="w-full" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="probation" label="Thời gian thử việc"><Input placeholder="2 tháng" /></Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item name="benefits" label={<span className="font-medium text-[#111827]">Phúc lợi nổi bật</span>}>
                  <Checkbox.Group className="w-full">
                    <Row gutter={[16, 16]}>
                      {BENEFITS_LIST.map(b => (
                        <Col xs={12} sm={8} md={6} key={b.id}><Checkbox value={b.id}><span className="mr-1">{b.icon}</span> {b.label}</Checkbox></Col>
                      ))}
                    </Row>
                  </Checkbox.Group>
                </Form.Item>
              </Col>
            </Row>
          </div>

          {currentStep === 3 && formValues && (
            <div>
              <div className="bg-gray-50 rounded-xl p-6 !mb-6">
                <Title level={4} style={{ margin: 0, marginBottom: 8 }}>{formValues.title || 'Tên vị trí'}</Title>
                <Row gutter={[16, 16]} className="mb-4">
                  <Col xs={12} md={6}>
                    <Text type="secondary" className="block text-xs uppercase mb-1">Cấp bậc</Text>
                    <Text strong>{Array.isArray(formValues.level) ? formValues.level[0] : formValues.level}</Text>
                  </Col>
                  <Col xs={12} md={6}>
                    <Text type="secondary" className="block text-xs uppercase mb-1">Mức lương</Text>
                    <Text strong>{formValues.negotiable ? 'Thỏa thuận' : `${formValues.salaryMin || 0} - ${formValues.salaryMax || 0} triệu`}</Text>
                  </Col>
                  <Col xs={12} md={6}>
                    <Text type="secondary" className="block text-xs uppercase mb-1">Ngành nghề</Text>
                    <Text strong>
                      {formValues?.industry_parent === 'OTHER'
                        ? formValues?.custom_industry
                        : (formValues?.industry_child
                          ? categories.find(c => c._id === formValues.industry_child)?.name
                          : categories.find(c => c._id === formValues.industry_parent)?.name)}
                    </Text>
                  </Col>
                  <Col xs={12} md={6}>
                    <Text type="secondary" className="block text-xs uppercase mb-1">Hạn nộp</Text>
                    <Text strong>{formValues.deadline?.format('DD/MM/YYYY')}</Text>
                  </Col>
                  <Col xs={24}>
                    <Text type="secondary" className="block text-xs uppercase mb-1">Địa điểm làm việc chi tiết</Text>
                    <Tag color="blue" className="text-sm py-1">
                      {[
                        formValues.exact_address, 
                        wards.find(w => w.code === formValues.ward_code)?.name, 
                        districts.find(d => d.code === formValues.district_code)?.name, 
                        provinces.find(p => p.code === formValues.province_code)?.name
                      ].filter(Boolean).join(', ')}
                    </Tag>
                  </Col>
                </Row>
                <Divider style={{ margin: '12px 0' }} />
                <Title level={5} className="mt-4">Mô tả công việc</Title>
                <div className="text-gray-700 quill-content" dangerouslySetInnerHTML={{ __html: formValues.description }} />
                <Title level={5} className="mt-4">Yêu cầu ứng viên</Title>
                <div className="text-gray-700 quill-content" dangerouslySetInnerHTML={{ __html: formValues.requirements }} />
                {formValues.nice_to_have && formValues.nice_to_have !== '<p><br></p>' && (
                  <>
                    <Title level={5} className="mt-4">Điểm cộng</Title>
                    <div className="text-gray-700 quill-content" dangerouslySetInnerHTML={{ __html: formValues.nice_to_have }} />
                  </>
                )}

                {formValues.images?.length > 0 && (
                  <>
                    <Title level={5} className="mt-4">Hình ảnh văn phòng</Title>
                    <div className="flex flex-wrap gap-4 mt-2">
                      {formValues.images.map((file, idx) => {
                        const url = file.response?.data?.url || file.url || (file.originFileObj ? URL.createObjectURL(file.originFileObj) : '');
                        if (!url) return null;
                        return (
                          <div key={idx} className="w-32 h-32 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                            <img src={url} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {formValues?.video_url && formValues.video_url.includes('youtube.com') && (
                  <>
                    <Title level={5} className="mt-4">Video giới thiệu</Title>
                    <div className="mt-2 aspect-video rounded-lg overflow-hidden border border-gray-200 shadow-sm max-w-lg">
                      <iframe 
                        width="100%" 
                        height="100%" 
                        src={`https://www.youtube.com/embed/${formValues.video_url.match(/(?:v=|youtu\.be\/)([\w-]+)/)?.[1] || ''}`} 
                        title="YouTube video player" 
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                      ></iframe>
                    </div>
                  </>
                )}

                {formValues.benefits?.length > 0 && (
                  <>
                    <Title level={5} className="mt-4">Phúc lợi</Title>
                    <Space wrap>
                      {formValues.benefits.map(id => {
                        const b = BENEFITS_LIST.find(x => x.id === id);
                        return b ? <Tag key={id} icon={<span className="mr-1">{b.icon}</span>}>{b.label}</Tag> : null;
                      })}
                    </Space>
                  </>
                )}
              </div>
              <div className="flex items-center gap-3 bg-green-50 rounded-xl p-4">
                <CheckCircleOutlined className="text-2xl text-green-500" />
                <div>
                  <Text strong className="text-green-800 block">Sẵn sàng đăng tin!</Text>
                  <Text className="text-green-700 text-sm">Tin sẽ được duyệt trong thời gian ngắn và xuất hiện trên hệ thống.</Text>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center bg-white p-4 rounded-xl">
          <Button onClick={handlePrev} disabled={currentStep === 0} className="w-32">Quay lại</Button>
          {currentStep < STEPS.length - 1 ? (
            <Button type="primary" onClick={handleNext} className="w-32 bg-[#111827] hover:bg-black">Tiếp tục</Button>
          ) : (
            <Button type="primary" loading={saving} onClick={handleFinish} className="w-40 bg-green-600 hover:bg-green-700 font-bold">ĐĂNG TIN NGAY</Button>
          )}
        </div>
      </Form>
    </EmployerLayout>
  );
}

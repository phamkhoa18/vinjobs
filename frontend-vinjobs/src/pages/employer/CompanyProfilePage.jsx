import { useState, useEffect } from 'react';
import EmployerLayout from '../../components/layout/EmployerLayout';
import { companiesApi, getImageUrl, blogApi } from '../../lib/api';
import LocationService from '../../services/LocationService';
import ImageUploadService from '../../services/ImageUploadService';
import { Form, Input, Select, Button, Tabs, Row, Col, Typography, message, Upload, Spin, Divider } from 'antd';
import { SaveOutlined, CameraOutlined, LoadingOutlined, GlobalOutlined, MailOutlined, PhoneOutlined, FacebookOutlined, LinkedinOutlined, YoutubeOutlined } from '@ant-design/icons';
import ImgCrop from 'antd-img-crop';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export default function CompanyProfilePage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [companyId, setCompanyId] = useState(null);
  
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const [categories, setCategories] = useState([]);
  const [parentCategoryId, setParentCategoryId] = useState('');
  const [showCustomIndustry, setShowCustomIndustry] = useState(false);

  const [logoUrl, setLogoUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [provs, catsRes] = await Promise.all([
          LocationService.getProvinces(),
          blogApi.getCategories().catch(() => ({ categories: [] }))
        ]);
        
        setProvinces(provs);
        let allCats = [];
        if (catsRes && catsRes.categories) {
          allCats = catsRes.categories;
          setCategories(allCats);
        }

        const res = await companiesApi.mine();
        if (res.status === 'success' && res.data.company) {
          const comp = res.data.company;
          setCompanyId(comp._id);
          
          if (comp.logo) setLogoUrl(getImageUrl(comp.logo));
          if (comp.cover) setCoverUrl(getImageUrl(comp.cover));

          // Handle Industry matching
          let matchedParent = '';
          let matchedChild = '';
          let customInd = '';
          let showCustom = false;

          if (comp.industry) {
            const foundCat = allCats.find(c => c.name === comp.industry);
            if (foundCat) {
              if (foundCat.parent_id) {
                // It is a child category
                matchedParent = foundCat.parent_id._id || foundCat.parent_id;
                matchedChild = foundCat._id;
              } else {
                // It is a parent category
                matchedParent = foundCat._id;
              }
            } else {
              // Custom industry
              matchedParent = 'OTHER';
              customInd = comp.industry;
              showCustom = true;
            }
          }

          setParentCategoryId(matchedParent);
          setShowCustomIndustry(showCustom);

          form.setFieldsValue({
            name: comp.name || '',
            industry_parent: matchedParent || undefined,
            industry_child: matchedChild || undefined,
            custom_industry: customInd,
            companyType: comp.companyType || undefined,
            size: comp.size || '100-499 nhân viên',
            province: comp.province || 'TP.HCM',
            district: comp.district || '',
            ward: comp.ward || '',
            address: comp.address || '',
            website: comp.website || '',
            founded: comp.founded || '',
            taxCode: comp.taxCode || '',
            phone: comp.phone || '',
            description: comp.description || '',
            mission: comp.mission || '',
            contact_email: comp.contact_email || '',
            contact_phone: comp.contact_phone || '',
            working_days: comp.working_days || 'Thứ 2 - Thứ 6',
            overtime_policy: comp.overtime_policy || 'Không OT',
            benefits: comp.benefits ? comp.benefits.join(', ') : '',
            video_url: comp.video_url || '',
            facebook: comp.facebook || '',
            linkedin: comp.linkedin || '',
          });

          if (comp.province) {
            const p = provs.find(x => x.name === comp.province);
            if (p) {
              const dList = await LocationService.getDistricts(p.code);
              setDistricts(dList);
              if (comp.district) {
                const d = dList.find(x => x.name === comp.district);
                if (d) {
                  const wList = await LocationService.getWards(d.code);
                  setWards(wList);
                }
              }
            }
          }
        }
      } catch (err) {
        message.error('Lỗi khi tải thông tin công ty');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [form]);

  const handleParentIndustryChange = (val) => {
    setParentCategoryId(val);
    form.setFieldsValue({ industry_child: undefined, custom_industry: '' });
    setShowCustomIndustry(val === 'OTHER');
  };

  const handleProvinceChange = async (val) => {
    form.setFieldsValue({ district: '', ward: '' });
    setWards([]);
    const p = provinces.find(x => x.name === val);
    if (p) {
      setDistricts(await LocationService.getDistricts(p.code));
    } else {
      setDistricts([]);
    }
  };

  const handleDistrictChange = async (val) => {
    form.setFieldsValue({ ward: '' });
    const d = districts.find(x => x.name === val);
    if (d) {
      setWards(await LocationService.getWards(d.code));
    } else {
      setWards([]);
    }
  };

  const customUploadLogo = async ({ file, onSuccess, onError }) => {
    setUploadingLogo(true);
    try {
      const newUrl = await ImageUploadService.uploadAvatar(file, true);
      setLogoUrl(getImageUrl(newUrl));
      
      // Update company instantly
      if (companyId) {
        await companiesApi.update(companyId, { logo: newUrl });
      }
      message.success('Cập nhật logo thành công!');
      onSuccess('ok');
    } catch (err) {
      message.error('Lỗi tải ảnh');
      onError(err);
    } finally {
      setUploadingLogo(false);
    }
  };

  const customUploadCover = async ({ file, onSuccess, onError }) => {
    setUploadingCover(true);
    try {
      const newUrl = await ImageUploadService.uploadAvatar(file, true); // Still use upload but maybe less square
      setCoverUrl(getImageUrl(newUrl));
      if (companyId) {
        await companiesApi.update(companyId, { cover: newUrl });
      }
      message.success('Cập nhật ảnh bìa thành công!');
      onSuccess('ok');
    } catch (err) {
      message.error('Lỗi tải ảnh bìa');
      onError(err);
    } finally {
      setUploadingCover(false);
    }
  };

  const handleSave = async (values) => {
    setSaving(true);
    try {
      let finalIndustry = '';
      if (values.industry_parent === 'OTHER') {
        finalIndustry = values.custom_industry;
      } else {
        // if child is selected, use child name, else parent name
        if (values.industry_child) {
          const childCat = categories.find(c => c._id === values.industry_child);
          finalIndustry = childCat ? childCat.name : '';
        } else {
          const parentCat = categories.find(c => c._id === values.industry_parent);
          finalIndustry = parentCat ? parentCat.name : '';
        }
      }

      const payload = {
        name: values.name,
        industry: finalIndustry,
        companyType: values.companyType,
        size: values.size,
        province: values.province,
        district: values.district,
        ward: values.ward,
        address: values.address,
        website: values.website,
        founded: values.founded,
        description: values.description,
        contact_email: values.contact_email,
        contact_phone: values.contact_phone,
        working_days: values.working_days,
        overtime_policy: values.overtime_policy,
        benefits: values.benefits ? values.benefits.split(',').map(b => b.trim()).filter(Boolean) : [],
        video_url: values.video_url,
        mission: values.mission,
        facebook: values.facebook,
        linkedin: values.linkedin,
      };

      if (companyId) {
        await companiesApi.update(companyId, payload);
        message.success('Cập nhật thông tin công ty thành công');
      } else {
        const res = await companiesApi.create(payload);
        setCompanyId(res.data.company._id);
        message.success('Đăng ký thông tin công ty thành công. Đang chờ duyệt!');
      }
    } catch (err) {
      message.error(err.message || 'Lỗi khi lưu thông tin công ty');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <EmployerLayout><div className="flex justify-center p-10"><Spin size="large" /></div></EmployerLayout>;

  return (
    <EmployerLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Title level={3} style={{ margin: 0 }}>Hồ sơ công ty</Title>
          <Text type="secondary">Quản lý diện mạo thương hiệu tuyển dụng của bạn</Text>
        </div>
        <Button 
          type="primary" 
          icon={<SaveOutlined />} 
          loading={saving} 
          onClick={() => form.submit()}
        >
          Lưu thay đổi
        </Button>
      </div>

      {/* Cover + Logo Banner */}
      <div className="bg-white !mb-6 overflow-hidden rounded-xl">
        <div className="relative h-[200px] bg-gradient-to-r from-blue-50 to-indigo-50 group">
          {coverUrl && <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />}
          
          <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <Upload customRequest={customUploadCover} showUploadList={false}>
              <Button icon={uploadingCover ? <LoadingOutlined /> : <CameraOutlined />} className="bg-white/90 shadow-sm border-0">
                Đổi ảnh bìa
              </Button>
            </Upload>
          </div>
        </div>
        
        <div className="p-6 pt-0 flex flex-col md:flex-row md:items-end gap-6 relative bg-white">
          <div className="-mt-12 relative z-10 group">
            <div className="w-24 h-24 bg-white border-[3px] border-white rounded-xl shadow-sm overflow-hidden relative flex items-center justify-center p-1.5">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <Text type="secondary" className="text-center text-[10px]">Chưa có Logo</Text>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <ImgCrop rotationSlider aspect={1} shape="rect">
                  <Upload customRequest={customUploadLogo} showUploadList={false}>
                    <div className="text-white cursor-pointer w-full h-full flex items-center justify-center">
                      {uploadingLogo ? <LoadingOutlined /> : <CameraOutlined />}
                    </div>
                  </Upload>
                </ImgCrop>
              </div>
            </div>
          </div>
          <div className="pb-2">
            <Title level={5} style={{ margin: 0 }}>{form.getFieldValue('name') || 'Tên công ty'}</Title>
            <Text type="secondary" className="text-sm">
              {form.getFieldValue('industry')} {form.getFieldValue('size') ? `• ${form.getFieldValue('size')}` : ''}
            </Text>
          </div>
        </div>
      </div>

      <Form 
        form={form} 
        layout="vertical" 
        onFinish={handleSave} 
        className="company-profile-form"
        requiredMark="optional"
      >
        <div className="bg-white px-6 pb-6 rounded-xl">
        <Tabs defaultActiveKey="1" className="ant-tabs-compact">
          <Tabs.TabPane tab={<span className="font-medium text-[14px]">Thông tin cơ bản</span>} key="1">
            <div className="pt-4">
            <Row gutter={[24, 16]}>
              <Col xs={24} md={12}>
                <Form.Item name="name" label={<span className="font-bold text-gray-700">Tên công ty (Theo GPKD)</span>} rules={[{ required: true, message: 'Vui lòng nhập tên công ty' }]}>
                  <Input placeholder="Ví dụ: Công ty Cổ phần Công nghệ VinJobs" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="taxCode" label={<span className="font-semibold text-gray-700">Mã số thuế</span>}>
                  <Input disabled className="bg-gray-50" />
                </Form.Item>
              </Col>
              
              <Col xs={24} md={8}>
                <Form.Item name="industry_parent" label={<span className="font-semibold text-gray-700">Ngành nghề chính</span>} rules={[{ required: true, message: 'Chọn ngành nghề' }]}>
                  <Select onChange={handleParentIndustryChange} placeholder="Chọn ngành nghề">
                    {categories.filter(c => !c.parent_id).map(c => (
                      <Option key={c._id} value={c._id}>{c.name}</Option>
                    ))}
                    <Option value="OTHER">Khác (Nhập thủ công)</Option>
                  </Select>
                </Form.Item>
              </Col>
              
              {parentCategoryId && parentCategoryId !== 'OTHER' && categories.some(c => c.parent_id && (c.parent_id._id === parentCategoryId || c.parent_id === parentCategoryId)) && (
                <Col xs={24} md={8}>
                  <Form.Item name="industry_child" label={<span className="font-semibold text-gray-700">Ngành con / Lĩnh vực</span>}>
                    <Select placeholder="Chọn ngành con (Tuỳ chọn)">
                      {categories.filter(c => c.parent_id && (c.parent_id._id === parentCategoryId || c.parent_id === parentCategoryId)).map(c => (
                        <Option key={c._id} value={c._id}>{c.name}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              )}

              {showCustomIndustry && (
                <Col xs={24} md={8}>
                  <Form.Item name="custom_industry" label={<span className="font-semibold text-gray-700">Nhập ngành nghề khác</span>} rules={[{ required: true, message: 'Vui lòng nhập ngành nghề' }]}>
                    <Input placeholder="Ví dụ: Công nghệ sinh học" />
                  </Form.Item>
                </Col>
              )}

              <Col xs={24} md={8}>
                <Form.Item name="companyType" label={<span className="font-semibold text-gray-700">Loại hình công ty</span>}>
                  <Select placeholder="Chọn loại hình">
                    <Option value="Product">Product (Sản phẩm)</Option>
                    <Option value="Outsourcing">Outsourcing (Gia công)</Option>
                    <Option value="Inhouse">In-house (Nội bộ)</Option>
                    <Option value="Agency">Agency (Dịch vụ)</Option>
                    <Option value="Startup">Startup (Khởi nghiệp)</Option>
                    <Option value="Khác">Khác</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="size" label={<span className="font-semibold text-gray-700">Quy mô nhân sự</span>}>
                  <Select>
                    {['1-50', '51-200', '201-500', '500-1000', '1000-5000', '5000-10000', '10000+'].map(s => <Option key={s} value={s}>{s} nhân viên</Option>)}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="founded" label={<span className="font-semibold text-gray-700">Năm thành lập</span>}>
                  <Input placeholder="Ví dụ: 2015" />
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item name="province" label={<span className="font-semibold text-gray-700">Tỉnh/Thành phố</span>}>
                  <Select showSearch onChange={handleProvinceChange} placeholder="Chọn tỉnh thành">
                    {provinces.map(p => <Option key={p.code} value={p.name}>{p.name}</Option>)}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="district" label={<span className="font-semibold text-gray-700">Quận/Huyện</span>}>
                  <Select showSearch onChange={handleDistrictChange} placeholder="Chọn quận huyện" disabled={!districts.length}>
                    {districts.map(d => <Option key={d.code} value={d.name}>{d.name}</Option>)}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="ward" label={<span className="font-semibold text-gray-700">Phường/Xã</span>}>
                  <Select showSearch placeholder="Chọn phường xã" disabled={!wards.length}>
                    {wards.map(w => <Option key={w.code} value={w.name}>{w.name}</Option>)}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item name="address" label={<span className="font-semibold text-gray-700">Số nhà, tên đường cụ thể</span>}>
                  <Input placeholder="Ví dụ: Tòa nhà Landmark 81, 720A Điện Biên Phủ" />
                </Form.Item>
              </Col>
            </Row>
            </div>

            <Divider className="my-6 border-gray-100" />
            <div className="mb-4">
              <Title level={5} style={{ margin: 0, color: '#111827' }}>Thông tin liên hệ & Mạng xã hội</Title>
            </div>
            
            <Row gutter={[24, 16]}>
              <Col xs={24} md={12}>
                <Form.Item name="website" label={<span className="font-semibold text-gray-700">Website Công ty</span>}>
                  <Input prefix={<GlobalOutlined className="text-gray-400" />} placeholder="https://..." />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="contact_email" label={<span className="font-semibold text-gray-700">Email Liên hệ Tuyển dụng</span>}>
                  <Input prefix={<MailOutlined className="text-gray-400" />} placeholder="hr@company.com" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="contact_phone" label={<span className="font-semibold text-gray-700">Hotline Tuyển dụng</span>}>
                  <Input prefix={<PhoneOutlined className="text-gray-400" />} placeholder="0123456789" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="facebook" label={<span className="font-semibold text-gray-700">Facebook Fanpage</span>}>
                  <Input prefix={<FacebookOutlined className="text-blue-600" />} placeholder="https://facebook.com/..." />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="linkedin" label={<span className="font-semibold text-gray-700">LinkedIn Profile</span>}>
                  <Input prefix={<LinkedinOutlined className="text-blue-700" />} placeholder="https://linkedin.com/..." />
                </Form.Item>
              </Col>
            </Row>
          </Tabs.TabPane>

          <Tabs.TabPane tab={<span className="font-medium text-[14px]">Giới thiệu & Văn hóa</span>} key="2">
            <div className="pt-4">
            <Row gutter={[24, 16]}>
              <Col xs={24}>
                <Form.Item name="description" label={<span className="font-semibold text-gray-700">Giới thiệu chung về công ty</span>}>
                  <TextArea rows={5} placeholder="Công ty chúng tôi hoạt động trong lĩnh vực..." />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item name="mission" label={<span className="font-semibold text-gray-700">Tầm nhìn & Sứ mệnh</span>}>
                  <TextArea rows={3} placeholder="Sứ mệnh của chúng tôi là..." />
                </Form.Item>
              </Col>
            </Row>
            </div>

            <Divider className="my-6 border-gray-100" />
            <div className="mb-4">
              <Title level={5} style={{ margin: 0, color: '#111827' }}>Phúc lợi & Môi trường làm việc</Title>
            </div>
            
            <Row gutter={[24, 16]}>
              <Col xs={24} md={12}>
                <Form.Item name="working_days" label={<span className="font-semibold text-gray-700">Ngày làm việc</span>}>
                  <Input placeholder="Ví dụ: Thứ 2 - Thứ 6 (Nghỉ T7, CN)" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="overtime_policy" label={<span className="font-semibold text-gray-700">Chính sách OT</span>}>
                  <Input placeholder="Ví dụ: Không OT / OT lương x1.5" />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item name="benefits" label={<span className="font-semibold text-gray-700">Phúc lợi (Cách nhau bởi dấu phẩy)</span>} extra="Ví dụ: Bảo hiểm PTI cao cấp, Cấp Macbook Pro, Du lịch 2 lần/năm">
                  <TextArea rows={3} placeholder="Các chế độ đãi ngộ nổi bật..." />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item name="video_url" label={<span className="font-semibold text-gray-700">Video giới thiệu môi trường làm việc (Youtube)</span>}>
                  <Input prefix={<YoutubeOutlined className="text-red-600" />} placeholder="https://youtube.com/watch?v=..." />
                </Form.Item>
              </Col>
            </Row>
          </Tabs.TabPane>
        </Tabs>
        </div>
      </Form>
    </EmployerLayout>
  );
}

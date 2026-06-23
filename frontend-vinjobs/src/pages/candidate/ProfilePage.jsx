import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { authApi, userStorage } from '../../lib/api';
import { toast } from 'react-hot-toast';
import { Form, Input, Select, Button, Card, Row, Col, Typography, Menu, Space, Modal, DatePicker, Avatar, List, Popconfirm, Tag, Spin } from 'antd';
import { 
  UserOutlined, 
  AimOutlined, 
  HistoryOutlined, 
  ToolOutlined, 
  ReadOutlined,
  SaveOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

const PROVINCES = ['TP.HCM', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng', 'Bình Dương', 'Đồng Nai'];
const INDUSTRIES = ['Công nghệ thông tin', 'Kinh doanh / Sales', 'Kế toán / Tài chính', 'Marketing', 'Nhân sự', 'Thiết kế', 'Xây dựng'];
const SKILLS_POOL = ['React', 'Node.js', 'Python', 'Java', 'TypeScript', 'SQL', 'AWS', 'Docker', 'Figma', 'Adobe XD', 'Photoshop', 'Excel', 'Word', 'PowerPoint', 'Git', 'Agile/Scrum'];

export default function ProfilePage() {
  const [activeSection, setActiveSection] = useState('basic');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();
  
  const [skills, setSkills] = useState([]);
  const [workExperience, setWorkExperience] = useState([]);
  const [education, setEducation] = useState([]);
  
  const [expModal, setExpModal] = useState({ open: false, index: -1 });
  const [eduModal, setEduModal] = useState({ open: false, index: -1 });
  const [expForm] = Form.useForm();
  const [eduForm] = Form.useForm();

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await authApi.getMe();
        if (res.status === 'success') {
          const user = res.data.user;
          const p = user.profile || {};
          
          form.setFieldsValue({
            fullName: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            gender: p.gender || 'Nam',
            dob: p.dob ? dayjs(p.dob) : null,
            address: p.address || '',
            intro: p.intro || '',
            currentJob: p.currentJob || '',
            experience: p.experience || '',
            level: p.level || 'Junior',
            salary: p.salary || '',
            jobType: p.jobType || 'FULL_TIME',
            province: p.province || 'TP.HCM',
            industry: p.industry || 'Công nghệ thông tin',
            skills: p.skills || [],
          });
          
          setSkills(p.skills || []);
          setWorkExperience(p.workExperience || []);
          setEducation(p.education || []);
        }
      } catch (err) {
        toast.error('Lỗi khi tải thông tin');
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, [form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      
      const payload = {
        name: values.fullName,
        phone: values.phone,
        profile: {
          gender: values.gender,
          dob: values.dob ? values.dob.format('YYYY-MM-DD') : undefined,
          address: values.address,
          intro: values.intro,
          currentJob: values.currentJob,
          experience: values.experience,
          level: values.level,
          salary: values.salary,
          jobType: values.jobType,
          province: values.province,
          industry: values.industry,
          skills: values.skills,
          workExperience,
          education
        }
      };
      
      const res = await authApi.updateProfile(payload);
      if (res.status === 'success') {
        toast.success('Lưu hồ sơ thành công!');
        userStorage.set(res.data.user);
      }
    } catch (err) {
      toast.error('Vui lòng kiểm tra lại thông tin');
    } finally {
      setSaving(false);
    }
  };

  const handleExpSave = async () => {
    try {
      const values = await expForm.validateFields();
      const newList = [...workExperience];
      if (expModal.index > -1) newList[expModal.index] = values;
      else newList.push(values);
      
      setWorkExperience(newList);
      setExpModal({ open: false, index: -1 });
      expForm.resetFields();
    } catch (err) {
      // Form validation failed
    }
  };

  const handleEduSave = async () => {
    try {
      const values = await eduForm.validateFields();
      const newList = [...education];
      if (eduModal.index > -1) newList[eduModal.index] = values;
      else newList.push(values);
      
      setEducation(newList);
      setEduModal({ open: false, index: -1 });
      eduForm.resetFields();
    } catch (err) {
      // Form validation failed
    }
  };

  const deleteExp = (index) => setWorkExperience(workExperience.filter((_, i) => i !== index));
  const deleteEdu = (index) => setEducation(education.filter((_, i) => i !== index));

  const openExpModal = (index = -1) => {
    if (index > -1) {
      expForm.setFieldsValue(workExperience[index]);
    } else {
      expForm.resetFields();
    }
    setExpModal({ open: true, index });
  };

  const openEduModal = (index = -1) => {
    if (index > -1) {
      eduForm.setFieldsValue(education[index]);
    } else {
      eduForm.resetFields();
    }
    setEduModal({ open: true, index });
  };

  if (loading) return <DashboardLayout role="candidate"><div className="flex justify-center p-10"><Spin size="large" /></div></DashboardLayout>;

  return (
    <DashboardLayout role="candidate">
      <div className="flex items-center justify-between" style={{ marginBottom: '24px' }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>Hồ sơ cá nhân</Title>
          <Text type="secondary">Cập nhật thông tin để tăng cơ hội được tuyển dụng</Text>
        </div>
        <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} loading={saving}>
          Lưu thay đổi
        </Button>
      </div>

      <Card bordered={false} className="shadow-sm" style={{ marginBottom: '24px' }}>
        <Space size="large">
          <Avatar size={80} src="https://ui-avatars.com/api/?name=Candidate&background=random" />
          <div>
            <Title level={5} style={{ margin: 0 }}>{form.getFieldValue('fullName')}</Title>
            <Text type="secondary">{form.getFieldValue('currentJob') || 'Chưa cập nhật công việc'} · {form.getFieldValue('province')}</Text>
          </div>
        </Space>
      </Card>

      <Row gutter={24}>
        <Col xs={24} md={6}>
          <Menu
            mode="inline"
            selectedKeys={[activeSection]}
            onClick={(e) => setActiveSection(e.key)}
            className="rounded-lg border-0 shadow-sm overflow-hidden"
            items={[
              { key: 'basic', icon: <UserOutlined />, label: 'Thông tin cơ bản' },
              { key: 'career', icon: <AimOutlined />, label: 'Mục tiêu nghề nghiệp' },
              { key: 'experience', icon: <HistoryOutlined />, label: 'Kinh nghiệm' },
              { key: 'skills', icon: <ToolOutlined />, label: 'Kỹ năng' },
              { key: 'education', icon: <ReadOutlined />, label: 'Học vấn' },
            ]}
          />
        </Col>

        <Col xs={24} md={18}>
          <Card bordered={false} className="shadow-sm">
            <Form form={form} layout="vertical">
              <div style={{ display: activeSection === 'basic' ? 'block' : 'none' }}>
                <Title level={5} className="mb-4">Thông tin cơ bản</Title>
                <Row gutter={16}>
                  <Col xs={24} sm={12}><Form.Item label="Họ và tên" name="fullName"><Input /></Form.Item></Col>
                  <Col xs={24} sm={12}><Form.Item label="Email" name="email"><Input disabled /></Form.Item></Col>
                  <Col xs={24} sm={12}><Form.Item label="Số điện thoại" name="phone"><Input /></Form.Item></Col>
                  <Col xs={24} sm={12}><Form.Item label="Ngày sinh" name="dob"><DatePicker className="w-full" format="DD/MM/YYYY" /></Form.Item></Col>
                  <Col xs={24} sm={12}>
                    <Form.Item label="Giới tính" name="gender">
                      <Select options={[{value:'Nam',label:'Nam'},{value:'Nữ',label:'Nữ'},{value:'Khác',label:'Khác'}]} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item label="Địa chỉ" name="province">
                      <Select showSearch options={PROVINCES.map(p => ({ value: p, label: p }))} />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item label="Địa chỉ cụ thể" name="address"><Input /></Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item label="Giới thiệu bản thân" name="intro"><TextArea rows={4} /></Form.Item>
                  </Col>
                </Row>
              </div>

              <div style={{ display: activeSection === 'career' ? 'block' : 'none' }}>
                <Title level={5} className="mb-4">Mục tiêu nghề nghiệp</Title>
                <Row gutter={16}>
                  <Col xs={24} sm={12}><Form.Item label="Vị trí hiện tại" name="currentJob"><Input /></Form.Item></Col>
                  <Col xs={24} sm={12}>
                    <Form.Item label="Ngành nghề" name="industry">
                      <Select showSearch options={INDUSTRIES.map(i => ({ value: i, label: i }))} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item label="Cấp bậc" name="level">
                      <Select options={[
                        {value:'Thực tập sinh',label:'Thực tập sinh'},
                        {value:'Mới đi làm',label:'Mới đi làm'},
                        {value:'Nhân viên',label:'Nhân viên'},
                        {value:'Trưởng phòng',label:'Trưởng phòng'}
                      ]} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item label="Số năm kinh nghiệm" name="experience">
                      <Select options={[
                        {value:'Chưa có kinh nghiệm',label:'Chưa có kinh nghiệm'},
                        {value:'Dưới 1 năm',label:'Dưới 1 năm'},
                        {value:'1 năm',label:'1 năm'},
                        {value:'2 năm',label:'2 năm'},
                        {value:'Trên 3 năm',label:'Trên 3 năm'}
                      ]} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}><Form.Item label="Mức lương mong muốn" name="salary"><Input placeholder="VD: 15,000,000 VND" /></Form.Item></Col>
                  <Col xs={24} sm={12}>
                    <Form.Item label="Hình thức làm việc" name="jobType">
                      <Select options={[
                        {value:'FULL_TIME',label:'Toàn thời gian'},
                        {value:'PART_TIME',label:'Bán thời gian'},
                        {value:'FREELANCE',label:'Freelance'}
                      ]} />
                    </Form.Item>
                  </Col>
                </Row>
              </div>

              <div style={{ display: activeSection === 'experience' ? 'block' : 'none' }}>
                <div className="flex justify-between items-center mb-4">
                  <Title level={5} style={{ margin: 0 }}>Kinh nghiệm làm việc</Title>
                  <Button type="dashed" icon={<PlusOutlined />} onClick={() => openExpModal(-1)}>Thêm kinh nghiệm</Button>
                </div>
                <List
                  itemLayout="horizontal"
                  dataSource={workExperience}
                  locale={{ emptyText: 'Chưa có kinh nghiệm nào được thêm.' }}
                  renderItem={(item, index) => (
                    <List.Item
                      actions={[
                        <Button type="text" icon={<EditOutlined />} onClick={() => openExpModal(index)} />,
                        <Popconfirm title="Xóa kinh nghiệm này?" onConfirm={() => deleteExp(index)}>
                          <Button type="text" danger icon={<DeleteOutlined />} />
                        </Popconfirm>
                      ]}
                    >
                      <List.Item.Meta
                        title={<Text strong>{item.title}</Text>}
                        description={
                          <Space direction="vertical" size={0}>
                            <Text>{item.company}</Text>
                            <Text type="secondary" className="text-xs">{item.period}</Text>
                            {item.desc && <Text className="mt-2 text-gray-600 block">{item.desc}</Text>}
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              </div>

              <div style={{ display: activeSection === 'skills' ? 'block' : 'none' }}>
                <Title level={5} className="mb-4">Kỹ năng chuyên môn</Title>
                <Form.Item name="skills">
                  <Select
                    mode="tags"
                    style={{ width: '100%' }}
                    placeholder="Nhập hoặc chọn kỹ năng"
                    options={SKILLS_POOL.map(s => ({ value: s, label: s }))}
                  />
                </Form.Item>
              </div>

              <div style={{ display: activeSection === 'education' ? 'block' : 'none' }}>
                <div className="flex justify-between items-center mb-4">
                  <Title level={5} style={{ margin: 0 }}>Học vấn</Title>
                  <Button type="dashed" icon={<PlusOutlined />} onClick={() => openEduModal(-1)}>Thêm học vấn</Button>
                </div>
                <List
                  itemLayout="horizontal"
                  dataSource={education}
                  locale={{ emptyText: 'Chưa có học vấn nào được thêm.' }}
                  renderItem={(item, index) => (
                    <List.Item
                      actions={[
                        <Button type="text" icon={<EditOutlined />} onClick={() => openEduModal(index)} />,
                        <Popconfirm title="Xóa học vấn này?" onConfirm={() => deleteEdu(index)}>
                          <Button type="text" danger icon={<DeleteOutlined />} />
                        </Popconfirm>
                      ]}
                    >
                      <List.Item.Meta
                        title={<Text strong>{item.school}</Text>}
                        description={
                          <Space direction="vertical" size={0}>
                            <Text>{item.degree}</Text>
                            <Text type="secondary" className="text-xs">{item.period}</Text>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              </div>

            </Form>
          </Card>
        </Col>
      </Row>

      <Modal title={expModal.index > -1 ? 'Sửa kinh nghiệm' : 'Thêm kinh nghiệm'} open={expModal.open} onOk={handleExpSave} onCancel={() => setExpModal({ open: false, index: -1 })}>
        <Form form={expForm} layout="vertical">
          <Form.Item name="title" label="Chức danh" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="company" label="Công ty" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="period" label="Thời gian"><Input placeholder="VD: 01/2020 - Hiện tại" /></Form.Item>
          <Form.Item name="desc" label="Mô tả công việc"><TextArea rows={4} /></Form.Item>
        </Form>
      </Modal>

      <Modal title={eduModal.index > -1 ? 'Sửa học vấn' : 'Thêm học vấn'} open={eduModal.open} onOk={handleEduSave} onCancel={() => setEduModal({ open: false, index: -1 })}>
        <Form form={eduForm} layout="vertical">
          <Form.Item name="school" label="Trường / Tổ chức" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="degree" label="Bằng cấp / Ngành học" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="period" label="Thời gian"><Input placeholder="VD: 2016 - 2020" /></Form.Item>
        </Form>
      </Modal>

    </DashboardLayout>
  );
}

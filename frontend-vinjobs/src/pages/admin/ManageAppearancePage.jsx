import { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { Card, Tabs, Form, Input, Button, Typography, message, Switch, Space, Divider } from 'antd';
import { SaveOutlined, PlusOutlined, DeleteOutlined, DragOutlined } from '@ant-design/icons';
import { adminApi, publicApi } from '../../lib/api';
import { useSettings } from '../../contexts/SettingsContext';

const { Title, Text } = Typography;

export default function ManageAppearancePage() {
  const [formMenu] = Form.useForm();
  const [formFooter] = Form.useForm();
  const { fetchSettings } = useSettings();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await publicApi.getSettings();
      const st = res.data.settings;
      
      formMenu.setFieldsValue({
        header_menu: st.header_menu || []
      });
      
      formFooter.setFieldsValue({
        footer_columns: st.footer_columns || [],
        footer_bottom_text: st.footer_bottom_text || '© 2026 VinJobs. All rights reserved.'
      });
    } catch (error) {
      message.error('Không thể tải cấu hình giao diện');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMenu = async (values) => {
    try {
      const formData = new FormData();
      formData.append('header_menu', JSON.stringify(values.header_menu));
      
      await adminApi.updateSettings(formData);
      message.success('Cập nhật Menu Header thành công!');
      fetchSettings();
    } catch (err) {
      message.error(err.message || 'Cập nhật thất bại');
    }
  };

  const handleSaveFooter = async (values) => {
    try {
      const formData = new FormData();
      formData.append('footer_columns', JSON.stringify(values.footer_columns));
      formData.append('footer_bottom_text', values.footer_bottom_text);
      
      await adminApi.updateSettings(formData);
      message.success('Cập nhật Footer thành công!');
      fetchSettings();
    } catch (err) {
      message.error(err.message || 'Cập nhật thất bại');
    }
  };

  const menuSettings = (
    <Form 
      form={formMenu} 
      layout="vertical" 
      onFinish={handleSaveMenu}
    >
      <div className="mb-4">
        <Text type="secondary">Cấu hình các đường dẫn xuất hiện trên thanh điều hướng (Header) của website.</Text>
      </div>

      <Form.List name="header_menu">
        {(fields, { add, remove, move }) => (
          <>
            {fields.map(({ key, name, ...restField }, index) => (
              <div key={key} className="flex gap-4 items-end mb-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex flex-col justify-center pb-2 cursor-move text-gray-400">
                  <DragOutlined />
                </div>
                <Form.Item
                  {...restField}
                  name={[name, 'title']}
                  label="Tên Menu"
                  rules={[{ required: true, message: 'Nhập tên menu' }]}
                  className="mb-0 flex-1"
                >
                  <Input placeholder="VD: Việc làm" />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, 'link']}
                  label="Đường dẫn (URL)"
                  rules={[{ required: true, message: 'Nhập đường dẫn' }]}
                  className="mb-0 flex-1"
                >
                  <Input placeholder="VD: /jobs hoặc https://..." />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, 'is_new_tab']}
                  label="Mở tab mới"
                  valuePropName="checked"
                  className="mb-0"
                >
                  <Switch />
                </Form.Item>
                <Button 
                  type="text" 
                  danger 
                  icon={<DeleteOutlined />} 
                  onClick={() => remove(name)}
                  className="mb-1"
                />
              </div>
            ))}
            <Form.Item>
              <Button type="dashed" onClick={() => add({ is_new_tab: false })} block icon={<PlusOutlined />} className="h-10 mt-2">
                Thêm Menu mới
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>

      <div className="flex justify-end mt-6">
        <Button type="primary" htmlType="submit" icon={<SaveOutlined />} size="large" className="px-8 rounded-lg font-medium shadow-md">
          Lưu Menu Header
        </Button>
      </div>
    </Form>
  );

  const footerSettings = (
    <Form 
      form={formFooter} 
      layout="vertical" 
      onFinish={handleSaveFooter}
    >
      <div className="mb-4">
        <Text type="secondary">Cấu hình các cột (columns) và danh sách liên kết dưới chân trang (Footer).</Text>
      </div>

      <Form.List name="footer_columns">
        {(columns, { add: addCol, remove: removeCol }) => (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {columns.map(({ key, name, ...restCol }) => (
              <Card 
                key={key} 
                size="small" 
                title={
                  <Form.Item
                    {...restCol}
                    name={[name, 'title']}
                    rules={[{ required: true, message: 'Tên cột' }]}
                    className="mb-0 mt-2"
                  >
                    <Input placeholder="Tên cột (VD: Dành cho ứng viên)" className="font-semibold text-lg" variant="borderless" />
                  </Form.Item>
                }
                extra={
                  <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeCol(name)} />
                }
                className="bg-gray-50 border-gray-200"
              >
                <Form.List name={[name, 'links']}>
                  {(links, { add: addLink, remove: removeLink }) => (
                    <div className="flex flex-col gap-3">
                      {links.map(({ key: linkKey, name: linkName, ...restLink }) => (
                        <div key={linkKey} className="flex gap-2">
                          <Form.Item
                            {...restLink}
                            name={[linkName, 'title']}
                            rules={[{ required: true, message: 'Nhập tên' }]}
                            className="mb-0 w-1/2"
                          >
                            <Input placeholder="Tên link" size="small" />
                          </Form.Item>
                          <Form.Item
                            {...restLink}
                            name={[linkName, 'link']}
                            rules={[{ required: true, message: 'Nhập link' }]}
                            className="mb-0 flex-1"
                          >
                            <Input placeholder="URL (/jobs)" size="small" />
                          </Form.Item>
                          <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={() => removeLink(linkName)} />
                        </div>
                      ))}
                      <Button type="dashed" size="small" onClick={() => addLink()} block icon={<PlusOutlined />} className="mt-2 text-primary border-primary">
                        Thêm Link
                      </Button>
                    </div>
                  )}
                </Form.List>
              </Card>
            ))}
            <Button type="dashed" onClick={() => addCol({ links: [] })} className="h-full min-h-[200px] flex flex-col justify-center items-center text-gray-400 bg-transparent">
              <PlusOutlined className="text-2xl mb-2" />
              <span>Thêm Cột mới</span>
            </Button>
          </div>
        )}
      </Form.List>

      <Divider />

      <Form.Item name="footer_bottom_text" label={<span className="font-semibold">Dòng chữ bản quyền (Copyright Bottom Text)</span>}>
        <Input placeholder="VD: © 2026 VinJobs. All rights reserved." size="large" />
      </Form.Item>

      <div className="flex justify-end mt-6">
        <Button type="primary" htmlType="submit" icon={<SaveOutlined />} size="large" className="px-8 rounded-lg font-medium shadow-md">
          Lưu Cấu hình Footer
        </Button>
      </div>
    </Form>
  );

  return (
    <AdminLayout>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-6">
          <Title level={2} className="m-0 text-gray-800">Cấu hình Giao diện</Title>
          <Text type="secondary" className="text-base">Quản lý Menu Header và Footer trên toàn hệ thống</Text>
        </div>

        <Card bordered={false} className="shadow-sm rounded-xl" loading={loading}>
          <Tabs 
            defaultActiveKey="menu" 
            items={[
              {
                key: 'menu',
                label: <span className="px-4 font-medium text-base">Menu Header</span>,
                children: <div className="pt-4">{menuSettings}</div>
              },
              {
                key: 'footer',
                label: <span className="px-4 font-medium text-base">Footer</span>,
                children: <div className="pt-4">{footerSettings}</div>
              }
            ]}
          />
        </Card>
      </div>
    </AdminLayout>
  );
}

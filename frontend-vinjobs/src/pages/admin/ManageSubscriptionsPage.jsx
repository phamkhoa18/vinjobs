import AdminLayout from '../../components/layout/AdminLayout';
import { Card, Table, Tag, Typography, Row, Col, Statistic, Select } from 'antd';
import { FallOutlined, RiseOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const MOCK_SUBSCRIPTIONS = [
  { id: 'SUB001', company: 'FPT Software', plan: 'pro', amount: '2,499,000đ', status: 'active', date: '21/06/2026' },
  { id: 'SUB002', company: 'VNG Corporation', plan: 'enterprise', amount: '5,999,000đ', status: 'active', date: '20/06/2026' },
  { id: 'SUB003', company: 'Shopee Vietnam', plan: 'basic', amount: '999,000đ', status: 'expired', date: '15/05/2026' },
  { id: 'SUB004', company: 'Masan Group', plan: 'pro', amount: '2,499,000đ', status: 'cancelled', date: '10/05/2026' },
  { id: 'SUB005', company: 'Techcombank', plan: 'enterprise', amount: '5,999,000đ', status: 'active', date: '01/06/2026' },
];

export default function ManageSubscriptionsPage() {
  const columns = [
    {
      title: 'Mã GD',
      dataIndex: 'id',
      key: 'id',
      render: (text) => <b>{text}</b>,
    },
    {
      title: 'Công ty',
      dataIndex: 'company',
      key: 'company',
    },
    {
      title: 'Gói dịch vụ',
      dataIndex: 'plan',
      key: 'plan',
      render: (plan) => {
        const colors = { basic: 'blue', pro: 'purple', enterprise: 'gold' };
        return <Tag color={colors[plan]}>{plan.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Giá trị',
      dataIndex: 'amount',
      key: 'amount',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Ngày đăng ký',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Trạng thái',
      key: 'status',
      dataIndex: 'status',
      render: (status) => {
        const config = {
          active: { color: 'success', text: 'Đang hoạt động' },
          expired: { color: 'default', text: 'Đã hết hạn' },
          cancelled: { color: 'error', text: 'Đã hủy' }
        };
        const c = config[status];
        return <Tag color={c.color}>{c.text}</Tag>;
      },
    },
  ];

  return (
    <AdminLayout>
      <div className="mb-6 flex justify-between items-end">
        <div>
          <Title level={3} style={{ margin: 0 }}>Gói dịch vụ & Doanh thu</Title>
          <Text type="secondary">Quản lý các gói thành viên và lịch sử giao dịch</Text>
        </div>
        <Select 
          defaultValue="month" 
          style={{ width: 150 }} 
          options={[
            { value: 'week', label: 'Tuần này' },
            { value: 'month', label: 'Tháng này' },
            { value: 'year', label: 'Năm nay' },
          ]}
        />
      </div>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={8}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title={<span className="font-semibold text-gray-500">Doanh thu (Tháng này)</span>}
              value={145800000}
              suffix="VNĐ"
              prefix={
                <span className="text-[12px] ml-2 font-medium text-emerald-600 mr-2">
                  <RiseOutlined /> 15%
                </span>
              }
              valueStyle={{ fontWeight: 700, marginTop: 8 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title={<span className="font-semibold text-gray-500">Gói đang hoạt động</span>}
              value={248}
              prefix={
                <span className="text-[12px] ml-2 font-medium text-emerald-600 mr-2">
                  <RiseOutlined /> 5%
                </span>
              }
              valueStyle={{ fontWeight: 700, marginTop: 8 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title={<span className="font-semibold text-gray-500">Gói bị hủy</span>}
              value={12}
              prefix={
                <span className="text-[12px] ml-2 font-medium text-rose-600 mr-2">
                  <FallOutlined /> 2%
                </span>
              }
              valueStyle={{ fontWeight: 700, marginTop: 8 }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Lịch sử giao dịch gần đây" bordered={false} className="shadow-sm">
        <Table 
          columns={columns} 
          dataSource={MOCK_SUBSCRIPTIONS} 
          rowKey="id"
          pagination={false}
          size="middle"
        />
      </Card>
    </AdminLayout>
  );
}

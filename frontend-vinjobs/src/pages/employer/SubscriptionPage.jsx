import { useState } from 'react';
import EmployerLayout from '../../components/layout/EmployerLayout';
import { Row, Col, Typography, Button, Switch, Table, Tag, Space } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, TrophyOutlined, CheckOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const PLANS = [
  {
    id: 'basic',
    name: 'Cơ bản',
    price: 990000,
    priceLabel: '990K',
    period: '/tháng',
    credits: 5,
    highlight: false,
    color: '#6b7280',
    features: ['5 tin tuyển dụng/tháng', 'Hiển thị 30 ngày/tin', 'Không giới hạn ứng viên', 'Hỗ trợ email'],
    missing: ['Tin nổi bật', 'Logo công ty', 'Analytics nâng cao', 'Ưu tiên tìm kiếm'],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 2490000,
    priceLabel: '2.49M',
    period: '/tháng',
    credits: 20,
    highlight: true,
    color: '#1677ff',
    badge: 'Phổ biến nhất',
    features: ['20 tin tuyển dụng/tháng', 'Hiển thị 60 ngày/tin', 'Không giới hạn ứng viên', 'Logo công ty', 'Tin nổi bật (3 tin)', 'Analytics cơ bản', 'Hỗ trợ email & chat'],
    missing: ['Analytics nâng cao', 'Dedicated AM'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 6990000,
    priceLabel: '6.99M',
    period: '/tháng',
    credits: 100,
    highlight: false,
    color: '#fa8c16',
    features: ['100 tin tuyển dụng/tháng', 'Hiển thị 90 ngày/tin', 'Ưu tiên tìm kiếm TOP', 'Logo + Banner công ty', 'Tin nổi bật không giới hạn', 'Analytics nâng cao', 'Dedicated AM', 'API tích hợp ATS'],
    missing: [],
  },
];

const CURRENT_PLAN = 'premium';
const BILLING_HISTORY = [
  { id: 1, date: '01/06/2026', desc: 'Gói Premium - Tháng 6/2026', amount: 2490000, status: 'paid' },
  { id: 2, date: '01/05/2026', desc: 'Gói Premium - Tháng 5/2026', amount: 2490000, status: 'paid' },
  { id: 3, date: '01/04/2026', desc: 'Gói Premium - Tháng 4/2026', amount: 2490000, status: 'paid' },
];

export default function SubscriptionPage() {
  const [yearly, setYearly] = useState(false);

  const columns = [
    {
      title: 'Mô tả giao dịch',
      dataIndex: 'desc',
      key: 'desc',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Ngày thanh toán',
      dataIndex: 'date',
      key: 'date',
      render: (text) => <Text type="secondary">{text}</Text>,
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => <Text strong>{amount.toLocaleString('vi-VN')} đ</Text>,
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: () => <Tag color="green">Thành công</Tag>,
    },
    {
      title: 'Hành động',
      key: 'action',
      render: () => <Button type="link" size="small">Tải hóa đơn</Button>,
    },
  ];

  return (
    <EmployerLayout>
      <div className="mb-6">
        <Title level={3} style={{ margin: 0 }}>Gói dịch vụ</Title>
        <Text type="secondary">Quản lý nâng cấp các gói tuyển dụng để tăng hiệu quả tìm kiếm ứng viên</Text>
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-xl p-6 !mb-6">
        <Row align="middle" justify="space-between">
          <Col>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <TrophyOutlined className="text-2xl" />
              </div>
              <div>
                <Text className="text-white/80 block mb-1 uppercase text-xs font-bold tracking-wider">Gói hiện tại</Text>
                <Title level={3} style={{ margin: 0, color: 'white' }}>Premium <span className="text-lg font-normal opacity-80">· Còn 17 tin đăng</span></Title>
                <Text className="text-white/80">Hết hạn: 30/09/2026 (Tự động gia hạn)</Text>
              </div>
            </div>
          </Col>
          <Col>
            <Button ghost size="large" className="border-white text-white hover:bg-white hover:text-blue-600">
              Hủy gia hạn
            </Button>
          </Col>
        </Row>
      </div>

      <div className="flex justify-center items-center gap-3 mb-8">
        <Text strong className={!yearly ? 'text-blue-600' : 'text-gray-400'}>Hàng tháng</Text>
        <Switch checked={yearly} onChange={setYearly} />
        <Text strong className={yearly ? 'text-blue-600' : 'text-gray-400'}>Hàng năm <Tag color="green" className="ml-1 border-0">-20%</Tag></Text>
      </div>

      <Row gutter={[24, 24]} className="mb-8" justify="center">
        {PLANS.map(plan => {
          const isCurrent = plan.id === CURRENT_PLAN;
          const price = yearly ? Math.round(plan.price * 0.8) : plan.price;
          return (
            <Col xs={24} md={8} key={plan.id}>
              <div 
                className={`bg-white p-6 h-full flex flex-col relative rounded-xl transition-all ${plan.highlight ? 'ring-2 ring-blue-500' : ''}`}
              >
                {plan.badge && (
                  <Tag color="blue" className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 font-bold">
                    {plan.badge}
                  </Tag>
                )}
                
                <div className="text-center mb-6 mt-2">
                  <Title level={4} style={{ color: plan.color, margin: 0 }}>{plan.name}</Title>
                  <div className="mt-4 mb-2">
                    <span className="text-4xl font-black text-gray-900">{yearly ? `${Math.round(price / 1000000 * 10) / 10}M` : plan.priceLabel}</span>
                    <span className="text-gray-500 font-medium">{plan.period}</span>
                  </div>
                  <Tag color="geekblue" bordered={false} className="font-semibold text-sm px-3 py-1 rounded-full">
                    {plan.credits} tin đăng
                  </Tag>
                </div>

                <div className="flex-1 space-y-3 mb-6">
                  {plan.features.map(f => (
                    <div key={f} className="flex items-start gap-2 text-gray-700">
                      <CheckCircleOutlined className="text-green-500 mt-1" />
                      <span className="text-sm font-medium">{f}</span>
                    </div>
                  ))}
                  {plan.missing.map(f => (
                    <div key={f} className="flex items-start gap-2 text-gray-400">
                      <CloseCircleOutlined className="mt-1" />
                      <span className="text-sm line-through">{f}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  type={plan.highlight ? 'primary' : 'default'}
                  size="large"
                  block
                  disabled={isCurrent}
                  icon={isCurrent ? <CheckOutlined /> : null}
                  className={`font-bold ${isCurrent ? 'bg-gray-100 text-gray-500 border-0' : ''}`}
                >
                  {isCurrent ? 'Đang sử dụng' : 'Nâng cấp ngay'}
                </Button>
              </div>
            </Col>
          );
        })}
      </Row>

      <div className="bg-white rounded-xl p-6">
        <div className="mb-4">
          <span className="font-semibold text-lg text-[#111827]">Lịch sử thanh toán</span>
        </div>
        <Table 
          columns={columns} 
          dataSource={BILLING_HISTORY} 
          rowKey="id"
          pagination={false}
          size="middle"
        />
      </div>
    </EmployerLayout>
  );
}

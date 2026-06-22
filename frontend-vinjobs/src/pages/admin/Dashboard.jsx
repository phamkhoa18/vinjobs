import { useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { Card, Row, Col, Statistic, Table, Tag, Typography, Button } from 'antd';
import { 
  TeamOutlined, 
  ShopOutlined, 
  FileDoneOutlined, 
  FallOutlined, 
  RiseOutlined, 
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  EllipsisOutlined
} from '@ant-design/icons';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Pie, Cell
} from 'recharts';

const { Title, Text } = Typography;

const COLORS = ['#3674c5', '#059669', '#8b5cf6', '#f59e0b', '#ef4444'];
import { adminApi } from '../../lib/api';
import { message, Spin } from 'antd';
import { useEffect } from 'react';

export default function Dashboard() {
  const columns = [
    {
      title: 'Người dùng / Công ty',
      dataIndex: 'user',
      key: 'user',
      render: (text) => <b>{text}</b>,
    },
    {
      title: 'Hành động',
      dataIndex: 'action',
      key: 'action',
    },
    {
      title: 'Thời gian',
      dataIndex: 'time',
      key: 'time',
      render: (text) => <Text type="secondary">{text}</Text>,
    },
    {
      title: 'Trạng thái',
      key: 'status',
      dataIndex: 'status',
      render: (status) => {
        let color = 'green';
        let icon = <CheckCircleOutlined />;
        let label = 'Hoàn tất';
        if (status === 'pending') {
          color = 'warning';
          icon = <ClockCircleOutlined />;
          label = 'Chờ duyệt';
        }
        if (status === 'failed') {
          color = 'error';
          icon = <CloseCircleOutlined />;
          label = 'Thất bại/Cảnh báo';
        }
        return (
          <Tag color={color} icon={icon}>
            {label}
          </Tag>
        );
      },
    },
  ];

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    stats: { totalUsers: 0, totalCompanies: 0, totalJobs: 0 },
    recentActivities: [],
    growthData: [],
    categoryData: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await adminApi.stats();
      setData(res.data);
    } catch (err) {
      message.error('Không thể lấy dữ liệu thống kê');
    } finally {
      setLoading(false);
    }
  };

  const MOCK_STATS = [
    { id: 1, label: 'Tổng Ứng Viên', value: data.stats.totalUsers, increase: 5, icon: <TeamOutlined className="text-blue-500" /> },
    { id: 2, label: 'Nhà Tuyển Dụng', value: data.stats.totalCompanies, increase: 8, icon: <ShopOutlined className="text-emerald-500" /> },
    { id: 3, label: 'Tin Tuyển Dụng', value: data.stats.totalJobs, increase: 12, icon: <FileDoneOutlined className="text-purple-500" /> },
  ];

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleString('vi-VN');
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64"><Spin size="large" /></div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <Title level={3} style={{ margin: 0 }}>Tổng quan hệ thống</Title>
        <Text type="secondary">Báo cáo thống kê dữ liệu và hoạt động gần đây của VinJobs</Text>
      </div>

      {/* THỐNG KÊ NHANH */}
      <Row gutter={[16, 16]} className="mb-6">
        {MOCK_STATS.map((stat) => (
          <Col xs={24} sm={12} lg={8} key={stat.id}>
            <Card bordered={false} className="shadow-sm">
              <Statistic
                title={<span className="font-semibold text-gray-500">{stat.label}</span>}
                value={stat.value}
                prefix={stat.icon}
                suffix={
                  <span className={`text-[12px] ml-2 font-medium ${stat.increase > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {stat.increase > 0 ? <RiseOutlined /> : <FallOutlined />} {Math.abs(stat.increase)}%
                  </span>
                }
                valueStyle={{ fontWeight: 700, marginTop: 8 }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* BIỂU ĐỒ */}
      <Row gutter={[16, 16]} className="mb-6">
        {/* Biểu đồ tăng trưởng */}
        <Col xs={24} lg={16}>
          <Card 
            title="Tăng trưởng Người dùng & Việc làm" 
            bordered={false} 
            className="shadow-sm h-full"
            extra={<Button type="text" icon={<EllipsisOutlined />} />}
          >
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <AreaChart data={data.growthData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3674c5" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3674c5" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorJobs" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <RechartsTooltip />
                  <Legend />
                  <Area type="monotone" dataKey="users" name="Người dùng" stroke="#3674c5" fillOpacity={1} fill="url(#colorUsers)" />
                  <Area type="monotone" dataKey="jobs" name="Việc làm" stroke="#059669" fillOpacity={1} fill="url(#colorJobs)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        {/* Biểu đồ tròn Danh mục */}
        <Col xs={24} lg={8}>
          <Card 
            title="Ngành nghề phổ biến" 
            bordered={false} 
            className="shadow-sm h-full"
            extra={<Button type="text" icon={<EllipsisOutlined />} />}
          >
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={data.categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      {/* HOẠT ĐỘNG GẦN ĐÂY */}
      <Card 
        title="Hoạt động gần đây" 
        bordered={false} 
        className="shadow-sm"
        extra={<Button type="link">Xem tất cả</Button>}
      >
        <Table 
          columns={columns} 
          dataSource={data.recentActivities.map(a => ({ ...a, time: formatDate(a.time) }))} 
          rowKey="id"
          pagination={false}
          size="middle"
        />
      </Card>
    </AdminLayout>
  );
}

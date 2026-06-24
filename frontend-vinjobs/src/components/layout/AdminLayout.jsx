import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown, ConfigProvider, theme, Badge } from 'antd';
import { 
  DashboardOutlined, 
  TeamOutlined, 
  ShopOutlined, 
  FileTextOutlined, 
  DollarOutlined, 
  AppstoreOutlined, 
  SettingOutlined,
  LogoutOutlined,
  UserOutlined,
  BellOutlined,
  GlobalOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ReadOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import { getImageUrl } from '../../lib/api';

const { Header, Sider, Content } = Layout;

const ADMIN_MENUS_BASE = [
  { key: '/admin', icon: <DashboardOutlined />, label: 'Tổng quan' },
  { key: '/admin/users', icon: <TeamOutlined />, label: 'Ứng viên' },
  { key: '/admin/companies', icon: <ShopOutlined />, label: 'Nhà tuyển dụng' },
  { key: '/admin/jobs', icon: <FileTextOutlined />, label: 'Việc làm' },

  { key: '/admin/categories', icon: <AppstoreOutlined />, label: 'Danh mục' },
  { key: '/admin/blogs', icon: <ReadOutlined />, label: 'Cẩm nang / Blog' },
  { key: '/admin/appearance', icon: <GlobalOutlined />, label: 'Giao diện' },
  { key: '/admin/settings', icon: <SettingOutlined />, label: 'Cài đặt' },
];

export default function AdminLayout({ children }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const [collapsed, setCollapsed] = useState(false);
  
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingJobsCount, setPendingJobsCount] = useState(0);

  useEffect(() => {
    fetchAdminData();
    // Simple polling every 2 minutes
    const interval = setInterval(fetchAdminData, 120000);
    return () => clearInterval(interval);
  }, []);

  const fetchAdminData = async () => {
    try {
      const { adminApi } = await import('../../lib/api');
      const [statsRes, notifRes] = await Promise.all([
        adminApi.stats(),
        adminApi.getNotifications()
      ]);
      
      if (statsRes?.data?.stats?.pendingJobs !== undefined) {
        setPendingJobsCount(statsRes.data.stats.pendingJobs);
      }
      
      if (notifRes?.data?.notifications) {
        setNotifications(notifRes.data.notifications);
        setUnreadCount(notifRes.data.notifications.filter(n => !n.is_read).length);
      }
    } catch (error) {
      console.error('Lỗi tải dữ liệu Admin Layout:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const { adminApi } = await import('../../lib/api');
      await adminApi.readAllNotifications();
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Lỗi đánh dấu đã đọc:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const adminMenus = ADMIN_MENUS_BASE.map(menu => {
    if (menu.key === '/admin/jobs' && pendingJobsCount > 0) {
      return {
        ...menu,
        label: (
          <div className="flex justify-between items-center w-full pr-4">
            <span>{menu.label}</span>
            <div className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none min-w-[18px] text-center">
              {pendingJobsCount > 99 ? '99+' : pendingJobsCount}
            </div>
          </div>
        )
      };
    }
    return menu;
  });

  const userMenuItems = [
    {
      key: 'profile',
      label: <span className="font-medium text-[14px]">Hồ sơ cá nhân</span>,
      icon: <UserOutlined />,
      onClick: () => navigate('/admin/profile')
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: <span className="font-medium text-[14px]">Đăng xuất</span>,
      icon: <LogoutOutlined />,
      danger: true,
      onClick: handleLogout
    }
  ];

  const notificationItems = notifications.length > 0 ? notifications.map(n => ({
    key: n._id,
    label: (
      <div 
        className={`w-72 p-2 whitespace-normal border-b border-gray-100 last:border-0 ${!n.is_read ? 'bg-blue-50' : ''}`}
        onClick={() => {
          if (n.type === 'NEW_JOB_PENDING') navigate('/admin/jobs');
        }}
      >
        <div className="font-semibold text-gray-800 text-sm mb-1">{n.title}</div>
        <div className="text-gray-600 text-xs line-clamp-2">{n.message}</div>
      </div>
    )
  })) : [{
    key: 'empty',
    label: <div className="p-4 text-center text-gray-500 w-64">Không có thông báo nào</div>
  }];

  if (notifications.length > 0 && unreadCount > 0) {
    notificationItems.unshift({
      key: 'mark-read',
      label: (
        <div className="text-center text-blue-600 hover:text-blue-700 font-medium py-1 text-sm border-b border-gray-200" onClick={(e) => { e.stopPropagation(); handleMarkAllRead(); }}>
          Đánh dấu tất cả đã đọc
        </div>
      )
    });
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#3674c5',
          fontFamily: '"Inter", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          colorBgLayout: '#f0f2f5',
        },
        components: {
          Typography: {
            fontWeightStrong: 600, // Giới hạn max font-weight
          },
          Layout: {
            headerBg: '#ffffff',
            siderBg: '#001529',
          },
        },
      }}
    >
      <Layout style={{ minHeight: '100vh' }}>
        <Sider 
          collapsible 
          collapsed={collapsed} 
          trigger={null}
          width={240}
          theme="dark"
          style={{ overflow: 'auto', height: '100vh', position: 'fixed', left: 0, top: 0, bottom: 0 }}
        >
          <div className="h-16 flex items-center justify-center border-b border-gray-800">
            <Link to="/" className="flex items-center justify-center w-full px-4 overflow-hidden">
              {collapsed ? (
                <div className="w-8 h-8 bg-white rounded flex items-center justify-center p-1">
                  {settings?.logo ? (
                    <img src={getImageUrl(settings.logo)} alt="Logo" className="w-full h-full object-contain" />
                  ) : (
                    <img src="/vinjobs_logo.png" alt="Logo" className="w-full h-full object-contain" />
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-white rounded-full px-3 py-1.5 w-[80%] justify-center">
                  {settings?.logo ? (
                    <img src={getImageUrl(settings.logo)} alt="VinJobs" className="h-6 w-auto object-contain" />
                  ) : (
                    <img src="/vinjobs_logo.png" alt="VinJobs" className="h-6 w-auto object-contain" />
                  )}
                  <span className="text-[10px] uppercase text-[#3674c5] font-bold border border-[#3674c5] px-1.5 rounded">Admin</span>
                </div>
              )}
            </Link>
          </div>
          
          <Menu 
            theme="dark" 
            mode="inline" 
            selectedKeys={[pathname]} 
            items={adminMenus}
            onClick={({ key }) => navigate(key)}
            style={{ padding: '16px 0' }}
          />
        </Sider>
        
        <Layout style={{ marginLeft: collapsed ? 80 : 240, transition: 'all 0.2s', minHeight: '100vh' }}>
          <Header style={{ 
            position: 'sticky', 
            top: 0, 
            zIndex: 10,
            padding: '0 24px 0 0', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            boxShadow: '0 1px 4px rgba(0,21,41,.08)',
            background: '#ffffff'
          }}>
            <div className="flex items-center">
              <div 
                className="w-16 h-16 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors text-lg text-gray-600 border-r border-gray-100"
                onClick={() => setCollapsed(!collapsed)}
              >
                {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              </div>
              <div className="text-[18px] font-semibold text-gray-800 ml-4 hidden sm:block">
                Hệ thống Quản trị VinJobs
              </div>
            </div>
            
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-4 text-[18px] text-gray-500">
                <GlobalOutlined className="hover:text-[#3674c5] cursor-pointer transition-colors" title="Ngôn ngữ" />
                <Dropdown menu={{ items: notificationItems }} trigger={['click']} placement="bottomRight" arrow>
                  <div className="relative flex items-center justify-center cursor-pointer p-1 hover:text-[#3674c5] transition-colors" title="Thông báo" onClick={() => {
                    if (unreadCount > 0) handleMarkAllRead();
                  }}>
                    <Badge count={unreadCount} size="small">
                      <BellOutlined style={{ fontSize: '18px' }} />
                    </Badge>
                  </div>
                </Dropdown>
              </div>
              
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
                <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded transition-colors">
                  <Avatar src={user?.avatar ? getImageUrl(user.avatar) : null} icon={<UserOutlined />} style={{ backgroundColor: '#3674c5' }}>
                    {!user?.avatar && user?.name?.charAt(0)}
                  </Avatar>
                  <span className="text-[14px] font-medium text-gray-700 hidden sm:block">
                    {user?.name || 'Super Admin'}
                  </span>
                </div>
              </Dropdown>
            </div>
          </Header>
          
          <Content style={{ margin: '24px 24px 0', overflow: 'initial' }}>
            {children}
          </Content>
          
          <div className="text-center text-gray-400 text-[12px] py-4">
            © 2024-2026 VinJobs Platform. All rights reserved.
          </div>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}

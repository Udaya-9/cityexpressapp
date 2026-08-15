import React from 'react';
import { Layout, Menu, Dropdown, Avatar, Space, Typography } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  LockOutlined,
  ProfileOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  HomeOutlined,
  TeamOutlined,
  FileTextOutlined,
  PieChartOutlined,
  DownOutlined,
} from '@ant-design/icons';
import { useState } from 'react';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const Dashboard = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [openKeys, setOpenKeys] = useState([]);

  // Menu items for vertical sidebar
 const sidebarMenuItems = [
  {
    key: 'dashboard',
    icon: <DashboardOutlined />,
    label: 'Dashboard',
  },

  {
    key: 'vendor',
    icon: <HomeOutlined />,
    label: 'Vendor',
  },

  {
    key: 'asset-management',
    icon: <FileTextOutlined />,
    label: 'Asset Management',
    children: [
      {
        key: 'asset-add',
        label: 'Add Assets',
      },
      {
        key: 'asset-register',
        label: 'Asset Register',
      },
      {
        key: 'asset-list',
        label: 'List Asset',
      },
      {
        key: 'asset-deployment',
        label: 'Asset Deployment',
      },
    ],
  },

  {
    key: 'fixed-asset',
    icon: <HomeOutlined />,
    label: 'Fixed Asset',
    children: [
      {
        key: 'fixed-register',
        label: 'Asset Register',
      },
      {
        key: 'execute-depreciation',
        label: 'Execute Report',
      },
      {
        key: 'depreciation-report',
        label: 'Depreciation Report',
      },
    ],
  },

  {
    key: 'operating-asset',
    icon: <TeamOutlined />,
    label: 'Operating Asset',
  },

  {
    key: 'memo',
    icon: <FileTextOutlined />,
    label: 'Memo',
    children: [
      {
        key: 'memo-create',
        label: 'Create New',
      },
      {
        key: 'memo-inbox',
        label: 'Inbox',
      },
      {
        key: 'memo-sent',
        label: 'Sent',
      },
      {
        key: 'purchase-order',
        label: 'Purchase Order',
      },
      {
        key: 'recurring-memo',
        label: 'Recurring Memo',
      },
    ],
  },

  {
    key: 'budget',
    icon: <PieChartOutlined />,
    label: 'Budget',
    children: [
      {
        key: 'budget-heading',
        label: 'Budget Heading',
      },
      {
        key: 'budget-management',
        label: 'Budget Management',
      },
      {
        key: 'budget-approve',
        label: 'Budget Approve',
      },
      {
        key: 'budget-amendment',
        label: 'Budget Amendment',
      },
      {
        key: 'budget-transaction',
        label: 'Transaction',
      },
    ],
  },

  {
    key: 'redispatch',
    icon: <FileTextOutlined />,
    label: 'Re-Dispatch',
    children: [
      {
        key: 'redispatch-stock',
        label: 'Re-Dispatch Stock',
      },
      {
        key: 'redispatch-report',
        label: 'Re-Dispatch Report',
      },
    ],
  },

  {
    key: 'report',
    icon: <PieChartOutlined />,
    label: 'Report',
    children: [
      {
        key: 'daily-stock',
        label: 'Daily Stock',
      },
      {
        key: 'outward-item',
        label: 'Outward Item',
      },
      {
        key: 'outward-department',
        label: 'Outward Department',
      },
      {
        key: 'purchase-vendor',
        label: 'Purchase Vendor',
      },
      {
        key: 'purchase-product',
        label: 'Purchase Product',
      },
      {
        key: 'stock-value',
        label: 'Stock Report with Value',
      },
      {
        key: 'stock-ledger',
        label: 'Stock Ledger',
      },
    ],
  },

  {
    key: 'transaction-report',
    icon: <FileTextOutlined />,
    label: 'Transaction Rpt',
    children: [
      {
        key: 'transaction-report-main',
        label: 'Transaction Report',
      },
      {
        key: 'redispatch-report-user',
        label: 'Redispatch Report',
      },
      {
        key: 'stakeholder-report',
        label: 'Stake Holder Report',
      },
    ],
  },

  {
    key: 'requisition',
    icon: <FileTextOutlined />,
    label: 'Requisition',
    children: [
      {
        key: 'list-requisition',
        label: 'List Requisition',
      },
      {
        key: 'verify-requisition',
        label: 'Verify Requisition',
      },
      {
        key: 'dispatch-requisition',
        label: 'Dispatch Requisition',
      },
      {
        key: 'delete-requisition',
        label: 'Delete Requisition',
      },
      {
        key: 'pending-requisition',
        label: 'Pending Requisition',
      },
    ],
  },

  {
    key: 'correspondence',
    icon: <FileTextOutlined />,
    label: 'Correspondence',
    children: [
      {
        key: 'incoming',
        label: 'Incoming',
      },
      {
        key: 'outgoing',
        label: 'Outgoing',
      },
    ],
  },

  {
    key: 'settings',
    icon: <SettingOutlined />,
    label: 'Settings',
    children: [
      {
        key: 'users',
        label: 'Users',
      },
      {
        key: 'user-request',
        label: 'User Request',
      },
      {
        key: 'parameter-settings',
        label: 'Parameter Settings',
      },
    ],
  },
];

  // Dropdown menu items for user profile
  const userMenuItems = [
    {
      key: '1',
      icon: <ProfileOutlined />,
      label: 'My Profile',
    },
    {
      key: '2',
      icon: <LockOutlined />,
      label: 'Change Password',
    },
    {
      key: '3',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
    },
  ];

  const handleUserMenuClick = ({ key }) => {
    console.log('User menu clicked:', key);
    // Handle navigation based on key
    switch(key) {
      case '1':
        // Navigate to profile
        break;
      case '2':
        // Navigate to change password
        break;
      case '3':
        // Handle logout
        break;
      default:
        break;
    }
  };

  const handleSidebarClick = ({ key }) => {
    console.log('Sidebar menu clicked:', key);
  };

  // Handle open/close of submenus - only one open at a time
  const onOpenChange = (keys) => {
    // Get the latest opened key (if any)
    const latestOpenKey = keys.find(key => !openKeys.includes(key));
    
    if (latestOpenKey) {
      // If a new key is opened, close all others and open only this one
      setOpenKeys([latestOpenKey]);
    } else {
      // If all keys are being closed, just update the state
      setOpenKeys(keys);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed || !isHovered}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          background: '#01519b',
          boxShadow: '2px 0 8px rgba(0, 0, 0, 0.15)',
          transition: 'all 0.3s ease',
        }}
        width={240}
        collapsedWidth={80}
      >
        {/* Logo/Brand */}
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 16px',
            background: 'rgba(0, 0, 0, 0.1)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          {(!collapsed && isHovered) ? (
            <Text
              style={{
                color: '#ffffff',
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: '0.5px',
              }}
            >
              City Express
            </Text>
          ) : (
            <Text
              style={{
                color: '#ffffff',
                fontSize: 24,
                fontWeight: 700,
              }}
            >
              CE
            </Text>
          )}
        </div>

        {/* Sidebar Menu */}
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['dashboard']}
          openKeys={openKeys}
          onOpenChange={onOpenChange}
          onClick={handleSidebarClick}
          items={sidebarMenuItems}
          style={{
            background: 'transparent',
            borderRight: 'none',
            marginTop: 8,
          }}
        />
      </Sider>

      {/* Main Layout */}
      <Layout>
        {/* Horizontal Header */}
        <Header
          style={{
            background: '#e71d29',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {/* Fiscal Year Display */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                padding: '6px 16px',
                borderRadius: '4px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <Text style={{ color: '#ffffff', fontSize: 13, fontWeight: 400 }}>
                FY 2024-25
              </Text>
            </div>

            {/* User Dropdown */}
            <Dropdown
              menu={{
                items: userMenuItems,
                onClick: handleUserMenuClick,
              }}
              placement="bottomRight"
              arrow
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  padding: '4px 12px 4px 4px',
                  borderRadius: '20px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                }}
              >
                <Avatar
                  style={{
                    background: '#1890ff',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                  }}
                  icon={<UserOutlined />}
                />
                <Space>
                  <Text style={{ color: '#ffffff', fontWeight: 500 }}>
                    John Doe
                  </Text>
                  <DownOutlined style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 12 }} />
                </Space>
              </div>
            </Dropdown>
          </div>
        </Header>

        {/* Content Area */}
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: '#ffffff',
            borderRadius: 8,
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default Dashboard;
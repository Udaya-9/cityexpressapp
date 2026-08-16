import React, { useState } from 'react';
import {
  Layout,
  Menu,
  Dropdown,
  Avatar,
  Space,
  Typography,
} from 'antd';

import { useNavigate } from 'react-router-dom';

import {
  DashboardOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  LockOutlined,
  ProfileOutlined,
  HomeOutlined,
  FileTextOutlined,
  PieChartOutlined,
  DownOutlined,
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const Dashboard = ({ children }) => {
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [openKeys, setOpenKeys] = useState([]);

  // =========================================================
  // SIDEBAR MENU
  // =========================================================

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
          label: 'Fixed Asset Register',
        },
        {
          key: 'asset-deployment',
          label: 'Asset Dispatch',
        },
      ],
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
        {
          key: 'execute-depreciation',
          label: 'Execute Report',
        },
        {
          key: 'depreciation-report',
          label: 'Depreciation Report',
        },
        {
          key: 'redispatch-report',
          label: 'Re-Dispatch Report',
        },
        {
          key: 'transaction-report-main',
          label: 'Transaction Report',
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
        {
          key: 'redispatch-stock',
          label: 'Re-Dispatch Stock',
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

    // =========================================================
    // SETTINGS
    // =========================================================

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
          key: 'parameter-settings',
          label: 'Parameter Settings',
        },
      ],
    },
  ];

  // =========================================================
  // TOP RIGHT USER MENU
  // =========================================================

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

  // =========================================================
  // SIDEBAR CLICK
  // =========================================================

  const handleSidebarClick = ({ key }) => {
    console.log('Sidebar menu clicked:', key);

    switch (key) {
      case 'dashboard':
        navigate('/dashboard');
        break;

      case 'vendor':
        navigate('/vendor');
        break;

      // Asset Management
      case 'asset-add':
         navigate('/asset');
        break;

      case 'asset-register':
        navigate('/asset-management/register');
        break;

      case 'asset-deployment':
        navigate('/asset-management/deployment');
        break;

      // Memo
      case 'memo-create':
        navigate('/memo/create');
        break;

      case 'memo-inbox':
        navigate('/memo/inbox');
        break;

      case 'memo-sent':
        navigate('/memo/sent');
        break;

      case 'purchase-order':
        navigate('/memo/purchase-order');
        break;

      case 'recurring-memo':
        navigate('/memo/recurring');
        break;

      // Budget
      case 'budget-heading':
        navigate('/budget/heading');
        break;

      case 'budget-management':
        navigate('/budget/management');
        break;

      case 'budget-approve':
        navigate('/budget/approve');
        break;

      case 'budget-amendment':
        navigate('/budget/amendment');
        break;

      case 'budget-transaction':
        navigate('/budget/transaction');
        break;

      // Reports
      case 'daily-stock':
        navigate('/report/daily-stock');
        break;

      case 'outward-item':
        navigate('/report/outward-item');
        break;

      case 'outward-department':
        navigate('/report/outward-department');
        break;

      case 'purchase-vendor':
        navigate('/report/purchase-vendor');
        break;

      case 'purchase-product':
        navigate('/report/purchase-product');
        break;

      case 'stock-value':
        navigate('/report/stock-value');
        break;

      case 'stock-ledger':
        navigate('/report/stock-ledger');
        break;

      case 'execute-depreciation':
        navigate('/report/execute-depreciation');
        break;

      case 'depreciation-report':
        navigate('/report/depreciation');
        break;

      case 'redispatch-report':
        navigate('/report/redispatch');
        break;

      case 'transaction-report-main':
        navigate('/report/transaction');
        break;

      case 'stakeholder-report':
        navigate('/report/stakeholder');
        break;

      // Requisition
      case 'list-requisition':
        navigate('/requisition/list');
        break;

      case 'verify-requisition':
        navigate('/requisition/verify');
        break;

      case 'dispatch-requisition':
        navigate('/requisition/dispatch');
        break;

      case 'delete-requisition':
        navigate('/requisition/delete');
        break;

      case 'pending-requisition':
        navigate('/requisition/pending');
        break;

      case 'redispatch-stock':
        navigate('/requisition/redispatch');
        break;

      // Correspondence
      case 'incoming':
        navigate('/correspondence/incoming');
        break;

      case 'outgoing':
        navigate('/correspondence/outgoing');
        break;

      // Settings
      case 'users':
        navigate('/User');
        break;

      case 'parameter-settings':
        navigate('/parameter-settings');
        break;

      default:
        break;
    }
  };

  // =========================================================
  // TOP RIGHT USER MENU CLICK
  // =========================================================

  const handleUserMenuClick = ({ key }) => {
    console.log('User menu clicked:', key);

    switch (key) {
      case '1':
        navigate('/profile');
        break;

      case '2':
        navigate('/change-password');
        break;

      case '3':
        console.log('Logout clicked');

        // Add logout logic here
        // localStorage.removeItem('token');

        navigate('/');
        break;

      default:
        break;
    }
  };

  // =========================================================
  // SUBMENU OPEN / CLOSE
  // =========================================================

  const onOpenChange = (keys) => {
    const latestOpenKey = keys.find(
      (key) => !openKeys.includes(key)
    );

    if (latestOpenKey) {
      setOpenKeys([latestOpenKey]);
    } else {
      setOpenKeys(keys);
    }
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <Layout style={{ minHeight: '100vh' }}>

      {/* =====================================================
          LEFT SIDEBAR
      ====================================================== */}

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

        {/* Logo / Brand */}

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

          {!collapsed && isHovered ? (
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

      {/* =====================================================
          MAIN LAYOUT
      ====================================================== */}

      <Layout>

        {/* ===================================================
            TOP HEADER
        ==================================================== */}

        <Header
          style={{
            background: '#03044b',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          }}
        >

          {/* Left Header */}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}
          >
          </div>

          {/* Right Header */}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 20,
            }}
          >

            {/* Fiscal Year */}

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                padding: '6px 16px',
                borderRadius: '4px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <Text
                style={{
                  color: '#ffffff',
                  fontSize: 13,
                  fontWeight: 400,
                }}
              >
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
                  e.currentTarget.style.background =
                    'rgba(255, 255, 255, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    'rgba(255, 255, 255, 0.1)';
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

                  <Text
                    style={{
                      color: '#ffffff',
                      fontWeight: 500,
                    }}
                  >
                    John Doe
                  </Text>

                  <DownOutlined
                    style={{
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontSize: 12,
                    }}
                  />

                </Space>

              </div>

            </Dropdown>

          </div>

        </Header>

        {/* ===================================================
            CONTENT
        ==================================================== */}

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
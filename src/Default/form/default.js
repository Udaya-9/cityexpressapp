import React, { useState } from 'react';
import {
  Layout,
  Menu,
  Dropdown,
  Avatar,
  Space,
  Typography,
  Badge,
  Tooltip,
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
  BellOutlined,
  SearchOutlined,
  CalendarOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const Dashboard = ({ children }) => {
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [openKeys, setOpenKeys] = useState([]);

  // =========================================================
  // SIDEBAR MENU (unchanged)
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
        { key: 'asset-add', label: 'Add Assets' },
        { key: 'asset-register', label: 'Fixed Asset Register' },
        { key: 'asset-deployment', label: 'Asset Dispatch' },
      ],
    },
    {
      key: 'memo',
      icon: <FileTextOutlined />,
      label: 'Memo',
      children: [
        { key: 'memo-create', label: 'Create New' },
        { key: 'memo-inbox', label: 'Inbox' },
        { key: 'memo-sent', label: 'Sent' },
        { key: 'purchase-order', label: 'Purchase Order' },
        { key: 'recurring-memo', label: 'Recurring Memo' },
      ],
    },
    {
      key: 'budget',
      icon: <PieChartOutlined />,
      label: 'Budget',
      children: [
        { key: 'budget-heading', label: 'Budget Heading' },
        { key: 'budget-management', label: 'Budget Management' },
        { key: 'budget-approve', label: 'Budget Approve' },
        { key: 'budget-amendment', label: 'Budget Amendment' },
        { key: 'budget-transaction', label: 'Transaction' },
      ],
    },
    {
      key: 'report',
      icon: <PieChartOutlined />,
      label: 'Report',
      children: [
        { key: 'daily-stock', label: 'Daily Stock' },
        { key: 'outward-item', label: 'Outward Item' },
        { key: 'outward-department', label: 'Outward Department' },
        { key: 'purchase-vendor', label: 'Purchase Vendor' },
        { key: 'purchase-product', label: 'Purchase Product' },
        { key: 'stock-value', label: 'Stock Report with Value' },
        { key: 'stock-ledger', label: 'Stock Ledger' },
        { key: 'execute-depreciation', label: 'Execute Report' },
        { key: 'depreciation-report', label: 'Depreciation Report' },
        { key: 'redispatch-report', label: 'Re-Dispatch Report' },
        { key: 'transaction-report-main', label: 'Transaction Report' },
        { key: 'stakeholder-report', label: 'Stake Holder Report' },
      ],
    },
    {
      key: 'requisition',
      icon: <FileTextOutlined />,
      label: 'Requisition',
      children: [
        { key: 'list-requisition', label: 'List Requisition' },
        { key: 'verify-requisition', label: 'Verify Requisition' },
        { key: 'dispatch-requisition', label: 'Dispatch Requisition' },
        { key: 'delete-requisition', label: 'Delete Requisition' },
        { key: 'pending-requisition', label: 'Pending Requisition' },
        { key: 'redispatch-stock', label: 'Re-Dispatch Stock' },
      ],
    },
    {
      key: 'correspondence',
      icon: <FileTextOutlined />,
      label: 'Correspondence',
      children: [
        { key: 'incoming', label: 'Incoming' },
        { key: 'outgoing', label: 'Outgoing' },
      ],
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      children: [
        { key: 'users', label: 'Users' },
        { key: 'parameter-settings', label: 'Parameter Settings' },
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
    { type: 'divider' },
    {
      key: '3',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
    },
  ];

  // =========================================================
  // SIDEBAR CLICK (unchanged)
  // =========================================================

  const handleSidebarClick = ({ key }) => {
    switch (key) {
      case 'dashboard': navigate('/dashboard'); break;
      case 'vendor': navigate('/vendor'); break;
      case 'asset-add': navigate('/asset'); break;
      case 'asset-register': navigate('/asset-management/register'); break;
      case 'asset-deployment': navigate('/asset-management/deployment'); break;
      case 'memo-create': navigate('/memo/create'); break;
      case 'memo-inbox': navigate('/memo/inbox'); break;
      case 'memo-sent': navigate('/memo/sent'); break;
      case 'purchase-order': navigate('/memo/purchase-order'); break;
      case 'recurring-memo': navigate('/memo/recurring'); break;
      case 'budget-heading': navigate('/budget/heading'); break;
      case 'budget-management': navigate('/budget/management'); break;
      case 'budget-approve': navigate('/budget/approve'); break;
      case 'budget-amendment': navigate('/budget/amendment'); break;
      case 'budget-transaction': navigate('/budget/transaction'); break;
      case 'daily-stock': navigate('/report/daily-stock'); break;
      case 'outward-item': navigate('/report/outward-item'); break;
      case 'outward-department': navigate('/report/outward-department'); break;
      case 'purchase-vendor': navigate('/report/purchase-vendor'); break;
      case 'purchase-product': navigate('/report/purchase-product'); break;
      case 'stock-value': navigate('/report/stock-value'); break;
      case 'stock-ledger': navigate('/report/stock-ledger'); break;
      case 'execute-depreciation': navigate('/report/execute-depreciation'); break;
      case 'depreciation-report': navigate('/report/depreciation'); break;
      case 'redispatch-report': navigate('/report/redispatch'); break;
      case 'transaction-report-main': navigate('/report/transaction'); break;
      case 'stakeholder-report': navigate('/report/stakeholder'); break;
      case 'list-requisition': navigate('/requisition/list'); break;
      case 'verify-requisition': navigate('/requisition/verify'); break;
      case 'dispatch-requisition': navigate('/requisition/dispatch'); break;
      case 'delete-requisition': navigate('/requisition/delete'); break;
      case 'pending-requisition': navigate('/requisition/pending'); break;
      case 'redispatch-stock': navigate('/requisition/redispatch'); break;
      case 'incoming': navigate('/correspondence/incoming'); break;
      case 'outgoing': navigate('/correspondence/outgoing'); break;
      case 'users': navigate('/User'); break;
      case 'parameter-settings': navigate('/parameter-settings'); break;
      default: break;
    }
  };

  // =========================================================
  // USER MENU CLICK
  // =========================================================

  const handleUserMenuClick = ({ key }) => {
    switch (key) {
      case '1': navigate('/profile'); break;
      case '2': navigate('/change-password'); break;
      case '3':
        // localStorage.removeItem('token');
        navigate('/');
        break;
      default: break;
    }
  };

  // =========================================================
  // SUBMENU OPEN / CLOSE
  // =========================================================

  const onOpenChange = (keys) => {
    const latestOpenKey = keys.find((key) => !openKeys.includes(key));
    if (latestOpenKey) {
      setOpenKeys([latestOpenKey]);
    } else {
      setOpenKeys(keys);
    }
  };

  const isExpanded = !collapsed || isHovered;

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <Layout style={{ minHeight: '100vh', background: '#f4f7fc' }}>

      {/* =====================================================
          LEFT SIDEBAR — BEAUTIFUL GRADIENT
      ====================================================== */}

      <Sider
        trigger={null}
        collapsible
        collapsed={!isExpanded}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          background: 'linear-gradient(180deg, #01519b 0%, #013b73 100%)',
          boxShadow: '4px 0 24px rgba(1, 40, 90, 0.25)',
          transition: 'all 0.25s cubic-bezier(0.2, 0, 0, 1)',
          position: 'relative',
          zIndex: 100,
          borderRight: '1px solid rgba(255, 255, 255, 0.06)',
        }}
        width={260}
        collapsedWidth={80}
      >
        {/* ============ BRAND / LOGO ============ */}
        <div
          style={{
            height: 72,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 16px',
            background: 'rgba(0, 0, 0, 0.15)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
          }}
        >
          {isExpanded ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #4da3ff, #1a6fc9)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: 18,
                  color: '#fff',
                  boxShadow: '0 6px 14px rgba(77, 163, 255, 0.35)',
                }}
              >
                CE
              </div>
              <Text
                style={{
                  color: '#ffffff',
                  fontSize: 19,
                  fontWeight: 700,
                  letterSpacing: '0.4px',
                  textShadow: '0 2px 8px rgba(0,0,0,0.2)',
                }}
              >
                City Express
              </Text>
            </div>
          ) : (
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #4da3ff, #1a6fc9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: 20,
                color: '#fff',
                boxShadow: '0 6px 14px rgba(77, 163, 255, 0.4)',
              }}
            >
              CE
            </div>
          )}
        </div>

        {/* ============ SIDEBAR MENU ============ */}
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['dashboard']}
          openKeys={isExpanded ? openKeys : []}
          onOpenChange={onOpenChange}
          onClick={handleSidebarClick}
          items={sidebarMenuItems}
          style={{
            background: 'transparent',
            borderRight: 'none',
            marginTop: 12,
            padding: '0 8px',
            fontSize: 14,
            fontWeight: 500,
          }}
          // Custom beautiful menu styling
          className="beautiful-menu"
        />       
      </Sider>     
      <Layout style={{ background: '#f4f7fc' }}>
        <Header
          style={{
            background: 'linear-gradient(90deg, #03044b 0%, #0a1a5c 100%)',
            padding: '0 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 6px 24px rgba(3, 4, 75, 0.25)',
            height: 72,
            position: 'sticky',
            top: 0,
            zIndex: 90,
          }}
        >
          {/* ============ LEFT HEADER ============ */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <Tooltip title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
              <div
                onClick={() => setCollapsed(!collapsed)}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  cursor: 'pointer',
                  color: '#fff',
                  fontSize: 18,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    'rgba(255, 255, 255, 0.18)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    'rgba(255, 255, 255, 0.08)';
                }}
              >
                {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              </div>
            </Tooltip>

            {/* Search Bar — beautiful pill */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 12,
                padding: '8px 16px',
                width: 280,
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background =
                  'rgba(255, 255, 255, 0.12)';
                e.currentTarget.style.borderColor =
                  'rgba(255, 255, 255, 0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background =
                  'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.borderColor =
                  'rgba(255, 255, 255, 0.1)';
              }}
            >
              <SearchOutlined
                style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15 }}
              />
              <input
                placeholder="Search assets, memos, vendors..."
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#fff',
                  fontSize: 13.5,
                  width: '100%',
                  fontFamily: 'inherit',
                }}
              />
            </div>
          </div>

          {/* ============ RIGHT HEADER ============ */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>

            {/* Fiscal Year Badge */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                padding: '7px 16px',
                borderRadius: 40,
                border: '1px solid rgba(255, 255, 255, 0.12)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                backdropFilter: 'blur(10px)',
              }}
            >
              <CalendarOutlined
                style={{ color: '#7ab7ff', fontSize: 13 }}
              />
              <Text
                style={{
                  color: '#ffffff',
                  fontSize: 12.5,
                  fontWeight: 500,
                  letterSpacing: '0.3px',
                }}
              >
                FY 2024-25
              </Text>
            </div>

            {/* Notification Bell */}
            <Badge count={3} size="small" offset={[-2, 2]}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  cursor: 'pointer',
                  color: '#fff',
                  fontSize: 16,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    'rgba(255, 255, 255, 0.18)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    'rgba(255, 255, 255, 0.08)';
                }}
              >
                <BellOutlined />
              </div>
            </Badge>

            {/* User Dropdown */}
            <Dropdown
              menu={{
                items: userMenuItems,
                onClick: handleUserMenuClick,
                style: {
                  borderRadius: 12,
                  padding: 6,
                  minWidth: 200,
                  boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
                },
              }}
              placement="bottomRight"
              arrow
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  cursor: 'pointer',
                  padding: '5px 14px 5px 5px',
                  borderRadius: 40,
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    'rgba(255, 255, 255, 0.18)';
                  e.currentTarget.style.borderColor =
                    'rgba(255, 255, 255, 0.25)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.borderColor =
                    'rgba(255, 255, 255, 0.12)';
                }}
              >
                <Avatar
                  size={34}
                  style={{
                    background:
                      'linear-gradient(135deg, #4da3ff, #1a6fc9)',
                    border: '2px solid rgba(255, 255, 255, 0.35)',
                    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.25)',
                  }}
                  icon={<UserOutlined />}
                />

                <Space size={6}>
                  <Text
                    style={{
                      color: '#ffffff',
                      fontWeight: 600,
                      fontSize: 13.5,
                      letterSpacing: '0.2px',
                    }}
                  >
                    John Doe
                  </Text>
                  <DownOutlined
                    style={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontSize: 10,
                    }}
                  />
                </Space>
              </div>
            </Dropdown>
          </div>
        </Header>

        {/* ===================================================
            CONTENT — SOFT CARD
        ==================================================== */}

        <Content
          style={{
            margin: '28px',
            padding: 32,
            minHeight: 280,
            background: '#ffffff',
            borderRadius: 24,
            boxShadow:
              '0 20px 40px -16px rgba(1, 40, 90, 0.12), 0 2px 8px rgba(0, 0, 0, 0.02)',
            border: '1px solid #eef2f8',
            overflow: 'auto',
          }}
        >
          {children}
        </Content>

      </Layout>

      {/* =====================================================
          GLOBAL CSS (for AntD Menu overrides)
      ====================================================== */}
      <style>{`
        /* Beautiful Ant Menu overrides */
        .beautiful-menu .ant-menu-item,
        .beautiful-menu .ant-menu-submenu-title {
          border-radius: 12px !important;
          margin: 4px 0 !important;
          height: 46px !important;
          line-height: 46px !important;
          color: rgba(255, 255, 255, 0.82) !important;
          font-weight: 500 !important;
          transition: all 0.2s ease !important;
        }

        .beautiful-menu .ant-menu-item:hover,
        .beautiful-menu .ant-menu-submenu-title:hover {
          background: rgba(255, 255, 255, 0.1) !important;
          color: #ffffff !important;
        }

        .beautiful-menu .ant-menu-item-selected {
          background: linear-gradient(
            90deg,
            rgba(122, 183, 255, 0.28),
            rgba(77, 163, 255, 0.12)
          ) !important;
          color: #ffffff !important;
          font-weight: 600 !important;
          box-shadow: inset 0 0 0 1px rgba(122, 183, 255, 0.35),
            0 4px 14px rgba(0, 60, 130, 0.35) !important;
        }

        .beautiful-menu .ant-menu-item-selected::before {
          content: '';
          position: absolute;
          left: 0;
          top: 12px;
          bottom: 12px;
          width: 3px;
          background: #7ab7ff;
          border-radius: 0 4px 4px 0;
          box-shadow: 0 0 12px #7ab7ff;
        }

        .beautiful-menu .ant-menu-sub {
          background: rgba(0, 0, 0, 0.15) !important;
          border-radius: 12px !important;
          padding: 4px 0 !important;
          margin: 2px 0 !important;
        }

        .beautiful-menu .ant-menu-sub .ant-menu-item {
          height: 40px !important;
          line-height: 40px !important;
          font-size: 13.5px !important;
          border-radius: 8px !important;
          margin: 2px 8px !important;
          padding-left: 44px !important;
        }

        .beautiful-menu .ant-menu-item .anticon,
        .beautiful-menu .ant-menu-submenu-title .anticon {
          font-size: 16px !important;
          transition: transform 0.2s ease !important;
        }

        .beautiful-menu .ant-menu-item:hover .anticon,
        .beautiful-menu .ant-menu-submenu-title:hover .anticon {
          transform: scale(1.12);
        }

        /* Smooth ant dropdown */
        .ant-dropdown-menu {
          border-radius: 14px !important;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.14) !important;
          padding: 8px !important;
          border: 1px solid #eef2f8 !important;
        }

        .ant-dropdown-menu-item {
          border-radius: 10px !important;
          padding: 10px 14px !important;
          font-weight: 500 !important;
          font-size: 13.5px !important;
        }

        .ant-dropdown-menu-item:hover {
          background: #f0f5fe !important;
        }

        /* Scrollbar beauty */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: #d4dfee;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #b0c4dc;
        }
      `}</style>

    </Layout>
  );
};

export default Dashboard;
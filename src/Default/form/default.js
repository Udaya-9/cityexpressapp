import React, { useEffect, useMemo, useState } from 'react';
import { Layout, Menu, Dropdown, Avatar, Typography, Tooltip, ConfigProvider } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  LockOutlined,
  ProfileOutlined,
  ShopOutlined,
  InboxOutlined,
  FileTextOutlined,
  PieChartOutlined,
  BarChartOutlined,
  SolutionOutlined,
  MailOutlined,
  DownOutlined,
  CalendarOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';

import api, { getFiscalYearsApi } from '../../API/api';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

/* ---------- palette ---------- */
const C = {
  sideTop: '#01519b',
  sideBottom: '#013b73',
  headerLeft: '#03044b',
  headerRight: '#0a1a5c',
  accent: '#4da3ff',
  accentDeep: '#1a6fc9',
  accentSoft: '#7ab7ff',
  page: '#f4f7fc',
};

/* ---------- layout sizes ---------- */
const HEADER_H = 44;
const BRAND_H = 44;
const SIDER_W = 220;
const SIDER_COLLAPSED_W = 60;

/* ---------- fallback constants ---------- */
const FALLBACK_ORG = '';
const FALLBACK_USER = '';
const FALLBACK_FY = '';

/* ---------- jwt helper ---------- */
const decodeJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
};

/* ---------- menu structure builder ---------- */
const buildSidebarMenu = ({ showVendor, dynamicReports = [] }) => [
  {
    type: 'group',
    label: 'Overview',
    children: [
      { key: 'dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
      ...(showVendor
        ? [{ key: 'vendor', icon: <ShopOutlined />, label: 'Vendor' }]
        : []),
    ],
  },
  {
    type: 'group',
    label: 'Operations',
    children: [
      {
        key: 'asset-management',
        icon: <InboxOutlined />,
        label: 'Asset Management',
        children: [
          { key: 'asset-add', label: 'Add Assets' },
          { key: 'asset-register', label: 'Fixed Asset Register' },
          { key: 'asset-deployment', label: 'Asset Dispatch' },
        ],
      },
      {
        key: 'requisition',
        icon: <SolutionOutlined />,
        label: 'Requisition',
        children: [
          { key: 'list-requisition', label: 'List Requisition' },
          { key: 'verify-requisition', label: 'Verify Requisition' },
          { key: 'dispatch-requisition', label: 'Dispatch Requisition' },
          { key: 'pending-requisition', label: 'Pending Requisition' },
          { key: 'redispatch-stock', label: 'Re-Dispatch Stock' },
          { key: 'delete-requisition', label: 'Delete Requisition' },
        ],
      },
      {
        key: 'memo',
        icon: <FileTextOutlined />,
        label: 'Memo',
        children: [
          { key: 'memo-dashboard', label: 'Memo Dashboard' },
          { key: 'memo-create', label: 'Create New' },
          { key: 'memo-inbox', label: 'Inbox' },
          { key: 'memo-sent', label: 'Sent' },
          { key: 'purchase-order', label: 'Purchase Order' },
          { key: 'recurring-memo', label: 'Recurring Memo' },
        ],
      },
      {
        key: 'correspondence',
        icon: <MailOutlined />,
        label: 'Correspondence',
        children: [
          { key: 'incoming', label: 'Incoming' },
          { key: 'outgoing', label: 'Outgoing' },
        ],
      },
    ],
  },
  {
    type: 'group',
    label: 'Finance & reports',
    children: [
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
        icon: <BarChartOutlined />,
        label: 'Report',
        children: [
          { key: 'report-wizard', label: 'Report Wizard' },
          ...(dynamicReports && dynamicReports.length > 0
            ? dynamicReports.map((r) => ({
                key: `report-item-${r.ReportConfigId}`,
                label: r.ReportName,
              }))
            : []),
        ],
      },
    ],
  },
  {
    type: 'group',
    label: 'Administration',
    children: [
      {
        key: 'settings',
        icon: <SettingOutlined />,
        label: 'Settings',
        children: [
          { key: 'users', label: 'Users' },
          { key: 'parameter-settings', label: 'Parameter Settings' },
        ],
      },
    ],
  },
];

const ROUTES = {
  dashboard: '/dashboard',
  vendor: '/vendor',
  'asset-add': '/asset',
  'asset-register': '/asset-management/register',
  'asset-deployment': '/asset-management/deployment',
  'memo-dashboard': '/memo',
  'memo-create': '/memo/create',
  'memo-inbox': '/memo/inbox',
  'memo-sent': '/memo/sent',
  'purchase-order': '/memo/purchase-order',
  'recurring-memo': '/memo/recurring',
  'budget-heading': '/budget/heading',
  'budget-management': '/budget/management',
  'budget-approve': '/budget/approve',
  'budget-amendment': '/budget/amendment',
  'budget-transaction': '/budget/transaction',
  'report-wizard': '/report',
  'daily-stock': '/report/daily-stock',
  'outward-item': '/report/outward-item',
  'outward-department': '/report/outward-department',
  'purchase-vendor': '/report/purchase-vendor',
  'purchase-product': '/report/purchase-product',
  'stock-value': '/report/stock-value',
  'stock-ledger': '/report/stock-ledger',
  'execute-depreciation': '/report/execute-depreciation',
  'depreciation-report': '/report/depreciation',
  'redispatch-report': '/report/redispatch',
  'transaction-report-main': '/report/transaction',
  'stakeholder-report': '/report/stakeholder',
  'list-requisition': '/requisition/list',
  'verify-requisition': '/requisition/verify',
  'dispatch-requisition': '/requisition/dispatch',
  'delete-requisition': '/requisition/delete',
  'pending-requisition': '/requisition/pending',
  'redispatch-stock': '/requisition/redispatch',
  incoming: '/correspondence/incoming',
  outgoing: '/correspondence/outgoing',
  users: '/User',
  'parameter-settings': '/parameter-settings',
};

const userMenuItems = [
  { key: '1', icon: <ProfileOutlined />, label: 'My Profile' },
  { key: '2', icon: <LockOutlined />, label: 'Change Password' },
  { type: 'divider' },
  { key: '3', icon: <LogoutOutlined />, label: 'Logout', danger: true },
];

const Dashboard = ({ children }) => {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [openKeys, setOpenKeys] = useState([]);

  const [org, setOrg] = useState(FALLBACK_ORG);
  const [fullName, setFullName] = useState(FALLBACK_USER);
  const [showVendor, setShowVendor] = useState(false);
  const [fiscalYear, setFiscalYear] = useState(FALLBACK_FY);
  const [dynamicReports, setDynamicReports] = useState([]);

  useEffect(() => {
    let alive = true;

    const loadPermission = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/', { replace: true });
        return;
      }

      const payload = decodeJwt(token);

      if (!payload || (payload.exp && Date.now() / 1000 >= payload.exp)) {
        localStorage.removeItem('token');
        navigate('/', { replace: true });
        return;
      }

      if (payload.organizationId) {
        localStorage.setItem('organizationId', payload.organizationId);
      }

      if (alive && payload.fullname) setFullName(payload.fullname);

      const fyList = await getFiscalYearsApi();
      if (alive && fyList.length) setFiscalYear(fyList[0].FiscalYear);

      // Fetch dynamic reports from ReportConfig
      try {
        const { data: repRes } = await api.post('/report/list', {});
        if (alive && repRes?.success && Array.isArray(repRes.data)) {
          setDynamicReports(repRes.data);
        }
      } catch (e) {
        // quiet fallback
      }

      const sysUserId = payload.id;
      if (!sysUserId) return;

      try {
        const { data: json } = await api.post('/permission/getpermission', {
          sys_user_id: sysUserId,
        });

        if (
          !alive ||
          !json?.success ||
          !Array.isArray(json.data) ||
          !json.data[0]
        ) {
          return;
        }

        const d = json.data[0];

        if (d.organizationId) localStorage.setItem('organizationId', d.organizationId);
        if (d.organizationname) setOrg(d.organizationname);
        if (d.FullName) setFullName(d.FullName);
        setShowVendor(Number(d.vendor_menu) === 1);

      } catch (err) {
        // handled globally
      }
    };

    loadPermission();
    return () => {
      alive = false;
    };
  }, [navigate]);

  const sidebarMenuItems = useMemo(
    () => buildSidebarMenu({ showVendor, dynamicReports }),
    [showVendor, dynamicReports]
  );

  const { PARENT_OF, LABEL_OF } = useMemo(() => {
    const parentOf = {};
    const labelOf = {};
    const walk = (items, parent) =>
      items.forEach((it) => {
        if (it.key) {
          labelOf[it.key] = it.label;
          if (parent) parentOf[it.key] = parent;
        }
        if (it.children) walk(it.children, it.type === 'group' ? parent : it.key);
      });
    walk(sidebarMenuItems);
    return { PARENT_OF: parentOf, LABEL_OF: labelOf };
  }, [sidebarMenuItems]);

  const isExpanded = !collapsed || isHovered;

  const selectedKey = useMemo(() => {
    if (pathname.startsWith('/report')) {
      const searchParams = new URLSearchParams(search);
      const queryId = searchParams.get('id');
      if (queryId) return `report-item-${queryId}`;
      return 'report-wizard';
    }

    let best = 'dashboard';
    let bestLen = -1;
    Object.entries(ROUTES).forEach(([key, path]) => {
      const hit = pathname === path || pathname.startsWith(path + '/');
      if (hit && path.length > bestLen) {
        best = key;
        bestLen = path.length;
      }
    });
    return best;
  }, [pathname, search]);

  useEffect(() => {
    const parent = PARENT_OF[selectedKey];
    setOpenKeys(parent ? [parent] : []);
  }, [selectedKey, PARENT_OF]);

  const handleSidebarClick = ({ key }) => {
    if (key.startsWith('report-item-')) {
      const configId = key.replace('report-item-', '');
      navigate(`/report?id=${configId}`);
      return;
    }
    if (ROUTES[key]) navigate(ROUTES[key]);
  };

  const handleUserMenuClick = ({ key }) => {
    if (key === '1') navigate('/profile');
    if (key === '2') navigate('/change-password');
    if (key === '3') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('organizationId');
      navigate('/');
    }
  };

  const onOpenChange = (keys) => {
    const latest = keys.find((k) => !openKeys.includes(k));
    setOpenKeys(latest ? [latest] : keys);
  };

  return (
    <ConfigProvider theme={{ token: { motion: false } }}>
      <Layout style={{ minHeight: '100vh', background: C.page }}>
        <Sider
          trigger={null}
          collapsible
          collapsed={!isExpanded}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          width={SIDER_W}
          collapsedWidth={SIDER_COLLAPSED_W}
          style={{
            background: `linear-gradient(180deg, ${C.sideTop} 0%, ${C.sideBottom} 100%)`,
            boxShadow: '4px 0 24px rgba(1, 40, 90, 0.25)',
            position: 'sticky',
            top: 0,
            height: '100vh',
            zIndex: 100,
            overflow: 'hidden',
          }}
        >
          <div className="ce-sider">
            <div className="ce-brand">
              {isExpanded && (
                <span className="ce-brand-name">{org}</span>
              )}
            </div>

            <div className="ce-menu-wrap">
              <Menu
                theme="dark"
                mode="inline"
                selectedKeys={[selectedKey]}
                openKeys={isExpanded ? openKeys : []}
                onOpenChange={onOpenChange}
                onClick={handleSidebarClick}
                items={sidebarMenuItems}
                className="ce-menu"
                style={{ background: 'transparent', borderInlineEnd: 'none' }}
              />
            </div>

            {isExpanded && (
              <div className="ce-sider-footer">
                <AppstoreOutlined />
                <span>v2.0</span>
              </div>
            )}
          </div>
        </Sider>

        <Layout style={{ background: C.page, minWidth: 0 }}>
          {/* ================= HEADER ================= */}
          <Header
            style={{
              background: `linear-gradient(90deg, ${C.headerLeft} 0%, ${C.headerRight} 100%)`,
              padding: '0 14px',
              height: HEADER_H,
              lineHeight: 'normal',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 2px 12px rgba(3, 4, 75, 0.22)',
              position: 'sticky',
              top: 0,
              zIndex: 90,
            }}
          >
            {/* LEFT: toggle */}
            <div style={{ display: 'flex', alignItems: 'center', flex: '0 0 auto' }}>
              <Tooltip title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
                <div className="ce-icon-btn" onClick={() => setCollapsed(!collapsed)}>
                  {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                </div>
              </Tooltip>
            </div>

            {/* RIGHT: fiscal → user */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: '0 0 auto' }}>
              <div className="ce-fy">
                <CalendarOutlined />
                <span className="ce-fy-value">{fiscalYear}</span>
              </div>

              <div className="ce-divider" />

              <Dropdown
                menu={{ items: userMenuItems, onClick: handleUserMenuClick, style: { minWidth: 210 } }}
                placement="bottomRight"
                trigger={['click']}
                arrow
              >
                <div className="ce-user">
                  <Avatar
                    size={26}
                    icon={<UserOutlined />}
                    style={{
                      background: `linear-gradient(135deg, ${C.accent}, ${C.accentDeep})`,
                      border: '2px solid rgba(255, 255, 255, 0.35)',
                    }}
                  />
                  <span className="ce-user-name">{fullName}</span>
                  <DownOutlined style={{ color: 'rgba(255,255,255,0.7)', fontSize: 8 }} />
                </div>
              </Dropdown>
            </div>
          </Header>

          {/* ================= PAGE TITLE STRIP ================= */}
          <div className="ce-page-strip">
            <Text className="ce-page-title">{LABEL_OF[selectedKey] || 'Dashboard'}</Text>
          </div>

          {/* ================= CONTENT ================= */}
          <Content
            style={{
              margin: '0 16px 16px',
              padding: 24,
              minHeight: 280,
              background: '#ffffff',
              borderRadius: 14,
              boxShadow:
                '0 16px 32px -16px rgba(1, 40, 90, 0.12), 0 2px 8px rgba(0, 0, 0, 0.02)',
              border: '1px solid #eef2f8',
              overflow: 'auto',
            }}
          >
            {children}
          </Content>
        </Layout>

        {/* ================= STYLES ================= */}
        <style>{`
          .ce-sider *, .ce-menu *, .ce-icon-btn, .ce-user,
          .ce-fy, .ant-dropdown-menu-item, .ant-layout-sider {
            transition: none !important;
            animation: none !important;
          }

          /* ----- sidebar shell ----- */
          .ce-sider { display: flex; flex-direction: column; height: 100%; }

          .ce-brand {
            height: ${BRAND_H}px; flex: none;
            display: flex; align-items: center;
            padding: 0 14px;
            background: rgba(0, 0, 0, 0.18);
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            white-space: nowrap; overflow: hidden;
          }
          .ce-brand-name {
            color: #fff; font-size: 13px; font-weight: 700; letter-spacing: 0.3px;
            text-transform: capitalize;
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          }

          .ce-menu-wrap {
            flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden;
            padding: 6px 6px 12px;
          }
          .ce-menu-wrap::-webkit-scrollbar { width: 4px; }
          .ce-menu-wrap::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.18); border-radius: 10px; }

          .ce-sider-footer {
            flex: none; height: 30px;
            display: flex; align-items: center; justify-content: center; gap: 6px;
            color: rgba(255,255,255,0.55); font-size: 11px;
            background: rgba(0, 0, 0, 0.18);
            border-top: 1px solid rgba(255, 255, 255, 0.08);
          }

          /* ----- group headings ----- */
          .ce-menu.ant-menu-dark .ant-menu-item-group-title {
            padding: 10px 10px 2px;
            font-size: 10px; font-weight: 600; letter-spacing: 0.5px;
            text-transform: uppercase;
            color: rgba(255, 255, 255, 0.42);
          }
          .ce-menu.ant-menu-dark.ant-menu-inline-collapsed .ant-menu-item-group-title {
            height: 1px; padding: 0; margin: 6px 10px;
            overflow: hidden; font-size: 0;
            background: rgba(255, 255, 255, 0.12);
          }

          /* ----- top-level rows ----- */
          .ce-menu.ant-menu-dark .ant-menu-item,
          .ce-menu.ant-menu-dark .ant-menu-submenu-title {
            height: 34px; line-height: 34px;
            margin: 1px 0; width: 100%;
            border-radius: 8px;
            color: rgba(255, 255, 255, 0.82);
            font-size: 13px; font-weight: 500;
          }
          .ce-menu.ant-menu-dark .ant-menu-item .anticon,
          .ce-menu.ant-menu-dark .ant-menu-submenu-title .anticon {
            font-size: 14px;
          }
          .ce-menu.ant-menu-dark.ant-menu-inline-collapsed .ant-menu-item,
          .ce-menu.ant-menu-dark.ant-menu-inline-collapsed .ant-menu-submenu-title {
            padding-inline: calc(50% - 7px);
          }

          .ce-menu.ant-menu-dark .ant-menu-item:hover,
          .ce-menu.ant-menu-dark .ant-menu-submenu-title:hover {
            background: rgba(255, 255, 255, 0.1);
            color: #fff;
          }

          .ce-menu.ant-menu-dark .ant-menu-submenu-selected > .ant-menu-submenu-title {
            color: #fff; font-weight: 600;
            background: rgba(255, 255, 255, 0.06);
          }
          .ce-menu.ant-menu-dark .ant-menu-submenu-selected > .ant-menu-submenu-title .anticon {
            color: ${C.accentSoft};
          }
          .ce-menu.ant-menu-dark .ant-menu-submenu-arrow { opacity: 0.7; }

          .ce-menu.ant-menu-dark .ant-menu-sub.ant-menu-inline {
            background: transparent;
            position: relative;
            margin: 1px 0 3px 20px;
            padding: 0;
            border-left: 1px solid rgba(255, 255, 255, 0.16);
            border-radius: 0;
          }
          .ce-menu.ant-menu-dark .ant-menu-sub .ant-menu-item {
            height: 28px; line-height: 28px;
            margin: 1px 0 1px 6px; width: calc(100% - 6px);
            padding-left: 10px !important;
            font-size: 12.5px; font-weight: 400;
            color: rgba(255, 255, 255, 0.72);
          }

          .ce-menu.ant-menu-dark .ant-menu-item-selected {
            position: relative;
            background: linear-gradient(90deg, rgba(122,183,255,0.28), rgba(77,163,255,0.12));
            color: #fff;
            font-weight: 600;
            box-shadow: inset 0 0 0 1px rgba(122, 183, 255, 0.35);
          }
          .ce-menu.ant-menu-dark .ant-menu-item-selected::before {
            content: '';
            position: absolute; left: 0; top: 7px; bottom: 7px; width: 3px;
            background: ${C.accentSoft};
            border-radius: 0 4px 4px 0;
          }
          .ce-menu.ant-menu-dark .ant-menu-sub .ant-menu-item-selected::before {
            left: -7px; top: 5px; bottom: 5px;
            border-radius: 4px;
          }

          /* ----- header pieces ----- */
          .ce-icon-btn {
            width: 30px; height: 30px; border-radius: 8px; flex: none;
            display: flex; align-items: center; justify-content: center;
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.12);
            color: #fff; font-size: 14px; cursor: pointer;
          }
          .ce-icon-btn:hover { background: rgba(255, 255, 255, 0.18); }

          .ce-divider { width: 1px; height: 20px; background: rgba(255, 255, 255, 0.14); flex: none; }

          .ce-fy {
            display: flex; align-items: center; gap: 6px;
            padding: 3px 10px; border-radius: 20px;
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.12);
            color: ${C.accentSoft}; font-size: 12px;
          }
          .ce-fy-value { color: #fff; font-size: 12px; font-weight: 600; letter-spacing: 0.3px; }

          .ce-user {
            display: flex; align-items: center; gap: 6px; cursor: pointer;
            padding: 3px 8px 3px 3px; border-radius: 20px;
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.12);
            max-width: 200px;
          }
          .ce-user:hover { background: rgba(255, 255, 255, 0.18); border-color: rgba(255,255,255,0.25); }
          .ce-user-name {
            color: #fff; font-weight: 600; font-size: 12px;
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          }

          /* ----- page title strip ----- */
          .ce-page-strip {
            margin: 12px 16px 8px;
            padding: 0 2px;
          }
          .ce-page-title {
            color: #0a1a5c !important;
            font-size: 16px !important;
            font-weight: 700 !important;
            letter-spacing: 0.2px;
          }

          @media (max-width: 1180px) {
            .ce-user-name { display: none; }
          }
          @media (max-width: 900px) {
            .ce-fy { display: none; }
          }

          /* ----- user dropdown ----- */
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
          .ant-dropdown-menu-item:hover { background: #f0f5fe !important; }

          /* ----- page scrollbar ----- */
          ::-webkit-scrollbar { width: 8px; height: 8px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: #d4dfee; border-radius: 10px; }
          ::-webkit-scrollbar-thumb:hover { background: #b0c4dc; }
        `}</style>
      </Layout>
    </ConfigProvider>
  );
};

export default Dashboard;
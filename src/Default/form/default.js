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

import api from '../../API/api';
import genericService from '../../API/generic/genericservice';
import { listParameterMenusApi } from '../../parametersettings/API/parametersettingservice';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

/* ---------- palette: corporate Blue / White / Red ---------- */
const C = {
  blue: '#0B3D91',       // primary corporate blue (matches login screen)
  blueDeep: '#072A66',   // header gradient end / pressed states
  blueSoft: '#EAF1FC',   // selected row tint
  blueHover: '#F1F5FB',  // hover tint
  red: '#D6212F',        // corporate red accent
  white: '#FFFFFF',
  ink: '#16233F',        // body text on white
  inkMuted: '#5B6B8A',   // secondary text
  line: '#E3E9F3',       // borders / dividers
  page: '#F3F6FB',       // page background
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

const resolveIsAdmin = () => {
  const payload = decodeJwt(localStorage.getItem('token') || '');
  const roles = String(payload?.roles || '')
    .toUpperCase()
    .split(',')
    .map((role) => role.trim());
  return roles.includes('ALL') || roles.includes('ADMIN');
};

/* ---------- menu structure builder ---------- */
const buildSidebarMenu = ({ showVendor, showParameterSettings }) => [
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
        key: 'reports',
        icon: <BarChartOutlined />,
        label: 'Reports',
        children: [
          { key: 'budget-report', label: 'Budget Report' },
          { key: 'correspondence-report', label: 'Correspondence Report' },
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
          ...(showParameterSettings
            ? [{ key: 'parameter-settings', label: 'Parameter Settings' }]
            : []),
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
  'budget-report': '/budget/report',
  'correspondence-report': '/correspondence/report',
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
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [openKeys, setOpenKeys] = useState([]);

  const [org, setOrg] = useState(FALLBACK_ORG);
  const [fullName, setFullName] = useState(FALLBACK_USER);
  const [showVendor, setShowVendor] = useState(false);
  const [isAdmin] = useState(resolveIsAdmin);
  const [fiscalYear, setFiscalYear] = useState(FALLBACK_FY);
  const [parameterMenus, setParameterMenus] = useState([]);

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

      const fyList = await genericService.getFiscalYears();
      if (alive && fyList.length) setFiscalYear(fyList[0].FiscalYear);

      listParameterMenusApi()
        .then((items) => {
          if (!alive) return;
          const sorted = (Array.isArray(items) ? items : []).sort((a, b) =>
            String(a.menuName || '').localeCompare(String(b.menuName || ''))
          );
          setParameterMenus(sorted);
        })
        .catch(() => {
          if (alive) setParameterMenus([]);
        });

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
    () => buildSidebarMenu({ showVendor, showParameterSettings: isAdmin }),
    [showVendor, isAdmin]
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

  const activeParameterMenu = useMemo(
    () => parameterMenus.find((item) => pathname === `/parameter-menu/${item.parameterId}`),
    [parameterMenus, pathname]
  );

  const selectedKey = useMemo(() => {
    if (pathname.startsWith('/parameter-menu/')) return '';
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
  }, [pathname]);

  useEffect(() => {
    const parent = PARENT_OF[selectedKey];
    setOpenKeys(parent ? [parent] : []);
  }, [selectedKey, PARENT_OF]);

  const handleSidebarClick = ({ key }) => {
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
    <ConfigProvider
      theme={{
        token: { motion: false, colorPrimary: C.blue, colorError: C.red, colorLink: C.blue },
      }}
    >
      <Layout style={{ minHeight: '100vh', background: C.page }}>
        <Sider
          trigger={null}
          collapsible
          collapsed={!isExpanded}
          breakpoint="lg"
          onBreakpoint={(broken) => {
            if (broken) setCollapsed(true);
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          width={SIDER_W}
          collapsedWidth={SIDER_COLLAPSED_W}
          style={{
            background: C.white,
            boxShadow: `1px 0 0 ${C.line}, 6px 0 24px rgba(11, 61, 145, 0.07)`,
            position: 'sticky',
            top: 0,
            height: '100vh',
            zIndex: 100,
            overflow: 'hidden',
          }}
        >
          <div className="ce-sider">
            <div className={`ce-brand ${isExpanded ? '' : 'is-collapsed'}`}>
              <span className="ce-brand-mark" />
              {isExpanded && <span className="ce-brand-name">{org}</span>}
            </div>

            <div className="ce-menu-wrap">
              <Menu
                theme="light"
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
              background: `linear-gradient(90deg, ${C.blue} 0%, ${C.blueDeep} 100%)`,
              padding: '0 14px',
              height: HEADER_H,
              lineHeight: 'normal',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              // 3px red rule along the bottom edge (echoes the login card stripe)
              boxShadow: `inset 0 -3px 0 ${C.red}, 0 2px 12px rgba(7, 42, 102, 0.22)`,
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: '0 0 auto', paddingBottom: 3 }}>
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
                      background: C.white,
                      color: C.blue,
                      border: `2px solid ${C.red}`,
                    }}
                  />
                  <span className="ce-user-name">{fullName}</span>
                  <DownOutlined style={{ color: 'rgba(255,255,255,0.75)', fontSize: 8 }} />
                </div>
              </Dropdown>
            </div>
          </Header>

          {/* ================= PARAMETER MENU BAR ================= */}
          {parameterMenus.length > 0 && (
            <div className="ce-param-bar">
              <Menu
                mode="horizontal"
                theme="light"
                className="ce-param-menu"
                selectedKeys={activeParameterMenu ? [activeParameterMenu.parameterId] : []}
                items={parameterMenus.map((item) => ({
                  key: item.parameterId,
                  label: item.menuName,
                }))}
                onClick={({ key }) => navigate(`/parameter-menu/${key}`)}
                style={{ background: 'transparent', borderBottom: 'none', minWidth: 0 }}
              />
            </div>
          )}

          {/* ================= PAGE TITLE STRIP ================= */}
          {/* <div className="ce-page-strip">
            <Text className="ce-page-title">{LABEL_OF[selectedKey] || 'Dashboard'}</Text>
          </div> */}

          {/* ================= CONTENT ================= */}
          <Content className="ce-content" style={{ minHeight: 280 }}>
            {children}
          </Content>
        </Layout>

        {/* ================= STYLES ================= */}
        <style>{`
          .ce-sider *, .ce-menu *, .ce-icon-btn, .ce-user,
          .ce-fy, .ce-param-menu *, .ant-dropdown-menu-item, .ant-layout-sider {
            transition: none !important;
            animation: none !important;
          }

          /* ----- sidebar shell ----- */
          .ce-sider { display: flex; flex-direction: column; height: 100%; background: ${C.white}; }

          .ce-brand {
            height: ${BRAND_H}px; flex: none;
            display: flex; align-items: center; gap: 10px;
            padding: 0 16px;
            background: ${C.white};
            border-bottom: 1px solid ${C.line};
            white-space: nowrap; overflow: hidden;
          }
          .ce-brand.is-collapsed { justify-content: center; padding: 0; }
          .ce-brand-mark {
            flex: none; width: 4px; height: 20px; border-radius: 2px;
            background: ${C.red};
          }
          .ce-brand-name {
            color: ${C.blue}; font-size: 13px; font-weight: 700; letter-spacing: 0.2px;
            text-transform: capitalize;
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          }

          .ce-menu-wrap {
            flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden;
            padding: 6px 8px 12px;
          }
          .ce-menu-wrap::-webkit-scrollbar { width: 4px; }
          .ce-menu-wrap::-webkit-scrollbar-thumb { background: ${C.line}; border-radius: 10px; }

          .ce-sider-footer {
            flex: none; height: 30px;
            display: flex; align-items: center; justify-content: center; gap: 6px;
            color: ${C.inkMuted}; font-size: 11px;
            background: ${C.page};
            border-top: 1px solid ${C.line};
          }

          /* ----- group headings ----- */
          .ce-menu.ant-menu-light .ant-menu-item-group-title {
            padding: 12px 10px 3px;
            font-size: 11px; font-weight: 600; letter-spacing: 0.2px;
            color: ${C.inkMuted};
          }
          .ce-menu.ant-menu-light.ant-menu-inline-collapsed .ant-menu-item-group-title {
            height: 1px; padding: 0; margin: 6px 10px;
            overflow: hidden; font-size: 0;
            background: ${C.line};
          }

          /* ----- top-level rows ----- */
          .ce-menu.ant-menu-light .ant-menu-item,
          .ce-menu.ant-menu-light .ant-menu-submenu-title {
            height: 34px; line-height: 34px;
            margin: 1px 0; width: 100%;
            border-radius: 8px;
            color: ${C.ink};
            font-size: 13px; font-weight: 500;
          }
          .ce-menu.ant-menu-light .ant-menu-item .anticon,
          .ce-menu.ant-menu-light .ant-menu-submenu-title .anticon {
            font-size: 14px;
            color: ${C.blue};
          }
          .ce-menu.ant-menu-light.ant-menu-inline-collapsed .ant-menu-item,
          .ce-menu.ant-menu-light.ant-menu-inline-collapsed .ant-menu-submenu-title {
            padding-inline: calc(50% - 7px);
          }

          .ce-menu.ant-menu-light .ant-menu-item:hover,
          .ce-menu.ant-menu-light .ant-menu-submenu-title:hover {
            background: ${C.blueHover};
            color: ${C.blue};
          }

          .ce-menu.ant-menu-light .ant-menu-submenu-selected > .ant-menu-submenu-title {
            color: ${C.blue}; font-weight: 600;
            background: ${C.blueHover};
          }
          .ce-menu.ant-menu-light .ant-menu-submenu-arrow { color: ${C.inkMuted}; }

          .ce-menu.ant-menu-light .ant-menu-sub.ant-menu-inline {
            background: transparent;
            position: relative;
            margin: 1px 0 3px 20px;
            padding: 0;
            border-left: 1px solid ${C.line};
            border-radius: 0;
          }
          .ce-menu.ant-menu-light .ant-menu-sub .ant-menu-item {
            height: 28px; line-height: 28px;
            margin: 1px 0 1px 6px; width: calc(100% - 6px);
            padding-left: 10px !important;
            font-size: 12.5px; font-weight: 400;
            color: ${C.inkMuted};
          }
          .ce-menu.ant-menu-light .ant-menu-sub .ant-menu-item:hover { color: ${C.blue}; }

          /* ----- selected row: blue tint + red indicator ----- */
          .ce-menu.ant-menu-light .ant-menu-item-selected {
            position: relative;
            background: ${C.blueSoft};
            color: ${C.blue};
            font-weight: 600;
          }
          .ce-menu.ant-menu-light .ant-menu-item-selected .anticon { color: ${C.blue}; }
          .ce-menu.ant-menu-light .ant-menu-item-selected::before {
            content: '';
            position: absolute; left: 0; top: 7px; bottom: 7px; width: 3px;
            background: ${C.red};
            border-radius: 0 4px 4px 0;
          }
          .ce-menu.ant-menu-light .ant-menu-sub .ant-menu-item-selected::before {
            left: -7px; top: 5px; bottom: 5px;
            border-radius: 4px;
          }

          /* ----- header pieces ----- */
          .ce-icon-btn {
            width: 30px; height: 30px; border-radius: 8px; flex: none;
            margin-bottom: 3px;
            display: flex; align-items: center; justify-content: center;
            background: rgba(255, 255, 255, 0.12);
            border: 1px solid rgba(255, 255, 255, 0.22);
            color: #fff; font-size: 14px; cursor: pointer;
          }
          .ce-icon-btn:hover { background: rgba(255, 255, 255, 0.24); }

          .ce-divider { width: 1px; height: 20px; background: rgba(255, 255, 255, 0.25); flex: none; }

          .ce-fy {
            display: flex; align-items: center; gap: 6px;
            padding: 3px 10px; border-radius: 20px;
            background: rgba(255, 255, 255, 0.12);
            border: 1px solid rgba(255, 255, 255, 0.22);
            color: rgba(255, 255, 255, 0.85); font-size: 12px;
          }
          .ce-fy-value { color: #fff; font-size: 12px; font-weight: 600; letter-spacing: 0.3px; }

          .ce-user {
            display: flex; align-items: center; gap: 6px; cursor: pointer;
            padding: 3px 8px 3px 3px; border-radius: 20px;
            background: rgba(255, 255, 255, 0.12);
            border: 1px solid rgba(255, 255, 255, 0.22);
            max-width: 200px;
          }
          .ce-user:hover { background: rgba(255, 255, 255, 0.24); border-color: rgba(255,255,255,0.4); }
          .ce-user-name {
            color: #fff; font-weight: 600; font-size: 12px;
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          }

          /* ----- parameter menu bar (white, red underline on active) ----- */
          .ce-param-bar {
            position: sticky; top: ${HEADER_H}px; z-index: 80;
            padding: 0 10px;
            background: ${C.white};
            border-bottom: 1px solid ${C.line};
            box-shadow: 0 2px 10px rgba(11, 61, 145, 0.06);
          }
          .ce-param-menu.ant-menu-light {
            height: 38px; line-height: 38px;
            font-size: 12.5px; font-weight: 500;
          }
          .ce-param-menu.ant-menu-light .ant-menu-item {
            height: 38px; line-height: 38px;
            margin: 0; padding: 0 14px;
            border-radius: 0;
            color: ${C.inkMuted};
          }
          .ce-param-menu.ant-menu-light .ant-menu-item::after { display: none; }
          .ce-param-menu.ant-menu-light .ant-menu-item:hover {
            background: ${C.blueHover};
            color: ${C.blue};
          }
          .ce-param-menu.ant-menu-light .ant-menu-item-selected {
            background: ${C.blueSoft};
            color: ${C.blue}; font-weight: 600;
            box-shadow: inset 0 -3px 0 ${C.red};
          }
          .ce-param-menu.ant-menu-light .ant-menu-overflow-item-rest,
          .ce-param-menu.ant-menu-light .ant-menu-overflow-item-suffix {
            color: ${C.blue};
          }

          /* ----- page title strip ----- */
          .ce-page-strip {
            margin: 12px 16px 8px;
            padding: 0 2px;
          }
          .ce-page-title {
            color: ${C.blue} !important;
            font-size: 16px !important;
            font-weight: 700 !important;
            letter-spacing: 0.2px;
          }

          /* ----- content shell ----- */
          .ce-content {
            margin: 16px 16px 16px;
            padding: 24px;
            background: ${C.white};
            border-radius: 12px;
            box-shadow: 0 12px 28px -16px rgba(11, 61, 145, 0.14), 0 1px 3px rgba(11, 61, 145, 0.04);
            border: 1px solid ${C.line};
            overflow: auto;
          }

          @media (max-width: 1180px) {
            .ce-user-name { display: none; }
            .ce-param-menu.ant-menu-light .ant-menu-item { padding: 0 10px; }
          }
          @media (max-width: 900px) {
            .ce-fy { display: none; }
          }
          @media (max-width: 992px) {
            .ce-content { margin: 12px; padding: 16px; border-radius: 10px; }
          }
          @media (max-width: 576px) {
            .ce-content { margin: 8px; padding: 12px; border-radius: 8px; }
            .ce-page-strip { margin: 10px 10px 6px; }
            .ce-divider { display: none; }
            .ce-param-bar { padding: 0 4px; }
          }

          /* ----- user dropdown ----- */
          .ant-dropdown-menu {
            border-radius: 12px !important;
            box-shadow: 0 12px 40px rgba(7, 42, 102, 0.16) !important;
            padding: 8px !important;
            border: 1px solid ${C.line} !important;
          }
          .ant-dropdown-menu-item {
            border-radius: 8px !important;
            padding: 10px 14px !important;
            font-weight: 500 !important;
            font-size: 13.5px !important;
            color: ${C.ink};
          }
          .ant-dropdown-menu-item:hover { background: ${C.blueHover} !important; }
          .ant-dropdown-menu-item-danger { color: ${C.red} !important; }
          .ant-dropdown-menu-item-danger:hover { background: #FDECEE !important; }

          /* ----- keyboard focus ----- */
          .ce-icon-btn:focus-visible,
          .ce-user:focus-visible,
          .ce-menu .ant-menu-item:focus-visible,
          .ce-param-menu .ant-menu-item:focus-visible {
            outline: 2px solid ${C.red};
            outline-offset: 2px;
          }

          /* ----- page scrollbar ----- */
          ::-webkit-scrollbar { width: 8px; height: 8px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: #cfd9ea; border-radius: 10px; }
          ::-webkit-scrollbar-thumb:hover { background: #a9b9d4; }
        `}</style>
      </Layout>
    </ConfigProvider>
  );
};

export default Dashboard;

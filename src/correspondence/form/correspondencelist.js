import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  Button,
  Select,
  Card,
  Tag,
  Typography,
  Space,
  Row,
  Col,
  Drawer,
  Modal,
  Checkbox,
  Divider,
  message,
} from 'antd';
import {
  InboxOutlined,
  SendOutlined,
  PlusOutlined,
  CalendarOutlined,
  ApartmentOutlined,
  UserOutlined,
  FileTextOutlined,
  EyeOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import {
  getCorrespondenceApi,
  updateHandoverStatusApi,
  getDepartmentsApi,
  getUsersApi,
  getFiscalYearsApi,
} from '../API/correspondenceservice';
import NepaliDate from 'nepali-date-converter';
import NepaliDatePicker, { bsToAdString } from '../components/NepaliDatePicker';

const { Text } = Typography;
const { Option } = Select;

const formatNepaliDate = (dateInput) => {
  if (!dateInput) return null;
  try {
    let d;
    if (dateInput instanceof Date) {
      d = new NepaliDate(dateInput);
    } else if (typeof dateInput === 'string') {
      const trimmed = dateInput.trim();
      if (/^20[789]\d[-/][01]?\d[-/][0-3]?\d/.test(trimmed)) {
        const p = trimmed.split(/[-/ :]/);
        d = new NepaliDate(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10));
      } else {
        const parsed = new Date(trimmed);
        if (!isNaN(parsed.getTime())) d = new NepaliDate(parsed);
      }
    }
    if (d && !isNaN(d.getYear())) {
      return {
        bsDate: d.format('YYYY-MM-DD'),
        bsFormatted: d.format('DD MMMM YYYY'),
      };
    }
  } catch {}
  return null;
};

const toAdDateString = (input) => {
  if (!input) return '';
  const str = String(input).trim();
  if (/^20[789]\d/.test(str)) {
    return bsToAdString(str);
  }
  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
  return str.slice(0, 10);
};

const C = {
  darkNavy: '#002b49',
  brand: '#01519b',
  page: '#f4f7fc',
  filterBg: '#f8fafc',
  border: '#e2e8f0',
  filterBorder: '#d9e2ec',
  text: '#16202f',
  muted: '#667085',
  subtext: '#526071',
};

const CorrespondenceList = ({ type = 'incoming' }) => {
  const isIncoming = type === 'incoming';
  const pageTitle = isIncoming ? 'Incoming Correspondence' : 'Outgoing Correspondence';
  const navigate = useNavigate();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [fiscalYears, setFiscalYears] = useState([]);
  const [rawDeptList, setRawDeptList] = useState([]);
  const [rawUserList, setRawUserList] = useState([]);

  const [fiscalYear, setFiscalYear] = useState(undefined);
  const [department, setDepartment] = useState(undefined);
  const [user, setUser] = useState(undefined);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const [appliedFilters, setAppliedFilters] = useState({
    fiscalYear: undefined,
    department: undefined,
    user: undefined,
    fromDate: '',
    toDate: '',
  });

  const [selectedRecord, setSelectedRecord] = useState(null);
  const [ackModalRecord, setAckModalRecord] = useState(null);
  const [ackChecked, setAckChecked] = useState(false);
  const [ackSubmitting, setAckSubmitting] = useState(false);

  const loadRecords = useCallback(
    async (filters) => {
      setLoading(true);
      try {
        const data = await getCorrespondenceApi({
          type,
          fiscalYear: filters?.fiscalYear,
          department: filters?.department,
          user: filters?.user,
        });
        setRecords(data || []);
      } catch (err) {
        console.error('Failed to load correspondence:', err);
        message.error(err.response?.data?.message || 'Failed to retrieve correspondence');
      } finally {
        setLoading(false);
      }
    },
    [type]
  );

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const [deptList, userList, fyList] = await Promise.all([
          getDepartmentsApi(),
          getUsersApi(),
          getFiscalYearsApi(),
        ]);
        if (!isMounted) return;
        setRawDeptList(deptList || []);
        setRawUserList(userList || []);
        if (deptList?.length) {
          const names = deptList.map((d) => (d.Label || d.DepartmentName || '').trim()).filter(Boolean);
          if (names.length) setDepartments(names);
        }
        if (fyList?.length) {
          const fys = fyList.map((f) => (f.Label || f.FiscalYear || '').trim()).filter(Boolean);
          if (fys.length) {
            setFiscalYears(fys);
            setFiscalYear((prev) => prev || fys[0]);
            setAppliedFilters((prev) => ({
              ...prev,
              fiscalYear: prev.fiscalYear || fys[0],
            }));
          }
        }
      } catch (e) {
        console.error('Dropdown fetch error:', e);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const availableUsers = useMemo(() => {
    if (!department) {
      const names = rawUserList.map((u) => (u.Label || u.FullName || u.Value || '').trim()).filter(Boolean);
      return Array.from(new Set(names));
    }
    const deptObj = rawDeptList.find(
      (d) => (d.Label || d.DepartmentName || '').trim().toLowerCase() === department.trim().toLowerCase()
    );
    const deptId = deptObj?.Value || deptObj?.DepartmentId;
    const list = deptId ? rawUserList.filter((u) => u.DepartmentId === deptId) : rawUserList;
    const names = list.map((u) => (u.Label || u.FullName || u.Value || '').trim()).filter(Boolean);
    return Array.from(new Set(names));
  }, [department, rawDeptList, rawUserList]);

  const handleDepartmentChange = (val) => {
    setDepartment(val);
    if (val && user) {
      const deptObj = rawDeptList.find(
        (d) => (d.Label || d.DepartmentName || '').trim().toLowerCase() === val.trim().toLowerCase()
      );
      const deptId = deptObj?.Value || deptObj?.DepartmentId;
      if (deptId) {
        const belongs = rawUserList.some(
          (u) =>
            u.DepartmentId === deptId &&
            (u.Label || u.FullName || u.Value || '').trim().toLowerCase() === user.trim().toLowerCase()
        );
        if (!belongs) setUser(undefined);
      }
    }
  };

  useEffect(() => {
    loadRecords(appliedFilters);
  }, [type, loadRecords, appliedFilters]);

  const handleApply = () => {
    setAppliedFilters({
      fiscalYear,
      department,
      user,
      fromDate: typeof fromDate === 'string' ? fromDate.trim() : '',
      toDate: typeof toDate === 'string' ? toDate.trim() : '',
    });
  };

  const handleReset = () => {
    const defaultFy = fiscalYears[0] || undefined;
    setFiscalYear(defaultFy);
    setDepartment(undefined);
    setUser(undefined);
    setFromDate('');
    setToDate('');
    setAppliedFilters({
      fiscalYear: defaultFy,
      department: undefined,
      user: undefined,
      fromDate: '',
      toDate: '',
    });
  };

  const filteredData = useMemo(() => {
    const fromAd = toAdDateString(appliedFilters.fromDate);
    const toAd = toAdDateString(appliedFilters.toDate);

    if (!fromAd && !toAd) return records;

    return records.filter((item) => {
      const recDate = toAdDateString(item.receivedDate || item.createdDate);
      if (!recDate) return false;
      if (fromAd && recDate < fromAd) return false;
      if (toAd && recDate > toAd) return false;
      return true;
    });
  }, [records, appliedFilters.fromDate, appliedFilters.toDate]);

  const openAcknowledgeModal = (record) => {
    if (record.handoverStatus === 'ACKNOWLEDGED') return;
    setAckModalRecord(record);
    setAckChecked(false);
  };

  const handleConfirmAcknowledge = async () => {
    if (!ackModalRecord || !ackChecked) return;
    setAckSubmitting(true);
    try {
      const now = new Date();
      const nowBs = formatNepaliDate(now);
      const formattedDate = nowBs
        ? nowBs.bsFormatted
        : `${now.getDate()} ${now.toLocaleString('default', { month: 'short' })} ${now.getFullYear()}`;

      const loggedUser = (() => {
        try {
          return JSON.parse(localStorage.getItem('user') || '{}');
        } catch {
          return {};
        }
      })();
      const currentUser = loggedUser.fullname || loggedUser.name || loggedUser.username || '';

      const updated = await updateHandoverStatusApi({
        key: ackModalRecord.key,
        referenceId: ackModalRecord.referenceId,
        handoverStatus: 'ACKNOWLEDGED',
        handoverBy: currentUser || undefined,
        handoverDate: formattedDate,
      });

      message.success(`Document handover acknowledged for ${ackModalRecord.referenceId}`);
      setAckModalRecord(null);
      if (selectedRecord && selectedRecord.key === ackModalRecord.key) {
        setSelectedRecord(
          updated || {
            ...ackModalRecord,
            handoverStatus: 'ACKNOWLEDGED',
            handoverDate: formattedDate,
            handoverBy: currentUser || undefined,
          }
        );
      }
      loadRecords(appliedFilters);
    } catch (err) {
      console.error('Handover acknowledge error:', err);
      message.error(err.response?.data?.message || 'Failed to acknowledge handover');
    } finally {
      setAckSubmitting(false);
    }
  };

  const incomingColumns = [
    {
      title: 'S.NO',
      key: 'sno',
      width: 60,
      align: 'center',
      render: (_, __, index) => <Text style={{ color: C.subtext, fontWeight: 600 }}>{index + 1}</Text>,
    },
    {
      title: 'FISCAL YEAR',
      dataIndex: 'fiscalYear',
      key: 'fiscalYear',
      width: 110,
      render: (val) => <Text style={{ color: C.text, fontWeight: 500 }}>{val || '—'}</Text>,
    },
    {
      title: 'PARTICULAR',
      key: 'particular',
      width: 180,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 700, color: C.text, fontSize: 13, textTransform: 'uppercase' }}>
            {record.particularTitle || record.documentType || '—'}
          </div>
          <div style={{ fontSize: 11, color: C.muted, textTransform: 'uppercase', marginTop: 2 }}>
            {record.particularSubtitle || record.remarks || '—'}
          </div>
        </div>
      ),
    },
    {
      title: 'FROM',
      key: 'from',
      width: 220,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 700, color: C.text, fontSize: 13, textTransform: 'uppercase' }}>
            {record.fromName || record.receivedFrom || '—'}
          </div>
          <div style={{ fontSize: 11, color: C.muted, textTransform: 'uppercase', marginTop: 2 }}>
            {record.fromOrg || record.vendorName || record.location || '—'}
          </div>
        </div>
      ),
    },
    {
      title: 'RECEIVED BY',
      dataIndex: 'receivedBy',
      key: 'receivedBy',
      width: 120,
      render: (val) => (
        <Text style={{ fontWeight: 600, color: C.text, textTransform: 'uppercase', fontSize: 12 }}>
          {val || '—'}
        </Text>
      ),
    },
    {
      title: 'RECEIVED DATE',
      dataIndex: 'receivedDate',
      key: 'receivedDate',
      width: 160,
      render: (val) => {
        if (!val) return '—';
        const d = new Date(val);
        const dateStr = !isNaN(d.getTime()) ? `${d.toISOString().slice(0, 10)} ${d.toTimeString().slice(0, 8)}` : val;
        return <div style={{ color: C.text, fontWeight: 500, fontSize: 12 }}>{dateStr}</div>;
      },
    },
    {
      title: 'FORWARDED TO',
      key: 'forwardedTo',
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 700, color: C.text, fontSize: 13, textTransform: 'uppercase' }}>
            {record.forwardedToName || record.user || '—'}
          </div>
          <div style={{ fontSize: 11, color: C.muted, textTransform: 'uppercase', marginTop: 2 }}>
            {record.forwardedToDept || record.department || '—'}
          </div>
        </div>
      ),
    },
    {
      title: 'DOCUMENT HANDOVERED',
      key: 'handover',
      width: 190,
      render: (_, record) => {
        const isAck = record.handoverStatus === 'ACKNOWLEDGED';
        return isAck ? (
          <div>
            <Tag
              color="blue"
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.5px',
                borderRadius: 4,
                padding: '2px 8px',
                textTransform: 'uppercase',
              }}
            >
              ACKNOWLEDGED
            </Tag>
            <div style={{ marginTop: 4, fontSize: 11, color: C.text, fontWeight: 600 }}>
              {record.handoverDate || '—'}
              {record.handoverBy && (
                <span style={{ display: 'block', color: C.muted, fontWeight: 500, fontSize: 10, textTransform: 'uppercase' }}>
                  {record.handoverBy}
                </span>
              )}
            </div>
          </div>
        ) : (
          <Button
            size="small"
            onClick={() => openAcknowledgeModal(record)}
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.5px',
              height: 26,
              padding: '0 10px',
              borderRadius: 4,
              color: '#b54708',
              borderColor: '#fedf89',
              background: '#fffaeb',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            PENDING
          </Button>
        );
      },
    },
    {
      title: 'Action',
      dataIndex: 'referenceId',
      key: 'action',
      width: 180,
      align: 'center',
      fixed: 'right',
      render: (val, record) => (
        <a
          href="#detail"
          onClick={(e) => {
            e.preventDefault();
            setSelectedRecord(record);
          }}
          style={{
            color: '#1a73e8',
            fontWeight: 600,
            fontSize: 12,
            letterSpacing: '0.2px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <EyeOutlined />
          <span>{val}</span>
        </a>
      ),
    },
  ];

  const outgoingColumns = [
    {
      title: 'S.No',
      key: 'sno',
      width: 70,
      align: 'center',
      render: (_, __, index) => <Text style={{ color: C.subtext, fontWeight: 600 }}>{index + 1}</Text>,
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      width: 200,
      render: (val, record) => (
        <span style={{ fontWeight: 600, color: C.text, textTransform: 'uppercase', fontSize: 12 }}>
          {val || record.forwardedToDept || '—'}
        </span>
      ),
    },
    {
      title: 'Reference No',
      dataIndex: 'referenceId',
      key: 'referenceId',
      width: 190,
      render: (val, record) => (
        <a
          href="#detail"
          onClick={(e) => {
            e.preventDefault();
            setSelectedRecord(record);
          }}
          style={{
            color: '#1a73e8',
            fontWeight: 700,
            fontSize: 12,
            fontFamily: 'monospace',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
          }}
        >
          <EyeOutlined />
          <span>{val}</span>
        </a>
      ),
    },
    {
      title: 'Created Date',
      dataIndex: 'createdDate',
      key: 'createdDate',
      width: 140,
      render: (val, record) => {
        const dStr = val || record.createdDate || record.receivedDate;
        if (!dStr) return '—';
        const d = new Date(dStr);
        return isNaN(d.getTime())
          ? String(dStr).slice(0, 10)
          : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      },
    },
    {
      title: 'Created By',
      dataIndex: 'createdBy',
      key: 'createdBy',
      width: 160,
      render: (val, record) => (
        <span style={{ fontWeight: 600, color: C.text, textTransform: 'uppercase', fontSize: 12 }}>
          {val || record.createdBy || record.receivedBy || record.fromName || '—'}
        </span>
      ),
    },
    {
      title: 'Remarks',
      dataIndex: 'remarks',
      key: 'remarks',
      render: (val) => <span style={{ color: '#334155', fontSize: 13 }}>{val || '—'}</span>,
    },
  ];

  return (
    <div style={{ padding: '20px 28px', background: C.page, minHeight: '100vh' }}>
      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: '#1a73e8',
            letterSpacing: '0.8px',
            textTransform: 'uppercase',
            marginBottom: 4,
          }}
        >
          CORRESPONDENCE REGISTRY
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {isIncoming ? (
              <InboxOutlined style={{ fontSize: 26, color: C.darkNavy }} />
            ) : (
              <SendOutlined style={{ fontSize: 26, color: C.darkNavy }} />
            )}
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: C.darkNavy, letterSpacing: '-0.3px' }}>
              {pageTitle}
            </h1>
          </div>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate(`/correspondence/${type}/new`)}
            style={{
              background: isIncoming ? '#002b49' : '#059669',
              borderColor: isIncoming ? '#002b49' : '#059669',
              fontWeight: 600,
              height: 38,
              borderRadius: 6,
              padding: '0 18px',
            }}
          >
            {isIncoming ? 'New Entry' : '+ Create New'}
          </Button>
        </div>
      </div>

      <div style={{ position: 'relative', marginTop: 20, marginBottom: 18 }}>
        {isIncoming && (
          <div
            style={{
              position: 'absolute',
              top: -10,
              left: 16,
              background: '#eef4fb',
              color: '#2a5a8a',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.8px',
              padding: '2px 8px',
              borderRadius: 3,
              border: '1px solid #d0e0f0',
              zIndex: 1,
              textTransform: 'uppercase',
            }}
          >
            SEARCH SLIP
          </div>
        )}

        <div
          style={{
            background: C.filterBg,
            border: `1px solid ${C.filterBorder}`,
            borderRadius: 8,
            padding: '20px 20px 16px 20px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
          }}
        >
          <Row gutter={[16, 12]} align="bottom">
            <Col xs={24} sm={12} md={6} lg={4}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#3b556e', marginBottom: 6, letterSpacing: '0.4px', textTransform: 'uppercase' }}>
                <CalendarOutlined style={{ marginRight: 6 }} />
                FISCAL YEAR
              </div>
              <Select
                value={fiscalYear}
                onChange={setFiscalYear}
                style={{ width: '100%', height: 36 }}
                placeholder="-- Select Fiscal Year --"
                allowClear
                showSearch
              >
                {fiscalYears.map((fy) => (
                  <Option key={fy} value={fy}>
                    {fy}
                  </Option>
                ))}
              </Select>
            </Col>

            <Col xs={24} sm={12} md={6} lg={isIncoming ? 4 : 5}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#3b556e', marginBottom: 6, letterSpacing: '0.4px', textTransform: 'uppercase' }}>
                <ApartmentOutlined style={{ marginRight: 6 }} />
                DEPARTMENT
              </div>
              <Select
                value={department}
                onChange={handleDepartmentChange}
                placeholder="-- Select Department --"
                allowClear
                style={{ width: '100%', height: 36 }}
                showSearch
              >
                {departments.map((dept) => (
                  <Option key={dept} value={dept}>
                    {dept}
                  </Option>
                ))}
              </Select>
            </Col>

            {isIncoming && (
              <Col xs={24} sm={12} md={6} lg={4}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#3b556e', marginBottom: 6, letterSpacing: '0.4px', textTransform: 'uppercase' }}>
                  <UserOutlined style={{ marginRight: 6 }} />
                  USER
                </div>
                <Select
                  value={user}
                  onChange={setUser}
                  placeholder="--Select User--"
                  allowClear
                  style={{ width: '100%', height: 36 }}
                  showSearch
                >
                  {availableUsers.map((u) => (
                    <Option key={u} value={u}>
                      {u}
                    </Option>
                  ))}
                </Select>
              </Col>
            )}

            <Col xs={24} sm={12} md={6} lg={isIncoming ? 4 : 5}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#3b556e', marginBottom: 6, letterSpacing: '0.4px', textTransform: 'uppercase' }}>
                <CalendarOutlined style={{ marginRight: 6 }} />
                FROM DATE
              </div>
              <NepaliDatePicker
                value={fromDate}
                onChange={setFromDate}
                placeholder="From Date"
                allowClear
                style={{ width: '100%', height: 36 }}
              />
            </Col>

            <Col xs={24} sm={12} md={6} lg={isIncoming ? 4 : 5}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#3b556e', marginBottom: 6, letterSpacing: '0.4px', textTransform: 'uppercase' }}>
                <CalendarOutlined style={{ marginRight: 6 }} />
                TO DATE
              </div>
              <NepaliDatePicker
                value={toDate}
                onChange={setToDate}
                placeholder="To Date"
                allowClear
                style={{ width: '100%', height: 36 }}
              />
            </Col>

            <Col xs={24} sm={12} md={6} lg={isIncoming ? 4 : 5}>
              <Space style={{ width: '100%', justifyContent: 'flex-start' }}>
                <Button
                  type="primary"
                  onClick={handleApply}
                  style={{
                    background: isIncoming ? '#0e70c4' : '#009688',
                    borderColor: isIncoming ? '#0e70c4' : '#009688',
                    fontWeight: 600,
                    borderRadius: 6,
                    padding: '0 18px',
                    height: 36,
                  }}
                >
                  {isIncoming ? 'Apply' : 'List Correspondence'}
                </Button>
                <Button
                  onClick={handleReset}
                  style={{
                    borderRadius: 6,
                    height: 36,
                    padding: '0 16px',
                    borderColor: '#d0d5dd',
                    color: '#475467',
                  }}
                >
                  Reset
                </Button>
              </Space>
            </Col>
          </Row>
        </div>
      </div>

      <div style={{ marginBottom: 12, paddingLeft: 2 }}>
        <Text style={{ fontSize: 11, fontWeight: 700, color: '#344054', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
          TOTAL ON RECORD: <span style={{ color: C.brand, fontWeight: 800 }}>{filteredData.length}</span>
        </Text>
      </div>

      <div
        style={{
          background: '#ffffff',
          borderRadius: 8,
          border: `1px solid ${C.border}`,
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(16, 24, 40, 0.05)',
        }}
      >
        <Table
          dataSource={filteredData}
          columns={isIncoming ? incomingColumns : outgoingColumns}
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          scroll={{ x: isIncoming ? 1200 : 900 }}
          rowKey={(r, idx) => r.key || r.referenceId || idx}
          components={
            isIncoming
              ? {
                  header: {
                    cell: (props) => (
                      <th
                        {...props}
                        style={{
                          ...props.style,
                          backgroundColor: '#0c2a4a',
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: 11,
                          letterSpacing: '0.6px',
                          padding: '12px 14px',
                          borderRight: '1px solid #08213b',
                        }}
                      />
                    ),
                  },
                }
              : undefined
          }
        />
      </div>

      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircleOutlined style={{ color: '#6941c6', fontSize: 18 }} />
            <span style={{ fontSize: 16, fontWeight: 700, color: '#1e293b' }}>
              Acknowledge Document
            </span>
          </div>
        }
        open={Boolean(ackModalRecord)}
        onCancel={() => setAckModalRecord(null)}
        footer={[
          <Button
            key="submit"
            type="primary"
            loading={ackSubmitting}
            disabled={!ackChecked}
            onClick={handleConfirmAcknowledge}
            style={{
              background: ackChecked ? '#6941c6' : undefined,
              borderColor: ackChecked ? '#6941c6' : undefined,
              fontWeight: 600,
              borderRadius: 6,
              height: 38,
              padding: '0 20px',
            }}
          >
            Document Received
          </Button>,
          <Button
            key="close"
            onClick={() => setAckModalRecord(null)}
            style={{ borderRadius: 6, height: 38, padding: '0 18px' }}
          >
            Close
          </Button>,
        ]}
      >
        <div style={{ padding: '12px 0 8px 0' }}>
          <div style={{ marginBottom: 18 }}>
            <span style={{ fontSize: 13, color: '#64748b' }}>Document Reference: </span>
            <span style={{ fontWeight: 700, fontSize: 14, color: '#1677ff' }}>
              {ackModalRecord?.referenceId}
            </span>
          </div>

          <div
            style={{
              background: '#f8fafc',
              borderRadius: 6,
              padding: '10px 14px',
              border: '1px solid #e2e8f0',
              marginBottom: 18,
            }}
          >
            <div style={{ fontSize: 12, color: '#475467' }}>
              <strong>From:</strong> {ackModalRecord?.fromName || ackModalRecord?.receivedFrom}
            </div>
            <div style={{ fontSize: 12, color: '#475467', marginTop: 4 }}>
              <strong>Particular:</strong> {ackModalRecord?.particularTitle || ackModalRecord?.documentType}
            </div>
          </div>

          <Checkbox
            checked={ackChecked}
            onChange={(e) => setAckChecked(e.target.checked)}
            style={{ fontSize: 14, fontWeight: 500, color: '#1e293b' }}
          >
            I have received document.
          </Checkbox>
        </div>
      </Modal>

      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileTextOutlined style={{ color: C.brand }} />
            <span>Correspondence Details - {selectedRecord?.referenceId}</span>
          </div>
        }
        open={Boolean(selectedRecord)}
        onClose={() => setSelectedRecord(null)}
        width={560}
      >
        {selectedRecord && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Card size="small" style={{ background: '#f8fafc', borderColor: C.border }}>
              <Row gutter={[16, 12]}>
                <Col span={12}>
                  <Text type="secondary" style={{ fontSize: 11 }}>REFERENCE ID</Text>
                  <div style={{ fontWeight: 700, color: '#1a73e8', fontSize: 15 }}>
                    {selectedRecord.referenceId}
                  </div>
                </Col>
                <Col span={12}>
                  <Text type="secondary" style={{ fontSize: 11 }}>FISCAL YEAR</Text>
                  <div style={{ fontWeight: 600 }}>{selectedRecord.fiscalYear}</div>
                </Col>
                <Col span={12}>
                  <Text type="secondary" style={{ fontSize: 11 }}>DATE</Text>
                  <div style={{ fontWeight: 600, color: C.text }}>
                    {selectedRecord.createdDate || selectedRecord.receivedDate || '—'}
                  </div>
                </Col>
                <Col span={12}>
                  <Text type="secondary" style={{ fontSize: 11 }}>TYPE</Text>
                  <div>
                    <Tag color={selectedRecord.type === 'outgoing' ? 'purple' : 'blue'}>
                      {(selectedRecord.type || 'incoming').toUpperCase()}
                    </Tag>
                  </div>
                </Col>
              </Row>
            </Card>

            <Divider style={{ margin: '8px 0' }} />

            <div>
              <Text type="secondary" style={{ fontSize: 11, fontWeight: 700 }}>PARTICULAR</Text>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginTop: 2 }}>
                {selectedRecord.particularTitle || selectedRecord.documentType || 'DOCUMENTS'}
              </div>
              <div style={{ color: C.muted, fontSize: 13 }}>
                {selectedRecord.particularSubtitle || selectedRecord.remarks || '—'}
              </div>
            </div>

            <Divider style={{ margin: '8px 0' }} />

            <Row gutter={[16, 12]}>
              <Col span={12}>
                <Text type="secondary" style={{ fontSize: 11, fontWeight: 700 }}>
                  {selectedRecord.type === 'outgoing' ? 'CREATED BY' : 'SENDER / FROM'}
                </Text>
                <div style={{ fontWeight: 600, color: C.text, marginTop: 2 }}>
                  {selectedRecord.type === 'outgoing'
                    ? (selectedRecord.createdBy || selectedRecord.receivedBy || selectedRecord.fromName || '—')
                    : (selectedRecord.fromName || selectedRecord.receivedFrom || '—')}
                </div>
                <div style={{ fontSize: 12, color: C.muted }}>
                  {selectedRecord.type === 'outgoing'
                    ? ''
                    : (selectedRecord.fromOrg || selectedRecord.vendorName || '')}
                </div>
              </Col>
              <Col span={12}>
                <Text type="secondary" style={{ fontSize: 11, fontWeight: 700 }}>DEPARTMENT</Text>
                <div style={{ fontWeight: 600, color: C.text, marginTop: 2 }}>
                  {selectedRecord.department || selectedRecord.forwardedToDept || '—'}
                </div>
              </Col>
            </Row>

            <Divider style={{ margin: '8px 0' }} />

            <Row gutter={[16, 12]}>
              <Col span={12}>
                <Text type="secondary" style={{ fontSize: 11, fontWeight: 700 }}>HANDOVER STATUS</Text>
                <div style={{ marginTop: 4 }}>
                  <Tag color={selectedRecord.handoverStatus === 'ACKNOWLEDGED' ? 'green' : 'gold'}>
                    {selectedRecord.handoverStatus || 'PENDING'}
                  </Tag>
                </div>
                {selectedRecord.handoverDate && (
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
                    {selectedRecord.handoverDate} {selectedRecord.handoverBy && `by ${selectedRecord.handoverBy}`}
                  </div>
                )}
              </Col>
              <Col span={12}>
                <Text type="secondary" style={{ fontSize: 11, fontWeight: 700 }}>REMARKS</Text>
                <div style={{ fontSize: 13, color: C.text, marginTop: 4 }}>
                  {selectedRecord.remarks || '—'}
                </div>
              </Col>
            </Row>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default CorrespondenceList;

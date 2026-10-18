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
} from '@ant-design/icons';
import {
  getCorrespondenceApi,
  updateHandoverStatusApi,
  getDepartmentsApi,
  getUsersApi,
} from '../API/correspondenceservice';
import NepaliDate from 'nepali-date-converter';
import NepaliDatePicker, { bsToAdString } from '../components/NepaliDatePicker';

 // Assuming you have a function to get the stored organization ID
//filter 
// Convert AD date or BS string to Nepali BS components using nepali-date-converter package
const formatNepaliDate = (dateInput) => {
  if (!dateInput) return null;
  try {
    let d;
    if (dateInput instanceof Date) {
      d = new NepaliDate(dateInput);
    } else if (typeof dateInput === 'string') {
      const trimmed = dateInput.trim();
      if (/^20[789]\d[-/][01]?\d[-/][0-3]?\d/.test(trimmed)) {
        const parts = trimmed.split(/[-/ :]/);
        d = new NepaliDate(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      } else {
        const parsed = new Date(trimmed);
        if (!isNaN(parsed.getTime())) {
          d = new NepaliDate(parsed);
        }
      }
    }
    if (d && !isNaN(d.getYear())) {
      return {
        bsDate: d.format('YYYY-MM-DD'),
        bsFormatted: d.format('DD MMMM YYYY'),
        fullBs: d.format('YYYY-MM-DD'),
      };
    }
  } catch (e) {
    // Return null on parse failure
  }
  return null;
};

const { Text } = Typography;
const { Option } = Select;

// Shared design tokens aligned with CityExpress theme
const C = {
  navy: '#013b73',
  darkNavy: '#03044b',
  brand: '#01519b',
  brandSoft: '#eaf2ff',
  accent: '#4da3ff',
  page: '#f4f7fc',
  cardBg: '#ffffff',
  filterBg: '#f8fafc',
  border: '#e2e8f0',
  filterBorder: '#d9e2ec',
  text: '#16202f',
  muted: '#667085',
  subtext: '#526071',
  success: '#12805c',
  successSoft: '#e6f6ef',
  warning: '#b54708',
  warningSoft: '#fffaeb',
};



const CorrespondenceList = ({ type = 'incoming' }) => {
  const isIncoming = type === 'incoming';
  const pageTitle = isIncoming ? 'Incoming Correspondence' : 'Outgoing Correspondence';

  // Server data state
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);

  // Search slip input state
  const [fiscalYear, setFiscalYear] = useState([]);
  const [department, setDepartment] = useState(undefined);
  const [user, setUser] = useState(undefined);
  const [dateFilter, setDateFilter] = useState('');

  // Active filter state applied to table query
  const [appliedFilters, setAppliedFilters] = useState({
    fiscalYear: 'FY2083_84',
    department: undefined,
    user: undefined,
    dateFilter: '',
  });

  const navigate = useNavigate();

  // Details Drawer state
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Load records from DB / Server
  const loadRecords = useCallback(async (filters = appliedFilters) => {
    setLoading(true);
    try {
      const data = await getCorrespondenceApi({
        type,
        fiscalYear: filters.fiscalYear,
        department: filters.department,
        user: filters.user,
      });
      setRecords(data || []);
    } catch (err) {
      console.error('Failed to load correspondence from server:', err);
      message.error(err.response?.data?.message || 'Failed to retrieve correspondence from server');
    } finally {
      setLoading(false);
    }
  }, [type, appliedFilters]);

  // Load departments and users from DB on mount
  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [deptList, userList] = await Promise.all([
          getDepartmentsApi(),
          getUsersApi(),
        ]);
        if (deptList && deptList.length > 0) {
          const names = deptList.map((d) => (d.Label || d.DepartmentName || '').trim()).filter(Boolean);
          if (names.length) setDepartments(names);
        }
        if (userList && userList.length > 0) {
          const names = userList.map((u) => (u.Label || u.FullName || u.Value || '').trim()).filter(Boolean);
          if (names.length) setUsers(names);
        }
      } catch (e) {
        console.error('Error fetching dropdowns:', e);
      }
    };
    fetchDropdowns();
  }, []);

  // Fetch records whenever type changes
  useEffect(() => {
    loadRecords(appliedFilters);
  }, [type, loadRecords, appliedFilters]);

  // Apply filters
  const handleApply = () => {
    const nextFilters = {
      fiscalYear,
      department,
      user,
      dateFilter: typeof dateFilter === 'string' ? dateFilter.trim() : '',
    };
    setAppliedFilters(nextFilters);
    loadRecords(nextFilters);
  };

  // Reset filters
  const handleReset = () => {
    setFiscalYear('FY2083_84');
    setDepartment(undefined);
    setUser(undefined);
    setDateFilter('');
    
  

  };

  // Date filter matching BS, formatted BS month, raw date, and equivalent AD date
  const filteredData = useMemo(() => {
    if (!appliedFilters.dateFilter) return records;
    const q = appliedFilters.dateFilter.trim().toLowerCase();
    return records.filter((item) => {
      const bs = formatNepaliDate(item.receivedDate);
      const bsDateStr = bs ? bs.bsDate.toLowerCase() : '';
      const bsFormattedStr = bs ? bs.bsFormatted.toLowerCase() : '';
      const rawDate = (item.receivedDate || '').toLowerCase();
      const adStr = (bs?.bsDate ? bsToAdString(bs.bsDate) : '').toLowerCase();
      return (
        bsDateStr.includes(q) ||
        bsFormattedStr.includes(q) ||
        rawDate.includes(q) ||
        adStr.includes(q)
      );
    });
  }, [records, appliedFilters.dateFilter]);

  // Acknowledge Document Handover in DB (One-way: PENDING -> ACKNOWLEDGED)
  const handleAcknowledgeHandover = async (record) => {
    if (record.handoverStatus === 'ACKNOWLEDGED') return;
    try {
      const now = new Date();
      const nowBs = formatNepaliDate(now);
      const formattedDate = nowBs
        ? nowBs.bsFormatted
        : `${now.getDate()} ${now.toLocaleString('default', { month: 'short' })} ${now.getFullYear()}`;

      const updated = await updateHandoverStatusApi({
        key: record.key,
        referenceId: record.referenceId,
        handoverStatus: 'ACKNOWLEDGED',
        handoverBy: 'ADMIN',
        handoverDate: formattedDate,
      });

      message.success(`Document handover acknowledged for ${record.referenceId}`);
      if (selectedRecord && selectedRecord.key === record.key) {
        setSelectedRecord(
          updated || {
            ...record,
            handoverStatus: 'ACKNOWLEDGED',
            handoverDate: formattedDate,
            handoverBy: 'ADMIN',
          }
        );
      }
      loadRecords(appliedFilters);
    } catch (err) {
      console.error('Failed to acknowledge handover:', err);
      message.error(err.response?.data?.message || 'Failed to acknowledge handover');
    }
  };

  const columns = [
    {
      title: 'S.NO',
      dataIndex: 'sno',
      key: 'sno',
      width: 60,
      align: 'center',
      render: (_, __, index) => <Text style={{ color: C.subtext, fontWeight: 500 }}>{index + 1}</Text>,
    },
    {
      title: 'FISCAL YEAR',
      dataIndex: 'fiscalYear',
      key: 'fiscalYear',
      width: 110,
      render: (val) => <Text style={{ color: C.text, fontWeight: 500 }}>{val}</Text>,
    },
    {
      title: 'PARTICULAR',
      key: 'particular',
      width: 170,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 700, color: C.text, fontSize: 13, textTransform: 'uppercase' }}>
            {record.particularTitle}fde
          </div>
          <div style={{ fontSize: 11, color: C.muted, textTransform: 'uppercase', marginTop: 2 }}>
            {record.particularSubtitle}
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
            {record.fromName}
          </div>
          <div style={{ fontSize: 11, color: C.muted, textTransform: 'uppercase', marginTop: 2 }}>
            {record.fromOrg}
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
        <Text style={{ fontWeight: 500, color: C.text, textTransform: 'uppercase' }}>
          {val}
        </Text>
      ),
    },
    {
      title: 'RECEIVED DATE (B.S.)',
      dataIndex: 'receivedDate',
      key: 'receivedDate',
      width: 180,
      render: (val) => {
        const bs = formatNepaliDate(val);
        return (
          <div>
            <div style={{ color: C.text, fontWeight: 600, fontSize: 13 }}>
              {bs ? bs.fullBs : val}
            </div>
            {bs && (
              <div style={{ color: C.muted, fontSize: 11, marginTop: 1 }}>
                {bs.bsFormatted}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'FORWARDED TO',
      key: 'forwardedTo',
      width: 210,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 700, color: C.text, fontSize: 13, textTransform: 'uppercase' }}>
            {record.forwardedToName}
          </div>
          <div style={{ fontSize: 11, color: C.muted, textTransform: 'uppercase', marginTop: 2 }}>
            {record.forwardedToDept}
          </div>
        </div>
      ),
    },
    {
      title: 'DOCUMENT HANDOVER',
      key: 'handover',
      width: 180,
      render: (_, record) => {
        const isAck = record.handoverStatus === 'ACKNOWLEDGED';
        const handoverBs = formatNepaliDate(record.handoverDate);

        return (
          <div>
            {isAck ? (
              <Tag
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.5px',
                  borderRadius: 4,
                  padding: '2px 8px',
                  color: '#01519b',
                  borderColor: '#b2d7ff',
                  background: '#f0f7ff',
                  textTransform: 'uppercase',
                  display: 'inline-block',
                }}
              >
                ACKNOWLEDGED
              </Tag>
            ) : (
              <Button
                size="small"
                onClick={() => handleAcknowledgeHandover(record)}
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.5px',
                  height: 24,
                  padding: '0 8px',
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
            )}
            {isAck && record.handoverDate && (
              <div style={{ marginTop: 4, fontSize: 11, color: C.text, fontWeight: 600 }}>
                {handoverBs ? handoverBs.bsFormatted : record.handoverDate}

                {record.handoverBy && (
                  <span style={{ display: 'block', color: C.muted, fontWeight: 500, fontSize: 10, textTransform: 'uppercase' }}>
                    {record.handoverBy}
                  </span>
                )}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'ACTION',
      dataIndex: 'referenceId',
      key: 'action',
      width: 170,
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

  return (
    <div style={{ padding: '20px 24px', background: C.page, minHeight: '100vh' }}>
      {/* Header section matching top of screenshot */}
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

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {isIncoming ? (
              <InboxOutlined style={{ fontSize: 24, color: C.darkNavy }} />
            ) : (
              <SendOutlined style={{ fontSize: 24, color: C.darkNavy }} />
            )}
            <h1
              style={{
                margin: 0,
                fontSize: 24,
                fontWeight: 600,
                color: C.darkNavy,
                fontFamily: "Georgia, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, serif",
                letterSpacing: '-0.3px',
              }}
            >
              {pageTitle}
            </h1>
          </div>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate(`/correspondence/${type}/new`)}
            style={{
              background: C.darkNavy,
              borderColor: C.darkNavy,
              fontWeight: 600,
              height: 36,
              borderRadius: 4,
              padding: '0 16px',
            }}
          >
            New Entry
          </Button>
        </div>
      </div>

      {/* SEARCH SLIP container */}
      <div style={{ position: 'relative', marginTop: 22, marginBottom: 18 }}>
        {/* Floating SEARCH SLIP label */}
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

        <div
          style={{
            background: C.filterBg,
            border: `1px solid ${C.filterBorder}`,
            borderRadius: 6,
            padding: '20px 18px 16px 18px',
          }}
        >
          <Row gutter={[16, 12]} align="bottom">
            {/* Fiscal Year */}
            <Col xs={24} sm={12} md={6} lg={4}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#3b556e', marginBottom: 6, letterSpacing: '0.4px' }}>
                <CalendarOutlined style={{ marginRight: 6 }} />
                FISCAL YEAR
              </div>
              <Select
                value={fiscalYear}
                onChange={setFiscalYear}
                style={{ width: '100%' }}
                placeholder="Select Fiscal Year"
              >
                <Option value="FY2083_84">FY2083_84</Option>
                <Option value="FY2082_83">FY2082_83</Option>
                <Option value="FY2081_82">FY2081_82</Option>
              </Select>
            </Col>

            {/* Department */}
            <Col xs={24} sm={12} md={6} lg={6}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#3b556e', marginBottom: 6, letterSpacing: '0.4px' }}>
                <ApartmentOutlined style={{ marginRight: 6 }} />
                DEPARTMENT
              </div>
              <Select
                value={department}
                onChange={setDepartment}
                placeholder="-- Select Department --"
                allowClear
                style={{ width: '100%' }}
              >
                {departments.map((dept) => (
                  <Option key={dept} value={dept}>
                    {dept}
                  </Option>
                ))}
              </Select>
            </Col>

            {/* User */}
            <Col xs={24} sm={12} md={6} lg={5}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#3b556e', marginBottom: 6, letterSpacing: '0.4px' }}>
                <UserOutlined style={{ marginRight: 6 }} />
                USER
              </div>
              <Select
                value={user}
                onChange={setUser}
                placeholder="--Select User--"
                allowClear
                style={{ width: '100%' }}
              >
                {users.map((u) => (
                  <Option key={u} value={u}>
                    {u}
                  </Option>
                ))}
              </Select>
            </Col>

            {/* Nepali Date (B.S.) */}
            <Col xs={24} sm={12} md={6} lg={5}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#3b556e', marginBottom: 6, letterSpacing: '0.4px' }}>
                <CalendarOutlined style={{ marginRight: 6 }} />
                DATE (B.S.)
              </div>
              <NepaliDatePicker
                value={dateFilter}
                onChange={setDateFilter}
                placeholder="Select Date(B.S.)"
                allowClear
                style={{ width: '100%' }}
              />
            </Col>

            {/* Actions */}
            <Col xs={24} sm={12} md={6} lg={4}>
              <Space style={{ width: '100%', justifyContent: 'flex-start' }}>
                <Button
                  type="primary"
                  onClick={handleApply}
                  style={{
                    background: '#0e70c4',
                    borderColor: '#0e70c4',
                    fontWeight: 600,
                    borderRadius: 4,
                    padding: '0 18px',
                    height: 34,
                  }}
                >
                  Apply
                </Button>
                <Button
                  onClick={handleReset}
                  style={{
                    borderRadius: 4,
                    height: 34,
                    padding: '0 14px',
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

      {/* organizationfilter */}

      {/* Record summary count */}
      <div style={{ marginBottom: 10, paddingLeft: 2 }}>
        <Text
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: '#344054',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
          }}
        >
          TOTAL ON RECORD:{' '}
          <span style={{ color: C.brand, fontWeight: 800 }}>{filteredData.length}</span>
        </Text>
      </div>

      {/* Table with Navy Blue Header */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: 6,
          border: `1px solid ${C.border}`,
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(16, 24, 40, 0.05)',
        }}
      >
        <Table
          dataSource={filteredData}
          columns={columns}
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          scroll={{ x: 1200 }}
          rowKey="key"
          components={{
            header: {
              cell: (props) => (
                <th
                  {...props}
                  style={{
                    ...props.style,
                    backgroundColor: '#013b73',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: 11,
                    letterSpacing: '0.6px',
                    padding: '12px 14px',
                    borderRight: '1px solid #002d59',
                  }}
                />
              ),
            },
          }}
        />
      </div>


      {/* Record Details Drawer */}
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
                  <Text type="secondary" style={{ fontSize: 11 }}>RECEIVED DATE (B.S.)</Text>
                  <div style={{ fontWeight: 600, color: C.text }}>
                    {formatNepaliDate(selectedRecord.receivedDate)?.fullBs || selectedRecord.receivedDate}
                  </div>
                  <div style={{ fontSize: 11, color: C.muted }}>
                    {formatNepaliDate(selectedRecord.receivedDate)?.bsFormatted}
                  </div>
                </Col>
                <Col span={12}>
                  <Text type="secondary" style={{ fontSize: 11 }}>RECEIVED BY</Text>
                  <div style={{ fontWeight: 600 }}>{selectedRecord.receivedBy}</div>
                </Col>
              </Row>
            </Card>

            <Divider style={{ margin: '8px 0' }} />

            <div>
              <Text type="secondary" style={{ fontSize: 11, fontWeight: 700 }}>PARTICULAR</Text>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginTop: 2 }}>
                {selectedRecord.particularTitle}
              </div>
              <div style={{ color: C.muted, fontSize: 13 }}>{selectedRecord.particularSubtitle}</div>
            </div>

            <Row gutter={16}>
              <Col span={12}>
                <Card size="small" title="Origin / From" headStyle={{ fontSize: 12, fontWeight: 600 }}>
                  <div style={{ fontWeight: 700, color: C.text }}>{selectedRecord.fromName}</div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{selectedRecord.fromOrg}</div>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" title="Forwarded To" headStyle={{ fontSize: 12, fontWeight: 600 }}>
                  <div style={{ fontWeight: 700, color: C.text }}>{selectedRecord.forwardedToName}</div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{selectedRecord.forwardedToDept}</div>
                </Card>
              </Col>
            </Row>

            <Card size="small" style={{ background: '#fcfdfd', borderColor: C.border }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text type="secondary" style={{ fontSize: 11 }}>HANDOVER STATUS</Text>
                  <div style={{ marginTop: 4 }}>
                    <Tag
                      color={selectedRecord.handoverStatus === 'ACKNOWLEDGED' ? 'green' : 'gold'}
                      style={{ fontWeight: 700 }}
                    >
                      {selectedRecord.handoverStatus}
                    </Tag>
                  </div>
                  {selectedRecord.handoverDate && (
                    <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>
                      Handed over on{' '}
                      {formatNepaliDate(selectedRecord.handoverDate)?.bsFormatted || selectedRecord.handoverDate}{' '}
                      by {selectedRecord.handoverBy}
                    </div>
                  )}
                </div>

                {selectedRecord.handoverStatus !== 'ACKNOWLEDGED' && (
                  <Button
                    size="small"
                    type="primary"
                    onClick={() => handleAcknowledgeHandover(selectedRecord)}
                    style={{
                      background: '#01519b',
                      borderColor: '#01519b',
                      fontWeight: 600,
                    }}
                  >
                    Acknowledge Handover
                  </Button>
                )}
              </div>
            </Card>

            {selectedRecord.remarks && (
              <div>
                <Text type="secondary" style={{ fontSize: 11, fontWeight: 700 }}>REMARKS</Text>
                <div
                  style={{
                    marginTop: 4,
                    padding: '10px 12px',
                    background: '#f8fafc',
                    borderRadius: 4,
                    fontSize: 13,
                    color: C.text,
                    border: '1px solid #edf2f7',
                  }}
                >
                  {selectedRecord.remarks}
                </div>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default CorrespondenceList;

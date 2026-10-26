import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Select, Row, Col, Empty, Tag, message } from 'antd';
import {
  FileTextOutlined,
  FilterOutlined,
  CalendarOutlined,
  ApartmentOutlined,
  ShopOutlined,
  DownloadOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { executeReportApi } from '../API/reportservice';
import genericService from '../../API/generic/genericservice';
import NepaliDatePicker, { bsToAdString } from '../../correspondence/components/NepaliDatePicker';
import { findStoredDepartment } from '../../API/api';

const { Option } = Select;

const C = {
  darkNavy: '#002b49',
  brand: '#01519b',
  border: '#e2e8f0',
  filterBorder: '#d9e2ec',
  text: '#16202f',
  muted: '#667085',
  subtext: '#526071',
};

const formatDate = (val) => {
  if (!val) return '—';
  const date = new Date(val);
  if (Number.isNaN(date.getTime())) return String(val);
  return date.toISOString().slice(0, 10);
};

const toAdDateString = (input) => {
  if (!input) return '';
  const str = String(input).trim();
  if (/^20[789]\d/.test(str)) return bsToAdString(str);
  return str.split('T')[0].split(' ')[0];
};

const renderType = (val) => {
  const isOutgoing = String(val || '').toLowerCase().includes('outgoing');
  return (
    <Tag
      color={isOutgoing ? 'purple' : 'blue'}
      style={{ fontWeight: 600, borderRadius: 4, margin: 0, fontSize: 11, textTransform: 'uppercase' }}
    >
      {isOutgoing ? 'Outgoing' : 'Incoming'}
    </Tag>
  );
};

const renderStatus = (val) => {
  const isAcknowledged = String(val || '').toLowerCase() === 'acknowledged';
  return (
    <Tag
      color={isAcknowledged ? 'green' : 'gold'}
      style={{ fontWeight: 600, borderRadius: 4, margin: 0, fontSize: 11, textTransform: 'uppercase' }}
    >
      {isAcknowledged ? 'Acknowledged' : 'Pending'}
    </Tag>
  );
};

const columns = [
  {
    title: 'S.NO',
    dataIndex: ['S.No'],
    key: 'sno',
    width: 70,
    align: 'center',
    render: (val) => <span style={{ color: C.subtext, fontWeight: 600 }}>{val ?? '—'}</span>,
  },
  {
    title: 'REFERENCE NO',
    dataIndex: ['Reference No'],
    key: 'referenceNo',
    width: 150,
    render: (val) => <span style={{ fontWeight: 700, color: C.brand }}>{val || '—'}</span>,
  },
  {
    title: 'DATE',
    dataIndex: ['Date'],
    key: 'date',
    width: 120,
    render: formatDate,
  },
  {
    title: 'TYPE',
    dataIndex: ['Type'],
    key: 'type',
    width: 110,
    render: renderType,
  },
  {
    title: 'DEPARTMENT',
    dataIndex: ['Department'],
    key: 'department',
    render: (val) => <span style={{ color: C.subtext }}>{val || '—'}</span>,
  },
  {
    title: 'ENTITY / VENDOR',
    dataIndex: ['Entity/Vendor'],
    key: 'entityVendor',
    render: (val) => <span>{val || '—'}</span>,
  },
  {
    title: 'SUBJECT / REMARKS',
    dataIndex: ['Subject/Remarks'],
    key: 'subjectRemarks',
    render: (val) => <span>{val || '—'}</span>,
  },
  {
    title: 'STATUS',
    dataIndex: ['Status'],
    key: 'status',
    width: 130,
    align: 'center',
    render: renderStatus,
  },
];

const escapeCSV = (val) => {
  if (val === null || val === undefined) return '';
  return `"${String(val).replace(/"/g, '""')}"`;
};

const CorrespondenceReport = () => {
  const [departments, setDepartments] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [department, setDepartment] = useState(undefined);
  const [vendor, setVendor] = useState(undefined);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [executed, setExecuted] = useState(false);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const [deptList, vendorList] = await Promise.all([genericService.getDepartments(), genericService.getVendors()]);
      if (!isMounted) return;
      setDepartments(deptList || []);
      setVendors(vendorList || []);

      const defaultDept = findStoredDepartment(deptList);
      if (defaultDept) setDepartment(defaultDept.Value || defaultDept.DepartmentId);
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleGenerate = useCallback(async () => {
    const startAd = toAdDateString(startDate);
    const endAd = toAdDateString(endDate);
    if (startAd && endAd && startAd > endAd) {
      message.warning('Start date cannot be after end date');
      return;
    }

    const params = {};
    if (startAd) params.StartDate = startAd;
    if (endAd) params.EndDate = endAd;
    if (department) params.Department = department;
    if (vendor) params.Vendor = vendor;

    setLoading(true);
    try {
      const response = await executeReportApi({
        procedureName: 'sProc_CorrespondenceReport',
        params,
      });
      if (response?.success === false) {
        message.error(response?.message || 'Failed to generate report');
        setRows([]);
      } else {
        setRows(
          (Array.isArray(response?.data) ? response.data : []).map((row, index) => ({
            ...row,
            _key: String(row['S.No'] ?? `row-${index}`),
          }))
        );
      }
    } catch (err) {
      setRows([]);
      message.error(err?.response?.data?.message || 'Failed to generate report');
    } finally {
      setExecuted(true);
      setLoading(false);
    }
  }, [startDate, endDate, department, vendor]);

  const handleReset = () => {
    const defaultDept = findStoredDepartment(departments);
    setStartDate(null);
    setEndDate(null);
    setDepartment(defaultDept?.Value || defaultDept?.DepartmentId);
    setVendor(undefined);
    setRows([]);
    setExecuted(false);
  };

  const handleExportCSV = () => {
    if (!rows.length) {
      message.warning('No data available to export');
      return;
    }

    const headers = ['S.No', 'Reference No', 'Date', 'Type', 'Department', 'Entity/Vendor', 'Subject/Remarks', 'Status'];
    const headerRow = headers.map(escapeCSV).join(',');
    const dataRows = rows.map((row) =>
      [
        row['S.No'],
        row['Reference No'],
        formatDate(row['Date']),
        String(row['Type'] || '').toLowerCase().includes('outgoing') ? 'Outgoing' : 'Incoming',
        row['Department'],
        row['Entity/Vendor'],
        row['Subject/Remarks'],
        String(row['Status'] || '').toLowerCase() === 'acknowledged' ? 'Acknowledged' : 'Pending',
      ]
        .map(escapeCSV)
        .join(',')
    );

    const csvContent = '\uFEFF' + [headerRow, ...dataRows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Correspondence_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    message.success('Report exported successfully');
  };

  return (
    <div style={{ padding: '4px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 8,
              background: '#e8f0fe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: C.brand,
              fontSize: 20,
            }}
          >
            <FileTextOutlined />
          </div>
          <div>
            <h2 style={{ margin: 0, color: C.darkNavy, fontWeight: 700, fontSize: 20 }}>Correspondence Report</h2>
            <span style={{ color: C.muted, fontSize: 13 }}>
              Incoming and outgoing correspondence registry
            </span>
          </div>
        </div>

        <Button
          icon={<DownloadOutlined />}
          onClick={handleExportCSV}
          disabled={!rows.length}
          style={{ fontWeight: 600, height: 38, borderRadius: 6, borderColor: C.border }}
        >
          Export CSV
        </Button>
      </div>

      <div
        style={{
          background: '#ffffff',
          border: `1px solid ${C.filterBorder}`,
          borderRadius: 8,
          overflow: 'hidden',
          marginBottom: 20,
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}
      >
        <div
          style={{
            background: C.brand,
            color: '#ffffff',
            padding: '10px 18px',
            fontSize: 14,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <FilterOutlined />
          <span>Filter Options</span>
        </div>

        <div style={{ padding: '18px 20px 16px' }}>
          <Row gutter={[12, 12]} align="bottom">
            <Col xs={24} sm={12} md={5}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#3b556e', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                <CalendarOutlined style={{ color: C.brand }} />
                <span>Start Date</span>
              </div>
              <NepaliDatePicker
                value={startDate}
                onChange={setStartDate}
                placeholder="Select start date"
                allowClear
                style={{ width: '100%', height: 38 }}
              />
            </Col>

            <Col xs={24} sm={12} md={5}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#3b556e', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                <CalendarOutlined style={{ color: C.brand }} />
                <span>End Date</span>
              </div>
              <NepaliDatePicker
                value={endDate}
                onChange={setEndDate}
                placeholder="Select end date"
                allowClear
                style={{ width: '100%', height: 38 }}
              />
            </Col>

            <Col xs={24} sm={12} md={5}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#3b556e', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                <ApartmentOutlined style={{ color: C.brand }} />
                <span>Department</span>
              </div>
              <Select
                value={department}
                onChange={setDepartment}
                placeholder="--Select Department--"
                allowClear
                showSearch
                style={{ width: '100%', height: 38 }}
              >
                {departments.map((d) => (
                  <Option key={d.Value} value={d.Value}>
                    {d.Label}
                  </Option>
                ))}
              </Select>
            </Col>

            <Col xs={24} sm={12} md={5}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#3b556e', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                <ShopOutlined style={{ color: C.brand }} />
                <span>Vendor</span>
              </div>
              <Select
                value={vendor}
                onChange={setVendor}
                placeholder="--Select Vendor--"
                allowClear
                showSearch
                style={{ width: '100%', height: 38 }}
              >
                {vendors.map((v) => (
                  <Option key={v.Value} value={v.Label}>
                    {v.Label}
                  </Option>
                ))}
              </Select>
            </Col>

            <Col xs={24} sm={24} md={4}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <Button
                  onClick={handleReset}
                  icon={<ReloadOutlined />}
                  style={{ height: 38, borderRadius: 6, fontWeight: 600 }}
                >
                  Reset
                </Button>
                <Button
                  type="primary"
                  onClick={handleGenerate}
                  loading={loading}
                  style={{
                    background: C.brand,
                    borderColor: C.brand,
                    fontWeight: 600,
                    height: 38,
                    borderRadius: 6,
                    padding: '0 18px',
                  }}
                >
                  <span style={{ color: '#ffffff' }}>Generate</span>
                </Button>
              </div>
            </Col>
          </Row>
        </div>
      </div>

      {executed && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: C.subtext }}>
            Total Records: {rows.length}
          </span>
        </div>
      )}

      <div
        style={{
          background: '#ffffff',
          border: `1px solid ${C.border}`,
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        {!executed ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <Empty description="Set the filters and click Generate to view the report." />
          </div>
        ) : !loading && rows.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <Empty description="No correspondence records found for the selected filters." />
          </div>
        ) : (
          <Table
            dataSource={rows}
            columns={columns}
            rowKey="_key"
            loading={loading}
            pagination={{ pageSize: 10 }}
            size="middle"
            scroll={{ x: 1000 }}
          />
        )}
      </div>
    </div>
  );
};

export default CorrespondenceReport;

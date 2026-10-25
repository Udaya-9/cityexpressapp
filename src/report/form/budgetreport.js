import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Table, Button, Select, Row, Col, Segmented, Empty, Tag, message } from 'antd';
import {
  FileTextOutlined,
  CalendarOutlined,
  ApartmentOutlined,
  DownloadOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import { getBudgetRequestsApi } from '../../budget/API/budgetservice';
import genericService from '../../API/generic/genericservice';
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

const formatCurrency = (amount) => {
  const num = Number(amount) || 0;
  return `Rs. ${num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const typeLabel = (val) => (String(val || '').toLowerCase().includes('demand') ? 'On-Demand' : 'Annual');

const renderType = (val) => (
  <Tag
    color={typeLabel(val) === 'On-Demand' ? 'geekblue' : 'blue'}
    style={{ fontWeight: 600, borderRadius: 4, margin: 0, fontSize: 11 }}
  >
    {typeLabel(val)}
  </Tag>
);

const renderStatus = (val) => (
  <span
    style={{
      fontWeight: 700,
      fontSize: 11,
      padding: '3px 8px',
      borderRadius: 4,
      textTransform: 'uppercase',
      color: val === 'Approved' ? '#059669' : val === 'Rejected' ? '#dc2626' : '#d97706',
      background: val === 'Approved' ? '#ecfdf5' : val === 'Rejected' ? '#fef2f2' : '#fffbeb',
      border: `1px solid ${val === 'Approved' ? '#a7f3d0' : val === 'Rejected' ? '#fecaca' : '#fde68a'}`,
    }}
  >
    {val || 'Pending'}
  </span>
);

const summaryColumns = [
  {
    title: 'HEADING CODE',
    dataIndex: 'headingCode',
    key: 'headingCode',
    width: 140,
    render: (val) => (
      <span style={{ fontWeight: 700, color: C.brand, background: '#e8f0fe', padding: '2px 8px', borderRadius: 4 }}>
        {val || '—'}
      </span>
    ),
  },
  {
    title: 'HEADING',
    dataIndex: 'heading',
    key: 'heading',
    render: (val) => <span style={{ fontWeight: 600, color: C.text }}>{val || '—'}</span>,
  },
  {
    title: 'DEPARTMENT',
    dataIndex: 'department',
    key: 'department',
    render: (val) => <span style={{ color: C.subtext }}>{val || '—'}</span>,
  },
  {
    title: 'FISCAL YEAR',
    dataIndex: 'fiscalYear',
    key: 'fiscalYear',
    render: (val) => <span>{val || '—'}</span>,
  },
  {
    title: 'TYPE',
    dataIndex: 'requestType',
    key: 'requestType',
    width: 120,
    render: renderType,
  },
  {
    title: 'ITEMS COUNT',
    dataIndex: 'itemCount',
    key: 'itemCount',
    align: 'center',
    render: (val) => <span style={{ fontWeight: 600 }}>{val}</span>,
  },
  {
    title: 'TOTAL REQUESTED',
    dataIndex: 'totalRequested',
    key: 'totalRequested',
    align: 'right',
    render: (val) => <span style={{ fontWeight: 700, color: C.darkNavy }}>{formatCurrency(val)}</span>,
  },
  {
    title: 'TOTAL APPROVED',
    dataIndex: 'totalApproved',
    key: 'totalApproved',
    align: 'right',
    render: (val) => <span style={{ fontWeight: 700, color: '#15803d' }}>{formatCurrency(val)}</span>,
  },
];

const detailColumns = [
  {
    title: 'CODE',
    dataIndex: 'code',
    key: 'code',
    width: 100,
    render: (val) => (
      <span style={{ fontWeight: 700, color: C.brand, background: '#e8f0fe', padding: '2px 8px', borderRadius: 4 }}>
        {val || '—'}
      </span>
    ),
  },
  {
    title: 'HEADING',
    dataIndex: 'heading',
    key: 'heading',
    render: (val) => <span style={{ fontWeight: 600, color: C.text }}>{val || '—'}</span>,
  },
  {
    title: 'SUB HEADING',
    dataIndex: 'subHeading',
    key: 'subHeading',
    render: (val, record) => <span>{val || record.subHeadingTitle || '—'}</span>,
  },
  {
    title: 'DEPARTMENT',
    dataIndex: 'department',
    key: 'department',
    render: (val) => <span style={{ color: C.subtext }}>{val || '—'}</span>,
  },
  {
    title: 'FISCAL YEAR',
    dataIndex: 'fiscalYear',
    key: 'fiscalYear',
    render: (val) => <span>{val || '—'}</span>,
  },
  {
    title: 'TYPE',
    dataIndex: 'requestType',
    key: 'requestType',
    width: 120,
    render: renderType,
  },
  {
    title: 'REQUESTED AMOUNT',
    dataIndex: 'requestedAmount',
    key: 'requestedAmount',
    align: 'right',
    render: (val) => <span style={{ fontWeight: 700, color: C.darkNavy }}>{formatCurrency(val)}</span>,
  },
  {
    title: 'APPROVED AMOUNT',
    dataIndex: 'approvedAmount',
    key: 'approvedAmount',
    align: 'right',
    render: (val) => <span style={{ fontWeight: 700, color: '#15803d' }}>{formatCurrency(val)}</span>,
  },
  {
    title: 'STATUS',
    dataIndex: 'status',
    key: 'status',
    align: 'center',
    render: renderStatus,
  },
];

const escapeCSV = (val) => {
  if (val === null || val === undefined) return '';
  return `"${String(val).replace(/"/g, '""')}"`;
};

const downloadCSV = (headers, rows, fileName) => {
  const headerRow = headers.map(escapeCSV).join(',');
  const dataRows = rows.map((row) => row.map(escapeCSV).join(','));
  const csvContent = '\uFEFF' + [headerRow, ...dataRows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const BudgetReport = () => {
  const [fiscalYears, setFiscalYears] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [fiscalYear, setFiscalYear] = useState(undefined);
  const [department, setDepartment] = useState(undefined);
  const [viewMode, setViewMode] = useState('summary');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const [fyList, deptList] = await Promise.all([genericService.getFiscalYears(), genericService.getDepartments()]);
      if (!isMounted) return;
      setFiscalYears(fyList || []);
      setDepartments(deptList || []);
      if (fyList?.length) {
        setFiscalYear(fyList[0]?.Value || fyList[0]?.FiscalYear || fyList[0]?.Label);
      }

      const defaultDept = findStoredDepartment(deptList);
      if (defaultDept) setDepartment(defaultDept.Value || defaultDept.DepartmentId);
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!department) {
      setRows([]);
      return undefined;
    }
    let isActive = true;
    (async () => {
      setLoading(true);
      try {
        const data = await getBudgetRequestsApi({ fiscalYear, departmentId: department });
        if (!isActive) return;
        setRows(
          (Array.isArray(data) ? data : []).map((item, index) => ({
            ...item,
            _key: String(item.id || item.RequestID || item.requestId || `row-${index}`),
          }))
        );
      } finally {
        if (isActive) setLoading(false);
      }
    })();
    return () => {
      isActive = false;
    };
  }, [fiscalYear, department]);

  const summaryData = useMemo(() => {
    const map = {};
    rows.forEach((item) => {
      const type = typeLabel(item.requestType);
      const groupKey = `${item.headingCode || item.heading}_${item.department || ''}_${item.fiscalYear || ''}_${type}`;
      if (!map[groupKey]) {
        map[groupKey] = {
          key: groupKey,
          headingCode: item.headingCode || '—',
          heading: item.heading || '—',
          department: item.department || '—',
          fiscalYear: item.fiscalYear || '—',
          requestType: type,
          itemCount: 0,
          totalRequested: 0,
          totalApproved: 0,
        };
      }
      map[groupKey].itemCount += 1;
      map[groupKey].totalRequested += Number(item.requestedAmount || 0);
      map[groupKey].totalApproved += Number(item.approvedAmount || 0);
    });
    return Object.values(map);
  }, [rows]);

  const handleExportCSV = useCallback(() => {
    if (!rows.length) {
      message.warning('No data available to export');
      return;
    }

    const fileName = `Budget_${viewMode === 'summary' ? 'Summary' : 'Detail'}_${fiscalYear || 'All'}.csv`;

    if (viewMode === 'summary') {
      downloadCSV(
        ['Heading Code', 'Heading', 'Department', 'Fiscal Year', 'Type', 'Items Count', 'Total Requested', 'Total Approved'],
        summaryData.map((row) => [
          row.headingCode,
          row.heading,
          row.department,
          row.fiscalYear,
          row.requestType,
          row.itemCount,
          row.totalRequested,
          row.totalApproved,
        ]),
        fileName
      );
    } else {
      downloadCSV(
        ['Code', 'Heading', 'Sub Heading', 'Department', 'Fiscal Year', 'Type', 'Requested Amount', 'Approved Amount', 'Status'],
        rows.map((row) => [
          row.code,
          row.heading,
          row.subHeading || row.subHeadingTitle,
          row.department,
          row.fiscalYear,
          typeLabel(row.requestType),
          Number(row.requestedAmount || 0),
          Number(row.approvedAmount || 0),
          row.status || 'Pending',
        ]),
        fileName
      );
    }

    message.success('Report exported successfully');
  }, [rows, summaryData, viewMode, fiscalYear]);

  const isSummaryMode = viewMode === 'summary';

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
            <h2 style={{ margin: 0, color: C.darkNavy, fontWeight: 700, fontSize: 20 }}>Budget Report</h2>
            <span style={{ color: C.muted, fontSize: 13 }}>
              Summary and detail views of departmental budget requests
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
                <span>Fiscal Year</span>
              </div>
              <Select
                value={fiscalYear}
                onChange={setFiscalYear}
                placeholder="--Select Fiscal Year--"
                style={{ width: '100%', height: 38 }}
              >
                {fiscalYears.map((fy) => {
                  const val = fy.Value || fy.FiscalYear || fy.Label;
                  const lbl = fy.Label || fy.FiscalYear || fy.Value;
                  return (
                    <Option key={val} value={val}>
                      {lbl}
                    </Option>
                  );
                })}
              </Select>
            </Col>

            <Col xs={24} sm={12} md={6}>
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
                {departments.map((d) => {
                  const val = d.Value || d.DepartmentId || d.id;
                  const lbl = d.Label || d.DepartmentName || d.name;
                  return (
                    <Option key={val} value={val}>
                      {lbl}
                    </Option>
                  );
                })}
              </Select>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#3b556e', marginBottom: 6 }}>
                <span>View</span>
              </div>
              <Segmented
                value={viewMode}
                onChange={setViewMode}
                options={[
                  { label: 'Summary', value: 'summary' },
                  { label: 'Detail', value: 'detail' },
                ]}
                block
              />
            </Col>
          </Row>
        </div>
      </div>

      <div
        style={{
          background: '#ffffff',
          border: `1px solid ${C.border}`,
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        {!department ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <Empty description="Select a department to view the budget report." />
          </div>
        ) : !loading && rows.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <Empty description="No budget records found for the selected filters." />
          </div>
        ) : isSummaryMode ? (
          <Table
            dataSource={summaryData}
            columns={summaryColumns}
            rowKey="key"
            loading={loading}
            pagination={{ pageSize: 10 }}
            size="middle"
            summary={(pageData) => {
              const totals = pageData.reduce(
                (acc, row) => ({
                  itemCount: acc.itemCount + row.itemCount,
                  totalRequested: acc.totalRequested + row.totalRequested,
                  totalApproved: acc.totalApproved + row.totalApproved,
                }),
                { itemCount: 0, totalRequested: 0, totalApproved: 0 }
              );
              return (
                <Table.Summary.Row style={{ background: '#f8fafc' }}>
                  <Table.Summary.Cell index={0} colSpan={5}>
                    <span style={{ fontWeight: 700, color: C.darkNavy }}>Grand Total</span>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={5} align="center">
                    <span style={{ fontWeight: 700 }}>{totals.itemCount}</span>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={6} align="right">
                    <span style={{ fontWeight: 700, color: C.darkNavy }}>{formatCurrency(totals.totalRequested)}</span>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={7} align="right">
                    <span style={{ fontWeight: 700, color: '#15803d' }}>{formatCurrency(totals.totalApproved)}</span>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              );
            }}
          />
        ) : (
          <Table
            dataSource={rows}
            columns={detailColumns}
            rowKey="_key"
            loading={loading}
            pagination={{ pageSize: 10 }}
            size="middle"
          />
        )}
      </div>
    </div>
  );
};

export default BudgetReport;

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Button,
  Select,
  Row,
  Col,
  InputNumber,
  Radio,
  message,
  Empty,
  Typography,
  Spin,
  Tag,
} from 'antd';
import {
  AuditOutlined,
  CalendarOutlined,
  ApartmentOutlined,
  DownloadOutlined,
  FolderOpenOutlined,
} from '@ant-design/icons';
import {
  getFiscalYearsApi,
  getDepartmentsApi,
  getBudgetRequestsApi,
  updateBudgetApprovalStatusApi,
} from '../API/budgetservice';

const { Text } = Typography;
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

const BudgetApproval = () => {
  const [fiscalYears, setFiscalYears] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [fiscalYear, setFiscalYear] = useState(undefined);
  const [department, setDepartment] = useState(undefined);

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Editable approval states
  const [approvalStatuses, setApprovalStatuses] = useState({});
  const [approvedAmounts, setApprovedAmounts] = useState({});

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const [fyList, deptList] = await Promise.all([
          getFiscalYearsApi(),
          getDepartmentsApi(),
        ]);
        if (!isMounted) return;
        setFiscalYears(fyList || []);
        setDepartments(deptList || []);

        if (fyList?.length) {
          const firstFy = fyList[0]?.Value || fyList[0]?.FiscalYear || fyList[0]?.Label || fyList[0];
          setFiscalYear(firstFy);
        }
      } catch (err) {
        console.error(err);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const loadRequests = useCallback(async () => {
    if (!fiscalYear || !department) {
      setRequests([]);
      return;
    }
    try {
      setLoading(true);
      const data = await getBudgetRequestsApi({
        fiscalYear,
        departmentId: department,
      });
      const list = Array.isArray(data) ? data : [];
      setRequests(list);

      const statuses = {};
      const amounts = {};
      list.forEach((item) => {
        const key = item.id || item.code;
        statuses[key] = item.status || 'Approve';
        amounts[key] = item.approvedAmount !== undefined ? item.approvedAmount : (item.requestedAmount || 0);
      });
      setApprovalStatuses(statuses);
      setApprovedAmounts(amounts);
    } catch {
      message.error('Failed to load budget approval requests');
    } finally {
      setLoading(false);
    }
  }, [fiscalYear, department]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleStatusChange = (key, val) => {
    setApprovalStatuses((prev) => ({
      ...prev,
      [key]: val,
    }));
  };

  const handleAmountChange = (key, val) => {
    setApprovedAmounts((prev) => ({
      ...prev,
      [key]: val || 0,
    }));
  };

  // Group requests by Heading
  const groupedRequests = useMemo(() => {
    const groups = {};
    requests.forEach((req) => {
      const headingKey = req.heading || req.headingTitle || 'GENERAL';
      if (!groups[headingKey]) {
        groups[headingKey] = {
          heading: headingKey,
          code: req.headingCode || req.code?.charAt(0) || 'H',
          items: [],
        };
      }
      groups[headingKey].items.push(req);
    });
    return Object.values(groups);
  }, [requests]);

  const pendingRequests = useMemo(() => {
    return requests.filter((r) => r.status === 'Pending' || !r.status);
  }, [requests]);

  const groupSubtotals = useMemo(() => {
    const totals = {};
    groupedRequests.forEach((group) => {
      let subTotal = 0;
      group.items.forEach((item) => {
        const key = item.id || item.code;
        if (item.status === 'Approved') {
          subTotal += Number(item.approvedAmount || 0);
        } else if (item.status !== 'Rejected') {
          const chosen = approvalStatuses[key] || 'Approve';
          if (chosen === 'Approve') {
            subTotal += Number(
              approvedAmounts[key] !== undefined ? approvedAmounts[key] : (item.requestedAmount || 0)
            );
          }
        }
      });
      totals[group.heading] = subTotal;
    });
    return totals;
  }, [groupedRequests, approvalStatuses, approvedAmounts]);

  const handleApproveAll = async () => {
    if (pendingRequests.length === 0) {
      message.info('All budget requests have already been finalized');
      return;
    }

    try {
      setSubmitting(true);
      const updates = pendingRequests.map((item) => {
        const key = item.id || item.code;
        const chosen = approvalStatuses[key] || 'Approve';
        const status = chosen === 'Reject' || chosen === 'Rejected' ? 'Rejected' : 'Approved';
        const approvedAmount =
          status === 'Rejected'
            ? 0
            : Number(approvedAmounts[key] !== undefined ? approvedAmounts[key] : (item.requestedAmount || 0));
        return updateBudgetApprovalStatusApi({ id: item.id, status, approvedAmount });
      });

      await Promise.all(updates);
      message.success('Budget approvals updated successfully!');
      loadRequests();
    } catch (err) {
      const errMsg = err?.response?.data?.message || err?.message || 'Failed to save budget approvals';
      message.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportCSV = () => {
    if (requests.length === 0) {
      message.info('No budget requests to export');
      return;
    }

    const rows = [
      ['Fiscal Year', 'Department', 'Heading', 'Sub Heading', 'Code', 'Status', 'Requested Amount', 'Approved Amount'],
    ];

    requests.forEach((r) => {
      const key = r.id || r.code;
      rows.push([
        `"${r.fiscalYear || fiscalYear || ''}"`,
        `"${r.department || department || ''}"`,
        `"${r.heading || ''}"`,
        `"${r.subHeading || ''}"`,
        `"${r.code || ''}"`,
        `"${approvalStatuses[key] || r.status || 'Approve'}"`,
        `"${r.requestedAmount || 0}"`,
        `"${approvedAmounts[key] !== undefined ? approvedAmounts[key] : r.approvedAmount || 0}"`,
      ]);
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Budget_Approval_${fiscalYear || ''}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const hasFilterSelected = Boolean(fiscalYear && department);

  return (
    <div style={{ padding: '4px 0' }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
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
              <AuditOutlined />
            </div>
            <div>
              <h2 style={{ margin: 0, color: C.darkNavy, fontWeight: 700, fontSize: 20 }}>
                Budget Approval
              </h2>
              <Text style={{ color: C.muted, fontSize: 13 }}>
                Review and approve departmental budget requests
              </Text>
            </div>
          </div>

          <Button
            icon={<DownloadOutlined />}
            onClick={handleExportCSV}
            style={{
              fontWeight: 600,
              height: 38,
              borderRadius: 6,
              borderColor: C.border,
            }}
          >
            Export CSV
          </Button>
        </div>
      </div>

      <div
        style={{
          background: '#ffffff',
          border: `1px solid ${C.filterBorder}`,
          borderRadius: 8,
          padding: '16px 20px',
          marginBottom: 20,
          boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
        }}
      >
        <Row gutter={[16, 12]} align="bottom">
          <Col xs={24} sm={12} md={6}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#3b556e',
                marginBottom: 6,
                letterSpacing: '0.4px',
                textTransform: 'uppercase',
              }}
            >
              <CalendarOutlined style={{ marginRight: 6 }} />
              FISCAL YEAR
            </div>
            <Select
              value={fiscalYear}
              onChange={setFiscalYear}
              placeholder="--Select Fiscal Year--"
              style={{ width: '100%', height: 38 }}
            >
              {fiscalYears.map((fy) => {
                const val = fy.Value || fy.FiscalYear || fy.Label || fy;
                const lbl = fy.Label || fy.FiscalYear || fy.Value || fy;
                return (
                  <Option key={val} value={val}>
                    {lbl}
                  </Option>
                );
              })}
            </Select>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#3b556e',
                marginBottom: 6,
                letterSpacing: '0.4px',
                textTransform: 'uppercase',
              }}
            >
              <ApartmentOutlined style={{ marginRight: 6 }} />
              DEPARTMENT
            </div>
            <Select
              value={department}
              onChange={setDepartment}
              placeholder="--Select Department--"
              allowClear
              showSearch
              style={{ width: '100%', height: 38 }}
            >
              {departments.map((dept) => {
                const val = dept.Value || dept.DepartmentId || dept.id || dept;
                const lbl = dept.Label || dept.DepartmentName || dept.name || dept;
                return (
                  <Option key={val} value={val}>
                    {lbl}
                  </Option>
                );
              })}
            </Select>
          </Col>
        </Row>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" />
        </div>
      ) : !hasFilterSelected ? (
        <div
          style={{
            background: '#ffffff',
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            padding: '60px 20px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 8,
              border: `2px solid #3b82f6`,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#3b82f6',
              fontSize: 22,
              marginBottom: 12,
            }}
          >
            []
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.darkNavy, marginBottom: 4 }}>
            No Information to Update
          </div>
          <Text style={{ color: C.muted, fontSize: 13 }}>
            Please select Fiscal Year and Department to view budget data
          </Text>
        </div>
      ) : requests.length === 0 ? (
        <div
          style={{
            background: '#ffffff',
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            padding: '60px 20px',
            textAlign: 'center',
          }}
        >
          <Empty description="No budget requests found for the selected department and fiscal year." />
        </div>
      ) : (
        <div>
          {groupedRequests.map((group) => {
            const groupSubtotal = groupSubtotals[group.heading] || 0;

            return (
              <div
                key={group.heading}
                style={{
                  marginBottom: 20,
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                  overflow: 'hidden',
                  background: '#ffffff',
                }}
              >
                <div
                  style={{
                    background: '#01519b',
                    padding: '10px 18px',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 13, textTransform: 'uppercase' }}>
                    <FolderOpenOutlined />
                    <span>{group.heading}</span>
                  </div>
                  <div
                    style={{
                      padding: '2px 8px',
                      borderRadius: 12,
                      background: 'rgba(255,255,255,0.2)',
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    #{group.code}
                  </div>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: `1px solid ${C.border}` }}>
                      <th style={{ padding: '10px 18px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#475569', width: 90 }}>
                        CODE
                      </th>
                      <th style={{ padding: '10px 18px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#475569' }}>
                        SUB HEADING
                      </th>
                      <th style={{ padding: '10px 18px', textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#475569', width: 220 }}>
                        STATUS
                      </th>
                      <th style={{ padding: '10px 18px', textAlign: 'right', fontSize: 11, fontWeight: 700, color: '#475569', width: 180 }}>
                        REQUESTED AMOUNT
                      </th>
                      <th style={{ padding: '10px 18px', textAlign: 'right', fontSize: 11, fontWeight: 700, color: '#475569', width: 220 }}>
                        APPROVED AMOUNT
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.items.map((item) => {
                      const key = item.id || item.code;
                      const statusVal = approvalStatuses[key] || 'Approve';
                      const isFinalized = item.status === 'Approved' || item.status === 'Rejected';

                      return (
                        <tr key={key} style={{ borderBottom: `1px solid #f1f5f9` }}>
                          <td style={{ padding: '12px 18px' }}>
                            <span style={{ fontWeight: 700, color: C.brand, background: '#e8f0fe', padding: '2px 8px', borderRadius: 4, fontSize: 12 }}>
                              {item.code || '—'}
                            </span>
                          </td>
                          <td style={{ padding: '12px 18px', fontWeight: 600, color: C.text, fontSize: 13 }}>
                            {item.subHeading || item.subHeadingTitle}
                          </td>
                          <td style={{ padding: '12px 18px', textAlign: 'center' }}>
                            {isFinalized ? (
                              <Tag
                                color={item.status === 'Approved' ? 'success' : 'error'}
                                style={{ fontWeight: 700, padding: '4px 12px', fontSize: 12, borderRadius: 4 }}
                              >
                                {item.status.toUpperCase()}
                              </Tag>
                            ) : (
                              <Radio.Group
                                value={statusVal}
                                onChange={(e) => handleStatusChange(key, e.target.value)}
                              >
                                <Radio
                                  value="Approve"
                                  style={{
                                    background: '#ecfdf5',
                                    border: '1px solid #a7f3d0',
                                    color: '#059669',
                                    fontWeight: 600,
                                    fontSize: 12,
                                    padding: '4px 10px',
                                    borderRadius: 4,
                                    marginRight: 8,
                                  }}
                                >
                                  Approve
                                </Radio>
                                <Radio
                                  value="Reject"
                                  style={{
                                    background: '#fef2f2',
                                    border: '1px solid #fecaca',
                                    color: '#dc2626',
                                    fontWeight: 600,
                                    fontSize: 12,
                                    padding: '4px 10px',
                                    borderRadius: 4,
                                  }}
                                >
                                  Reject
                                </Radio>
                              </Radio.Group>
                            )}
                          </td>
                          <td style={{ padding: '12px 18px', textAlign: 'right', fontWeight: 600, color: C.darkNavy }}>
                            {formatCurrency(item.requestedAmount)}
                          </td>
                          <td style={{ padding: '12px 18px', textAlign: 'right' }}>
                            {isFinalized ? (
                              item.status === 'Approved' ? (
                                <span style={{ fontWeight: 700, color: '#15803d', fontSize: 14 }}>
                                  {formatCurrency(item.approvedAmount)}
                                </span>
                              ) : (
                                <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: 13 }}>Rs. 0.00</span>
                              )
                            ) : (
                              <div style={{ display: 'inline-flex', alignItems: 'center', border: `1px solid #cbd5e1`, borderRadius: 4, overflow: 'hidden' }}>
                                <span style={{ background: '#01519b', color: '#ffffff', padding: '6px 10px', fontSize: 12, fontWeight: 600 }}>
                                  Rs.
                                </span>
                                <InputNumber
                                  min={0}
                                  bordered={false}
                                  disabled={statusVal === 'Reject'}
                                  value={approvedAmounts[key] !== undefined ? approvedAmounts[key] : (item.requestedAmount || 0)}
                                  onChange={(val) => handleAmountChange(key, val)}
                                  formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                  parser={(val) => (val ? val.replace(/\$\s?|(,*)/g, '') : '')}
                                  style={{ width: 120, textAlign: 'right' }}
                                />
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <div
                  style={{
                    padding: '10px 18px',
                    background: '#f8fafc',
                    borderTop: `1px solid ${C.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>
                    Subtotal for Group
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.darkNavy }}>
                    {formatCurrency(groupSubtotal)}
                  </span>
                </div>
              </div>
            );
          })}

          <div style={{ textAlign: 'center', marginTop: 24, marginBottom: 20 }}>
            <Button
              type="primary"
              size="large"
              loading={submitting}
              disabled={pendingRequests.length === 0}
              onClick={handleApproveAll}
              style={{
                background: pendingRequests.length === 0 ? '#94a3b8' : '#15803d',
                borderColor: pendingRequests.length === 0 ? '#94a3b8' : '#15803d',
                fontWeight: 700,
                height: 42,
                borderRadius: 6,
                padding: '0 36px',
              }}
            >
              {pendingRequests.length === 0 ? 'All Requests Finalized' : `Apply Approvals (${pendingRequests.length} Pending)`}
            </Button>
            <div style={{ marginTop: 8, fontSize: 12, color: C.muted }}>
              {pendingRequests.length === 0
                ? 'All requests have been approved or rejected. Finalized records cannot be modified.'
                : 'Review all amounts carefully before submitting'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetApproval;

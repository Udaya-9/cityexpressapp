import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Table,
  Button,
  Select,
  InputNumber,
  Row,
  Col,
  message,
  Empty,
  Typography,
  Alert,
  Tag,
  Input,
} from 'antd';
import {
  FileTextOutlined,
  FilterOutlined,
  PlusOutlined,
  ArrowLeftOutlined,
  CalendarOutlined,
  ApartmentOutlined,
  UnorderedListOutlined,
  TagOutlined,
  DownloadOutlined,
  FolderOpenOutlined,
  DollarCircleOutlined,
} from '@ant-design/icons';
import {
  getFiscalYearsApi,
  getDepartmentsApi,
  getBudgetHeadingsApi,
  getBudgetSubheadingsApi,
  getBudgetRequestsApi,
  submitBudgetRequestApi,
  getStaticDataApi,
} from '../API/budgetservice';

const { Text } = Typography;
const { Option } = Select;

const C = {
  darkNavy: '#002b49',
  brand: '#01519b',
  brandSoft: '#eaf2ff',
  page: '#f4f7fc',
  filterBg: '#ffffff',
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

const BudgetManagement = () => {
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'create'

  const [fiscalYears, setFiscalYears] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [headings, setHeadings] = useState([]);
  const [subheadings, setSubheadings] = useState([]);

  // Filter options for List view (Image 1)
  const [reportTypes, setReportTypes] = useState([]);
  const [reportTypeFilter, setReportTypeFilter] = useState(undefined);
  const [departmentFilter, setDepartmentFilter] = useState(undefined);
  const [fiscalYearFilter, setFiscalYearFilter] = useState(undefined);
  const [headingFilter, setHeadingFilter] = useState(undefined);
  const [subHeadingFilter, setSubHeadingFilter] = useState(undefined);

  const [appliedFilters, setAppliedFilters] = useState({
    reportType: undefined,
    department: undefined,
    fiscalYear: undefined,
    heading: undefined,
    subHeading: undefined,
    requestType: 'ALL',
  });

  const [budgetList, setBudgetList] = useState([]);
  const [loading, setLoading] = useState(false);

  // States for Create view (Image 2)
  const [createFiscalYear, setCreateFiscalYear] = useState(undefined);
  const [createHeadingFilter, setCreateHeadingFilter] = useState('ALL');
  const [createRequestType, setCreateRequestType] = useState('Annual Budget'); // 'Annual Budget' | 'onDemand Budget'
  const [existingAnnualApproved, setExistingAnnualApproved] = useState(false);
  const [onDemandRemarks, setOnDemandRemarks] = useState({});
  const [createHeadings, setCreateHeadings] = useState([]);
  const [createSubheadings, setCreateSubheadings] = useState([]);
  const [requestedAmounts, setRequestedAmounts] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const [fyList, deptList, reportTypeList] = await Promise.all([
          getFiscalYearsApi(),
          getDepartmentsApi(),
          getStaticDataApi('Report'),
        ]);
        if (!isMounted) return;
        setFiscalYears(fyList || []);
        setDepartments(deptList || []);
        setReportTypes(reportTypeList || []);

        if (fyList?.length) {
          const firstFy = fyList[0]?.Value || fyList[0]?.FiscalYear || fyList[0]?.Label || fyList[0];
          setFiscalYearFilter(firstFy);
          setCreateFiscalYear(firstFy);
          setAppliedFilters((prev) => ({ ...prev, fiscalYear: firstFy }));
        }
      } catch (err) {
        console.error(err);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const loadHeadingsAndSubs = useCallback(async (fy) => {
    if (!fy) return;
    try {
      const [hList, sList] = await Promise.all([
        getBudgetHeadingsApi(fy),
        getBudgetSubheadingsApi(fy),
      ]);
      setHeadings(Array.isArray(hList) ? hList : []);
      setSubheadings(Array.isArray(sList) ? sList : []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    if (fiscalYearFilter) {
      loadHeadingsAndSubs(fiscalYearFilter);
    }
  }, [fiscalYearFilter, loadHeadingsAndSubs]);

  const loadListData = useCallback(async (filters) => {
    try {
      setLoading(true);
      const data = await getBudgetRequestsApi({
        fiscalYear: filters.fiscalYear,
        departmentId: filters.department,
        reportType: filters.reportType,
        requestType: filters.requestType && filters.requestType !== 'ALL' ? filters.requestType : undefined,
      });
      let result = Array.isArray(data) ? data : [];
      if (filters.heading) {
        result = result.filter((r) => r.heading === filters.heading || r.headingCode === filters.heading);
      }
      if (filters.subHeading) {
        result = result.filter((r) => r.subHeading === filters.subHeading || r.code === filters.subHeading);
      }
      if (filters.requestType && filters.requestType !== 'ALL') {
        const isD = filters.requestType.toLowerCase().includes('demand');
        result = result.filter((r) => {
          const itemD = String(r.requestType || '').toLowerCase().includes('demand');
          return isD ? itemD : !itemD;
        });
      }
      setBudgetList(result);
    } catch {
      message.error('Failed to load budget data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (viewMode === 'list' && appliedFilters.fiscalYear) {
      loadListData(appliedFilters);
    }
  }, [viewMode, appliedFilters, loadListData]);

  const handleHeadingFilterChange = (val) => {
    setHeadingFilter(val);
    setSubHeadingFilter(undefined);
  };

  const filteredSubheadings = useMemo(() => {
    if (!headingFilter) return [];
    return subheadings.filter((s) => {
      const matchCode = s.headingCode && String(s.headingCode).toLowerCase() === String(headingFilter).toLowerCase();
      const matchHead = s.heading && String(s.heading || s.headingTitle).toLowerCase() === String(headingFilter).toLowerCase();
      const matchId = s.BudgetHeadId && String(s.BudgetHeadId).toLowerCase() === String(headingFilter).toLowerCase();
      return matchCode || matchHead || matchId;
    });
  }, [headingFilter, subheadings]);

  const handleApplyFilter = () => {
    setAppliedFilters({
      reportType: reportTypeFilter,
      department: departmentFilter,
      fiscalYear: fiscalYearFilter,
      heading: headingFilter,
      subHeading: subHeadingFilter,
      requestType: 'ALL',
    });
  };

  const handleResetFilter = () => {
    setReportTypeFilter(undefined);
    setDepartmentFilter(undefined);
    setHeadingFilter(undefined);
    setSubHeadingFilter(undefined);
    const defaultFy = fiscalYears[0]?.Value || fiscalYears[0]?.FiscalYear || fiscalYears[0]?.Label;
    setFiscalYearFilter(defaultFy);
    setAppliedFilters({
      reportType: undefined,
      department: undefined,
      fiscalYear: defaultFy,
      heading: undefined,
      subHeading: undefined,
      requestType: 'ALL',
    });
  };

  useEffect(() => {
    if (viewMode === 'create' && createFiscalYear) {
      let isMounted = true;
      (async () => {
        try {
          const [hList, sList, reqList] = await Promise.all([
            getBudgetHeadingsApi(createFiscalYear),
            getBudgetSubheadingsApi(createFiscalYear),
            getBudgetRequestsApi({ fiscalYear: createFiscalYear }),
          ]);
          if (!isMounted) return;
          setCreateHeadings(Array.isArray(hList) ? hList : []);
          setCreateSubheadings(Array.isArray(sList) ? sList : []);

          const loggedUser = (() => {
            try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
          })();
          const deptId = loggedUser.departmentId || loggedUser.DepartmentId || null;

          const deptReqs = (Array.isArray(reqList) ? reqList : []).filter(
            (r) => (deptId ? r.departmentId === deptId : false)
          );
          const annualReqs = deptReqs.filter(
            (r) => !String(r.requestType || '').toLowerCase().includes('demand')
          );
          const isApproved = deptId
            ? annualReqs.some((r) => String(r.status || '').toLowerCase().startsWith('approv'))
            : false;
          const isPending = deptId
            ? annualReqs.some((r) => String(r.status || '').toLowerCase() === 'pending')
            : false;

          setExistingAnnualApproved(isApproved);

          if (isPending) {
            const prefill = {};
            annualReqs.forEach((r) => {
              const k = r.BudgetSubHeadId || r.code || r.subHeadingCode;
              if (k) prefill[k] = r.requestedAmount;
            });
            setRequestedAmounts((prev) => ({ ...prefill, ...prev }));
          }
        } catch {
          message.error('Failed to load budget categories');
        }
      })();
      return () => {
        isMounted = false;
      };
    }
  }, [viewMode, createFiscalYear]);

  const groupedCreateHeadings = useMemo(() => {
    return createHeadings
      .map((head) => {
        const headCode = (head.code || head.headingCode || '').trim();
        const headTitle = (head.heading || head.title || '').trim();
        const headId = head.BudgetHeadId || head.id;
        const items = createSubheadings.filter((s) => {
          const matchesHead =
            (headId && s.BudgetHeadId && s.BudgetHeadId === headId) ||
            (headCode && (s.headingCode || '').trim() === headCode) ||
            (headTitle && (s.headingTitle || '').trim().toLowerCase() === headTitle.toLowerCase());
          if (!matchesHead) return false;

          const sType = String(s.requestType || '').toLowerCase();
          if (createRequestType === 'onDemand Budget') {
            return sType.includes('demand');
          } else {
            return !sType.includes('demand');
          }
        });
        return {
          ...head,
          code: headCode,
          heading: headTitle,
          subheadings: items,
        };
      })
      .filter((head) => head.subheadings.length > 0);
  }, [createHeadings, createSubheadings, createRequestType]);

  const displayedCreateHeadings = useMemo(() => {
    if (!createHeadingFilter || createHeadingFilter === 'ALL') {
      return groupedCreateHeadings;
    }
    return groupedCreateHeadings.filter(
      (h) => h.code === createHeadingFilter || (h.headingCode || '').trim() === createHeadingFilter
    );
  }, [groupedCreateHeadings, createHeadingFilter]);

  const handleAmountChange = (subId, val) => {
    setRequestedAmounts((prev) => ({
      ...prev,
      [subId]: val || 0,
    }));
  };

  const subtotals = useMemo(() => {
    const totals = {};
    groupedCreateHeadings.forEach((head) => {
      let subTotal = 0;
      head.subheadings.forEach((sub) => {
        const key = sub.id || sub.code;
        subTotal += Number(requestedAmounts[key] || 0);
      });
      totals[head.code] = subTotal;
    });
    return totals;
  }, [groupedCreateHeadings, requestedAmounts]);

  const grandTotal = useMemo(() => {
    return Object.values(subtotals).reduce((acc, curr) => acc + curr, 0);
  }, [subtotals]);

  const handleSubmitBudget = async () => {
    if (createRequestType === 'Annual Budget' && existingAnnualApproved) {
      message.warning('The annual budget for this department has already been approved and locked.');
      return;
    }

    if (grandTotal <= 0) {
      message.warning('Please enter an amount greater than 0');
      return;
    }

    try {
      setSubmitting(true);
      const items = [];
      groupedCreateHeadings.forEach((head) => {
        head.subheadings.forEach((sub) => {
          const key = sub.id || sub.code;
          const amt = requestedAmounts[key];
          if (amt && amt > 0) {
            items.push({
              headingCode: head.code,
              headingTitle: head.heading,
              subHeadingCode: sub.code,
              subHeadingTitle: sub.subHeadingTitle || sub.title,
              code: sub.code,
              amount: amt,
              BudgetHeadId: head.BudgetHeadId || head.id || null,
              BudgetSubHeadId: sub.BudgetSubHeadId || sub.id || null,
              requestType: createRequestType,
              remarks: onDemandRemarks[key] || null,
            });
          }
        });
      });

      const loggedUser = (() => {
        try {
          return JSON.parse(localStorage.getItem('user') || '{}');
        } catch {
          return {};
        }
      })();
      const deptId = loggedUser.departmentId || loggedUser.DepartmentId || null;

      await submitBudgetRequestApi({
        fiscalYear: createFiscalYear,
        departmentId: deptId,
        requestType: createRequestType,
        items,
      });

      message.success(
        `${createRequestType === 'onDemand Budget' ? 'On-Demand budget request' : 'Annual budget package'} submitted successfully!`
      );
      setRequestedAmounts({});
      setOnDemandRemarks({});
      setViewMode('list');
      loadListData(appliedFilters);
    } catch (err) {
      const errMsg = err?.response?.data?.message || err?.message || 'Failed to submit budget request';
      message.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportCSV = () => {
    const rows = [
      ['Fiscal Year', 'Heading Code', 'Heading Title', 'Subheading Code', 'Subheading Title', 'Requested Amount (NPR)'],
    ];

    groupedCreateHeadings.forEach((head) => {
      head.subheadings.forEach((sub) => {
        const key = sub.id || sub.code;
        const amt = requestedAmounts[key] || 0;
        rows.push([
          `"${createFiscalYear}"`,
          `"${head.code}"`,
          `"${head.heading}"`,
          `"${sub.code || ''}"`,
          `"${sub.subHeadingTitle || sub.title || ''}"`,
          `"${amt}"`,
        ]);
      });
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Budget_Request_${createFiscalYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const listColumns = [
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
      render: (val) => {
        const isD = String(val || '').toLowerCase().includes('demand');
        return (
          <Tag color={isD ? 'geekblue' : 'blue'} style={{ fontWeight: 600, borderRadius: 4, margin: 0, fontSize: 11 }}>
            {isD ? 'On-Demand' : 'Annual'}
          </Tag>
        );
      },
    },
    {
      title: 'REQUESTED AMOUNT',
      dataIndex: 'requestedAmount',
      key: 'requestedAmount',
      align: 'right',
      render: (val) => <span style={{ fontWeight: 700, color: C.darkNavy }}>{formatCurrency(val)}</span>,
    },
    {
      title: 'STATUS',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (val) => (
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
      ),
    },
  ];

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
      render: (val) => {
        const isD = String(val || '').toLowerCase().includes('demand');
        return (
          <Tag color={isD ? 'geekblue' : 'blue'} style={{ fontWeight: 600, borderRadius: 4, margin: 0, fontSize: 11 }}>
            {isD ? 'On-Demand' : 'Annual'}
          </Tag>
        );
      },
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

  const summaryData = useMemo(() => {
    const map = {};
    budgetList.forEach((item) => {
      const isD = String(item.requestType || '').toLowerCase().includes('demand');
      const typeLabel = isD ? 'On-Demand' : 'Annual';
      const groupKey = `${item.headingCode || item.heading}_${item.department || ''}_${item.fiscalYear || ''}_${typeLabel}`;
      if (!map[groupKey]) {
        map[groupKey] = {
          key: groupKey,
          headingCode: item.headingCode || '—',
          heading: item.heading || '—',
          department: item.department || '—',
          fiscalYear: item.fiscalYear || '—',
          requestType: typeLabel,
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
  }, [budgetList]);

  const isSummaryMode = /summary/i.test(appliedFilters.reportType || '');

  return (
    <div style={{ padding: '4px 0' }}>
      {viewMode === 'list' ? (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <FileTextOutlined style={{ fontSize: 24, color: C.brand }} />
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.darkNavy }}>
                Budget Management
              </h1>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setViewMode('create')}
              style={{
                background: '#01519b',
                borderColor: '#01519b',
                color: '#ffffff',
                fontWeight: 600,
                height: 38,
                borderRadius: 6,
                padding: '0 18px',
              }}
            >
              <span style={{ color: '#ffffff' }}>+ Create Budget</span>
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
                background: '#01519b',
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
              <Row gutter={[12, 12]}>
                <Col xs={24} sm={12} md={4}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#3b556e', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FileTextOutlined style={{ color: C.brand }} />
                    <span>Report Type</span>
                  </div>
                  <Select
                    value={reportTypeFilter}
                    onChange={setReportTypeFilter}
                    placeholder="--Select Report Type--"
                    allowClear
                    style={{ width: '100%', height: 38 }}
                  >
                    {(reportTypes.length ? reportTypes : [{ Label: 'Summary' }, { Label: 'Detail' }]).map((rt) => {
                      const displayLabel = rt.Label?.toLowerCase().endsWith('report') ? rt.Label : `${rt.Label} Report`;
                      return (
                        <Option key={rt.Value || rt.Label || displayLabel} value={displayLabel}>
                          {displayLabel}
                        </Option>
                      );
                    })}
                  </Select>
                </Col>

                <Col xs={24} sm={12} md={5}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#3b556e', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ApartmentOutlined style={{ color: C.brand }} />
                    <span>Department</span>
                  </div>
                  <Select
                    value={departmentFilter}
                    onChange={setDepartmentFilter}
                    placeholder="--Select Department--"
                    allowClear
                    showSearch
                    style={{ width: '100%', height: 38 }}
                  >
                    {departments.map((d) => {
                      const val = d.Value || d.DepartmentId || d.id || d;
                      const lbl = d.Label || d.DepartmentName || d.name || d;
                      return (
                        <Option key={val} value={val}>
                          {lbl}
                        </Option>
                      );
                    })}
                  </Select>
                </Col>

                <Col xs={24} sm={12} md={5}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#3b556e', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CalendarOutlined style={{ color: C.brand }} />
                    <span>Fiscal Year</span>
                  </div>
                  <Select
                    value={fiscalYearFilter}
                    onChange={setFiscalYearFilter}
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

                <Col xs={24} sm={12} md={5}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#3b556e', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <UnorderedListOutlined style={{ color: C.brand }} />
                    <span>Heading</span>
                  </div>
                  <Select
                    value={headingFilter}
                    onChange={handleHeadingFilterChange}
                    placeholder="--Select Headings--"
                    allowClear
                    showSearch
                    style={{ width: '100%', height: 38 }}
                  >
                    {headings.map((h) => {
                      const val = h.code || h.heading;
                      const lbl = `${h.code ? h.code + ' - ' : ''}${h.heading || h.title}`;
                      return (
                        <Option key={val} value={val}>
                          {lbl}
                        </Option>
                      );
                    })}
                  </Select>
                </Col>

                <Col xs={24} sm={12} md={5}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#3b556e', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <TagOutlined style={{ color: C.brand }} />
                    <span>Sub Heading</span>
                  </div>
                  <Select
                    value={subHeadingFilter}
                    onChange={setSubHeadingFilter}
                    placeholder={!headingFilter ? '-- Select Heading First --' : '-- Select SubHeading --'}
                    disabled={!headingFilter}
                    allowClear
                    showSearch
                    style={{ width: '100%', height: 38 }}
                  >
                    {filteredSubheadings.map((s) => {
                      const val = s.code || s.subHeadingTitle;
                      const lbl = `${s.code ? s.code + ' - ' : ''}${s.subHeadingTitle || s.title}`;
                      return (
                        <Option key={val} value={val}>
                          {lbl}
                        </Option>
                      );
                    })}
                  </Select>
                </Col>
              </Row>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 14 }}>
                <Button
                  onClick={handleResetFilter}
                  style={{
                    background: '#38bdf8',
                    borderColor: '#38bdf8',
                    color: '#ffffff',
                    fontWeight: 600,
                    height: 36,
                    borderRadius: 6,
                    padding: '0 20px',
                  }}
                >
                  Reset
                </Button>
                <Button
                  type="primary"
                  onClick={handleApplyFilter}
                  style={{
                    background: '#01519b',
                    borderColor: '#01519b',
                    color: '#ffffff',
                    fontWeight: 600,
                    height: 36,
                    borderRadius: 6,
                    padding: '0 20px',
                  }}
                >
                  <span style={{ color: '#ffffff' }}>Apply Filter</span>
                </Button>
              </div>
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
            {isSummaryMode ? (
              summaryData.length > 0 ? (
                <Table
                  dataSource={summaryData}
                  columns={summaryColumns}
                  rowKey="key"
                  loading={loading}
                  pagination={{ pageSize: 10 }}
                  size="middle"
                />
              ) : (
                <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                  <Empty description="No budget summary records found for the selected filters." />
                </div>
              )
            ) : budgetList.length > 0 ? (
              <Table
                dataSource={budgetList}
                columns={listColumns}
                rowKey={(record) => record.id || record.code}
                loading={loading}
                pagination={{ pageSize: 10 }}
                size="middle"
              />
            ) : (
              <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                <Empty description="No budget records found. Click '+ Create Budget' to create one." />
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={() => setViewMode('list')}
                  style={{ borderRadius: 6 }}
                />
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
                  <h2 style={{ margin: 0, color: C.darkNavy, fontWeight: 700, fontSize: 20 }}>
                    Budget Request Management
                  </h2>
                  <Text style={{ color: C.muted, fontSize: 13 }}>
                    Create and manage department budget requests
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
                Export to CSV
              </Button>
            </div>
          </div>

          <div
            style={{
              background: '#01519b',
              borderRadius: 8,
              padding: '12px 18px',
              color: '#ffffff',
              marginBottom: 16,
              display: 'flex',
              gap: 20,
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.5px', marginBottom: 6, textTransform: 'uppercase' }}>
                  SELECT FISCAL YEAR
                </div>
                <Select
                  value={createFiscalYear}
                  onChange={(val) => {
                    setCreateFiscalYear(val);
                    setCreateHeadingFilter('ALL');
                  }}
                  style={{ width: 220, height: 38 }}
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
              </div>

              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.5px', marginBottom: 6, textTransform: 'uppercase' }}>
                  SELECT HEADING
                </div>
                <Select
                  value={createHeadingFilter}
                  onChange={setCreateHeadingFilter}
                  placeholder="--Select Heading--"
                  style={{ width: 220, height: 38 }}
                >
                  <Option value="ALL">-- All Headings --</Option>
                  {createHeadings.map((h) => {
                    const val = (h.code || h.headingCode || '').trim();
                    const lbl = `${val ? val + ' - ' : ''}${h.heading || h.title}`;
                    return (
                      <Option key={val} value={val}>
                        {lbl}
                      </Option>
                    );
                  })}
                </Select>
              </div>

              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.5px', marginBottom: 6, textTransform: 'uppercase' }}>
                  BUDGET TYPE
                </div>
                <Select
                  value={createRequestType}
                  onChange={setCreateRequestType}
                  style={{ width: 220, height: 38 }}
                >
                  <Option value="Annual Budget">Annual Budget</Option>
                  <Option value="onDemand Budget">On-Demand Budget</Option>
                </Select>
              </div>
            </div>
          </div>

          {createRequestType === 'Annual Budget' && existingAnnualApproved && (
            <Alert
              type="warning"
              showIcon
              message="Annual Budget Locked"
              description={`The annual budget for FY ${createFiscalYear} has already been approved. Only 1 Annual Budget is allowed per department per fiscal year. Please select On-Demand Budget for additional requests.`}
              style={{ marginBottom: 20 }}
            />
          )}

          {displayedCreateHeadings.length === 0 ? (
            <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 8, padding: 40, textAlign: 'center' }}>
              <Empty description="No budget headings available for this Fiscal Year." />
            </div>
          ) : (
            <div>
              {displayedCreateHeadings.map((head) => {
                const headSubtotal = subtotals[head.code] || 0;

                return (
                  <div
                    key={head.code}
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
                        <span>{head.heading}</span>
                      </div>
                      <div
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          background: 'rgba(255,255,255,0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        {head.code}
                      </div>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: `1px solid ${C.border}` }}>
                          <th style={{ padding: '10px 18px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#475569', width: 120 }}>
                            CODE
                          </th>
                          <th style={{ padding: '10px 18px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#475569' }}>
                            SUB HEADING
                          </th>
                          <th style={{ padding: '10px 18px', textAlign: 'right', fontSize: 11, fontWeight: 700, color: '#475569', width: 260 }}>
                            REQUESTED AMOUNT
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {head.subheadings.map((sub) => {
                          const key = sub.id || sub.code;
                          return (
                            <tr key={key} style={{ borderBottom: `1px solid #f1f5f9` }}>
                              <td style={{ padding: '12px 18px' }}>
                                <span style={{ fontWeight: 700, color: C.brand, background: '#e8f0fe', padding: '2px 8px', borderRadius: 4, fontSize: 12 }}>
                                  {sub.code || '—'}
                                </span>
                              </td>
                              <td style={{ padding: '12px 18px', fontWeight: 600, color: C.text, fontSize: 13 }}>
                                {sub.subHeadingTitle || sub.title}
                              </td>
                              <td style={{ padding: '12px 18px', textAlign: 'right' }}>
                                <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                                  <div style={{ display: 'inline-flex', alignItems: 'center', border: `1px solid #cbd5e1`, borderRadius: 4, overflow: 'hidden' }}>
                                    <span style={{ background: '#01519b', color: '#ffffff', padding: '6px 10px', fontSize: 12, fontWeight: 600 }}>
                                      Rs.
                                    </span>
                                    <InputNumber
                                      min={0}
                                      bordered={false}
                                      disabled={createRequestType === 'Annual Budget' && existingAnnualApproved}
                                      value={requestedAmounts[key] || 0}
                                      onChange={(val) => handleAmountChange(key, val)}
                                      formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                      parser={(val) => (val ? val.replace(/\$\s?|(,*)/g, '') : '')}
                                      style={{ width: 140, textAlign: 'right' }}
                                    />
                                  </div>
                                  {createRequestType === 'onDemand Budget' && (
                                    <Input
                                      placeholder="Remarks"
                                      size="small"
                                      value={onDemandRemarks[key] || ''}
                                      onChange={(e) => {
                                        const v = e.target.value;
                                        setOnDemandRemarks((prev) => ({ ...prev, [key]: v }));
                                      }}
                                      style={{ width: 180, fontSize: 12 }}
                                    />
                                  )}
                                </div>
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
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Subtotal</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: C.darkNavy }}>
                        {formatCurrency(headSubtotal)}
                      </span>
                    </div>
                  </div>
                );
              })}

              <div
                style={{
                  background: '#01519b',
                  borderRadius: 8,
                  padding: '16px 20px',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 24,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 6,
                      background: 'rgba(255,255,255,0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 18,
                    }}
                  >
                    <DollarCircleOutlined />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>
                      Total {createRequestType === 'onDemand Budget' ? 'On-Demand Request' : 'Annual Budget Request'}
                    </div>
                    <div style={{ fontSize: 11, opacity: 0.8 }}>Sum of all sub-headings</div>
                  </div>
                </div>

                <div style={{ fontSize: 22, fontWeight: 800 }}>
                  {formatCurrency(grandTotal)}
                </div>
              </div>

              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                {(() => {
                  const isLocked = createRequestType === 'Annual Budget' && existingAnnualApproved;
                  return (
                    <Button
                      type="primary"
                      size="large"
                      loading={submitting}
                      disabled={isLocked}
                      onClick={handleSubmitBudget}
                      style={{
                        background: isLocked ? '#cbd5e1' : '#01519b',
                        borderColor: isLocked ? '#cbd5e1' : '#01519b',
                        color: isLocked ? '#64748b' : '#ffffff',
                        fontWeight: 700,
                        height: 42,
                        borderRadius: 6,
                        padding: '0 36px',
                        cursor: isLocked ? 'not-allowed' : 'pointer',
                      }}
                    >
                      <span style={{ color: isLocked ? '#64748b' : '#ffffff', fontWeight: 700 }}>
                        {isLocked ? 'Annual Budget Locked (Already Approved)' : 'Submit Budget Request'}
                      </span>
                    </Button>
                  );
                })()}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BudgetManagement;

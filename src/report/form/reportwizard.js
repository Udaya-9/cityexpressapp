import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Card,
  Row,
  Col,
  Select,
  DatePicker,
  Input,
  Button,
  Table,
  Tag,
  Typography,
  message,
  Empty,
  Spin,
  Space,
  Tooltip,
} from 'antd';
import {
  ThunderboltOutlined,
  ReloadOutlined,
  FilterOutlined,
  FileExcelOutlined,
} from '@ant-design/icons';
import {
  getReportListApi,
  getReportFiltersApi,
  getGenericOptionsApi,
  executeReportApi,
} from '../API/reportservice';

const { Text } = Typography;
const { Option } = Select;

const C = {
  brand: '#013b73',
  brandDark: '#002b49',
  border: '#e2e8f0',
  subtext: '#64748b',
  text: '#1e293b',
  bgFilter: '#f8fafc',
};

const ReportWizard = () => {
  const location = useLocation();
  const queryReportId = useMemo(() => {
    return new URLSearchParams(location.search).get('id');
  }, [location.search]);

  const [reports, setReports] = useState([]);
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [filters, setFilters] = useState([]);
  const [dropdownOptions, setDropdownOptions] = useState({});
  const [formValues, setFormValues] = useState({});
  
  const [loadingFilters, setLoadingFilters] = useState(false);
  const [executing, setExecuting] = useState(false);

  const [reportData, setReportData] = useState([]);
  const [columnKeys, setColumnKeys] = useState([]);
  const [hasExecuted, setHasExecuted] = useState(false);

  // Active selected report object
  const activeReport = useMemo(() => {
    return reports.find((r) => r.ReportConfigId === selectedReportId) || null;
  }, [reports, selectedReportId]);

  //  Load active reports on mount
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const list = await getReportListApi();
        if (isMounted) {
          setReports(list);
          if (list.length > 0) {
            const initialId = queryReportId && list.some((r) => r.ReportConfigId === queryReportId)
              ? queryReportId
              : list[0].ReportConfigId;
            setSelectedReportId(initialId);
          }
        }
      } catch (err) {
        console.error('Failed to load reports:', err);
        message.error('Failed to load reports configuration');
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [queryReportId]);

  // Sync when query param changes
  useEffect(() => {
    if (queryReportId && queryReportId !== selectedReportId && reports.some((r) => r.ReportConfigId === queryReportId)) {
      setSelectedReportId(queryReportId);
    }
  }, [queryReportId, reports, selectedReportId]);

  // 2. Fetch filters when selected report changes
  useEffect(() => {
    if (!selectedReportId) {
      setFilters([]);
      setFormValues({});
      setReportData([]);
      setColumnKeys([]);
      setHasExecuted(false);
      return;
    }

    let isMounted = true;
    (async () => {
      setLoadingFilters(true);
      setReportData([]);
      setColumnKeys([]);
      setHasExecuted(false);
      try {
        const filterList = await getReportFiltersApi(selectedReportId);
        if (!isMounted) return;
        setFilters(filterList);

        // Reset form values
        const initial = {};
        const selectOptionsMap = {};

        // Fetch generic dropdown options for any select filter with Options specified
        await Promise.all(
          filterList.map(async (f) => {
            if (f.FieldType === 'select' && f.Options) {
              try {
                const opts = await getGenericOptionsApi(f.Options);
                selectOptionsMap[f.Options] = opts || [];
              } catch (e) {
                console.error(`Failed to load options for ${f.Options}:`, e);
                selectOptionsMap[f.Options] = [];
              }
            }
          })
        );

        if (isMounted) {
          setDropdownOptions((prev) => ({ ...prev, ...selectOptionsMap }));
          setFormValues(initial);
        }
      } catch (err) {
        console.error('Failed to load report filters:', err);
        message.error('Failed to load report filter parameters');
      } finally {
        if (isMounted) setLoadingFilters(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [selectedReportId]);

  // Handle filter value changes
  const handleFilterChange = (fieldName, value) => {
    setFormValues((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  // Reset filters
  const handleReset = () => {
    setFormValues({});
    setReportData([]);
    setColumnKeys([]);
    setHasExecuted(false);
  };

  //  Execute Report
  const handleExecute = async () => {
    if (!activeReport) {
      message.warning('Please select a report first');
      return;
    }

    // Validate required fields
    for (const f of filters) {
      if (f.IsRequired && !formValues[f.FieldName]) {
        message.error(`Please provide ${f.LabelName}`);
        return;
      }
    }

    setExecuting(true);
    try {
      const payloadParams = { ...formValues };

      // Format date pickers to YYYY-MM-DD
      filters.forEach((f) => {
        if (f.FieldType === 'date-picker' && payloadParams[f.FieldName]) {
          const val = payloadParams[f.FieldName];
          if (val && typeof val.format === 'function') {
            payloadParams[f.FieldName] = val.format('YYYY-MM-DD');
          } else if (val instanceof Date) {
            payloadParams[f.FieldName] = val.toISOString().slice(0, 10);
          }
        }
      });

      const response = await executeReportApi({
        procedureName: activeReport.ProcedureName,
        params: payloadParams,
      });

      const data = response.data || [];
      const cols = response.columns || (data.length > 0 ? Object.keys(data[0]) : []);

      setReportData(data);
      setColumnKeys(cols);
      setHasExecuted(true);

      if (data.length === 0) {
        message.info('Report executed successfully, but no matching records were found.');
      } else {
        message.success(`Report executed: ${data.length} record(s) loaded.`);
      }
    } catch (err) {
      console.error('Report execution failed:', err);
      message.error(err.response?.data?.message || 'Failed to execute report procedure');
    } finally {
      setExecuting(false);
    }
  };

  //  Export to Excel / CSV
  const handleExportCSV = useCallback(() => {
    if (!reportData || reportData.length === 0) {
      message.warning('No data available to export');
      return;
    }

    const headers = columnKeys.length > 0 ? columnKeys : Object.keys(reportData[0]);

    const escapeCSV = (val) => {
      if (val === null || val === undefined) return '';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const headerRow = headers.map(escapeCSV).join(',');
    const dataRows = reportData.map((row) =>
      headers.map((col) => escapeCSV(row[col])).join(',')
    );

    const csvContent = '\uFEFF' + [headerRow, ...dataRows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    const fileName = `${(activeReport?.ReportName || 'Report').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    message.success('Report exported successfully');
  }, [reportData, columnKeys, activeReport]);

  // Dynamic table columns definition
  const tableColumns = useMemo(() => {
    if (!columnKeys || columnKeys.length === 0) return [];

    return columnKeys.map((colKey, index) => {
      const isFirst = index === 0;
      const isAmount = /amount|budget|balance|cost|price|total/i.test(colKey);
      const isStatus = /status/i.test(colKey);

      return {
        title: colKey.toUpperCase(),
        dataIndex: colKey,
        key: colKey,
        align: isAmount ? 'right' : isFirst ? 'center' : 'left',
        sorter: (a, b) => {
          const valA = a[colKey];
          const valB = b[colKey];
          if (typeof valA === 'number' && typeof valB === 'number') return valA - valB;
          return String(valA || '').localeCompare(String(valB || ''));
        },
        render: (val) => {
          if (val === null || val === undefined || val === '') {
            return <Text style={{ color: '#94a3b8' }}>—</Text>;
          }

          if (isStatus) {
            const strVal = String(val).toUpperCase();
            const color =
              strVal === 'APPROVED' || strVal === 'ACTIVE'
                ? 'green'
                : strVal === 'PENDING'
                ? 'gold'
                : strVal === 'SETTLED'
                ? 'blue'
                : 'default';
            return <Tag color={color}>{strVal}</Tag>;
          }

          if (isAmount && typeof val === 'number') {
            return (
              <span style={{ fontWeight: 600, color: '#0f172a', fontFamily: 'monospace' }}>
                {val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            );
          }

          return <span style={{ color: C.text, fontSize: 13 }}>{String(val)}</span>;
        },
      };
    });
  }, [columnKeys]);

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '16px 24px' }}>
      {/* Dynamic Filter Section */}
      <Card
        size="small"
        style={{
          borderRadius: 8,
          borderColor: C.border,
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          marginBottom: 20,
          background: '#ffffff',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
          <FilterOutlined style={{ color: '#1a73e8', fontSize: 14 }} />
          <span style={{ fontWeight: 700, fontSize: 12, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Filter Parameters {activeReport && `(${activeReport.ReportName})`}
          </span>
        </div>

        {loadingFilters ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <Spin tip="Loading report filter parameters..." />
          </div>
        ) : filters.length === 0 ? (
          <div style={{ padding: '12px 0', color: C.subtext, fontSize: 13 }}>
            No filter parameters configured for this report. Click Execute to generate data.
          </div>
        ) : (
          <Row gutter={[16, 16]} align="bottom">
            {filters.map((f) => {
              const opts = dropdownOptions[f.Options] || [];

              return (
                <Col key={f.ReportFilterId} xs={24} sm={12} md={8} lg={6}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#3b556e', marginBottom: 6, textTransform: 'uppercase' }}>
                    {f.LabelName} {f.IsRequired ? <span style={{ color: '#ef4444' }}>*</span> : null}
                  </div>

                  {f.FieldType === 'date-picker' ? (
                    <DatePicker
                      value={formValues[f.FieldName] || null}
                      onChange={(date) => handleFilterChange(f.FieldName, date)}
                      placeholder={f.PlaceHolder || `Select ${f.LabelName}`}
                      style={{ width: '100%', height: 38, borderRadius: 6 }}
                    />
                  ) : f.FieldType === 'select' ? (
                    <Select
                      value={formValues[f.FieldName] || undefined}
                      onChange={(val) => handleFilterChange(f.FieldName, val)}
                      placeholder={f.PlaceHolder || `-- Select ${f.LabelName} --`}
                      allowClear
                      showSearch
                      filterOption={(input, option) =>
                        (option?.children || '').toLowerCase().includes(input.toLowerCase())
                      }
                      style={{ width: '100%', height: 38 }}
                    >
                      {opts.map((opt) => (
                        <Option key={opt.Value || opt.id} value={opt.Label || opt.Value}>
                          {opt.Label}
                        </Option>
                      ))}
                    </Select>
                  ) : (
                    <Input
                      value={formValues[f.FieldName] || ''}
                      onChange={(e) => handleFilterChange(f.FieldName, e.target.value)}
                      placeholder={f.PlaceHolder || `Enter ${f.LabelName}`}
                      style={{ height: 38, borderRadius: 6 }}
                    />
                  )}
                </Col>
              );
            })}
          </Row>
        )}

        {/* Action Buttons: Execute, Export to Excel, Reset */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 10, marginTop: 18, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
          <Button
            onClick={handleReset}
            icon={<ReloadOutlined />}
            style={{ borderRadius: 6, height: 38, fontWeight: 600, padding: '0 16px' }}
          >
            Reset
          </Button>

          <Button
            type="primary"
            onClick={handleExecute}
            loading={executing}
            icon={<ThunderboltOutlined />}
            style={{
              background: '#059669',
              borderColor: '#059669',
              borderRadius: 6,
              height: 38,
              fontWeight: 700,
              padding: '0 20px',
            }}
          >
            Execute
          </Button>

          <Tooltip title={reportData.length === 0 ? 'Execute report first to enable export' : 'Export results to Excel/CSV'}>
            <Button
              type="default"
              onClick={handleExportCSV}
              disabled={reportData.length === 0}
              icon={<FileExcelOutlined style={{ color: reportData.length > 0 ? '#107c41' : undefined }} />}
              style={{
                borderRadius: 6,
                height: 38,
                fontWeight: 600,
                padding: '0 18px',
                borderColor: reportData.length > 0 ? '#107c41' : undefined,
                color: reportData.length > 0 ? '#107c41' : undefined,
              }}
            >
              Export to Excel
            </Button>
          </Tooltip>
        </div>
      </Card>

      {/* Results Table Section */}
      <Card
        size="small"
        style={{
          borderRadius: 8,
          borderColor: C.border,
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          background: '#ffffff',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Space>
            <span style={{ fontWeight: 700, fontSize: 14, color: '#1e293b' }}>
              Report Output
            </span>
            {hasExecuted && (
              <Tag color="blue" style={{ fontWeight: 600 }}>
                {reportData.length} records found
              </Tag>
            )}
          </Space>

          {activeReport && (
            <span style={{ fontSize: 12, color: C.subtext, fontFamily: 'monospace' }}>
              Procedure: {activeReport.ProcedureName}
            </span>
          )}
        </div>

        <Table
          dataSource={reportData}
          columns={tableColumns}
          rowKey={(r, idx) => r.id || r.key || r['S.No'] || r.referenceId || idx}
          loading={executing}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '25', '50', '100'],
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} entries`,
          }}
          scroll={{ x: 'max-content' }}
          size="middle"
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span style={{ color: C.subtext, fontSize: 13 }}>
                    {hasExecuted
                      ? 'No records returned for the selected filter criteria.'
                      : 'Select filter criteria above and click "Execute" to run the report.'}
                  </span>
                }
              />
            ),
          }}
        />
      </Card>
    </div>
  );
};

export default ReportWizard;

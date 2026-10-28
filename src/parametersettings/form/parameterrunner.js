import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Button,
  Col,
  Empty,
  Form,
  Popconfirm,
  Row,
  Space,
  Spin,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
} from 'antd';
import {
  CaretRightOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  ReloadOutlined,
  SaveOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import { getParameterSettingApi, runParameterSettingApi } from '../API/parametersettingservice';
import { bsToAdString } from '../../correspondence/components/NepaliDatePicker';
import DynamicParameterField from '../components/DynamicParameterField';

const { Text } = Typography;

const C = {
  darkNavy: '#002b49',
  brand: '#01519b',
  border: '#e2e8f0',
  muted: '#667085',
};

const ACTION_PARAM = 'action';

const ACTIONS = {
  LIST: 'a',
  CREATE: 'c',
  UPDATE: 'u',
  DELETE: 'd',
};

const primaryButtonStyle = {
  background: C.brand,
  borderColor: C.brand,
  fontWeight: 600,
  borderRadius: 6,
};

const toAdDateString = (input) => {
  if (!input) return '';
  const str = String(input).trim();
  if (/^20[789]\d/.test(str)) return bsToAdString(str);
  return str.split('T')[0].split(' ')[0];
};

const toAdValue = (field, value) => {
  if (field.fieldType === 'date-picker') return toAdDateString(value);
  if (field.fieldType === 'datetimepicker') {
    const [date, time] = String(value || '').split(/[ T]/);
    return [toAdDateString(date), time].filter(Boolean).join(' ');
  }
  return value;
};

const normalizeRowValue = (field, value) => {
  if (value === null || value === undefined) return '';
  const text = String(value);
  if (field.fieldType === 'date-picker') return text.slice(0, 10);
  if (field.fieldType === 'datetimepicker') {
    const [date, time] = text.split(/[ T]/);
    return [date, time ? time.slice(0, 5) : ''].filter(Boolean).join(' ');
  }
  return value;
};

const formatCellValue = (field, value) => {
  if (value === null || value === undefined || value === '') return '—';
  return normalizeRowValue(field || {}, value);
};

const toFormValue = (field, value) => {
  const normalized = normalizeRowValue(field, value);
  if (
    field.fieldType === 'checkbox' &&
    String(field.options || '').trim() &&
    typeof normalized === 'string'
  ) {
    return normalized
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return normalized;
};

const setCheckboxDefaults = (form, fields) => {
  const initial = {};
  fields.forEach((field) => {
    if (field.fieldType === 'checkbox' && !String(field.options || '').trim()) {
      initial[field.fieldName] = false;
    }
  });
  form.setFieldsValue(initial);
};

const readProcedureStatus = (data) => {
  if (!Array.isArray(data) || data.length !== 1) return null;
  const row = data[0];
  if (!row || typeof row !== 'object') return null;
  const successKey = Object.keys(row).find((key) => key.toLowerCase() === 'success');
  if (!successKey) return null;
  const messageKey = Object.keys(row).find((key) => key.toLowerCase() === 'message');
  return {
    success: Number(row[successKey]) === 1,
    message: messageKey ? String(row[messageKey] ?? '') : '',
  };
};

const ParameterMenu = () => {
  const { parameterId } = useParams();
  const [form] = Form.useForm();
  const [config, setConfig] = useState(null);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [executing, setExecuting] = useState(false);
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [executed, setExecuted] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const requestRef = useRef(0);

  const hasActionParam = Boolean(config?.hasActionParam);
  const actions = config?.actions || null;
  const listAction = actions ? actions.list : hasActionParam ? ACTIONS.LIST : null;
  const canCreate =
    hasActionParam && config?.canCreate !== false && (actions ? Boolean(actions.create) : true);
  const canUpdate =
    hasActionParam && config?.canUpdate !== false && (actions ? Boolean(actions.update) : true);
  const canDelete =
    hasActionParam && config?.canDelete !== false && (actions ? Boolean(actions.delete) : true);
  const supportsCrud = canCreate || canUpdate || canDelete;
  const unsupported = hasActionParam && !listAction && !supportsCrud;

  const resetForm = () => {
    form.resetFields();
    setCheckboxDefaults(form, fields);
  };

  const readFormValues = async () => {
    try {
      return await form.validateFields();
    } catch (err) {
      const firstError = err?.errorFields?.[0];
      message.warning(firstError?.errors?.[0] || 'Complete the required fields');
      if (firstError?.name) form.scrollToField(firstError.name, { block: 'center' });
      return null;
    }
  };

  const runRequest = useCallback(
    async ({
      action = null,
      fieldList = [],
      values = {},
      row = null,
      successMessage = '',
      showResult = action === null,
    }) => {
      if (!parameterId) return false;

      const requestId = requestRef.current + 1;
      requestRef.current = requestId;

      const params = {};
      if (action === ACTIONS.UPDATE || action === ACTIONS.DELETE) {
        Object.assign(params, row || {});
      }
      if (action !== ACTIONS.DELETE) {
        fieldList.forEach((field) => {
          const value = values[field.fieldName];
          if (value === undefined) return;
          params[field.fieldName] = toAdValue(field, value);
        });
      }
      if (action) params[ACTION_PARAM] = action;

      setExecuting(true);
      try {
        const response = await runParameterSettingApi({ paramterId: parameterId, params });
        if (requestRef.current !== requestId) return false;
        if (response?.success === false) {
          message.error(response?.message || 'Failed to execute');
          if (showResult) {
            setRows([]);
            setColumns([]);
            setExecuted(true);
          }
          return false;
        }

        if (
          action === ACTIONS.CREATE ||
          action === ACTIONS.UPDATE ||
          action === ACTIONS.DELETE
        ) {
          const status = readProcedureStatus(response?.data);
          if (status && !status.success) {
            message.error(status.message || 'The procedure rejected the request');
            return false;
          }
        }

        if (showResult) {
          setRows(Array.isArray(response?.data) ? response.data : []);
          setColumns(Array.isArray(response?.columns) ? response.columns : []);
          setExecuted(true);
        }
        if (successMessage) message.success(successMessage);
        return true;
      } catch (err) {
        if (requestRef.current !== requestId) return false;
        if (showResult) {
          setRows([]);
          setColumns([]);
          setExecuted(true);
        }
        message.error(err?.response?.data?.message || err?.message || 'Failed to execute');
        return false;
      } finally {
        if (requestRef.current === requestId) setExecuting(false);
      }
    },
    [parameterId]
  );

  useEffect(() => {
    if (!parameterId) return undefined;

    let alive = true;
    requestRef.current += 1;
    form.resetFields();
    setConfig(null);
    setFields([]);
    setRows([]);
    setColumns([]);
    setExecuted(false);
    setEditingRow(null);
    setExecuting(false);
    setError('');
    setLoading(true);

    getParameterSettingApi(parameterId)
      .then((data) => {
        if (!alive) return;
        if (!data) {
          setError('Parameter setting not found');
          return;
        }
        const nextFields = Array.isArray(data.fields) ? data.fields : [];
        setConfig(data);
        setFields(nextFields);
        if (data.hasActionParam) {
          const initialAction = data.actions ? data.actions.list : ACTIONS.LIST;
          if (initialAction) {
            setExecuted(true);
            runRequest({
              action: initialAction,
              fieldList: nextFields,
              values: {},
              showResult: true,
            });
          }
        }
      })
      .catch((err) => {
        if (!alive) return;
        const status = err?.response?.status;
        setError(
          status === 403
            ? 'You are not authorized to access this parameter setting.'
            : err?.response?.data?.message || err?.message || 'Failed to load parameters'
        );
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
      requestRef.current += 1;
    };
  }, [parameterId, form, runRequest]);

  useEffect(() => {
    if (loading) return;
    setCheckboxDefaults(form, fields);
  }, [loading, fields, form]);

  const handleExecute = async () => {
    if (!parameterId) return;

    const values = await readFormValues();
    if (!values) return;

    await runRequest({ fieldList: fields, values });
  };

  const handleRefresh = () => {
    if (!listAction) return;
    runRequest({
      action: listAction,
      fieldList: fields,
      values: form.getFieldsValue(),
      showResult: true,
    });
  };

  const handleSave = async () => {
    if (editingRow ? !canUpdate : !canCreate) return;

    const values = await readFormValues();
    if (!values) return;

    const action = editingRow ? ACTIONS.UPDATE : ACTIONS.CREATE;
    const saved = await runRequest({
      action,
      fieldList: fields,
      values,
      row: editingRow,
      successMessage: editingRow ? 'Record updated' : 'Record saved',
    });
    if (!saved) return;

    setEditingRow(null);
    resetForm();
    if (listAction) {
      await runRequest({
        action: listAction,
        fieldList: fields,
        values,
        showResult: true,
      });
    }
  };

  const handleEdit = (row) => {
    if (!canUpdate) return;
    const values = {};
    fields.forEach((field) => {
      const column = Object.keys(row).find(
        (key) => key.toLowerCase() === field.fieldName.toLowerCase()
      );
      if (!column) return;
      values[field.fieldName] = toFormValue(field, row[column]);
    });

    resetForm();
    form.setFieldsValue(values);
    setEditingRow(row);
  };

  const handleDelete = async (row) => {
    if (!canDelete) return;

    const deleted = await runRequest({
      action: ACTIONS.DELETE,
      fieldList: fields,
      row,
      successMessage: 'Record deleted',
    });
    if (!deleted) return;

    if (editingRow === row) {
      setEditingRow(null);
      resetForm();
    }
    if (listAction) {
      await runRequest({
        action: listAction,
        fieldList: fields,
        values: form.getFieldsValue(),
        showResult: true,
      });
    }
  };

  const handleCancel = () => {
    setEditingRow(null);
    resetForm();
  };

  const handleReset = () => {
    resetForm();
    setRows([]);
    setColumns([]);
    setExecuted(false);
    setEditingRow(null);
  };

  const fieldByColumn = new Map(
    fields.map((field) => [field.fieldName.toLowerCase(), field])
  );

  const tableColumns = columns.map((column) => ({
    title: column,
    dataIndex: column,
    key: column,
    render: (value) => formatCellValue(fieldByColumn.get(column.toLowerCase()), value),
  }));

  if (canUpdate || canDelete) {
    tableColumns.push({
      title: 'ACTIONS',
      key: 'actions',
      width: 96,
      align: 'center',
      render: (_, record) => (
        <Space size={4}>
          {canUpdate && (
            <Tooltip title="Edit">
              <Button
                size="small"
                type="text"
                icon={<EditOutlined style={{ color: C.brand }} />}
                disabled={executing}
                onClick={() => handleEdit(record)}
              />
            </Tooltip>
          )}
          {canDelete && (
            <Popconfirm
              title="Delete record"
              description="Are you sure you want to delete this record?"
              okText="Yes"
              cancelText="No"
              okButtonProps={{ danger: true }}
              onConfirm={() => handleDelete(record)}
            >
              <Tooltip title="Delete">
                <Button
                  size="small"
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  disabled={executing}
                />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    });
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
        <Spin />
      </div>
    );
  }

  return (
    <div>
      {error && <Alert type="error" showIcon message={error} style={{ marginBottom: 16 }} />}

      {!error && unsupported && (
        <Alert
          type="warning"
          showIcon
          message="This procedure cannot be used with the generic CRUD screen"
          description={`Detected actions: ${
            actions?.detected?.length ? actions.detected.join(', ') : 'none'
          }. Parameter Settings expects a or r for list, c for create, u for update and d for delete.`}
          style={{ marginBottom: 16 }}
        />
      )}

      {!error && !unsupported && (
        <>
          {fields.length === 0 && !hasActionParam && (
            <Alert
              type="info"
              showIcon
              message="This template has no parameters. Execute to run the procedure."
              style={{ marginBottom: 16 }}
            />
          )}

          <Form form={form} layout="vertical">
            <Row gutter={[16, 0]}>
              {fields.map((field) => {
                const isBoolean =
                  field.fieldType === 'checkbox' && !String(field.options || '').trim();
                return (
                  <Col xs={24} sm={12} lg={8} xl={6} key={field.fieldName}>
                    <Form.Item
                      name={field.fieldName}
                      label={field.labelName || field.fieldName}
                      style={{ marginBottom: 14 }}
                      rules={
                        field.isRequired && !isBoolean
                          ? [
                              {
                                required: true,
                                message: `${field.labelName || field.fieldName} is required`,
                              },
                            ]
                          : []
                      }
                    >
                      <DynamicParameterField field={field} />
                    </Form.Item>
                  </Col>
                );
              })}
            </Row>

            <Space wrap align="center" style={{ marginTop: 2 }}>
              {hasActionParam && editingRow && (
                <Tag color="blue" style={{ margin: 0, fontWeight: 600 }}>
                  Editing
                </Tag>
              )}
              {hasActionParam ? (
                <>
                  {(editingRow ? canUpdate : canCreate) && (
                    <Button
                      type="primary"
                      icon={<SaveOutlined />}
                      loading={executing}
                      onClick={handleSave}
                      style={primaryButtonStyle}
                    >
                      {editingRow ? 'Update' : 'Save'}
                    </Button>
                  )}
                  {editingRow && (
                    <Button
                      icon={<CloseOutlined />}
                      onClick={handleCancel}
                      disabled={executing}
                      style={{ borderRadius: 6 }}
                    >
                      Cancel
                    </Button>
                  )}
                  {listAction && !supportsCrud && (
                    <Button
                      type="primary"
                      icon={<SearchOutlined />}
                      loading={executing}
                      onClick={handleRefresh}
                      style={primaryButtonStyle}
                    >
                      Search
                    </Button>
                  )}
                  {listAction && supportsCrud && (
                    <Button
                      icon={<ReloadOutlined />}
                      onClick={handleRefresh}
                      disabled={executing}
                      style={{ borderRadius: 6 }}
                    >
                      Refresh
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <Button
                    type="primary"
                    icon={<CaretRightOutlined />}
                    loading={executing}
                    onClick={handleExecute}
                    style={primaryButtonStyle}
                  >
                    Execute
                  </Button>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={handleReset}
                    disabled={executing}
                    style={{ borderRadius: 6 }}
                  >
                    Reset
                  </Button>
                </>
              )}
            </Space>
          </Form>

          {executed && (
            <div
              style={{
                marginTop: 16,
                paddingTop: 12,
                borderTop: `1px solid ${C.border}`,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 8,
                }}
              >
                <Text strong style={{ color: C.darkNavy }}>
                  {hasActionParam ? 'Records' : 'Result'}
                </Text>
                <Tag color="blue" style={{ fontWeight: 600, margin: 0 }}>
                  {rows.length} record{rows.length === 1 ? '' : 's'}
                </Tag>
              </div>
              <Table
                columns={tableColumns}
                dataSource={rows}
                rowKey={(_, index) => index}
                size="small"
                loading={executing}
                pagination={{ pageSize: 10, showSizeChanger: false }}
                scroll={{ x: 'max-content' }}
                locale={{
                  emptyText: (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="No records returned"
                    />
                  ),
                }}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ParameterMenu;

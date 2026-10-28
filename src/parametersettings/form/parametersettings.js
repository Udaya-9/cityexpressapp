import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Button,
  Col,
  Empty,
  Form,
  Input,
  Modal,
  Popconfirm,
  Result,
  Row,
  Select,
  Space,
  Spin,
  Switch,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
} from 'antd';
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  EditOutlined,
  PlayCircleOutlined,
  PlusOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import {
  deleteParameterSettingApi,
  getParameterSettingApi,
  getProcedureParametersApi,
  listParameterSettingsApi,
  listProceduresApi,
  saveParameterSettingApi,
} from '../API/parametersettingservice';
import genericService from '../../API/generic/genericservice';

const { Text } = Typography;

const C = {
  darkNavy: '#002b49',
  brand: '#01519b',
  border: '#e2e8f0',
  filterBorder: '#d9e2ec',
  text: '#16202f',
  muted: '#667085',
};

const FIELD_TYPES = [
  { value: 'textbox', label: 'Textbox' },
  { value: 'date-picker', label: 'Date (B.S./A.D.)' },
  { value: 'datetimepicker', label: 'Date & Time (B.S./A.D.)' },
  { value: 'select', label: 'Select' },
  { value: 'radio', label: 'Radio' },
  { value: 'checkbox', label: 'Checkbox' },
];

const getTokenRoles = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return [];
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const payload = JSON.parse(atob(padded));
    return String(payload?.roles || '')
      .toUpperCase()
      .split(',')
      .map((role) => role.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
};

const normalizeRoleOptions = (items) =>
  (Array.isArray(items) ? items : [])
    .map((item) => {
      const value = item?.Value ?? item?.value ?? item?.rolesId ?? item?.RoleId;
      const label = item?.Label ?? item?.label ?? item?.roleName ?? item?.RoleName ?? value;
      return { value: value ? String(value) : '', label: String(label ?? '') };
    })
    .filter((option) => option.value);

const mergeFields = (parameters, current) => {
  const currentByName = new Map(
    current.map((field) => [field.fieldName.toLowerCase(), field])
  );

  return (parameters || []).map((parameter) => {
    const existing = currentByName.get(parameter.fieldName.toLowerCase());
    if (existing) {
      return {
        ...existing,
        fieldName: parameter.fieldName,
        sqlType: parameter.sqlType,
        inForm: existing.inForm !== false,
      };
    }
    return {
      fieldName: parameter.fieldName,
      sqlType: parameter.sqlType,
      fieldType: parameter.fieldType,
      labelName: parameter.labelName || parameter.fieldName,
      isRequired: parameter.isRequired !== false,
      options: '',
      placeholder: '',
      inForm: true,
    };
  });
};

const mergeLoadedFields = (parameters, savedFields) => {
  const parameterByName = new Map(
    (parameters || []).map((parameter) => [parameter.fieldName.toLowerCase(), parameter])
  );
  const visible = savedFields.map((field) => ({
    ...field,
    sqlType: parameterByName.get(field.fieldName.toLowerCase())?.sqlType,
    inForm: true,
  }));
  const visibleNames = new Set(visible.map((field) => field.fieldName.toLowerCase()));

  const hidden = (parameters || [])
    .filter((parameter) => !visibleNames.has(parameter.fieldName.toLowerCase()))
    .map((parameter) => ({
      fieldName: parameter.fieldName,
      sqlType: parameter.sqlType,
      fieldType: parameter.fieldType,
      labelName: parameter.labelName || parameter.fieldName,
      isRequired: parameter.isRequired !== false,
      options: '',
      placeholder: '',
      inForm: false,
    }));

  return [...visible, ...hidden];
};

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString();
};

const ParameterSettings = () => {
  const navigate = useNavigate();
  const [isAdmin] = useState(() => {
    const roles = getTokenRoles();
    return roles.includes('ALL') || roles.includes('ADMIN');
  });

  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lookupsLoading, setLookupsLoading] = useState(false);
  const [procedures, setProcedures] = useState([]);
  const [roles, setRoles] = useState([]);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editorLoading, setEditorLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [fields, setFields] = useState([]);
  const [parametersLoading, setParametersLoading] = useState(false);
  const [roleFallback, setRoleFallback] = useState(null);
  const [form] = Form.useForm();
  const editorRequestRef = useRef(0);

  const loadConfigs = useCallback(async () => {
    setLoading(true);
    try {
      const list = await listParameterSettingsApi();
      setConfigs(Array.isArray(list) ? list : []);
    } catch (err) {
      message.error(
        err?.response?.data?.message || err?.message || 'Failed to load parameter settings'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAdmin) return undefined;

    let alive = true;
    loadConfigs();

    setLookupsLoading(true);
    Promise.allSettled([listProceduresApi(), genericService.getOptions('RoleTable')]).then(
      ([procedureResult, roleResult]) => {
        if (!alive) return;
        if (procedureResult.status === 'fulfilled') {
          setProcedures(Array.isArray(procedureResult.value) ? procedureResult.value : []);
        } else {
          message.error('Failed to load stored procedures');
        }
        if (roleResult.status === 'fulfilled') {
          setRoles(normalizeRoleOptions(roleResult.value));
        } else {
          message.error('Failed to load roles');
        }
        setLookupsLoading(false);
      }
    );

    return () => {
      alive = false;
      editorRequestRef.current += 1;
    };
  }, [isAdmin, loadConfigs]);

  const procedureOptions = useMemo(
    () => procedures.map((name) => ({ value: name, label: name })),
    [procedures]
  );

  const roleOptions = useMemo(
    () => (roleFallback ? [...roles, roleFallback] : roles),
    [roles, roleFallback]
  );

  const openEditor = async (record) => {
    const requestId = editorRequestRef.current + 1;
    editorRequestRef.current = requestId;

    form.resetFields();
    setFields([]);
    setRoleFallback(null);
    setEditingId(record?.parameterId || null);
    setEditorOpen(true);

    if (!record) return;

    setEditorLoading(true);
    try {
      const detail = await getParameterSettingApi(record.parameterId);
      if (editorRequestRef.current !== requestId) return;
      if (!detail) {
        message.error('Parameter setting not found');
        setEditorOpen(false);
        return;
      }

      form.setFieldsValue({
        paramterName: detail.parameterName,
        procedureName: detail.procedureName,
        roleKey: detail.roleKey || undefined,
        menuName: detail.menuName || '',
        canCreate: detail.canCreate !== false,
        canUpdate: detail.canUpdate !== false,
        canDelete: detail.canDelete !== false,
      });
      const loadedFields = (detail.fields || []).map((field) => ({
        fieldName: field.fieldName,
        fieldType: field.fieldType,
        labelName: field.labelName || field.fieldName,
        isRequired: Boolean(field.isRequired),
        options: field.options || '',
        placeholder: field.placeholder || '',
        inForm: true,
      }));
      const parameters = await getProcedureParametersApi(detail.procedureName).catch(
        () => null
      );
      if (editorRequestRef.current !== requestId) return;
      setFields(parameters ? mergeLoadedFields(parameters, loadedFields) : loadedFields);
      if (detail.roleKey && !roles.some((role) => role.value === detail.roleKey)) {
        setRoleFallback({
          value: detail.roleKey,
          label: detail.roleName || 'Assigned role',
        });
      }
    } catch (err) {
      if (editorRequestRef.current !== requestId) return;
      message.error(
        err?.response?.data?.message || err?.message || 'Failed to load parameter setting'
      );
      setEditorOpen(false);
    } finally {
      if (editorRequestRef.current === requestId) setEditorLoading(false);
    }
  };

  const closeEditor = () => {
    editorRequestRef.current += 1;
    setEditorOpen(false);
    setEditorLoading(false);
  };

  const handleProcedureSelect = async (procedureName) => {
    if (!procedureName) {
      setFields([]);
      return;
    }

    setParametersLoading(true);
    try {
      const parameters = await getProcedureParametersApi(procedureName);
      setFields((current) => mergeFields(parameters, current));
    } catch (err) {
      setFields([]);
      message.error(
        err?.response?.data?.message || err?.message || 'Failed to load procedure parameters'
      );
    } finally {
      setParametersLoading(false);
    }
  };

  const updateField = (fieldName, patch) => {
    setFields((current) =>
      current.map((field) => (field.fieldName === fieldName ? { ...field, ...patch } : field))
    );
  };

  const moveField = (index, direction) => {
    setFields((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const handleSave = async () => {
    let values;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }

    const fieldsToSave = fields.filter((field) => field.inForm !== false);

    const invalid = fieldsToSave.find(
      (field) =>
        (field.fieldType === 'select' || field.fieldType === 'radio') &&
        !String(field.options || '').trim()
    );
    if (invalid) {
      message.warning(
        `Options are required for "${invalid.labelName || invalid.fieldName}"`
      );
      return;
    }

    setSaving(true);
    try {
      await saveParameterSettingApi({
        paramterId: editingId || undefined,
        paramterName: values.paramterName.trim(),
        procedureName: values.procedureName,
        roleKey: values.roleKey || undefined,
        menuName: (values.menuName || '').trim(),
        canCreate: values.canCreate !== false,
        canUpdate: values.canUpdate !== false,
        canDelete: values.canDelete !== false,
        fields: fieldsToSave.map((field) => ({
          fieldName: field.fieldName,
          fieldType: field.fieldType,
          labelName: String(field.labelName || '').trim() || field.fieldName,
          isRequired: Boolean(field.isRequired),
          options: String(field.options || '').trim(),
          placeholder: String(field.placeholder || '').trim(),
        })),
      });
      message.success(editingId ? 'Parameter setting updated' : 'Parameter setting created');
      closeEditor();
      loadConfigs();
    } catch (err) {
      message.error(
        err?.response?.data?.message || err?.message || 'Failed to save parameter setting'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (record) => {
    try {
      await deleteParameterSettingApi(record.parameterId);
      message.success('Parameter setting deleted');
      loadConfigs();
    } catch (err) {
      message.error(
        err?.response?.data?.message || err?.message || 'Failed to delete parameter setting'
      );
    }
  };

  const fieldColumns = [
    {
      title: 'FIELD',
      dataIndex: 'fieldName',
      key: 'fieldName',
      width: 180,
      render: (value, record) => (
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.brand }}>{value}</div>
          {record.sqlType && <div style={{ fontSize: 10, color: C.muted }}>{record.sqlType}</div>}
        </div>
      ),
    },
    {
      title: 'IN FORM',
      key: 'inForm',
      width: 90,
      align: 'center',
      render: (_, record) => (
        <Switch
          size="small"
          checked={record.inForm !== false}
          onChange={(checked) => updateField(record.fieldName, { inForm: checked })}
        />
      ),
    },
    {
      title: 'LABEL',
      key: 'labelName',
      width: 180,
      render: (_, record) => (
        <Input
          value={record.labelName}
          maxLength={100}
          onChange={(event) => updateField(record.fieldName, { labelName: event.target.value })}
        />
      ),
    },
    {
      title: 'TYPE',
      key: 'fieldType',
      width: 160,
      render: (_, record) => (
        <Select
          value={record.fieldType}
          options={FIELD_TYPES}
          onChange={(value) => updateField(record.fieldName, { fieldType: value })}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'REQUIRED',
      key: 'isRequired',
      width: 90,
      align: 'center',
      render: (_, record) => (
        <Switch
          size="small"
          checked={Boolean(record.isRequired)}
          onChange={(checked) => updateField(record.fieldName, { isRequired: checked })}
        />
      ),
    },
    {
      title: 'OPTIONS',
      key: 'options',
      width: 220,
      render: (_, record) => {
        const disabled =
          record.fieldType === 'textbox' ||
          record.fieldType === 'date-picker' ||
          record.fieldType === 'datetimepicker';
        return (
          <Input
            value={record.options}
            maxLength={100}
            disabled={disabled}
            placeholder={disabled ? '—' : 'Static:A,B,C or Department'}
            onChange={(event) => updateField(record.fieldName, { options: event.target.value })}
          />
        );
      },
    },
    {
      title: 'PLACEHOLDER',
      key: 'placeholder',
      width: 160,
      render: (_, record) => {
        const disabled = record.fieldType === 'checkbox' || record.fieldType === 'radio';
        return (
          <Input
            value={record.placeholder}
            maxLength={100}
            disabled={disabled}
            placeholder={disabled ? '—' : 'Optional'}
            onChange={(event) => updateField(record.fieldName, { placeholder: event.target.value })}
          />
        );
      },
    },
    {
      title: 'ORDER',
      key: 'order',
      width: 90,
      align: 'center',
      render: (_, record, index) => (
        <Space size={4}>
          <Button
            size="small"
            type="text"
            icon={<ArrowUpOutlined />}
            disabled={index === 0}
            onClick={() => moveField(index, -1)}
          />
          <Button
            size="small"
            type="text"
            icon={<ArrowDownOutlined />}
            disabled={index === fields.length - 1}
            onClick={() => moveField(index, 1)}
          />
        </Space>
      ),
    },
  ];

  const columns = [
    {
      title: 'PARAMETER NAME',
      dataIndex: 'parameterName',
      key: 'parameterName',
      render: (value) => (
        <span style={{ fontWeight: 600, color: C.text, fontSize: 13 }}>{value}</span>
      ),
    },
    {
      title: 'PROCEDURE',
      dataIndex: 'procedureName',
      key: 'procedureName',
      render: (value) => (
        <Text code style={{ fontSize: 12 }}>
          {value}
        </Text>
      ),
    },
    {
      title: 'MENU',
      dataIndex: 'menuName',
      key: 'menuName',
      width: 160,
      responsive: ['lg'],
      render: (value) => <span style={{ fontSize: 12, color: C.muted }}>{value || '—'}</span>,
    },
    {
      title: 'ROLE',
      dataIndex: 'roleName',
      key: 'roleName',
      width: 160,
      responsive: ['xl'],
      render: (value, record) =>
        record.roleKey ? (
          <Tag color="blue" style={{ fontWeight: 600, borderRadius: 4 }}>
            {value || 'Assigned role'}
          </Tag>
        ) : (
          <span style={{ fontSize: 12, color: C.muted }}>All roles</span>
        ),
    },
    {
      title: 'FIELDS',
      dataIndex: 'fieldCount',
      key: 'fieldCount',
      width: 90,
      align: 'center',
      responsive: ['xl'],
      render: (value) => (
        <span style={{ fontSize: 12, fontWeight: 600, color: C.muted }}>{value ?? 0}</span>
      ),
    },
    {
      title: 'UPDATED',
      dataIndex: 'updatedDate',
      key: 'updatedDate',
      width: 130,
      responsive: ['xl'],
      render: formatDate,
    },
    {
      title: 'ACTIONS',
      key: 'actions',
      width: 160,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Run">
            <Button
              type="primary"
              size="small"
              icon={<PlayCircleOutlined />}
              onClick={() => navigate(`/parameter-menu/${record.parameterId}`)}
              style={{
                background: '#0f9d58',
                borderColor: '#0f9d58',
                borderRadius: 4,
              }}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="primary"
              size="small"
              icon={<EditOutlined />}
              onClick={() => openEditor(record)}
              style={{
                background: '#1a73e8',
                borderColor: '#1a73e8',
                borderRadius: 4,
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Delete Parameter Setting"
            description="Are you sure you want to delete this parameter setting?"
            onConfirm={() => handleDelete(record)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Delete">
              <Button
                danger
                type="primary"
                size="small"
                icon={<DeleteOutlined />}
                style={{ borderRadius: 4 }}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (!isAdmin) {
    return (
      <Result
        status="403"
        title="403"
        subTitle="You are not authorized to access Parameter Settings."
      />
    );
  }

  return (
    <div style={{ padding: '4px 0' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 20,
        }}
      >
        <div style={{ fontSize: 12, color: C.muted }}>
          Configure stored procedure parameters and execute business processes.
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => openEditor(null)}
          style={{
            background: '#01519b',
            borderColor: '#01519b',
            fontWeight: 600,
            height: 38,
            borderRadius: 6,
            padding: '0 18px',
          }}
        >
          New Parameter Setting
        </Button>
      </div>

      <div
        style={{
          background: '#ffffff',
          border: `1px solid ${C.filterBorder}`,
          borderRadius: 8,
          padding: 16,
          boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
        }}
      >
        <Table
          columns={columns}
          dataSource={configs}
          rowKey="parameterId"
          loading={loading}
          size="middle"
          pagination={{ pageSize: 10, showSizeChanger: false }}
          scroll={{ x: 'max-content' }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No parameter settings configured"
              />
            ),
          }}
        />
      </div>

      <Modal
        open={editorOpen}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: C.darkNavy, fontWeight: 700 }}>
            <SettingOutlined style={{ color: C.brand }} />
            <span>{editingId ? 'Edit Parameter Setting' : 'New Parameter Setting'}</span>
          </div>
        }
        width="min(1040px, 96vw)"
        onCancel={closeEditor}
        maskClosable={false}
        footer={[
          <Button key="cancel" onClick={closeEditor} style={{ borderRadius: 6 }}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={saving}
            onClick={handleSave}
            style={{
              background: '#01519b',
              borderColor: '#01519b',
              fontWeight: 600,
              borderRadius: 6,
            }}
          >
            Save
          </Button>,
        ]}
      >
        <Spin spinning={editorLoading}>
          <Form
            form={form}
            layout="vertical"
            style={{ marginTop: 12 }}
            initialValues={{ canCreate: true, canUpdate: true, canDelete: true }}
          >
            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item
                  name="paramterName"
                  label="Parameter Name"
                  rules={[{ required: true, message: 'Parameter name is required' }]}
                >
                  <Input maxLength={100} placeholder="e.g. Correspondence Report" />
                </Form.Item>
              </Col>
              <Col xs={24} md={10}>
                <Form.Item
                  name="procedureName"
                  label="Procedure"
                  rules={[{ required: true, message: 'Procedure is required' }]}
                >
                  <Select
                    showSearch
                    optionFilterProp="label"
                    options={procedureOptions}
                    loading={lookupsLoading || parametersLoading}
                    onSelect={handleProcedureSelect}
                    placeholder="Select stored procedure"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item name="roleKey" label="Role">
                  <Select
                    allowClear
                    options={roleOptions}
                    loading={lookupsLoading}
                    placeholder="All roles"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item
                  name="menuName"
                  label="Menu Name"
                  rules={[{ required: true, message: 'Menu name is required' }]}
                >
                  <Input maxLength={100} placeholder="e.g. Correspondence Report" />
                </Form.Item>
              </Col>
              <Col xs={12} md={4}>
                <Form.Item name="canCreate" label="Grid create" valuePropName="checked">
                  <Switch size="small" />
                </Form.Item>
              </Col>
              <Col xs={12} md={4}>
                <Form.Item name="canUpdate" label="Grid update" valuePropName="checked">
                  <Switch size="small" />
                </Form.Item>
              </Col>
              <Col xs={12} md={4}>
                <Form.Item name="canDelete" label="Grid delete" valuePropName="checked">
                  <Switch size="small" />
                </Form.Item>
              </Col>
            </Row>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                margin: '4px 0 8px',
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 700, color: '#3b556e' }}>
                PROCEDURE PARAMETERS
              </span>
              <span style={{ fontSize: 11, color: C.muted }}>
                {fields.filter((field) => field.inForm !== false).length} in form
              </span>
            </div>

            <Table
              columns={fieldColumns}
              dataSource={fields}
              rowKey="fieldName"
              loading={parametersLoading}
              pagination={false}
              size="small"
              scroll={{ x: 1200 }}
              locale={{
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Select a procedure to load its parameters"
                  />
                ),
              }}
            />

            <div style={{ marginTop: 10, fontSize: 11, lineHeight: 1.6, color: C.muted }}>
              <div>
                Options: leave blank for a single yes/no checkbox. Use{' '}
                <Text code style={{ fontSize: 11 }}>
                  Static:A,B,C
                </Text>{' '}
                for fixed choices or a list type such as Department, Vendor, FiscalYear or
                RoleTable.
              </div>
              <div style={{ marginTop: 4 }}>
                Fields switched off stay available to the procedure from the selected table row
                but do not appear on the generated form. Procedures that declare{' '}
                <Text code style={{ fontSize: 11 }}>
                  @action
                </Text>{' '}
                get the standard list screen automatically: a = list, c = insert, u = update, d =
                delete.
              </div>
            </div>
          </Form>
        </Spin>
      </Modal>
    </div>
  );
};

export default ParameterSettings;

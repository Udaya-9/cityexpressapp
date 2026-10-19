import React, { useState, useEffect, useMemo } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Select,
  AutoComplete,
  Button,
  Row,
  Col,
  Divider,
  Table,
  Tag,
  Tooltip,
  message,
} from 'antd';
import {
  MailOutlined,
  SendOutlined,
  ArrowLeftOutlined,
  CheckOutlined,
  CopyOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import {
  createCorrespondenceApi,
  batchCreateOutgoingApi,
  getCorrespondenceApi,
  getDepartmentsApi,
  getUsersApi,
  getVendorsApi,
} from '../API/correspondenceservice';

const { Option } = Select;

const DOCUMENT_TYPES = [
  'DOCUMENTS',
  'INVOICE / BILL',
  'OFFICIAL LETTER',
  'CONTRACT / AGREEMENT',
  'LEGAL NOTICE',
  'RECEIPT / VOUCHER',
  'TAX CLEARANCE',
  'BANK STATEMENT',
  'OTHER',
];

const NewCorrespondenceEntry = ({ type = 'incoming', onBack, onSuccess }) => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [outgoingForm] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(null);
  const [vendorOptions, setVendorOptions] = useState([]);
  const [generatedList, setGeneratedList] = useState([]);
  const [copiedKey, setCopiedKey] = useState(null);

  const isIncoming = type === 'incoming';

  // Load departments, users, and vendors dynamically from DB
  useEffect(() => {
    let isMounted = true;
    const fetchDropdowns = async () => {
      try {
        const [deptList, userList, vendorList] = await Promise.all([
          getDepartmentsApi(),
          getUsersApi(),
          getVendorsApi(),
        ]);
        if (!isMounted) return;

        if (deptList && deptList.length > 0) {
          const depts = deptList
            .map((d) => ({
              value: d.Value || d.DepartmentId || d.id,
              label: (d.Label || d.DepartmentName || d.name || '').trim(),
            }))
            .filter((d) => d.label);
          if (depts.length) {
            setDepartments(depts);
            if (!outgoingForm.getFieldValue('departmentId')) {
              outgoingForm.setFieldsValue({ departmentId: depts[0].value });
            }
          }
        }

        if (userList && userList.length > 0) {
          const usrs = userList
            .map((u) => ({
              value: u.Value || u.Id || u.id,
              label: (u.Label || u.FullName || u.name || '').trim(),
              departmentId: u.DepartmentId || u.departmentId || u.Department || null,
            }))
            .filter((u) => u.label);
          if (usrs.length) setUsers(usrs);
        }

        if (vendorList && vendorList.length > 0) {
          const vnds = vendorList
            .map((v) => ({
              value: (v.Label || v.VendorName || v.name || '').trim(),
            }))
            .filter((v) => v.value);
          if (vnds.length) setVendorOptions(vnds);
        }
      } catch (e) {
        console.error('Error fetching dropdowns:', e);
      }
    };
    fetchDropdowns();

    // If outgoing, pre-load recent generated outgoing references for quick reference
    if (!isIncoming) {
      getCorrespondenceApi({ type: 'outgoing' })
        .then((data) => {
          if (isMounted && Array.isArray(data)) {
            setGeneratedList(data.slice(0, 10));
          }
        })
        .catch(() => {});
    }

    return () => {
      isMounted = false;
    };
  }, [isIncoming, outgoingForm]);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(`/correspondence/${type}`);
    }
  };

  // Copy helper
  const handleCopy = (refId, recordKey) => {
    if (!refId) return;
    navigator.clipboard?.writeText(refId);
    setCopiedKey(recordKey);
    message.success(`Copied "${refId}" to clipboard!`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // When department changes, filter users belonging to that department and clear previous user selection
  const handleDepartmentChange = (deptVal) => {
    // deptVal can be either DepartmentId GUID or department label
    const matchedDept = departments.find(
      (d) => d.value === deptVal || d.label === deptVal
    );
    const resolvedDeptId = matchedDept?.value || deptVal;
    setSelectedDepartmentId(resolvedDeptId);
    form.setFieldsValue({ assignToUser: undefined });
  };

  // Filter users by selected DepartmentId
  const displayedUsers = useMemo(() => {
    if (!selectedDepartmentId) return users;
    const match = users.filter((u) => {
      if (!u.departmentId) return false;
      return String(u.departmentId).toLowerCase() === String(selectedDepartmentId).toLowerCase();
    });
    return match;
  }, [users, selectedDepartmentId]);

  const handleReset = () => {
    form.resetFields();
    setSelectedDepartmentId(null);
  };

  // Handle incoming submission
  const handleIncomingFinish = async (values) => {
    setSubmitting(true);
    try {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

      const locationPart = (values.location || '').trim();
      const vendorPart = (values.vendorName || '').trim();
      let fromOrg = locationPart;
      if (vendorPart && locationPart) {
        fromOrg = `${vendorPart} (${locationPart})`;
      } else if (vendorPart) {
        fromOrg = vendorPart;
      }

      const deptObj = departments.find(
        (d) => d.value === values.forwardToDepartment || d.label === values.forwardToDepartment
      );
      const userObj = users.find(
        (u) => u.value === values.assignToUser || u.label === values.assignToUser
      );

      const deptId = deptObj?.value || values.forwardToDepartment;
      const deptName = deptObj?.label || values.forwardToDepartment || 'INFORMATION TECHNOLOGY';
      const userId = userObj?.value || values.assignToUser;
      const userName = userObj?.label || values.assignToUser || '';

      const loggedUser = (() => {
        try {
          return JSON.parse(localStorage.getItem('user') || '{}');
        } catch {
          return {};
        }
      })();

      const payload = {
        receivedFrom: (values.receivedFrom || '').trim(),
        vendorName: vendorPart || undefined,
        location: locationPart || undefined,
        documentType: (values.documentType || 'DOCUMENTS').toUpperCase(),
        departmentId: deptId,
        forwardToDepartment: deptName,
        forwardedToDept: deptName,
        forwardedToUser: userId,
        fowardedTo: userId,
        assignToUser: userName,
        forwardedToName: userName,
        remarks: (values.subject || '').trim(),
        subject: (values.subject || '').trim(),
        particularTitle: (values.documentType || 'DOCUMENTS').toUpperCase(),
        particularSubtitle: (values.subject || '').trim(),
        fromName: (values.receivedFrom || '').trim(),
        fromOrg: fromOrg || undefined,
        receviedBy: loggedUser.id || undefined,
        receivedBy: loggedUser.fullname || loggedUser.name || loggedUser.username || undefined,
        receivedDate: `${new Date().toISOString().split('T')[0]} ${timeStr}`,
        type: 'incoming',
      };

      const created = await createCorrespondenceApi(payload);
      message.success(`Incoming entry ${created?.referenceId || ''} saved and forwarded successfully!`);
      handleReset();
      if (onSuccess) {
        onSuccess(created);
      } else {
        navigate('/correspondence/incoming');
      }
    } catch (err) {
      console.error('Failed to create correspondence:', err);
      message.error(err.response?.data?.message || 'Failed to save incoming correspondence entry');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle outgoing batch generation
  const handleOutgoingGenerate = async (values) => {
    setSubmitting(true);
    try {
      const count = parseInt(values.count, 10) || 1;
      const remarks = (values.remarks || '').trim();

      const loggedUser = (() => {
        try {
          return JSON.parse(localStorage.getItem('user') || '{}');
        } catch {
          return {};
        }
      })();

      const createdList = await batchCreateOutgoingApi({
        count,
        remarks,
        departmentId: loggedUser.departmentId || loggedUser.DepartmentId || null,
        createdBy: loggedUser.id || loggedUser.Id || null,
      });

      if (createdList && createdList.length > 0) {
        message.success(`Successfully generated ${createdList.length} outgoing correspondence ID(s)!`);
        setGeneratedList((prev) => [...createdList, ...prev]);
        outgoingForm.resetFields();
        outgoingForm.setFieldsValue({ count: 1 });
      } else {
        message.warning('Could not generate outgoing ID. Please check database connection.');
      }
    } catch (err) {
      console.error('Failed to generate outgoing correspondence:', err);
      message.error(err.response?.data?.message || 'Failed to generate outgoing reference ID');
    } finally {
      setSubmitting(false);
    }
  };

  const labelStyle = {
    fontSize: 11,
    fontWeight: 700,
    color: '#1e3a5f',
    letterSpacing: '0.6px',
    textTransform: 'uppercase',
    marginBottom: 6,
  };

  // Outgoing records table columns matching UI specification
  const outgoingColumns = [
    {
      title: 'S.No',
      key: 'sno',
      width: 70,
      align: 'center',
      render: (_, __, index) => (
        <span style={{ fontWeight: 600, color: '#475467' }}>{index + 1}</span>
      ),
    },
    {
      title: 'Reference No',
      dataIndex: 'referenceId',
      key: 'referenceId',
      width: 220,
      render: (val, record) => (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <Tag
            color="purple"
            style={{
              fontSize: 13,
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: 6,
              letterSpacing: '0.4px',
              fontFamily: 'monospace',
            }}
          >
            {val}
          </Tag>
          <Tooltip title={copiedKey === record.key ? 'Copied!' : 'Copy Reference No'}>
            <Button
              type="text"
              size="small"
              icon={copiedKey === record.key ? <CheckOutlined style={{ color: '#16a34a' }} /> : <CopyOutlined />}
              onClick={() => handleCopy(val, record.key)}
            />
          </Tooltip>
        </div>
      ),
    },
    {
      title: 'Created By',
      dataIndex: 'createdBy',
      key: 'createdBy',
      width: 160,
      render: (val, record) => (
        <span style={{ fontWeight: 600, color: '#1e293b', textTransform: 'uppercase' }}>
          {val || record.createdBy || record.receivedBy || record.fromName || '—'}
        </span>
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
        if (isNaN(d.getTime())) return String(dStr).slice(0, 10);
        return d.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
      },
    },
    {
      title: 'Remarks',
      dataIndex: 'remarks',
      key: 'remarks',
      render: (val) => (
        <span style={{ color: '#334155', fontSize: 13 }}>
          {val || '—'}
        </span>
      ),
    },
  ];

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '24px 32px' }}>
      {/* Eyebrow Label */}
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: '#1a73e8',
          letterSpacing: '0.8px',
          textTransform: 'uppercase',
          marginBottom: 6,
        }}
      >
        CORRESPONDENCE REGISTRY
      </div>

      {/* Header with Title and Back Button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: 16,
          borderBottom: '2px solid #002b49',
          marginBottom: 24,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {isIncoming ? (
            <MailOutlined style={{ fontSize: 28, color: '#013b73' }} />
          ) : (
            <SendOutlined style={{ fontSize: 28, color: '#6941c6' }} />
          )}
          <h1
            style={{
              margin: 0,
              fontSize: 24,
              fontWeight: 700,
              color: '#013b73',
              letterSpacing: '-0.3px',
            }}
          >
            {isIncoming ? 'New Incoming Entry' : 'Create Outgoing Correspondence'}
          </h1>
        </div>

        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={handleBack}
          style={{
            fontWeight: 600,
            color: '#1a73e8',
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          Back to List
        </Button>
      </div>

      {!isIncoming ? (
        <div>
          <div
            style={{
              background: '#ffffff',
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              padding: '24px 28px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              marginBottom: 28,
            }}
          >
            <Form
              form={outgoingForm}
              layout="vertical"
              onFinish={handleOutgoingGenerate}
              initialValues={{ count: 1 }}
            >
              <Row gutter={16} align="middle">
                <Col xs={24} sm={12} md={4}>
                  <Form.Item
                    name="count"
                    label={<span style={labelStyle}>COUNT</span>}
                    rules={[{ required: true, message: 'Please enter count' }]}
                  >
                    <InputNumber
                      min={1}
                      max={50}
                      placeholder="Enter count"
                      style={{ width: '100%', height: 42, borderRadius: 6, fontSize: 14 }}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} md={16}>
                  <Form.Item
                    name="remarks"
                    label={<span style={labelStyle}>REMARKS</span>}
                    rules={[{ required: true, message: 'Please enter remarks' }]}
                  >
                    <Input
                      placeholder="Enter remarks here..."
                      style={{ borderRadius: 6, padding: '8px 12px', fontSize: 13, height: 42 }}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={24} md={4} style={{ display: 'flex', alignItems: 'center' }}>
                  <Form.Item style={{ width: '100%', marginBottom: 0 }}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={submitting}
                      icon={<ThunderboltOutlined />}
                      style={{
                        background: '#6941c6',
                        borderColor: '#6941c6',
                        fontWeight: 700,
                        fontSize: 14,
                        height: 42,
                        width: '100%',
                        borderRadius: 6,
                      }}
                    >
                      Generate
                    </Button>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </div>

          <div
            style={{
              background: '#ffffff',
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              padding: '20px 24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1e293b' }}>
                Generated Outgoing Records
              </h3>
              <span style={{ fontSize: 12, color: '#64748b' }}>
                Showing recent {generatedList.length} references
              </span>
            </div>

            <Table
              dataSource={generatedList}
              columns={outgoingColumns}
              rowKey={(r, idx) => r.key || r.referenceId || idx}
              pagination={{ pageSize: 10, showSizeChanger: false }}
              size="middle"
              locale={{ emptyText: 'No outgoing correspondence generated yet. Click Generate above.' }}
            />
          </div>
        </div>
      ) : (
        <div
          style={{
            background: '#ffffff',
            borderRadius: 8,
            border: '1px solid #e2e8f0',
            padding: '32px 36px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            maxWidth: 1080,
            margin: '0 auto',
          }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleIncomingFinish}
            initialValues={{ documentType: 'DOCUMENTS' }}
          >
            {/* Row 1: RECEIVED FROM & VENDOR NAME */}
            <Row gutter={32}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="receivedFrom"
                  label={<span style={labelStyle}>RECEIVED FROM *</span>}
                  rules={[{ required: true, message: 'Please enter sender name or organization' }]}
                >
                  <Input
                    placeholder="Enter sender name or organization"
                    style={{ height: 42, borderRadius: 6 }}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="vendorName"
                  label={<span style={labelStyle}>VENDOR NAME</span>}
                >
                  <AutoComplete
                    options={vendorOptions}
                    placeholder="Enter vendor name (optional)"
                    filterOption={(inputValue, option) =>
                      option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                    }
                  >
                    <Input style={{ height: 42, borderRadius: 6 }} />
                  </AutoComplete>
                </Form.Item>
              </Col>
            </Row>

            {/* Row 2: LOCATION & DOCUMENT TYPE */}
            <Row gutter={32}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="location"
                  label={<span style={labelStyle}>LOCATION *</span>}
                  rules={[{ required: true, message: 'Please enter location' }]}
                >
                  <Input
                    placeholder="Enter location"
                    style={{ height: 42, borderRadius: 6 }}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="documentType"
                  label={<span style={labelStyle}>DOCUMENT TYPE *</span>}
                  rules={[{ required: true, message: 'Please select document type' }]}
                >
                  <Select
                    placeholder="-- Select Type --"
                    style={{ height: 42, width: '100%' }}
                    showSearch
                  >
                    {DOCUMENT_TYPES.map((dt) => (
                      <Option key={dt} value={dt}>
                        {dt}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            {/* Row 3: FORWARD TO DEPARTMENT & ASSIGN TO USER */}
            <Row gutter={32}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="forwardToDepartment"
                  label={<span style={labelStyle}>FORWARD TO DEPARTMENT *</span>}
                  rules={[{ required: true, message: 'Please select department' }]}
                  extra={
                    <span style={{ fontSize: 12, color: '#64748b' }}>
                      Select the department to forward this correspondence
                    </span>
                  }
                >
                  <Select
                    placeholder="--Select Department--"
                    style={{ height: 42, width: '100%' }}
                    showSearch
                    optionFilterProp="children"
                    onChange={handleDepartmentChange}
                  >
                    {departments.map((dept) => (
                      <Option key={dept.value || dept} value={dept.value || dept}>
                        {dept.label || dept}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="assignToUser"
                  label={<span style={labelStyle}>ASSIGN TO USER *</span>}
                  rules={[{ required: true, message: 'Please select user' }]}
                  extra={
                    selectedDepartmentId && (
                      <span style={{ fontSize: 12, color: '#64748b' }}>
                        Showing {displayedUsers.length} personnel from selected department
                      </span>
                    )
                  }
                >
                  <Select
                    placeholder={
                      !selectedDepartmentId
                        ? '-- Select Department First --'
                        : displayedUsers.length === 0
                        ? 'No personnel in this department'
                        : '-- Select User --'
                    }
                    style={{ height: 42, width: '100%' }}
                    showSearch
                    optionFilterProp="children"
                    notFoundContent={
                      selectedDepartmentId
                        ? 'No users found for this department'
                        : 'Please select a department first'
                    }
                  >
                    {displayedUsers.map((u) => (
                      <Option key={u.value || u} value={u.value || u}>
                        {u.label || u}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            {/* Row 4: SUBJECT / DESCRIPTION */}
            <Row gutter={32} style={{ marginTop: 8 }}>
              <Col span={24}>
                <Form.Item
                  name="subject"
                  label={<span style={labelStyle}>SUBJECT / DESCRIPTION *</span>}
                  rules={[{ required: true, message: 'Please provide description or subject' }]}
                >
                  <Input.TextArea
                    rows={4}
                    placeholder="Provide a brief description or subject of the correspondence"
                    style={{ borderRadius: 6, padding: '10px 14px' }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Divider style={{ margin: '28px 0 24px 0', borderColor: '#e2e8f0' }} />

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={submitting}
                style={{
                  background: '#0e70c4',
                  borderColor: '#0e70c4',
                  fontWeight: 700,
                  fontSize: 14,
                  height: 42,
                  borderRadius: 6,
                  padding: '0 36px',
                  letterSpacing: '0.2px',
                }}
              >
                Save and Forward
              </Button>

              <Button
                onClick={handleReset}
                style={{
                  borderColor: '#d0d5dd',
                  color: '#344054',
                  fontWeight: 600,
                  fontSize: 14,
                  height: 42,
                  borderRadius: 6,
                  padding: '0 28px',
                }}
              >
                Reset
              </Button>
            </div>
          </Form>
        </div>
      )}
    </div>
  );
};

export default NewCorrespondenceEntry;

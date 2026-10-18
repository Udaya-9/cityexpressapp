import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Select,
  AutoComplete,
  Button,
  Row,
  Col,
  Divider,
  message,
} from 'antd';
import {
  MailOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import {
  createCorrespondenceApi,

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

const DEFAULT_DEPARTMENTS = [
  { value: 'C3224B2A-C9E7-41C6-B46F-1A4BD848178C', label: 'INFORMATION TECHNOLOGY' },
  { value: '393FAA72-DC8B-44AA-9F6F-3593D58AE8BB', label: 'ACCOUNT AND FINANCE' },
  { value: '60A3C7A7-6FDB-4006-AFE5-7BD5964C6BA5', label: 'HUMAN RESOURCE' },
  { value: 'E08DDC40-9E8A-4537-BFF4-E3B43F40F630', label: 'GENERAL ADMINISTRATION DEPARTMENT' },
];

const DEFAULT_USERS = [
  { value: '22832DF7-B958-48AB-8AD0-838E888636BD', label: 'Udaya Chandra Ghimire' },
  { value: '94DDFB69-EBC9-4350-98A6-8F5A19FC0731', label: 'Kriman Basnet' },
  { value: 'EB5A30D4-92CE-4186-A9F4-7E327763FF44', label: 'Bidhya Dhakal' },
  { value: '0227626F-2700-4DD6-B1FE-62D614BA4412', label: 'Udaya Ghimire' },
];

const NewCorrespondenceEntry = ({ type = 'incoming', onBack, onSuccess }) => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [departments, setDepartments] = useState(DEFAULT_DEPARTMENTS);
  const [users, setUsers] = useState(DEFAULT_USERS);
  const [vendorOptions, setVendorOptions] = useState([]);

  const isIncoming = type === 'incoming';
  const pageTitle = isIncoming ? 'New Incoming Entry' : 'New Outgoing Entry';

  // Load departments, users, and vendors dynamically from DB via sProc_GenericList
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
          const depts = deptList.map((d) => ({
            value: d.Value || d.DepartmentId || d.id,
            label: (d.Label || d.DepartmentName || d.name || '').trim(),
          })).filter((d) => d.label);
          if (depts.length) setDepartments(depts);
        }

        if (userList && userList.length > 0) {
          const usrs = userList.map((u) => ({
            value: u.Value || u.Id || u.id,
            label: (u.Label || u.FullName || u.name || '').trim(),
          })).filter((u) => u.label);
          if (usrs.length) setUsers(usrs);
        }

        if (vendorList && vendorList.length > 0) {
          const vnds = vendorList.map((v) => ({
            value: (v.Label || v.VendorName || v.name || '').trim(),
          })).filter((v) => v.value);
          if (vnds.length) setVendorOptions(vnds);
        }
      } catch (e) {
        console.error('Error fetching dropdowns:', e);
      }
    };
    fetchDropdowns();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(`/correspondence/${type}`);
    }
  };

  const handleFinish = async (values) => {
    setSubmitting(true);
    try {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

      // Assemble organization/location representation
      const locationPart = (values.location || '').trim();
      const vendorPart = (values.vendorName || '').trim();
      let fromOrg = locationPart;
      if (vendorPart && locationPart) {
        fromOrg = `${vendorPart} (${locationPart})`;
      } else if (vendorPart) {
        fromOrg = vendorPart;
      }

      // Resolve department and user objects for GUIDs and Names
      const deptObj = departments.find(
        (d) => d.value === values.forwardToDepartment || d.label === values.forwardToDepartment
      );
      const userObj = users.find(
        (u) => u.value === values.assignToUser || u.label === values.assignToUser
      );

      const deptId = deptObj?.value || values.forwardToDepartment;
      const deptName = deptObj?.label || values.forwardToDepartment || 'INFORMATION TECHNOLOGY';
      const userId = userObj?.value || values.assignToUser;
      const userName = userObj?.label || values.assignToUser || 'UNASSIGNED';



      const loggedUser = (() => {
        try {
          return JSON.parse(localStorage.getItem('user') || '{}');
        } catch {
          return {};
        }
      })();

      const payload = {
        fiscalYear: 'FY2083_84',
        receivedFrom: (values.receivedFrom || '').trim(),
        vendorName: vendorPart,
        location: locationPart,
        documentType: (values.documentType || 'DOCUMENTS').toUpperCase(),
        departmentId: deptId,
        forwardToDepartment: deptName,
        forwardedToDept: deptName,
        fowardedTo: userId,
        assignToUser: userName,
        forwardedToName: userName,
        remarks: (values.subject || '').trim(),
        subject: (values.subject || '').trim(),
        particularTitle: (values.documentType || 'DOCUMENTS').toUpperCase(),
        particularSubtitle: (values.subject || '').trim(),
        fromName: (values.receivedFrom || '').trim(),
        fromOrg: fromOrg || 'MAIN BRANCH',
        receviedBy: loggedUser.id || undefined,
        receivedBy: loggedUser.fullname || 'OFFICER',
        receivedDate: `${new Date().toISOString().split('T')[0]} ${timeStr}`,
        type,
      };


      const created = await createCorrespondenceApi(payload);
      message.success(`Entry ${created?.referenceId || ''} saved and forwarded successfully!`);
      form.resetFields();
      if (onSuccess) {
        onSuccess(created);
      } else {
        navigate(`/correspondence/${type}`);
      }
    } catch (err) {


      console.error('Failed to create correspondence:', err);
      message.error(err.response?.data?.message || 'Failed to save correspondence entry');
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

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh', padding: '24px 32px' }}>
      {/* Eyebrow Label */}
      <div
        style={{
          fontSize: 10,
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
          marginBottom: 32,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <MailOutlined style={{ fontSize: 28, color: '#013b73' }} />
          <h1
            style={{
              margin: 0,
              fontSize: 26,
              fontWeight: 600,
              color: '#013b73',
              fontFamily: "Georgia, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, serif",
              letterSpacing: '-0.3px',
            }}
          >
            {pageTitle}
          </h1>
        </div>

        <Button
          icon={<ArrowLeftOutlined />}
          onClick={handleBack}
          style={{
            borderColor: '#cfd8dc',
            color: '#1e3a5f',
            fontWeight: 600,
            fontSize: 13,
            height: 36,
            borderRadius: 4,
            padding: '0 16px',
          }}
        >
          Back to List
        </Button>
      </div>

      {/* Form Container */}
      <div style={{ maxWidth: 1040, margin: '0 auto' }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          requiredMark={(label, { required }) => (
            <span>
              {label}
              {required && <span style={{ color: '#01519b', marginLeft: 4 }}>*</span>}
            </span>
          )}
        >
          {/* Row 1: RECEIVED FROM & VENDOR NAME */}
          <Row gutter={32}>
            <Col xs={24} md={12}>
              <Form.Item
                name="receivedFrom"
                label={<span style={labelStyle}>RECEIVED FROM</span>}
                rules={[{ required: true, message: 'Please enter sender name or organization' }]}
              >
                <Input
                  placeholder="Enter sender name or organization"
                  style={{ height: 42, borderRadius: 4 }}
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
                    (option?.value || '').toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                  }
                  style={{ width: '100%' }}
                >
                  <Input style={{ height: 42, borderRadius: 4 }} />
                </AutoComplete>
              </Form.Item>
            </Col>
          </Row>

          {/* Row 2: LOCATION & DOCUMENT TYPE */}
          <Row gutter={32}>
            <Col xs={24} md={12}>
              <Form.Item
                name="location"
                label={<span style={labelStyle}>LOCATION</span>}
                rules={[{ required: false, message: 'Please enter location' }]}
              >
                <Input
                  placeholder="Enter location"
                  style={{ height: 42, borderRadius: 4 }}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="documentType"
                label={<span style={labelStyle}>DOCUMENT TYPE</span>}
                rules={[{ required: true, message: 'Please select document type' }]}
              >
                <Select
                  placeholder="-- Select Type --"
                  style={{ height: 42, width: '100%' }}
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
                label={<span style={labelStyle}>FORWARD TO DEPARTMENT</span>}
                rules={[{ required: true, message: 'Please select department' }]}
                help={
                  <span style={{ fontSize: 12, color: '#64748b', display: 'block', marginTop: 4 }}>
                    Select the department to forward this correspondence
                  </span>
                }
              >
                <Select
                  placeholder="--Select Department--"
                  style={{ height: 42, width: '100%' }}
                  showSearch
                  optionFilterProp="children"
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
                label={<span style={labelStyle}>ASSIGN TO USER</span>}
                rules={[{ required: true, message: 'Please select user' }]}
              >
                <Select
                  placeholder="-- Select User --"
                  style={{ height: 42, width: '100%' }}
                  showSearch
                  optionFilterProp="children"
                >
                  {users.map((u) => (
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
                label={<span style={labelStyle}>SUBJECT / DESCRIPTION</span>}
                rules={[{ required: true, message: 'Please provide description or subject' }]}
              >
                <Input.TextArea
                  rows={4}
                  placeholder="Provide a brief description or subject of the correspondence"
                  style={{ borderRadius: 4, padding: '10px 14px' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider style={{ margin: '32px 0 28px 0', borderColor: '#e2e8f0' }} />

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
                borderRadius: 4,
                padding: '0 32px',
                letterSpacing: '0.2px',
              }}
            >
              Save and Forward
            </Button>

            <Button
              onClick={() => form.resetFields()}
              style={{
                borderColor: '#d0d5dd',
                color: '#344054',
                fontWeight: 600,
                fontSize: 14,
                height: 42,
                borderRadius: 4,
                padding: '0 28px',
              }}
            >
              Reset
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default NewCorrespondenceEntry;

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    Card,
    Form,
    Input,
    Select,
    Switch,
    Button,
    Space,
    Typography,
    Row,
    Col,
    Divider,
    message,
    Spin,
} from "antd";
import {
    UserOutlined,
    SaveOutlined,
    ArrowLeftOutlined,
    LockOutlined,
    EditOutlined,
} from "@ant-design/icons";
import { GetAllUsers_API, updateUserById_API } from "../API/User.API";
import { GenericService } from "../../API/generic/genericservice";

const { Text } = Typography;
const genericService = new GenericService();

const UpdateUser = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [form] = Form.useForm();
    
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [userEmail, setUserEmail] = useState(""); 

    // 🔹 Dropdown states
    const [departments, setDepartments] = useState([]);
    const [units, setUnits] = useState([]);
    const [roles, setRoles] = useState([]);
    const [optionsLoading, setOptionsLoading] = useState(true);
    const [unitsLoading, setUnitsLoading] = useState(false);

    // Watch the department field to trigger unit changes
    const departmentId = Form.useWatch("department", form);

    // 🔹 Load Departments and Roles on mount
    useEffect(() => {
        let cancelled = false;
        const loadOptions = async () => {
            setOptionsLoading(true);
            try {
                const [deptList, roleList] = await Promise.all([
                    genericService.getDepartments(),
                    genericService.getRoles(),
                ]);
                if (cancelled) return;
                setDepartments(deptList || []);
                setRoles(roleList || []);
            } catch (error) {
                console.error("Load options error:", error);
                message.error("Failed to load form options");
            } finally {
                if (!cancelled) setOptionsLoading(false);
            }
        };
        loadOptions();
        return () => { cancelled = true; };
    }, []);

    // 🔹 Load Units whenever department changes (but not during initial load)
    useEffect(() => {
        let cancelled = false;
        const loadUnits = async () => {
            if (fetching) return; // Skip if we are still fetching user data

            form.setFieldValue("unit", undefined);
            setUnits([]);

            if (!departmentId) return;

            setUnitsLoading(true);
            try {
                const unitList = await genericService.getUnitsByDeparmentId(departmentId);
                if (cancelled) return;
                setUnits(unitList || []);
            } catch (error) {
                console.error("Load units error:", error);
                if (!cancelled) message.error("Failed to load units");
            } finally {
                if (!cancelled) setUnitsLoading(false);
            }
        };
        loadUnits();
        return () => { cancelled = true; };
    }, [departmentId, form, fetching]);

    // 🔹 Fetch the user by Id and map names back to GUIDs
    useEffect(() => {
        const fetchUser = async () => {
            if (!id) {
                message.error("No user Id provided");
                navigate("/User");
                return;
            }

            const storedUser = localStorage.getItem("user");
            if (!storedUser) {
                message.error("Session not found");
                navigate("/User");
                return;
            }

            const sysUser = JSON.parse(storedUser);
            setFetching(true);

            try {
                const result = await GetAllUsers_API({ sys_user_id: sysUser.id || sysUser.Id });

                if (result.success && result.data) {
                    const match = result.data.find(
                        (u) => String(u.Id).toLowerCase() === String(id).toLowerCase()
                    );

                    if (!match) {
                        message.error("User not found");
                        navigate("/User");
                        return;
                    }

                    setUserEmail(match.UserName || "");

                    // 👈 1. Map Department Name to Department ID
                    const deptMatch = departments.find(d => d.Label === match.DepartmentName);
                    const deptId = deptMatch ? deptMatch.Value : undefined;

                    // 👈 2. Load units for this department, then map Unit Name to Unit ID
                    let unitList = [];
                    if (deptId) {
                        unitList = await genericService.getUnitsByDeparmentId(deptId);
                        setUnits(unitList || []);
                    }
                    const unitMatch = unitList.find(u => u.Label === match.UnitName);
                    const unitId = unitMatch ? unitMatch.Value : undefined;

                    // 👈 3. Map Roles string (e.g. "Admin,User") back to an array of GUIDs
                    let roleGuids = [];
                    if (match.Roles) {
                        const savedRoles = match.Roles.split(",");
                        roleGuids = savedRoles.map(roleName => {
                            const roleObj = roles.find(r => r.Label === roleName.trim());
                            return roleObj ? roleObj.Value : roleName; 
                        });
                    }

                    // 4. Set the form values
                    form.setFieldsValue({
                        userName: match.UserName,
                        fullName: match.FullName,
                        department: deptId,
                        unit: unitId,
                        roles: roleGuids,
                        disabled: match.Status === "Blocked" || match.Status === "Inactive",
                    });
                } else {
                    message.error(result?.message || "Failed to load user");
                }
            } catch (error) {
                console.error("Fetch User Error:", error);
                message.error(error?.message || "Failed to load user");
            } finally {
                setFetching(false);
            }
        };

        // Wait for the dropdown options to load before fetching the user
        if (!optionsLoading) {
            fetchUser();
        }
    }, [id, form, navigate, optionsLoading, departments, roles]);

    // 🔹 Save
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
            const _UpdatedBy = storedUser.id || storedUser.Id;

            const payload = {
                emailaddress: userEmail,
                fullname: values.fullName,
                DepartmentId: values.department,
                Unit: values.unit ?? null,
                // Map the selected role GUIDs back to strings (e.g. "Admin,User")
                roles: Array.isArray(values.roles)
                    ? values.roles.map(selectedGuid => {
                        const roleObj = roles.find(r => r.Value === selectedGuid);
                        return roleObj ? roleObj.Label : selectedGuid; 
                    }).join(",")
                    : String(values.roles || ""),
                sys_user_id: _UpdatedBy, 
                IsBlocked: values.disabled ? 1 : 0,
                action: 'u'
            };

            console.log("Sending Payload to API:", payload);

            await updateUserById_API(payload);
            message.success("User updated successfully");
            navigate("/User");
        } catch (error) {
            console.error("Update error:", error);
            if (!error?.errorFields) {
                message.error(error?.message || "Failed to update user");
            }
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <Card>
                <div style={{ textAlign: "center", padding: 60 }}>
                    <Spin size="large" tip="Loading user data..." />
                </div>
            </Card>
        );
    }

    return (
        <Card
            title={
                <Space>
                    <EditOutlined />
                    <Text strong style={{ fontSize: 18 }}>Update User</Text>
                    {userEmail && (
                        <Text type="secondary" style={{ fontSize: 13 }}>({userEmail})</Text>
                    )}
                </Space>
            }
            extra={
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/User")}>
                    Back to List
                </Button>
            }
        >
            <Form
                form={form}
                layout="vertical"
                autoComplete="off"
                initialValues={{ disabled: false }}
            >
                <Row gutter={24}>
                    <Col xs={24} sm={12} lg={12}>
                        <Form.Item label="User Name" name="userName">
                            <Input prefix={<UserOutlined />} disabled />
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={12} lg={12}>
                        <Form.Item label="Full Name" name="fullName" rules={[{ required: true }]}>
                            <Input placeholder="Enter full name" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={12} lg={12}>
                        <Form.Item label="Department" name="department" rules={[{ required: true }]}>
                            <Select
                                placeholder="Select department"
                                loading={optionsLoading}
                                showSearch
                                optionFilterProp="label"
                                options={departments.map((d) => ({ value: d.Value, label: d.Label }))}
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={12} lg={12}>
                        <Form.Item label="Unit" name="unit">
                            <Select
                                placeholder={departmentId ? "Select unit" : "Select department first"}
                                disabled={!departmentId || unitsLoading}
                                loading={unitsLoading}
                                showSearch
                                optionFilterProp="label"
                                allowClear
                                options={units.map((u) => ({ value: u.Value, label: u.Label }))}
                                notFoundContent={unitsLoading ? "Loading..." : "No units found"}
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={12} lg={12}>
                        <Form.Item label="User Roles" name="roles" rules={[{ required: true }]}>
                            <Select
                                mode="multiple"
                                placeholder="Select roles"
                                loading={optionsLoading}
                                optionFilterProp="label"
                                options={roles.map((r) => ({ value: r.Value, label: r.Label }))}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Divider orientation="left" plain>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                        <LockOutlined style={{ marginRight: 6 }} /> Account Status
                    </Text>
                </Divider>

                <Row gutter={24}>
                    <Col xs={24} sm={12} lg={12}>
                        <Form.Item label="Disable User" name="disabled" valuePropName="checked">
                            <Switch checkedChildren="Disabled" unCheckedChildren="Active" />
                        </Form.Item>
                    </Col>
                </Row>

                <Divider />

                <Form.Item style={{ marginBottom: 0 }}>
                    <Space style={{ width: "100%", justifyContent: "flex-end" }}>
                        <Button onClick={() => navigate("/User")}>Cancel</Button>
                        <Button type="primary" icon={<SaveOutlined />} loading={loading} onClick={handleSubmit}>
                            Update User
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default UpdateUser;
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    Card, Form, Input, Select, Switch, Button, Space, Typography,
    Row, Col, Divider, message, Spin,
} from "antd";
import {
    UserOutlined, SaveOutlined, ArrowLeftOutlined, LockOutlined, EditOutlined,
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

    // 🔹 Watch form fields
    const departmentId = Form.useWatch("department", form);
    const isDisabled = Form.useWatch("disabled", form);

    // 👈 Keep track of the previous department to know if the user changed it manually
    const prevDeptIdRef = useRef(null);

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

    // 🔹 Fetch the user by Id
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
                const result = await GetAllUsers_API({
                    sys_user_id: sysUser.id || sysUser.Id,
                });

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

                    // 1. Map Department
                    const deptMatch = departments.find((d) => d.Label === match.DepartmentName);
                    const deptId = deptMatch ? deptMatch.Value : undefined;

                    // 2. Fetch Units for this department
                    let unitList = [];
                    if (deptId) {
                        unitList = await genericService.getUnitsByDeparmentId(deptId);
                        setUnits(unitList || []);
                    }

                    // 3. Map Unit
                    const unitMatch = unitList.find((u) => u.Label === match.UnitName);
                    const unitId = unitMatch ? unitMatch.Value : undefined;

                    // 4. Map Roles
                    let roleGuids = [];
                    if (match.Roles) {
                        const savedRoles = match.Roles.split(",");
                        roleGuids = savedRoles.map((roleName) => {
                            const roleObj = roles.find((r) => r.Label === roleName.trim());
                            return roleObj ? roleObj.Value : roleName;
                        });
                    }

                    // 5. Save the initial department to ref BEFORE setting form values
                    prevDeptIdRef.current = deptId;

                    // 6. Set form values
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

        if (!optionsLoading) {
            fetchUser();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, optionsLoading]); // 👈 Removed departments/roles from deps to prevent re-fetching

    // 🔹 Handle Units loading (Both Initial Load and Manual Change)
    useEffect(() => {
        let cancelled = false;
        
        const loadUnits = async () => {
            // If no department is selected, clear units
            if (!departmentId) {
                setUnits([]);
                return;
            }

            // 👈 Check if the department was changed manually by the user
            if (prevDeptIdRef.current !== departmentId) {
                form.setFieldValue("unit", undefined); // Clear unit ONLY on manual change
                prevDeptIdRef.current = departmentId;  // Update the ref
            }

            // If units are already loaded for this department (e.g., during initial fetch), skip
            if (units.length > 0 && units[0].DepartmentId === departmentId) {
                return; 
            }

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [departmentId, form]);

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
            <Card variant="borderless" style={{ boxShadow: "none" }}>
                <div style={{ textAlign: "center", padding: 60 }}>
                    <Spin size="large" tip="Loading user data..." />
                </div>
            </Card>
        );
    }

    return (
        <Card
            variant="borderless"
            style={{ boxShadow: "none" }}
            styles={{ body: { padding: 0 } }}
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
            <Form form={form} layout="vertical" autoComplete="off" initialValues={{ disabled: false }}>
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
                        <Form.Item
                            label="Disable User"
                            name="disabled"
                            valuePropName="checked"
                            extra={<Text type="secondary" style={{ fontSize: 12 }}>Prevents the user from logging in</Text>}
                        >
                            <Switch
                                checkedChildren="Disabled"
                                unCheckedChildren="Active"
                                style={{ backgroundColor: isDisabled ? "#ff4d4f" : "#52c41a" }}
                            />
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
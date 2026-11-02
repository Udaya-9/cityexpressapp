import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";   // 👈 useParams
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
    StopOutlined,
    EditOutlined,
} from "@ant-design/icons";
import { GetAllUsers_API } from "../API/User.API";

const { Text } = Typography;
const { Option } = Select;

const UpdateUser = () => {
    const navigate = useNavigate();
    const { id } = useParams();          // 👈 Id from /User/edit/:id
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [userEmail, setUserEmail] = useState(""); // for display in title

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
                    sys_user_id: sysUser.id,
                });

                if (result.success && result.data) {
                    const match = result.data.find(
                        (u) =>
                            String(u.Id).toLowerCase() ===
                            String(id).toLowerCase()
                    );

                    if (!match) {
                        message.error("User not found");
                        navigate("/User");
                        return;
                    }

                    setUserEmail(match.UserName || "");

                    form.setFieldsValue({
                        userName: match.UserName,
                        fullName: match.FullName,
                        department: match.DepartmentName,
                        unit: match.UnitName,
                        roles: match.Roles || [],
                        accessOnline: match.Status === "Active",
                        disabled: match.Status === "Inactive",
                        temporaryLock: match.IsLocked === true,
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

        fetchUser();
    }, [id, form, navigate]);

    // 🔹 Save
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            const payload = {
                Id: id,                                 // 👈 include Id
                UserName: values.userName,
                FullName: values.fullName,
                DepartmentName: values.department,
                UnitName: values.unit,
                Roles: values.roles,
                Status: values.disabled ? "Inactive" : "Active",
                IsLocked: values.temporaryLock,
                AccessOnline: values.accessOnline,
            };

            // TODO: replace with your UpdateUser_API(payload)
            console.log("Updated user:", payload);

            setTimeout(() => {
                message.success("User updated successfully");
                setLoading(false);
                navigate("/User");
            }, 800);
        } catch (error) {
            console.error("Validation failed:", error);
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
                    <Text strong style={{ fontSize: 18 }}>
                        Update User
                    </Text>
                    {userEmail && (
                        <Text type="secondary" style={{ fontSize: 13 }}>
                            ({userEmail})
                        </Text>
                    )}
                </Space>
            }
            extra={
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate("/User")}
                >
                    Back to List
                </Button>
            }
        >
            <Form
                form={form}
                layout="vertical"
                autoComplete="off"
                initialValues={{
                    accessOnline: true,
                    disabled: false,
                    temporaryLock: false,
                }}
            >
                <Row gutter={24}>
                    <Col xs={24} sm={12} lg={12}>
                        <Form.Item
                            label="User Name"
                            name="userName"
                            rules={[{ required: true, message: "Please enter username" }]}
                        >
                            <Input
                                placeholder="Enter username"
                                prefix={<UserOutlined />}
                                disabled
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={12} lg={12}>
                        <Form.Item
                            label="Full Name"
                            name="fullName"
                            rules={[{ required: true, message: "Please enter full name" }]}
                        >
                            <Input placeholder="Enter full name" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={12} lg={12}>
                        <Form.Item
                            label="Department"
                            name="department"
                            rules={[{ required: true, message: "Please select department" }]}
                        >
                            <Select placeholder="Select department">
                                <Option value="Engineering">Engineering</Option>
                                <Option value="Finance">Finance</Option>
                                <Option value="Human Resources">Human Resources</Option>
                                <Option value="Operations">Operations</Option>
                                <Option value="Sales">Sales</Option>
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={12} lg={12}>
                        <Form.Item
                            label="Unit"
                            name="unit"
                            rules={[{ required: true, message: "Please select unit" }]}
                        >
                            <Select placeholder="Select unit">
                                <Option value="Frontend">Frontend</Option>
                                <Option value="Backend">Backend</Option>
                                <Option value="QA">QA</Option>
                                <Option value="DevOps">DevOps</Option>
                                <Option value="Design">Design</Option>
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={12} lg={12}>
                        <Form.Item
                            label="User Roles"
                            name="roles"
                            rules={[{ required: true, message: "Please select at least one role" }]}
                        >
                            <Select mode="multiple" placeholder="Select roles">
                                <Option value="Admin">Administrator</Option>
                                <Option value="Manager">Manager</Option>
                                <Option value="Developer">Developer</Option>
                                <Option value="Reviewer">Reviewer</Option>
                                <Option value="Viewer">Viewer</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    
                </Row>

                <Divider orientation="left" plain>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                        <LockOutlined style={{ marginRight: 6 }} />
                        Account Status
                    </Text>
                </Divider>

                <Row gutter={24}>
                    <Col xs={24} sm={12} lg={12}>
                        <Form.Item
                            label="Disable User"
                            name="disabled"
                            valuePropName="checked"
                            extra={
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    Prevents the user from logging in
                                </Text>
                            }
                        >
                            <Switch
                                checkedChildren="Disabled"
                                unCheckedChildren="Active"
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={12} lg={12}>
                        <Form.Item
                            label="Temporary Lock"
                            name="temporaryLock"
                            valuePropName="checked"
                            extra={
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    Locks the account until manually unlocked
                                </Text>
                            }
                        >
                            <Switch
                                checkedChildren={<StopOutlined />}
                                unCheckedChildren="Unlocked"
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Divider />

                <Form.Item style={{ marginBottom: 0 }}>
                    <Space style={{ width: "100%", justifyContent: "flex-end" }}>
                        <Button onClick={() => navigate("/User")}>
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            icon={<SaveOutlined />}
                            loading={loading}
                            onClick={handleSubmit}
                        >
                            Update User
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default UpdateUser;
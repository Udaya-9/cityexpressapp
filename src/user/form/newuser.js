import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
} from "antd";
import { UserOutlined, SaveOutlined, ArrowLeftOutlined } from "@ant-design/icons";

const { Text } = Typography;
const { Option } = Select;

const CreateUser = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);
            // API call here
            setTimeout(() => {
                console.log("New user:", values);
                setLoading(false);
                navigate("/User");
            }, 1000);
        } catch (error) {
            console.error("Validation failed:", error);
            setLoading(false);
        }
    };

    return (
        <Card
            title={
                <Space>
                    <UserOutlined />
                    <Text strong style={{ fontSize: 18 }}>
                        Create New User
                    </Text>
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
                    authentication: "local",
                }}
            >
                <Row gutter={24}>
                    <Col span={12}>
                        <Form.Item
                            label="User Name"
                            name="userName"
                            rules={[
                                { required: true, message: "Please enter username" },
                                { min: 3, message: "Username must be at least 3 characters" },
                            ]}
                        >
                            <Input placeholder="Enter username" prefix={<UserOutlined />} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Full Name"
                            name="fullName"
                            rules={[{ required: true, message: "Please enter full name" }]}
                        >
                            <Input placeholder="Enter full name" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={24}>
                    <Col span={12}>
                        <Form.Item
                            label="Organization"
                            name="organization"
                            rules={[{ required: true, message: "Please select organization" }]}
                        >
                            <Select placeholder="Select organization">
                                <Option value="org1">Organization 1</Option>
                                <Option value="org2">Organization 2</Option>
                                <Option value="org3">Organization 3</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Department"
                            name="department"
                            rules={[{ required: true, message: "Please select department" }]}
                        >
                            <Select placeholder="Select department">
                                <Option value="it">IT</Option>
                                <Option value="hr">HR</Option>
                                <Option value="finance">Finance</Option>
                                <Option value="marketing">Marketing</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={24}>
                    <Col span={12}>
                        <Form.Item
                            label="Unit"
                            name="unit"
                            rules={[{ required: true, message: "Please select unit" }]}
                        >
                            <Select placeholder="Select unit">
                                <Option value="development">Development</Option>
                                <Option value="design">Design</Option>
                                <Option value="operations">Operations</Option>
                                <Option value="support">Support</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="User Roles"
                            name="roles"
                            rules={[{ required: true, message: "Please select at least one role" }]}
                        >
                            <Select mode="multiple" placeholder="Select roles">
                                <Option value="admin">Admin</Option>
                                <Option value="manager">Manager</Option>
                                <Option value="editor">Editor</Option>
                                <Option value="viewer">Viewer</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={24}>
                    <Col span={12}>
                        <Form.Item
                            label="Authentication"
                            name="authentication"
                            rules={[{ required: true, message: "Please select authentication method" }]}
                        >
                            <Select placeholder="Select authentication method">
                                <Option value="local">Local</Option>
                                <Option value="ldap">LDAP</Option>
                                <Option value="saml">SAML</Option>
                                <Option value="oauth">OAuth 2.0</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Access Online"
                            name="accessOnline"
                            valuePropName="checked"
                        >
                            <Switch
                                checkedChildren="Enabled"
                                unCheckedChildren="Disabled"
                                defaultChecked
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
                            Save User
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default CreateUser;
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Card,
    Form,
    Input,
    Button,
    Space,
    Typography,
    message,
} from "antd";
import {
    LockOutlined,
    SaveOutlined,
    ArrowLeftOutlined,
} from "@ant-design/icons";
 import { ResetPassword_API } from "../API/User.API";

const { Text } = Typography;

const ResetPassword = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

       const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            const payload = {
                previousPassword: values.previousPassword,
                newPassword: values.newPassword,
            };

            const response = await ResetPassword_API(payload);

            if (response.data.success) {
                message.success("Password updated successfully. Please log in with your new password.");
                form.resetFields();
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                localStorage.removeItem("organizationId");
                navigate("/"); 
            } else {
                message.error(response.data.message || "Failed to update password");
            }
        } catch (error) {
            console.error("Validation failed:", error);
            if (!error?.errorFields) {
                message.error(error?.response?.data?.message || "An error occurred");
            }
        } finally {
            setLoading(false);
        }
    };
    return (
        <Card
            variant="borderless"
            style={{ boxShadow: "none", maxWidth: 600, margin: "0 auto" }}
            styles={{ body: { paddingTop: 24 } }}
            title={
                <Space>
                    <LockOutlined />
                    <Text strong style={{ fontSize: 18 }}>
                        Reset Password
                    </Text>
                </Space>
            }
            extra={
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate(-1)} 
                >
                    Back
                </Button>
            }
        >
            <Form
                form={form}
                layout="vertical"
                autoComplete="off"
                requiredMark="optional"
            >               
                <Form.Item
                    label="Previous Password"
                    name="previousPassword"
                    rules={[
                        { required: true, message: "Please enter your current password" },
                    ]}
                >
                    <Input.Password
                        placeholder="Enter previous password"
                        prefix={<LockOutlined style={{ color: "#8c8c8c" }} />}
                    />
                </Form.Item>

                <Form.Item
                    label="New Password"
                    name="newPassword"
                    rules={[
                        { required: true, message: "Please enter a new password" },
                        { min: 8, message: "Password must be at least 8 characters" },
                    ]}
                    hasFeedback
                >
                    <Input.Password
                        placeholder="Enter new password"
                        prefix={<LockOutlined style={{ color: "#8c8c8c" }} />}
                    />
                </Form.Item>
           
                <Form.Item
                    label="Verify New Password"
                    name="confirmPassword"
                    dependencies={["newPassword"]}
                    hasFeedback
                    rules={[
                        { required: true, message: "Please confirm your new password" },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue("newPassword") === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(
                                    new Error("The two passwords do not match!")
                                );
                            },
                        }),
                    ]}
                >
                    <Input.Password
                        placeholder="Re-enter new password"
                        prefix={<LockOutlined style={{ color: "#8c8c8c" }} />}
                    />
                </Form.Item>

                <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
                    <Space style={{ width: "100%", justifyContent: "flex-end" }}>
                        <Button onClick={() => form.resetFields()}>
                            Clear
                        </Button>
                        <Button
                            type="primary"
                            icon={<SaveOutlined />}
                            loading={loading}
                            onClick={handleSubmit}
                        >
                            Update Password
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default ResetPassword;
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
    message,
} from "antd";
import { 
    ShopOutlined, 
    SaveOutlined, 
    ArrowLeftOutlined,
    UserOutlined,
    PhoneOutlined,
    MailOutlined,
    HomeOutlined,
    IdcardOutlined,
} from "@ant-design/icons";

const { Text } = Typography;
const { Option } = Select;

const CreateVendor = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);
            setTimeout(() => {
                console.log("New vendor data:", values);
                message.success("Vendor created successfully!");
                setLoading(false);
                form.resetFields();
                navigate("/vendor");
            }, 1500);
        } catch (error) {
            console.error("Validation failed:", error);
            message.error("Please fill all required fields");
            setLoading(false);
        }
    };

    return (
        <Card
            title={
                <Space>
                    <ShopOutlined />
                    <Text strong style={{ fontSize: 18 }}>
                        Create New Vendor
                    </Text>
                </Space>
            }
            extra={
                <Button 
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate("/vendor")}
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
                    isActive: true,
                    panVatType: "PAN",
                }}
            >
                <Row gutter={24}>
                    <Col span={12}>
                        <Form.Item
                            label="Vendor Name"
                            name="vendorName"
                            rules={[
                                { required: true, message: "Please enter vendor name" },
                                { min: 2, message: "Vendor name must be at least 2 characters" }
                            ]}
                        >
                            <Input placeholder="Enter vendor name" prefix={<ShopOutlined />} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Contact Person"
                            name="contactPerson"
                            rules={[
                                { required: true, message: "Please enter contact person" },
                                { min: 2, message: "Contact person must be at least 2 characters" }
                            ]}
                        >
                            <Input placeholder="Enter contact person" prefix={<UserOutlined />} />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={24}>
                    <Col span={12}>
                        <Form.Item
                            label="Address"
                            name="address"
                            rules={[{ required: true, message: "Please enter address" }]}
                        >
                            <Input placeholder="Enter address" prefix={<HomeOutlined />} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Mobile No"
                            name="mobileNo"
                            rules={[
                                { required: true, message: "Please enter mobile number" },
                                { pattern: /^[0-9]{10}$/, message: "Please enter valid 10-digit mobile number" }
                            ]}
                        >
                            <Input placeholder="Enter mobile number" prefix={<PhoneOutlined />} maxLength={10} />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={24}>
                    <Col span={12}>
                        <Form.Item
                            label="Phone No"
                            name="phoneNo"
                        >
                            <Input placeholder="Enter phone number" prefix={<PhoneOutlined />} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Email Address"
                            name="email"
                            rules={[
                                { required: true, message: "Please enter email address" },
                                { type: "email", message: "Please enter valid email" }
                            ]}
                        >
                            <Input placeholder="Enter email address" prefix={<MailOutlined />} />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={24}>
                    <Col span={12}>
                        <Form.Item
                            label="PAN/VAT Type"
                            name="panVatType"
                            rules={[{ required: true, message: "Please select PAN/VAT type" }]}
                        >
                            <Select placeholder="Select PAN/VAT type">
                                <Option value="PAN">PAN</Option>
                                <Option value="VAT">VAT</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="PAN/VAT Number"
                            name="panVat"
                            rules={[
                                { required: true, message: "Please enter PAN/VAT number" },
                                { min: 5, message: "PAN/VAT number must be at least 5 characters" }
                            ]}
                        >
                            <Input placeholder="Enter PAN/VAT number" prefix={<IdcardOutlined />} />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={24}>
                    <Col span={12}>
                        <Form.Item
                            label="Registration No"
                            name="registrationNo"
                            rules={[
                                { required: true, message: "Please enter registration number" },
                                { min: 3, message: "Registration number must be at least 3 characters" }
                            ]}
                        >
                            <Input placeholder="Enter registration number" prefix={<IdcardOutlined />} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Is Active"
                            name="isActive"
                            valuePropName="checked"
                        >
                            <Switch
                                checkedChildren="Active"
                                unCheckedChildren="Inactive"
                                defaultChecked
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Divider />

                <Form.Item style={{ marginBottom: 0 }}>
                    <Space style={{ width: "100%", justifyContent: "flex-end" }}>
                        <Button onClick={() => navigate("/vendor")}>
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            icon={<SaveOutlined />}
                            loading={loading}
                            onClick={handleSubmit}
                        >
                            Create Vendor
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default CreateVendor;
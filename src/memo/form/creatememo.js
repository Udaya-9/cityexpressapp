import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Card,
    Form,
    Input,
    Select,
    Button,
    Space,
    Typography,
    Row,
    Col,
    Divider,
    Upload,
    InputNumber,
    message,
} from "antd";
import {
    FileTextOutlined,
    SendOutlined,
    SaveOutlined,
    ArrowLeftOutlined,
    InboxOutlined,
} from "@ant-design/icons";
import { createMemoApi } from "../API/memoservice";
import { getStaticDataApi } from "../../API/api";

const { Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { Dragger } = Upload;

const CreateMemo = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [fileList, setFileList] = useState([]);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        (async () => {
            const list = await getStaticDataApi("Memo");
            if (list?.length) setCategories(list);
        })();
    }, []);

    let currentUser = {};
    try {
        currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
        currentUser = {};
    }

    const defaultRefNo = `MEMO-${Math.floor(1000 + Math.random() * 9000)}`;

    const handleSave = async (isDraft = false) => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            const newMemo = {
                referenceNo: values.referenceNo || defaultRefNo,
                subject: values.subject,
                category: values.category,
                priority: values.priority || "Normal",
                department: values.department,
                originator: currentUser.fullname || "Kriman Basnet",
                originatorInitials: (currentUser.fullname || "KB").slice(0, 2).toUpperCase(),
                approver: values.approver,
                amount: values.amount || null,
                content: values.content,
                createdDate: new Date().toISOString().split("T")[0],
                status: "Pending",
                stepIndex: 1,
                createdBy: currentUser.email || "kriman@gmail.com",
            };

            await createMemoApi(newMemo);

            message.success(isDraft ? "Memo saved as draft!" : "Memo submitted for approval!");
            setLoading(false);
            navigate("/memo");
        } catch (error) {
            setLoading(false);
            message.error("Failed to save memo to server.");
        }
    };

    const uploadProps = {
        name: "file",
        multiple: true,
        fileList,
        beforeUpload: (file) => {
            setFileList((prev) => [...prev, file]);
            message.success(`${file.name} attached.`);
            return false;
        },
        onRemove: (file) => {
            setFileList((prev) => prev.filter((item) => item.uid !== file.uid));
        },
    };

    return (
        <Card
            title={
                <Space>
                    <FileTextOutlined style={{ color: "#01519b", fontSize: 20 }} />
                    <Text strong style={{ fontSize: 18, color: "#0a1a5c" }}>
                        Create New Memo
                    </Text>
                </Space>
            }
            extra={
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/memo/inbox")}>
                    Back to Inbox
                </Button>
            }
            style={{ borderRadius: 8, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    referenceNo: defaultRefNo,
                    priority: "Normal",
                    sender: currentUser.fullname || "Logged In User",
                }}
            >
                {/* Section 1: Overview */}
                <Divider orientation="left" style={{ margin: "8px 0 16px", borderColor: "#e8e8e8" }}>
                    <Text strong style={{ color: "#01519b" }}>1. Memo Information</Text>
                </Divider>

                <Row gutter={16}>
                    <Col xs={24} md={16}>
                        <Form.Item
                            name="subject"
                            label={<Text strong>Memo Subject / Title</Text>}
                            rules={[{ required: true, message: "Please enter memo subject" }]}
                        >
                            <Input placeholder="e.g. Request for Branch IT Equipment Upgrade" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                        <Form.Item
                            name="referenceNo"
                            label={<Text strong>Reference No.</Text>}
                            rules={[{ required: true, message: "Reference number is required" }]}
                        >
                            <Input readOnly style={{ background: "#f5f5f5" }} />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col xs={24} sm={12} md={6}>
                        <Form.Item
                            name="category"
                            label={<Text strong>Category</Text>}
                            rules={[{ required: true, message: "Please select category" }]}
                        >
                            <Select placeholder="Select category">
                                {(categories.length ? categories.map((c) => c.Label) : [
                                    "Purchase Memo",
                                    "Payment Memo",
                                    "Requisition & Procurement",
                                    "Expense Approval",
                                    "IT & Infrastructure",
                                    "Administrative Request",
                                    "HR & Personnel",
                                    "General Notice",
                                ]).map((cat) => (
                                    <Option key={cat} value={cat}>
                                        {cat}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={12} md={6}>
                        <Form.Item
                            name="priority"
                            label={<Text strong>Priority</Text>}
                            rules={[{ required: true }]}
                        >
                            <Select>
                                <Option value="Normal">Normal</Option>
                                <Option value="Urgent">Urgent</Option>
                                <Option value="High">High</Option>
                                <Option value="Critical">Critical</Option>
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={12} md={6}>
                        <Form.Item
                            name="department"
                            label={<Text strong>Target Department</Text>}
                            rules={[{ required: true, message: "Please select department" }]}
                        >
                            <Select placeholder="Select department">
                                <Option value="Finance & Accounts">Finance & Accounts</Option>
                                <Option value="Information Technology">Information Technology</Option>
                                <Option value="Administration">Administration</Option>
                                <Option value="Operations">Operations</Option>
                                <Option value="Human Resources">Human Resources</Option>
                                <Option value="Internal Audit">Internal Audit</Option>
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={12} md={6}>
                        <Form.Item
                            name="approver"
                            label={<Text strong>Approver / Authority</Text>}
                            rules={[{ required: true, message: "Please select approver" }]}
                        >
                            <Select placeholder="Select approver">
                                <Option value="Department Head">Department Head</Option>
                                <Option value="Finance Controller">Finance Controller</Option>
                                <Option value="Managing Director">Managing Director</Option>
                                <Option value="Chief Operating Officer">Chief Operating Officer</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col xs={24} sm={12} md={12}>
                        <Form.Item
                            name="amount"
                            label={<Text strong>Estimated Budget / Amount (Optional)</Text>}
                        >
                            <InputNumber
                                style={{ width: "100%" }}
                                prefix="NPR"
                                placeholder="0.00"
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={12}>
                        <Form.Item
                            name="sender"
                            label={<Text strong>Originating User / Department</Text>}
                        >
                            <Input readOnly style={{ background: "#f5f5f5" }} />
                        </Form.Item>
                    </Col>
                </Row>

                {/* Section 2: Details */}
                <Divider orientation="left" style={{ margin: "8px 0 16px", borderColor: "#e8e8e8" }}>
                    <Text strong style={{ color: "#01519b" }}>2. Memo Content & Justification</Text>
                </Divider>

                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item
                            name="content"
                            label={<Text strong>Description & Justification</Text>}
                            rules={[{ required: true, message: "Please provide description" }]}
                        >
                            <TextArea
                                rows={6}
                                placeholder="Detail the purpose of this memo, background context, operational necessity, and expected outcome..."
                            />
                        </Form.Item>
                    </Col>
                </Row>

                {/* Section 3: Attachments */}
                <Divider orientation="left" style={{ margin: "8px 0 16px", borderColor: "#e8e8e8" }}>
                    <Text strong style={{ color: "#01519b" }}>3. Supporting Documents</Text>
                </Divider>

                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item label={<Text strong>Attachments (PDF, Invoices, Quotations)</Text>}>
                            <Dragger {...uploadProps} style={{ padding: 16 }}>
                                <p className="ant-upload-drag-icon">
                                    <InboxOutlined style={{ fontSize: 32, color: "#1a6fc9" }} />
                                </p>
                                <p className="ant-upload-text">Click or drag file to this area to attach</p>
                                <p className="ant-upload-hint">
                                    Supports PDF, Word, Excel, and image receipts up to 10MB.
                                </p>
                            </Dragger>
                        </Form.Item>
                    </Col>
                </Row>

                {/* Action Buttons */}
                <Divider style={{ margin: "16px 0 24px" }} />

                <Row justify="end">
                    <Space size="middle">
                        <Button onClick={() => navigate("/memo/inbox")}>
                            Cancel
                        </Button>
                        <Button
                            icon={<SaveOutlined />}
                            onClick={() => handleSave(true)}
                            loading={loading}
                        >
                            Save as Draft
                        </Button>
                        <Button
                            type="primary"
                            icon={<SendOutlined />}
                            onClick={() => handleSave(false)}
                            loading={loading}
                        >
                            Submit Memo
                        </Button>
                    </Space>
                </Row>
            </Form>
        </Card>
    );
};

export default CreateMemo;

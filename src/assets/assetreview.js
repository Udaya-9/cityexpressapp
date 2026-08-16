import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    Card,
    Form,
    Input,
    Select,
    InputNumber,
    Button,
    Space,
    Typography,
    Row,
    Col,
    Divider,
    message,
    Tabs,
    Table,
    Tag,
    DatePicker,
    Upload,
    Modal,
    Popconfirm,
} from "antd";
import {
    SaveOutlined,
    ArrowLeftOutlined,
    PlusOutlined,
    DeleteOutlined,
    EditOutlined,
    EyeOutlined,
    UploadOutlined,
    ReloadOutlined,
    EnvironmentOutlined,
    UserOutlined,
    TeamOutlined,
    CalendarOutlined,
    DollarOutlined,
    FileTextOutlined,
    CloudUploadOutlined,
    HistoryOutlined,
    SafetyOutlined,
    TagOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Text, Title } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

const AssetReview = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("inventory");
    const [attributes, setAttributes] = useState([]);
    const [assurances, setAssurances] = useState([]);
    const [locations, setLocations] = useState([]);
    const [disposals, setDisposals] = useState([]);
    const [additionalAssets, setAdditionalAssets] = useState([]);
    const [depreciations, setDepreciations] = useState([]);
    const [uploads, setUploads] = useState([]);
    const [assetData, setAssetData] = useState(null);

    // Sample data for selects
    const departmentList = [
        { value: "IT", label: "IT" },
        { value: "Administration", label: "Administration" },
        { value: "Transport", label: "Transport" },
        { value: "Security", label: "Security" },
        { value: "Facilities", label: "Facilities" },
        { value: "Finance", label: "Finance" },
        { value: "HR", label: "Human Resources" },
    ];

    const userList = [
        { value: "admin", label: "Admin" },
        { value: "john", label: "John Doe" },
        { value: "jane", label: "Jane Smith" },
        { value: "mike", label: "Mike Johnson" },
    ];

    const locationList = [
        { value: "kathmandu", label: "Kathmandu" },
        { value: "pokhara", label: "Pokhara" },
        { value: "biratnagar", label: "Biratnagar" },
        { value: "butwal", label: "Butwal" },
    ];

    const disposalMethods = [
        { value: "scrapped", label: "Scrapped" },
        { value: "sold", label: "Sold" },
        { value: "donated", label: "Donated" },
    ];

    const statusList = [
        { value: "in_use", label: "In Use" },
        { value: "available", label: "Available" },
        { value: "disposed", label: "Disposed" },
        { value: "under_review", label: "Under Review" },
    ];

    const calcModes = [
        { value: "straight_line", label: "Straight Line" },
        { value: "diminishing", label: "Diminishing" },
        { value: "custom", label: "Custom" },
    ];

    useEffect(() => {
        // Simulate API call to fetch asset data
        setTimeout(() => {
            const mockData = {
                assetCode: "FA-001",
                invoiceNo: "INV-2026-001",
                purchaseDate: "2026-01-01",
                product: "Office Building",
                supplier: "Construction Co",
                purchaseCode: "PO-2026-001",
                deemedCost: 5000000,
                brand: "N/A",
                modelNo: "Commercial",
                status: "in_use",
                depreciationRate: 5,
                totalDepreciation: 250000,
                remarks: "Main office building",
            };
            setAssetData(mockData);
            form.setFieldsValue({
                ...mockData,
                purchaseDate: dayjs(mockData.purchaseDate),
            });

            // Sample attributes
            setAttributes([
                { key: 1, attribute: "Processor", value: "Intel i7" },
                { key: 2, attribute: "RAM", value: "16GB" },
                { key: 3, attribute: "Storage", value: "512GB SSD" },
            ]);

            // Sample assurances
            setAssurances([
                { key: 1, assuranceOn: "Warranty", assurance: "Guarantee", period: 24 },
            ]);

            // Sample locations
            setLocations([
                { key: 1, location: "Kathmandu", department: "IT", user: "Admin", transferDate: "2026-01-01", description: "Initial placement" },
            ]);

            // Sample disposals
            setDisposals([
                { key: 1, method: "sold", date: "2026-08-01", value: 4500000, remarks: "Sold to buyer" },
            ]);

            // Sample additional assets
            setAdditionalAssets([
                { key: 1, invoiceDate: "2026-02-01", invoiceNo: "INV-2026-002", amount: 500000, remarks: "Additional furniture" },
            ]);

            // Sample depreciations
            setDepreciations([
                { key: 1, fYear: "2082/83", date: "2026-01-01", cost: 5000000, opening: 0, opeDepr: 0, rate: 5, deprAmt: 250000, calcMode: "Straight Line", addiAsset: 0, addiDepr: 0, addDays: 0, accuDepr: 250000, forTheYearDepr: 250000, closing: 4750000 },
                { key: 2, fYear: "2082/83", date: "2026-02-01", cost: 5000000, opening: 4750000, opeDepr: 0, rate: 5, deprAmt: 250000, calcMode: "Straight Line", addiAsset: 0, addiDepr: 0, addDays: 0, accuDepr: 500000, forTheYearDepr: 250000, closing: 4500000 },
            ]);

            // Sample uploads
            setUploads([
                { key: 1, fileName: "Invoice.pdf", fileSize: "2.5 MB", uploadDate: "2026-01-01" },
                { key: 2, fileName: "Warranty_Card.pdf", fileSize: "1.2 MB", uploadDate: "2026-01-02" },
            ]);
        }, 500);
    }, [id, form]);

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);
            setTimeout(() => {
                console.log("Asset data saved:", values);
                message.success("Asset updated successfully!");
                setLoading(false);
                navigate("/asset");
            }, 1500);
        } catch (error) {
            console.error("Validation failed:", error);
            message.error("Please fill all required fields");
            setLoading(false);
        }
    };

    // Attribute Functions
    const addAttribute = () => {
        const attribute = form.getFieldValue("newAttribute");
        const value = form.getFieldValue("newAttributeValue");
        if (attribute && value) {
            setAttributes([...attributes, { key: Date.now(), attribute, value }]);
            form.setFieldsValue({ newAttribute: undefined, newAttributeValue: undefined });
            message.success("Attribute added!");
        } else {
            message.warning("Please fill both attribute name and value");
        }
    };

    const deleteAttribute = (key) => {
        setAttributes(attributes.filter(item => item.key !== key));
        message.success("Attribute deleted!");
    };

    // Assurance Functions
    const addAssurance = () => {
        const assuranceOn = form.getFieldValue("assuranceOn");
        const assurance = form.getFieldValue("assurance");
        const period = form.getFieldValue("period");
        if (assuranceOn && assurance && period) {
            setAssurances([...assurances, { key: Date.now(), assuranceOn, assurance, period }]);
            form.setFieldsValue({ assuranceOn: undefined, assurance: undefined, period: undefined });
            message.success("Assurance added!");
        } else {
            message.warning("Please fill all assurance fields");
        }
    };

    const deleteAssurance = (key) => {
        setAssurances(assurances.filter(item => item.key !== key));
        message.success("Assurance deleted!");
    };

    // Location Functions
    const addLocation = () => {
        const location = form.getFieldValue("location");
        const department = form.getFieldValue("locationDepartment");
        const user = form.getFieldValue("locationUser");
        const transferDate = form.getFieldValue("transferDate");
        const description = form.getFieldValue("locationDescription");
        if (location && department && user && transferDate) {
            setLocations([...locations, { 
                key: Date.now(), 
                location, 
                department, 
                user, 
                transferDate: transferDate.format("YYYY-MM-DD"), 
                description 
            }]);
            form.setFieldsValue({ 
                location: undefined, 
                locationDepartment: undefined, 
                locationUser: undefined, 
                transferDate: undefined, 
                locationDescription: undefined 
            });
            message.success("Location added!");
        } else {
            message.warning("Please fill all location fields");
        }
    };

    const deleteLocation = (key) => {
        setLocations(locations.filter(item => item.key !== key));
        message.success("Location deleted!");
    };

    // Disposal Functions
    const addDisposal = () => {
        const method = form.getFieldValue("disposalMethod");
        const date = form.getFieldValue("disposalDate");
        const value = form.getFieldValue("disposalValue");
        const remarks = form.getFieldValue("disposalRemarks");
        if (method && date && value) {
            setDisposals([...disposals, { 
                key: Date.now(), 
                method, 
                date: date.format("YYYY-MM-DD"), 
                value, 
                remarks 
            }]);
            form.setFieldsValue({ 
                disposalMethod: undefined, 
                disposalDate: undefined, 
                disposalValue: undefined, 
                disposalRemarks: undefined 
            });
            message.success("Disposal added!");
        } else {
            message.warning("Please fill all disposal fields");
        }
    };

    const deleteDisposal = (key) => {
        setDisposals(disposals.filter(item => item.key !== key));
        message.success("Disposal deleted!");
    };

    // Additional Asset Functions
    const addAdditionalAsset = () => {
        const invoiceDate = form.getFieldValue("addInvoiceDate");
        const invoiceNo = form.getFieldValue("addInvoiceNo");
        const amount = form.getFieldValue("addAmount");
        const remarks = form.getFieldValue("addRemarks");
        if (invoiceDate && invoiceNo && amount) {
            setAdditionalAssets([...additionalAssets, { 
                key: Date.now(), 
                invoiceDate: invoiceDate.format("YYYY-MM-DD"), 
                invoiceNo, 
                amount, 
                remarks 
            }]);
            form.setFieldsValue({ 
                addInvoiceDate: undefined, 
                addInvoiceNo: undefined, 
                addAmount: undefined, 
                addRemarks: undefined 
            });
            message.success("Additional asset added!");
        } else {
            message.warning("Please fill all additional asset fields");
        }
    };

    const deleteAdditionalAsset = (key) => {
        setAdditionalAssets(additionalAssets.filter(item => item.key !== key));
        message.success("Additional asset deleted!");
    };

    // Upload Props
    const uploadProps = {
        name: "file",
        action: "https://www.mocky.io/v2/5cc8019d300000980a055e76",
        headers: {
            authorization: "authorization-text",
        },
        onChange(info) {
            if (info.file.status !== "uploading") {
                console.log(info.file, info.fileList);
            }
            if (info.file.status === "done") {
                message.success(`${info.file.name} file uploaded successfully`);
                setUploads([...uploads, { 
                    key: Date.now(), 
                    fileName: info.file.name, 
                    fileSize: (info.file.size / (1024 * 1024)).toFixed(1) + " MB",
                    uploadDate: dayjs().format("YYYY-MM-DD") 
                }]);
            } else if (info.file.status === "error") {
                message.error(`${info.file.name} file upload failed.`);
            }
        },
    };

    // Attribute Columns
    const attributeColumns = [
        { title: "S.No", key: "sno", width: 80, render: (_, __, index) => index + 1 },
        { title: "Attribute", dataIndex: "attribute", key: "attribute" },
        { title: "Attribute Value", dataIndex: "value", key: "value" },
        {
            title: "Action",
            key: "action",
            width: 80,
            render: (_, record) => (
                <Popconfirm
                    title="Delete Attribute"
                    description="Are you sure you want to delete this attribute?"
                    onConfirm={() => deleteAttribute(record.key)}
                    okText="Yes"
                    cancelText="No"
                >
                    <Button type="text" danger icon={<DeleteOutlined />} size="small" />
                </Popconfirm>
            ),
        },
    ];

    // Assurance Columns
    const assuranceColumns = [
        { title: "S.No", key: "sno", width: 80, render: (_, __, index) => index + 1 },
        { title: "Assurance On", dataIndex: "assuranceOn", key: "assuranceOn" },
        { title: "Assurance", dataIndex: "assurance", key: "assurance" },
        { title: "Period (Months)", dataIndex: "period", key: "period" },
        {
            title: "Action",
            key: "action",
            width: 80,
            render: (_, record) => (
                <Popconfirm
                    title="Delete Assurance"
                    description="Are you sure you want to delete this assurance?"
                    onConfirm={() => deleteAssurance(record.key)}
                    okText="Yes"
                    cancelText="No"
                >
                    <Button type="text" danger icon={<DeleteOutlined />} size="small" />
                </Popconfirm>
            ),
        },
    ];

    // Location Columns
    const locationColumns = [
        { title: "S.No", key: "sno", width: 80, render: (_, __, index) => index + 1 },
        { title: "Location", dataIndex: "location", key: "location" },
        { title: "Department", dataIndex: "department", key: "department" },
        { title: "User", dataIndex: "user", key: "user" },
        { title: "Transfer Date", dataIndex: "transferDate", key: "transferDate" },
        { title: "Description", dataIndex: "description", key: "description" },
        {
            title: "Action",
            key: "action",
            width: 80,
            render: (_, record) => (
                <Popconfirm
                    title="Delete Location"
                    description="Are you sure you want to delete this location?"
                    onConfirm={() => deleteLocation(record.key)}
                    okText="Yes"
                    cancelText="No"
                >
                    <Button type="text" danger icon={<DeleteOutlined />} size="small" />
                </Popconfirm>
            ),
        },
    ];

    // Disposal Columns
    const disposalColumns = [
        { title: "S.No", key: "sno", width: 80, render: (_, __, index) => index + 1 },
        { 
            title: "Method", 
            dataIndex: "method", 
            key: "method",
            render: (value) => (
                <Tag color={value === "sold" ? "blue" : value === "donated" ? "green" : "red"}>
                    {value.charAt(0).toUpperCase() + value.slice(1)}
                </Tag>
            )
        },
        { title: "Date", dataIndex: "date", key: "date" },
        { title: "Value (Rs.)", dataIndex: "value", key: "value", render: (value) => value.toLocaleString() },
        { title: "Remarks", dataIndex: "remarks", key: "remarks" },
        {
            title: "Action",
            key: "action",
            width: 80,
            render: (_, record) => (
                <Popconfirm
                    title="Delete Disposal"
                    description="Are you sure you want to delete this disposal?"
                    onConfirm={() => deleteDisposal(record.key)}
                    okText="Yes"
                    cancelText="No"
                >
                    <Button type="text" danger icon={<DeleteOutlined />} size="small" />
                </Popconfirm>
            ),
        },
    ];

    // Additional Asset Columns
    const additionalAssetColumns = [
        { title: "S.No", key: "sno", width: 80, render: (_, __, index) => index + 1 },
        { title: "Invoice Date", dataIndex: "invoiceDate", key: "invoiceDate" },
        { title: "Invoice No", dataIndex: "invoiceNo", key: "invoiceNo" },
        { title: "Amount (Rs.)", dataIndex: "amount", key: "amount", render: (value) => value.toLocaleString() },
        { title: "Remarks", dataIndex: "remarks", key: "remarks" },
        {
            title: "Action",
            key: "action",
            width: 80,
            render: (_, record) => (
                <Popconfirm
                    title="Delete Additional Asset"
                    description="Are you sure you want to delete this additional asset?"
                    onConfirm={() => deleteAdditionalAsset(record.key)}
                    okText="Yes"
                    cancelText="No"
                >
                    <Button type="text" danger icon={<DeleteOutlined />} size="small" />
                </Popconfirm>
            ),
        },
    ];

    // Depreciation Columns
    const depreciationColumns = [
        { title: "F/Year", dataIndex: "fYear", key: "fYear", width: 100 },
        { title: "Date", dataIndex: "date", key: "date", width: 120 },
        { title: "Cost", dataIndex: "cost", key: "cost", width: 120, render: (value) => value.toLocaleString() },
        { title: "Opening", dataIndex: "opening", key: "opening", width: 120, render: (value) => value.toLocaleString() },
        { title: "Ope.Depr.", dataIndex: "opeDepr", key: "opeDepr", width: 100, render: (value) => value.toLocaleString() },
        { title: "Rate (%)", dataIndex: "rate", key: "rate", width: 90 },
        { title: "Depr.Amt", dataIndex: "deprAmt", key: "deprAmt", width: 120, render: (value) => value.toLocaleString() },
        { title: "Calc Mode", dataIndex: "calcMode", key: "calcMode" },
        { title: "Addi.Asset", dataIndex: "addiAsset", key: "addiAsset", width: 100, render: (value) => value.toLocaleString() },
        { title: "Addi.Depr.", dataIndex: "addiDepr", key: "addiDepr", width: 100, render: (value) => value.toLocaleString() },
        { title: "Add.Days", dataIndex: "addDays", key: "addDays" },
        { title: "Accu.Depr.", dataIndex: "accuDepr", key: "accuDepr", width: 120, render: (value) => value.toLocaleString() },
        { title: "ForTheYear", dataIndex: "forTheYearDepr", key: "forTheYearDepr", width: 120, render: (value) => value.toLocaleString() },
        { title: "Closing", dataIndex: "closing", key: "closing", width: 120, render: (value) => value.toLocaleString() },
    ];

    // Upload Columns
    const uploadColumns = [
        { title: "S.No", key: "sno", width: 80, render: (_, __, index) => index + 1 },
        { title: "File Name", dataIndex: "fileName", key: "fileName" },
        { title: "File Size", dataIndex: "fileSize", key: "fileSize" },
        { title: "Upload Date", dataIndex: "uploadDate", key: "uploadDate" },
        {
            title: "Action",
            key: "action",
            width: 100,
            render: (_, record) => (
                <Space size={4}>
                    <Button type="text" icon={<EyeOutlined />} size="small" title="View" />
                    <Popconfirm
                        title="Delete File"
                        description="Are you sure you want to delete this file?"
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button type="text" danger icon={<DeleteOutlined />} size="small" />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <Card
                title={
                    <Space size="middle">
                        <FileTextOutlined style={{ fontSize: 24, color: "#1890ff" }} />
                        <Text strong style={{ fontSize: 20 }}>
                            Asset Review
                        </Text>
                        <Tag color="blue">{assetData?.assetCode || "Loading..."}</Tag>
                    </Space>
                }
                extra={
                    <Space size="middle">
                        <Button
                            icon={<ArrowLeftOutlined />}
                            onClick={() => navigate("/asset")}
                        >
                            Back to List
                        </Button>
                        <Button
                            type="primary"
                            icon={<SaveOutlined />}
                            loading={loading}
                            onClick={handleSave}
                            size="large"
                        >
                            Save Asset
                        </Button>
                    </Space>
                }
                style={{
                    borderRadius: 12,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
                bodyStyle={{
                    padding: "24px 32px",
                }}
            >
                <Tabs 
                    activeKey={activeTab} 
                    onChange={setActiveTab}
                    size="large"
                    tabBarStyle={{
                        marginBottom: 24,
                        borderBottom: "2px solid #f0f0f0",
                    }}
                >
                    {/* Tab 1: Inventory Information */}
                    <TabPane
                        tab={
                            <span style={{ fontSize: 14 }}>
                                <FileTextOutlined style={{ marginRight: 8 }} />
                                Inventory Information
                            </span>
                        }
                        key="inventory"
                    >
                        <Form
                            form={form}
                            layout="vertical"
                            autoComplete="off"
                        >
                            <Row gutter={[24, 16]}>
                                <Col span={8}>
                                    <Form.Item
                                        label="Asset Code"
                                        name="assetCode"
                                        rules={[{ required: true, message: "Please enter asset code" }]}
                                    >
                                        <Input placeholder="Enter asset code" size="large" />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        label="Invoice No"
                                        name="invoiceNo"
                                        rules={[{ required: true, message: "Please enter invoice number" }]}
                                    >
                                        <Input placeholder="Enter invoice number" size="large" />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        label="Date of Purchase"
                                        name="purchaseDate"
                                        rules={[{ required: true, message: "Please select purchase date" }]}
                                    >
                                        <DatePicker style={{ width: "100%" }} size="large" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={[24, 16]}>
                                <Col span={8}>
                                    <Form.Item
                                        label="Product"
                                        name="product"
                                        rules={[{ required: true, message: "Please enter product" }]}
                                    >
                                        <Input placeholder="Enter product name" size="large" />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        label="Supplier"
                                        name="supplier"
                                        rules={[{ required: true, message: "Please enter supplier" }]}
                                    >
                                        <Input placeholder="Enter supplier name" size="large" />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        label="Purchase Code"
                                        name="purchaseCode"
                                        rules={[{ required: true, message: "Please enter purchase code" }]}
                                    >
                                        <Input placeholder="Enter purchase code" size="large" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={[24, 16]}>
                                <Col span={8}>
                                    <Form.Item
                                        label="Deemed Cost"
                                        name="deemedCost"
                                        rules={[{ required: true, message: "Please enter deemed cost" }]}
                                    >
                                        <InputNumber
                                            style={{ width: "100%" }}
                                            placeholder="Enter deemed cost"
                                            prefix={<DollarOutlined />}
                                            size="large"
                                            formatter={value => `Rs. ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                            parser={value => value.replace(/Rs\.\s?|(,*)/g, '')}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        label="Brand"
                                        name="brand"
                                    >
                                        <Input placeholder="Enter brand" size="large" />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        label="Model No."
                                        name="modelNo"
                                    >
                                        <Input placeholder="Enter model number" size="large" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={[24, 16]}>
                                <Col span={8}>
                                    <Form.Item
                                        label="Status"
                                        name="status"
                                        rules={[{ required: true, message: "Please select status" }]}
                                    >
                                        <Select placeholder="Select status" size="large">
                                            {statusList.map(status => (
                                                <Option key={status.value} value={status.value}>
                                                    {status.label}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        label="Depreciation Rate (%)"
                                        name="depreciationRate"
                                        rules={[{ required: true, message: "Please enter depreciation rate" }]}
                                    >
                                        <InputNumber
                                            style={{ width: "100%" }}
                                            placeholder="Enter rate"
                                            min={0}
                                            max={100}
                                            size="large"
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        label="Total Depreciation"
                                        name="totalDepreciation"
                                        rules={[{ required: true, message: "Please enter total depreciation" }]}
                                    >
                                        <InputNumber
                                            style={{ width: "100%" }}
                                            placeholder="Enter total depreciation"
                                            prefix={<DollarOutlined />}
                                            size="large"
                                            formatter={value => `Rs. ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                            parser={value => value.replace(/Rs\.\s?|(,*)/g, '')}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={[24, 16]}>
                                <Col span={24}>
                                    <Form.Item
                                        label="Remarks"
                                        name="remarks"
                                    >
                                        <TextArea
                                            placeholder="Enter any additional remarks"
                                            rows={3}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Form>
                    </TabPane>

                    {/* Tab 2: Attributes */}
                    <TabPane
                        tab={
                            <span style={{ fontSize: 14 }}>
                                <TagOutlined style={{ marginRight: 8 }} />
                                Attributes
                            </span>
                        }
                        key="attributes"
                    >
                        <Card size="small" style={{ marginBottom: 16 }}>
                            <Row gutter={[16, 8]}>
                                <Col span={10}>
                                    <Form.Item label="Attribute Name">
                                        <Input
                                            placeholder="Enter attribute name"
                                            name="newAttribute"
                                            onChange={(e) => form.setFieldsValue({ newAttribute: e.target.value })}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={10}>
                                    <Form.Item label="Attribute Value">
                                        <Input
                                            placeholder="Enter attribute value"
                                            name="newAttributeValue"
                                            onChange={(e) => form.setFieldsValue({ newAttributeValue: e.target.value })}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={4} style={{ display: "flex", alignItems: "flex-end", paddingBottom: 8 }}>
                                    <Button type="primary" icon={<PlusOutlined />} onClick={addAttribute}>
                                        Add
                                    </Button>
                                </Col>
                            </Row>
                        </Card>

                        <Table
                            columns={attributeColumns}
                            dataSource={attributes}
                            rowKey="key"
                            pagination={false}
                            size="small"
                            bordered
                        />
                    </TabPane>

                    {/* Tab 3: Assurance */}
                    <TabPane
                        tab={
                            <span style={{ fontSize: 14 }}>
                                <SafetyOutlined style={{ marginRight: 8 }} />
                                Assurance
                            </span>
                        }
                        key="assurance"
                    >
                        <Card size="small" style={{ marginBottom: 16 }}>
                            <Row gutter={[16, 8]}>
                                <Col span={8}>
                                    <Form.Item label="Assurance On">
                                        <Input
                                            placeholder="e.g., Warranty"
                                            name="assuranceOn"
                                            onChange={(e) => form.setFieldsValue({ assuranceOn: e.target.value })}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item label="Assurance">
                                        <Input
                                            placeholder="e.g., Guarantee"
                                            name="assurance"
                                            onChange={(e) => form.setFieldsValue({ assurance: e.target.value })}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={5}>
                                    <Form.Item label="Period (Months)">
                                        <InputNumber
                                            style={{ width: "100%" }}
                                            placeholder="Enter period"
                                            min={0}
                                            name="period"
                                            onChange={(value) => form.setFieldsValue({ period: value })}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={3} style={{ display: "flex", alignItems: "flex-end", paddingBottom: 8 }}>
                                    <Button type="primary" icon={<PlusOutlined />} onClick={addAssurance}>
                                        Add
                                    </Button>
                                </Col>
                            </Row>
                        </Card>

                        <Table
                            columns={assuranceColumns}
                            dataSource={assurances}
                            rowKey="key"
                            pagination={false}
                            size="small"
                            bordered
                        />
                    </TabPane>

                    {/* Tab 4: Location */}
                    <TabPane
                        tab={
                            <span style={{ fontSize: 14 }}>
                                <EnvironmentOutlined style={{ marginRight: 8 }} />
                                Location
                            </span>
                        }
                        key="location"
                    >
                        <Card size="small" style={{ marginBottom: 16 }}>
                            <Row gutter={[16, 8]}>
                                <Col span={8}>
                                    <Form.Item label="Location">
                                        <Select
                                            placeholder="Select location"
                                            onChange={(value) => form.setFieldsValue({ location: value })}
                                        >
                                            {locationList.map(loc => (
                                                <Option key={loc.value} value={loc.value}>
                                                    {loc.label}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={6}>
                                    <Form.Item label="Department">
                                        <Select
                                            placeholder="Select department"
                                            onChange={(value) => form.setFieldsValue({ locationDepartment: value })}
                                        >
                                            {departmentList.map(dept => (
                                                <Option key={dept.value} value={dept.value}>
                                                    {dept.label}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={6}>
                                    <Form.Item label="User">
                                        <Select
                                            placeholder="Select user"
                                            onChange={(value) => form.setFieldsValue({ locationUser: value })}
                                        >
                                            {userList.map(user => (
                                                <Option key={user.value} value={user.value}>
                                                    {user.label}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={4} style={{ display: "flex", alignItems: "flex-end", paddingBottom: 8 }}>
                                    <Button type="primary" icon={<PlusOutlined />} onClick={addLocation}>
                                        Add
                                    </Button>
                                </Col>
                            </Row>
                            <Row gutter={[16, 8]}>
                                <Col span={12}>
                                    <Form.Item label="Transfer Date">
                                        <DatePicker
                                            style={{ width: "100%" }}
                                            onChange={(date) => form.setFieldsValue({ transferDate: date })}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item label="Description">
                                        <Input
                                            placeholder="Enter description"
                                            onChange={(e) => form.setFieldsValue({ locationDescription: e.target.value })}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Card>

                        <Table
                            columns={locationColumns}
                            dataSource={locations}
                            rowKey="key"
                            pagination={false}
                            size="small"
                            bordered
                        />
                    </TabPane>

                    {/* Tab 5: Disposal */}
                    <TabPane
                        tab={
                            <span style={{ fontSize: 14 }}>
                                <DeleteOutlined style={{ marginRight: 8 }} />
                                Disposal
                            </span>
                        }
                        key="disposal"
                    >
                        <Card size="small" style={{ marginBottom: 16 }}>
                            <Row gutter={[16, 8]}>
                                <Col span={6}>
                                    <Form.Item label="Disposal Method">
                                        <Select
                                            placeholder="Select method"
                                            onChange={(value) => form.setFieldsValue({ disposalMethod: value })}
                                        >
                                            {disposalMethods.map(method => (
                                                <Option key={method.value} value={method.value}>
                                                    {method.label}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={6}>
                                    <Form.Item label="Disposal Date">
                                        <DatePicker
                                            style={{ width: "100%" }}
                                            onChange={(date) => form.setFieldsValue({ disposalDate: date })}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={6}>
                                    <Form.Item label="Disposal Value">
                                        <InputNumber
                                            style={{ width: "100%" }}
                                            placeholder="Enter value"
                                            prefix={<DollarOutlined />}
                                            onChange={(value) => form.setFieldsValue({ disposalValue: value })}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={6} style={{ display: "flex", alignItems: "flex-end", paddingBottom: 8 }}>
                                    <Button type="primary" icon={<PlusOutlined />} onClick={addDisposal}>
                                        Add
                                    </Button>
                                </Col>
                            </Row>
                            <Row gutter={[16, 8]}>
                                <Col span={24}>
                                    <Form.Item label="Remarks">
                                        <Input
                                            placeholder="Enter disposal remarks"
                                            onChange={(e) => form.setFieldsValue({ disposalRemarks: e.target.value })}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Card>

                        <Table
                            columns={disposalColumns}
                            dataSource={disposals}
                            rowKey="key"
                            pagination={false}
                            size="small"
                            bordered
                        />
                    </TabPane>

                    {/* Tab 6: Additional Asset */}
                    <TabPane
                        tab={
                            <span style={{ fontSize: 14 }}>
                                <PlusOutlined style={{ marginRight: 8 }} />
                                Additional Asset
                            </span>
                        }
                        key="additional"
                    >
                        <Card size="small" style={{ marginBottom: 16 }}>
                            <Row gutter={[16, 8]}>
                                <Col span={8}>
                                    <Form.Item label="Invoice Date">
                                        <DatePicker
                                            style={{ width: "100%" }}
                                            onChange={(date) => form.setFieldsValue({ addInvoiceDate: date })}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item label="Invoice No.">
                                        <Input
                                            placeholder="Enter invoice number"
                                            onChange={(e) => form.setFieldsValue({ addInvoiceNo: e.target.value })}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item label="Transaction Amount">
                                        <InputNumber
                                            style={{ width: "100%" }}
                                            placeholder="Enter amount"
                                            prefix={<DollarOutlined />}
                                            onChange={(value) => form.setFieldsValue({ addAmount: value })}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row gutter={[16, 8]}>
                                <Col span={20}>
                                    <Form.Item label="Remarks">
                                        <Input
                                            placeholder="Enter remarks"
                                            onChange={(e) => form.setFieldsValue({ addRemarks: e.target.value })}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={4} style={{ display: "flex", alignItems: "flex-end", paddingBottom: 8 }}>
                                    <Button type="primary" icon={<SaveOutlined />} onClick={addAdditionalAsset}>
                                        Save
                                    </Button>
                                </Col>
                            </Row>
                        </Card>

                        <Table
                            columns={additionalAssetColumns}
                            dataSource={additionalAssets}
                            rowKey="key"
                            pagination={false}
                            size="small"
                            bordered
                        />
                    </TabPane>

                    {/* Tab 7: Depreciation */}
                    <TabPane
                        tab={
                            <span style={{ fontSize: 14 }}>
                                <HistoryOutlined style={{ marginRight: 8 }} />
                                Depreciation
                            </span>
                        }
                        key="depreciation"
                    >
                        <Table
                            columns={depreciationColumns}
                            dataSource={depreciations}
                            rowKey="key"
                            pagination={false}
                            size="small"
                            bordered
                            scroll={{ x: 1800 }}
                        />
                    </TabPane>

                    {/* Tab 8: Uploads */}
                    <TabPane
                        tab={
                            <span style={{ fontSize: 14 }}>
                                <CloudUploadOutlined style={{ marginRight: 8 }} />
                                Uploads
                            </span>
                        }
                        key="uploads"
                    >
                        <Card size="small" style={{ marginBottom: 16 }}>
                            <Row gutter={[16, 8]}>
                                <Col span={16}>
                                    <Upload {...uploadProps}>
                                        <Button icon={<UploadOutlined />}>Select File</Button>
                                    </Upload>
                                </Col>
                                <Col span={8} style={{ display: "flex", alignItems: "flex-end", paddingBottom: 8 }}>
                                    <Button type="primary" icon={<CloudUploadOutlined />}>
                                        Upload
                                    </Button>
                                </Col>
                            </Row>
                        </Card>

                        <Table
                            columns={uploadColumns}
                            dataSource={uploads}
                            rowKey="key"
                            pagination={false}
                            size="small"
                            bordered
                        />
                    </TabPane>
                </Tabs>
            </Card>
        </div>
    );
};

export default AssetReview;  
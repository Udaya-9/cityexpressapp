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
    Radio,
    Table,
    Tag,
    DatePicker,
    Switch,
} from "antd";
import {
    AppstoreOutlined,
    SaveOutlined,
    ArrowLeftOutlined,
    TagOutlined,
    DollarOutlined,
    ShopOutlined,
    CalendarOutlined,
    InfoCircleOutlined,
    DatabaseOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    EditOutlined,
    EyeOutlined,
    PlusOutlined,
    DeleteOutlined,
    CalculatorOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Text, Title } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

const CreateAsset = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("general");
    const [isEdit, setIsEdit] = useState(false);
    const [calculatedTotal, setCalculatedTotal] = useState(0);
    const [taxableType, setTaxableType] = useState("vat");

    // Approval Table Data
    const [approvalData, setApprovalData] = useState([
        {
            key: 1,
            approver: "John Doe",
            role: "Manager",
            status: "Pending",
            date: "2026-08-16",
            comments: "Waiting for review",
        },
        {
            key: 2,
            approver: "Jane Smith",
            role: "Finance Head",
            status: "Approved",
            date: "2026-08-15",
            comments: "Budget approved",
        },
        {
            key: 3,
            approver: "Mike Johnson",
            role: "Director",
            status: "Rejected",
            date: "2026-08-14",
            comments: "Need more details",
        },
    ]);

    // Sample data for selects
    const vendorList = [
        { value: "techsolutions", label: "Tech Solutions Pvt Ltd" },
        { value: "globaltraders", label: "Global Traders" },
        { value: "nepalsupplies", label: "Nepal Supplies" },
        { value: "himalayantraders", label: "Himalayan Traders" },
    ];

    const categoryList = [
        { value: "electronics", label: "Electronics" },
        { value: "furniture", label: "Furniture" },
        { value: "vehicles", label: "Vehicles" },
        { value: "machinery", label: "Machinery" },
        { value: "office", label: "Office Equipment" },
    ];

    const subCategoryList = [
        { value: "laptops", label: "Laptops" },
        { value: "desktops", label: "Desktops" },
        { value: "monitors", label: "Monitors" },
        { value: "printers", label: "Printers" },
        { value: "furniture", label: "Furniture" },
    ];

    const packagingList = [
        { value: "box", label: "Box" },
        { value: "carton", label: "Carton" },
        { value: "pallet", label: "Pallet" },
        { value: "bag", label: "Bag" },
        { value: "roll", label: "Roll" },
    ];

    const packagingUnits = [
        { value: "pcs", label: "Pieces (PCS)" },
        { value: "kg", label: "Kilograms (KG)" },
        { value: "gm", label: "Grams (GM)" },
        { value: "ltr", label: "Liters (LTR)" },
        { value: "mtr", label: "Meters (MTR)" },
    ];

    // Calculate Total Cost
    const calculateTotalCost = () => {
        const perPackageQty = form.getFieldValue("perPackageQty") || 0;
        const totalQty = form.getFieldValue("totalQty") || 0;
        const perQtyRate = form.getFieldValue("perQtyRate") || 0;
        const taxableType = form.getFieldValue("taxableType") || "vat";

        // Calculate base cost
        let totalCost = totalQty * perQtyRate;

        // Apply tax based on taxable type
        if (taxableType === "vat") {
            totalCost = totalCost * 1.13; // VAT 13%
        }
        // For PAN, no additional tax (normal calculation)

        // Round to 2 decimal places
        totalCost = Math.round(totalCost * 100) / 100;

        setCalculatedTotal(totalCost);
        form.setFieldsValue({ totalCost: totalCost });
    };

    // Watch for changes in form fields to auto-calculate
    useEffect(() => {
        const subscription = form.getFieldsValue([
            "perPackageQty",
            "totalQty",
            "perQtyRate",
            "taxableType",
        ]);
        
        // Calculate on mount if values exist
        calculateTotalCost();

        // Subscribe to form changes
        const unsubscribe = form.getFieldsValue([
            "perPackageQty",
            "totalQty",
            "perQtyRate",
            "taxableType",
        ]);

        return () => {
            // Cleanup
        };
    }, []);

    // Watch for specific field changes
    const onValuesChange = (changedValues, allValues) => {
        const fieldsToWatch = ["perPackageQty", "totalQty", "perQtyRate", "taxableType"];
        const changedKeys = Object.keys(changedValues);
        
        if (changedKeys.some(key => fieldsToWatch.includes(key))) {
            calculateTotalCost();
        }

        // Update taxable type state for display
        if (changedValues.taxableType) {
            setTaxableType(changedValues.taxableType);
        }
    };

    useEffect(() => {
        if (id) {
            setIsEdit(true);
            // Simulate API call to fetch asset data
            setTimeout(() => {
                const mockData = {
                    vendor: "techsolutions",
                    purchaseDate: dayjs("2026-08-01"),
                    invoiceNo: "INV-2026-001",
                    brand: "HP",
                    remarks: "High quality laptops for development team",
                    taxableType: "vat",
                    category: "electronics",
                    subCategory: "laptops",
                    packaging: "box",
                    packagingUnit: "pcs",
                    perPackageQty: 10,
                    totalQty: 50,
                    perQtyRate: 85000,
                    totalCost: 4802500, // 50 * 85000 * 1.13
                    assetType: "operating",
                };
                form.setFieldsValue(mockData);
                setTaxableType(mockData.taxableType);
                setTimeout(() => calculateTotalCost(), 100);
            }, 500);
        }
    }, [id, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            // Calculate total cost before submit
            calculateTotalCost();

            // Simulate API call
            setTimeout(() => {
                console.log("Asset data:", values);
                message.success(isEdit ? "Asset updated successfully!" : "Asset created successfully!");
                setLoading(false);
                navigate("/asset");
            }, 1500);
        } catch (error) {
            console.error("Validation failed:", error);
            message.error("Please fill all required fields");
            setLoading(false);
        }
    };

    // Approval Columns
    const approvalColumns = [
        {
            title: "Approver",
            dataIndex: "approver",
            key: "approver",
            render: (value) => <Text strong>{value}</Text>,
        },
        {
            title: "Role",
            dataIndex: "role",
            key: "role",
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (value) => {
                const color = value === "Approved" ? "success" :
                    value === "Pending" ? "warning" : "error";
                const icon = value === "Approved" ? <CheckCircleOutlined /> :
                    value === "Pending" ? <InfoCircleOutlined /> : <CloseCircleOutlined />;
                return (
                    <Tag color={color} icon={icon}>
                        {value}
                    </Tag>
                );
            },
        },
        {
            title: "Date",
            dataIndex: "date",
            key: "date",
        },
        {
            title: "Comments",
            dataIndex: "comments",
            key: "comments",
        },
        {
            title: "Action",
            key: "action",
            render: (_, record) => (
                <Space size={4}>
                    <Button
                        type="text"
                        icon={<EyeOutlined />}
                        title="View"
                        disabled={record.status !== "Pending"}
                        size="small"
                    />
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        title="Edit"
                        disabled={record.status !== "Pending"}
                        size="small"
                    />
                    <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        title="Delete"
                        disabled={record.status !== "Pending"}
                        size="small"
                    />
                </Space>
            ),
        },
    ];

    // Tab CSS Styles
    const tabStyles = {
        padding: "24px 0",
    };

    const sectionTitleStyles = {
        marginBottom: 24,
        paddingBottom: 12,
        borderBottom: "2px solid #f0f0f0",
    };

    const cardStyles = {
        marginTop: 16,
        borderRadius: 8,
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    };

    const formItemStyles = {
        marginBottom: 20,
    };

    return (
        <Card
            title={
                <Space size="middle">
                    <AppstoreOutlined style={{ fontSize: 24, color: "#1890ff" }} />
                    <Text strong style={{ fontSize: 20 }}>
                        {isEdit ? "Edit Asset" : "Add New Asset"}
                    </Text>
                    <Tag color={isEdit ? "blue" : "green"} style={{ fontSize: 12 }}>
                        {isEdit ? "Edit Mode" : "Create Mode"}
                    </Tag>
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
                        onClick={handleSubmit}
                        size="large"
                    >
                        {isEdit ? "Update Asset" : "Save Asset"}
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
            <Form
                form={form}
                layout="vertical"
                autoComplete="off"
                onValuesChange={onValuesChange}
                initialValues={{
                    assetType: "operating",
                    taxableType: "vat",
                    isActive: true,
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
                    {/* Tab 1: General Info */}
                    <TabPane
                        tab={
                            <span style={{ fontSize: 14 }}>
                                <InfoCircleOutlined style={{ marginRight: 8 }} />
                                General Info
                            </span>
                        }
                        key="general"
                    >
                        <div style={tabStyles}>
                            <Title level={5} style={sectionTitleStyles}>
                                <ShopOutlined style={{ marginRight: 8, color: "#1890ff" }} />
                                Vendor & Purchase Details
                            </Title>

                            <Row gutter={[24, 16]}>
                                <Col span={12}>
                                    <Form.Item
                                        label="Vendor List"
                                        name="vendor"
                                        rules={[{ required: true, message: "Please select vendor" }]}
                                        style={formItemStyles}
                                    >
                                        <Select 
                                            placeholder="Select vendor" 
                                            showSearch
                                            size="large"
                                            prefix={<ShopOutlined style={{ color: "#8c8c8c" }} />}
                                        >
                                            {vendorList.map(vendor => (
                                                <Option key={vendor.value} value={vendor.value}>
                                                    {vendor.label}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        label="Date of Purchase"
                                        name="purchaseDate"
                                        rules={[{ required: true, message: "Please select purchase date" }]}
                                        style={formItemStyles}
                                    >
                                        <DatePicker
                                            style={{ width: "100%" }}
                                            placeholder="Select purchase date"
                                            format="YYYY-MM-DD"
                                            size="large"
                                            prefix={<CalendarOutlined style={{ color: "#8c8c8c" }} />}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={[24, 16]}>
                                <Col span={12}>
                                    <Form.Item
                                        label="Invoice No"
                                        name="invoiceNo"
                                        rules={[{ required: true, message: "Please enter invoice number" }]}
                                        style={formItemStyles}
                                    >
                                        <Input 
                                            placeholder="Enter invoice number" 
                                            size="large"
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        label="Brand"
                                        name="brand"
                                        style={formItemStyles}
                                    >
                                        <Input 
                                            placeholder="Enter brand name" 
                                            size="large"
                                            prefix={<TagOutlined style={{ color: "#8c8c8c" }} />}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Title level={5} style={{ ...sectionTitleStyles, marginTop: 16 }}>
                                <InfoCircleOutlined style={{ marginRight: 8, color: "#1890ff" }} />
                                Additional Information
                            </Title>

                            <Row gutter={[24, 16]}>
                                <Col span={24}>
                                    <Form.Item
                                        label="Remarks"
                                        name="remarks"
                                        style={formItemStyles}
                                    >
                                        <TextArea
                                            placeholder="Enter any additional remarks or notes"
                                            rows={4}
                                            style={{ resize: "vertical" }}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </div>
                    </TabPane>

                    {/* Tab 2: Category and Pricing */}
                    <TabPane
                        tab={
                            <span style={{ fontSize: 14 }}>
                                <DatabaseOutlined style={{ marginRight: 8 }} />
                                Category & Pricing
                            </span>
                        }
                        key="pricing"
                    >
                        <div style={tabStyles}>
                            <Title level={5} style={sectionTitleStyles}>
                                <DatabaseOutlined style={{ marginRight: 8, color: "#1890ff" }} />
                                Classification & Tax Details
                            </Title>

                            <Row gutter={[24, 16]}>
                                <Col span={24}>
                                    <Form.Item
                                        label="Taxable Type"
                                        name="taxableType"
                                        rules={[{ required: true, message: "Please select taxable type" }]}
                                        style={formItemStyles}
                                    >
                                        <Radio.Group size="large" onChange={calculateTotalCost}>
                                            <Radio value="vat" style={{ fontSize: 14 }}>
                                                <Tag color="blue">VAT (13%)</Tag>
                                            </Radio>
                                            <Radio value="pan" style={{ fontSize: 14 }}>
                                                <Tag color="green">PAN (No Tax)</Tag>
                                            </Radio>
                                        </Radio.Group>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={[24, 16]}>
                                <Col span={12}>
                                    <Form.Item
                                        label="Category"
                                        name="category"
                                        rules={[{ required: true, message: "Please select category" }]}
                                        style={formItemStyles}
                                    >
                                        <Select 
                                            placeholder="Select category" 
                                            showSearch
                                            size="large"
                                        >
                                            {categoryList.map(cat => (
                                                <Option key={cat.value} value={cat.value}>
                                                    {cat.label}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        label="Sub-Category"
                                        name="subCategory"
                                        rules={[{ required: true, message: "Please select sub-category" }]}
                                        style={formItemStyles}
                                    >
                                        <Select 
                                            placeholder="Select sub-category" 
                                            showSearch
                                            size="large"
                                        >
                                            {subCategoryList.map(sub => (
                                                <Option key={sub.value} value={sub.value}>
                                                    {sub.label}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Title level={5} style={{ ...sectionTitleStyles, marginTop: 16 }}>
                                <TagOutlined style={{ marginRight: 8, color: "#1890ff" }} />
                                Packaging Details
                            </Title>

                            <Row gutter={[24, 16]}>
                                <Col span={12}>
                                    <Form.Item
                                        label="Packaging"
                                        name="packaging"
                                        rules={[{ required: true, message: "Please select packaging" }]}
                                        style={formItemStyles}
                                    >
                                        <Select 
                                            placeholder="Select packaging type"
                                            size="large"
                                        >
                                            {packagingList.map(pkg => (
                                                <Option key={pkg.value} value={pkg.value}>
                                                    {pkg.label}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        label="Packaging Units"
                                        name="packagingUnit"
                                        rules={[{ required: true, message: "Please select packaging unit" }]}
                                        style={formItemStyles}
                                    >
                                        <Select 
                                            placeholder="Select packaging unit"
                                            size="large"
                                        >
                                            {packagingUnits.map(unit => (
                                                <Option key={unit.value} value={unit.value}>
                                                    {unit.label}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Title level={5} style={{ ...sectionTitleStyles, marginTop: 16 }}>
                                <CalculatorOutlined style={{ marginRight: 8, color: "#1890ff" }} />
                                Quantity & Pricing
                            </Title>

                            <Row gutter={[24, 16]}>
                                <Col span={8}>
                                    <Form.Item
                                        label="Per Package Quantity"
                                        name="perPackageQty"
                                        rules={[
                                            { required: true, message: "Please enter per package quantity" },
                                            { type: "number", min: 1, message: "Must be at least 1" }
                                        ]}
                                        style={formItemStyles}
                                    >
                                        <InputNumber
                                            style={{ width: "100%" }}
                                            placeholder="Per package qty"
                                            min={1}
                                            size="large"
                                            onChange={calculateTotalCost}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        label="Total Quantity"
                                        name="totalQty"
                                        rules={[
                                            { required: true, message: "Please enter total quantity" },
                                            { type: "number", min: 1, message: "Must be at least 1" }
                                        ]}
                                        style={formItemStyles}
                                    >
                                        <InputNumber
                                            style={{ width: "100%" }}
                                            placeholder="Total quantity"
                                            min={1}
                                            size="large"
                                            onChange={calculateTotalCost}
                                        />
                                    </Form.Item>
                                </Col>
                                
                            </Row>

                            <Row gutter={[24, 16]}>
                                <Col span={12}>
                                    <Form.Item
                                        label="Per Quantity Rate"
                                        name="perQtyRate"
                                        rules={[
                                            { required: true, message: "Please enter rate" },
                                            { type: "number", min: 1, message: "Rate must be at least 1" }
                                        ]}
                                        style={formItemStyles}
                                    >
                                        <InputNumber
                                            style={{ width: "100%" }}
                                            placeholder="Enter per quantity rate"
                                            prefix={<DollarOutlined style={{ color: "#8c8c8c" }} />}
                                            min={1}
                                            size="large"
                                            formatter={value => `Rs. ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                            parser={value => value.replace(/Rs\.\s?|(,*)/g, '')}
                                            onChange={calculateTotalCost}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        label="Total Cost"
                                        name="totalCost"
                                        rules={[
                                            { required: true, message: "Total cost will be calculated automatically" },
                                        ]}
                                        style={formItemStyles}
                                    >
                                        <InputNumber
                                            style={{ width: "100%" }}
                                            placeholder="Auto-calculated"
                                            prefix={<DollarOutlined style={{ color: "#8c8c8c" }} />}
                                            size="large"
                                            disabled
                                            formatter={value => `Rs. ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                            parser={value => value.replace(/Rs\.\s?|(,*)/g, '')}
                                            value={calculatedTotal}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            {/* Calculation Summary */}
                            <Card 
                                size="small" 
                                style={{ 
                                    marginTop: 16, 
                                    background: "#fafafa",
                                    border: "1px dashed #d9d9d9",
                                    borderRadius: 8,
                                }}
                            >
                                <Row gutter={[16, 8]}>
                                    <Col span={6}>
                                        <Text type="secondary">Per Package Qty:</Text>
                                        <Text strong style={{ display: "block", fontSize: 16 }}>
                                            {form.getFieldValue("perPackageQty") || 0}
                                        </Text>
                                    </Col>
                                    <Col span={6}>
                                        <Text type="secondary">Total Qty:</Text>
                                        <Text strong style={{ display: "block", fontSize: 16 }}>
                                            {form.getFieldValue("totalQty") || 0}
                                        </Text>
                                    </Col>
                                    <Col span={6}>
                                        <Text type="secondary">Per Qty Rate:</Text>
                                        <Text strong style={{ display: "block", fontSize: 16 }}>
                                            Rs. {(form.getFieldValue("perQtyRate") || 0).toLocaleString()}
                                        </Text>
                                    </Col>
                                    <Col span={6}>
                                        <Text type="secondary">Tax Applied:</Text>
                                        <Tag color={taxableType === "vat" ? "blue" : "green"} style={{ fontSize: 14 }}>
                                            {taxableType === "vat" ? "VAT (13%)" : "PAN (No Tax)"}
                                        </Tag>
                                    </Col>
                                </Row>
                                <Divider style={{ margin: "12px 0" }} />
                                <Row>
                                    <Col span={24} style={{ textAlign: "right" }}>
                                        <Text type="secondary">Calculated Total:</Text>
                                        <Text strong style={{ fontSize: 20, color: "#1890ff", marginLeft: 16 }}>
                                            Rs. {calculatedTotal.toLocaleString()}
                                        </Text>
                                    </Col>
                                </Row>
                            </Card>
                        </div>
                    </TabPane>
                </Tabs>

                <Divider style={{ margin: "24px 0" }} />

                {/* Approval Section */}
                <Card
                    title={
                        <Space size="large">
                            <CheckCircleOutlined style={{ fontSize: 20, color: "#1890ff" }} />
                            <Text strong style={{ fontSize: 16 }}>Approval Workflow</Text>
                            <Space size="small">
                                <Tag color="blue" icon={<InfoCircleOutlined />}>
                                    Pending: 1
                                </Tag>
                                <Tag color="green" icon={<CheckCircleOutlined />}>
                                    Approved: 1
                                </Tag>
                                <Tag color="red" icon={<CloseCircleOutlined />}>
                                    Rejected: 1
                                </Tag>
                            </Space>
                        </Space>
                    }
                    size="small"
                    style={cardStyles}
                    bodyStyle={{ padding: "16px 24px" }}
                >
                    <Table
                        columns={approvalColumns}
                        dataSource={approvalData}
                        rowKey="key"
                        pagination={false}
                        size="middle"
                        bordered
                        style={{ marginTop: 8 }}
                    />
                    <div style={{ marginTop: 16, textAlign: "right" }}>
                        <Button 
                            type="dashed" 
                            icon={<PlusOutlined />}
                            size="middle"
                        >
                            Add Approver
                        </Button>
                    </div>
                </Card>

                <Divider style={{ margin: "24px 0" }} />

                {/* Form Actions */}
                <Form.Item style={{ marginBottom: 0 }}>
                    <Space style={{ width: "100%", justifyContent: "flex-end" }} size="middle">
                        <Button 
                            size="large"
                            onClick={() => navigate("/asset")}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            icon={<SaveOutlined />}
                            loading={loading}
                            onClick={handleSubmit}
                            size="large"
                            style={{ minWidth: 140 }}
                        >
                            {isEdit ? "Update Asset" : "Create Asset"}
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default CreateAsset;
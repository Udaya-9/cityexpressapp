import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Card,
    Table,
    Button,
    Tag,
    Space,
    Input,
    Typography,
    Tabs,
    Tooltip,
    Progress,
    Modal,
    Form,
    Select,
    Row,
    Col,
} from "antd";
import {
    PlusOutlined,
    SearchOutlined,
    EyeOutlined,
    EditOutlined,
    InfoCircleOutlined,
    WarningOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    FilterOutlined,
} from "@ant-design/icons";

const { Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const AssetList = () => {
    const navigate = useNavigate();
    const [searchText, setSearchText] = useState("");
    const [activeTab, setActiveTab] = useState("operating");
    const [advanceSearchVisible, setAdvanceSearchVisible] = useState(false);
    const [advanceFilters, setAdvanceFilters] = useState({});

    // Operating Assets Data
    const operatingAssets = [
        {
            key: 1,
            sno: 1,
            productName: "HP Laptop X360",
            purchaseDate: "2026-08-01",
            inventoryId: "INV-001",
            invoiceNo: "INV-2026-001",
            vendor: "Tech Solutions Pvt Ltd",
            purchasedQty: 50,
            remainingQty: 25,
            consumedQty: 25,
            rate: 85000,
            purchasedValue: 4250000,
            remainingValue: 2125000,
            consumedValue: 2125000,
            stockLevel: {
                min: 10,
                max: 60,
                reorder: 15,
            },
            status: "In Stock",
        },
        {
            key: 2,
            sno: 2,
            productName: "Dell Monitor 24 inch",
            purchaseDate: "2026-08-05",
            inventoryId: "INV-002",
            invoiceNo: "INV-2026-002",
            vendor: "Global Traders",
            purchasedQty: 30,
            remainingQty: 8,
            consumedQty: 22,
            rate: 25000,
            purchasedValue: 750000,
            remainingValue: 200000,
            consumedValue: 550000,
            stockLevel: {
                min: 10,
                max: 40,
                reorder: 12,
            },
            status: "Low Stock",
        },
        {
            key: 3,
            sno: 3,
            productName: "Logitech Keyboard K380",
            purchaseDate: "2026-08-10",
            inventoryId: "INV-003",
            invoiceNo: "INV-2026-003",
            vendor: "Nepal Supplies",
            purchasedQty: 100,
            remainingQty: 45,
            consumedQty: 55,
            rate: 5000,
            purchasedValue: 500000,
            remainingValue: 225000,
            consumedValue: 275000,
            stockLevel: {
                min: 20,
                max: 120,
                reorder: 25,
            },
            status: "In Stock",
        },
        {
            key: 4,
            sno: 4,
            productName: "HP Printer LaserJet",
            purchaseDate: "2026-08-12",
            inventoryId: "INV-004",
            invoiceNo: "INV-2026-004",
            vendor: "Himalayan Traders",
            purchasedQty: 15,
            remainingQty: 2,
            consumedQty: 13,
            rate: 45000,
            purchasedValue: 675000,
            remainingValue: 90000,
            consumedValue: 585000,
            stockLevel: {
                min: 5,
                max: 20,
                reorder: 7,
            },
            status: "Critical",
        },
        {
            key: 5,
            sno: 5,
            productName: "Cisco Router 1900",
            purchaseDate: "2026-08-15",
            inventoryId: "INV-005",
            invoiceNo: "INV-2026-005",
            vendor: "Tech Solutions Pvt Ltd",
            purchasedQty: 20,
            remainingQty: 18,
            consumedQty: 2,
            rate: 120000,
            purchasedValue: 2400000,
            remainingValue: 2160000,
            consumedValue: 240000,
            stockLevel: {
                min: 5,
                max: 25,
                reorder: 8,
            },
            status: "In Stock",
        },
        {
            key: 6,
            sno: 6,
            productName: "Samsung SSD 1TB",
            purchaseDate: "2026-08-18",
            inventoryId: "INV-006",
            invoiceNo: "INV-2026-006",
            vendor: "Global Traders",
            purchasedQty: 80,
            remainingQty: 32,
            consumedQty: 48,
            rate: 12000,
            purchasedValue: 960000,
            remainingValue: 384000,
            consumedValue: 576000,
            stockLevel: {
                min: 15,
                max: 100,
                reorder: 20,
            },
            status: "In Stock",
        },
        {
            key: 7,
            sno: 7,
            productName: "Dell Server PowerEdge",
            purchaseDate: "2026-08-20",
            inventoryId: "INV-007",
            invoiceNo: "INV-2026-007",
            vendor: "Tech Solutions Pvt Ltd",
            purchasedQty: 10,
            remainingQty: 3,
            consumedQty: 7,
            rate: 350000,
            purchasedValue: 3500000,
            remainingValue: 1050000,
            consumedValue: 2450000,
            stockLevel: {
                min: 3,
                max: 15,
                reorder: 5,
            },
            status: "Low Stock",
        },
        {
            key: 8,
            sno: 8,
            productName: "APC UPS 2KVA",
            purchaseDate: "2026-08-22",
            inventoryId: "INV-008",
            invoiceNo: "INV-2026-008",
            vendor: "Nepal Supplies",
            purchasedQty: 25,
            remainingQty: 5,
            consumedQty: 20,
            rate: 55000,
            purchasedValue: 1375000,
            remainingValue: 275000,
            consumedValue: 1100000,
            stockLevel: {
                min: 5,
                max: 30,
                reorder: 8,
            },
            status: "Critical",
        },
        {
            key: 9,
            sno: 9,
            productName: "HP Laptop EliteBook",
            purchaseDate: "2026-08-25",
            inventoryId: "INV-009",
            invoiceNo: "INV-2026-009",
            vendor: "Himalayan Traders",
            purchasedQty: 40,
            remainingQty: 35,
            consumedQty: 5,
            rate: 95000,
            purchasedValue: 3800000,
            remainingValue: 3325000,
            consumedValue: 475000,
            stockLevel: {
                min: 10,
                max: 50,
                reorder: 15,
            },
            status: "In Stock",
        },
        {
            key: 10,
            sno: 10,
            productName: "Logitech Mouse M330",
            purchaseDate: "2026-08-28",
            inventoryId: "INV-010",
            invoiceNo: "INV-2026-010",
            vendor: "Global Traders",
            purchasedQty: 150,
            remainingQty: 120,
            consumedQty: 30,
            rate: 1500,
            purchasedValue: 225000,
            remainingValue: 180000,
            consumedValue: 45000,
            stockLevel: {
                min: 30,
                max: 180,
                reorder: 40,
            },
            status: "In Stock",
        },
    ];

    // Fixed Assets Data
    const fixedAssets = [
        {
            key: 1,
            fiscalYear: "FA-2082/83",
            assetCode: "FA-001",
            registeredDate: "2026-01-01",
            product: "Office Building",
            amount: 5000000,
            depreciationAmount: 250000,
            lastLocation: "Kathmandu",
            brand: "N/A",
            model: "Commercial",
            status: "In Use",
            department: "Administration",
            user: "Admin",
        },
        {
            key: 2,
            fiscalYear: "FA-2082/83",
            assetCode: "FA-002",
            registeredDate: "2026-01-15",
            product: "Toyota Hiace",
            amount: 4500000,
            depreciationAmount: 225000,
            lastLocation: "Pokhara",
            brand: "Toyota",
            model: "Hiace 2025",
            status: "In Use",
            department: "Transport",
            user: "John Doe",
        },
        {
            key: 3,
            fiscalYear: "FA-2081/82",
            assetCode: "FA-003",
            registeredDate: "2025-06-01",
            product: "Dell Server",
            amount: 3500000,
            depreciationAmount: 700000,
            lastLocation: "Data Center",
            brand: "Dell",
            model: "PowerEdge R740",
            status: "Available",
            department: "IT",
            user: "Tech Team",
        },
        {
            key: 4,
            fiscalYear: "FA-2082/83",
            assetCode: "FA-004",
            registeredDate: "2026-02-10",
            product: "Office Furniture",
            amount: 1500000,
            depreciationAmount: 75000,
            lastLocation: "Head Office",
            brand: "N/A",
            model: "Premium",
            status: "In Use",
            department: "Administration",
            user: "Admin",
        },
        {
            key: 5,
            fiscalYear: "FA-2081/82",
            assetCode: "FA-005",
            registeredDate: "2025-08-20",
            product: "Cisco Router",
            amount: 1200000,
            depreciationAmount: 240000,
            lastLocation: "Branch Office",
            brand: "Cisco",
            model: "ISR 4321",
            status: "Disposed",
            department: "IT",
            user: "Network Team",
        },
        {
            key: 6,
            fiscalYear: "FA-2082/83",
            assetCode: "FA-006",
            registeredDate: "2026-03-05",
            product: "AC Units",
            amount: 800000,
            depreciationAmount: 40000,
            lastLocation: "All Offices",
            brand: "Daikin",
            model: "Inverter 2.5T",
            status: "Available",
            department: "Facilities",
            user: "Maintenance",
        },
        {
            key: 7,
            fiscalYear: "FA-2082/83",
            assetCode: "FA-007",
            registeredDate: "2026-04-01",
            product: "Security System",
            amount: 2000000,
            depreciationAmount: 100000,
            lastLocation: "Head Office",
            brand: "Hikvision",
            model: "IP Camera System",
            status: "In Use",
            department: "Security",
            user: "Security Team",
        },
        {
            key: 8,
            fiscalYear: "FA-2081/82",
            assetCode: "FA-008",
            registeredDate: "2025-10-15",
            product: "Generator Set",
            amount: 3000000,
            depreciationAmount: 300000,
            lastLocation: "Backup Room",
            brand: "Cummins",
            model: "100KVA",
            status: "Available",
            department: "Facilities",
            user: "Maintenance",
        },
    ];

    // Tooltip Content for Product Name - Updated to handle both asset types
    const renderTooltipContent = (record, isOperating) => {
        if (isOperating) {
            return (
                <div style={{ maxWidth: 400 }}>
                    <table style={{ width: "100%", fontSize: 12 }}>
                        <tbody>
                            <tr><td><strong>S.No:</strong></td><td>{record.sno}</td></tr>
                            <tr><td><strong>Purchase Date:</strong></td><td>{record.purchaseDate}</td></tr>
                            <tr><td><strong>Inventory ID:</strong></td><td><Tag color="blue">{record.inventoryId}</Tag></td></tr>
                            <tr><td><strong>Product:</strong></td><td>{record.productName}</td></tr>
                            <tr><td><strong>Invoice No:</strong></td><td>{record.invoiceNo}</td></tr>
                            <tr><td><strong>Vendor:</strong></td><td>{record.vendor}</td></tr>
                            <tr><td><strong>Purchased Qty:</strong></td><td>{record.purchasedQty}</td></tr>
                            <tr><td><strong>Remaining Qty:</strong></td><td>{record.remainingQty}</td></tr>
                            <tr><td><strong>Consumed Qty:</strong></td><td>{record.consumedQty}</td></tr>
                            <tr><td><strong>Rate:</strong></td><td>Rs. {(record.rate || 0).toLocaleString()}</td></tr>
                            <tr><td><strong>Purchased Value:</strong></td><td>Rs. {(record.purchasedValue || 0).toLocaleString()}</td></tr>
                            <tr><td><strong>Remaining Value:</strong></td><td>Rs. {(record.remainingValue || 0).toLocaleString()}</td></tr>
                            <tr><td><strong>Consumed Value:</strong></td><td>Rs. {(record.consumedValue || 0).toLocaleString()}</td></tr>
                        </tbody>
                    </table>
                </div>
            );
        } else {
            return (
                <div style={{ maxWidth: 400 }}>
                    <table style={{ width: "100%", fontSize: 12 }}>
                        <tbody>
                            <tr><td><strong>Asset Code:</strong></td><td><Tag color="blue">{record.assetCode}</Tag></td></tr>
                            <tr><td><strong>Product:</strong></td><td>{record.product}</td></tr>
                            <tr><td><strong>Fiscal Year:</strong></td><td><Tag color="purple">{record.fiscalYear}</Tag></td></tr>
                            <tr><td><strong>Registered Date:</strong></td><td>{record.registeredDate}</td></tr>
                            <tr><td><strong>Amount:</strong></td><td>Rs. {(record.amount || 0).toLocaleString()}</td></tr>
                            <tr><td><strong>Depreciation:</strong></td><td>Rs. {(record.depreciationAmount || 0).toLocaleString()}</td></tr>
                            <tr><td><strong>Last Location:</strong></td><td>{record.lastLocation}</td></tr>
                            <tr><td><strong>Brand:</strong></td><td>{record.brand}</td></tr>
                            <tr><td><strong>Model:</strong></td><td>{record.model}</td></tr>
                            <tr><td><strong>Department:</strong></td><td>{record.department}</td></tr>
                            <tr><td><strong>User:</strong></td><td>{record.user}</td></tr>
                        </tbody>
                    </table>
                </div>
            );
        }
    };

    // Get Stock Level Status - Updated with null check
    const getStockStatus = (remaining, stockLevel) => {
        if (!stockLevel) {
            return { color: "default", icon: <InfoCircleOutlined />, label: "N/A" };
        }
        if (remaining <= stockLevel.min) {
            return { color: "red", icon: <CloseCircleOutlined />, label: "Critical" };
        } else if (remaining <= stockLevel.reorder) {
            return { color: "orange", icon: <WarningOutlined />, label: "Reorder" };
        } else if (remaining <= stockLevel.max) {
            return { color: "green", icon: <CheckCircleOutlined />, label: "Optimal" };
        }
        return { color: "blue", icon: <InfoCircleOutlined />, label: "Excess" };
    };

    // Render Stock Level Bar - Updated to handle both asset types
    const renderStockLevel = (record, isOperating) => {
        if (!isOperating) {
            return (
                <div>
                    <Tag color="default">N/A</Tag>
                    <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
                        Fixed Asset
                    </Text>
                </div>
            );
        }

        const { remainingQty, stockLevel } = record;
        if (!stockLevel) {
            return <Tag color="default">No Stock Data</Tag>;
        }

        const { min, max, reorder } = stockLevel;
        const percentage = Math.min((remainingQty / max) * 100, 100);

        return (
            <div>
                <Progress
                    percent={Math.round(percentage)}
                    status={percentage < 30 ? "exception" : "success"}
                    strokeColor={percentage < 30 ? "#ff4d4f" : percentage < 50 ? "#faad14" : "#52c41a"}
                    format={() => `${remainingQty} / ${max}`}
                />
                <Space size={4}>
                    <Tag color="blue">Min: {min}</Tag>
                    <Tag color="orange">Reorder: {reorder}</Tag>
                    <Tag color="green">Max: {max}</Tag>
                </Space>
            </div>
        );
    };

    // Operating Assets Columns
    const operatingColumns = [
        {
            title: "S.No",
            dataIndex: "sno",
            key: "sno",
            width: 60,
            sorter: (a, b) => a.sno - b.sno,
            render: (value) => value || "-",
        },
        {
            title: "Product Name",
            dataIndex: "productName",
            key: "productName",
            width: 200,
            sorter: (a, b) => a.productName.localeCompare(b.productName),
            render: (value, record) => (
                <Tooltip
                    title={renderTooltipContent(record, true)}
                    placement="rightTop"
                    overlayStyle={{ maxWidth: 450 }}
                >
                    <Button
                        type="link"
                        style={{ padding: 0, fontWeight: 500 }}
                        onClick={() => navigate(`detail/${record.key}`)}
                    >
                        {value || "N/A"}
                    </Button>
                </Tooltip>
            ),
        },
        {
            title: "Purchase Qty",
            dataIndex: "purchasedQty",
            key: "purchasedQty",
            width: 110,
            sorter: (a, b) => (a.purchasedQty || 0) - (b.purchasedQty || 0),
            render: (value) => value || 0,
        },
        {
            title: "Remaining Qty",
            dataIndex: "remainingQty",
            key: "remainingQty",
            width: 120,
            sorter: (a, b) => (a.remainingQty || 0) - (b.remainingQty || 0),
            render: (value) => value || 0,
        },
        {
            title: "Consumed Qty",
            dataIndex: "consumedQty",
            key: "consumedQty",
            width: 120,
            render: (value) => value || 0,
        },
        {
            title: "Stock Level",
            key: "stockLevel",
            width: 250,
            render: (_, record) => renderStockLevel(record, true),
        },
        {
            title: "Status",
            key: "status",
            width: 100,
            filters: [
                { text: "In Stock", value: "In Stock" },
                { text: "Low Stock", value: "Low Stock" },
                { text: "Critical", value: "Critical" },
            ],
            onFilter: (value, record) => record.status === value,
            render: (_, record) => {
                const { remainingQty, stockLevel } = record;
                const status = getStockStatus(remainingQty || 0, stockLevel);
                return (
                    <Tag color={status.color} icon={status.icon}>
                        {status.label}
                    </Tag>
                );
            },
        },
        {
            title: "Action",
            key: "action",
            fixed: "right",
            width: 100,
            render: (_, record) => (
                <Space size={4}>
                    <Button
                        type="text"
                        icon={<EyeOutlined />}
                        title="View"
                        onClick={() => navigate(`detail/${record.key}`)}
                    />
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        title="Edit"
                        onClick={() => navigate(`edit/${record.key}`)}
                    />
                </Space>
            ),
        },
    ];

    // Fixed Assets Columns
    // Fixed Assets Columns
    const fixedColumns = [
        {
            title: "S.No",
            key: "sno",
            width: 80,
            render: (_, record, index) => (
                <Space direction="vertical" size={0}>
                    <Text strong>{index + 1}</Text>
                    <Tag color="purple" style={{ fontSize: 10 }}>
                        {record.fiscalYear}
                    </Tag>
                </Space>
            ),
        },
        {
            title: "Asset Code",
            dataIndex: "assetCode",
            key: "assetCode",
            width: 120,
            render: (value) => <Tag color="blue">{value || "N/A"}</Tag>,
        },
        {
            title: "Registered Date",
            dataIndex: "registeredDate",
            key: "registeredDate",
            width: 130,
            sorter: (a, b) => new Date(a.registeredDate) - new Date(b.registeredDate),
            render: (value) => value || "N/A",
        },
        {
            title: "Product",
            dataIndex: "product",
            key: "product",
            width: 180,
            sorter: (a, b) => a.product.localeCompare(b.product),
            render: (value, record) => (
                <Tooltip
                    title={renderTooltipContent(record, false)}
                    placement="rightTop"
                    overlayStyle={{ maxWidth: 450 }}
                >
                    <Button
                        type="link"
                        style={{ padding: 0, fontWeight: 500 }}
                        onClick={() => navigate(`detail/${record.key}`)}
                    >
                        {value || "N/A"}
                    </Button>
                </Tooltip>
            ),
        },
        {
            title: "Amount (Rs.)",
            dataIndex: "amount",
            key: "amount",
            width: 130,
            sorter: (a, b) => (a.amount || 0) - (b.amount || 0),
            render: (value) => (
                <Text strong style={{ color: "#1890ff" }}>
                    {(value || 0).toLocaleString()}
                </Text>
            ),
        },
        {
            title: "Depreciation",
            dataIndex: "depreciationAmount",
            key: "depreciationAmount",
            width: 130,
            render: (value) => (
                <Text type="danger">
                    {(value || 0).toLocaleString()}
                </Text>
            ),
        },
        {
            title: "Depreciation Rate",
            key: "depreciationRate",
            width: 120,
            render: (_, record) => {
                const amount = record.amount || 0;
                const depreciation = record.depreciationAmount || 0;
                const rate = amount > 0 ? ((depreciation / amount) * 100).toFixed(1) : "0.0";
                return <Tag color="orange">{rate}%</Tag>;
            },
        },
        {
            title: "Last Location",
            dataIndex: "lastLocation",
            key: "lastLocation",
            width: 130,
            render: (value) => value || "N/A",
        },
        {
            title: "Brand",
            dataIndex: "brand",
            key: "brand",
            width: 120,
            render: (value) => value || "N/A",
        },
        {
            title: "Model",
            dataIndex: "model",
            key: "model",
            width: 140,
            render: (value) => value || "N/A",
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            width: 120,
            filters: [
                { text: "In Use", value: "In Use" },
                { text: "Available", value: "Available" },
                { text: "Disposed", value: "Disposed" },
            ],
            onFilter: (value, record) => record.status === value,
            render: (value) => {
                if (!value) return <Tag color="default">N/A</Tag>;
                const color = value === "In Use" ? "green" :
                    value === "Available" ? "blue" : "red";
                const icon = value === "In Use" ? <CheckCircleOutlined /> :
                    value === "Available" ? <InfoCircleOutlined /> : <CloseCircleOutlined />;
                return (
                    <Tag color={color} icon={icon}>
                        {value}
                    </Tag>
                );
            },
        },
        {
            title: "Action",
            key: "action",
            fixed: "right",
            width: 140,
            render: (_, record) => (
                <Space size={4}>
                    <Button
                        type="text"
                        icon={<EyeOutlined />}
                        title="View"
                        onClick={() => navigate(`detail/${record.key}`)}
                    />
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        title="Edit"
                        onClick={() => navigate(`edit/${record.key}`)}
                    />
                    <Button
                        type="primary"
                        size="small"
                        onClick={() => navigate(`review/${record.key}`)}
                    >
                        Review
                    </Button>
                </Space>
            ),
        },
    ];

    // Filter Data for Operating Assets
    const filterOperatingData = (data) => {
        const query = searchText.trim().toLowerCase();
        if (!query) return data;
        return data.filter((item) =>
            [
                item.productName,
                item.vendor,
                item.inventoryId,
                item.invoiceNo,
            ]
                .join(" ")
                .toLowerCase()
                .includes(query)
        );
    };

    // Filter Data for Fixed Assets with Advanced Search
    const filterFixedData = (data) => {
        let filtered = data;

        // Simple search
        const query = searchText.trim().toLowerCase();
        if (query) {
            filtered = filtered.filter((item) =>
                [
                    item.product,
                    item.assetCode,
                    item.brand,
                    item.model,
                    item.lastLocation,
                    item.department,
                    item.user,
                    item.fiscalYear,
                ]
                    .join(" ")
                    .toLowerCase()
                    .includes(query)
            );
        }

        // Advanced filters
        if (advanceFilters.fiscalYear) {
            filtered = filtered.filter(item => item.fiscalYear === advanceFilters.fiscalYear);
        }
        if (advanceFilters.product) {
            filtered = filtered.filter(item =>
                item.product.toLowerCase().includes(advanceFilters.product.toLowerCase())
            );
        }
        if (advanceFilters.location) {
            filtered = filtered.filter(item =>
                item.lastLocation.toLowerCase().includes(advanceFilters.location.toLowerCase())
            );
        }
        if (advanceFilters.assetCode) {
            filtered = filtered.filter(item =>
                item.assetCode.toLowerCase().includes(advanceFilters.assetCode.toLowerCase())
            );
        }
        if (advanceFilters.department) {
            filtered = filtered.filter(item => item.department === advanceFilters.department);
        }
        if (advanceFilters.user) {
            filtered = filtered.filter(item =>
                item.user.toLowerCase().includes(advanceFilters.user.toLowerCase())
            );
        }

        return filtered;
    };

    const filteredData = useMemo(() => {
        if (activeTab === "operating") {
            return filterOperatingData(operatingAssets);
        } else {
            return filterFixedData(fixedAssets);
        }
    }, [searchText, activeTab, operatingAssets, fixedAssets, advanceFilters]);

    // Advance Search Modal
    const AdvanceSearchModal = () => {
        const [form] = Form.useForm();

        const handleApply = () => {
            const values = form.getFieldsValue();
            setAdvanceFilters(values);
            setAdvanceSearchVisible(false);
        };

        const handleReset = () => {
            form.resetFields();
            setAdvanceFilters({});
            setAdvanceSearchVisible(false);
        };

        return (
            <Modal
                title={
                    <Space>
                        <FilterOutlined />
                        <Text strong>Advanced Search</Text>
                    </Space>
                }
                open={advanceSearchVisible}
                onCancel={() => setAdvanceSearchVisible(false)}
                footer={[
                    <Button key="reset" onClick={handleReset}>
                        Reset
                    </Button>,
                    <Button key="cancel" onClick={() => setAdvanceSearchVisible(false)}>
                        Cancel
                    </Button>,
                    <Button key="apply" type="primary" onClick={handleApply}>
                        Apply Filters
                    </Button>,
                ]}
                width={600}
            >
                <Form form={form} layout="vertical">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="Fiscal Year" name="fiscalYear">
                                <Select placeholder="Select Fiscal Year" allowClear>
                                    <Option value="FA-2082/83">FA-2082/83</Option>
                                    <Option value="FA-2081/82">FA-2081/82</Option>
                                    <Option value="FA-2080/81">FA-2080/81</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Product" name="product">
                                <Input placeholder="Search product" allowClear />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="Location" name="location">
                                <Input placeholder="Enter location" allowClear />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Asset Code" name="assetCode">
                                <Input placeholder="Enter asset code" allowClear />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="Department" name="department">
                                <Select placeholder="Select Department" allowClear>
                                    <Option value="IT">IT</Option>
                                    <Option value="Administration">Administration</Option>
                                    <Option value="Transport">Transport</Option>
                                    <Option value="Security">Security</Option>
                                    <Option value="Facilities">Facilities</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="User" name="user">
                                <Input placeholder="Enter user name" allowClear />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        );
    };

    return (
        <>
            <Card
                title="Asset Management"
                extra={
                    <Space>
                        {activeTab === "fixed" && (
                            <Button
                                icon={<FilterOutlined />}
                                onClick={() => setAdvanceSearchVisible(true)}
                            >
                                Advanced Search
                            </Button>
                        )}
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => navigate("/asset/create")}
                        >
                            Add New Asset
                        </Button>
                    </Space>
                }
                styles={{ body: { paddingTop: 16 } }}
            >
                <Tabs activeKey={activeTab} onChange={setActiveTab}>
                    <TabPane tab="Operating Assets" key="operating">
                        <Space
                            style={{
                                width: "100%",
                                justifyContent: "space-between",
                                marginBottom: 16,
                            }}
                        >
                            <Input
                                allowClear
                                placeholder="Search by product name, vendor, or inventory ID"
                                prefix={<SearchOutlined style={{ color: "#8c8c8c" }} />}
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                style={{ maxWidth: 400 }}
                            />
                            <Text type="secondary">
                                {filteredData.length} of {operatingAssets.length} assets
                            </Text>
                        </Space>

                        <Table
                            columns={operatingColumns}
                            dataSource={filteredData}
                            rowKey="key"
                            scroll={{ x: 1300 }}
                            size="middle"
                            pagination={{
                                pageSize: 10,
                                showSizeChanger: true,
                                pageSizeOptions: ["10", "20", "50", "100"],
                                showTotal: (total, range) =>
                                    `${range[0]}-${range[1]} of ${total} assets`,
                            }}
                            locale={{
                                emptyText: searchText
                                    ? "No assets match your search."
                                    : "No assets found.",
                            }}
                        />
                    </TabPane>

                    <TabPane tab="Fixed Assets" key="fixed">
                        <Space
                            style={{
                                width: "100%",
                                justifyContent: "space-between",
                                marginBottom: 16,
                            }}
                        >
                            <Space>
                                <Input
                                    allowClear
                                    placeholder="Search by product, code, brand, location..."
                                    prefix={<SearchOutlined style={{ color: "#8c8c8c" }} />}
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    style={{ width: 350 }}
                                />
                                {Object.keys(advanceFilters).length > 0 && (
                                    <Tag color="blue" closable onClose={() => setAdvanceFilters({})}>
                                        Filters Applied
                                    </Tag>
                                )}
                            </Space>
                            <Text type="secondary">
                                {filteredData.length} of {fixedAssets.length} assets
                            </Text>
                        </Space>

                        <Table
                            columns={fixedColumns}
                            dataSource={filteredData}
                            rowKey="key"
                            scroll={{ x: 1500 }}
                            size="middle"
                            pagination={{
                                pageSize: 10,
                                showSizeChanger: true,
                                pageSizeOptions: ["10", "20", "50", "100"],
                                showTotal: (total, range) =>
                                    `${range[0]}-${range[1]} of ${total} assets`,
                            }}
                            locale={{
                                emptyText: searchText
                                    ? "No assets match your search."
                                    : "No assets found.",
                            }}
                        />
                    </TabPane>
                </Tabs>
            </Card>

            <AdvanceSearchModal />
        </>
    );
};

export default AssetList;
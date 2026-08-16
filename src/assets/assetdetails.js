// src/assets/assetdetail.js
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    Card,
    Descriptions,
    Button,
    Space,
    Typography,
    Tag,
    Divider,
    Table,
    Progress,
    Row,
    Col,
    Statistic,
} from "antd";
import {
    ArrowLeftOutlined,
    EditOutlined,
    PrinterOutlined,
    DownloadOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const AssetDetail = () => {  // ✅ Component name matches
    const navigate = useNavigate();
    const { id } = useParams();
    const [asset, setAsset] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            const mockData = {
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
                description: "HP Laptop X360 with Intel Core i7, 16GB RAM, 512GB SSD",
                location: "Warehouse A - Section 3",
                category: "Electronics",
                warranty: "2 Years",
            };
            setAsset(mockData);
            setLoading(false);
        }, 500);
    }, [id]);

    if (loading) {
        return <Card loading={true} />;
    }

    if (!asset) {
        return (
            <Card>
                <Title level={4}>Asset not found</Title>
                <Button onClick={() => navigate("/asset")}>
                    Back to List
                </Button>
            </Card>
        );
    }

    // Transaction History
    const transactionColumns = [
        {
            title: "Date",
            dataIndex: "date",
            key: "date",
        },
        {
            title: "Type",
            dataIndex: "type",
            key: "type",
            render: (value) => (
                <Tag color={value === "Purchase" ? "green" : "blue"}>
                    {value}
                </Tag>
            ),
        },
        {
            title: "Quantity",
            dataIndex: "quantity",
            key: "quantity",
        },
        {
            title: "Remaining",
            dataIndex: "remaining",
            key: "remaining",
        },
        {
            title: "User",
            dataIndex: "user",
            key: "user",
        },
    ];

    const transactionData = [
        { key: 1, date: "2026-08-01", type: "Purchase", quantity: 50, remaining: 50, user: "System" },
        { key: 2, date: "2026-08-05", type: "Consumption", quantity: -10, remaining: 40, user: "John Doe" },
        { key: 3, date: "2026-08-10", type: "Consumption", quantity: -5, remaining: 35, user: "Jane Smith" },
        { key: 4, date: "2026-08-15", type: "Consumption", quantity: -10, remaining: 25, user: "Mike Johnson" },
    ];

    const getStockStatus = (remaining, stockLevel) => {
        if (remaining <= stockLevel.min) {
            return { color: "red", label: "Critical" };
        } else if (remaining <= stockLevel.reorder) {
            return { color: "orange", label: "Reorder" };
        } else if (remaining <= stockLevel.max) {
            return { color: "green", label: "Optimal" };
        }
        return { color: "blue", label: "Excess" };
    };

    const status = getStockStatus(asset.remainingQty, asset.stockLevel);

    return (
        <div>
            <Card
                title={
                    <Space>
                        <Text strong style={{ fontSize: 18 }}>
                            Asset Detail
                        </Text>
                        <Tag color="blue">{asset.inventoryId}</Tag>
                    </Space>
                }
                extra={
                    <Space>
                        <Button 
                            icon={<ArrowLeftOutlined />}
                            onClick={() => navigate("/asset")}
                        >
                            Back to List
                        </Button>
                        <Button type="primary" icon={<EditOutlined />}>
                            Edit
                        </Button>
                        <Button icon={<PrinterOutlined />}>
                            Print
                        </Button>
                        <Button icon={<DownloadOutlined />}>
                            Export
                        </Button>
                    </Space>
                }
            >
                <Row gutter={24}>
                    <Col span={16}>
                        <Descriptions 
                            title="Product Information" 
                            bordered 
                            column={2}
                            style={{ marginBottom: 24 }}
                        >
                            <Descriptions.Item label="Product Name" span={2}>
                                <Text strong>{asset.productName}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Inventory ID">
                                <Tag color="blue">{asset.inventoryId}</Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Invoice No">
                                {asset.invoiceNo}
                            </Descriptions.Item>
                            <Descriptions.Item label="Vendor">
                                {asset.vendor}
                            </Descriptions.Item>
                            <Descriptions.Item label="Purchase Date">
                                {asset.purchaseDate}
                            </Descriptions.Item>
                            <Descriptions.Item label="Category">
                                {asset.category || "N/A"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Location">
                                {asset.location || "N/A"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Warranty">
                                {asset.warranty || "N/A"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Description" span={2}>
                                {asset.description || "No description available"}
                            </Descriptions.Item>
                        </Descriptions>

                        <Card title="Stock Level Information" size="small">
                            <Row gutter={16}>
                                <Col span={6}>
                                    <Statistic 
                                        title="Purchased Qty" 
                                        value={asset.purchasedQty}
                                        prefix="📦"
                                    />
                                </Col>
                                <Col span={6}>
                                    <Statistic 
                                        title="Remaining Qty" 
                                        value={asset.remainingQty}
                                        valueStyle={{ color: asset.remainingQty < 10 ? "#cf1322" : "#3f8600" }}
                                    />
                                </Col>
                                <Col span={6}>
                                    <Statistic 
                                        title="Consumed Qty" 
                                        value={asset.consumedQty}
                                        prefix="⚡"
                                    />
                                </Col>
                                <Col span={6}>
                                    <Statistic 
                                        title="Status" 
                                        value={status.label}
                                        valueStyle={{ color: status.color === "green" ? "#3f8600" : "#cf1322" }}
                                    />
                                </Col>
                            </Row>
                            <Divider />
                            <div>
                                <Progress 
                                    percent={Math.round((asset.remainingQty / asset.purchasedQty) * 100)}
                                    status={asset.remainingQty < 10 ? "exception" : "success"}
                                    strokeColor={asset.remainingQty < 10 ? "#ff4d4f" : "#52c41a"}
                                    format={() => `${asset.remainingQty} / ${asset.purchasedQty}`}
                                />
                                <Space size={4} style={{ marginTop: 8 }}>
                                    <Tag color="blue">Min: {asset.stockLevel.min}</Tag>
                                    <Tag color="orange">Reorder: {asset.stockLevel.reorder}</Tag>
                                    <Tag color="green">Max: {asset.stockLevel.max}</Tag>
                                </Space>
                            </div>
                        </Card>
                    </Col>

                    <Col span={8}>
                        <Card title="Financial Summary" size="small">
                            <Descriptions column={1} size="small">
                                <Descriptions.Item label="Rate">
                                    Rs. {asset.rate.toLocaleString()}
                                </Descriptions.Item>
                                <Descriptions.Item label="Purchased Value">
                                    <Text strong>Rs. {asset.purchasedValue.toLocaleString()}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Remaining Value">
                                    <Text type="success">Rs. {asset.remainingValue.toLocaleString()}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Consumed Value">
                                    <Text type="danger">Rs. {asset.consumedValue.toLocaleString()}</Text>
                                </Descriptions.Item>
                            </Descriptions>
                            <Divider />
                            <div style={{ textAlign: "center" }}>
                                <Progress 
                                    type="circle"
                                    percent={Math.round((asset.consumedQty / asset.purchasedQty) * 100)}
                                    format={() => `${Math.round((asset.consumedQty / asset.purchasedQty) * 100)}%`}
                                    width={80}
                                />
                                <div style={{ marginTop: 8 }}>
                                    <Text type="secondary">Consumption Rate</Text>
                                </div>
                            </div>
                        </Card>
                    </Col>
                </Row>

                <Divider />

                <Card title="Transaction History" size="small">
                    <Table
                        columns={transactionColumns}
                        dataSource={transactionData}
                        rowKey="key"
                        pagination={false}
                        size="small"
                    />
                </Card>
            </Card>
        </div>
    );
};

export default AssetDetail;
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Table, Button, Tag, Space, Input, Typography } from "antd";
import {
    PlusOutlined,
    EditOutlined,
    EyeOutlined,
    SearchOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

const VendorList = () => {
    const navigate = useNavigate();
    const [searchText, setSearchText] = useState("");

    const columns = [
        {
            title: "Vendor Name",
            dataIndex: "vendorName",
            key: "vendorName",
            sorter: (a, b) => a.vendorName.localeCompare(b.vendorName),
            render: (value) => <Text strong>{value}</Text>,
        },
        {
            title: "Contact Person",
            dataIndex: "contactPerson",
            key: "contactPerson",
            sorter: (a, b) => a.contactPerson.localeCompare(b.contactPerson),
        },
        {
            title: "Address",
            dataIndex: "address",
            key: "address",
        },
        {
            title: "Mobile No",
            dataIndex: "mobileNo",
            key: "mobileNo",
        },
        {
            title: "Phone No",
            dataIndex: "phoneNo",
            key: "phoneNo",
        },
        {
            title: "Email Address",
            dataIndex: "email",
            key: "email",
        },
        {
            title: "PAN/VAT",
            dataIndex: "panVat",
            key: "panVat",
        },
        {
            title: "Registration No",
            dataIndex: "registrationNo",
            key: "registrationNo",
        },
        {
            title: "Status",
            key: "status",
            filters: [
                { text: "Active", value: "active" },
                { text: "Inactive", value: "inactive" },
            ],
            onFilter: (value, record) => {
                if (value === "active") return record.isActive;
                return !record.isActive;
            },
            render: (_, record) => (
                <Tag color={record.isActive ? "success" : "default"}>
                    {record.isActive ? "Active" : "Inactive"}
                </Tag>
            ),
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
                    />
                    <Button 
                        type="text" 
                        icon={<EditOutlined />} 
                        title="Edit"
                    />
                </Space>
            ),
        },
    ];

    const data = [
        {
            key: 1,
            vendorName: "Tech Solutions Pvt Ltd",
            contactPerson: "Ram Sharma",
            address: "Kathmandu, Nepal",
            mobileNo: "9841234567",
            phoneNo: "01-4234567",
            email: "info@techsolutions.com",
            panVat: "123456789",
            registrationNo: "REG-001",
            isActive: true,
        },
        {
            key: 2,
            vendorName: "Global Traders",
            contactPerson: "Sita Thapa",
            address: "Pokhara, Nepal",
            mobileNo: "9847654321",
            phoneNo: "061-523456",
            email: "contact@globaltraders.com",
            panVat: "987654321",
            registrationNo: "REG-002",
            isActive: true,
        },
        {
            key: 3,
            vendorName: "Nepal Supplies",
            contactPerson: "Hari Gurung",
            address: "Biratnagar, Nepal",
            mobileNo: "9801234567",
            phoneNo: "021-523456",
            email: "info@nepalsupplies.com",
            panVat: "456789123",
            registrationNo: "REG-003",
            isActive: false,
        },
    ];

    const filteredData = useMemo(() => {
        const query = searchText.trim().toLowerCase();
        if (!query) return data;
        return data.filter((vendor) =>
            [
                vendor.vendorName,
                vendor.contactPerson,
                vendor.address,
                vendor.email,
                vendor.panVat,
                vendor.registrationNo,
            ]
                .join(" ")
                .toLowerCase()
                .includes(query)
        );
    }, [searchText, data]);

    return (
        <Card
            title="Vendor Management"
            extra={
                <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    onClick={() => navigate("create")} 
                >
                    Create New Vendor
                </Button>
            }
            styles={{ body: { paddingTop: 16 } }}
        >
            <Space
                style={{
                    width: "100%",
                    justifyContent: "space-between",
                    marginBottom: 16,
                }}
            >
                <Input
                    allowClear
                    placeholder="Search by name, contact, address, or email"
                    prefix={<SearchOutlined style={{ color: "#8c8c8c" }} />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ maxWidth: 320 }}
                />
                <Text type="secondary">
                    {filteredData.length} of {data.length} vendors
                </Text>
            </Space>

            <Table
                columns={columns}
                dataSource={filteredData}
                rowKey="key"
                scroll={{ x: 1300 }}
                size="middle"
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    pageSizeOptions: ["10", "20", "50", "100"],
                    showTotal: (total, range) =>
                        `${range[0]}-${range[1]} of ${total} vendors`,
                }}
                locale={{
                    emptyText: searchText
                        ? "No vendors match your search."
                        : "No vendors found.",
                }}
            />
        </Card>
    );
};

export default VendorList;
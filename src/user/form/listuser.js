import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Table, Button, Tag, Space, Input, Typography } from "antd";
import {
    PlusOutlined,
    EditOutlined,
    SearchOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

const UserList = () => {
    const navigate = useNavigate();
    const [searchText, setSearchText] = useState("");

    const columns = [
        {
            title: "User Name",
            dataIndex: "userName",
            key: "userName",
            sorter: (a, b) => a.userName.localeCompare(b.userName),
            render: (value) => <Text strong>{value}</Text>,
        },
         {
            title: "Organization Name",
            dataIndex: "organizationname",
            key: "organizationname",
            sorter: (a, b) => a.organizationname.localeCompare(b.organizationname),
        },
        {
            title: "Full Name",
            dataIndex: "fullName",
            key: "fullName",
            sorter: (a, b) => a.fullName.localeCompare(b.fullName),
        },
        {
            title: "Department",
            dataIndex: "department",
            key: "department",
        },
        {
            title: "Unit",
            dataIndex: "unit",
            key: "unit",
        },
        {
            title: "User Created On",
            dataIndex: "createdOn",
            key: "createdOn",
            sorter: (a, b) => new Date(a.createdOn) - new Date(b.createdOn),
        },
        {
            title: "Created By",
            dataIndex: "createdBy",
            key: "createdBy",
        },
        {
            title: "Last Login Date",
            dataIndex: "lastLoginDate",
            key: "lastLoginDate",
            sorter: (a, b) =>
                new Date(a.lastLoginDate) - new Date(b.lastLoginDate),
        },
         {
            title: "Authentication",
            dataIndex: "Authentication",
            key: "Authentication",
        },
        {
            title: "Status",
            key: "status",
            filters: [
                { text: "Blocked", value: "blocked" },
                { text: "Suspended", value: "suspended" },
                { text: "Active", value: "active" },
            ],
            onFilter: (value, record) => {
                if (value === "blocked") return record.isBlocked;
                if (value === "suspended") return record.isSuspended;
                return !record.isBlocked && !record.isSuspended;
            },
            render: (_, record) => (
                <Space size={4}>
                    {record.isBlocked && <Tag color="red">Blocked</Tag>}
                    {record.isSuspended && (
                        <Tag color="orange">Suspended</Tag>
                    )}
                    {!record.isBlocked && !record.isSuspended && (
                        <Tag color="success">Active</Tag>
                    )}
                </Space>
            ),
        },
        {
            title: "Access Online",
            dataIndex: "accessOnline",  // Fixed: should match data property
            key: "accessOnline",
            render: (value) => value ? "Yes" : "No",  // Added render to show Yes/No
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
                        icon={<EditOutlined />}
                        title="Edit"
                        onClick={() => navigate(`edit/${record.key}`)}
                    />
                </Space>
            ),
        },
    ];

    const data = [
        {
            key: 1,
            userName: "Admin",
            organizationname: "CEMT",
            fullName: "Administrator",
            department: "IT",
            unit: "Development",
            createdOn: "2026-08-01",
            createdBy: "System",
            lastLoginDate: "2026-08-15",
               Authentication:"SuperAdmin",
            isBlocked: false,
            isSuspended: false,
            accessOnline: true,  // Added this field
        },
        {
            key: 2,
            userName: "udaya.ghimire@ctxpress.com",
                organizationname: "CEMT-JP",
            fullName: "Uday Chandra Ghimire",
            department: "IT",
            unit: "Development",
            createdOn: "2026-08-02",
            createdBy: "kishan Bhari",
            lastLoginDate: "2026-08-14",
            Authentication:"Admin",
            isBlocked: false,
            isSuspended: false,
            accessOnline: true,  
        },
    ];

    const filteredData = useMemo(() => {
        const query = searchText.trim().toLowerCase();
        if (!query) return data;
        return data.filter((user) =>
            [
                user.userName,
                user.fullName,
                user.department,
                user.unit,
                user.createdBy,
            ]
                .join(" ")
                .toLowerCase()
                .includes(query)
        );
    }, [searchText, data]);

    return (
        <Card
            title="User Management"
            extra={
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => navigate("create")}
                >
                    Create New User
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
                    placeholder="Search by name, department, or unit"
                    prefix={<SearchOutlined style={{ color: "#8c8c8c" }} />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ maxWidth: 320 }}
                />
                <Text type="secondary">
                    {filteredData.length} of {data.length} users
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
                        `${range[0]}-${range[1]} of ${total} users`,
                }}
                locale={{
                    emptyText: searchText
                        ? "No users match your search."
                        : "No users found.",
                }}
            />
        </Card>
    );
};

export default UserList;
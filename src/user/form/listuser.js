import React, { useMemo, useState, useEffect } from "react";
import {  useNavigate } from "react-router-dom";
import { Card, Table, Button, Tag, Space, Input, Typography, message } from "antd";
import { PlusOutlined, EditOutlined, SearchOutlined } from "@ant-design/icons";
import { GetAllUsers_API } from "../API/User.API";

const { Text } = Typography;

const UserList = () => {
    const navigate = useNavigate();
    const [searchText, setSearchText] = useState("");
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchUsers = async () => {
        const storedUser  = localStorage.getItem("user");
        if (!storedUser ) {
            message.error("ID not found");
            return;
        }
        setLoading(true);
        try {     
             const user = JSON.parse(storedUser);
           const apiPayload = {
            sys_user_id: user.id  
        };    
             const result = await GetAllUsers_API(apiPayload);
            if (result.success && result.data) {
                const formattedData = result.data.map((user, index) => ({
                     Id: user.Id, 
                    key: user.UserName || index,
                    userName: user.UserName,
                    fullName: user.FullName,
                    department: user.DepartmentName,
                    unit: user.UnitName,
                    CreatedBy:user.CreatedBy,
                    CreatedDate:user.CreatedDate,
                    LastLoginDate:user.LastLoginDate,
                    status: user.Status,
                    roles: user.Roles,
                }));
                setUsers(formattedData);
            }
        } catch (error) {
            console.error("Fetch Users Error:", error);
            message.error(error?.message || "Failed to load users");
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchUsers();
    }, []);

 
const columns = [   
    {
        title: "User Name",
        dataIndex: "userName",
        key: "userName",
        sorter: (a, b) => (a.userName || "").localeCompare(b.userName || ""),
        render: (value) => <Text strong>{value}</Text>,
    },
    {
        title: "Full Name",
        dataIndex: "fullName",
        key: "fullName",
        sorter: (a, b) => (a.fullName || "").localeCompare(b.fullName || ""),
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
        title: "Roles",
        dataIndex: "roles",
        key: "roles",
    },
    {
        title: "Created By",
        dataIndex: "CreatedBy",
        key: "CreatedBy",
    },
    {
        title: "Created Date",
        dataIndex: "CreatedDate",
        key: "CreatedDate",
    },
    {
        title: "Last Login Date",
        dataIndex: "LastLoginDate",
        key: "LastLoginDate",
    },
    {
        title: "Status",
        dataIndex: "status",
        key: "status",
        filters: [
            { text: "Active", value: "Active" },
            { text: "Inactive", value: "Inactive" },
        ],
        onFilter: (value, record) => record.status === value,
        render: (status) => (
            <Tag color={status === "Active" ? "success" : "error"}>
                {status}
            </Tag>
        ),
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
                    icon={<EditOutlined />}
                    title="Edit"
                    onClick={() => navigate(`edit/${record.Id}`)}  // ✅ uses hidden Id
                />
            </Space>
        ),
    },
];

  
    const filteredData = useMemo(() => {
        const query = searchText.trim().toLowerCase();
        if (!query) return users;
        return users.filter((user) =>
            [
                user.userName,
                user.fullName,
                user.department,
                user.unit,
                user.roles,
            ]
                .join(" ")
                .toLowerCase()
                .includes(query)
        );
    }, [searchText, users]);

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
                    {filteredData.length} of {users.length} users
                </Text>
            </Space>

            <Table
                columns={columns}
                dataSource={filteredData}
                rowKey="key"
                loading={loading}
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
import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    Card,
    Table,
    Button,
    Tag,
    Space,
    Input,
    Typography,
    Tabs,
    Select,
    Drawer,
    Descriptions,
    Divider,
    Steps,
    Badge,
    Tooltip,
} from "antd";
import {
    PlusOutlined,
    SearchOutlined,
    EyeOutlined,
    FileTextOutlined,
    SendOutlined,
    InboxOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
} from "@ant-design/icons";
import { getMemosApi } from "../API/memoservice";

const { Text, Title, Paragraph } = Typography;
const { Option } = Select;

const priorityColor = {
    Normal: "blue",
    Urgent: "volcano",
    High: "gold",
    Critical: "red",
    Pending: "orange",
};

const statusTag = (status) => {
    switch (status) {
        case "Approved":
            return <Tag color="success" icon={<CheckCircleOutlined />}>Approved</Tag>;
        case "Pending":
        case "Pending Approval":
            return <Tag color="warning" icon={<ClockCircleOutlined />}>Pending</Tag>;
        case "Ongoing":
            return <Tag color="processing">Ongoing</Tag>;
        case "Draft":
            return <Tag color="default">Draft</Tag>;
        case "Rejected":
            return <Tag color="error" icon={<CloseCircleOutlined />}>Rejected</Tag>;
        default:
            return <Tag>{status}</Tag>;
    }
};

const MemoList = ({ mode = "inbox" }) => {
    const navigate = useNavigate();
    const location = useLocation();

    // Determine active tab from route or prop
    const isSent = location.pathname.includes("/sent") || mode === "sent";
    const [activeTab, setActiveTab] = useState(isSent ? "sent" : "inbox");
    const [searchText, setSearchText] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [selectedMemo, setSelectedMemo] = useState(null);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [memos, setMemos] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchMemos = async () => {
            try {
                setLoading(true);
                const data = await getMemosApi();
                setMemos(data || []);
            } catch (err) {
                console.error("Failed to load memos:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchMemos();
    }, []);

    const allMemos = memos;

    const handleTabChange = (key) => {
        setActiveTab(key);
        if (key === "inbox") {
            navigate("/memo/inbox");
        } else {
            navigate("/memo/sent");
        }
    };

    const filteredData = useMemo(() => {
        return allMemos.filter((item) => {
            const matchesType = activeTab === "sent" ? item.type === "sent" || item.senderEmail === "kriman@gmail.com" : item.type !== "sent";
            const matchesSearch =
                item.subject.toLowerCase().includes(searchText.toLowerCase()) ||
                item.referenceNo.toLowerCase().includes(searchText.toLowerCase()) ||
                item.department.toLowerCase().includes(searchText.toLowerCase()) ||
                (item.sender && item.sender.toLowerCase().includes(searchText.toLowerCase()));
            const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;

            return matchesType && matchesSearch && matchesStatus;
        });
    }, [allMemos, activeTab, searchText, statusFilter]);

    const handleViewMemo = (record) => {
        setSelectedMemo(record);
        setDrawerVisible(true);
    };

    const columns = [
        {
            title: "Reference No.",
            dataIndex: "referenceNo",
            key: "referenceNo",
            width: 170,
            render: (ref) => <Text strong style={{ color: "#01519b" }}>{ref}</Text>,
        },
        {
            title: "Subject",
            dataIndex: "subject",
            key: "subject",
            render: (text, record) => (
                <div>
                    <Text strong style={{ display: "block" }}>{text}</Text>
                    <Space size={4} style={{ marginTop: 2 }}>
                        <Tag color="cyan" style={{ fontSize: 11 }}>{record.category}</Tag>
                        {record.attachmentsCount > 0 && (
                            <Tag style={{ fontSize: 11 }}>📎 {record.attachmentsCount}</Tag>
                        )}
                    </Space>
                </div>
            ),
        },
        {
            title: "Department",
            dataIndex: "department",
            key: "department",
            width: 180,
        },
        {
            title: activeTab === "inbox" ? "Originator" : "Approver",
            key: "person",
            width: 170,
            render: (_, record) => (
                <Text>{activeTab === "inbox" ? record.sender : record.approver}</Text>
            ),
        },
        {
            title: "Priority",
            dataIndex: "priority",
            key: "priority",
            width: 110,
            render: (p) => <Tag color={priorityColor[p] || "default"}>{p}</Tag>,
        },
        {
            title: "Date",
            dataIndex: "createdDate",
            key: "createdDate",
            width: 120,
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            width: 150,
            render: (status) => statusTag(status),
        },
        {
            title: "Action",
            key: "action",
            width: 90,
            align: "center",
            render: (_, record) => (
                <Tooltip title="View Memo Details">
                    <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewMemo(record)}
                    />
                </Tooltip>
            ),
        },
    ];

    return (
        <Card
            title={
                <Space>
                    <FileTextOutlined style={{ color: "#01519b", fontSize: 20 }} />
                    <Text strong style={{ fontSize: 18, color: "#0a1a5c" }}>
                        Internal Memos & Requisitions
                    </Text>
                </Space>
            }
            extra={
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => navigate("/memo/create")}
                >
                    Create Memo
                </Button>
            }
            style={{ borderRadius: 8, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
        >
            {/* Tabs for Inbox & Sent */}
            <Tabs
                activeKey={activeTab}
                onChange={handleTabChange}
                items={[
                    {
                        key: "inbox",
                        label: (
                            <span>
                                <InboxOutlined /> Inbox{" "}
                                <Badge
                                    count={allMemos.filter((m) => m.type !== "sent" && m.status === "Pending Approval").length}
                                    style={{ backgroundColor: "#01519b", marginLeft: 4 }}
                                />
                            </span>
                        ),
                    },
                    {
                        key: "sent",
                        label: (
                            <span>
                                <SendOutlined /> Sent Memos
                            </span>
                        ),
                    },
                ]}
            />

            {/* Filter and Search Bar */}
            <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                <Space wrap>
                    <Input
                        placeholder="Search by subject, ref, department..."
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        style={{ width: 280 }}
                        allowClear
                    />
                    <Select
                        value={statusFilter}
                        onChange={setStatusFilter}
                        style={{ width: 180 }}
                    >
                        <Option value="ALL">All Statuses</Option>
                        <Option value="Pending Approval">Pending Approval</Option>
                        <Option value="Approved">Approved</Option>
                        <Option value="Draft">Draft</Option>
                        <Option value="Rejected">Rejected</Option>
                    </Select>
                </Space>
                <div>
                    <Text type="secondary">Total: {filteredData.length} records</Text>
                </div>
            </div>

            {/* Memo Records Table */}
            <Table
                loading={loading}
                columns={columns}
                dataSource={filteredData}
                pagination={{ pageSize: 8, showSizeChanger: false }}
                bordered
                size="middle"
            />

            {/* Detail Drawer */}
            <Drawer
                title={
                    <Space>
                        <FileTextOutlined style={{ color: "#01519b" }} />
                        <span>{selectedMemo?.referenceNo}</span>
                        {selectedMemo && statusTag(selectedMemo.status)}
                    </Space>
                }
                width={640}
                open={drawerVisible}
                onClose={() => setDrawerVisible(false)}
            >
                {selectedMemo && (
                    <div>
                        <Title level={5} style={{ color: "#0a1a5c", marginTop: 0 }}>
                            {selectedMemo.subject}
                        </Title>

                        <Descriptions bordered column={2} size="small" style={{ marginBottom: 20 }}>
                            <Descriptions.Item label="Category">{selectedMemo.category}</Descriptions.Item>
                            <Descriptions.Item label="Priority">
                                <Tag color={priorityColor[selectedMemo.priority]}>
                                    {selectedMemo.priority}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Department">{selectedMemo.department}</Descriptions.Item>
                            <Descriptions.Item label="Date">{selectedMemo.createdDate}</Descriptions.Item>
                            <Descriptions.Item label="Originator">{selectedMemo.sender}</Descriptions.Item>
                            <Descriptions.Item label="Approver">{selectedMemo.approver}</Descriptions.Item>
                            {selectedMemo.amount && (
                                <Descriptions.Item label="Estimated Amount" span={2}>
                                    <Text strong style={{ color: "#1a6fc9" }}>
                                        NPR {selectedMemo.amount.toLocaleString()}
                                    </Text>
                                </Descriptions.Item>
                            )}
                        </Descriptions>

                        <Divider orientation="left">Memo Body</Divider>
                        <Paragraph style={{ whiteSpace: "pre-wrap", background: "#f9fafb", padding: 16, borderRadius: 6, lineHeight: 1.6 }}>
                            {selectedMemo.content}
                        </Paragraph>

                        <Divider orientation="left">Approval Workflow</Divider>
                        <Steps
                            direction="vertical"
                            size="small"
                            current={selectedMemo.status === "Approved" ? 2 : selectedMemo.status === "Rejected" ? 1 : 1}
                            status={selectedMemo.status === "Rejected" ? "error" : "process"}
                            items={[
                                {
                                    title: "Memo Initiated",
                                    description: `${selectedMemo.sender} (${selectedMemo.createdDate})`,
                                },
                                {
                                    title: "Department Approval",
                                    description:
                                        selectedMemo.status === "Approved"
                                            ? `Approved by ${selectedMemo.approver}`
                                            : selectedMemo.status === "Pending Approval"
                                            ? `Awaiting sign-off by ${selectedMemo.approver}`
                                            : "Draft stage",
                                },
                                {
                                    title: "Final Execution & Dispatch",
                                    description: selectedMemo.status === "Approved" ? "Completed" : "Pending prior approval",
                                },
                            ]}
                        />
                    </div>
                )}
            </Drawer>
        </Card>
    );
};

export default MemoList;

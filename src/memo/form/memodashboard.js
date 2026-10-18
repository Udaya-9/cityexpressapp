import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Row,
    Col,
    Button,
    Space,
    Input,
    Select,
    Typography,
    Drawer,
    Descriptions,
    Divider,
    Steps,
    Avatar,
    Tag,
    message,
    Empty,
    Spin,
} from "antd";
import {
    PlusOutlined,
    SearchOutlined,
    CheckOutlined,
    CloseOutlined,
    SyncOutlined,
    FileTextOutlined,
    ReloadOutlined,
} from "@ant-design/icons";
import { getMemosApi, updateMemoStatusApi } from "../API/memoservice";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const COLUMNS = [
    {
        id: "Pending",
        title: "Pending",
        dotColor: "#f59e0b",
        badgeBg: "#fef3c7",
        badgeColor: "#92400e",
    },
    {
        id: "Ongoing",
        title: "Ongoing",
        dotColor: "#3b82f6",
        badgeBg: "#dbeafe",
        badgeColor: "#1e40af",
    },
    {
        id: "Approved",
        title: "Approved",
        dotColor: "#10b981",
        badgeBg: "#d1fae5",
        badgeColor: "#065f46",
    },
    {
        id: "Rejected",
        title: "Rejected",
        dotColor: "#ef4444",
        badgeBg: "#fee2e2",
        badgeColor: "#991b1b",
    },
];

const priorityDot = {
    Critical: "#dc2626",
    Urgent: "#ea580c",
    High: "#d97706",
    Normal: "#94a3b8",
};

const MemoDashboard = () => {
    const navigate = useNavigate();

    const [memos, setMemos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [selectedDept, setSelectedDept] = useState("ALL");
    const [selectedMemo, setSelectedMemo] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    const fetchMemos = async () => {
        try {
            setLoading(true);
            const data = await getMemosApi();
            setMemos(data || []);
        } catch (err) {
            message.error("Failed to load memos from server");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMemos();
    }, []);

    const filteredMemos = useMemo(() => {
        return memos.filter((m) => {
            const matchesSearch =
                (m.subject || "").toLowerCase().includes(searchText.toLowerCase()) ||
                (m.referenceNo || "").toLowerCase().includes(searchText.toLowerCase()) ||
                (m.originator || "").toLowerCase().includes(searchText.toLowerCase());
            const matchesDept = selectedDept === "ALL" || m.department === selectedDept;
            return matchesSearch && matchesDept;
        });
    }, [memos, searchText, selectedDept]);

    const handleUpdateStatus = async (key, newStatus) => {
        try {
            await updateMemoStatusApi(key, newStatus);
            setMemos((prev) =>
                prev.map((item) =>
                    item.key === key
                        ? {
                              ...item,
                              status: newStatus,
                              stepIndex: newStatus === "Approved" ? 3 : newStatus === "Ongoing" ? 2 : 1,
                          }
                        : item
                )
            );
            message.success(`Moved to ${newStatus}`);
            if (selectedMemo && selectedMemo.key === key) {
                setSelectedMemo((prev) => ({ ...prev, status: newStatus }));
            }
        } catch (err) {
            message.error("Failed to update status on server");
        }
    };

    const openDetails = (memo) => {
        setSelectedMemo(memo);
        setDrawerOpen(true);
    };

    return (
        <div style={{ padding: "8px 4px" }}>
            {/* Minimal Header */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 12,
                    marginBottom: 20,
                }}
            >
                <div>
                    <Title level={4} style={{ margin: 0, color: "#0f172a", fontWeight: 600 }}>
                        Memo Board
                    </Title>
                    <Text style={{ fontSize: 13, color: "#64748b" }}>
                        Overview of pending, ongoing, and completed memos
                    </Text>
                </div>

                <Space size={10} wrap>
                    <Input
                        placeholder="Search memos..."
                        prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        style={{ width: 200, borderRadius: 6 }}
                        allowClear
                    />
                    <Select
                        value={selectedDept}
                        onChange={setSelectedDept}
                        style={{ width: 140 }}
                    >
                        <Option value="ALL">All Depts</Option>
                        <Option value="IT">IT</Option>
                        <Option value="HR">HR</Option>
                        <Option value="Operations">Operations</Option>
                        <Option value="Administration">Administration</Option>
                        <Option value="Marketing">Marketing</Option>
                    </Select>
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={fetchMemos}
                        loading={loading}
                        style={{ borderRadius: 6 }}
                        title="Refresh from DB"
                    />
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => navigate("/memo/create")}
                        style={{ borderRadius: 6 }}
                    >
                        New Memo
                    </Button>
                </Space>
            </div>

            {/* Minimal Kanban Columns */}
            <Spin spinning={loading}>
                <Row gutter={[16, 16]}>
                    {COLUMNS.map((col) => {
                        const colItems = filteredMemos.filter((m) => m.status === col.id);

                        return (
                            <Col xs={24} sm={12} lg={6} key={col.id}>
                                <div
                                    style={{
                                        background: "#f8fafc",
                                        borderRadius: 10,
                                        border: "1px solid #e2e8f0",
                                        padding: "12px 10px",
                                        minHeight: "calc(100vh - 210px)",
                                        display: "flex",
                                        flexDirection: "column",
                                    }}
                                >
                                    {/* Column Header */}
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            padding: "4px 6px 12px",
                                        }}
                                    >
                                        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                                            <span
                                                style={{
                                                    width: 8,
                                                    height: 8,
                                                    borderRadius: "50%",
                                                    background: col.dotColor,
                                                    display: "inline-block",
                                                }}
                                            />
                                            <span style={{ fontSize: 13.5, fontWeight: 600, color: "#1e293b" }}>
                                                {col.title}
                                            </span>
                                        </div>
                                        <span
                                            style={{
                                                fontSize: 12,
                                                fontWeight: 600,
                                                color: col.badgeColor,
                                                background: col.badgeBg,
                                                padding: "1px 8px",
                                                borderRadius: 12,
                                            }}
                                        >
                                            {colItems.length}
                                        </span>
                                    </div>

                                    {/* Cards List */}
                                    <div style={{ flex: 1, overflowY: "auto", padding: "2px 2px" }}>
                                        {colItems.length > 0 ? (
                                            colItems.map((memo) => (
                                                <div
                                                    key={memo.key}
                                                    onClick={() => openDetails(memo)}
                                                    style={{
                                                        background: "#ffffff",
                                                        borderRadius: 8,
                                                        border: "1px solid #e2e8f0",
                                                        padding: "12px 14px",
                                                        marginBottom: 10,
                                                        boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                                                        cursor: "pointer",
                                                        transition: "transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease",
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.borderColor = "#cbd5e1";
                                                        e.currentTarget.style.boxShadow = "0 3px 8px rgba(0,0,0,0.06)";
                                                        e.currentTarget.style.transform = "translateY(-1px)";
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.borderColor = "#e2e8f0";
                                                        e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.03)";
                                                        e.currentTarget.style.transform = "translateY(0)";
                                                    }}
                                                >
                                                    {/* Ref & Priority Dot */}
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            justifyContent: "space-between",
                                                            alignItems: "center",
                                                            marginBottom: 6,
                                                        }}
                                                    >
                                                        <span style={{ fontSize: 11.5, color: "#64748b", fontFamily: "monospace" }}>
                                                            {memo.referenceNo}
                                                        </span>
                                                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, color: "#64748b" }}>
                                                            <span
                                                                style={{
                                                                    width: 6,
                                                                    height: 6,
                                                                    borderRadius: "50%",
                                                                    background: priorityDot[memo.priority] || "#94a3b8",
                                                                }}
                                                            />
                                                            {memo.priority}
                                                        </span>
                                                    </div>

                                                    {/* Subject */}
                                                    <div
                                                        style={{
                                                            fontSize: 13,
                                                            fontWeight: 500,
                                                            color: "#0f172a",
                                                            lineHeight: 1.4,
                                                            marginBottom: 10,
                                                        }}
                                                    >
                                                        {memo.subject}
                                                    </div>

                                                    {/* Card Footer: Dept + Originator & Date */}
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            justifyContent: "space-between",
                                                            alignItems: "center",
                                                            paddingTop: 8,
                                                            borderTop: "1px solid #f1f5f9",
                                                        }}
                                                    >
                                                        <span
                                                            style={{
                                                                fontSize: 11,
                                                                color: "#475569",
                                                                background: "#f1f5f9",
                                                                padding: "1px 6px",
                                                                borderRadius: 4,
                                                            }}
                                                        >
                                                            {memo.department}
                                                        </span>

                                                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                                            <Avatar
                                                                size={18}
                                                                style={{
                                                                    fontSize: 9,
                                                                    background: "#01519b",
                                                                }}
                                                            >
                                                                {memo.originatorInitials}
                                                            </Avatar>
                                                            <span style={{ fontSize: 11, color: "#94a3b8" }}>
                                                                {(memo.createdDate || "").slice(5)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <Empty
                                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                                description={
                                                    <span style={{ fontSize: 11.5, color: "#94a3b8" }}>
                                                        Empty
                                                    </span>
                                                }
                                                style={{ margin: "40px 0" }}
                                            />
                                        )}
                                    </div>
                                </div>
                            </Col>
                        );
                    })}
                </Row>
            </Spin>

            {/* Clean Detail Drawer */}
            <Drawer
                title={
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <FileTextOutlined style={{ color: "#01519b" }} />
                        <span style={{ fontSize: 15, fontWeight: 600 }}>{selectedMemo?.referenceNo}</span>
                        {selectedMemo && (
                            <Tag
                                color={
                                    selectedMemo.status === "Approved"
                                        ? "success"
                                        : selectedMemo.status === "Ongoing"
                                        ? "processing"
                                        : selectedMemo.status === "Rejected"
                                        ? "error"
                                        : "warning"
                                }
                                style={{ marginLeft: 4 }}
                            >
                                {selectedMemo.status}
                            </Tag>
                        )}
                    </div>
                }
                width={560}
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                extra={
                    selectedMemo && (
                        <Space>
                            {selectedMemo.status === "Pending" && (
                                <Button
                                    size="small"
                                    icon={<SyncOutlined />}
                                    onClick={() => handleUpdateStatus(selectedMemo.key, "Ongoing")}
                                >
                                    Start Review
                                </Button>
                            )}
                            {selectedMemo.status !== "Approved" && (
                                <Button
                                    size="small"
                                    type="primary"
                                    icon={<CheckOutlined />}
                                    onClick={() => handleUpdateStatus(selectedMemo.key, "Approved")}
                                >
                                    Approve
                                </Button>
                            )}
                            {selectedMemo.status !== "Rejected" && (
                                <Button
                                    size="small"
                                    danger
                                    icon={<CloseOutlined />}
                                    onClick={() => handleUpdateStatus(selectedMemo.key, "Rejected")}
                                >
                                    Reject
                                </Button>
                            )}
                        </Space>
                    )
                }
            >
                {selectedMemo && (
                    <div>
                        <div style={{ fontSize: 16, fontWeight: 600, color: "#0f172a", marginBottom: 16, lineHeight: 1.4 }}>
                            {selectedMemo.subject}
                        </div>

                        <Descriptions column={2} size="small" bordered style={{ marginBottom: 20 }}>
                            <Descriptions.Item label="Category">{selectedMemo.category}</Descriptions.Item>
                            <Descriptions.Item label="Priority">{selectedMemo.priority}</Descriptions.Item>
                            <Descriptions.Item label="Department">{selectedMemo.department}</Descriptions.Item>
                            <Descriptions.Item label="Date">{selectedMemo.createdDate}</Descriptions.Item>
                            <Descriptions.Item label="Originator">{selectedMemo.originator}</Descriptions.Item>
                            <Descriptions.Item label="Approver">{selectedMemo.approver}</Descriptions.Item>
                            {selectedMemo.amount && (
                                <Descriptions.Item label="Estimated Amount" span={2}>
                                    <Text strong style={{ color: "#01519b" }}>
                                        NPR {Number(selectedMemo.amount).toLocaleString()}
                                    </Text>
                                </Descriptions.Item>
                            )}
                        </Descriptions>

                        <Divider orientation="left" style={{ fontSize: 13, color: "#64748b" }}>
                            Description
                        </Divider>
                        <Paragraph
                            style={{
                                whiteSpace: "pre-wrap",
                                background: "#f8fafc",
                                padding: 14,
                                borderRadius: 6,
                                color: "#334155",
                                lineHeight: 1.6,
                                fontSize: 13,
                                border: "1px solid #e2e8f0",
                            }}
                        >
                            {selectedMemo.content}
                        </Paragraph>

                        <Divider orientation="left" style={{ fontSize: 13, color: "#64748b" }}>
                            Workflow Status
                        </Divider>
                        <Steps
                            direction="vertical"
                            size="small"
                            current={selectedMemo.stepIndex || 1}
                            status={selectedMemo.status === "Rejected" ? "error" : "process"}
                            items={[
                                {
                                    title: "Submitted",
                                    description: `${selectedMemo.originator} on ${selectedMemo.createdDate}`,
                                },
                                {
                                    title: "Department Review",
                                    description:
                                        selectedMemo.status === "Approved"
                                            ? `Approved by ${selectedMemo.approver}`
                                            : selectedMemo.status === "Ongoing"
                                            ? `In review by ${selectedMemo.approver}`
                                            : selectedMemo.status === "Rejected"
                                            ? "Review returned with rejection"
                                            : `Awaiting ${selectedMemo.approver}`,
                                },
                                {
                                    title: "Execution & Record",
                                    description: selectedMemo.status === "Approved" ? "Recorded" : "Pending approval",
                                },
                            ]}
                        />
                    </div>
                )}
            </Drawer>
        </div>
    );
};

export default MemoDashboard;

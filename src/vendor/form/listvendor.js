import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Button, Space, Input, Typography, Tooltip, Empty } from "antd";
import {
    PlusOutlined,
    EditOutlined,
    EyeOutlined,
    SearchOutlined,
    CloseCircleOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

// Same tokens as the Dashboard shell
const C = {
    navy: "#0B2545",
    brand: "#1F6FEB",
    brandSoft: "#EAF2FF",
    accent: "#6FB1FF",
    page: "#F2F5FA",
    border: "#E3E8F0",
    text: "#16202F",
    muted: "#667085",
    success: "#12805C",
    successSoft: "#E6F6EF",
    neutralSoft: "#EEF1F6",
};

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
    {
        key: 4,
        vendorName: "Everest Hardware",
        contactPerson: "Bikash Rai",
        address: "Lalitpur, Nepal",
        mobileNo: "9812345678",
        phoneNo: "01-5566778",
        email: "sales@everesthardware.com",
        panVat: "321654987",
        registrationNo: "REG-004",
        isActive: true,
    },
    {
        key: 5,
        vendorName: "Himalayan Office Supplies",
        contactPerson: "Anita Karki",
        address: "Bhaktapur, Nepal",
        mobileNo: "9856781234",
        phoneNo: "01-6677889",
        email: "orders@himalayanoffice.com",
        panVat: "789123456",
        registrationNo: "REG-005",
        isActive: false,
    },
];

const initials = (name) =>
    name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0].toUpperCase())
        .join("");

const VendorList = () => {
    const navigate = useNavigate();
    const [searchText, setSearchText] = useState("");
    const [status, setStatus] = useState("all");

    // Counts per status (based on full data, not filtered)
    const counts = useMemo(
        () => ({
            all: data.length,
            active: data.filter((v) => v.isActive).length,
            inactive: data.filter((v) => !v.isActive).length,
        }),
        []
    );

    // Filter: apply search + status together so search works in every tab
    const filteredData = useMemo(() => {
        const query = searchText.trim().toLowerCase();
        return data.filter((vendor) => {
            // Status filter
            if (status === "active" && !vendor.isActive) return false;
            if (status === "inactive" && vendor.isActive) return false;

            // Search filter (applies across all tabs)
            if (!query) return true;
            return [
                vendor.vendorName,
                vendor.contactPerson,
                vendor.address,
                vendor.mobileNo,
                vendor.phoneNo,
                vendor.email,
                vendor.panVat,
                vendor.registrationNo,
            ]
                .join(" ")
                .toLowerCase()
                .includes(query);
        });
    }, [searchText, status]);

    // Counts for the currently visible tabs based on search
    const searchCounts = useMemo(() => {
        const query = searchText.trim().toLowerCase();
        const matchesSearch = (vendor) => {
            if (!query) return true;
            return [
                vendor.vendorName,
                vendor.contactPerson,
                vendor.address,
                vendor.mobileNo,
                vendor.phoneNo,
                vendor.email,
                vendor.panVat,
                vendor.registrationNo,
            ]
                .join(" ")
                .toLowerCase()
                .includes(query);
        };
        const searched = data.filter(matchesSearch);
        return {
            all: searched.length,
            active: searched.filter((v) => v.isActive).length,
            inactive: searched.filter((v) => !v.isActive).length,
        };
    }, [searchText]);

    const columns = [
        {
            title: "Vendor",
            dataIndex: "vendorName",
            key: "vendorName",
            fixed: "left",
            width: 300,
            sorter: (a, b) => a.vendorName.localeCompare(b.vendorName),
            render: (value, record) => (
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div className="vl-avatar">{initials(value)}</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <Text strong style={{ color: C.text, fontSize: 14 }}>
                            {value}
                        </Text>
                        <Text style={{ color: C.muted, fontSize: 12 }}>
                            {record.registrationNo}
                        </Text>
                    </div>
                </div>
            ),
        },
        {
            title: "Contact Person",
            dataIndex: "contactPerson",
            key: "contactPerson",
            width: 160,
            sorter: (a, b) => a.contactPerson.localeCompare(b.contactPerson),
        },
        {
            title: "Contact Details",
            key: "contactDetails",
            width: 240,
            render: (_, record) => (
                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    <Text style={{ color: C.text, fontSize: 13 }}>
                        {record.mobileNo}
                    </Text>
                    <Text style={{ color: C.muted, fontSize: 12 }}>
                        {record.phoneNo}
                    </Text>
                </div>
            ),
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
            width: 240,
            render: (v) => (
                <Text style={{ color: C.brand, fontSize: 13 }}>{v}</Text>
            ),
        },
        {
            title: "Address",
            dataIndex: "address",
            key: "address",
            width: 180,
        },
        {
            title: "PAN/VAT",
            dataIndex: "panVat",
            key: "panVat",
            width: 140,
        },
        {
            title: "Status",
            key: "status",
            width: 130,
            render: (_, record) => (
                <span
                    className={`vl-status ${
                        record.isActive ? "vl-status-on" : "vl-status-off"
                    }`}
                >
                    <i />
                    {record.isActive ? "Active" : "Inactive"}
                </span>
            ),
        },
        {
            title: "Action",
            key: "action",
            fixed: "right",
            width: 120,
            render: () => (
                <Space size={8}>
                    <Tooltip title="View">
                        <Button
                            className="vl-action"
                            icon={<EyeOutlined />}
                            aria-label="View"
                        />
                    </Tooltip>
                    <Tooltip title="Edit">
                        <Button
                            className="vl-action"
                            icon={<EditOutlined />}
                            aria-label="Edit"
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    const tabs = [
        { key: "all", label: "All" },
        { key: "active", label: "Active" },
        { key: "inactive", label: "Inactive" },
    ];

    const hasSearch = searchText.trim().length > 0;

    return (
        <div className="vl">
            {/* ================= Page header ================= */}
            <div className="vl-header">
                <div>
                    <Text className="vl-title">Vendors</Text>
                    <Text className="vl-subtitle">
                        Manage vendor records, contacts and status
                    </Text>
                </div>

                <Button
                    type="primary"
                    size="large"
                    icon={<PlusOutlined />}
                    className="vl-create"
                    onClick={() => navigate("create")}
                >
                    Create New Vendor
                </Button>
            </div>

            {/* ================= Toolbar ================= */}
            <div className="vl-toolbar">
                <div className="vl-tabs" role="tablist" aria-label="Filter by status">
                    {tabs.map((t) => (
                        <button
                            key={t.key}
                            type="button"
                            role="tab"
                            aria-selected={status === t.key}
                            className={`vl-tab ${status === t.key ? "is-active" : ""}`}
                            onClick={() => setStatus(t.key)}
                        >
                            {t.label}
                            <span className="vl-count">{searchCounts[t.key]}</span>
                        </button>
                    ))}
                </div>

                <div className="vl-search-wrap">
                    <Input
                        allowClear
                        className="vl-search"
                        placeholder="Search by name, contact, email, PAN/VAT…"
                        prefix={<SearchOutlined style={{ color: "#98A2B3" }} />}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                    {hasSearch && (
                        <div className="vl-search-hint">
                            <SearchOutlined />
                            <span>
                                Showing <b>{filteredData.length}</b> result
                                {filteredData.length === 1 ? "" : "s"} for{" "}
                                <b>"{searchText}"</b>
                                {status !== "all" && (
                                    <> in <b>{status}</b></>
                                )}
                            </span>
                            <button
                                type="button"
                                className="vl-search-clear"
                                onClick={() => setSearchText("")}
                            >
                                <CloseCircleOutlined /> Clear
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <Table
                className="vl-table"
                columns={columns}
                dataSource={filteredData}
                rowKey="key"
                scroll={{ x: 1500 }}
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    pageSizeOptions: ["10", "20", "50", "100"],
                    showTotal: (total, range) =>
                        `${range[0]}-${range[1]} of ${total} vendors`,
                }}
                locale={{
                    emptyText: (
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={
                                <span style={{ color: C.muted }}>
                                    {hasSearch
                                        ? `No vendors match "${searchText}"${
                                              status !== "all"
                                                  ? ` in ${status}`
                                                  : ""
                                          }.`
                                        : "No vendors found."}
                                </span>
                            }
                        />
                    ),
                }}
            />

            <style>{`
                /* ---------- No motion ---------- */
                .vl *, .vl *::before, .vl *::after {
                    transition: none !important;
                    animation: none !important;
                }

                /* ---------- Page header ---------- */
                .vl-header {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    gap: 16px;
                    flex-wrap: wrap;
                    margin-bottom: 20px;
                }
                .vl-title {
                    display: block;
                    font-size: 22px;
                    font-weight: 700;
                    color: ${C.navy};
                    letter-spacing: -0.2px;
                }
                .vl-subtitle {
                    display: block;
                    margin-top: 4px;
                    font-size: 13.5px;
                    color: ${C.muted};
                }

                /* ---------- Toolbar ---------- */
                .vl-toolbar {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 16px;
                    flex-wrap: wrap;
                    padding: 14px 16px;
                    margin-bottom: 20px;
                    background: #fff;
                    border: 1px solid ${C.border};
                    border-radius: 14px;
                }

                /* ---------- Status tabs ---------- */
                .vl-tabs {
                    display: inline-flex;
                    padding: 4px;
                    gap: 2px;
                    border-radius: 12px;
                    background: ${C.page};
                    border: 1px solid ${C.border};
                }
                .vl-tab {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 7px 14px;
                    border: none;
                    border-radius: 9px;
                    background: transparent;
                    color: ${C.muted};
                    font: inherit;
                    font-size: 13.5px;
                    font-weight: 600;
                    cursor: pointer;
                }
                .vl-tab:hover { color: ${C.text}; }
                .vl-tab.is-active {
                    background: ${C.navy};
                    color: #fff;
                }
                .vl-tab:focus-visible {
                    outline: 2px solid ${C.brand};
                    outline-offset: 2px;
                }
                .vl-count {
                    min-width: 22px;
                    padding: 0 6px;
                    border-radius: 20px;
                    font-size: 12px;
                    line-height: 20px;
                    text-align: center;
                    background: rgba(102, 112, 133, 0.14);
                }
                .vl-tab.is-active .vl-count {
                    background: rgba(255, 255, 255, 0.2);
                }

                /* ---------- Search ---------- */
                .vl-search-wrap {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    flex: 1 1 340px;
                    max-width: 460px;
                    margin-left: auto;
                }
                .vl-search.ant-input-affix-wrapper {
                    height: 42px;
                    border-radius: 10px;
                    background: ${C.page};
                    border-color: ${C.border};
                    box-shadow: none;
                    width: 100%;
                }
                .vl-search.ant-input-affix-wrapper:hover {
                    border-color: #C5CFDE;
                }
                .vl-search.ant-input-affix-wrapper-focused {
                    background: #fff;
                    border-color: ${C.brand};
                    box-shadow: 0 0 0 3px rgba(31, 111, 235, 0.14);
                }
                .vl-search input { background: transparent; }

                .vl-search-hint {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 12.5px;
                    color: ${C.muted};
                    padding: 0 4px;
                }
                .vl-search-hint b { color: ${C.text}; }
                .vl-search-clear {
                    margin-left: auto;
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    border: none;
                    background: transparent;
                    color: ${C.brand};
                    font: inherit;
                    font-size: 12.5px;
                    font-weight: 600;
                    cursor: pointer;
                    padding: 2px 6px;
                    border-radius: 6px;
                }
                .vl-search-clear:hover {
                    background: ${C.brandSoft};
                }

                /* ---------- Create button ---------- */
                .vl-create.ant-btn {
                    height: 42px;
                    border-radius: 10px;
                    font-weight: 600;
                    background: ${C.brand};
                    box-shadow: 0 8px 18px -8px rgba(31, 111, 235, 0.7);
                }
                .vl-create.ant-btn:hover { background: #1A5FCC !important; }

                /* ---------- Table ---------- */
                .vl-table .ant-table { background: transparent; color: ${C.text}; }
                .vl-table .ant-table-container {
                    border: 1px solid ${C.border};
                    border-radius: 14px;
                    overflow: hidden;
                }
                .vl-table .ant-table-thead > tr > th {
                    background: ${C.page};
                    color: ${C.muted};
                    font-size: 13px;
                    font-weight: 600;
                    padding: 14px 16px;
                    border-bottom: 1px solid ${C.border};
                }
                .vl-table .ant-table-thead > tr > th::before {
                    display: none !important;
                }
                .vl-table .ant-table-tbody > tr > td {
                    padding: 14px 16px;
                    border-bottom: 1px solid #EEF2F7;
                }
                .vl-table .ant-table-tbody > tr:last-child > td {
                    border-bottom: none;
                }
                .vl-table .ant-table-tbody > tr:hover > td {
                    background: #F7FAFF !important;
                }
                .vl-table .ant-table-column-sorter-up.active,
                .vl-table .ant-table-column-sorter-down.active {
                    color: ${C.brand};
                }
                .vl-table .ant-table-cell-fix-left,
                .vl-table .ant-table-cell-fix-right {
                    background: #fff;
                }
                .vl-table .ant-table-thead .ant-table-cell-fix-left,
                .vl-table .ant-table-thead .ant-table-cell-fix-right {
                    background: ${C.page};
                }

                /* ---------- Avatar tile ---------- */
                .vl-avatar {
                    width: 38px;
                    height: 38px;
                    flex-shrink: 0;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 13px;
                    font-weight: 700;
                    color: ${C.brand};
                    background: ${C.brandSoft};
                }

                /* ---------- Status ---------- */
                .vl-status {
                    display: inline-flex;
                    align-items: center;
                    gap: 7px;
                    padding: 4px 12px 4px 10px;
                    border-radius: 20px;
                    font-size: 12.5px;
                    font-weight: 600;
                }
                .vl-status i {
                    width: 7px;
                    height: 7px;
                    border-radius: 50%;
                    background: currentColor;
                }
                .vl-status-on { color: ${C.success}; background: ${C.successSoft}; }
                .vl-status-off { color: ${C.muted}; background: ${C.neutralSoft}; }

                /* ---------- Row actions ---------- */
                .vl-action.ant-btn {
                    width: 34px;
                    height: 34px;
                    padding: 0;
                    border-radius: 9px;
                    color: ${C.muted};
                    background: #fff;
                    border: 1px solid ${C.border};
                    box-shadow: none;
                }
                .vl-action.ant-btn:hover {
                    color: ${C.brand} !important;
                    background: ${C.brandSoft} !important;
                    border-color: #C9DDFB !important;
                }

                /* ---------- Pagination ---------- */
                .vl .ant-pagination { margin: 20px 0 0 !important; }
                .vl .ant-pagination-item {
                    border-radius: 9px;
                    border-color: ${C.border};
                }
                .vl .ant-pagination-item-active {
                    background: ${C.navy};
                    border-color: ${C.navy};
                }
                .vl .ant-pagination-item-active a { color: #fff; }
                .vl .ant-pagination-prev .ant-pagination-item-link,
                .vl .ant-pagination-next .ant-pagination-item-link {
                    border-radius: 9px;
                }
            `}</style>
        </div>
    );
};

export default VendorList;
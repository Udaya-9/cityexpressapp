import React, { useState, useEffect, useRef } from "react";
import {
    Modal,
    Form,
    Select,
    Input,
    InputNumber,
    Button,
    Table,
    Typography,
    message,
    Divider,
} from "antd";
import { PlusOutlined, DeleteOutlined, SaveOutlined } from "@ant-design/icons";

const { Text } = Typography;

// Corporate Palette
const C = {
    blue: '#0B3D91',
    blueSoft: '#EAF1FC',
    red: '#D6212F',
    redSoft: '#FDECEE',
    white: '#FFFFFF',
    ink: '#16233F',
    border: '#E3E9F3',
};

const RequisitionModal = ({ visible, onClose, onSuccess }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [itemsList, setItemsList] = useState([]);
    
    const requirementInputRef = useRef(null);

    const requestTypes = [
        { value: "22ADB7F7-2DF5-45D7-B041-3431EDBF797B", label: "Stationery" },
        { value: "33BDB7F7-2DF5-45D7-B041-3431EDBF797C", label: "IT Equipment" },
        { value: "44CDB7F7-2DF5-45D7-B041-3431EDBF797D", label: "Furniture" },
    ];

    useEffect(() => {
        if (visible) {
            form.resetFields();
            setItemsList([]);
        }
    }, [visible, form]);

    const handleAddItem = async () => {
        try {
            const values = await form.validateFields(["RequestType", "Requirement", "Quantity"]);
            
            const currentBrand = form.getFieldValue("Brand");
            const currentRemarks = form.getFieldValue("Remarks");
            const typeLabel = requestTypes.find(t => t.value === values.RequestType)?.label || values.RequestType;

            const newItem = {
                RequestType: typeLabel,
                Requirement: values.Requirement,
                Brand: currentBrand || null,
                Quantity: values.Quantity,
                Remarks: currentRemarks || null,
                key: Date.now()
            };

            setItemsList([...itemsList, newItem]);
            form.resetFields(["Requirement", "Brand", "Quantity", "Remarks"]);
            
            if (requirementInputRef.current) {
                requirementInputRef.current.focus();
            }
        } catch (error) {
            console.error("Validation failed for adding item", error);
        }
    };

    const handleDeleteItem = (key) => {
        setItemsList(itemsList.filter((item) => item.key !== key));
    };

    const handleSubmit = async () => {
        try {
            if (itemsList.length === 0) {
                message.warning("Please add at least one requirement to the list.");
                return;
            }

            setLoading(true);
            const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
            const sys_user_id = storedUser.id || storedUser.Id;

            const payload = {
                sys_user_id: sys_user_id,
                RequestType: itemsList[0].RequestType, 
                Requirements: itemsList.map((item) => ({
                    Requirement: item.Requirement,
                    Brand: item.Brand || null,
                    Quantity: item.Quantity,
                    Remarks: item.Remarks || null
                })),
            };

            console.log("Sending Payload to API:", payload);

            setTimeout(() => {
                message.success("Requisition submitted successfully!");
                setLoading(false);
                if (onSuccess) onSuccess();
                onClose();
            }, 800);
        } catch (error) {
            console.error("Validation failed:", error);
            message.error("Something went wrong.");
            setLoading(false);
        }
    };

    const columns = [
        {
            title: "Type",
            dataIndex: "RequestType",
            key: "RequestType",
            render: (t) => <Text type="secondary">{t}</Text>,
        },
        {
            title: "Requirement",
            dataIndex: "Requirement",
            key: "Requirement",
            render: (t) => <Text strong>{t}</Text>,
        },
        {
            title: "Brand",
            dataIndex: "Brand",
            key: "Brand",
            render: (t) => t || <Text type="secondary">-</Text>,
        },
        { 
            title: "Qty", 
            dataIndex: "Quantity", 
            key: "Quantity", 
            align: "center" 
        },
        {
            title: "Remarks",
            dataIndex: "Remarks",
            key: "Remarks",
            render: (t) => t || <Text type="secondary">-</Text>,
        },
        {
            title: "",
            key: "action",
            width: 50,
            align: "center",
            render: (_, record) => (
                <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeleteItem(record.key)}
                />
            ),
        },
    ];

    return (
        <Modal
            title={
                <div style={{ borderBottom: `2px solid ${C.red}`, paddingBottom: 12, marginBottom: 20 }}>
                    <Text strong style={{ fontSize: 20, color: C.blue }}>Create Requisition</Text>
                </div>
            }
            open={visible}
            onCancel={onClose}
            width={1000}
            destroyOnClose
            closeIcon={<div style={{ color: C.ink, fontWeight: 'bold' }}>✕</div>}
            footer={[
                <Button 
                    key="back" 
                    onClick={onClose} 
                    disabled={loading}
                    style={{ fontWeight: 600 }}
                >
                    Cancel
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    icon={<SaveOutlined />}
                    loading={loading}
                    onClick={handleSubmit}
                    style={{ 
                        backgroundColor: C.blue, 
                        borderColor: C.blue,
                        fontWeight: 600,
                        boxShadow: `0 4px 12px ${C.blue}40` // Soft blue shadow
                    }}
                >
                    Post Requisition
                </Button>,
            ]}
            styles={{ body: { paddingTop: 10 } }}
        >
            <Form form={form} layout="vertical" autoComplete="off">
                
                {/* ALL FIELDS IN ONE LINE */}
                <div style={{ display: "grid", gridTemplateColumns: "1.5fr 2fr 1.5fr 90px", gap: 16 }}>
                    
                    <Form.Item
                        label={<Text strong style={{ color: C.ink }}>Requisition Type</Text>}
                        name="RequestType"
                        rules={[{ required: true, message: "Required" }]}
                        style={{ marginBottom: 16 }}
                    >
                        <Select 
                            placeholder="Select type" 
                            options={requestTypes} 
                            style={{ borderRadius: 6 }}
                        />
                    </Form.Item>

                    <Form.Item
                        label={<Text strong style={{ color: C.ink }}>Requirement</Text>}
                        name="Requirement"
                        rules={[{ required: true, message: "Required" }]}
                        style={{ marginBottom: 16 }}
                    >
                        <Input 
                            ref={requirementInputRef} 
                            placeholder="e.g., Keyboard" 
                            style={{ borderRadius: 6 }}
                        />
                    </Form.Item>

                    <Form.Item 
                        label={<Text strong style={{ color: C.ink }}>Brand</Text>}
                        name="Brand" 
                        style={{ marginBottom: 16 }}
                    >
                        <Input placeholder="Optional" style={{ borderRadius: 6 }} />
                    </Form.Item>

                    <Form.Item
                        label={<Text strong style={{ color: C.ink }}>Quantity</Text>}
                        name="Quantity"
                        rules={[{ required: true, message: "Required" }]}
                        style={{ marginBottom: 16 }}
                    >
                        <InputNumber 
                            min={1} 
                            placeholder="Qty" 
                            style={{ width: "100%", borderRadius: 6 }} 
                        />
                    </Form.Item>
                </div>

                {/* REMARKS ON NEXT LINE */}
                <Form.Item 
                    label={<Text strong style={{ color: C.ink }}>Remarks</Text>} 
                    name="Remarks" 
                    style={{ marginBottom: 20 }}
                >
                    <Input placeholder="e.g., For official use" style={{ borderRadius: 6 }} />
                </Form.Item>

                <Button
                    type="dashed"
                    icon={<PlusOutlined />}
                    onClick={handleAddItem}
                    style={{ 
                        width: "100%", 
                        marginBottom: 24, 
                        height: 40,
                        borderColor: C.blue,
                        color: C.blue,
                        fontWeight: 600,
                        backgroundColor: C.blueSoft
                    }}
                >
                    Add to List
                </Button>
            </Form>

            {/* Summary Table */}
            {itemsList.length > 0 && (
                <>
                    <Divider orientation="left" plain style={{ margin: "0 0 16px", borderColor: C.border }}>
                        <Text strong style={{ color: C.blue }}>Added Items</Text>
                    </Divider>
                    <Table
                        dataSource={itemsList}
                        columns={columns}
                        pagination={false}
                        size="small"
                        rowKey="key"
                        style={{ 
                            border: `1px solid ${C.border}`, 
                            borderRadius: 8, 
                            overflow: "hidden" 
                        }}
                        // Customizing the table header to match the corporate theme
                        components={{
                            header: {
                                cell: (props) => (
                                    <th 
                                        {...props} 
                                        style={{ 
                                            backgroundColor: C.blueSoft, 
                                            color: C.blue, 
                                            fontWeight: 700,
                                            borderBottom: `2px solid ${C.border}`,
                                            padding: '10px 12px'
                                        }} 
                                    />
                                )
                            }
                        }}
                    />
                </>
            )}
        </Modal>
    );
};

export default RequisitionModal;
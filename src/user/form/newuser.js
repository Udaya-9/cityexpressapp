import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Card,
    Form,
    Input,
    Select,
    Button,
    Space,
    Typography,
    Row,
    Col,
    Divider,
    message,
} from "antd";
import {
    UserOutlined,
    SaveOutlined,
    ArrowLeftOutlined,
} from "@ant-design/icons";
import { GenericService } from "../../API/generic/genericservice";
import { createUser_API } from "../API/User.API";

const { Text } = Typography;

const genericService = new GenericService();

const CreateUser = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const [departments, setDepartments] = useState([]);
    const [units, setUnits] = useState([]);
    const [roles, setRoles] = useState([]);
    const [optionsLoading, setOptionsLoading] = useState(true);
    const [unitsLoading, setUnitsLoading] = useState(false);

    // 🔹 Watch department field to trigger unit loading
    const departmentId = Form.useWatch("department", form);


    useEffect(() => {
        let cancelled = false;

        const loadOptions = async () => {
            setOptionsLoading(true);
            try {
                const [deptList, roleList] = await Promise.all([
                    genericService.getDepartments(),
                    genericService.getRoles(),
                ]);
                if (cancelled) return;
                setDepartments(deptList || []);
                setRoles(roleList || []);
            } catch (error) {
                console.error("Load options error:", error);
                message.error(error?.message || "Failed to load form options");
            } finally {
                if (!cancelled) setOptionsLoading(false);
            }
        };

        loadOptions();
        return () => {
            cancelled = true;
        };
    }, []);

  
    useEffect(() => {
        let cancelled = false;

        const loadUnits = async () => {           
            form.setFieldValue("unit", undefined);
            setUnits([]);

            if (!departmentId) return;

            setUnitsLoading(true);
            try {
                //  Using your exact method here
                const unitList =
                    await genericService.getUnitsByDeparmentId(departmentId);
                if (cancelled) return;
                setUnits(unitList || []);
            } catch (error) {
                console.error("Load units error:", error);
                if (!cancelled) message.error("Failed to load units");
            } finally {
                if (!cancelled) setUnitsLoading(false);
            }
        };

        loadUnits();
        return () => {
            cancelled = true;
        };
    }, [departmentId, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);
            
            const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
            const _CreatedBy = storedUser.id; 
             const roleValues = Array.isArray(values.roles) 
            ? values.roles.map(selectedGuid => {
                const roleObj = roles.find(r => r.Value === selectedGuid);
                return roleObj ? roleObj.Label : selectedGuid; 
              }).join(",")
            : String(values.roles || "");

            const payload = {
                emailaddress: values.emailaddress,
                fullName: values.fullName,
                department: values.department,
                Unit: values.unit ?? null,
                sys_user_id: _CreatedBy,
                roles: roleValues,
            };
            await createUser_API(payload);
            message.success("User created successfully");
            navigate("/User");
        } catch (error) {
            console.error("Create user error:", error);
            if (!error?.errorFields) {
                message.error(error?.message || "Failed to create user");
            }
        } finally {
            setLoading(false);
        }
    };
    return (
        <Card
            title={
                <Space>
                    <UserOutlined />
                    <Text strong style={{ fontSize: 18 }}>
                        Create New User
                    </Text>
                </Space>
            }
            extra={
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate("/User")}
                >
                    Back to List
                </Button>
            }
        >
            <Form
                form={form}
                layout="vertical"
                autoComplete="off"
                initialValues={{ accessOnline: true }}
            >
                <Row gutter={24}>
                    <Col xs={24} sm={12} lg={12}>
                        <Form.Item
                            label="User Name"
                            name="emailaddress"
                            rules={[
                                {
                                    required: true,
                                    message: "Please enter username",
                                },
                                {
                                    type: "email",
                                    message:
                                        "Please provide official eMail address",
                                },
                            ]}
                        >
                            <Input
                                placeholder="Enter official eMail address"
                                prefix={<UserOutlined />}
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={12} lg={12}>
                        <Form.Item
                            label="Full Name"
                            name="fullName"
                            rules={[
                                {
                                    required: true,
                                    message: "Please enter full name",
                                },
                            ]}
                        >
                            <Input placeholder="Enter full name" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={12} lg={12}>
                        <Form.Item
                            label="Department"
                            name="department"
                            rules={[
                                {
                                    required: true,
                                    message: "Please select department",
                                },
                            ]}
                        >
                            <Select
                                placeholder="Select department"
                                loading={optionsLoading}
                                showSearch
                                optionFilterProp="label"
                                allowClear
                                options={departments.map((d) => ({
                                    value: d.Value,
                                    label: d.Label,
                                }))}
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={12} lg={12}>
                        <Form.Item
                            label="Unit"
                            name="unit"
                            rules={[
                                {
                                    required: !!departmentId,
                                    message: "Please select unit",
                                },
                            ]}
                        >
                            <Select
                                placeholder={
                                    departmentId
                                        ? "Select unit"
                                        : "Select department first"
                                }
                                disabled={!departmentId || unitsLoading}
                                loading={unitsLoading}
                                showSearch
                                optionFilterProp="label"
                                allowClear
                                options={units.map((u) => ({
                                    value: u.Value,
                                    label: u.Label,
                                }))}
                                notFoundContent={
                                    unitsLoading
                                        ? "Loading..."
                                        : "No units found for this department"
                                }
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={12} lg={12}>
                        <Form.Item
                            label="User Roles"
                            name="roles"
                            rules={[
                                {
                                    required: true,
                                    message: "Please select at least one role",
                                },
                            ]}
                        >
                            <Select
                                mode="multiple"
                                placeholder="Select roles"
                                loading={optionsLoading}
                                optionFilterProp="label"
                                allowClear
                                options={roles.map((r) => ({
                                    value: r.Value,
                                    label: r.Label,
                                }))}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Divider />

                <Form.Item style={{ marginBottom: 0 }}>
                    <Space
                        style={{ width: "100%", justifyContent: "flex-end" }}
                    >
                        <Button onClick={() => navigate("/User")}>
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            icon={<SaveOutlined />}
                            loading={loading}
                            onClick={handleSubmit}
                        >
                            Save User
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default CreateUser;

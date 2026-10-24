import React, { useState } from "react";
import { Form, Input, Button, message } from "antd";
import { useNavigate } from "react-router-dom";
import api from "../../API/api";
import {
  UserOutlined,
  LockOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
} from "@ant-design/icons";
import "./style.css";
import logo from "../../Images/Logo_.png";

const LoginPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const { data } = await api.post("/user/login", {
        emailaddress: values.username,
        password: values.password,
      });

      if (data.success && data.token) {
        localStorage.setItem("token", data.token);
        const payload = JSON.parse(atob(data.token.split(".")[1]));
        localStorage.setItem("user", JSON.stringify(payload));
        if (payload.organizationId) {
          localStorage.setItem("organizationId", payload.organizationId);
        }

        message.success(`Welcome back, ${payload.fullname || "User"}!`);
        navigate("/dashboard");
      } else {
        message.error(data.message || "Login failed");
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Cannot connect to server";
      message.error(msg);
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="login-page">
      <main className="login-card">
        <div className="card-stripe" />

        <div className="card-body">
          <img src={logo} alt="City Express Logo" className="login-logo" />

          <h1 className="login-title">Sign in</h1>
         
          <Form
            name="login"
            onFinish={onFinish}
            layout="vertical"
            requiredMark={false}
            className="login-form"
            size="large"
          >
            <Form.Item
              label="UserName"
              name="username"
              rules={[
                { required: true, message: "Please enter your username" },
              ]}
            >
              <Input
                prefix={<UserOutlined className="input-icon" />}
                placeholder="Enter your username"
                className="custom-input"
                autoComplete="username"
              />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: "Please enter your password" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="input-icon" />}
                placeholder="Enter your password"
                className="custom-input"
                autoComplete="current-password"
                iconRender={(visible) =>
                  visible ? <EyeTwoTone twoToneColor="#0B3D91" /> : <EyeInvisibleOutlined />
                }
              />
            </Form.Item>

            <div className="form-row">
              <a href="/ResetPassword" className="forgot-link">
                Forgot password?
              </a>
            </div>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
                className="login-button"
              >
                Sign in
              </Button>
            </Form.Item>
          </Form>
        </div>
      </main>

      <footer className="page-footer">
        © {currentYear} City Express Money Transfer Pvt. Ltd. All rights reserved.
      </footer>
    </div>
  );
};

export default LoginPage;

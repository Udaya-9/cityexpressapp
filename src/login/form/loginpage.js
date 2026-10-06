import React, { useState } from "react";
import { Form, Input, Button, message } from "antd";
import { useNavigate } from "react-router-dom";
import api from "../../API/api";
import {
  UserOutlined,
  LockOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  ArrowRightOutlined,
} from "@ant-design/icons";
import "./style.css";
import logo from "../../Images/Logo_.png";
import Password from "antd/es/input/Password";

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

  const now = new Date();
  const currentYear = now.getFullYear();
  return (
    <div className="login-page">
      {/* Left brand panel */}
      <div className="login-brand">
        <div className="brand-inner">
          <div className="brand-logo">
            <img
              src={logo}
              alt="City Express Logo"
              className="brand-logo-img"
            />
          </div>
          <h1 className="brand-title">City Express</h1>
          <p className="brand-tagline">Money Transfer</p>

          <div className="brand-divider" />

          <p className="brand-desc">
            From requisitions and memos to fixed assets, approvals, dispatch,
            correspondence and stock.
          </p>

          <div className="brand-footer">
            © {currentYear} City Express Money Transfer Pvt. Ltd · All rights
            reserved
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="login-form-panel">
        <div className="form-wrap">
          <div className="form-header">
            <h2 className="form-title">Welcome back</h2>
            <p className="form-subtitle">Sign in to your account to continue</p>
          </div>

          <Form
            name="login"
            onFinish={onFinish}
            layout="vertical"
            requiredMark={false}
            className="login-form"
            size="large"
          >
            <Form.Item
              label="Username or Email"
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
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
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
                Sign In
                <ArrowRightOutlined className="btn-arrow" />
              </Button>
            </Form.Item>
          </Form>

          <div className="form-footer">
            Need help? <a href="/support">Contact support</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

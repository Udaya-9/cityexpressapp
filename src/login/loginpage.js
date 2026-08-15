import React from "react";
import { Form, Input, Button, Card } from "antd";
import { useNavigate } from "react-router-dom";
import './style.css';

const LoginPage = () => {
  const navigate = useNavigate();

  const onFinish = (values) => {
    console.log("Login values:", values);
    // Navigate to Default page
    navigate('/default');
  };

  return (
    <div className="login-container">
      <Card className="login-card">
        <div className="login-header">
          <h1 className="login-title">City Express</h1>
          <p className="login-subtitle">Money Transfer</p>
          <div className="divider"></div>
          <p className="login-welcome">Welcome back</p>
        </div>

        <Form
          name="login"
          onFinish={onFinish}
          layout="vertical"
          className="login-form"
        >
          <Form.Item
            label="Username or Email"
            name="username"
            rules={[{ required: true, message: "Please enter your username!" }]}
          >
            <Input 
              placeholder="Enter your username" 
              className="custom-input"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please enter your password!" }]}
          >
            <Input.Password 
              placeholder="Enter your password"
              className="custom-input"
              size="large"
            />
          </Form.Item>

          <div className="forgot-password">
            <a href="/ResetPassword">Forgot my password?</a>
          </div>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              block
              size="large"              
              className="login-button"
            >
              Sign In
            </Button>
          </Form.Item>

          <div className="login-footer">
            <p className="signup-text">
              Don't have an account? <a href="/SignUp">Create one</a>
            </p>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;
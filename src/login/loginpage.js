import React from "react";
import { Form, Input, Button, Card } from "antd";
import './style.css';

const LoginPage = () => {
  const onFinish = (values) => {
    console.log("Login values:", values);
  };

  return (
    <div style={{ maxWidth: 400, margin: "auto", marginTop: "100px" }}>
      <h2 className='center'>City Express Money Transfer-Login</h2>
      <Card>
        <Form
          name="login"
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: "Please enter your username!" }]}
          >
            <Input placeholder="Enter username" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please enter your password!" }]}
          >
            <Input.Password placeholder="Enter password" />
          </Form.Item>

          <div style={{ marginBottom: 16 }}>
            <a href="/forgot-password">Forgot my password?</a>
          </div>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Login
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;
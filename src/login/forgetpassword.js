import React from 'react';
import { Link } from "react-router-dom";
import { Card, Form, Input, Button } from 'antd';
import './style.css';

const ForgetPassword = () => {
    const onFinish = (values) => {
        console.log("Reset password values:", values);
    };

    return (
        <div className="login-container">
            <Card className="login-card">
                <div className="login-header">
                    <h1 className="login-title">City Express</h1>
                    <p className="login-subtitle">Money Transfer</p>
                    <div className="divider"></div>
                    <p className="login-welcome">Reset Password</p>
                </div>

                <Form
                    name="Password Reset"
                    onFinish={onFinish}
                    layout="vertical"
                    className="login-form"
                >
                    <Form.Item
                        label="Email Address"
                        name="emailaddress"
                        rules={[
                            {
                                required: true,
                                message: "Please enter your email address!"
                            },
                            {
                                type: 'email',
                                message: "Please enter a valid email address!"
                            }
                        ]}
                    >
                        <Input 
                            placeholder="Enter your email address" 
                            className="custom-input"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button 
                            type="primary" 
                            htmlType="submit" 
                            block
                            size="large"
                            className="login-button"
                        >
                            Send Reset Link
                        </Button>
                    </Form.Item>

                    <div className="login-footer">
                        <p className="signup-text">
                            <Link to="/" className="back-link">
                                ← Back to Login Page
                            </Link>
                        </p>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default ForgetPassword;
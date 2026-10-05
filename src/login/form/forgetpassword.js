import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Form, Input, Button, message } from "antd";
import {
  MailOutlined,
  ArrowLeftOutlined,
  SendOutlined,
} from "@ant-design/icons";

const ForgetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // 🔌 Plug your API call here:
      // await axios.post("/api/auth/forgot-password", { email: values.emailaddress });
      console.log("Reset password values:", values);

      setSent(true);
      message.success("Reset link sent to your email");
    } catch (err) {
      console.error(err);
      message.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ================= STYLES =================
  const styles = {
    page: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 20px",
      background:
        "radial-gradient(circle at 15% 20%, rgba(122,183,255,0.18) 0%, rgba(122,183,255,0) 45%), radial-gradient(circle at 85% 80%, rgba(31,111,235,0.15) 0%, rgba(31,111,235,0) 45%), linear-gradient(160deg, #F2F5FA 0%, #E6EEF9 100%)",
      fontFamily:
        "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      position: "relative",
      overflow: "hidden",
    },

    card: {
      position: "relative",
      zIndex: 2,
      width: "100%",
      maxWidth: 440,
      background: "#fff",
      border: "1px solid #E3E8F0",
      borderRadius: 22,
      padding: "44px 40px 36px",
      boxShadow:
        "0 24px 48px -20px rgba(1,40,90,0.18), 0 2px 8px rgba(0,0,0,0.02)",
    },

    header: {
      textAlign: "center",
      marginBottom: 32,
    },

    icon: {
      width: 64,
      height: 64,
      margin: "0 auto 20px",
      borderRadius: 18,
      background: "linear-gradient(135deg, #4da3ff, #1a6fc9)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#fff",
      fontSize: 26,
      boxShadow: "0 12px 26px -8px rgba(31,111,235,0.55)",
    },

    title: {
      fontSize: 24,
      fontWeight: 700,
      color: "#0B2545",
      letterSpacing: "-0.4px",
      margin: "0 0 8px",
    },

    subtitle: {
      fontSize: 13.5,
      color: "#667085",
      lineHeight: 1.6,
      margin: "0 auto",
      maxWidth: 340,
    },

    // input override
    customInput: {
      height: 46,
      borderRadius: 10,
      border: "1px solid #E3E8F0",
      background: "#F8FAFC",
      fontSize: 14,
      boxShadow: "none",
      padding: "0 14px",
    },

    inputIcon: {
      color: "#98A2B3",
      fontSize: 15,
    },

    // button
    loginButton: {
      height: 48,
      borderRadius: 10,
      fontSize: 14.5,
      fontWeight: 600,
      background: "#1F6FEB",
      borderColor: "#1F6FEB",
      boxShadow: "0 10px 22px -10px rgba(31,111,235,0.75)",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },

    btnArrow: {
      fontSize: 13,
    },

    // success state
    successState: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
      padding: "4px 0",
    },

    successIcon: {
      width: 64,
      height: 64,
      borderRadius: "50%",
      background: "#E6F6EF",
      color: "#12805C",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 30,
      fontWeight: 700,
      marginBottom: 20,
      border: "2px solid #B7E4CF",
    },

    successText: {
      fontSize: 13.5,
      color: "#667085",
      lineHeight: 1.6,
      marginBottom: 24,
      maxWidth: 320,
    },

    // footer
    footer: {
      marginTop: 28,
      textAlign: "center",
    },

    backLink: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      fontSize: 13.5,
      fontWeight: 600,
      color: "#1F6FEB",
      textDecoration: "none",
    },

    backIcon: {
      fontSize: 12,
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* ---------- Header ---------- */}
        <div style={styles.header}>
          <div style={styles.icon}>
            <MailOutlined />
          </div>
          <h2 style={styles.title}>
            {sent ? "Check your email" : "Forgot your password?"}
          </h2>
          
        </div>

        {/* ---------- Form or Success ---------- */}
        {!sent ? (
          <Form
            name="password-reset"
            onFinish={onFinish}
            layout="vertical"
            requiredMark={false}
            size="large"
          >
            <Form.Item
              label="Email Address"
              name="emailaddress"
              rules={[
                { required: true, message: "Please enter your email address" },
                { type: "email", message: "Please enter a valid email address" },
              ]}
            >
              <Input
                prefix={
                  <MailOutlined style={styles.inputIcon} />
                }
                placeholder="Enter your email address"
                style={styles.customInput}
                autoComplete="email"
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
                style={styles.loginButton}
              >
                Send Reset Link
                <SendOutlined style={styles.btnArrow} />
              </Button>
            </Form.Item>
          </Form>
        ) : (
          <div style={styles.successState}>
            <div style={styles.successIcon}>✓</div>
            <p style={styles.successText}>
              Didn't receive the email? Check your spam folder or try again.
            </p>
            <Button
              type="primary"
              block
              style={styles.loginButton}
              onClick={() => setSent(false)}
            >
              Resend Link
            </Button>
          </div>
        )}

        {/* ---------- Footer ---------- */}
        <div style={styles.footer}>
          <Link to="/" style={styles.backLink}>
            <ArrowLeftOutlined style={styles.backIcon} />
            Back to Login
          </Link>
        </div>
      </div>

      {/* ---------- Ant Design overrides (needed for input focus/hover) ---------- */}
      <style>{`
        .ant-input-affix-wrapper {
          height: 46px !important;
          border-radius: 10px !important;
          border: 1px solid #E3E8F0 !important;
          background: #F8FAFC !important;
          font-size: 14px !important;
          box-shadow: none !important;
          padding: 0 14px !important;
        }
        .ant-input-affix-wrapper:hover {
          border-color: #C5CFDE !important;
          background: #fff !important;
        }
        .ant-input-affix-wrapper-focused {
          border-color: #1F6FEB !important;
          background: #fff !important;
          box-shadow: 0 0 0 3px rgba(31, 111, 235, 0.14) !important;
        }
        .ant-input-affix-wrapper input.ant-input {
          background: transparent !important;
          font-size: 14px !important;
        }
        .ant-form-item-label > label {
          font-size: 13px !important;
          font-weight: 600 !important;
          color: #16202F !important;
          height: auto !important;
        }
        .ant-form-item-label {
          padding-bottom: 6px !important;
        }
        .ant-form-item {
          margin-bottom: 20px !important;
        }
      `}</style>
    </div>
  );
};

export default ForgetPassword;
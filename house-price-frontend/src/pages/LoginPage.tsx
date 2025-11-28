// src/pages/LoginPage.tsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Form, Input, Button, Typography, Card, message } from "antd";
import { api } from "../api/client";
import { setToken } from "../auth/token";
import { AFTER_LOGIN_REDIRECT } from "../config/routes";

const { Title, Text } = Typography;

interface LoginFormValues {
  email: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: LoginFormValues) => {
    try {
      setLoading(true);

      // 后端 /auth/login 用的是 OAuth2PasswordRequestForm
      // 所以要用 form-urlencoded + username/password
      const formData = new URLSearchParams();
      formData.append("username", values.email);
      formData.append("password", values.password);

      const res = await api.post("/auth/login", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      const { access_token } = res.data;
      setToken(access_token);
      message.success("登录成功");

      // 登录后跳回来源页，默认到首页或 dashboard
      navigate(AFTER_LOGIN_REDIRECT, { replace: true });
    } catch (err: any) {
      console.error(err);
      message.error(
        err?.response?.data?.detail || "登录失败，请检查邮箱和密码"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f5f5",
      }}
    >
      <Card style={{ width: 380 }}>
        <Title level={3} style={{ textAlign: "center", marginBottom: 24 }}>
          房价预测系统 · 登录
        </Title>

        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="邮箱"
            name="email"
            rules={[
              { required: true, message: "请输入邮箱" },
              { type: "email", message: "邮箱格式不正确" },
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>

          <Form.Item
            label="密码"
            name="password"
            rules={[{ required: true, message: "请输入密码" }]}
          >
            <Input.Password placeholder="请输入密码" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              style={{ marginTop: 8 }}
            >
              登录
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: "center" }}>
          <Text type="secondary">
            还没有账号？<Link to="/register">去注册</Link>
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;

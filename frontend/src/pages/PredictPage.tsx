// src/pages/PredictPage.tsx
import React, { useState } from "react";
import {
  Card,
  Form,
  InputNumber,
  Button,
  Tag,
  Typography,
  message,
  Row,
  Col,
} from "antd";
import { getToken } from "../auth/token";

const { Text, Title } = Typography;

interface PredictFormValues {
  area_sqm: number;
  bedrooms: number;
  age_years: number;
  distance_to_metro_km: number;
}

const API_BASE_URL = "http://127.0.0.1:8080";

const PredictPage: React.FC = () => {
  const [predictForm] = Form.useForm<PredictFormValues>();
  const [predicting, setPredicting] = useState(false);
  const [predictedPrice, setPredictedPrice] = useState<number | null>(null);
  const [messageApi, contextHolder] = message.useMessage();

  const handlePredictFinish = async (values: PredictFormValues) => {
    setPredictedPrice(null);
    try {
      setPredicting(true);

      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error(`预测接口请求失败：${res.status}`);
      const data = await res.json();
      setPredictedPrice(data.predicted_price);
      messageApi.success("预测成功");
    } catch (err: any) {
      console.error(err);
      messageApi.error(err.message || "预测失败，请检查后端是否已启动");
    } finally {
      setPredicting(false);
    }
  };

  return (
    <>
      {contextHolder}
      <Title level={3} style={{ color: "#e5e7eb", marginBottom: 8 }}>
        房价预测
      </Title>
      <Text type="secondary" style={{ fontSize: 13 }}>
        输入基本信息，调用后端模型快速给出一个参考价格。
      </Text>

      <Card
        style={{ marginTop: 16 }}
        bordered={false}
        title={
          <SpaceBetween>
            <span>基础特征输入</span>
            <Tag color="blue">/predict</Tag>
          </SpaceBetween>
        }
      >
        <Form
          form={predictForm}
          layout="vertical"
          onFinish={handlePredictFinish}
          initialValues={{
            area_sqm: 80,
            bedrooms: 3,
            age_years: 5,
            distance_to_metro_km: 1.2,
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="面积（㎡）"
                name="area_sqm"
                rules={[{ required: true, message: "请输入面积" }]}
              >
                <InputNumber min={1} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="卧室数"
                name="bedrooms"
                rules={[{ required: true, message: "请输入卧室数" }]}
              >
                <InputNumber min={0} max={20} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="房龄（年）"
                name="age_years"
                rules={[{ required: true, message: "请输入房龄" }]}
              >
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="距离地铁（公里）"
                name="distance_to_metro_km"
                rules={[{ required: true, message: "请输入距离地铁" }]}
              >
                <InputNumber min={0} step={0.1} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={predicting}>
              {predicting ? "预测中..." : "预测房价"}
            </Button>
          </Form.Item>
        </Form>

        {predictedPrice !== null && (
          <div
            style={{
              marginTop: 8,
              padding: 12,
              background: "#0b1220",
              borderRadius: 8,
            }}
          >
            <Text type="secondary">模型预测价格约为：</Text>
            <Text strong style={{ fontSize: 18, marginLeft: 6 }}>
              {Math.round(predictedPrice).toLocaleString()} 元
            </Text>
          </div>
        )}
      </Card>
    </>
  );
};

// 小工具组件：左右对齐
const SpaceBetween: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
    {children}
  </div>
);

export default PredictPage;

// src/App.tsx
import React, { useEffect, useState } from "react";
import {
  Layout,
  Typography,
  Card as AntdCard,
  Form,
  InputNumber,
  Button,
  Table,
  Space,
  Popconfirm,
  message,
  Tag,
} from "antd";
import type { ColumnsType } from "antd/es/table";
const { Header, Content } = Layout;
const { Title, Text } = Typography;

// 暴力版 Card 包装：不再玩复杂类型，彻底绕开 TS 对 AntdCard 的 JSX 检查
const Card: React.FC<any> = (props) =>
  React.createElement(AntdCard as any, props);

interface PredictFormValues {
  area_sqm: number;
  bedrooms: number;
  age_years: number;
  distance_to_metro_km: number;
}

interface HouseFormValues {
  area_sqm: number;
  bedrooms: number;
  age_years: number;
  distance_to_metro_km: number;
  price: number;
}

interface House extends HouseFormValues {
  id: number;
}

const API_BASE_URL = "http://127.0.0.1:8080";

const PredictPage: React.FC = () => {
  // ===== 预测相关状态 =====
  const [predictForm] = Form.useForm<PredictFormValues>();
  const [predicting, setPredicting] = useState(false);
  const [predictedPrice, setPredictedPrice] = useState<number | null>(null);

  // ===== 房源相关状态 =====
  const [houseForm] = Form.useForm<HouseFormValues>();
  const [houses, setHouses] = useState<House[]>([]);
  const [housesLoading, setHousesLoading] = useState(false);
  const [savingHouse, setSavingHouse] = useState(false);
  const [editingHouse, setEditingHouse] = useState<House | null>(null);

  // ===== 公共提示 =====
  const [messageApi, contextHolder] = message.useMessage();

  // ---------- 拉取房源列表 ----------
  const fetchHouses = async () => {
    try {
      setHousesLoading(true);
      const res = await fetch(`${API_BASE_URL}/houses`);
      if (!res.ok) throw new Error(`获取房源列表失败：${res.status}`);
      const data: House[] = await res.json();
      setHouses(data);
    } catch (err: any) {
      console.error(err);
      messageApi.error(err.message || "获取房源列表失败");
    } finally {
      setHousesLoading(false);
    }
  };

  useEffect(() => {
    fetchHouses();
  }, []);

  // ---------- 提交预测 ----------
  const handlePredictFinish = async (values: PredictFormValues) => {
    setPredictedPrice(null);
    try {
      setPredicting(true);
      const res = await fetch(`${API_BASE_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

  // ---------- 新增 / 更新 房源 ----------
  const handleHouseFinish = async (values: HouseFormValues) => {
    try {
      setSavingHouse(true);

      const isEditing = !!editingHouse;
      const url = isEditing
        ? `${API_BASE_URL}/houses/${editingHouse!.id}`
        : `${API_BASE_URL}/houses`;
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`${isEditing ? "更新" : "创建"}失败：${res.status} ${text}`);
      }

      await res.json();
      await fetchHouses();
      houseForm.resetFields();
      setEditingHouse(null);
      messageApi.success(isEditing ? "房源更新成功" : "房源创建成功");
    } catch (err: any) {
      console.error(err);
      messageApi.error(err.message || "保存房源失败");
    } finally {
      setSavingHouse(false);
    }
  };

  // ---------- 删除房源 ----------
  const handleDeleteHouse = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/houses/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`删除失败：${res.status}`);
      messageApi.success(`房源 #${id} 已删除`);
      fetchHouses();
    } catch (err: any) {
      console.error(err);
      messageApi.error(err.message || "删除房源失败");
    }
  };

  // ---------- 点击编辑 ----------
  const handleEditClick = (record: House) => {
    setEditingHouse(record);
    houseForm.setFieldsValue({
      area_sqm: record.area_sqm,
      bedrooms: record.bedrooms,
      age_years: record.age_years,
      distance_to_metro_km: record.distance_to_metro_km,
      price: record.price,
    });
  };

  // ---------- 取消编辑 ----------
  const handleCancelEdit = () => {
    setEditingHouse(null);
    houseForm.resetFields();
  };

  // ---------- 表格列配置 ----------
  const columns: ColumnsType<House> = [
    {
      title: "ID",
      dataIndex: "id",
      width: 60,
    },
    {
      title: "面积(㎡)",
      dataIndex: "area_sqm",
    },
    {
      title: "卧室数",
      dataIndex: "bedrooms",
    },
    {
      title: "房龄(年)",
      dataIndex: "age_years",
    },
    {
      title: "距地铁(km)",
      dataIndex: "distance_to_metro_km",
    },
    {
      title: "价格",
      dataIndex: "price",
      render: (value: number) => (
        <Text>
          {Math.round(value).toLocaleString()}{" "}
          <Text type="secondary">元</Text>
        </Text>
      ),
    },
    {
      title: "操作",
      key: "action",
      render: (_, record) => (
        <Space size="small">
          <Button type="link" onClick={() => handleEditClick(record)}>
            编辑
          </Button>
          <Popconfirm
            title={`确认删除房源 #${record.id}？`}
            onConfirm={() => handleDeleteHouse(record.id)}
          >
            <Button type="link" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Layout className="app-root">
      {contextHolder}
      <Header
        style={{
          background: "#0f172a",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Title level={3} style={{ color: "#fff", margin: 0 }}>
          房价预测 & 房源管理 Demo
        </Title>
      </Header>

      <Content style={{ padding: 24, display: "flex", justifyContent: "center" }}>
        <div style={{ width: "100%", maxWidth: 1000 }}>
          {/* 预测卡片 */}
          <Card
            title="房价预测"
            style={{ marginBottom: 16 }}
            extra={<Tag color="blue">调用 /predict</Tag>}
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
              <Form.Item
                label="面积（㎡）"
                name="area_sqm"
                rules={[{ required: true, message: "请输入面积" }]}
              >
                <InputNumber min={1} style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item
                label="卧室数"
                name="bedrooms"
                rules={[{ required: true, message: "请输入卧室数" }]}
              >
                <InputNumber min={0} max={20} style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item
                label="房龄（年）"
                name="age_years"
                rules={[{ required: true, message: "请输入房龄" }]}
              >
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item
                label="距离地铁（公里）"
                name="distance_to_metro_km"
                rules={[{ required: true, message: "请输入距离地铁" }]}
              >
                <InputNumber min={0} step={0.1} style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={predicting}>
                  {predicting ? "预测中..." : "预测房价"}
                </Button>
              </Form.Item>
            </Form>

            {predictedPrice !== null && (
              <div style={{ marginTop: 8 }}>
                <Text>预测价格约为：</Text>
                <Text strong type="success">
                  {" "}
                  {Math.round(predictedPrice).toLocaleString()} 元
                </Text>
              </div>
            )}
          </Card>

          {/* 房源表单卡片 */}
          <Card
            title={editingHouse ? `编辑房源 #${editingHouse.id}` : "新增房源"}
            style={{ marginBottom: 16 }}
            extra={<Tag color="green">调用 /houses</Tag>}
          >
            <Form
              form={houseForm}
              layout="vertical"
              onFinish={handleHouseFinish}
            >
              <Form.Item
                label="面积（㎡）"
                name="area_sqm"
                rules={[{ required: true, message: "请输入面积" }]}
              >
                <InputNumber min={1} style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item
                label="卧室数"
                name="bedrooms"
                rules={[{ required: true, message: "请输入卧室数" }]}
              >
                <InputNumber min={0} max={20} style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item
                label="房龄（年）"
                name="age_years"
                rules={[{ required: true, message: "请输入房龄" }]}
              >
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item
                label="距离地铁（公里）"
                name="distance_to_metro_km"
                rules={[{ required: true, message: "请输入距离地铁" }]}
              >
                <InputNumber min={0} step={0.1} style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item
                label="价格（元）"
                name="price"
                rules={[{ required: true, message: "请输入价格" }]}
              >
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit" loading={savingHouse}>
                    {editingHouse ? "保存修改" : "新增房源"}
                  </Button>
                  {editingHouse && (
                    <Button onClick={handleCancelEdit}>取消编辑</Button>
                  )}
                </Space>
              </Form.Item>
            </Form>
          </Card>

          {/* 房源列表 */}
          <Card
            title="当前房源列表"
            extra={<Button onClick={fetchHouses}>刷新</Button>}
          >
            <Table
              rowKey="id"
              dataSource={houses}
              columns={columns}
              loading={housesLoading}
              pagination={false}
              size="small"
            />
            {houses.length === 0 && !housesLoading && (
              <Text type="secondary">
                暂无房源，可以先通过上面的表单新增一条。
              </Text>
            )}
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default PredictPage;

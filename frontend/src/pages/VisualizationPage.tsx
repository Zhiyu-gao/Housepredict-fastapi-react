// src/pages/VisualizationPage.tsx
import React, { useEffect, useState, useMemo } from "react";
import { Card, Row, Col, Skeleton, Typography, Tag, message } from "antd";
import { getToken } from "../auth/token";
import {
  ScatterChart,
  Scatter,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

const { Title, Text } = Typography;

const API_BASE_URL = "http://127.0.0.1:8080";

interface House {
  id: number;
  area_sqm: number;
  bedrooms: number;
  age_years: number;
  distance_to_metro_km: number;
  price: number;
}

const VisualizationPage: React.FC = () => {
  const [houses, setHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const buildAuthHeaders = () => {
    const token = getToken();
    return {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const fetchHouses = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/houses`, {
        headers: buildAuthHeaders(),
      });
      if (!res.ok) throw new Error(`获取房源数据失败：${res.status}`);
      const data: House[] = await res.json();
      setHouses(data);
    } catch (err: any) {
      console.error(err);
      messageApi.error(err.message || "获取房源数据失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHouses();
  }, []);

  // 1) 面积 vs 价格 散点图数据
  const scatterData = useMemo(
    () =>
      houses.map((h) => ({
        x: h.area_sqm,
        y: h.price,
        bedrooms: h.bedrooms,
      })),
    [houses]
  );

  // 2) 每个卧室数的平均价格 柱状图
  const barData = useMemo(() => {
    const map: Record<string, { sum: number; count: number }> = {};
    houses.forEach((h) => {
      const key = String(h.bedrooms);
      if (!map[key]) {
        map[key] = { sum: 0, count: 0 };
      }
      map[key].sum += h.price;
      map[key].count += 1;
    });
    return Object.entries(map)
      .map(([bedrooms, { sum, count }]) => ({
        bedrooms,
        avg_price: count ? sum / count : 0,
      }))
      .sort((a, b) => Number(a.bedrooms) - Number(b.bedrooms));
  }, [houses]);

  // 3) 房龄 vs 距地铁 散点图
  const ageDistanceData = useMemo(
    () =>
      houses.map((h) => ({
        age: h.age_years,
        distance: h.distance_to_metro_km,
      })),
    [houses]
  );

  return (
    <>
      {contextHolder}
      <Title level={3} style={{ marginBottom: 16 }}>
        房源数据可视化 <Tag color="geekblue">炫酷大屏</Tag>
      </Title>

      {loading && <Skeleton active />}

      {!loading && houses.length === 0 && (
        <Text type="secondary">暂无数据，请先在「房源增删改查」中新建一些房源。</Text>
      )}

      {!loading && houses.length > 0 && (
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card title="面积 vs 价格（点越高价格越贵）">
              <div style={{ width: "100%", height: 320 }}>
                <ResponsiveContainer>
                  <ScatterChart>
                    <CartesianGrid />
                    <XAxis type="number" dataKey="x" name="面积" unit="㎡" />
                    <YAxis type="number" dataKey="y" name="价格" unit="元" />
                    <Tooltip
                      cursor={{ strokeDasharray: "3 3" }}
                      formatter={(value, name) => [
                        Math.round(Number(value)).toLocaleString(),
                        name,
                      ]}
                      labelFormatter={() => ""}
                    />
                    <Legend />
                    <Scatter
                      name="房源"
                      data={scatterData}
                      // Recharts 默认会给一个颜色，这里不用手动指定
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>

          <Col span={12}>
            <Card title="不同卧室数的平均价格">
              <div style={{ width: "100%", height: 260 }}>
                <ResponsiveContainer>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="bedrooms" label={{ value: "卧室数", position: "insideBottom", offset: -5 }} />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [
                        Math.round(Number(value)).toLocaleString() + " 元",
                        "平均价格",
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="avg_price" name="平均价格" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>

          <Col span={12}>
            <Card title="房龄 vs 距地铁">
              <div style={{ width: "100%", height: 260 }}>
                <ResponsiveContainer>
                  <ScatterChart>
                    <CartesianGrid />
                    <XAxis type="number" dataKey="age" name="房龄" unit="年" />
                    <YAxis type="number" dataKey="distance" name="距地铁" unit="km" />
                    <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                    <Legend />
                    <Scatter name="房源" data={ageDistanceData} />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>
        </Row>
      )}
    </>
  );
};

export default VisualizationPage;

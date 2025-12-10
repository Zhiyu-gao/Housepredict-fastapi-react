// src/pages/VisualizationPage.tsx
import React, { useEffect, useState, useMemo } from "react";
import { Card, Row, Col, Skeleton, Typography, Tag, message, Statistic, Divider } from "antd";
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
  PieChart,
  Pie,
  Cell,
} from "recharts";

const { Title, Text } = Typography;

const API_BASE_URL = "http://127.0.0.1:8000";

interface House {
  id: number;
  area_sqm: number;
  bedrooms: number;
  age_years: number;
  distance_to_metro_km: number;
  price: number;
}

// 给不同卧室数一点固定配色（只是前端展示，不影响数据）
const BEDROOM_COLORS: string[] = ["#5B8FF9", "#61DDAA", "#65789B", "#F6BD16", "#7262fd", "#78D3F8"];

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

  // =============== 统计指标 ===============
  const stats = useMemo(() => {
    if (!houses.length) return null;
    const total = houses.length;
    let sumPrice = 0;
    let sumArea = 0;
    let sumUnitPrice = 0;
    let maxPrice = 0;

    houses.forEach((h) => {
      sumPrice += h.price;
      sumArea += h.area_sqm;
      const unitPrice = h.price / (h.area_sqm || 1);
      sumUnitPrice += unitPrice;
      if (h.price > maxPrice) maxPrice = h.price;
    });

    const avgPrice = sumPrice / total;
    const avgArea = sumArea / total;
    const avgUnitPrice = sumUnitPrice / total;

    return {
      total,
      avgPrice,
      maxPrice,
      avgArea,
      avgUnitPrice,
    };
  }, [houses]);

  // 1) 面积 vs 价格 散点图数据（点大小按卧室数适度变化）
  const scatterData = useMemo(
    () =>
      houses.map((h) => ({
        x: h.area_sqm,
        y: h.price,
        bedrooms: h.bedrooms,
        size: 40 + h.bedrooms * 15,
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
        price: h.price,
      })),
    [houses]
  );

  // 4) 不同卧室数的数量分布（饼图）
  const bedroomPieData = useMemo(() => {
    const map: Record<string, number> = {};
    houses.forEach((h) => {
      const key = String(h.bedrooms);
      if (!map[key]) map[key] = 0;
      map[key] += 1;
    });
    return Object.entries(map)
      .map(([bedrooms, count]) => ({
        bedrooms,
        count,
      }))
      .sort((a, b) => Number(a.bedrooms) - Number(b.bedrooms));
  }, [houses]);

  const cardStyle: React.CSSProperties = {
    borderRadius: 16,
    boxShadow: "0 10px 30px rgba(31, 56, 88, 0.12)",
  };

  return (
    <div
      style={{
        padding: 16,
        borderRadius: 24,
        background: "linear-gradient(135deg, #f0f5ff 0%, #ffffff 55%, #fff7e6 100%)",
      }}
    >
      {contextHolder}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <Title level={3} style={{ marginBottom: 4 }}>
            房源数据可视化 <Tag color="geekblue">可视化大屏</Tag>
          </Title>
          <Text type="secondary">
            从多个维度洞察房源特征：面积、价格、卧室数、房龄以及与地铁的距离。
          </Text>
        </div>
        {stats && (
          <Tag color="purple" style={{ fontSize: 12, padding: "4px 10px", borderRadius: 999 }}>
            共 {stats.total.toLocaleString()} 套房源
          </Tag>
        )}
      </div>

      {loading && <Skeleton active />}

      {!loading && houses.length === 0 && (
        <Text type="secondary">暂无数据，请先在「房源增删改查」中新建一些房源。</Text>
      )}

      {/* 顶部 KPI 区域 */}
      {!loading && stats && (
        <>
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={12} md={6}>
              <Card size="small" style={cardStyle} bordered={false}>
                <Statistic
                  title="平均总价"
                  value={Math.round(stats.avgPrice)}
                  suffix="元"
                  valueStyle={{ fontSize: 20 }}
                />
                <Text type="secondary">所有房源总价的均值</Text>
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card size="small" style={cardStyle} bordered={false}>
                <Statistic
                  title="最高总价"
                  value={Math.round(stats.maxPrice)}
                  suffix="元"
                  valueStyle={{ fontSize: 20 }}
                />
                <Text type="secondary">当前库中最贵的一套</Text>
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card size="small" style={cardStyle} bordered={false}>
                <Statistic
                  title="平均面积"
                  value={stats.avgArea.toFixed(1)}
                  suffix="㎡"
                  valueStyle={{ fontSize: 20 }}
                />
                <Text type="secondary">房源建筑面积的均值</Text>
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card size="small" style={cardStyle} bordered={false}>
                <Statistic
                  title="平均单价"
                  value={Math.round(stats.avgUnitPrice)}
                  suffix="元/㎡"
                  valueStyle={{ fontSize: 20 }}
                />
                <Text type="secondary">总价 ÷ 面积，按房源均值</Text>
              </Card>
            </Col>
          </Row>
          <Divider style={{ margin: "10px 0 18px" }} />
        </>
      )}

      {!loading && houses.length > 0 && (
        <Row gutter={[16, 16]}>
          {/* 面积 vs 价格散点图 */}
          <Col span={24}>
            <Card
              title="面积 vs 价格（点越高价格越贵，圆点大小代表卧室数）"
              style={cardStyle}
              bordered={false}
              extra={<Tag color="blue">面积与总价关系</Tag>}
            >
              <div style={{ width: "100%", height: 360 }}>
                <ResponsiveContainer>
                  <ScatterChart margin={{ top: 20, right: 30, bottom: 10, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" dataKey="x" name="面积" unit="㎡" />
                    <YAxis type="number" dataKey="y" name="价格" unit="元" />
                    <Tooltip
                      cursor={{ strokeDasharray: "3 3" }}
                      formatter={(value: any, name: any) => {
                        if (name === "x") {
                          return [value + " ㎡", "面积"];
                        }
                        if (name === "y") {
                          return [Math.round(Number(value)).toLocaleString() + " 元", "总价"];
                        }
                        if (name === "bedrooms") {
                          return [value + " 间", "卧室数"];
                        }
                        return [value, name];
                      }}
                      labelFormatter={() => ""}
                    />
                    <Legend />
                    <Scatter
                      name="房源"
                      data={scatterData}
                      fill="#5B8FF9"
                      shape="circle"
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>

          {/* 左：平均价格柱图 右：房龄 vs 地铁/饼图 */}
          <Col xs={24} lg={12}>
            <Card
              title="不同卧室数的平均价格"
              style={cardStyle}
              bordered={false}
              extra={<Tag color="gold">卧室数维度</Tag>}
            >
              <div style={{ width: "100%", height: 280 }}>
                <ResponsiveContainer>
                  <BarChart data={barData} margin={{ top: 20, right: 20, bottom: 10, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="bedrooms"
                      label={{ value: "卧室数", position: "insideBottom", offset: -5 }}
                    />
                    <YAxis />
                    <Tooltip
                      formatter={(value: any) => [
                        Math.round(Number(value)).toLocaleString() + " 元",
                        "平均价格",
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="avg_price" name="平均价格">
                      {barData.map((entry, index) => (
                        <Cell
                          key={`cell-${entry.bedrooms}`}
                          fill={BEDROOM_COLORS[index % BEDROOM_COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Row gutter={[16, 16]}>
              {/* 房龄 vs 地铁 散点 */}
              <Col span={24}>
                <Card
                  title="房龄 vs 距地铁"
                  style={cardStyle}
                  bordered={false}
                  extra={<Tag color="green">通勤友好度</Tag>}
                >
                  <div style={{ width: "100%", height: 200 }}>
                    <ResponsiveContainer>
                      <ScatterChart margin={{ top: 20, right: 20, bottom: 10, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" dataKey="age" name="房龄" unit="年" />
                        <YAxis type="number" dataKey="distance" name="距地铁" unit="km" />
                        <Tooltip
                          cursor={{ strokeDasharray: "3 3" }}
                          formatter={(value: any, name: any) => {
                            if (name === "age") return [value + " 年", "房龄"];
                            if (name === "distance") return [value + " km", "距地铁"];
                            if (name === "price")
                              return [Math.round(Number(value)).toLocaleString() + " 元", "总价"];
                            return [value, name];
                          }}
                          labelFormatter={() => ""}
                        />
                        <Legend />
                        <Scatter name="房源" data={ageDistanceData} fill="#61DDAA" />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </Col>

              {/* 卧室数分布饼图 */}
              <Col span={24}>
                <Card
                  title="卧室数分布"
                  style={cardStyle}
                  bordered={false}
                  extra={<Tag color="magenta">库存结构</Tag>}
                >
                  <div style={{ width: "100%", height: 220 }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={bedroomPieData}
                          dataKey="count"
                          nameKey="bedrooms"
                          outerRadius={70}
                          label={({ payload }) => `${payload.bedrooms} 室 (${payload.count})`}
                        >
                          {bedroomPieData.map((entry, index) => (
                            <Cell
                              key={`cell-pie-${entry.bedrooms}`}
                              fill={BEDROOM_COLORS[index % BEDROOM_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: any, name: any, item: any) => [
                            `${value} 套`,
                            `${item.payload.bedrooms} 室`,
                          ]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default VisualizationPage;

import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  Row,
  Col,
  Skeleton,
  Typography,
  Tag,
  Divider,
  Statistic,
  message,
} from "antd";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { getToken } from "../auth/token";

const { Title, Text } = Typography;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface House {
  house_id: string;
  area_sqm: number;
  layout: string;
  build_year: number;
  total_price_wan: number;
  unit_price: number;
}

/* ================= 工具函数 ================= */

const formatWan = (v: number) => `${(v / 10000).toFixed(0)}万`;

const binHistogram = (data: number[], binCount = 10) => {
  if (!data.length) return [];
  const min = Math.min(...data);
  const max = Math.max(...data);
  const step = (max - min) / binCount;

  return Array.from({ length: binCount }, (_, i) => {
    const low = min + i * step;
    const high = min + (i + 1) * step;
    return {
      range: `${Math.round(low)}~${Math.round(high)}`,
      count: data.filter(v => v >= low && v < high).length,
    };
  });
};

const pearson = (x: number[], y: number[]) => {
  const n = x.length;
  const mx = x.reduce((a, b) => a + b, 0) / n;
  const my = y.reduce((a, b) => a + b, 0) / n;
  let num = 0, dx = 0, dy = 0;
  for (let i = 0; i < n; i++) {
    num += (x[i] - mx) * (y[i] - my);
    dx += (x[i] - mx) ** 2;
    dy += (y[i] - my) ** 2;
  }
  return num / Math.sqrt(dx * dy);
};

const cardStyle: React.CSSProperties = {
  background: "#111827",
  border: "1px solid #1f2937",
};

/* ================= 页面组件 ================= */

const VisualizationPage: React.FC = () => {
  const [houses, setHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/crawl-houses`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (!res.ok) throw new Error("获取房源失败");
        setHouses(await res.json());
      } catch (e: any) {
        messageApi.error(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  /* ===== 派生字段 ===== */
  const parsed = useMemo(() => {
    const year = new Date().getFullYear();
    return houses.map(h => ({
      ...h,
      total_price_yuan: h.total_price_wan * 10000,
      age_years: year - h.build_year,
    }));
  }, [houses]);

  /* ===== 统计 ===== */
  const stats = useMemo(() => {
    if (!parsed.length) return null;
    const total = parsed.length;
    const sumPrice = parsed.reduce((s, h) => s + h.total_price_yuan, 0);
    const sumArea = parsed.reduce((s, h) => s + h.area_sqm, 0);
    return {
      total,
      avgPrice: sumPrice / total,
      avgUnitPrice: sumPrice / sumArea,
    };
  }, [parsed]);

  /* ===== 直方图数据 ===== */
  const totalPriceHist = useMemo(
    () => binHistogram(parsed.map(h => h.total_price_yuan)),
    [parsed]
  );
  const unitPriceHist = useMemo(
    () => binHistogram(parsed.map(h => h.unit_price)),
    [parsed]
  );
  const areaHist = useMemo(
    () => binHistogram(parsed.map(h => h.area_sqm)),
    [parsed]
  );
  const ageHist = useMemo(
    () => binHistogram(parsed.map(h => h.age_years)),
    [parsed]
  );

  const corrData = useMemo(() => {
    if (!parsed.length) return [];

    type FeatureKey = "面积" | "楼龄" | "总价" | "单价";

    const features: Record<FeatureKey, number[]> = {
      面积: parsed.map(h => h.area_sqm),
      楼龄: parsed.map(h => h.age_years),
      总价: parsed.map(h => h.total_price_yuan),
      单价: parsed.map(h => h.unit_price),
    };

    const keys = Object.keys(features) as FeatureKey[];

    return keys.flatMap((k1, i) =>
      keys.map((k2, j) => ({
        x: i,
        y: j,
        nameX: k1,
        nameY: k2,
        value: pearson(features[k1], features[k2]),
      }))
    );
  }, [parsed]);


  return (
    <div style={{ padding: 16, background: "#0f172a", minHeight: "100vh" }}>
      {contextHolder}

      <Title level={3} style={{ color: "#e5e7eb" }}>
        房价特征统计分析 <Tag color="blue">EDA</Tag>
      </Title>
      <Text style={{ color: "#9ca3af" }}>
        对房价、结构特征及相关性进行统计分析
      </Text>

      <Divider style={{ borderColor: "#1f2937" }} />

      {loading && <Skeleton active />}

      {!loading && stats && (
        <>
          <Row gutter={16}>
            <Col span={8}>
              <Card style={cardStyle}>
                <Statistic title="房源数量" value={stats.total} />
              </Card>
            </Col>
            <Col span={8}>
              <Card style={cardStyle}>
                <Statistic title="平均总价" value={formatWan(stats.avgPrice)} />
              </Card>
            </Col>
            <Col span={8}>
              <Card style={cardStyle}>
                <Statistic
                  title="平均单价"
                  value={Math.round(stats.avgUnitPrice)}
                  suffix="元/㎡"
                />
              </Card>
            </Col>
          </Row>
          <Divider />
        </>
      )}

      {/* ===== 3.1.2 价格分布 ===== */}
      <Row gutter={16}>
        <Col span={12}>
          <Card title="图3-1 总价分布图" style={cardStyle}>
            <ResponsiveContainer height={260}>
              <BarChart data={totalPriceHist}>
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#60a5fa" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="图3-2 单价分布图" style={cardStyle}>
            <ResponsiveContainer height={260}>
              <BarChart data={unitPriceHist}>
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#34d399" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Divider />

      {/* ===== 3.1.3 特征分布 ===== */}
      <Row gutter={16}>
        <Col span={12}>
          <Card title="图3-3(a) 面积分布" style={cardStyle}>
            <ResponsiveContainer height={260}>
              <BarChart data={areaHist}>
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#a78bfa" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="图3-3(b) 楼龄分布" style={cardStyle}>
            <ResponsiveContainer height={260}>
              <BarChart data={ageHist}>
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#fbbf24" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Divider />

      {/* ===== 3.1.4 相关性热力图 ===== */}
      <Card title="图3-4 特征相关性热力图" style={cardStyle}>
        <ResponsiveContainer height={320}>
          <ScatterChart>
            <XAxis type="number" dataKey="x" tickFormatter={i => corrData[i]?.nameX} />
            <YAxis type="number" dataKey="y" tickFormatter={i => corrData[i]?.nameY} />
            <Tooltip formatter={(v: number) => v.toFixed(2)} />
            <Scatter data={corrData} shape="square">
              {corrData.map((d, i) => (
                <Cell
                  key={i}
                  fill={`rgba(96,165,250,${Math.abs(d.value)})`}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </Card>

      <Divider />

      {/* ===== 3.1.5 共线性分析 ===== */}
      <Row gutter={16}>
        <Col span={12}>
          <Card title="图3-5(a) 面积 vs 总价" style={cardStyle}>
            <ResponsiveContainer height={260}>
              <ScatterChart>
                <XAxis dataKey="area_sqm" unit="㎡" />
                <YAxis dataKey="total_price_yuan" tickFormatter={formatWan} />
                <Tooltip />
                <Scatter data={parsed} fill="#38bdf8" />
              </ScatterChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="图3-5(b) 单价 vs 总价" style={cardStyle}>
            <ResponsiveContainer height={260}>
              <ScatterChart>
                <XAxis dataKey="unit_price" unit="元/㎡" />
                <YAxis dataKey="total_price_yuan" tickFormatter={formatWan} />
                <Tooltip />
                <Scatter data={parsed} fill="#f472b6" />
              </ScatterChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default VisualizationPage;

// src/App.tsx
import type { ReactNode } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { Layout, Menu, Button, Typography, Space } from "antd";
import {
  ApartmentOutlined,
  LineChartOutlined,
  UserOutlined,
  HomeOutlined,
  LogoutOutlined,
} from "@ant-design/icons";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import PredictPage from "./pages/PredictPage";
import HouseCrudPage from "./pages/HouseCrudPage";
import AccountPage from "./pages/AccountPage";
import VisualizationPage from "./pages/VisualizationPage";
import { getToken, clearToken } from "./auth/token";

const { Sider, Header, Content } = Layout;
const { Text } = Typography;

const isAuthenticated = () => !!getToken();

function ProtectedRoute({ children }: { children: ReactNode }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

/** 登录后主布局 */
function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const path = location.pathname;
  let selectedKey = "predict";
  if (path.startsWith("/houses")) selectedKey = "houses";
  else if (path.startsWith("/account")) selectedKey = "account";
  else if (path.startsWith("/visualization")) selectedKey = "visualization";

  const handleLogout = () => {
    clearToken?.(); // 如果你没有 clearToken，就删掉这一行，把 token 清理逻辑放这里
    navigate("/login", { replace: true });
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        width={230}
        style={{
          background: "#020617",
          borderRight: "1px solid #111827",
        }}
      >
        {/* 左上角 logo / 标题 */}
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 600,
            fontSize: 18,
            color: "#e5e7eb",
            borderBottom: "1px solid #111827",
          }}
        >
          🏠 房价预测系统
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          onClick={({ key }) => {
            if (key === "predict") navigate("/predict");
            if (key === "houses") navigate("/houses");
            if (key === "visualization") navigate("/visualization");
            if (key === "account") navigate("/account");
          }}
          style={{
            paddingTop: 12,
            background: "#020617",
          }}
          items={[
            {
              key: "predict",
              icon: <HomeOutlined />,
              label: "房价预测",
            },
            {
              key: "houses",
              icon: <ApartmentOutlined />,
              label: "房源增删改查",
            },
            {
              key: "visualization",
              icon: <LineChartOutlined />,
              label: "可视化大屏",
            },
            {
              key: "account",
              icon: <UserOutlined />,
              label: "我的信息",
            },
          ]}
        />
      </Sider>

      <Layout>
        {/* 顶部细白条 */}
        <Header
          style={{
            background: "#020617",
            borderBottom: "1px solid #111827",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 20px",
          }}
        >
          <Text style={{ color: "#e5e7eb", fontSize: 16 }}>
            房价预测 & 房源管理后台
          </Text>
          <Space>
            <Text type="secondary" style={{ fontSize: 13 }}>
              已登录
            </Text>
            <Button
              size="small"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
            >
              退出登录
            </Button>
          </Space>
        </Header>

        <Content
          style={{
            background: "#020617",
            padding: 24,
          }}
        >
          <div
            style={{
              maxWidth: 1120,
              margin: "0 auto",
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 登录/注册 */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* 受保护的主应用 */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/predict" element={<PredictPage />} />
          <Route path="/houses" element={<HouseCrudPage />} />
          <Route path="/visualization" element={<VisualizationPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/" element={<Navigate to="/predict" replace />} />
        </Route>

        {/* 兜底 */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

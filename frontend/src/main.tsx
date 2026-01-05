// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ConfigProvider, theme } from "antd";
import zhCN from "antd/locale/zh_CN";

import "antd/dist/reset.css";
import "./index.css";
import App from "./App";

const { defaultAlgorithm } = theme;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: defaultAlgorithm,
        token: {
          colorBgBase: "#f5f7fa",          // 整体背景
          colorBgContainer: "#ffffff",     // Card/Table 背景
          colorBorder: "#e5e7eb",
          colorTextBase: "#1f2937",
          colorTextSecondary: "#6b7280",
          borderRadiusLG: 12,
        },
      }}
    >
      <App />
    </ConfigProvider>
  </StrictMode>
);

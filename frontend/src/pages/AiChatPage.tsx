import { useState } from "react";
import { Card, Input, Button, Typography, Space } from "antd";
import aiClient from "../api/ai";
import { getToken } from "../auth/token";

const token = getToken();

const { TextArea } = Input;
const { Paragraph, Text } = Typography;

export default function AiChatPage() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!question.trim()) return;

    setLoading(true);
    setAnswer("");

    try {
      const res = await aiClient.post("/ai/chat", {
        question,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`, // backend 登录拿到的
        },
      }
    );
      setAnswer(res.data.answer);
    } catch (err) {
      setAnswer("❌ AI 服务暂时不可用");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="AI 问答助手">
      <Space direction="vertical" style={{ width: "100%" }} size={16}>
        <TextArea
          rows={4}
          placeholder="请输入你想问的问题，例如：这个区域的房价为什么偏高？"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />

        <Button
          type="primary"
          loading={loading}
          onClick={handleAsk}
        >
          发送
        </Button>

        {answer && (
          <Paragraph>
            <Text strong>🤖 AI：</Text>
            <Paragraph style={{ marginTop: 8 }}>
              {answer}
            </Paragraph>
          </Paragraph>
        )}
      </Space>
    </Card>
  );
}

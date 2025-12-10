import { Card, Table, Input, Tag, Select, Button, Space, message } from "antd";
import { useState } from "react";

interface HouseMeta {
  id: number;
  title: string;
  size: number;
  orientation: string;
  floor: string;
  status: "未标注" | "已标注";
}

export default function MetadataPage() {
  const [data, setData] = useState<HouseMeta[]>([
    {
      id: 1001,
      title: "朝阳区 · 精装一居室",
      size: 45,
      orientation: "南",
      floor: "10/20",
      status: "已标注",
    },
    {
      id: 1002,
      title: "海淀区 · 两居室",
      size: 88,
      orientation: "东南",
      floor: "6/18",
      status: "未标注",
    },
  ]);

  const saveRow = (record: HouseMeta) => {
    message.success(`已保存：${record.title}`);
  };

  const columns = [
    {
      title: "标题",
      dataIndex: "title",
      width: 200,
    },
    {
      title: "面积(㎡)",
      dataIndex: "size",
      width: 120,
      render: (_: any, record: HouseMeta) => (
        <Input
          style={{ width: 80 }}
          value={record.size}
          onChange={(e) => {
            record.size = Number(e.target.value);
            setData([...data]);
          }}
        />
      ),
    },
    {
      title: "朝向",
      dataIndex: "orientation",
      width: 140,
      render: (_: any, record: HouseMeta) => (
        <Select
          value={record.orientation}
          onChange={(v) => {
            record.orientation = v;
            setData([...data]);
          }}
          style={{ width: 120 }}
          options={[
            { value: "南", label: "南" },
            { value: "北", label: "北" },
            { value: "东", label: "东" },
            { value: "西", label: "西" },
            { value: "东南", label: "东南" },
            { value: "西南", label: "西南" },
          ]}
        />
      ),
    },
    {
      title: "楼层",
      dataIndex: "floor",
      width: 120,
      render: (_: any, record: HouseMeta) => (
        <Input
          style={{ width: 90 }}
          value={record.floor}
          onChange={(e) => {
            record.floor = e.target.value;
            setData([...data]);
          }}
        />
      ),
    },
    {
      title: "状态",
      dataIndex: "status",
      width: 120,
      render: (status: HouseMeta["status"]) => (
        <Tag color={status === "已标注" ? "success" : "default"}>{status}</Tag>
      ),
    },
    {
      title: "操作",
      width: 160,
      render: (_: any, record: HouseMeta) => (
        <Button type="primary" size="small" onClick={() => saveRow(record)}>
          保存
        </Button>
      ),
    },
  ];

  return (
    <Card
      title="房屋元数据标注后台"
      extra={<Button>导出标注数据</Button>}
    >
      <Table rowKey="id" columns={columns} dataSource={data} pagination={{ pageSize: 5 }} />
    </Card>
  );
}

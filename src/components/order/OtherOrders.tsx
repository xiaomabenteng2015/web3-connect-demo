import { useWriteExchangeFillOrder } from "@/generated";
import { ETHER_ADDRESS, useBalances } from "@/hooks/useBalances";
import { useOrders } from "@/hooks/useOrders";
import { Orders } from "@/stores/useOrderStore";
import { App, Button, Popconfirm, Space, Table, Typography } from "antd";
import { ColumnsType } from "antd/es/table";
import day from "dayjs";
import { useMemo } from "react";
import { formatEther } from "viem";
import { useAccount } from "wagmi";

export const OtherOrders = () => {
  const { address } = useAccount();
  if (!address) return null;
  const { ordersInTransactionsData } = useOrders();
  const otherOrdersData = useMemo(() => {
    return ordersInTransactionsData
      .filter((order) => order.args.user !== address)
      .map((order) => {
        return order.args;
      });
  }, [ordersInTransactionsData, address]);

  const { message } = App.useApp();
  const { writeContractAsync } = useWriteExchangeFillOrder();
  const { invalidateQueries } = useBalances({
    address,
  });
  const columns: ColumnsType<Orders[number]["args"]> = [
    {
      title: "时间",
      dataIndex: "timestamp",
      width: 40,
      render: (time) => {
        return (
          <Typography.Text
            ellipsis={{
              tooltip: {
                title: day(Number(time) * 1000).format("YYYY-MM-DD HH:mm:ss"),
              },
            }}
          >
            {day(Number(time) * 1000).format("YYYY-MM-DD HH:mm:ss")}
          </Typography.Text>
        );
      },
      sorter: (a, b) => Number(a.timestamp) - Number(b.timestamp),
    },
    {
      title: "获取",
      width: 25,
      render: (_, record) => {
        return (
          <Typography.Text
            type="warning"
            ellipsis={{
              tooltip: { title: formatEther(record.giveToken?.amount!) },
            }}
          >
            {formatEther(record.giveToken?.amount!)}{" "}
            {record.giveToken?.token === ETHER_ADDRESS ? "ETH" : "YXT"}
          </Typography.Text>
        );
      },
      sorter: (a, b) =>
        Number(a.giveToken?.amount) - Number(b.giveToken?.amount),
    },
    {
      title: "支出",
      width: 25,
      render: (_, record) => {
        return (
          <Typography.Text
            type="success"
            ellipsis={{
              tooltip: { title: formatEther(record.getToken?.amount!) },
            }}
          >
            {formatEther(record.getToken?.amount!)}{" "}
            {record.getToken?.token === ETHER_ADDRESS ? "ETH" : "YXT"}
          </Typography.Text>
        );
      },
      sorter: (a, b) => Number(a.getToken?.amount) - Number(b.getToken?.amount),
    },

    {
      title: "操作",
      width: 25,
      render: (_, record) => {
        return (
          <Space align="center">
            <Popconfirm
              title="是否买入该订单？"
              description="您确定买入该订单吗?"
              onConfirm={async () => {
                try {
                  message.open({
                    content: "买入订单中...",
                    key: `cancel-${record.id}`,
                    type: "loading",
                    duration: 0,
                  });
                  await writeContractAsync({
                    args: [record.id!],
                  });
                  invalidateQueries();
                  message.open({
                    content: "买入订单成功",
                    key: `cancel-${record.id}`,
                    type: "success",
                    duration: 2,
                  });
                } catch (error) {
                  message.open({
                    content: "买入订单失败",
                    key: `cancel-${record.id}`,
                    type: "error",
                    duration: 2,
                  });
                }
              }}
              okText="确定"
              cancelText="取消"
            >
              <Button type="primary" size="small">
                买入
              </Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];
  return (
    <Table<Orders[number]["args"]>
      rowKey={(record) => record.id!}
      columns={columns}
      dataSource={otherOrdersData}
    />
  );
};

import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell, Legend } from "recharts";
import { Box } from "@mui/material";

interface ISpendingByPaymentMethodChartProps {
  paymentMethodSpending: { payment_method: string; amount: number }[];
  currency: string;
}

const graphColors = ["#8884d8", "#82ca9d", "#ff8c00", "#d0ed57"];

const SpendingByPaymentMethodChart = ({ paymentMethodSpending, currency }: ISpendingByPaymentMethodChartProps) => {
  const paymentMethodData = paymentMethodSpending.map((item, index) => ({
    name: item.payment_method,
    amount: item.amount,
    color: graphColors[index % graphColors.length],
  }));

  return (
    <Box sx={chartContainerStyle}>
      <h3>Spending by Payment Method ({currency})</h3>
      <ResponsiveContainer width="100%" height={360}>
        <PieChart>
          <Pie
            data={paymentMethodData}
            dataKey="amount"
            nameKey="name"
            cx="50%"
            cy="80%"
            innerRadius={150}
            outerRadius={240}
            startAngle={0}
            endAngle={180}
            paddingAngle={5}
          >
            {paymentMethodData.map((entry, idx) => (
              <Cell key={`payment-cell-${idx}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={customTooltip} />
          <Legend
            verticalAlign="bottom"
            align="center"
            iconSize={24}
            layout="horizontal"
            formatter={(value, entry) => <span style={{ color: entry.color }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  );
};

const customTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const { name, amount } = payload[0].payload;
    return (
      <Box sx={tooltipStyle}>
        <strong>{name}</strong>
        <p>Total: ${amount.toFixed(2)}</p>
      </Box>
    );
  }
  return null;
};

const chartContainerStyle = {
  flex: 3,
  boxShadow: "0px 8px 8px rgba(0, 0, 0, 0.1)",
  padding: "16px",
  borderRadius: "8px",
  fontFamily: "Arial, Helvetica, sans-serif",
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-start",
  height: "100%",
};

const tooltipStyle = {
  padding: "8px",
  backgroundColor: "#fff",
  borderRadius: "5px",
};

export default SpendingByPaymentMethodChart;

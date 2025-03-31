import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Box } from "@mui/material";

interface ISpendingOverTimeChartProps {
  spendingData: { date: string; amount: number }[];
  currency: string;
}

const SpendingOverTimeChart = ({ spendingData, currency }: ISpendingOverTimeChartProps) => {
  const sortedSpendingData = [...spendingData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <Box sx={chartContainerStyle}>
      <h3>Spending Over Time ({currency})</h3>
      <ResponsiveContainer width="100%" height={360}>
        <LineChart data={sortedSpendingData}>
          <CartesianGrid
            strokeWidth={2} 
            stroke="#f0f0f0" 
            vertical={true} 
            horizontal={false} 
          />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="amount" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

const chartContainerStyle = {
  flex: 1,
  boxShadow: "0px 8px 8px rgba(0, 0, 0, 0.1)",
  padding: "16px",
  borderRadius: "8px",
  fontFamily: "Arial, Helvetica, sans-serif",
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-start",
};

export default SpendingOverTimeChart;

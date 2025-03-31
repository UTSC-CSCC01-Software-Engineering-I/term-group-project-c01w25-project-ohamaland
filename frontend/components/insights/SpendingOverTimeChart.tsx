import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { background, chart } from "@/styles/colors";

interface ISpendingOverTimeChartProps {
  spendingData: { date: string; amount: number }[];
  currency: string;
}

const SpendingOverTimeChart = ({ spendingData, currency }: ISpendingOverTimeChartProps) => {
  const sortedSpendingData = [...spendingData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div
      style={{
        flex: 1,
        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
        padding: "16px",
        borderRadius: "8px",
        fontFamily: "Arial, Helvetica, sans-serif",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
      }}
    >
      <h3>Spending Over Time ({currency})</h3>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={sortedSpendingData}>
          <CartesianGrid
            strokeWidth={2} 
            stroke="#f0f0f0" // Grid line color (this creates the alternating pattern)
            vertical={true} // Apply vertical grid lines
            horizontal={false} // Only apply horizontal grid lines
          />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="amount" stroke={chart.line} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SpendingOverTimeChart;

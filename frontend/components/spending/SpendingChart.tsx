import { PieChart, Pie, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface ISpendingChartProps {
  spendingData: { category: string; amount: number; date: string }[];
}

export default function SpendingChart(props: ISpendingChartProps) {
  return (
    <div style={chartContainerStyle}>
      {/* Pie Chart - Spending by Category */}
      <div style={chartStyle}>
        <h3>Spending by Category</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={props.spendingData}
              dataKey="amount"
              nameKey="category"
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              label
            />
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Line Chart - Spending Over Time */}
      <div style={chartStyle}>
        <h3>Spending Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={props.spendingData}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="amount" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const chartContainerStyle = {
  display: "flex",
  gap: "20px",
  flexWrap: "wrap" as const,
  justifyContent: "center" as const,
};

const chartStyle = {
  width: "45%",
  minWidth: "300px",
};

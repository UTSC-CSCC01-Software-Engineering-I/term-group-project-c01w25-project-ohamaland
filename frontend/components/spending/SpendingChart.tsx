import { PieChart, Pie, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,  } from "recharts";

interface ISpendingChartProps {
  spendingData: { category: string; amount: number; date: string }[];
  categorySpending: { [key in keyof typeof categoryColors]?: number };
}

const categoryColors = {
  Home: "#FF5733",         // Warm color for Home
  Food: "#FF8C00",         // Orange for Food
  Clothing: "#C70039",     // Bold red for Clothing
  Utilities: "#900C3F",    // Darker red for Utilities
  Entertainment: "#FFCD00", // Yellow for Entertainment
  Fixtures: "#DAF7A6",     // Light green for Fixtures
  Furniture: "#581845",    // Purple for Furniture
  Health: "#00C49F",       // Teal for Health
  Beauty: "#FFB6C1",       // Light pink for Beauty
  Electronics: "#0088FE",  // Blue for Electronics
};

const renderCustomizedLabel = (props: any) => {
  const { cx, cy, midAngle, outerRadius, percent, payload } = props;
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 20; // Adjust distance from the pie
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  
  // Get the color from categoryColors
  const color = categoryColors[payload.category as keyof typeof categoryColors] || "#000";

  return (
    <text x={x} y={y} fill={color} textAnchor={x > cx ? "start" : "end"} dominantBaseline="central">
      {`${payload.category}: ${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function SpendingChart(props: ISpendingChartProps) {
  console.log("Props received:", props);
  console.log("categorySpending:", props.categorySpending);
  const sortedSpendingData = [...props.spendingData]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .reverse();
  
  const aggregatedData = Object.entries(props.categorySpending || {}).map(([category, amount]) => ({
    category,
    amount,
  }));
  console.log("Aggregated Data for PieChart:", aggregatedData);

  const totalAmount = aggregatedData.reduce((total, item) => total + item.amount, 0);
  console.log("Spending Data:", sortedSpendingData);
  return (
    <div style={chartContainerStyle}>
      {/* Pie Chart - Spending by Category */}
      <div style={chartStyle}>
        <h3>Spending by Category</h3>
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={aggregatedData}
              dataKey="amount"
              nameKey="category"
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              label={renderCustomizedLabel}
            >
              {aggregatedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={categoryColors[entry.category as keyof typeof categoryColors] || "#8884d8"} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => `${(value / totalAmount * 100).toFixed(2)}%`} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Line Chart - Spending Over Time */}
      <div style={chartStyle}>
        <h3>Spending Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={sortedSpendingData}>
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
  minWidth: "450px",
  backgroundColor: "#f0f0f0", 
  padding: "16px",              
  borderRadius: "8px",          
};

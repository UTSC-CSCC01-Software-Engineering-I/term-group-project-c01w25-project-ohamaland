import { PieChart, Pie, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { chart, background } from '@/styles/colors';

interface ISpendingChartProps {
  data: {
    date: string;
    amount: number;
    category: string;
  }[];
}

const categoryColors = {
  Home: chart.home,
  Food: chart.food,
  Clothing: chart.clothing,
  Utilities: chart.utilities,
  Entertainment: chart.entertainment,
  Fixtures: chart.fixtures,
  Furniture: chart.furniture,
  Health: chart.health,
  Beauty: chart.beauty,
  Electronics: chart.electronics,
} as const;

export default function SpendingChart(props: ISpendingChartProps) {
  console.log("Props received:", props);
  const sortedSpendingData = [...props.data]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .reverse();

  const aggregatedData = Object.entries(
    props.data.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.amount;
      return acc;
    }, {} as Record<string, number>)
  ).map(([category, amount]) => ({
    category,
    amount,
  }));

  return (
    <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
      <div style={{ width: "45%", minWidth: "450px", backgroundColor: background.light, padding: "16px", borderRadius: "8px" }}>
        <h3>Spending by Category</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={aggregatedData}
              dataKey="amount"
              nameKey="category"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {aggregatedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={categoryColors[entry.category as keyof typeof categoryColors] || chart.default} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div style={{ width: "45%", minWidth: "450px", backgroundColor: background.light, padding: "16px", borderRadius: "8px" }}>
        <h3>Spending Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={sortedSpendingData}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="amount" stroke={chart.line} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

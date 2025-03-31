import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { background } from "@/styles/colors";

interface ISpendingByMerchantChartProps {
  merchantSpending: { merchant: string; amount: number }[];
  currency: string;
}

const SpendingByMerchantChart = ({ merchantSpending, currency }: ISpendingByMerchantChartProps) => {
  const graphColors = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"];

  const merchantData = merchantSpending.map((item, index) => ({
    name: item.merchant,
    amount: item.amount,
    color: graphColors[index % graphColors.length]
  }));

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
      <h3>Spending by Merchant ({currency})</h3>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={merchantData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const { name, amount } = payload[0].payload;
                return (
                  <div className="custom-tooltip" style={{ padding: "10px", backgroundColor: "#fff", borderRadius: "5px" }}>
                    <strong>{name}</strong>
                    <p>Total: ${amount.toFixed(2)}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="amount" fill="#8884d8">
            {merchantData.map((entry, idx) => (
              <Cell key={`merchant-bar-${idx}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SpendingByMerchantChart;

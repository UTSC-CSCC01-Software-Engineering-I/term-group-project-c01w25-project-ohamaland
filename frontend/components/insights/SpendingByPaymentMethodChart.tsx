import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell, Legend } from "recharts";
import { background } from "@/styles/colors";

interface ISpendingByPaymentMethodChartProps {
  paymentMethodSpending: { payment_method: string; amount: number }[];
  currency: string;
}

const SpendingByPaymentMethodChart = ({ paymentMethodSpending, currency }: ISpendingByPaymentMethodChartProps) => {
  const graphColors = ["#8884d8", "#82ca9d", "#ff8c00", "#d0ed57"];

  const paymentMethodData = paymentMethodSpending.map((item, index) => ({
    name: item.payment_method,
    amount: item.amount,
    color: graphColors[index % graphColors.length]
  }));

  return (
    <div
      style={{
        flex: 3,
        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
        padding: "16px",
        borderRadius: "8px",
        fontFamily: "Arial, Helvetica, sans-serif",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        height: "100%",
      }}
    >
      <h3>Spending by Payment Method ({currency})</h3>
      <ResponsiveContainer width="100%" height={350}>
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
          <Legend
            verticalAlign="bottom"
            align="center"
            iconSize={20}
            layout="horizontal"
            formatter={(value, entry) => {
              const { color } = entry;
              return (
                <span style={{ color }}>
                  {value}
                </span>
              );
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SpendingByPaymentMethodChart;

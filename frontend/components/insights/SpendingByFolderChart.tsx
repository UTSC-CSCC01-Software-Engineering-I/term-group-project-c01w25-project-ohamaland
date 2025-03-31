import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell, Legend } from "recharts";
import { background } from "@/styles/colors";

interface ISpendingByFolderChartProps {
  folderSpending: {
    [folderName: string]: [number, string];
  };
  currency: string;
}

const SpendingByFolderChart = ({ folderSpending, currency }: ISpendingByFolderChartProps) => {
  const folderData = Object.entries(folderSpending).map(([folder, [amount, color]]) => ({
    name: folder,
    amount,
    color
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
        flexDirection: "column", // Ensures proper stacking of content
        justifyContent: "center", // Centers the content
      }}
    >
      <h3>Spending by Folder ({currency})</h3>
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={folderData}
            dataKey="amount"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
          >
            {folderData.map((entry, idx) => (
              <Cell key={`folder-cell-${idx}`} fill={entry.color} />
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

export default SpendingByFolderChart;
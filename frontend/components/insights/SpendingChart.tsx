import { background, chart } from "@/styles/colors";
import {
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

interface ISpendingChartProps {
  folderSpending: {
    [folderName: string]: [number, string];
  };
  spendingData: {
    date: string;
    amount: number;
  }[];
  merchantSpending: {
    merchant: string;
    amount: number;
  }[];
}

interface IPieChartPayload {
  payload: {
    name: string;
    amount: number;
    color?: string;
  };
}

export default function SpendingChart({ folderSpending, spendingData, merchantSpending }: ISpendingChartProps) {
  console.log("folderSpending:", folderSpending);
  console.log("spendingData:", spendingData);
  console.log("merchantSpending:", merchantSpending);
  const folderData = Object.entries(folderSpending).map(([folder, [amount, color]]) => ({
    name: folder,
    amount,
    color
  }));

  const merchantColors = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"];
  const merchantData = merchantSpending.map((item, index) => ({
    name: item.merchant,
    amount: item.amount,
    color: merchantColors[index % merchantColors.length]
  }));

  const sortedSpendingData = [...spendingData].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div
      style={{
        display: "flex",
        gap: "20px",
        justifyContent: "space-between",
        width: "100%",
        padding: "16px",
        flexWrap: "nowrap", // Ensure all three charts stay in one row
        overflowX: "auto" // Prevents overflow issues
      }}
    >
      {/* Spending by Folder Pie Chart */}
      <div
        style={{
          flex: 1,
          minWidth: "33%",
          maxWidth: "33%",
          backgroundColor: background.light,
          padding: "16px",
          borderRadius: "8px",
          fontFamily: "Arial, Helvetica, sans-serif",
          textAlign: "center"
        }}
      >
        <h3>Spending by Folder</h3>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={folderData}
              dataKey="amount"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={({ name }) => name}
            >
              {folderData.map((entry, idx) => (
                <Cell key={`folder-cell-${idx}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }: { active?: boolean; payload?: IPieChartPayload[] }) => {
                if (active && payload && payload.length) {
                  const { name, amount } = payload[0].payload;
                  return (
                    <div className="custom-tooltip" style={{ padding: "10px", backgroundColor: "#fff", borderRadius: "5px", fontFamily: "Arial, Helvetica, sans-serif" }}>
                      <strong>{name}</strong>
                      <p>Total: ${amount.toFixed(2)}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Spending Over Time Line Chart */}
      <div
        style={{
          flex: 1,
          minWidth: "33%",
          maxWidth: "33%",
          backgroundColor: background.light,
          padding: "16px",
          borderRadius: "8px",
          fontFamily: "Arial, Helvetica, sans-serif",
          textAlign: "center"
        }}
      >
        <h3>Spending Over Time</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={sortedSpendingData}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="amount" stroke={chart.line} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Spending by Merchant Pie Chart */}
      <div
        style={{
          flex: 1,
          minWidth: "33%",
          maxWidth: "33%",
          backgroundColor: background.light,
          padding: "16px",
          borderRadius: "8px",
          fontFamily: "Arial, Helvetica, sans-serif",
          textAlign: "center"
        }}
      >
        <h3>Spending by Merchant</h3>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={merchantData}
              dataKey="amount"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={({ name }) => name}
            >
              {merchantData.map((entry, idx) => (
                <Cell key={`merchant-cell-${idx}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }: { active?: boolean; payload?: IPieChartPayload[] }) => {
                if (active && payload && payload.length) {
                  const { name, amount } = payload[0].payload;
                  return (
                    <div className="custom-tooltip" style={{ padding: "10px", backgroundColor: "#fff", borderRadius: "5px", fontFamily: "Arial, Helvetica, sans-serif" }}>
                      <strong>{name}</strong>
                      <p>Total: ${amount.toFixed(2)}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

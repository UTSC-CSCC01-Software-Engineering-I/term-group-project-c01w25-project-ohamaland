import { Box, Typography } from "@mui/material";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  TooltipProps
} from "recharts";

interface ISpendingByFolderChartProps {
  folderSpending: {
    [folderName: string]: [number, string];
  };
  currency: string;
}

const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const { name, amount } = payload[0].payload;
    return (
      <Box sx={tooltipStyle}>
        <Typography variant="subtitle2">{name}</Typography>
        <Typography variant="body2">Total: ${amount.toFixed(2)}</Typography>
      </Box>
    );
  }
  return null;
};

const LegendFormatter = (value: string, entry: { color?: string }) => {
  return <span style={{ color: entry.color || "black" }}>{value}</span>;
};

const SpendingByFolderChart = ({
  folderSpending,
  currency
}: ISpendingByFolderChartProps) => {
  const folderData = Object.entries(folderSpending).map(
    ([folder, [amount, color]]) => ({
      name: folder,
      amount,
      color
    })
  );

  return (
    <Box sx={chartContainerStyle}>
      <h3>Spending by Folder ({currency})</h3>
      <ResponsiveContainer width="100%" height={360}>
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
          <Tooltip content={CustomTooltip} />
          <Legend
            verticalAlign="bottom"
            align="center"
            iconSize={24}
            layout="horizontal"
            formatter={LegendFormatter}
          />
        </PieChart>
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
  justifyContent: "center"
};

const tooltipStyle = {
  padding: "8px",
  backgroundColor: "#fff",
  borderRadius: "5px",
  boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.2)"
};

export default SpendingByFolderChart;

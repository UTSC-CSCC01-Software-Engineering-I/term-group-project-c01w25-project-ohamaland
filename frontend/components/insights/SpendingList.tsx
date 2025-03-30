import { CSSProperties } from "react";

interface ISpendingListProps {
  folderSpending: Record<string, [number, string]>;
  onOpenFolder: (folderName: string) => void;
}

export default function SpendingList(props: ISpendingListProps) {
  return (
    <div style={listContainerStyle}>
      {Object.entries(props.folderSpending).map(([folderName, [amount, color]]) => (
        <div
          key={folderName}
          style={{ ...listItemStyle, backgroundColor: color }}
          onClick={() => props.onOpenFolder(folderName)}
        >
          <span>{folderName}</span>
          <span>${amount.toFixed(2)}</span>
        </div>
      ))}
    </div>
  );
}

// Define styles with correct types
const listContainerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 10,
  padding: "16px"
};

const listItemStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  padding: 10,
  border: "1px solid #ddd",
  borderRadius: 5,
  cursor: "pointer",
  transition: "background-color 0.3s ease, transform 0.2s ease",
  boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
};

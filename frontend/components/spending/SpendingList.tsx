import { CSSProperties } from "react";

interface ISpending {
  id: number;
  category: string;
  amount: number;
  date: string;
}

interface ISpendingListProps {
  spending: ISpending[];
  onOpenDialog: (spending: ISpending) => void;
}

export default function SpendingList(props: ISpendingListProps) {
  return (
    <div style={listContainerStyle}>
      {props.spending.map((item) => (
        <div key={item.id} style={listItemStyle} onClick={() => props.onOpenDialog(item)}>
          <span>{item.date}</span>
          <span>{item.category}</span>
          <span>${item.amount}</span>
        </div>
      ))}
    </div>
  );
}

// Define styles with correct types
const listContainerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column" as const, // Ensures TypeScript recognizes it
  gap: 10, // Use a number instead of a string for spacing
};

const listItemStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  padding: 10, // Use a number instead of "10px"
  border: "1px solid #ddd",
  borderRadius: 5,
  cursor: "pointer",
};

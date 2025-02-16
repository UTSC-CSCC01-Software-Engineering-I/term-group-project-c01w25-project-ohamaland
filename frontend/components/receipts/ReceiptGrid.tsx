import { Category, Receipt } from "@/types/receipts";
import { Grid2 } from "@mui/material";
import { Dayjs } from "dayjs";
import ReceiptCard from "./ReceiptCard";

interface IReceiptGridProps {
  receipts: Receipt[];
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  filterTerm: string;
  category: Category;
  onOpenDialog: (receipt: Receipt) => void;
}

export default function ReceiptGrid(props: IReceiptGridProps) {
  const filteredReceipts = filterReceipts(
    props.receipts,
    props.startDate,
    props.endDate,
    props.filterTerm,
    props.category
  );

  return (
    <div
      style={{
        maxHeight: "60vh",
        overflowY: "auto",
        marginTop: "20px",
        backgroundColor: "transparent",
        paddingRight: "10px"
      }}
    >
    <Grid2 container spacing={3}>
        {filteredReceipts.map((receipt, index) => (
          <ReceiptCard
            key={`${receipt.id}-${index}`}
            receipt={receipt}
            onClick={() => props.onOpenDialog(receipt)}
          />
      ))}
    </Grid2>
      <style jsx global>{`
        /* Transparent scrollbar style */
        div::-webkit-scrollbar {
          width: 8px; /* Scrollbar width */
        }

        div::-webkit-scrollbar-track {
          background: transparent; /* Transparent track */
        }

        div::-webkit-scrollbar-thumb {
          background-color: rgba(0, 0, 0, 0.1); /* Slightly visible thumb */
          border-radius: 10px;
        }

        div::-webkit-scrollbar-thumb:hover {
          background-color: rgba(0, 0, 0, 0.2); /* Darker on hover */
        }
      `}</style>
    </div>
  );
}

// TODO: Move this into a separate file in the future with helpers
function filterReceipts(
  receipts: Receipt[],
  startDate: Dayjs | null,
  endDate: Dayjs | null,
  filterTerm: string,
  category: Category
): Receipt[] {
  return receipts.filter((receipt) => {
    const receiptDate = new Date(receipt.date);

    // checking the date restrictions
    if (startDate && receiptDate < startDate.toDate()) {
      return false;
    }

    if (endDate && receiptDate > endDate.toDate()) {
      return false;
    }

    const lowercaseFilterTerm = filterTerm.toLowerCase();
    const merchantMatch = receipt.merchant
      .toLowerCase()
      .includes(lowercaseFilterTerm);
    const itemMatch = receipt.items.some((item) =>
      item.name.toLowerCase().includes(lowercaseFilterTerm)
    );

    if (filterTerm && !merchantMatch && !itemMatch) {
      return false;
    }

    if (
      category !== "All" &&
      !receipt.items.some((item) => item.category === category)
    ) {
      return false;
    }

    return true;
  });
}

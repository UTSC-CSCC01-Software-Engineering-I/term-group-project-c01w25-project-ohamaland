import { Category, Receipt } from "@/types/receipts";
import { filterReceipts } from "@/utils/filters";
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
    <Grid2 container spacing={3} sx={gridStyle}>
      {filteredReceipts.map((receipt, index) => (
        <ReceiptCard
          key={`${receipt.id}-${index}`}
          receipt={receipt}
          onClick={() => props.onOpenDialog(receipt)}
        />
      ))}
    </Grid2>
  );
}

const gridStyle = {
  maxHeight: "80vh", // TODO: change this in the future using vh is not good should take max possible
  overflowY: "auto",
  marginTop: "24px"
};

import { Category, Receipt } from "@/types/receipts";
import { filterReceipts } from "@/utils/filters";
import { Grid2 } from "@mui/material";
import { Dayjs } from "dayjs";
import ReceiptCard from "./ReceiptCard";
import { useEffect, useState } from "react";
import DeleteConfirmationDialog from "./DeleteConfirmationDialog";

interface IReceiptGridProps {
  receipts: Receipt[];
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  filterTerm: string;
  category: Category;
  onOpenDialog: (receipt: Receipt) => void;
  onDeleteReceipt: (receiptId: number) => void;
}

export default function ReceiptGrid(props: IReceiptGridProps) {
  const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false);
  const [receiptToDelete, setReceiptToDelete] = useState<Receipt | null>(null);
  const [dontRemindMe, setDontRemindMe] = useState(() => {
    return localStorage.getItem("dont_remind_delete_receipt") === "true";
  });
  
  useEffect(() => {
    localStorage.removeItem("dont_remind_delete_receipt");
    setDontRemindMe(false);
  }, []);

  const filteredReceipts = filterReceipts(
    props.receipts,
    props.startDate,
    props.endDate,
    props.filterTerm,
    props.category
  );


  const confirmDelete = async () => {
    if (receiptToDelete) {
      props.onDeleteReceipt(receiptToDelete.id);
    }
    if (dontRemindMe) {
      localStorage.setItem("dont_remind_delete_receipt", "true");
    }
    setOpenConfirmationDialog(false);
    setReceiptToDelete(null);
  };

  const cancelDelete = () => {
    setOpenConfirmationDialog(false);
    setReceiptToDelete(null); 
  };

  const handleDeleteClick = (receipt: Receipt) => {
    console.log("Delete clicked for receipt:", receipt); // Debugging log
    setReceiptToDelete(receipt);

    if (!dontRemindMe) {
      setOpenConfirmationDialog(true);
    } else {
      props.onDeleteReceipt(receipt.id); // Auto-delete if "Don't remind me" is checked
    }
  };

  return (
    <Grid2 container spacing={3} sx={gridStyle}>
      {filteredReceipts.map((receipt, index) => (
        <ReceiptCard
          key={`${receipt.id}-${index}`}
          receipt={receipt}
          onClick={() => props.onOpenDialog(receipt)}
          onDeleteReceipt={() => handleDeleteClick(receipt)}
        />
      ))}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={openConfirmationDialog}
        onClose={cancelDelete} 
        onConfirmDelete={confirmDelete} 
        dontRemindMe={dontRemindMe}
        setDontRemindMe={setDontRemindMe}
      />
    </Grid2>
  );
}

const gridStyle = {
  maxHeight: "60vh", // TODO: change this in the future using vh is not good should take max possible
  overflowY: "auto",
  marginTop: "24px"
};

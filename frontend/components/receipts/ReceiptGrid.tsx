import { Category, Receipt } from "@/types/receipts";
import { filterReceipts } from "@/utils/filters";
import { Alert, Grid2, Snackbar } from "@mui/material";
import { Dayjs } from "dayjs";
import ReceiptCard from "./ReceiptCard";
import { useEffect, useState } from "react";
import DeleteConfirmationDialog from "./DeleteConfirmationDialog";
import { fetchWithAuth } from "@/utils/api";

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
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [dontRemindMe, setDontRemindMe] = useState(false);
  
  useEffect(() => {
    // Only access localStorage on the client side
    const dontRemind = localStorage.getItem("dont_remind_delete_receipt") === "true";
    setDontRemindMe(dontRemind);
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
      setOpenSnackbar(true);
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

  const handleDeleteClick = async (receipt: Receipt) => {
    console.log("Delete clicked for receipt:", receipt);
    setReceiptToDelete(receipt);

    if (!dontRemindMe) {
      setOpenConfirmationDialog(true);
    } else {
      try {
        const response = await fetchWithAuth(`http://127.0.0.1:8000/api/receipts/${receipt.id}/`, {
          method: "DELETE",
        });

        if (response && response.ok) {
          props.onDeleteReceipt(receipt.id);
        }
      } catch (error) {
        console.error("Error deleting receipt:", error);
      }
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

      <DeleteConfirmationDialog
        open={openConfirmationDialog}
        onClose={cancelDelete} 
        onConfirmDelete={confirmDelete} 
        dontRemindMe={dontRemindMe}
        setDontRemindMe={setDontRemindMe}
      />

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity="success">
          Receipt has been successfully deleted.
        </Alert>
      </Snackbar>
    </Grid2>
  );
}

const gridStyle = {
  maxHeight: "60vh",
  overflowY: "auto",
  marginTop: "24px"
};

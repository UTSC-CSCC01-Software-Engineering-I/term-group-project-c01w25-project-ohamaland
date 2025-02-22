import React, { useState } from "react";
import {
  Box,
  Button,
  Modal,
  TextField,
  MenuItem,
  Typography,
  Stack
} from "@mui/material";
import FilePondUpload from "./FileUpload";
import { Currency, PaymentMethod, ReceiptItem, Receipt } from "@/types/receipts";

interface ReceiptModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (newReceipt: Receipt) => void; // Function to handle saving the receipt
}

export default function ReceiptModal({ open, onClose, onSave }: ReceiptModalProps) {
  const [merchant, setMerchant] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [currency, setCurrency] = useState<Currency>("USD");
  const [date, setDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Credit Card");
  const [items, setItems] = useState<ReceiptItem[]>([]);
  const [receiptImageUrl, setReceiptImageUrl] = useState<string | null>(null);

  const handleSave = () => {
    const newReceipt: Receipt = {
      id: Date.now(), // or generate a UUID
      user_id: 1, // You can replace this with the actual user ID from your app context
      merchant,
      total_amount: parseFloat(totalAmount),
      currency,
      date,
      payment_method: paymentMethod,
      items,
      receipt_image_url: receiptImageUrl
    };
    onSave(newReceipt);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Typography variant="h6" gutterBottom sx={{ color:"black" }}>
          Add Receipt
        </Typography>

        <TextField
          label="Merchant"
          fullWidth
          value={merchant}
          onChange={(e) => setMerchant(e.target.value)}
          margin="normal"
        />

        <TextField
          label="Total Amount"
          fullWidth
          type="number"
          value={totalAmount}
          onChange={(e) => setTotalAmount(e.target.value)}
          margin="normal"
        />

        <TextField
          select
          label="Currency"
          fullWidth
          value={currency}
          onChange={(e) => setCurrency(e.target.value as Currency)}
          margin="normal"
        >
          <MenuItem value="USD">USD</MenuItem>
          <MenuItem value="CAD">CAD</MenuItem>
        </TextField>

        <TextField
          label="Date"
          type="date"
          fullWidth
          value={date}
          onChange={(e) => setDate(e.target.value)}
          margin="normal"
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          select
          label="Payment Method"
          fullWidth
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
          margin="normal"
        >
          <MenuItem value="Credit Card">Credit Card</MenuItem>
          <MenuItem value="Debit Card">Debit Card</MenuItem>
          <MenuItem value="Cash">Cash</MenuItem>
        </TextField>

        <FilePondUpload setImageUrl={setReceiptImageUrl} />
        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <Button variant="contained" color="primary" onClick={handleSave}>
            Save
          </Button>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
}

const modalStyle = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  maxHeight: "80vh", // Set max height to 80% of the viewport height
  overflow: "auto", // Allows scrolling if content overflows
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
  "&::-webkit-scrollbar": {
    width: "8px",
  },
  "&::-webkit-scrollbar-track": {
    background: "transparent",
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    borderRadius: "10px",
  },
  "&::-webkit-scrollbar-thumb:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
};

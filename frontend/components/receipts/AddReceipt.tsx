import {
  Currency,
  PaymentMethod,
  Receipt,
  ReceiptItem,
  currencies,
  paymentMethods
} from "@/types/receipts";
import {
  Box,
  Button,
  MenuItem,
  Modal,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { useState } from "react";
import FilePondUpload from "./FileUpload";

interface IAddReceiptProps {
  open: boolean;
  onClose: () => void;
  onSave: (newReceipt: Receipt) => void;
}

export default function AddReceipt(props: IAddReceiptProps) {
  const { open, onClose, onSave } = props;
  const [merchant, setMerchant] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [currency, setCurrency] = useState<Currency>("");
  const [date, setDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("");
  const [items, setItems] = useState<ReceiptItem[]>([]);
  const [receiptImageUrl, setReceiptImageUrl] = useState<string | null>(null);

  const handleSave = () => {
    const newReceipt: Receipt = {
      id: Date.now(),
      user_id: 1,
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
        <Typography sx={modalTitleStyle}>Add Receipt</Typography>

        <Stack spacing={2}>
          <TextField
            label="Merchant"
            fullWidth
            value={merchant}
            onChange={(e) => setMerchant(e.target.value)}
          />

          <TextField
            label="Total Amount"
            fullWidth
            type="number"
            value={totalAmount}
            onChange={(e) => setTotalAmount(e.target.value)}
          />

          <TextField
            select
            label="Currency"
            fullWidth
            value={currency}
            onChange={(e) => setCurrency(e.target.value as Currency)}
          >
            {currencies.map((curr) => (
              <MenuItem key={curr} value={curr}>
                {curr}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Date"
            type="date"
            fullWidth
            value={date}
            onChange={(e) => setDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            select
            label="Payment Method"
            fullWidth
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
          >
            {paymentMethods.map((method) => (
              <MenuItem key={method} value={method}>
                {method}
              </MenuItem>
            ))}
          </TextField>

          <FilePondUpload setImageUrl={setReceiptImageUrl} />

          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button variant="contained" color="primary" onClick={handleSave}>
              Save
            </Button>
            <Button variant="outlined" onClick={onClose}>
              Cancel
            </Button>
          </Stack>
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
  maxHeight: "80vh",
  overflow: "auto",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2
};

const modalTitleStyle = {
  fontSize: "24px",
  fontWeight: 600,
  color: "black",
  marginBottom: "8px"
};

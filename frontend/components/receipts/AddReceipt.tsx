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
  onSave: (newReceipt: Receipt, file: File | null) => void;
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
  const [file, setFile] = useState<File | null>(null);

  // -- 1) Helper to handle item updates --
  const handleItemChange = (
    index: number,
    field: keyof ReceiptItem,
    value: string | number
  ) => {
    setItems((prevItems) => {
      const updatedItems = [...prevItems];
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: value
      };
      return updatedItems;
    });
  };

  // -- 2) When OCR is done, fill in fields + items
  const handleOcrDataExtracted = (ocrData: any) => {
    if (ocrData.merchant) setMerchant(ocrData.merchant);
    if (ocrData.total_amount) setTotalAmount(String(ocrData.total_amount));
    if (ocrData.currency) setCurrency(ocrData.currency);
    if (ocrData.date) {
      const formattedDate = ocrData.date.split("T")[0];
      setDate(formattedDate);
    }
    if (ocrData.payment_method) setPaymentMethod(ocrData.payment_method);

    if (ocrData.items) {
      const parsedItems: ReceiptItem[] = ocrData.items.map((item: any) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      }));
      setItems(parsedItems);
    }
  };

  // -- 3) Final Save --
  const handleSave = () => {
    const newReceipt: Receipt = {
      id: Date.now(),
      merchant,
      total_amount: parseFloat(totalAmount),
      currency,
      date,
      payment_method: paymentMethod,
      items,
      receipt_image_url: receiptImageUrl || ""
    };
    onSave(newReceipt, file);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Typography sx={modalTitleStyle}>Add Receipt</Typography>

        <Stack spacing={2}>
          {/* Basic Fields */}
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

          {/* OCR Upload */}
          <FilePondUpload
            setImageUrl={setReceiptImageUrl}
            setFile={setFile}
            onOcrDataExtracted={handleOcrDataExtracted}
          />

          {/* -- 4) Editable Items -- */}
          {items.length > 0 && (
            <Box>
              <Typography variant="h6">Items</Typography>
              {items.map((item, idx) => (
                <Stack
                  key={item.id || idx}
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  sx={{ mt: 1 }}
                >
                  <TextField
                    label="Name"
                    value={item.name}
                    onChange={(e) => handleItemChange(idx, "name", e.target.value)}
                  />
                  <TextField
                    label="Price"
                    type="number"
                    value={item.price}
                    onChange={(e) =>
                      handleItemChange(idx, "price", parseFloat(e.target.value))
                    }
                  />
                  <TextField
                    label="Qty"
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(idx, "quantity", parseInt(e.target.value, 10))
                    }
                  />
                </Stack>
              ))}
            </Box>
          )}

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
  width: 450,
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
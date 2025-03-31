import DropDownSelector from "@/components/common/DropDownSelector";
import { defaultText } from "@/styles/colors";
import {
  Category,
  Currency,
  PaymentMethod,
  Receipt,
  ReceiptItem,
  currencies,
  paymentMethods
} from "@/types/receipts";
import CloseIcon from "@mui/icons-material/Close";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import { useState } from "react";
import FilePondUpload from "./FileUpload";
import ItemsTable from "./ItemsTable";

interface IAddReceiptProps {
  open: boolean;
  onClose: () => void;
  onSave: (receipt: Receipt, file: File | null) => void;
}

interface OcrData {
  merchant?: string;
  total_amount?: number;
  currency?: Currency;
  date?: string;
  payment_method?: PaymentMethod;
  items?: Array<{
    id?: number;
    name: string;
    price: number;
    quantity: number;
  }>;
}

export default function AddReceipt(props: IAddReceiptProps) {
  const { open, onClose, onSave } = props;
  const [isLoading, setIsLoading] = useState(false);
  const [newReceipt, setNewReceipt] = useState<Receipt>({
    id: Date.now(), // Add a temporary ID for new receipts
    merchant: "",
    date: new Date().toISOString(),
    currency: "USD",
    payment_method: "Credit",
    items: [],
    total_amount: 0,
    tax: 0,
    tip: 0,
    color: "#000000",
    folder_id: 0
  });
  const [file, setFile] = useState<File | null>(null);

  const handleChange = (
    field: keyof Receipt,
    value: string | number | Category | Currency | ReceiptItem[]
  ) => {
    setNewReceipt((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleOcrDataExtracted = (ocrData: OcrData) => {
    if (ocrData.merchant) handleChange("merchant", ocrData.merchant);
    if (ocrData.total_amount)
      handleChange("total_amount", ocrData.total_amount);
    if (ocrData.currency) handleChange("currency", ocrData.currency);
    if (ocrData.date) {
      // Ensure the date is properly formatted
      const date = new Date(ocrData.date);
      if (!isNaN(date.getTime())) {
        handleChange("date", date.toISOString());
      }
    }
    if (ocrData.payment_method)
      handleChange("payment_method", ocrData.payment_method);
    if (ocrData.items) handleChange("items", ocrData.items);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Calculate subtotal from items
      const subtotal = newReceipt.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      // Calculate total amount including tax and tip
      const totalAmount =
        subtotal + (newReceipt.tax || 0) + (newReceipt.tip || 0);

      // Format the date as YYYY-MM-DD before saving
      const formattedReceipt = {
        ...newReceipt,
        date: dayjs(newReceipt.date).format("YYYY-MM-DD"),
        total_amount: Number(totalAmount.toFixed(2)),
        tax: Number((newReceipt.tax || 0).toFixed(2)),
        tip: Number((newReceipt.tip || 0).toFixed(2)),
        items: newReceipt.items.map((item) => ({
          ...item,
          price: Number(item.price.toFixed(2))
        }))
      };
      await onSave(formattedReceipt, file);
      setNewReceipt({
        id: Date.now(), // Add a temporary ID for new receipts
        merchant: "",
        date: new Date().toISOString(),
        currency: "USD",
        payment_method: "Credit",
        items: [],
        total_amount: 0,
        tax: 0,
        tip: 0,
        color: "#000000",
        folder_id: 0
      });
      setFile(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      fullWidth
      maxWidth="xl"
      onClose={onClose}
      sx={dialogStyle}
    >
      <DialogTitle sx={dialogTitleStyle}>
        <Typography sx={dialogTitleTextStyle}>Add New Receipt</Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Typography marginTop={"8px"}>Merchant</Typography>
        <TextField
          fullWidth
          value={newReceipt.merchant}
          onChange={(e) => handleChange("merchant", e.target.value)}
        />

        <Typography marginTop={"8px"}>Date</Typography>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            value={dayjs(newReceipt.date)}
            onChange={(newDate: Dayjs | null) =>
              newDate && handleChange("date", newDate.toISOString())
            }
          />
        </LocalizationProvider>
        <Typography marginTop={"8px"} marginBottom={"4px"}>
          Currency
        </Typography>
        <DropDownSelector
          value={newReceipt.currency}
          inputId="currency-select-label"
          label="Currency"
          onChange={(e) => handleChange("currency", e.target.value as Currency)}
          options={currencies}
          formControlStyle={formControlStyle}
        />

        <Typography marginTop={"8px"} marginBottom={"4px"}>
          Payment Method
        </Typography>
        <DropDownSelector
          value={newReceipt.payment_method}
          inputId="paymentmethod-select-label"
          label="Payment Method"
          onChange={(e) =>
            handleChange("payment_method", e.target.value as PaymentMethod)
          }
          options={paymentMethods}
          formControlStyle={formControlStyle}
        />

        <Typography marginTop={"8px"} marginBottom={"4px"}>
          Upload Receipt
        </Typography>
        <FilePondUpload
          setFile={setFile}
          onOcrDataExtracted={handleOcrDataExtracted}
        />

        <ItemsTable
          items={newReceipt.items}
          onItemsChange={(items) => handleChange("items", items)}
          onTaxChange={(tax) => handleChange("tax", tax)}
          onTipChange={(tip) => handleChange("tip", tip)}
          initialTax={newReceipt.tax}
          initialTip={newReceipt.tip}
        />
        <Button
          onClick={handleSave}
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: "8px" }}
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={24} color="inherit" /> : "Save"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

const dialogTitleStyle = {
  display: "flex",
  justifyContent: "space-between"
};

const dialogTitleTextStyle = {
  fontSize: "24px"
};

const formControlStyle = {
  width: "160px",
  backgroundColor: "white",
  borderRadius: "8px",
  boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
  "& .MuiOutlinedInput-root": {
    color: defaultText,
    "& fieldset": {
      border: "none"
    },
    "&:hover fieldset": {
      border: "none"
    },
    "&.Mui-focused fieldset": {
      border: `2px solid ${defaultText}`
    }
  }
};

const dialogStyle = {
  "& .MuiDialog-paper": {
    width: "90vw"
  }
};

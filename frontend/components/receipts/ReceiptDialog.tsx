import DropDownSelector from "@/components/common/DropDownSelector"; // Ensure this component exists
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
import ItemsTable from "./ItemsTable";

interface IReceiptDialogProps {
  receipt: Receipt;
  open: boolean;
  onClose: () => void;
  onSave: (updatedReceipt: Receipt) => void;
}

export default function ReceiptDialog(props: IReceiptDialogProps) {
  const { receipt, open, onClose, onSave } = props;
  const [editedReceipt, setEditedReceipt] = useState(receipt);

  const handleChange = (
    field: keyof Receipt,
    value: string | number | Category | Currency | ReceiptItem[]
  ) => {
    setEditedReceipt((prev) => ({
      ...prev,
      [field]: value
    }));
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
        <Typography sx={dialogTitleTextStyle}>Receipt Details</Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Typography marginTop={"8px"}>Merchant</Typography>
        <TextField
          fullWidth
          value={editedReceipt.merchant}
          onChange={(e) => handleChange("merchant", e.target.value)}
        />

        <Typography marginTop={"8px"}>Date</Typography>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            value={dayjs(editedReceipt.date)}
            onChange={(newDate: Dayjs | null) =>
              newDate && handleChange("date", newDate.toISOString())
            }
          />
        </LocalizationProvider>
        <Typography marginTop={"8px"} marginBottom={"4px"}>
          Currency
        </Typography>
        <DropDownSelector
          value={editedReceipt.currency}
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
          value={editedReceipt.payment_method}
          inputId="paymentmethod-select-label"
          label="Payment Method"
          onChange={(e) =>
            handleChange("payment_method", e.target.value as PaymentMethod)
          }
          options={paymentMethods}
          formControlStyle={formControlStyle}
        />
        <ItemsTable 
          items={editedReceipt.items} 
          onItemsChange={(items) => handleChange("items", items)}
          onTaxChange={(tax) => handleChange("tax", tax)}
          initialTax={editedReceipt.tax}
        />
        <Button
          onClick={() => onSave(editedReceipt)}
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: "8px" }}
        >
          Save
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
    width: "90vw",
  }
}
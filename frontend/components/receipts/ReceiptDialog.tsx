"use client";

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
import { IFolder } from "@/types/folders";
import { folderService } from "@/utils/folderService";
import CloseIcon from "@mui/icons-material/Close";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
  Box
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useState } from "react";
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
  const [folders, setFolders] = useState<IFolder[]>([]);
  const [selectedFolderName, setSelectedFolderName] = useState<string | null>(receipt.folder || null);

  useEffect(() => {
    async function fetchFolders() {
      try {
        const foldersData = await folderService.getAllFolders();
        setFolders(foldersData);
      } catch (error) {
        console.error("Error fetching folders:", error);
      }
    }
    if (open) {
      fetchFolders();
    }
  }, [open]);

  const handleChange = (
    field: keyof Receipt,
    value: string | number | Category | Currency | ReceiptItem[] | null
  ) => {
    setEditedReceipt((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFolderChange = async (folderName: string | null) => {
    setSelectedFolderName(folderName);
    if (folderName) {
      try {
        const selectedFolder = folders.find(folder => folder.name === folderName);
        if (selectedFolder) {
          await folderService.addReceiptToFolder(selectedFolder.id, editedReceipt.id);
          handleChange("folder", folderName);
          handleChange("color", selectedFolder.color);
        }
      } catch (error) {
        console.error("Error adding receipt to folder:", error);
      }
    } else if (editedReceipt.folder) {
      try {
        const currentFolder = folders.find(folder => folder.name === editedReceipt.folder);
        if (currentFolder) {
          await folderService.removeReceiptFromFolder(currentFolder.id, editedReceipt.id);
          handleChange("folder", null);
          handleChange("color", "#000000"); // Reset to default color
        }
      } catch (error) {
        console.error("Error removing receipt from folder:", error);
      }
    }
  };

  const selectedFolder = folders.find(folder => folder.name === selectedFolderName);

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
          Folder
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {selectedFolder && (
            <Box
              sx={{
                width: '16px',
                height: '16px',
                borderRadius: '4px',
                backgroundColor: selectedFolder.color
              }}
            />
          )}
          <DropDownSelector
            value={selectedFolderName || ""}
            inputId="folder-select-label"
            label="Folder"
            onChange={(e) => handleFolderChange(e.target.value || null)}
            options={[
              ...folders.map((folder) => ({
                value: folder.name,
                label: folder.name
              }))
            ]}
            formControlStyle={formControlStyle}
          />
        </Box>

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
          onTipChange={(tip) => handleChange("tip", tip)}
          initialTax={editedReceipt.tax}
          initialTip={editedReceipt.tip}
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
    width: "90vw"
  }
};

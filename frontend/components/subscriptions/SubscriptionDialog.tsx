import {
  BillingPeriod,
  Currency,
  Subscription,
  billingPeriods,
  currencies
} from "@/types/subscriptions";
import {
  Box,
  Button,
  MenuItem,
  Modal,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { useEffect, useState } from "react";

interface ISubscriptionDialogProps {
  subscription?: Subscription;
  title: string;
  open: boolean;
  onClose: () => void;
  onSave: (newSubscription: Subscription) => void;
}

export default function SubscriptionDialog(props: ISubscriptionDialogProps) {
  const { open, onClose, onSave, title, subscription } = props;
  const [editedSubscription, setEditedSubscription] =
    useState<Subscription | null>(subscription || null);

  useEffect(() => {
    setEditedSubscription(subscription || null);
  }, [subscription]);

  const handleSave = () => {
    if (!editedSubscription) {
      const newSubscription: Subscription = {
        id: Date.now(),
        user_id: 1,
        merchant: "",
        total_amount: 0,
        currency: "" as Currency,
        renewal_date: "",
        billing_period: "" as BillingPeriod
      };
      onSave(newSubscription);
    } else {
      onSave(editedSubscription);
    }
    onClose();
  };

  const handleChange = (
    field: keyof Subscription,
    value: string | number | BillingPeriod | Currency
  ) => {
    setEditedSubscription((prev) => ({
      ...prev!,
      [field]: value
    }));
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Typography sx={modalTitleStyle}>{title}</Typography>

        <Stack spacing={2}>
          <TextField
            label="Merchant"
            fullWidth
            value={editedSubscription?.merchant || ""}
            onChange={(e) => handleChange("merchant", e.target.value)}
          />

          <TextField
            label="Total Amount"
            fullWidth
            type="number"
            value={editedSubscription?.total_amount || ""}
            onChange={(e) =>
              handleChange("total_amount", parseFloat(e.target.value))
            }
          />

          <TextField
            select
            label="Currency"
            fullWidth
            value={editedSubscription?.currency || ""}
            onChange={(e) =>
              handleChange("currency", e.target.value as Currency)
            }
          >
            {currencies.map((curr) => (
              <MenuItem key={curr} value={curr}>
                {curr}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Renewal Date"
            type="date"
            fullWidth
            value={editedSubscription?.renewal_date || ""}
            onChange={(e) => handleChange("renewal_date", e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            select
            label="Billing Period"
            fullWidth
            value={editedSubscription?.billing_period || ""}
            onChange={(e) =>
              handleChange("billing_period", e.target.value as BillingPeriod)
            }
          >
            {billingPeriods.map((method) => (
              <MenuItem key={method} value={method}>
                {method}
              </MenuItem>
            ))}
          </TextField>

          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              variant="contained"
              color="primary"
              onClick={
                subscription ? () => onSave(editedSubscription!) : handleSave
              }
            >
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

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
import { useState } from "react";

interface ISubscriptionDialogProps {
  subscription?: Subscription;
  title: string;
  open: boolean;
  onClose: () => void;
  onSave: (newSubscription: Subscription) => void;
}

export default function SubscriptionDialog(props: ISubscriptionDialogProps) {
  const { open, onClose, onSave, title } = props;
  const [merchant, setMerchant] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [currency, setCurrency] = useState<Currency>("");
  const [renewalDate, setRenewalDate] = useState("");
  const [billingPeriod, setBillingPeriod] = useState("");

  const handleSave = () => {
    const newSubscription: Subscription = {
      id: Date.now(),
      user_id: 1,
      merchant: merchant,
      total_amount: parseFloat(totalAmount),
      currency: currency,
      renewal_date: renewalDate ? new Date(renewalDate).toISOString() : "",
      billing_period: billingPeriod as BillingPeriod
    };
    onSave(newSubscription);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Typography sx={modalTitleStyle}>{title}</Typography>

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
            label="Renewal Date"
            type="date"
            fullWidth
            value={renewalDate}
            onChange={(e) => setRenewalDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            select
            label="Billing Period"
            fullWidth
            value={billingPeriod}
            onChange={(e) => setBillingPeriod(e.target.value as BillingPeriod)}
          >
            {billingPeriods.map((method) => (
              <MenuItem key={method} value={method}>
                {method}
              </MenuItem>
            ))}
          </TextField>

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

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Select,
  TextField
} from "@mui/material";
import { useEffect, useState } from "react";

interface ISpendingDialogProps {
  open: boolean;
  onClose: () => void;
  spending: {
    id: number;
    category: string;
    amount: number;
    date: string;
  } | null;
  onSave: (
    updatedSpending: {
      id: number;
      category: string;
      amount: number;
      date: string;
    } | null
  ) => void;
}

export default function SpendingDialog(props: ISpendingDialogProps) {
  const [category, setCategory] = useState(props.spending?.category || "");
  const [amount, setAmount] = useState(props.spending?.amount || "");
  const [date, setDate] = useState(props.spending?.date || "");

  useEffect(() => {
    if (props.spending) {
      setCategory(props.spending.category);
      setAmount(props.spending.amount);
      setDate(props.spending.date);
    }
  }, [props.spending]);

  const handleSave = () => {
    if (!props.spending) return;
    props.onSave({
      ...props.spending,
      category,
      amount: parseFloat(String(amount)) || 0,
      date
    });
    props.onClose();
  };

  return (
    <Dialog open={props.open} onClose={props.onClose}>
      <DialogTitle>Edit Spending</DialogTitle>
      <DialogContent>
        <TextField
          label="Amount"
          fullWidth
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <TextField
          label="Date"
          type="date"
          fullWidth
          value={date}
          onChange={(e) => setDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <Select
          fullWidth
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <MenuItem value="Food">Food</MenuItem>
          <MenuItem value="Transport">Transport</MenuItem>
          <MenuItem value="Entertainment">Entertainment</MenuItem>
          <MenuItem value="Others">Others</MenuItem>
        </Select>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

import { ReceiptItem } from "@/types/receipts";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { Typography } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import * as React from "react";

interface IItemsTableProps {
  items: ReceiptItem[];
  onItemsChange: (items: ReceiptItem[]) => void;
  onTaxChange?: (tax: number) => void;
  onTipChange?: (tip: number) => void;
  initialTax?: number;
  initialTip?: number;
}

function ccyFormat(num: number) {
  return `${num.toFixed(2)}`;
}

function priceRow(qty: number, unit: number) {
  return qty * unit;
}

export default function ItemsTable(props: IItemsTableProps) {
  const { items, onItemsChange, onTaxChange, onTipChange, initialTax, initialTip } = props;
  const [taxRate, setTaxRate] = React.useState(() => {
    const itemsSubtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    if (itemsSubtotal > 0 && initialTax) {
      return (initialTax / itemsSubtotal) * 100;
    }
    return 0;
  });

  const [tipRate, setTipRate] = React.useState(() => {
    const itemsSubtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    if (itemsSubtotal > 0 && initialTip) {
      return (initialTip / itemsSubtotal) * 100;
    }
    return 0;
  });

  const handleItemChange = (
    index: number,
    field: keyof ReceiptItem,
    value: string | number
  ) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: value === "" ? 0 : value
    };
    onItemsChange(newItems);
  };

  const handleDeleteItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    onItemsChange(newItems);
  };

  const handleAddItem = () => {
    const newItem: ReceiptItem = {
      name: "",
      price: 0,
      quantity: 1
    };
    onItemsChange([...items, newItem]);
  };

  const handleTaxRateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value === "" ? 0 : Number(event.target.value);
    setTaxRate(value);
    if (onTaxChange) {
      const itemsSubtotal = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const taxAmount = (itemsSubtotal * value) / 100;
      onTaxChange(taxAmount);
    }
  };

  const handleTaxAmountChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value === "" ? 0 : Number(event.target.value);
    if (itemsSubtotal > 0) {
      const newTaxRate = (value / itemsSubtotal) * 100;
      setTaxRate(newTaxRate);
      if (onTaxChange) {
        onTaxChange(value);
      }
    }
  };

  const handleTipRateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value === "" ? 0 : Number(event.target.value);
    setTipRate(value);
    if (onTipChange) {
      const itemsSubtotal = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const tipAmount = (itemsSubtotal * value) / 100;
      onTipChange(tipAmount);
    }
  };

  const handleTipAmountChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value === "" ? 0 : Number(event.target.value);
    if (itemsSubtotal > 0) {
      const newTipRate = (value / itemsSubtotal) * 100;
      setTipRate(newTipRate);
      if (onTipChange) {
        onTipChange(value);
      }
    }
  };

  const itemsSubtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const taxAmount = (itemsSubtotal * taxRate) / 100;
  const tipAmount = (itemsSubtotal * tipRate) / 100;
  const total = Number((itemsSubtotal + taxAmount + tipAmount).toFixed(2));

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography marginTop={"8px"} marginBottom={"4px"}>
          Items
        </Typography>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleAddItem}
          sx={{
            color: "rgba(0, 0, 0, 0.54)",
            borderColor: "rgba(0, 0, 0, 0.54)",
            "&:hover": {
              color: "rgba(0, 0, 0, 0.87)",
              borderColor: "rgba(0, 0, 0, 0.87)"
            }
          }}
        >
          Add Item
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 700 }} aria-label="items table">
          <TableHead>
            <TableRow>
              <TableCell>Item Name</TableCell>
              <TableCell align="right">Quantity</TableCell>
              <TableCell align="right">Unit Price</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell align="right" width={50}></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item, index) => (
              <TableRow key={item.id || index}>
                <TableCell>
                  <TextField
                    value={item.name}
                    onChange={(e) =>
                      handleItemChange(index, "name", e.target.value)
                    }
                    size="small"
                    fullWidth
                    placeholder="Enter item name"
                  />
                </TableCell>
                <TableCell align="right">
                  <TextField
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(
                        index,
                        "quantity",
                        Number(e.target.value)
                      )
                    }
                    size="small"
                    sx={{ width: "100px" }}
                  />
                </TableCell>
                <TableCell align="right">
                  <TextField
                    value={item.price}
                    onChange={(e) =>
                      handleItemChange(index, "price", Number(e.target.value))
                    }
                    size="small"
                    sx={{ width: "100px" }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">$</InputAdornment>
                      )
                    }}
                  />
                </TableCell>
                <TableCell align="right">
                  ${ccyFormat(priceRow(item.quantity, item.price))}
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    onClick={() => handleDeleteItem(index)}
                    size="small"
                    sx={{
                      color: "rgba(0, 0, 0, 0.54)",
                      "&:hover": {
                        color: "rgba(0, 0, 0, 0.87)"
                      }
                    }}
                  >
                    <DeleteOutlineIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell colSpan={3} align="right">
                Items Subtotal
              </TableCell>
              <TableCell align="right">
                <TextField
                  value={itemsSubtotal}
                  size="small"
                  sx={{ width: "100px" }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">$</InputAdornment>
                    )
                  }}
                  disabled
                />
              </TableCell>
              <TableCell></TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Tax</TableCell>
              <TableCell></TableCell>
              <TableCell align="right">
                <TextField
                  value={taxRate}
                  onChange={handleTaxRateChange}
                  size="small"
                  sx={{ width: "100px" }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">%</InputAdornment>
                    )
                  }}
                />
              </TableCell>
              <TableCell align="right">
                <TextField
                  value={taxAmount}
                  onChange={handleTaxAmountChange}
                  size="small"
                  sx={{ width: "100px" }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">$</InputAdornment>
                    )
                  }}
                />
              </TableCell>
              <TableCell></TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Tip</TableCell>
              <TableCell></TableCell>
              <TableCell align="right">
                <TextField
                  value={tipRate}
                  onChange={handleTipRateChange}
                  size="small"
                  sx={{ width: "100px" }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">%</InputAdornment>
                    )
                  }}
                />
              </TableCell>
              <TableCell align="right">
                <TextField
                  value={tipAmount}
                  onChange={handleTipAmountChange}
                  size="small"
                  sx={{ width: "100px" }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">$</InputAdornment>
                    )
                  }}
                />
              </TableCell>
              <TableCell></TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={3} align="right">
                Total
              </TableCell>
              <TableCell align="right">
                <TextField
                  value={ccyFormat(total)}
                  size="small"
                  sx={{ width: "100px" }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">$</InputAdornment>
                    )
                  }}
                  disabled
                />
              </TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

import * as React from 'react';
import { ReceiptItem } from "@/types/receipts";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

interface IItemsTableProps {
  items: ReceiptItem[];
  onItemsChange: (items: ReceiptItem[]) => void;
  onTaxChange?: (tax: number) => void;
  initialTax?: number;
}

function ccyFormat(num: number) {
  return `${num.toFixed(2)}`;
}

function priceRow(qty: number, unit: number) {
  return qty * unit;
}

export default function ItemsTable(props: IItemsTableProps) {
  const { items, onItemsChange, onTaxChange, initialTax } = props;
  const [taxRate, setTaxRate] = React.useState(() => {
    const itemsSubtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (itemsSubtotal > 0 && initialTax) {
      return (initialTax / itemsSubtotal) * 100;
    }
    return 0;
  });

  const handleItemChange = (index: number, field: keyof ReceiptItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: value === '' ? 0 : value
    };
    onItemsChange(newItems);
  };

  const handleTaxRateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value === '' ? 0 : Number(event.target.value);
    setTaxRate(value);
    if (onTaxChange) {
      const itemsSubtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const taxAmount = (itemsSubtotal * value) / 100;
      onTaxChange(taxAmount);
    }
  };

  const handleTaxAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value === '' ? 0 : Number(event.target.value);
    if (itemsSubtotal > 0) {
      const newTaxRate = (value / itemsSubtotal) * 100;
      setTaxRate(newTaxRate);
      if (onTaxChange) {
        onTaxChange(value);
      }
    }
  };

  const itemsSubtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const taxAmount = (itemsSubtotal * taxRate) / 100;
  const total = itemsSubtotal + taxAmount;

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 700 }} aria-label="items table">
        <TableHead>
          <TableRow>
            <TableCell>Item Name</TableCell>
            <TableCell align="right">Quantity</TableCell>
            <TableCell align="right">Unit Price</TableCell>
            <TableCell align="right">Total</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item, index) => (
            <TableRow key={item.id || index}>
              <TableCell>
                <TextField
                  value={item.name}
                  onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                  size="small"
                  fullWidth
                />
              </TableCell>
              <TableCell align="right">
                <TextField
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                  size="small"
                  sx={{ width: '100px' }}
                />
              </TableCell>
              <TableCell align="right">
                <TextField
                  value={item.price}
                  onChange={(e) => handleItemChange(index, 'price', Number(e.target.value))}
                  size="small"
                  sx={{ width: '100px' }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </TableCell>
              <TableCell align="right">
                ${ccyFormat(priceRow(item.quantity, item.price))}
              </TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell colSpan={3} align="right">Items Subtotal</TableCell>
            <TableCell align="right">
              <TextField
                value={itemsSubtotal}
                size="small"
                sx={{ width: '100px' }}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                disabled
              />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Tax</TableCell>
            <TableCell></TableCell>
            <TableCell align="right">
              <TextField
                value={taxRate}
                onChange={handleTaxRateChange}
                size="small"
                sx={{ width: '100px' }}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
              />
            </TableCell>
            <TableCell align="right">
              <TextField
                value={taxAmount}
                onChange={handleTaxAmountChange}
                size="small"
                sx={{ width: '100px' }}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell colSpan={3} align="right">Total</TableCell>
            <TableCell align="right">
              ${ccyFormat(total)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}
import { recentReceiptColor } from "@/styles/colors";
import { Box, Typography } from "@mui/material";

interface IRecentReceiptProps {
  merchant: string;
  date: string;
  amount: number;
}

const RecentReceipt = ({ merchant, date, amount }: IRecentReceiptProps) => {
  return (
    <Box sx={receiptContainerStyle}>
      <Typography sx={merchantStyle}>{merchant}</Typography>
      <Typography sx={dateStyle}>{date}</Typography>
      <Typography sx={amountStyle}>${amount.toFixed(2)}</Typography>
    </Box>
  );
};

const receiptContainerStyle = {
  width: "100%",
  backgroundColor: recentReceiptColor,
  borderRadius: "8px",
  padding: "8px",
  boxShadow: "0px 8px 8px rgba(0, 0, 0, 0.1)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  marginBottom: "16px",
  flexGrow: 1
};

const merchantStyle = {
  fontWeight: "bold",
  fontSize: "14px",
  marginBottom: "8px"
};

const dateStyle = {
  fontSize: "12px",
  marginBottom: "8px"
};

const amountStyle = {
  fontSize: "16px",
  fontWeight: "bold",
  alignSelf: "flex-end"
};

export default RecentReceipt;

import { textGrey } from "@/styles/colors";
import { Receipt } from "@/types/receipts";

import {
  Button,
  Card,
  CardContent,
  CardMedia,
  Divider,
  Stack,
  Typography
} from "@mui/material";

interface IReceiptCardProps {
  receipt: Receipt;
  onClick: () => void;
  onDeleteReceipt: (receiptId: number) => void;
}

export default function ReceiptCard(props: IReceiptCardProps) {
  const { receipt, onClick, onDeleteReceipt } = props;
  const formattedDate = receipt.date.split("T")[0]; // Ensures YYYY-MM-DD

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteReceipt(receipt.id); 
  };

  return (
    <Card sx={cardStyle} onClick={onClick}>
      {receipt.receipt_image_url && (
        <CardMedia
          component="img"
          height="200"
          image={receipt.receipt_image_url}
          alt={`Receipt from ${receipt.merchant}`}
          sx={mediaStyle}
        />
      )}

      <CardContent>
        {/* Merchant Name */}
        <Typography sx={merchantTextStyle}>{receipt.merchant}</Typography>

        {/* Date & Payment Method */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={1}
        >
          <Typography sx={textStyle}>{formattedDate}</Typography>
          <Typography sx={textStyle}>{receipt.payment_method}</Typography>
        </Stack>

        {/* Total Amount */}
        <Typography sx={totalTextStyle}>
          Total: {receipt.currency} {Number(receipt.total_amount).toFixed(2)}
        </Typography>

        <Divider sx={{ my: 1 }} />

        {/* Items */}
        <Typography sx={itemsTitleStyle}>Items:</Typography>

        {receipt.items.slice(0, 2).map((item, index) => (
          <Typography key={`${item.id}-${index}`} sx={itemTextStyle}>
            • {item.name} ({item.category}) x{item.quantity} @{" "}
            {receipt.currency} {Number(item.price).toFixed(2)}
          </Typography>
        ))}

        {receipt.items.length > 2 && (
          <Typography sx={moreItemsStyle}>
            + {receipt.items.length - 2} more...
          </Typography>
        )}

        {/* View Details Button */}
        <Button variant="outlined" sx={buttonStyle} onClick={onClick}>
          View Details
        </Button>
        <Button variant="outlined" sx={deleteButtonStyle} onClick={handleDelete}>
          Delete Receipt
        </Button>
      </CardContent>
    </Card>
  );
}

const cardStyle = {
  maxWidth: 400,
  margin: "8px",
  cursor: "pointer"
};

const mediaStyle = {
  objectFit: "contain"
};

const merchantTextStyle = {
  fontWeight: 500,
  fontSize: "18px",
  color: "black",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis"
};

const textStyle = {
  fontSize: "14px",
  color: textGrey
};

const totalTextStyle = {
  fontSize: "16px",
  fontWeight: 600
};

const itemsTitleStyle = {
  fontSize: "14px",
  fontWeight: 500,
  marginBottom: "8px"
};

const itemTextStyle = {
  fontSize: "12px",
  marginLeft: "8px",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis"
};

const moreItemsStyle = {
  fontSize: "12px",
  color: textGrey,
  fontStyle: "italic"
};

const buttonStyle = {
  marginTop: "8px"
};

const deleteButtonStyle = {
  marginTop: "8px",
  BorderColor: "red",
  color: "red"
};

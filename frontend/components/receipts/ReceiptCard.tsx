import { Receipt } from "@/types/receipts";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Divider,
  Stack,
  Typography
} from "@mui/material";
import React from "react";

interface IReceiptCardProps {
  receipt: Receipt;
  onClick: () => void;
}

const ReceiptCard: React.FC<IReceiptCardProps> = ({ receipt, onClick }) => {
  const formattedDate = receipt.date.split("T")[0]; // Ensures YYYY-MM-DD

  return (
    <Box onClick={onClick} style={{ cursor: "pointer" }}>
      <Card sx={{ maxWidth: 400, margin: "1rem auto" }}>
        {receipt.receipt_image_url && (
          <CardMedia
            component="img"
            height="200"
            image={receipt.receipt_image_url}
            alt={`Receipt from ${receipt.merchant}`}
            sx={{ objectFit: "contain" }}
          />
        )}

        <CardContent>
          {/* Merchant Name */}
          <Typography variant="h6" gutterBottom>
            {receipt.merchant}
          </Typography>

          {/* Date & Payment Method */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={1}
          >
            <Typography variant="body2" color="text.secondary">
              {formattedDate} {/* Now it is always YYYY-MM-DD */}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {receipt.payment_method}
            </Typography>
          </Stack>

          {/* Total Amount */}
          <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
            Total: {receipt.currency} {Number(receipt.total_amount).toFixed(2)}
          </Typography>

          <Divider sx={{ my: 1 }} />

          {/* Items */}
          <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
            Items:
          </Typography>

          {receipt.items?.map((item, index) => (
            <Typography
              key={`${item.id}-${index}`}
              variant="body2"
              sx={{ ml: 2 }}
            >
              • {item.name} ({item.category})
              {` x${item.quantity} @ ${receipt.currency} ${Number(item.price).toFixed(2)}`}
            </Typography>
          ))}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ReceiptCard;

import { defaultText, textLightGrey } from "@/styles/colors";
import { Receipt } from "@/types/receipts";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

import {
  Divider,
  Stack,
  Typography,
  Grid,
  Box,
  IconButton,
} from "@mui/material";

interface IReceiptCardProps {
  receipt: Receipt;
  onClick: () => void;
  onDeleteReceipt: (receiptId: number) => void;
}

export default function ReceiptCard(props: IReceiptCardProps) {
  const { receipt, onClick, onDeleteReceipt } = props;
  const formattedDate = receipt.date.split("T")[0];

  function getColorStripStyle(color: string) {
    return {
      backgroundColor: color,
      height: '100%',
      width: '16px',
      borderRadius: '8px 0 0 8px'
    }
  }

  return (
    <Grid container spacing={0} sx={cardStyle} onClick={onClick}>
      <Grid xs={1}>
        <Box style={getColorStripStyle("#c6fc03")} />
      </Grid>
      <Grid xs={11} sx={cardContentStyle}>
        <Stack
          direction="column"
          justifyContent="space-between"
          mb={1}
        >
          <Box sx={headerBoxStyle}>
            <Typography sx={merchantTextStyle}>{receipt.merchant}</Typography>
            <IconButton 
              onClick={(e) => {
                e.stopPropagation();
                onDeleteReceipt(receipt.id);
              }}
              size="small"
              sx={deleteIconStyle}
            >
              <DeleteOutlineIcon />
            </IconButton>
          </Box>
          <Typography sx={lightTextStyle}>{formattedDate}</Typography>
        </Stack>

        <Typography sx={darkTextStyle}>
          Total: {receipt.currency} ${Number(receipt.total_amount).toFixed(2)}
        </Typography>

        <Divider sx={{ my: 1 }} />

        <Typography sx={darkTextStyle}>Items:</Typography>

        {receipt.items.slice(0, 2).map((item, index) => (
          <Typography key={`${item.id}-${index}`} sx={itemTextStyle}>
            • {item.name} x{item.quantity} @{" "}
            ${Number(item.price).toFixed(2)} {receipt.currency}
          </Typography>
        ))}

        {receipt.items.length > 2 && (
          <Typography sx={{... darkTextStyle, marginLeft: "8px"}}>
            + {receipt.items.length - 2} more...
          </Typography>
        )}

        <Typography sx={{ ...darkTextStyle, textAlign: "right" }}>{receipt.payment_method}</Typography>
      </Grid>
    </Grid>
  );
}

const cardStyle = {
  maxWidth: 304,
  margin: "8px",
  cursor: "pointer",
  borderRadius: "8px",
  boxShadow: "0px 0px 10px 0px rgba(0, 0, 0, 0.1)"
};

const cardContentStyle = {
  padding: "8px"
}

const merchantTextStyle = {
  fontWeight: 600,
  fontSize: "18px",
  color: "black",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis"
};

const lightTextStyle = {
  fontSize: "14px",
  color: textLightGrey,
  fontWeight: 700
};

const itemTextStyle = {
  fontSize: "14px",
  marginLeft: "8px",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  color: defaultText,
  fontWeight: 700
};

const darkTextStyle = {
  fontSize: "14px",
  color: defaultText,
  fontWeight: 700
};

const headerBoxStyle = {
  display: "flex",
  justifyContent: "space-between"
}

const deleteIconStyle = {
  color: textLightGrey,
  padding: 0
}
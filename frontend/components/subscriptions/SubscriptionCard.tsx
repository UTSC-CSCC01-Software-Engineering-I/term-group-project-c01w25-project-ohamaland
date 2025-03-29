import { defaultText, lightGrey, textGrey, textLightGrey } from "@/styles/colors";
import { Subscription } from "@/types/subscriptions";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import {
  Button,
  Card,
  CardContent,
  Divider,
  Stack,
  Typography,
  Grid,
  Box,
  IconButton,
} from "@mui/material";

interface ISubscriptionCardProps {
  subscription: Subscription;
  onClick: () => void;
  onDeleteSubscription: (subscriptionId: number) => void;
}

export default function SubscriptionCard(props: ISubscriptionCardProps) {
  const { subscription, onClick, onDeleteSubscription } = props;
  const formattedDate = subscription.renewal_date.split("T")[0];

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteSubscription(subscription.id);
  };

  // This will be used for the progression bar based on how close
  // subscription is to renewal date (percentage)
  // function getRenewalBarColor(color: string) {
  //   return {
  //     backgroundColor: color,
  //   }
  // }

  return (
    <Grid container spacing={0} sx={cardStyle} onClick={onClick}>
      <Grid xs={16} sx={cardContentStyle}>
        <Stack
          direction="column"
          justifyContent="space-between"
        >
          <Box sx={headerBoxStyle}>
            <Typography sx={merchantTextStyle}>{subscription.merchant}</Typography>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                onDeleteSubscription(subscription.id);
              }}
              size="small"
              sx={deleteIconStyle}
            >
              <DeleteOutlineIcon />
            </IconButton>
          </Box>

        </Stack>

        <Typography sx={darkTextStyle}>
          Billing Period: {subscription.billing_period}
        </Typography>

        <Divider sx={{ my: 1 }} />
        <Typography sx={darkTextStyle}>
          Bill: {subscription.currency} ${Number(subscription.total_amount).toFixed(2)}
        </Typography>

        <Typography sx={{ ...lightTextStyle, textAlign: "right" }}>{subscription.renewal_date}</Typography>
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
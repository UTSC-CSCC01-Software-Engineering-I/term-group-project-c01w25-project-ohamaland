import { defaultText, lightGrey, textGrey, textLightGrey, renewalBarColors } from "@/styles/colors";
import { Subscription } from "@/types/subscriptions";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import LinearProgress from '@mui/material/LinearProgress';
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
import { useState } from "react";

interface ISubscriptionCardProps {
  subscription: Subscription;
  onClick: () => void;
  onDeleteSubscription: (subscriptionId: number) => void;
}

export default function SubscriptionCard(props: ISubscriptionCardProps) {
  const { subscription, onClick, onDeleteSubscription } = props;
  const formattedDate = subscription.renewal_date.split("T")[0];
  const [progress, setProgress] = useState(50);

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

        <Box sx={barStyle}>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={renewalBar(progress)}
          />
        </Box>

        <Typography sx={{ ...lightTextStyle, textAlign: "right" }}>{formattedDate}</Typography>
      </Grid>
    </Grid>
  );
}

const getRenewalBarColor = (progress: number) => {
  if (progress <= 25) return renewalBarColors.green;
  if (progress >= 75) return renewalBarColors.red;
  return renewalBarColors.yellow;
};

const renewalBar = (progress: number) => ({
  backgroundColor: renewalBarColors.grey,
  "& .MuiLinearProgress-bar": {
    backgroundColor: getRenewalBarColor(progress),
  },
});

const barStyle = {
  width: "100%",
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

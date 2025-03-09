import { textGrey } from "@/styles/colors";
import { Subscription } from "@/types/subscriptions";
import {
  Button,
  Card,
  CardContent,
  CardMedia,
  Divider,
  Stack,
  Typography
} from "@mui/material";

interface ISubscriptionCardProps {
  subscription: Subscription;
  onClick: () => void;
}

export default function SubscriptionCard(props: ISubscriptionCardProps) {
  const { subscription, onClick } = props;
  const formattedDate = subscription.renewal_date.split("T")[0]; // Ensures YYYY-MM-DD

  return (
    <Card sx={cardStyle} onClick={onClick}>
       <CardContent>
         {/* Merchant Name */}
         <Typography sx={merchantTextStyle}>{subscription.merchant}</Typography>

         {/* Renewal Date */}
         <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={1}
        >
          <Typography sx={textStyle}>{formattedDate}</Typography>
        </Stack>

        {/* Total Amount */}
        <Typography sx={totalTextStyle}>
          Total: {subscription.currency} {Number(subscription.total_amount).toFixed(2)}
        </Typography>

        <Divider sx={{ my: 1 }} />

        {/* View Details Button */}
        <Button variant="outlined" sx={buttonStyle} onClick={onClick}>
          View Details
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
import { defaultText, textLightGrey } from "@/styles/colors";
import { Subscription } from "@/types/subscriptions";
import { Typography } from "@mui/material";

interface ISubscriptionLogItemProps {
    data: Subscription;
}

export default function SubscriptionLogItem(props: ISubscriptionLogItemProps) {
    return (
        <Typography sx={{ ...lightTextStyle, "&:hover": darkTextStyle }}>
            {props.data.merchant} - {props.data.renewal_date}
        </Typography>
    );
}

const upcomingRenewalsBoxStyle = {
}

const lightTextStyle = {
  fontSize: "14px",
  color: textLightGrey,
  fontWeight: 500
};

const darkTextStyle = {
  fontSize: "14px",
  color: defaultText,
  fontWeight: 700
};

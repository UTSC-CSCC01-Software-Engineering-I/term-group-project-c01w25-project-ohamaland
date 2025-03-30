import { defaultText, textLightGrey } from "@/styles/colors";
import { Subscription } from "@/types/subscriptions";
import { Box, Divider, Stack, Typography } from "@mui/material";
import { useState } from "react";


interface IUpcomingRenewalsProps {
    title: string;
    subscriptions: Subscription[];
    onOpenDialog: (subscription: Subscription) => void;
}

export default function UpcomingRenewals(props: IUpcomingRenewalsProps){
    const { title } = props;

    const upcomingRenewals = getUpcomingRenewals(props.subscriptions);
    return (
        <Box sx={upcomingRenewalsBoxStyle}>
            <Typography sx={titleTextStyle}>
                {title}
            </Typography>

            <Divider sx={{ my: 1 }} />

            {upcomingRenewals.length === 0 ? (
                <Typography>
                    No upcoming renewals.
                </Typography>
            ) : (
                upcomingRenewals.map((renewal, index) => (
                    <Stack
                        key={index}
                        sx={renewalItemStyle}
                        onClick={() => props.onOpenDialog(renewal)}
                    >
                        <Typography sx={{ ...lightTextStyle, "&:hover": darkTextStyle }}>
                            {renewal.merchant} - {renewal.renewal_date}
                        </Typography>
                    </Stack>
                ))
            )}
        </Box>
    );
}

function getUpcomingRenewals(subscriptions: Subscription[]) {
    const currentDate = new Date();
    const sortedSubscriptions = subscriptions
        .filter(s => new Date(s.renewal_date) >= currentDate)
        .sort((a, b) => new Date(a.renewal_date).getTime() - new Date(b.renewal_date).getTime());
    return sortedSubscriptions.slice(0, renewalsToShow);
}

const renewalsToShow = 5;

const upcomingRenewalsBoxStyle = {

}

const renewalItemStyle = {
    padding: 1,
    cursor: "pointer",
    transition: "color 0.3s",
};

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

const titleTextStyle = {
    fontWeight: 600,
    fontSize: "18px",
    color: "black",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    textAlign: "center",
    width: "100%"
};
import { Subscription } from "@/types/subscriptions";
import { Box, Divider, Typography } from "@mui/material";
import { useState } from "react";


interface IUpcomingRenewalsProps {
    subscriptions: Subscription[];
    onOpenDialog: (subscription: Subscription) => void;
}

export default function UpcomingRenewals(props: IUpcomingRenewalsProps){
    const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false);

    const upcomingRenewals = getUpcomingRenewals(props.subscriptions);
    return (
        <Box sx={upcomingRenewalsBoxStyle}>
            <Typography>
                Upcoming Renewals
            </Typography>

            <Divider sx={{ my: 1 }} />

            {upcomingRenewals.length === 0 ? (
                <Typography>
                    No upcoming renewals.
                </Typography>
            ) : (
                upcomingRenewals.map((renewal, index) => (
                    <Box key={index}>
                        <Typography>
                            {renewal.merchant} - {renewal.renewal_date}
                        </Typography>
                    </Box>
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

const upcomingRenewalsBoxStyle = {

}

const renewalsToShow = 5;
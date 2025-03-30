import { Subscription } from "@/types/subscriptions";
import { useState } from "react";


interface IUpcomingSubscriptionsProps {
    subscriptions: Subscription[];
    onOpenDialog: (subscription: Subscription) => void;
}

export default function UpcomingSubscriptions(props: IUpcomingSubscriptionsProps){
    const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false);


    const upcomingSubscriptions = getUpcomingSubscriptions(props.subscriptions);
    return (<br >/</br>);
}

function getUpcomingSubscriptions(subscriptions: Subscription[]) {
    return subscriptions;
}

const boxStyle = {

}
import { TimePeriod, Subscription } from "@/types/subscriptions";
import { filterSubscriptions } from "@/utils/filters";
import { Grid2 } from "@mui/material";
import { Dayjs } from "dayjs";
import SubscriptionCard from "../subscriptions/SubscriptionCard";

interface ISubscriptionGridProps {
  subscriptions: Subscription[];
  filterTerm: string;
  renewalTime: TimePeriod;
  onOpenDialog: (subscription: Subscription) => void;
}

export default function SubscriptionGrid(props: ISubscriptionGridProps) {
  const filteredSubscriptions = filterSubscriptions(
    props.subscriptions,
    props.filterTerm,
    props.renewalTime
  );

  return (
    <Grid2 container spacing={3} sx={gridStyle}>
      {filteredSubscriptions.map((subscription, index) => (
        <SubscriptionCard
          key={`${subscription.id}-${index}`}
          subscription={subscription}
          onClick={() => props.onOpenDialog(subscription)}
        />
      ))}
    </Grid2>
  );
}

const gridStyle = {
  maxHeight: "60vh", // TODO: change this in the future using vh is not good should take max possible
  overflowY: "auto",
  marginTop: "24px"
};
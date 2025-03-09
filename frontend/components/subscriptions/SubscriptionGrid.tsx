import { TimePeriod, Subscription, BillingPeriod } from "@/types/subscriptions";
import { filterSubscriptions } from "@/utils/filters";
import { Grid2 } from "@mui/material";
import SubscriptionCard from "../subscriptions/SubscriptionCard";

interface ISubscriptionGridProps {
  subscriptions: Subscription[];
  filterTerm: string;
  renewalDate: TimePeriod;
  billingPeriod: BillingPeriod
  onOpenDialog: (subscription: Subscription) => void;
}

export default function SubscriptionGrid(props: ISubscriptionGridProps) {
  const filteredSubscriptions = filterSubscriptions(
    props.subscriptions,
    props.filterTerm,
    props.renewalDate,
    props.billingPeriod
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
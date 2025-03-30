import { BillingPeriod, Subscription, TimePeriod } from "@/types/subscriptions";
import { filterSubscriptions } from "@/utils/filters";
import { Alert, Grid2, Snackbar } from "@mui/material";
import { useEffect, useState } from "react";
import DeleteConfirmationDialog from "../common/DeleteConfirmationDialog";
import SubscriptionCard from "../subscriptions/SubscriptionCard";

interface ISubscriptionGridProps {
  subscriptions: Subscription[];
  filterTerm: string;
  renewalTime: TimePeriod;
  renewalTimeOffset: number;
  billingPeriod: BillingPeriod;
  onOpenDialog: (subscription: Subscription) => void;
  onDeleteSubscription: (subscriptionId: number) => void;
}

export default function SubscriptionGrid(props: ISubscriptionGridProps) {
  const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false);
  const [subscriptionToDelete, setSubscriptionToDelete] =
    useState<Subscription | null>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [dontRemindMe, setDontRemindMe] = useState(() => {
    return localStorage.getItem("dont_remind_delete_subscription") === "true";
  });

  useEffect(() => {
    localStorage.removeItem("dont_remind_delete_subscription");
    setDontRemindMe(false);
  }, []);

  const filteredSubscriptions = filterSubscriptions(
    props.subscriptions,
    props.filterTerm,
    props.renewalTimeOffset,
    props.billingPeriod
  );

  const confirmDelete = async () => {
    if (subscriptionToDelete) {
      props.onDeleteSubscription(subscriptionToDelete.id);
      setOpenSnackbar(true);
    }
    if (dontRemindMe) {
      localStorage.setItem("dont_remind_delete_subscription", "true");
    }
    setOpenConfirmationDialog(false);
    setSubscriptionToDelete(null);
  };

  const cancelDelete = () => {
    setOpenConfirmationDialog(false);
    setSubscriptionToDelete(null);
  };

  const handleDeleteClick = (subscription: Subscription) => {
    console.log("Delete clicked for subscription:", subscription);
    setSubscriptionToDelete(subscription);

    if (!dontRemindMe) {
      setOpenConfirmationDialog(true);
    } else {
      props.onDeleteSubscription(subscription.id);
    }
  };

  return (
    <Grid2 container spacing={3} sx={gridStyle}>
      {filteredSubscriptions.map((subscription, index) => (
        <SubscriptionCard
          key={`${subscription.id}-${index}`}
          subscription={subscription}
          onClick={() => props.onOpenDialog(subscription)}
          onDeleteSubscription={() => handleDeleteClick(subscription)}
        />
      ))}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={openConfirmationDialog}
        onClose={cancelDelete}
        onConfirmDelete={confirmDelete}
        dontRemindMe={dontRemindMe}
        setDontRemindMe={setDontRemindMe}
      />

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity="success">
          Subscription has been successfully deleted.
        </Alert>
      </Snackbar>
    </Grid2>
  );
}

const gridStyle = {
  maxHeight: "60vh", // TODO: change this in the future using vh is not good should take max possible
  overflowY: "auto",
  marginTop: "24px"
};

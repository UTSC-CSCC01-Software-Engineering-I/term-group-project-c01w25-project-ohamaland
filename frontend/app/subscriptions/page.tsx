"use client";

import PageWrapper from "@/components/common/layouts/PageWrapper";
import SubscriptionDialog from "@/components/subscriptions/SubscriptionDialog";
import SubscriptionFilter from "@/components/subscriptions/SubscriptionFilter";
import SubscriptionGrid from "@/components/subscriptions/SubscriptionGrid";
import { BillingPeriod, Subscription, TimePeriod } from "@/types/subscriptions";
import { Box, Button, SelectChangeEvent } from "@mui/material";
import { useEffect, useState } from "react";
import { getAccessToken } from "@/utils/auth";

export default function Page() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [renewalTime, setRenewalTime] = useState<TimePeriod>("All");
  const [renewalTimeOffset, setRenewalTimeOffset] = useState<number>(-1); // used for filtering subscriptions
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("All");
  const [filterTerm, setFilterTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] =
    useState<Subscription | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch subscriptions from API
  useEffect(() => {
    async function fetchSubscriptions() {
      try {
        const token = getAccessToken();
        const response = await fetch("http://127.0.0.1:8000/api/subscriptions/", {
          headers: {
            "Authorization": `Bearer ${token}`,
          }
        });
        if (!response.ok) {
          throw new Error("Failed to fetch subscriptions");
        }
        const data = await response.json();
        setSubscriptions(data.subscriptions);
      } catch (error) {
        console.error("Error fetching subscriptions:", error);
      }
    }
    fetchSubscriptions();
  }, []);

  const handleTimePeriodChange = (event: SelectChangeEvent) => {
    const selectedTimePeriod = event.target.value as TimePeriod;
    setRenewalTime(selectedTimePeriod);

    let offset = -1;
    switch (selectedTimePeriod) {
      case "One Month":
        offset = 1;
        break;
      case "Three Months":
        offset = 3;
        break;
      case "Six Months":
        offset = 6;
        break;
      case "One Year":
        offset = 12;
        break;
      case "All":
        offset = -1;
        break;
    }
    setRenewalTimeOffset(offset);
  };

  const handleBillingPeriodChange = (event: SelectChangeEvent) => {
    setBillingPeriod(event.target.value as BillingPeriod);
  };

  // to handle adding a new subscription (temporary, hardcoded for now)
  const handleSaveSubscription = async (newSubscription: Subscription) => {
    const formData = new FormData();
    formData.append("merchant", newSubscription.merchant);
    formData.append("total_amount", newSubscription.total_amount.toString()); // Convert to string if necessary
    formData.append("currency", newSubscription.currency);
    formData.append("billing_period", newSubscription.billing_period);
    formData.append("renewal_date", newSubscription.renewal_date);
    formData.append("payment_method", newSubscription.billing_period);
    formData.append("id", newSubscription.id.toString());
    console.log(newSubscription.user_id);

    try {
      const token = getAccessToken();
      const meResponse = await fetch("http://127.0.0.1:8000/api/user/me/", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        }
      });
      if (!meResponse.ok) {
        throw new Error("Failed to get user information.");
      }
      const data = await meResponse.json()
      formData.append("user", data.id);

      const subscriptionResponse = await fetch("http://127.0.0.1:8000/api/subscriptions/", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData
      });
      console.log(subscriptionResponse);
      if (!subscriptionResponse.ok) {
        throw new Error("Failed to save subscription");
      }
      const savedSubscription = await subscriptionResponse.json();
      setSubscriptions((prevSubscriptions) => [
        ...prevSubscriptions,
        savedSubscription
      ]);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving subscription:", error);
    }
  };

  const handleOpenDialog = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setIsDialogOpen(true);
  };

  // TODO: update and delete
  //   const handleCloseDialog = () => {
  //     setIsDialogOpen(false);
  //     setSelectedSubscription(null);
  //   };

  //   const handleSaveSubscriptionUpdate = async (updatedSubscription: Subscription) => {
  //     try {
  //       const formattedDate = new Date(updatedSubscription.renewal_date).toISOString().split("T")[0]; // Convert to YYYY-MM-DD

  //       const updatedData = {
  //         ...updatedSubscription,
  //         renewal_date: formattedDate,
  //       };
  //       console.log("Contents of receipt: ", updatedReceipt);
  //       const response = await fetch(
  //         `http://127.0.0.1:8000/api/receipts/${updatedReceipt.id}/`,
  //         {
  //           method: "PATCH",
  //           headers: {
  //             "Content-Type": "application/json",
  //           },
  //           body: JSON.stringify(updatedData),
  //         }
  //       );
  //       if (!response.ok) {
  //         const errorData = await response.json(); // Get the error response body
  //         console.error("Error:", errorData);
  //         throw new Error(errorData.detail || "Failed to save the receipt");
  //       }
  //       const savedReceipt = await response.json();
  //       setReceipts((prevReceipts) =>
  //         prevReceipts.map((r) => (r.id === savedReceipt.id ? savedReceipt : r))
  //       );
  //       handleCloseDialog();
  //     } catch (error) {
  //       console.error("Error updating receipt:", error);
  //     }
  //   };

  return (
    <PageWrapper>
      <Box sx={filterContainerStyle}>
        <SubscriptionFilter
          renewalTime={renewalTime}
          billingPeriod={billingPeriod}
          filterTerm={filterTerm}
          setFilterTerm={setFilterTerm}
          handleTimePeriodChange={handleTimePeriodChange}
          handleBillingPeriodChange={handleBillingPeriodChange}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={() => setIsModalOpen(true)}
          sx={buttonStyle}
        >
          Add Subscription
        </Button>
      </Box>
      <SubscriptionGrid
        subscriptions={subscriptions}
        filterTerm={filterTerm}
        renewalTime={renewalTime}
        renewalTimeOffset={renewalTimeOffset}
        billingPeriod={billingPeriod}
        onOpenDialog={handleOpenDialog}
      />

      <SubscriptionDialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSubscription}
      />
    </PageWrapper>
  );
}

const filterContainerStyle = {
  display: "flex",
  alignItems: "center",
  gap: "16px",
  marginBottom: "16px",
  width: "100%"
};

const buttonStyle = {
  marginLeft: "8px",
  color: "white"
};

"use client";

import PageWrapper from "@/components/common/layouts/PageWrapper";
import Log from "@/components/common/Log";
import SubscriptionDialog from "@/components/subscriptions/SubscriptionDialog";
import SubscriptionFilter from "@/components/subscriptions/SubscriptionFilter";
import SubscriptionGrid from "@/components/subscriptions/SubscriptionGrid";
import SubscriptionLogItem from "@/components/subscriptions/SubscriptionLogItem";
import { BillingPeriod, Subscription, TimePeriod } from "@/types/subscriptions";
import {
  fetchWithAuth,
  subscriptionsApi,
  subscriptionsDetailApi,
  userMeApi
} from "@/utils/api";
import AddIcon from "@mui/icons-material/Add";
import { Box, IconButton, SelectChangeEvent } from "@mui/material";
import { useEffect, useState } from "react";

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
        const response = await fetchWithAuth(subscriptionsApi);
        if (response && response.ok) {
          const data = await response.json();
          setSubscriptions(data.subscriptions);
        }
      } catch (error) {
        setSubscriptions([]);
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

  const handleSaveSubscription = async (newSubscription: Subscription) => {
    try {
      const meResponse = await fetchWithAuth(userMeApi, {
        method: "GET"
      });
      if (meResponse && meResponse.ok) {
        const { id: userId } = await meResponse.json();
        const subscriptionData = {
          ...newSubscription,
          user: userId
        };

        const subscriptionResponse = await fetchWithAuth(subscriptionsApi, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(subscriptionData)
        });

        if (subscriptionResponse && subscriptionResponse.ok) {
          const savedSubscription = await subscriptionResponse.json();
          setSubscriptions((prevSubscriptions) => [
            ...prevSubscriptions,
            savedSubscription
          ]);
          setIsModalOpen(false);
        }
      }
    } catch (error) {
      throw error;
    }
  };

  const handleOpenDialog = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedSubscription(null);
  };

  const handleSaveSubscriptionUpdate = async (
    updatedSubscription: Subscription
  ) => {
    try {
      const formattedDate = new Date(updatedSubscription.renewal_date)
        .toISOString()
        .split("T")[0];

      const updatedData = {
        ...updatedSubscription,
        renewal_date: formattedDate,
        notification_sent: false
      };

      const response = await fetchWithAuth(
        subscriptionsDetailApi(updatedSubscription.id),
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(updatedData)
        }
      );

      if (response && response.ok) {
        const savedSubscription = await response.json();
        setSubscriptions((prevSubscriptions) =>
          prevSubscriptions.map((s) =>
            s.id === savedSubscription.id ? savedSubscription : s
          )
        );
        handleCloseDialog();
      }
    } catch (error) {}
  };

  const handleDeleteSubscription = async (subscriptionId: number) => {
    try {
      const response = await fetchWithAuth(
        subscriptionsDetailApi(subscriptionId),
        {
          method: "DELETE"
        }
      );

      if (response && response.ok) {
        setSubscriptions((prevSubscriptions) =>
          prevSubscriptions.filter(
            (subscription) => subscription.id !== subscriptionId
          )
        );

        if (
          selectedSubscription &&
          selectedSubscription.id === subscriptionId
        ) {
          setIsDialogOpen(false);
          setSelectedSubscription(null);
        }
      }
    } catch (error) {}
  };

  return (
    <PageWrapper>
      <Box sx={pageLayoutStyle}>
        <Box sx={filterContainerStyle}>
          <SubscriptionFilter
            renewalTime={renewalTime}
            billingPeriod={billingPeriod}
            filterTerm={filterTerm}
            setFilterTerm={setFilterTerm}
            handleTimePeriodChange={handleTimePeriodChange}
            handleBillingPeriodChange={handleBillingPeriodChange}
          />
          <Box sx={buttonStyle} onClick={() => setIsModalOpen(true)}>
            <IconButton size="large">
              <AddIcon sx={{ fontSize: 40, color: "#666" }} />
            </IconButton>
          </Box>
        </Box>

        <Box sx={contentLayoutStyle}>
          <Box sx={leftContainerStyle}>
            <SubscriptionGrid
              subscriptions={subscriptions}
              filterTerm={filterTerm}
              renewalTime={renewalTime}
              renewalTimeOffset={renewalTimeOffset}
              billingPeriod={billingPeriod}
              onOpenDialog={handleOpenDialog}
              onDeleteSubscription={handleDeleteSubscription}
            />
          </Box>

          <Box sx={rightContainerStyle}>
            <Log
              data={getUpcomingRenewals(subscriptions)}
              Component={SubscriptionLogItem}
              onOpenDialog={handleOpenDialog}
              title="Upcoming Renewals"
            />
          </Box>
        </Box>
      </Box>

      <SubscriptionDialog
        title="Add Subscription"
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSubscription}
      />

      {selectedSubscription && (
        <SubscriptionDialog
          subscription={selectedSubscription}
          title="Update Subscription"
          open={isDialogOpen}
          onClose={handleCloseDialog}
          onSave={handleSaveSubscriptionUpdate}
        />
      )}
    </PageWrapper>
  );
}

function getUpcomingRenewals(subscriptions: Subscription[]) {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const sortedSubscriptions = subscriptions
    .filter((s) => new Date(s.renewal_date) >= yesterday)
    .sort(
      (a, b) =>
        new Date(a.renewal_date).getTime() - new Date(b.renewal_date).getTime()
    );
  return sortedSubscriptions.slice(0, renewalsToShow);
}

const renewalsToShow = 5;

const buttonStyle = {
  maxWidth: 304,
  margin: "8px",
  borderRadius: "8px",
  height: "64px",
  border: "2px dashed #ccc",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  "&:hover": {
    borderColor: "#999"
  }
};

const pageLayoutStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "16px"
};

const filterContainerStyle = {
  display: "flex",
  alignItems: "center",
  gap: "16px",
  marginBottom: "16px",
  width: "100%",
  "& > *:first-of-type": {
    flex: 1
  }
};

const contentLayoutStyle = {
  display: "flex",
  gap: "32px"
};

const leftContainerStyle = {
  flex: 1,
  marginRight: "320px"
};

const rightContainerStyle = {
  position: "fixed",
  right: "32px",
  width: "304px",
  flexShrink: 0,
  display: "flex",
  flexDirection: "column",
  padding: "16px",
  borderRadius: "12px",
  backgroundColor: "white",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
};

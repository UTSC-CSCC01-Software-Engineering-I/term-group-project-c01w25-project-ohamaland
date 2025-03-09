"use client";

import PageWrapper from "@/components/common/layouts/PageWrapper";
// import ReceiptModal from "@/components/receipts/AddReceipt";
// import ReceiptDialog from "@/components/receipts/ReceiptDialog";
import SubscriptionFilter from "@/components/subscriptions/SubscriptionFilter";
import SubscriptionGrid from "@/components/subscriptions/SubscriptionGrid";
import { TimePeriod, Subscription, BillingPeriod } from "@/types/subscriptions";
import { Box, Button, SelectChangeEvent } from "@mui/material";
import { useEffect, useState } from "react";

export default function Page() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [renewalTime, setRenewalTime] = useState<TimePeriod>("All");
  const [renewalTimeOffset, setRenewalTimeOffset] = useState<number>(-1); // used for filtering subscriptions
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("All");
  const [filterTerm, setFilterTerm] = useState("");
//   const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch subscriptions from API
  useEffect(() => {
    async function fetchReceipts() {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/subscriptions/");
        if (!response.ok) {
          throw new Error("Failed to fetch subscriptions");
        }
        const data = await response.json();
        setSubscriptions(data.subscriptions);
      } catch (error) {
        console.error("Error fetching receipts:", error);
      }
    }
    fetchReceipts();
  }, []);

  const handleSaveSubscription = (newSubscription: Subscription) => {
    setSubscriptions((prevSubscriptions) => [...prevSubscriptions, newSubscription]);
  };

  const handleTimePeriodChange = (event: SelectChangeEvent) => {
    const selectedTimePeriod = event.target.value as TimePeriod;
    setRenewalTime(selectedTimePeriod);

    let offset = -1;
    switch (selectedTimePeriod) {
      case "This Month":
        offset = 1;
        break;
      case "Within Three Months":
        offset = 3;
        break;
      case "Within Six Months":
        offset = 6;
        break;
      case "This Year":
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

//     const formData = new FormData();

//     // Append the receipt image (file)
//     formData.append("receipt_image", file);

//     // Append each field of newReceipt separately as form fields
//     formData.append("merchant", newReceipt.merchant);
//     formData.append("total_amount", newReceipt.total_amount.toString());  // Convert to string if necessary
//     formData.append("currency", newReceipt.currency);
//     formData.append("date", newReceipt.date);
//     formData.append("payment_method", newReceipt.payment_method);
//     formData.append("items", JSON.stringify(newReceipt.items));
//     formData.append("user_id", "1"); // hardcoded
//     formData.append("id", newReceipt.id.toString());

//     try {
//       const response = await fetch("http://127.0.0.1:8000/api/receipts/", {
//         method: "POST",
//         body: formData,
//       });
//       console.log(response);
//       if (!response.ok) {
//         throw new Error("Failed to save receipt");
//       }
//       const savedReceipt = await response.json();
//       setReceipts((prevReceipts) => [...prevReceipts, savedReceipt]);
//       setIsModalOpen(false);
//     } catch (error) {
//       console.error("Error saving receipt:", error);
//     }
//   };

  const handleOpenDialog = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setIsDialogOpen(true);
  };

//   const handleCloseDialog = () => {
//     setIsDialogOpen(false);
//     setSelectedReceipt(null);
//   };

//   const handleSaveReceiptUpdate = async (updatedReceipt: Receipt) => {
//     try {
//       const formattedDate = new Date(updatedReceipt.date).toISOString().split("T")[0]; // Convert to YYYY-MM-DD

//       const updatedData = {
//         ...updatedReceipt,
//         date: formattedDate,
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
        //   onClick={() => setIsModalOpen(true)}
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

      {/* <ReceiptModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveReceipt}
      />

      {selectedReceipt && (
        <ReceiptDialog
          receipt={selectedReceipt}
          open={isDialogOpen}
          onClose={handleCloseDialog}
          onSave={handleSaveReceiptUpdate}
        />
      )} */}
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
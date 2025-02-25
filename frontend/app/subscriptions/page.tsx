"use client";

import PageWrapper from "@/components/common/layouts/PageWrapper";
// import ReceiptModal from "@/components/receipts/AddReceipt";
// import ReceiptDialog from "@/components/receipts/ReceiptDialog";
import SubscriptionFilter from "@/components/subscriptions/SubscriptionFilter";
import SubscriptionGrid from "@/components/subscriptions/SubscriptionGrid";
import { TimePeriod, Subscription } from "@/types/subscriptions";
import { Box, Button, SelectChangeEvent } from "@mui/material";
import { Dayjs } from "dayjs";
import { useEffect, useState } from "react";

export default function Page() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [renewalTime, setRenewalTime] = useState<TimePeriod>("All");
  const [filterTerm, setFilterTerm] = useState("");
//   const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // const handleSaveReceipt = (newReceipt: Receipt) => {
  //   setReceipts((prevReceipts) => [...prevReceipts, newReceipt]);
  // };

  // Fetch receipts from API
//   useEffect(() => {
//     async function fetchReceipts() {
//       try {
//         const response = await fetch("http://127.0.0.1:8000/api/receipts/");
//         if (!response.ok) {
//           throw new Error("Failed to fetch receipts");
//         }
//         const data = await response.json();
//         setReceipts(data.receipts);
//       } catch (error) {
//         console.error("Error fetching receipts:", error);
//       }
//     }
//     fetchReceipts();
//   }, []);

  const handleTimePeriodChange = (event: SelectChangeEvent) => {
    setRenewalTime(event.target.value as TimePeriod);
  };

//   // to handle adding a new receipt (temporary, hardcoded for now)
//   const handleSaveReceipt = async (newReceipt: Receipt, file : File | null) => {
//     if (!file) {
//       console.error("No file selected");
//       return;
//     }

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
          filterTerm={filterTerm}
          setFilterTerm={setFilterTerm}
          handleTimePeriodChange={handleTimePeriodChange}
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

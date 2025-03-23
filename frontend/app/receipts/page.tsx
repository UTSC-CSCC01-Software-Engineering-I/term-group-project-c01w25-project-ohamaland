"use client";

import PageWrapper from "@/components/common/layouts/PageWrapper";
import AddReceipt from "@/components/receipts/AddReceipt";
import ReceiptDialog from "@/components/receipts/ReceiptDialog";
import ReceiptFilter from "@/components/receipts/ReceiptFilter";
import ReceiptGrid from "@/components/receipts/ReceiptGrid";
import { Category, Receipt } from "@/types/receipts";
import { Box, Button, SelectChangeEvent } from "@mui/material";
import { Dayjs } from "dayjs";
import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/utils/api";

export default function Page() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [filterTerm, setFilterTerm] = useState("");
  const [category, setCategory] = useState<Category>("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch receipts from API
  useEffect(() => {
    async function fetchReceipts() {
      try {
        const response = await fetchWithAuth("http://127.0.0.1:8000/api/receipts/");
        if (response && response.ok) {
          const data = await response.json();
          setReceipts(data.receipts);
        }
      } catch (error) {
        console.error("Error fetching receipts:", error);
        setReceipts([]);
      }
    }
    fetchReceipts();
  }, []);

  const handleCategoryChange = (event: SelectChangeEvent) => {
    setCategory(event.target.value as Category);
  };

  const handleSaveReceipt = async (newReceipt: Receipt, file: File | null) => {
    if (!file) {
      console.error("No file selected");
      return;
    }

    const formData = new FormData();
    formData.append("receipt_image", file);
    formData.append("merchant", newReceipt.merchant);
    formData.append("total_amount", newReceipt.total_amount.toString());
    formData.append("currency", newReceipt.currency);
    formData.append("date", newReceipt.date);
    formData.append("payment_method", newReceipt.payment_method);
    formData.append("items", JSON.stringify(newReceipt.items));
    formData.append("id", newReceipt.id.toString());

    try {
      const meResponse = await fetchWithAuth("http://127.0.0.1:8000/api/user/me/");
      if (meResponse && meResponse.ok) {
        const data = await meResponse.json();
        formData.append("user", data.id);

        const receiptResponse = await fetchWithAuth("http://127.0.0.1:8000/api/receipts/", {
          method: "POST",
          body: formData
        });

        if (receiptResponse && receiptResponse.ok) {
          const savedReceipt = await receiptResponse.json();
          setReceipts((prevReceipts) => [...prevReceipts, savedReceipt]);
          setIsModalOpen(false);
        }
      }
    } catch (error) {
      console.error("Error saving receipt:", error);
    }
  };

  const handleDeleteReceipt = async (receiptId: number) => {
    try {
      const response = await fetchWithAuth(`http://127.0.0.1:8000/api/receipts/${receiptId}/`, {
        method: "DELETE",
      });

      if (response && response.ok) {
        setReceipts((prevReceipts) =>
          prevReceipts.filter((receipt) => receipt.id !== receiptId)
        );

        if (selectedReceipt && selectedReceipt.id === receiptId) {
          setIsDialogOpen(false);
          setSelectedReceipt(null);
        }
      }
    } catch (error) {
      console.error("Error deleting receipt:", error);
    }
  };

  const handleOpenDialog = (receipt: Receipt) => {
    if (receipts.find(r => r.id === receipt.id)) {
      setSelectedReceipt(receipt);
      setIsDialogOpen(true);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedReceipt(null);
  };

  const handleSaveReceiptUpdate = async (updatedReceipt: Receipt) => {
    try {
      const formattedDate = new Date(updatedReceipt.date)
        .toISOString()
        .split("T")[0];

      const updatedData = {
        ...updatedReceipt,
        date: formattedDate
      };

      const response = await fetchWithAuth(
        `http://127.0.0.1:8000/api/receipts/${updatedReceipt.id}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(updatedData)
        }
      );

      if (response && response.ok) {
        const savedReceipt = await response.json();
        setReceipts((prevReceipts) =>
          prevReceipts.map((r) => (r.id === savedReceipt.id ? savedReceipt : r))
        );
        handleCloseDialog();
      }
    } catch (error) {
      console.error("Error updating receipt:", error);
    }
  };

  return (
    <PageWrapper>
      <Box sx={filterContainerStyle}>
        <ReceiptFilter
          startDate={startDate}
          endDate={endDate}
          filterTerm={filterTerm}
          category={category}
          setFilterTerm={setFilterTerm}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
          handleCategoryChange={handleCategoryChange}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={() => setIsModalOpen(true)}
          sx={buttonStyle}
        >
          Add Receipt
        </Button>
      </Box>
      <ReceiptGrid
        receipts={receipts}
        startDate={startDate}
        endDate={endDate}
        filterTerm={filterTerm}
        category={category}
        onOpenDialog={handleOpenDialog}
        onDeleteReceipt={handleDeleteReceipt}
      />

      <AddReceipt
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
      )}
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

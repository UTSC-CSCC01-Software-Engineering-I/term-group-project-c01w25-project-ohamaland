"use client";

import PageWrapper from "@/components/common/layouts/PageWrapper";
import AddReceipt from "@/components/receipts/AddReceipt";
import ReceiptDialog from "@/components/receipts/ReceiptDialog";
import ReceiptFilter from "@/components/receipts/ReceiptFilter";
import ReceiptGrid from "@/components/receipts/ReceiptGrid";
import { Category, Receipt } from "@/types/receipts";
import { fetchWithAuth, receiptsApi, receiptsDetailApi } from "@/utils/api";
import { Box, Button, SelectChangeEvent } from "@mui/material";
import { Dayjs } from "dayjs";
import { useEffect, useState } from "react";

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
        const response = await fetchWithAuth(receiptsApi);
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
    try {
      const receiptData = {
        ...newReceipt,
        total_amount: Number(newReceipt.total_amount.toFixed(2)),
        tax: newReceipt.tax ? Number(newReceipt.tax.toFixed(2)) : 0,
        tip: newReceipt.tip ? Number(newReceipt.tip.toFixed(2)) : 0,
        items: newReceipt.items.map((item) => ({
          ...item,
          price: Number(item.price.toFixed(2))
        }))
      };

      const receiptResponse = await fetchWithAuth(receiptsApi, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(receiptData)
      });

      if (!receiptResponse || !receiptResponse.ok) {
        const errorData = await receiptResponse?.json();
        console.error("Failed to save receipt:", errorData);
        throw new Error("Failed to save receipt");
      }

      const savedReceipt = await receiptResponse.json();
      setReceipts((prevReceipts) => [...prevReceipts, savedReceipt]);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving receipt:", error);
      throw error;
    }
  };

  const handleDeleteReceipt = async (receiptId: number) => {
    try {
      const response = await fetchWithAuth(receiptsDetailApi(receiptId), {
        method: "DELETE"
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
    if (receipts.find((r) => r.id === receipt.id)) {
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

      // Calculate total from items and tax
      const itemsSubtotal = Number(
        updatedReceipt.items
          .reduce(
            (sum, item) =>
              sum + Number((item.price * item.quantity).toFixed(2)),
            0
          )
          .toFixed(2)
      );
      const taxAmount = Number((updatedReceipt.tax || 0).toFixed(2));
      const tipAmount = Number((updatedReceipt.tip || 0).toFixed(2));
      const total = Number((itemsSubtotal + taxAmount + tipAmount).toFixed(2));

      const updatedData = {
        ...updatedReceipt,
        date: formattedDate,
        total_amount: total,
        tax: taxAmount,
        tip: tipAmount
      };

      // Remove tax_rate as it's not in the backend model
      delete updatedData.tax_rate;

      const response = await fetchWithAuth(
        receiptsDetailApi(updatedReceipt.id),
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(updatedData)
        }
      );

      if (!response || !response.ok) {
        console.error("Failed to save receipt");
        return;
      }

      const savedReceipt = await response.json();
      setReceipts((prevReceipts) =>
        prevReceipts.map((r) => (r.id === savedReceipt.id ? savedReceipt : r))
      );
      handleCloseDialog();
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

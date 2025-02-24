"use client";

import PageWrapper from "@/components/common/layouts/PageWrapper";
import ReceiptModal from "@/components/receipts/AddReceipt";
import ReceiptDialog from "@/components/receipts/ReceiptDialog";
import ReceiptFilter from "@/components/receipts/ReceiptFilter";
import ReceiptGrid from "@/components/receipts/ReceiptGrid";
import { Category, Receipt } from "@/types/receipts";
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

  // const handleSaveReceipt = (newReceipt: Receipt) => {
  //   setReceipts((prevReceipts) => [...prevReceipts, newReceipt]);
  // };

  // Fetch receipts from API
  useEffect(() => {
    async function fetchReceipts() {
      try {
        console.log("Fetching receipts..."); // ✅ Debugging log
        const response = await fetch("http://127.0.0.1:8000/api/receipts/");
        if (!response.ok) {
          throw new Error("Failed to fetch receipts");
        }
        const data = await response.json();
        console.log("Received Data:", data); // ✅ Debugging log
        setReceipts(data.receipts);
      } catch (error) {
        console.error("Error fetching receipts:", error);
      }
    }
    fetchReceipts();
  }, []);

  const handleCategoryChange = (event: SelectChangeEvent) => {
    setCategory(event.target.value as Category);
  };

  // to handle adding a new receipt (temporary, hardcoded for now)
  const handleSaveReceipt = (newReceipt: Receipt) => {
    setReceipts([...receipts, newReceipt]);
    setIsModalOpen(false);
  };

  const handleOpenDialog = (receipt: Receipt) => {
    setSelectedReceipt(receipt);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedReceipt(null);
  };

  const handleSaveReceiptUpdate = (updatedReceipt: Receipt) => {
    setReceipts((prevReceipts) =>
      prevReceipts.map((r) => (r.id === updatedReceipt.id ? updatedReceipt : r))
    );
    handleCloseDialog();
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
      />

      <ReceiptModal
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

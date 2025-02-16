"use client";

import PageWrapper from "@/components/common/layouts/PageWrapper";
import ReceiptDialog from "@/components/receipts/ReceiptDialog";
import ReceiptFilter from "@/components/receipts/ReceiptFilter";
import ReceiptGrid from "@/components/receipts/ReceiptGrid";
import { Category, Receipt } from "@/types/receipts";
import { SelectChangeEvent } from "@mui/material";
import { Dayjs } from "dayjs";
import { useEffect, useState } from "react";

export default function Page() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [filterTerm, setFilterTerm] = useState("");
  const [category, setCategory] = useState<Category>("All");
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  const handleOpenDialog = (receipt: Receipt) => {
    setSelectedReceipt(receipt);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedReceipt(null);
  };

  const handleSaveReceipt = (updatedReceipt: Receipt) => {
    setReceipts((prevReceipts) =>
      prevReceipts.map((r) => (r.id === updatedReceipt.id ? updatedReceipt : r))
    );
    handleCloseDialog();
  };

  return (
    <PageWrapper>
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
      <ReceiptGrid
        receipts={receipts}
        startDate={startDate}
        endDate={endDate}
        filterTerm={filterTerm}
        category={category}
        onOpenDialog={handleOpenDialog}
      />
      {selectedReceipt && (
        <ReceiptDialog
          receipt={selectedReceipt}
          open={isDialogOpen}
          onClose={handleCloseDialog}
          onSave={handleSaveReceipt}
        />
      )}
    </PageWrapper>
  );
}

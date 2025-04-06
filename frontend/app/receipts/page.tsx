"use client";

import PageWrapper from "@/components/common/layouts/PageWrapper";
import FolderGrid from "@/components/folders/FolderGrid";
import AddReceipt from "@/components/receipts/AddReceipt";
import ReceiptDialog from "@/components/receipts/ReceiptDialog";
import ReceiptFilter from "@/components/receipts/ReceiptFilter";
import ReceiptGrid from "@/components/receipts/ReceiptGrid";
import { defaultText } from "@/styles/colors";
import { IFolder } from "@/types/folders";
import { Category, Receipt } from "@/types/receipts";
import { fetchWithAuth, receiptsApi, receiptsDetailApi } from "@/utils/api";
import { folderService } from "@/utils/folderService";
import AddIcon from "@mui/icons-material/Add";
import { Box, IconButton, SelectChangeEvent, Typography } from "@mui/material";
import { Dayjs } from "dayjs";
import { useEffect, useState } from "react";

export default function Page() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [folders, setFolders] = useState<IFolder[]>([]);
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [filterTerm, setFilterTerm] = useState("");
  const [category, setCategory] = useState<Category>("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch receipts and folders from API
  useEffect(() => {
    async function fetchData() {
      try {
        const [receiptsResponse, foldersData] = await Promise.all([
          fetchWithAuth(receiptsApi),
          folderService.getAllFolders()
        ]);

        if (receiptsResponse && receiptsResponse.ok) {
          const data = await receiptsResponse.json();
          setReceipts(data.receipts);
        }
        setFolders(foldersData);
      } catch (error) {
        setReceipts([]);
        setFolders([]);
      }
    }
    fetchData();
  }, []);

  const handleCategoryChange = (event: SelectChangeEvent) => {
    setCategory(event.target.value as Category);
  };

  const handleAddFolder = async (name: string, color: string) => {
    try {
      const newFolder = await folderService.createFolder(name, color);
      setFolders((prevFolders) => [...prevFolders, newFolder]);
    } catch (error) {}
  };

  const handleDeleteFolder = async (folderId: number) => {
    try {
      await folderService.deleteFolder(folderId);
      setFolders((prevFolders) =>
        prevFolders.filter((folder) => folder.id !== folderId)
      );
    } catch (error) {}
  };

  const handleFolderClick = async (folderId: number) => {
    try {
      if (folderId === 1) {
        // 0 is the "All" folder ID
        // Fetch all receipts
        const response = await fetchWithAuth(receiptsApi);
        if (!response || !response.ok)
          throw new Error("Failed to fetch receipts");
        const data = await response.json();
        setReceipts(data.receipts);
      } else {
        const receiptIds = await folderService.getFolderReceipts(folderId);
        // Fetch the full receipt details for each receipt in the folder
        const fullReceipts = await Promise.all(
          receiptIds.map(async (receiptId) => {
            const response = await fetchWithAuth(receiptsDetailApi(receiptId));
            if (!response || !response.ok)
              throw new Error("Failed to fetch receipt");
            return response.json();
          })
        );
        setReceipts(fullReceipts);
      }
    } catch (error) {}
  };

  const handleSaveReceipt = async (newReceipt: Receipt) => {
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
        throw new Error("Failed to save receipt");
      }

      const savedReceipt = await receiptResponse.json();
      setReceipts((prevReceipts) => [...prevReceipts, savedReceipt]);
      setIsModalOpen(false);
    } catch (error) {
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
    } catch (error) {}
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
        return;
      }

      const savedReceipt = await response.json();
      setReceipts((prevReceipts) =>
        prevReceipts.map((r) => (r.id === savedReceipt.id ? savedReceipt : r))
      );
      handleCloseDialog();
    } catch (error) {}
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
        <Box
          sx={{
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
          }}
          onClick={() => setIsModalOpen(true)}
        >
          <IconButton size="large">
            <AddIcon sx={{ fontSize: 40, color: "#666" }} />
          </IconButton>
        </Box>
      </Box>

      <Typography sx={subsectionTitleStyle}>Folders</Typography>
      <FolderGrid
        folders={folders}
        onAddFolder={handleAddFolder}
        onDeleteFolder={handleDeleteFolder}
        onFolderClick={handleFolderClick}
      />

      <Typography sx={{ ...subsectionTitleStyle, marginTop: "16px" }}>
        Receipts
      </Typography>
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
  width: "100%",
  "& > *:first-of-type": {
    flex: 1
  }
};

const subsectionTitleStyle = {
  fontWeight: 700,
  fontSize: "24px",
  color: defaultText
};

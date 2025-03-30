"use client";

import PageWrapper from "@/components/common/layouts/PageWrapper";
import SpendingChart from "@/components/insights/SpendingChart";
import SpendingFilter from "@/components/insights/SpendingFilter";
import { fetchWithAuth, insightsDetailApi } from "@/utils/api";
import { Box, Button, SelectChangeEvent } from "@mui/material";
import { Dayjs } from "dayjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface FolderSpending {
  [folderName: string]: [number, string];
}

interface MerchantSpending {
  merchant: string;
  amount: number;
}

interface SpendingData {
  date: string;
  amount: number;
}

interface BackendSpendingResponse {
  user: number;
  total_spending: number;
  folder_spending: FolderSpending;
  merchant_spending: { [merchant: string]: number };
  period: string;
  date: string;
}

export default function Page() {
  const [folderSpending, setFolderSpending] = useState<FolderSpending>({});
  const [merchantSpending, setMerchantSpending] = useState<MerchantSpending[]>([]);
  const [spendingData, setSpendingData] = useState<SpendingData[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("Monthly");
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [filterTerm, setFilterTerm] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    async function fetchInsightsData() {
      try {
        const response = await fetchWithAuth(
          insightsDetailApi(selectedPeriod),
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json"
            }
          }
        );

        if (response && response.status === 401) {
          router.push("/login");
          return;
        }

        if (!response || !response.ok) {
          throw new Error("Failed to fetch spending data");
        }
        const fetchedData: BackendSpendingResponse = await response.json();

        const spendingOverTime = Object.entries(fetchedData.total_spending).map(
          ([date, amount]) => ({
            date,
            amount
          })
        );
        setSpendingData(spendingOverTime);
        setFolderSpending(fetchedData.folder_spending);
        setMerchantSpending(
          Object.entries(fetchedData.merchant_spending).map(([merchant, amount]) => ({
            merchant,
            amount
          }))
        );
        console.log("Fetched merchantSpending:", fetchedData.merchant_spending);
      } catch (error) {
        console.error("Error fetching spending data:", error);
      }
    }
    fetchInsightsData();
  }, [selectedPeriod, router]);

  const handlePeriodChange = (event: SelectChangeEvent<string>) => {
    setSelectedPeriod(event.target.value);
  };

  return (
    <PageWrapper>
      <Box sx={filterContainerStyle}>
        <SpendingFilter
          startDate={startDate}
          endDate={endDate}
          filterTerm={filterTerm}
          selectedPeriod={selectedPeriod}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
          setFilterTerm={setFilterTerm}
          handlePeriodChange={handlePeriodChange}
        />
        <Button variant="contained" color="primary" sx={buttonStyle}>
          View Insights
        </Button>
      </Box>
      <Box sx={chartContainerStyle}>
        <SpendingChart spendingData={spendingData} folderSpending={folderSpending} merchantSpending={merchantSpending}/>
      </Box>
    </PageWrapper>
  );
}

const filterContainerStyle = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "left",
  gap: "16px",
  width: "90vw",
  marginBottom: "16px",
};

const buttonStyle = {
  marginLeft: "8px",
  color: "white"
};

// Full width chart container
const chartContainerStyle = {
  display: "flex",
  flexDirection: "row",
  justifyContent: "center", // Ensures charts are spaced evenly
  alignItems: "center", // Ensures charts stretch to fill the height
  padding: "0 20px", // Optional padding to ensure some spacing
};

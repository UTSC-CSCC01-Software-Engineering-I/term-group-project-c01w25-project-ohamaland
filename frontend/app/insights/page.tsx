"use client";

import PageWrapper from "@/components/common/layouts/PageWrapper";
import SpendingChart from "@/components/insights/SpendingChart";
import SpendingFilter from "@/components/insights/SpendingFilter";
import { fetchWithAuth, insightsDetailApi } from "@/utils/api";
import { Box, Button, SelectChangeEvent } from "@mui/material";
import { Dayjs } from "dayjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface SpendingData {
  category: string;
  amount: number;
  date: string;
}

interface BackendSpendingResponse {
  user: number;
  total_spending: number;
  category_spending: Record<string, number>;
  period: string;
  date: string;
}

export default function Page() {
  const [spendingData, setSpendingData] = useState<SpendingData[]>([]);
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [filterTerm, setFilterTerm] = useState<string>("");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("Weekly");
  const [categorySpending, setCategorySpending] = useState<
    Record<string, number>
  >({});
  const router = useRouter();

  useEffect(() => {
    async function fetchSpendingData() {
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

        const transformedData: SpendingData[] = Object.entries(
          fetchedData.total_spending
        ).map(([date, amount]) => ({
          category: "Total",
          amount: Number(amount),
          date
        }));

        console.log("Transformed Spending Data:", transformedData);

        setSpendingData(transformedData); // Set the transformed data to the state
        setCategorySpending(fetchedData.category_spending || {});
      } catch (error) {
        console.error("Error fetching spending data:", error);
      }
    }
    fetchSpendingData();
  }, [selectedPeriod, router]);

  const handlePeriodChange = (event: SelectChangeEvent<string>) => {
    setSelectedPeriod(event.target.value); // Update selected period
  };

  return (
    <PageWrapper>
      <Box sx={filterContainerStyle}>
        <SpendingFilter
          selectedPeriod={selectedPeriod}
          handlePeriodChange={handlePeriodChange}
          startDate={startDate}
          endDate={endDate}
          filterTerm={filterTerm}
          setFilterTerm={setFilterTerm}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
        />
        <Button variant="contained" color="primary" sx={buttonStyle}>
          View Insights
        </Button>
      </Box>
      <SpendingChart
        spendingData={spendingData}
        categorySpending={categorySpending || {}}
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

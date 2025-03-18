"use client";

import PageWrapper from "@/components/common/layouts/PageWrapper";
import SpendingFilter from "@/components/spending/SpendingFilter";
import SpendingChart from "@/components/spending/SpendingChart";
import { Box, Button, SelectChangeEvent } from "@mui/material";
import { useEffect, useState } from "react";
import { Dayjs } from "dayjs";

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
  const [categorySpending, setCategorySpending] = useState<Record<string, number>>({});

  useEffect(() => {
    async function fetchSpendingData() {
      try {
        console.log("Fetching spending data...");
        const response = await fetch(`http://127.0.0.1:8000/api/analytics/spending/1/${selectedPeriod}/`);
        if (!response.ok) {
          throw new Error("Failed to fetch spending data");
        }
        const fetchedData: BackendSpendingResponse = await response.json();
        console.log("Fetched Data:", fetchedData);


        const transformedData: SpendingData[] = Object.entries(fetchedData.total_spending).map(([date, amount]) => ({
          category: "Total",
          amount: Number(amount),
          date,
        }));
  
        console.log("Transformed Spending Data:", transformedData);
  
        setSpendingData(transformedData); // Set the transformed data to the state
        setCategorySpending(fetchedData.category_spending || {});
      } catch (error) {
        console.error("Error fetching spending data:", error);
      }
    }
    fetchSpendingData();
  }, [selectedPeriod]);


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
      <SpendingChart spendingData={spendingData} categorySpending={categorySpending || {}} />


      
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
  color: "white",
};
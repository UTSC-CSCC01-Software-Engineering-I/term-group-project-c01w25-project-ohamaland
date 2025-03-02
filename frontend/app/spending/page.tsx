"use client";

import PageWrapper from "../../components/common/layouts/PageWrapper";
import SpendingFilter from "../../components/spending/SpendingFilter";
import SpendingChart from "../../components/spending/SpendingChart";
import { Box, Button, SelectChangeEvent } from "@mui/material";
import { useEffect, useState } from "react";
import { Dayjs } from "dayjs";


export default function Page() {
  const [spendingData, setSpendingData] = useState([]);
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [filterTerm, setFilterTerm] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    async function fetchSpendingData() {
      try {
        console.log("Fetching spending data...");
        const response = await fetch("http://127.0.0.1:8000/api/spending/");
        if (!response.ok) {
          throw new Error("Failed to fetch spending data");
        }
        const data = await response.json();
        console.log("Received Data:", data);
        setSpendingData(data.spending);
      } catch (error) {
        console.error("Error fetching spending data:", error);
      }
    }
    fetchSpendingData();
  }, []);

  const handleCategoryChange = (event: SelectChangeEvent) => {
    setCategory(event.target.value);
  };

  return (
    <PageWrapper>
      <Box sx={filterContainerStyle}>
        <SpendingFilter
          startDate={startDate}
          endDate={endDate}
          filterTerm={filterTerm}
          category={category}
          setFilterTerm={setFilterTerm}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
          handleCategoryChange={handleCategoryChange}
        />
        <Button variant="contained" color="primary" sx={buttonStyle}>
          View Insights
        </Button>
      </Box>
      <SpendingChart spendingData={spendingData} />
    </PageWrapper>
  );
}

const filterContainerStyle = {
  display: "flex",
  alignItems: "center",
  gap: "16px",
  marginBottom: "16px",
  width: "100%",
};

const buttonStyle = {
  marginLeft: "8px",
  color: "white",
};
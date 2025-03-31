"use client";

import PageWrapper from "@/components/common/layouts/PageWrapper";
import CurrencyDistributionChart from "@/components/insights/CurrencyDistributionChart";
import SpendingByFolderChart from "@/components/insights/SpendingByFolderChart";
import SpendingByMerchantChart from "@/components/insights/SpendingByMerchantChart";
import SpendingByPaymentMethodChart from "@/components/insights/SpendingByPaymentMethodChart";
import SpendingChart from "@/components/insights/SpendingChart";
import SpendingFilter from "@/components/insights/SpendingFilter";
import SpendingOverTimeChart from "@/components/insights/SpendingOverTimeChart";
import { background } from "@/styles/colors";
import { fetchWithAuth, insightsDetailApi } from "@/utils/api";
import { Box, LinearProgress, SelectChangeEvent, Typography, Grid } from "@mui/material";
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

interface PaymentMethodSpending {
  payment_method: string;
  amount: number;
}

interface CurrencyDistribution {
  currency: string;
  percentage: number;
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
  payment_method_spending: { [payment_method: string]: number };
  currency_distribution: { [currency: string]: number };
  period: string;
  date: string;
  currency: string;
}

export default function Page() {
  const [folderSpending, setFolderSpending] = useState<FolderSpending>({});
  const [merchantSpending, setMerchantSpending] = useState<MerchantSpending[]>([]);
  const [spendingData, setSpendingData] = useState<SpendingData[]>([]);
  const [paymentMethodSpending, setPaymentMethodSpending] = useState<PaymentMethodSpending[]>([]);
  const [currencyDistribution, setCurrencyDistribution] = useState<CurrencyDistribution[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("Monthly");
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [filterTerm, setFilterTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [currency, setCurrency] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    async function fetchInsightsData() {
      setLoading(true);
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
        setCurrency(fetchedData.currency);
        setSpendingData(spendingOverTime);
        setFolderSpending(fetchedData.folder_spending);
        setPaymentMethodSpending(
          Object.entries(fetchedData.payment_method_spending).map(([payment_method, amount]) => ({
            payment_method,
            amount
          }))
        );
        setMerchantSpending(
          Object.entries(fetchedData.merchant_spending).map(([merchant, amount]) => ({
            merchant,
            amount
          }))
        );
        setCurrencyDistribution(
          Object.entries(fetchedData.currency_distribution).map(([currency, percentage]) => ({
            currency,
            percentage
          }))
        );
      } catch (error) {
        console.error("Error fetching spending data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchInsightsData();
  }, [selectedPeriod, router]);

  const handlePeriodChange = (event: SelectChangeEvent<string>) => {
    setSelectedPeriod(event.target.value);
  };

  return (
    <PageWrapper>
      <Box sx={headerContainerStyle}>
        <Typography variant="h4" fontWeight="bold">Insights</Typography>
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
      </Box>

      {loading && <LinearProgress sx={loadingBarStyle} />}

      {!loading && (
        <Grid container spacing={1} sx={{ padding: "24px" }}>
        {/* Spending Over Time Chart (2/3 width) */}
        <Grid item xs={8}>
          <Box sx={{ height: "100%" }}>
            <SpendingOverTimeChart spendingData={spendingData} currency={currency} />
          </Box>
        </Grid>
      
        {/* Currency Distribution Chart (1/3 width, full height) */}
        <Grid item xs={4}>
          <Box sx={{ height: "100%" }}>
            <CurrencyDistributionChart currencyDistribution={currencyDistribution} />
          </Box>
        </Grid>
      
        {/* Bottom row: 3 equally sized charts */}
        <Grid item xs={4}>
          <Box sx={{ height: "100%" }}>
            <SpendingByMerchantChart merchantSpending={merchantSpending} currency={currency} />
          </Box>
        </Grid>
        <Grid item xs={4}>
          <Box sx={{ height: "100%" }}>
            <SpendingByFolderChart folderSpending={folderSpending} currency={currency} />
          </Box>
        </Grid>
        <Grid item xs={4}>
          <Box sx={{ height: "100%" }}>
            <SpendingByPaymentMethodChart paymentMethodSpending={paymentMethodSpending} currency={currency} />
          </Box>
        </Grid>
      </Grid>
      )}
    </PageWrapper>
  );
}

const headerContainerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "16px 24px",
  boxShadow: "0px 8px 8px rgba(0, 0, 0, 0.1)",
  borderRadius: "12px",
  borderBottom: "1px solid #ddd",
};

const loadingBarStyle = {
  width: "100%",
  height: "8px",
  marginBottom: "16px",
};
"use client";

import PageWrapper from "@/components/common/layouts/PageWrapper";
import RecentReceipts from "@/components/dashboard/RecentReceipts";
import CurrencyDistributionChart from "@/components/insights/CurrencyDistributionChart";
import SpendingOverTimeChart from "@/components/insights/SpendingOverTimeChart";
import SubscriptionCard from "@/components/subscriptions/SubscriptionCard";
import { Subscription } from "@/types/subscriptions";
import { dashboardApi, fetchWithAuth } from "@/utils/api";
import { Box, Grid, LinearProgress, Typography } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Receipt {
  merchant: string;
  date: string;
  amount: number;
}

interface CurrencyDistribution {
  currency: string;
  percentage: number;
}

interface DashboardData {
  user: number;
  total_spending: { [date: string]: number };
  total_spent: number;
  receipts: Receipt[];
  subscription: Subscription[];
  currency: string;
  date: string;
  percent_change: string;
  currency_distribution: { [currency: string]: number };
}

export default function Page() {
  const [totalSpent, setTotalSpent] = useState<number>(0);
  const [totalSpending, setTotalSpending] = useState<{
    [date: string]: number;
  } | null>(null);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [currency, setCurrency] = useState<string>("USD");
  const [percentChange, setPercentChange] = useState<string>("0%");
  const [currencyDistribution, setCurrencyDistribution] = useState<
    CurrencyDistribution[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      try {
        const response = await fetchWithAuth(dashboardApi, {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          }
        });

        if (response && response.status === 401) {
          router.push("/login");
          return;
        }

        if (!response || !response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const fetchedData: DashboardData = await response.json();
        setTotalSpent(fetchedData.total_spent);
        setTotalSpending(fetchedData.total_spending);
        setReceipts(fetchedData.receipts);
        setSubscriptions(fetchedData.subscription);
        setPercentChange(fetchedData.percent_change);
        setCurrencyDistribution(
          Object.entries(fetchedData.currency_distribution).map(
            ([currency, percentage]) => ({
              currency,
              percentage
            })
          )
        );
        setCurrency(fetchedData.currency);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, [router]);

  if (!totalSpending || !subscriptions) {
    return (
      <PageWrapper>
        <Box sx={headerContainerStyle}>
          <Typography variant="h4" fontWeight="bold">
            Dashboard
          </Typography>
        </Box>
        <Box>
          <LinearProgress sx={loadingBarStyle} />
        </Box>
      </PageWrapper>
    );
  }
  const totalSpendingData = Object.keys(totalSpending).map((date) => ({
    date,
    amount: totalSpending[date]
  }));

  return (
    <PageWrapper>
      <Box sx={headerContainerStyle}>
        <Typography variant="h4" fontWeight="bold">
          Dashboard
        </Typography>
      </Box>
      {!loading && (
        <Grid container spacing={2} sx={dashbaordContentStyle}>
          {/* Top Left: Total Spending */}
          <Grid item xs={12} sm={6}>
            <Box
              sx={{
                ...boxStyle,
                display: "flex",
                flexDirection: "column",
                flexGrow: 1
              }}
            >
              <Typography variant="h5" fontWeight="bold">
                Total Spending in the Last Month
              </Typography>
              <Typography variant="h6">
                ${totalSpent} ({currency})
              </Typography>
              <Typography variant="h6">
                {percentChange} from last month
              </Typography>
              <Box
                sx={{ flexGrow: 1, display: "flex", justifyContent: "center" }}
              >
                <CurrencyDistributionChart
                  currencyDistribution={currencyDistribution}
                />
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Link href="/subscriptions" style={{ textDecoration: "none" }}>
              <Box
                sx={{
                  ...boxStyle,
                  display: "flex",
                  flexDirection: "column",
                  flexGrow: 1
                }}
              >
                <Typography variant="h5" fontWeight="bold" sx={labelStyle}>
                  Upcoming Subscription Payments
                </Typography>
                {subscriptions.length > 0 ? (
                  <Grid container spacing={1} justifyContent="center">
                    {subscriptions.map((sub, index) => (
                      <Grid item key={index} sx={SubscriptionCardStyle}>
                        <SubscriptionCard
                          subscription={sub}
                          clickable={false}
                        />
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography variant="body1" textAlign="center">
                    No subscriptions found
                  </Typography>
                )}
              </Box>
            </Link>
          </Grid>

          {/* Bottom Left: Spending Over Time */}
          <Grid item xs={12} sm={6}>
            <Box sx={boxStyle}>
              <Typography variant="h5" fontWeight="bold" sx={labelStyle}>
                Spending Over Time
              </Typography>
              <SpendingOverTimeChart
                spendingData={totalSpendingData}
                currency={currency}
              />
            </Box>
          </Grid>

          {/* Bottom Right: Recent Receipts */}
          <Grid item xs={12} sm={6}>
            <Link href="/receipts" style={{ textDecoration: "none" }}>
              <Box sx={{ ...boxStyle, height: "100%" }}>
                <Typography variant="h5" fontWeight="bold" sx={labelStyle}>
                  Recent Receipts
                </Typography>
                <Box>
                  {receipts.map((receipt, index) => (
                    <RecentReceipts
                      key={`${receipt.date}-${index}`}
                      merchant={receipt.merchant}
                      date={receipt.date}
                      amount={receipt.amount}
                    />
                  ))}
                </Box>
              </Box>
            </Link>
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
  borderBottom: "1px solid #ddd"
};

const loadingBarStyle = {
  width: "100%",
  height: "8px",
  marginBottom: "16px"
};

const boxStyle = {
  height: "100%",
  padding: "24px",
  marginBottom: "24px",
  boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.1)",
  borderRadius: "8px"
};

const SubscriptionCardStyle = {
  minWidth: 400
};

const labelStyle = {
  marginBottom: "16px"
};

const dashbaordContentStyle = {
  padding: "24px",
  marginBottom: "24px"
};

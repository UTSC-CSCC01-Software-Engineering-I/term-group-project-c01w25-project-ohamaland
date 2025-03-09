export type Subscription = {
    id: number;
    user_id: number;
    merchant: string;
    total_amount: number;
    currency: Currency;
    renewal_date: string; // this is a string but is in ISO date format
    billing_period: BillingPeriod;
    billing_interval: number;
    // TODO: add "associated card account" after plaid integration? ex: Card ending with **1234
  };

  export type Currency = "USD" | "CAD" | "";

  export const currencies = ["USD", "CAD"];

  export const allTimePeriods = "All";

  export type TimePeriod =
    | "This Month"
    | "Within Three Months"
    | "Within Six Months"
    | "This Year"
    | typeof allTimePeriods;

  export const timePeriods = [
    "This Month",
    "Within Three Months",
    "Within Six Months",
    "This Year",
    allTimePeriods
  ];

  export type BillingPeriod = "Daily" | "Weekly" | "Monthly" | "Yearly"| "Custom" | typeof allTimePeriods;

  export const billingPeriods = ["Daily", "Weekly", "Monthly", "Yearly", "Custom", allTimePeriods];
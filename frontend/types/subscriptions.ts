export type Subscription = {
  id: number;
  user_id: number;
  merchant: string;
  total_amount: number;
  currency: Currency;
  renewal_date: string; // this is a string but is in ISO date format
  billing_period: BillingPeriod;
};

export type Currency = "USD" | "CAD" | "";

export const currencies = ["USD", "CAD"];

export const allTimePeriods = "All";

export type TimePeriod =
  | "One Month"
  | "Three Months"
  | "Six Months"
  | "One Year"
  | typeof allTimePeriods;

export const timePeriods = [
  "One Month",
  "Three Months",
  "Six Months",
  "One Year",
  allTimePeriods
];

export type BillingPeriod =
  | "Daily"
  | "Weekly"
  | "Monthly"
  | "Yearly"
  | typeof allTimePeriods;

export const billingPeriods = [
  "Daily",
  "Weekly",
  "Monthly",
  "Yearly",
  allTimePeriods
];

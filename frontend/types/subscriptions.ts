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
    // items: ReceiptItem[];
    // payment_method: PaymentMethod;
    // receipt_image_url: string | null;
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

  export const billingPeriod = ["Daily", "Weekly", "Monthly", "Yearly", "Custom", allTimePeriods];

//   export type PaymentMethod = "Credit Card" | "Debit Card" | "Cash" | "";

//   export const paymentMethods = ["Credit", "Debit", "Cash"];

  // export type SubscriptionItem = {
  //   id: number;
  //   name: string;
  //   time_period: TimePeriod;
  //   price: number;
  // };

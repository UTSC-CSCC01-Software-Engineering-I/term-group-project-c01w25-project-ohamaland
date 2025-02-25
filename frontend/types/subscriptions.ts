export type Subscription = {
    id: number;
    user_id: number;
    merchant: string;
    total_amount: number;
    currency: Currency;
    renewalDate: string; // this is a string but is in ISO date format
    // items: ReceiptItem[];
    // payment_method: PaymentMethod;
    // receipt_image_url: string | null;
  };

  export type Currency = "USD" | "CAD" | "";

  export const currencies = ["USD", "CAD"];

  export const allTimePeriods = "All";

  export type TimePeriod =
    | "This Month"
    | "Within 3 Months"
    | "Within 6 Months"
    | "This Year"
    | typeof allTimePeriods;

  export const timePeriods = [
    "This Month",
    "Within 3 Months",
    "Within 6 Months",
    "This Year",
    allTimePeriods
  ];

//   export type PaymentMethod = "Credit Card" | "Debit Card" | "Cash" | "";

//   export const paymentMethods = ["Credit", "Debit", "Cash"];

  export type SubscriptionItem = {
    id: number;
    name: string;
    timePeriod: TimePeriod;
    price: number;
  };

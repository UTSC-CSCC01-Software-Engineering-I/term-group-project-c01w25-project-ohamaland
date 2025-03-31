export type Receipt = {
  id: number;
  user_id?: number;
  group?: number;
  merchant: string;
  total_amount: number;
  currency: Currency;
  date: string; // this is a string but is in ISO date format
  items: ReceiptItem[];
  payment_method: PaymentMethod;
  receipt_image_url: string | null;
};

export type Currency = "USD" | "CAD" | "";

export const currencies = ["USD", "CAD"];

export const allCategory = "All";

export type Category =
  | "Home"
  | "Food"
  | "Clothing"
  | "Utilities"
  | "Entertainment"
  | "Fixtures"
  | "Furniture"
  | "Health"
  | "Beauty"
  | "Electronics"
  | typeof allCategory;

export const categories = [
  "Home",
  "Food",
  "Clothing",
  "Utilities",
  "Entertainment",
  "Fixtures",
  "Furniture",
  "Health",
  "Beauty",
  "Electronics",
  allCategory
];

export type PaymentMethod = "Debit" | "Credit" | "Cash" | "";

export const paymentMethods = ["Debit", "Credit", "Cash"];

export type ReceiptItem = {
  id?: number; // Make id optional for new items
  name: string;
  price: number;
  quantity: number;
};

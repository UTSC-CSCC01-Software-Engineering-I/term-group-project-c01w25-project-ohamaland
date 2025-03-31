export interface Receipt {
  id: number;
  merchant: string;
  date: string;
  currency: Currency;
  payment_method: PaymentMethod;
  items: ReceiptItem[];
  total_amount: number;
  tax?: number;
  tip?: number;
  tax_rate?: number;
  tip_rate?: number;
  category?: Category;
  file?: string;
}

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

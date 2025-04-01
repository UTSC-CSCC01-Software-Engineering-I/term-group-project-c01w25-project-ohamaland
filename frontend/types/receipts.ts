import { GroupReceiptSplit } from "@/types/groupReceiptSplits";

export interface Receipt {
  id: number;
  user?: number;
  group?: number;
  merchant: string;
  total_amount: number;
  currency: Currency;
  date: string;
  payment_method: PaymentMethod;
  tax?: number;
  tip?: number;
  tax_last: boolean;
  send_mail: boolean;
  created_at: string;
  receipt_image_url: string;
  color: string;
  folder: string;
  items: ReceiptItem[];
  splits: GroupReceiptSplit[];
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
  id?: number;
  name: string;
  price: number;
  quantity: number;
};

export type Receipt = {
  id: number;
  user_id: number;
  merchant: string;
  total_amount: number;
  currency: Currency;
  date: string; // this is a string but is in ISO date format
  items: ReceiptItem[];
  payment_method: PaymentMethod;
  receipt_image_url: string;
};

export type Currency = "USD" | "CAD";

export const allCategory = "All";

export type Category =
  | "Home Goods"
  | "Food"
  | "Clothing"
  | "Fixture"
  | typeof allCategory;

export const categories = [
  "Home Goods",
  "Food",
  "Clothing",
  "Fixture",
  allCategory
];

export type PaymentMethod = "Credit Card" | "Debit Card" | "Cash";

export type ReceiptItem = {
  id: number;
  name: string;
  category: Category;
  price: number;
  quantity: number;
};

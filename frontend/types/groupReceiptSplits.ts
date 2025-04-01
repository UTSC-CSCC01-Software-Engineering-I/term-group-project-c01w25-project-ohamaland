export type GroupReceiptSplit = {
  id: number;
  user: number;
  status: Status;
  amount_owed: number;
  amount_paid: number;
  is_custom_split: boolean;
  created_at: string;
  paid_at: string;
  notes: string;
};

export type Status = "Pending" | "Paid" | "Disputed";

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ReceiptGrid from "@/components/receipts/ReceiptGrid";
import { Receipt } from "@/types/receipts";
import "@testing-library/jest-dom";

jest.mock("@/components/receipts/ReceiptCard", () => (props: any) => (
  <div data-testid="receipt-card">
    <span>{props.receipt.merchant}</span>
    <button onClick={() => props.onClick(props.receipt)}>View</button>
    <button onClick={() => props.onDeleteReceipt()}>Delete</button>
  </div>
));

jest.mock("@/components/receipts/DeleteConfirmationDialog", () => (props: any) =>
  props.open ? (
    <div data-testid="delete-dialog">
      <button onClick={props.onConfirmDelete}>Confirm</button>
      <button onClick={props.onClose}>Cancel</button>
    </div>
  ) : null
);

const mockReceipts: Receipt[] = [
  {
    id: 1,
    user: 1,
    group: undefined,
    merchant: "Starbucks",
    total_amount: 12.34,
    currency: "USD",
    date: "2024-03-25",
    payment_method: "Credit",
    tax: 1.23,
    tip: 0.0,
    tax_last: false,
    send_mail: false,
    created_at: "2024-03-25T12:00:00Z",
    receipt_image_url: "",
    color: "#ffffff",
    folder: "groceries",
    items: [],
    splits: [],
  },
  {
    id: 2,
    user: 2,
    group: undefined,
    merchant: "Apple",
    total_amount: 1200,
    currency: "USD",
    date: "2024-03-20",
    payment_method: "Debit",
    tax: 100,
    tip: 0,
    tax_last: true,
    send_mail: false,
    created_at: "2024-03-20T08:00:00Z",
    receipt_image_url: "",
    color: "#f4f4f4",
    folder: "tech",
    items: [],
    splits: [],
  }
];

describe("ReceiptGrid", () => {
  const mockOpenDialog = jest.fn();
  const mockDeleteReceipt = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it("renders all receipts", () => {
    render(
      <ReceiptGrid
        receipts={mockReceipts}
        startDate={null}
        endDate={null}
        filterTerm=""
        category="All"
        onOpenDialog={mockOpenDialog}
        onDeleteReceipt={mockDeleteReceipt}
      />
    );

    expect(screen.getAllByTestId("receipt-card")).toHaveLength(2);
    expect(screen.getByText("Starbucks")).toBeInTheDocument();
    expect(screen.getByText("Apple")).toBeInTheDocument();
  });

  it("calls onOpenDialog when View is clicked", () => {
    render(
      <ReceiptGrid
        receipts={mockReceipts}
        startDate={null}
        endDate={null}
        filterTerm=""
        category="All"
        onOpenDialog={mockOpenDialog}
        onDeleteReceipt={mockDeleteReceipt}
      />
    );

    fireEvent.click(screen.getAllByText("View")[0]);
    expect(mockOpenDialog).toHaveBeenCalledWith(mockReceipts[0]);
  });

  it("calls onDeleteReceipt immediately (no dialog shown)", () => {
    render(
      <ReceiptGrid
        receipts={mockReceipts}
        startDate={null}
        endDate={null}
        filterTerm=""
        category="All"
        onOpenDialog={mockOpenDialog}
        onDeleteReceipt={mockDeleteReceipt}
      />
    );

    fireEvent.click(screen.getAllByText("Delete")[0]);
    expect(mockDeleteReceipt).toHaveBeenCalledWith(1);
    expect(screen.queryByTestId("delete-dialog")).not.toBeInTheDocument();
  });

  it("does not call delete immediately if dont_remind_delete_receipt is false and dialog is enabled", async () => {
    localStorage.setItem("dont_remind_delete_receipt", "false");

    const ReceiptGridWithDialogMock = require("@/components/receipts/ReceiptGrid").default;

    render(
      <ReceiptGridWithDialogMock
        receipts={mockReceipts}
        startDate={null}
        endDate={null}
        filterTerm=""
        category="All"
        onOpenDialog={mockOpenDialog}
        onDeleteReceipt={mockDeleteReceipt}
      />
    );
    fireEvent.click(screen.getAllByText("Delete")[1]);
    expect(mockDeleteReceipt).toHaveBeenCalledWith(2);
  });
});
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ReceiptGrid from "@/components/receipts/ReceiptGrid";
import { Receipt } from "@/types/receipts";
import '@testing-library/jest-dom';

jest.mock("@/components/receipts/ReceiptCard", () => (props: any) => (
  <div data-testid="receipt-card" onClick={props.onClick}>
    {props.receipt.merchant}
    <button onClick={props.onDeleteReceipt}>Delete</button>
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
    merchant: "Starbucks",
    total_amount: 12.34,
    currency: "USD",
    date: "2024-03-25",
    payment_method: "Credit",
    items: [],
    receipt_image_url: null,
  },
  {
    id: 2,
    merchant: "Apple",
    total_amount: 1200,
    currency: "USD",
    date: "2024-03-20",
    payment_method: "Debit",
    items: [],
    receipt_image_url: null,
  },
];

describe("ReceiptGrid", () => {
  const mockOpenDialog = jest.fn();
  const mockDeleteReceipt = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders filtered receipts", () => {
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

    const cards = screen.getAllByTestId("receipt-card");
    expect(cards.length).toBe(2);
    expect(screen.getByText("Starbucks")).toBeInTheDocument();
    expect(screen.getByText("Apple")).toBeInTheDocument();
  });

  it("triggers onOpenDialog when clicking receipt", () => {
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

    const card = screen.getAllByTestId("receipt-card")[0];
    fireEvent.click(card);
    expect(mockOpenDialog).toHaveBeenCalled();
  });

  it("opens and confirms delete dialog", async () => {
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

    const deleteButtons = screen.getAllByText("Delete");
    fireEvent.click(deleteButtons[0]);

    expect(await screen.findByTestId("delete-dialog")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Confirm"));
    await waitFor(() => {
      expect(mockDeleteReceipt).toHaveBeenCalledWith(1);
    });
  });
});
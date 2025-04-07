import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ReceiptCard from "@/components/receipts/ReceiptCard";
import { Receipt } from "@/types/receipts";
import "@testing-library/jest-dom";

describe("ReceiptCard", () => {
  const mockOnClick = jest.fn();
  const mockOnDelete = jest.fn();

  const mockReceipt: Receipt = {
    id: 1,
    user: 1,
    group: undefined,
    merchant: "Walmart",
    total_amount: 45.67,
    currency: "USD",
    date: "2024-03-25T00:00:00Z",
    payment_method: "Credit",
    tax: 2.34,
    tip: 1.5,
    tax_last: false,
    send_mail: false,
    created_at: "2024-03-25T01:00:00Z",
    receipt_image_url: "https://example.com/receipt.jpg",
    color: "#ffffff",
    folder: "groceries",
    items: [
      { id: 1, name: "Milk", price: 3.5, quantity: 2 },
      { id: 2, name: "Bread", price: 2.0, quantity: 1 },
      { id: 3, name: "Eggs", price: 4.2, quantity: 1 },
    ],
    splits: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders receipt details correctly", () => {
    render(
      <ReceiptCard
        receipt={mockReceipt}
        onClick={mockOnClick}
        onDeleteReceipt={mockOnDelete}
      />
    );

    expect(screen.getByText("Walmart")).toBeInTheDocument();
    expect(screen.getByText("2024-03-25")).toBeInTheDocument();
    expect(screen.getByText("Credit")).toBeInTheDocument();
    expect(screen.getByText(/Total:.*USD.*45.67/i)).toBeInTheDocument();
    expect(screen.getByText(/Milk/)).toBeInTheDocument();
    expect(screen.getByText(/Bread/)).toBeInTheDocument();
    expect(screen.getByText(/Eggs/)).toBeInTheDocument();
  });

  it("calls onClick when the card is clicked (excluding delete)", () => {
    render(
      <ReceiptCard
        receipt={mockReceipt}
        onClick={mockOnClick}
        onDeleteReceipt={mockOnDelete}
      />
    );

    const card = screen.getByText("Walmart").closest("div");
    fireEvent.click(card!);

    expect(mockOnClick).toHaveBeenCalled();
  });

  it("calls onDeleteReceipt when delete icon is clicked", () => {
    render(
      <ReceiptCard
        receipt={mockReceipt}
        onClick={mockOnClick}
        onDeleteReceipt={mockOnDelete}
      />
    );

    const deleteButton = screen.getByRole("button"); // Assumes only one button is rendered
    fireEvent.click(deleteButton);
    expect(mockOnDelete).toHaveBeenCalledWith(mockReceipt.id);
  });
});
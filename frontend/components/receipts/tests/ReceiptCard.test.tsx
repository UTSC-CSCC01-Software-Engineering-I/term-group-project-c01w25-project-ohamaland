import ReceiptCard from "@/components/receipts/ReceiptCard";
import { Receipt } from "@/types/receipts";
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";

describe("ReceiptCard", () => {
  const mockOnClick = jest.fn();
  const mockOnDelete = jest.fn();

  const mockReceipt: Receipt = {
    id: 1,
    merchant: "Walmart",
    total_amount: 45.67,
    currency: "USD",
    date: "2024-03-25T00:00:00Z",
    payment_method: "Credit",
    receipt_image_url: "https://example.com/receipt.jpg",
    items: [
      {
        id: 1,
        name: "Milk",
        price: 3.5,
        quantity: 2
      },
      {
        id: 2,
        name: "Bread",
        price: 2.0,
        quantity: 1
      },
      {
        id: 3,
        name: "Eggs",
        price: 4.2,
        quantity: 1
      }
    ]
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
    expect(screen.getByText("Total: USD 45.67")).toBeInTheDocument();
    expect(screen.getByText(/Milk/)).toBeInTheDocument();
    expect(screen.getByText(/Bread/)).toBeInTheDocument();
    expect(screen.getByText(/\+ 1 more/i)).toBeInTheDocument();
  });

  it("calls onClick when View Details is clicked", () => {
    render(
      <ReceiptCard
        receipt={mockReceipt}
        onClick={mockOnClick}
        onDeleteReceipt={mockOnDelete}
      />
    );

    fireEvent.click(screen.getByText("View Details"));
    expect(mockOnClick).toHaveBeenCalled();
  });

  it("calls onDeleteReceipt when Delete Receipt is clicked", () => {
    render(
      <ReceiptCard
        receipt={mockReceipt}
        onClick={mockOnClick}
        onDeleteReceipt={mockOnDelete}
      />
    );

    fireEvent.click(screen.getByText("Delete Receipt"));
    expect(mockOnDelete).toHaveBeenCalledWith(mockReceipt.id);
  });
});

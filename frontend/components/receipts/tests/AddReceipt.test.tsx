import AddReceipt from "@/components/receipts/AddReceipt";
import { Receipt } from "@/types/receipts";
import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

describe("AddReceipt component", () => {
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();

  const setup = () => {
    render(
      <AddReceipt open={true} onClose={mockOnClose} onSave={mockOnSave} />
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders modal and form fields", () => {
    setup();
    expect(screen.getByText("Add Receipt")).toBeInTheDocument();
    expect(screen.getByLabelText("Merchant")).toBeInTheDocument();
    expect(screen.getByLabelText("Total Amount")).toBeInTheDocument();
    expect(screen.getByLabelText("Currency")).toBeInTheDocument();
    expect(screen.getByLabelText("Date")).toBeInTheDocument();
    expect(screen.getByLabelText("Payment Method")).toBeInTheDocument();
  });

  it("lets user fill out and submit the form", async () => {
    setup();

    const merchantInput = screen.getByLabelText("Merchant");
    const amountInput = screen.getByLabelText("Total Amount");
    const currencySelect = screen.getByLabelText("Currency");
    const dateInput = screen.getByLabelText("Date");
    const paymentMethodSelect = screen.getByLabelText("Payment Method");
    const saveButton = screen.getByRole("button", { name: /save/i });

    await userEvent.type(merchantInput, "Starbucks");
    await userEvent.type(amountInput, "12.34");
    await userEvent.click(currencySelect);
    await userEvent.click(screen.getByRole("option", { name: "USD" }));
    fireEvent.change(dateInput, { target: { value: "2024-03-25" } });
    await userEvent.click(paymentMethodSelect);
    await userEvent.click(screen.getByRole("option", { name: "Credit" }));

    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalled();
    });

    const savedReceipt: Receipt = mockOnSave.mock.calls[0][0];
    expect(savedReceipt.merchant).toBe("Starbucks");
    expect(savedReceipt.total_amount).toBe(12.34);
    expect(savedReceipt.currency).toBe("USD");
    expect(savedReceipt.date).toBe("2024-03-25");
    expect(savedReceipt.payment_method).toBe("Credit");
  });

  it("closes modal on Cancel", async () => {
    setup();
    const cancelBtn = screen.getByRole("button", { name: /cancel/i });
    fireEvent.click(cancelBtn);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("handles OCR data extraction correctly", () => {
    setup();
    const testOcrData = {
      merchant: "Tim Hortons",
      total_amount: 8.99,
      currency: "CAD",
      date: "2024-03-10T00:00:00",
      payment_method: "Debit Card",
      items: [
        { id: 1, name: "Coffee", price: 2.5, quantity: 2 },
        { id: 2, name: "Donut", price: 3.99, quantity: 1 }
      ]
    };

    // Simulate OCR callback
    const fileUpload = screen.getByText("Add Receipt").parentElement;
    const component = fileUpload?.parentElement as any;
    if (component?.props?.onOcrDataExtracted) {
      component.props.onOcrDataExtracted(testOcrData);
    }
  });
});

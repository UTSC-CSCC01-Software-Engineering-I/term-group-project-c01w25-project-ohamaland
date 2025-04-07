import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AddReceipt from "@/components/receipts/AddReceipt";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

describe("AddReceipt component", () => {
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();

  const setup = () => {
    render(<AddReceipt open={true} onClose={mockOnClose} onSave={mockOnSave} />);
  };

  it("renders modal and form fields", () => {
    setup();
    expect(screen.getByRole('heading', { name: /add new receipt/i })).toBeInTheDocument();
    expect(screen.getAllByRole("textbox").length).toBeGreaterThan(0);
    expect(screen.getByText(/currency/i)).toBeInTheDocument();
    expect(screen.getByText(/payment method/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
  });

  it("allows user to input merchant name", async () => {
    setup();
    const textboxes = screen.getAllByRole("textbox");
    const merchantInput = textboxes[0]; // assumes merchant is first textbox
    await userEvent.type(merchantInput, "Starbucks");
    expect(merchantInput).toHaveValue("Starbucks");
  });

  it("calls onSave with receipt when Save button is clicked", async () => {
    setup();
    const textboxes = screen.getAllByRole("textbox");
    const merchantInput = textboxes[0]; // assumes merchant is first textbox
    await userEvent.type(merchantInput, "Test Merchant");

    const saveBtn = screen.getByRole("button", { name: /save/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalled();
    });
  });

  it("closes modal on Cancel (close icon)", () => {
    setup();
    const closeBtn = screen.getByTestId("CloseIcon").closest("button");
    fireEvent.click(closeBtn!);
    expect(mockOnClose).toHaveBeenCalled();
  });
});
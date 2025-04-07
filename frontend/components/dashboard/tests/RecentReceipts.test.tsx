import { render, screen } from "@testing-library/react";
import RecentReceipt from "@/components/dashboard/RecentReceipts";
import "@testing-library/jest-dom";

describe("RecentReceipt component", () => {
  const mockProps = {
    merchant: "Starbucks",
    date: "2025-04-06",
    amount: 12.34,
  };

  it("renders the merchant name", () => {
    render(<RecentReceipt {...mockProps} />);
    expect(screen.getByText("Starbucks")).toBeInTheDocument();
  });

  it("renders the receipt date", () => {
    render(<RecentReceipt {...mockProps} />);
    expect(screen.getByText("2025-04-06")).toBeInTheDocument();
  });

  it("renders the amount correctly with two decimal places", () => {
    render(<RecentReceipt {...mockProps} />);
    expect(screen.getByText("$12.34")).toBeInTheDocument();
  });

  it("applies the correct styles to the merchant text", () => {
    render(<RecentReceipt {...mockProps} />);
    const merchant = screen.getByText("Starbucks");
    expect(merchant).toHaveStyle("font-weight: 700");
    expect(merchant).toHaveStyle("font-size: 14px");
  });

  it("applies the correct styles to the date text", () => {
    render(<RecentReceipt {...mockProps} />);
    const date = screen.getByText("2025-04-06");
    expect(date).toHaveStyle("font-size: 12px");
  });

  it("applies the correct styles to the amount text", () => {
    render(<RecentReceipt {...mockProps} />);
    const amount = screen.getByText("$12.34");
    expect(amount).toHaveStyle("font-size: 16px");
    expect(amount).toHaveStyle("font-weight: 700");
    expect(amount).toHaveStyle("align-self: flex-end");
  });

  it("renders correctly with different amount values", () => {
    const newProps = { ...mockProps, amount: 99.99 };
    render(<RecentReceipt {...newProps} />);
    expect(screen.getByText("$99.99")).toBeInTheDocument();
  });
});
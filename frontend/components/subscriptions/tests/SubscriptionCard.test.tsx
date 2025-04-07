import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import SubscriptionCard from "@/components/subscriptions/SubscriptionCard";
import { Subscription } from "@/types/subscriptions";
import "@testing-library/jest-dom";

describe("SubscriptionCard component", () => {
  const mockSubscription: Subscription = {
    id: 101,
    user_id: 1,
    merchant: "Spotify",
    total_amount: 9.99,
    currency: "USD",
    billing_period: "Monthly",
    renewal_date: "2024-03-28T00:00:00Z"
  };

  const onClick = jest.fn();
  const onDeleteSubscription = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders subscription info correctly", () => {
    render(
      <SubscriptionCard
        subscription={mockSubscription}
        onClick={onClick}
        onDeleteSubscription={onDeleteSubscription}
      />
    );

    expect(screen.getByText("Spotify")).toBeInTheDocument();
    expect(screen.getByText(/2024-03-28/)).toBeInTheDocument();
    expect(screen.getByText(/Billing Period: Monthly/i)).toBeInTheDocument();
    expect(screen.getByText(/USD \$9.99/)).toBeInTheDocument();
  });

  it("calls onClick when the card is clicked", () => {
    render(
      <SubscriptionCard
        subscription={mockSubscription}
        onClick={onClick}
        onDeleteSubscription={onDeleteSubscription}
      />
    );

    const card = screen.getByText("Spotify").closest("div");
    fireEvent.click(card!);
    expect(onClick).toHaveBeenCalled();
  });

  it("calls onDeleteSubscription when the delete icon is clicked", () => {
    render(
      <SubscriptionCard
        subscription={mockSubscription}
        onClick={onClick}
        onDeleteSubscription={onDeleteSubscription}
      />
    );

    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[0]); // Only button is the delete one
    expect(onDeleteSubscription).toHaveBeenCalledWith(101);
  });
});
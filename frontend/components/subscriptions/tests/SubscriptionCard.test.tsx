import SubscriptionCard from "@/components/subscriptions/SubscriptionCard";
import { Subscription } from "@/types/subscriptions";
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";

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
    expect(screen.getByText("2024-03-28")).toBeInTheDocument();
    expect(screen.getByText("Billing Period: Monthly")).toBeInTheDocument();
    expect(screen.getByText("Total: USD 9.99")).toBeInTheDocument();
  });

  it("calls onClick when View Details button is clicked", () => {
    render(
      <SubscriptionCard
        subscription={mockSubscription}
        onClick={onClick}
        onDeleteSubscription={onDeleteSubscription}
      />
    );

    fireEvent.click(screen.getByText("View Details"));
    expect(onClick).toHaveBeenCalled();
  });

  it("calls onDeleteSubscription when Delete Subscription is clicked", () => {
    render(
      <SubscriptionCard
        subscription={mockSubscription}
        onClick={onClick}
        onDeleteSubscription={onDeleteSubscription}
      />
    );

    fireEvent.click(screen.getByText("Delete Subscription"));
    expect(onDeleteSubscription).toHaveBeenCalledWith(101);
  });
});

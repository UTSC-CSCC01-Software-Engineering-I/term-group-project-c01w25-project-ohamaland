import { Group } from "@/types/groups";
import { Category, Receipt } from "@/types/receipts";
import { TimePeriod, Subscription, BillingPeriod } from "@/types/subscriptions";
import { Dayjs } from "dayjs";

// filter groups by date and text input
export function filterGroups(
  groups: Group[],
  startDate: Dayjs | null,
  endDate: Dayjs | null,
  filterTerm: string
): Group[] {
  return groups.filter((group) => {
    // Convert group creation to Date object
    const createdDate = new Date(group.created_at);

    // Date range filtering
    if (startDate && createdDate < startDate.toDate()) {
      return false;
    }
    if (endDate && createdDate > endDate.toDate()) {
      return false;
    }

    // Text-based filtering on group name
    const nameMatchesFilter = group.name
      .toLowerCase()
      .includes(filterTerm.toLowerCase());

    if (filterTerm && !nameMatchesFilter) {
      return false;
    }

    return true;
  });
}

// filter receipts by date, category and text input
export function filterReceipts(
  receipts: Receipt[],
  startDate: Dayjs | null,
  endDate: Dayjs | null,
  filterTerm: string,
  category: Category
): Receipt[] {
  return receipts.filter((receipt) => {
    const receiptDate = new Date(receipt.date);

    // checking the date restrictions
    if (startDate && receiptDate < startDate.toDate()) {
      return false;
    }

    if (endDate && receiptDate > endDate.toDate()) {
      return false;
    }

    const lowercaseFilterTerm = filterTerm.toLowerCase();
    const merchantMatch = receipt.merchant
      .toLowerCase()
      .includes(lowercaseFilterTerm);
    const itemMatch = receipt.items.some((item) =>
      item.name.toLowerCase().includes(lowercaseFilterTerm)
    );

    if (filterTerm && !merchantMatch && !itemMatch) {
      return false;
    }

    if (
      category !== "All" &&
      !receipt.items.some((item) => item.category === category)
    ) {
      return false;
    }

    return true;
  });
}

// filter subscriptions by renewal time and text input
export function filterSubscriptions(
  subscriptions: Subscription[],
  filterTerm: string,
  renewalTimeOffset: number,
  billingPeriod: BillingPeriod
): Subscription[] {
  return subscriptions.filter((subscription) => {
    const subscriptionRenewalDate = new Date(subscription.renewal_date);
    const subscriptionBillingPeriod = subscription.billing_period;
    const now = new Date();

    if (billingPeriod !== "All" && subscriptionBillingPeriod !== billingPeriod) return false;
    if (renewalTimeOffset !== -1) {
      const renewalTime = new Date(now);
      renewalTime.setMonth(now.getMonth() + renewalTimeOffset);
      if (subscriptionRenewalDate < now || subscriptionRenewalDate > renewalTime) return false;
    }

    const lowercaseFilterTerm = filterTerm.toLowerCase();
    const merchantMatch = subscription.merchant
      .toLowerCase()
      .includes(lowercaseFilterTerm);

    if (filterTerm && !merchantMatch) {
      return false;
    }

    return true;
  });
}
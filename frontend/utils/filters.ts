import { Group } from "@/types/groups";
import { Category, Receipt } from "@/types/receipts";
import { BillingPeriod, Subscription } from "@/types/subscriptions";
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
    console.log("Group Created Date:", createdDate);

    // Date range filtering
    if (startDate) {
      console.log(
        "Start Date:",
        startDate.toDate(),
        "Created Date:",
        createdDate
      );
      if (createdDate < startDate.toDate()) {
        console.log("Group is before start date, skipping");
        return false;
      }
    }

    if (endDate) {
      console.log("End Date:", endDate.toDate(), "Created Date:", createdDate);
      if (createdDate > endDate.toDate()) {
        console.log("Group is after end date, skipping");
        return false;
      }
    }

    // Text-based filtering on group name
    const nameMatchesFilter = group.name
      .toLowerCase()
      .includes(filterTerm.toLowerCase());
    console.log(
      "Group Name:",
      group.name,
      "Matches Filter:",
      nameMatchesFilter
    );

    if (filterTerm && !nameMatchesFilter) {
      console.log("Group name does not match filter, skipping");
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
    const merchantMatch =
      receipt.merchant &&
      receipt.merchant.toLowerCase().includes(lowercaseFilterTerm);
    const itemMatch =
      Array.isArray(receipt.items) &&
      receipt.items.some((item) =>
        item.name.toLowerCase().includes(lowercaseFilterTerm)
      );

    if (filterTerm && !merchantMatch && !itemMatch) {
      return false;
    }

    if (
      category !== "All"
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

    if (billingPeriod !== "All" && subscriptionBillingPeriod !== billingPeriod)
      return false;
    if (renewalTimeOffset !== -1) {
      const renewalTime = new Date(now);
      renewalTime.setMonth(now.getMonth() + renewalTimeOffset);
      if (
        subscriptionRenewalDate < now ||
        subscriptionRenewalDate > renewalTime
      )
        return false;
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

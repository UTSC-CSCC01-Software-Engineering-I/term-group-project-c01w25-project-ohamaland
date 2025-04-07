import { GroupMember } from "./groupMembers";
import { Receipt } from "./receipts";
import { Subscription } from "./subscriptions";

export type LogData = Subscription | GroupMember | Receipt;

export interface LogItemProps<T extends LogData> {
  data: T;
}

export function isSubscription(data: LogData): data is Subscription {
  return (data as Subscription).renewal_date !== undefined;
}

export function isGroupMember(data: LogData): data is GroupMember {
  return (data as GroupMember).joined_at !== undefined;
}

export function isReceipt(data: LogData): data is Receipt {
  return (data as Receipt).total_amount !== undefined;
}

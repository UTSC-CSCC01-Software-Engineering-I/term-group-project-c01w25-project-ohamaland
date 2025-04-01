import { Receipt } from "@/types/receipts";
import { GroupMember } from "@/types/groupMembers";

export type Group = {
  id: number;
  creator: number;
  name: string;
  created_at: string;
  members: GroupMember[];
  receipts: Receipt[];
};

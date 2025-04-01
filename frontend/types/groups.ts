import { GroupMember } from "@/types/groupMembers";
import { Receipt } from "@/types/receipts";

export type Group = {
  id: number;
  creator: number;
  name: string;
  created_at: string;
  members: GroupMember[];
  receipts: Receipt[];
};

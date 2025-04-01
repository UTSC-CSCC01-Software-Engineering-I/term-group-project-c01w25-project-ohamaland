import { Receipt } from "@/types/receipts";
import { GroupMember } from "./groupMembers";

export type Group = {
  id: number;
  creator: number; // corresponds to creator = models.IntegerField()
  name: string; // corresponds to name = models.TextField()
  created_at: string; // ISO date string (models.DateTimeField)
  members?: GroupMember[]; // synced type with backend, now referencing GroupMembers.ts
  receipts?: Receipt[];
};

export interface GroupLogEntry {
  user: string;
  action: string;
  date: string; // format "YYYY-MM-DD"
  type?: "join" | "add" | "delete" | "tag"| "update" | "leave";
}

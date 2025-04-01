import { User } from "@/types/user";

export type GroupMember = {
  id: number;
  user: User;
  joined_at: string;
};

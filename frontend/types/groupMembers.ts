export type GroupMember = {
  id: number;
  group: number; // This references the Group's ID (ForeignKey in Django)
  user_id: number; // corresponds to user_id = models.IntegerField()
  joined_at: string; // ISO date string (models.DateTimeField)
};

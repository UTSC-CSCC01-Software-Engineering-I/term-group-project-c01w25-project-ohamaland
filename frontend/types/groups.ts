export type Group = {
    id: number;
    creator: number;            // corresponds to creator = models.IntegerField()
    name: string;               // corresponds to name = models.TextField()
    created_at: string;         // ISO date string (models.DateTimeField)
  };
  
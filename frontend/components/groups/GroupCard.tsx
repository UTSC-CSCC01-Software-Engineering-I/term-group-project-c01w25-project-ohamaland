import Link from "next/link";
import { Card, CardContent, Typography, Button } from "@mui/material";
import { Group } from "@/types/groups";

interface IGroupCardProps {
  group: Group;
}

export default function GroupCard({ group }: IGroupCardProps) {
  return (
    <Card sx={{ maxWidth: 400, margin: "1rem auto" }}>
      <CardContent>
        <Typography variant="h6">{group.name}</Typography>
        <Typography variant="body2" color="text.secondary">
          Creator: {group.creator}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Created At: {group.created_at}
        </Typography>

        {/* Link to detail page (app/groups/[id]/page.tsx) */}
        <Link href={`/groups/${group.id}`}>
          <Button variant="outlined" sx={{ mt: 1 }}>
            View Details
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
import React from "react";
import { Card, CardContent, Typography } from "@mui/material";
import { Group } from "@/types/groups";

interface IGroupCardProps {
  group: Group;
}

const GroupCard: React.FC<IGroupCardProps> = ({ group }) => {
  return (
    <Card sx={{ maxWidth: 400, margin: "1rem auto" }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {group.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Creator: {group.creator}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Created At: {group.created_at}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default GroupCard;
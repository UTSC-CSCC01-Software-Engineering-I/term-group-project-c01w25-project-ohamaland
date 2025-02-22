import Link from "next/link";
import { Card, CardContent, Typography, Button } from "@mui/material";
import { Group } from "@/types/groups";
import { textGrey } from "@/styles/colors";

interface IGroupCardProps {
  group: Group;
}

export default function GroupCard(props: IGroupCardProps) {
  return (
    <Card sx={cardStyle}>
      <CardContent>
        <Typography sx={groupnameTextStyle}>{props.group.name}</Typography>
        <Typography sx={textStyle}>
          Creator: {props.group.creator}
        </Typography>
        <Typography sx={textStyle}>
          Created At: {props.group.created_at}
        </Typography>
        {/* Link to detail page (app/groups/[id]/page.tsx) */}
        <Link href={`/groups/${props.group.id}`}>
          <Button variant="outlined" sx={buttonStyle}>
            View Details
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

const cardStyle = {
  maxWidth: 400,
  margin: "8px"
}

const groupnameTextStyle = {
  color: "black",
  fontWeight: 500,
  fontSize: "18px"
}

const textStyle = {
  color: textGrey,
  fontSize: "14px"
}

const buttonStyle = {
  marginTop: "8px"
}
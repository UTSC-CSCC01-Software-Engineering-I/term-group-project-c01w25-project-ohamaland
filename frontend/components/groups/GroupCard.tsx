import { textGrey } from "@/styles/colors";
import { Group } from "@/types/groups";
import { Button, Card, CardContent, Typography } from "@mui/material";
import Link from "next/link";

interface IGroupCardProps {
  group: Group;
}

export default function GroupCard(props: IGroupCardProps) {
  return (
    <Card sx={cardStyle}>
      <CardContent>
        <Typography sx={groupnameTextStyle}>{props.group.name}</Typography>
        <Typography sx={textStyle}>Creator: {props.group.creator}</Typography>
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
  width: "100%",
  margin: "8px",
  maxWidth: "100%", // Prevent overflow
  boxSizing: "border-box" // Ensures padding/margins don’t cause width issues
};

const groupnameTextStyle = {
  color: "black",
  fontWeight: 500,
  fontSize: "18px"
};

const textStyle = {
  color: textGrey,
  fontSize: "14px"
};

const buttonStyle = {
  marginTop: "8px"
};

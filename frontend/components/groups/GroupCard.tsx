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
  maxWidth: "400px",
  margin: "8px"
};

const groupnameTextStyle = {
  color: "black",
  fontWeight: 500,
  fontSize: "16px"
};

const textStyle = {
  color: textGrey,
  fontSize: "16px"
};

const buttonStyle = {
  marginTop: "8px"
};

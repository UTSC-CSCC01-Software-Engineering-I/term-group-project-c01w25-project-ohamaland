import { defaultText, textLightGrey } from "@/styles/colors";
import { GroupMember } from "@/types/groupMembers";
import { Typography } from "@mui/material";

interface IGroupLogItemProps {
  data: GroupMember;
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

export default function GroupLogItem(props: IGroupLogItemProps) {
  return (
    <Typography sx={{ ...lightTextStyle, "&:hover": darkTextStyle }}>
      {props.data.user.username} - {"Joined the Group at"}{" "}
      {formatDate(props.data.joined_at)}
    </Typography>
  );
}

const lightTextStyle = {
  fontSize: "14px",
  color: textLightGrey,
  fontWeight: 500
};

const darkTextStyle = {
  fontSize: "14px",
  color: defaultText,
  fontWeight: 700
};

import { defaultText, textLightGrey } from "@/styles/colors";
import { GroupMember } from "@/types/groupMembers";
import { Receipt } from "@/types/receipts";
import { Typography } from "@mui/material";

interface IGroupLogItemProps {
    data: GroupMember;
}

export default function GroupLogItem(props: IGroupLogItemProps) {
  return (
    <Typography sx={{ ...lightTextStyle, "&:hover": darkTextStyle }}>
      {props.data.user.username} - {"Joined the Group at"} {props.data.joined_at}
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

import { GroupLogEntry } from "@/types/groups";
import { Box, Typography } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import { textLightGrey, defaultText } from "@/styles/colors";

interface Props {
  data: GroupLogEntry;
}

const typeColors = {
  join: "#5CF283",
  add: "#FFB84D",
  delete: "#B36D6D",
  tag: "#FFD166"
};

export default function GroupLogItem({ data }: Props) {
  const { user, action, date, type } = data;
  const borderColor = typeColors[type ?? "add"];

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Box
        sx={{
          height: "100%",
          width: "3px",
          backgroundColor: borderColor,
          borderRadius: "2px"
        }}
      />
      <PersonIcon sx={{ fontSize: 18 }} />
      <Box>
        <Typography sx={{ ...lightTextStyle, fontWeight: 700 }}>{user}</Typography>
        <Typography sx={lightTextStyle}>{action}</Typography>
      </Box>
      <Typography sx={{ ...lightTextStyle, marginLeft: "auto" }}>
        {formatDate(date)}
      </Typography>
    </Box>
  );
}

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year.slice(2)}`;
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
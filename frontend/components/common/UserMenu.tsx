import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import MailIcon from "@mui/icons-material/Mail";
import { Box } from "@mui/material";

export default function UserMenu() {
  return (
    <Box sx={userMenuStyle}>
      {/* TODO: These will become components with click functionality */}
      <MailIcon sx={iconStyle} />
      <AccountCircleIcon sx={iconStyle} />
    </Box>
  );
}

const userMenuStyle = {
  display: "flex",
  alignItems: "center",
  gap: "24px"
};

const iconStyle = {
  fontSize: 32
};

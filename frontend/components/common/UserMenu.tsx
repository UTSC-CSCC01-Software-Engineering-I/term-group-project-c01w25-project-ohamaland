import { Box } from "@mui/material";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MailIcon from '@mui/icons-material/Mail';

export default function UserMenu() {
    return (
        <Box sx={userMenuStyle}>
            {/* TODO: These will become components with click functionality */}
            <AccountCircleIcon />
            <MailIcon />
        </Box>
    )
}

const userMenuStyle = {
    display: "flex",
    alignItems: "center"
}
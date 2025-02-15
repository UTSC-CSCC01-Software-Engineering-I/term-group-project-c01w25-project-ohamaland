import { lightGrey } from "@/styles/colors"
import { Box, Link, Typography } from "@mui/material"
import UserMenu from "../UserMenu"

export default function Header() {
    return (
        <Box sx={headerStyle}>
            <Box sx={logoContainerStyle}>
                <Link href="/">
                    {/* TODO: Put image of logo here */ }
                </Link>
                <Typography sx={titleTextStyle}>
                    Cat&Log
                </Typography>
            </Box>
            <UserMenu />
        </Box>
    )
}

const headerStyle = {
    paddingeft: "24px",
    paddingRight: "24px",
    backgroundColor: `${lightGrey}`,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    height: "64px"
}

const logoContainerStyle = {
    display: "flex",
    alignItems: "center",
    gap: "24px"
}

const titleTextStyle = {
    color: "white",
    fontWeight: "600",
    fontSize: "30px"
}
import { Drawer, getSectionContainerStyle, iconContainerStyle, menuButtonStyle, menuIconStyle, sectionTextStyle, sideBarContainerStyle } from "@/styles/sideBarStyles";
import { BrokenImage, SvgIconComponent } from "@mui/icons-material";
import { Box, Button, CssBaseline, Typography } from "@mui/material";
import Link from "next/link";
import { useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";

interface ISideBarProps {
    page: string;
    loggedIn: boolean;
}

const loggedInSections = [
    "Sign Out"
]

const loggedOutSections = [
    "Sign In"
]

const routeMap: { [key: string]: string } = {

}

const iconMap: { [key: string]: SvgIconComponent } = {

}

function getIcon(section: string, active: boolean) {
    const iconStyling = {
        color: active ? "white": "white", // TODO: decide colors later
        fontSize: 32
    }

    const IconComponent = iconMap[section] || <BrokenImage />

    return (
        <IconComponent sx={iconStyling} />
    )
}

export default function SideBar(props: ISideBarProps) {
    const [open, setOpen] = useState(false);
    const sections = props.loggedIn ? loggedInSections : loggedOutSections

    const handleDrawerOpen = () => {
        setOpen(true);
    }

    const handleDrawerClose = () => {
        setOpen(false);
    }

    function getBackgroundColor(iconPage: string) {
        return props.page === iconPage ? "white": "white"
    }

    return (
        <Box sx={sideBarContainerStyle}>
            <CssBaseline />
            <Drawer variant="permanent" open={open}>
                {sections.map((section, index) => (
                    <Link href={`/${routeMap[section]}`} key={index} passHref style={{ textDecoration: "none" }}>
                        <Box key={index} sx={getSectionContainerStyle(getBackgroundColor(section))}>
                            <Box style={iconContainerStyle}>
                                {getIcon(section, section == props.page)}
                            </Box>
                            <Typography sx={{ ...sectionTextStyle }}>{open ? section : ""}</Typography>
                        </Box>
                    </Link>
                ))}
                <Button
                    aria-label="open drawer"
                    variant="text"
                    onClick={open ? handleDrawerClose : handleDrawerOpen}
                    sx={menuButtonStyle}
                >
                    <MenuIcon sx={menuIconStyle} />
                </Button>
            </Drawer>
        </Box>
    )
}


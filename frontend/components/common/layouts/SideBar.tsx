import { darkGrey, lightGrey } from "@/styles/colors";
import {
  contentContainerStyle,
  Drawer,
  getSectionContainerStyle,
  iconContainerStyle,
  menuButtonStyle,
  menuIconStyle,
  sectionTextStyle,
  sideBarContainerStyle
} from "@/styles/sideBarStyles";
import {
  BrokenImage,
  Group,
  Insights,
  Receipt,
  Settings,
  Subscriptions,
  SvgIconComponent
} from "@mui/icons-material";
import MenuIcon from "@mui/icons-material/Menu";
import { Box, Button, CssBaseline, Typography } from "@mui/material";
import Link from "next/link";
import { ReactNode, useState } from "react";

interface ISideBarProps {
  page: string;
  loggedIn: boolean;
  children?: ReactNode;
}

const loggedInSections = [
  "Groups",
  "Receipts",
  "Subscriptions",
  "Insights",
  "Settings"
];

const loggedOutSections = ["Sign In"];

// routing that the sidebar options will lead to
const routeMap: { [key: string]: string } = {
  Groups: "groups",
  Receipts: "receipts",
  Subscriptions: "subscriptions",
  Insights: "insights",
  Settings: "settings"
};

const iconMap: { [key: string]: SvgIconComponent } = {
  Groups: Group,
  Receipts: Receipt,
  Subscriptions: Subscriptions,
  Insights: Insights,
  Settings: Settings
};

function getIcon(section: string, active: boolean) {
  const iconStyling = {
    color: active ? "white" : "white", // TODO: decide colors later
    fontSize: 32
  };

  const IconComponent = iconMap[section] || <BrokenImage />;

  return <IconComponent sx={iconStyling} />;
}

export default function SideBar(props: ISideBarProps) {
  const [open, setOpen] = useState(false);
  const sections = props.loggedIn ? loggedInSections : loggedOutSections;

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  function getBackgroundColor(iconPage: string) {
    return props.page === iconPage ? lightGrey : darkGrey;
  }

  return (
    <Box sx={sideBarContainerStyle}>
      <CssBaseline />
      <Drawer variant="permanent" open={open}>
        {sections.map((section, index) => (
          <Link
            href={`/${routeMap[section]}`}
            key={index}
            passHref
            style={{ textDecoration: "none" }}
          >
            <Box
              key={index}
              sx={getSectionContainerStyle(getBackgroundColor(section))}
            >
              <Box style={iconContainerStyle}>
                {getIcon(section, section == props.page)}
              </Box>
              <Typography sx={{ ...sectionTextStyle }}>
                {open ? section : ""}
              </Typography>
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
      <Box sx={contentContainerStyle}>{props.children}</Box>
    </Box>
  );
}

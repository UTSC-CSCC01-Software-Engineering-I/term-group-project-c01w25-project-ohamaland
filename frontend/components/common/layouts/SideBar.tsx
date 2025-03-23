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
  SvgIconComponent,
  Logout
} from "@mui/icons-material";
import MenuIcon from "@mui/icons-material/Menu";
import { Box, Button, CssBaseline, Typography } from "@mui/material";
import Link from "next/link";
import { ReactNode, useState } from "react";
import { getAccessToken, removeAccessToken } from "@/utils/auth";
import { useRouter } from "next/navigation";

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
  "Settings",
  "Logout"
];

const loggedOutSections = ["Sign In"];

// routing that the sidebar options will lead to
const routeMap: { [key: string]: string } = {
  Groups: "groups",
  Receipts: "receipts",
  Subscriptions: "subscriptions",
  Insights: "insights",
  Settings: "settings",
  Logout: "logout"
};

const iconMap: { [key: string]: SvgIconComponent } = {
  Groups: Group,
  Receipts: Receipt,
  Subscriptions: Subscriptions,
  Insights: Insights,
  Settings: Settings,
  Logout: Logout
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
  const router = useRouter();

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleLogout = async () => {
    try {
      const token = getAccessToken();
      const response = await fetch("http://127.0.0.1:8000/api/user/logout/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          refresh: localStorage.getItem("refreshToken")
        }),
      });

      if (response.ok) {
        removeAccessToken();
        localStorage.removeItem("refreshToken");
        router.push("/login");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  function getBackgroundColor(iconPage: string) {
    return props.page === iconPage ? lightGrey : darkGrey;
  }

  return (
    <Box sx={sideBarContainerStyle}>
      <CssBaseline />
      <Drawer variant="permanent" open={open}>
        {sections.map((section, index) => (
          <Box key={index}>
            {section === "Logout" ? (
              <Box
                onClick={handleLogout}
                sx={getSectionContainerStyle(getBackgroundColor(section))}
                style={{ cursor: "pointer" }}
              >
                <Box style={iconContainerStyle}>
                  {getIcon(section, section === props.page)}
                </Box>
                <Typography sx={{ ...sectionTextStyle }}>
                  {open ? section : ""}
                </Typography>
              </Box>
            ) : (
              <Link
                href={`/${routeMap[section]}`}
                passHref
                style={{ textDecoration: "none" }}
              >
                <Box
                  sx={getSectionContainerStyle(getBackgroundColor(section))}
                >
                  <Box style={iconContainerStyle}>
                    {getIcon(section, section === props.page)}
                  </Box>
                  <Typography sx={{ ...sectionTextStyle }}>
                    {open ? section : ""}
                  </Typography>
                </Box>
              </Link>
            )}
          </Box>
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

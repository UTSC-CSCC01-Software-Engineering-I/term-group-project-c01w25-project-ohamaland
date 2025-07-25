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
import { fetchWithAuth, userLogoutApi } from "@/utils/api";
import { getRefreshToken, logout } from "@/utils/auth";
import {
  BrokenImage,
  CurrencyExchange,
  Groups3,
  Insights,
  Logout,
  ReceiptLong,
  Settings,
  SvgIconComponent
} from "@mui/icons-material";
import HomeIcon from "@mui/icons-material/Home";
import MenuIcon from "@mui/icons-material/Menu";
import { Box, Button, CssBaseline, Typography } from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useState } from "react";

interface ISideBarProps {
  loggedIn: boolean;
  children?: ReactNode;
}

const loggedInSections = [
  "Dashboard",
  "Groups",
  "Receipts",
  "Subscriptions",
  "Insights",
  "Logout"
];

const loggedOutSections = ["Sign In"];

// routing that the sidebar options will lead to
const routeMap: { [key: string]: string } = {
  Dashboard: "dashboard",
  Groups: "groups",
  Receipts: "receipts",
  Subscriptions: "subscriptions",
  Insights: "insights",
  Settings: "settings",
  Logout: "logout"
};

const iconMap: { [key: string]: SvgIconComponent } = {
  Dashboard: HomeIcon,
  Groups: Groups3,
  Receipts: ReceiptLong,
  Subscriptions: CurrencyExchange,
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
  const pathname = usePathname();

  // Get the first segment of the path (e.g., 'receipts' from '/receipts/123')
  const currentSection = pathname?.split("/")[1] || "";

  // Convert the current section to the sidebar section name
  const activeSection =
    Object.entries(routeMap).find(
      ([, route]) => route === currentSection
    )?.[0] || "";

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleLogout = async () => {
    try {
      const refreshToken = getRefreshToken();

      const response = await fetchWithAuth(userLogoutApi, {
        method: "POST",
        body: JSON.stringify({
          refresh: refreshToken
        })
      });

      if (response && response.ok) {
        logout(); // This will remove both tokens and redirect to login
      } else {
        // Even if the server request fails, we should still clear local tokens
        logout();
      }
    } catch (error) {
      // Even if there's an error, we should still clear local tokens
      logout();
    }
  };

  function getBackgroundColor(iconPage: string) {
    return iconPage === activeSection ? lightGrey : darkGrey;
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
                  {getIcon(section, section === activeSection)}
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
                <Box sx={getSectionContainerStyle(getBackgroundColor(section))}>
                  <Box style={iconContainerStyle}>
                    {getIcon(section, section === activeSection)}
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

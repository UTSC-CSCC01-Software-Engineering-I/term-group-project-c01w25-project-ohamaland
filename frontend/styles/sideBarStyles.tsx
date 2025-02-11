import MuiDrawer from "@mui/material/Drawer";
import { styled, Theme, CSSObject } from "@mui/material/styles";
import { hoverColor, defaultText } from "../styles/colors"

// SideBar component has a lot of styling so put into separate file else file too long

export const sideBarContainerStyle = {
    display: "flex",
}

export const drawerWidth = 312;

export const minimizedDrawerWidth = 64;

export const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen
  }),
  overflowX: "hidden"
});

export const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen
  }),
  overflowX: "hidden",
  width: minimizedDrawerWidth,
  [theme.breakpoints.up("sm")]: {
    width: minimizedDrawerWidth
  }
});

export const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== "open" })(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  position: "absolute",
  zIndex: 1000, // arbitrary z-index to ensure sidebar overlays all content

  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme)
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme)
  })
}));

export function getSectionContainerStyle(background: string) {
  return {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: background,
    height: "64px",
    marginTop: "8px",
    cursor: "pointer",
    "&:hover": {
      bgcolor: hoverColor
    }
  };
}

export const sectionTextStyle = {
  color: defaultText,
  fontSize: "16px",
  fontWeight: 400
}

export const iconContainerStyle = {
  padding: "16px",
  height: "64px",
  width: "64px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center"
}

export const menuButtonStyle = {
  justifyContent: "flex-start",
  "&:hover": {
    bgcolor: hoverColor
  },
  height: "64px",
  paddingLeft: "16px",
  alignItems: "center"
}

export const menuIconStyle = {
  color: defaultText,
  fontSize: 32
}

export const logoContainerStyle = {
  display: "inline",
  flexDirection: "column",
  justifyContent: "flex-end",
  padding: "8px",
  height: "64px",
  "&:hover": {
    bgcolor: hoverColor
  },
  cursor: "pointer"
}

export const contentContainerStyle = {
  marginLeft: `${minimizedDrawerWidth}px`
}
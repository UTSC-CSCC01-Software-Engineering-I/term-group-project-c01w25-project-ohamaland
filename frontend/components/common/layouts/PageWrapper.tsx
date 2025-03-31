import { Box, Stack } from "@mui/material";
import Header from "./Header";
import SideBar from "./SideBar";

interface IPageWrapperProps {
  children: React.ReactNode; // Content will go inside the wrapper
}

export default function PageWrapper(props: IPageWrapperProps) {
  return (
    <Stack sx={pageContainerStyle}>
     <Header/>
      <Box sx={mainContentStyle}>
        <SideBar loggedIn={true}/>
        <Box sx={contentAreaStyle}>{props.children}</Box>
      </Box>
    </Stack>
  );
}

const pageContainerStyle = {
  height: "100vh",
  backgroundColor: "white"
};

const mainContentStyle = {
  display: "flex",
  overflow: "hidden",
  flexGrow: 1,
  backgroundColor: "white"
};

const contentAreaStyle = {
  padding: "24px",
  width: "100%",
  overflow: "auto"
};

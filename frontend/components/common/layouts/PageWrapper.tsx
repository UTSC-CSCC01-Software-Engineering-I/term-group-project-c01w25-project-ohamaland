import { backgroundWhite } from "@/styles/colors";
import { Box, Stack } from "@mui/material";
import Header from "./Header";
import SideBar from "./SideBar";

interface IPageWrapperProps {
  children: React.ReactNode; // Content will go inside the wrapper
}

export default function PageWrapper(props: IPageWrapperProps) {
  return (
    <Stack sx={pageContainerStyle}>
      <Header />
      <Box sx={mainContentStyle}>
        <SideBar page="Receipts" loggedIn={true}>
          <Box sx={contentAreaStyle}>{props.children}</Box>
        </SideBar>
      </Box>
    </Stack>
  );
}

const pageContainerStyle = {
  height: "100vh",
  backgroundColor: backgroundWhite
};

const mainContentStyle = {
  display: "flex",
  overflow: "hidden",
  flexGrow: 1,
  backgroundColor: backgroundWhite
};

const contentAreaStyle = {
  padding: "24px",
  width: "100%",
  overflow: "auto"
};

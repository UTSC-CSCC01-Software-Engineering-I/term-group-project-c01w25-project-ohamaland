import { lightGrey } from "@/styles/colors";
import { Box, Link, Typography } from "@mui/material";
import Image from "next/image";
import UserMenu from "../UserMenu";

export default function Header() {
  return (
    <Box sx={headerStyle}>
      <Box sx={logoContainerStyle}>
        <Box sx={logoWrapperStyle}>
          <Link href="/">
            <Image src="/catalog.png" width={36} height={36} alt={""} />
          </Link>
        </Box>
        <Typography sx={titleTextStyle}>Cat&Log</Typography>
      </Box>
      <UserMenu />
    </Box>
  );
}

const headerStyle = {
  paddingLeft: "16px",
  paddingRight: "24px",
  backgroundColor: `${lightGrey}`,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  height: "64px"
};

const logoContainerStyle = {
  display: "flex",
  alignItems: "center",
  gap: "24px"
};

const titleTextStyle = {
  color: "white",
  fontWeight: "600",
  fontSize: "30px"
};
const logoWrapperStyle = {
  width: "40px",
  height: "40px",
  backgroundColor: "white",
  borderRadius: "50%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center"
};

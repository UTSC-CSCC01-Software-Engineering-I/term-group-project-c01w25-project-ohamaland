import { lightGrey } from "@/styles/colors";
import { Alert, Box, Typography } from "@mui/material";

interface IErrorPageProps {
  errorMessage: string;
}

export default function ErrorPage(props: IErrorPageProps) {
  return (
    <Box sx={containerStyle}>
      <Box sx={errorStyle}>
        <Typography fontSize={18} fontWeight={600} mb={2}>
          Error
        </Typography>
        <Alert severity="error">{props.errorMessage}</Alert>
      </Box>
    </Box>
  );
}

const containerStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
  width: "100vw",
  backgroundColor: "white"
};

const errorStyle = {
  backgroundColor: "white",
  p: 3,
  borderRadius: 2,
  border: `1px solid ${lightGrey}`,
  boxShadow: "0px 2px 6px 0px rgba(143, 143, 156, 0.15)",
  maxHeight: "100%",
  margin: 3
};

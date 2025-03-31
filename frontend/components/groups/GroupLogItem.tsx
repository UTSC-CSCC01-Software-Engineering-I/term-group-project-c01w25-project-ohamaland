import { Receipt } from "@/types/receipts";
import { Typography } from "@mui/material";
import { defaultText, textLightGrey } from "@/styles/colors";

interface IReceiptLogItemProps {
  data: Receipt;
}

export default function ReceiptLogItem(props: IReceiptLogItemProps) {
  const { merchant, date } = props.data;
  const formattedDate = date.split("T")[0];

  return (
    <Typography sx={{ ...lightTextStyle, "&:hover": darkTextStyle }}>
      {merchant} - {formattedDate}
    </Typography>
  );
}

const lightTextStyle = {
  fontSize: "14px",
  color: textLightGrey,
  fontWeight: 500
};

const darkTextStyle = {
  fontSize: "14px",
  color: defaultText,
  fontWeight: 700
};
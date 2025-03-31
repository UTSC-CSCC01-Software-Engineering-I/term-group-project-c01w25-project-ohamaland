import { defaultText, textLightGrey } from "@/styles/colors";
import {
  BillingPeriod,
  TimePeriod,
  billingPeriods,
  timePeriods
} from "@/types/subscriptions";
import SearchIcon from "@mui/icons-material/Search";
import { Box, InputBase, SelectChangeEvent } from "@mui/material";
import { Dispatch, SetStateAction } from "react";
import DropDownSelector from "../common/DropDownSelector";

interface ISubscriptionFilterProps {
  filterTerm: string;
  renewalTime: TimePeriod;
  billingPeriod: BillingPeriod;
  setFilterTerm: Dispatch<SetStateAction<string>>;
  handleTimePeriodChange: (event: SelectChangeEvent) => void;
  handleBillingPeriodChange: (event: SelectChangeEvent) => void;
}

export default function ReceiptFilter(props: ISubscriptionFilterProps) {
  return (
    <Box sx={filterContainerStyle}>
      {/* Searchbar */}
      <InputBase
        placeholder="Search subscriptions..."
        startAdornment={<SearchIcon fontSize="medium" sx={iconStyle} />}
        sx={inputStyle}
        onChange={(e) => props.setFilterTerm(e.target.value)}
        value={props.filterTerm}
      />

      {/* Renewal Time Filter*/}
      <DropDownSelector
        value={props.renewalTime}
        inputId="timeperiod-select-label"
        label="Renewal Within"
        onChange={props.handleTimePeriodChange}
        options={timePeriods}
        formControlStyle={formControlStyle}
      />

      {/* Billing Period Filter*/}
      <DropDownSelector
        value={props.billingPeriod}
        inputId="billingperiod-select-label"
        label="Billing Period"
        onChange={props.handleBillingPeriodChange}
        options={billingPeriods}
        formControlStyle={formControlStyle}
      />
    </Box>
  );
}

const filterContainerStyle = {
  display: "flex",
  alignItems: "center",
  gap: "16px",
  padding: "16px",
  borderRadius: "12px",
  backgroundColor: "white",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
  flexWrap: "wrap" as const
};

const iconStyle = {
  color: textLightGrey
};

const inputStyle = {
  fontSize: "14px",
  fontWeight: 400,
  flexGrow: 1,
  color: defaultText,
  "& ::placeholder": {
    color: textLightGrey,
    fontSize: "14px",
    fontWeight: 400
  }
};

const formControlStyle = {
  width: "160px",
  backgroundColor: "white",
  borderRadius: "8px",
  boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
  "& .MuiOutlinedInput-root": {
    color: defaultText,
    "& fieldset": {
      border: "none"
    },
    "&:hover fieldset": {
      border: "none"
    },
    "&.Mui-focused fieldset": {
      border: `2px solid ${defaultText}`
    }
  }
};

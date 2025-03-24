import { defaultText, textLightGrey } from "@/styles/colors";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Dayjs } from "dayjs";

interface ISpendingFilterProps {
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  filterTerm: string;
  selectedPeriod: string;
  setFilterTerm: (value: string) => void;
  setStartDate: (value: Dayjs | null) => void;
  setEndDate: (value: Dayjs | null) => void;
  handlePeriodChange: (event: SelectChangeEvent) => void;
}

export default function SpendingFilter(props: ISpendingFilterProps) {
  return (
    <Box sx={filterContainerStyle}>
      {/* Start date filter */}
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          value={props.startDate}
          onChange={(newDate) => props.setStartDate(newDate)}
          slotProps={{
            textField: {
              placeholder: "Choose a Start Date"
            }
          }}
        />
      </LocalizationProvider>

      {/* End date filter */}
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          value={props.endDate}
          onChange={(newDate) => props.setEndDate(newDate)}
          slotProps={{
            textField: {
              placeholder: "Choose an End Date"
            }
          }}
        />
      </LocalizationProvider>

      {/* Period Selector */}
      <FormControl sx={formControlStyle}>
        <InputLabel id="period-label">Period</InputLabel>
        <Select
          labelId="period-label"
          value={props.selectedPeriod}
          onChange={props.handlePeriodChange}
          label="Period"
        >
          <MenuItem value="Weekly">Weekly</MenuItem>
          <MenuItem value="Monthly">Monthly</MenuItem>
          <MenuItem value="Quarterly">Quarterly</MenuItem>
          <MenuItem value="Yearly">Yearly</MenuItem>
        </Select>
      </FormControl>
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

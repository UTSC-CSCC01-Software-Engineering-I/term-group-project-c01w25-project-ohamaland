import { defaultText } from "@/styles/colors";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent
} from "@mui/material";
import { Dayjs } from "dayjs";

interface ISpendingFilterProps {
  filterTerm: string;
  selectedPeriod: string;
  setEndDate: (value: Dayjs | null) => void;
  handlePeriodChange: (event: SelectChangeEvent) => void;
}

export default function SpendingFilter(props: ISpendingFilterProps) {
  return (
    <Box sx={filterContainerStyle}>
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
  boxShadow: "0 8px 8px rgba(0, 0, 0, 0.2)",
  flexWrap: "wrap" as const
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

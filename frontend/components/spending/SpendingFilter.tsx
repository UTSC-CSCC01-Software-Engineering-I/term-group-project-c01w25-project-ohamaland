import { Select, MenuItem, TextField, SelectChangeEvent } from "@mui/material";
import { Dayjs } from "dayjs";

interface ISpendingFilterProps {
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  filterTerm: string;
  category: string;
  setFilterTerm: (value: string) => void;
  setStartDate: (value: Dayjs | null) => void;
  setEndDate: (value: Dayjs | null) => void;
  handleCategoryChange: (event: SelectChangeEvent) => void;
}

export default function SpendingFilter(props: ISpendingFilterProps) {
  return (
    <div style={filterContainerStyle}>
      <TextField
        label="Search"
        variant="outlined"
        value={props.filterTerm}
        onChange={(e) => props.setFilterTerm(e.target.value)}
      />
      <TextField
        label="Start Date"
        type="date"
        InputLabelProps={{ shrink: true }}
        onChange={(e) => props.setStartDate(e.target.value as unknown as Dayjs)}
      />
      <TextField
        label="End Date"
        type="date"
        InputLabelProps={{ shrink: true }}
        onChange={(e) => props.setEndDate(e.target.value as unknown as Dayjs)}
      />
      <Select value={props.category} onChange={props.handleCategoryChange}>
        <MenuItem value="All">All</MenuItem>
        <MenuItem value="Food">Food</MenuItem>
        <MenuItem value="Transport">Transport</MenuItem>
        <MenuItem value="Entertainment">Entertainment</MenuItem>
        <MenuItem value="Others">Others</MenuItem>
      </Select>
    </div>
  );
}

const filterContainerStyle = {
  display: "flex",
  gap: "12px",
};

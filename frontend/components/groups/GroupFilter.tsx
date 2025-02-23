"use client";

import { backgroundWhite, defaultText, textLightGrey } from "@/styles/colors";
import SearchIcon from "@mui/icons-material/Search";
import { Box, InputBase } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Dayjs } from "dayjs";
import { Dispatch, SetStateAction } from "react";

interface IGroupFilterProps {
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  filterTerm: string;
  setFilterTerm: Dispatch<SetStateAction<string>>;
  setStartDate: Dispatch<SetStateAction<Dayjs | null>>;
  setEndDate: Dispatch<SetStateAction<Dayjs | null>>;
}

export default function GroupFilter(props: IGroupFilterProps) {
  return (
    <Box sx={filterContainerStyle}>
      {/* Searchbar */}
      <InputBase
        placeholder="Search groups..."
        startAdornment={<SearchIcon fontSize="medium" sx={iconStyle} />}
        sx={inputStyle}
        onChange={(e) => props.setFilterTerm(e.target.value)}
        value={props.filterTerm}
      />

      {/* Start Date Filter */}
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          value={props.startDate}
          onChange={(newDate) => props.setStartDate(newDate)}
          slotProps={{
            textField: {
              placeholder: "Choose a start date"
            }
          }}
        />
      </LocalizationProvider>

      {/* End Date Filter */}
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          value={props.endDate}
          onChange={(newDate) => props.setEndDate(newDate)}
          slotProps={{
            textField: {
              placeholder: "Choose an end date"
            }
          }}
        />
      </LocalizationProvider>
    </Box>
  );
}

const filterContainerStyle = {
  display: "flex",       // Flexbox for alignment
  alignItems: "center",  // Vertically center items
  gap: "16px",           // Space between elements
  padding: "16px",       // Inner padding
  borderRadius: "12px",  // Rounded corners
  backgroundColor: backgroundWhite,  // White background
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)", // Soft shadow effect

  // **Responsive Width Handling**
  width: "90vw",        // Takes up most of the window but leaves space on both sides
  margin: "0 auto",    // Centers it within the page
  paddingX: "5%",      // Adds responsive spacing on the left & right

  // **Ensures the filter remains responsive**
  flexWrap: "wrap" as const,  // Allows wrapping when the screen is too small
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

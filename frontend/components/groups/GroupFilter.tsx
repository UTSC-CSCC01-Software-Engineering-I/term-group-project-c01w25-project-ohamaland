"use client";

import { backgroundWhite, defaultText, textLightGrey } from "@/styles/colors";
import SearchIcon from "@mui/icons-material/Search";
import { Box, InputBase } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Dispatch, SetStateAction } from "react";
import { Dayjs } from "dayjs";

interface IGroupFilterProps {
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  filterTerm: string;
  setFilterTerm: Dispatch<SetStateAction<string>>;
  setStartDate: Dispatch<SetStateAction<Dayjs | null>>;
  setEndDate: Dispatch<SetStateAction<Dayjs | null>>;
}

export default function GroupFilter({
  startDate,
  endDate,
  filterTerm,
  setFilterTerm,
  setStartDate,
  setEndDate,
}: IGroupFilterProps) {
  return (
    <Box sx={filterContainerStyle}>
      {/* Searchbar */}
      <InputBase
        placeholder="Search groups..."
        startAdornment={<SearchIcon fontSize="medium" sx={iconStyle} />}
        sx={inputStyle}
        onChange={(e) => setFilterTerm(e.target.value)}
        value={filterTerm}
      />

      {/* Start Date Filter */}
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          value={startDate}
          onChange={(newDate) => setStartDate(newDate)}
          slotProps={{
            textField: {
              placeholder: "Choose a start date",
            },
          }}
        />
      </LocalizationProvider>

      {/* End Date Filter */}
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          value={endDate}
          onChange={(newDate) => setEndDate(newDate)}
          slotProps={{
            textField: {
              placeholder: "Choose an end date",
            },
          }}
        />
      </LocalizationProvider>
    </Box>
  );
}

const filterContainerStyle = {
  display: "flex",
  alignItems: "center",
  gap: "16px",
  padding: "16px",
  borderRadius: "12px",
  backgroundColor: backgroundWhite,
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
  flexWrap: "wrap" as const,
};

const iconStyle = {
  color: textLightGrey,
};

const inputStyle = {
  fontSize: "14px",
  fontWeight: 400,
  flexGrow: 1,
  color: defaultText,
  "& ::placeholder": {
    color: textLightGrey,
    fontSize: "14px",
    fontWeight: 400,
  },
};
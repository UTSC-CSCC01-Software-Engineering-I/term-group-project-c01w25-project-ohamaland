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

      <LocalizationProvider dateAdapter={AdapterDayjs}>
        {/* Start Date Filter */}
        <DatePicker
          value={props.startDate}
          onChange={(newDate) => props.setStartDate(newDate)}
          slotProps={{
            textField: {
              placeholder: "Choose a start date",
              variant: "standard",
              sx: {
                "& .MuiOutlinedInput-root": {
                  border: "none",
                  boxShadow: "none"
                },
                "& fieldset": {
                  border: "none"
                },
                "& .MuiInputBase-input": {
                  padding: "6px 8px"
                },
                "& input:-webkit-autofill": {
                  WebkitBoxShadow: "0 0 0px 1000px white inset !important",
                  transition: "background-color 5000s ease-in-out 0s"
                }
              }
            }
          }}
        />

        {/* End Date Filter */}
        <DatePicker
          value={props.endDate}
          onChange={(newDate) => props.setEndDate(newDate)}
          slotProps={{
            textField: {
              placeholder: "Choose an end date",
              variant: "standard",
              sx: {
                "& .MuiOutlinedInput-root": {
                  border: "none",
                  boxShadow: "none"
                },
                "& fieldset": {
                  border: "none"
                },
                "& .MuiInputBase-input": {
                  padding: "6px 8px"
                },
                "& input:-webkit-autofill": {
                  WebkitBoxShadow: "0 0 0px 1000px white inset !important",
                  transition: "background-color 5000s ease-in-out 0s"
                }
              }
            }
          }}
        />
      </LocalizationProvider>
    </Box>
  );
}

const filterContainerStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "12px",
  padding: "10px 16px",
  borderRadius: "24px",
  backgroundColor: backgroundWhite,
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",

  width: "clamp(400px, 50vw, 600px)",
  maxWidth: "80vw",
  height: "50px",
  flexWrap: "nowrap",

  margin: "0 auto"
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

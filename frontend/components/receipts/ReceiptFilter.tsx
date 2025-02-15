import { categories, Category } from "@/types/receipts"
import { Box, InputBase, SelectChangeEvent } from "@mui/material"
import { Dayjs } from "dayjs"
import SearchIcon from "@mui/icons-material/Search";
import { lightGrey, textLightGrey } from "@/styles/colors";
import { Dispatch, SetStateAction } from "react";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import DropDownSelector from "../common/DropDownSelector";

interface IReceiptFilterProps {
    startDate: Dayjs | null,
    endDate: Dayjs | null,
    filterTerm: string,
    category: Category,
    setFilterTerm: Dispatch<SetStateAction<string>>,
    setStartDate: Dispatch<SetStateAction<Dayjs | null >>
    setEndDate: Dispatch<SetStateAction<Dayjs | null >>
    handleCategoryChange: (event: SelectChangeEvent) => void
}

export default function ReceiptFilter(props: IReceiptFilterProps) {
    return (
        <Box sx={filterContainerStyle}>
            {/* Searchbar */}
            <InputBase
                placeholder="Search receipts..."
                startAdornment={<SearchIcon fontSize="medium" sx={iconStyle} />}
                sx={inputStyle}
                onChange={(e) => props.setFilterTerm(e.target.value)}
                value={props.filterTerm}
            />

            {/* Start date filter*/}
            <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
                value={props.startDate}
                onChange={(newDate) => props.setStartDate(newDate)}
                slotProps={{
                    textField: {
                        placeholder: "Choose a start Date",
                        },
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
                        placeholder: "Choose an End Date",
                        },
                }}
            />
            </LocalizationProvider>

            {/* Category Selector */}
            <DropDownSelector
                value={props.category}
                inputId="category-select-label"
                label="Category"
                onChange={props.handleCategoryChange}
                options={categories}
                formControlStyle={formControlStyle}
            />
        </Box>
    )
}

const filterContainerStyle = {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "16px",
    borderRadius: "12px",
    backgroundColor: "#lightGrey",  // Dark gray theme
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
    flexWrap: "wrap" as const,
};

const searchContainerStyle = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "#575757", // Lighter gray for contrast
    borderRadius: "8px",
    padding: "4px 12px",
    boxShadow: "inset 0 1px 3px rgba(0, 0, 0, 0.1)",
};

const iconStyle = {
    color: "#CCCCCC",
};

const inputStyle = {
    fontSize: "14px",
    fontWeight: 400,
    flexGrow: 1,
    color: "#FFFFFF",
    "& ::placeholder": {
        color: "#BDBDBD",
        fontSize: "14px",
        fontWeight: 400,
    },
};

const dateInputStyle = {
    width: "130px",
    fontSize: "14px",
    fontWeight: 400,
    color: "#FFFFFF",
    padding: "4px 12px",
    backgroundColor: "#575757",
    borderRadius: "8px",
    boxShadow: "inset 0 1px 3px rgba(0, 0, 0, 0.1)",
    "& .MuiInputBase-input": {
        padding: 0,
    },
    "& ::placeholder": {
        color: "#BDBDBD",
    },
};

const formControlStyle = {
    width: "160px",
    backgroundColor: "#FFFFFF",
    borderRadius: "8px",
    boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
    "& .MuiOutlinedInput-root": {
        color: "#FFFFFF",
        "& fieldset": {
            border: "none",
        },
        "&:hover fieldset": {
            border: "none",
        },
        "&.Mui-focused fieldset": {
            border: "2px solidrgb(0, 0, 0)",
        },
    },
};
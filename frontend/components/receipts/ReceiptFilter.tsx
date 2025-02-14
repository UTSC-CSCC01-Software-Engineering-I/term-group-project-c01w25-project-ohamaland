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
                placeholder="Search"
                startAdornment={<SearchIcon fontSize="medium" sx={iconStyle} />}
                sx={inputStyle}
                onChange={(e) => props.setFilterTerm(e.target.value)}
                value={props.filterTerm}
            />

            {/* Start date filter*/}
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker value={props.startDate} onChange={(startDate) => props.setStartDate(startDate)}/>
            </LocalizationProvider>
            

            {/* End Date Filter */}
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker value={props.endDate} onChange={(endDate) => props.setEndDate(endDate)}/>
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
    backgroundColor: "white",
    alignItems: "center"
}

const iconStyle = {
    marginRight: "8px",
    color: lightGrey
}

const inputStyle = {
    height: "32px",
    border: `1px solid ${textLightGrey}`,
    borderRadius: "6px",
    backgroundColor: "#FFF",
    padding: "0 8px",
    width: "280px",
    fontSize: "14px",
    fontWeight: 400,
    "& ::placeholder": {
        color: lightGrey,
        fontSize: "14px",
        fontWeight: 400
    }
}

const formControlStyle = {
    width: "160px",
}
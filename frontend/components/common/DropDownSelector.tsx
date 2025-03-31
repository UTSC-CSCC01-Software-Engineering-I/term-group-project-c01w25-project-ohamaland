import {
  FormControl,
  MenuItem,
  Select,
  SelectChangeEvent,
  SxProps,
  Theme,
  Typography,
  styled
} from "@mui/material";
import InputBase from "@mui/material/InputBase";

interface Option {
  value: string;
  label: string;
}

interface IDropDownSelectorProps {
  value: string;
  inputId: string;
  label: string;
  onChange: (event: SelectChangeEvent) => void;
  options: string[] | Option[];
  formControlStyle: SxProps<Theme> | undefined;
}

const StyledInput = styled(InputBase)(({ theme }) => ({
  "& .MuiInputBase-input": {
    borderRadius: 4,
    position: "relative",
    backgroundColor: theme.palette.background.paper,
    border: "1px solid rgba(0, 0, 0, 0.23)",
    fontSize: 16,
    padding: "7px 16px 7px 16px", // This is an exception to the 8px increment to match default padding
    height: "40px",
    display: "flex",
    alignItems: "center",
    transition: theme.transitions.create(["border-color", "box-shadow"]),
    "&:focus": {
      borderColor: "rgba(0, 0, 0, 0.23)",
      boxShadow: "none"
    }
  }
}));

export default function DropDownSelector(props: IDropDownSelectorProps) {
  return (
    <FormControl variant="standard" fullWidth sx={props.formControlStyle}>
      <Select
        value={props.value}
        onChange={props.onChange}
        input={<StyledInput />}
      >
        {props.options.map((option, index) => (
          <MenuItem
            key={index}
            value={typeof option === "string" ? option : option.value}
          >
            <Typography>
              {typeof option === "string" ? option : option.label}
            </Typography>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

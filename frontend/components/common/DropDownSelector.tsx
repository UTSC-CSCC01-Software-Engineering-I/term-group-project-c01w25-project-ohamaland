import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  SxProps,
  Theme,
  Typography
} from "@mui/material";

interface IDropDownSelectorProps {
  value: string;
  inputId: string;
  label: string;
  onChange: (event: SelectChangeEvent) => void;
  options: string[];
  formControlStyle: SxProps<Theme> | undefined;
}

export default function DropDownSelector(props: IDropDownSelectorProps) {
  return (
    <FormControl variant="standard" fullWidth sx={props.formControlStyle}>
      <InputLabel id={props.inputId}>
        <Typography>{props.label}</Typography>
      </InputLabel>
      <Select value={props.value} label={props.label} onChange={props.onChange}>
        {props.options.map((option, index) => (
          <MenuItem key={index} value={option}>
            <Typography>{option}</Typography>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

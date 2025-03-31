import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography
} from "@mui/material";
import { useState } from "react";
import { ChromePicker } from "react-color";

interface IAddFolderDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string, color: string) => void;
}

export default function AddFolderDialog(props: IAddFolderDialogProps) {
  const { open, onClose, onSubmit } = props;
  const [name, setName] = useState("");
  const [color, setColor] = useState("#000000");

  const handleSubmit = () => {
    onSubmit(name, color);
    setName("");
    setColor("#000000");
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          minHeight: "600px"
        }
      }}
    >
      <DialogTitle>Add New Folder</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
          <TextField
            label="Folder Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
          />
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              width: "100%"
            }}
          >
            <Typography>Folder Color</Typography>
            <Box
              sx={{ width: "100%", display: "flex", justifyContent: "center" }}
            >
              <ChromePicker
                color={color}
                onChange={(color) => setColor(color.hex)}
                disableAlpha
                styles={{
                  default: {
                    picker: {
                      width: "100%",
                      maxWidth: "800px"
                    }
                  }
                }}
              />
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!name}>
          Create Folder
        </Button>
      </DialogActions>
    </Dialog>
  );
}

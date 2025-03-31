import { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Box
} from "@mui/material";
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
  const [showColorPicker, setShowColorPicker] = useState(false);

  const handleSubmit = () => {
    onSubmit(name, color);
    setName("");
    setColor("#000000");
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
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
          <Box sx={{ position: "relative" }}>
            <Button
              variant="outlined"
              onClick={() => setShowColorPicker(!showColorPicker)}
              sx={{
                width: "100%",
                height: "40px",
                backgroundColor: color,
                color: "white",
                "&:hover": {
                  backgroundColor: color
                }
              }}
            >
              Choose Color
            </Button>
            {showColorPicker && (
              <Box
                sx={{
                  position: "absolute",
                  zIndex: 2,
                  mt: 1
                }}
              >
                <Box
                  sx={{
                    position: "fixed",
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0
                  }}
                  onClick={() => setShowColorPicker(false)}
                />
                <ChromePicker
                  color={color}
                  onChange={(color) => setColor(color.hex)}
                  disableAlpha
                />
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!name}
        >
          Create Folder
        </Button>
      </DialogActions>
    </Dialog>
  );
} 
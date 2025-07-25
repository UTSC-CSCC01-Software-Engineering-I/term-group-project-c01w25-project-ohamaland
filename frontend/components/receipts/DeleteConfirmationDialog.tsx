import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel
} from "@mui/material";
import React from "react";

interface IDeleteConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirmDelete: () => void;
  dontRemindMe: boolean;
  setDontRemindMe: (value: boolean) => void;
}

const DeleteConfirmationDialog = React.memo(function DeleteConfirmationDialog({
  open,
  onClose,
  onConfirmDelete,
  dontRemindMe,
  setDontRemindMe
}: IDeleteConfirmationDialogProps) {
  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setDontRemindMe(checked);
    if (checked) {
      localStorage.setItem("dont_remind_delete_receipt", "true");
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Confirm Deletion</DialogTitle>
      <DialogContent>
        <p>
          Are you sure you want to delete this receipt? This action cannot be
          undone.
        </p>
        <FormControlLabel
          control={
            <Checkbox
              checked={dontRemindMe}
              onChange={handleCheckboxChange}
              color="primary"
            />
          }
          label="Don't remind me again"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={onConfirmDelete} color="secondary">
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default DeleteConfirmationDialog;

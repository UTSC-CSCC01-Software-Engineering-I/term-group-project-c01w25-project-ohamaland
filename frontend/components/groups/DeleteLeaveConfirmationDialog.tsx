import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from "@mui/material";
import React from "react";

interface IDeleteLeaveConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirmAction: () => Promise<void>;
  actionType: "delete" | "leave";
}

const DeleteLeaveConfirmationDialog = React.memo(
  function DeleteLeaveConfirmationDialog({
    open,
    onClose,
    onConfirmAction,
    actionType
  }: IDeleteLeaveConfirmationDialogProps) {
    const dialogTitle =
      actionType === "delete" ? "Confirm Deletion" : "Confirm Leaving";
    const dialogMessage =
      actionType === "delete"
        ? "Are you sure you want to delete this group? This action cannot be undone."
        : "Are you sure you want to leave this group? You will no longer be a member.";
    return (
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogContent>
          <p>{dialogMessage}</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary">
            Cancel
          </Button>
          <Button onClick={onConfirmAction} color="secondary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
);

export default DeleteLeaveConfirmationDialog;

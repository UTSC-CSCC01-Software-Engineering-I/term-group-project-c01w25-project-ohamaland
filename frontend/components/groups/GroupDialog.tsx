"use client";

import { Group } from "@/types/groups";
import {
  Box,
  Button,
  Modal,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { useEffect, useState } from "react";

interface IGroupDialogProps {
  group?: Group;
  title: string;
  open: boolean;
  onClose: () => void;
  onSave: (newGroup: Group) => void;
}

export default function GroupDialog(props: IGroupDialogProps) {
  const { open, onClose, onSave, title, group } = props;
  const [editedGroup, setEditedGroup] = useState<Group | null>(group || null);

  useEffect(() => {
    setEditedGroup(group || null);
  }, [group]);

  const handleSave = () => {
    const newGroup: Group = {
      id: editedGroup?.id ?? Date.now(),
      creator: editedGroup?.creator ?? 1,
      name: editedGroup?.name ?? "",
      created_at: editedGroup?.created_at ?? new Date().toISOString(),
      members: editedGroup?.members ?? [],
      receipts: editedGroup?.receipts ?? [],
    };
  
    onSave(newGroup);
    onClose();
  };  

  const handleChange = (field: keyof Group, value: string) => {
    setEditedGroup((prev) => ({
      ...prev!,
      [field]: value
    }));
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Typography sx={modalTitleStyle}>{title}</Typography>

        <Stack spacing={2}>
          <TextField
            label="Group Name"
            fullWidth
            value={editedGroup?.name || ""}
            onChange={(e) => handleChange("name", e.target.value)}
          />

          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              variant="contained"
              color="primary"
              onClick={group ? () => onSave(editedGroup!) : handleSave}
            >
              Save
            </Button>
            <Button variant="outlined" onClick={onClose}>
              Cancel
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Modal>
  );
}

const modalStyle = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  maxHeight: "80vh",
  overflow: "auto",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2
};

const modalTitleStyle = {
  fontSize: "24px",
  fontWeight: 600,
  color: "black",
  marginBottom: "8px"
};
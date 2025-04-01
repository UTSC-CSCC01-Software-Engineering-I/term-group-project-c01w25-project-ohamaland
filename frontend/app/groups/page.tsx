"use client";

import PageWrapper from "@/components/common/layouts/PageWrapper";
import GroupFilter from "@/components/groups/GroupFilter";
import GroupGrid from "@/components/groups/GroupGrid";
import { Group } from "@/types/groups";
import { fetchWithAuth, groupsApi, userMeApi } from "@/utils/api";
import AddIcon from "@mui/icons-material/Add";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField
} from "@mui/material";
import { Dayjs } from "dayjs";
import { useEffect, useState } from "react";

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const [groupName, setGroupName] = useState("");
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [filterTerm, setFilterTerm] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    async function fetchGroups() {
      try {
        console.log("Fetching groups...");
        const response = await fetchWithAuth(groupsApi);
        if (!response || !response.ok) {
          throw new Error("Failed to fetch groups");
        }
        const data = await response.json();
        console.log("Received Group Data:", data);

        setGroups(Array.isArray(data.groups) ? data.groups : []);
      } catch (error) {
        console.error("Error fetching groups:", error);
      }
    }
    async function fetchUserId() {
      try {
        const response = await fetchWithAuth(userMeApi);
        if (!response || !response.ok) {
          throw new Error("Failed to fetch user");
        }
        const data = await response.json();
        setUserId(data.id);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    }
    fetchGroups();
    fetchUserId();
  }, []);

  const handleGroupDeleted = (groupId: number) => {
    setGroups((prevGroups) =>
      prevGroups ? prevGroups.filter((group) => group.id !== groupId) : []
    );
  };

  const handleAddGroup = async () => {
    try {
      const groupData = {
        creator: userId,
        name: groupName,
        members: [],
        receipts: []
      };
      const response = await fetchWithAuth(groupsApi, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(groupData)
      });
      if (!response || !response.ok) {
        throw new Error("Failed to add group");
      }
      const data = await response.json();
      setGroups((prevGroups) => [...prevGroups, data]);
      setOpen(false);
      setGroupName("");
    } catch (error) {
      console.error("Error adding group:", error);
    }
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <PageWrapper>
      {/* Full-Screen Centering for GroupFilter */}
      <Box sx={filterContainerStyle}>
        <GroupFilter
          startDate={startDate}
          endDate={endDate}
          filterTerm={filterTerm}
          setFilterTerm={setFilterTerm}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
        />
        <Box
          sx={{
            maxWidth: 304,
            margin: "8px",
            borderRadius: "8px",
            height: "64px",
            border: "2px dashed #ccc",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            "&:hover": {
              borderColor: "#999"
            }
          }}
          onClick={() => handleClickOpen()}
        >
          <IconButton size="large">
            <AddIcon sx={{ fontSize: 40, color: "#666" }} />
          </IconButton>
        </Box>
      </Box>

      {/* GroupGrid*/}
      <Box sx={gridWrapperStyle}>
        <GroupGrid
          initialGroups={groups ?? []}
          startDate={startDate}
          endDate={endDate}
          filterTerm={filterTerm}
          onGroupDeleted={handleGroupDeleted}
          userId={userId ?? -1}
        />
      </Box>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add Group</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Group Name"
            type="text"
            fullWidth
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleAddGroup} color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </PageWrapper>
  );
}

const filterContainerStyle = {
  display: "flex",
  alignItems: "center",
  gap: "16px",
  marginBottom: "16px",
  width: "100%",
  "& > *:first-of-type": {
    flex: 1
  }
};

const gridWrapperStyle = {
  paddingTop: "120px"
};
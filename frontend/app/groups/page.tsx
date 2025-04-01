"use client";

import PageWrapper from "@/components/common/layouts/PageWrapper";
import Log from "@/components/common/Log";
import GroupFilter from "@/components/groups/GroupFilter";
import GroupGrid from "@/components/groups/GroupGrid";
import GroupLogItem from "@/components/groups/GroupLogItem";
import { GroupMember } from "@/types/groupMembers";
import { Group } from "@/types/groups";
import { Receipt } from "@/types/receipts";
import { fetchWithAuth, groupsApi, userMeApi } from "@/utils/api";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField
} from "@mui/material";
import { Dayjs } from "dayjs";
import { useEffect, useState } from "react";

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const [groupName, setGroupName] = useState("");
  const [groupMembers, setGroupMembers] = useState<string[]>([""]);
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
      const membersArray = groupMembers
        .filter((member) => member.trim() !== "")
        .map((member) => ({ identifier: member }));
      const groupData = {
        creator: userId,
        name: groupName,
        members: membersArray,
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
      setGroupMembers([""]);
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

  const handleMemberChange = (index: number, value: string) => {
    const newMembers = [...groupMembers];
    newMembers[index] = value;
    setGroupMembers(newMembers);
    if (value.trim() !== "" && index === groupMembers.length - 1) {
      setGroupMembers([...groupMembers, ""]);
    }
  };

  return (
    <PageWrapper>
      {/* Full-Screen Centering for GroupFilter */}
      <Box sx={filterWrapperStyle}>
        <GroupFilter
          startDate={startDate}
          endDate={endDate}
          filterTerm={filterTerm}
          setFilterTerm={setFilterTerm}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
        />
        <Button variant="contained" color="primary" onClick={handleClickOpen}>
          Add
        </Button>
      </Box>

      {/* GroupGrid*/}
      <Box sx={contentLayoutStyle}>
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

        <Box sx={rightContainerStyle}>
            <Log
              data={getRecentMembers(groups)}
              Component={GroupLogItem}
            />
          </Box>
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
          {groupMembers.map((member, index) => (
            <TextField
              key={index}
              margin="dense"
              label={`Group Member ${index + 1}`}
              type="text"
              fullWidth
              value={member}
              onChange={(e) => handleMemberChange(index, e.target.value)}
            />
          ))}
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

// TODO: make to simply "getRecentActivity" and get all activity, not just memvbers
// TODO: make it defined once
function getRecentMembers(groups: Group[] | null = null): GroupMember[] {
  if (groups == null) return [];

  const allMembers = groups.flatMap(group => group.members || []);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  return allMembers
    .filter(member => new Date(member.joined_at) >= yesterday)
    .sort((a, b) =>
      new Date(b.joined_at).getTime() - new Date(a.joined_at).getTime()
    )
    .slice(0, logsToShow);
}

const logsToShow = 10;

const filterWrapperStyle = {
  position: "fixed",
  top: "70px",
  left: "50%",
  transform: "translateX(-50%)",
  width: "clamp(400px, 50vw, 600px)",
  backgroundColor: "white",
  borderRadius: "24px",
  padding: "8px 16px"
};

const gridWrapperStyle = {
  paddingTop: "120px"
};

const contentLayoutStyle = {
  display: "flex",
  gap: "32px"
};

const rightContainerStyle = {
  position: "fixed",
  right: "0px",
  width: "304px",
  flexShrink: 0
};

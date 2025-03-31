"use client";

import PageWrapper from "@/components/common/layouts/PageWrapper";
import GroupFilter from "@/components/groups/GroupFilter";
import GroupGrid from "@/components/groups/GroupGrid";
import GroupDialog from "@/components/groups/GroupDialog";
import { Group } from "@/types/groups";
import {
  fetchWithAuth,
  groupsApi,
  groupsDetailApi,
  userMeApi,
} from "@/utils/api";
import { Box, Button } from "@mui/material";
import { Dayjs } from "dayjs";
import { useEffect, useState } from "react";

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [filterTerm, setFilterTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    async function fetchGroups() {
      try {
        const response = await fetchWithAuth(groupsApi);
        if (response && response.ok) {
          const data = await response.json();
          setGroups(Array.isArray(data.groups) ? data.groups : []);
        }
      } catch (error) {
        console.error("Error fetching groups:", error);
        setGroups([]);
      }
    }

    async function fetchUserId() {
      try {
        const response = await fetchWithAuth(userMeApi);
        if (response && response.ok) {
          const data = await response.json();
          setUserId(data.id);
        }
      } catch (error) {
        console.error("Error fetching user ID:", error);
      }
    }

    fetchGroups();
    fetchUserId();
  }, []);

  const handleOpenDialog = (group: Group) => {
    setSelectedGroup(group);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setSelectedGroup(null);
    setIsDialogOpen(false);
  };

  const handleGroupDeleted = (groupId: number) => {
    setGroups((prev) => prev.filter((g) => g.id !== groupId));
  };

  const handleSaveGroup = async (newGroup: Group) => {
    try {
      if (!userId) return;

      const groupToSave = { ...newGroup, creator: userId };

      const response = await fetchWithAuth(groupsApi, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(groupToSave),
      });
      console.log("Submitting group:", groupToSave);

      if (response && response.ok) {
        const savedGroup = await response.json();
        setGroups((prev) => [...prev, savedGroup]);
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Error saving group:", error);
    }
  };

  const handleSaveGroupUpdate = async (updatedGroup: Group) => {
    try {
      const response = await fetchWithAuth(groupsDetailApi(updatedGroup.id), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedGroup),
      });

      if (response && response.ok) {
        const savedGroup = await response.json();
        setGroups((prev) =>
          prev.map((g) => (g.id === savedGroup.id ? savedGroup : g))
        );
        handleCloseDialog();
      }
    } catch (error) {
      console.error("Error updating group:", error);
    }
  };

  return (
    <PageWrapper>
      <Box sx={filterWrapperStyle}>
        <GroupFilter
          startDate={startDate}
          endDate={endDate}
          filterTerm={filterTerm}
          setFilterTerm={setFilterTerm}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={() => setIsModalOpen(true)}
        >
          Add Group
        </Button>
      </Box>

      <Box sx={gridWrapperStyle}>
        <GroupGrid
          initialGroups={groups}
          startDate={startDate}
          endDate={endDate}
          filterTerm={filterTerm}
          onGroupDeleted={handleGroupDeleted}
          userId={userId ?? -1}
        />
      </Box>

      <GroupDialog
        title="Add Group"
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveGroup}
      />

      {selectedGroup && (
        <GroupDialog
          group={selectedGroup}
          title="Update Group"
          open={isDialogOpen}
          onClose={handleCloseDialog}
          onSave={handleSaveGroupUpdate}
        />
      )}
    </PageWrapper>
  );
}

const filterWrapperStyle = {
  position: "fixed",
  top: "70px",
  left: "50%",
  transform: "translateX(-50%)",
  width: "clamp(400px, 50vw, 600px)",
  backgroundColor: "white",
  borderRadius: "24px",
  padding: "8px 16px",
};

const gridWrapperStyle = {
  paddingTop: "120px",
};
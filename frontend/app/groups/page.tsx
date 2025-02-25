"use client";

import PageWrapper from "@/components/common/layouts/PageWrapper";
import GroupFilter from "@/components/groups/GroupFilter";
import GroupGrid from "@/components/groups/GroupGrid";
import { Group } from "@/types/groups";
import { Box } from "@mui/material";
import { Dayjs } from "dayjs";
import { useEffect, useState } from "react";

export default function GroupsPage() {
  // State for the fetched groups
  const [groups, setGroups] = useState<Group[]>([]);

  // State for filters
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [filterTerm, setFilterTerm] = useState("");

  // Fetch groups from the API upon mount
  useEffect(() => {
    async function fetchGroups() {
      try {
        console.log("Fetching groups...");
        const response = await fetch("http://127.0.0.1:8000/api/groups/");
        if (!response.ok) {
          throw new Error("Failed to fetch groups");
        }
        const data = await response.json();
        console.log("Received Group Data:", data);

        setGroups(data.groups);
      } catch (error) {
        console.error("Error fetching groups:", error);
      }
    }
    fetchGroups();
  }, []);

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
      </Box>

      {/* GroupGrid*/}
      <Box sx={gridWrapperStyle}>
        <GroupGrid
          groups={groups}
          startDate={startDate}
          endDate={endDate}
          filterTerm={filterTerm}
        />
      </Box>
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
  padding: "8px 16px"
};

const gridWrapperStyle = {
  paddingTop: "120px"
};

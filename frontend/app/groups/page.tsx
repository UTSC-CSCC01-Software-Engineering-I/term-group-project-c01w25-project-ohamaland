"use client";

import PageWrapper from "@/components/common/layouts/PageWrapper";
import GroupFilter from "@/components/groups/GroupFilter";
import GroupGrid from "@/components/groups/GroupGrid";
import { Group } from "@/types/groups";
import { getAccessToken } from "@/utils/auth";
import { Box } from "@mui/material";
import { Dayjs } from "dayjs";
import { useEffect, useState } from "react";

async function getUserIdFromBackend() {
  const token = getAccessToken(); // Ensure this function is returning the access token

  if (token) {
    try {
      const response = await fetch("http://localhost:8000/api/user_id/", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`, // Sending the JWT token for authentication
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.user_id; // Return user_id from backend
      } else {
        console.error("Failed to fetch user_id");
        return null;
      }
    } catch (error) {
      console.error("Error fetching user_id:", error);
      return null;
    }
  } else {
    console.error("No token found in localStorage");
    return null;
  }
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [filterTerm, setFilterTerm] = useState("");


  useEffect(() => {
    async function fetchGroups() {
      try {
        console.log("Fetching groups...");
        const token = getAccessToken();
        const response = await fetch("http://127.0.0.1:8000/api/groups/", {
          headers: {
            "Authorization": `Bearer ${token}`,
          }
        });
        if (!response.ok) {
          throw new Error("Failed to fetch groups");
        }
        const data = await response.json();
        console.log("Received Group Data:", data);

        setGroups(data);
      } catch (error) {
        console.error("Error fetching groups:", error);
      }
    }
    async function fetchUserId() {
      const id = await getUserIdFromBackend();
      setUserId(id);
    } 
    fetchGroups();
    fetchUserId();
  }, []);

  const handleGroupDeleted = (groupId: number) => {
    setGroups((prevGroups) => prevGroups.filter((group) => group.id !== groupId));
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
      </Box>

      {/* GroupGrid*/}
      <Box sx={gridWrapperStyle}>
        <GroupGrid
          initialGroups={groups}
          startDate={startDate}
          endDate={endDate}
          filterTerm={filterTerm}
          onGroupDeleted={handleGroupDeleted}
          userId={userId!}
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

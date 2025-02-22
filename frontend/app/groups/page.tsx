"use client";

import PageWrapper from "@/components/common/layouts/PageWrapper";
import GroupFilter from "@/components/groups/GroupFilter";
import GroupGrid from "@/components/groups/GroupGrid";
import { Group } from "@/types/groups";
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
      {/* Filter component for Groups */}
      <GroupFilter
        startDate={startDate}
        endDate={endDate}
        filterTerm={filterTerm}
        setFilterTerm={setFilterTerm}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
      />

      {/* GroupGrid shows the filtered groups */}
      <GroupGrid
        groups={groups}
        startDate={startDate}
        endDate={endDate}
        filterTerm={filterTerm}
      />
    </PageWrapper>
  );
}

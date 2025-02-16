"use client";

import React, { useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import PageWrapper from "@/components/common/layouts/PageWrapper";
import GroupFilter from "../../components/groups/GroupFilter";
import GroupGrid from "../../components/groups/GroupGrid";
import { Group } from "@/types/groups";

/**
 * Example data: Hard-code some groups to show in the grid.
 */
const mockGroups: Group[] = [
  {
    id: 1,
    creator: 101,
    name: "Engineering Team",
    created_at: "2023-02-01T10:30:00Z",
  },
  {
    id: 2,
    creator: 202,
    name: "Sales Department",
    created_at: "2023-03-15T08:00:00Z",
  },
  {
    id: 3,
    creator: 303,
    name: "Marketing Crew",
    created_at: "2023-04-10T16:45:00Z",
  },
];

export default function GroupsPage() {
  // Initialize state with mock data
  const [groups] = useState<Group[]>(mockGroups);

  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [filterTerm, setFilterTerm] = useState("");

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

      {/* Renders a grid of GroupCards, filtered by date range and text search */}
      <GroupGrid
        groups={groups}
        startDate={startDate}
        endDate={endDate}
        filterTerm={filterTerm}
      />
    </PageWrapper>
  );
}
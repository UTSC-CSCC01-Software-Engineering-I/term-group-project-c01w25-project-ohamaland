import React from "react";
import { Dayjs } from "dayjs";
import { Grid2 } from "@mui/material";
import { Group } from "@/types/groups";
import GroupCard from "./GroupCard";

interface IGroupGridProps {
  groups: Group[];
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  filterTerm: string;
}

/**
 * Renders a list of groups in a grid, filtering by date range (startDate / endDate)
 * and a text filter (filterTerm) for the group name.
 */
export default function GroupGrid({
  groups,
  startDate,
  endDate,
  filterTerm,
}: IGroupGridProps) {
  const filteredGroups = filterGroups(groups, startDate, endDate, filterTerm);

  return (
    <Grid2 container spacing={3}>
      {filteredGroups.map((group, index) => (
        <GroupCard key={`${group.id}-${index}`} group={group} />
      ))}
    </Grid2>
  );
}

// Helper to filter groups by date and text input
function filterGroups(
  groups: Group[],
  startDate: Dayjs | null,
  endDate: Dayjs | null,
  filterTerm: string
): Group[] {
  return groups.filter((group) => {
    // Convert group creation to Date object
    const createdDate = new Date(group.created_at);

    // Date range filtering
    if (startDate && createdDate < startDate.toDate()) {
      return false;
    }
    if (endDate && createdDate > endDate.toDate()) {
      return false;
    }

    // Text-based filtering on group name
    const nameMatchesFilter = group.name
      .toLowerCase()
      .includes(filterTerm.toLowerCase());

    if (filterTerm && !nameMatchesFilter) {
      return false;
    }

    return true;
  });
}
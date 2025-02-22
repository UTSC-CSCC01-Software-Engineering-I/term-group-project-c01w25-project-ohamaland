import React from "react";
import { Dayjs } from "dayjs";
import { Grid2 } from "@mui/material";
import { Group } from "@/types/groups";
import GroupCard from "./GroupCard";
import { filterGroups } from "@/utils/filters";

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
export default function GroupGrid(props: IGroupGridProps) {
  const filteredGroups = filterGroups(
    props.groups,
    props.startDate,
    props.endDate,
    props.filterTerm
  );

  return (
    <Grid2 container spacing={3}>
      {filteredGroups.map((group, index) => (
        <GroupCard key={`${group.id}-${index}`} group={group} />
      ))}
    </Grid2>
  );
}
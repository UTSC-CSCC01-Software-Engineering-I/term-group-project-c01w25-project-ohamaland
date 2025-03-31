import { Group } from "@/types/groups";
import { filterGroups } from "@/utils/filters";
import { Grid2 } from "@mui/material";
import { Dayjs } from "dayjs";
import GroupCard from "./GroupCard";

interface IGroupGridProps {
  initialGroups: Group[];
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  filterTerm: string;
  onGroupDeleted: (groupId: number) => void;
  userId: number;
  onOpenDialog: (group: Group) => void;
}

/**
 * Renders a list of groups in a grid, filtering by date range (startDate / endDate)
 * and a text filter (filterTerm) for the group name.
 */
export default function GroupGrid(props: IGroupGridProps) {
  console.log("Props passed to GroupGrid:", props);
  console.log("Initial Groups:", props.initialGroups);
  const filteredGroups = filterGroups(
    props.initialGroups,
    props.startDate,
    props.endDate,
    props.filterTerm
  );
  console.log("Filtered Groups:", filteredGroups);
  return (
    <Grid2 container spacing={3}>
      {filteredGroups.map((group, index) => (
        <GroupCard
        key={`${group.id}-${index}`}
        group={group}
        onGroupDeleted={props.onGroupDeleted}
        onOpenDialog={props.onOpenDialog}
        userId={props.userId}
      />
      ))}
    </Grid2>
  );
}

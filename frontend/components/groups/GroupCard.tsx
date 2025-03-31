import { textGrey } from "@/styles/colors";
import { Group } from "@/types/groups";
import {
  fetchWithAuth,
  groupsDeleteApi,
  groupsMembersLeaveApi,
  userMeApi
} from "@/utils/api";
import { Button, Card, CardContent, Typography } from "@mui/material";
import Link from "next/link";
import { useEffect, useState } from "react";
import DeleteLeaveConfirmationDialog from "./DeleteLeaveConfirmationDialog";

interface IGroupCardProps {
  group: Group;
  onGroupDeleted: (groupId: number) => void;
  onOpenDialog: (group: Group) => void;
}

async function getUserIdFromBackend() {
  try {
    const response = await fetchWithAuth(userMeApi);
    if (!response || !response.ok) {
      console.error("Failed to fetch user_id");
      return null;
    }
    const data = await response.json();
    return data.id;
  } catch (error) {
    console.error("Error fetching user_id:", error);
    return null;
  }
}

export default function GroupCard(props: IGroupCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [actionType, setActionType] = useState<"delete" | "leave">("delete");

  useEffect(() => {
    const fetchUserId = async () => {
      const userId = await getUserIdFromBackend();
      setCurrentUserId(userId);
    };
    fetchUserId();
  }, []);

  const handleOpenDialog = (action: "delete" | "leave") => {
    setActionType(action);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleConfirmDeleteOrLeave = async () => {
    if (actionType === "delete") {
      await handleDeleteGroup();
    } else if (actionType === "leave") {
      await handleLeaveGroup();
    }
    handleCloseDialog();
  };

  const handleDeleteGroup = async () => {
    setIsDeleting(true);

    try {
      const response = await fetchWithAuth(groupsDeleteApi(props.group.id), {
        method: "DELETE"
      });

      if (!response || !response.ok) {
        console.error("Failed to delete group");
        return;
      }

      props.onGroupDeleted(props.group.id);
    } catch (error) {
      console.error("Error deleting group:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  async function handleLeaveGroup() {
    if (!currentUserId) return;

    setIsLeaving(true);

    try {
      const response = await fetchWithAuth(
        groupsMembersLeaveApi(props.group.id, currentUserId),
        {
          method: "DELETE"
        }
      );

      if (!response || !response.ok) {
        console.error("Failed to leave group");
        return;
      }

      props.onGroupDeleted(props.group.id);
    } catch (error) {
      console.error("Error leaving group:", error);
    } finally {
      setIsLeaving(false);
    }
  }

  return (
    <Card sx={cardStyle} onClick={() => props.onOpenDialog(props.group)}>
      <CardContent>
        <Typography sx={groupnameTextStyle}>{props.group.name}</Typography>
        <Typography sx={textStyle}>Creator: {props.group.creator}</Typography>
        <Typography sx={textStyle}>
          Created At: {props.group.created_at}
        </Typography>
        <Link href={`/groups/${props.group.id}`}>
          <Button variant="outlined" sx={buttonStyle}>
            View Details
          </Button>
        </Link>
        {props.group.creator === currentUserId ? (
          <Button
            variant="contained"
            color="error"
            sx={buttonStyle}
            onClick={(e) => {
              e.stopPropagation();
              handleOpenDialog("delete");
            }}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Group"}
          </Button>
        ) : (
          <Button
            variant="contained"
            color="warning"
            sx={buttonStyle}
            onClick={() => handleOpenDialog("leave")}
            disabled={isLeaving}
          >
            {isLeaving ? "Leaving..." : "Leave Group"}
          </Button>
        )}
      </CardContent>
      <DeleteLeaveConfirmationDialog
        open={openDialog}
        onClose={handleCloseDialog}
        onConfirmAction={handleConfirmDeleteOrLeave}
        actionType={actionType}
      />
    </Card>
  );
}

const cardStyle = {
  maxWidth: "400px",
  margin: "8px"
};

const groupnameTextStyle = {
  color: "black",
  fontWeight: 500,
  fontSize: "16px"
};

const textStyle = {
  color: textGrey,
  fontSize: "16px"
};

const buttonStyle = {
  marginTop: "8px"
};

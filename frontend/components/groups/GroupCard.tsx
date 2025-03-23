import { textGrey } from "@/styles/colors";
import { Group } from "@/types/groups";
import { getAccessToken } from "@/utils/auth";
import { Button, Card, CardContent, Typography } from "@mui/material";
import Link from "next/link";
import { useState, useEffect } from "react";
import DeleteLeaveConfirmationDialog from "./DeleteLeaveConfirmationDialog";

interface IGroupCardProps {
  group: Group;
  onGroupDeleted: (groupId: number) => void;
}

async function getUserIdFromBackend() {
  const token = localStorage.getItem("accessToken");

  if (token) {
    const response = await fetch("http://localhost:8000/api/user_id/", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Fetched User ID from backend:", data.user_id);
      return data.user_id;
    } else {
      const errorData = await response.json();
      console.error("Failed to fetch user_id. Error:", errorData);
      return null;
    }
  } else {
    console.error("No token found in localStorage");
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
      console.log("Fetched User ID:", userId);
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

  // Confirm action (delete or leave)
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
      const token = getAccessToken();

      const response = await fetch(`http://localhost:8000/api/groups/${props.group.id}/delete/`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        props.onGroupDeleted(props.group.id);
      } else {
        alert("Failed to delete the group");
      }
    } catch (error) {
      console.error("Error deleting group:", error);
      alert("An error occurred while deleting the group");
    } finally {
      setIsDeleting(false);
    }
  };

  async function handleLeaveGroup() {
    setIsLeaving(true);

    try {
      const token = getAccessToken();

      const response = await fetch(`http://localhost:8000/api/groups/${props.group.id}/members/${currentUserId}/leave/`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        props.onGroupDeleted(props.group.id);
      } else {
        alert("Failed to leave the group");
      }
    } catch (error) {
      console.error("Error leaving group:", error);
      alert("An error occurred while leaving the group");
    } finally {
      setIsLeaving(false);
    }
  };
  return (
    <Card sx={cardStyle}>
      <CardContent>
        <Typography sx={groupnameTextStyle}>{props.group.name}</Typography>
        <Typography sx={textStyle}>Creator: {props.group.creator}</Typography>
        <Typography sx={textStyle}>
          Created At: {props.group.created_at}
        </Typography>
        {/* Link to detail page (app/groups/[id]/page.tsx) */}
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
            onClick={() => handleOpenDialog("delete")}
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

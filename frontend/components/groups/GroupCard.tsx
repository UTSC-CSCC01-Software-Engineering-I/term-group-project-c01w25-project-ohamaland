import { textGrey } from "@/styles/colors";
import { Group } from "@/types/groups";
import {
  fetchWithAuth,
  groupsDeleteApi,
  groupsMembersLeaveApi,
  userMeApi
} from "@/utils/api";
import { Card, CardContent, Typography, IconButton, Button } from "@mui/material";
import { styled } from '@mui/material/styles';
import Link from "next/link";
import { useEffect, useState } from "react";
import DeleteLeaveConfirmationDialog from "./DeleteLeaveConfirmationDialog";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

interface IGroupCardProps {
  group: Group;
  onGroupDeleted: (groupId: number) => void;
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

  const handleCardClick = () => {
    window.location.href = `/groups/${props.group.id}`;
  };

  const RedDeleteIconButton = styled(IconButton)(({ theme }) => ({
    '&:hover': {
      color: 'red',
    },
  }));

  const formattedDate = new Date(props.group.created_at).toLocaleDateString();

  return (
    <Card sx={cardStyle} onClick={handleCardClick}>
      <CardContent>
        {props.group.creator === currentUserId && (
          <RedDeleteIconButton
            aria-label="delete"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenDialog("delete");
            }}
            sx={iconButtonStyle}
          >
            <DeleteOutlineIcon />
          </RedDeleteIconButton>
        )}
        <Typography sx={groupnameTextStyle}>{props.group.name}</Typography>
        <Typography sx={textStyle}>Creator: {props.group.creator}</Typography>
        <Typography sx={textStyle}>
          Created At: {formattedDate}
        </Typography>
        {props.group.creator !== currentUserId && (
          <Button
            variant="contained"
            color="warning"
            sx={buttonStyle}
            onClick={(e) => {
              e.stopPropagation();
              handleOpenDialog("leave");
            }}
            disabled={isLeaving}
            startIcon={<ExitToAppIcon />}
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
  minWidth: "300px",
  margin: "8px",
  cursor: "pointer",
  position: "relative",
  borderRadius: "16px",
};

const groupnameTextStyle = {
  color: "black",
  fontWeight: "bold",
  fontSize: "24px"
};

const textStyle = {
  color: textGrey,
  fontSize: "16px"
};

const buttonStyle = {
  marginTop: "8px"
};

const iconButtonStyle = {
  position: "absolute",
  top: "8px",
  right: "8px"
};
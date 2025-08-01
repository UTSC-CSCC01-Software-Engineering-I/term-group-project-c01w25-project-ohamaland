import { textGrey, textLightGrey } from "@/styles/colors";
import { Group } from "@/types/groups";
import {
  fetchWithAuth,
  groupsDeleteApi,
  groupsMembersLeaveApi,
  userMeApi
} from "@/utils/api";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { Box, Card, CardContent, IconButton, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useEffect, useState } from "react";
import DeleteLeaveConfirmationDialog from "./DeleteLeaveConfirmationDialog";

interface IGroupCardProps {
  group: Group;
  onGroupDeleted: (groupId: number) => void;
}

async function getUserIdFromBackend() {
  try {
    const response = await fetchWithAuth(userMeApi);
    if (!response || !response.ok) {
      return null;
    }
    const data = await response.json();
    return data.id;
  } catch (error) {
    return null;
  }
}

export default function GroupCard(props: IGroupCardProps) {
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

  const handleCloseDialog = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
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
    try {
      const response = await fetchWithAuth(groupsDeleteApi(props.group.id), {
        method: "DELETE"
      });

      if (!response || !response.ok) {
        return;
      }

      props.onGroupDeleted(props.group.id);
    } catch (error) {}
  };

  async function handleLeaveGroup() {
    if (!currentUserId) return;

    try {
      const response = await fetchWithAuth(
        groupsMembersLeaveApi(props.group.id, currentUserId),
        {
          method: "DELETE"
        }
      );

      if (!response || !response.ok) {
        return;
      }

      props.onGroupDeleted(props.group.id);
    } catch (error) {}
  }

  const handleCardClick = () => {
    window.location.href = `/groups/${props.group.id}`;
  };

  const RedDeleteIconButton = styled(IconButton)(() => ({
    "&:hover": {
      color: "red"
    }
  }));

  return (
    <Card sx={cardStyle}>
      <Box sx={{ display: "flex" }} onClick={handleCardClick}>
        <Box sx={greyStripStyle} />
        <Box sx={{ flexGrow: 1 }}>
          <Box sx={textCenteringStyle}>
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
              <Typography sx={groupnameTextStyle}>
                {props.group.name}
              </Typography>
              <Typography sx={textStyle}>
                Members: {props.group.members.length}
              </Typography>
              <Typography sx={textStyle}>
                Receipts: {props.group.receipts.length}
              </Typography>
              {props.group.creator !== currentUserId && (
                <RedDeleteIconButton
                  aria-label="delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenDialog("leave");
                  }}
                  sx={iconButtonStyle}
                >
                  <ExitToAppIcon />
                </RedDeleteIconButton>
              )}
            </CardContent>
          </Box>
        </Box>
      </Box>
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
  minWidth: "320px",
  margin: "8px",
  cursor: "pointer",
  position: "relative",
  borderRadius: "16px",
  height: "160px"
};

const groupnameTextStyle = {
  color: "black",
  fontWeight: "bold",
  fontSize: "24px"
};

const textStyle = {
  color: textLightGrey,
  fontSize: "16px"
};

const iconButtonStyle = {
  position: "absolute",
  bottom: "8px",
  right: "8px"
};

const greyStripStyle = {
  width: "64px",
  backgroundColor: textGrey,
  borderTopLeftRadius: "16px",
  borderBottomLeftRadius: "16px",
  height: "160px"
};

const textCenteringStyle = {
  flexGrow: 1,
  display: "flex",
  alignItems: "center",
  height: "100%"
};

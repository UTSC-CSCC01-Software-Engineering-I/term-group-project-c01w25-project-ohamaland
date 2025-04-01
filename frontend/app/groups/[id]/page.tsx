"use client";

import PageWrapper from "@/components/common/layouts/PageWrapper";
import ReceiptGrid from "@/components/receipts/ReceiptGrid";
import ReceiptDialog from "@/components/receipts/ReceiptDialog";
import Log from "@/components/common/Log";
import { textLightGrey } from "@/styles/colors";
import GroupLogItem from "@/components/groups/GroupLogItem";
import AddReceipt from "@/components/common/AddReceipt";
import { receiptsApi } from "@/utils/api";
import { getCurrentUser } from "@/utils/auth";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Receipt } from "@/types/receipts";
import { GroupMember } from "@/types/groupMembers";
import { Group } from "@/types/groups";
import { GroupLogEntry } from "@/types/groups";

import {
  fetchWithAuth,
  groupsDetailApi,
  groupsMembersApi,
  groupsMembersDetailApi,
  receiptsDetailApi
} from "@/utils/api";
import { getAccessToken } from "@/utils/auth";

export default function GroupDetailPage() {
  const params = useParams();
  const groupId = Number(params.id);

  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newUserId, setNewUserId] = useState<number>(0);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [logEntries, setLogEntries] = useState<GroupLogEntry[]>([]);
  
  const generateLogFromReceipts = (receipts: Receipt[], members: GroupMember[]): GroupLogEntry[] => {
    return receipts
      .map((receipt) => {
        const matchingMember = members.find((m) => m.user_id === receipt.user_id);
        const username = matchingMember?.username ?? `User ${receipt.user_id}`;
  
        return {
          user: username,
          action: `Added a new receipt at ${receipt.merchant}.`,
          date: receipt.date.split("T")[0],
          type: "add" as const,
        };
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };  

  // Fetch group details
  useEffect(() => {
    async function fetchGroup() {
      try {
        const token = getAccessToken();
        const res = await fetchWithAuth(groupsDetailApi(groupId), {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (!res || !res.ok) {
          throw new Error("Failed to fetch group");
        }
        const data = await res.json();
        setGroup(data);
      } catch (error) {
        console.error(error);
      }
    }
    fetchGroup();
  }, [groupId]);

  // Fetch members
  useEffect(() => {
    async function fetchMembers() {
      try {
        const token = getAccessToken();
        const res = await fetchWithAuth(groupsMembersApi(groupId), {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (!res || !res.ok) {
          throw new Error("Failed to fetch group members");
        }
        const data = await res.json();
        setMembers(data.members);
      } catch (error) {
        console.error(error);
      }
    }
    fetchMembers();
  }, [groupId]);

  useEffect(() => {
    if (group?.receipts?.length && members.length) {
      setLogEntries(generateLogFromReceipts(group.receipts, members));
    }
  }, [group, members]);  
  
  // Add member
  const handleAddMember = async () => {
    if (!newUserId) return;
    try {
      const token = getAccessToken();
      const res = await fetchWithAuth(groupsMembersApi(groupId), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ user_id: newUserId })
      });
      if (!res || !res.ok) {
        throw new Error("Failed to add member");
      }
      const createdMember = await res.json();
      setMembers((prev) => [...prev, createdMember]);
      setLogEntries((prev) => [
        {
          user: createdMember.username,
          action: "Joined the group!",
          date: new Date().toISOString().split("T")[0],
          type: "join"
        },
        ...prev
      ]);      
      setNewUserId(0);
    } catch (error) {
      console.error(error);
    }
  };
  // Remove member
  const handleRemoveMember = async (memberId: number) => {
    try {
      const member = members.find((m) => m.id === memberId);
      const token = getAccessToken();
      const res = await fetchWithAuth(
        groupsMembersDetailApi(groupId, memberId),
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
  
      if (!res || !res.ok) {
        throw new Error("Failed to delete member");
      }
  
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
  
      if (member) {
        const logEntry: GroupLogEntry = {
          user: member.username,
          action: "Left the group.",
          date: new Date().toISOString().split("T")[0],
          type: "leave"
        };
  
        setLogEntries((prev) => [logEntry, ...prev]);
      }
    } catch (error) {
      console.error(error);
    }
  };  

  // Open and close dialog
  const handleOpenDialog = (receipt: Receipt) => {
    setSelectedReceipt(receipt);
    setIsCreating(false);
    setDialogOpen(true);
  };  

  const handleCloseDialog = () => {
    setSelectedReceipt(null);
    setDialogOpen(false);
  };
  const handleOpenNewReceipt = () => {
    setSelectedReceipt(null);
    setIsCreating(true);
    setDialogOpen(true);
  };
  

  // Save receipt update
  const handleSaveReceiptUpdate = async (updatedReceipt: Receipt) => {
    try {
      const formattedDate = new Date(updatedReceipt.date)
        .toISOString()
        .split("T")[0];
  
      const updatedData = { ...updatedReceipt, date: formattedDate };
  
      const response = await fetchWithAuth(
        receiptsDetailApi(updatedReceipt.id),
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(updatedData)
        }
      );
  
      if (!response || !response.ok) {
        console.error("Failed to save receipt");
        return;
      }
  
      const savedReceipt = await response.json();
  
      setGroup((prevGroup) => {
        if (!prevGroup) return null;
        return {
          ...prevGroup,
          receipts:
            prevGroup.receipts?.map((r) =>
              r.id === savedReceipt.id ? savedReceipt : r
            ) ?? []
        };
      });
  
      const logEntry: GroupLogEntry = {
        user: getCurrentUser()?.username ?? "Unknown",
        action: `Updated receipt at ${savedReceipt.merchant}.`,
        date: formattedDate,
        type: "update"
      };
  
      setLogEntries((prev) => [logEntry, ...prev]);
  
      handleCloseDialog();
    } catch (error) {
      console.error("Error updating receipt:", error);
    }
  };  

  const handleSaveGroupReceipt = async (newReceipt: Receipt, file: File | null) => {
    try {
      const receiptWithGroup = {
        ...newReceipt,
        group: groupId
      };
      console.log("Current user", getCurrentUser());
  
      const response = await fetchWithAuth(receiptsApi, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(receiptWithGroup)
      });
  
      if (!response || !response.ok) {
        console.error("Failed to save group receipt");
        return;
      }
  
      const savedReceipt = await response.json();
  
      setGroup((prevGroup) => {
        if (!prevGroup) return null;
        return {
          ...prevGroup,
          receipts: [...(prevGroup.receipts || []), savedReceipt]
        };
      });
  
      setLogEntries((prev) => [
        {
          user: getCurrentUser()?.username ?? "Unknown",
          action: `Added a new receipt at ${savedReceipt.merchant}.`,
          date: savedReceipt.date.split("T")[0],
          type: "add"
        },
        ...prev
      ]);
  
      setIsCreating(false);
    } catch (error) {
      console.error("Error saving group receipt:", error);
    }
  };  

  // Delete receipt
  const handleDeleteReceipt = async (receiptId: number) => {
    try {
      const deletedReceipt = group?.receipts?.find((r) => r.id === receiptId);
  
      const response = await fetchWithAuth(receiptsDetailApi(receiptId), {
        method: "DELETE"
      });
  
      if (!response || !response.ok) {
        console.error("Failed to delete receipt");
        return;
      }
  
      setGroup((prevGroup) => {
        if (!prevGroup) return null;
        return {
          ...prevGroup,
          receipts: prevGroup.receipts?.filter((r) => r.id !== receiptId) ?? []
        };
      });
  
      if (deletedReceipt) {
        setLogEntries((prev) => [
          {
            user: getCurrentUser()?.username ?? "Unknown",
            action: `Deleted a receipt at ${deletedReceipt.merchant}.`,
            date: new Date().toISOString().split("T")[0],
            type: "delete"
          },
          ...prev
        ]);
      }
  
      if (selectedReceipt?.id === receiptId) {
        handleCloseDialog();
      }
    } catch (error) {
      console.error("Error deleting receipt:", error);
    }
  };  

  function getRecentGroupReceipts(receipts: Receipt[]) {
    const sortedReceipts = receipts
      .filter((r) => !!r.date)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
    return sortedReceipts.slice(0, 5); // top 5 most recent
  }

return (
  <PageWrapper>
    <Stack direction="row" spacing={3} sx={{ p: 4 }}>
      {/* Left: Receipts */}
      <Box sx={{ flex: 1 }}>
        <Typography sx={{ fontSize: "24px", fontWeight: 700, mb: 2 }}>
          {group?.name || "Group"}
        </Typography>

        <Button
          variant="contained"
          color="primary"
          onClick={handleOpenNewReceipt}
          sx={{ mb: 2 }}
        >
          Add Group Receipt
        </Button>

        <ReceiptGrid
          receipts={group?.receipts || []}
          startDate={null}
          endDate={null}
          filterTerm=""
          category="All"
          onOpenDialog={handleOpenDialog}
          onDeleteReceipt={handleDeleteReceipt}
        />
      </Box>

      {/* Right: Log + Members */}
      <Box sx={{ width: 300 }}>
      <Log
        title="Recent Activity"
        data={logEntries}
        Component={GroupLogItem}
        onOpenDialog={() => {}}
      />

        <Card variant="outlined" sx={{ mt: 3 }}>
          <CardHeader title="Members" />
          <CardContent>
            <List>
              {members.map((member) => (
                <ListItem
                  key={member.id}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleRemoveMember(member.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemText
                    primary={`@${member.username}`}
                    secondary={`Joined: ${member.joined_at}`}
                  />
                </ListItem>
              ))}
            </List>

            <Stack direction="row" spacing={2} mt={2}>
              <TextField
                label="User ID"
                value={newUserId || ""}
                type="number"
                onChange={(e) => setNewUserId(Number(e.target.value))}
              />
              <Button variant="contained" onClick={handleAddMember}>
                Add
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Stack>

    {/* Receipt Modal */}
    {selectedReceipt && (
      <ReceiptDialog
        receipt={selectedReceipt}
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSave={handleSaveReceiptUpdate}
      />
    )}

    <AddReceipt
      open={isCreating}
      onClose={() => setIsCreating(false)}
      onSave={handleSaveGroupReceipt}
      groupId={groupId}
    />
  </PageWrapper>
);
}

const containerStyle = {
  width: "90%",
  maxWidth: "100%",
  marginLeft: "auto",
  marginRight: "auto",
  paddingTop: "32px",
  paddingBottom: "32px"
};

const titleStyle = {
  fontSize: "24px",
  fontWeight: 700,
  marginBottom: "16px"
};

const subtitleStyle = {
  fontSize: "16px",
  fontWeight: 600,
  marginBottom: "8px"
};

const textStyle = {
  fontSize: "16px",
  fontWeight: 400,
  color: textLightGrey
};

const loadingTextStyle = {
  fontSize: "16px",
  color: "grey"
};

const cardStyle = {
  marginBottom: "24px",
  width: "100%"
};

const tabsStyle = {
  marginBottom: "24px",
  width: "100%"
};

const noMembersTextStyle = {
  marginBottom: "16px"
};

const listStyle = {
  marginBottom: "16px",
  width: "100%"
};

const textFieldStyle = {
  width: "240px",
  minWidth: "150px"
};

"use client";

import PageWrapper from "@/components/common/layouts/PageWrapper";
import ReceiptGrid from "@/components/receipts/ReceiptGrid";
import ReceiptDialog from "@/components/receipts/ReceiptDialog";
import Log from "@/components/common/Log";
import { textLightGrey } from "@/styles/colors";
import GroupLogItem from "@/components/groups/GroupLogItem";
import AddReceipt from "@/components/common/AddReceipt";
import { receiptsApi } from "@/utils/api";
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
      setNewUserId(0);
    } catch (error) {
      console.error(error);
    }
  };
  // Remove member
  const handleRemoveMember = async (memberId: number) => {
    try {
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
  
      setIsCreating(false);
    } catch (error) {
      console.error("Error saving group receipt:", error);
    }
  };  

  // Delete receipt
  const handleDeleteReceipt = async (receiptId: number) => {
    try {
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

      if (selectedReceipt?.id === receiptId) {
        handleCloseDialog();
      }
    } catch (error) {
      console.error("Error deleting receipt:", error);
    }
  };

// ✅ Placeholder log (replace with real data if available)
const logData = [
  { user: "Someone", action: "joined the group", date: "2025-03-31" },
  { user: "Admin", action: "added a receipt", date: "2025-03-30" }
];

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
          data={logData}
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
                    primary={`User ID: ${member.user_id}`}
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

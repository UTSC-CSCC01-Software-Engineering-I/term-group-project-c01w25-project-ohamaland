"use client";

import PageWrapper from "@/components/common/layouts/PageWrapper";
import ReceiptCard from "@/components/receipts/ReceiptCard";
import ReceiptDialog from "@/components/receipts/ReceiptDialog";
import { textLightGrey } from "@/styles/colors";
import { GroupMember } from "@/types/groupMembers";
import { Group } from "@/types/groups";
import { Receipt } from "@/types/receipts";
import { getAccessToken } from "@/utils/auth";
import DeleteIcon from "@mui/icons-material/Delete";
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
  Tab,
  Tabs,
  TextField,
  Typography
} from "@mui/material";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function GroupDetailPage() {
  const params = useParams();
  const groupId = Number(params.id);

  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [newUserId, setNewUserId] = useState<number>(0);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    async function fetchGroup() {
      try {
        const token = getAccessToken();
        const res = await fetch(`http://127.0.0.1:8000/api/groups/${groupId}/`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          }
        });
        if (!res.ok) {
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

  useEffect(() => {
    async function fetchMembers() {
      try {
        const token = getAccessToken();
        const res = await fetch(
          `http://127.0.0.1:8000/api/groups/${groupId}/members/`, {
            headers: {
              "Authorization": `Bearer ${token}`,
            }
          });
        if (!res.ok) {
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

  const handleAddMember = async () => {
    if (!newUserId) return;
    try {
      const token = getAccessToken();
      const res = await fetch(
        `http://127.0.0.1:8000/api/groups/${groupId}/members/`,
        {
          method: "POST",
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ user_id: newUserId })
        }
      );
      if (!res.ok) {
        throw new Error("Failed to add member");
      }
      const createdMember = await res.json();
      setMembers((prev) => [...prev, createdMember]);
      setNewUserId(0);
    } catch (error) {
      console.error(error);
    }
  };

  const handleRemoveMember = async (memberId: number) => {
    try {
      const token = getAccessToken();
      const res = await fetch(
        `http://127.0.0.1:8000/api/groups/${groupId}/members/${memberId}/`,
        { 
          method: "DELETE", 
          headers: {
            "Authorization": `Bearer ${token}`,
          }
        }
      );
      if (!res.ok) {
        throw new Error("Failed to delete member");
      }
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
    } catch (error) {
      console.error(error);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleSaveReceiptUpdate = async (updatedReceipt: Receipt) => {
    try {
      const formattedDate = new Date(updatedReceipt.date)
        .toISOString()
        .split("T")[0];

      const updatedData = { ...updatedReceipt, date: formattedDate };

      const token = getAccessToken();
      const response = await fetch(
        `http://127.0.0.1:8000/api/receipts/${updatedReceipt.id}/`,
        {
          method: "PATCH",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json" 
          },
          body: JSON.stringify(updatedData)
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error:", errorData);
        throw new Error(errorData.detail || "Failed to save the receipt");
      }

      const savedReceipt = await response.json();
      setGroup((prevGroup) =>
        prevGroup && prevGroup.receipts
          ? {
              ...prevGroup,
              receipts: prevGroup.receipts.map((r) =>
                r.id === savedReceipt.id ? savedReceipt : r
              )
            }
          : prevGroup
      );
      handleCloseDialog();
    } catch (error) {
      console.error("Error updating receipt:", error);
    }
  };

  const handleOpenDialog = (receipt: Receipt) => {
    setSelectedReceipt(receipt);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setSelectedReceipt(null);
    setDialogOpen(false);
  };

  return (
    <PageWrapper>
      <Box sx={containerStyle}>
        <Typography sx={titleStyle}>Group Details</Typography>

        {/* GROUP INFO CARD */}
        <Card variant="outlined" sx={cardStyle}>
          <CardHeader title="Group Information" />
          <CardContent>
            {group ? (
              <Stack spacing={1}>
                <Typography sx={subtitleStyle}>{group.name}</Typography>
                <Typography sx={textStyle}>
                  <strong>Creator:</strong> {group.creator}
                </Typography>
                <Typography sx={textStyle}>
                  <strong>Created At:</strong> {group.created_at}
                </Typography>
              </Stack>
            ) : (
              <Typography sx={loadingTextStyle}>Loading group...</Typography>
            )}
          </CardContent>
        </Card>

        {/* TABS for MEMBERS vs RECEIPTS */}
        <Tabs value={activeTab} onChange={handleTabChange} sx={tabsStyle}>
          <Tab label="Members" />
          <Tab label="Receipts" />
        </Tabs>

        {/* TAB PANEL: MEMBERS */}
        {activeTab === 0 && (
          <Box>
            <Card variant="outlined" sx={cardStyle}>
              <CardHeader title="Members" />
              <CardContent>
                {members.length === 0 ? (
                  <Typography sx={noMembersTextStyle}>
                    No members found.
                  </Typography>
                ) : (
                  <List sx={listStyle}>
                    {members.map((member) => (
                      <ListItem
                        key={member.id}
                        secondaryAction={
                          <IconButton
                            edge="end"
                            aria-label="delete"
                            color="error"
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
                )}

                {/* Add New Member Form */}
                <Stack direction="row" spacing={2} alignItems="center">
                  <TextField
                    label="New Member (User ID)"
                    type="number"
                    variant="outlined"
                    value={newUserId || ""}
                    onChange={(e) => setNewUserId(Number(e.target.value))}
                    sx={textFieldStyle}
                  />
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleAddMember}
                  >
                    Add Member
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* TAB PANEL: RECEIPTS */}
        {activeTab === 1 && (
          <Box>
            <Card variant="outlined" sx={cardStyle}>
              <CardHeader title="Group Receipts" />
              <CardContent>
                {!group?.receipts || group.receipts.length === 0 ? (
                  <Typography>No receipts found for this group.</Typography>
                ) : (
                  <Stack spacing={2}>
                    {group.receipts.map((receipt) => (
                      <ReceiptCard
                        key={receipt.id}
                        receipt={receipt}
                        onClick={() => handleOpenDialog(receipt)}
                      />
                    ))}
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Box>
        )}

        {selectedReceipt && (
          <ReceiptDialog
            receipt={selectedReceipt}
            open={dialogOpen}
            onClose={handleCloseDialog}
            onSave={handleSaveReceiptUpdate}
          />
        )}
      </Box>
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

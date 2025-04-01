"use client";

import PageWrapper from "@/components/common/layouts/PageWrapper";
import ReceiptCard from "@/components/receipts/ReceiptCard";
import AddReceipt from "@/components/receipts/AddReceipt";
import { textLightGrey } from "@/styles/colors";
import { GroupMember } from "@/types/groupMembers";
import { Group } from "@/types/groups";
import { Receipt } from "@/types/receipts";
import {
  fetchWithAuth,
  groupsDetailApi,
  groupsMembersApi,
  groupsMembersDetailApi,
  receiptsDetailApi,
  receiptsApi
} from "@/utils/api";
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
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Select
} from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { GroupReceiptSplit, Status } from "@/types/groupReceiptSplits";
import { ChevronRight, Add, Delete, Edit } from "@mui/icons-material";

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = Number(params.id);

  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [newMemberIdentifier, setNewMemberIdentifier] = useState<string>("");
  const [activeTab, setActiveTab] = useState(0);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [costSplits, setCostSplits] = useState<GroupReceiptSplit[]>([]);
  const [selectedSplit, setSelectedSplit] = useState<GroupReceiptSplit | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  useEffect(() => {
    async function fetchGroup() {
      try {
        const res = await fetchWithAuth(groupsDetailApi(groupId), {
          method: "GET"
        });
        if (!res || !res.ok) {
          throw new Error("Failed to fetch group");
        }
        const data = await res.json();
        setGroup(data);
        setMembers(data.members);
      } catch (error) {
        console.error(error);
      }
    }
    fetchGroup();
  }, [groupId]);

  const handleAddMember = async () => {
    if (!newMemberIdentifier) return;
    try {
      const res = await fetchWithAuth(groupsMembersApi(groupId), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ identifier: newMemberIdentifier })
      });
      if (!res || !res.ok) {
        throw new Error("Failed to add member");
      }
      const createdMember = await res.json();
      setMembers((prev) => [...prev, createdMember]);
      setNewMemberIdentifier("");
    } catch (error) {
      console.error(error);
    }
  };

  const handleRemoveMember = async (memberId: number) => {
    try {
      const res = await fetchWithAuth(
        groupsMembersDetailApi(groupId, memberId), {
        method: "DELETE",
      });
      if (!res || !res.ok) {
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

      const response = await fetchWithAuth(
        receiptsDetailApi(updatedReceipt.id),
        {
          method: "PATCH",
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

  const handleOpenReceipt = async (receipt: Receipt) => {
    setSelectedReceipt(receipt);
    try {
      const response = await fetchWithAuth(`http://127.0.0.1:8000/api/groups/${groupId}/receipts/${receipt.id}/cost-splits/`);
      if (!response || !response.ok) {
        throw new Error("Failed to fetch cost splits");
      }
      const data = await response.json();
      setCostSplits(data);
      setDialogOpen(true);
    } catch (error) {
      console.error("Error fetching cost splits:", error);
      setCostSplits([]);
    }
  };

  const handleCloseDialog = () => {
    setSelectedReceipt(null);
    setDialogOpen(false);
  };

  const handleDeleteGroupReceipt = async (receiptId: number) => {
    try {
      const response = await fetchWithAuth(`http://127.0.0.1:8000/api/groups/${groupId}/receipts/${receiptId}/delete/`, {
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

  const handleSaveReceipt = async (newReceipt: Receipt) => {
    try {
      const receiptData = {
        ...newReceipt,
        group: groupId,
        total_amount: Number(newReceipt.total_amount.toFixed(2)),
        tax: newReceipt.tax ? Number(newReceipt.tax.toFixed(2)) : 0,
        tip: newReceipt.tip ? Number(newReceipt.tip.toFixed(2)) : 0,
        items: newReceipt.items.map((item) => ({
          ...item,
          price: Number(item.price.toFixed(2))
        }))
      };

      const receiptResponse = await fetchWithAuth(receiptsApi, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(receiptData)
      });

      if (!receiptResponse || !receiptResponse.ok) {
        const errorData = await receiptResponse?.json();
        console.error("Failed to save receipt:", errorData);
        throw new Error("Failed to save receipt");
      }

      const savedReceipt = await receiptResponse.json();
      setGroup((prevGroup) => {
        if (!prevGroup) return null;
        return {
          ...prevGroup,
          receipts: [...(prevGroup.receipts || []), savedReceipt]
        };
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving receipt:", error);
      throw error;
    }
  };

  const handleEditSplit = (split: GroupReceiptSplit) => {
    setSelectedSplit(split);
    setEditDialogOpen(true);
  };

  const handleSaveSplit = async () => {
    if (!selectedSplit) return;
    try {
      const res = await fetchWithAuth(`http://127.0.0.1:8000/api/groups/${groupId}/receipts/${selectedReceipt?.id}/cost-splits/${selectedSplit.id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(selectedSplit)
      });
      console.log(selectedSplit);
      if (!res || !res.ok) {
        throw new Error("Failed to update split");
      }
      const updatedSplit = await res.json();
      setCostSplits((prevSplits) =>
        prevSplits.map((split) =>
          split.id === updatedSplit.id ? updatedSplit : split
        )
      );
      setEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating split:", error);
    }
  };

  const handleSplitChange = (field: keyof GroupReceiptSplit, value: any) => {
    if (!selectedSplit) return;
    setSelectedSplit({ ...selectedSplit, [field]: value });
  };

  return (
    <PageWrapper>
      <Box sx={containerStyle}>
        <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
          <Typography sx={titleStyle}>Group Details</Typography>
          <Button
            color="primary"
            onClick={() => { router.push("/groups") }}
            sx={{
              marginBottom: "8px",
              fontWeight: "bold",
              fontSize: "16px",
              "&:hover": {
                backgroundColor: "transparent" // Removes the hover background color
              }
            }}
          >
            Back <ChevronRight sx={{ marginBottom: "6px" }} />
          </Button>
        </Box>
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
                          group?.creator !== member.user.id && (
                            <IconButton
                              edge="end"
                              aria-label="delete"
                              color="error"
                              onClick={() => handleRemoveMember(member.id)}
                            >
                              <Delete />
                            </IconButton>
                          )
                        }
                      >
                        <ListItemText
                          primary={
                            <>
                              <Typography variant="body1">Username: {member.user.username}</Typography>
                              <Typography variant="body1">Email: {member.user.email}</Typography>
                            </>
                          }
                          secondary={`Joined: ${member.joined_at}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}

                {/* Add New Member Form */}
                <Stack direction="row" spacing={2} alignItems="center">
                  <TextField
                    label="Email or Username"
                    type="text"
                    variant="outlined"
                    value={newMemberIdentifier}
                    onChange={(e) => setNewMemberIdentifier(e.target.value)}
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
                        onClick={() => handleOpenReceipt(receipt)}
                        onDeleteReceipt={handleDeleteGroupReceipt}
                      />
                    ))}
                  </Stack>
                )}
                <Box
                  sx={{
                    marginTop: "16px",
                    display: "flex",
                    justifyContent: "center"
                  }}
                >
                  <IconButton
                    size="large"
                    color="primary"
                    onClick={() => setIsModalOpen(true)}
                  >
                    <Add />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}

        {selectedReceipt && (
          <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="md">
            <DialogTitle>Receipt Details</DialogTitle>
            <DialogContent>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Box sx={{ flex: 1, padding: "16px" }}>
                  <Typography variant="h6">Receipt Information</Typography>
                  <Typography><strong>ID:</strong> {selectedReceipt.id}</Typography>
                  <Typography><strong>Date:</strong> {selectedReceipt.date}</Typography>
                  <Typography><strong>Amount:</strong> ${selectedReceipt.total_amount}</Typography>
                  {/* Add more fields as needed */}
                </Box>
                <Box sx={{ flex: 1, padding: "16px" }}>
                  <Typography variant="h6">Cost Splits</Typography>
                  {costSplits.length === 0 ? (
                    <Typography>No cost splits found.</Typography>
                  ) : (
                    <List>
                      {costSplits.map((split) => (
                        <ListItem key={split.id}>
                          <ListItemText
                            primary={`User ID: ${split.user}`}
                            secondary={
                              <>
                                <Typography><strong>Status:</strong> {split.status}</Typography>
                                <Typography><strong>Amount Owed:</strong> ${split.amount_owed}</Typography>
                                <Typography><strong>Amount Paid:</strong> ${split.amount_paid}</Typography>
                              </>
                            }
                          />
                          <IconButton
                            edge="end"
                            aria-label="edit"
                            color="primary"
                            onClick={() => handleEditSplit(split)}
                          >
                            <Edit />
                          </IconButton>
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog} color="primary">Close</Button>
            </DialogActions>
          </Dialog>
        )}

        <AddReceipt
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveReceipt}
        />

        {selectedSplit && (
          <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} fullWidth maxWidth="sm">
            <DialogTitle>Edit Cost Split</DialogTitle>
            <DialogContent>
              <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <TextField
                  label="Status"
                  select
                  value={selectedSplit.status}
                  onChange={(e) => handleSplitChange("status", e.target.value as Status)}
                >
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Paid">Paid</MenuItem>
                  <MenuItem value="Disputed">Disputed</MenuItem>
                </TextField>
                <TextField
                  label="Amount Owed"
                  type="number"
                  value={selectedSplit.amount_owed}
                  onChange={(e) => handleSplitChange("amount_owed", parseFloat(e.target.value))}
                />
                <TextField
                  label="Amount Paid"
                  type="number"
                  value={selectedSplit.amount_paid}
                  onChange={(e) => handleSplitChange("amount_paid", parseFloat(e.target.value))}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedSplit.is_custom_split}
                      onChange={(e) => handleSplitChange("is_custom_split", e.target.checked)}
                    />
                  }
                  label="Custom Split"
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setEditDialogOpen(false)} color="primary">Cancel</Button>
              <Button onClick={handleSaveSplit} color="primary">Save</Button>
            </DialogActions>
          </Dialog>
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
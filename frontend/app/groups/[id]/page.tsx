"use client";

import PageWrapper from "@/components/common/layouts/PageWrapper";
import Log from "@/components/common/Log";
import GroupLogItem from "@/components/groups/GroupLogItem";
import AddReceipt from "@/components/receipts/AddReceipt";
import ReceiptCard from "@/components/receipts/ReceiptCard";
import { textLightGrey } from "@/styles/colors";
import { GroupMember } from "@/types/groupMembers";
import { GroupReceiptSplit, Status } from "@/types/groupReceiptSplits";
import { Group } from "@/types/groups";
import { Receipt } from "@/types/receipts";
import {
  fetchWithAuth,
  groupsDetailApi,
  groupsMembersApi,
  groupsMembersDetailApi,
  receiptsApi,
  receiptsDetailApi
} from "@/utils/api";
import { Add, ChevronRight, Delete, Edit } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  FormControlLabel,
  Checkbox
} from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

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
  const [selectedSplit, setSelectedSplit] = useState<GroupReceiptSplit | null>(
    null
  );
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
        groupsMembersDetailApi(groupId, memberId),
        {
          method: "DELETE"
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
      const response = await fetchWithAuth(
        `http://127.0.0.1:8000/api/groups/${groupId}/receipts/${receipt.id}/cost-splits/`
      );
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
      const response = await fetchWithAuth(
        `http://127.0.0.1:8000/api/groups/${groupId}/receipts/${receiptId}/delete/`,
        {
          method: "DELETE"
        }
      );

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
      const res = await fetchWithAuth(
        `http://127.0.0.1:8000/api/groups/${groupId}/receipts/${selectedReceipt?.id}/cost-splits/${selectedSplit.id}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(selectedSplit)
        }
      );
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
      setDialogOpen(false); // Close the main dialog after saving the split
    } catch (error) {
      console.error("Error updating split:", error);
    }
  };

  const handleSplitChange = (field: keyof GroupReceiptSplit, value: any) => {
    if (!selectedSplit) return;
    setSelectedSplit({ ...selectedSplit, [field]: value });
  };

  const getStatusStyle = (status: Status) => {
    switch (status) {
      case "Pending":
        return { backgroundColor: "#F2C946", color: "white", padding: "8px", borderRadius: "8px", display: "inline-block", paddingX: "16px", paddingBottom: "4px", fontWeight: "bold" };
      case "Paid":
        return { backgroundColor: "#84E677", color: "white", padding: "8px", borderRadius: "8px", display: "inline-block", paddingX: "16px", paddingBottom: "4px", fontWeight: "bold" };
      case "Disputed":
        return { backgroundColor: "#E66868", color: "white", padding: "8px", borderRadius: "8px", display: "inline-block", paddingX: "16px", paddingBottom: "4px", fontWeight: "bold" };
      default:
        return {};
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <PageWrapper>
      <Box sx={containerStyle}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          width="100%"
        >
          <Typography sx={titleStyle}>Group Details</Typography>
          <Button
            color="primary"
            onClick={() => {
              router.push("/groups");
            }}
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
                  <Typography sx={textStyle}>
                    <strong>Created At:</strong> {formatDate(group.created_at)}
                  </Typography>
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
          <Tab label="Recent Activity" />
        </Tabs>

        {/* TAB PANEL: MEMBERS */}
        {activeTab === 0 && (
          <Box>
            <Card variant="outlined" sx={cardStyle}>
              <CardHeader title="Members" sx={{ fontWeight: "bold" }} />
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
                              <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                                Username: {member.user.username}
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                                Email: {member.user.email}
                              </Typography>
                            </>
                          }
                          secondary={`Joined: ${formatDate(member.joined_at)}`}
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
                    sx={{ bgcolor: "black", color: "white", fontWeight: "bold", borderRadius: "8px" }}
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
                  <Box sx={receiptListStyle}>
                    {group.receipts.map((receipt) => (
                      <ReceiptCard
                        key={receipt.id}
                        receipt={receipt}
                        onClick={() => handleOpenReceipt(receipt)}
                        onDeleteReceipt={handleDeleteGroupReceipt}
                      />
                    ))}
                  </Box>
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

        {/* TAB PANEL: Recent Activity */}
        {activeTab === 2 && (
          <Box>
            <Log
              data={getRecentMembers(group?.members)}
              Component={GroupLogItem}
            />
          </Box>
        )}

        {selectedReceipt && (
          <Dialog
            open={dialogOpen}
            onClose={handleCloseDialog}
            fullWidth
            maxWidth="md"
            sx={{ '& .MuiDialog-paper': { borderRadius: '16px' } }}
          >
            <DialogTitle sx={{ fontWeight: "bold", fontSize: "24px" }}>Cost Splits</DialogTitle>
            <DialogContent>
              {costSplits.length === 0 ? (
                <Typography>No cost splits found.</Typography>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: "16px" }}>Member</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: "16px" }}>Amount Owed</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: "16px" }}>Amount Paid</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: "16px" }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: "16px" }}>Edit</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {costSplits.map((split) => (
                        <TableRow key={split.id}>
                          <TableCell>
                            {members.find((m) => m.user.id === split.user)?.user
                              .username || "Unknown"}
                          </TableCell>
                          <TableCell>
                            ${Number(split.amount_owed).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            ${Number(split.amount_paid).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Box sx={getStatusStyle(split.status)}>
                              {split.status}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <IconButton
                              edge="end"
                              aria-label="edit"
                              color="primary"
                              onClick={() => handleEditSplit(split)}
                            >
                              <Edit sx={{ color: "grey" }} />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </DialogContent>
            <DialogActions>
              <Button
                onClick={handleCloseDialog}
                sx={{ backgroundColor: 'black', color: 'white', width: '100%', borderRadius: "8px", fontWeight: "bold", marginX: "16px", marginBottom: "16px" }}
                variant="contained"
              >
                Close
              </Button>
            </DialogActions>
          </Dialog>
        )}

        <AddReceipt
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveReceipt}
        />

        {selectedSplit && (
          <Dialog
            open={editDialogOpen}
            onClose={() => setEditDialogOpen(false)}
            fullWidth
            maxWidth="sm"
            sx={{ '& .MuiDialog-paper': { borderRadius: '16px' } }}
          >
            <DialogTitle sx={{ fontWeight: "bold", fontSize: "24px" }}>Edit Cost Split</DialogTitle>
            <DialogContent>
              <Box
                sx={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "8px" }}
              >
                <TextField
                  label="Status"
                  select
                  value={selectedSplit.status}
                  onChange={(e) =>
                    handleSplitChange("status", e.target.value as Status)
                  }
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                >
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Paid">Paid</MenuItem>
                  <MenuItem value="Disputed">Disputed</MenuItem>
                </TextField>
                <TextField
                  label="Amount Owed"
                  type="number"
                  value={selectedSplit.amount_owed}
                  onChange={(e) =>
                    handleSplitChange("amount_owed", parseFloat(e.target.value))
                  }
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                />
                <TextField
                  label="Amount Paid"
                  type="number"
                  value={selectedSplit.amount_paid}
                  onChange={(e) =>
                    handleSplitChange("amount_paid", parseFloat(e.target.value))
                  }
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      sx={{ marginLeft: "8px" }}
                      checked={selectedSplit.is_custom_split}
                      onChange={(e) =>
                        handleSplitChange("is_custom_split", e.target.checked)
                      }
                    />
                  }
                  label="Custom Split"
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setEditDialogOpen(false)} sx={{ bgcolor: "black", color: "white", borderRadius: "8px", fontWeight: "bold", marginBottom: "16px", width: "50%", marginLeft: "16px", marginRight: "8px" }}>
                Cancel
              </Button>
              <Button onClick={handleSaveSplit} sx={{ bgcolor: "black", color: "white", borderRadius: "8px", fontWeight: "bold", marginBottom: "16px", width: "50%", marginLeft: "8px", marginRight: "16px" }}>
                Save
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </Box>
    </PageWrapper>
  );
}

function getRecentMembers(members: GroupMember[] | null = null) {
  if (members == null) return [];
  const currentDate = new Date();
  const yesterday = new Date(currentDate);
  yesterday.setDate(currentDate.getDate() - 1);
  const sortedMembers = members
    .filter((g) => new Date(g.joined_at) >= yesterday)
    .sort(
      (a, b) =>
        new Date(a.joined_at).getTime() - new Date(b.joined_at).getTime()
    );
  return sortedMembers.slice(0, Math.ceil(logsToShow / 2))
}

// TODO: Add To logs
function getRecentReceipts(receipts: Receipt[] | null = null) {
  if (receipts == null) return [];
  const currentDate = new Date();
  const yesterday = new Date(currentDate);
  yesterday.setDate(currentDate.getDate() - 1);
  const sortedReceipts = receipts
    .filter((r) => new Date(r.created_at) >= yesterday)
    .sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  return sortedReceipts.slice(0, Math.floor(logsToShow / 2))
}

const logsToShow = 10;

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
  fontWeight: 700
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

const receiptListStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "16px",
  justifyContent: "flex-start"
}
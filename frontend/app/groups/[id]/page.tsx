"use client";

import PageWrapper from "@/components/common/layouts/PageWrapper";
import ReceiptCard from "@/components/receipts/ReceiptCard";
import { textLightGrey } from "@/styles/colors";
import { GroupMember } from "@/types/groupMembers";
import { Group } from "@/types/groups";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

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

export default function GroupDetailPage() {
  const params = useParams();
  const groupId = Number(params.id);

  // State for group info
  const [group, setGroup] = useState<Group | null>(null);

  // State for members
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [newUserId, setNewUserId] = useState<number>(0);

  // State for active tab
  const [activeTab, setActiveTab] = useState(0);

  // Fetch group info (including any nested receipts)
  useEffect(() => {
    async function fetchGroup() {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/groups/${groupId}/`);
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

  // Fetch group members from separate endpoint
  useEffect(() => {
    async function fetchMembers() {
      try {
        const res = await fetch(
          `http://127.0.0.1:8000/api/groups/${groupId}/members/`
        );
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

  // Add a new member
  const handleAddMember = async () => {
    if (!newUserId) return;
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/groups/${groupId}/members/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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

  // Remove a member
  const handleRemoveMember = async (memberId: number) => {
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/groups/${groupId}/members/${memberId}/`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        throw new Error("Failed to delete member");
      }
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
    } catch (error) {
      console.error(error);
    }
  };

  // Switch between tabs
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <PageWrapper>
      {/* Centered container */}
      <Box sx={{ maxWidth: 900, mx: "auto", pt: 4, pb: 4 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Group Details
        </Typography>

        {/* GROUP INFO CARD */}
        <Card variant="outlined" sx={{ mb: 2 }}>
          <CardHeader title="Group Information" />
          <CardContent>
            {group ? (
              <Stack spacing={1}>
                <Typography variant="h6" gutterBottom>
                  {group.name}
                </Typography>
                <Typography variant="body1" sx={{ color: textLightGrey }}>
                  <strong>Creator:</strong> {group.creator}
                </Typography>
                <Typography variant="body1" sx={{ color: textLightGrey }}>
                  <strong>Created At:</strong> {group.created_at}
                </Typography>
              </Stack>
            ) : (
              <Typography>Loading group...</Typography>
            )}
          </CardContent>
        </Card>

        {/* TABS for MEMBERS vs RECEIPTS */}
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          textColor="primary"
          indicatorColor="primary"
          sx={{ mb: 3 }}
        >
          <Tab label="Members" />
          <Tab label="Receipts" />
        </Tabs>

        {/* TAB PANEL: MEMBERS */}
        {activeTab === 0 && (
          <Box>
            {/* MEMBERS List */}
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardHeader title="Members" />
              <CardContent>
                {members.length === 0 ? (
                  <Typography sx={{ mb: 2 }}>No members found.</Typography>
                ) : (
                  <List sx={{ mb: 2, bgcolor: "background.paper" }}>
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
                    sx={{ width: 200 }}
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
            <Card variant="outlined">
              <CardHeader title="Group Receipts" />
              <CardContent>
                {!group?.receipts || group.receipts.length === 0 ? (
                  <Typography>No receipts found for this group.</Typography>
                ) : (
                  <Stack spacing={2}>
                    {group.receipts.map((receipt) => (
                      <ReceiptCard key={receipt.id} receipt={receipt} />
                    ))}
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Box>
        )}
      </Box>
    </PageWrapper>
  );
}

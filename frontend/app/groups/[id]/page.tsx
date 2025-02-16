"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PageWrapper from "@/components/common/layouts/PageWrapper";
import { Group } from "@/types/groups";
import { GroupMember } from "@/types/groupMembers";
import ReceiptCard from "@/components/receipts/ReceiptCard";

import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Stack,
  TextField,
  Button,
  Divider
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

export default function GroupDetailPage() {
  const params = useParams();
  const groupId = Number(params.id);

  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [newUserId, setNewUserId] = useState<number>(0);

  // Fetch group info (including receipts)...
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

  // Fetch group members...
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
      const createdMember = await res.json(); // { id, group, user_id, joined_at }
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

  return (
    <PageWrapper>
      <Box sx={{ maxWidth: 800, margin: "0 auto", mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Group Details
        </Typography>

        {/* --- GROUP INFO CARD --- */}
        {!group ? (
          <Typography>Loading group...</Typography>
        ) : (
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {group.name}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                <strong>Creator:</strong> {group.creator}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                <strong>Created At:</strong> {group.created_at}
              </Typography>
            </CardContent>
          </Card>
        )}

        <Divider sx={{ mb: 3 }} />

        {/* --- MEMBERS --- */}
        <Typography variant="h5" gutterBottom>
          Members
        </Typography>
        {members.length === 0 ? (
          <Typography>No members found.</Typography>
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

        <Box sx={{ mt: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              label="New Member (User ID)"
              type="number"
              variant="outlined"
              value={newUserId || ""}
              onChange={(e) => setNewUserId(Number(e.target.value))}
              sx={{ width: 200 }}
            />
            <Button variant="contained" onClick={handleAddMember}>
              Add Member
            </Button>
          </Stack>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* --- RECEIPTS --- */}
        <Typography variant="h5" gutterBottom>
          Group Receipts
        </Typography>
        {!group?.receipts || group.receipts.length === 0 ? (
          <Typography>No receipts found for this group.</Typography>
        ) : (
          <Box sx={{ mt: 2 }}>
            {group.receipts.map((receipt) => (
              // Use your existing ReceiptCard with consistent styling
              <ReceiptCard key={receipt.id} receipt={receipt} />
            ))}
          </Box>
        )}
      </Box>
    </PageWrapper>
  );
}
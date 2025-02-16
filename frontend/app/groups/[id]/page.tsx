"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PageWrapper from "@/components/common/layouts/PageWrapper";
import { Group } from "@/types/groups";
import { GroupMember } from "@/types/groupMembers";
export default function GroupDetailPage() {
  const params = useParams();     // { id: "1" }
  const groupId = Number(params.id);

  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [newUserId, setNewUserId] = useState<number>(0);

  // Fetch group info
  useEffect(() => {
    async function fetchGroup() {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/groups/${groupId}/`);
        if (!res.ok) throw new Error("Failed to fetch group");
        const data = await res.json();
        setGroup(data);
      } catch (error) {
        console.error(error);
      }
    }
    fetchGroup();
  }, [groupId]);

  // Fetch group members
  useEffect(() => {
    async function fetchMembers() {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/groups/${groupId}/members/`);
        if (!res.ok) throw new Error("Failed to fetch group members");
        const data = await res.json();
        setMembers(data.members);
      } catch (error) {
        console.error(error);
      }
    }
    fetchMembers();
  }, [groupId]);

  // Handler to add a member via POST /api/groups/:groupId/members/
  const handleAddMember = async () => {
    if (!newUserId) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/groups/${groupId}/members/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: newUserId }),
      });
      if (!res.ok) {
        throw new Error("Failed to add member");
      }
      // Optionally re-fetch or append to `members` state
      const createdMember = await res.json(); // {id, group, user_id, joined_at}
      setMembers((prev) => [...prev, createdMember]);
      setNewUserId(0);
    } catch (error) {
      console.error(error);
    }
  };

  // Simple removal (DELETE /api/groups/:groupId/members/:id)
  const handleRemoveMember = async (memberId: number) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/groups/${groupId}/members/${memberId}/`, {
        method: "DELETE",
      });
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
      <h2>Group Detail</h2>
      {!group ? (
        <p>Loading group...</p>
      ) : (
        <>
          <p>
            <strong>Name:</strong> {group.name}
          </p>
          <p>
            <strong>Creator:</strong> {group.creator}
          </p>
          <p>
            <strong>Created At:</strong> {group.created_at}
          </p>
        </>
      )}

      <hr />
      <h3>Members</h3>
      {members.length === 0 ? (
        <p>No members found.</p>
      ) : (
        <ul>
          {members.map((member) => (
            <li key={member.id}>
              User ID: {member.user_id} &mdash; Joined: {member.joined_at}
              <button onClick={() => handleRemoveMember(member.id)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Simple form to add a new member by user_id */}
      <div style={{ marginTop: "1rem" }}>
        <label>
          User ID:
          <input
            type="number"
            value={newUserId || ""}
            onChange={(e) => setNewUserId(Number(e.target.value))}
          />
        </label>
        <button onClick={handleAddMember}>Add Member</button>
      </div>
    </PageWrapper>
  );
}
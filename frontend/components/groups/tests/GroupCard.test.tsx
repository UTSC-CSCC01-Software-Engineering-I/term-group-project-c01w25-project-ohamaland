import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import GroupCard from "@/components/groups/GroupCard";
import { Group } from "@/types/groups";
import "@testing-library/jest-dom";

// Mock fetchWithAuth for deletion and user fetch
jest.mock("@/utils/api", () => ({
  ...jest.requireActual("@/utils/api"),
  fetchWithAuth: jest.fn((url: string, options?: any) => {
    if (url.includes("me")) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ id: 1 }) });
    }
    return Promise.resolve({ ok: true });
  }),
  groupsDeleteApi: (groupId: number) => `delete-group-${groupId}`,
  groupsMembersLeaveApi: (groupId: number, userId: number) => `leave-group-${groupId}-user-${userId}`,
  userMeApi: "user-me",
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children }: any) => children,
}));

describe("GroupCard component", () => {
  const mockGroup: Group = {
    id: 123,
    creator: 1,
    name: "Test Group",
    created_at: "2024-03-25T12:00:00Z",
    members: [],
    receipts: [],
  };

  const onGroupDeleted = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders group info and delete icon button for creator", async () => {
    await act(async () => {
      render(<GroupCard group={mockGroup} onGroupDeleted={onGroupDeleted} />);
    });
  
    expect(await screen.findByText("Test Group")).toBeInTheDocument();
    expect(
        screen.getByText((content) => content.replace(/\s+/g, " ").toLowerCase().includes("members: 0"))
      ).toBeInTheDocument();
      
    expect(
        screen.getByText((content) => content.replace(/\s+/g, " ").toLowerCase().includes("receipts: 0"))
      ).toBeInTheDocument();
      
    const deleteBtn = screen.getByRole("button", { name: /delete/i });
    expect(deleteBtn).toBeInTheDocument();
  });  

  it("opens confirmation dialog and deletes the group", async () => {
    await act(async () => {
      render(<GroupCard group={mockGroup} onGroupDeleted={onGroupDeleted} />);
    });

    const deleteButton = screen.getByRole("button", { name: /delete/i });
    fireEvent.click(deleteButton);

    const confirmButton = await screen.findByRole("button", { name: /confirm/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(onGroupDeleted).toHaveBeenCalledWith(123);
    });
  });

  it("renders leave button if current user is not the creator", async () => {
    const otherUserGroup = { ...mockGroup, creator: 2 };

    await act(async () => {
      render(<GroupCard group={otherUserGroup} onGroupDeleted={onGroupDeleted} />);
    });

    // This is still labeled as "delete" due to shared aria-label in GroupCard
    const leaveButton = screen.getByRole("button", { name: /delete/i });
    expect(leaveButton).toBeInTheDocument();
  });

  it("opens dialog and leaves group if not creator", async () => {
    const otherUserGroup = { ...mockGroup, creator: 2 };

    await act(async () => {
      render(<GroupCard group={otherUserGroup} onGroupDeleted={onGroupDeleted} />);
    });

    const leaveButton = screen.getByRole("button", { name: /delete/i });
    fireEvent.click(leaveButton);

    const confirmButton = await screen.findByRole("button", { name: /confirm/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(onGroupDeleted).toHaveBeenCalledWith(123);
    });
  });
});
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import GroupCard from "@/components/groups/GroupCard";
import { Group } from "@/types/groups";
import '@testing-library/jest-dom';

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
  userMeApi: "user-me"
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children }: any) => children
}));

describe("GroupCard component", () => {
  const mockGroup: Group = {
    id: 123,
    creator: 1,
    name: "Test Group",
    created_at: "2024-03-25T12:00:00Z"
  };

  const onGroupDeleted = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders group info and delete button for creator", async () => {
    render(<GroupCard group={mockGroup} onGroupDeleted={onGroupDeleted} />);

    expect(await screen.findByText("Test Group")).toBeInTheDocument();
    expect(screen.getByText(/Creator/)).toHaveTextContent("Creator: 1");
    expect(screen.getByText(/Created At/)).toHaveTextContent("Created At: 2024-03-25T12:00:00Z");
    expect(await screen.findByRole("button", { name: /delete group/i })).toBeInTheDocument();
  });

  it("opens confirmation dialog and deletes the group", async () => {
    render(<GroupCard group={mockGroup} onGroupDeleted={onGroupDeleted} />);

    fireEvent.click(await screen.findByText("Delete Group"));

    const confirmButton = await screen.findByRole("button", { name: /confirm/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(onGroupDeleted).toHaveBeenCalledWith(123);
    });
  });

  it("shows leave group button if not creator", async () => {
    const otherUserGroup = { ...mockGroup, creator: 2 };
    render(<GroupCard group={otherUserGroup} onGroupDeleted={onGroupDeleted} />);

    expect(await screen.findByText("Leave Group")).toBeInTheDocument();
  });
});
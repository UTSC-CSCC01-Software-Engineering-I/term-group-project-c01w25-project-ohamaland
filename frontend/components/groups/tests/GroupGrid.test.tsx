import GroupGrid from "@/components/groups/GroupGrid";
import { Group } from "@/types/groups";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import dayjs from "dayjs";

// Mock the GroupCard component to isolate GroupGrid testing
jest.mock("@/components/groups/GroupCard", () => {
  return ({ group }: any) => (
    <div data-testid="mock-group-card">{group.name}</div>
  );
});

describe("GroupGrid component", () => {
  const mockGroups: Group[] = [
    {
      id: 1,
      creator: 1,
      name: "Budget Buddies",
      created_at: "2024-03-01T00:00:00Z"
    },
    {
      id: 2,
      creator: 2,
      name: "Finance Fam",
      created_at: "2024-03-20T00:00:00Z"
    },
    {
      id: 3,
      creator: 3,
      name: "Savings Squad",
      created_at: "2024-03-25T00:00:00Z"
    }
  ];

  const baseProps = {
    initialGroups: mockGroups,
    startDate: dayjs("2024-03-01").startOf("day"),
    endDate: dayjs("2024-03-31").endOf("day"),
    filterTerm: "",
    onGroupDeleted: jest.fn(),
    userId: 1
  };

  it("renders all groups when no filter is applied", () => {
    render(<GroupGrid {...baseProps} startDate={null} endDate={null} />);
    expect(screen.getAllByTestId("mock-group-card")).toHaveLength(3);
  });

  it("filters groups by name", () => {
    render(<GroupGrid {...baseProps} filterTerm="savings" />);
    expect(screen.getAllByTestId("mock-group-card")).toHaveLength(1);
    expect(screen.getByText("Savings Squad")).toBeInTheDocument();
  });

  it("filters groups by date range", () => {
    render(
      <GroupGrid
        {...baseProps}
        startDate={dayjs("2024-03-21")}
        endDate={dayjs("2024-03-31")}
      />
    );
    expect(screen.getAllByTestId("mock-group-card")).toHaveLength(1);
    expect(screen.getByText("Savings Squad")).toBeInTheDocument();
  });

  it("renders no groups if none match the filters", () => {
    render(
      <GroupGrid
        {...baseProps}
        filterTerm="nonexistent"
        startDate={dayjs("2024-01-01")}
        endDate={dayjs("2024-01-31")}
      />
    );
    expect(screen.queryByTestId("mock-group-card")).not.toBeInTheDocument();
  });
});

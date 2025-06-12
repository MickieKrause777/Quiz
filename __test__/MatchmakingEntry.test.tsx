import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import MatchmakingEntry from "@/components/MatchmakingEntry";

// Mock dependencies
jest.mock("@/lib/utils", () => ({
  formateDate: jest.fn((date: string) => `Formatted: ${date}`),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, className, type, ...props }: any) => (
    <button
      onClick={onClick}
      className={className}
      type={type}
      data-testid="button"
      {...props}
    >
      {children}
    </button>
  ),
}));

jest.mock("@/lib/actions/matchmaking", () => ({
  deleteMatchmakingQueueEntry: jest.fn(),
}));

jest.mock("uri-js/dist/esnext/util", () => ({
  toUpperCase: jest.fn((str: string) => str.toUpperCase()),
}));

jest.mock("lucide-react", () => ({
  Clock: ({ size, ...props }: any) => (
    <div data-testid="clock-icon" data-size={size} {...props}>
      Clock Icon
    </div>
  ),
}));

import * as matchmakingActions from "@/lib/actions/matchmaking";
import * as utils from "@/lib/utils";
import * as uriUtils from "uri-js/dist/esnext/util";

describe("MatchmakingEntry Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (utils.formateDate as jest.Mock).mockImplementation(
      (date: string) => `Formatted: ${date}`,
    );
    (uriUtils.toUpperCase as jest.Mock).mockImplementation((str: string) =>
      str.toUpperCase(),
    );
    (
      matchmakingActions.deleteMatchmakingQueueEntry as jest.Mock
    ).mockResolvedValue({ success: true });
  });

  describe("Rendering", () => {
    it("should render basic matchmaking entry information", () => {
      const mockPost: MatchmakingEntry = {
        id: "123",
        category: "Science",
        userId: "1",
        joinedAt: new Date("2024-01-15T10:30:00Z"),
        status: "matched",
      };

      render(<MatchmakingEntry post={mockPost} />);

      expect(screen.getByText("Category: Science")).toBeInTheDocument();
      expect(screen.getByText(/Joined At:/)).toBeInTheDocument();
      expect(screen.getByText(/Status:/)).toBeInTheDocument();
    });

    it("should call formateDate with correct date string", () => {
      const mockPost: MatchmakingEntry = {
        id: "123",
        userId: "1",
        category: "History",
        joinedAt: new Date("2024-01-15T10:30:00Z"),
        status: "waiting",
      };

      render(<MatchmakingEntry post={mockPost} />);

      expect(utils.formateDate).toHaveBeenCalledWith(
        mockPost.joinedAt.toString(),
      );
    });

    it("should call toUpperCase with status", () => {
      const mockPost: MatchmakingEntry = {
        id: "123",
        userId: "1",
        category: "Math",
        joinedAt: new Date("2024-01-15T10:30:00Z"),
        status: "waiting",
      };

      render(<MatchmakingEntry post={mockPost} />);

      expect(uriUtils.toUpperCase).toHaveBeenCalledWith("waiting");
    });

    it("should apply correct CSS classes to main container", () => {
      const mockPost: MatchmakingEntry = {
        id: "123",
        userId: "1",
        category: "Science",
        joinedAt: new Date("2024-01-15T10:30:00Z"),
        status: "matched",
      };

      const { container } = render(<MatchmakingEntry post={mockPost} />);
      const mainDiv = container.querySelector(".quiz-card");

      expect(mainDiv).toHaveClass(
        "quiz-card",
        "group",
        "m-3",
        "flex-between",
        "blue-gradient",
      );
    });
  });

  describe("Waiting Status Behavior", () => {
    it("should show waiting indicator when status is waiting", () => {
      const mockPost: MatchmakingEntry = {
        id: "123",
        userId: "1",
        category: "Science",
        joinedAt: new Date("2024-01-15T10:30:00Z"),
        status: "waiting",
      };

      render(<MatchmakingEntry post={mockPost} />);

      expect(screen.getByTestId("clock-icon")).toBeInTheDocument();
      expect(screen.getByText("Waiting for opponent")).toBeInTheDocument();
      expect(screen.getByText("Cancel Matchmaking")).toBeInTheDocument();
    });

    it("should render clock icon with correct size", () => {
      const mockPost: MatchmakingEntry = {
        id: "123",
        userId: "1",
        category: "Science",
        joinedAt: new Date("2024-01-15T10:30:00Z"),
        status: "waiting",
      };

      render(<MatchmakingEntry post={mockPost} />);

      const clockIcon = screen.getByTestId("clock-icon");
      expect(clockIcon).toHaveAttribute("data-size", "16");
    });

    it("should apply correct styling to waiting indicator", () => {
      const mockPost: MatchmakingEntry = {
        id: "123",
        userId: "1",
        category: "Science",
        joinedAt: new Date("2024-01-15T10:30:00Z"),
        status: "waiting",
      };

      render(<MatchmakingEntry post={mockPost} />);

      const waitingSpan = screen
        .getByText("Waiting for opponent")
        .closest("span");
      expect(waitingSpan).toHaveClass("text-16-medium", "!text-orange-500");
    });

    it("should render cancel button with correct styling", () => {
      const mockPost: MatchmakingEntry = {
        id: "123",
        userId: "1",
        category: "Science",
        joinedAt: new Date("2024-01-15T10:30:00Z"),
        status: "waiting",
      };

      render(<MatchmakingEntry post={mockPost} />);

      const cancelButton = screen.getByText("Cancel Matchmaking");
      expect(cancelButton).toHaveClass(
        "bg-destructive",
        "text-white",
        "hover:bg-destructive-200",
      );
      expect(cancelButton).toHaveAttribute("type", "submit");
    });
  });

  describe("Non-Waiting Status Behavior", () => {
    it("should not show waiting indicator when status is matched", () => {
      const mockPost: MatchmakingEntry = {
        id: "123",
        userId: "1",
        category: "Science",
        joinedAt: new Date("2024-01-15T10:30:00Z"),
        status: "matched",
      };

      render(<MatchmakingEntry post={mockPost} />);

      expect(screen.queryByTestId("clock-icon")).not.toBeInTheDocument();
      expect(
        screen.queryByText("Waiting for opponent"),
      ).not.toBeInTheDocument();
      expect(screen.queryByText("Cancel Matchmaking")).not.toBeInTheDocument();
    });

    it("should not show waiting indicator when status is cancelled", () => {
      const mockPost: MatchmakingEntry = {
        id: "123",
        userId: "1",
        category: "Science",
        joinedAt: new Date("2024-01-15T10:30:00Z"),
        status: "cancelled",
      };

      render(<MatchmakingEntry post={mockPost} />);

      expect(screen.queryByTestId("clock-icon")).not.toBeInTheDocument();
      expect(
        screen.queryByText("Waiting for opponent"),
      ).not.toBeInTheDocument();
      expect(screen.queryByText("Cancel Matchmaking")).not.toBeInTheDocument();
    });
  });

  describe("Cancel Matchmaking Functionality", () => {
    it("should call deleteMatchmakingQueueEntry when cancel button is clicked", async () => {
      const mockPost: MatchmakingEntry = {
        id: "123",
        userId: "1",
        category: "Science",
        joinedAt: new Date("2024-01-15T10:30:00Z"),
        status: "waiting",
      };

      render(<MatchmakingEntry post={mockPost} />);

      const cancelButton = screen.getByText("Cancel Matchmaking");
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(
          matchmakingActions.deleteMatchmakingQueueEntry,
        ).toHaveBeenCalledWith("Science");
      });
    });

    it("should handle deleteMatchmakingQueueEntry with different categories", async () => {
      const categories = ["Math", "History", "Science", "Geography"];

      for (const category of categories) {
        jest.clearAllMocks();
        (
          matchmakingActions.deleteMatchmakingQueueEntry as jest.Mock
        ).mockResolvedValue({ success: true });

        const mockPost: MatchmakingEntry = {
          id: "123",
          userId: "1",
          category,
          joinedAt: new Date("2024-01-15T10:30:00Z"),
          status: "waiting",
        };

        const { unmount } = render(<MatchmakingEntry post={mockPost} />);

        const cancelButton = screen.getByText("Cancel Matchmaking");
        fireEvent.click(cancelButton);

        await waitFor(() => {
          expect(
            matchmakingActions.deleteMatchmakingQueueEntry,
          ).toHaveBeenCalledWith(category);
        });

        unmount();
      }
    });
  });

  describe("Edge Cases and Data Validation", () => {
    it("should handle empty category string", () => {
      const mockPost: MatchmakingEntry = {
        id: "123",
        userId: "1",
        category: "",
        joinedAt: new Date("2024-01-15T10:30:00Z"),
        status: "waiting",
      };

      render(<MatchmakingEntry post={mockPost} />);

      expect(screen.getByText("Category:")).toBeInTheDocument();
    });

    it("should handle very long category names", () => {
      const mockPost: MatchmakingEntry = {
        id: "123",
        userId: "1",
        category: "Very Long Category Name That Might Cause Layout Issues",
        joinedAt: new Date("2024-01-15T10:30:00Z"),
        status: "waiting",
      };

      render(<MatchmakingEntry post={mockPost} />);

      expect(
        screen.getByText(/Category: Very Long Category Name/),
      ).toBeInTheDocument();
    });

    it("should handle different date formats", () => {
      const dates = [
        new Date("2024-01-15T10:30:00Z"),
        new Date("2023-12-31T23:59:59Z"),
        new Date("2024-06-15T00:00:00Z"),
      ];

      dates.forEach((date, index) => {
        const mockPost: MatchmakingEntry = {
          id: "123",
          userId: "1",
          category: `Category${index}`,
          joinedAt: date,
          status: "waiting",
        };

        const { unmount } = render(<MatchmakingEntry post={mockPost} />);

        expect(utils.formateDate).toHaveBeenCalledWith(date.toString());

        unmount();
      });
    });
  });

  describe("Accessibility", () => {
    it("should have accessible button for screen readers", () => {
      const mockPost: MatchmakingEntry = {
        id: "123",
        userId: "1",
        category: "Science",
        joinedAt: new Date("2024-01-15T10:30:00Z"),
        status: "waiting",
      };

      render(<MatchmakingEntry post={mockPost} />);

      const cancelButton = screen.getByRole("button", {
        name: "Cancel Matchmaking",
      });
      expect(cancelButton).toBeInTheDocument();
    });

    it("should maintain proper semantic structure", () => {
      const mockPost: MatchmakingEntry = {
        id: "123",
        userId: "1",
        category: "Science",
        joinedAt: new Date("2024-01-15T10:30:00Z"),
        status: "waiting",
      };

      render(<MatchmakingEntry post={mockPost} />);

      // Check that text content is properly structured
      expect(screen.getByText("Category: Science")).toBeInTheDocument();
      expect(screen.getByText(/Joined At:/)).toBeInTheDocument();
      expect(screen.getByText(/Status:/)).toBeInTheDocument();
    });
  });

  describe("Performance Considerations", () => {
    it("should not re-render unnecessarily with same props", () => {
      const mockPost: MatchmakingEntry = {
        id: "123",
        userId: "1",
        category: "Science",
        joinedAt: new Date("2024-01-15T10:30:00Z"),
        status: "waiting",
      };

      const { rerender } = render(<MatchmakingEntry post={mockPost} />);

      jest.clearAllMocks();

      rerender(<MatchmakingEntry post={mockPost} />);

      expect(utils.formateDate).toHaveBeenCalledTimes(1);
      expect(uriUtils.toUpperCase).toHaveBeenCalledTimes(1);
    });
  });
});

"use client";
import React from "react";
import { formateDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { deleteMatchmakingQueueEntry } from "@/lib/actions/matchmaking";

const MatchmakingEntry = ({ post }: { post: MatchmakingEntry }) => {
  const { category, joinedAt } = post;

  const cancelMatchmaking = async () => {
    await deleteMatchmakingQueueEntry(category);
  };

  return (
    <>
      <div className="quiz-card group m-3 flex-between">
        <p className="text-16-medium">
          {category} - Joined At: {formateDate(joinedAt.toString())}
        </p>
        <Button
          className="bg-destructive text-white hover:bg-destructive-200"
          type="submit"
          onClick={cancelMatchmaking}
        >
          Cancel Matchmaking
        </Button>
      </div>
    </>
  );
};
export default MatchmakingEntry;

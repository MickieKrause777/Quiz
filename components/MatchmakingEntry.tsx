"use client";
import React from "react";
import { formateDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { deleteMatchmakingQueueEntry } from "@/lib/actions/matchmaking";
import { toUpperCase } from "uri-js/dist/esnext/util";
import { Clock } from "lucide-react";

const MatchmakingEntry = ({ post }: { post: MatchmakingEntry }) => {
  const { category, joinedAt, status } = post;

  const cancelMatchmaking = async () => {
    await deleteMatchmakingQueueEntry(category);
  };

  return (
    <>
      <div className="quiz-card group m-3 flex-between">
        <div>
          <p className="text-16-medium">Category: {category}</p>
          <p className="text-16-medium">
            Joined At: {formateDate(joinedAt.toString())}
          </p>
          <p className="text-16-medium">Status: {toUpperCase(status)}</p>
        </div>

        {status === "waiting" && (
          <>
            <span className="flex items-center gap-1 text-orange-500 border-light-100 ">
              <Clock size={16} />
              <span className="text-14-medium">Waiting for opponent</span>
            </span>
            <Button
              className="bg-destructive text-white hover:bg-destructive-200"
              type="submit"
              onClick={cancelMatchmaking}
            >
              Cancel Matchmaking
            </Button>
          </>
        )}
      </div>
    </>
  );
};
export default MatchmakingEntry;

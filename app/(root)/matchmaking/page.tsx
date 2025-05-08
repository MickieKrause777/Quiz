import React from "react";
import { getSessionUser } from "@/lib/actions/auth";
import { waitingMatchmakingQueuesByUserIdQuery } from "@/database/queries";
import MatchmakingEntry from "@/components/MatchmakingEntry";

const Page = async () => {
  const user = await getSessionUser();
  const queuesEntries = await waitingMatchmakingQueuesByUserIdQuery(user!.id);

  return (
    <>
      <div className="primary_container blue-gradient">
        <h1 className="heading rounded-4xl">Matchmaking-Queues</h1>
      </div>
      <ul>
        {queuesEntries.length > 0 ? (
          queuesEntries.map((queueEntry) => (
            <MatchmakingEntry key={queueEntry.id} post={queueEntry} />
          ))
        ) : (
          <p className="no_results">No Queues Found</p>
        )}
      </ul>
    </>
  );
};
export default Page;

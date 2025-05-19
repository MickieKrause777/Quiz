import { getSessionUser } from "@/lib/actions/auth";
import {
  getOngoingMatchesByUserIdQuery,
  waitingMatchmakingQueuesByUserIdQuery,
} from "@/database/queries";
import MatchmakingEntry from "@/components/MatchmakingEntry";
import OngoingMatchEntry from "@/components/OngoingMatchEntry";
import React from "react";

const Page = async () => {
  const user = await getSessionUser();
  const ongoingMatchEntries = await getOngoingMatchesByUserIdQuery(user!.id);
  const queuesEntries = await waitingMatchmakingQueuesByUserIdQuery(user!.id);

  return (
    <>
      <div className="primary_container blue-gradient">
        <h1 className="heading rounded-4xl">Matchmaking-Queues and Matches</h1>
      </div>

      {ongoingMatchEntries.length > 0 && (
        <>
          <section className="w-full my-2">
            <h1 className="text-30-semibold !text-white !max-w-5xl text-start mx-5">
              Ongoing Matches
            </h1>
            <ul>
              {ongoingMatchEntries.map((ongoingMatchEntry) => (
                <OngoingMatchEntry
                  key={ongoingMatchEntry.id}
                  post={ongoingMatchEntry}
                  user={user!}
                />
              ))}
            </ul>
          </section>
          <hr className="divider" />
        </>
      )}

      {queuesEntries.length > 0 && (
        <section className="w-full">
          <h1 className="text-30-semibold !text-white !max-w-5xl text-start mx-5">
            Queues
          </h1>
          <ul>
            {queuesEntries.map((queueEntry) => (
              <MatchmakingEntry key={queueEntry.id} post={queueEntry} />
            ))}
          </ul>
        </section>
      )}
    </>
  );
};
export default Page;

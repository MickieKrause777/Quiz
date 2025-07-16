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

      <section className="w-full my-2">
        <h1 className="text-30-semibold !text-white !max-w-5xl text-start mx-5">
          Ongoing Matches
        </h1>
        {ongoingMatchEntries.length > 0 ? (
          <ul className="card_grid-lg">
            {ongoingMatchEntries.map((ongoingMatchEntry) => (
              <OngoingMatchEntry
                key={ongoingMatchEntry.id}
                post={ongoingMatchEntry}
                user={user!}
              />
            ))}
          </ul>
        ) : (
          <div className="text-center py-12 px-5">
            <p className="text-16-medium text-white/80 mb-1">
              No ongoing matches!
            </p>
            <p className="text-14-regular text-white/50">
              You don&apos;t have any ongoing matches, start a game!
            </p>
          </div>
        )}
      </section>

      <hr className="divider" />

      <section className="w-full">
        <h1 className="text-30-semibold !text-white !max-w-5xl text-start mx-5">
          Queues
        </h1>
        {queuesEntries.length > 0 ? (
          <ul>
            {queuesEntries.map((queueEntry) => (
              <MatchmakingEntry key={queueEntry.id} post={queueEntry} />
            ))}
          </ul>
        ) : (
          <div className="text-center py-12 px-5">
            <p className="text-16-medium text-white/80 mb-1">
              No queues found!
            </p>
            <p className="text-14-regular text-white/50">
              You don&apos;t have any queues, start matchmaking to get going!
            </p>
          </div>
        )}
        )
      </section>
    </>
  );
};
export default Page;

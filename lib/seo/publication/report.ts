import { digestPublicationEvent } from "./canonical";
import { deepFreeze } from "./contracts";
import type {
  PublicationEventInput,
  PublicationEventReport,
  PublicationEventState,
} from "./types";

export function createPublicationEventReport(
  record: PublicationEventInput,
  state: PublicationEventState,
  blockers: readonly string[],
): PublicationEventReport {
  const eligible = blockers.length === 0;
  const completed = record.dataMode === "actual" && state === "live_verified";
  return deepFreeze({
    schemaVersion: 1,
    eventId: record.eventId,
    eventType: record.eventType,
    dataMode: record.dataMode,
    state,
    eligible,
    completed,
    blockers: [...blockers],
    canonicalDigest: digestPublicationEvent({
      record,
      state,
      blockers,
      completed,
      claims: { indexed: false, ranked: false },
      sideEffects: [],
    }),
    sideEffects: [],
    searchNotification: "not_attempted",
    indexation: "not_observed",
    claims: { indexed: false, ranked: false },
  });
}

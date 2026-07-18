import type { ClusterId } from "../clusterSchema";
import type {
  DESTRUCTIVE_ACTION_GATE_IDS,
  DESTRUCTIVE_ACTION_SCHEMA_VERSION,
  OPPORTUNITY_BRIEF_SCHEMA_VERSION,
  OPPORTUNITY_FACTORS,
  OPPORTUNITY_FRESHNESS_POLICY_VERSION,
  OPPORTUNITY_QUEUE_SCHEMA_VERSION,
  OPPORTUNITY_SCORING_VERSION,
  OPPORTUNITY_TASK_TYPES,
} from "./constants";

export type OpportunityFactorId = (typeof OPPORTUNITY_FACTORS)[number]["id"];
export type OpportunityTaskType = (typeof OPPORTUNITY_TASK_TYPES)[number];
export type OpportunityDataStatus =
  | "observed"
  | "static-snapshot"
  | "synthetic-fixture"
  | "missing"
  | "not-applicable";
export type OpportunityFreshnessStatus =
  | "fresh"
  | "aging"
  | "stale"
  | "missing"
  | "not-applicable";
export type OpportunityEligibilityStatus =
  | "eligible"
  | "needs-research"
  | "blocked";
export type OpportunityGateStatus = "pass" | "pending" | "fail";
export type DestructiveActionGateId =
  (typeof DESTRUCTIVE_ACTION_GATE_IDS)[number];
export type OpportunityHardGateId =
  | "service-relevance"
  | "evidence-readiness"
  | "destination-resolved"
  | "cannibalisation-reviewed"
  | "reviewer-assigned";
export type OpportunityScoringVersion = typeof OPPORTUNITY_SCORING_VERSION;
export type OpportunityQueueSchemaVersion =
  typeof OPPORTUNITY_QUEUE_SCHEMA_VERSION;
export type OpportunityBriefSchemaVersion =
  typeof OPPORTUNITY_BRIEF_SCHEMA_VERSION;
export type DestructiveActionSchemaVersion =
  typeof DESTRUCTIVE_ACTION_SCHEMA_VERSION;

export interface OpportunityRuntimeSchema<T> {
  parse(input: unknown): T;
  safeParse(
    input: unknown,
  ): { success: true; data: T } | { success: false; error: TypeError };
}

export type OpportunityRawValue =
  | boolean
  | number
  | string
  | null
  | readonly OpportunityRawValue[]
  | { readonly [key: string]: OpportunityRawValue };

export interface OpportunityFactorInput {
  readonly raw: OpportunityRawValue;
  readonly normalized: number | null;
  readonly sourceRef: string | null;
  readonly observedAt: string | null;
  readonly dataStatus: OpportunityDataStatus;
  readonly confidence: number;
  readonly missingReason: string | null;
}

export interface OpportunityGateInput {
  readonly status: OpportunityGateStatus;
  readonly reason: string;
  readonly sourceRef: string | null;
}

export interface OpportunityBriefInput {
  readonly targetIntent: string | null;
  readonly readerOutcome: string | null;
  readonly evidenceNeeds: readonly string[];
  readonly graphChanges: readonly string[];
  readonly conversionPath: string | null;
  readonly successMeasures: readonly string[];
}

export interface DestructiveActionInput {
  readonly action: "merge" | "redirect" | "retire";
  readonly lowTrafficOnly: boolean;
  readonly gates: Readonly<
    Record<DestructiveActionGateId, OpportunityGateInput>
  >;
  readonly humanApproval: {
    readonly actorType: "human" | "automation" | "service" | null;
    readonly reviewer: string | null;
    readonly reviewedAt: string | null;
  };
}

export interface OpportunityCandidateInput {
  readonly id: string;
  readonly taskType: OpportunityTaskType;
  readonly cluster: ClusterId;
  readonly intendedDestination: string | null;
  readonly reviewer: string | null;
  readonly factors: Readonly<
    Record<OpportunityFactorId, OpportunityFactorInput>
  >;
  readonly gates: Readonly<Record<OpportunityHardGateId, OpportunityGateInput>>;
  readonly brief: OpportunityBriefInput;
  readonly destructiveAction: DestructiveActionInput | null;
}

export interface ScoredOpportunityFactor {
  readonly id: OpportunityFactorId;
  readonly label: string;
  readonly raw: OpportunityRawValue;
  readonly normalized: number | null;
  readonly weight: number;
  readonly contribution: number;
  readonly sourceRef: string | null;
  readonly observedAt: string | null;
  readonly asOfDate: string;
  readonly ageDays: number | null;
  readonly freshnessStatus: OpportunityFreshnessStatus;
  readonly freshnessMultiplier: number;
  readonly dataStatus: OpportunityDataStatus;
  readonly confidence: number;
  readonly missingReason: string | null;
  readonly scoringVersion: OpportunityScoringVersion;
  readonly freshnessPolicyVersion: typeof OPPORTUNITY_FRESHNESS_POLICY_VERSION;
}

export interface DestructiveActionEvaluation {
  readonly schemaVersion: DestructiveActionSchemaVersion;
  readonly action: DestructiveActionInput["action"];
  readonly lowTrafficOnly: boolean;
  readonly asOfDate: string;
  readonly scoringVersion: OpportunityScoringVersion;
  readonly freshnessPolicyVersion: typeof OPPORTUNITY_FRESHNESS_POLICY_VERSION;
  readonly status: "blocked" | "human-approved";
  readonly destructiveActionAllowed: boolean;
  readonly automationAllowed: false;
  readonly lowTrafficAloneSufficient: false;
  readonly blockers: readonly string[];
  readonly gates: Readonly<
    Record<DestructiveActionGateId, OpportunityGateInput>
  >;
  readonly humanApproval: DestructiveActionInput["humanApproval"];
}

export interface ScoredOpportunity {
  readonly id: string;
  readonly taskType: OpportunityTaskType;
  readonly cluster: ClusterId;
  readonly intendedDestination: string | null;
  readonly reviewer: string | null;
  readonly asOfDate: string;
  readonly scoringVersion: OpportunityScoringVersion;
  readonly freshnessPolicyVersion: typeof OPPORTUNITY_FRESHNESS_POLICY_VERSION;
  readonly finalScore: number;
  readonly coverage: number;
  readonly confidence: number;
  readonly eligibilityStatus: OpportunityEligibilityStatus;
  readonly blockers: readonly string[];
  readonly researchReasons: readonly string[];
  readonly factors: readonly ScoredOpportunityFactor[];
  readonly gates: Readonly<Record<OpportunityHardGateId, OpportunityGateInput>>;
  readonly brief: OpportunityBriefInput;
  readonly destructiveAction: DestructiveActionInput | null;
  readonly destructiveActionEvaluation: DestructiveActionEvaluation | null;
}

export interface RankedOpportunity extends ScoredOpportunity {
  readonly rank: number;
}

export interface OpportunityQueueInput {
  readonly asOfDate: string;
  readonly candidates: readonly OpportunityCandidateInput[];
}

export interface OpportunityQueueReport {
  readonly schemaVersion: OpportunityQueueSchemaVersion;
  readonly asOfDate: string;
  readonly scoringVersion: OpportunityScoringVersion;
  readonly freshnessPolicyVersion: typeof OPPORTUNITY_FRESHNESS_POLICY_VERSION;
  readonly items: readonly RankedOpportunity[];
  readonly selectedOpportunityId: string | null;
  readonly statusCounts: Readonly<Record<OpportunityEligibilityStatus, number>>;
}

export interface ProvisionalOpportunityBrief {
  readonly schemaVersion: OpportunityBriefSchemaVersion;
  readonly status: "blocked" | "needs-research";
  readonly provenance: "candidate-inputs-only";
  readonly opportunityId: string;
  readonly taskType: OpportunityTaskType;
  readonly cluster: ClusterId;
  readonly intendedDestination: string | null;
  readonly reviewer: string | null;
  readonly reviewerRequirement: {
    readonly assignedReviewer: string | null;
    readonly realHumanRequired: true;
    readonly verified: false;
  };
  readonly asOfDate: string;
  readonly scoringVersion: OpportunityScoringVersion;
  readonly freshnessPolicyVersion: typeof OPPORTUNITY_FRESHNESS_POLICY_VERSION;
  readonly finalScore: number;
  readonly eligibilityStatus: OpportunityEligibilityStatus;
  readonly blockers: readonly string[];
  readonly researchReasons: readonly string[];
  readonly missingRealInputs: readonly string[];
  readonly inputs: OpportunityBriefInput;
  readonly destructiveActionEvaluation: DestructiveActionEvaluation | null;
  readonly draftingAllowed: false;
  readonly publishingAllowed: false;
  readonly draft: null;
  readonly publication: null;
}

import type { Sha256Digest } from "./contracts";

export const PUBLICATION_EVENT_SCHEMA_VERSION = 1 as const;

export type PublicationEventType =
  | "first_high_intent_publication"
  | "first_refresh_publication";
export type PublicationDataMode = "actual" | "synthetic_fixture" | "dry_run";
export type PublicationEventState =
  | "blocked"
  | "ready"
  | "validated"
  | "approved"
  | "deployed"
  | "live_verified"
  | "fixture_ready";

export interface PublicationDigestPair {
  artifactDigest: Sha256Digest;
  reportDigest: Sha256Digest;
}

export interface PublicationReleaseIdentity extends PublicationDigestPair {
  workflowInstanceId: string;
  releaseId: string;
  nonce: string;
}

export interface PublicationGateAttestation {
  status: "verified";
  reportDigest: Sha256Digest;
}

export interface HighIntentCandidate {
  query: string;
  intent: string;
  cluster: string;
  targetUrl: string;
  canonicalUrl: string;
  pageType: string;
}

export interface RefreshCandidate {
  existingUrl: string;
  targetUrl: string;
  canonicalUrl: string;
  cluster: string;
  intent: string;
}

export interface SelectedOpportunity {
  selection: "selected";
  opportunityDigest: Sha256Digest;
  briefDigest: Sha256Digest;
  approvalDigest: Sha256Digest;
}

export interface ApprovedEvidence {
  status: "approved";
  packageDigest: Sha256Digest;
  expertiseDigest: Sha256Digest;
}

export interface HighIntentQuality {
  intent: PublicationGateAttestation;
  cluster: PublicationGateAttestation;
  graph: PublicationGateAttestation;
  geo: PublicationGateAttestation;
  attribution: PublicationGateAttestation;
  disclosure: PublicationGateAttestation;
  mobile: PublicationGateAttestation;
  metadata: PublicationGateAttestation;
  schema: PublicationGateAttestation;
  build: PublicationGateAttestation;
}

export interface RefreshQuality {
  evidenceAge: PublicationGateAttestation;
  authorship: PublicationGateAttestation;
  reviewDate: PublicationGateAttestation;
  methodology: PublicationGateAttestation;
  geo: PublicationGateAttestation;
  graph: PublicationGateAttestation;
  attribution: PublicationGateAttestation;
  disclosure: PublicationGateAttestation;
  mobile: PublicationGateAttestation;
  metadata: PublicationGateAttestation;
  schema: PublicationGateAttestation;
  build: PublicationGateAttestation;
}

export interface ArticleUpgradeDigest {
  status: "approved";
  ticketId: string;
  candidateDigest: Sha256Digest;
  reportDigest: Sha256Digest;
}

export type RefreshChangeKind =
  | "refresh"
  | "evidence_upgrade"
  | "internal_link_upgrade"
  | "pillar_improvement";

export interface RefreshChanges {
  beforeArtifactDigest: Sha256Digest;
  afterArtifactDigest: Sha256Digest;
  kind: RefreshChangeKind;
  changeDigest: Sha256Digest;
  urlDisposition:
    | { kind: "preserve"; approvalDigest: null }
    | { kind: "change"; approvalDigest: Sha256Digest };
}

export interface SyntheticReleaseBindingInput {
  dataMode: Exclude<PublicationDataMode, "actual">;
  workflowInstanceId: string;
  releaseId: string;
  artifactDigest: Sha256Digest;
  reportDigest: Sha256Digest;
  nonce: string;
  liveVerified: false;
  rollback: { readiness: "ready"; verificationRequired: true };
}

export interface TrustedReleaseBinding {
  readonly dataMode: PublicationDataMode;
  readonly workflowInstanceId: string;
  readonly releaseId: string;
  readonly artifactDigest: Sha256Digest;
  readonly reportDigest: Sha256Digest;
  readonly nonce: string;
  readonly state: "live_verified" | "synthetic_fixture" | "dry_run";
  readonly liveVerified: boolean;
  readonly contentApproval: {
    principal: string;
    approvedAt: string;
    attestationDigest: Sha256Digest;
  } | null;
  readonly productionApproval: {
    principal: string;
    approvedAt: string;
    attestationDigest: Sha256Digest;
  } | null;
  readonly deployment: {
    deploymentId: string;
    destination: string;
    deployedAt: string;
    evidenceDigest: Sha256Digest;
  } | null;
  readonly liveVerification: {
    verifiedAt: string;
    evidenceDigest: Sha256Digest;
    checksPassed: true;
  } | null;
  readonly rollback: {
    readiness: "ready";
    verificationRequired: true;
    planDigest: Sha256Digest;
  };
  readonly attestationDigest: Sha256Digest;
}

export interface PublicationEventBaseInput {
  version: typeof PUBLICATION_EVENT_SCHEMA_VERSION;
  eventId: string;
  dataMode: PublicationDataMode;
  occurredAt: string;
  opportunity: SelectedOpportunity;
  evidence: ApprovedEvidence;
  artifact: PublicationDigestPair;
  releaseIdentity: PublicationReleaseIdentity;
  releaseBinding: TrustedReleaseBinding;
  failureReasons: string[];
}

export interface HighIntentPublicationEventInput extends PublicationEventBaseInput {
  eventType: "first_high_intent_publication";
  candidate: HighIntentCandidate;
  quality: HighIntentQuality;
}

export interface RefreshPublicationEventInput extends PublicationEventBaseInput {
  eventType: "first_refresh_publication";
  candidate: RefreshCandidate;
  articleUpgrade: ArticleUpgradeDigest;
  changes: RefreshChanges;
  quality: RefreshQuality;
}

export type PublicationEventInput =
  | HighIntentPublicationEventInput
  | RefreshPublicationEventInput;

export interface PublicationEventReport {
  schemaVersion: typeof PUBLICATION_EVENT_SCHEMA_VERSION;
  eventId: string;
  eventType: PublicationEventType;
  dataMode: PublicationDataMode;
  state: PublicationEventState;
  eligible: boolean;
  completed: boolean;
  blockers: string[];
  canonicalDigest: Sha256Digest;
  sideEffects: [];
  searchNotification: "not_attempted";
  indexation: "not_observed";
  claims: {
    indexed: false;
    ranked: false;
  };
}

export interface PublicationEventDecision<
  T extends PublicationEventInput = PublicationEventInput,
> {
  eventType: PublicationEventType;
  state: PublicationEventState;
  eligible: boolean;
  completed: boolean;
  blockers: string[];
  record: T;
  report: PublicationEventReport;
}

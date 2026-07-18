import type { ClusterId } from "../clusterSchema";

export type GuidesBlockReasonCode =
  | "input-invalid"
  | "pillar-unresolved"
  | "pillar-navigation-hidden"
  | "pillar-article-missing"
  | "pillar-article-ineligible"
  | "pillar-article-cluster-mismatch"
  | "pillar-article-role-invalid"
  | "integration-invalid";

export interface GuidesBlockReason {
  readonly code: GuidesBlockReasonCode;
  readonly clusterId: ClusterId | null;
  readonly destination: string | null;
  readonly message: string;
}

export interface GuidesArticleCard {
  readonly contentId: string;
  readonly href: string;
  readonly title: string;
  readonly description: string;
  readonly clusterId: ClusterId;
  readonly clusterLabel: string;
  readonly contentRole: "pillar" | "supporting" | "evidence" | "comparison";
  readonly publishedDate: string;
  readonly updatedDate: string | null;
  readonly governedDate: string;
  readonly governedVersion: number;
  readonly elementId: string;
  readonly linkLabel: string;
}

export interface GuidesPillarCard {
  readonly clusterId: ClusterId;
  readonly label: string;
  readonly order: number;
  readonly href: string;
  readonly contentId: string;
  readonly title: string;
  readonly description: string;
  readonly elementId: string;
  readonly linkLabel: string;
  readonly describedBy: string;
}

export interface GuidesFilterOption {
  readonly key: "all" | ClusterId;
  readonly value: "all" | ClusterId;
  readonly label: string;
  readonly position: number;
  readonly controlId: string;
  readonly ariaControls: string;
}

export interface GuidesFiltersViewModel {
  readonly label: string;
  readonly stateKey: "cluster";
  readonly defaultValue: "all";
  readonly stateTransport: "component-memory";
  readonly navigationEffect: "none";
  readonly crawlPolicy: "single-document";
  readonly statusElementId: string;
  readonly options: readonly GuidesFilterOption[];
}

export interface GuidesNavigationDescriptor {
  readonly kind: "guides-discovery";
  readonly label: "Guides";
  readonly href: "/article";
  readonly elementId: string;
}

export interface GuidesFooterPillarDescriptor {
  readonly clusterId: ClusterId;
  readonly label: string;
  readonly href: string;
  readonly order: number;
  readonly elementId: string;
}

export interface GuidesFooterDescriptor {
  readonly sectionLabel: "Guides";
  readonly elementId: string;
  readonly items: readonly GuidesFooterPillarDescriptor[];
}

export interface GuidesSitemapRootDescriptor {
  readonly kind: "discovery-root";
  readonly label: "Guides";
  readonly href: "/article";
  readonly order: 0;
}

export interface GuidesSitemapPillarDescriptor {
  readonly kind: "editorial-pillar";
  readonly clusterId: ClusterId;
  readonly label: string;
  readonly href: string;
  readonly order: number;
}

export type GuidesSitemapItemDescriptor =
  | GuidesSitemapRootDescriptor
  | GuidesSitemapPillarDescriptor;

export interface GuidesSitemapDescriptor {
  readonly items: readonly GuidesSitemapItemDescriptor[];
}

export interface GuidesIntegrationDescriptors {
  readonly scope: "guides-only";
  readonly navigation: GuidesNavigationDescriptor;
  readonly footer: GuidesFooterDescriptor;
  readonly sitemap: GuidesSitemapDescriptor;
}

export type GuidesReviewModality =
  | "mobile"
  | "desktop"
  | "keyboard"
  | "screen-reader";

export interface GuidesAccessibilityReviewItem {
  readonly modality: GuidesReviewModality;
  readonly label: string;
  readonly checks: readonly string[];
}

export interface GuidesAccessibilityViewModel {
  readonly sectionLabel: string;
  readonly headingElementId: string;
  readonly relationships: {
    readonly sectionLabelledBy: string;
    readonly pillarsLabelledBy: string;
    readonly recentLabelledBy: string;
    readonly filterControls: string;
    readonly filterStatus: string;
  };
  readonly focusOrder: readonly string[];
  readonly reviewChecklist: readonly GuidesAccessibilityReviewItem[];
}

export interface GuidesDiscoverySectionViewModel {
  readonly kind: "guides-discovery";
  readonly elementId: string;
  readonly heading: "Guides";
  readonly description: string;
  readonly pillars: {
    readonly elementId: string;
    readonly headingElementId: string;
    readonly label: string;
    readonly items: readonly GuidesPillarCard[];
  };
  readonly filters: GuidesFiltersViewModel;
  readonly articles: {
    readonly elementId: string;
    readonly headingElementId: string;
    readonly heading: string;
    readonly label: string;
    readonly items: readonly GuidesArticleCard[];
  };
  readonly recent: {
    readonly elementId: string;
    readonly headingElementId: string;
    readonly heading: string;
    readonly label: string;
    readonly items: readonly GuidesArticleCard[];
  };
  readonly integration: GuidesIntegrationDescriptors;
  readonly accessibility: GuidesAccessibilityViewModel;
}

export interface GuidesDiscoveryReadyResult {
  readonly status: "ready";
  readonly contractVersion: 1;
  readonly source: {
    readonly clusterRegistryVersion: number;
    readonly articleIndexVersion: number;
  };
  readonly guides: GuidesDiscoverySectionViewModel;
}

export interface GuidesDiscoveryBlockedResult {
  readonly status: "blocked";
  readonly contractVersion: 1;
  readonly reasons: readonly GuidesBlockReason[];
}

export type GuidesDiscoveryResult =
  | GuidesDiscoveryReadyResult
  | GuidesDiscoveryBlockedResult;

export interface GuidesFilterState {
  readonly key: "cluster";
  readonly value: "all" | ClusterId;
}

export interface GuidesSelectionReadyResult {
  readonly status: "ready";
  readonly state: GuidesFilterState;
  readonly items: readonly GuidesArticleCard[];
  readonly count: number;
  readonly announcement: string;
  readonly controlledElementId: string;
  readonly statusElementId: string;
}

export interface GuidesSelectionBlockedResult {
  readonly status: "blocked";
  readonly code: "state-invalid";
  readonly message: string;
}

export type GuidesSelectionResult =
  | GuidesSelectionReadyResult
  | GuidesSelectionBlockedResult;

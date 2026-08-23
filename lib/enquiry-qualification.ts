/**
 * Qualification enums for Enquiry Page Form (C3).
 * Single source for UI, payload builders, and API allowlists.
 * path_intent = procurement intent, never travel vs remote.
 */

export const PATH_INTENTS = ['find_new', 'verify_existing'] as const
export type SubmittedPathIntent = (typeof PATH_INTENTS)[number]

export const TIMELINES = [
  '0-3_months',
  '3-6_months',
  '6plus_months',
  'exploring',
] as const
export type Timeline = (typeof TIMELINES)[number]

const PATH_INTENT_LABELS: Record<SubmittedPathIntent, string> = {
  find_new: 'Find and vet new suppliers',
  verify_existing: 'Visit or verify an existing supplier',
}

const TIMELINE_LABELS: Record<Timeline, string> = {
  '0-3_months': 'Within 3 months',
  '3-6_months': '3–6 months',
  '6plus_months': 'More than 6 months',
  exploring: 'Still exploring',
}

export function isSubmittedPathIntent(value: unknown): value is SubmittedPathIntent {
  return typeof value === 'string' && (PATH_INTENTS as readonly string[]).includes(value)
}

export function isTimeline(value: unknown): value is Timeline {
  return typeof value === 'string' && (TIMELINES as readonly string[]).includes(value)
}

export function pathIntentLabel(value: SubmittedPathIntent): string {
  return PATH_INTENT_LABELS[value]
}

export function timelineLabel(value: Timeline): string {
  return TIMELINE_LABELS[value]
}

/**
 * Budget bands (AUD) and order type — required on every lead capture surface.
 * Same single-source pattern as PATH_INTENTS/TIMELINES above.
 */

export const BUDGET_RANGES = [
  'under_10k',
  '10k_50k',
  '50k_100k',
  '100k_250k',
  '250k_500k',
  'over_500k',
] as const
export type BudgetRange = (typeof BUDGET_RANGES)[number]

export const ORDER_TYPES = ['ongoing_supply', 'one_time'] as const
export type OrderType = (typeof ORDER_TYPES)[number]

const BUDGET_RANGE_LABELS: Record<BudgetRange, string> = {
  under_10k: 'Under A$10,000',
  '10k_50k': 'A$10,000 – A$50,000',
  '50k_100k': 'A$50,000 – A$100,000',
  '100k_250k': 'A$100,000 – A$250,000',
  '250k_500k': 'A$250,000 – A$500,000',
  over_500k: 'Over A$500,000',
}

const ORDER_TYPE_LABELS: Record<OrderType, string> = {
  ongoing_supply: 'Ongoing supply',
  one_time: 'One-time purchase',
}

export function isBudgetRange(value: unknown): value is BudgetRange {
  return typeof value === 'string' && (BUDGET_RANGES as readonly string[]).includes(value)
}

export function isOrderType(value: unknown): value is OrderType {
  return typeof value === 'string' && (ORDER_TYPES as readonly string[]).includes(value)
}

export function budgetRangeLabel(value: BudgetRange): string {
  return BUDGET_RANGE_LABELS[value]
}

export function orderTypeLabel(value: OrderType): string {
  return ORDER_TYPE_LABELS[value]
}

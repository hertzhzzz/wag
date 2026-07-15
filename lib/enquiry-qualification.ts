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

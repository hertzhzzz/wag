/**
 * Shared select options for the budget / order type fields.
 * Values come from the enum single source in lib/enquiry-qualification.ts;
 * labels are i18n keys so all three lead capture forms stay in sync.
 * The Record types force every enum member to have a label — miss one and it fails to compile.
 */

import type { TKey } from '@/i18n/useT'
import {
  BUDGET_RANGES,
  ORDER_TYPES,
  PATH_INTENTS,
  TIMELINES,
  type BudgetRange,
  type OrderType,
  type SubmittedPathIntent,
  type Timeline,
} from '@/lib/enquiry-qualification'

const BUDGET_LABEL_KEYS: Record<BudgetRange, TKey> = {
  under_10k: 'form.enq.field.budget.under_10k',
  '10k_50k': 'form.enq.field.budget.10k_50k',
  '50k_100k': 'form.enq.field.budget.50k_100k',
  '100k_250k': 'form.enq.field.budget.100k_250k',
  '250k_500k': 'form.enq.field.budget.250k_500k',
  over_500k: 'form.enq.field.budget.over_500k',
}

const ORDER_TYPE_LABEL_KEYS: Record<OrderType, TKey> = {
  ongoing_supply: 'form.enq.field.order_type.ongoing_supply',
  one_time: 'form.enq.field.order_type.one_time',
}

export const BUDGET_OPTIONS = BUDGET_RANGES.map((value) => ({
  value,
  labelKey: BUDGET_LABEL_KEYS[value],
}))

export const ORDER_TYPE_OPTIONS = ORDER_TYPES.map((value) => ({
  value,
  labelKey: ORDER_TYPE_LABEL_KEYS[value],
}))

const PATH_INTENT_LABEL_KEYS: Record<SubmittedPathIntent, { titleKey: TKey; descKey: TKey }> = {
  find_new: {
    titleKey: 'form.enq.field.path_intent.find_new.title',
    descKey: 'form.enq.field.path_intent.find_new.desc',
  },
  verify_existing: {
    titleKey: 'form.enq.field.path_intent.verify_existing.title',
    descKey: 'form.enq.field.path_intent.verify_existing.desc',
  },
}

const TIMELINE_LABEL_KEYS: Record<Timeline, TKey> = {
  '0-3_months': 'form.enq.field.timeline.0_3',
  '3-6_months': 'form.enq.field.timeline.3_6',
  '6plus_months': 'form.enq.field.timeline.6plus',
  exploring: 'form.enq.field.timeline.exploring',
}

export const PATH_INTENT_OPTIONS = PATH_INTENTS.map((value) => ({
  value,
  titleKey: PATH_INTENT_LABEL_KEYS[value].titleKey,
  descKey: PATH_INTENT_LABEL_KEYS[value].descKey,
}))

export const TIMELINE_OPTIONS = TIMELINES.map((value) => ({
  value,
  labelKey: TIMELINE_LABEL_KEYS[value],
}))

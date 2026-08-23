/**
 * Lead Capture Payload module — builds /api/enquiry request bodies from form values + page context.
 * industry = industry attribution slug, never a service name.
 */

import { normalizeAnalyticsPagePath } from './analytics'
import type { BudgetRange, OrderType, SubmittedPathIntent, Timeline } from './enquiry-qualification'

/** Every field is required in the UI — phone/company/budget/orderType included. */
export type LeadFormValues = {
  fullName: string
  email: string
  phone: string
  company: string
  budget: BudgetRange
  orderType: OrderType
  lookingFor: string
}

export type LeadFormContext = {
  /** Page path where the form was submitted, e.g. /industries/av-lighting */
  sourcePath: string
  /** Industry slug for attribution; omit or empty → not_provided */
  industry?: string
}

export type EnquiryPageFormValues = {
  fullName: string
  email: string
  phone: string
  company: string
  budget: BudgetRange
  orderType: OrderType
  lookingFor: string
  pathIntent: SubmittedPathIntent
  timeline: Timeline
}

export function normalizeIndustry(industry?: string): string {
  const value = industry?.trim()
  if (!value) return 'not_provided'
  // Guard against historical hard-coded service labels
  if (/^supplier verification$/i.test(value)) return 'not_provided'
  return value
}

export function buildLeadFormPayload(form: LeadFormValues, context: LeadFormContext) {
  return {
    fullName: form.fullName,
    email: form.email,
    phone: form.phone.trim(),
    company: form.company.trim(),
    budget: form.budget,
    orderType: form.orderType,
    lookingFor: form.lookingFor,
    industry: normalizeIndustry(context.industry),
    sourcePath: normalizeAnalyticsPagePath(context.sourcePath),
  }
}

/**
 * Payload for Enquiry Page Form (qualified intake).
 * Caller must already enforce every required field in the UI.
 */
export function buildEnquiryPagePayload(
  form: EnquiryPageFormValues,
  context: LeadFormContext,
) {
  return {
    fullName: form.fullName,
    email: form.email,
    phone: form.phone.trim(),
    company: form.company.trim(),
    budget: form.budget,
    orderType: form.orderType,
    lookingFor: form.lookingFor,
    pathIntent: form.pathIntent,
    timeline: form.timeline,
    industry: normalizeIndustry(context.industry),
    sourcePath: normalizeAnalyticsPagePath(context.sourcePath),
  }
}

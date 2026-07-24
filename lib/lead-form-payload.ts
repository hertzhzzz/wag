/**
 * Lead Capture Payload module — builds /api/enquiry request bodies from form values + page context.
 * industry = industry attribution slug, never a service name.
 */

import { normalizeAnalyticsPagePath } from './analytics'
import type { SubmittedPathIntent, Timeline } from './enquiry-qualification'

export type LeadFormValues = {
  fullName: string
  email: string
  lookingFor: string
  phone?: string
  company?: string
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
  company: string
  lookingFor: string
  pathIntent: SubmittedPathIntent
  timeline: Timeline
  phone?: string
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
    lookingFor: form.lookingFor,
    ...(form.phone ? { phone: form.phone } : {}),
    ...(form.company ? { company: form.company } : {}),
    industry: normalizeIndustry(context.industry),
    sourcePath: normalizeAnalyticsPagePath(context.sourcePath),
  }
}

/**
 * Payload for Enquiry Page Form (qualified intake).
 * Caller must already enforce required pathIntent/timeline/company in the UI.
 */
export function buildEnquiryPagePayload(
  form: EnquiryPageFormValues,
  context: LeadFormContext,
) {
  const phone = form.phone?.trim()
  return {
    fullName: form.fullName,
    email: form.email,
    company: form.company.trim(),
    lookingFor: form.lookingFor,
    pathIntent: form.pathIntent,
    timeline: form.timeline,
    ...(phone ? { phone } : {}),
    industry: normalizeIndustry(context.industry),
    sourcePath: normalizeAnalyticsPagePath(context.sourcePath),
  }
}

/**
 * Industry Intent Page qualified intake seam.
 * Reuses Enquiry Page qualification fields while keeping form_type = embedded.
 */

import type { PathIntent } from './analytics'
import type { EnquiryPageFormValues } from './lead-form-payload'
import { buildEnquiryPagePayload, normalizeIndustry } from './lead-form-payload'

export type IndustryQualifiedFormValues = EnquiryPageFormValues

export type IndustryQualifiedContext = {
  sourcePath: string
  industry: string
}

export type IndustryQualifiedConversion = {
  formType: 'embedded'
  pagePath: string
  industry: string
  pathIntent: PathIntent
  timeline: string
}

export type IndustryQualifiedIntake = {
  requestBody: ReturnType<typeof buildEnquiryPagePayload>
  conversion: IndustryQualifiedConversion
}

function buildIndustryQualifiedIntake(
  form: IndustryQualifiedFormValues,
  context: IndustryQualifiedContext,
): IndustryQualifiedIntake {
  const requestBody = buildEnquiryPagePayload(form, {
    sourcePath: context.sourcePath,
    industry: context.industry,
  })

  return {
    requestBody,
    conversion: {
      formType: 'embedded',
      pagePath: context.sourcePath || 'not_provided',
      industry: normalizeIndustry(context.industry),
      pathIntent: form.pathIntent,
      timeline: form.timeline,
    },
  }
}

buildIndustryQualifiedIntake.defaultCta = 'Discuss Your Sourcing Project' as const

export { buildIndustryQualifiedIntake }

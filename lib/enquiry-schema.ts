import { z } from 'zod'
import { PATH_INTENTS, TIMELINES } from './enquiry-qualification'

/**
 * Shared request schema for POST /api/enquiry.
 * Lead Form: company/pathIntent/timeline may be absent.
 * Enquiry Page Form: client requires them; if present server allowlists enums.
 */
export const enquirySchema = z.object({
  fullName: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().max(50).optional(),
  company: z.string().max(100).optional(),
  industry: z.string().max(100).optional(),
  lookingFor: z.string().min(1, 'Please describe what you need').max(5000),
  sourcePath: z.string().max(500).optional(),
  pathIntent: z.enum(PATH_INTENTS).optional(),
  timeline: z.enum(TIMELINES).optional(),
})

export type EnquiryRequestBody = z.infer<typeof enquirySchema>

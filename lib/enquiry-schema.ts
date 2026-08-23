import { z } from 'zod'
import { BUDGET_RANGES, ORDER_TYPES, PATH_INTENTS, TIMELINES } from './enquiry-qualification'

/**
 * Shared request schema for POST /api/enquiry.
 * Every form now requires phone/company/budget/orderType in the UI; the server keeps
 * them optional so a stale cached bundle still delivers the lead instead of 400-ing.
 * When present, enum fields are allowlisted.
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
  budget: z.enum(BUDGET_RANGES).optional(),
  orderType: z.enum(ORDER_TYPES).optional(),
})

export type EnquiryRequestBody = z.infer<typeof enquirySchema>

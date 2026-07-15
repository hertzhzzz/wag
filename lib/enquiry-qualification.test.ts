import {
  PATH_INTENTS,
  TIMELINES,
  isSubmittedPathIntent,
  isTimeline,
  pathIntentLabel,
  timelineLabel,
} from './enquiry-qualification'

describe('enquiry qualification enums', () => {
  it('exposes procurement path intents without not_provided', () => {
    expect([...PATH_INTENTS]).toEqual(['find_new', 'verify_existing'])
    expect(PATH_INTENTS).not.toContain('not_provided')
  })

  it('exposes timeline allowlist', () => {
    expect([...TIMELINES]).toEqual([
      '0-3_months',
      '3-6_months',
      '6plus_months',
      'exploring',
    ])
  })

  it('accepts only allowlisted path intents', () => {
    expect(isSubmittedPathIntent('find_new')).toBe(true)
    expect(isSubmittedPathIntent('verify_existing')).toBe(true)
    expect(isSubmittedPathIntent('not_provided')).toBe(false)
    expect(isSubmittedPathIntent('travel')).toBe(false)
    expect(isSubmittedPathIntent('')).toBe(false)
  })

  it('accepts only allowlisted timelines', () => {
    expect(isTimeline('0-3_months')).toBe(true)
    expect(isTimeline('exploring')).toBe(true)
    expect(isTimeline('soon')).toBe(false)
    expect(isTimeline('')).toBe(false)
  })

  it('maps path intents to UI/email labels', () => {
    expect(pathIntentLabel('find_new')).toBe('Find and vet new suppliers')
    expect(pathIntentLabel('verify_existing')).toBe('Visit or verify an existing supplier')
  })

  it('maps timelines to UI/email labels', () => {
    expect(timelineLabel('0-3_months')).toBe('Within 3 months')
    expect(timelineLabel('3-6_months')).toBe('3–6 months')
    expect(timelineLabel('6plus_months')).toBe('More than 6 months')
    expect(timelineLabel('exploring')).toBe('Still exploring')
  })
})

import {
  PATH_INTENTS,
  TIMELINES,
  BUDGET_RANGES,
  ORDER_TYPES,
  isSubmittedPathIntent,
  isTimeline,
  isBudgetRange,
  isOrderType,
  pathIntentLabel,
  timelineLabel,
  budgetRangeLabel,
  orderTypeLabel,
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

  it('exposes budget range allowlist', () => {
    expect([...BUDGET_RANGES]).toEqual([
      'under_10k',
      '10k_50k',
      '50k_100k',
      '100k_250k',
      '250k_500k',
      'over_500k',
    ])
  })

  it('exposes order type allowlist', () => {
    expect([...ORDER_TYPES]).toEqual(['ongoing_supply', 'one_time'])
  })

  it('accepts only allowlisted budget ranges', () => {
    expect(isBudgetRange('under_10k')).toBe(true)
    expect(isBudgetRange('over_500k')).toBe(true)
    expect(isBudgetRange('1m')).toBe(false)
    expect(isBudgetRange('')).toBe(false)
  })

  it('accepts only allowlisted order types', () => {
    expect(isOrderType('ongoing_supply')).toBe(true)
    expect(isOrderType('one_time')).toBe(true)
    expect(isOrderType('rental')).toBe(false)
    expect(isOrderType('')).toBe(false)
  })

  it('maps budget ranges to UI/email labels', () => {
    expect(budgetRangeLabel('under_10k')).toBe('Under A$10,000')
    expect(budgetRangeLabel('10k_50k')).toBe('A$10,000 – A$50,000')
    expect(budgetRangeLabel('50k_100k')).toBe('A$50,000 – A$100,000')
    expect(budgetRangeLabel('100k_250k')).toBe('A$100,000 – A$250,000')
    expect(budgetRangeLabel('250k_500k')).toBe('A$250,000 – A$500,000')
    expect(budgetRangeLabel('over_500k')).toBe('Over A$500,000')
  })

  it('maps order types to UI/email labels', () => {
    expect(orderTypeLabel('ongoing_supply')).toBe('Ongoing supply')
    expect(orderTypeLabel('one_time')).toBe('One-time purchase')
  })
})

import { describe, expect, it } from 'vitest'

import { buildAlgoliaQuery } from '@/utils/algoliaQuery'

describe('buildAlgoliaQuery', () => {
  it('uses a sensible default query for empty answers', () => {
    expect(buildAlgoliaQuery({})).toEqual({ query: 'tech' })
  })

  it('maps each category to a keyword', () => {
    expect(buildAlgoliaQuery({ category: 'laptop' }).query).toBe('laptop')
    expect(buildAlgoliaQuery({ category: 'headphones' }).query).toBe(
      'headphones',
    )
  })

  it('appends feature keywords from the smartphone branch', () => {
    const { query } = buildAlgoliaQuery({
      category: 'smartphone',
      phone_features: ['camera', 'gaming'],
    })
    expect(query).toBe('smartphone camera gaming')
  })

  it('appends feature keywords from the laptop branch', () => {
    const { query } = buildAlgoliaQuery({
      category: 'laptop',
      laptop_features: ['gaming', 'portability'],
    })
    expect(query).toBe('laptop gaming portable')
  })

  it('appends feature keywords from the headphones branch', () => {
    const { query } = buildAlgoliaQuery({
      category: 'headphones',
      headphone_features: ['noise_cancelling', 'battery'],
    })
    expect(query).toBe('headphones noise cancelling battery')
  })

  it('adds a brand filter from the premium branch', () => {
    const { filters } = buildAlgoliaQuery({
      category: 'smartphone',
      phone_brand_premium: 'Apple',
    })
    expect(filters).toBe('brand:Apple')
  })

  it('adds a brand filter from the midrange branch', () => {
    const { filters } = buildAlgoliaQuery({
      category: 'laptop',
      laptop_brand_midrange: 'ASUS',
    })
    expect(filters).toBe('brand:ASUS')
  })

  it('ignores a "no_brand" selection', () => {
    const { filters } = buildAlgoliaQuery({
      category: 'headphones',
      headphones_brand_premium: 'no_brand',
      headphones_budget: 200,
    })
    expect(filters).toBe('price < 200')
  })

  it('adds a numeric budget filter from any branch', () => {
    const { filters } = buildAlgoliaQuery({
      category: 'other',
      other_budget: 1499,
    })
    expect(filters).toBe('price < 1499')
  })

  it('combines brand and budget filters with AND', () => {
    const { query, filters } = buildAlgoliaQuery({
      category: 'smartphone',
      phone_brand_premium: 'Apple',
      phone_budget: 1200,
      phone_features: ['gaming'],
    })
    expect(query).toBe('smartphone gaming')
    expect(filters).toBe('brand:Apple AND price < 1200')
  })
})

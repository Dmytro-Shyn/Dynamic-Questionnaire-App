import { describe, expect, it } from 'vitest'

import { buildAlgoliaQuery } from '@/utils/algoliaQuery'

describe('buildAlgoliaQuery', () => {
  it('uses a sensible default query for empty answers', () => {
    expect(buildAlgoliaQuery({})).toEqual({ query: 'tech' })
  })

  it('maps the chosen category to a keyword', () => {
    expect(buildAlgoliaQuery({ category: 'laptop' }).query).toBe('laptop')
    expect(buildAlgoliaQuery({ category: 'headphones' }).query).toBe(
      'headphones',
    )
  })

  it('appends selected feature keywords', () => {
    const { query } = buildAlgoliaQuery({
      category: 'smartphone',
      features: ['camera', 'gaming'],
    })
    expect(query).toBe('smartphone camera gaming')
  })

  it('adds a brand filter from the premium branch', () => {
    const { filters } = buildAlgoliaQuery({
      category: 'smartphone',
      brand_premium: 'apple',
    })
    expect(filters).toBe('brand:apple')
  })

  it('adds a brand filter from the midrange branch', () => {
    const { filters } = buildAlgoliaQuery({
      category: 'laptop',
      brand_midrange: 'lenovo',
    })
    expect(filters).toBe('brand:lenovo')
  })

  it('ignores a "no preference" brand', () => {
    const { filters } = buildAlgoliaQuery({
      category: 'smartphone',
      brand_premium: 'no_preference',
      budget: 2000,
    })
    expect(filters).toBe('price < 2000')
  })

  it('adds a numeric budget filter', () => {
    const { filters } = buildAlgoliaQuery({
      category: 'headphones',
      budget: 1499,
    })
    expect(filters).toBe('price < 1499')
  })

  it('combines brand and budget filters with AND', () => {
    const { query, filters } = buildAlgoliaQuery({
      category: 'laptop',
      brand_midrange: 'asus',
      budget: 1200,
      features: ['gaming'],
    })
    expect(query).toBe('laptop gaming')
    expect(filters).toBe('brand:asus AND price < 1200')
  })
})

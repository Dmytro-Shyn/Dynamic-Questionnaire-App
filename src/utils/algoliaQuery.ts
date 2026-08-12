import type { Answers } from '@/types/questionnaire'

export interface AlgoliaQueryParams {
  query: string
  filters?: string
}

const CATEGORY_KEYWORDS: Record<string, string> = {
  smartphone: 'smartphone',
  laptop: 'laptop',
  headphones: 'headphones',
  other: 'tech',
}

const FEATURE_KEYWORDS: Record<string, string> = {
  camera: 'camera',
  battery: 'battery',
  screen: 'display',
  gaming: 'gaming',
  connectivity: '5g',
  portability: 'portable',
  display: 'display',
  build: 'build quality',
  noise_cancelling: 'noise cancelling',
  comfort: 'comfort',
  wireless: 'wireless',
  mic: 'microphone',
}

const FEATURE_KEYS = ['phone_features', 'laptop_features', 'headphone_features']

const BUDGET_KEYS = [
  'other_budget',
  'phone_budget',
  'laptop_budget',
  'headphones_budget',
]

const BRAND_KEYS = [
  'phone_brand_premium',
  'phone_brand_midrange',
  'laptop_brand_premium',
  'laptop_brand_midrange',
  'headphones_brand_premium',
  'headphones_brand_midrange',
]

function collectFeatures(answers: Answers): string[] {
  const features: string[] = []
  for (const key of FEATURE_KEYS) {
    const value = answers[key]
    if (Array.isArray(value)) {
      for (const feature of value) {
        const keyword = FEATURE_KEYWORDS[feature]
        if (keyword && !features.includes(keyword)) {
          features.push(keyword)
        }
      }
    }
  }
  return features
}

function resolveBrand(answers: Answers): string | undefined {
  for (const key of BRAND_KEYS) {
    const value = answers[key]
    if (typeof value === 'string' && value !== 'no_brand') {
      return value
    }
  }
  return undefined
}

function resolveBudget(answers: Answers): number | undefined {
  for (const key of BUDGET_KEYS) {
    const value = answers[key]
    const numeric = typeof value === 'number' ? value : Number(value)
    if (Number.isFinite(numeric)) {
      return numeric
    }
  }
  return undefined
}

/**
 * Translates the final questionnaire answers into an Algolia search query and
 * filter expression.
 *
 * - query:    category keyword + selected feature keywords (free text)
 * - filters:  `brand:<brand>` joined with a numeric `price < <budget>` filter
 */
export function buildAlgoliaQuery(answers: Answers): AlgoliaQueryParams {
  const keywords: string[] = []

  const category = answers.category
  if (typeof category === 'string') {
    keywords.push(CATEGORY_KEYWORDS[category] ?? category)
  }

  for (const feature of collectFeatures(answers)) {
    keywords.push(feature)
  }

  const filters: string[] = []

  const brand = resolveBrand(answers)
  if (brand !== undefined) {
    filters.push(`brand:${brand}`)
  }

  const budget = resolveBudget(answers)
  if (budget !== undefined) {
    filters.push(`price < ${budget}`)
  }

  return {
    query: keywords.join(' ').trim() || 'tech',
    filters: filters.length > 0 ? filters.join(' AND ') : undefined,
  }
}

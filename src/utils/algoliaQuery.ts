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
  battery: 'battery',
  camera: 'camera',
  gaming: 'gaming',
  portability: 'portable',
  audio: 'audio',
}

/**
 * Translates the final questionnaire answers into an Algolia search query and
 * filter expression. Brand and budget produce facet / numeric filters, the
 * category and selected features contribute free-text keywords.
 */
export function buildAlgoliaQuery(answers: Answers): AlgoliaQueryParams {
  const keywords: string[] = []

  const category = answers.category
  if (typeof category === 'string') {
    keywords.push(CATEGORY_KEYWORDS[category] ?? category)
  }

  const features = Array.isArray(answers.features) ? answers.features : []
  for (const feature of features) {
    const keyword = FEATURE_KEYWORDS[feature]
    if (keyword) {
      keywords.push(keyword)
    }
  }

  const filters: string[] = []

  const brand =
    typeof answers.brand_premium === 'string'
      ? answers.brand_premium
      : typeof answers.brand_midrange === 'string'
        ? answers.brand_midrange
        : undefined
  if (brand !== undefined && brand !== 'no_preference') {
    filters.push(`brand:${brand}`)
  }

  const budget =
    typeof answers.budget === 'number'
      ? answers.budget
      : typeof answers.budget === 'string'
        ? Number(answers.budget)
        : undefined
  if (budget !== undefined && Number.isFinite(budget)) {
    filters.push(`price < ${budget}`)
  }

  return {
    query: keywords.join(' ').trim() || 'tech',
    filters: filters.length > 0 ? filters.join(' AND ') : undefined,
  }
}

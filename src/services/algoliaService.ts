import { algoliasearch } from 'algoliasearch'

const appId = import.meta.env.VITE_ALGOLIA_APP_ID ?? 'latency'
const apiKey =
  import.meta.env.VITE_ALGOLIA_API_KEY ?? '6be0576ff61c053d5f9a3225e2a90f76'
const indexName = import.meta.env.VITE_ALGOLIA_INDEX_NAME ?? 'instant_search'

const searchClient = algoliasearch(appId, apiKey)

/**
 * A single Algolia result hit. The demo index exposes the fields below;
 * the index signature keeps the type open for other indices.
 */
export interface AlgoliaHit {
  objectID: string
  name?: string
  title?: string
  brand?: string
  description?: string
  price?: number
  image?: string
  url?: string
  [key: string]: unknown
}

export async function fetchAlgoliaResults(
  searchQuery: string,
  filters?: string,
  hitsPerPage = 12,
): Promise<AlgoliaHit[]> {
  const { hits } = await searchClient.searchSingleIndex<AlgoliaHit>({
    indexName,
    searchParams: {
      query: searchQuery,
      filters,
      hitsPerPage,
    },
  })
  return hits
}

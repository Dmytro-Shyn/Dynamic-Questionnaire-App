import { Loader2, Package, RefreshCcw, SearchX } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { AlgoliaHit } from '@/services/algoliaService'
import { fetchAlgoliaResults } from '@/services/algoliaService'
import type { Answers } from '@/types/questionnaire'
import { buildAlgoliaQuery } from '@/utils/algoliaQuery'

interface ResultsViewProps {
  answers: Answers
  onRestart: () => void
}

type Status = 'loading' | 'success' | 'error'

function ResultCard({ hit }: { hit: AlgoliaHit }) {
  const name = hit.name ?? hit.title ?? 'Untitled'
  const price =
    typeof hit.price === 'number' && Number.isFinite(hit.price)
      ? hit.price
      : undefined

  return (
    <Card className="overflow-hidden py-0">
      {hit.image ? (
        <img src={hit.image} alt={name} className="h-40 w-full object-cover" />
      ) : (
        <div className="flex h-40 items-center justify-center bg-muted">
          <Package className="size-10 text-muted-foreground" />
        </div>
      )}
      <CardContent className="pt-4">
        {hit.brand && (
          <div className="text-sm text-muted-foreground">{hit.brand}</div>
        )}
        <h3 className="font-semibold leading-tight">{name}</h3>
        {price !== undefined && (
          <div className="mt-2 text-lg font-bold">${price.toFixed(2)}</div>
        )}
        {typeof hit.description === 'string' && (
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
            {hit.description}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export function ResultsView({ answers, onRestart }: ResultsViewProps) {
  const { query, filters } = useMemo(
    () => buildAlgoliaQuery(answers),
    [answers],
  )
  const [hits, setHits] = useState<AlgoliaHit[]>([])
  const [status, setStatus] = useState<Status>('loading')
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)

  const handleRetry = () => {
    setStatus('loading')
    setError(null)
    setAttempt((value) => value + 1)
  }

  useEffect(() => {
    let cancelled = false

    fetchAlgoliaResults(query, filters)
      .then((results) => {
        if (cancelled) {
          return
        }
        setHits(results)
        setStatus('success')
      })
      .catch((reason: unknown) => {
        if (cancelled) {
          return
        }
        setError(
          reason instanceof Error ? reason.message : 'Something went wrong.',
        )
        setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [query, filters, attempt])

  if (status === 'loading') {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center gap-4 text-muted-foreground">
        <Loader2 className="size-8 animate-spin" />
        <p className="text-sm">Searching for the best matches...</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Something went wrong</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {error}
        </CardContent>
        <CardFooter>
          <Button onClick={handleRetry}>Try again</Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <div className="w-full max-w-4xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Recommended for you</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {hits.length} {hits.length === 1 ? 'match' : 'matches'} for{' '}
            <span className="font-medium text-foreground">
              &ldquo;{query}&rdquo;
            </span>
          </p>
        </div>
        <Button variant="outline" onClick={onRestart}>
          <RefreshCcw />
          Пройти опитування знову
        </Button>
      </div>

      {hits.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
          <SearchX className="size-10" />
          <p className="text-sm">No results found. Try different answers.</p>
          <Button variant="outline" onClick={onRestart}>
            Пройти опитування знову
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {hits.map((hit) => (
            <ResultCard key={hit.objectID} hit={hit} />
          ))}
        </div>
      )}
    </div>
  )
}

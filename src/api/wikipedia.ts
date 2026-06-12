import { log_error } from '@/lib/logger'

export interface WikiSummary {
  title: string
  extract: string
  thumbnail?: { source: string }
  content_urls?: { desktop: { page: string } }
}

const CACHE = new Map<string, { data: WikiSummary | null; ts: number }>()
const CACHE_TTL_MS = 30 * 60 * 1000

export async function fetch_wikipedia_summary(species_name: string): Promise<WikiSummary | null> {
  const key = species_name.trim()
  if (!key) return null

  const cached = CACHE.get(key)
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return cached.data
  }

  try {
    const encoded = encodeURIComponent(key)
    const url = `https://ja.wikipedia.org/api/rest_v1/page/summary/${encoded}`
    const res = await fetch(url)

    if (res.status === 404) {
      CACHE.set(key, { data: null, ts: Date.now() })
      return null
    }
    if (!res.ok) throw new Error(`Wikipedia API error: ${res.status}`)

    const data = (await res.json()) as WikiSummary
    CACHE.set(key, { data, ts: Date.now() })
    return data
  } catch (error) {
    log_error('fetch_wikipedia_summary', { species_name: key }, error)
    return null
  }
}
